---
layout: post
title: "Postman 推出 AI Engineer：当 API 开发工具链被 AI 原生范式重塑"
categories: [dev]
description: "Postman 获得 AWS AI 能力认证，同期推出 AI Engineer——一个基于 Context Graph 的 AI 原生 API 开发平台。这不是在 Postman 上加了几个 AI 按钮，而是从头重新思考了 API 开发工具链在 AI Agent 时代的形态。核心洞察：'上下文债务（Context Debt）是 vibe slop 的底层病因'。"
tags:
  - Postman
  - AI
  - API开发
  - Context Graph
  - AI Engineer
  - AWS
  - Agent
  - 企业级开发
---

Postman 近日获得了 **AWS AI 能力认证**（AWS AI Capability Certification），标志着其 AI 能力在 AWS 生态中得到了官方认可。但更值得关注的，是同期发布的 **AI Engineer**——一个 AI 原生的 API 开发平台，被 Postman CEO Abhinav Asthana 称为"Postman AI 能力的下一个飞跃"。

这不是 Postman 上加了几个 AI 补丁。这是对 API 开发工具链在 AI Agent 时代该长什么样的重新想象。

---

## 核心问题：一旦 Agent 开始写 API，谁来理解整个系统？

Postman 观察到一个深层矛盾：

> *"代码是丰富的训练数据，代码生成是可验证的——但把软件从原型带到生产环境，和生成代码是完全不同的活动。"*

他们引用了一个正在被广泛讨论的现象——**vibe slop（氛围垃圾）**：团队用 AI 绕过了软件工程的硬核部分，产出了充满 Bug、难以维护的代码。AI 编码工具的构建者自己也在警告：**基础设施在崩溃，软件 Bug 越来越多。靠 vibe 到不了生产环境。**

Postman 把这个症状的**底层病因**归结为 **上下文债务（Context Debt）**：

> *"像技术债务一样，上下文债务会复利。每一个新服务、新契约、每个 Agent 生成的变更，都增加了未来任何变更需要理解的既有工作量。"*

这在 API 场景下尤其明显——一个大型组织可能有几十万个 API、服务、数据库和事件队列。维护它们的人往往是公司里最高薪的工程师，**负责把所有上下文记在脑子里的人**。

当 Agent 开始以人类无法企及的速度生产软件时，上下文债务会变得**人类不可管理**。

---

## 解决方案：AI Engineer + Context Graph

Postman 给出的答案不是"更好的代码生成"，而是**Context Graph（上下文图谱）**。

| 组件 | 功能 | 解决的问题 |
|------|------|-----------|
| **Context Graph** | 持续更新的 API 和服务关系图谱 | Agent 不从头零开始理解系统 |
| **API Catalog** | API 的注册、所有权、权限管理 | Agent 和人类有同样的围栏 |
| **Execution Layer** | 沙箱化的云端执行环境 | Agent 可以安全操作 |
| **Postman Toolset** | 封装后的 Postman 原生能力 | Agent 使用和开发者一样的工具 |

AI Engineer 的核心能力包括：

**1. 定向 API 探索**
> *"指着一个 API 或应用，给它一个目标。它会探索端点、推断行为、生成文档、工作集合和实际行为地图——不只是规范上说的。"*

**2. 系统设计评审**
> *"AI Engineer 可以跨服务评审架构，暴露依赖风险和矛盾，然后基于 Context Graph 中已有的内容提出变更——而不是基于泛泛的最佳实践。"*

**3. 故障排查**
> *"当出问题时，AI Engineer 可以跨服务追踪问题。它用 Context Graph 导航依赖关系，用 Postman 工具主动测试 API，然后返回带复现步骤的假设。"*

**4. PR 级 API 测试**
> *"接入 PR 评审流程后，自动检查契约回归、破坏性变更、安全问题和设计不一致——在合并前发现问题。"*

---

## 与 AWS 的深度整合

Postman 获得 AWS AI 能力认证，同时产品层面与 AWS 生态进行了深度对接：

- **AWS Bedrock AgentCore 集成**：Postman 的 AI Engineer 可以直接发现、理解和使用部署在 AWS 上的 API
- **AWS 认证意味着**：AWS 在技术和实施两个层面对 Postman 的 AI 能力进行了审核，确认其符合 AWS 的 AI 解决方案标准
- **对企业客户的意义**：在 AWS 上运行的企业可以在熟悉的合规框架内使用 Postman 的 AI 能力

---

## 新范式：从"API 客户端"到"API 工程的 AI 搭档"

传统 Postman 的定位是 **API 客户端（API Client）**——开发者用它来发送请求、查看响应、组织集合。

AI Engineer 代表的范式转变：**从"你用手操作的 API 工具"变成"你和 AI 一起工作的 API 平台"。**

| 维度 | 传统 API 开发 | AI Engineer 范式 |
|------|-------------|-----------------|
| **工作方式** | 手动发请求、看文档 | Agent 自动探索、分析、生成 |
| **上下文来源** | 开发者的大脑 + 静态文档 | **持续更新的 Context Graph** |
| **评审流程** | 人工 Code Review | AI 在 PR 阶段自动检查契约和安全性 |
| **故障排查** | 逐服务登录、手动追查 | Agent 跨服务追踪、自动假设 |
| **入门新 API** | 读文档 → 试请求 → 理解 | Agent 直接探索并生成工作集合 |
| **风险控制** | 人工审批 + 权限管理 | **沙箱执行 + 写入需审批 + VPC 隔离** |

---

## "vibe slop"与"context debt"的对应关系

Postman 引入的这对概念值得单独解释：

```
vibe slop（症状）= 团队绕过软件工程硬核环节，产出有问题的 AI 生成代码
         ↓
context debt（病因）= 系统越来越复杂，没有人能完整理解它
         ↓
Context Graph（治疗）= 始终在线、持续更新的系统上下文图谱
```

这个框架的意义在于：**它把"AI 代码质量差"这个问题从模型能力问题重新定义为上下文管理问题。** 不是模型不够聪明，是模型在不知道系统全景的情况下做决策。

---

## 安全设计：Agent 不是超级管理员

Postman 在 AI Engineer 的安全设计上做了一些值得关注的决策：

- **沙箱执行**：Agent 在云端沙箱中运行，不直接接触基础设施
- **凭证隔离**：凭证从不经过 Agent 的推理层
- **写入需审批**：写操作需要显式人工批准
- **VPC 内执行层**：执行层可部署在客户 VPC 内
- **PR 流程集成**：Agent 的输出走现有代码评审流程

> *"我们的风险模型类似于一个初级工程师，其工作经过代码评审，重要的事情有人在环。"*

---

**参考资料**

- Postman Blog：[Introducing the AI Engineer](https://blog.postman.com/introducing-the-ai-engineer/) — Abhinav Asthana（2026-06-02）
- Postman at APIdays Amsterdam：[Building Better APIs for the AI Era](https://blog.postman.com/postman-at-apidays-amsterdam/)（2026-06-17）
- Postman Blog：[Generating Client SDKs and AI-Ready CLIs](https://blog.postman.com/generating-client-sdks-and-ai-ready-clis-with-postman/)（2026-06-04）
- Google News 聚合：Postman 获得 AWS AI 能力认证（2026 年 6 月）
- AWS AI Capability Certification（AWS Partner Network）
