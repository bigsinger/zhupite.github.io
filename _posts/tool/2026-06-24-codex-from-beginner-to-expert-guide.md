---
layout: post
title: "Codex 从入门到专家：2026 年实战指南"
categories: [tool]
description: "一篇完整的 Codex 学习路径：从安装登录、五种使用形态（CLI/IDE/App/Web/Remote）、核心工作流、到技能开发、插件生态、MCP 集成、安全审计与自动化管线。覆盖 2026 年 6 月仍有效的功能和方法。"
tags:
  - Codex
  - AI 编码
  - 教程
  - 技能
  - MCP
---

[Codex](https://openai.com/zh-Hans-CN/codex/) 是 OpenAI 的 AI 编码 Agent，2026 年的它已经不是「帮你补全代码的助手」，而是一个能独立理解代码库、执行多步任务、连接外部工具、并在安全约束下自主工作的开发 agent。

本文从零开始，覆盖截至 2026 年 6 月仍有效的全部主要功能和工作流。

## 一、安装与形态选择

### 安装 Codex CLI

```bash
# macOS / Linux
curl -fsSL https://chatgpt.com/codex/install.sh | sh

# Windows（WSL2 环境）
powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"

# 或通过包管理器
npm install -g @openai/codex
brew install --cask codex
```

### 五种使用形态

Codex 在 2026 年有五个互不冲突的使用界面，选哪个取决于你的场景：

| 形态 | 启动方式 | 适用场景 |
|------|---------|---------|
| **CLI** | `codex`（终端交互）/ `codex exec`（非交互） | 日常开发、CI/CD 集成、远程服务器 |
| **IDE 扩展** | VS Code / Cursor / Windsurf 中安装插件 | 编辑器内工作流 |
| **桌面 App** | `codex app` 或访问 [chatgpt.com/codex](https://chatgpt.com/codex?app-landing-page=true) | 独立桌面体验 |
| **Codex Web** | [chatgpt.com/codex](https://chatgpt.com/codex) | 云端 Agent，无需本地安装 |
| **Codex Remote** | 通过 API 远程调用 | 服务端自动化、团队共享 Agent |

### 登录方式

运行 `codex` 后选择 **Sign in with ChatGPT**。ChatGPT Plus、Pro、Business、Edu、Enterprise 计划均包含 Codex 使用权限。也可以用 API Key 登录（需额外配置）。

## 二、核心能力速览

Codex 在 2026 年能做的事远不止代码生成：

- **生成代码** — 描述意图，Codex 生成匹配项目结构和约定的代码
- **理解代码库** — 阅读和解释复杂或遗留代码库
- **代码审查** — 分析代码发现潜在 bug、逻辑错误和未处理边界情况
- **调试修复** — 追踪失败原因、诊断根因、建议修复
- **自动化任务** — 重构、测试、迁移、配置等重复工作流

## 三、CLI 核心工作流

### 基本用法

```bash
# 进入项目目录，启动交互会话
cd my-project
codex

# 带提示启动
codex "给这个项目添加 README"

# 非交互模式（适合脚本和 CI）
codex exec "运行所有测试并报告覆盖率"

# 指定日志目录
codex -c log_dir=./.codex-log
```

### 代理循环模式（Agent Loop）

Codex 不是一次性输出答案，而是运行一个「思考 → 行动 → 观察 → 调整」的循环。这是 2026 年编码 Agent 的核心设计模式。

在 CLI 中，你可以看到 Codex：

1. 读取项目文件结构
2. 理解你的需求
3. 规划执行步骤
4. 创建/修改文件
5. 执行命令（如测试、lint）
6. 根据输出调整下一步
7. 直到任务完成或请求你的确认

### 代理审批与安全（Agent Approvals）

Codex 内置安全控制层，可以在执行敏感操作前请求你的确认：

- **文件修改确认** — 修改关键文件前征求同意
- **命令执行审批** — 执行可能造成破坏的命令前暂停
- **自定义审批规则** — 通过配置管理哪些操作需要审批

这些规则可以通过 [Agent Approvals & Security](https://developers.openai.com/codex/security) 文档配置，企业环境可以托管配置策略。

### 环境变量与配置

```bash
codex -c log_dir=./.codex-log          # 日志目录
codex -c max_turns=50                   # 最大执行轮次
codex -c model=gpt-5-class              # 模型选择（需订阅支持）
```

托管配置可以通过企业策略分发给团队，确保所有成员使用一致的 Codex 安全设置。

## 四、IDE 集成

Codex 深度集成到 VS Code、Cursor 和 Windsurf。安装 IDE 扩展后：

- 选中代码 → 右键 → "Explain with Codex"
- 终端面板内可直接调用 Codex
- 内联代码建议和修正
- 支持多文件上下文理解

安装方式：在 IDE 扩展市场搜索 "Codex by OpenAI" 安装。

## 五、技能开发（Codex Skills）

Skills 是 Codex 最强大的扩展机制之一。它允许你**为特定任务编写可复用的行为模板**，让 Codex 在面对特定场景时遵循预设的指令和约束。

### 什么是 Skill

一个 Skill 是一个指令文件（通常是 Markdown），告诉 Codex：

- 这个 Skill 解决什么问题
- 执行时的注意事项和约束
- 输出格式和质量标准
- 可选的工具调用模式

### 安装 Skill

```bash
# 从 npm 安装 skill
npx skills add <package-name>

# 从 GitHub 安装
npx skills add <owner>/<repo>

# 全局安装
npx skills add <package-name> -g
```

### 编写 Skill

Skill 的核心是一份 `SKILL.md` 文件。基本结构：

```markdown
# My Skill Name

为 xxx 任务提供可复用的行为模板。

## 触发条件
当用户要求 xxx 时自动激活。

## 执行步骤
1. 分析项目结构
2. 识别关键文件
3. 执行 xxx 操作
4. 验证结果

## 注意事项
- 不要修改 xxx 文件
- 执行前确认 xxx
```

Skills 可以发布到 npm 或 GitHub，团队内部也可以搭建私有 Skill 仓库。

### Skill 在实践中的作用

Skill 让 Codex 从「通用助手」变成「领域专家」。例如：

- **测试 Skill** — 让 Codex 按团队的测试规范生成测试
- **部署 Skill** — 指导 Codex 执行标准化的部署流程
- **安全审查 Skill** — 强制 Codex 在修改敏感代码前执行安全检查
- **代码风格 Skill** — 确保输出代码符合团队的风格指南

## 六、插件生态系统

Codex 插件市场提供了官方和社区构建的插件，用于扩展 Agent 的能力。

### 安装插件

```bash
# 添加插件市场源
codex plugin marketplace add <owner>/<repo>

# 安装插件
codex plugin add <plugin-name>@<source>

# 查看已安装插件
codex plugin list
```

### 插件 vs Skill

| 维度 | Skill | 插件 |
|------|-------|------|
| 本质 | 指令模板 | 能力扩展包 |
| 包含 | 提示词 + 约束 | Skill + MCP 服务 + Hook |
| 能力 | 引导行为 | 引入新工具和连接 |
| 安装位置 | 全局或项目 | 项目级 |

插件可以包含一个或多个 Skill，外加 MCP 服务器配置和 lifecycle hooks。

### Codex Security 插件

官方提供的安全插件，用于对代码仓库进行安全审计：

```bash
# 在 Codex App 中安装 Security Plugin
# 然后在项目目录中运行

# 快速本地扫描
codex security scan

# 深度扫描（更全面，耗时更长）
codex security scan --deep

# 扫描变更（PR 前使用）
codex security scan --diff
```

支持导出扫描结果并与现有安全发现联动。[了解更多](https://developers.openai.com/codex/security)

## 七、MCP 集成

Codex 支持 [Model Context Protocol（MCP）](https://developers.openai.com/codex/mcp)，允许你**将外部工具和数据源以标准协议接入 Agent**。

### 配置 MCP 服务器

在项目根目录创建 `.mcp.json`：

```json
{
  "mcpServers": {
    "my-database": {
      "command": "python3",
      "args": ["mcp-server.py"],
      "env": {
        "DB_URL": "postgresql://..."
      }
    },
    "my-api": {
      "url": "https://api.example.com/mcp"
    }
  }
}
```

### MCP 的作用

MCP 将 Agent 的上下文窗口延伸到外部系统：

- **数据库查询** — Codex 可以直接查询数据库获取 schema 和样本数据
- **API 集成** — 连接内部 API
- **文件系统** — 访问远程文件
- **工具调用** — 注册自定义工具函数

安装插件时，插件自带的 `.mcp.json` 会自动注册关联的 MCP 服务器。

## 八、Codex Remote：远程 Agent

Codex Remote 是面向服务端和团队场景的部署形态。它让你在远程环境中运行 Codex，并通过 API 控制。

### 使用场景

- **CI/CD 集成** — 在持续集成中自动执行代码审查
- **自动化运维** — 在服务器上执行维护任务
- **团队共享** — 团队成员共享同一个 Codex 环境
- **定时任务** — 定期执行代码库健康检查

### 配置

Codex Remote 通过 API Key 或 Workspace Agent Access Token 认证，支持 webhooks 和服务端控制。企业环境可以通过[托管配置](https://developers.openai.com/codex/security)统一管理策略。

## 九、评估与改进循环

Codex 提供了 **Traces 和 Evals** 机制，用于评估和改进 Agent 的行为质量。

### Traces（追踪）

每次 Codex 执行的任务都可以记录追踪信息——包括：

- 执行步骤
- 工具调用记录
- 决策路径
- 输出结果

```bash
# 启用追踪
codex exec --trace "执行代码审查"
```

### Evals（评估）

将追踪结果与预期行为对比，评估 Agent 的表现：

- 定义评估用例集
- 运行 Codex 执行
- 收集追踪数据
- 分析偏差并调整 Skill 或配置

这种「构建 Agent 改进循环」的能力让团队可以持续优化 Agent 的质量。

## 十、企业级安全实践

Codex 在企业环境中，安全是分层而非单一的：

1. **登录认证** — ChatGPT 账号或 API Key
2. **Agent 审批** — 敏感操作需人确认
3. **托管配置** — 团队统一安全策略
4. **Codex Security 插件** — 代码安全审计
5. **威胁模型改进** — 持续优化安全策略
6. **Workload Identity Federation** — 工作负载身份联合

详细安全管理参见 [Codex 安全文档](https://developers.openai.com/codex/security)。

## 十一、实战工作流示例

### 入门级：代码审查

```bash
cd my-project
codex exec "审查 src/ 目录下的所有 PR 变更，标记安全问题和性能隐患"
```

### 进阶级：自动重构

结合 Skill 进行批量重构：

```bash
# 安装重构 skill
npx skills add my-team/refactor-skills

# 执行重构
codex exec "应用 my-team 重构规范，将 utils/ 中的函数改为 TypeScript"
```

### 专家级：自动化管线

在 CI 中集成 Codex：

```yaml
# .github/workflows/codex-review.yml
jobs:
  codex-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Codex Code Review
        run: |
          codex exec "审查本次 PR 变更，输出安全风险报告"
          codex security scan --diff --output report.json
```

结合 MCP 服务器、Security 插件和 Evals，形成完整的「开发 → 审查 → 评估」闭环。

## 十二、局限与注意事项

- **模型依赖** — 高阶推理任务依赖前沿模型（GPT-5 级别及以上）
- **无互联网访问** — CLI 默认无浏览器能力，需要外部工具需通过 MCP 桥接
- **Windows 限制** — CLI 需在 WSL2 下运行
- **技能质量** — Skill 的质量取决于编写质量，低质量 Skill 可能产生反效果
- **Token 消耗** — 复杂任务消耗大量输入/输出 token，注意配额管理

---

**官方入口**：[https://openai.com/zh-Hans-CN/codex/](https://openai.com/zh-Hans-CN/codex/)
**开发者文档**：[https://developers.openai.com/codex](https://developers.openai.com/codex)
**GitHub 仓库**：[https://github.com/openai/codex](https://github.com/openai/codex)

> 本文基于 OpenAI Codex 官方文档（2026 年 6 月）编写，覆盖 CLI、IDE、App、Web、Remote 五种形态及技能、插件、MCP、安全等扩展能力。
