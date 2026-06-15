---
layout: post
title: "Databricks 开源 Omnigent：AI Agent 的元编排治理框架"
categories: [sec]
description: "Databricks 开源了 Omnigent——一个元编排框架，在 Claude Code、Codex、Pi 等现有 Agent 之上提供统一的治理层。它解决了多 Agent 环境下的三大痛点：组合（Composition）、控制（Control）和协作（Collaboration）。支持状态化策略（如成本上限、基于风险的审批）、OS 级沙箱隔离、凭证代理注入，以及跨终端/Web/手机的实时会话共享。"
tags:
  - AI安全
  - Agent安全
  - Omnigent
  - Databricks
  - 多Agent编排
  - Agent治理
  - 开源项目
---

2026 年 6 月 13 日，Databricks 的 AI 团队开源了一个名为 **Omnigent** 的项目。它的定位很特别，不是又一个 Agent 框架，而是一个 **元框架（meta-harness）**——坐在所有现有 Agent 之上的一层统一接口。

这个项目发布的时间点很有意思。就在同一周，Anthropic 发布了 Agent 零信任框架、安全社区在讨论 Burpwn 和 Agent Gate，而 Databricks 的答案更直接：**治理不应该嵌入到某个 Agent 框架里，而应该在所有 Agent 之上。**

正如项目 README 所写的：

> *"在 Databricks，我们在 5000+ 人的工程团队中广泛使用编码 Agent，并为客户构建了数千个 Agent。这段经历让我们确信：Agent 工程的前沿正在向上推移。"*

---

## 为什么需要"元框架"？

Databricks 描述了他们遇到的问题：

> *"作为用户，我们经常同时打开 4-5 个 Agent（编码 Agent、Gemini 搜索等），把时间花在终端、Web UI、文档和聊天工具之间复制粘贴文本上。"*

更根本的问题是：**不同的 Agent 框架（harness）有不同的接口——Claude Code 用 `claude` CLI，Codex 用 `codex`，Pi 用 `pi`。它们彼此不兼容，组合和互换都非常困难。**

这不是一个"再造一个更好的 Agent 框架"能解决的问题，这是**框架之间的巴别塔问题**。Omnigent 的方案是：在它们之上加一层标准化的接口——**元框架**。

---

## 核心能力：三大支柱

Omnigent 围绕三个维度构建：

### 1. 组合（Composition）

Omnigent 将任何 Agent 封装成一个**统一会话 API**。消息和文件进入，文本流和工具调用输出。一个 Runner 将任何 Agent 包装在沙箱化会话中，Server 层提供策略和共享。

核心能力：
- **一行配置切换 Agent**：在 Claude Code、Codex、Pi 之间切换无需改代码
- **多 Agent 编排**：内置两个示例 Agent——**Polly**（多 Agent 编码编排器）和 **Debby**（双模型头脑风暴）
- **任意模型**：API Key、订阅、Gateway（OpenRouter/Ollama）、Databricks 均可

```bash
# 一行切换不同 Agent
omnigent claude                      # Claude Code
omnigent codex                       # Codex
omnigent run examples/polly/         # 自定义 Agent

# 甚至可以指定不同的底层框架
omnigent run examples/polly/ --harness pi
omnigent run examples/debby/ --harness openai-agents
```

Polly 是一个很好的多 Agent 编排示例：
- **Polly** 自己不写一行代码，她像 Tech Lead 一样规划任务
- 将编码工作委托给多个 Agent（Claude Code / Codex / Pi）在并行的 git worktree 中执行
- 将生成的 diff 交给**不同供应商的另一个 Agent** 做 code review
- 你只需要合并

### 2. 控制（Control）

这是 Omnigent 治理能力最核心的部分。策略**不依赖脆弱的 System Prompt**，而是在元框架层实现**状态化的、上下文感知的策略**。

| 策略类型 | 示例 |
|---------|------|
| **成本控制** | 累计 LLM 调用成本达到 $100 时暂停会话 |
| **风险审批** | Agent `npm install` 之后执行 `git push` 必须人工批准 |
| **凭证隔离** | Token 通过 Egress Proxy 注入，Agent **永远看不到凭证本身** |
| **工具限制** | 根据运行时状态动态限制 Agent 可用的工具 |

```yaml
# 内置的成本上限策略
policies:
  - name: cost-cap
    type: spend_limit
    limit: 100
    unit: usd
    action: pause_session
```

关键设计：**策略作用于元框架层，不依赖 Agent 框架自身的安全机制。** 这意味着即使底层 Agent（Claude Code / Codex）本身被注入或绕过，策略依然生效——因为它是 Agent **外面**的网关，不是 Agent **里面**的指令。

### 3. 协作（Collaboration）

Omnigent 的一个有趣功能：**跨设备的实时会话同步**。

- 终端、Web UI（`localhost:6767`）、macOS 原生应用、手机，所有设备上的同一个会话**实时同步**
- 消息、子 Agent、终端状态、文件保持同步
- 会话可以通过 **URL 分享**给团队成员
- 队友可以：查看历史、对文件添加行内评论、**接管（co-drive）** 当前会话、Fork 会话到自己的分支

这在团队场景中非常实用——不再需要在 Zoom 上共享屏幕演示 Agent 的工作，直接发一个链接让队友加入实时会话即可。

---

## 架构概览

Omnigent 的架构分两层：

```
        终端  │  Web UI  │  macOS App  │  Mobile  │  REST API
               │          │              │          │
               ▼          ▼              ▼          ▼
           ┌─────────────────────────────────────────┐
           │              Server 层                   │
           │   策略引擎 │ 会话共享 │ 多端同步 │ 审计日志 │
           └─────────────────────────────────────────┘
                        │
           ┌─────────────────────────────────────────┐
           │              Runner 层                   │
           │   沙箱化会话 │ 统一API │ 凭证代理注入      │
           └─────────────────────────────────────────┘
                        │
         ┌──────────┬───┴───┬──────────┐
         ▼          ▼       ▼          ▼
    Claude Code   Codex    Pi     自定义Agent
```

Runner 可以在本地运行，也可以分发到云沙箱（Modal、Daytona），实现"无笔记本执行"。

---

## 安全视角：治理的架构化

从安全角度看，Omnigent 有几个值得关注的设计选择：

### 凭证代理注入（Credential Brokering）

Agent 运行时外部凭证被隔离在 Egress Proxy 中，Agent **永远看不到 Token 本身**。只有经批准的请求才会被注入 Token。这从根本上消除了"Agent 泄露凭证"的威胁——**Agent 手里根本没有凭证可以泄露。**

### 策略不依赖 Prompt

当前很多 Agent 安全方案依赖在 System Prompt 中添加安全指令。但 prompt injection 可以绕过这些指令。Omnigent 的策略在元框架层执行，**不在 Agent 的上下文中**，因此不受注入影响。

### 状态化策略 vs 静态规则

传统门禁（如 Agent Gate）使用确定性规则，不依赖状态。Omnigent 的策略是**状态化的**——它追踪累计的 API 成本、跨步骤的行为序列（"npm install 之后 git push"），在更复杂的场景中提供保护。

这不是一个非此即彼的选择。在一个成熟的安全体系中：
- **确定性门禁**（Agent Gate）作为 CI 前置过滤——成本低、确定性高
- **状态化策略**（Omnigent）作为运行时防护——覆盖更复杂的攻击模式

两者互补而非竞争。

---

## 当前状态

| 项目 | 内容 |
|------|------|
| **版本** | Alpha（pre-release） |
| **许可证** | Apache 2.0 |
| **技术栈** | Python 3.12+ |
| **安装** | `curl -fsSL https://omnigent.ai/install.sh \| sh` |
| **仓库** | `github.com/omnigent-ai/omnigent` |
| **示例 Agent** | Polly（多 Agent 编码）、Debby（双模型辩论） |
| **云沙箱支持** | Modal、Daytona |

---

## 与其他治理工具的关系

2026 年 6 月这一周，Agent 治理领域同时在推进多个方向：

| 项目 | 定位 | 治理方式 | 能否被注入绕过 |
|------|------|---------|--------------|
| **Anthropic 零信任框架** | 架构原则与设计标准 | 架构级指导 | — |
| **Agent Gate** | CI 阶段确定性门禁 | 静态规则 | ❌（规则在 CI，不在 Agent） |
| **Burpwn** | Agent 通信拦截代理 | 被动审计 | — |
| **Omnigent** | 运行时元框架治理 | 状态化策略 + 沙箱 | ❌（策略在元框架层，不在 Agent 内） |

Omnigent 补上的是 **运行时治理** 这块拼图——当 Agent 已经在执行时，如何控制成本、审批风险操作、隔离凭证。

---

## 结语

Databricks 开源 Omnigent 的意义超越了项目本身。它标志着一个认知转变：**Agent 治理正在从"框架内置功能"走向"独立的架构层"**。这个转变类比于数据库领域从"应用内置 SQL"走向"独立的数据库管理系统"——分离关注点才能各自专业发展。

对于正在构建多 Agent 系统的团队，Omnigent 提供了一个值得认真考察的治理基座。特别是凭证代理注入和状态化策略这两个设计，在当前的 Agent 安全生态中填补了实质性的空白。

---

**参考资料**
- [Omnigent GitHub 仓库](https://github.com/omnigent-ai/omnigent)
- [Omnigent 官网](https://omnigent.ai)
- [Databricks 发布说明（Europe Says）](https://www.europesays.com/ai/72856/)
- [Apache 2.0 许可证](https://github.com/omnigent-ai/omnigent/blob/main/LICENSE)
- [Modal 云沙箱](https://modal.com)
- [Daytona 云沙箱](https://www.daytona.io)
