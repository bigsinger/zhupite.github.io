---
layout: post
categories: [tool]
title: "Agent Skills：Addy Osmani 的 AI Agent 生产级工程技能框架"
tags: [AI Agent, 编码, 工程实践, 开源, 开发者工具]
description: "Google Chrome 工程师 Addy Osmani 发布 Agent Skills，一套面向 AI 编码 Agent 的生产级工程技能框架。7 个斜杠命令覆盖从需求定义到发布的完整开发生命周期，将资深工程师的工作流编码为 Agent 可执行的技能。"
---

# Agent Skills：Addy Osmani 的 AI Agent 生产级工程技能框架

> 当 AI 编码 Agent 开始写代码，谁来教它们**如何正确写代码**？

Google Chrome 工程师 **Addy Osmani**（著名前端专家、JavaScript 权威、Google Chrome 工程团队核心成员）在 2025 年发布了 **Agent Skills**——一套面向 AI 编码 Agent 的生产级工程技能框架。截至目前，该项目已在 GitHub 上获得超过 12,000 星标。

## 核心思想：将资深工程师的经验编码为 Agent 技能

Agent Skills 的核心洞见很简单：**优秀的软件工程师并非一上来就写代码**。他们先理解需求、撰写规格说明、制定计划、编写测试，然后才动手实现。但大多数 AI 编码 Agent 缺乏这种"工程思维"，往往会跳过这些关键步骤直接生成代码。

Agent Skills 将资深工程师的 7 项核心实践编码为 7 个斜杠命令，覆盖从需求到发布的完整开发生命周期：

| 命令 | 名称 | 作用 |
|------|------|------|
| `/spec` | 规约先行 | 写代码之前先写规约，明确要构建什么 |
| `/plan` | 小原子任务 | 将复杂功能拆解为小而独立的可执行任务 |
| `/build` | 一次一片 | 一次只构建一个最小的可工作切片 |
| `/test` | 测试即证明 | 先写测试，用测试证明代码正确 |
| `/review` | 改善代码健康 | 对已有代码进行结构化审查和改进 |
| `/code-simplify` | 清晰胜于巧妙 | 优先保持代码简洁可读，而非炫技 |
| `/ship` | 快即是安全 | 通过小步快跑降低发布风险 |

此外，`/build auto` 模式允许在计划获得批准后全自动执行，进一步提升效率。

## 为什么 Agent Skills 如此重要？

AI 编码 Agent 的能力正在快速提升，但生成大量代码并不等于写出高质量的软件。Agent Skills 解决了三个关键问题：

1. **结构化工作流**：让 Agent 模仿人类的工程思维流程，而不是无序地生成代码
2. **可重复的最佳实践**：将资深工程师的经验编码为可重复执行的技能
3. **质量控制**：通过规格说明、测试和代码审查环节确保输出质量

## 开发者评价

> "Agent Skills 不是教你如何写代码，而是教你的 AI Agent 如何成为更好的工程师。"

许多开发者反馈，使用 Agent Skills 后，AI 生成的代码质量显著提升，测试覆盖率增加，返工率大幅下降。

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/addyosmani/agent-skills.git
# 查看文档
cd agent-skills
cat README.md
```

项目支持 **Claude Code、Codex CLI、Cursor、Gemini CLI、Copilot CLI** 等主流编码 Agent 平台。

## 结语

Agent Skills 代表了一个重要的趋势：**AI Agent 的能力正在从"能写代码"进化为"懂得如何写好代码"**。Addy Osmani 将自己在 Google Chrome 的工程经验注入这一框架，为 AI 开发者社区提供了一份珍贵的工程实践指南。

---

**项目地址**：[https://github.com/addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)
**作者**：Addy Osmani（Google Chrome 工程师团队）
