---
categories: [dev]
title: OpenClaw Observability Plugin——为 AI Agent 网关提供 OpenTelemetry 全链路可观测性
description: henrikrexed/openclaw-observability-plugin（⭐42）是一个 OpenTelemetry 可观测性插件，为 OpenClaw AI Agent 网关提供 traces、metrics、logs 全链路监控。支持模型调用 Span、工具调用耗时、会话追踪、安全检测、Token 用量跟踪和内置仪表盘。
tags: [OpenClaw, 可观测性, OpenTelemetry, AI Agent, 监控, TypeScript]
---

## 一句话结论

**henrikrexed/openclaw-observability-plugin**（⭐42，Apache 2.0）是一个为 **OpenClaw** AI Agent 网关提供 OpenTelemetry 可观测性的插件，支持 **traces、metrics、logs** 全链路采集。当前版本 v0.6.0 提供模型调用 Span、工具调用耗时、会话追踪、Token 用量跟踪、安全检测提示和内置仪表盘。该插件支持两种可观测性路径：OpenClaw 内置的官方 OTel 插件（简易配置）和本仓库的自定义钩子插件（深度追踪）。

> **来源说明**：基于 GitHub 仓库 README 综合整理。

## 项目概览

| 项目 | 内容 |
|------|------|
| **仓库** | henrikrexed/openclaw-observability-plugin |
| **Stars** | ⭐42 |
| **语言** | TypeScript |
| **许可证** | Apache 2.0 |
| **创建时间** | 2026-02-02 |
| **最新版本** | v0.6.0（2026-05-13） |
| **安装方式** | npm 包 / 本地克隆 |

## 两种可观测性路径

| 路径 | 适合场景 | 复杂度 |
|------|---------|--------|
| **官方 Diagnostics 插件（内建）** | 运行指标、网关健康、成本追踪 | 简单配置 |
| **自定义钩子插件（本仓库）** | 深度追踪、工具调用可见性、请求全生命周期 | 插件安装 |

> **推荐**：两者配合使用可覆盖完整可观测性。

## Approach 1：官方内建 OTel 支持

OpenClaw v2026.2+ 内置 OpenTelemetry 支持，仅需在 `openclaw.json` 中添加：

```json
{
  "diagnostics": {
    "enabled": true,
    "otel": {
      "enabled": true,
      "endpoint": "http://localhost:4318",
      "serviceName": "openclaw-gateway",
      "traces": true,
      "metrics": true,
      "logs": true
    }
  }
}
```

### 捕获指标

| 指标 | 说明 |
|------|------|
| `openclaw.tokens` | Token 用量（输入/输出/缓存） |
| `openclaw.cost.usd` | 模型成本估算 |
| `openclaw.run.duration_ms` | Agent 运行耗时 |
| `openclaw.context.tokens` | 上下文窗口使用情况 |
| `openclaw.webhook.*` | Webhook 处理统计 |
| `openclaw.message.*` | 消息处理统计 |
| `openclaw.queue.*` | 队列深度和等待时间 |
| `openclaw.session.*` | 会话状态转换 |

## Approach 2：自定义 Hooks 插件（深度追踪）

### 追踪链路

```
openclaw.request (根 Span)
├── openclaw.session (长生命周期会话 Span)
├── openclaw.agent.turn
│   ├── openclaw.dispatch.prepare
│   ├── chat {model} (模型调用 Span，GenAI 语义约定)
│   ├── execute_tool Read (工具 Span)
│   ├── execute_tool Write (工具 Span)
│   └── execute_tool Bash (工具 Span)
└── openclaw.message.sent
```

### V3 核心能力

| 功能 | 说明 |
|------|------|
| 模型调用 Span | `chat {model}` CLIENT spans，含完整 GenAI 语义约定 |
| 工具调用计时 | `before_tool_call` / `after_tool_call` 钩子，精确耗时和审批工作流 |
| 会话追踪 | 长生命周期 `openclaw.session` spans（时长、请求数、结束原因） |
| 调度 Span | `openclaw.dispatch.prepare` LLM 请求调度阶段追踪 |
| 日志导出 | OTLP 日志通过 `log.record` 诊断事件输出 |
| **安全检测** | Span 上检测提示注入、危险命令、敏感文件访问 |
| GenAI 语义约定 | 完整 `gen_ai.*` 属性（与 `openclaw.*` 共存，兼容仪表盘） |
| 工具审批追踪 | `openclaw.tool.approval.*` 属性 |
| Cron & 子 Agent | Cron 任务和子 Agent 编排的 Span 和 Metrics |

### 注册的 Hooks（18 个）

| 钩子类型 | 具体钩子 |
|---------|---------|
| 生命周期 | `message_received`, `session_start`, `session_end`, `before_model_resolve`, `before_prompt_build`, `llm_input`, `llm_output`, `model_call_started`, `model_call_ended` |
| 调度与工具 | `before_dispatch`, `reply_dispatch`, `before_tool_call`, `after_tool_call`, `tool_approval_resolution`, `tool_result_persist` |
| 消息与 Agent | `message_sent`, `before_agent_finalize`, `agent_end`, `before_reset` |
| Cron | `cron_change`, `cron_execution`, `cron_error` |
| 子 Agent | `subagent_spawn`, `subagent_ended` |

## 安装使用

### npm 安装（推荐）

```bash
npm install @henrikrexed/openclaw-otel-observability
```

`openclaw.json` 配置：

```json
{
  "plugins": {
    "load": {
      "paths": ["./node_modules/@henrikrexed/openclaw-otel-observability"]
    },
    "entries": {
      "otel-observability": {
        "enabled": true
      }
    }
  }
}
```

### Kubernetes 安装

```yaml
apiVersion: openclaw.io/v1alpha1
kind: OpenClawInstance
spec:
  plugins:
    - name: "@henrikrexed/openclaw-otel-observability"
      version: "^0.3.1"
```

## 支持矩阵

| 插件分支 | OpenClaw 版本范围 | 状态 |
|----------|-------------------|------|
| 0.1.x | < 2026.4.21 | 维护模式（安全 + 关键修复，截至 2026-10-21） |
| 0.2.x | >= 2026.4.21 | 已被 0.3.x 替换 |
| 0.3.x | >= 2026.4.21 | V3 功能、日志管道、Bug 修复 |
| **0.6.x** | >= 2026.5.13 | **当前最新**——仪表盘、诊断、Token 类型、遥测 |

## 与近期 Agent 安全的关联

可观测性是 Agent 安全的重要基础：

| 安全需求 | 此插件提供的能力 |
|---------|----------------|
| 行为监控 | 全链路追踪 + 工具调用可见性 |
| 异常检测 | Span 上安全检测（提示注入、危险命令） |
| 合规审计 | 完整调用链日志导出到 OTLP 后端 |
| 成本控制 | Token 用量 + 成本估算指标 |

插件内置的**安全检测**（prompt injection、dangerous command、sensitive file access detection）直接关联此前发布的 SkillCloak 和 Gaslight 等威胁。

## 参考

- GitHub：[henrikrexed/openclaw-observability-plugin](https://github.com/henrikrexed/openclaw-observability-plugin)（⭐42，Apache 2.0）
- 文档：[https://henrikrexed.github.io/openclaw-observability-plugin/](https://henrikrexed.github.io/openclaw-observability-plugin/)
