---
categories: [sec]
title: 用量子安全加密保护 MCP 部署：CRYSTALS-Kyber 与 Dilithium 集成指南
description: Gopher Security 提出结合后量子密码学（PQC）的 MCP 部署安全方案，采用 X25519 + ML-KEM-768 混合密钥交换抵御 Store Now Decrypt Later 攻击，并探讨 Dilithium 在 Agent-工具通信签名中的应用。ML-KEM 和 ML-DSA 的集成正在从可选变成必需。
tags: [MCP, 后量子密码学, PQC, CRYSTALS-Kyber, Dilithium, TLS, Agent 安全, 量子安全]
---

## 一句话结论

MCP（Model Context Protocol）作为 AI Agent 通信的事实标准，正在成为"先存储、后解密"（SNDL）攻击的主要目标——攻击者现在窃取加密流量，等待量子计算机破解。Gopher Security 提出的方案采用**混合密码学**：在 TLS 1.3 握手阶段同时执行 X25519（经典）和 ML-KEM-768（后量子）密钥交换，确保 MCP 通信的长期安全性。这一需求正在从可选变成必需。

> **来源说明**：本文基于 Gopher Security 发表于 Security Boulevard 的文章。原载于 `gopher.security`，标题与用户提供一致，日期为 2026-07-05。原文通过 Google News RSS + r.jina.ai 提取。

## 为什么 MCP 是量子攻击的首要目标

MCP 是 Agent 与工具之间的**神经中枢**——承载着 Agent 对数据库的查询、API 密钥的读取、内部配置文件的访问。每一次 MCP 通信都携带着高价值数据。

> "MCP 是 Agent 工作流的连接组织。它决定了 AI Agent 如何与本地文件、数据库和第三方 API 通信。这使其成为国家支持的行为者和网络犯罪分子的巨大目标。"——Gopher Security

**SNDL（Store Now, Decrypt Later）威胁**：
1. 攻击者现在拦截 MCP 通信（通常使用 X25519 等经典加密）
2. 存储全部加密流量
3. 等待足够强大的量子计算机上线
4. 用 Shor 算法一键解密密文
5. 历史数据——专有代码、用户数据、工具配置——全部暴露

## 混合密码学：2026 年的标准方案

行业已经放弃了"拆除重建"的幻想，转而采用**混合密码学**：

| 组件 | 算法 | 用途 |
|------|------|------|
| 经典层 | **X25519** | 椭圆曲线密钥交换，对抗经典计算机 |
| 后量子层 | **ML-KEM-768**（原 CRYSTALS-Kyber） | 密钥封装机制，对抗量子计算机 |
| 签名层 | **ML-DSA**（原 CRYSTALS-Dilithium） | Agent-工具通信的数字签名 |

**为什么同时运行两层？** 因为还没有人能 100% 确定这些新 PQC 算法的长期安全性。双重加密迫使攻击者必须同时破解两层——如果 PQC 算法有隐藏缺陷，经典层还能守住。

## MCP 混合握手流程

```
MCP Client                  MCP Server
    |                            |
    |-- ClientHello ------------>|  支持的群组：X25519 + ML-KEM-768
    |<-- ServerHello ------------|  选定群组：X25519 + ML-KEM-768
    |<-- 加密扩展 + 证书 + 签名--|  服务端生成经典临时密钥 + ML-KEM 公钥
    |-- Finished --------------->|
    |                            |  对称会话密钥由组合密钥导出
    |-- 加密 MCP 请求 ---------->|
    |<-- 加密 MCP 响应 ----------|
```

## 分步实施指南

### 第 1 步：审计攻击面

在修改代码之前，先绘制 MCP 流量图：
- 哪些 MCP 服务器处理高敏感性数据？（生产数据库凭据、PII）
- 哪些连接跨越不可信网络段？
- 使用网络遥测区分本地低风险连接和远程高风险连接

### 第 2 步：升级 TLS 栈

**不要自己写加密代码。** 使用经过同行评审的库：

- [Open Quantum Safe（liboqs）](https://openquantumsafe.org/)——提供 OpenSSL 和 BoringSSL 的 PQC 封装
- 集成后可启用混合密钥交换，无需拆毁整个 MCP 应用层

### 第 3 步：管理证书

PQC 密钥比传统 ECC 密钥**大得多**：
- 可能导致数据包分片
- 可能造成老旧网络设备超时
- PQC 就绪的根 CA 仍在成熟中

### 第 4 步：评估延迟影响

| 方案 | 握手延迟（模拟环境） |
|------|---------------------|
| X25519（纯经典） | 15ms |
| **混合 X25519 + ML-KEM-768** | **22ms** |
| ML-KEM-768（纯 PQC） | 18ms |
| RSA-3072（遗留） | 45ms |

使用 AVX-512 指令或专用加密加速硬件时，混合握手的开销在大多数 MCP 工作负载中可忽略不计。

### 第 5 步：对齐合规要求

- **云安全联盟（CSA）AI 安全研究**明确要求在高级别 AI 部署中具备"量子就绪"能力
- 内部审计应检查传输层是否默认使用混合密钥交换
- 如果未实现，应记录过渡计划

## 超越 TLS：应用层签名

传输安全只是第一步。攻击者还可能将恶意工具定义注入 MCP 流中。此时加密无法保护你——你需要 **ML-DSA（Dilithium）** 对 Agent-工具通信进行数字签名，提供量子安全的完整性校验，阻挡"中间人提示词注入"攻击。

## 关键结论

1. **MCP 是 SNDL 攻击的高价值目标**——作为 Agent 的工具通信中枢，MCP 承载着最具敏感性的数据
2. **混合密码学是 2026 年标准**——X25519 + ML-KEM-768 双重保障，单一方被攻破时仍有保护
3. **性能影响可控**——22ms vs 15ms 的增量在现代硬件上可忽略
4. **不拆毁现有基础设施**——混合方案是增量升级，不是推倒重来
5. **合规在追赶**——CSA 已将"量子就绪"列为高风险 AI 部署的要求

## 参考

- Gopher Security（via Security Boulevard）：[How to Secure Model Context Protocol Deployments with Quantum-Resistant Cryptography](https://www.gopher.security/blog/secure-mcp-deployments-quantum-resistant-cryptography)（2026-07-05）
- NIST：[Post-Quantum Cryptography Standards](https://csrc.nist.gov/projects/post-quantum-cryptography)（FIPS 203/204/205）
- Open Quantum Safe：[liboqs](https://openquantumsafe.org/)
- Cloud Security Alliance：[AI Security Research](https://labs.cloudsecurityalliance.org/)
- Security Boulevard：[The 2026 Guide to Post-Quantum AI Infrastructure Security](https://securityboulevard.com)（2026-03-11）
