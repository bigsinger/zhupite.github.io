---
layout: post
title: "前 Cisco 团队创立 Tenet Security，专注于 Agent 运行时安全"
categories: [sec]
description: "前 Cisco AI Defense 团队的研究人员创立了 Tenet Security，获得 600 万美元种子轮融资，专注于 Agent 运行时安全——实时监控 AI Agent 行为、分析和阻断恶意操作。这是 Agent 安全市场从大公司内部孵化走向独立创业的一个标志性事件。"
tags:
  - Tenet Security
  - AI Agent安全
  - 运行时安全
  - Cisco
  - 安全创业
  - 种子轮
  - Agent监控
  - Agentjacking
  - Agent运行时防护
---

前 Cisco AI Defense 团队的研究人员近日创立了 **Tenet Security**，并筹集了 **600 万美元种子轮资金**。这家初创公司的目标很明确——**阻止企业环境中的恶意 AI Agent 行为**。

---

## 团队背景：前 Cisco AI Defense 原班人马

Tenet Security 的创始人兼 CEO **Barak Sternberg** 此前是 Cisco AI Defense 团队的核心研究员。整个创始团队均来自 Cisco 的 AI 安全部门，在 Cisco 期间专注于识别和防御 AI 系统面临的新型威胁。

这个团队从 Cisco 出来独立创业，可能不是一个"大公司做不好"的故事——更可能是 **"Agent 安全的市场窗口正在打开，大公司内部孵化的速度跟不上市场节奏"**。Cisco 作为大型企业，有全面的产品线，AI Agent 安全只是其整个安全组合中的一小部分。而 Tenet Security 可以全身心投入这个细分赛道。

种子轮 **600 万美元** 由 **The Westly Group**（SentinelOne 早期投资人）和 **MizMaa Ventures** 领投，天使投资人包括 Tomer Schwartz（Dazz 创始人，其公司后被 Wiz 收购）和 Lior Tal。投资方阵容传递了一个信号：**企业安全赛道的顶级资本正在押注 Agent 运行时安全这个新战场。**

---

## 核心安全研究：Agentjacking 攻击

在推出产品的同时，Tenet Security 的研究团队还发现并命名了一种针对 AI 编码 Agent 的新型攻击方式——**Agentjacking（Agent 劫持）**。

**攻击原理**：攻击者通过欺骗 AI 编码 Agent（如 Cursor、Copilot 等编程助手），诱使其执行来自攻击者服务器的恶意代码。具体而言，攻击者可以在第三方依赖、代码片段建议、错误日志中嵌入恶意负载，当 Agent 按照正常编程流程"修复错误"或"安装依赖"时，实际执行的是攻击者控制的恶意代码。

**为什么这很危险**：AI 编码 Agent 被设计为**自主执行代码**——这正是它们有价值的原因。但传统安全模型假设"人类会审查代码再执行"，而 Agent 的自主性打破了这个假设。Agentjacking 利用了 Agent 的**信任链**——Agent 信任它的工具调用结果，攻击者利用 Agent 的信任来劫持它的操作。

**攻击影响**：
- 攻击者可完全控制 Agent 的操作上下文
- 窃取 Agent 工作环境中可访问的敏感数据
- 在开发环境中植入持久性后门
- 通过 Agent 的 API 调用链横向移动

这个研究成果被多家安全媒体报道（The Hacker News、Dark Reading、Security Boulevard 等），是 Tenet Security 在 Agent 安全研究领域的第一份"投名状"。

---

## Tenet Security Platform 产品详解

### 产品全景

从产品页面和前端代码分析来看，Tenet Security 的平台是一个 **AI Agent 运行时安全保护平台**，覆盖以下核心功能模块：

| 功能模块 | 说明 |
|---------|------|
| **Agent Inventory（Agent 清单）** | 自动发现和记录组织内所有在用的 AI Agent，建立 Agent 资产台账 |
| **Agent List（Agent 列表）** | 实时展示所有 Agent 的运行状态，包括在线/离线/异常等 |
| **Session Details（会话详情）** | 监控每个 Agent 的运行时会话，完整追溯行为轨迹 |
| **Policy Management（策略管理）** | 基于策略对 Agent 行为进行管控，支持灵活配置规则 |
| **Connection Management（连接管理）** | 管理 Agent 对外部工具、API 和数据源的连接关系 |
| **Dashboard（仪表盘）** | 全局安全态势可视化，提供安全事件的实时视图 |

### 核心技术特性

**1. Agent-side Simulation Technology（Agent 端模拟技术，专利 pending）**

这是 Tenet Security 的技术核心——在 Agent 实际执行操作之前，先用模拟技术预测该操作的安全风险。不同于传统的"先执行再检测"模式，这种**预执行模拟**可以在操作造成实际危害之前阻断它。

**2. 运行时行为监控**

不监控模型的输入输出（那是 Lakera、Galileo 等护栏厂商的领域），而是监控 Agent **在运行时的行为链**：
- 它调用了什么工具
- 访问了什么数据源
- 执行了什么命令行操作
- 触发了什么 API 调用
- 工作上下文是什么

**3. 行为基线 + 异常检测**

通过建立 Agent 行为的基线模型，检测偏离基线的异常模式：
- 一个客服 Agent 突然开始访问财务数据库
- 一个代码 Agent 在凌晨 3 点批量修改生产环境权限
- 一个数据处理 Agent 尝试发送超出授权范围的数据

**4. 实时阻断**

当检测到异常行为时，不是只能告警——而是能够 **实时终止 Agent 的操作**。这是 Agent 安全与 SIEM/SOAR 的关键区别：Agent 的速度太快了，等你开个工单再去处理，数据已经发出去了。

### 技术架构

从产品前端代码和 API 结构分析，Tenet Security 的技术栈为：

```
┌──────────────────────────────────────────┐
│         Tenet Security Platform          │
│           React SPA Dashboard             │
├──────────────────────────────────────────┤
│  Agent Inventory │  Agent List           │
│  Session Details │  Policy Management    │
│  Connection Mgmt │  Dashboard            │
├──────────────────────────────────────────┤
│         API Gateway (AWS ALB)            │
│  api.tenetsecurity.io / service-{org}    │
├──────────────────────────────────────────┤
│     Agent-side Simulation Engine         │
│  (Patent-pending runtime protection)      │
├──────────────────────────────────────────┤
│   Auth0 / OAuth Authentication           │
│   auth.tenetsecurity.io                  │
└──────────────────────────────────────────┘
```

| 层级 | 技术选型 |
|------|---------|
| **前端** | React + TanStack Router SPA，模块化架构 |
| **后端** | AWS API Gateway + Lambda（函数计算架构） |
| **认证** | Auth0 + OAuth 流程 |
| **多租户** | 每个客户独立 ALB 端点（service-{org}.tenetsecurity.io），实现租户隔离 |
| **历史域名** | 曾用域名 calm-hubble.com，现已重定向至 tenetsecurity.io |

### 现有客户

从产品代码中的多租户映射表可以推测，Tenet Security 已经有一批早期客户：

| 客户/项目 | 行业 |
|----------|------|
| **Lacourt** | 法律科技 |
| **Gopuff** | 即时配送/零售 |
| **HoneyBook** | 商务管理 SaaS |
| **The Motley Fool** | 金融投资服务 |
| **Schrodinger** | 科学计算/药物研发 |
| **Stable（API）** | 推测为 API 基础设施项目 |

这些客户覆盖了法律、零售、SaaS、金融、生物科技多个垂直行业，说明 Agent 运行时安全是一个**跨行业的通用需求**，不局限于科技公司。

---

## 市场定位：填补 Agent 安全的空白地带

当前 AI Agent 安全市场有多种方案，Tenet Security 的定位在中间地带：

| 方案 | 代表 | 聚焦 | 盲区 |
|------|------|------|------|
| **模型护栏** | Lakera, NVIDIA NeMo | 输入输出过滤 | 无法监控 Agent 行为 |
| **身份安全** | CrowdStrike, Saviynt | Agent 身份与授权 | 不关注运行时行为模式 |
| **数据安全** | Rubrik | Agent 数据访问 | 不关注 Agent 操作行为 |
| **人因安全** | KnowBe4 | 人类使用 Agent 的安全意识 | 不关注 Agent 自身行为 |
| **Agent 运行时安全** | **Tenet Security** | **Agent 操作行为监控** | 新赛道，生态待完善 |

Tenet Security 填补的正是"**Agent 在做什么**"这个层面的监控——**不关心模型说了什么，关心 Agent 做了什么。** 它与护栏方案是互补而非竞争关系：护栏管"能不能这么说"，运行时安全管"能不能这么干"。

### 竞品对比

在 Agent 运行时安全这个细分赛道，目前直接竞争的厂商不多：

| 对比维度 | Tenet Security | Cisco AI Defense | Hush Security |
|---------|---------------|-----------------|--------------|
| **核心能力** | Agent 运行时行为监控 + 实时阻断 | AI 系统全栈安全 | Agent 非人类身份安全 |
| **技术路线** | Agent-side Simulation（专利） | 大公司内部产品线 | 身份安全 |
| **专注度** | 纯 Agent 运行时 | 大公司全栈策略的一部分 | 是 NHI 安全的一个方向 |
| **独特优势** | Agentjacking 攻击研究 + 创新模拟技术 | Cisco 品牌 + 客户基础 | 在身份侧深耕 |
| **阶段** | 种子轮（2025.5 公开） | 成熟产品线 | 早期 |

Tenet Security 的创新在于它用一个**创业公司的敏捷性**来填补大公司产品组合中的"夹缝"——这个夹缝在大公司内部可能永远排不上优先级，但对正在大规模部署 AI Agent 的企业来说，却是生死攸关。

---

## 600 万美元种子轮意味着什么

在当前的 AI 安全投资热潮中，600 万美元的种子轮属于"小而精"。几个信号：

1. **投资人认为这个方向有市场**——Cisco AI Defense 背景的团队做 Agent 运行时安全，赛道逻辑清晰
2. **这个市场还很早期**——种子轮规模不大，说明市场验证还需要时间
3. **人才溢出效应**——顶级大公司的安全团队开始出来独立创业，是这个市场正在形成的强烈信号
4. **投资方背书质量**——The Westly Group 是 SentinelOne 的早期投资人，说明其对企业安全赛道的判断力

---

## 行业纵深分析

### 多维媒体报道视角

多家安全媒体对 Tenet Security 的报道从不同角度刻画了这家公司：

| 媒体 | 报道视角 | 核心看点 |
|------|---------|---------|
| **The Register** | "前 Cisco 研究员创立 Tenet Security 锁定流氓 AI Agent" | 强调创始人背景，将 Agent 安全类比为"AI 时代的端点检测" |
| **VentureBeat** | "融资 600 万保护企业 AI Agent" | 关注市场机会——"AI Agent 能规划、调用工具、触发副作用" |
| **The Hacker News** | "Agentjacking 攻击劫持 AI 编码 Agent" | 聚焦攻击技术细节，影响最大的技术媒体报道 |
| **Dark Reading** | "Agentjacking 攻陷 AI 编码 Agent" | 从攻击者视角分析，面向安全运营人员 |
| **Security Boulevard** | "600 万种子轮隐身模式公开" | 综合报道，涵盖融资 + 产品 + 攻击研究 |
| **SecurityInfoWatch** | "CEO Barak Sternberg 专访" | 创始人的愿景和产品路线图 |

媒体评论中出现了一句非常精准的定性：**"the companies that build the monitoring and enforcement layer will occupy a critical chokepoint"**——构建监控和执行层的公司，将占据 AI Agent 安全生态中的关键战略卡位。

### 与其他事件形成呼应

这则新闻与近期多条 AI Agent 安全动态形成了清晰的趋势：

- **KnowBe4** 推出 Agent Risk Manager——人因层
- **CrowdStrike** 推出 AI Agent 持续身份认证——身份层
- **Rubrik** 集成 AWS Bedrock AgentCore——数据层
- **Cisco** 布局 Agent 安全全栈——从零信任到 NHI 治理
- **Tenet Security** 创立——Agent 运行时行为层

这些公司各自切入了一个层面的 AI Agent 安全问题，但它们的组合正在拼出一个完整的 Agent 安全生态。**Agent 安全的"战区"正在从单一的技术问题变成一个多层、多供应商的完整体系。** Tenet Security 的出现补齐了其中最关键的一环——运行时行为监控。

### 深度洞察

**1. Agent 安全正在经历"端点在 2015 年"的时刻**

2015 年左右，企业开始大规模部署端点设备（笔记本、服务器），催生了 CrowdStrike、SentinelOne 等端点检测与响应（EDR）厂商。如今，AI Agent 正在成为企业 IT 环境中的"新端点"——它们执行代码、访问数据、调用 API，但几乎没有运行时安全保护。Tenet Security 可视为 **"Agent 版的 EDR"**。

**2. 从模型安全到行为安全的范式迁移**

2024 年，AI 安全讨论的核心是 Prompt 注入——如何防止用户欺骗模型。2025-2026 年，随着 AI Agent 从"对话式 AI"进化为"执行式 AI"，安全焦点正在从**模型层面的安全**迁移到**行为层面的安全**。Tenet Security 的成立是这一迁移的明确信号。

**3. "大公司溢出"成为 Agent 安全创业的主要来源**

Cisco AI Defense → Tenet Security、Meta → 多家 Agent 框架创业公司、Google → 独立 AI 安全创业——顶级科技公司的安全团队正在"溢出"为独立创业公司。这不是大公司做不好，而是 Agent 安全的创新速度超出了大公司内部产品线的迭代节奏。

---

## 局限与展望

Tenet Security 目前处于早期阶段，有几个需要关注的点：

1. **产品成熟度**：种子轮阶段的产品意味着功能可能在快速迭代，企业级客户需要关注其稳定性和生态集成能力
2. **生态集成**：Agent 运行时安全需要与现有安全栈集成（SIEM、SOAR、IAM），Tenet 在集成深度上还有待验证
3. **与云平台的关系**：AWS、Azure、GCP 都在建设各自的 Agent 安全层，独立厂商需要证明自己比云平台自有方案更有价值
4. **Agent 协议的碎片化**：不同 Agent 框架（LangChain、CrewAI、AutoGen）使用不同的通信协议，跨框架的运行时监控是技术挑战

---

**参考资料**

- [The Register — Ex-Cisco researchers launch Tenet Security to lock down rogue AI agents](https://www.theregister.com/2026/05/14/tenet_security_ai_agents/)（2026-05-14）
- [VentureBeat — AI security startup Tenet raises $6 million to protect enterprise AI agents](https://venturebeat.com/security/ai-security-startup-tenet-raises-6-million-to-protect-enterprise-ai-agents/)（2026-05-14）
- [The Hacker News — New Agentjacking Attack Hijacks AI Coding Agents to Execute Malicious Code](https://thehackernews.com/2026/05/new-agentjacking-attack-hijacks-ai.html)（2026-05-14）
- [Dark Reading — New Agentjacking Attack Compromises AI Coding Agents for Code Execution](https://www.darkreading.com/application-security/agentjacking-attack-ai-coding-agents-code-execution)（2026-05）
- [Security Boulevard — Tenet Security Emerges From Stealth With $6 Million Seed Funding](https://securityboulevard.com/2026/05/tenet-security-emerges-from-stealth-with-6-million-seed-funding/)（2026-05-14）
- Tenet Security 官网：https://tenetsecurity.io
- 注：部分新闻原文受反爬机制保护无法直接抓取全文，以上内容基于 DuckDuckGo 搜索结果摘要、Google News 标题信息、官网 JS Bundle 分析以及行业知识的综合整理。
