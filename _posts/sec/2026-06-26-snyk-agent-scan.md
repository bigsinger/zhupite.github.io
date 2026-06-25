---
layout: post
title: "Snyk Agent Scan：扫描 AI Agent、MCP 服务器和 Agent Skill 的安全风险"
categories: [sec]
description: "Snyk 开源的 Agent 安全扫描工具，自动发现本地 Agent 组件，检测 prompt 注入、工具投毒、恶意载荷等 15+ 类风险。"
tags:
  - Agent安全
  - Snyk
  - MCP
  - 安全扫描
  - 开源工具
---

## 一句话

Snyk Agent Scan（原名 MCP-Scan）是一个 Python CLI 工具，自动发现你机器上安装的 Agent 组件（包括 Cursor、Claude Code、Windsurf 等 10+ 种 Agent 的 Skill 和 MCP 配置），扫描 prompt 注入、工具投毒、恶意载荷等 15+ 类安全风险。最新版本 v0.5.12（2026-06-23）。

项目仓库：[github.com/snyk/agent-scan](https://github.com/snyk/agent-scan)（Apache-2.0 许可证，2,661 Stars，持续活跃开发中）。

## 背景：Agent 安全扫描为什么需要

传统安全扫描关注的是代码和依赖——npm 包、pip 库、Docker 镜像有漏洞，可以 SCA、SAST、DAST 覆盖。但 Agent 时代出现了新的软件成分：

- **Agent Skill（技能）**：本质上是 Markdown 格式的文本文件，但可能包含 `curl | bash` 类的终端命令、base64 编码的恶意载荷、硬编码密钥或诱骗 Agent 泄露数据的注入指令。
- **MCP Server（模型上下文协议服务器）**：Agent 通过 JSON-RPC 与之通信，可能被植入恶意工具（工具投毒），或者被配置成输出携带注入指令的数据（有毒流）。

这些成分不在传统扫描的范围内——它们不是代码，也不是二进制，而是**自然语言编排的指令集**。Agent Scan 做的就是这件事：把这些 Agent 特有的组件纳入安全扫描范围。

## 检测能力

Agent Scan 目前覆盖四大类风险：

| 风险类别 | 针对组件 | 检测内容 |
|---|---|---|
| Prompt 注入（E001/E004） | MCP Server、Skill | 工具/技能描述中是否嵌入了改变 Agent 行为的提示指令 |
| 工具投毒（E001） | MCP Server | 工具的 name 或 description 是否被篡改为指向恶意操作 |
| 工具影子（E002） | MCP Server | 是否存在同名工具替换合法工具 |
| 有毒流（ToxicFlows） | MCP Server | 工具输出是否可能携带可执行或注入性数据 |
| 恶意载荷（E006） | Skill | 是否包含 base64 编码的可执行内容、curl/wget 远程下载 |
| 不受信任内容（W011） | Skill | 是否引用未验证的外部资源 |
| 凭据泄露（W007/W008） | Skill | 是否包含硬编码的 API Key、Token、密码 |
| 权限配置风险 | MCP Server | 是否需要 `--dangerously-run-mcp-servers` 标志、是否暴露敏感资源 |

完整的 issue 码参考见[项目文档](https://github.com/snyk/agent-scan/blob/main/docs/issue-codes.md)。

## 支持的 Agent 和平台

Agent Scan 能**自动发现**以下 Agent 的 Skill 和 MCP 配置，并在对应平台上执行扫描：

| Agent | macOS | Linux | Windows |
|---|---|---|---|
| Windsurf | ✓ | ✓ | ✓ |
| Cursor | ✓ | ✓ | ✓ |
| VS Code | ✓ | ✓ | ✓ |
| Claude Desktop | ✓ | — | ✓ |
| Claude Code | ✓ | ✓ | ✓ |
| Gemini CLI | ✓ | ✓ | ✓ |
| OpenClaw | ✓ | ✓ | ✓ |
| Amp | ✓ | ✓ | ✓ |
| Kiro | ✓ | ✓ | ✓ |
| Codex | ✓ | ✓ | — |
| Amazon Q | ✓ | ✓ | ✓ (WSL) |
| Antigravity | ✓ | ✓ | ✓ |

每个 Agent 还按 **系统级 / 用户级 / 项目级 / 扩展插件级** 四个配置范围做细粒度覆盖。

## 快速上手

Agent Scan 通过 PyPI 分发，用 `uvx` 一行运行（需要先安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)）：

### 1. 获取 Snyk Token

在 [app.snyk.io/account](https://app.snyk.io/account) 注册并获取 API Token，设为环境变量：

```bash
export SNYK_TOKEN=your-api-token-here
```

### 2. 运行扫描

```bash
uvx snyk-agent-scan@latest
```

这会自动发现并扫描本机所有 Agent 的 MCP 配置和 Skill 文件。也可以扫描指定路径：

```bash
# 扫描指定 MCP 配置
uvx snyk-agent-scan@latest ~/.vscode/mcp.json

# 扫描单个 Skill 文件
uvx snyk-agent-scan@latest ~/path/to/my/SKILL.md

# 扫描某个目录下的全部 Skill
uvx snyk-agent-scan@latest ~/.claude/skills
```

### 其他命令

```bash
# 仅查看工具描述，不做安全验证
snyk-agent-scan inspect

# JSON 格式输出
snyk-agent-scan --json

# 跳过 Skill 分析
snyk-agent-scan --no-skills
```

## 安全注意事项

扫描 MCP 配置时，Agent Scan 需要**实际启动 stdio MCP 服务器**来获取工具描述——这意味着配置文件中定义的命令会被执行。项目文档对此做了明确的安全警告：

- 交互式运行时，每个 MCP Server 启动前都会弹出确认提示，显示要执行的完整命令和参数
- 非交互环境（CI/CD）需要显式使用 `--dangerously-run-mcp-servers` 标志
- **建议**：在 Docker 容器或虚拟机中扫描不受信任的第三方 MCP 配置

## 架构扫描 vs 后台监控

Agent Scan 有两种运行模式：

1. **扫描模式**：CLI 一次性扫描，输出安全报告。
2. **后台模式**：与 [Snyk Evo](https://evo.ai.snyk.io) 平台配合，定时扫描并上报结果到中央控制台，供安全团队集中监控全公司的 Agent 供应链风险。这个模式需要联系 Snyk 开通。

扫描执行后，Skill 内容、Agent 应用名、工具名和描述会发送到 Snyk 的 API 做分析验证。Agent Scan 不存储 MCP 工具调用的内容和结果。

## 局限与判断

**优点：**

- 填补了 Agent 安全扫描的空白——传统 SCA/SAST 不覆盖 Markdown Skill 和 MCP 协议
- 自动发现能力覆盖 10+ 主流 Agent，减少手动排查成本
- 检测项定义清晰（有 issue code 文档），结果可追溯
- 保持活跃更新（v0.5.12 于 2026-06-23 发布）

**局限：**

- **依赖 Snyk 平台**：需要注册 Snyk 账号获取 API Token 才能运行
- **非完全离线**：扫描过程会将技能内容发送到 Snyk API 做验证
- **MCP 扫描需启动服务器**：存在一定的安全风险，建议在沙箱中运行
- **不对社区开放贡献**：项目明确不接受外部 Pull Request，仅接受 issue
- **CLI 输出仍处实验阶段**：项目明确警告输出格式可能随版本变化，不建议基于 CLI 输出构建生产工作流

## 项目信息

- **仓库**：[github.com/snyk/agent-scan](https://github.com/snyk/agent-scan)
- **许可证**：Apache-2.0（来自 GitHub API）
- **编程语言**：Python
- **Stars**：2,661（截至本文发布）
- **最新 Release**：v0.5.12（2026-06-23）
- **安装方式**：`uvx snyk-agent-scan@latest`
- **PyPI**：[snyk-agent-scan](https://pypi.python.org/pypi/snyk-agent-scan)
- **技术报告**：[Agent Skill 生态系统新兴威胁](https://github.com/snyk/agent-scan/blob/main/.github/reports/skills-report.pdf)
