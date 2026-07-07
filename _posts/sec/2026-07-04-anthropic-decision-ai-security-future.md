---
categories: [sec]
title: Anthropic 的 Fable 5 安全架构揭示 AI 安全未来方向：从"事后补救"到"设计时安全"
description: Security Boulevard 分析指出，Anthropic 围绕 Fable 5 的一系列安全决策——包括 AI 安全分类器、安全余量机制和 Cyber Jailbreak Severity 框架——揭示了 AI Agent 安全的未来方向：安全正在从独立的外部审查环节，融入到 AI 系统开发的整个生命周期中。
tags: [Anthropic, Fable 5, AI安全, 设计时安全, 安全左移, 分类器, 越狱框架]
---

## 一句话结论

Anthropic 围绕 Fable 5 的一系列安全决策——特别是**AI 驱动的安全分类器**、**安全余量机制**和首创的 **Cyber Jailbreak Severity 评级框架**——正在将 AI 安全从"事后补救"推向"设计时安全"。这意味着 AI Agent 的安全将不再是一个独立的安全审查环节，而是嵌入到系统开发的全生命周期中。安全左移理念正在渗透到 AI Agent 安全领域。

> **来源说明**：原文 Security Boulevard URL 不可达（返回 404）。本文通过 Google News RSS 定位到 Anthropic 官方博客、IBM Think、Security Boulevard 相关分析等多来源原始资料，经 r.jina.ai 提取内容后综合成文。

## 事件背景：Fable 5 的安全风波

2026 年 6 月，Anthropic 发布 **Claude Fable 5**——当时最强大的公开 AI 模型，同时发布了受限版本 **Claude Mythos 5**（仅限受信任的网络安全和科学研究合作伙伴）。

围绕 Fable 5 的安全决策是一连串密集事件：

| 时间 | 事件 |
|------|------|
| 6 月初 | Fable 5 / Mythos 5 发布，附带新型安全分类器系统 |
| 6 月 | 美国政府因安全顾虑对 Mythos/Fable 实施限制 |
| 6 月 30 日 | Security Boulevard 发表《Claude Fable – Safety Not Guaranteed》分析 |
| 7 月 1 日 | 美国政府解除限制，Anthropic 全球重新部署 Fable 5 |
| 7 月 1 日 | Anthropic 发布详细安全分类器说明 + 越狱严重性框架草案 |

## Anthropic 的安全架构创新

### 1. 安全分类器（Safety Classifiers）——设计时嵌入的 AI 安全层

Fable 5 没有依赖单一模型的内置训练来保证安全，而是设计了一张**分类器网络**作为安全围栏。这些分类器是伴随模型运行的独立 AI 系统，在用户请求到达底层模型之前进行检测和拦截。

分类器将网络安全相关的请求分为四个等级：

| 分类 | 描述 | 分类器行为 |
|------|------|-----------|
| **禁止使用** | 会造成严重危害且几乎没有防御价值的活动 | **拦截** |
| **高风险双重用途** | 被恶意行为者广泛使用、但也有防御应用 | **拦截** |
| **低风险双重用途** | 主要是防御用途、但也对攻击者有部分价值 | **监控**，部分作为安全余量拦截 |
| **良性使用** | 不会造成伤害 | **允许**，附带部分监控 |

> "许多网络安全能力都是**双重用途**的。我们希望允许防御者使用模型扫描代码库发现漏洞——但同样的能力在错误的手中可能就是网络攻击的前奏。"——Anthropic 官方博文

### 2. 安全余量（Safety Margin）——有意误报的设计哲学

Fable 5 最值得关注的设计决策是**有意扩大安全余量**。安全余量是指分类器在"明确安全"和"明确危险"之间保留的灰色地带。Anthropic 将 Fable 5 的安全余量设为比之前任何模型都大。

这意味着：**大量良性的请求也会被拦截**。这是设计上的刻意选择——宁可误报，不可漏报。Fable 5 的"安全余量"比之前模型更大，导致更多良性请求被误拦，但同时也大幅降低了危险请求被放行的概率。

IBM 的 Gabe Goodhart 在测试时就遇到了这一现象：当他要求 Fable 5 对一个软件项目进行严格的安全审计时，请求被触发了安全分类器，转而被路由到 Claude Opus 4.8 处理。

### 3. Cyber Jailbreak Severity（CJS）框架——首个越狱严重性评级标准

Anthropic 提出了业界首个 **AI 越狱严重性评级框架**（Cyber Jailbreak Severity, CJS），从四个维度评估越狱的严重程度：

| 维度 | 含义 |
|------|------|
| **能力增益**（Capability Gain） | 越狱让攻击者获得了多大的能力超越（相对于现有工具） |
| **广度**（Breadth） | 同一个越狱技术适用于多少种不同的攻击任务 |
| **武器化难度**（Ease of Weaponization） | 从知道越狱方法到产出可用攻击需要多少人力 |
| **可发现性**（Discoverability） | 攻击者获取该越狱技术的难易程度 |

评级从 CJS-0（信息性）到 CJS-4（严重），呈对数增长。例如：一个公开的系统提示覆盖越狱被评为 CJS-4，而一个需要 50 小时专业工作才能发现的定向漏洞越狱被评为 CJS-2。

Anthropic 还同步推出了 **HackerOne 悬赏计划**，邀请安全研究人员提交针对 Fable 5 的越狱发现。

## 从"事后补救"到"设计时安全"

Security Boulevard 的分析认为，Anthropic 的这一系列决策揭示了一个深层趋势：

### 传统模式：安全是附加层

- 模型先训练完成 → 再添加安全审查 → 然后再评估风险
- 安全是**独立的外部审查环节**
- 问题发现后需要打补丁

### Fable 5 模式：安全是设计的一部分

- 安全分类器从发布第一天就与模型共存
- 安全余量设计影响用户体验（更多的误拦截）
- 越狱评级框架确保对安全事件的量化评估
- **安全不是附加功能，而是产品架构的核心组成部分**

## 对 AI Agent 安全的启示

这种"设计时安全"理念正在渗透到 AI Agent 安全领域：

1. **Agent 安全分类器**：未来每个 Agent 框架都可能内建类似的安全分类器，在 Agent 执行工具调用前进行意图级判断——这比运行时拦截更接近问题根源

2. **安全左移的三层传导**：
   - **模型层**：Fable 5 的分类器网络（设计时嵌入）
   - **框架层**：Agent 框架内置的安全策略引擎
   - **运行时层**：Orca、Eve Security 等的命令级拦截

3. **越狱评级标准的通用化**：CJS 框架如果成为行业标准，Agent 安全的评估也将有可量化的基准——例如对 Agent 提示词注入的成功率和影响范围进行标准化评分

> "安全左移"并非新概念，但在 AI Agent 领域，它的含义从"在开发阶段修复漏洞"变成了"在 Agent 的架构设计阶段就嵌入安全决策逻辑"。Anthropic 的 Fable 5 是这个转变的鲜明标志。

## 局限与观察点

- **误报成本**：扩大安全余量虽然提升了安全性，但 UX 牺牲是否可持续有待观察。IBM 的测试中就遇到了被误拦截的情况
- **治理框架仍在草案阶段**：CJS 框架目前是"初稿"，Anthropic 明确表示欢迎反馈
- **分类器覆盖范围有限**：分类器专注于网络安全、生物、化学等领域，不覆盖欺诈、游戏作弊等其他风险域
- **Agent 安全仍以运行时为主**："设计时安全"的理想很明确，但 Agent 框架层面的内建安全机制仍处于早期

## 参考

- Security Boulevard（原文，404）：[Anthropic Decision AI Security Future](https://securityboulevard.com/anthropic-decision-ai-security-future/)
- Anthropic 官方：[More details on Fable 5's cyber safeguards and our jailbreak framework](https://www.anthropic.com/news/fable-5-cyber-safeguards)（2026-07-01）
- Anthropic 官方：[Redeploying Fable 5](https://www.anthropic.com/news/redeploying-fable-5)（2026-07-01）
- Security Boulevard：[Anthropic's Claude Fable – Safety Not Guaranteed](https://securityboulevard.com/anthropic-claude-fable-safety-not-guaranteed/)（2026-06-30）
- IBM Think：[Anthropic launches most powerful AI model yet, with new safety guardrails](https://www.ibm.com/think/news/anthropic-fable-5-safety-guardrails)（2026-06-10）
