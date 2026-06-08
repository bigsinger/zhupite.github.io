---
layout: post
title: "Hermes Agent 完整上手指南 — 从安装到高级玩法的全方位教程"
categories: [ai]
description: "基于官方文档和社区实践，从零开始掌握 Hermes Agent：60 秒安装、模型配置、消息网关、Skill 技能开发、Cron 自动化、MCP 集成、记忆系统与安全策略"
keywords: Hermes Agent, AI Agent, 安装教程, 技能开发, Cron, MCP, 配置指南
tags:
  - Hermes Agent
  - AI Agent
  - 安装配置
  - 自动化
  - MCP
---

> 本文是基于 Hermes Agent 官方文档及社区实践整理的完整上手指南，涵盖从安装到高级功能的全部核心内容。如果你是第一次接触 Hermes Agent，这篇文章可以帮你从零到一快速上手。

## 什么是 Hermes Agent

Hermes Agent 是一个开源的、自我改进的 AI Agent 框架，由 Nous Research 团队构建。它不是一个绑定在 IDE 里的编码助手，也不是一个单一 API 的聊天机器人包装器——它是一个真正的**自主 Agent**，运行时间越长就越智能。

截至 2026 年 6 月，Hermes Agent 在 GitHub 上已获得 **185,927 Stars**、**31,983 Forks**，采用 **MIT 许可协议**，主语言为 **Python**。

**核心特性一览：**

| 特性 | 说明 |
|------|------|
| **闭环学习** | Agent 从经验中自动创建 Skills，在使用中自我改进，跨会话持久记忆 + FTS5 跨会话召回 + LLM 摘要 + 辩证用户建模 |
| **随处可运行** | 支持 6 种终端后端：本地、Docker、SSH、Daytona、Singularity、Modal。Daytona 和 Modal 提供无服务器持久化 |
| **多平台消息网关** | CLI + Telegram + Discord + Slack + WhatsApp + Signal + Matrix + Mattermost + Email + SMS + 钉钉 + 飞书 + 企业微信 + 微信 + QQ + 元宝 + BlueBubbles + Home Assistant + Microsoft Teams + Google Chat 等 20+ 平台 |
| **内置自动化** | 内置 Cron 调度器，可向任意平台投递消息 |
| **Agent 委托与并行** | 派生隔离子 Agent 进行并行工作流 |
| **开放标准 Skills** | 兼容 OpenClaw 生态，Skills 可通过 Skills Hub 分享 |
| **全栈网络控制** | 搜索、提取、浏览、视觉、图片生成、TTS — 单次订阅全覆盖 |
| **MCP 集成** | 连接任意 MCP 服务器扩展工具能力 |

## 一、在 60 秒内安装 Hermes Agent

Hermes Agent 支持 Linux、macOS、WSL2、原生 Windows 以及 Android/Termux。官方推荐通过 Hermes Desktop 安装器获得桌面应用 + CLI，也可以仅安装命令行版本。

### 1.1 Hermes Desktop（推荐）

从官网下载桌面版安装器，运行即可获得命令行和桌面应用双界面。Desktop 版本包含了完整的图形界面支持。

### 1.2 命令行安装（无 Desktop）

**Linux / macOS / WSL2 / Android (Termux)：**

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

**Windows 原生 PowerShell：**

```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

> 💡 **Windows 用户**：Hermes 支持原生 Windows 安装，**不需要 WSL**。安装器会自动配置 PortableGit 作为终端工具的 Shell。当然，WSL2 仍然是完全支持的备选方案。

### 1.3 安装器做了什么

安装器全自动处理一切依赖关系：

| 组件 | 作用 | 安装方式 |
|------|------|---------|
| Python | Agent 运行环境 | 通过 uv 自动安装 |
| Node.js | 浏览器自动化和 WhatsApp 桥接 | 自动安装 |
| ripgrep | 快速文件搜索 | 自动安装 |
| ffmpeg | TTS 音频格式转换 | 自动安装 |
| Chromium | 浏览器自动化 | Playwright 自动处理 |

**重要**：你不需要手动安装 Python、Node.js、ripgrep 或 ffmpeg。安装器会自动检测缺失项并安装。你只需要确保系统已安装 `curl`（Linux/macOS）或 PowerShell（Windows）。

### 1.4 安装后的文件布局

安装器根据运行方式决定文件位置：

| 安装方式 | 二进制位置 | 仓库位置 |
|---------|-----------|---------|
| 普通用户 | `~/.local/bin/hermes` | `~/.hermes/hermes-agent/` |
| 系统级 (`sudo bash`) | `/usr/local/bin/hermes` | `/usr/local/lib/hermes-agent/` |

安装完成后，重新加载 shell 即可使用：

```bash
# 或 source ~/.zshrc
```

### 1.5 更新与卸载

```bash
# 更新到最新版本
hermes update

# 卸载
hermes uninstall  # 或运行卸载脚本
```

## 二、快速开始：从零到可对话的 Agent

拿到一个能用的 Hermes 需要三步：安装 → 配置 Provider → 开始聊天。

### 2.1 选择 Provider（最重要的一步）

使用交互式向导选择模型提供商：

```bash
hermes setup --portal  # 一键搞定：OAuth 登录 + 模型配置 + 工具网关
```

如果不使用 Portal，可以单独配置 Provider：

| Provider | 配置方式 | 特点 |
|----------|---------|------|
| **Nous Portal** | `hermes setup --portal` | 300+ 模型 + 工具网关，一键 OAuth |
| **OpenAI** | `hermes config set provider openai` | GPT-5.4、GPT-4.1 等 |
| **Anthropic** | `hermes auth add anthropic` | Claude 系列，OAuth 或 API Key |
| **OpenRouter** | 设置 `OPENROUTER_API_KEY` | 多 Provider 路由 |
| **Google Gemini** | `hermes auth add google-gemini-cli` | Gemini 系列 |
| **本地模型** | 配置自定义端点 | Ollama、vLLM、llama.cpp 等 |

### 2.2 配置本地模型

如果你希望使用本地部署的模型（Ollama / vLLM / llama.cpp 等）：

```bash
hermes setup
# 选择: Custom endpoint (enter URL manually)
# API base URL: http://localhost:11434/v1
# API key: ollama
# Model name: qwen3.5:27b
# Context length: 64000
```

或者直接在 `~/.hermes/config.yaml` 中配置：

```yaml
provider: custom
custom:
  endpoint: http://localhost:11434/v1
  api_key: ollama
  model: qwen3.5:27b
  context_length: 64000
```

### 2.3 验证安装

```bash
# 开始对话
hermes

# 或者一次性问题
hermes -e "告诉我你的版本和可用的工具"
```

> ⚠️ **核心原则**：如果 Hermes 连基本对话都无法完成，不要急着添加更多功能。先保证一次干净的对话能正常工作，然后再叠加 gateway、cron、skills、voice 或 routing。

## 三、配置详解

Hermes Agent 的所有配置存放在 `~/.hermes/` 目录下。

### 3.1 目录结构

```
~/.hermes/
├── config.yaml     # 设置（模型、终端、TTS、压缩等）
├── .env            # API 密钥和 secrets
├── auth.json       # OAuth 提供商凭据
├── SOUL.md         # Agent 身份定义（系统提示 #1）
├── memories/       # 持久记忆（MEMORY.md, USER.md）
├── skills/         # Agent 创建的技能
├── cron/           # 定时任务
├── sessions/       # 网关会话
└── logs/           # 日志（secrets 自动脱敏）
```

### 3.2 配置管理命令

```bash
# 查看当前配置
hermes config show

# 编辑配置文件
hermes config edit

# 设置具体值
hermes config set model anthropic/claude-opus-4
hermes config set terminal.backend docker
hermes config set terminal.cwd /home/user/projects

# 检查配置完整性
hermes config check

# 迁移（交互式添加缺失选项）
hermes config migrate
```

> 💡 `hermes config set` 命令自动将值路由到正确的位置——API 密钥存入 `.env`，其他配置存入 `config.yaml`。

### 3.3 配置优先级

设置按以下顺序解析（高优先级优先）：

| 优先级 | 来源 | 示例 |
|--------|------|------|
| 1（最高） | 命令行覆盖 | `hermes chat --model anthropic/claude-sonnet-4` |
| 2 | `~/.hermes/config.yaml` | 主要的非秘密配置 |
| 3 | 环境变量 | `.env` 文件中的 API 密钥 |
| 4（最低） | 内置默认值 | 硬编码的安全默认值 |

### 3.4 环境变量替换

你可以在 `config.yaml` 中引用环境变量：

```yaml
terminal:
  backend: docker
  cwd: "${CUSTOM_VISION_URL}"
```

语法：`${VARIABLE_NAME}`。如果变量未设置，占位符保留原样。

### 3.5 多 Provider 与 Provider 超时

```yaml
providers:
  openai:
    request_timeout_seconds: 300
    models:
      gpt-5-codex:
        timeout_seconds: 600
```

| 参数 | 说明 |
|------|------|
| `request_timeout_seconds` | Provider 级请求超时 |
| `models.<model>.timeout_seconds` | 特定模型的超时覆盖 |
| `stale_timeout_seconds` | 非流式调用的过时检测器超时 |

## 四、工具与工具集

Hermes Agent 内置了 60+ 工具，按逻辑分组为**工具集（Toolsets）**，可针对不同平台启用或禁用。

### 4.1 内置工具类别

| 类别 | 说明 |
|------|------|
| **Web** | 搜索网页、提取页面内容 |
| **X (Twitter) 搜索** | 搜索 X 帖子和话题（需 xAI 凭据） |
| **终端与文件** | 执行命令、操作文件 |
| **浏览器** | 交互式浏览器自动化（文本 + 视觉） |
| **视觉/图像** | 多模态分析和生成 |
| **Agent 编排** | 规划、澄清、代码执行、子 Agent 委托 |
| **记忆与召回** | 持久记忆、会话搜索 |
| **自动化与投递** | 定时任务创建/管理、消息投递 |
| **MCP** | MCP 服务器工具 |
| **集成** | Home Assistant 等 |

### 4.2 工具集配置

```bash
# 列出所有可用工具
hermes tools list

# 配置每个平台的工具集（交互式）
hermes gateway setup

# 在配置文件中指定
hermes config set toolsets "web,terminal,vision,memory,cron,file"
```

### 4.3 Nous 工具网关

对于 Portal 订阅用户，可以通过 Nous Tool Gateway 使用以下工具，无需单独申请 API 密钥：

| 工具 | 说明 |
|------|------|
| **Web 搜索** | 搜索和获取网页内容 |
| **图像生成** | AI 图像生成 |
| **TTS** | 文本转语音 |
| **浏览器自动化** | 云端浏览器 |

启用方法：`hermes setup --portal` 即可一次性完成配置。

### 4.4 终端后端

Hermes 的 terminal 工具可以在不同环境中执行命令：

```yaml
# ~/.hermes/config.yaml
terminal:
  backend: local        # local | docker | ssh | singularity | modal | daytona
  cwd: /home/user/projects
  timeout_seconds: 300
```

| 后端 | 使用场景 |
|------|---------|
| `local` | 本地机器，开发用 |
| `docker` | 隔离容器，安全/可重现 |
| `ssh` | 远程服务器 |
| `singularity` | 集群计算 |
| `modal` | 无服务器弹性伸缩 |
| `daytona` | 持久远程开发环境 |

> 💡 Docker 模式下，Hermes 启动一个长期存活容器（`docker run -d ... sleep 2h`），所有终端操作、文件操作都路由到该容器中，工作目录、安装的包、环境修改跨工具调用保持。

## 五、消息网关（Messaging Gateway）

消息网关是一个后台进程，连接到你配置的所有消息平台，处理会话、运行 Cron 任务、投递语音消息。

### 5.1 支持的平台

| 平台 | 图片 | 文件 | 语音 | 线程 | 表情回应 | 打字指示 |
|------|:----:|:----:|:----:|:----:|:-------:|:--------:|
| Telegram | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Discord | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Slack | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| WhatsApp | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| 飞书/Lark | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 微信 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 企业微信 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| QQ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 钉钉 | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Signal | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Matrix | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Mattermost | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| SMS | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Email (IMAP/SMTP) | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Microsoft Teams | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Google Chat | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Home Assistant | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| LINE | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| ntfy | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 5.2 配置消息平台

```bash
# 交互式配置所有消息平台
hermes gateway setup

# 启动网关（前台运行）
hermes gateway start

# 安装为系统服务（Linux/macOS）
hermes gateway install

# 查看状态
hermes gateway status

# 停止
hermes gateway stop
```

### 5.3 聊天内命令

在消息平台中，你可以使用以下命令：

| 命令 | 功能 |
|------|------|
| `/new` | 开始新的对话 |
| `/model [provider:model]` | 切换模型 |
| `/retry` | 重试最后一条消息 |
| `/undo` | 撤销上一次交互 |
| `/stop` | 停止正在运行的 Agent |
| `/approve` | 批准待处理的危险命令 |
| `/reject` | 拒绝待处理的危险命令 |
| `/home` | 将当前聊天设为 home channel |
| `/compress` | 手动压缩对话上下文 |
| `/title [name]` | 设置会话标题 |
| `/resume [name]` | 恢复指定会话 |
| `/voice [on/off/tts]` | 控制语音回复 |
| `/reload-mcp` | 重新加载 MCP 服务器 |
| `/update` | 更新到最新版 |
| `/help` | 显示可用命令 |
| `/<skill-name>` | 调用已安装的 Skill |

### 5.4 会话管理

会话在消息之间持久存在，Agent 会记住你的对话上下文。会话重置策略可配置：

- 每日固定时间重置
- 达到消息数量上限后重置
- 手动调用 `/new` 重置

## 六、技能系统（Skills）

Skills 是 Hermes Agent 的**程序化记忆**——按需加载的知识文档。Agent 在需要时才加载完整内容，采用渐进式披露模式以最小化 Token 消耗。

### 6.1 什么是 Skills

一个 Skill 就是一份有结构的 Markdown 文档（`SKILL.md`），包含 YAML 前置元数据和正文指令。它们存放在 `~/.hermes/skills/` 目录下，Agent 通过 `skill_manage` 工具自行创建、修改或删除。

**Skills vs 记忆（Memory）：**

| 维度 | Skills | 记忆 (Memory) |
|------|--------|---------------|
| 加载方式 | 按需加载（渐进式披露） | 每次会话自动注入 |
| 容量 | 无上限 | 2,200 字符 + 1,375 字符 |
| 来源 | Agent 创建、Hub 安装、用户编写 | Agent 自行维护 |
| 用途 | 流程化知识、工作流模板 | 环境事实、个人偏好 |

### 6.2 渐进式披露（Progressive Disclosure）

Skills 采用三级加载模式：

| 级别 | 调用方式 | 内容 | Token 开销 |
|------|---------|------|-----------|
| Level 0 | `skills_list()` | 名称 + 描述 + 分类 | ~3k tokens |
| Level 1 | `skill_view(name)` | 完整内容 + 元数据 | 视内容而定 |
| Level 2 | `skill_view(name, file_path)` | 特定引用文件 | 视文件而定 |

Agent 只在实际需要时才加载完整的 Skill 内容。

### 6.3 使用 Skills

```bash
# 在 CLI 或消息平台中
/gif-search funny cats
/github-pr-workflow create a PR
/plan design a rollout

# 也可以自然对话
"你有哪些技能？"
"显示 axolotl 技能的内容"
```

### 6.4 创建与管理 Skills

Agent 会在以下情况自动创建 Skill：

- 复杂任务成功完成（5 次以上工具调用）
- 克服了棘手的错误
- 发现非平凡的、可复用的工作流
- 用户明确要求 \"记住这个流程\"

```bash
# 列出可用技能
hermes skills list

# 查看一个技能
hermes skills view skill-name
```

每个 Skill 的 SKILL.md 文件包含：

```yaml
---
name: skill-name
description: 该技能做什么
platforms: [linux, macos, windows]  # 可选
requires_toolsets: [terminal, file]  # 可选
required_commands: [python3]         # 可选
---
# 技能正文
1. 第一步...
2. 第二步...
```

### 6.5 外部技能目录

你可以让 Hermes 扫描额外的技能目录：

```yaml
# ~/.hermes/config.yaml
skill_directories:
  - /path/to/my-skills
  - /path/to/team-skills
```

### 6.6 Skills Hub（社区技能）

Hermes 兼容 OpenClaw 生态的 Skills Hub，社区贡献的技能可通过以下方式安装：

```bash
hermes skills install hub skill-name
```

## 七、Cron 自动化（定时任务）

Hermes Agent 内置 Cron 调度器，可以定时执行任务并投递结果到任意平台。

### 7.1 创建定时任务

```bash
# 每 30 分钟执行一次
hermes cron create \
  --schedule "30m" \
  --prompt "检查系统磁盘使用情况" \
  --deliver origin

# 每天上午 9 点发送日报
hermes cron create \
  --schedule "0 9 * * *" \
  --prompt "执行日报生成技能，生成今天的日报并发送" \
  --deliver telegram

# 一次性任务
hermes cron create \
  --schedule "2026-06-10T09:00:00" \
  --prompt "发送端午节提醒消息"
```

### 7.2 Cron 参数详解

| 参数 | 说明 | 示例 |
|------|------|------|
| `--schedule` | 调度表达式 | `30m`, `0 9 * * *`, `2026-06-10T09:00:00` |
| `--prompt` | 任务执行的提示词 | 自包含的完整指令 |
| `--deliver` | 投递目标 | `origin`, `local`, `telegram:-100...`, `all` |
| `--skills` | 需要加载的技能 | `[daily-briefing, news-daily]` |
| `--script` | 执行脚本（绕过 LLM） | `/path/to/check-disk.sh` |
| `--no-agent` | 纯脚本模式，无 LLM | 适合监控告警场景 |

### 7.3 管理任务

```bash
# 列出所有任务
hermes cron list

# 暂停任务
hermes cron pause --job-id <id>

# 恢复任务
hermes cron resume --job-id <id>

# 立即执行一次
hermes cron run --job-id <id>

# 删除任务
hermes cron remove --job-id <id>

# 更新任务
hermes cron update --job-id <id> --schedule "0 8 * * *" --prompt "新的提示词"
```

### 7.4 脚本模式（无 LLM 的看门狗）

对于不需要 Agent 推理的简单监控任务，可以使用 `--no-agent` 模式：

```bash
hermes cron create \
  --schedule "5m" \
  --script /path/to/check-disk.sh \
  --no-agent
```

规则：
- 脚本的 stdout 直接作为消息投递
- **空输出 = 静默**（什么也不发送）—— 适合只做阈值告警的看门狗模式
- 非零退出码 / 超时会发送错误告警

### 7.5 Cron 的权限与安全

```yaml
# ~/.hermes/config.yaml
approvals:
  cron: deny  # deny | approve — 定时任务遇到危险命令时的默认行为
```

- `deny`：阻止危险命令（Agent 必须找其他路径）
- `approve`：在 Cron 上下文中自动批准所有命令

## 八、记忆系统（Memory）

Hermes Agent 拥有**有界、精炼的持久记忆**，跨会话持续存在。Agent 能记住你的偏好、项目、环境和学到的东西。

### 8.1 两个记忆文件

| 文件 | 用途 | 容量 | 内容示例 |
|------|------|------|---------|
| `MEMORY.md` | Agent 的个人笔记 | 2,200 字符 | 环境事实、项目约定、工具技巧 |
| `USER.md` | 用户画像 | 1,375 字符 | 名称、偏好、沟通风格 |

两者存储在 `~/.hermes/memories/`，在会话开始时作为冻结快照注入系统提示。

### 8.2 记忆如何出现在系统提示中

```
══════════════════════════════════════════════
MEMORY (your personal notes) [67% — 1,474/2,200 chars]
══════════════════════════════════════════════
User's project is a Rust web service at ~/code/myapi using Axum + SQLx
This machine runs Ubuntu 22.04, has Docker and Podman installed
User prefers concise responses, dislikes verbose explanations
```

### 8.3 Agent 如何管理记忆

Agent 通过 `memory` 工具自主管理记忆：

```python
# 添加新记忆
memory(action="add", target="memory", content="项目使用 Python 3.13 + FastAPI")

# 替换已有记忆（通过子串匹配）
memory(action="replace", target="memory", 
       old_text="Python 3.12", 
       content="项目使用 Python 3.13 + FastAPI")

# 删除不再相关的记忆
memory(action="remove", target="memory", old_text="old fact")
```

**子串匹配**：`replace` 和 `remove` 使用短唯一子串匹配，不需要完整内容。

### 8.4 什么应该保存到记忆

| 应该保存 | 不应该保存 |
|---------|-----------|
| 用户偏好（\"喜欢简洁回答\"） | 任务进度（\"Phase 3 完成\"） |
| 环境事实（\"运行 Ubuntu 22.04\"） | 临时的 TODO 状态 |
| 项目约定（\"使用 pytest 测试\"） | 一次性数字（PR #123） |
| 工具技巧（\"用 `hermes config set`\"） | 7 天内会过时的事实 |
| 用户的纠正（\"不要用第一人称\"） | 已完成任务的详细记录 |

## 九、MCP 集成

MCP（Model Context Protocol）让 Hermes Agent 连接外部工具服务器——GitHub、数据库、文件系统、浏览器栈、内部 API 等。

### 9.1 安装 MCP 支持

```bash
# 如果使用标准安装脚本，MCP 已包含
pip install ".[mcp]"
```

### 9.2 配置 MCP 服务器

在 `~/.hermes/config.yaml` 中添加：

```yaml
mcp_servers:
  filesystem:
    command: npx
    args:
      - "@modelcontextprotocol/server-filesystem"
      - "/home/user/projects"
  github:
    command: npx
    args:
      - "@modelcontextprotocol/server-github"
```

配置完成后，Agent 会自动发现 MCP 服务器的工具并在需要时使用。

### 9.3 MCP 目录（Canned Catalog）

Hermes 内置一个经 Nous 团队审阅的 MCP 服务器目录：

```bash
# 交互式选择（默认）
hermes mcp catalog

# 纯文本列表（可脚本化）
hermes mcp catalog --plain

# 安装指定条目
hermes mcp install linear
```

目录中的每个条目包含：
- **名称**：如 `github`、`linear`、`n8n`
- **状态**：available / enabled / installed (disabled)
- **类型**：
  - **有凭据**：安装时提示输入，写入 `.env`
  - **远程 MCP（OAuth）**：首次连接时打开浏览器认证
  - **三方 OAuth**：指向 `hermes auth <provider>`

### 9.4 工具选择（安装时的安全检查）

安装 MCP 服务器时，Hermes 会探测其暴露的所有工具并提供勾选清单：

```
Select tools for 'linear' (SPACE toggle, ENTER confirm)
[x] find_issues       Find issues matching a query
[x] get_issue         Get a single issue
[x] create_issue      Create a new issue
[ ] delete_workspace  Delete a Linear workspace
```

只有勾选的工具才会被注册，未选择的（如危险的 `delete_workspace`）不会被暴露给 Agent。

### 9.5 运行时管理

```bash
# 重新加载所有 MCP 服务器（无需重启）
/reload-mcp  # 聊天内命令
hermes mcp reload

# 查看 MCP 状态
hermes mcp status
```

## 十、安全策略

Hermes Agent 设计了**七层纵深防御**安全模型：

| 层 | 防护内容 |
|----|---------|
| 1. 用户授权 | 谁可以和 Agent 对话（允许列表、DM 配对） |
| 2. 危险命令审批 | 人为介入的破坏性操作 |
| 3. 容器隔离 | Docker/Singularity/Modal 沙箱 |
| 4. MCP 凭据过滤 | MCP 子进程的环境变量隔离 |
| 5. 上下文文件扫描 | 项目文件中的提示注入检测 |
| 6. 会话隔离 | 会话之间无法访问彼此的数据或状态 |
| 7. 输入清理 | 终端后端的路径参数白名单验证 |

### 10.1 危险命令审批模式

```yaml
# ~/.hermes/config.yaml
approvals:
  mode: smart     # manual | smart | off
  timeout: 60     # 等待用户响应的秒数
  cron: deny      # cron 遇到危险命令时的策略
  mcp_reload_confirm: true   # 重新加载 MCP 前确认
  destructive_slash_confirm: true  # /clear /new 等前确认
```

| 模式 | 行为 |
|------|------|
| `manual` | 危险命令总是提示用户审批 |
| `smart` | 辅助 LLM 评估风险。低风险自动批准，高风险自动拒绝，不确定时手动审批 |
| `off` | 禁用所有审批（仅在信任环境中使用） |

### 10.2 YOLO 模式

`--yolo` 标志会绕过当前会话的危险命令审批：

```bash
# 启动时开启
hermes chat --yolo

# 会话中切换
/yolo

# 环境变量
HERMES_YOLO_MODE=1
```

激活后会有红色横幅提示：`⚠ YOLO mode — all approval prompts bypassed`

> ⚠️ `approvals.mode: off` 禁用所有安全提示。仅在 CI/CD、容器等受信任环境中使用。

## 十一、CLI 命令速查

### 11.1 全局入口

```bash
hermes [--profile name] [--resume session] [-r session] [--yolo]
```

| 选项 | 说明 |
|------|------|
| `--profile <name>` | 指定使用的 Hermes 配置 |
| `--resume <session>` / `-r` | 恢复之前的会话 |
| `--continue` | 恢复最近一次会话 |
| `--yolo` | YOLO 模式（绕过审批） |
| `--no-color` | 禁用彩色输出 |

### 11.2 常用命令

| 命令 | 功能 |
|------|------|
| `hermes` 或 `hermes chat` | 交互式对话 |
| `hermes setup` | 交互式配置向导 |
| `hermes gateway start` | 启动消息网关 |
| `hermes cron list` | 管理定时任务 |
| `hermes tools list` | 列出可用工具 |
| `hermes skills list` | 列出可用技能 |
| `hermes config show` | 查看配置 |
| `hermes config set` | 设置配置项 |
| `hermes mcp catalog` | MCP 服务器目录 |
| `hermes update` | 更新到最新版 |
| `hermes status` | 查看 Agent/认证/平台状态 |
| `hermes security audit` | 供应链安全审计 |
| `hermes send` | 发送一次性消息到指定平台 |

## 十二、最佳实践与技巧

### 12.1 获得更好的结果

**明确具体：** 模糊的提示产生模糊的结果。不要只说「修复代码」，要说「修复 `process_request()` 函数第 47 行的 TypeError——它收到的是 `None`」。

**前置提供上下文：** 在请求中前置相关细节：文件路径、错误信息、预期行为。一条精心编写的消息胜过三轮反复澄清。直接粘贴错误回溯——Agent 可以解析。

**使用 AGENTS.md 文件：** 在项目根目录放一个 `AGENTS.md`，记录架构决策、编码约定和项目特定指令。Agent 每次会话自动读取——一次配置，永久生效。

```markdown
# AGENTS.md 示例
这是一个 FastAPI 后端项目，使用 SQLAlchemy ORM
始终为数据库操作使用 async/await
测试使用 pytest + pytest-asyncio
```

**让 Agent 使用它的工具：** 不要手把手指导每一步。说「找到并修复那个失败的测试」而不是「打开 `tests/test_foo.py`，看第 42 行，然后...」。Agent 有文件搜索、终端访问和代码执行能力——让它自由探索。

**使用 Skills 处理复杂工作流：** 在写长提示之前，先检查是否有现成的 Skill。输入 `/help` 浏览可用 Skills，或直接调用 `/github-pr-workflow`。

### 12.2 CLI 高效使用

| 技巧 | 说明 |
|------|------|
| `Alt+Enter` | 插入换行而不发送 |
| `Ctrl+C` | 中断 Agent 中间响应；双击在 2 秒内强制退出 |
| 粘贴代码块 | CLI 自动检测多行粘贴，不会逐行发送 |
| `-r "项目名"` | 按标题恢复会话 |
| 剪贴板图片粘贴 | 直接粘贴截图，Agent 用视觉分析 |
| `Tab` 补全 | 查看所有可用命令和 Skills |
| `Ctrl+T` 切换 | 循环切换工具输出显示模式：off → new → all → verbose |

### 12.3 会话管理

```bash
# 恢复之前会话
hermes -r "research project"
hermes --continue

# 输出模式切换（聊天中）
Ctrl+T  # 循环: off → new → all → verbose
```

**`AGENTS.md` 文件**是项目的「大脑」——放在项目根目录，Agent 每次使用该工作目录时自动加载。

### 12.4 学习路径推荐

| 经验水平 | 推荐内容 |
|---------|---------|
| **初学者** | 安装 → 配置 Provider → 基本对话 → 内置工具 |
| **中级** | 消息网关 → 高级功能（记忆、Cron、Skills） |
| **高级** | 自定义工具 → 创建 Skill → RL 训练 → 贡献项目 |

### 12.5 常见故障排除

| 问题 | 排查方向 |
|------|---------|
| **安装后 `hermes` 找不到** | 重新加载 shell：`source ~/.bashrc` |
| **模型无响应** | 检查 API Key 和 network；先用 `hermes setup` 重新配置 Provider |
| **工具调用失败** | `hermes tools list` 确认工具已启用 |
| **Gateway 不工作** | `hermes gateway status` 查看服务状态 |
| **记忆没更新** | 记忆的冻结快照在会话开始时固定，跨会话才生效 |
| **Skills 不加载** | `hermes skills list` 检查是否已安装 |

## 总结

Hermes Agent 是一个真正能「越用越聪明」的开源 AI Agent 框架。它的核心竞争壁垒在于三件事：

1. **闭环学习系统**——记忆 + Skills + 跨会话召回，让 Agent 从每一次交互中积累经验
2. **无处不在的部署能力**——从本地到云端，从 CLI 到 20+ 消息平台
3. **开放的生态系统**——MCP 集成、Skills Hub、OpenClaw 兼容

对于开发者来说，从一条 `curl` 命令开始，60 秒内就能拥有一个属于自己的 AI Agent。建议按以下路线图深入：

1. **Day 1**：安装 + 配置 Provider + 开始聊天
2. **Day 2**：配置消息平台 + 设置 Cron 自动化
3. **Week 1**：学习创建 Skills + 连接 MCP 服务器
4. **Month 1**：全面定制 SOUL.md + 训练自己的模型

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/NousResearch/hermes-agent |
| 官方网站 | https://hermes-agent.nousresearch.com |
| 官方文档 | https://hermes-agent.nousresearch.com/docs |
| 中文社区 | https://hermesagent.org.cn |
| 安装命令 | `curl -fsSL https://hermes-agent.nousresearch.com/install.sh \| bash` |
| Windows 安装 | `iex (irm https://hermes-agent.nousresearch.com/install.ps1)` |
| 许可证 | MIT License |

## 参考资料

- **Hermes Agent 官方文档**：完整的安装、配置、使用指南。  → https://hermes-agent.nousresearch.com/docs
- **Hermes Agent GitHub 仓库**：源代码发布页面。  → https://github.com/NousResearch/hermes-agent
- **Hermes Agent 中文社区**：中文文档与安装教程。  → https://hermesagent.org.cn
- **Nous Portal 服务**：一站式模型 + 工具网关订阅。  → https://nousresearch.com/portal
- **MCP 协议文档**：Model Context Protocol 官方规范。  → https://modelcontextprotocol.io
