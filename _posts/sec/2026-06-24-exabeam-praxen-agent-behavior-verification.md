---
layout: post
title: "Exabeam 开源 Praxen：给 AI Agent 做行为验证"
categories: [sec]
description: "Praxen 是一个开源的 Agent 行为验证工具，通过 Worker Remit 策略文档与运行时证据的对比，检查 Agent 的实际行为是否符合声明的意图。支持 Claude Code 和 OpenAI Codex 插件安装。"
tags:
  - AI Agent 安全
  - 行为验证
  - 开源工具
  - OWASP
  - Exabeam
---

Exabeam 于 2026 年 6 月 23 日发布了 **Praxen**，一个开源的 AI Agent 行为验证工具。项目托管在 [GitHub](https://github.com/open-agent-ai-security/praxen)（Apache 2.0 许可证），由一个名为 Open Agent AI Security 的社区组织维护，Exabeam 贡献了初始代码并持续支持开发。

Praxen 的核心思路直白但关键：**验证 Agent 的实际行为是否匹配它的声明意图**。

## 行为验证为什么重要

Agent 安全领域有很多切入点——提示注入检测、供应链扫描、权限控制。但 Praxen 的创建者指出一个根本问题：**无论 Agent 故障、错位还是被对抗性操纵，最终的表现形式都一样——做了不该做的事。** 所以唯一可靠的信号就是行为本身。

这类似于 IAM 对员工的管理逻辑：每个角色有授权范围，控制措施要确保它不越界。对 Agent 也是同理。

Praxen 将这套逻辑形式化为两个步骤：

1. **定义任务（Worker Remit）** ——一份策略文档，声明 Agent 的使命、授权工具、许可渠道、合作伙伴和禁止行为
2. **验证现实**——将 Praxen 指向 Agent 的代码、部署状态或行为历史，返回「观察到的事实」与「声明的策略」之间的差距

> "Define the job. Test against the job." — Praxen 的设计哲学

## 核心概念：Worker Remit

Worker Remit 是一份 Markdown 格式的策略文档，它是 Praxen 的锚点。所有验证都是将证据与这份文档对比。

你可以自行编写，也可以让 Praxen 根据描述或现有文档自动起草。每个被验证的 Agent 只需要定制这一个文件。

## 验证能力

Praxen 运行一组命名的验证模式，包括但不限于：

| 验证模式 | 说明 |
|---------|------|
| 策略-实现偏差 | 代码或行为未按策略文档执行 |
| 凭据暴露 | 工作空间中意外的密钥存放位置 |
| 配置缺口 | 自动批准的 exec、禁用的循环检测、缺失的速率限制 |
| 能力漂移 | 不在授权基线中的新工具或新外发目标 |
| 复合信号推理 | 将孤立发现串联为高严重性攻击路径 |
| 供应链风险 | 未固定版本的依赖、未经审查的插件 |
| 已声明但未落实的控制 | 已规划的但未构建的沙箱、审批门、脱敏器 |
| 二级 Prompt 发现 | 将会话加载的身份文件（如 SOUL.md/AGENTS.md）审计为系统提示 |

每个发现会标注对应的框架标准：

- **OWASP Top 10 for LLM Applications 2025**
- **OWASP Top 10 for Agentic AI Applications 2026**
- **OWASP Secure MCP Server Development Guide 2026**
- **RAISE Framework**（6 类 0-5 级成熟度评分）

报告包含每个框架的覆盖网格，可在 Praxen 示例套件的[在线 OWASP 覆盖报告](https://open-agent-ai-security.github.io/praxen/owasp-coverage.html)中查看。

## 安装与使用

Praxen 以插件形式运行在编码 Agent 中（Claude Code 或 OpenAI Codex）。安装命令：

```bash
# Claude Code
claude plugin marketplace add open-agent-ai-security/praxen
claude plugin install praxen@open-agent-ai-security

# OpenAI Codex
codex plugin marketplace add open-agent-ai-security/praxen
codex plugin add praxen@open-agent-ai-security
```

使用只需要一句话：

```
Run a Praxen behavior analysis on ./my-agent
```

Praxen 会自动查找（或要求提供）Worker Remit，读取工作空间，编写报告。报告包括自包含的 HTML 文件、机器可读的 JSON 文件和纯文本摘要，全部输出到 `./reports/` 目录。

**所有数据本地运行，不上传任何信息。**

## 定位与局限

Praxen 明确将自己定位为**部署前和每次发布时的验证工具**。它检查 Agent 的代码、配置和行为历史，回答「Agent 的声明策略与实际行为是否一致」。

它不做的是：运行时监控（这是 Agent Behavior Analytics 的领域，是互补层）。

另外，Praxen 依赖前沿模型（Claude Sonnet 级别或更高、GPT-5 级别）来完成策略到实现的交叉引用，较小模型无法可靠运行。

## 影响

Praxen 填补了 Agent 运行时行为监控的开源工具空白。在此之前，行为验证能力分散在几个商业产品中（如 Protect AI Guardian 的某些功能、AIShield 的部分能力），没有一个开放参考实现。

开源带来的改变在于：无论团队使用哪种 Agent 框架，都能获得相同的行为验证基线；社区可以共同定义验证模式的标准语言和框架映射；安全团队可以在 CI/CD 管线中加入 Agent 行为验证门禁。

> 原文：[BusinessWire: Exabeam Launches Open-Source Praxen to Bring Agent Behavior Verification to AI Agents and Digital Workers](https://www.businesswire.com/news/home/20260623496656/en/Exabeam-Launches-Open-Source-Praxen-to-Bring-Agent-Behavior-Verification-to-AI-Agents-and-Digital-Workers)（⚠️ 链接当前网络环境不可达）

**项目官网**：[https://open-agent-ai-security.github.io/praxen/](https://open-agent-ai-security.github.io/praxen/)  
**GitHub 仓库**：[https://github.com/open-agent-ai-security/praxen](https://github.com/open-agent-ai-security/praxen)  
**在线分析报告（FinBot 示例）**：[https://open-agent-ai-security.github.io/praxen/reports/finbot/report.html](https://open-agent-ai-security.github.io/praxen/reports/finbot/report.html)

> 本文基于项目 README、官网和用户提供的摘要编写，未实际安装运行。安装命令取自官方文档。
