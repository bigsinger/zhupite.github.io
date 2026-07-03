---
layout: post
title: "Microsoft 系统分析 AI Agent 从只读到执行的安全挑战"
categories: [sec]
description: "微软安全团队系统分析 AI Agent 从只读走向执行的安全挑战，提出 Agent 安全分级模型 Level 0–4，公布 MCP 安全、工具审计、身份管理和运行时监控四大框架。"
tags:
  - AI Agent
  - Microsoft
  - 安全分级
  - MCP
  - 身份管理
---

## 事件基线

2026 年 6 月 30 日，Microsoft 安全团队在 Security Blog 发表文章《Securing AI Agents: When AI Tools Move from Reading to Acting》，系统分析了 AI Agent 从「只读」阶段走向「执行」阶段的安全挑战。

这是当日一系列 Agent 安全公告的**理论基础文章**——与前一篇报道的 MCP 工具描述攻击路径不同，这篇文章讨论的是「Agent 为什么需要新的安全模型」。

## 核心论点

Microsoft 的核心判断是：AI 安全正在经历一次**根本性的范式转移**。

过去几年，AI 安全的核心问题可以概括为「模型可能说出不该说的东西」——Prompt 注入改变输出、数据泄露暴露训练数据。在这个阶段，风险停留在**信息层面**。

当 Agent 开始代表用户执行操作时，问题变成了「Agent 可能做出不该做的事」——发送邮件、修改代码、创建账号、操作数据库。风险从**信息层面跃迁到了操作层面**。

Microsoft 的表述很清晰：当 AI 只能阅读和总结时，攻击改变输出；当 AI 能够执行时，攻击改变实际发生的事。

## Agent 安全分级模型

Microsoft 提出了一个实用的 Agent 安全分级模型，从 Level 0 到 Level 4，每级对应不同的安全控制要求：

| 等级 | 能力范围 | 安全控制要求 | 典型场景 |
|:----:|---------|------------|---------|
| **Level 0** | 无工具调用 | 标准 LLM 安全（输入输出过滤） | 纯聊天机器人 |
| **Level 1** | 读取工具（只读） | 数据访问控制、内容审计 | Agent 读取文档、查询数据库 |
| **Level 2** | 写入工具（受限） | 操作审批、变更回滚 | Agent 创建文档、发送通知 |
| **Level 3** | 执行工具（高风险） | 人工审批兜底、操作限额 | Agent 执行代码、转账 |
| **Level 4** | 完整系统控制 | 持续认证、行为基线、实时阻断 | 自主运维 Agent |

这一分级模型的价值在于：**不是所有 Agent 都需要最严格的安全控制**。一个只读的文档摘要 Agent 和一个人资 Agent（能创建员工账号、修改薪酬记录）需要完全不同的安全策略。

## Microsoft 的 Agent 安全框架

文章公布了 Microsoft 内部使用的 Agent 安全框架，涵盖四大支柱：

### 1. MCP 安全
- MCP 工具声明的完整性校验
- 工具描述变更的审批和审计
- MCP 调用链的端到端追踪

### 2. 工具审计
- 所有工具调用的完整日志
- 工具调用的行为基线建立
- 异常工具调用模式的自动检测

### 3. 身份管理
- 每个 Agent 拥有独立的数字身份
- Agent 身份与人类身份的解耦
- Agent 身份的生命周期管理

### 4. 运行时监控
- Agent 操作的实时监控和阻断
- 多步操作链的语义分析（而非单步检查）
- 基于行为基线的异常检测

## 与本周其他事件的关联

Microsoft 这篇文章在理论上解释了为什么本周所有 Agent 安全事件都指向同一个方向：

| 本周事件 | Microsoft 框架中的对应 |
|---------|-------------------|
| MCP 工具描述攻击 | MCP 安全支柱——工具声明完整性 |
| Claude Code 系统接管 | 身份管理支柱——Agent 身份独立 |
| Cisco AI Defense SDK | 运行时监控支柱——操作实时检测 |
| Vorlon Guardian Gateway | 工具审计支柱——调用链追踪 |

Microsoft 的分层模型提供了一个统一的理论框架：**Agent 安全控制的需求取决于 Agent 的操作等级，而不是 Agent 使用的技术栈**。

## 参考资料

- Microsoft Security Blog: "Securing AI agents: When AI tools move from reading to acting"（2026-06-30）— Microsoft Security Blog
- 前文所述的同日 Microsoft 文章：[Microsoft 将 MCP 工具描述标记为隐藏的 AI Agent 攻击路径](/sec/microsoft-mcp-tool-description-attack.html)
