---
layout: post
title: "Lineation.ai：把 AI Agent 安全从网关前移到运行时"
categories: [sec]
description: "基于 Help Net Security 对 Lineation.ai 的报道和官网资料，梳理这类 Agentic AI 安全产品的核心思路：用统一控制平面、分布式运行时执行、可追溯 lineage 来治理自治 Agent 的提示注入、过度授权和数据外流风险。"
tags:
  - AI Agent
  - Zero Trust
  - runtime security
  - Lineation.ai
  - Agentic AI Security
---

Help Net Security 在 2026-07-16 报道了 Lineation.ai，标题是 *Lineation.ai focuses on runtime security for autonomous AI agents*。从公开信息看，Lineation.ai 的定位不是传统模型网关，也不是单点提示注入过滤器，而是面向 autonomous AI agents 的运行时安全控制层。

它官网上的一句话很能概括产品方向：**Draw the line between automation and chaos.**

## 先说结论

Lineation.ai 代表的是 Agent 安全产品的一个明显趋势：

> **只在模型入口做过滤已经不够了，真正的控制点要下沉到 Agent 执行动作的运行时。**

因为 Agent 不只是生成文本，它会读文档、调 API、改代码、动数据、甚至触发财务或业务流程。安全控制如果只停在“调用模型前后看一眼”，就很难解释它到底为什么做了某个动作，更难在出事前拦住。

## Lineation.ai 想解决什么问题

从 Help Net Security 的报道和 Lineation.ai 官网描述看，它关注的风险主要包括：

- prompt injection；
- over-permissioned tools；
- silent data egress；
- shadow agents；
- Agent 行为缺少统一审计上下文。

这些问题的共同点是：它们不是单纯的模型输出质量问题，而是**Agent 在真实环境中执行动作时的治理问题**。

## 它的核心设计：一个控制平面，多处执行

Lineation.ai 强调的是 **one control plane**，同时在工作实际发生的地方做分布式 enforcement。

可以理解为三层：

| 层次 | 作用 | 安全价值 |
|---|---|---|
| 统一控制平面 | 定义策略、查看 Agent 行为、统一治理 | 避免不同模型、不同云、不同工具各管一段 |
| 运行时执行点 | 在 Agent 调工具、读数据、执行动作时介入 | 不只看输入输出，而是在动作发生前后控制 |
| Lineage / 审计链 | 记录 prompt → tool → data → actor 的因果链 | 事后能还原事件，事中能快速判断风险 |

这也是它和普通网关型产品最大的区别：网关看到的是请求流量，Lineation.ai 试图看到的是**Agent 从意图到动作的完整故事**。

## 为什么是 Zero Trust 思路

标题里的 zero trust control plane 不是简单借用热词。放到 Agent 场景里，Zero Trust 至少意味着三件事：

1. **不默认信任 Agent 的意图解释**：Agent 说自己在完成任务，不代表它拿到的数据是真的。
2. **不默认信任工具调用结果**：工具返回、网页内容、文件内容都可能被污染。
3. **不默认信任权限边界自然有效**：Agent 一旦拿到过宽权限，攻击面会被自动化放大。

所以 Agent 安全里的 Zero Trust，本质上是把“永不默认信任，持续验证”从用户访问扩展到 Agent 行为。

## 这类产品为什么会出现

过去企业做 AI 安全，常见控制点是：

- 模型网关；
- DLP；
- 提示词过滤；
- 日志审计；
- SaaS 权限管理。

但 Agent 时代的问题是：风险不只发生在“输入模型”和“模型输出”两个点，而是发生在中间那条链上：模型读了什么、信了什么、调用了哪个工具、拿到了什么数据、最后做了什么动作。

如果这条链没有被记录和约束，安全团队只能在事故之后拼碎片。

## 我怎么看它的价值

Lineation.ai 这类产品真正有价值的地方，不是宣称“防住所有提示注入”，而是把 Agent 安全问题拆成了更工程化的几个控制点：

- 统一看见所有 Agent；
- 给不同 Agent 和工作流绑定策略；
- 在运行时拦截高风险动作；
- 保存可审计的因果链；
- 帮 SecOps 快速复盘“谁让 Agent 做了什么”。

这比单纯做 prompt filter 更接近企业真实需求。

## 仍然需要注意的边界

不过，Lineation.ai 官网资料更多是产品定位和能力描述，公开材料里还看不到足够细的技术实现细节，例如：

- 它如何接入不同 Agent 框架；
- runtime enforcement 的边界在哪里；
- 是否能覆盖本地 CLI Agent、浏览器 Agent、MCP 工具链；
- 策略语言的表达能力如何；
- 性能和误报率如何验证。

所以这篇更适合作为产品方向观察，而不是完整技术评测。

## 结论

Lineation.ai 反映的是一个更大的趋势：Agent 安全正在从“模型安全”走向“运行时治理”。

未来真正能落地的 Agent 安全方案，应该不只是告诉你“这个 prompt 危险”，而是能回答：

> 这个 Agent 为什么要做这个动作？它信任了哪些数据？调用了哪个工具？用了什么权限？如果出事，能不能立刻还原和阻断？

这正是 Agent 安全从概念走向工程化时必须补上的一层。

## 参考资料

- Help Net Security：*Lineation.ai focuses on runtime security for autonomous AI agents*，2026-07-16
- Lineation.ai 官网：Agentic AI Security / Trust as a Service 产品介绍
