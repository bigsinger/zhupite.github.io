---
categories: [sec]
title: Eve Security 聚焦运行时 AI Agent 安全与加强企业销售
description: Austin 初创公司 Eve Security 宣布加大对运行时 AI Agent 安全的战略投入，并加强企业销售团队。该公司拥有 Interrogation-as-a-Service 专利和 Agent-in-the-Loop 框架，定位为传统安全工具无法覆盖的 Agent 自主行为安全防护。
tags: [Agent Security, 运行时安全, Eve Security, 企业安全, Agent-in-the-Loop, 初创公司]
---

## 一句话结论

Eve Security 将战略重点聚焦于 AI Agent **运行时安全**——该领域被认为是 AI Agent 安全中最被忽视但最关键的一环。传统应用安全工具无法理解 Agent 的自主决策行为模式，需要专门的安全方案。该公司已通过 **$3M 种子轮**、**Interrogation-as-a-Service 专利**和 **Agent-in-the-Loop（AITL）框架**建立了差异化能力，并在 2026 年 7 月加强了企业销售团队。

> **来源说明**：原文 TipRanks URL 不可达（返回 404）。本文通过 Google News RSS + r.jina.ai 综合多来源原始资料完成核验，包括 PRNewswire 官方公告、Yahoo Finance、citybiz 等。

## 公司背景

**Eve Security** 总部位于德克萨斯州奥斯汀，由 Nadav Cornberg（CEO）、Sharon Eilon 和 Amit Eliav 联合创立。

| 里程碑 | 时间 | 内容 |
|--------|------|------|
| 种子轮融资 | 2025 年 9 月 | **$3M**，由 LiveOak Ventures 领投，Tau Ventures 参投 |
| 产品发布 | 2025 年 9 月 | **EveGuard**——Agentic AI 可观测性与策略执行平台 |
| 专利申请 | 2026 年 2 月 | **Interrogation-as-a-Service**——AI Agent 风险控制专利 |
| 企业销售加强 | 2026 年 6-7 月 | 高级销售人才引入，强化企业级销售团队 |

## 核心技术："为什么"比"能做什么"更重要

Eve Security 的核心主张是：**传统安全工具只能回答 Agent "能做什么"（权限），但无法理解 Agent "为什么要做"（意图和上下文）**。

### Interrogation-as-a-Service（审问即服务）

2026 年 2 月，Eve Security 提交了业界首个 Interrogation-as-a-Service 专利。其工作流程如下：

1. **Analyze（分析）**：AI 驱动的风险判断——Agent 请求被实时分类为低/中/高/严重风险
2. **Interrogation（审问）**：高风险请求自动触发 **5 个推理提示**——**意图、必要性、危害、数据、替代方案**
3. **Retry Tokens（安全重试）**：授权通过后，Agent 可安全重试被拦截的操作

该方案运行在标准 HTTP + JSON 之上，兼容任何 Agent、网关或编排器，无需 SDK 或厂商特定的实现。

### Agent-in-the-Loop（AITL）

Eve Security 的核心产品 **EveGuard** 引入了业界首个 **Agent-in-the-Loop（AITL）**——名为 **Eve** 的安全 Agent：

- **可观测**：观察 Agent 之间的交互、Agent 与人类的交互、Agent 与业务系统的交互
- **可量化风险**：聚类请求并评估风险等级
- **可行动**：在相同输入下产生一致、可预测的结果，确保人类能够可靠地监督决策
- **无死角**：基于意图和数据的策略执行，而非纯语言的策略描述（避免翻译和文化盲区）

### 与传统方案的区别

| 维度 | 传统安全工具 | Eve Security |
|------|------------|-------------|
| 视角 | 静态权限（能做什么） | 运行时意图（为什么做） |
| 策略依据 | 角色、身份、网络 | 意图、上下文、数据 |
| 覆盖范围 | 已知威胁模式 | 未知/动态的 Agent 行为 |
| 与 Agent 的交互 | 阻断/放行 | 审问/审批/审计闭环 |

## 市场信号：Agent 运行时安全赛道加速

Eve Security 的动向与近期多个行业事件呼应：

1. **Orca 开源项目**（2026 年 7 月 4 日）——独立开发者发布的 AI 编码 Agent 命令拦截层，说明社区对运行时防护的需求正在爆发
2. **多厂商布局**——安全厂商纷纷将 Agent 运行时安全作为战略重点
3. **企业级需求明确**——Eve 在 2026 年 6-7 月接连加强企业销售团队，说明已从技术验证阶段走向商业化落地

Eve Security 的 CEO Nadav Cornberg 对此表示：*"CISO 们今天既面临巨大的机遇，也承担着巨大的责任。我们帮助他们在创新 AI 的同时，保护企业最核心的数据和系统安全。"*

## 局限与观察点

- **公司规模小**：仅 $3M 种子轮，产品处于早期验证阶段
- **专利未授权**：Interrogation-as-a-Service 为专利申请阶段，尚未获得授权
- **客户验证**：尚未看到大型企业客户的公开案例
- **竞争格局**：Agent 运行时安全赛道正在快速拥挤，包括 Orca、Aikido Security 等均在布局

## 参考

- TipRanks（原文，404）：[Eve Security Sharpens Focus on Runtime AI Agent Security and Enterprise Sales](https://tipranks.com/news/eve-security-runtime-ai-agent-security)
- PRNewswire / Yahoo Finance：[Eve Security Files Patent for Interrogation-as-a-Service](https://finance.yahoo.com/news/eve-security-files-patent-interrogation-111600494.html)（2026-02-10）
- citybiz：[Eve Security Raises $3 Million Seed](https://www.citybiz.co/article/610656/eve-security-raises-3-million-seed/)（2025-09-16）
- Eve Security 官网：https://www.eve.security/
