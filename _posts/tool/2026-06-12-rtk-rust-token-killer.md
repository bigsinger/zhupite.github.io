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

## 三、安装

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

## 四、快速启用

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

## 五、支持的命令

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

## 六、适用场景

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
