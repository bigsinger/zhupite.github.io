---
layout: post
title: "AgentGG：用AI Agent做SAST的开源代码安全扫描器"
categories: [sec, tool]
tags:
  - Agent安全
  - SAST
  - 开源工具
  - 代码审计
  - Prompt注入
description: "AgentGG 是一个用 AI Agent 驱动代码安全审计的开源 SAST 扫描器，Apache 2.0 许可。不同于传统 SAST 的模式匹配，它让 LLM Agent 跟踪调用链、确认误报后再报告。支持 10 大类安全检测，包含 AI/Agent 安全专项规则（MCP 配置、Prompt 泄漏、工具权限等）。"
---

## AgentGG 是什么

AgentGG 是一个 **Agentic SAST**（用 AI Agent 驱动的静态安全扫描器），2026 年 6 月发布，Apache 2.0 开源许可。项目由 [agentgg-dev/agentgg](https://github.com/agentgg-dev/agentgg) 维护，当前 ⭐24。

它的核心思路和传统 SAST 截然不同：

> **传统 SAST** 靠正则/AST 模式匹配找漏洞 → 高误报、难确认
> **AgentGG** 让 LLM Agent 阅读代码、跟踪调用链、确认问题后再报告 → 低误报、可解释

每个 Agent 都是一个 Markdown 文件（YAML 前件 + Prompt 主体），具备 Read/Glob/Grep 工具能力，可以跨文件跟踪调用链和导入关系来确认漏洞。

## 提供的功能

### 扫描流程（三阶段）

| 阶段 | 做什么 | 产出 |
|------|--------|------|
| **Recon（侦察）** | 快速扫描项目全貌：语言、框架、认证模型、集成方式 | `recon.json` — 项目简报 |
| **Precondition（前置检查）** | 每个 Agent 自检：这个项目值不值得我跑？通过正则+可选 LLM 判断 | `plan.json` — 哪些 Agent 排队/跳过+原因 |
| **Run → Validate → Score → Dedup → Report** | 排队 Agent 批量分析文件；可选二次验证、CVSS 评分、去重、生成报告 | `summary.md` + `findings/*.md` |

**重要设计**：每个阶段都有持久化产物。扫描被中断后重新运行会自动恢复——已完成的 Agent 跳过，只跑新增或变更的部分。

### 内置 Agent 目录（10 大类）

AgentGG 的检测能力来自官方 Agent 库（`agentgg-dev/agentgg-agents`），首次扫描自动下载：

| 分类 | 检测内容 |
|------|---------|
| `injection/` | SQL/NoSQL/命令注入、XSS、路径遍历、Mass Assignment |
| `auth/` | 认证/授权缺陷、JWT、OAuth、会话管理、IDOR |
| `exposure/` | 密钥泄露、环境变量泄漏、错误信息泄漏、调试接口 |
| `misconfiguration/` | CORS 配置、Cookie 安全、缓存策略、功能开关安全 |
| `logic/` | 竞态条件、异步 Bug、事件处理器不匹配 |
| `infrastructure/` | Docker、Kubernetes、Terraform、GitHub Actions |
| `cloud/` | AWS Lambda、GCP、Azure、IAM |
| `cryptography/` | 不安全算法、反序列化漏洞 |
| `mobile/` | Android、iOS 安全 |
| **`ai/`** | **LLM/Agent 安全、MCP 配置、Prompt 泄漏、工具权限** |

其中 `ai/` 目录包含以下 Agent 模板：

| Agent | 检测内容 |
|-------|---------|
| `agent-loop-no-cap` | Agent 循环缺少上限，可能导致无限递归/失控调用 |
| `agent-tool-definition` | Agent 工具函数权限定义不严谨 |
| `agentic-untrusted-prompt-input` | 来自不可信源的 Prompt 输入污染 |
| `mcp-tool-handler` | MCP 服务器工具处理器配置缺陷 |
| `prompt-leaks-system-prompt` | System Prompt 泄露风险 |

### 验证与评分

- **Validate** — 二次 LLM 调用，重新审查每个发现，归类为 `confirmed` / `false-positive` / `out-of-scope` / `uncertain`
- **Score** — CVSS 3.1 严重度评分，附加到每个报告条目
- **Dedup** — 跨 Agent 聚合同根因的发现，合并到主条目

### 报告格式

每个发现是一个独立的 Markdown 文件（GHSA 格式）：

```markdown
# SQL Injection in login.ts
**Agent:** `sql-injection`
**File:** `src/login.ts`
**Lines:** 12–14
**Severity:** High (CVSS 7.5)
**Validation:** `confirmed`

### Summary
### Details
### PoC
### Impact
### References
- CWE-89
```

`summary.md` 聚合所有发现：按 Agent 分类、验证结果统计、各发现链接。

## 如何使用

AgentGG 是 Node.js 命令行工具，通过 npm 安装：

```bash
# 安装（需要 Node.js 20+）
npm install -g agentgg

# 首次初始化：选 LLM 提供商、配置 API Key
agentgg init

# 扫描整个项目
agentgg scan ./src -o ./out

# PR 审查模式：只扫描变更的文件
agentgg scan ./src --diff origin/main...HEAD --validate -o ./out

# 浏览结果（启动本地 Web UI）
agentgg view ./out
```

支持多种 LLM 后端：

| 提供商 | 配置方式 |
|--------|---------|
| Anthropic | API Key 或 OAuth |
| OpenAI | API Key |
| Ollama | 本地部署，免费 |
| AWS Bedrock | AWS 凭证（环境变量/SSO/IAM Role） |
| Google Vertex AI | gcloud ADC + GCP Project ID |

CI/CD 集成示例（GitHub Actions）：

```yaml
name: agentgg PR review
on: pull_request
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g agentgg
      - run: |
          agentgg scan . \
            --diff ${{ github.event.pull_request.base.sha }}...${{ github.sha }} \
            --validate -o ./scan-results
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      - uses: actions/upload-artifact@v4
        with:
          name: agentgg-findings
          path: ./scan-results
```

## 定位

AgentGG 的定位是：**用 AI Agent 来审计代码安全的开源工具**，不是全栈安全平台。

与同类工具的关系：

| 对比项 | 传统 SAST（SonarQube/Snyk） | AgentGG | 运行时安全（Guardrails/NeMo） |
|--------|---------------------------|---------|---------------------------|
| **方法** | 规则/模式匹配 | LLM Agent 推理代码 | 运行时拦截/过滤 |
| **误报率** | 高（需人工筛查） | 低（Agent 验证后才报） | N/A（运行时触发） |
| **Agent 专项检测** | ❌ 不理解 Agent 安全模式 | ✅ `ai/` 分类含 10+ Agent | ✅ 运行时防护 |
| **扫描阶段** | 编码/CI 阶段 | 编码/CI 阶段 | 运行时 |
| **部署方式** | npm 命令行 | npm 命令行 | SDK/代理/网关 |
| **许可证** | 商业/社区版 | Apache 2.0 | 商业/部分开源 |

AgentGG 填补的是 **"开发阶段用 AI 进行 Agent 代码安全审计"** 这个空白。不同于传统 SAST 只会告诉你「这里可能有问题」，AgentGG 的 Agent 会看完上下文、跟完调用链之后，才确定是否报告。也不同于运行时安全工具（只在生产环境才能发现问题），AgentGG 在写代码的阶段就能找到问题。

## 价值

**1. 开了「Agentic SAST」的先河**

它不是"给 SAST 加了几个 Agent 规则"，而是从根本上改变了扫描方式：每个安全检测项都是一个独立的 LLM Agent，具备跨文件推理能力。这个思路对安全行业有方法论层面的意义。

**2. 自带 AI/Agent 安全检测规则**

目前已有 `prompt-leaks-system-prompt`、`mcp-tool-handler`、`agentic-untrusted-prompt-input` 等针对 Agent 框架的检测 Agent。随着 `agentgg-agents` 仓库的迭代，规则还会快速扩充。

**3. 开发者友好**

- PR 模式：`--diff origin/main...HEAD` 只审查变更代码
- Resume 机制：扫描中断后恢复，不重复已完成的 Agent
- Web UI：`agentgg view` 一键启动本地查看器
- 结构化的 GHSA 格式报告

**4. 生态兼容**

支持 5 种主流 LLM 后端（含 Ollama 免费本地方案），GitHub Actions 原生集成，报告格式可对接现有 DevSecOps 流水线。

**5. 信息安全与开源**

AgentGG 自己的 Code of Conduct、CONTRIBUTING、SECURITY 文档齐全，Agent 模板也支持版本管理（`version: 0.1.0`），有助于社区贡献和规则质量管控。

## 局限

- **Beta 阶段**：目前还处于早期，规则库和稳定性还在迭代
- **LLM 成本**：Agent 每次扫描都要调用 LLM，大项目的扫描成本不可忽视（Ollama 可缓解）
- **Node.js 依赖**：需要 Node.js 20+，对 Python 技术栈的团队不够友好
- **Agent 生态尚浅**：当前 `ai/` 分类只有 10 个 Agent，覆盖面有限
