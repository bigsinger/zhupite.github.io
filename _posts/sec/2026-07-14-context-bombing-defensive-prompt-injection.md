---
layout: post
title: "Context Bombing：防守方也开始利用 Prompt Injection 反制 AI 黑客 Agent"
categories: [sec]
description: "解读 Ars Technica 报道的 Tracebit context bombing 技术：防守方把可触发模型拒答机制的提示注入放进云端诱饵密钥和资源上下文中，让攻击型 AI Agent 在侦察和提权途中自我中断。"
tags:
  - Prompt Injection
  - Agent 安全
  - Context Bombing
  - Tracebit
  - 防御技术
---

## 一句话结论

Prompt injection 不再只是攻击者的武器。Ars Technica 报道称，Tracebit 研究人员提出 **context bombing**：把会触发模型安全拒答机制的提示注入内容放进 AWS 诱饵密钥、假资源和云环境上下文里。当攻击型 AI Agent 在侦察过程中读到这些字符串，它可能触发自身 guardrail，停止继续攻击。

## 这项技术在做什么

传统 prompt injection 是攻击者把恶意指令藏进邮件、网页、日历、文档等内容中，诱导 LLM 或 Agent 泄露数据、调用工具或执行危险操作。

Tracebit 的思路反过来：

> 如果攻击型 Agent 也会读取环境、密钥、资源描述和配置文件，那么防守方也可以在这些地方放入“对攻击模型有毒”的上下文。

这些上下文不是给人看的，而是给攻击型 LLM Agent 看的。它们会诱导模型执行其安全策略禁止的任务，例如生成生物武器制作步骤，或触发特定模型的政治敏感拒答机制。模型一旦进入拒答状态，就可能无法继续完成原本的攻击链。

## 实验结果

Tracebit 在模拟 AWS 环境中测试了 5 个模型：Opus 4.8、Gemini 3.1 Pro、GLM 5.2、DeepSeek 4 Pro、Kimi 2.6，共 152 次攻击运行。

报道披露的平均结果如下：

| 指标 | 无 context bomb | 有 context bomb |
|------|----------------|----------------|
| 获取管理员权限 | 57% | 5% |
| 获取管理员权限并留下持久化 foothold | 36% | 1% |
| 完成任意攻击路径 | 91% | 15% |
| 每次运行平均成功路径数 | 1.53 | 0.16 |
| 未触发 canary 的成功攻击 | 存在 | 0 |

其中最强的 Opus 4.8 在无防护时 93% 的运行能拿到管理员权限；遇到 context bomb 后，所有运行都失败。

## 为什么叫 Context Bombing

Tracebit CEO Andy Smith 的解释是：这些字符串被放进模型上下文后，会产生“强烈、尖锐”的效果。一旦攻击型 Agent 把它读进上下文，它会持续拒答，很难从这种状态恢复。

这和普通蜜罐不同：

- 蜜罐资源用于**发现攻击**；
- context bomb 用于**干扰攻击模型继续执行**；
- canary 用于**告警**；
- context bomb 试图把告警升级成**阻断**。

## 和传统 canary 的关系

Tracebit 早前提出过面向 Agentic adversary 的云端 canary：在 AWS 环境中放置看起来真实、实际无人使用的资源。当 AI Agent 扫描或触碰这些资源时，防守方可以收到告警。

但 canary 的问题是：只告警，不一定来得及阻断。报道中提到，Tracebit 的 canary 平均在攻击开始后 8 分钟告警，而 Agent 平均约 14 分钟即可升级到管理员权限。也就是说，防守方大约只有 6 分钟窗口。

context bombing 的目标就是缩短这个差距：让攻击 Agent 在侦察过程中就自我中断。

## 防守方为什么能“反用” Prompt Injection

这是一个很有意思的反转：

| 方向 | 攻击者使用 prompt injection | 防守方使用 context bombing |
|------|----------------------------|---------------------------|
| 注入位置 | 邮件、网页、文档、工具返回 | 云资源、假密钥、诱饵配置 |
| 目标 | 劫持正常 Agent | 干扰攻击 Agent |
| 结果 | 数据泄露、越权操作 | 拒答、中断、触发告警 |
| 本质 | 利用模型无法区分指令来源 | 利用模型无法区分指令来源 |

底层问题一样：LLM 很难可靠地区分“我应该执行的指令”和“我读到的内容”。既然根因短期内无解，防守方开始把它变成可利用的防御面。

## 适用边界

这项技术不应被理解为万能防线。

### 它适合的场景

- 攻击者使用 LLM Agent 自动枚举云资源；
- Agent 会读取密钥、资源名、描述、配置文件等上下文；
- 攻击模型仍受 guardrail 约束；
- 防守方可布置诱饵资源和告警链路。

### 它不适合的场景

- 攻击者使用传统脚本或人工操作；
- 攻击模型被完全去安全化或本地无约束运行；
- 攻击链不读取诱饵资源；
- 防守方没有云资源可控命名和审计能力。

换句话说，context bombing 是对 **AI Agent 攻击者** 的定向防御，而不是通用入侵防御。

## 可能的反制与风险

攻击者也会适应：

1. **上下文清洗**：攻击 Agent 在处理资源名、密钥、描述前先过滤敏感短语；
2. **工具隔离**：让一个非 LLM 组件枚举资源，只把结构化结果交给模型；
3. **无 guardrail 模型**：使用约束更少的开源模型；
4. **多 Agent 分工**：让一个 Agent 负责读，另一个 Agent 负责决策，避免上下文污染传递。

此外，防守方也要注意不要把过强的危险文本放进真实生产路径，避免误伤内部安全工具或合规审计系统。

## 我的看法

Context bombing 的价值不在于它能一劳永逸解决 prompt injection，而在于它承认了一个现实：

> 当攻击者开始使用 AI Agent，防御策略也必须针对“模型的行为特性”设计。

过去的防御是围绕 IP、进程、账号、文件、网络行为展开；现在还要围绕模型的上下文、拒答机制、工具调用路径和多轮状态展开。

这类技术很可能成为云安全 canary 的新分支：

- 传统 canary：发现人类或脚本攻击者；
- Agent canary：发现 AI Agent 枚举行为；
- context bomb：让 AI Agent 在发现诱饵时自我中断。

它不是主防线，但很适合作为 Agentic Threat Defense 的补充层。

## 参考资料

- [Ars Technica：Now, defenders are embracing the prompt injection, too](https://arstechnica.com/security/2026/07/now-defenders-are-embracing-the-prompt-injection-too/)
- [Tracebit：Context Bombs](https://agentic.tracebit.com/context-bombs/)
- [Tracebit：Agentic canaries](https://agentic.tracebit.com/)
- [Socket：Mini Shai-Hulud / Miasma / Hades worms](https://socket.dev/blog/mini-shai-hulud-miasma-and-hades-worms-target-bioinformatics-and-mcp-developers-via-malicious)
- [Check Point：AI Evasion Prompt Injection](https://research.checkpoint.com/2025/ai-evasion-prompt-injection/)
