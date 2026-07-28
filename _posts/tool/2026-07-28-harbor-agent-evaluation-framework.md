---
layout: post
title: "Harbor：面向 AI Agent 的评测与优化框架"
categories: [tool]
description: "基于 harbor-framework/harbor 官方 README、pyproject.toml、LICENSE、PyPI、Releases 和文档站整理，介绍 Harbor 如何评测 Claude Code、OpenHands、Codex CLI 等 Agent，并支持 Terminal-Bench、云端沙箱并发实验和 RL rollout。"
tags:
  - Harbor
  - AI Agent
  - Benchmark
  - Terminal-Bench
  - 评测工具
---

> 资料来源：本文基于 [harbor-framework/harbor](https://github.com/harbor-framework/harbor) 官方仓库、README、pyproject.toml、LICENSE、PyPI、Releases 和文档站整理。本文未实际运行基准测试，命令示例均来自官方 README。

Harbor 是一个来自 Terminal-Bench 创建团队的框架，用来**评测和优化 AI Agent 与语言模型**。如果你关心 Claude Code、OpenHands、Codex CLI 这类代码 / 终端 Agent 到底能不能在真实环境里完成任务，Harbor 提供的就是一个更工程化的评测入口。

一句话概括：**Harbor 把 Agent 评测放进可复现的沙箱环境里，并支持本地 Docker、云端沙箱、大规模并发实验和 RL rollout 数据生成。**

## 它解决什么问题

很多 Agent 评测的问题不是“有没有题目”，而是下面这些工程细节：

| 问题 | 如果手工做 | Harbor 的处理方向 |
|---|---|---|
| Agent 类型多 | 每个 Agent 单独写适配脚本 | 支持 Claude Code、OpenHands、Codex CLI 等任意 Agent 评测 |
| 环境难复现 | 本机状态、依赖和文件残留影响结果 | 在容器 / 沙箱环境中运行任务 |
| Benchmark 分散 | Terminal-Bench、SWE-Bench、Aider Polyglot 各有入口 | 用 `harbor datasets list` 发现并运行数据集 |
| 并发成本高 | 本地跑慢，云端调度复杂 | 支持 Daytona、Modal、LangSmith、Blaxel、Novita Sandbox 等 provider |
| 优化闭环弱 | 只有最终分数，不便生成训练数据 | 支持生成 rollouts，用于 RL 优化 |

所以 Harbor 更适合被理解为一个**Agent 实验平台的底层 harness**，而不是单纯的排行榜脚本。

## 快速安装

官方 README 给了两种安装方式。

使用 uv：

```bash
uv tool install harbor
```

或使用 pip：

```bash
pip install harbor
```

从 `pyproject.toml` 看，项目包名是 `harbor`，当前版本为 `0.20.0`，要求 Python `>=3.12`，命令入口包括：

```text
harbor
hr
hb
```

这意味着你可以用完整命令，也可以用短别名调用。

## 最小使用路径：跑 Terminal-Bench 2.0

Harbor 是 [Terminal-Bench 2.0](https://github.com/laude-institute/terminal-bench-2) 的官方 harness。README 给出的本地 Docker 示例是：

```bash
export ANTHROPIC_API_KEY=<YOUR-KEY>
harbor run --dataset terminal-bench@2.0 \
   --agent claude-code \
   --model anthropic/claude-opus-4-1 \
   --n-concurrent 4
```

这条命令表达了 Harbor 的核心抽象：

| 参数 | 含义 |
|---|---|
| `--dataset terminal-bench@2.0` | 选择数据集和版本 |
| `--agent claude-code` | 选择被评测的 Agent |
| `--model anthropic/claude-opus-4-1` | 选择底层模型 |
| `--n-concurrent 4` | 设置并发环境数量 |

如果要看支持哪些 Agent 和参数，可以直接运行：

```bash
harbor run --help
```

如果要看支持哪些第三方 benchmark，README 给出的命令是：

```bash
harbor datasets list
```

通用评测命令则是：

```bash
harbor run -d "<dataset@version>" -m "<model>" -a "<agent>"
```

## 为什么云端沙箱很关键

本地 Docker 可以验证流程，但 Agent benchmark 很容易遇到规模问题：任务多、环境重、运行时间长、失败重试复杂。Harbor README 直接给了云端 provider 的运行方式，例如 Daytona：

```bash
export ANTHROPIC_API_KEY=<YOUR-KEY>
export DAYTONA_API_KEY=<YOUR-KEY>
harbor run --dataset terminal-bench@2.0 \
   --agent claude-code \
   --model anthropic/claude-opus-4-1 \
   --n-concurrent 100 \
   --env daytona
```

这条命令的重点不是 Daytona 本身，而是 `--env` 抽象：同一个 benchmark / agent / model 组合，可以切换运行环境。

从 `pyproject.toml` 的可选依赖看，Harbor 已经为多个执行环境准备了 extra，包括：

- `daytona`
- `modal`
- `langsmith`
- `e2b`
- `runloop`
- `novita`
- `blaxel`
- `gke`
- `ec2`
- `wandb`

对团队来说，这意味着 Harbor 的价值不只是“能跑 benchmark”，而是可以把评测扩展到更接近生产实验平台的规模。

## 它和普通 LLM benchmark 的区别

很多 LLM benchmark 评的是模型在文本题上的答案，而 Harbor 更强调 Agent 在环境里的行为。

可以这样区分：

| 维度 | 普通 LLM benchmark | Harbor 这类 Agent harness |
|---|---|---|
| 评测对象 | 模型输出 | Agent + 模型 + 工具调用策略 |
| 运行环境 | 通常是静态题目 | 容器 / 沙箱 / 真实终端任务 |
| 结果来源 | 最终答案匹配 | 任务执行轨迹和环境状态 |
| 优化方向 | Prompt / 模型能力 | Agent 工具使用、策略、模型、环境共同优化 |
| 数据用途 | 排行榜或回归测试 | 评测、实验、rollout、RL 优化 |

这也是 Harbor 与 Terminal-Bench 的关系比较自然的原因：Terminal-Bench 关注的是终端任务，Harbor 则提供了运行、扩展和并发调度的框架层。

## 适合谁，不适合谁

### 适合

- 正在评估 Claude Code、OpenHands、Codex CLI 等 Agent 的团队；
- 想把 Terminal-Bench、SWE-Bench、Aider Polyglot 等评测统一到一个入口的人；
- 需要在 Docker 或云端沙箱里并发跑大量任务的人；
- 想生成 Agent rollouts，用于 RL 或策略优化的人；
- 做 Agent 产品、Agent 安全、Agent 工程质量评估的人。

### 不适合

- 只是想简单问模型几道题的人；
- 没有 Python 3.12+ 环境、Docker 或云端沙箱预算的人；
- 只关心单次聊天体验，不需要可复现实验的人；
- 还没有明确 benchmark 数据集和评测目标的团队。

## 引入前需要注意的限制

第一，Harbor 不是“零配置评测魔法”。你仍然需要准备模型 API Key、Agent 运行依赖、Docker 或云端 provider 凭证。

第二，云端并发会放大成本和失败率。`--n-concurrent 100` 很诱人，但在真实项目里应该先用小并发验证数据集、环境和日志，再逐步放大。

第三，Agent 评测结果不只由模型决定。工具权限、沙箱网络、任务超时、依赖安装速度、Agent prompt 和重试策略都会影响最终分数。Harbor 能提供统一 harness，但不会自动替你解释所有失败原因。

## 版本、许可证和项目状态

截至本文抓取时：

| 项目 | 信息 |
|---|---|
| 最新 Release | `v0.20.0` |
| PyPI 版本 | `0.20.0` |
| Python 要求 | `>=3.12` |
| 许可证 | Apache-2.0 |
| GitHub Star | 约 3.6k（通过 shields.io 抓取，动态数据） |
| DOI | README 提供 Zenodo concept DOI：`10.5281/zenodo.20953922` |

README 的引用条目里仍写着 `v0.16.1`，而 Releases、PyPI 和 pyproject.toml 均显示当前版本为 `0.20.0`。写学术引用时，应以仓库的 “Cite this repository” 或 Zenodo 具体版本记录为准。

## 结论

Harbor 的价值在于把 Agent 评测从“临时脚本”推进到“可复现实验系统”：数据集、Agent、模型、环境、并发和 rollout 都有明确入口。

如果你只是体验单个 Agent，它可能显得偏重；但如果你要回答下面这些问题：

- Claude Code、OpenHands、Codex CLI 在同一任务集上谁更稳？
- 某个模型升级后，Agent 任务成功率有没有真实提升？
- 本地 Docker 与云端沙箱结果是否一致？
- 能不能把 Agent 运行轨迹变成后续优化数据？

那 Harbor 值得进入你的工具箱。它不是一个“演示型 Agent 项目”，而是更接近 Agent 评测基础设施。

## 参考资料

- 官方仓库：<https://github.com/harbor-framework/harbor>
- README：<https://raw.githubusercontent.com/harbor-framework/harbor/main/README.md>
- Releases：<https://github.com/harbor-framework/harbor/releases>
- PyPI：<https://pypi.org/pypi/harbor/json>
- 官方文档：<https://www.harborframework.com/docs>
- LICENSE：<https://raw.githubusercontent.com/harbor-framework/harbor/main/LICENSE>
