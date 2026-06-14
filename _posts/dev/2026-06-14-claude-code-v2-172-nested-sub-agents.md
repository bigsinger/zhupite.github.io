---
layout: post
title: "Claude Code v2.1.172：Sub-Agent 现在可以创建自己的 Sub-Agent，嵌套最深 5 层"
categories: [dev]
description: "Claude Code v2.1.172 解除了子代理不能创建子代理的限制，支持嵌套最深 5 层。每层独立上下文窗口、独立模型选择，父层只读摘要——但 Token 消耗会增加约 7 倍，需谨慎使用。"
tags:
  - Claude Code
  - AI编程
  - Sub-Agent
  - 嵌套代理
  - 上下文管理
  - Anthropic
  - Agent架构
---

2024 年底 Claude Code 发布时，有一条硬性规则：Sub-Agent（子代理）不能创建自己的 Sub-Agent。它是一个终结点，完成任务返回摘要，分支就此终止。

**2026 年 6 月 10 日，v2.1.172 打破了这条规则。** 项目负责人 Boris Cherny 在 X 上简短宣布：Sub-Agent 现在可以嵌套，最深 5 层。

> "Just landed nested subagent support in Claude Code. Capped at depth=5 to start." — Boris Cherny

这不是为了跑更多 Agent 并行，而是为了**把噪声推到你的关注圈以外**——每个嵌套层的中间 Token 消耗在子任务完成后被丢弃，父会话保持干净。

> 来源：byteiota.com、ChatForest、Claude Code GitHub Release

---

## 一、工作机制：5 层调用栈

每层嵌套的 Sub-Agent 拥有独立的：

- **系统提示词**
- **模型选择**（可以在每层切换不同模型）
- **200K Token 上下文窗口**

父层**只看到子层的最终摘要**，中间的所有搜索、文件读取、推理过程在子层完成后全部丢弃。

典型调试链示例：

```
主会话（Opus 4.6）
  → 分诊主管（Opus 4.6）
    → 复现执行（Sonnet 4）
      → 日志摘要（Haiku 3.5）
```

| 层级 | 角色 | 模型建议 |
|------|------|---------|
| Depth 0 | 根 Agent（任务分解、判断决策） | Opus |
| Depth 1-2 | 中间层（领域工作、代码生成） | Sonnet |
| Depth 3-4 | 叶子层（结构化输出、格式处理） | Haiku |

**关键洞察：** 大多数有用的嵌套在 2-3 层，5 层是天花板、不是目标。

---

## 二、配置方式

Sub-Agent 的定义放在 `.claude/agents/<name>.md`（项目级）或 `~/.claude/agents/<name>.md`（用户级）。

配置文件中新增了 `Agent()` 字段作为允许列表——只有显式声明的子 Agent 可以被当前 Agent 调用：

```markdown
---
name: triage-lead
model: claude-opus-4-6
tools:
  - Read
  - Bash
  - Agent(repro-runner, log-summariser)
---

你是调试分诊主管。加载事故报告后，委托给 repro-runner 复现，
委托给 log-summariser 做日志关联分析，最终返回一个结论：
confirmed、unconfirmed 或 needs-more-data。
```

`Agent()` 字段是 allowlist——未在此列出的 Agent 不会被调用，这是一个安全机制，防止编码失误导致意外递归。

---

## 三、Token 消耗：最需要警惕的事

这是嵌套 Sub-Agent 最容易被忽视的陷阱。

**每一层嵌套都有额外的编排开销：** 上下文初始化、参数传递、摘要汇总。Anthropic 成本管理文档中的最坏情况估算约为 **7 倍于单线程会话的 Token 消耗**。

一个真实案例：某财务团队运行了一个"简单的"代码质量检查项目，创建了 23 个嵌套 Sub-Agent，**3 天内收到 $47,000 账单**。

> 来源：byteiota.com 引用的真实案例

### 成本优化策略

差异化模型选型可以显著降低成本：

| 方案 | 每会话 Token 消耗 | 成本 |
|------|-----------------|------|
| 全部使用 Opus | 基准值 | ~$2.02 |
| Opus(根) + Sonnet(中层) + Haiku(叶子) | 约降 51% | **~$0.98** |

差别在于：叶子任务（日志读取、grep 搜索、测试生成）完全不需要 Opus 级别的推理能力，用 Haiku 就足够。

### 三个常见陷阱

1. **精度随深度衰减**：父层模糊的指令会在子层逐级放大→叶子层得到毫无意义的摘要。解决方法：先作为平面调用验证，确认指令清晰后再加嵌套
2. **深度 5 的静默失败**：第 5 层试图创建第 6 层时会报错，但错误可能不会被感知。建议用一条测试链预先验证
3. **短任务的嵌套过重**：叶子产出少于 ~1000 Token 的任务，嵌套的开销超过了收益。这种情况直接在父层内联执行即可

---

## 四、更大的上下文：此前版本的铺垫

嵌套 Sub-Agent 不是凭空到来的。此前两个版本已经在底层做了铺垫：

- **v2.1.139**：在每个 API 请求中添加了 `x-claude-code-agent-id` 和 `x-claude-code-parent-agent-id` 请求头
- **v2.1.145**：在 OTEL 追踪中修复了子层 span 的父子关系，使嵌套运行的调用链能在 OpenTelemetry 中正确呈现为树形结构

v2.1.172 只是打开了实际的递归开关。

---

## 五、何时应该使用嵌套 Sub-Agent

### 适合的场景
- **多步骤代码审查流水线**：不同审查阶段交由不同 Agent，每层只关心自己的任务
- **需要隔离噪声的工作**：一个复杂任务的"清理"和"整理"阶段可以用子 Agent 隔离，避免上下文污染主会话
- **分层研究流程**：先全局扫描 → 再深入某个模块 → 最后汇总

### 不适合的场景
- **并行加速**：嵌套不是并行工具，每个子 Agent 仍然是串行执行的
- **叶子产出很小的任务**：嵌套的编排开销会抵消收益
- **需要精确追踪中间结果的场景**：父层只能看到摘要，中间细节全部丢失

Boris Cherny 的原话是：**"Agents kicking off agents as a way to better manage context."**——核心驱动力是上下文管理，而不是并行执行。

---

## 六、其他更新

v2.1.172 还包含约 30 项变更，主要还有：

- **插件搜索栏**：市场插件浏览器增加了搜索功能
- **Bedrock 区域解析**：当 `AWS_REGION` 未设置时读取 `~/.aws/config`，与标准 AWS SDK 行为一致
- **OTEL 指标增强**：`claude_code.lines_of_code.count` 现在包含模型属性，便于成本归因

---

## 总结

Claude Code v2.1.172 的嵌套 Sub-Agent 是一次有意义的架构升级——它为真正需要层级分解的任务提供了更干净的上下文管理方案。

但它的设计哲学和"更快的编码"无关。它对擅用者来说是能力放大器，对不设防者来说是账单炸弹。记住三条原则：

1. **2-3 层是甜蜜点**，5 层是上限不是目标
2. **每层显式指定模型**，叶子层不需要 Opus
3. **先作为平面调用测试**，确认指令清晰再加嵌套

**更新命令：** `npm install -g @anthropic-ai/claude-code`  
**完整发布说明：** [github.com/anthropics/claude-code/releases/tag/v2.1.172](https://github.com/anthropics/claude-code/releases/tag/v2.1.172)
