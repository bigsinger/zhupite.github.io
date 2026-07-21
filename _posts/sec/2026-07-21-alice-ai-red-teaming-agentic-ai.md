---
layout: post
title: "Alice 讲 AI Red Teaming：为什么 Agent 安全需要持续红队"
categories: [sec]
description: "基于 Alice 的 AI Red Teaming webinar，梳理 Agentic AI 的新攻击面、传统测试盲区和持续红队方法。"
tags:
  - Agent安全
  - AI红队
  - AI安全
  - PromptInjection
  - 安全治理
---

Alice 的 on-demand webinar《It Takes AI to Break AI: The Case for AI Red Teaming》提出了一个很直接的判断：当 AI 系统开始推理、使用工具、访问数据并代表用户采取行动时，传统软件安全测试已经不够用了。原因不是传统安全失效，而是 Agentic AI 把“输入”变成了“指令”，把“输出”变成了“动作”。

这篇文章不把它当成产品宣传来复述，而是从安全团队视角提炼一个问题：AI Red Teaming 到底应该测什么、为什么一次性测试不够、如何把它放进上线前和上线后的安全闭环。

## 事件速览

| 时间 | 来源 | 原文URL | 内容摘要 | 影响评估 |
|---|---|---|---|---|
| 2026-05-25 | Alice webinar | [It Takes AI to Break AI: The Case for AI Red Teaming](https://alice.io/webinars/it-takes-ai-to-break-ai-the-case-for-ai-red-teaming) | Alice 介绍为什么 AI-powered adversarial testing 对 Agentic AI 变得必要，重点包括 AI 攻击面、传统 benchmark/渗透测试/静态评估的不足、“Lethal Trifecta”和持续 AI 安全计划。 | AI 安全测试需要从一次性上线评审转向生命周期红队：上线前找可利用路径，上线后监控漂移与回归。 |
| 2026-06-25 | Alice whitepaper | [Demystifying AI Red Teaming](https://alice.io/research/demystifying-ai-red-teaming) | Alice 将 AI red teaming 定义为发现 prompt injection、数据泄露、越权行为、合规偏离等真实行为风险的方法，并强调管理层需要理解风险类别和生命周期计划。 | AI red teaming 不应只归安全团队，也会影响法务、合规、产品和业务上线决策。 |
| 2025-06-16 | Simon Willison | [The lethal trifecta for AI agents](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) | “私有数据访问 + 不可信内容暴露 + 对外通信能力”三者同时存在时，Agent 很容易被诱导泄露数据。 | 这是评估 Agent 风险时最实用的威胁建模框架之一。 |

## 为什么 Agentic AI 不是普通 Web 应用

普通应用的典型攻击面是接口、权限、输入校验、依赖、配置和运行时。Agentic AI 当然也有这些问题，但它多了几类传统测试不容易覆盖的行为风险：

| 能力 | 新风险 | 典型后果 |
|---|---|---|
| 推理 | 模型会把上下文中的恶意文本当作任务指令 | Prompt injection、策略绕过、错误决策 |
| 工具调用 | 模型输出可以触发真实动作 | 越权操作、误删数据、错误下单、错误发信 |
| 访问私有数据 | Agent 能读取知识库、邮箱、CRM、工单或代码 | 敏感信息泄露、横向信息收集 |
| 多轮记忆 | 上下文和历史状态影响后续行为 | 污染长期记忆、跨会话攻击、权限边界模糊 |
| 自主规划 | Agent 会拆解任务并选择步骤 | 攻击路径更长，单点 guardrail 难以覆盖全链路 |

Alice 页面强调，现代 AI 系统不只是生成内容，而是在访问数据、做决定、使用工具和代表用户行动。安全测试也就不能只问“这个回答是否违规”，而要问“这个系统在真实业务流里会不会被诱导做错事”。

## “Lethal Trifecta”：红队最应该优先测的组合

Alice webinar 将 “Lethal Trifecta” 列为学习重点。这个概念来自 Simon Willison 对 Agent 风险的概括：当一个 Agent 同时具备以下三种能力时，风险会急剧上升：

1. 能访问私有数据；
2. 会接触不可信内容；
3. 具备对外通信或可被用于外传信息的能力。

单独看，每一项都很常见，也未必危险。危险在于组合：

| 场景 | 三要素如何同时出现 | 红队要验证什么 |
|---|---|---|
| 邮件助手 | 能读邮箱；邮件正文来自外部；能回复或转发邮件 | 恶意邮件是否能注入指令，把历史邮件或联系人信息外发？ |
| 客服 Agent | 能查订单/用户资料；用户输入不可信；能调用退款、改地址、发短信工具 | 恶意用户是否能诱导 Agent 泄露他人数据或执行越权业务操作？ |
| 代码助手 | 能读私有仓库；issue/PR/README 可被外部污染；能提交代码或调用 CI | 恶意文本是否能诱导 Agent 泄露 token、修改构建脚本或引入后门？ |
| 企业知识库助手 | 能查内部文档；网页/上传文档不可信；能生成可分享链接或消息 | 文档中的隐藏指令是否能诱导它绕过权限边界？ |

这类测试不适合只靠静态 checklist。红队需要构造多轮上下文、业务目标、工具调用序列和数据外传路径，验证系统在完整任务链中的表现。

## 为什么 benchmark、渗透测试和静态评估会不够

Alice 页面明确把 “benchmarks, penetration tests, and static evaluations fall short” 放在 webinar 重点里。这个判断可以拆成三层：

| 方法 | 有价值的地方 | 主要盲区 |
|---|---|---|
| Benchmark | 适合横向比较模型在固定数据集上的安全表现 | 固定题库容易被调参适配，难覆盖企业私有业务流和工具组合 |
| 传统渗透测试 | 擅长接口、权限、网络、依赖和配置问题 | 往往不覆盖模型多轮行为、语义注入、工具链误用和业务动作 |
| 静态评估 | 可检查系统 prompt、策略、配置和代码 | 无法证明 Agent 在真实上下文、真实数据和真实工具下不会失控 |

因此，AI red teaming 的目标不是替代这些方法，而是补上“行为层”的验证：攻击者不一定需要 CVE，也不一定需要拿到后台权限，只要能把恶意指令混入 Agent 会处理的内容，就可能影响系统行为。

## 一个可落地的 AI Red Teaming 框架

基于 Alice webinar 和 whitepaper 的公开信息，可以把 AI red teaming 拆成五个阶段：

| 阶段 | 目标 | 输出物 |
|---|---|---|
| 资产建模 | 明确 AI 系统边界、用户角色、工具、数据源和外部通信路径 | Agent 权限图、数据流图、工具清单 |
| 威胁建模 | 找出 prompt injection、越权工具调用、数据泄露、合规偏离等主要风险 | 风险矩阵、优先级、测试假设 |
| 对抗测试 | 用多轮 prompt、恶意文档、污染网页、伪造用户请求等方式模拟攻击 | 可复现测试用例、触发条件、证据截图或日志 |
| 修复验证 | 验证策略、权限、隔离、审计和 guardrail 是否真正降低风险 | 修复前后对比、残余风险说明 |
| 持续回归 | 模型、prompt、工具、数据源或业务策略变更后自动复测 | CI/CD 测试、定期报告、漂移告警 |

这里的关键是“持续”。Agent 系统会随着模型更新、prompt 调整、工具增加、业务流程变化而改变行为。上线时安全，不代表今天仍然安全。

## 上线前和上线后要测的不一样

Alice 的产品页也把 red teaming 分成 pre-launch 和 post-launch 两类思路：上线前找可利用风险，上线后发现漂移与回归。这个划分对企业很实用。

| 阶段 | 重点问题 | 示例测试 |
|---|---|---|
| 上线前 | 是否存在高危设计缺陷，是否能通过上线委员会 | Prompt injection、越权工具调用、PII 泄露、品牌与合规风险 |
| 上线中 | 修复是否有效，风险是否被接受并记录 | 修复前后复测、策略例外、审批记录 |
| 上线后 | 模型或业务变化是否让旧漏洞复现 | 定时对抗测试、漂移检测、回归用例、生产日志抽样 |

这也解释了为什么“一次 red team 报告”不应该被当成终局交付。对 Agent 来说，安全状态是动态的。

## 对安全团队的实践建议

| 控制项 | 建议 |
|---|---|
| 权限 | 先限制 Agent 的工具权限和数据可见性，再讨论模型是否足够安全。 |
| 数据 | 把外部网页、用户上传文档、邮件、issue、聊天记录都视为不可信输入。 |
| 工具调用 | 高风险工具必须有显式授权、参数校验、速率限制和审计日志。 |
| 测试用例 | 建立企业自己的攻击样本库，不只依赖公开 jailbreak benchmark。 |
| 回归 | 每次模型、prompt、工具、权限、数据源变更后触发核心红队用例。 |
| 指标 | 不只统计“拦截率”，还要统计可利用链路、业务影响、修复时长和复发率。 |

## 结论

Alice 这场 webinar 的核心价值，是把 AI Red Teaming 从“模型会不会说坏话”拉回到“Agent 会不会在真实业务中被诱导做错事”。

对企业来说，最值得立刻行动的不是采购某个工具，而是先画清楚三张图：Agent 能读什么数据、能接触哪些不可信内容、能通过哪些工具对外行动。只要这三条线发生交叉，就应该进入 AI red teaming 的优先队列。

真正的 AI 安全不是上线前跑一次测试，而是在 Agent 生命周期里持续寻找、验证、修复和回归这些可利用路径。

## 参考资料

1. [Alice — It Takes AI to Break AI: The Case for AI Red Teaming](https://alice.io/webinars/it-takes-ai-to-break-ai-the-case-for-ai-red-teaming)（2026-05-25，on-demand webinar）
2. [Alice — Demystifying AI Red Teaming](https://alice.io/research/demystifying-ai-red-teaming)（2026-06-25，whitepaper 页面）
3. [Alice — WonderBuild: Pre-Launch Red Teaming](https://alice.io/products/wonderbuild)（产品页面，用于理解上线前 AI stress testing 场景）
4. [Alice — WonderCheck: Ongoing Post-Launch Red Teaming](https://alice.io/products/wondercheck)（产品页面，用于理解上线后持续 red teaming 与 drift detection 场景）
5. [Simon Willison — The lethal trifecta for AI agents](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/)（2025-06-16，Agent 风险建模框架）
