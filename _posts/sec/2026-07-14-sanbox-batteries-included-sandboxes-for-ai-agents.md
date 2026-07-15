---
layout: post
title: "Sanbox：为 AI Agent 提供开箱即用的沙箱隔离"
categories: [sec]
description: "基于 HN Show 贴与 Sanbox 官网，梳理这套面向 AI Agent 的 batteries-included sandboxes：通过 MicroVM、持久化文件系统、运行记录、网络白名单和受限密钥，把 Agent 运行时隔离从概念变成可部署组件。"
tags:
  - Sanbox
  - AI Agent
  - 沙箱隔离
  - MicroVM
  - Agent 安全
---

## 一句话结论

Hacker News 上的 **Show HN: Sanbox, batteries included sandboxes for AI agents**，展示了行业正在从“给 Agent 加提示词过滤”转向“给 Agent 建运行时边界”。Sanbox 的卖点很直接：把每个 AI Agent 运行在独立 MicroVM 里，带持久化文件系统、网络限制、运行记录和可恢复状态，让安全团队能评估并落地真正的运行时隔离。

## 事件概览

这条 Show HN 对应的产品页面明确写了几件事：

- 每个运行都放在独立 MicroVM 中
- 支持并行启动多个 Agent run
- 文件系统可持久化，能保留 artifacts、agent state 和 conversation history
- 记录工具调用与模型活动
- 支持恢复到同一 sandbox 的上次状态
- 默认有网络限制、资源限制和密钥作用域控制

在 AI Agent 安全越来越接近“系统工程”的今天，这类方案很有代表性。

## 它解决什么问题

很多团队已经意识到，单靠 prompt filter 不够：

- Agent 需要文件、工具、凭据和网络；
- 一旦这些能力都在同一个进程或同一个容器里，越权和误操作就会放大；
- 如果 Agent 运行过程中还要保留状态，就更容易把一次错误带到后续会话里。

Sanbox 的设计思路是：

> **A prompt is not a security boundary.**

这句话基本点中了问题核心。真正的边界必须落在 runtime：

- 文件系统隔离
- 网络 ACL
- 受限密钥
- 运行日志
- 可恢复快照
- 独立 MicroVM

## 关键能力

### 1. 每个任务一个 MicroVM

Sanbox 为每个 run 分配独立 MicroVM，带 guest kernel 和明确的 CPU、内存、超时上限。这样做的安全价值很明显：

- 运行隔离
- 降低横向影响
- 让高风险 Agent 不直接触碰宿主机

### 2. 持久化快照

它不是一次性临时沙箱，而是支持：

- filesystem snapshot
- artifacts
- agent state
- conversation history
- resume point

这意味着可以中断任务、检查结果、再从同一个状态继续。

这对安全团队特别有用，因为很多审计任务并不是一次就能做完，而是要多轮迭代、验证和复盘。

### 3. 默认拒绝外联

Sanbox 的网络策略是 **default-deny egress**，只有显式允许的目的地才能访问。配合 private IP blocking 和 run 级别决策记录，可以明显降低 Agent 被提示注入后乱连内网或外传数据的风险。

### 4. 受限密钥

官网特别强调：长生命周期凭据应该留在 sandbox 外，只把任务所需的 capability 和生命周期发进去。这和越来越多的 Agent 安全建议一致：

- 凭据不要给全量
- 权限不要默认写
- 用完就失效
- 能短期就别长期

## 它和传统容器的差别

Sanbox 不只是“另一个 Docker 包装层”。它更像是一个**面向 Agent 工作流的运行边界平台**。

| 维度 | 传统容器 | Sanbox |
|------|----------|--------|
| 隔离单元 | 容器 | MicroVM |
| 状态 | 常见一次性 | 可持久化快照 |
| 网络 | 需自己配置 | 默认拒绝外联 |
| 记录 | 分散日志 | 统一 run record |
| 恢复 | 手工较多 | 原地恢复 run |
| Agent 适配 | 需要自己拼 | 开箱即用，针对 Agent 设计 |

## 为什么它适合安全团队

如果一个安全团队要评估 Agent Gateway、Guardrails、NHI 管理或沙箱体系，Sanbox 这种产品很适合拿来做对照样本，原因有三点：

1. **可落地**：不是纯理论论文，是能跑的 CLI + 微虚拟机方案
2. **可观察**：记录 tool calls、agent state、模型活动和事件流
3. **可比较**：可以和 IAM、SIEM、网关、DLP、MCP 审计工具一起纳入架构评估

这比“模型会不会说坏话”更接近企业真正关心的问题：

- Agent 有没有越权
- 凭据有没有外泄
- 工具调用是否审计
- 运行是否可恢复
- 出事后能不能还原现场

## HN 语境下的意义

HN 上的这条 Show HN 并不是单纯展示一个新 CLI，而是在传递一个更大的趋势：

> **AI Agent 的安全治理正在从提示词层，迁移到运行时层。**

这意味着未来企业选型时，不能只问：

- 能不能接 MCP？
- 能不能接模型？
- 能不能多 Agent 协作？

还要问：

- 运行在哪个隔离边界里？
- 网络怎么控？
- 密钥怎么发？
- 日志怎么留？
- 状态怎么恢复？

Sanbox 恰好就是围绕这些问题设计的。

## 我的看法

我认为 Sanbox 这类产品的价值在于把“Agent 安全”具体化了：

- 从抽象的防护原则，落到 MicroVM、快照、ACL、受限密钥
- 从一次性对话，落到可恢复的任务单元
- 从模型安全，落到运行时控制

对于企业来说，它最有参考意义的地方不是“能不能直接替代你现有体系”，而是它提供了一个很清晰的架构模板：

> **把 Agent 作为高风险运行负载对待，而不是普通脚本。**

如果你正在设计 Agent Gateway、NHI 管理、审计流水线或者安全沙箱，这个项目值得重点对照。

## 参考资料

- [HN：Show HN: Sanbox, batteries included sandboxes for AI agents](https://news.ycombinator.com/item?id=44631452)
- [Sanbox 官网](https://sanbox.cloud/)
