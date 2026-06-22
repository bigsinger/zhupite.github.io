---
layout: post
title: "Saviynt 为 AI Agent 推出「意图感知的运行时授权」：当身份安全的战场延伸到 Agent 运行时"
categories: [sec]
description: "Saviynt 发布 Agent Access Gateway 的重大增强版本，引入 Intent-Aware Runtime Authorization (IARA) 能力——在 Agent 执行具体操作时基于其意图进行动态权限评估。这标志着 IAM 行业正式进入 Agent 运行时安全时代。"
tags:
  - saviynt
  - runtime-authorization
  - agent-security
  - iam
  - least-privilege
---

2026 年 6 月 16 日，Saviynt 在 Identiverse 大会上宣布了其身份安全平台的一次重要扩展——**Agent Access Gateway** 推出了一个全新的能力：**Intent-Aware Runtime Authorization（IARA，意图感知的运行时授权）**。

这句话有点长，但拆开来看的意思非常清晰：**当 AI Agent 决定要做一件事的时候，Saviynt 可以在它真正动手之前，判断这个「意图」是否合理，然后决定放行还是拦截。**

## 一、Saviynt 的产品架构：不只是网关

Saviynt 的整体产品不是单点网关，而是一个 **AI Identity Control Plane**，大体分三层：

| 层 | Saviynt 能力 | 解决的问题 |
| --- | --- | --- |
| Posture Management | 发现 Agent、MCP Server、工具、模型连接；生成访问地图和时间线 | 先知道企业里有哪些 Agent、能访问什么、有没有影子 Agent |
| Identity / Lifecycle Management | Agent 注册、Owner、用途、范围、继承人、下线、权限申请审批 | 把 Agent 当成一种新型 NHI / 特权身份治理 |
| Agent Access Gateway / IARA | 每次工具/API/应用动作执行前做运行时授权 | 判断「这个 Agent 现在做这件事是否符合原始意图」|

Saviynt 产品页明确把 Agent Access Gateway 定义为：识别 Agent 是独立行动、代表人类、还是代表另一个 Agent；并在运行时评估 **intent、identity、context、risk、policy** 来授权每个 Agent 动作。

## 二、传统 IAM 在 Agent 时代的两大盲区

在理解 IARA 的意义之前，先看看传统身份与访问管理（IAM）体系在 Agent 场景中遇到了什么麻烦。

### 2.1 静态权限无法应对动态决策

传统的访问控制模型本质上是一个 **「通行证」模型**——Human A 属于 Role R，Role R 有权访问 Resource X。只要 Human A 没被降权，他就能一直访问 Resource X。

但 AI Agent 不是这样的。Agent 会自己「想事情」——它接收一个任务目标，然后自主规划路径、选择工具、决定执行什么操作。**Agent 的每一次操作选择都不是预先定义好的，而是实时推理出来的。**

举个例子：一个销售 Agent 被授权访问 CRM 数据来「总结客户机会」。这是合理的。但如果这个 Agent 在运行时突然决定「顺便把客户数据导出到外部系统」或「修改一下定价条款」——在传统 IAM 模型里，只要 Agent 有 CRM 的 API 访问权限，它就能做这些事。**权限模型看不到「意图」的区别。**

### 2.2 Agent 的「谁在操作」变得模糊

传统的 IAM 回答三个问题：

- **你是谁**（身份）
- **你能做什么**（权限）
- **你做了什么**（审计）

但 Agent 时代引入了新的维度：

- Agent 是自主操作，还是在代表人类操作？
- Agent 是在执行原始指令，还是产生了「意外」的新意图？
- 多个 Agent 之间协作时，权限应该如何传递？

这些问题，传统模型一个都回答不了。

## 三、IARA 做了什么

IARA 的核心思路是：**从「检查权限」升级为「检查意图」**。

### 3.1 实时意图评估

Agent 每次要向某个工具、API 或数据源发起操作时，Agent Access Gateway 会拦截这次请求，并实时评估：

1. **Agent 的当前意图是什么？**——它要做什么操作？（查询？修改？删除？导出？）
2. **这个意图是否符合原始委托的边界？**——用户的原始任务是否允许这个操作？
3. **这个操作落在什么风险等级？**——是常规操作还是需要额外审批？

如果评估发现操作超出了批准的边界，Gateway 会**直接拦截并生成审计事件**。

### 3.2 静态 + 动态策略的双重保障

Saviynt 的策略引擎支持两套规则：

- **静态策略**：预先定义的规则，如「销售 Agent 只能访问 CRM 的 READ API」
- **动态策略**：运行时评估的规则，如「如果 Agent 试图在同一分钟内调用 10 次以上的 DELETE API，则触发熔断」

两者的结合使得 Agent 既有明确的操作边界，又有灵活的风险响应能力。

### 3.3 操作主体识别

Saviynt 的 Gateway 能够识别 Agent 操作时的主体关系：

- Agent 是完全自主执行（autonomous）
- Agent 是代表某个人类用户执行（on-behalf-of）
- Agent 是通过另一个 Agent 间接操作（agent-to-agent）

不同的主体关系触发不同的权限模型——**不再是一个 Agent 一个角色的粗暴绑定，而是基于操作上下文动态计算有效权限**。

### 3.4 双向访问控制

这次的发布还引入了**入站和出站双向访问控制**：

- **入站**：谁能和这个 Agent 交互？哪些用户可以调用这个 Agent？
- **出站**：这个 Agent 能访问哪些应用、数据和资源？

双向控制的加入使 Agent 不再是「黑箱」——它自身也是一个受保护的资源，不是谁都能随便调用的。

## 四、Saviynt 的实现方案：四个递进阶段

Saviynt 没有开源实现细节，但其官方博客已经把关键路径讲得比较清楚：**Agent Access Gateway 位于 Agent Client 和 MCP Server 之间，接收工具调用请求，先做策略评估，再决定转发或拒绝，动作在到达真实应用前被拦截。**

它的实现思路可以拆成四个递进阶段：

| 阶段 | 机制 | 实现含义 |
| --- | --- | --- |
| Phase 1：Credential Pass-through | 每个工具调用都必须携带用户自己的有效 Token，而不是 Agent 的大权限服务账号 | 先把 Agent 权限绑定到「用户本来能做什么」，避免服务账号横向扩大权限 |
| Phase 2：Tool Filtering | 根据 Agent 类型、会话上下文、声明意图，下发过滤后的工具清单 | Agent 只能看到/调用允许的工具；即使被提示词注入，也无法调用未下发工具 |
| Phase 3：Token Exchange & Data Scoping | 用用户 Token 换取更窄范围的短期 Token，Token 里带资源 ID、文档 ID、时间范围、数据分类等 Claims | 实现任务级、资源级最小权限，而不是复用用户完整权限 |
| Phase 4：Agent Lifecycle Attributes | 把 Agent 自身属性加入授权判断：模型版本、是否通过审核、是否允许访问 PII、异常分数等 | 授权不只看用户，还看 Agent 是否可信、是否越界、是否异常 |

这些阶段均来自 Saviynt 的 Agent Access Gateway 实现说明，尤其是「网关位于 Agent 和 MCP Server 之间」「工具过滤」「Token Exchange」「Agent 生命周期属性进入策略判断」等内容。

同时，Saviynt 还做了 **设计期意图分析**：Agent 注册时分析其声明目标，把目标映射到所需工具、权限、资源，并检查是否存在过度授权或目标不匹配。例如一个「CRM 机会总结 Agent」如果拥有导出客户记录、修改报价、触发外呼等能力，会被标记为偏离声明目标。

## 五、它和普通 AI Gateway 的区别

Saviynt 特意区分了三类网关：

| 网关类型 | 关注点 | 不足 |
| --- | --- | --- |
| Content Security Gateway | 提示词注入、敏感信息泄露、输出安全 | 主要看 Prompt / Response，不知道工具动作是否合理 |
| MCP / LLM Routing Gateway | 模型路由、MCP Server、API、工具连接控制 | 只能判断「能不能连到工具」，不能判断「连上后能不能做某个动作」|
| **Agent Access Gateway** | **工具动作级授权** | 解决「Agent 连接后到底被允许做什么」的问题 |

Saviynt 明确说，Prompt 过滤、模型治理、MCP 连接控制、运行时授权解决的是不同问题，不能混为一谈；Agent Access Gateway 解决的是「Agent 连接系统之后，到底被授权执行哪些具体动作」。

这个判断和行业里的 AARM（Autonomous Action Runtime Management）思路一致：Agent 安全边界正在从「模型输出」转向「工具执行动作」，系统应该在动作执行前拦截、积累会话上下文、评估策略与意图一致性，并留下可审计证据。

## 六、行业意义：IAM 厂商终于开始认真对待 Agent 安全了

### 6.1 IAM 行业的 Agent 安全赛道正在成形

Saviynt 的这个发布是 IAM 行业的标志性事件。在过去的一年里，我们看到了大量关于 Agent 安全的讨论，但大多数都集中在：

- Agent 开发框架的安全（LangChain、AutoGen）
- Agent 运行时监控（Cisco、CrowdStrike）
- Agent 通信安全（mTLS、API 安全）

但 **身份安全** 的缺失一直是 Agent 安全中最明显的盲区。Agent 有「身份」吗？Agent 的「权限」怎么定义？Agent 的操作「日志」怎么追溯？

Saviynt 的 IARA 是 IAM 厂商给出的第一个系统性的答案。

### 6.2 与 Saviynt 之前发布整合

Saviynt 并非首次涉足 Agent 安全领域。此前他们已经推出了：

- **Identity Security for AI**（2026 年 3 月）——业界首个面向 AI Agent 的身份控制平面
- **AI Agent 生命周期管理**——Agent 从创建到退役的完整身份生命周期
- **与 LangChain 的集成**——开发生命周期中的安全嵌入

IARA 的发布让 Saviynt 的 Agent 安全方案从「管理」延伸到「运行时控制」，补齐了核心拼图。

### 6.3 集成生态扩展

这次的发布还新增了多个原生集成，包括 Microsoft Foundry、N8N、Snowflake Cortex。这意味着 IARA 不是 Saviynt 平台内部的闭环能力——它正在成为跨平台的 Agent 运行时安全层。

## 七、如果要实现，建议做成「意图感知 Tool Gateway + Agent 身份控制平面」

结合我们对 Agent 安全领域的持续追踪，建议不要从传统 IGA 全量产品切入，而是优先做 **轻量但强执行的 Agent Runtime Access Gateway**。核心定位可以是：

> 在 Agent 每次调用工具、API、MCP Server、文件、命令、数据库、企业系统之前，判断该动作是否符合用户原始意图、Agent 声明用途、当前上下文、企业策略和最小权限要求。

推荐架构如下：

```text
用户 / 业务系统
     │
     ▼
Agent Runtime / OpenClaw / Hermes / Nanobot / LangChain / CrewAI
     │
     ▼
Agent Runtime SDK / MCP Proxy / Tool Gateway / Sidecar
     │
     ├── 1. Agent 身份注册中心
     ├── 2. 会话上下文采集器
     ├── 3. 意图识别与行为链分析
     ├── 4. 策略决策引擎
     ├── 5. STS / Token Broker
     ├── 6. ASK 审批与降权执行
     └── 7. 审计与证据链
     │
     ▼
MCP Server / 企业 API / 数据库 / 文件 / 命令 / SaaS 应用
```

## 八、关键模块怎么做

| 模块 | 我们要实现什么 | 技术要点 |
| --- | --- | --- |
| Agent Registry | 给每个 Agent 建身份档案 | agent_id、owner、用途、允许工具、模型版本、部署位置、风险等级、数据访问级别 |
| Intent Profile | 注册期声明 Agent 意图 | 用自然语言 + 结构化字段描述：目标、边界、禁止动作、允许资源、工具集合 |
| Runtime Interceptor | 拦截每次工具调用 | MCP Proxy、Tool Gateway、SDK Hook、Sidecar；优先从 MCP/HTTP 工具调用做起 |
| Context Collector | 记录会话链路 | 用户请求、Agent 计划、历史工具调用、读取过的数据、当前动作、动作参数、目标资源 |
| Intent Engine | 判断动作是否符合意图 | 规则 + LLM 分类 + 行为序列分析 + 相似度匹配 + 风险模型 |
| Policy Engine | 给出决策 | ALLOW / DENY / ASK / LIMIT / REDACT / SCOPED_TOKEN |
| STS / Token Broker | 发放短期、窄权限凭证 | 支持 OAuth 2.0 Token Exchange / 内部临时凭证 / Vault 动态密钥 |
| Enforcement | 执行动作控制 | 工具过滤、参数裁剪、只读降级、数据脱敏、审批后执行、阻断 |
| Audit Trail | 审计与追溯 | action、intent、policy、decision、reason、approver、token_scope、before/after |

这里 **STS / Token Broker 是必须做的**，否则只能做到工具层拦截，做不到真正的「任务级最小权限」。OAuth 2.0 Token Exchange 本身就是用于让授权服务器充当 STS，把已有 Token 换成适合新上下文的新 Token。

## 九、一个运行时授权流程

以「销售 Agent 总结某客户商机」为例：

1. **用户发起任务**：
   「帮我总结 A 客户 Q2 商机进展。」

2. **Agent Gateway 建立会话**：
   绑定 `user_id`、`agent_id`、`task_id`、`intent=summarize_crm_opportunity`。

3. **Gateway 生成允许工具清单**：
   允许：`crm.read_opportunity`、`crm.read_activity`、`doc.generate_summary`。
   禁止：`crm.export_records`、`crm.update_price`、`email.send_external`。

4. **Agent 调用 `crm.read_opportunity(customer=A)`**：
   符合意图，允许。

5. **Agent 被提示词注入后尝试调用 `crm.export_records(all_customers=true)`**：
   工具不在当前 Manifest，且目标资源超出任务范围，拒绝。

6. **Agent 尝试发送邮件给外部地址**：
   不一定直接拒绝，可以进入 ASK 审批，展示「为什么发、发给谁、包含哪些数据、是否含敏感字段」。

7. **所有动作进入审计**：
   包括原始意图、动作、参数、策略命中、决策、风险理由。

## 十、MVP 建议分四步落地

| 阶段 | 目标 | 交付物 |
| --- | --- | --- |
| V0.1：工具调用拦截 | 先拿到 Agent 调用工具的事实 | MCP Proxy、HTTP Tool Gateway、SDK Hook、统一 action schema、审计日志 |
| V0.2：静态 + 动态策略 | 做到「哪些 Agent 能调用哪些工具」 | Agent Registry、Tool Manifest、ALLOW/DENY/ASK、策略中心 |
| V0.3：意图感知授权 | 做到「这个动作是否符合本次任务」 | Intent Profile、会话上下文、行为链、LLM/规则混合评分、意图偏离告警 |
| V0.4：最小权限凭证 | 做到「即使工具被调用，也只能访问任务范围内的数据」 | STS、短期 Token、资源级 Claims、Vault/IdP 集成、动态撤销 |

优先级上，建议先做 **MCP / Tool Gateway**，不要一开始做完整 IGA。Saviynt 的强项是身份治理平台，而与之差异化的机会在于 **运行时行为控制、工具拦截、ASK 审批、沙箱、DLP、行为链分析**，更贴近 Agent 安全落地。

## 十一、我们可以做出的差异化

| Saviynt 方向 | 我们可以怎么差异化 |
| --- | --- |
| 偏 IAM / IGA / NHI 治理 | 偏 Agent Runtime Security，部署更轻，能接 OpenClaw、Hermes、Nanobot、LangChain、MCP |
| 强调身份生命周期、权限治理 | 强调行为链、意图偏离、工具调用拦截、数据防泄漏 |
| 需要企业身份体系深度集成 | 支持无侵入 Sidecar / Proxy / SDK，客户不一定先有完整 IGA |
| 运行时授权基于 Agent Access Gateway | 可以扩展到文件、命令、网络、数据库、MCP、SaaS API、终端行为 |
| 审计偏身份合规 | 可以做「攻击链 / 行为链 / 证据链 / 复盘报告」|

## 十二、产品命名建议

可以把这条能力包装成核心模块：

**Intent-Aware Agent Access Gateway**

中文可叫：
- **意图感知 Agent 运行时授权网关**
- **Agent 动态最小权限网关**

对外一句话：

> 在 Agent 每次执行工具/API/数据操作前，动态判断「谁在操作、代表谁、为什么操作、是否符合任务意图、是否超出最小权限」，并自动执行允许、阻断、降权或人工审批。

这条能力非常值得做，而且它正好可以成为「深度行为分析 + 工具管控 + JIT 授权 + 数据防泄漏」的统一入口。最小可行版本不需要复制 Saviynt 的完整身份平台，先把 **Tool Gateway + Agent Registry + Intent Policy + ASK + Audit** 做出来，就能形成可演示、可销售的核心能力。

## 十三、小结

Saviynt 的 CPO Vibhuti Sinha 在发布中说了一段话，精准概括了 IARA 的价值：

> **「AI Agent 正在成为企业用户的新类别——自主、强大，能够在关键业务系统中采取行动。Agent Access Gateway 让企业能够在真正的决策时刻控制这些 Agent。借助 IARA，企业可以超越静态权限，基于 Agent 的意图来做访问决策。」**

这句话的核心逻辑是：**当 Agent 的「决策」和「行动」在运行时才真正发生，安全控制也必须发生在运行时。**

静态权限模型不是要淘汰，但它已经不够了。Intent-Aware Runtime Authorization 不是 Saviynt 一家厂商的噱头——它是整个 IAM 行业必须面对的未来。

---

**参考资料**

1. [Saviynt Expands Identity Security for AI Solution With Intent-Aware Runtime Authorization for AI Agents](https://saviynt.com/press-release/saviynt-expands-identity-security-for-ai-solution-with-intent-aware-runtime-authorization-for-ai-agents?hsLang=en) — Saviynt 新闻稿
2. [Identity Security for AI: Secure Your AI Agents](https://saviynt.com/products/identity-security-for-ai) — Saviynt 官方产品页
3. [Agent Access Gateway: Closing AI Agent Authorization Gaps](https://saviynt.com/blog/closing-ai-agent-authorization-gaps) — Saviynt 官方博客
4. [New AI Agent Governance Capabilities Across Identity Security for AI](https://saviynt.com/blog/identity-security-for-ai-agent-access-gateway-identity-management-posture-management) — Saviynt 官方博客
5. [Autonomous Action Runtime Management (AARM): A System Specification for Securing AI-Driven Actions at Runtime](https://arxiv.org/abs/2602.09433) — arXiv
6. [RFC 8693: OAuth 2.0 Token Exchange](https://www.rfc-editor.org/info/rfc8693)
7. Saviynt 在 Identiverse 2026 大会上的发布
