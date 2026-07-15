---
layout: post
title: "Keeper 为 Endpoint Privilege Manager 增加 AI Agent 治理能力"
categories: [sec]
description: "基于 SecurityBrief 对 Keeper Security 新功能的报道，梳理其如何在端点层识别和治理 AI Agent，对本地 shell、子进程、文件系统、提权请求和敏感文件访问实施与人类用户一致的策略、审批与审计控制。"
tags:
  - Keeper Security
  - Endpoint Privilege Manager
  - AI Agent
  - 端点治理
  - Privileged Access Management
---

## 一句话结论

Keeper Security 正在把 **AI Agent 治理** 拉到端点层做。SecurityBrief 的报道显示，Keeper 在 Endpoint Privilege Manager 中加入了 agentic AI governance：它不仅能识别已知 AI Agent，还能对未知应用做评分；一旦判定为 Agent，就用和人类用户相同的身份、审批和审计框架，控制它们在端点上的提权、文件访问、子进程、shell 调用和其他敏感动作。

## 这次更新在解决什么问题

AI Agent 在企业终端上的使用越来越普遍，但很多治理方案只盯着 MCP 层或工具调用层。问题在于，Agent 不一定只通过 MCP 走工具，它也可能：

- 启动子进程；
- 调本地 shell；
- 写文件；
- 访问敏感目录；
- 请求 OS 提权；
- 通过本地程序链路完成动作。

Keeper 的思路是把治理下沉到 **操作系统层**，让端点上的 Agent 行为进入同一个权限、审批和审计系统，而不是只看协议层流量。

## Keeper 这次加了什么

### 1. Agent 识别

Keeper Endpoint Privilege Manager 可以识别：

- 已知 AI Agent：GitHub Copilot、Cursor、Claude Code、Amazon Q 等；
- 未知应用：通过检测算法打分，按 0–100 的 AI likelihood score 判断是否应纳入 Agent 政策。

### 2. 三类新策略

报道提到新增三种策略：

| 策略 | 作用 |
|------|------|
| Agentic AI Policy | 谁可以在端点上运行 Agent |
| Agentic Access Policy | Agent 可以替用户做什么 |
| Agentic Privilege Elevation Policy | Agent 如何请求并获取提权 |

### 3. 审批与监控

Keeper 增加了：

- monitor-first 生命周期；
- 用户审批门；
- AI agent visibility dashboard；
- workload 视图；
- agent 分组；
- 自动版本更新与版本控制；
- 审计日志记录 agent 动作、策略决策和审批结果。

## 为什么这件事重要

### 1. 端点治理比协议治理更底层

很多 Agent 安全讨论聚焦在 MCP、网关或云 API 层。但如果 Agent 在本地终端上直接操作系统资源，协议层并看不到全部动作。

Keeper 这次的切入点是：

> **Agent 不是只在网络里活动，它也在终端上活动。**

因此，治理必须能覆盖端点上的实际行为。

### 2. 它把 AI Agent 当作“有身份的主体”

Keeper CEO 的表述很明确：**AI agents are not assistants; they are principals.**

这意味着企业不能再把 Agent 当作普通自动化脚本，而要把它们当作：

- 有身份；
- 会请求访问；
- 会产生可审计动作；
- 需要最小权限；
- 可能造成风险的独立主体。

### 3. 与 PAM 体系融合

Keeper 并不是单独造一个 Agent 安全产品，而是把它并入现有 Privileged Access Management 平台。这一点很实用：

- 企业已经有终端权限治理；
- 已经有用户身份、审批和审计；
- 现在只是把 Agent 也纳入同一框架。

对落地来说，这比重新搭一套 AI-only 安全平台更容易被接受。

## 对安全团队的意义

这条新闻可以看作一个信号：AI Agent 安全正在从“模型输出过滤”进入“端点权限治理”。

### 如果你是安全团队，建议关注这几个问题：

1. 你的 Agent 有没有在本地终端上跑？
2. 它会不会启动 shell、子进程或写文件？
3. Agent 的提权请求是否和人类用户使用同一审批链？
4. 你是否能区分已知与未知 Agent？
5. 端点上的 Agent 行为是否进入 SIEM？
6. 有无 monitor-first 阶段和审计回放？

如果这些问题答不上来，说明治理链条还没闭环。

## 我怎么看

Keeper 这类产品的价值在于，它把一个常被忽视的现实摆到了台前：

> **AI Agent 的风险，不只发生在云端和协议层，也发生在员工电脑和终端权限链里。**

从防守角度看，这种做法很合理：

- 先识别 Agent；
- 再把它映射成可治理主体；
- 然后把它拉进现有 IAM / PAM / SIEM 体系；
- 最后对关键动作加审批和审计。

这和近期越来越多的 Agent Gateway、Guardrail、NHI 管理和沙箱方案其实是同一趋势：**把 AI Agent 当作需要被治理的新型身份**。

## 参考资料

- [SecurityBrief 原文](https://securitybrief.com.au/story/keeper-adds-ai-agent-governance-to-endpoint-manager)
- [Keeper Security 官方站点](https://www.keepersecurity.com/)
