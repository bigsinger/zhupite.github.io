---
layout: post
title: "Okta 联手 Google Cloud 保卫 AI Agent：身份管理的 Agent 安全新战役"
categories: [sec]
tags: [okta, google-cloud, ai-agent, identity-security, agent-security]
---

Okta 发布官方公告，宣布与 Google Cloud 深度扩展合作，围绕 AI Agent 安全构建从身份认证、授权治理到浏览器端设备安全的一体化防线。

这是传统 IAM 巨头针对 Agent 安全赛道最全面的一次产品落地——不是概念验证，而是三个可交付的集成方案同时推出。

<!--more-->

## 三个合作维度一览

| 合作维度 | 状态 | 面向对象 | 核心能力 |
|---------|------|---------|---------|
| Auth0 for AI Agents + Gemini Agent Runtime | ✅ **可用** | 开发者 | 用户认证、Token Vault、人机协同审批、细粒度授权、MCP 认证 |
| Okta for AI Agents + Gemini Agent Platform | 🔜 **即将推出** | 企业安全团队 | Agent 注册目录与所有权绑定、Google Agent Gateway 策略执行 |
| Okta + Chrome Enterprise | ✅ **可用** | 终端管理团队 | 通用注册、设备信任（含 AV 信号）、macOS Extensible SSO、DBSC |

## 为什么是现在？

Okta 官方引用了几组关键数据，说明 Agent 安全的紧迫性：

- **92%** 的高管报告 AI Agent 已在中度或广泛使用
- 但只有 **34%** 的组织对 Agent 应用了与人类员工相同的安全控制
- 会话劫持（session hijacking）攻击同比增加 **127%**
- **62%** 的 IT 领导者将厂商锁定视为战略风险

这组数字勾勒出清晰的图景：Agent 在跑，安全在追。而脆弱的浏览器会话层（session token 被窃取）正在成为攻击者最喜欢的目标。

## 三个合作方案的细节拆解

### 1. Auth0 for AI Agents × Gemini Agent Runtime（可用）

面向在 Gemini Enterprise Agent Platform 上构建 Agent 应用的开发者，Auth0 提供现成的身份层，无需自己写认证代码。具体能力：

- **用户认证**：确保只有认证用户可以调用 Agent
- **Token Vault**：安全存储和管理 OAuth Token，让 Agent 能安全地代表用户操作第三方服务
- **人工审批（Human-in-the-loop）**：对高风险操作触发人工审批节点，Agent 在后台继续运转，用户保有最终控制
- **细粒度授权（FGA）**：Agent 只能执行用户被允许的特定操作，防止越权行为
- **MCP 认证**：为任何 MCP 服务器增加认证和授权，精确控制谁可以访问什么

### 2. Okta for AI Agents × Gemini Agent Platform（即将推出）

当企业扩展到数万个 Agent 时，安全团队的挑战不再是"有没有 Agent"，而是"Agent 在哪、能连什么、能做什么"。

Okta 的解决方案分两层：

1. **AI Agent 导入与注册**：在 Gemini Agent Platform 上构建的 Agent 持续导入 Okta 的集中目录，必须绑定一个人拥有者，确保可问责
2. **Okta 策略执行**：通过 Google Agent Gateway 作为实时执行点，无论请求来自人类还是 Agent，都由 Okta 做实时认证和授权——一套策略管所有

### 3. Okta × Chrome Enterprise（可用）

这是最务实的部分——不直接管 Agent，而是管 Agent 运行的环境。浏览器是现代工作的主战场，也是会话劫持的主入口。

- **Chrome Enterprise Universal Enrollment**：通过 Okta Integration Network 实现，IT 团队可以在任何设备上强制执行企业级 Chrome 策略，无需将身份同步到 Google
- **设备信任增强**：Okta Device Assurance 集成 Chrome Device Trust Connector，新增防病毒（AV）信号——如果设备 AV 被禁用或过期，Chrome 直接在浏览器级阻止登录
- **macOS Extensible SSO**：Chrome 正式支持苹果的 Extensible SSO，配合 Okta FastPass 和 Okta Device Access 实现无缝登录
- **Device Bound Session Credentials（DBSC）**：Okta 作为设计合作伙伴参与 DBSC 开放标准开发，将会话 cookie 加密绑定到设备。MFA 保护登录过程，DBSC 保护登录之后——即使 cookie 被窃取，也无法在其他设备上使用

## 三方合一的战略图景

Okta CPO Ely Kahn 的总结很到位："组织不应在员工想要的 AI 工具和企业所需的安全之间做选择。"

Google Cloud 安全和身份 ISV 合作全球负责人 Vineet Bhan 补充："身份安全层必须无缝运行在现代工作的核心平台上——从 Google Cloud、Chrome 到 Agent Platform。"

从战略上看，这次合作的站位是：

**Auth0 for AI Agents** → Agent 应用开发阶段的身份底座  
**Okta for AI Agents** → 企业级 Agent 治理（注册 + 策略执行）  
**Chrome Enterprise** → Agent 运行环境（浏览器）的终端安全  

三者在 Agent 全生命周期——从开发、部署到运行环境——形成了完整的身份安全闭环。

## 与传统 IAM 的对比

| 维度 | 传统 IAM | Okta AI Agent 方案 |
|------|---------|-------------------|
| 身份主体 | 人类用户 | 人类 + AI Agent（非人类身份） |
| 认证方式 | 密码/MFA/SSO | 加上 Token Vault、OAuth 代理解耦 |
| 授权粒度 | 用户-应用 | 用户-Agent-操作-第三方服务四层 |
| 会话安全 | MFA 保护登录 | MFA + DBSC 保护登录前后 |
| 策略执行点 | 应用入口 | 扩展至 Agent Runtime 和浏览器 |

## 写在最后

这是一个月内第三个重要的 Agent 安全厂商动向（前有 CrowdStrike 身份认证、Rubrik 数据安全集成），加上今天 Okta 的 IAM 层方案，Agent 安全的拼图正在被快速补齐。

一个值得关注的信号是：Okta 强调"平台灵活性和互操作性"，引用了 **62% 的 IT 领导者担心厂商锁定**。这暗示 Agent 安全方案不会由一家通吃，而是会形成互相集成的生态——身份层、数据层、运行时监控层各守其位。

对于正在部署 AI Agent 的企业来说，**现在就应该问这三个问题**：
- 我们的 Agent 有身份吗？能认证、能审计吗？
- 我们的 Agent 权限是跟人绑定的，还是无人监管的？
- 我们的 Agent 运行环境（浏览器/终端）有可见性和控制吗？

**来源**：[Okta 官方新闻稿](https://www.okta.com/newsroom/press-releases/okta-teams-up-with-google-cloud-to-secure-the-ai-powered-workforce/)（2026-06-17）
