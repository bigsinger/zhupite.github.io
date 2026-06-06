---
layout: post
title: "微软 Execution Containers：为 AI Agent 划定的安全边界"
categories: [dev, ai]
description: "微软 Build 2026 发布 Microsoft Execution Containers（MXC），为 AI Agent 提供进程级与会话级隔离，支持通过 Intune/Entra/Defender 集中管控。预映版已可用，Agent 365 集成将于 7 月开放。"
keywords: Microsoft Execution Containers, MXC, AI Agent, 安全容器, 进程隔离, Agent 365, OpenClaw
tags:
  - Microsoft
  - AI Agent
  - 容器安全
  - Windows
  - MXC
---

## 背景：AI Agent 越强大，越需要边界

随着 AI Agent 变得越来越自主——自动写代码、访问文件、执行多步骤任务——它们也变得难以预测和控制。一次小小的误用，就可能导致数据泄露或越权操作。这是 AI Agent 在企业落地时面临的核心矛盾：**能力越强，风险越大**。

过去一年，行业内解决 Agent 安全的主流思路是"**沙箱 + 鉴权**"：把 Agent 关在沙箱里运行，然后用 API 级别的权限控制限制其行为。但这种方案的问题是——沙箱是"全有或全无"的，Agent 要么关在笼子里什么都做不了，要么放出来就毫无约束，缺少**细粒度的、可按场景动态调整的权限边界**。

微软在 Build 2026 上发布的 **Microsoft Execution Containers（MXC）**，正是为了解决这个问题。

## MXC 是什么

MXC 是 Windows 上新增的**安全执行层**，一个专门为 AI Agent 设计的、策略驱动的隔离运行环境。它同时支持 **Windows** 和 **WSL（Windows Subsystem for Linux）**，适用于跨平台 Agent 工作负载。

下图是 MXC 的核心架构思路：

```
┌─────────────────────────────────────────┐
│          Windows 桌面 / WSL              │
│  ┌──────────────────────────────┐        │
│  │     MXC Execution Container   │        │
│  │  ┌───────────────────┐       │        │
│  │  │   AI Agent 进程    │       │        │
│  │  │  (限制的上下文)    │       │        │
│  │  └───────────────────┘       │        │
│  │  策略层: 文件/网络/应用访问     │        │
│  │  隔离层: 进程级 / 会话级       │        │
│  └──────────────────────────────┘        │
│                                           │
│  Intune 策略推送 → Entra 身份绑定          │
│  Defender 运行时监控 → Purview 合规审计     │
└─────────────────────────────────────────┘
```

核心思想就一句话：**开发者或管理员声明 Agent 能访问什么，MXC 在运行时强制执行这些规则。**

## 两个隔离级别

MXC 提供了两层隔离，让组织根据 Agent 的风险等级灵活选择：

| 隔离级别 | 运行方式 | 适用场景 | 示例 |
|---------|---------|---------|------|
| **进程隔离** | Agent 运行在同用户会话内，通过策略限制其访问 | 低风险任务 | 简单工具调用、自动化脚本 |
| **会话隔离** | Agent 的运行与用户桌面、UI、剪贴板、输入设备完全分离 | 高风险任务 | 可自主执行多步操作的 Agent |

### 进程隔离（Process Isolation）

这是轻量级的隔离模式。Agent 和用户在同一会话中运行，但通过**策略层**限制其行为。管理员可以：

- 标记特定文件为**只读**（Agent 可读不可写）
- 限制 Agent 对**浏览器**和**屏幕捕获**的访问
- 限制对**位置数据**的访问
- 限制对其他**应用程序**的调用

适合低风险自动化场景——比如让 Agent 帮你整理邮件、生成周报摘要，这些工作不需要访问核心系统。

### 会话隔离（Session Isolation）

这是强隔离模式。Agent 的整个执行上下文与用户桌面**物理分离**——用户看到的桌面是用户的，Agent 运行的"窗口"是 Agent 的，两者之间不共享 UI、剪贴板或输入设备。

这种模式能有效防御四类攻击向量：

1. **UI 欺骗（UI Spoofing）** — Agent 无法伪造用户界面对话框来诱导用户授权
2. **输入注入（Input Injection）** — Agent 无法模拟键盘/鼠标输入来执行越权操作
3. **跨会话数据泄漏（Cross-Session Data Leakage）** — Agent 会话内的数据不会泄漏到用户会话
4. **权限滥用** — Agent 无法访问未授权的系统资源

> 💡 **简单类比**：进程隔离像是给 Agent 戴上了"行为手环"，可以随时监控和约束；会话隔离像是把 Agent 关进了一个**独立房间**，Agent 只能通过墙上开的一个小窗口（API）与外界通信。

## Agent 365：企业安全栈的全面集成

MXC 本身只是隔离引擎，真正让它企业级可用的，是 **Agent 365** 这套集成框架。Agent 365 将 MXC 与微软现有的企业安全产品深度绑定：

| 微软产品 | 在 Agent 365 中的角色 |
|---------|---------------------|
| **Microsoft Intune** | 设备级策略下发——集中管控 Agent 的隔离策略和权限 |
| **Microsoft Entra** | 身份和访问管理——Agent 拥有可溯源的云身份 |
| **Microsoft Defender** | 运行时威胁保护——监控 Agent 行为，检测异常 |
| **Microsoft Purview** | 数据治理与合规审计——Agent 活动全程可追溯 |

### 身份绑定：区分"人"和"Agent"的关键

>
> "超出隔离本身，每个 Agent 活动都必须可归因、可治理。Windows 为 Agent 分配一个本地 ID 或由 Entra 支持的云预配身份，并将容器内的所有活动归属到该身份，从而清晰区分人类操作和 Agent 操作。"
>
> — **Pavan Davuluri**，微软执行副总裁，Windows + Devices

这段话点出了 MXC 设计的核心理念：**隔离是基础，但问责才是关键**。仅仅把 Agent 关起来是不够的，你还得知道 Agent 做了什么事、用谁的身份做的、在什么上下文中做的。MXC + Entra 的组合，让每个 Agent 操作都有完整的**身份审计链**。

## OpenClaw：用实践检验边界

MXC 的预映版能够这么快出来，离不开与 **OpenClaw** 的合作。

OpenClaw 是一个开源的 AI Agent 框架，它的创始人主动联系微软，双方合作将 MXC 落地为原生 Windows App，在受控边界内实现了高度自主的 Agent 行为。这个项目的意义在于：

1. **验证了 MXC 的可行性和安全性** — 一个第三方 Agent 框架在 MXC 内成功运行
2. **展示了一种新的操作系统设计范式** — 操作系统正在从"运行程序的平台"转变为"管理智能行为的平台"
3. **提供了 PoC（概念验证）** — 其他 Agent 框架开发者可以参考 OpenClaw 的实现

## 发布时间线

| 功能 | 状态 | 可用时间 |
|------|------|---------|
| MXC（Execution Containers） | 预映版 | **现在** |
| Agent 365（Entra/Defender/Purview 集成） | 即将推出 | **2026 年 7 月** |

开发者现在就可以在 Windows 和 WSL 上开始构建和测试容器化策略。

## 总结

微软 Execution Containers 是 AI Agent 安全领域的一次重要基础设施级创新。它解决了三个核心痛点：

1. **细粒度策略** — 不是"能/不能"的二元选择，而是可逐项配置的文件、网络、应用访问策略
2. **自适应隔离** — 从轻量的进程隔离到强化的会话隔离，按风险等级灵活选择
3. **企业级可管理** — 通过 Intune、Entra、Defender、Purview 形成完整的策略、身份、安全、合规闭环

对于正在把 AI Agent 引入企业的工作流、开发者和 IT 管理者来说，MXC 提供了一条安全可行的路径：**让 Agent 足够强大，又足够可控**。

## 参考资料

- **原文**：How Microsoft Execution Containers Define Boundaries for AI Agents — Petri IT Knowledgebase  
  → https://petri.com/microsoft-execution-containers-boundaries-ai-agents/
- **Microsoft Scout**：Autonomous AI Agent with Enterprise Security Controls  
  → https://petri.com/microsoft-scout-autonomous-ai-agent-enterprise-security/
- **OpenClaw**：开源 AI Agent 框架  
  → https://github.com/openclaw/openclaw
