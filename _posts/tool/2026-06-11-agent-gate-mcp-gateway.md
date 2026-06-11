---
layout: post
categories: [tool]
title: "agent-gate：一个MCP服务器，让AI Agent学会『自检』再说『完成』"
tags: [开源, MCP, AI Agent, 安全, 工具, Python, GitHub]
description: "agent-gate 是一个作为 MCP 服务器运行的 AI Agent 网关，实现 fail-closed 确定性检查和防篡改凭证。Agent 必须通过全部五项检查才能声称工作完成，每笔决策记录不可篡改。"
---

## agent-gate 是什么

**agent-gate** 是一个作为 MCP（Model Context Protocol）服务器运行的 AI Agent 网关工具。它解决了一个很具体的问题：**如何让 Agent 在说"做完了"之前，真实地自我验证一遍。**

项目由 Jeff Otterson（GitHub: [Jott2121](https://github.com/Jott2121)）开源，MIT 协议。

> 项目地址：[https://github.com/Jott2121/agent-gate](https://github.com/Jott2121/agent-gate)

## 为什么需要它

Agent 系统中最昂贵的失败不是明显的崩溃，而是**沉默的错误**：

- 模型更新后输出质量悄悄下降
- 代码改动无声地打破了之前能跑的工作流
- Agent 宣布任务完成，但工作成果经不起推敲

传统的做法是让 Agent 自己"检查"自己——但 Agent 自己改自己的作业，结果可想而知。

agent-gate 的思路是：不靠 Agent 的自觉，靠数据结构和协议来约束。把一套**确定性检查清单**通过 MCP 工具暴露给 Agent，Agent 必须调用工具并提交可验证的证据，才能通过关卡。

## 核心设计

### Fail-Closed（故障关闭）

这是最核心的原则。一条检查项只有被**显式满足**才算通过。缺失证据等于不通过。

```text
agent: "done!"  ->  verify_gate(evidence)  ->  { passed: false, blocking: ["independent_refute_review", "no_secrets"] }
```

和传统安全检查（promotion gate）逻辑一致，不是 Agent 说"没问题"就没问题。

### 防篡改凭证（Tamper-Evident Receipts）

每一条决策记录都被写入一个 **SHA-256 哈希链**：

```
(decision, metric, value, verdict) → sha256 → 链接到下一条
```

任何人（包括 Agent 自己）事后修改或删除任何一条记录，`verify_chain()` 都会返回 False。日志的完整性不靠"诚信"，靠数据结构。

### 默认关卡：Ship Gate

内置的默认检查清单包含五项，缺一不可：

| 检查项 | 含义 |
|--------|------|
| `deterministic_checks_pass` | 确定性检查（如测试、lint）通过 |
| `independent_refute_review` | 经过独立的反驳性审查 |
| `no_secrets` | 输出中不含密钥/凭证 |
| `human_gated_if_irreversible` | 任何不可逆/对外操作需人类批准 |
| `honest_receipt_logged` | 本次决策已写入凭证日志 |

Agent 必须逐条提交证据，少一条就直接卡住。

## 如何使用

### 安装

```bash
pip install mcp-agent-gate
```

### 配置到 MCP 客户端

在 Claude Desktop / Claude Code 的 MCP 配置中添加：

```json
{
  "mcpServers": {
    "agent-gate": { "command": "python", "args": ["-m", "agent_gate.server"] }
  }
}
```

之后 Agent 就可以调用 `verify_gate(...)` 来验证自己的输出，凭证持久化到 `~/.agent-gate/receipts.jsonl`。

### 提供的工具

| 工具 | 作用 |
|------|------|
| `gate_checklist(name="ship")` | 返回 Agent 必须通过的检查清单 |
| `verify_gate(evidence, name="ship")` | **故障关闭式**评估，返回通过/卡住 |
| `record_receipt(decision, metric, value, verdict)` | 写入哈希链凭证 |
| `read_receipts()` | 读取全部凭证，同时验证链完整性 |

### 直接使用（无需 MCP 客户端）

```python
from agent_gate.gate import DEFAULT_SHIP_GATE
from agent_gate.ledger import Ledger

# Agent 提交了 4 项证据，缺了 honest_receipt_logged
res = DEFAULT_SHIP_GATE.evaluate({
    "deterministic_checks_pass": True,
    "independent_refute_review": True,
    "no_secrets": True,
    "human_gated_if_irreversible": True,
})
print(res.passed, res.blocking)  # False ['honest_receipt_logged']

# 写入哈希链凭证
led = Ledger("receipts.jsonl")
led.append(decision="ship v0.1", metric="tests", value="pass", verdict="shipped")
print(led.verify_chain())  # True
```

## 设计亮点

### 纯标准库核心

`agent_gate/gate.py`（故障关闭检查清单）和 `agent_gate/ledger.py`（哈希链凭证）**零运行时依赖**，纯 Python 标准库实现。`agent_gate/server.py` 是唯一的 MCP 适配层，依赖 `mcp` 包。

### 测试覆盖

CI 覆盖 Python 3.11-3.13，MCP 工具通过实际调用测试（不仅仅是 import 测试）。

### 所属工具链

agent-gate 是 Jeff Otterson 的 AI Agent 基础设施系列的一部分，同系列还包括：

- **[bow](https://github.com/Jott2121/bow)** — 全自主 Claude 幕僚长 Agent
- **[fleet-mode](https://github.com/Jott2121/fleet-mode)** — Agent 编排架构
- **[rag-guard](https://github.com/Jott2121/rag-guard)** — RAG 安全护栏
- **[agent-cost-attribution](https://github.com/Jott2121/agent-cost-attribution)** — Agent 成本归因

## 场景思考

agent-gate 解决的不是"Agent 不够聪明"的问题，而是**"Agent 太自信"**的问题。

当一个模型自我评估时，往往会高估自己输出的质量——这是当前 AI 系统的固有缺陷。agent-gate 的做法是绕过这个缺陷：不让 Agent 做自己的裁判，而是让它面对一个它无法绕过的检查清单和一个它无法篡改的日志。

对于把 Agent 系统推向生产环境的人来说，这比又一个"更聪明的模型"更解渴。安全基础设施正在以 MCP 协议为纽带快速补全，而 fail-closed 设计正是企业级部署中缺失的那一环。

---

**参考链接：**
- GitHub 仓库：[https://github.com/Jott2121/agent-gate](https://github.com/Jott2121/agent-gate)
- MCP 协议：[https://modelcontextprotocol.io/](https://modelcontextprotocol.io/)
- 作者相关项目：[bow](https://github.com/Jott2121/bow) · [fleet-mode](https://github.com/Jott2121/fleet-mode) · [rag-guard](https://github.com/Jott2121/rag-guard)
