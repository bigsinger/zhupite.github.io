---
layout: post
title: "用本地模型免费跑 Hermes Agent——从 Ollama 到 Kanban 的完整实操"
date: 2026-06-19 14:00:00 +0800
categories: [sec]
tags: [hermes-agent, ollama, local-llm, agent, automation]
---

# 用本地模型免费跑 Hermes Agent——从 Ollama 到 Kanban 的完整实操

> 本文基于 Julian Goldie 的视频教程结合 Hermes Agent 官方文档整理
> 视频链接：[How to Run Hermes Agent FREE Forever!](https://www.youtube.com/watch?v=aGnfutSxCIc)（2026-06-18，13:10）
> 项目地址：[github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)

## 背景

Hermes Agent 是一个开源 AI Agent 框架，由 Nous Research 维护。它和 Claude Code、OpenAI Codex、OpenClaw 属于同一类工具——通过工具调用（tool calling）在终端中自主完成编程和任务执行。

但大多数人跑 Hermes 用的是云端模型（Claude、GPT、DeepSeek），每跑一个命令就消耗一次 token，长期下来成本不低。而且数据要经过第三方服务器，离线时就完全用不了。

Julian Goldie 的教程展示了一条不同的路：**用本地模型 + Ollama 跑 Hermes Agent，实现免费、私有、离线的 Agent 团队协作。**

## 架构概览

```
用户输入一个目标
       ↓
Hermes Agent 拆解为步骤
       ↓
   ┌─────────────────────┐
   │  Agent Kanban 看板   │ ← 团队协作视图
   │  [规划] [执行] [验证] │
   └─────────────────────┘
       ↓
Ollama / LM Studio / Nvidia 本地推理引擎
       ↓
Llama 3.1 8B / GPT-OSS 等本地模型
       ↓
  工具调用（命令执行、文件读写、代码生成）
       ↓
  自验证（确认文件真的存在，不存在的重新跑）
       ↓
   成品输出到 Workspace
```

**Agent 的循环不是"问答"而是"执行"：**

```
规划一步 → 运行工具 → 检查结果 → 规划下一步 → ...
```

它不会用文字回答"我已经做了"，它会**真正去执行命令、创建文件、验证磁盘**，确认成品落地后才汇报完成。

## 第一步：安装 Hermes Agent

如果还没装过，一行命令搞定：

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

装完后用 `hermes doctor` 检查依赖是否齐全：

```bash
hermes doctor
```

## 第二步：安装 Ollama 并下载本地模型

Ollama 是目前跑本地模型最省事的方案，支持 macOS、Linux、Windows。

### 安装 Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows → 从 https://ollama.ai/download 下载安装包
```

### 下载推荐模型

根据 Julian 的实测，**能在 Agent 场景下真正使用工具（而非假装用了工具）**的本地模型并不多。他推荐两个：

```bash
# 方案一：Llama 3.1 8B（推荐，仅 5GB）
ollama pull llama3.1:8b

# 方案二：GPT-OSS
ollama pull gpt-oss
```

为什么是这两个？大部分本地模型要么太慢，要么在工具调用上"装模作样"——模型说"我已经调用了工具"但实际没调。Llama 3.1 8B 和 GPT-OSS 是 Julian 测试下来在 Mac Studio 上表现稳定的。

**模型选择策略：**

| 你的硬件 | 推荐模型 | 大小 |
|---------|---------|------|
| Mac（大多数） | Llama 3.1 8B | ~5GB |
| 有 GPU（RTX 5090 等） | 更大的 Qwen/Gemma 变体 | 按需 |
| 轻量快速 | GPT-OSS | ~4GB |

确保 Ollama 在后台运行：

```bash
# 测试模型是否可用
ollama run llama3.1:8b "hello"
# Ctrl+D 退出
```

## 第三步：配置 Hermes Profile 指向本地模型

Hermes 支持通过 Profile 实现多配置隔离。为本地模型创建一个专用 Profile：

```bash
# 创建本地 Agent Profile
hermes profile create local-agent

# 切换到该 Profile
hermes profile use local-agent
```

然后在交互式配置中选择 Ollama 作为 provider：

```bash
hermes model
```

在模型选择器中选择 **Ollama** 作为 provider，然后输入你的本地模型名称（如 `llama3.1:8b`）。

也可以直接修改 `~/.hermes/profiles/local-agent/config.yaml`：

```yaml
model:
  default: llama3.1:8b
  provider: ollama
  base_url: http://localhost:11434
```

验证配置是否生效：

```bash
hermes chat -q "Hello, what model are you running?"
```

## 第四步：启动本地 Agent

配置完成后，就可以用本地模型跑 Hermes 了：

```bash
# 使用本地 Profile 启动
hermes --profile local-agent
```

你也可以在同一个会话中快速切换模型：

```bash
/model llama3.1:8b
```

**关键对比**：在 Hermes 中，你可以同时配置云端和本地 Profile。云端 Profile 处理重活，本地 Profile 处理轻活（跑命令、文件操作、快速代码生成）。两者可以在 Agent OS 仪表板中并存。

## 第五步：Agent Kanban —— 多 Agent 团队协作

这是教程中最具实操价值的部分——**一个团队本地的离线 Agent 在实时看板上协作**。

Kanban 看板的工作流程：

1. 在看板中输入一个目标（如 "Build an SEO blog about Open Core"）
2. 系统自动拆解为多个任务卡片
3. 多个 Agent 并行认领任务
4. 每个 Agent 独立执行：规划 → 运行工具 → 检查 → 下一步
5. 完成的任务自动移入 "Done" 列
6. 所有产物进入 Workspace 可查看

```
看板列状态流转：

待办（Backlog）→ 进行中（In Progress）→ 验证中（Review）→ 已完成（Done）
```

每个任务的完整链路可追溯：从目标输入 → 拆解步骤 → 工具调用 → 文件创建 → 验证结果，全都可以在 Workspace 中回看。

## 架构关键：为什么 Local Agent 和 Chatbot 不同

Julian 在视频中强调了一个核心区别：

| | 普通 Chatbot | Hermes Agent |
|--|-------------|--------------|
| 输入 | 问题/指令 | **目标（Goal）** |
| 输出 | 文本回答 | **成品（Finished Job）** |
| 工作方式 | 生成文字 | **执行工具 → 验证结果** |
| 是否检查 | 不检查 | **自验证（文件真的存在吗？）** |
| 是否重试 | 不重试 | **没落地就重新跑** |

**自验证机制是关键**：Agent 说"已构建"之后，引擎会检查文件是否真的落盘。如果构建没有落地，引擎会告知并重新运行。这是本地模型经常遇到的问题——模型"幻觉"地声称已经做了某事，但实际上没有。

来自视频的原话：

> "本地模型有时会说它们已经构建好了，但实际上没有。这个系统会检查——Agent 说它建了，然后引擎确认文件真的存在。如果不存在，就什么也不会落地到 Workspace。"

## 本地模型的能力边界

Julian 在视频中非常坦诚地讨论了本地模型的局限：

**适合做的：**
- ✅ 运行命令
- ✅ 文件操作（读/写/搜索）
- ✅ 快速代码生成
- ✅ 小型构建任务
- ✅ 自动化脚本

**不适合做的：**
- ❌ 超大型复杂构建
- ❌ 需要前沿推理能力的任务

**推荐策略——分层梯队：**

```
本地模型 = 快速助手（Fast Helper）
  负责：跑命令、文件操作、轻量代码
  成本：免费
  速度：快

云端前沿模型 = 主力工程师（Frontier Model）
  负责：复杂推理、大型架构、关键决策
  成本：按 token 付费
  速度：较慢但精度高
```

Julian 的建议是：**"把重活交给前沿模型，轻活交给本地子 Agent。"** 在 Agent OS 中，云端 Agent 和本地 Agent 可以在同一个仪表板中协同工作。

## 更多本地推理引擎

除了 Ollama，Hermes 还支持其他本地推理引擎：

| 引擎 | 适用场景 | 配置方式 |
|------|---------|---------|
| **Ollama** | 最常见，一键安装 | `provider: ollama` |
| **LM Studio** | GUI 操作，模型管理直观 | `provider: lm-studio` |
| **Nvidia** | 有 NVIDIA GPU 时性能最优 | `provider: nvidia` |

三种引擎可以在 Hermes 中自由切换，不同模型可以同时就绪——例如 Llama 3.1 通过 Ollama 常驻，Gemma 4 通过另一个引擎就绪，Kanban 看板中的不同 Agent 可以使用不同的模型。

## 实操 Checklist

如果你是第一次尝试，按这个清单走一遍：

```markdown
[ ] 安装 Hermes Agent
[ ] 安装 Ollama
[ ] ollama pull llama3.1:8b（约 5GB 下载）
[ ] hermes profile create local
[ ] hermes model → 选择 Ollama + llama3.1:8b
[ ] hermes --profile local 测试聊天
[ ] 建立第一个 Kanban 看板
[ ] 输入一个简单目标（如 "创建一个 index.html"）
[ ] 观察 Agent 的 规划→执行→验证 循环
[ ] 检查 Workspace 确认产物落地
```

## 常见问题

**Q: 本地模型会不会很慢？**
A: 取决于模型大小和硬件。Llama 3.1 8B 在大多数 Mac 上够快。关键是要选**适合你硬件**的模型——模型太大反而更慢。

**Q: 我的本地模型说调用了工具但实际没调，怎么办？**
A: 这是本地模型的常见问题。Hermes 的自验证机制能检测到这种情况——如果文件没落盘，引擎会说"什么都没建"并重新运行。选择工具调用能力强的模型（Llama 3.1 8B 和 GPT-OSS 经过验证）可以减少这个问题。

**Q: 可以同时跑本地和云端模型吗？**
A: 可以。在 Hermes Agent OS 中，本地 Agent 和云端 Agent 可以同时运行，同一个仪表板管理。轻活交给本地模型，复杂推理交给云端。

**Q: 需要多大磁盘空间？**
A: Llama 3.1 8B 约 5GB，Hermes Agent 本身很小。总共预留 10GB 足够。

---

*参考来源：*
1. [How to Run Hermes Agent FREE Forever!](https://www.youtube.com/watch?v=aGnfutSxCIc) — Julian Goldie，2026-06-18
2. [Hermes Agent 官方仓库](https://github.com/NousResearch/hermes-agent) — Nous Research
3. [Hermes Agent 官方文档](https://hermes-agent.nousresearch.com/docs/)
4. [Ollama](https://ollama.ai/) — 本地 LLM 运行工具
