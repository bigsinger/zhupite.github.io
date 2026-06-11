---
layout: post
categories: [tool]
title: "Microsoft 开源 AgentEval：.NET 生态的 AI Agent 评估框架"
tags:
  - Microsoft
  - AI Agent
  - 评估框架
  - 开源
  - .NET
  - 自动化测试
  - MAF
description: "Microsoft 开源 AgentEval——面向 .NET 的 AI Agent 评估工具包，提供工具调用断言、RAG 质量度量、随机性评估、模型对比和记忆基准测试。"
---

## 发生了什么

Microsoft 开源了 **AgentEval**——一个面向 .NET 生态的 AI Agent 评估工具包。项目发布在 GitHub 的 `AgentEvalHQ/AgentEval` 下，MIT 协议。

AgentEval 的定位很清晰：**Python 生态有 RAGAS 和 DeepEval，.NET 生态现在有了 AgentEval。**

它专为 **Microsoft Agent Framework (MAF)** 和 **Microsoft.Extensions.AI** 构建，提供了一套完整的 Agent 评估能力——工具调用验证、RAG 质量度量、随机性评估、模型对比、记忆基准测试等。

> 项目地址：[https://github.com/AgentEvalHQ/AgentEval](https://github.com/AgentEvalHQ/AgentEval)

## 为什么需要 Agent 评估框架

Agent 系统的评测一直是个老大难问题。

传统软件的测试可以依赖确定性断言——输入固定，输出可预期，测试结果确定。但 Agent 不同：LLM 的**非确定性**意味着同一个 Agent 处理同一个任务，两次运行的结果可能不同。一个测试"碰巧"通过了，不代表 Agent 在 100 次运行中都能正确响应。

这个行业目前的做法大多停留在"手工点几下看看行不行"的阶段。少数团队会写一些临时脚本统计成功率，但缺乏标准化的测试框架。

AgentEval 要解决的就是这个问题——**把 Agent 评估从"手工验收"变成"自动化测试"。**

## 核心能力

### 工具调用断言

Agent 的核心交互方式之一是调用工具。AgentEval 提供了一套 Fluent 风格的断言 API，专门验证 Agent 的工具调用行为：

```
检查：Agent 是否调用了"SearchFlights"？
      参数是否正确（destination = Paris）？
      是否在 2 秒内返回？
      调用顺序是否合理（先搜索再预订）？
      有没有出错？
```

这套 API 的亮点在于**可组合性**——你可以把多个断言链式组合成一个完整的调用序列校验，而不是像传统做法那样去翻日志正则匹配。断言失败时附带 `because` 参数说明原因，让失败信息可读。

### 随机性评估

这是 AgentEval 最核心的能力之一。

LLM 的非确定性使得单次测试结果不可靠。AgentEval 的做法是**多次运行 + 统计阈值**：

- 每个测试用例运行 N 次（例如 20 次）
- 设定一个成功率阈值（例如 85%）
- 计算平均分、标准差
- 只有统计上达到阈值的才算通过

这种做法借鉴了性能测试的思路——不关心"某一次跑得好不好"，关心"长期来看稳不稳定"。标准差是一个比平均分更值得关注的指标——一个偶尔出色但经常翻车的 Agent，比一个稳定 80 分的 Agent 更危险。

### RAG 质量度量

对于使用 RAG（检索增强生成）的 Agent，提供了检索质量指标——评估检索到的文档与用户查询的相关性，以及 Agent 在回答中是否准确使用了检索内容。

### 模型对比

支持在同一组测试用例上运行不同的模型，对比它们的表现。这对于模型选型场景很实用——在决定从 GPT-4o 迁移到某个新模型之前，先用 AgentEval 跑一遍测试集，看到底哪个模型在真实 Agent 任务上表现更好。

### 记忆基准测试

针对具备长期记忆能力的 Agent，提供记忆读写准确率、记忆检索延迟、记忆污染检测等专项测试。

## 技术细节

AgentEval 基于 .NET 8/9/10 构建，以 NuGet 包形式分发，可以集成到任何 .NET 项目的测试流程中。

项目当前处于 **Preview（预览）** 状态，官方明确标注了风险声明：API 和行为可能变更，不建议在生产环境或安全关键系统中使用。代码和文档部分由 AI 工具辅助生成，维护者已做审查，但仍有出现错误的可能。

## 评价

Microsoft 开源 AgentEval 有几个值得关注的点：

**填补了 .NET Agent 生态的评估空白。** Python 生态有 LangSmith、RAGAS、DeepEval 等评估工具，但 .NET 生态此前几乎没有面向 Agent 的标准评估方案。AgentEval 的出现让 .NET 开发者有了一个原生集成的选择。

**评估框架正在成为 Agent 基础设施的标配。** 在 Agent 快速从实验走向生产的当下，标准化评估是缺失的一环。没有评估框架，就无法回答"这个 Agent 到底能不能上线"。Anthropic 刚警告不要默认信任 Agent，Microsoft 就拿出了评估工具——这不是巧合。

**随机性评估的设计思路值得借鉴。** 多次运行 + 统计阈值的做法虽然增加了测试成本（每个 case 跑 20 次），但更符合 Agent 系统的实际行为模式。一个 85% 可靠率的 Agent 和一个 99% 可靠率的 Agent，在测试中可能只有一次之差，但在生产环境中差异巨大。

---

**参考链接：**
- GitHub 仓库：[AgentEvalHQ/AgentEval](https://github.com/AgentEvalHQ/AgentEval)
- NuGet 包：[AgentEval](https://www.nuget.org/packages/AgentEval)
- 文档：[https://joslat.github.io/AgentEval/](https://joslat.github.io/AgentEval/)
- 相关阅读：[Anthropic 警告开发者：不要默认信任你自己的 AI Agent](https://zhupite.com/sec/2026-06-11-anthropic-do-not-trust-agent.html)
