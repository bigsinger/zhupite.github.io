---
layout: post
title: "RTK（Rust Token Killer）：LLM Token 消耗降低 60-90% 的 CLI 代理"
categories: [tool]
description: "RTK 是一个高性能 CLI 代理工具，在 AI 编码助手（Claude Code、Copilot、Cursor 等）调用命令时自动过滤压缩输出，减少 60-90% 的 Token 消耗。单 Rust 二进制文件，零依赖，支持 100+ 命令。GitHub 61.6K Stars。本文介绍它的工作原理、安装方式和实际效果。"
tags:
  - RTK
  - Rust Token Killer
  - Token优化
  - AI编码
  - Claude Code
  - CLI工具
  - 开源
---

如果你用 Claude Code、Cursor、Copilot 这类 AI 编码助手，大概遇到过这种情况：Agent 执行一个 `git status`，返回 2000 tokens 的输出，但有效信息只有几行。开发机上跑得飞快，但 API 账单是按 Token 计的。

[**RTK（Rust Token Killer）**](https://github.com/rtk-ai/rtk) 就是解决这个问题的。GitHub 上 61.6K Stars，是目前增长最快的 AI 基础设施工具之一。

---

## 一、解决的问题

AI 编码助手在执行命令时，会把命令的全部原始输出送入 LLM 上下文。很多命令的输出包含大量噪声——编译日志中的"Compiling xxx..."、Git 操作的计数过程、测试通过的行列详情。

RTK 的原理很简单：在命令和 AI 工具之间插入一个代理层，把原始输出过滤、压缩后再送给 LLM。

```
AI 工具 → 执行命令 → RTK（过滤压缩）→ 精简后的输出 → LLM
```

以 `git push` 为例：
- 原始输出：15 行，约 200 tokens（计数对象、压缩、写入等过程信息）
- RTK 输出：1 行 `ok main`，约 10 tokens
- **节省 95%**

---

## 二、实际能省多少

项目给了一份基于 30 分钟 Claude Code 会话的实测数据：

| 操作 | 频率 | 原始 Token | RTK 后 | 节省 |
|------|------|-----------|-------|------|
| `ls` / `tree` | 10 次 | 2,000 | 400 | -80% |
| `cat` / `read` | 20 次 | 40,000 | 12,000 | -70% |
| `git diff` | 5 次 | 10,000 | 2,500 | -75% |
| `git add/commit/push` | 8 次 | 1,600 | 120 | -92% |
| `cargo test` / `npm test` | 5 次 | 25,000 | 2,500 | -90% |
| `pytest` | 4 次 | 8,000 | 800 | -90% |
| `docker ps` | 3 次 | 900 | 180 | -80% |
| **合计** | | **~118,000** | **~23,900** | **-80%** |

这意味着一半以上的 API 费用花在了 AI 阅读冗余输出上。RTK 直接砍掉这部分。

---

## 三、Token 缩减的技术原理

RTK 不是简单的文本截断或通用压缩。它对**每种命令的输出结构**做针对性解析，然后组合应用四种策略。

### 策略 1：智能过滤（Smart Filtering）

移除对 LLM 没有信息价值的内容。每种命令的过滤规则不同：

| 命令 | 过滤的内容 | 原因 |
|------|-----------|------|
| `git push/pull` | 枚举对象、压缩、写入的计数过程 | Agent 只需要知道成功或失败 |
| `cargo build` | "Compiling xxx..." 的每条编译单元报告 | 失败时才需要看具体信息 |
| `cargo test` | 全部通过的测试项 | Agent 只需要知道失败项和汇总 |
| `npm install` | 下载解析过程 | 只需结果："added 123 packages" |
| `docker pull` | 每一层的下载进度 | Agent 不能从中获得有用信息 |
| `ls -la` | 文件权限、日期、所有者 | Agent 只需要文件名和结构 |

这些对人类终端有反馈意义的内容（"编译到哪一步了"、"下载进度如何"），对 AI Agent 来说只是 Token 浪费。

### 策略 2：分组聚合（Grouping）

将大量同类型条目按类别归纳，减少重复描述结构：

```
# 原始输出 ls -la（45 行，约 800 tokens）
drwxr-xr-x  15 user staff 480 Dec 1  src
-rw-r--r--   1 user staff 1234 Dec 1  main.rs
...

# RTK 输出 rtk ls（12 行，约 150 tokens）
my-project/
  +-- src/   (8 files)
  +-- Cargo.toml
```

类似地：`kubectl get pods` 按状态分组（Running / Pending / CrashLoopBackOff），`npm ls` 折叠为顶层依赖清单，测试错误按文件位置分组而非逐行罗列。

### 策略 3：上下文截断（Truncation）

不是按行数硬切，而是保留信息密度最高的部分：

- **日志**：只保留 ERROR/WARN 和对应的时间戳，去掉重复的 INFO 行
- **测试输出**：保留失败项的错误信息 + 汇总统计，去掉全通过的测试名列表
- **编译错误**：保留每个错误的位置和具体消息，去掉解析过程的中间日志
- **`rtk read` 的 aggressive 模式**：只输出函数签名，去掉函数体——让 Agent 知道 API 签名即可

### 策略 4：去重折叠（Deduplication）

日志中反复出现的相同错误或警告，折叠为一行加计数：

```
# 原始（5 行）
error: timeout connecting to service-a
error: timeout connecting to service-a
error: timeout connecting to service-a
error: timeout connecting to service-a
error: timeout connecting to service-b

# RTK（2 行）
error: timeout connecting to service-a  (x4)
error: timeout connecting to service-b
```

### 为什么不是通用文本压缩

每种命令的输出格式不同，没有通用的压缩算法能做到"保留要保留的、删掉要删掉的"。RTK 为 100+ 命令**各自写了专门的解析器**——它知道 `cargo test` 输出的哪一行是测试名、哪一行是结果、哪一行是错误详情，能精确做到"保留失败项完整错误、去掉全部通过的测试项"。这不是 `grep -v`、`tail` 或通用 gzip 能实现的。这也是 RTK 选择 Rust 开发的原因——为每种命令写解析器和优化规则，需要高性能和可维护性，Python/Node 在大量命令并发处理时性能不够。

---

## 四、如何适配不同的 AI Agent

RTK 支持多种 AI 编码助手，适配机制因 Agent 架构不同而分为两类：

### 钩子模式（Bash Hook）

适用于：**Claude Code、Copilot、Gemini CLI、Cursor、Windsurf**

这些 Agent 通过 Bash 调用系统命令。RTK 在 Shell 中安装一个钩子，在命令执行前拦截并重写：

```bash
# Agent 触发执行
git status

# 钩子拦截后实际执行
rtk git status
```

流程：

```
Agent 调用 git status
        │
        ▼
Shell 钩子拦截 → 提取命令和参数 → 匹配 RTK 支持的命令列表
        │
        ▼
匹配成功 → 执行 rtk git status → 返回精简输出
匹配失败 → 执行原命令 → 原始输出
```

钩子安装后 Agent 全程无感知。通过 `rtk init -g` 完成，它在 Shell 配置（`.bashrc` / `.zshrc`）中添加脚本，自动检查命令是否需要 RTK 处理。

### 插件模式（Plugin API）

适用于：**Hermes、Cline、Roo Code、Kilo Code**

这些 Agent 有插件系统或可扩展的工具调用机制。RTK 通过它们的插件 API 注册为命令处理工具，Agent 在执行命令时主动将输出送入 RTK 管道处理。

```bash
# Hermes
rtk init --agent hermes

# Cline / Roo Code
rtk init --agent cline

# Kilo Code
rtk init --agent kilocode
```

### 内置工具的限制

钩子只对 **Bash 工具调用**生效。如果 Agent 使用内置工具（如 Claude Code 的 `Read`、`Grep`、`Glob`），这些不走 Shell，不会被钩子拦截。需要显式使用 RTK 命令：

```bash
# 内置 Read 工具 → 不走钩子
# 改用
cat file.rs | head -50          # Bash 走钩子
rtk read file.rs                # 显式调用
rtk grep "pattern" .            # 显式调用
rtk find "*.rs" .               # 显式调用
```

### 各 Agent 配置命令速查

```bash
rtk init -g                     # Claude Code / Copilot（默认）
rtk init -g --gemini            # Gemini CLI
rtk init -g --codex             # Codex (OpenAI)
rtk init -g --agent cursor      # Cursor
rtk init -g --agent windsurf    # Windsurf
rtk init --agent cline          # Cline / Roo Code
rtk init --agent hermes         # Hermes
rtk init --agent kilocode       # Kilo Code
rtk init --agent antigravity    # Google Antigravity
rtk init --agent pi             # Pi
```

执行后重启 AI 工具即可生效。

---

## 五、安装

### macOS（推荐）

```bash
brew install rtk
```

### Linux/macOS 快速安装

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
```

### Windows

从 [Releases](https://github.com/rtk-ai/rtk/releases) 下载 `rtk-x86_64-pc-windows-msvc.zip`，解压后把 `rtk.exe` 放到 PATH 目录。

### 验证

```bash
rtk --version
```

---

## 六、快速启用

RTK 需要配合 AI 工具安装钩子：

```bash
# Claude Code / Copilot（推荐）
rtk init -g

# 其他工具
rtk init -g --gemini      # Gemini CLI
rtk init -g --codex       # Codex (OpenAI)
rtk init -g --agent cursor   # Cursor
rtk init -g --agent windsurf # Windsurf
rtk init --agent hermes      # Hermes
```

启用后，AI 工具执行的命令会自动经过 RTK 处理。无需修改工作流，只是在后台减少了 Token 消耗。

---

## 七、支持的命令

RTK 支持 100+ 命令，按场景分类：

| 类别 | 命令 | 效果 |
|------|------|------|
| **文件** | `rtk ls`, `rtk read`, `rtk find`, `rtk grep` | 过滤空行、注释、归纳目录结构 |
| **Git** | `rtk git status/diff/log/push/pull` | 每操作压缩到 1-3 行 |
| **测试** | `rtk cargo test/pytest/go test/vitest` | 只报告失败，-90% |
| **构建** | `rtk cargo build`, `rtk tsc`, `rtk next build` | 只保留错误和警告 |
| **容器** | `rtk docker ps/logs`, `rtk kubectl pods/logs` | 去重日志、精简列表 |
| **AWS** | `rtk aws sts/ec2/lambda/cloudformation` | 一行摘要，脱敏密钥 |

测试场景尤其明显。`cargo test` 失败时可能输出 200+ 行，RTK 只告诉你哪几个测试失败和错误信息——约 20 行。

---

## 八、适用场景

| 场景 | 说明 |
|------|------|
| **日常 AI 编码** | Claude Code、Cursor、Copilot 用户，每天大量命令调用 |
| **大项目** | 项目越大，命令输出越多，RTK 节省比例越高 |
| **测试密集型** | 反复运行测试的场景，节省最明显（-90%） |
| **远程开发** | SSH 到服务器编码，每一次命令输出都要传回 |
| **Token 敏感** | 按量计费的 API，或追求成本控制 |

---

**相关链接：**
- [GitHub 仓库](https://github.com/rtk-ai/rtk)
- [官方网站](https://www.rtk-ai.app)
- [安装指南](https://www.rtk-ai.app/guide/troubleshooting)
