---
categories: [sec]
title: 让不受信任的 AI Agent 使用凭据但永远无法读取——Declaw 的凭据保险库设计方案
description: 安全初创公司 Declaw 提出一种新型 Agent 凭据管理方案：凭据原文保存在服务端 OpenBao 保险库中，Agent 运行时仅持有占位符，真实凭据由 Firecracker 微 VM 外部的出口代理在请求离开沙箱后注入。方案支持 SigV4、OIDC、HMAC 签名代理以及 Postgres/MySQL/MongoDB/Redis 无密码数据库连接，完全阻断提示注入攻击下的凭据泄露路径。
tags: [Declaw, AI Agent 安全, 凭据管理, OWASP ASI-06, 安全架构, Firecracker, 零信任, 凭证隔离]
---

## 一句话结论

安全初创公司 **Declaw**（[declaw.ai](https://declaw.ai/)）提出了一种反直觉但极其有效的 Agent 凭据管理方案：凭据原文**永不进入** Agent 运行环境。Agent 持有的环境变量值仅为占位符 `declaw:vault-managed`，真实凭据由**虚拟机外部**的出口代理在请求离开沙箱后注入到目标请求中。这直接解决了 OWASP ASI-06（不安全的凭据管理）的核心问题。

## 解决的核心矛盾

AI Agent 的凭据管理面临一个根本性矛盾：

> Agent 需要凭据才能调用外部 API 和数据库，但 Agent 运行环境恰恰是不能被信任的——提示注入攻击、依赖供应链攻击都可能让恶意代码 dump 环境变量、读取 `/proc`，凭据随之泄露。

传统方案的两个极端：
- **明文凭据入沙箱**：高风险，一旦被注入即泄露
- **每次手工授权**：安全但不可扩展

Declaw 的方案是**第三条路径**：凭据**从未进入** Agent 运行环境，Agent 持有的是占位符，真实凭据在请求**离开沙箱之后**才由出口代理注入。

| 方案 | 凭据位置 | 泄露风险 | 可扩展性 |
|------|---------|---------|---------|
| 环境变量明文 | 沙箱内部 | ❌ 极高 | ✅ 完全自动化 |
| 手工授权 | 外部操作 | ✅ 无泄露 | ❌ 不可扩展 |
| **Declaw** | **沙箱外部代理** | ✅ **凭据不可达** | ✅ **全自动** |

## 架构设计

### 三个核心组件

1. **OpenBao 保险库**（服务端）：凭据存入后只写不读，任何人（包括用户自己）都无法通过 API 再次读取
2. **Firecracker 微 VM**（Agent 运行时）：环境变量仅包含占位符字符串 `declaw:vault-managed`
3. **出口代理**（VM 外部）：运行在宿主机的网络命名空间中，是 VM 流向网络的**唯一通道**

### 凭据注入流程

```
Agent（微 VM 内部）
  │ env var = "declaw:vault-managed"
  │ 发起 HTTPS 请求 → api.example.com
  ▼
┌─────────────────────────────┐
│ 出口代理（VM 外部，宿主侧）  │
│                              │
│ ① 检查目标域名是否匹配作用域 │
│ ② 从 OpenBao 获取真实凭据   │
│ ③ 替换占位头 → 注入凭据     │
│ ④ 转发请求到上游             │
│                              │
│ ⑤ 凭据在内存中存活一个请求   │
│    后立即释放                │
└─────────────────────────────┘
  │
  ▼
上游服务 → 认证成功
```

关键设计：代理运行在**虚拟化边界之外**，Agent 进程无法跨 VM 读取代理内存。凭据在代理内存中仅为一个请求的生存期，从不写入磁盘。

### TLS 信任链

代理需要终止 TLS 才能注入 HTTPS 请求——那 Agent 的客户端为什么会信任代理颁发的证书？

- 每个沙箱在启动时生成**临时 CA**（ECDSA P-256），私钥仅在代理内存中，从不落盘
- 代理为每个上游 host 签发**短期叶证书**
- CA 公钥在 VM 启动时写入系统信任存储和主流运行时环境变量：

```
SSL_CERT_FILE       → /etc/ssl/certs/ca-certificates.crt
REQUESTS_CA_BUNDLE  → /etc/ssl/certs/ca-certificates.crt
CURL_CA_BUNDLE      → /etc/ssl/certs/ca-certificates.crt
NODE_EXTRA_CA_CERTS → /usr/local/share/ca-certificates/declaw-sandbox.crt
```

因此 OpenSSL、Python requests、curl、Node.js 等开箱即用。CA 是 per-sandbox 的，一个沙箱的 CA 对另一个沙箱完全无效。

**限制**：对上游证书做了 pinning（固定）的客户端会拒绝代理的中转证书——这种情况在服务端 API 调用中少见，但确实存在。

## 凭据作用域（Scoping）

凭据的作用域域名匹配机制采用了严谨的安全设计：

- 支持三种模式：精确 host、`*.` 通配符、`~` 前缀的正则
- 使用 **RE2** 引擎（线性时间，无灾难性回溯）
- **强制锚定**：模式自动包裹为 `^(?:…)$`，因此 `api.example.com` 的作用域**无法被** `api.example.com.evil.com` 绕过

作用域在注入时累积：如果一个请求匹配多个作用域（例如网关自己的 key + 上游提供商的 key），所有凭据都会注入。同 header 写入时，后写入者生效。

## 凭据存储与集成

### 支持多种第三方存储

Declaw 不强制用户将凭据存在自己的 OpenBao 中。用户可以通过**连接器描述符**指向已有的凭据仓库：

```json
{"provider": "aws_sm", "secret_id": "prod/openai", "region": "us-east-1"}
```

连接器在缓存未命中时从用户仓库中读取实时值，用于一个请求后**立即释放，永不持久化**。

目前已集成的存储：AWS Secrets Manager、SSM Parameter Store、GCP Secret Manager、Azure Key Vault、HashiCorp Vault / OpenBao、Infisical、Doppler、Kubernetes Secrets、1Password Connect、CyberArk Conjur、Akeyless。

此外内置了 **~39 个提供商预设**：选择提供商、粘贴密钥，目标域名、注入格式、Provider 特性自动填充。

## 高级凭据代理

### 完全代理签名（不传输凭据）

| 类型 | 工作原理 |
|------|---------|
| **AWS SigV4** | Agent 使用临时凭证签名，代理剥离后重新签名。支持 AssumeRole + 自动刷新，或 AssumeRoleWithWebIdentity 实现**零长驻密钥** |
| **OIDC** | 代理服务端铸币短生命周期 Bearer Token。支持 client-credentials、token-exchange、private_key_jwt、jwt-bearer。客户端密钥和铸币 Token 均在代理侧 |
| **HMAC** | 可配置的请求签名：摘要算法（sha1/256/512）、编码（hex/base64）、签名模板（`{body}{method}{path}{timestamp}`） |

### 无密码数据库

**这是最惊艳的部分**：Agent 连接 Postgres、MySQL、MongoDB、Redis、SMTP 时**完全不需要密码**。Agent 发起正常连接，代理代为完成上游认证握手，然后退让传递数据流。

各协议的实现：

- **Postgres**：读取客户端启动消息，拒绝 SSLRequest（近端保持明文），上游用 cleartext/MD5/SCRAM-SHA-256 认证，合成 AuthenticationOk 返回客户端
- **MySQL**：清除服务端问候中的 CLIENT_SSL 位，丢弃 Agent 的认证响应，发送自己的认证（mysql_native_password / caching_sha2_password）
- **MongoDB**：SCRAM-SHA-256 over OP_MSG，Go 标准库手写 BSON
- **Redis**：RESP AUTH（含 ACL username）
- **SMTP**：EHLO → 上游 STARTTLS → AUTH PLAIN → 返回客户端能力列表时移除 AUTH 和 STARTTLS

所有 SCRAM 引擎基于 `crypto/hmac` + `crypto/sha256` 实现，无外部依赖。

## 失败模式

| 场景 | 行为 |
|------|------|
| HTTP 注入失败 | **fail open-to-401**：跳过该作用域，无凭据转发请求，上游返回 401 |
| 数据库认证失败 | **fail hard-closed**：直接断连，绝不交给 Agent 半认证的连接 |
| 凭据轮换 | **TTL 驱动**（默认 60s），旋转后下一请求即生效。设置 TTL=0 时为**即时开关** |

## 审计能力

每次注入生成一条**掩码审计事件**——包含环境变量名、注入类型、目标 header、目标域名和计数——但**永远不记录凭据值**。审计日志中有"什么凭据在何时注入到哪个目标"，但凭据本身不在其中。

## 验证：Declaw Arena

Declaw 提供了可验证的攻击场景（[Declaw Arena](https://declaw.ai/arena)）：你获得一个沙箱的 **root shell**，沙箱中有一个 vault 支持的密钥，你被要求窃取它。你可以看到环境变量中只有 `declaw:vault-managed`。

## 技术实现深度

- **语言**：Go（代理层），标准库实现全部协议——无 `golang.org/x/crypto` 依赖
- **沙箱**：Firecracker 微 VM（AWS 开源的 KVM 微虚拟机）
- **保险库**：OpenBao（HashiCorp Vault 的 CNCF 分支）
- **DNS 模式匹配**：RE2 引擎（线性时间复杂度）

## 我的看法

Declaw 的方案是 Agent 安全中**凭据隔离**方向的一个优秀设计：

✅ **安全模型干净**：凭据永不进入攻击面。不像传统方案在"更好地隐藏"上做文章，Declaw 选择"根本不放进去"。这是安全架构中的经典原则——不在暴露面上存储秘密。

✅ **零信任边界真实**：出口代理运行在虚拟化边界之外，Agent 进程（即使获得 root）也无法读取代理内存。这不是软件级隔离，而是硬件级（KVM）隔离。

✅ **数据库无密码**：在代理层实现完整数据库认证握手的技术深度值得肯定——Postgres SCRAM-SHA-256、MySQL caching_sha2_password、MongoDB SCRAM over OP_MSG 都是手写实现。

✅ **可验证性**：Declaw Arena 提供了可亲身体验的攻防场景，而非仅靠文档承诺。

⚠️ **适用边界**：该方案的核心前提是 Agent 运行在 Declaw 的 Firecracker 微 VM 中——对于不使用 Declaw 沙箱的用户无法直接使用。它的设计是一种**平台级解决方案**而非函数库。

⚠️ **证书固定问题**：对上游服务做了证书 pinning 的客户端无法通过，虽然服务端 API 调用中不常见，但在企业内部需要评估影响。

**与 OWASP ASI-06 的关系**：OWASP Agentic Security Initiative 将"不安全的凭据管理"列为 Agent 应用的核心风险之一。Declaw 的代理级凭据注入方案为这个风险提供了一个架构级的缓解策略——不是通过更好的加密（加密后 Agent 还是要解密），而是通过根本不让 Agent 触碰到凭据。

---

### 参考资料

- [原文：Letting Untrusted AI Agents Use Credentials They Can Never Read](https://declaw.ai/blog/credentials-agents-can-never-read)
- [Declaw 官网](https://declaw.ai/)
- [Declaw Arena（可验证沙箱攻防）](https://declaw.ai/arena)
- [Firecracker microVM](https://firecracker-microvm.github.io/)
- [OpenBao（CNCF）](https://openbao.org/)
- [OWASP Agentic Security Initiative - ASI-06](https://genai.owasp.org/)
