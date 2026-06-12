---
layout: post
title: "Agent Vault Proxy：让 AI Agent 永远看不见真正的 API Key"
categories: [sec]
description: "Agent Vault Proxy（AVP）是一个在 Hacker News 上引起热议的开源项目，由 inflightsec 发布。核心机制：Agent 只持有占位符（placeholder），真正的 API Key 由基于 mitmproxy 的 HTTPS 代理在请求出站前最后一刻从 Bitwarden 实时注入。Agent 进程的内存、日志、env 里从来不出现真实凭证。支持按 HTTP 方法/路径粒度控制权限，已部署即用。"
tags:
  - AVP
  - Agent Vault Proxy
  - 凭证安全
  - 开源项目
  - inflightsec
  - mitmproxy
  - 进程隔离
  - 提示注入防御
---

6月12日，Hacker News 上出现了一个讨论热度很高的开源项目——**Agent Vault Proxy（AVP）**，由 [inflightsec](https://github.com/inflightsec) 发布。

项目地址：[github.com/inflightsec/agent-vault-proxy](https://github.com/inflightsec/agent-vault-proxy)

核心理念一句话：
> **"Your agent gets a fake placeholder string and uses it as if it were a real API key."**

Agent 的 env 里只放一个**占位符**（比如 `sk-ant...EFGH`），真正的 API Key 在 Bitwarden Secrets Manager 里。AVP 作为一个本地 HTTPS 代理，在请求出站前的最后一刻完成替换。

---

## 问题：为什么 Agent 不该持有真实凭证

当前 AI Agent 的身份管理模型普遍存在一个致命缺陷——**Agent 进程持有真实凭证字节**。

| 风险场景 | 发生方式 |
|---------|---------|
| **提示注入泄露** | 输入源（网页/邮件/PR评论）携带恶意指令，引导 Agent 输出 env 中的 API Key |
| **供应链攻击** | 恶意 npm 包以 Agent UID 运行，读取 env 中的凭证 |
| **日志泄露** | Agent 将凭证写入调试日志 |
| **工具调用泄露** | Agent 调用分析工具时把凭证作为参数传入 |

现有应对方案都假设"Agent 注定持有凭证，我们只能保护它"——加密存储、访问控制、运行时监控。但 AVP 的切入点完全不同：**既然 Agent 会泄露，不如让它根本没有可泄露的凭证字节。**

> "Filtering, alignment, allowlists - are all statistical and all imperfect. The bytes shouldn't be there to exfil in the first place."

---

## 技术原理

### 核心架构：基于 mitmproxy 的环回代理

AVP 基于 **mitmproxy**——Python 生态中成熟的中间人代理框架——构建。它作为一个本地环回 HTTPS 代理运行在 `127.0.0.1:14322`，对 Agent 零代码侵入：

```
Agent 进程（持有占位符）
    │  export HTTPS_PROXY="http://127.0.0.1:14322"
    │  Authorization: Bearer sk-ant...EFGH（占位符）
    ▼
AVP 代理（mitmproxy 内核）
    │  终止 TLS → 检查 bindings → 替换 → 重新加密
    │  1. 匹配 bindings.yaml（host+method+path）
    │  2. 从 Bitwarden Secrets Manager 实时拉取
    │  3. 替换占位符→真实 Key 在出站 socket 上
    │  4. fsync 写入审计事件到磁盘
    ▼
上游 API（api.anthropic.com）
    Authorization: Bearer ***
```

两个关键细节：
- **TLS 终止在代理层**——mitmproxy 解密 Agent 的请求，做完替换后再重新加密发往上游。Agent 需要信任 AVP 的 CA 证书
- **替换发生在出站 socket 上**——真实 Key 只在代理进程的内存中出现一瞬间，从不进入 Agent 的地址空间

### 是 Sidecar 吗？

不完全是 Kubernetes 意义上的 sidecar。它是**本地 HTTPS 代理**，部署方式因环境而异：

| 环境 | 部署方式 |
|------|---------|
| 开发机/服务器 | Systemd 服务，监听 127.0.0.1:14322 |
| Docker | Companion container（类似 sidecar，代理+Agent 共享网络栈） |
| 云端 VM | 守护进程模式 |

Agent 只需设置 `HTTPS_PROXY` 环境变量，零代码改造。

### 现有技术还是新技术？

**现有技术组合的新应用。** AVP 没有发明新的密码学原语或网络协议：

- **mitmproxy** → 成熟代理框架
- **Bitwarden Secrets Manager** → 既有的云/自托管密钥管理
- **bindings.yaml** → 新增的配置 DSL（placeholder + inject + bindings 三要素）
- **方法+路径粒度约束** → 新增的授权模型

项目自述也很克制：
> "AVP is a thin substitution layer. It is not a vault, not a key manager, not a rotation system — it's the missing piece between the existing vault and an autonomous agent."

### 与云原生密钥保护的本质区别

这是理解 AVP 价值最关键的地方。所有主流方案的模型是**"帮 Agent 拿到钥匙，Agent 自己开门"**——钥匙最终在 Agent 手里。AVP 的模型是 **"Agent 只有一张假卡片，AVP 在门禁处实时换成真钥匙"**——钥匙从不经过 Agent 的手。

| 方案 | 凭证字节在哪里 | 进程隔离 | 注入泄露风险 |
|------|--------------|---------|------------|
| **K8s Secret + 环境变量** | Agent 的 env/memory | ❌ 无 | ❌ `os.environ` 直接泄露 |
| **HashiCorp Vault Agent** | 渲染到文件 → Agent 内存 | ❌ 无 | ❌ 文件可被读取 |
| **Doppler / `op run` / `aws-vault exec`** | 启动时注入 env | ❌ 无 | ❌ 全程在进程地址空间 |
| **AWS Secrets Manager SDK** | SDK 返回值在 Agent 内存 | ❌ 无 | ❌ 拿到后仍可被注入泄露 |
| **AVP** | **AVP 代理进程内存（5min TTL）** | ✅ **进程级隔离** | ✅ **Agent 内无真实字节** |

这不是"存取控制"层面的差异——而是从**存取控制**转向了**进程级凭证隔离**的根本性安全模型变化。

---

## 架构与数据流

```
传统模型：
  Agent 进程 ──持有一把──→ 上游 API
               API Key        (GitHub/Anthropic/OpenAI)

AVP 模型：
  Agent 进程 ─── 占位符 ──→ AVP 代理 (127.0.0.1:14322)
                                │
               ┌────────────────┴────────────────┐
               │  1. 检查 bindings.yaml 是否有匹配 │
               │  2. 从 Bitwarden 实时获取真实凭证  │
               │  3. 在出站 socket 上替换占位符→真值 │
               │  4. fsync 审计事件到磁盘          │
               └────────────────┬────────────────┘
                                │
                                ▼
                          上游 API
```

Agent 的 env 只需要两行：

```bash
export ANTHROPIC_API_KEY="sk-ant...EFGH"   # 占位符
export HTTPS_PROXY="http://127.0.0.1:14322" # 流量走 AVP
```

Agent 代码完全无感——`os.getenv("ANTHROPIC_API_KEY")` 拿到的是占位符，直接往请求里塞。真实替换发生在出站前的最后一帧。

---

## 配置：bindings.yaml

所有安全策略通过一份 YAML 声明：

```yaml
version: 1

secrets:
  ANTHROPIC_API_KEY:
    placeholder: "sk-ant...EFGH"             # Agent env 里放的值
    inject:
      header: "Authorization"                 # 注入到 HTTP Header
      format: "Bearer {ANTHROPIC_API_KEY}"    # {} 被实时替换
    bindings:
      - host: "api.anthropic.com"             # 仅对此目标生效
        methods: [POST]                       # 仅 POST 请求
        paths: ["/v1/messages"]               # 仅此路径

  GITHUB_PAT:
    placeholder: "github...1234"
    inject:
      header: "Authorization"
      format: "Bearer {GITHUB_PAT}"
    bindings:
      - host: "api.github.com"
        methods: [POST]
        paths: ["/repos/*/*/pulls"]            # Agent 只能开 PR，不能删仓库
```

关键设计点：

- **默认拒绝**——没有 binding 匹配的请求，占位符原样转发，上游返回 401
- **方法+路径粒度**——即使 Agent 持有 GitHub 的 placeholder，也只能在 `POST /repos/*/*/pulls` 上使用
- **多 binding 支持**——一个凭证可以绑定到多个 host/method/path 组合
- **支持多种注入方式**——Header 注入（最常用）、Body 流式注入（用于 Slack webhook / OAuth POST / HMAC payload）、多目标注入器

---

## 部署方式

### Docker 部署

项目自带 `Dockerfile` 和 `docker-compose.yml`：

```bash
docker compose up
```

### Systemd 部署

适合在开发机或服务器上作为系统服务运行，详见项目 `docs/install-systemd.md`。

---

## 性能：几乎无感

AVP 官方提供了明确的基准数据：

| 阶段 | 延迟增量 | 说明 |
|------|---------|------|
| **稳态**（缓存命中） | **1-3 ms** | Header 重写 + fsync 审计 |
| **首次获取** | +100-300 ms | 从 BWS 拉取，一次性的 |
| **TLS 握手** | +5-20 ms | 一次性的，连接保持 warm |
| **Agent 总计** | 占底层 LLM API 调用 **0.1-0.5%** | 200-2000ms 的 API 调用里不可感知 |

1-3 ms 的稳态延迟对 Agent 来说基本是噪声。值得一提的是，fsync 确保审计事件在系统崩溃时也不会丢失——这个代价换来了合规级别的审计可靠性。

---

## 企业级可行性评估

这是运营团队最该关心的问题。AVP 在设计上解决了"凭证不进 Agent 内存"这个具体问题，但企业级落地需要清楚它的边界。

### 适合的场景 ✅

- 提示注入风险高的 AI Agent 保护（这是 AVP 最擅长的战场）
- 已有 Bitwarden Secrets Manager 的团队（开箱即用）
- 明确知道每个 Agent 所需最小 API 权限的团队
- 已有 egress firewall 配合使用的环境（防滥用 + 防泄露双管齐下）
- 作为现有云原生密钥管理方案的**补充层**插入

### 七个需要评估的限制 ❌

#### 1. 只防泄露，不防滥用

这是 AVP 的**一号设计限制**。项目文档明确说：

> "AVP prevents exfiltration of the raw key, not misuse of the authority the key represents on permitted destinations."

假设 bindings 配置成允许某个 Agent `POST api.github.com/*`。如果 Agent 被注入"给所有 issue 回复垃圾链接"——AVP 会正常替换凭证并放行请求，因为 binding 匹配了。凭证没泄露，但权限被滥用了。

`methods` 和 `paths` 绑定是对策，但需要运维团队精确知道每个 Agent 到底需要哪些操作。配宽了等于没防滥用，配窄了 Agent 功能可能中断。

#### 2. 不处理上游响应中的凭证泄露

> "AVP injects on the request, but does not scrub the response."

有些上游 API 会在响应体中回显 `Authorization` 头或原始凭证。如果 Agent 请求时用的是占位符，但上游返回了真实 Key——Agent 的进程里最终还是出现了真实凭证字节。

这在实践中不常见，但存在。项目对此坦诚，建议配合响应审查。

#### 3. Vault 后端生态目前只成熟支持 Bitwarden

虽然适配器架构 (`docs/adapter-architecture.md`) 已经设计好 `SecretsBackend` 协议，但目前正式的生产后端只有 **Bitwarden Secrets Manager**。`static` 后端（从 YAML 文件读）只用于开发和测试，不允许用于生产。

如果企业用的是 HashiCorp Vault、AWS Secrets Manager、1Password、Doppler——需要自行实现适配器。项目文档给出了适配器开发指南，但毕竟需要投入开发资源。

#### 4. 只保护 HTTPS 流量

AVP 只处理通过它代理的 HTTP/HTTPS 请求。不覆盖：

- 数据库连接（PostgreSQL wire protocol、Redis）
- gRPC 调用（如果不走 HTTP/2 over TLS）
- SSH 密钥
- 本地文件系统凭证

对比 Kloak（comparison.md 中的方案），后者用 eBPF 在 `SSL_write` 层面拦截，可以覆盖所有 TLS 流量不论协议。但 Kloak 是 Kubernetes-only + AGPL 协议，部署限制更大。

#### 5. 单点故障

AVP 进程挂了 → Agent 的所有 API 调用都返回 401（占位符原样转发到上游，上游不认）。项目自带 Docker 和 Systemd 部署，但**没有内置高可用方案**——需要自行补充健康检查、自动重启和监控告警。

#### 6. mitmproxy TLS 终止的限制

AVP 需要作为 CA 签发证书供 Agent 信任，才能在 TLS 层面做替换。这意味着：

- Agent 需要安装并信任 AVP 的 CA 证书（多一台机器的运维成本）
- **与 mTLS（双向 TLS）可能有冲突**——代理终止 TLS 后重新加密，无法透传客户端证书。如果你的上游 API 要求客户端证书认证，AVP 不适用

#### 7. 运维团队的配置负担

bindings.yaml 需要对每个 API Key 精确知道：
- 发给哪个 host
- 用哪个 HTTP method
- 走哪些 URL path
- 在请求的 Header 还是 Body 的什么位置

对于大型企业，这意味着一份持续维护的"Agent → 资源 → 操作"映射表。项目没有自动化发现或推荐功能，配置负担完全在运维团队身上。

---

## 与同类方案的核心差异

AVP 的 comparison.md 给出了详细的方案对比。核心差异可以归纳为一张表：

| | 凭证在哪里 | 进程隔离 | 协议覆盖 | 部署要求 | 许可证 |
|--|----------|---------|---------|---------|-------|
| **AVP** | 代理进程（5min cache） | ✅ 进程级 | HTTP/HTTPS | 任意主机 | MIT |
| **HashiCorp Vault Agent** | 文件→Agent 内存 | ❌ | 全协议 | 任意主机 | BUSL |
| **Doppler/`op run`** | 启动时注入 env | ❌ | 全协议 | 任意主机 | 专有 |
| **superfly/tokenizer** | 代理内存 | ✅ 进程级 | HTTP(S) | 需安全传输层 | Apache-2.0 |
| **Kloak (eBPF)** | 内核替换 | ✅ 内核级 | 所有 TLS | Kubernetes 专属 | AGPL-3.0 |

AVP 的独特位置是：**在"进程级凭证隔离"和"任意主机可部署"的交叉点上，且是唯一选择了 MIT 许可证的方案。**

---

## 结语

Agent Vault Proxy 是 6 月这个 Agent 安全"发布潮"中，唯一一个以**具体可部署的开源项目**形式出现的答案。不是指南、不是框架、不是标准——一个 `git clone` + 几行配置 + 启动就能用的工具。

但它的定位也决定了它不是拿来直接当企业级方案部署的。它更像一个**关键组件**——解决了"凭证进不了 Agent 内存"这个具体问题，但需要你配上 egress firewall（防滥用）、响应安全清洗（防回显）、代理高可用（防单点）、权限管理流程（防配置过宽）才能构成完整的生产方案。

如果你已经有一套密钥管理（最好是 Bitwarden），这个薄层插入的价值是显而易见的——它填补了现有所有方案留下的"凭证字节必须进入 Agent 内存"这个空白。
