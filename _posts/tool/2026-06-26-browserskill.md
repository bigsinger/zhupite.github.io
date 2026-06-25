---
layout: post
title: "BrowserSkill：腾讯开源，让 AI Agent 操作你的浏览器而不打断工作"
categories: [tool]
description: "BrowserSkill 的定位、架构和上手路径——一个将 Cursor、Claude Code、Hermes 等 Agent 接入你真实浏览器的本地桥接工具。"
tags:
  - 开源项目
  - 浏览器自动化
  - AI Agent
  - 腾讯
  - CLI
---

## 一句话

BrowserSkill 是一个 Rust 编写的本地 CLI + 浏览器扩展，让 Cursor、Claude Code、Codex、OpenClaw、Hermes Agent 等支持 Shell 的 AI Agent 操作你**已登录**的真实浏览器，**不影响你手头的工作**。

项目仓库：[github.com/Tencent/BrowserSkill](https://github.com/Tencent/BrowserSkill)（MIT 许可证，2026-06-22 创建，截至本文发布 20 Stars）。

## 解决了什么问题

AI Agent 操作浏览器这件事本身不新——Playwright、Puppeteer 早已成熟。但现有方案有几个实际痛点：

- **隔离的登录态**：Agent 用无头浏览器或独立 Profile，需要另外登录，无法复用你已登录的网站。
- **打断工作流**：Agent 全屏接管浏览器时，你自己的标签页也跟着被占。
- **绑定特定框架**：许多浏览器操作能力内嵌在特定 Agent 框架中，换一个 Agent 就失效。

BrowserSkill 的切入点是：**Agent 要操作的是你的真实浏览器，而不是独立的沙箱环境**。它通过一个本地 WebSocket 连接，让 Agent 告知浏览器扩展打开一个独立的「Agent Window」来执行任务，借用已有标签页时也做到显式请求和归还。

## 架构一览

从 README 看，BrowserSkill 是四层结构：

```
Agent Harness (Cursor / Claude Code / Codex / OpenClaw / Hermes ...)
    │ Shell: bsk <command>
    ▼
bsk CLI ──本地 IPC──→ bsk Daemon ──WebSocket──→ 浏览器扩展
                                                      │
                                                      ├── Agent Window（独立可见窗口）
                                                      └── 仅在请求时借用你的标签页
```

- **bsk CLI**：Rust 写的命令行工具，Agent 通过 Shell 调用的入口。
- **bsk Daemon**：后台守护进程，与浏览器扩展维持 WebSocket 连接。
- **浏览器扩展**：Chrome/Edge 扩展，接收 daemon 指令并执行浏览器操作，所有操作在独立的 Agent Window 中进行。
- **多 Agent 支持**：任何能执行 Shell 命令的 Agent 都能用，不需要为特定框架做适配。

这种设计的关键取舍是：Agent 不直接操作浏览器，而是通过本地 IPC → WebSocket → 扩展的链路间接控制。代价是增加了一层通信开销，好处是 Agent 更轻量（不需要内置浏览器驱动），且用户可以看到 Agent 的操作过程。

## 快速上手

安装分三步走：

### 1. 安装 CLI

macOS / Linux：

```bash
curl -fsSL https://raw.githubusercontent.com/Tencent/BrowserSkill/main/install.sh | sh
```

Windows（PowerShell）：

```powershell
irm https://raw.githubusercontent.com/Tencent/BrowserSkill/main/install.ps1 | iex
```

验证：

```bash
bsk --version
```

### 2. 安装浏览器扩展

从 Chrome Web Store 安装 [BrowserSkill 扩展](https://chromewebstore.google.com/detail/hhcmgoofomhgciiibhipgmgkgnoenaoi)，打开扩展弹窗确认连接状态为绿色。

### 3. 安装 Skill

BrowserSkill 自带一个 Skill 文件（教 Agent 如何用 `bsk` CLI），通过以下命令选择你的 Agent harness 并安装：

```bash
bsk install-skill
```

支持的 harness 包括 Cursor、Claude Code、Codex、OpenClaw、CodeBuddy、WorkBuddy、Pi、Hermes Agent。安装完后，对 Agent 说类似这样的话即可开始：

> /browser-skill open example.com and summarize what is on the page.

运行 `bsk doctor` 可以一键检查所有组件是否就绪。

## 值得关注的设计细节

**复用真实登录态**是核心差异。Agent 可以借用你已登录的标签页完成任务（例如查某个 SaaS 后台的配置），做完后归还。这在需要结合登录态操作的工作流中很实用——不必为 Agent 准备测试账号，也避免了二次验证的麻烦。

**Human-in-loop** 是另一个务实设计。当 Agent 遇到 CAPTCHA、登录确认弹窗、敏感操作确认等环节，可以暂停并请求用户手动处理，完成后继续。这在自动化程度和安全性之间找到了一个合理的平衡点。

**多平台支持**覆盖了 macOS（Apple Silicon + Intel）、Linux（x64 + ARM64）和 Windows x64，浏览器方面当前支持 Chrome 和 Edge，Firefox 在计划中。

## 局限与判断

- **当前阶段**：项目才创建 4 天（2026-06-22），Stars 20，属于早期项目。社区反馈、issue 积累和版本迭代都不够充分，生产环境使用需自行评估风险。
- **只支持 Chromium 系浏览器**：Firefox 用户暂时无法使用。
- **无头场景不适用**：如果 Agent 只需要纯渲染/数据抓取而无需真实浏览器，Playwright/Puppeteer 或者直接 HTTP 请求可能更高效。
- **依赖于扩展通道**：浏览器扩展是必经路径，不适合无图形界面的服务器环境。

## 我的判断

BrowserSkill 解决的是一个真实而具体的问题——让 AI Agent 操作你的真实浏览器而不干扰你的工作。协议设计务实，不绑定特定 Agent 框架，Rust 编写的 CLI 性能开销也很低。

如果你已经在使用支持 Shell 的 Agent（Cursor、Claude Code、Hermes 等），且经常需要 Agent 帮你操作浏览器中已登录的网站，这个工具值得一试。但考虑到项目还很新，建议先在非生产环境中评估。

## 项目信息

- **仓库**：[github.com/Tencent/BrowserSkill](https://github.com/Tencent/BrowserSkill)
- **许可证**：MIT（来自 GitHub API）
- **编程语言**：Rust
- **最新 Release**：`cli-v0.1.5` / `ext-v0.1.2`（2026-06-22）
- **Chrome 扩展**：[Chrome Web Store](https://chromewebstore.google.com/detail/hhcmgoofomhgciiibhipgmgkgnoenaoi)
- **安装指引**：README 或 [AGENT_INSTALL.md](https://github.com/Tencent/BrowserSkill/blob/main/AGENT_INSTALL.md)
