---
layout: post
title: "Token-saviour：给 AI Agent 装一个'省 Token 模式'，实测节省 70%"
categories: [sec]
tags: [token-saviour, agent-security, token-efficiency, agent-cost, open-source, skill]
description: "Token-saviour 是一个开源 Agent 技能，通过把工具调用按'四层成本模型'智能路由，将 Agent 的 Token 消耗降低约 70%。实测 code-read 层用语义检索替代全文件读取，单次调用从 3,250 降到 243 Token。"
---

如果说前几天的 [658 倍成本注入攻击](/sec/ai-agent-cost-injection-attack-658x.html) 揭示了 **Agent 能烧掉多少钱**，那么 Token-saviour 回答的是另一个问题：**Agent 本来该花多少钱**。

2026 年 6 月 15 日，开发者 **@vagkaratzas** 发布了一个名为 **Token-saviour** 的开源 Agent 技能（skill），直接瞄准了 Agent 工具选择中的 Token 浪费问题。它的核心主张非常明确：

> 读一整份文件来回答一个窄问题，是 Agent 最浪费的行为。没有之一。

## 四层成本模型：找到 Token 到底花在哪

Token-saviour 最值得关注的不是某个具体的优化技巧，而是它提出的**四层成本模型**——Token 消耗不是一锅粥，而是由四条独立的"成本层"组成：

| 成本层 | 描述 | 对应工具 |
|--------|------|---------|
| **Code-read 输入** | 理解代码：符号查找、调用者追踪、调用路径、架构分析 | **serena** 或 **graphify** |
| **命令输出输入** | 冗长的 stdout：测试、构建、git、grep、目录列表 | **rtk** |
| **生成输出** | Agent 自己写的长篇回复 | **caveman**（精简回复风格） |
| 小任务 | 单文件、单行查找 | **直接用 Read/Grep/Bash** |

这个模型的洞察是：**每一层都有不同的工具来优化，但之前没人把它们分层对待**。Agent 发现需要理解代码就直接读文件，测试输出太长也读文件——这两种场景的 Token 浪费原理完全不同，却用同一个粗暴方式处理。

## 实测数据：不是概念，有数字

Token-saviour 的优化数字有实际 benchmark 支撑（基于 Claude Code Opus 4.8 + ultracode，对一个约 30 个文件的 Python 应用的测试）：

| 场景 | 原生做法 | 优化后 | 节省 |
|------|---------|-------|:----:|
| 解释整个架构 | 读文件：3,250 Token | serena：243 Token | **−85%** |
| 查看单个类的方法 | 读文件：458 Token | serena：55 Token | **−71%** |
| 追踪 4 层调用链 | 读文件：1,633 Token | graphify：65 Token | **−89%** |
| 测试输出 | 完整输出 | rtk 压缩 | **−65%** |
| 全文件读取改为语义检索 | 一直读文件 | 语义检索 | **−66%** |
| **全套组合** | — | serena/graphify + rtk + caveman | **~−70%** |

**−89%** 和 **−70%** 是实打实的——不是靠"少说点话"，而是靠**不读不需要的东西**。

## 核心工具拆解

### serena — LSP 驱动的代码检索

serena 是一个 MCP 服务器，通过 LSP（语言服务器协议）对代码库做精细的符号级检索，而不是整文件读取：

```
get_symbols_overview(path)    → 文件顶层符号
find_symbol(pattern)          → 符号的完整 body
find_referencing_symbols(n)   → 所有调用者 + 上下文
```

典型的节省案例：解释架构从 3,250 Token 降到 243 Token。

### graphify — 代码图查询

graphify 用 tree-sitter 构建代码的静态调用图，然后通过图查询做导航：

```
graphify query "who calls notify?"    → BFS 图遍历
graphify path "create_task" "DB"      → 两个符号的最短路径
graphify affected "ClassName"         → 反向遍历：变更影响分析
```

追踪 4 层调用链从 1,633 Token 降到 65 Token，是**效率最高的单次优化**。

### rtk — 命令输出压缩器

rtk 是一个 Rust CLI 代理，专门压缩冗长的命令输出——测试结果、构建日志、git 输出等。它保留关键信息（失败详情、摘要），丢掉噪音。

### caveman — 精简回复风格

caveman 则是压缩 Agent 自己的输出——省略填充词、修饰语、客套话，只保留实质性内容。对纯代码输出效果不大，但对长篇解释性回复有明显效果。

## 推荐的组合

Token-saviour 明确给出了最优配置：

> **(serena 或 graphify) + rtk + caveman**

每层选一个工具。serena 和 graphify 都在 code-read 层，装一个就够了——serena 更适合编辑和全览，graphify 更适合导航和调用追踪。rtk 和 caveman 和它们"正交"，叠加效果无冲突。

**不建议**：serena 和 graphify 都装（两个集成，一份收益）。

## 和安全的关系

Token-saviour 不是一个安全工具。但它在两个维度上和 Agent 安全直接相关：

1. **经济安全**：Token 效率就是成本控制。658 倍的成本注入攻击之所以可怕，是因为 Agent 没有"成本敏感"的默认行为。Token-saviour 提供了让 Agent 默认就省 Token 的方案，等于筑了一道经济安全的基线。

2. **响应速度**：Token 消耗降低意味着上下文窗口释放、响应延迟缩短。对于需要实时决策的 Agent，这一点直接影响可用性——甚至可以说，一个响应太慢的 Agent 和被攻击的 Agent 一样不可用。

## 结语

> 别读文件。找符号。

Token-saviour 的核心洞察可以用六个字概括。代理工具调用中的 Token 浪费，本质是工具选择的懒惰——每次都用最费力的方式做最容易的事。Token-saviour 提供的不是某个神奇工具，而是一个**决策框架**：让 Agent 在花费 Token 之前先想一想，这笔 Token 要花在哪个层、该用哪种工具。

对于部署 Agent 到生产环境的团队来说，这个框架和 [Guardian Runtime](/sec/guardian-runtime-ai-agent-budget-firewall.html) 的预算防火墙一样，应该成为默认的基础设施。

---

**参考资料**

1. [Token-saviour SKILL.md](https://github.com/vagkaratzas/skills/blob/main/token-saviour/SKILL.md) — 完整技能文档
2. [vagkaratzas/skills](https://github.com/vagkaratzas/skills) — 技能仓库
3. [Token Consumption Benchmark](https://github.com/vagkaratzas/token-consumption-benchmark) — 量化 benchmark 数据来源
4. [Guardian Runtime：开源的本地 AI Agent 用量追踪与预算防火墙](/sec/guardian-runtime-ai-agent-budget-firewall.html) — 本站关联文章 (2026-06-12)
5. [AI Agent 工具成本注入攻击：费用膨胀 658 倍](/sec/ai-agent-cost-injection-attack-658x.html) — 本站关联文章 (2026-06-15)
