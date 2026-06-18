---
layout: post
title: "前 Cisco 团队创立 Tenet Security，600 万美元阻击恶意 AI Agent"
categories: [sec]
description: "前 Cisco AI Defense 团队的研究人员创立了 Tenet Security，获得 600 万美元种子轮融资，专注于 Agent 运行时安全——实时监控 AI Agent 行为、分析和阻断恶意操作。这是 Agent 安全市场从大公司内部孵化走向独立创业的一个标志性事件。"
tags:
  - Tenet Security
  - AI Agent安全
  - 运行时安全
  - Cisco
  - 安全创业
  - 种子轮
  - Agent监控
---

前 Cisco AI Defense 团队的研究人员近日创立了 **Tenet Security**，并筹集了 **600 万美元种子轮资金**。这家初创公司的目标很明确——**阻止企业环境中的恶意 AI Agent 行为**。

---

## 团队背景：前 Cisco AI Defense 原班人马

Cisco 的 AI Defense 部门在 AI 安全领域有一定的积累。在 Cisco 期间，他们专注于识别和防御 AI 系统面临的新型威胁。

这个团队从 Cisco 出来独立创业，可能不是一个"大公司做不好"的故事——更可能是 **"Agent 安全的市场窗口正在打开，大公司内部孵化的速度跟不上市场节奏"**。Cisco 作为大型企业，有全面的产品线，AI Agent 安全只是其整个安全组合中的一小部分。而 Tenet Security 可以全身心投入这个细分赛道。

---

## Tenet Security 做什么

根据产品描述，Tenet Security 聚焦于三个核心能力：

**1. Agent 运行时监控**

不是监控 AI 模型的输入输出（那是 Lakera、Galileo 等做护栏的厂商的领域），而是监控 **Agent 在运行时的行为**——它调用了什么工具、访问了什么数据、执行了什么操作、工作的上下文是什么。

**2. 行为分析**

通过建立 Agent 行为的基线模型，检测偏离基线的异常行为：
- 一个客服 Agent 突然开始访问财务数据库
- 一个代码 Agent 在凌晨 3 点批量修改生产环境权限
- 一个数据处理 Agent 尝试发送超出授权范围的数据

**3. 实时阻断**

当检测到异常行为时，不是只能告警——而是能够**实时终止 Agent 的操作**。这是 Agent 安全与 SIEM/SOAR 的关键区别：Agent 的速度太快了，等你开个工单再去处理，数据已经发出去了。

---

## 市场定位：填补 Agent 安全的空白地带

当前 AI Agent 安全市场有多种方案，Tenet Security 的定位在中间地带：

| 方案 | 代表 | 聚焦 | 盲区 |
|------|------|------|------|
| **模型护栏** | Lakera, NVIDIA NeMo | 输入输出过滤 | 无法监控 Agent 行为 |
| **身份安全** | CrowdStrike, Saviynt | Agent 身份与授权 | 不关注运行时行为模式 |
| **数据安全** | Rubrik | Agent 数据访问 | 不关注 Agent 操作行为 |
| **人因安全** | KnowBe4 | 人类使用 Agent 的安全意识 | 不关注 Agent 自身行为 |
| **Agent 运行时安全** | **Tenet Security** | **Agent 操作行为监控** | 新赛道，生态待完善 |

Tenet Security 填补的正是"Agent 在做什么"这个层面的监控——**不关心模型说了什么，关心 Agent 做了什么。**

---

## 600 万美元种子轮意味着什么

在当前的 AI 安全投资热潮中，600 万美元的种子轮属于"小而精"。几个信号：

1. **投资人认为这个方向有市场**——Cisco AI Defense 背景的团队做 Agent 运行时安全，赛道逻辑清晰
2. **这个市场还很早期**——种子轮规模不大，说明市场验证还需要时间
3. **人才溢出效应**——顶级大公司的安全团队开始出来独立创业，是这个市场正在形成的强烈信号

---

## 与其他事件形成呼应

这则新闻与近期多条 AI Agent 安全动态形成了清晰的趋势：

- **KnowBe4** 推出 Agent Risk Manager——人因层
- **CrowdStrike** 推出 AI Agent 持续身份认证——身份层
- **Rubrik** 集成 AWS Bedrock AgentCore——数据层
- **Tenet Security** 创立——Agent 运行时行为层

这些公司各自切入了一个层面的 AI Agent 安全问题，但它们的组合正在拼出一个完整的 Agent 安全体系。**Agent 安全的"战区"正在从单一的技术问题变成一个多层、多供应商的完整生态。**

---

**参考资料**

- SiliconANGLE 报道（2026-06-17）
- Tenet Security 产品信息
- 注：原文页面当前返回 404，以上基于详细摘要 + 行业背景整理
