---
layout: post
title: "Agent Gate：AI 生成 PR 的确定性 CI 防火墙"
categories: [sec]
description: "Agent Gate 是一个专为 AI 生成 Pull Request 设计的确定性 CI 防火墙。它在 CI/CD 流水线中插入安全网关层，检查 PR 合约、高危路径、Agent 指令漂移、工作流权限升级和测试证据，确保 AI 生成的代码在合入前经过安全验证。它的核心原则是：不使用 LLM 运行时判断、不检出 PR 代码、不执行 PR 控制的脚本——所有检查都是确定性的。"
tags:
  - AI安全
  - Agent安全
  - Agent Gate
  - CI/CD
  - 代码安全
  - GitHub Actions
  - 开源项目
---

2026 年 6 月 14 日，一个名为 **Agent Gate** 的项目登上了 Hacker News，它提出了一个正在快速变得紧迫的问题：**当 AI Agent 越来越频繁地直接提交 PR 到代码仓库时，谁来确保这些代码是安全的？**

传统的代码审查（Code Review）依赖人工，但 AI 生成 PR 的速度和数量正在快速超过人类reviewer 的带宽。更关键的是，AI Agent 生成的代码存在一些**人类 reviewer 和传统测试都容易遗漏的风险**——比如悄悄提高 CI 权限、修改 Agent 指令文件、无配套测试的变更。

Agent Gate 的回答是：**在 CI 中加入一个确定性的安全网关，在合入前做最后一道防线。**

---

## 什么是 Agent Gate

Agent Gate 是一个 **GitHub Action**，它在 PR 触发时运行，对 AI 生成的变更进行一系列检查后给出 PASS / WARN / BLOCKED 结论。

项目有三条硬性设计约束：

> 1. **不使用 LLM 做运行时判断**——所有规则是确定性的，统一输入必得统一输出
> 2. **不检出（checkout）PR 代码**——只通过 GitHub API 读取变更信息
> 3. **不从不可信的 PR Head 加载策略**——策略文件 `agent-gate.yml` 从 PR 的基础分支加载

这三点确保了 Agent Gate 本身不会被 PR 中的恶意代码欺骗。它不能调用 LLM，也就不会被 prompt injection 影响；它不 checkout，也就不会触发 PR 中的恶意脚本；它从 base 分支加载策略，那么 PR 自身不可能绕过检查。

---

## 能检测什么：30+ 不变量

Agent Gate 目前覆盖五类检查：

### 1. 越界编辑（Out-of-Contract Edits）

Agent 在 PR Body 中声明一个 **合约（contract）**，写明自己要改什么。如果 PR 实际修改的文件超出了声明范围，Agent Gate 会 BLOCKED。

```markdown
<!-- agent-gate-contract
version: 1
agent: codex
task: update auth session handling
allowed_paths:
  - src/auth/**
  - tests/auth/**
required_evidence:
  - matching auth tests changed
-->
```

这是最有趣的设计之一：**让 Agent 自己承诺改动范围，然后用自动化检查来验证这个承诺。**

### 2. 工作流权限升级

CI 配置文件（`.github/workflows/`）中的权限变更很难被人工注意到——比如 `contents: read` 被改成 `contents: write`，或者新增了一个 `secrets.*` 引用。Agent Gate 专门检查这些：

```
ERROR workflow/permission-escalation
contents permission increased from read to write.
Path: .github/workflows/release.yml
```

如果 AI 在生成代码时顺带提升了 CI 的权限，Agent Gate 会直接拦截。

### 3. Agent 控制面漂移（Agent Control-Plane Drift）

Agent 的行为很大程度上是由 **控制面文件** 控制的——`AGENTS.md`、`CLAUDE.md`、`.cursorrules` 等。如果 AI 生成的 PR 修改了这些文件，意味着它可以改变未来 Agent 的行为模式。Agent Gate 将此标记为高风险变更。

这本质上是一种 **"元攻击"**：不直接改代码，而是改 Agent 的指令，让下一个生成的代码"干净地"帮你做坏事。

### 4. 缺少测试证据

高风险源文件变更（如认证逻辑、支付路径）必须有配套的测试变更。如果 `src/auth/` 改了但 `tests/auth/` 没有变化，Agent Gate 会给出 WARN 或 BLOCKED。

### 5. MCP 配置漂移

`.mcp.json` 的变化意味着 Agent 可以调用哪些工具的配置被修改了。如果 AI PR 改了这个文件，Agent Gate 会拦截。

---

## 架构设计

项目是一个 TypeScript monorepo，分为三个包：

| 包 | 路径 | 功能 |
|---|------|------|
| **core** | `packages/core` | 纯分析引擎 + 内置确定性规则 + JSON/Markdown 报告渲染 |
| **cli** | `packages/cli` | `agent-gate replay <fixture-dir>` 本地确定性回放 |
| **action** | `packages/action` | Node 20 GitHub Action，通过 API 读取 PR 数据并调用 core |

核心分析引擎不依赖 GitHub API，可以本地运行和测试。项目自带了 **"不安全 PR 动物园"（unsafe-pr-zoo）**——一组固定的测试夹具（fixtures），用于演示各种拦截场景：

```bash
node packages/cli/dist/main.js replay fixtures/unsafe-pr-zoo/workflow-permission-escalation
node packages/cli/dist/main.js replay fixtures/unsafe-pr-zoo/agent-control-plane-drift
node packages/cli/dist/main.js replay fixtures/unsafe-pr-zoo/out-of-scope-agent-edit
node packages/cli/dist/main.js replay fixtures/unsafe-pr-zoo/missing-test-evidence
node packages/cli/dist/main.js replay fixtures/unsafe-pr-zoo/mcp-config-drift
```

---

## 使用方法

### 10 分钟观察模式

Agent Gate 的推荐工作流非常务实：**先用观察模式（warn）跑一段时间，学习你的仓库风险画像，再把确认的策略升级为合入门禁。**

```yaml
name: Agent Gate

on:
  pull_request:
    types: [opened, synchronize, reopened, edited, labeled, unlabeled, ready_for_review]

permissions:
  contents: read
  pull-requests: read

jobs:
  agent-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: sjh9714/Agent-Gate@v0.1.2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          mode: warn
          fail-on-block: false
```

策略文件 `agent-gate.yml` 放在仓库根目录：

```yaml
version: 1
mode: warn

contract:
  required_for:
    - agent
  allow_missing_in_observe_mode: true

agent_detection:
  authors:
    - github-copilot[bot]
  labels:
    - ai
    - agent
    - codex
  branch_patterns:
    - "codex/**"
    - "ai/**"

high_risk_paths:
  workflows:
    paths:
      - ".github/workflows/**"
    severity: error
```

三个阶段：
1. **Observe（观察）**：PASSED → 安全，WARN → 需要人工判断，BLOCKED → 确定后将策略升级为硬性门禁
2. **Tune（调参）**：根据初期运行结果调整策略规则
3. **Enforce（执行）**：`mode: block` + `fail-on-block: true`

---

## 为什么确定性很重要

Agent Gate 最根本的设计选择是 **不用 LLM 做判断**。这个选择有深远意义：

### 与其他方案的区别

| 方案 | 判断方式 | 确定性 | 可审计 | 自身安全 |
|------|---------|--------|--------|---------|
| LLM-as-judge | AI 模型判断 | ❌ | ❌ | ❌（可被注入）|
| 传统 linter | 静态规则 | ✅ | ✅ | ✅ |
| Agent Gate | 确定性规则 | ✅ | ✅ | ✅ |

如果安全网关本身也是 AI 驱动的，那它就和攻击目标共享了相同的弱点——prompt injection。**用 AI 去判断 AI 生成代码的安全性，会陷入无限递归的信任问题。**

Agent Gate 的答案是：所有检查回归到 **确定的、可重复的、无状态的规则**。这听起来不像 AI 时代的答案，但它恰恰是这个时代最需要的防线。

### 自举（Dogfooding）

项目自身也使用了 Agent Gate。它的 CI 流程从 `main` 分支加载 Action 代码，而非 PR 自身的分支，确保了正在开发中的 Action 不会因 PR 中的漏洞而被绕过。

---

## 当前状态与意义

- **版本**：v0.1.2
- **状态**：pre-release，GitHub Marketplace 可用
- **许可证**：MIT
- **技术栈**：TypeScript（monorepo, pnpm）
- **包含**：CLI 回放、GitHub Action、自举 CI、不安全 PR 测试夹具

Agent Gate 的出现，和一个更大的行业背景紧密相关：**2026 年 6 月的 Miasma 攻击事件中，恶意提交通过 AI coding agent 的 hook 文件实现了攻击传播。** 如果有 Agent Gate 这样的门禁在 CI 阶段拦截对 Agent 控制面文件的修改，这类攻击的初始入口就会大打折扣。

当 AI Agent 提交代码的能力越来越强，"谁来守卫代码仓库的大门"就从一个理论问题变成了现实的工程问题。Agent Gate 给出的方案不一定是最全面的，但它走的方向我认为是对的：

**安全网关自己做不了判断没有关系。它的价值不在于"看穿一切"，而在于让所有越界行为都无法不被注意地通过。**

---

**参考资料**
- [Agent Gate GitHub 仓库](https://github.com/sjh9714/Agent-Gate)
- [Hacker News 讨论](https://news.ycombinator.com/item?id=48523469)
- [Miasma 攻击事件分析](https://howtofix.guide/miasma-microsoft-github-ai-coding-worm)
- [GitHub Marketplace: Agent Gate Action](https://github.com/marketplace/actions/agent-gate)
