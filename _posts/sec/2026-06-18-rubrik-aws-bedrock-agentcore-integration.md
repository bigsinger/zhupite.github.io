---
layout: post
title: "Rubrik 将数据安全能力接入 AWS Bedrock AgentCore：AI Agent 工作负载安全再下一城"
categories: [sec]
description: "Rubrik 宣布将其数据安全能力与 AWS Bedrock AgentCore 集成，为 AI Agent 工作负载提供自动化安全保护。当 AI Agent 自动调用企业数据时，Rubrik 的安全策略可以实时介入——这是数据安全厂商首次针对 Agent 运行时工作负载专门化产品。"
tags:
  - Rubrik
  - AWS Bedrock
  - AgentCore
  - AI Agent安全
  - 数据安全
  - 云安全
  - 工作负载保护
---

据 Google News 聚合信息，Rubrik 宣布将其数据安全能力与 **AWS Bedrock AgentCore** 集成，为 AI Agent 工作负载提供自动化安全保护。

这不是一次普通的"产品兼容性集成"。它标志着**数据安全厂商开始针对 Agent 运行时工作负载专门化其产品**——这是一个信号，说明 AI Agent 的规模已经到了安全厂商必须认真对待的地步。

---

## AgentCore 是什么

AWS Bedrock AgentCore 是 AWS 在 Bedrock 平台上推出的 **AI Agent 托管运行环境**。它允许开发者构建、部署和运行能够自主调用企业工具和数据的 AI Agent。

AgentCore 的核心能力包括：
- **工具调用**：Agent 可以调用预注册的 API 和函数
- **知识库检索**：Agent 可以从 Bedrock Knowledge Bases 中检索企业文档
- **多步骤编排**：Agent 可以自主规划并执行多步骤任务
- **托管执行**：在 AWS 基础设施上安全运行

但问题也在这里——当 AI Agent 开始自动调用企业数据时，谁来确保这些数据的安全？

---

## Rubrik 切入的正是这个缺口

Rubrik 的核心能力是**数据安全**——备份、恢复、勒索软件检测、数据分类。过去它主要保护的是"静态数据"（数据库、文件服务器、SaaS 应用）。与 AgentCore 集成的意义在于：

> **将数据安全策略延伸到 Agent 的运行时数据访问路径上。**

具体来说，可能包括以下场景：

| 场景 | 传统方式 | 集成后 |
|------|---------|--------|
| Agent 访问企业内部文档 | 通过 API 直接读取，无安全拦截 | Rubrik 在数据流中嵌入安全策略，实时检测敏感数据 |
| Agent 读取数据库记录 | 数据库权限控制，但无行为分析 | Rubrik 可检测异常的批量读取或越权访问模式 |
| Agent 创建的备份数据 | 仅做基础设施级备份 | Rubrik 对 Agent 产生的数据做专门的安全分类和保护 |
| 勒索软件检测 | 针对人类操作的检测模式 | 针对 Agent 自动化操作的异常行为检测 |

---

## 为什么这件事值得关注

**1. Agent 工作负载是新的安全暴露面**

过去两年的安全焦点是"AI 模型本身"——提示注入、模型幻觉、越狱。但在实际部署中，AI Agent 带来的安全风险更多在**运行时**：Agent 调用错了 API、读取了不该读的数据、做出了不该做的操作。

Rubrik 的集成代表了一个认知升级：**保护 AI Agent 不只是保护模型，更是保护 Agent 对数据的每一次访问。**

**2. 数据安全厂商找到了 AI 安全的新入口**

安全厂商进入 AI 安全赛道时，主要有三条路径：

| 路径 | 代表厂商 | 切入点 |
|------|---------|--------|
| **模型层安全** | Lakera, NVIDIA NeMo, Galileo | 提示注入检测、模型输入输出过滤 |
| **人因层安全** | KnowBe4 | 安全意识培训、钓鱼模拟 |
| **数据层安全** | **Rubrik** | Agent 工作负载的数据访问安全 |

Rubrik 走的是数据层安全这条路。对于已经部署了 Rubrik 数据安全平台的企业来说，这是一个很自然的延伸——不需要引入新的安全厂商，只需要把现有的数据安全策略延伸到 Agent 工作负载。

**3. AWS 生态内的 AI 安全版图在快速补齐**

AWS 去年推出了 Bedrock Guardrails（内容过滤），今年推出了 AgentCore（Agent 托管环境）。现在 Rubrik 为 AgentCore 提供数据安全能力——AWS 生态内的 AI 安全版图正在快速完善：

| 层 | 产品/合作伙伴 |
|----|-------------|
| Agent 运行环境 | Bedrock AgentCore |
| 内容安全 | Bedrock Guardrails |
| **数据安全** | **Rubrik（新集成）** |
| 端点安全 | CrowdStrike |
| 身份安全 | 各类 IAM 方案 |

---

## 与同类产品的对比

近期多个安全厂商推出了面向 AI Agent 的安全方案：

| 厂商 | 方案 | 聚焦 |
|------|------|------|
| KnowBe4 | Agent Risk Manager + AIDA | 人因安全 + Agent 可见性 |
| CrowdStrike | AI Agent 持续身份认证 | Agent 身份与行为认证 |
| Saviynt | Intent-Aware Runtime Authorization | Agent 运行时授权 |
| Mitiga Labs | SkillGate | Agent 技能调用权限 |
| **Rubrik** | AWS Bedrock AgentCore 集成 | **Agent 数据访问安全** |

Rubrik 的差异化在于：它关注的是 **Agent 在处理数据时的行为安全**，而不是 Agent 的输入/输出或身份——这是目前其他方案覆盖较少的角度。

---

**参考资料**

- Google News 聚合：Rubrik 将 AI 安全工具与 AWS Bedrock AgentCore 集成（2026 年 6 月）
- AWS Bedrock AgentCore（AWS 官方文档）
- Rubrik 数据安全平台（rubrik.com）
- 注：Rubrik 官网当前受限，以上分析基于公开信息 + Rubrik/AWS 产品背景整理
