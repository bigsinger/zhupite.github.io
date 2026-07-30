---
layout: post
title: "Ruxu 这篇 AI Agent 安全 II 写了什么：沙箱、提示注入与输入校验"
categories: [sec]
description: "解读 Ruxu 的《Build a Basic AI Agent From Scratch: Security II》。这篇文章把 AI Agent 的安全拆成三条主线：Docker 沙箱、提示注入防护和输入校验，并明确指出后续还要补上工具策略、资源控制、密钥管理与审计。"
tags:
  - AI Agent Security
  - Prompt Injection
  - Docker
  - 输入校验
  - 沙箱
---

2026 年 7 月 21 日，Ruxu 发布了 **Build a Basic AI Agent From Scratch: Security II**。这篇文章不是在讲“怎么把 Agent 做得更聪明”，而是在回答一个更现实的问题：**一个能调用工具的 Agent，怎样才不至于把系统、数据和权限一起带跑偏**。

我读完后的结论很直接：这篇文章的重点不是某个单点技巧，而是把 AI Agent 的防护面拆成了三层——**执行隔离、提示注入防线、输入校验**。它给出的不是完整答案，但已经把一个可审计的安全骨架搭起来了。

## 这篇文章先给出了威胁模型

作者先列了一份安全清单，把 production-grade agent harness 需要防的东西拆成六类：

- Prompt Injection Defense
- Tool Permission Gating
- Input/Output Validation
- Loop & Resource Controls
- Secret & Credential Management
- Observability & Kill Switches

这个清单的价值在于，它没有把“Agent 安全”简化成单一的 prompt 防注入问题，而是把**工具执行、资源消耗、秘密管理和审计**都放进了同一张图里。

## 第一层：把工具执行关进 Docker 沙箱

文章先处理的是最容易出事的一层：**工具执行环境**。

作者的思路是把 action tools 放进一个长期运行的 Docker 容器里，让用户项目以 bind-mount 的方式挂进去，容器外的文件系统对工具不可见或只读；同时还能限制网络、设置超时、给环境变量做白名单。

这部分想解决的不是“Docker 是否绝对安全”，而是**把失控命令的爆炸半径压到最小**。文中也明确承认 Docker 不是强隔离边界：

- 它提供文件系统、进程和网络命名空间隔离；
- 但不提供内核隔离；
- 也挡不住特权容器和某些容器逃逸路径。

所以作者的态度很务实：**Docker 不是最终防线，但比把工具直接跑在主机上强得多**。

## 第二层：把提示注入当成“数据污染”来处理

文章第二个重点是 **prompt injection defense**。作者不是只做一句“不要信任工具输出”，而是做了四层动作：

1. 给进入上下文的内容加清晰边界标签；
2. 在系统提示词里显式声明这些标签里的内容只是数据；
3. 对外部文档单独再包一层 `<external_document>`；
4. 在高风险工具调用后做 intent drift 检查，确认模型还在沿着用户原始目标前进。

这一段的核心思想很清楚：**不要把工具返回值、网页内容、外部文件当成指令文本**。它们只是输入数据，哪怕其中夹着看起来像系统命令的句子，也不能直接继承执行权。

这比“写个黑名单”更靠谱，因为它把问题从“关键词过滤”上升到了**上下文边界管理**。

## 第三层：在工具调用前做输入校验

第三个重点是 **input validation**。

作者没有依赖外部的 jsonschema 或 pydantic，而是自己做了一套轻量 JSON Schema 校验器，用来在工具调用进入权限检查和沙箱之前先拦一遍：

- 缺字段不行；
- 类型不对不行；
- 多传参数不行；
- 路径格式不对也不行。

这里最实用的一点，是它把“边界限制”前移到了 schema 层：

- 不是工具跑起来后再发现它想写奇怪路径；
- 而是调用一开始就不让这种请求通过。

这相当于给 Agent 的每一次动作都先上了一层“语法门禁”。

## 这篇文章真正想表达的东西

如果只看表面，它像是在写一个 AI Agent 项目的工程实现笔记；但如果看结构，它其实在传达一个安全原则：

**Agent 安全不能只盯模型输出，必须同时控制执行环境、上下文边界和工具参数。**

这也是我认为这篇文章最有价值的地方。它没有把安全写成抽象口号，而是拆成了工程上可落地的几个模块：

- `tools/sandbox.py` 负责执行隔离；
- `prompt_safety.py` 负责上下文边界；
- `tools/validators.py` 负责输入校验；
- 后续还会补上资源控制、密钥管理、审计和 kill switch。

换句话说，它讲的不是“怎么让 Agent 更像人”，而是**怎么让 Agent 更像一个可控系统**。

## 适合谁读

这篇文章适合三类人：

- 正在做 AI Agent harness 的工程师；
- 需要给 Agent 加工具调用能力的产品/平台团队；
- 想看 Agent 安全分层设计的人。

如果你期待的是完整的企业级 Agent 安全方案，这篇还不够；但如果你想看一个从零搭建的安全骨架，它已经很有参考价值。

## 参考资料

1. [Ruxu — Build a Basic AI Agent From Scratch: Security II](https://www.ruxu.dev/articles/ai/build-an-ai-agent-security-2/)（2026-07-21，原文可访问）
2. [GitHub — rogiia/basic-agent-harness](https://github.com/rogiia/basic-agent-harness)（文章代码仓库）
3. [Docker Docs — Docker Sandboxes for AI](https://docs.docker.com/ai/sandboxes/)（Docker 官方文档）
