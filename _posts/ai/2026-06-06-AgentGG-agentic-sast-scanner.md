---
layout: post
title: "AgentGG：用 AI Agent 做代码安全审计的开源 SAST 扫描器"
categories: [sec]
tags:
  - Agent安全
  - SAST
  - 开源工具
  - 代码审计
  - OpenClaw
description: "AgentGG 是一个用 AI Agent 驱动代码安全审计的开源 SAST 扫描器，Apache 2.0 协议，48 Stars。内置 10 大类 Agent 规则库，专为 OpenClaw 提供 14 个安全检测 Agent。三阶段扫描流程（Recon → Precondition → Run），二次验证降低误报，PR 模式只审变更代码。"
---

## AgentGG是什么？

AgentGG 是一个 **Agentic SAST**——用 AI Agent 驱动的静态代码安全扫描器，2026 年 5 月发布，Apache 2.0 开源许可。项目由 [agentgg-dev/agentgg](https://github.com/agentgg-dev/agentgg) 维护，当前 ⭐48（2026-06-08），TypeScript 编写。

它的核心思路和传统 SAST 截然不同：

| 方式 | 方法 | 误报率 | 可解释性 |
|------|------|--------|---------|
| **传统 SAST** | 正则/AST 模式匹配 | 高，需人工筛查 | 低，只有规则编号 |
| **AgentGG** | LLM Agent 阅读代码、跟踪调用链、确认后再报 | 低 | 高，Agent 输出推理过程 |

每个安全检测 Agent 都是一个 Markdown 文件（YAML 前言 + Prompt 正文），具备 Read / Glob / Grep 三个工具，可以跨文件跟踪调用链和导入关系来确认漏洞。

## 扫描流程（三阶段 + 五子步骤）

| 阶段 | 做什么 | 产出 |
|------|--------|------|
| **Recon（侦察）** | 快速扫描项目全貌：语言、框架、认证模型、集成方式 | `recon.json` — 项目简报 |
| **Precondition（前置检查）** | 每个 Agent 自检：这项目值不值得我跑？正则 + 可选 LLM 判断 | `plan.json` — 哪些 Agent 排队/跳过+原因 |
| **Run → Validate → Score → Dedup → Report** | 排队 Agent 批量分析文件；二次验证、CVSS 评分、去重、生成报告 | `summary.md` + `findings/*.md` |

**断点续扫**：每个阶段都有持久化产物。扫描中断后重新运行自动恢复——已完成的 Agent 跳过，只跑新增或变更的部分。

## Agent 安全检测能力（6 大类）

AgentGG 覆盖 **AI Agent 特有的安全风险**（Help Net Security 2026-06-05 报道）：

| 风险类别 | 检测内容 | 对应 Agent 示例 |
|----------|---------|----------------|
| **Prompt 注入漏洞** | 识别输入处理缺陷，检测不可信源带来的 Prompt 污染 | `agentic-untrusted-prompt-input` |
| **工具权限配置错误** | Agent 声明了不合理的过程工具权限 | `agent-tool-definition` |
| **MCP 服务器配置缺陷** | 认证、加密、访问控制配置不当 | `mcp-tool-handler` |
| **信任关系链漏洞** | 分析 Agent 间信任链，发现可被恶意利用的跳转路径 | `openclaw-audit-scope-boundaries`、`openclaw-audit-trusted-event-ingress` |
| **数据管道安全** | 数据处理流程中的漏洞（不安全序列化等） | 结合 `logic/` 分类 Agents |
| **System Prompt 泄漏** | 检测 Prompt 中的敏感信息暴露风险 | `prompt-leaks-system-prompt` |

这些风险在传统 SAST 工具中几乎无覆盖——SAST 厂商不理解 Agent 架构中的安全模式。AgentGG 是首个开源方案。

## 内置 Agent 库

AgentGG 的检测能力来自两个官方仓库：主 Agent 库（`base/`，11 大类）和框架专项 Agent（如 `openclaw/`），首次扫描自动从 `agentgg-dev/agentgg-agents` 下载。

### 主 Agent 库（`base/`）——11 大类

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
| `smartcontract/` | 智能合约安全 |
| **`ai/`** | **LLM/Agent 安全、MCP 配置、Prompt 泄漏、工具权限** |

其中 `ai/` 目录包含 **10 个 Agent**：

| Agent | 检测内容 |
|-------|---------|
| `agent-loop-no-cap` | Agent 循环缺少上限，可能导致无限递归/失控调用 |
| `agent-tool-definition` | Agent 工具函数权限定义不严谨 |
| `agentic-untrusted-prompt-input` | 来自不可信源的 Prompt 输入污染 |
| `mcp-tool-handler` | MCP 服务器工具处理器配置缺陷 |
| `prompt-leaks-system-prompt` | System Prompt 泄露风险 |
| `lua-crypto-weakness` | Lua 弱加密实现 |
| `lua-ngx-exec` | Lua nginx 命令执行风险 |
| `lua-regex-bypass` | Lua 正则绕过 |
| `lua-shared-dict-poisoning` | Lua 共享字典投毒 |
| `lua-string-concat-url` | Lua 字符串拼接 URL 风险 |

### OpenClaw 专项 Agent——14 个 Agent

AgentGG 为 **OpenClaw 框架** 提供了专用 Agent（`openclaw/` 目录），覆盖 OpenClaw 的审计、认证、CVE、权限、隔离等多个安全维度：

| Agent | 检测内容 |
|-------|---------|
| `openclaw-audit-allowlist-identity` | 身份白名单配置审计 |
| `openclaw-audit-auth-lifecycle` | 认证生命周期管理缺陷 |
| `openclaw-audit-browser-route-pivot` | 浏览器路由跳板攻击检测 |
| `openclaw-audit-control-ui-csrf-xss` | 控制面板 UI 的 CSRF/XSS 风险 |
| `openclaw-audit-cve-22170` | CVE-22170 专项检测 |
| `openclaw-audit-cve-28480` | CVE-28480 专项检测 |
| `openclaw-audit-exec-policy-bypass` | 执行策略绕过检测 |
| `openclaw-audit-fs-path-symlink` | 文件系统路径符号链接风险 |
| `openclaw-audit-info-disclosure` | 信息泄露检测 |
| `openclaw-audit-preauth-amplification` | 未认证放大攻击检测 |
| `openclaw-audit-scope-boundaries` | 信任作用域边界检测 |
| `openclaw-audit-trusted-event-ingress` | 可信事件入口审计 |
| `openclaw-audit-webhook-ingress` | Webhook 入口安全审计 |
| `openclaw-audit-workspace-dotenv-trust` | 工作区 `.env` 信任配置审计 |

AgentGG 同样可以扩展到其他 Agent 框架（LangChain、CrewAI、Semantic Kernel 等）——社区只需为其提交新的 Agent 规则集到 `agentgg-agents` 仓库。

## 验证与评分

- **Validate** — 二次 LLM 调用，重新审查每个发现，归类为 `confirmed` / `false-positive` / `out-of-scope` / `uncertain`
- **Score** — CVSS 3.1 严重度评分（计算机密性/完整性/可用性影响），附加到每个报告条目
- **Dedup** — 跨 Agent 聚合同根因的发现，合并到主条目

## 报告格式

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

## 怎么用？

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

### CI/CD 集成示例（GitHub Actions）

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

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/agentgg-dev/agentgg |
| Agent 规则仓库 | https://github.com/agentgg-dev/agentgg-agents |
| 官方网站 | https://agentgg.dev |
| 安装方式 | `npm install -g agentgg`（需要 Node.js 20+） |

## 定位是什么？

AgentGG 的定位是：**用 AI Agent 来审计代码安全的开源工具**，不是全栈安全平台。

与同类工具的关系：

| 对比项 | 传统 SAST（SonarQube/Snyk） | AgentGG | 运行时安全（Guardrails/NeMo） |
|--------|---------------------------|---------|---------------------------|
| **方法** | 规则/模式匹配 | LLM Agent 推理代码 | 运行时拦截/过滤 |
| **误报率** | 高（需人工筛查） | 低（Agent 验证后才报） | N/A（运行时触发） |
| **Agent 专项检测** | ❌ 不理解 Agent 安全模式 | ✅ `ai/` + `openclaw/` 25+ Agent | ✅ 运行时防护 |
| **扫描阶段** | 编码/CI 阶段 | 编码/CI 阶段 | 运行时 |
| **部署方式** | npm 命令行 | npm 命令行 | SDK/代理/网关 |
| **许可证** | 商业/社区版 | Apache 2.0 | 商业/部分开源 |

AgentGG 填补的是 **「开发阶段用 AI 进行 Agent 代码安全审计」** 这个空白。不同于传统 SAST 只告诉你「这里可能有问题」，AgentGG 的 Agent 会看完上下文、跟完调用链之后，才确定是否报告。也不同于运行时安全工具（只在生产环境才能发现问题），AgentGG 在写代码的阶段就能找到问题。

## 价值

**1. 开了「Agentic SAST」的先河**

它不是「给 SAST 加了几个 Agent 规则」，而是从根本上改变了扫描方式：每个安全检测项都是一个独立的 LLM Agent，具备跨文件推理能力。这个思路对安全行业有方法论层面的意义。

**2. 自带 AI/Agent 安全检测规则**

`ai/` 分类已有 10 个 Agent（5 个 Agent 专项 + 5 个 Lua 安全），且规则库在迭代中持续扩充。OpenClaw 框架已有 14 个专用 Agent，覆盖 CVE、权限、信任链、执行策略等维度。

**3. 框架专项支持**

AgentGG 不仅提供通用 Agent 规则，还首次为 OpenClaw 提供了**完整的专项 Agent 套件**。这意味着 OpenClaw 开发者可以直接用 `openclaw-audit-*` 系列 Agent 扫描自己的 Agent 代码，覆盖身份白名单、认证生命周期、浏览器路由跳板、CSRF/XSS、CVE 等 14 个安全维度。社区还可以为 LangChain、CrewAI、Semantic Kernel 等框架贡献专项 Agent。

**4. 开发者友好**

- PR 模式：`--diff origin/main...HEAD` 只审查变更代码
- Resume 机制：扫描中断后恢复，不重复已完成的 Agent
- Web UI：`agentgg view` 一键启动本地查看器
- 结构化的 GHSA 格式报告

**5. 生态兼容**

支持 5 种主流 LLM 后端（含 Ollama 免费本地方案），GitHub Actions 原生集成，报告格式可对接现有 DevSecOps 流水线。

**6. 信息安全与开源**

Code of Conduct、CONTRIBUTING、SECURITY 文档齐全，Agent 模板支持版本管理（`version: 0.1.0`），有助于社区贡献和规则质量管控。

## 局限

- **Beta 阶段**：目前还处于早期，规则库和稳定性还在迭代
- **LLM 成本**：Agent 每次扫描都要调用 LLM，大项目的扫描成本不可忽视（Ollama 可缓解）
- **Node.js 依赖**：需要 Node.js 20+，对 Python 技术栈的团队不够友好
- **Agent 生态尚浅**：当前 `ai/` 分类覆盖 5 类 Agent 安全风险，覆盖面还在扩展中；OpenClaw 虽有 14 个 Agent，但其他框架（LangChain、CrewAI 等）的专项 Agent 还需社区贡献

## 参考资料

- **GitHub 仓库**：AgentGG 主仓库。  → https://github.com/agentgg-dev/agentgg
- **Agent 规则仓库**：OpenClaw 专项 Agent + 11 大类规则。  → https://github.com/agentgg-dev/agentgg-agents
- **官方网站**：https://agentgg.dev
- **Help Net Security 报道**：AgentGG 项目介绍及行业意义。  → https://www.helpnetsecurity.com/agentgg-agentic-sast/
