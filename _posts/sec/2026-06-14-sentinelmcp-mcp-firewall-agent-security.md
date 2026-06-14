---
layout: post
title: "SentinelMCP：面向 AI Agent 的开源 MCP 防火墙，保护工具调用安全"
categories: [sec]
description: "SentinelMCP 是一个开源的 MCP 安全网关，在 AI Agent 和 MCP 服务器之间建立代理层，提供工具调用白名单/黑名单过滤、PII/密钥脱敏、速率限制、审计日志和人环审批。支持 Sidecar 代理和 Go Inline SDK 两种模式。Apache 2.0。"
tags:
  - SentinelMCP
  - MCP
  - Agent安全
  - 防火墙
  - AI安全
  - Go
  - 开源
---

MCP（Model Context Protocol）正在成为 AI Agent 连接外部工具的事实标准协议。从 Claude Desktop 到 Cursor、VS Code，数以万计的 MCP 服务器让 Agent 能读文件、写数据库、操作云服务——但 Agent 的每一个工具调用，都可能成为攻击面。

一个恶意的 MCP 服务器可以读取本地文件、窃取 API Key、执行未经授权的命令。而标准的 MCP 客户端对此几乎没有任何防护。

**2026 年 6 月，Technosive Ltd. 开源了 SentinelMCP——一个专门为 MCP 协议设计的 Agent 安全网关。** 它在 AI Agent 和 MCP 服务器之间建立一层代理，对所有工具调用进行策略检查、敏感数据脱敏、人环审批和审计记录。

> **项目地址：** [github.com/technosiveuk-ui/SentinelMCP](https://github.com/technosiveuk-ui/SentinelMCP)  
> **许可协议：** Apache 2.0 | **当前版本：** v0.2.0 (Alpha)

---

## 一、为什么要一个 MCP 防火墙

2026 年初的一项统计显示，仅 1-2 月间就有 **超过 30 个 MCP 相关的 CVE** 被提交，其中包括一个 CVSS 9.6 的远程代码执行漏洞（来自一个下载量近 50 万次的包）。

MCP 的安全风险主要来自三个方面：

| 风险类别 | 典型场景 | 后果 |
|---------|---------|------|
| **工具滥用** | Agent 调用了未授权的 `exec_command`、`write_file` | 远程命令执行、文件篡改 |
| **数据泄露** | Agent 将敏感数据作为参数传入外部 MCP 服务 | API Key、密码、PII 经 Agent 泄露 |
| **上下文注入** | MCP 服务器返回恶意内容污染 Agent 上下文 | Agent 被诱导执行非预期操作 |

SentinelMCP 的定位就是填补这个空白——在 Agent 每次调用 MCP 工具时，执行策略检查、数据脱敏和审计记录。

---

## 二、两种部署模式

### Proxy Mode（Sidecar 代理，通用方案）

以一个独立的旁路代理运行，拦截 HTTP/SSE 的 MCP 流量。**无需修改任何代码**，适用于 Python、TypeScript、Go 等任何语言。

```
AI Agent（任何语言） → SentinelMCP Proxy → MCP Server
                      ↓
               策略引擎 / DLP / 审计日志
```

**启动命令：**

```bash
docker run --name sentinelmcp \
  -p 8080:8080 -p 9090:9090 \
  -v ./policies.yaml:/etc/sentinelmcp/config.yaml \
  ghcr.io/technosiveuk-ui/sentinelmcp:latest
```

然后让 MCP 客户端指向 `http://localhost:8080/mcp` 即可。

### Inline SDK Mode（Go 原生，零拷贝）

将 SentinelMCP 作为 Go 库直接嵌入应用进程，**零网络跳转**，P99 延迟仅 19 微秒。

```go
pipeline, err := sdk.New(invoker).
    WithRisk("exec_command", gateway.RiskHigh).
    StrictDefaults().
    Build()

result, err := pipeline.Run(context.Background(), "read_file", map[string]any{"path": "/etc/config.yaml"})
```

| 模式 | 适用场景 | 延迟 |
|------|---------|------|
| **Proxy Sidecar** | 多语言环境、快速接入、零代码修改 | 网络一跳 |
| **Inline SDK** | Go 项目、极致性能、深层上下文感知 | P99 19μs |

> 来源：项目 README，「Key differentiator: competitors like Permit/Envoy only offer network proxies. With the Inline SDK, Go applications get the same security enforcement at a fraction of the latency.」

---

## 三、核心能力

### 策略引擎

基于 YAML 的策略文件，支持热加载。每个工具可以按风险等级配置：

```yaml
tools:
  read_file:
    risk: low                    # 允许
  write_file:
    risk: medium                 # 允许 + 审计
  exec_command:
    risk: high                   # 需要人工审批
    require_approval: true
```

风险等级映射到四种行为：**allow（放行）→ redact（脱敏后放行）→ block（拦截）→ interrupt（暂停等人审批）**。

### 数据防泄漏（DLP）

内置 6 种正则脱敏模式：私钥、密码、API Key、信用卡号、SSN、邮箱。支持自定义正则：

```yaml
dlp_patterns:
  INTERNAL_HOSTNAME:
    regex: '\b[a-z]+\.internal\.company\.com\b'
    type: pii
```

### 人环审批（HITL）

高风险工具调用可以通过 Webhook 发送审批请求，等待人工确认后继续执行。审批状态通过 BoltDB 持久化，进程重启后仍然可恢复。

### 传输安全

- 可选的 TLS 加密
- API Key 认证
- 管理 Token
- 上游证书锁定
- 出站白名单
- **Strict 模式**：生产中必须开启，拒绝非加密连接

### 审计日志

结构化的 JSON 日志，直接输出到 stdout，同时通过 **OpenTelemetry** 集成到 SIEM 系统（如 Splunk），方便企业级安全监控。

---

## 四、架构设计

SentinelMGP 的架构体现了清晰的关注点分离：

```
sentinelmcp/
├── gateway/           # 核心接口和领域类型（零 MCP 依赖）
│   ├── types.go      # GatewayContext, AuditEvent, RiskLevel, Decision
│   ├── policy.go     # Policy 接口 + DefaultPolicy
│   ├── redact.go     # DLP Scanner + Redactor
│   ├── audit.go      # AuditEmitter 接口
│   └── ...
├── sdk/              # Inline SDK 构建器
├── adapter/
│   ├── eino/         # Eino 框架适配器（唯一导入 Eino 的包）
│   ├── sidecar/      # Sidecar 代理适配器
│   └── siem/         # SIEM 审计输出（Splunk HEC 等）
├── config/           # YAML 配置加载和热加载
└── cmd/              # 可执行文件
```

**设计原则：** `gateway/` 的核心接口不依赖任何 MCP 传输库或 Eino 框架。这意味着：
1. 框架无关——换编排引擎只需换 adapter
2. 可独立测试——核心逻辑无需 MCP 服务器即可单测
3. 开放核心架构——企业版功能（Teams/Slack HITL、Nightfall DLP 等）通过 `GatewayConfig` 接口接入，零 OSS 代码修改

---

## 五、配置示例

一个完整的策略文件示例：

```yaml
schema_version: "1.0"
global:
  default_risk: low
  redaction_mask: "***REDACTED***"
sidecar:
  listen_addr: "localhost:8080"
  health_addr: "localhost:9090"
  transport: streamable_http
  strict: false   # 生产环境必须设为 true

tools:
  read_file:
    risk: low
  write_file:
    risk: medium
  exec_command:
    risk: high
    require_approval: true
  list_directory:
    risk: medium

dlp_patterns:
  API_KEY:
    regex: '(?i)api[_-]?key[_-]?[:=]\s*\S+'
    type: credential
  CREDIT_CARD:
    regex: '\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b'
    type: pii
```

---

## 六、适用场景与注意事项

### 适合的场景
- **企业自建 AI Agent**：需要对 Agent 的工具调用进行审计和管控
- **MCP 服务器供应链安全**：使用第三方 MCP 服务器时，通过 SentinelMCP 限制其能力
- **合规审计**：需要完整的工具调用审计日志以满足 SOC2、ISO 27001 等要求
- **敏感环境**：Agent 需要访问包含 PII/密钥的数据，需要实时的 DLP 脱敏

### 需要注意的
- **Alpha 版本**：v0.2.0，项目明确声明不应作为生产环境唯一的防御手段
- **Go 生态**：Sidecar 模式是通用的，但 Inline SDK 仅支持 Go
- **性能开销**：Sidecar 模式引入网络一跳，Inline SDK 虽低延迟但需要集成到 Go 项目中
- **策略需要人工维护**：策略引擎是规则驱动的，需要持续更新以匹配新的工具和风险场景

---

## 七、比较：SentinelMCP 与其他方案

| 维度 | SentinelMCP | 通用 API 网关（Kong/Envoy） | AI 安全平台（Guardrails AI 等） |
|------|------------|--------------------------|-------------------------------|
| **定位** | MCP 协议层的安全网关 | 通用 API 流量管理 | LLM 输入/输出安全 |
| **MCP 感知** | 原生支持 | 需自定义插件 | 不支持 |
| **部署模式** | Sidecar + Inline SDK | Sidecar | SDK/API |
| **性能** | P99 19μs（Inline） | 微秒级 | 毫秒级 |
| **DLP 脱敏** | 内置 6 种 + 自定义正则 | 无 | 有（但非 MCP 协议） |
| **HITL 审批** | 内置 Webhook + BoltDB 持久化 | 需自定义 | 有限 |
| **审计** | JSON + OpenTelemetry | 有 | 有 |
| **开源** | Apache 2.0 | 部分开源 | 部分开源 |

---

## 总结

SentinelMCP 切中了一个真实且正在增长的需求：**随着 MCP 成为 AI Agent 连接外部工具的标准协议，MCP 层的安全防护不再是可选项，而是必需品。**

2026 年上半年 MCP 生态暴露出的 30+ 个 CVE 已经证明了这个判断。SentinelMCP 通过策略引擎 + DLP + HITL + 审计日志的组合，为自建 AI Agent 的企业提供了一个开箱即用的运行时保护层。

当然，Alpha 状态意味着它更适合**评估和验证**而非直接投入生产。但对于正在建设 Agent 安全体系的技术团队来说，现在关注和测试 SentinelMCP 正是时候——等到 MCP 安全事件大规模爆发时再补课就晚了。

**项目地址：** [github.com/technosiveuk-ui/SentinelMCP](https://github.com/technosiveuk-ui/SentinelMCP)  
**许可协议：** Apache 2.0
