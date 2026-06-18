---
layout: post
title: "Stripe Projects + AI Agent：当支付基础设施向 Agent 经济敞开大门"
categories: [dev]
description: "Stripe 宣布扩大 Stripe Projects，让 AI Agent 可以直接从 CLI 配置基础设施、管理支付、创建订阅。关键数据：Agent 流量已超越人类流量、Stripe 文档的 40% 流量来自 Agent、70% 的 CLI API 请求由 Agent 发出。这标志着 Agent 经济的支付基础设施正在成形。"
tags:
  - Stripe
  - AI Agent
  - 支付
  - Agent经济
  - Hermes
  - AWS
  - 基础设施
---

Stripe 近日宣布扩大 **Stripe Projects** 的 Agent 集成能力，让 AI Agent 可以直接从命令行配置支付基础设施、管理订阅、创建完整的商业产品。同时，AWS 也在联合推动这一方向——让内容所有者和发布商可以通过 AI Agent 自动处理支付和订阅。

这看起来像是一个普通的产品更新。但如果放在更大的背景中——它可能是 **Agent 经济（Agentic Economy）从概念走向落地的一个关键基础设施节点**。

---

## 一组引人深思的数据

Stripe 在博文中公布了几条关键数据：

> **上周，Agent 流量首次超过了人类流量。**

具体来说：

| 指标 | 数据 |
|------|------|
| **Stripe 文档的 Agent 流量增长** | 2025 年增长 **10 倍以上**，现在占文档总流量的 **~40%** |
| **CLI API 请求来源** | **70%** 的请求来自 AI Agent |
| **Stripe CLI 用户增长** | 过去一年**指数级增长** |

这些数据说明了一个趋势：**Agent 已经在大量使用 API，但它们在使用 API 之后的"相邻步骤"——配置基础设施、管理凭证、设置账户、连接服务——仍然需要人类介入。** Stripe Projects 要解决的就是这个缺口。

---

## Stripe Projects 做了什么

Stripe Projects 的核心能力是让开发者（和 AI Agent）通过 CLI 完成基础设施的配置和管理。这次更新扩大了三个方向：

### 1. Agent 可以直接配置基础设施

Stripe Projects 现在以 **Skill（技能）** 的形式集成到了多个 AI Agent 平台：

- **Hermes Agent**（Nous Research 的开源自改进 AI Agent）——Stripe Projects 作为一项 Skill 嵌入，Agent 可以在多会话之间持续协作
- **Factory Droids**——模型无关的编码 Agent
- **Warp**——模型无关的编码 Agent

这意味着：你可以在 Hermes 里给 Agent 一个指令，Agent 就能通过 Stripe Projects 直接配置支付基础设施。Agent 不再是"只写代码不部署"的角色。

### 2. 新增 16 个服务提供商

Stripe Projects 的连接器总数达到 **49 个**。新加入的提供商包括：

- **Metronome**（Stripe 产品）——用量计费
- **Wix**——面向用户的在线商店
- **ClickHouse**——LLM 可观测性（监控成本、延迟、质量）

一个 Agent 现在可以做到：**搭建一个 AI 驱动的产品 → 绑定支付 → 监控模型成本——全部从第一次调用开始，不需要人类点击仪表盘。**

### 3. 开发者控制权

虽然 Agent 可以自主操作，但开发者仍然可以通过新的控制机制设定权限边界——哪些服务 Agent 可以操作、哪些需要审批。

---

## 为什么这很重要

### AI Agent 的商业模式正在成形

Agent 经济的核心问题一直是：**Agent 怎么赚钱？**

如果 Agent 只能帮人写代码、回答问题、生成内容，它只是一个成本中心。但一旦 Agent 能配置支付系统、创建订阅、处理账单——它就从一个"工具"变成了一个"能独立产生收入的经济主体"。

Stripe Projects + AWS 的联合方向，就是为 Agent 提供"开店"的能力——Agent 可以用自然语言描述它想提供的服务，然后 Stripe 帮它搞定支付、账单、订阅管理。

### 从"Agent 写代码"到"Agent 部署产品"

过去 Agent 能做到的最多是"写了代码，等人去部署"。

现在 Agent 可以：
1. 写代码
2. 通过 Stripe Projects 配置支付
3. 通过 AWS 配置基础设施
4. 部署上线
5. 开始收钱

**从"写代码"到"收钱"的链路首次被 Agent 完整覆盖。**

### 我们的 Hermes 已经在用

值得注意的是，Stripe Projects 是作为 **Hermes Agent 的 Skill** 发布的。我们用的就是 Hermes——所以这不是"未来的事"，这是已经能做的事。在 Hermes 里给 Agent 装一个 Stripe Projects Skill，它就能直接操作支付基础设施。

---

## 更大的图景

这则新闻放在 AI Agent 发展的脉络中来看，是一个重要的里程碑节点：

| 阶段 | 时间 | 关键事件 |
|------|------|---------|
| **Agent 能聊** | 2023-2024 | ChatGPT、Claude 等对话模型 |
| **Agent 能写** | 2024-2025 | Claude Code、Cursor、Cody |
| **Agent 能调用 API** | 2025-2026 | MCP、Function Calling |
| **Agent 能支付/收钱** | **2026** | **Stripe Projects + AWS** |

再往前一步——如果 Agent 能自己收钱、自己支付成本——那它就具备了"自主经济实体"的基本要素。支付基础设施是 Agent 经济从概念走向落地的**最后一个关键基础设施环节**。

---

**参考资料**

- Stripe Blog：[Stripe Projects adds new agent integrations](https://stripe.com/blog/stripe-projects-adds-new-agents-providers-developer-controls)（2026-06）
- Stripe 新闻室：stripe.com/newsroom
- AWS 相关公告
- Google News 聚合：Stripe 和 AWS 为内容所有者和发布商启用 AI Agent 支付
