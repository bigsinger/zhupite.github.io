---
layout: post
title: "Orca 调研：面向并行 AI Coding Agent 的 Agent Development Environment"
categories: [sec]
description: "基于 stablyai/orca GitHub 仓库、README 与源码结构的调研，梳理 Orca 如何用并行 worktree、终端编排、移动端协同、CLI 与多 Agent 支持，把 AI Coding Agent 从单会话工具推进到可管理的开发环境。"
tags:
  - Orca
  - AI Agent
  - ADE
  - Coding Agent
  - Worktree
---

## 一句话结论

Orca 的定位不是又一个 Coding Agent，而是一个 **Agent Development Environment（ADE）**：它把 Claude Code、Codex、OpenCode、Cursor Agent、Hermes Agent 等 CLI Agent 放进统一桌面环境里，通过并行 worktree、终端分屏、移动端 companion、GitHub / Linear 集成和 CLI 自动化，让开发者可以像管理多个开发分支一样管理一组并行 AI Agent。

如果说 IDE 管的是“人写代码”，Orca 更像是在管理“多 Agent 同时写代码”。

## 项目概览

| 维度 | 信息 |
|------|------|
| 仓库 | `stablyai/orca` |
| 官网 | https://onorca.dev |
| 项目描述 | ADE for working with a fleet of parallel agents |
| 主要语言 | TypeScript |
| License | MIT |
| Star 数 | 20,133 |
| Fork 数 | 1,569 |
| 最新版本 | v1.4.143 |
| 默认分支 | `main` |
| 支持平台 | macOS / Windows / Linux，另有 iOS / Android companion |

README 对 Orca 的一句话描述是：

> The AI Orchestrator for 100x builders.

它支持把 Codex、Claude Code、OpenCode、Pi 等 Agent 并排运行，每个 Agent 都在自己的 worktree 中执行，并在一个地方统一跟踪。

## 它解决什么问题

现在的 AI Coding Agent 很多，但真实开发中很快会遇到几个问题：

1. **多 Agent 难管理**：多个终端、多个会话、多个分支很容易失控；
2. **结果难比较**：同一个任务让不同 Agent 做，如何对比 diff 和选择最佳方案；
3. **上下文难追踪**：每个 Agent 的状态、终端输出、文件改动分散在不同地方；
4. **远程与移动协同弱**：Agent 跑很久，人不一定一直坐在电脑前；
5. **安全与隔离不足**：Agent 需要自己的 worktree 和可审计边界。

Orca 的核心思路是把这些问题抽象成“并行 Agent 开发环境”问题，而不是单纯再造一个模型客户端。

## 核心能力

### 1. Parallel Worktrees

Orca 最重要的能力是并行 worktree：把同一个 prompt 分发给多个 Agent，每个 Agent 在自己的隔离 Git worktree 中执行，然后比较结果、选择 winner 并合并。

这很适合：

- 多方案实现；
- Bug 修复对比；
- UI 方案探索；
- 重构策略评估；
- 让不同模型/Agent 互相竞争。

安全角度看，worktree 隔离至少能避免多个 Agent 在同一工作区互相覆盖文件。

### 2. 兼容任意 CLI Agent

README 明确写了：只要能在终端里运行，就能在 Orca 里运行。官方列出的支持对象包括：

- Claude Code
- Codex
- Grok
- Cursor
- GitHub Copilot CLI
- OpenCode
- Hermes Agent
- Devin
- Goose
- Cline
- Qwen Code
- Kimi
- 以及其他 CLI Agent

这说明 Orca 的重点不是绑定某一家模型，而是做 Agent 编排层。

### 3. 移动端 Companion

Orca 提供移动 companion：可以在手机上监控 Agent 运行、收到完成通知、发送 follow-up。

这对长任务很实用。AI Agent 的运行时间越来越长，开发者不可能一直盯着桌面终端。移动端把“等待 Agent 完成”变成了可异步管理的工作流。

### 4. 终端与编辑器集成

项目内置 Ghostty-class terminal、WebGL 渲染、终端分屏、重启后 scrollback 保留，并且使用 VS Code 风格编辑器与文件拖拽。

这说明它不是简单 Electron 壳，而是在尝试成为 Agent-first IDE。

### 5. Orca CLI

Orca 也可以被 Agent 或脚本驱动，README 中提到 `orca worktree create`、`snapshot`、`click`、`fill` 等命令。

这很关键：当开发环境本身可脚本化，Agent 不仅能在 Orca 中运行，也能反过来操作 Orca。

## 源码结构观察

仓库根目录能看到典型的 Electron / TypeScript 桌面应用结构：

| 路径 | 作用 |
|------|------|
| `src/main` | Electron 主进程相关逻辑 |
| `src/renderer` | 前端 UI |
| `src/cli` | Orca CLI 命令与格式化逻辑 |
| `src/preload` | Electron preload 层 |
| `src/relay` | 运行时通信 / relay 相关逻辑 |
| `src/shared` | 前后端共享类型和工具 |
| `mobile` | 移动端 companion |
| `native` | 原生能力模块 |
| `docs` | 功能设计、参考文档与截图素材 |
| `tests` | 单元测试与 E2E 测试 |
| `skills` / `skill-guides` | 内置技能与 Agent 使用说明 |

`package.json` 中的描述是：

> Next-gen IDE for parallel agentic development

脚本里也能看到大量质量门禁：typecheck、lint、E2E、terminal 性能基准、localization 校验、native runtime 校验等。项目工程化程度较高，不是一个轻量 demo。

## 与传统 IDE 的差异

| 维度 | 传统 IDE | Orca |
|------|----------|------|
| 核心用户 | 人类开发者 | 人类 + 多个 AI Agent |
| 工作单元 | 文件 / 项目 / 分支 | Agent 会话 / worktree / 任务 |
| 并行方式 | 人手动开分支 | 多 Agent 并行执行 |
| 评审对象 | 人写的 diff | Agent 生成的 diff |
| 交互方式 | 键鼠 + 编辑器 | 终端 Agent、CLI、移动端、浏览器模式 |
| 目标 | 写代码 | 编排、监督、比较、合并 Agent 产物 |

这也是 Orca 值得关注的地方：它把 AI Coding 从“一个聊天窗口”推进到了“多 Agent 项目管理”。

## 对 Agent 安全的意义

Orca 不是安全产品，但它对 Agent 安全有几个启示：

### 1. Worktree 是最基础的隔离单元

并行 Agent 如果共享同一个工作区，很容易互相踩踏。用独立 worktree 能把文件改动、Git diff 和回滚边界分开。

### 2. 多 Agent 需要统一审计面

当一个任务被多个 Agent 同时处理，安全团队需要知道：

- 哪个 Agent 改了哪些文件；
- 哪个 Agent 跑了哪些命令；
- 哪个 diff 最终被合并；
- 哪些会话仍在运行；
- 哪些操作来自远程或移动端 follow-up。

Orca 的方向说明，未来 Agent IDE 本身也会成为审计入口。

### 3. Agent 操作开发环境会成为常态

Orca CLI 允许 Agent 脚本化工作流，这意味着“Agent 操作 IDE”会越来越常见。相应地，IDE 权限、终端权限、文件系统边界、浏览器操作能力也需要被纳入安全模型。

## 我的判断

Orca 的真正价值不是支持了多少模型，而是它抓住了一个趋势：

> AI Coding 的下一阶段不是单 Agent 更聪明，而是多 Agent 如何被编排、隔离、比较和接管。

对个人开发者来说，Orca 是提高吞吐的工具；对团队来说，它更像是未来 Agentic Development Platform 的雏形。

如果你已经在使用 Claude Code、Codex、OpenCode、Cursor Agent 等工具，并且经常想“同一个任务让几个 Agent 同时试试”，Orca 是非常值得研究的项目。

## 适合什么场景

- 同一需求生成多个实现方案；
- 并行跑修复、测试、重构、文档更新；
- 让不同 Agent 在不同 worktree 中竞争；
- 远程机器跑 Agent，本地或手机监控；
- 对 AI 生成 diff 做集中评审与合并。

## 参考资料

- [Orca GitHub 仓库](https://github.com/stablyai/orca)
- [Orca 官网](https://onorca.dev/)
- [Orca 下载页](https://onorca.dev/download)
- [Orca Worktrees 文档](https://www.onorca.dev/docs/model/worktrees)
