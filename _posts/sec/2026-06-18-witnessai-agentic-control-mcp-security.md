---
layout: post
title: "WitnessAI Agentic Control：首个为 MCP 生态设计的 Agent 运行时安全控制平台"
categories: [sec]
description: "WitnessAI 推出 Agentic Control 安全平台，为 AI Agent、工具和 MCP 服务器提供统一控制平面。平台通过策略即代码（Policy as Code）定义 Agent 行为边界，覆盖 Agent 自动发现、已批准工具治理、运行时执行强制三大能力。99.3% 的 AI 护栏真阳性率，已覆盖 4,000+ AI 应用和 100+ 模型类型。"
tags:
  - WitnessAI
  - Agentic Control
  - MCP安全
  - AI Agent安全
  - 运行时保护
  - 策略即代码
  - Agent治理
---

## 产品概览

WitnessAI 发布了 **Agentic Control**，一个专门为 AI Agent、工具和 MCP 服务器提供安全管控的统一控制平面。

在产品定位上，Agentic Control 与之前报道的 Tenet Security、Iron Gorilla 等 Agent 运行时安全方案形成互补——它们从不同角度切入同一个问题：**AI Agent 在运行时缺乏有效的安全和治理控制。**

---

## 三大核心能力

**1. Agent 自动发现与可视化**

在不依赖 Agent 端安装任何组件的前提下，自动发现企业环境中的所有 AI Agent，包括：
- IDE 中的编码 Agent（Claude Code、Cursor、Copilot）
- 聊天应用中的 AI 助手
- 云端部署的自定义 Agent
- MCP 服务器及其关联的工具、下游系统

**2. 已批准工具和 MCP 服务器治理**

建立组织级的**允许列表**，统一执行哪些工具和 MCP 服务器可以被 Agent 调用。这与传统的应用白名单逻辑类似，但应用在 Agent 工具调用层面——Agent 只能调用已批准的工具和 MCP 服务器。

**3. 运行时 Agent 执行强制**

这是最核心的能力层：
- **对话审查**：实时审查 Agent 的提示和响应
- **AI 防火墙**：防范提示注入和越狱攻击
- **策略违规阻断**：在 Agent 执行违规操作前实时阻断

---

## 性能数据

| 指标 | 数据 |
|------|------|
| AI 护栏真阳性率 | **99.3%** |
| 已覆盖 AI 应用 | **4,000+** |
| 已覆盖模型类型 | **100+** |
| 部署架构 | 多云 + 混合部署 |

99.3% 的真阳性率意味着极低的误报率——在企业安全场景中，误报率过高会导致安全团队产生"告警疲劳"，最终忽视真正的威胁。

---

## 行业意义

**1. 首批 MCP 原生安全方案**

随着 MCP 成为 AI Agent 工具调用的标准协议，针对 MCP 的安全方案正在成为 Agent 安全基础设施的必要组成部分。WitnessAI Agentic Control 是首批专门为 MCP 生态设计的安全控制平台之一。

**2. 传统安全技术无法检测 MCP 通信**

安全团队现有工具（防火墙、EDR、SIEM）能检测 HTTP 请求，但无法理解 MCP 通信的内容和上下文。Agent 通过 MCP 调用工具和获取数据的行为，在传统安全日志中看起来只是"正常的 API 调用"。Agentic Control 填补的是这个检测盲区。

**3. 从"保护应用"到"保护 Agent"**

CEO Rick Caccia 的表述点明了产品的核心设计理念：安全团队需要一个统一控制平面，同时覆盖员工使用 AI 的行为、AI 应用的行为、以及 AI Agent 的行为。WitnessAI 将所有 AI 活动纳入单一治理平台，而不是为每种 AI 活动创建独立的安全工具。

---

## 参考资料

- [Help Net Security — WitnessAI Agentic Control secures AI agents, tools, and MCP server access](https://www.helpnetsecurity.com/2026/06/17/witnessai-agentic-control/)（2026-06-17）
- WitnessAI 官方产品文档
