---
categories: [dev]
title: 多智能体工具调用监控与高级行为分析平台（AgentTrace）——完整产品技术方案
description: AgentTrace 是面向 OpenClaw、Hermes、Claude Code、Codex 等智能体运行时的工具调用监控、审计、策略控制和高级行为分析平台。涵盖 Agent Hook Adapter、MCP Proxy/Sidecar、统一事件模型、策略引擎、行为分析、OTel 输出等完整架构设计。
tags: [AgentTrace, 可观测性, MCP, OpenClaw, 工具监控, 行为分析, OTel, 安全审计]
---


# 多智能体工具调用监控与高级行为分析平台

## 产品技术方案

## 1. 方案摘要

随着 OpenClaw 接入的 MCP Server 数量和调用频率增长，当前最大问题不是“有没有 MCP 配置”，而是“运行时到底谁调用了哪个 MCP 工具、参数是什么、耗时多久、是否失败、失败发生在 Agent 层还是 MCP 协议层”。现有调研已经确认：OpenClaw 中本地工具可以被 weclawtrace 记录，但 `fetch__fetch`、`fetch__prompts_list` 等 MCP 工具未出现在 daemon 策略日志中，说明 MCP 工具调用在现有可观测链路里存在真实盲区。

最终方案不是单纯写一个 OpenClaw 插件，而是建设一个 **Agent Tool Observability & Behavior Analysis Layer**：

```text
Agent 原生 Hook Adapter
        +
MCP 协议代理 / Sidecar
        +
统一事件模型 / 策略引擎 / 行为分析
        +
OTel / JSONL / DB / Dashboard / Alert
```

其中：

* **OpenClaw 内部**：以 `before_tool_call + after_tool_call` Plugin Hook 作为主采集点。
* **MCP 工具兜底**：引入 MCP Proxy / Sidecar，采集 `tools/list`、`tools/call`、JSON-RPC 错误、transport、server 健康等协议层数据。
* **跨 Agent 兼容**：通过 Adapter 把 OpenClaw、Claude Code、Codex、Hermes 的不同 Hook 事件归一化为统一事件。
* **高级行为分析**：基于统一事件做链路追踪、风险评分、慢调用分析、失败聚合、权限越权检测、数据外传识别、异常工具序列检测。

## 2. 背景与问题定义

### 2.1 当前问题

OpenClaw 当前 MCP 调用存在以下运维痛点：

| 问题      | 表现                                     | 影响                                               |
| ------- | -------------------------------------- | ------------------------------------------------ |
| 调用链路不透明 | 只能知道配置了哪些 MCP Server，不能稳定看到运行时调用       | 失败时无法定位是 Agent、MCP Client、transport 还是 Server 问题 |
| 缺少性能基线  | 无每次 MCP 工具耗时、P95、P99                   | 无法识别慢调用和性能退化                                     |
| 错误信息分散  | MCP Server 错误主要散落在日志里                  | 难以检索、聚合、告警                                       |
| 调用统计缺失  | 无法回答“哪个 MCP Server 最常用”“哪个 Tool 最容易失败” | 无法做容量规划和治理                                       |
| 策略审计盲区  | 部分 MCP 调用绕过现有 daemon 策略日志              | 安全审计不完整                                          |
| 依赖健康不可见 | MCP Server backoff、冷却、连接失败缺少结构化记录      | 排障成本高                                            |

调研文档中也明确列出了 OpenClaw MCP 的可观测性盲区，包括调用链路不透明、无性能基线、错误信息分散、无调用统计、backoff 原因难排查等问题。

### 2.2 根因分析

OpenClaw 内建工具和 MCP 工具在 Hook 与诊断事件路径上不完全一致。

调研结论显示：内建工具走 `wrapToolWithBeforeToolCallHook` 预包裹路径，会发射 `tool.execution.*` 诊断事件；MCP 工具走 `toToolDefinitions` inline fallback 路径，虽然同样触发 `before_tool_call / after_tool_call` Plugin Hook，但不发射 `tool.execution.*` 诊断事件。

因此，依赖 `tool.execution.started/completed/error` 诊断事件或开箱 OTel 的方案，会漏掉 MCP 工具调用；正确的 OpenClaw MCP 监控入口应是 Plugin Hook，尤其是 `before_tool_call + after_tool_call`。

## 3. 产品定位

### 3.1 产品名称

建议内部产品名：

```text
AgentTrace / ToolTrace / MCPTrace
```

本文以下统一称为 **AgentTrace**。

### 3.2 一句话定位

**AgentTrace 是面向 OpenClaw、Hermes、Claude Code、Codex 等智能体运行时的工具调用监控、审计、策略控制和高级行为分析平台。**

### 3.3 用户角色

| 角色          | 诉求                            |
| ----------- | ----------------------------- |
| Agent 平台研发  | 快速定位工具调用失败、Hook 缺失、协议错误       |
| SRE / 运维    | 监控 MCP Server 健康、慢调用、失败率、容量趋势 |
| 安全团队        | 审计高危工具调用、敏感路径访问、数据外传行为        |
| 业务方 / 插件开发者 | 了解工具使用情况、失败原因、参数质量            |
| 平台负责人       | 统一治理多 Agent、多 MCP、多工具生态       |

## 4. 建设目标与非目标

### 4.1 建设目标

| 目标                   | 说明                                                           |
| -------------------- | ------------------------------------------------------------ |
| 覆盖 OpenClaw MCP 调用盲区 | 对 MCP 工具调用做到开始、完成、错误、耗时、参数摘要、结果摘要可见                          |
| 统一内建工具、插件工具、MCP 工具   | 形成统一工具调用事件模型                                                 |
| 支持跨 Agent 扩展         | 兼容 OpenClaw、Claude Code、Codex、Hermes 以及未来其他 Agent            |
| 支持 MCP 协议级观测         | 记录 `tools/list`、`tools/call`、transport、JSON-RPC 错误、server 健康 |
| 支持高级行为分析             | 工具链路、异常序列、风险评分、越权检测、数据外传识别                                   |
| 支持策略控制               | 允许、阻断、改参、审批、降级、告警                                            |
| 支持生产可观测性             | 输出 JSONL、数据库、OpenTelemetry traces / metrics / logs           |
| 最小侵入上线               | OpenClaw 优先通过插件完成 P0；深度增强通过 proxy 与小范围源码增强完成                 |

### 4.2 非目标

| 非目标              | 说明                                       |
| ---------------- | ---------------------------------------- |
| 不替代 Agent 自身权限系统 | AgentTrace 是观测与策略层，不直接替代底层沙箱             |
| 不默认保存完整敏感内容      | 默认保存摘要、hash、大小、脱敏结果                      |
| 不保证拦截所有系统副作用     | Shell、浏览器、网络、文件系统等仍需系统层 sensor 补充        |
| 不绑定某一个 Agent 实现  | OpenClaw 是首个落点，不把核心模型写死在 OpenClaw Hook 上 |

## 5. 总体架构

### 5.1 架构总览

```text
┌─────────────────────────────────────────────────────────────────────┐
│                           AgentTrace Platform                       │
│                                                                     │
│  ┌──────────────────────┐   ┌──────────────────────┐               │
│  │ Behavior Analysis     │   │ Policy Engine         │               │
│  │ - 风险评分             │   │ - allow / deny / ask  │               │
│  │ - 异常序列             │   │ - 改参 / 脱敏 / 告警   │               │
│  │ - 慢调用 / 失败聚合     │   │ - 审批策略             │               │
│  └──────────▲───────────┘   └──────────▲───────────┘               │
│             │                          │                           │
│  ┌──────────┴──────────────────────────┴───────────┐               │
│  │              Unified Event Normalizer             │               │
│  │  tool.call.* / mcp.rpc.* / llm.call.* / session.* │               │
│  └──────────▲──────────────────────────▲───────────┘               │
│             │                          │                           │
│  ┌──────────┴───────────┐   ┌──────────┴───────────┐               │
│  │ Agent Hook Adapters   │   │ MCP Proxy / Sidecar   │               │
│  │ OpenClaw / Claude     │   │ stdio / SSE / HTTP    │               │
│  │ Codex / Hermes / ...  │   │ JSON-RPC capture      │               │
│  └──────────▲───────────┘   └──────────▲───────────┘               │
│             │                          │                           │
│  ┌──────────┴──────────────────────────┴───────────┐               │
│  │ OpenClaw / Hermes / Claude Code / Codex / Others │               │
│  └──────────────────────────────────────────────────┘               │
│                                                                     │
│  Output: JSONL / PostgreSQL / ClickHouse / OTel / Grafana / Alerts  │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 四层架构

#### 第一层：Agent Hook Adapter

负责接入不同 Agent 的原生 Hook 系统。

| Agent       | 原生 Hook / 事件         | 统一事件                                      |
| ----------- | -------------------- | ----------------------------------------- |
| OpenClaw    | `before_tool_call`   | `tool.call.started` / `tool.call.blocked` |
| OpenClaw    | `after_tool_call`    | `tool.call.completed` / `tool.call.error` |
| Claude Code | `PreToolUse`         | `tool.call.started` / `tool.call.blocked` |
| Claude Code | `PostToolUse`        | `tool.call.completed`                     |
| Claude Code | `PostToolUseFailure` | `tool.call.error`                         |
| Claude Code | `PermissionRequest`  | `tool.call.approval_requested`            |
| Codex       | `PreToolUse`         | `tool.call.started` / `tool.call.blocked` |
| Codex       | `PermissionRequest`  | `tool.call.approval_requested`            |
| Codex       | `PostToolUse`        | `tool.call.completed` / `tool.call.error` |
| Hermes      | `pre_tool_call`      | `tool.call.started`                       |
| Hermes      | `post_tool_call`     | `tool.call.completed` / `tool.call.error` |

Claude Code 官方文档说明，Hook 会在 Claude Code 生命周期特定点触发，工具调用相关事件包括 `PreToolUse`、`PostToolUse`，且 MCP server tools 会像普通工具一样出现在 `PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest`、`PermissionDenied` 中，命名模式为 `mcp__<server>__<tool>`。([Claude][1])

Codex 官方文档说明，Codex Hooks 是把脚本注入 agentic loop 的扩展框架，`PreToolUse` 支持 Bash、`apply_patch` 和 MCP tool calls；`PostToolUse` 也覆盖 Bash、`apply_patch` 和 MCP tool calls，但文档同时提示它并不拦截所有 shell、`WebSearch` 或其他非 shell、非 MCP 工具路径。([OpenAI 开发者][2])

Hermes 官方文档显示，Hermes 会发现 MCP tools 和 plugin tools；工具执行流中包含 `invoke_hook("pre_tool_call", ...)` 和 `invoke_hook("post_tool_call", ...)`，插件侧也列出了 `pre_tool_call` 与 `post_tool_call` 生命周期 Hook。([Hermes Agent][3])

#### 第二层：MCP Proxy / Sidecar

负责采集跨 Agent 的 MCP 协议层数据。

MCP 是开放协议，用于让 LLM 应用与外部数据源和工具集成；协议使用 JSON-RPC 2.0 消息在 Host、Client、Server 之间通信。([Model Context Protocol][4]) MCP 工具协议中，`tools/list` 用于列出 server 的工具，`tools/call` 结果包含 `content`、`structuredContent`、`isError` 等字段；工具内部错误应通过 `CallToolResult.isError=true` 表达，而找不到工具或 server 不支持工具调用等异常条件才应作为 MCP error response。([Model Context Protocol][5])

MCP Proxy 采集内容：

```text
initialize
tools/list
tools/call
resources/list
resources/read
prompts/list
prompts/get
JSON-RPC id
request / response size
transport: stdio / SSE / streamable-http
latency
protocol error
tool result isError
server stderr
connection timeout
request timeout
backoff / retry
```

#### 第三层：统一事件模型与策略引擎

负责把不同 Agent、不同协议、不同工具来源转成统一结构。

核心事件：

```text
agent.run.started
agent.run.ended

llm.call.started
llm.call.ended
llm.input.observed
llm.output.observed

tool.call.started
tool.call.approval_requested
tool.call.approval_decided
tool.call.blocked
tool.call.completed
tool.call.error
tool.result.persisted

mcp.rpc.request
mcp.rpc.response
mcp.rpc.error
mcp.server.health_changed

risk.finding.created
policy.decision.created
```

#### 第四层：存储、查询、看板与告警

输出目标：

```text
JSONL       本地审计、低成本落盘、故障兜底
PostgreSQL  结构化查询、配置、策略、审计
ClickHouse  大规模事件分析、聚合指标
OTel        traces / metrics / logs 对接现有可观测系统
Grafana     可视化大盘
Webhook     告警通知、审批流、工单系统
```

OpenTelemetry Protocol 官方说明，OTLP 用于在 telemetry source、collector、backend 之间传输 telemetry data，并覆盖 traces、metrics、logs 等信号；因此本方案把 OTel 作为生产可观测输出，而不是唯一存储。([OpenTelemetry][6])

## 6. OpenClaw 落地方案

### 6.1 OpenClaw 采集策略

OpenClaw P0 必须采用 Plugin Hook，而不是只订阅诊断事件。

原因如下：

1. MCP 工具和内建工具都触发 `before_tool_call / after_tool_call` Plugin Hook。
2. MCP 工具不发射 `tool.execution.*` 诊断事件。
3. 依赖 OTel 开箱或诊断事件订阅无法完整覆盖 MCP。
4. Plugin Hook 可以拿到工具名、参数、结果、耗时、会话、Agent、渠道、runId、toolCallId 等信息。

### 6.2 OpenClaw 插件职责

插件命名建议：

```text
extensions/agenttrace-openclaw
```

职责：

| 模块                 | 职责                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------- |
| Hook Collector     | 注册 `before_tool_call`、`after_tool_call`、`model_call_started/ended`、`llm_input/output` |
| MCP Detector       | 识别 MCP 工具，解析 serverName、toolName、operation                                            |
| Pending Call Store | 维护未完成调用，处理超时、缺失 after 事件                                                              |
| Redactor           | 参数和结果脱敏、截断、hash                                                                       |
| Event Emitter      | 输出统一事件到本地队列                                                                           |
| OTel Bridge        | 手动创建 MCP tool span                                                                    |
| Policy Client      | 调用策略引擎，返回 allow / deny / ask / rewrite                                                |
| Local JSONL Sink   | 故障兜底落盘                                                                                |
| Metrics Aggregator | 本地聚合 QPS、失败率、耗时分位数                                                                    |

### 6.3 MCP 工具识别

OpenClaw MCP 工具可通过三种方式识别：

| 方法             | 说明                                                        |
| -------------- | --------------------------------------------------------- |
| 工具名模式          | `serverName--toolName`                                    |
| PluginToolMeta | `pluginId: "bundle-mcp"`，包含 serverName、toolName、operation |
| 诊断身份分类         | `toolSource: "mcp"`、`toolOwner: "bundle-mcp"`             |

调研文档中明确列出，MCP 工具名可使用 `serverName--toolName` 格式解析，也可以通过 `PluginToolMeta` 中的 `pluginId: "bundle-mcp"` 和 `mcp.serverName/toolName/operation` 精确识别。

### 6.4 OpenClaw Hook 处理流程

```text
before_tool_call
  │
  ├─ 解析 tool source
  ├─ 生成 / 获取 trace_id、span_id、tool_call_id
  ├─ 参数脱敏、hash、size 计算
  ├─ 写入 pendingCalls
  ├─ 输出 tool.call.started
  ├─ 调用策略引擎
  │     ├─ allow
  │     ├─ deny → return { block: true }
  │     ├─ ask  → return { requireApproval: ... }
  │     └─ rewrite → return { params: newParams }
  │
  └─ 返回 Hook 决策

after_tool_call
  │
  ├─ 根据 toolCallId 关联 pendingCalls
  ├─ 计算 durationMs
  ├─ 结果脱敏、hash、size 计算
  ├─ 判断 completed / error
  ├─ 输出 tool.call.completed 或 tool.call.error
  ├─ 结束 OTel span
  └─ 写入存储 / 指标 / 告警
```

### 6.5 Blocked / Missing After 处理

仅依赖 `after_tool_call` 会有盲区，因为被 `before_tool_call` 阻断、审批超时、进程异常退出时可能没有正常 after 事件。因此设计如下：

```text
pendingCalls[toolCallId] = {
  status: "started",
  startedAt,
  timeoutAt,
  source,
  policyDecision
}
```

后台清理：

| 状态                   | 处理方式                                 |
| -------------------- | ------------------------------------ |
| 正常 after             | 输出 completed / error                 |
| 本插件自己 block          | 立即输出 blocked                         |
| requireApproval deny | 输出 approval_denied / blocked         |
| 超过 TTL 无 after       | 输出 unknown / timeout / maybe_blocked |
| 进程退出仍 pending        | 启动恢复时输出 abandoned                    |

如果要完整知道“是否被其他插件阻断”，仅插件层可能不够，需要在 OpenClaw Hook Runner 或 `toToolDefinitions` MCP fallback 路径增加统一 outcome 事件。这属于 P1 增强项。

### 6.6 OpenClaw OTel 增强

开箱 OTel 依赖诊断事件时会漏掉 MCP。因此 AgentTrace OpenClaw 插件需要在 Hook 中手动创建 MCP span。

Span 设计：

```text
span.name = "agent.tool.call"
span.kind = INTERNAL

attributes:
  agent.runtime = "openclaw"
  agent.id
  session.id
  session.key
  run.id
  tool.call.id
  tool.name
  tool.source = "mcp"
  mcp.server.name
  mcp.tool.name
  mcp.operation
  tool.input.size_bytes
  tool.output.size_bytes
  tool.status
  tool.error.type
  tool.duration_ms
```

Metric 设计：

```text
agent_tool_call_total{runtime, source, server, tool, status}
agent_tool_call_duration_ms_bucket{runtime, source, server, tool}
agent_tool_call_error_total{runtime, source, server, tool, error_type}
agent_tool_call_blocked_total{runtime, source, server, tool, policy}
mcp_server_backoff_total{server}
mcp_rpc_error_total{server, method, code}
```

调研文档也明确建议：生产级 OTel 监控需要结合方案 A，在 Plugin Hook 中手动创建 span；仅使用诊断事件或 OTel 开箱方案无法覆盖 MCP 工具。

## 7. MCP Proxy / Sidecar 方案

### 7.1 设计目的

Agent Hook 能看到“Agent 认为自己调用了什么工具”，但不一定能看到所有协议细节。例如：

```text
MCP server 是否连接成功
tools/list 是否失败
JSON-RPC id 是多少
HTTP status 是多少
stdio stderr 输出是什么
server 是否返回 isError
transport 是否超时
是否进入 backoff
```

因此引入 MCP Proxy / Sidecar，作为跨 Agent 的最大公约数。

### 7.2 部署模式

#### HTTP / SSE / Streamable HTTP

```text
Agent MCP Client
      │
      ▼
AgentTrace MCP Proxy
      │
      ▼
Real MCP Server
```

配置示例：

```json
{
  "mcpServers": {
    "github": {
      "type": "streamable-http",
      "url": "http://agenttrace-proxy/mcp/github"
    }
  }
}
```

#### stdio

```text
Agent
  │
  ├─ command: agenttrace-mcp-proxy --server filesystem --real "npx @modelcontextprotocol/server-filesystem"
  │
  ▼
Proxy Process
  │
  └─ Real MCP Server Process
```

配置示例：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "agenttrace-mcp-proxy",
      "args": [
        "--server", "filesystem",
        "--real-command", "npx",
        "--real-args", "@modelcontextprotocol/server-filesystem,/workspace"
      ]
    }
  }
}
```

### 7.3 Proxy 采集事件

```json
{
  "event_name": "mcp.rpc.request",
  "trace_id": "tr_abc",
  "span_id": "sp_rpc_1",
  "agent_runtime": "openclaw",
  "mcp_server": "github",
  "transport": "streamable-http",
  "jsonrpc_id": "42",
  "method": "tools/call",
  "request_size_bytes": 1240,
  "request_hash": "sha256:...",
  "started_at": "2026-07-07T12:00:00.123Z"
}
```

```json
{
  "event_name": "mcp.rpc.response",
  "trace_id": "tr_abc",
  "span_id": "sp_rpc_1",
  "parent_span_id": "sp_tool_1",
  "mcp_server": "github",
  "method": "tools/call",
  "jsonrpc_id": "42",
  "duration_ms": 842,
  "response_size_bytes": 9352,
  "is_error_result": false,
  "protocol_error_code": null,
  "status": "completed"
}
```

### 7.4 Proxy 与 Hook 事件关联

优先级：

1. 通过 Agent Adapter 注入 `traceparent` / 自定义 header。
2. HTTP MCP 使用 header 传递：`x-agenttrace-trace-id`、`x-agenttrace-run-id`。
3. stdio MCP 通过 Proxy 会话上下文维护当前 Agent、session、run。
4. 无法直接关联时，通过时间窗口、server、tool、jsonrpc id、process id 进行弱关联。

### 7.5 为什么 Proxy 必不可少

| 场景                |    Hook 能否看到 | Proxy 能否看到 |
| ----------------- | -----------: | ---------: |
| Agent 决定调用某工具     |            ✅ |         部分 |
| before 阻断         |            ✅ |          ❌ |
| 工具参数              |            ✅ |          ✅ |
| MCP JSON-RPC id   |            ❌ |          ✅ |
| `tools/list` 失败   |      ❌ / 不稳定 |          ✅ |
| transport timeout |      ❌ / 不完整 |          ✅ |
| server stderr     |            ❌ |          ✅ |
| HTTP status       |            ❌ |          ✅ |
| MCP `isError`     |   结果可见但语义可能弱 |          ✅ |
| server backoff    | 需 runtime 暴露 |    ✅ / 可推断 |

最终建议：**Hook 用来理解 Agent 语义，Proxy 用来兜底协议事实。**

## 8. 统一事件模型

### 8.1 基础字段

```typescript
type AgentTraceBaseEvent = {
  event_id: string;
  event_name: string;
  event_version: "1.0";
  timestamp: string;

  trace_id: string;
  span_id: string;
  parent_span_id?: string;

  tenant_id?: string;
  workspace_id?: string;
  user_id_hash?: string;

  agent_runtime: "openclaw" | "claude_code" | "codex" | "hermes" | "other";
  agent_version?: string;
  agent_id?: string;

  session_id?: string;
  session_key?: string;
  turn_id?: string;
  run_id?: string;
  model_call_id?: string;

  source_adapter: string;
  source_event_name?: string;

  severity?: "debug" | "info" | "warning" | "critical";
};
```

### 8.2 工具调用事件

```typescript
type ToolCallEvent = AgentTraceBaseEvent & {
  event_name:
    | "tool.call.started"
    | "tool.call.completed"
    | "tool.call.error"
    | "tool.call.blocked"
    | "tool.call.approval_requested"
    | "tool.call.approval_decided";

  tool_call_id: string;
  tool_name: string;
  tool_source: "core" | "mcp" | "plugin" | "shell" | "file" | "web" | "browser" | "unknown";
  tool_kind?: string;

  mcp?: {
    server_name?: string;
    safe_server_name?: string;
    tool_name?: string;
    operation?: "tool" | "resources_list" | "resources_read" | "prompts_list" | "prompts_get";
    transport?: "stdio" | "sse" | "streamable-http" | "unknown";
  };

  input?: {
    size_bytes?: number;
    hash?: string;
    summary?: string;
    redaction_applied?: boolean;
    schema_version?: string;
  };

  output?: {
    size_bytes?: number;
    hash?: string;
    summary?: string;
    redaction_applied?: boolean;
    is_error_result?: boolean;
  };

  status: "started" | "completed" | "error" | "blocked" | "unknown";
  duration_ms?: number;

  error?: {
    type?: string;
    message_summary?: string;
    code?: string | number;
    stack_hash?: string;
  };

  policy?: {
    policy_id?: string;
    decision?: "allow" | "deny" | "ask" | "rewrite" | "none";
    reason?: string;
    risk_level?: "low" | "medium" | "high" | "critical";
  };
};
```

### 8.3 MCP RPC 事件

```typescript
type McpRpcEvent = AgentTraceBaseEvent & {
  event_name:
    | "mcp.rpc.request"
    | "mcp.rpc.response"
    | "mcp.rpc.error";

  mcp_server: string;
  transport: "stdio" | "sse" | "streamable-http";
  method: string;
  jsonrpc_id?: string | number;

  request?: {
    size_bytes?: number;
    hash?: string;
    summary?: string;
  };

  response?: {
    size_bytes?: number;
    hash?: string;
    is_error_result?: boolean;
    protocol_error_code?: number;
    protocol_error_message?: string;
  };

  duration_ms?: number;
  status: "started" | "completed" | "error" | "timeout";
};
```

## 9. 高级行为分析能力

### 9.1 行为分析目标

AgentTrace 不只做日志，还要识别“行为模式”。

| 分析能力                | 示例                                                        |
| ------------------- | --------------------------------------------------------- |
| 工具调用链路              | `LLM → github.search → filesystem.write → shell.exec`     |
| 高危工具识别              | 删除文件、外发网络请求、读取密钥路径                                        |
| 参数风险检测              | `/etc/passwd`、`.env`、SSH key、token、生产数据库                  |
| 数据外传检测              | 先 read secret，再调用 HTTP / webhook / browser / github issue |
| 慢调用分析               | 某 MCP Server P95 从 800ms 升到 5s                            |
| 错误聚合                | `github.search_repos` 最近失败率升高                             |
| 工具循环检测              | 同一 tool + 相似参数连续调用 N 次                                    |
| 权限升级检测              | 多次 deny 后尝试同类替代工具                                         |
| Agent 越权检测          | 非授权 Agent 调用生产环境 MCP                                      |
| Prompt-to-tool 因果分析 | 某类 prompt 更容易触发高危工具链                                      |

### 9.2 风险评分模型

```text
risk_score =
  tool_risk_base
+ param_risk
+ output_risk
+ sequence_risk
+ identity_risk
+ environment_risk
+ anomaly_risk
```

示例规则：

| 规则                                             | 风险       |          |
| ---------------------------------------------- | -------- | -------- |
| MCP filesystem 读取 `.env`、`id_rsa`、`kubeconfig` | critical |          |
| 读取敏感文件后 60 秒内调用外部 HTTP 工具                      | critical |          |
| shell 执行 `rm -rf`、`curl                        | sh`      | critical |
| 同一 MCP Server 5 分钟内错误率 > 30%                   | warning  |          |
| 同一工具同参重复调用超过 10 次                              | warning  |          |
| 未授权 Agent 调用生产数据库 MCP                          | critical |          |
| 参数中出现 access token、API key 模式                  | high     |          |
| 调用结果超过 5MB 且进入 LLM 上下文                         | high     |          |

### 9.3 行为规则 DSL

```yaml
rules:
  - id: secret-read-then-egress
    name: 敏感文件读取后外传
    severity: critical
    when:
      sequence:
        - event: tool.call.completed
          where:
            tool_source: "mcp"
            input.summary.regex: "(\\.env|id_rsa|kubeconfig|credentials)"
        - event: tool.call.started
          within: "60s"
          where:
            tool_source_in: ["web", "browser", "mcp"]
            tool_name.regex: "(fetch|http|slack|github|webhook)"
    action:
      - alert
      - require_approval
      - create_finding

  - id: mcp-server-error-spike
    name: MCP Server 错误率突增
    severity: warning
    when:
      metric:
        name: agent_tool_call_error_rate
        group_by: ["mcp.server_name"]
        window: "5m"
        condition: "> 0.3"
    action:
      - alert
```

### 9.4 策略控制能力

| 决策       | 说明                     |
| -------- | ---------------------- |
| allow    | 放行                     |
| deny     | 阻断工具调用                 |
| ask      | 触发人工审批                 |
| rewrite  | 修改参数，例如限制路径、去除敏感字段     |
| redact   | 放行但脱敏日志和结果             |
| shadow   | 只记录不阻断，用于灰度            |
| degrade  | 切换备用 MCP Server 或禁用某工具 |
| annotate | 给模型追加安全上下文或纠错建议        |

## 10. 产品功能设计

### 10.1 总览 Dashboard

核心指标：

```text
工具调用总量
MCP 调用总量
MCP Server 数量
活跃 Agent 数量
失败率
平均耗时 / P95 / P99
高危调用数
阻断数
审批数
Top MCP Server
Top Tool
Top Error
```

### 10.2 Trace 详情页

展示一次 Agent run 的完整链路：

```text
session_start
  ↓
user_prompt
  ↓
model_call_started
  ↓
tool.call.started: github--search_repos
  ↓
mcp.rpc.request: tools/call
  ↓
mcp.rpc.response
  ↓
tool.call.completed
  ↓
model_call_ended
  ↓
agent_end
```

详情字段：

| 类别  | 字段                                                    |
| --- | ----------------------------------------------------- |
| 身份  | user、tenant、workspace、agent、session、run               |
| 模型  | provider、model、tokens、duration                        |
| 工具  | tool source、server、tool、params summary、result summary |
| MCP | method、jsonrpc id、transport、protocol error、isError    |
| 风险  | risk score、命中规则、策略决策                                  |
| 性能  | span duration、P95 对比、重试、超时                            |
| 审计  | 原始事件 ID、存储位置、脱敏状态                                     |

### 10.3 MCP Server 画像页

每个 MCP Server 展示：

```text
server name
transport
工具列表
调用量
成功率
错误率
P50 / P95 / P99
最近错误
最近 backoff
高危调用
调用它的 Agent / 用户 / workspace
schema 变化历史
```

### 10.4 工具治理页

支持：

```text
按工具查看调用量
禁用工具
设置审批规则
设置参数白名单 / 黑名单
设置输出大小上限
设置敏感字段脱敏策略
设置异常告警阈值
查看工具 schema 演进
```

### 10.5 风险发现页

风险发现结构：

```json
{
  "finding_id": "fd_123",
  "severity": "critical",
  "title": "读取敏感文件后外传",
  "trace_id": "tr_abc",
  "evidence_events": ["ev_1", "ev_2"],
  "agent_runtime": "openclaw",
  "session_id": "sess_1",
  "policy_action": "blocked",
  "status": "open"
}
```

### 10.6 审批页

审批内容：

```text
谁发起
哪个 Agent
哪个工具
哪个 MCP Server
参数摘要
风险解释
建议动作
允许一次
允许本会话
允许该规则
拒绝
```

## 11. 数据存储设计

### 11.1 事件表

```sql
CREATE TABLE agenttrace_events (
  event_id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_version TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL,

  trace_id TEXT NOT NULL,
  span_id TEXT NOT NULL,
  parent_span_id TEXT,

  tenant_id TEXT,
  workspace_id TEXT,
  user_id_hash TEXT,

  agent_runtime TEXT NOT NULL,
  agent_version TEXT,
  agent_id TEXT,

  session_id TEXT,
  session_key TEXT,
  turn_id TEXT,
  run_id TEXT,
  model_call_id TEXT,
  tool_call_id TEXT,

  tool_source TEXT,
  tool_name TEXT,
  mcp_server TEXT,
  mcp_tool TEXT,
  mcp_transport TEXT,

  status TEXT,
  duration_ms BIGINT,
  risk_level TEXT,
  policy_decision TEXT,

  payload JSONB NOT NULL
);
```

### 11.2 工具调用事实表

```sql
CREATE TABLE tool_calls (
  tool_call_id TEXT PRIMARY KEY,
  trace_id TEXT NOT NULL,
  run_id TEXT,
  session_id TEXT,

  agent_runtime TEXT NOT NULL,
  agent_id TEXT,

  tool_source TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  mcp_server TEXT,
  mcp_tool TEXT,

  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_ms BIGINT,

  status TEXT NOT NULL,
  error_type TEXT,
  error_message_summary TEXT,

  input_size_bytes BIGINT,
  input_hash TEXT,
  input_summary TEXT,

  output_size_bytes BIGINT,
  output_hash TEXT,
  output_summary TEXT,

  policy_decision TEXT,
  risk_score DOUBLE PRECISION,
  risk_level TEXT
);
```

### 11.3 MCP RPC 表

```sql
CREATE TABLE mcp_rpc_calls (
  rpc_event_id TEXT PRIMARY KEY,
  trace_id TEXT,
  parent_tool_call_id TEXT,

  mcp_server TEXT NOT NULL,
  transport TEXT NOT NULL,
  method TEXT NOT NULL,
  jsonrpc_id TEXT,

  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_ms BIGINT,

  status TEXT NOT NULL,
  protocol_error_code INT,
  protocol_error_message TEXT,
  is_error_result BOOLEAN,

  request_size_bytes BIGINT,
  response_size_bytes BIGINT
);
```

### 11.4 策略与风险表

```sql
CREATE TABLE policy_decisions (
  decision_id TEXT PRIMARY KEY,
  event_id TEXT,
  trace_id TEXT,
  tool_call_id TEXT,

  policy_id TEXT NOT NULL,
  decision TEXT NOT NULL,
  reason TEXT,
  risk_level TEXT,

  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE risk_findings (
  finding_id TEXT PRIMARY KEY,
  trace_id TEXT NOT NULL,
  title TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL,
  rule_id TEXT,
  evidence_event_ids JSONB,
  created_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ
);
```

## 12. 脱敏与安全设计

### 12.1 默认采集策略

默认不保存完整输入输出，只保存：

```text
size_bytes
sha256 hash
结构化摘要
前 N 字符截断
敏感字段替换
schema 类型
```

### 12.2 脱敏规则

默认识别：

```text
API key
Bearer token
JWT
AWS access key
GitHub token
OpenAI key
Anthropic key
SSH private key
数据库连接串
邮箱
手机号
身份证号
银行卡号
.env 内容
kubeconfig
```

### 12.3 内容采集等级

| 等级            | 行为                  |
| ------------- | ------------------- |
| off           | 不采集参数和结果，只采集大小、hash |
| summary       | 保存脱敏摘要              |
| sampled       | 按采样率保存脱敏内容          |
| full_redacted | 保存完整脱敏内容            |
| full_raw      | 仅安全白名单环境可开启         |

### 12.4 权限控制

```text
普通研发：只能看摘要和指标
服务 owner：可看自己 MCP Server 的脱敏明细
安全管理员：可看风险证据
审计管理员：可导出审计报告
平台管理员：可配置策略和保留周期
```

## 13. 跨 Agent 兼容方案

### 13.1 兼容原则

```text
不要让行为分析直接依赖某个平台的 Hook 名称。
每个 Agent 只负责把原生事件转成统一事件。
MCP Proxy 作为跨 Agent 的协议层兜底。
非 MCP 工具通过各自 Hook 或系统层 sensor 补齐。
```

### 13.2 OpenClaw Adapter

| 能力       | 实现                                          |
| -------- | ------------------------------------------- |
| 工具开始     | `before_tool_call`                          |
| 工具完成     | `after_tool_call`                           |
| 模型调用     | `model_call_started/ended`                  |
| LLM 输入输出 | `llm_input/output`                          |
| MCP 识别   | `serverName--toolName` 或 `PluginToolMeta`   |
| OTel     | Hook 内手动创建 span                             |
| 盲区       | 其他插件阻断后的 outcome 需要增强事件或 pending timeout 推断 |

### 13.3 Claude Code Adapter

Claude Code 适配：

| Claude Code          | AgentTrace                     |
| -------------------- | ------------------------------ |
| `PreToolUse`         | `tool.call.started`            |
| `PostToolUse`        | `tool.call.completed`          |
| `PostToolUseFailure` | `tool.call.error`              |
| `PermissionRequest`  | `tool.call.approval_requested` |
| `PermissionDenied`   | `tool.call.blocked`            |
| `PostToolBatch`      | `tool.batch.completed`         |
| `Elicitation`        | `mcp.elicitation.requested`    |
| `ElicitationResult`  | `mcp.elicitation.completed`    |

Claude Code 的 MCP 工具命名模式为 `mcp__<server>__<tool>`，因此 Adapter 可以稳定解析 `server` 和 `tool`。([Claude][1])

### 13.4 Codex Adapter

Codex 适配：

| Codex               | AgentTrace                                |
| ------------------- | ----------------------------------------- |
| `PreToolUse`        | `tool.call.started` / `tool.call.blocked` |
| `PermissionRequest` | `tool.call.approval_requested`            |
| `PostToolUse`       | `tool.call.completed` / `tool.call.error` |
| `SubagentStart`     | `subagent.started`                        |
| `SubagentStop`      | `subagent.ended`                          |
| `UserPromptSubmit`  | `user.prompt.submitted`                   |

注意：Codex 官方文档明确说明，`PreToolUse` / `PostToolUse` 当前覆盖 Bash、`apply_patch` 和 MCP tool calls，但不完整覆盖所有 shell、`WebSearch` 或其他非 shell、非 MCP 工具，因此 Codex 适配必须配合 MCP Proxy 与系统层 sensor。([OpenAI 开发者][2])

### 13.5 Hermes Adapter

Hermes 适配：

| Hermes             | AgentTrace                                |
| ------------------ | ----------------------------------------- |
| `pre_tool_call`    | `tool.call.started`                       |
| `post_tool_call`   | `tool.call.completed` / `tool.call.error` |
| `pre_llm_call`     | `llm.call.started` / context injection    |
| `post_llm_call`    | `llm.call.ended`                          |
| `on_session_start` | `session.started`                         |
| `on_session_end`   | `session.ended`                           |
| `subagent_stop`    | `subagent.ended`                          |

Hermes 文档显示 MCP tools 会被发现并注册，运行时工具派发经过 plugin pre-hook 和 post-hook，因此可以用 Adapter 方式接入。([Hermes Agent][3])

### 13.6 其他 Agent

对于其他 Agent：

| Agent 能力                 | 接入策略                             |
| ------------------------ | -------------------------------- |
| 有 before/after tool hook | 写 Adapter                        |
| 只有 MCP 支持                | 通过 MCP Proxy 覆盖 MCP 调用           |
| 只有 shell 工具              | 用 shell wrapper / sandbox sensor |
| 只有日志                     | 日志 parser 作为低保真 Adapter          |
| 无任何扩展点                   | 只能依赖协议代理和系统层观测                   |

## 14. API 设计

### 14.1 查询工具调用

```http
GET /api/v1/tool-calls?runtime=openclaw&mcp_server=github&status=error&from=...&to=...
```

返回：

```json
{
  "items": [
    {
      "tool_call_id": "tc_123",
      "trace_id": "tr_abc",
      "agent_runtime": "openclaw",
      "tool_source": "mcp",
      "mcp_server": "github",
      "mcp_tool": "search_repos",
      "status": "error",
      "duration_ms": 1240,
      "started_at": "2026-07-07T12:00:00Z"
    }
  ],
  "next_cursor": "..."
}
```

### 14.2 查询 Trace

```http
GET /api/v1/traces/{trace_id}
```

返回：

```json
{
  "trace_id": "tr_abc",
  "session_id": "sess_1",
  "run_id": "run_1",
  "spans": [
    {
      "span_id": "sp_model_1",
      "name": "llm.call",
      "duration_ms": 2200
    },
    {
      "span_id": "sp_tool_1",
      "parent_span_id": "sp_model_1",
      "name": "tool.call",
      "tool_name": "github--search_repos",
      "duration_ms": 842
    }
  ]
}
```

### 14.3 策略决策接口

```http
POST /api/v1/policy/evaluate
```

请求：

```json
{
  "event_name": "tool.call.started",
  "agent_runtime": "openclaw",
  "tool_source": "mcp",
  "tool_name": "filesystem--read_file",
  "mcp_server": "filesystem",
  "mcp_tool": "read_file",
  "input_summary": "{\"path\":\"/etc/passwd\"}",
  "session_id": "sess_1",
  "agent_id": "agent_main"
}
```

返回：

```json
{
  "decision": "deny",
  "risk_level": "critical",
  "policy_id": "block-sensitive-system-path",
  "reason": "禁止读取系统敏感路径"
}
```

### 14.4 上报事件接口

```http
POST /api/v1/events
```

用于 Adapter、Proxy、系统 sensor 上报统一事件。

## 15. 告警设计

### 15.1 告警规则

| 告警                 | 条件                        | 等级       |
| ------------------ | ------------------------- | -------- |
| MCP Server 错误率突增   | 5 分钟错误率 > 30% 且调用数 > 20   | warning  |
| MCP Server 全部失败    | 连续 10 次失败                 | critical |
| 慢调用突增              | P95 超过历史均值 3 倍            | warning  |
| 高危工具调用             | 命中 critical 策略            | critical |
| 敏感读取后外传            | 命中序列规则                    | critical |
| 未授权 Agent 调用       | Agent 不在 server allowlist | critical |
| Hook 数据缺失          | started 后超时无 completed    | warning  |
| Proxy 与 Hook 数据不一致 | RPC 存在但 tool event 缺失     | warning  |

### 15.2 告警输出

```text
Slack / 飞书 / 邮件
Webhook
PagerDuty / Opsgenie
Jira / 工单系统
安全事件平台
```

告警内容必须包含：

```text
trace_id
agent_runtime
session_id
run_id
mcp_server
tool_name
status
duration
error_summary
risk_reason
dashboard_url
```

## 16. 部署方案

### 16.1 Lite 模式：OpenClaw 插件

适合快速修复 OpenClaw MCP 盲区。

```text
OpenClaw
  └─ agenttrace-openclaw plugin
       ├─ before_tool_call
       ├─ after_tool_call
       ├─ JSONL
       └─ OTel manual span
```

优点：

```text
实施快
侵入低
能覆盖 OpenClaw MCP 工具调用
```

不足：

```text
协议层细节不足
跨 Agent 不覆盖
其他插件阻断 outcome 可能需要推断
```

### 16.2 Standard 模式：插件 + MCP Proxy + OTel

适合生产运维。

```text
OpenClaw / Other Agent
  ├─ Agent Adapter
  └─ MCP Proxy
       └─ AgentTrace Collector
            ├─ DB
            ├─ OTel
            └─ Dashboard
```

优点：

```text
同时有 Agent 语义和 MCP 协议事实
支持 Dashboard 和告警
具备跨 Agent 扩展能力
```

### 16.3 Enterprise 模式：多 Agent + 行为分析 + 策略控制

适合平台化治理。

```text
OpenClaw Adapter
Claude Code Adapter
Codex Adapter
Hermes Adapter
MCP Proxy Fleet
System Sensor
Policy Engine
Behavior Analysis
SIEM / SOC / OTel / BI
```

优点：

```text
跨 Agent 统一治理
支持风险评分和审批
支持安全审计和合规
```

## 17. 配置设计

### 17.1 AgentTrace 配置

```yaml
agenttrace:
  enabled: true

  runtime:
    name: openclaw
    adapter: openclaw-plugin

  capture:
    input:
      mode: summary
      max_bytes: 4096
      hash: true
      redact: true
    output:
      mode: summary
      max_bytes: 4096
      hash: true
      redact: true

  mcp:
    detect:
      name_patterns:
        - "serverName--toolName"
        - "mcp__server__tool"
      plugin_meta: true
    proxy:
      enabled: true
      capture_tools_list: true
      capture_tools_call: true
      capture_resources: true
      capture_prompts: true

  policy:
    enabled: true
    mode: shadow
    endpoint: "http://agenttrace-policy:8080/api/v1/policy/evaluate"

  sinks:
    jsonl:
      enabled: true
      path: "/var/log/agenttrace/events.jsonl"
    otel:
      enabled: true
      endpoint: "http://otel-collector:4318"
      protocol: "http/protobuf"
    database:
      enabled: true
      dsn: "${AGENTTRACE_DB_DSN}"

  privacy:
    raw_content_enabled: false
    redact_secrets: true
    user_id_hash_salt_env: "AGENTTRACE_HASH_SALT"

  reliability:
    queue_size: 10000
    flush_interval_ms: 1000
    pending_call_ttl_ms: 300000
    fail_open: true
```

### 17.2 策略配置

```yaml
policies:
  - id: block-sensitive-path
    enabled: true
    match:
      tool_source: mcp
      input_regex: "(/etc/passwd|\\.env|id_rsa|kubeconfig)"
    decision: ask
    severity: critical

  - id: readonly-github-default
    enabled: true
    match:
      mcp_server: github
      mcp_tool_regex: "^(create|delete|update|merge|close).*"
    decision: ask
    severity: high

  - id: block-production-db-for-non-prod-agent
    enabled: true
    match:
      mcp_server: prod-db
      agent_id_not_in:
        - sre-agent
        - db-admin-agent
    decision: deny
    severity: critical
```

## 18. 性能与可靠性设计

### 18.1 性能目标

| 项目               | 目标                  |
| ---------------- | ------------------- |
| Hook before 额外耗时 | P95 < 10ms，不含远程策略审批 |
| Hook after 额外耗时  | P95 < 5ms           |
| 本地队列吞吐           | 单实例 ≥ 1000 events/s |
| JSONL 落盘延迟       | P95 < 1s            |
| OTel export 延迟   | P95 < 5s            |
| Proxy 额外耗时       | P95 < 20ms          |
| 事件丢失率            | 正常退出 < 0.1%         |
| 采集失败策略           | fail-open，不影响工具主链路  |

### 18.2 可靠性策略

```text
本地内存队列 + 批量 flush
JSONL fallback
OTel / DB 写入失败自动重试
队列满时按策略丢弃 debug 事件，保留 critical 事件
pending call TTL 自动补偿 unknown 事件
Collector 不可用时不阻断 Agent
策略引擎不可用时按配置 fail-open / fail-closed
```

### 18.3 背压策略

| 情况            | 行为                   |
| ------------- | -------------------- |
| DB 慢          | 切 JSONL fallback     |
| OTel 慢        | 批量重试，超过阈值降采样         |
| 队列满           | 丢弃低优先级事件             |
| critical 风险事件 | 永不采样丢弃，优先落盘          |
| Proxy 压力过大    | 降级只记录 metadata，不记录摘要 |

## 19. OpenClaw 源码增强建议

P0 可以只做插件，但为了长期完整性，建议增加两个小增强。

### 19.1 MCP inline fallback 补诊断事件

在 `toToolDefinitions` inline fallback 路径补齐：

```text
tool.execution.started
tool.execution.completed
tool.execution.error
tool.execution.blocked
```

这样 MCP 工具和内建工具在诊断事件层也一致。

### 19.2 Hook outcome 统一事件

新增 Hook outcome 事件：

```text
tool.hook.before.completed
```

字段：

```json
{
  "toolCallId": "...",
  "toolName": "...",
  "outcome": "allow|block|approval_requested|error",
  "pluginId": "...",
  "reason": "..."
}
```

这样可以解决“监控插件先记录 started，但后续其他插件 block 后没有 after”的可观测问题。

## 20. 实施路线

### 阶段 0：验证版

目标：证明 OpenClaw MCP 工具调用可以被看见。

交付：

```text
agenttrace-openclaw 插件
before_tool_call / after_tool_call 采集
MCP 工具识别
JSONL 日志
基础统计 CLI
```

验收：

```text
调用 fetch MCP 工具后，JSONL 中出现 started + completed/error
字段包含 serverName、toolName、toolCallId、runId、durationMs、status
本地 exec/write/edit/read 仍正常记录
```

### 阶段 1：生产版 OpenClaw

目标：OpenClaw MCP 调用具备生产可观测性。

交付：

```text
OTel manual span
PostgreSQL / ClickHouse 写入
基础 Dashboard
错误率 / 慢调用告警
参数和结果脱敏
pending call timeout 补偿
```

验收：

```text
Grafana 可看到 MCP Server 调用量、失败率、P95/P99
Trace 中能串联 session → run → model call → tool call
MCP 调用失败时可定位 server、tool、error、duration
```

### 阶段 2：MCP Proxy

目标：补齐协议层事实。

交付：

```text
HTTP / SSE / streamable-http proxy
stdio proxy
tools/list / tools/call 采集
JSON-RPC id 关联
transport timeout / protocol error 采集
server health 状态
```

验收：

```text
即使 Agent Hook 缺失，MCP Proxy 仍能记录 tools/call
能区分 tool result isError 与 MCP protocol error
能看到 tools/list 失败和 transport timeout
```

### 阶段 3：多 Agent Adapter

目标：兼容 Hermes、Claude Code、Codex。

交付：

```text
Claude Code Adapter
Codex Adapter
Hermes Adapter
统一 naming parser
统一事件 SDK
```

验收：

```text
Claude Code 的 mcp__server__tool 被解析为 mcp.server + mcp.tool
Codex 的 PreToolUse/PostToolUse 可转成 tool.call.started/completed
Hermes 的 pre_tool_call/post_tool_call 可转成统一事件
不同 Agent 的事件能进入同一 Dashboard
```

### 阶段 4：高级行为分析与策略

目标：从“看见调用”升级为“理解行为、发现风险、自动治理”。

交付：

```text
风险规则引擎
工具序列分析
敏感数据外传检测
审批流
策略灰度
风险发现页
```

验收：

```text
敏感文件读取后外传能生成 critical finding
高危 MCP 调用可触发 ask / deny
慢调用和错误率异常可自动告警
```

## 21. 验收标准

### 21.1 功能验收

| 编号  | 验收项               | 标准                                                                 |
| --- | ----------------- | ------------------------------------------------------------------ |
| A1  | OpenClaw MCP 调用可见 | `fetch`、`github`、`filesystem` 等 MCP 工具调用均有 started/completed/error |
| A2  | 字段完整              | server、tool、toolCallId、runId、session、agent、duration、status 全部存在    |
| A3  | 错误可检索             | 可按 server、tool、error_type 查询失败                                     |
| A4  | 慢调用可观测            | 可查看 P50/P95/P99                                                    |
| A5  | Trace 可串联         | session → run → model → tool → mcp rpc 可串联                         |
| A6  | OTel 可展示          | Jaeger / Tempo / Grafana 中可看到 MCP tool span                        |
| A7  | 数据脱敏              | token、key、secret 不出现在明文日志                                          |
| A8  | 策略可用              | 高危参数可触发 deny / ask                                                 |
| A9  | Proxy 可用          | MCP `tools/call` 在 proxy 层可见                                       |
| A10 | 多 Agent 可扩展       | 至少 OpenClaw + 一个外部 Agent 接入统一事件模型                                  |

### 21.2 性能验收

| 编号 | 指标          | 标准                    |
| -- | ----------- | --------------------- |
| P1 | Hook 额外耗时   | P95 < 10ms            |
| P2 | Proxy 额外耗时  | P95 < 20ms            |
| P3 | 事件写入延迟      | P95 < 5s              |
| P4 | Agent 主链路影响 | Collector 故障时工具调用不受影响 |
| P5 | 数据丢失        | 正常运行事件丢失率 < 0.1%      |

### 21.3 安全验收

| 编号 | 验收项     | 标准                           |
| -- | ------- | ---------------------------- |
| S1 | 默认不保存原文 | 默认 summary + hash            |
| S2 | 敏感信息脱敏  | 常见 token / key / secret 自动替换 |
| S3 | 权限隔离    | 非授权用户不能查看跨 workspace 明细      |
| S4 | 审计不可篡改  | JSONL / DB 事件包含 hash 和事件 ID  |
| S5 | 策略留痕    | 每次 allow / deny / ask 均可审计   |

## 22. 风险与应对

| 风险               | 说明                                                       | 应对                                        |
| ---------------- | -------------------------------------------------------- | ----------------------------------------- |
| Hook after 缺失    | 工具被阻断、进程退出时无 after                                       | pending TTL + blocked 事件 + 源码增强           |
| 其他插件先阻断          | 监控插件可能拿不到事件                                              | 调整 Hook 优先级；P1 增加 Hook outcome            |
| MCP 命名不统一        | OpenClaw `server--tool`，Claude/Codex `mcp__server__tool` | Adapter 内置 parser                         |
| 原始结果过大           | 大结果影响存储和性能                                               | 默认只存摘要、大小、hash                            |
| 敏感数据泄露           | 参数和结果可能含 secret                                          | 默认脱敏、禁止 raw、权限隔离                          |
| Codex Hook 覆盖不完整 | 官方文档说明部分工具路径不被 Hook 覆盖                                   | MCP Proxy + shell wrapper + system sensor |
| Proxy 引入延迟       | 所有 MCP 请求经过代理                                            | 异步采集、低开销转发、可旁路                            |
| 策略误杀             | deny 影响正常任务                                              | shadow 灰度、ask 审批、规则回放                     |
| 多 Agent 字段差异     | session、run、tool id 不统一                                  | 统一事件模型允许 optional + synthetic id          |

## 23. 推荐最终落地形态

最终推荐采用三件套：

```text
1. OpenClaw Plugin Hook Adapter
   解决 OpenClaw MCP 工具调用不可见问题。

2. MCP Proxy / Sidecar
   解决跨 Agent、跨协议、transport、JSON-RPC、server health 可观测问题。

3. Unified Event + Policy + Behavior Analysis Platform
   解决多 Agent 统一分析、审计、风控、告警、Dashboard 问题。
```

落地优先级：

```text
P0：OpenClaw 插件，立即修复 MCP 调用不可见。
P1：手动 OTel span + Dashboard，形成生产可观测。
P2：MCP Proxy，补齐协议层和跨 Agent 兜底。
P3：Claude Code / Codex / Hermes Adapter，统一多 Agent。
P4：行为分析和策略控制，升级为治理平台。
```

## 24. 最终结论

这个方案的核心判断是：

**OpenClaw 内部不要再依赖诊断事件或开箱 OTel 来监控 MCP 工具，而应以 `before_tool_call + after_tool_call` Plugin Hook 为主采集点。** 调研已经证明 MCP 工具虽然会进入 Plugin Hook，但不会发射 `tool.execution.*` 诊断事件，因此现有诊断事件链路和开箱 OTel 会漏掉 MCP。

**跨 Agent 不要试图复用 OpenClaw 的 Hook 名称，而要复用统一事件模型。** Claude Code、Codex、Hermes 都有各自 Hook 体系，但命名、字段、覆盖范围不同；通过 Adapter 归一化为 `tool.call.started/completed/error/blocked` 才能做统一分析。([Claude][1])

**跨 MCP 生态的最大公约数是 MCP Proxy。** 因为 MCP 是标准协议，且工具调用、工具列表、调用结果、错误语义都可以在协议层观测；Proxy 可以弥补各 Agent Hook 覆盖差异，是兼容 Hermes、Claude Code、Codex 和未来其他 Agent 的关键。([Model Context Protocol][4])

最终产品形态应是：

```text
Agent Hook Adapter 负责语义
MCP Proxy 负责协议事实
Unified Event Model 负责归一化
Policy Engine 负责治理
Behavior Analysis 负责高级风险识别
OTel / DB / Dashboard 负责生产可观测
```

这样既能解决 OpenClaw 当前 MCP 监控盲区，也能演进为面向多智能体、多工具生态的统一可观测与安全治理平台。

[1]: https://code.claude.com/docs/en/hooks "Hooks reference - Claude Code Docs"
[2]: https://developers.openai.com/codex/hooks "Hooks – Codex | OpenAI Developers"
[3]: https://hermes-agent.nousresearch.com/docs/developer-guide/tools-runtime "Tools Runtime | Hermes Agent"
[4]: https://modelcontextprotocol.io/specification/2025-11-25 "Specification - Model Context Protocol"
[5]: https://modelcontextprotocol.io/specification/2025-06-18/schema "Schema Reference - Model Context Protocol"
[6]: https://opentelemetry.io/docs/specs/otlp/?utm_source=chatgpt.com "OTLP Specification 1.10.0"
