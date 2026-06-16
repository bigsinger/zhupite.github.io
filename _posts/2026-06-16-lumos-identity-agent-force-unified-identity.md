---
layout: post
title: "Lumos Identity Agent Force：统一管理人类、机器和 AI 三种身份"
categories: [sec]
tags: [lumos, identity-agent-force, NHI, identity-governance, agent-security, IGA]
description: "Lumos 发布 Identity Agent Force 平台，首次将人类用户、非人类身份（NHI）和 AI Agent 三类身份的访问权限纳入统一治理框架。6 个专业 Agent 分别负责访问审查、权限申请、角色挖掘、权限翻译、NHI 追踪和 Agent 归属管理。"
---

当 AI Agent 越来越多地接入企业系统，一个尴尬的现实浮出水面：**你的身份治理平台知道谁是员工、谁是外包、谁是 API key，但它不认识你的 AI Agent**。

2026 年 6 月，Lumos 正式发布了 **Identity Agent Force**（IDAF）平台，直接回应了这个问题。它的定位非常明确：

> 一支持续治理企业中**每一个人、机器和 AI Agent** 访问权限的 Agent 团队。

## 三个身份世界终于被统一了

过去，企业的身份管理是分而治之的：

- **人类身份**（员工、外包、合作伙伴）→ IGA（身份治理与管理）
- **非人类身份**（服务账号、API Key、机器人）→ NHI 治理
- **AI Agent 身份**（自主调用工具的 AI 实例）→ 通常是……没人管

每个身份类型都有自己的生命周期、权限模型和审计需求。但 AI Agent 的出现打破了这种分类——Agent 既像人一样需要细粒度权限控制，又和机器一样需要自动化生命周期管理，同时还引入了工具调用审计和异常行为检测等新维度。

Lumos 的做法是**把这三种身份放在同一个治理平面上**。

## Identity Agent Force 的 6 个核心 Agent

根据 Lumos 产品页面公开的信息，IDAF 内置了 **6 个专业 Agent**，每个负责身份治理的一个特定环节：

| Agent | 功能 | 解决的问题 |
|-------|------|-----------|
| **Access Review Agent** | 端到端运行访问审查，认证安全访问 | 人工审查耗时且容易遗漏 |
| **Access Request Agent** | 按需授予访问权限，到期自动撤销 | 权限泛滥和"永久授权" |
| **Role-Mining Agent** | 学习团队如何使用权限，秒级起草合适角色 | RBAC 角色定义靠猜测 |
| **Entitlement Analyst** | 把任何权限翻译成通俗易懂的说明 | 权限名称晦涩看不懂 |
| **NHI Owner Hunter** | 监控每个服务账号、API Key 和 Token | NHI 幽灵账号找不到责任人 |
| **Agent Ownership Finder** | 编目每个 Agent 和 NHI，分配人类负责人 | "谁开的这个 Agent？" |

这 6 个 Agent 覆盖了身份治理中最常见的痛点——从审查、授权到角色设计和归属管理，几乎每一个环节都对应了 IGA 领域的历史难题。

## "Agent 管理 Agent"的治理模式

IDAF 的设计有一个值得注意的特征：**它用 Agent 来治理 Agent**。6 个内置的 Identity Agent 本身就是 AI Agent，但它们的任务是管理**其他 Agent（包括第三方 AI Agent）的访问权限**。

这形成了一种递归式的治理结构：

- 治理层（Identity Agent Force）→ 持续监控和调整
- 被治理层（企业运行的所有 Agent）→ 接受权限约束
- 人类（安全管理员）→ 设定策略、处理升级事件

这种"治理 Agent"和"被治理 Agent"的分离，避免了 Agent 自治和自我授权导致的权限膨胀——这也是我之前在[成本注入攻击](/sec/ai-agent-cost-injection-attack-658x.html)中提到的问题的一种制度性解法。

## 为什么现在需要这个？

几个趋势的交汇让 IDAF 类产品的出现几乎成为必然：

1. **Agent Sprawl（Agent 泛滥）**：企业中的 AI Agent 数量正在指数级增长，每个 Agent 都需要独立的身份和权限
2. **NHI 失控**：服务账号和 API Key 的数量已经远超人类用户，AI Agent 让这个数字进一步膨胀
3. **审计压力**：合规审计要求覆盖"所有身份"的访问记录，Agent 不能成为盲区
4. **最小权限落地**：Agent 的工具调用权限需要比人类权限更严格，因为它们可以被[间接注入攻击](/sec/prompt-injection-taxonomy-catalog-10-basic.html)操纵

## 结语

Lumos 的 Identity Agent Force 标志着身份治理行业的一个重要转折点：**AI Agent 不再是身份安全的外部威胁，而是被明确纳入了治理范围**。

从 SailPoint 的"Agentic Fabric"到 Lumos 的"Identity Agent Force"，身份治理厂商正在以不同的路径走向同一个方向——任何在系统中执行操作的实体，不管是人、代码还是 AI 实例，都必须有可追溯、可控制、可审计的身份。

一个 Agent 需要身份，就像一个人需要工牌。这个逻辑正在变成现实。

---

**参考资料**

1. [Lumos: Identity Agent Force 产品页](https://www.lumos.com/products/identity-agent-force) (2026-06，产品发布)
2. Lumos: [Albus AI Agent](https://www.lumos.com/products/albus) — Lumos 的 AI Agent 身份产品矩阵的一部分
3. [提示注入攻击目录：10 种基础攻击模式](/sec/prompt-injection-taxonomy-catalog-10-basic.html) — 本站关联文章 (2026-06-15)
4. [AI Agent 工具成本注入攻击：费用膨胀 658 倍](/sec/ai-agent-cost-injection-attack-658x.html) — 本站关联文章 (2026-06-15)
