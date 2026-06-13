---
layout: post
title: "Trajeckt：面向 AI Agent 的轨迹级运行时强制安全网关"
categories: [sec]
tags: [ai-agent, security, gateway, runtime-enforcement, mcp, trajectory, fail-closed]
description: "Trajeckt 是一个面向 AI Agent 的 fail-closed 安全网关，延迟仅 1.7ms。它通过轨迹级运行时强制机制，按工具调用的序列位置而非静态白名单决定 allow/block，拦截跨步骤的序列攻击。"
---

2026 年 6 月，一个名为 **Trajeckt** 的项目在 Hacker News 上以 Show HN 形式发布，迅速引起了 Agent 安全社区的关注。它的核心主张简单而有力：

> **单个工具调用很少是问题——序列才是。**

当前几乎所有 Agent 护栏都在逐个检查工具调用（静态白名单），但那些**跨步骤才显现的失败模式**轻松绕过。Trajeckt 在运行时、模型下层、任何不可逆操作触发之前，**强制 Agent 遵守整个轨迹（trajectory）的承诺**。

## 问题：单步检查的盲区

假设一个 Agent 被授予了以下工具的访问权限：`crm.read`、`invoices.read`、`email.send`、`report.write`。

在一个正常的白名单方案中，这四个工具都被允许。但问题是——**允许的上下文被忽略了**。

- `email.send` 在数据收集完成后发送报告 → ✅ 合理
- `email.send` 在读取完发票后立即外发数据 → ❌ 数据泄露

**静态白名单无法区分这两个场景。** 而 Trajeckt 的方案是：Agent 在开始执行前声明计划（Plan），后续每个工具调用必须严格遵循声明的序列位置，否则立即阻断。

## Trajeckt 的核心原理

```
声明计划：crm.read → invoices.read → report.write

执行轨迹：
  crm.read · allowed            ✓
  invoices.read · allowed       ✓
  email.send · BLOCKED          ✗ (off-plan: no valid transition)
  report.write · allowed        ✓
```

关键洞察是：**同样的工具，在计划内允许，脱离计划则阻断。**

### 四个能力支柱

| 能力 | 说明 |
|------|------|
| **Enforce**（强制） | 每个工具调用在执行前都对照声明计划检查。序列位置决定 allow/block。 |
| **Observe**（观察） | 每次执行创建结构化的决策时间线，包含所有状态转换和结果。 |
| **Investigate**（调查） | 可回放任意运行，追踪每个决策点，无需从原始日志重建。 |
| **Benchmark**（基准） | 所有数据源自固定基准运行，基于真实任务而非模拟场景。 |

## 基准性能数据

来自基准运行 `run-20260604-152135`：

- ✅ **100% 探测攻击被阻断**
- ✅ **96.7% 计划内调用被允许**（低误报）
- ✅ **<3ms p95 延迟**
- ✅ **20/20 规划验证通过**

单次强制检查延迟仅 **1.7ms**，这个数字意味着网关对 Agent 推理流程的影响几乎不可感知。

## 为什么是"轨迹级"而非"单步级"

传统 Agent 安全方案的推理逻辑是：

> 工具 X 是否在允许列表中？→ 是 → 放行

Trajeckt 的推理逻辑是：

> 在这个声明计划中，当前位置是否允许调用工具 X？→ 否 → 阻断（附带原因码）

Trajeckt 定义了三种阻断原因：

| 阻断码 | 含义 |
|--------|------|
| `no_valid_transition_in_declared_plan` | 该步骤不是从当前位置合法的转换 |
| `requires_human_approval` | 高风险工具，需要人工审批 |
| `plan_enforced` | 计划执行完成，阻断违规步骤 |

每个阻断决策都附带完整的原因链，可导出为 JSON 审计记录。

## 集成方式：网关而非库

Trajeckt 以**网关**形式工作，不侵入 Agent 代码。支持以下协议栈：

### MCP 集成（Claude Desktop）

```json
{
  "mcpServers": {
    "trajeckt": {
      "type": "streamable-http",
      "url": "https://gateway.trajeckt.com/mcp",
      "headers": {
        "Authorization": "Bearer <api-key>"
      }
    }
  }
}
```

### Claude Agent SDK

```python
agent = client.beta.agents.create(
    name="my-agent",
    model="claude-opus-4-8",
    mcp_servers=[{
      "type": "url",
      "name": "trajeckt",
      "url": "https://gateway.trajeckt.com/mcp"
    }]
)
```

### LangChain / LangGraph

```python
from langchain_openai import ChatOpenAI
llm = ChatOpenAI(
    base_url="https://gateway.trajeckt.com/v1",
    api_key="your-api-key"
)
```

### OpenAI SDK

```python
from openai import OpenAI
client = OpenAI(
    base_url="https://gateway.trajeckt.com/v1",
    api_key="your-api-key"
)
```

所有 Agent 到工具的流量都经过 Trajeckt 网关，在底层完成计划检查、审计追踪和审批流程。

## 技术实现细节

### "计划"的表示

Agent 在开始执行前声明一个计划——一个有序的步骤序列。每个步骤指定要调用的工具及其预期上下文。Trajeckt 将计划维护为一个**有限状态机（FSM）**：

- 状态 = 计划中的当前位置
- 转换 = 从当前状态到下一步的合法工具调用
- 违规 = 任何不符合 FSM 转换的工具调用

### 执行时间线

每次执行生成的结构化记录包含：

```
timestamp | plan_position | tool_call | decision | reason_code | duration_ms
```

这些记录可以直接导出为 JSON，用于审计、调试和合规报告。

### Demo 回放环境

Trajeckt 提供了一个在线回放环境，用户可以注入恶意文档到 Agent 工作流中，亲眼看到：
- 计划内操作如何通过
- 偏离计划的恶意步骤如何被实时阻断
- 同样的工具在不同位置的不同结果

## 行业意义

Trajeckt 展示了一个重要的安全范式转变：**从"允许什么工具"到"何时允许使用这个工具"**。

在 AI Agent 规模化部署的背景下，这意味着：

1. **运行时安全可以从架构层面实现**，而不只是依赖 Agent 自身的安全设计
2. **轻量级网关模式**（1.7ms 延迟）证明安全性不必然以性能为代价
3. **序列级检查**填补了现有静态白名单方案的根本盲区

Trajeckt 与其他 Agent 安全方案（如 Azure Container Apps 沙箱的硬件级隔离）形成了互补——沙箱在宿主级隔离进程，Trajeckt 在应用级控制工具调用权限。

---

*参考资料：*
- [Trajeckt 官网](https://traject.tamor.ai/)
- [Hacker News Show HN](https://news.ycombinator.com/)（搜索 "trajeckt"）
- 项目联系方式：sandipgyawali100@gmail.com
