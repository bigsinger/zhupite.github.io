---
categories: [sec]
title: Gaslight macOS 恶意软件利用提示注入欺骗 AI 安全分析师
description: SentinelOne 发现 Rust 编写的 macOS 后门 Gaslight（归因于朝鲜威胁组织），嵌入 38 条伪造的系统故障消息，通过提示注入欺骗 AI 驱动的恶意软件分析工具，使其误判恶意行为为系统正常操作。标志着提示注入攻击从攻击 AI 应用扩展到对抗 AI 安全分析工具。
tags: [Gaslight, 提示注入, macOS, 恶意软件, 朝鲜, SentinelOne, AI安全, Rust]
---

## 一句话结论

**Gaslight** 是一个 Rust 编写的 macOS 后门和信息窃取器（高置信度归因于朝鲜威胁组织），其最突出的特征是嵌入了 **38 条伪造的系统故障消息**，通过提示注入欺骗 AI 驱动的恶意软件分析工具，使其误判恶意行为为系统正常操作。这不是攻击沙箱——而是**攻击分析师的 AI Agent 的感知**。提示注入的应用范围已从攻击 AI 应用扩展到对抗 AI 安全分析工具，标志着"AI vs AI"安全对抗的新维度。

> **来源说明**：原文 gbhackers.com URL 经 Google News RSS 定位。本文综合 The Hacker News 报道及 SentinelOne 研究报告成文。

## 攻击概述

| 项目 | 内容 |
|------|------|
| **恶意软件名称** | Gaslight（因"煤气灯效应"得名——使受害者怀疑自己的判断） |
| **类型** | Rust 编写的 macOS 后门 + 信息窃取器 |
| **归因** | ⚠️ 朝鲜关联威胁组织（高置信度） |
| **发现者** | **SentinelOne**（研究员 Phil Stokes） |
| **影响平台** | macOS |
| **首次披露** | 2026 年 6 月 25 日 |

## 核心技术：攻击 AI 分析工具的感知

>"其最显著的特征是嵌入了一连串伪造的系统故障消息，旨在使 LLM 辅助的研判 Agent 怀疑自己的会话。它攻击的是 Agent 的感知，而不是它运行的沙箱。"——SentinelOne 研究员 Phil Stokes

### 提示注入负载

Gaslight 在二进制内部嵌入了 **38 条**伪造的"系统消息"，形成一个 Markdown 围栏块，旨在让 AI 安全分析工具中止、截断或拒绝分析：

- **令牌过期**：假冒的令牌失效消息
- **内存不足**：伪造的 OOM 终止信号
- **磁盘耗尽**：虚假的磁盘空间不足警告
- **操作失败**：重复的操作失败信息
- **注入漏洞警告**：虚构的安全检测告警
- **静态分析标记**：假造的代码审查标记

> SentinelOne 称之为"试图武器化日益普及的 LLM 辅助研判流水线，这些流水线正越来越多地出现在逆向工程环节中。"

## 技术架构

### C2 通信

- **协议**：Telegram Bot API
- **模式**：轮询循环（polling loop）
- **自销毁**：两个实例同时轮询同一 bot token 时，第二个实例收到"Conflict"响应并自动终止
- **自编辑**：运行时会自删除 Telegram bot token，拒绝任何捕获日志或崩溃 artifact 的人

### 六条命令

| 命令 | 功能 |
|------|------|
| `help` | 显示帮助 |
| `id` | 识别植入物 |
| `shell` | 通过 execvp 执行 shell 命令 |
| `kill` | 按 PID 终止进程 |
| `upload` | 通过 Telegram 的附件机制外传文件 |
| `stop` | 停止植入物 |
| `focus`（疑似） | 功能待定 |

### 持久化

使用 **LaunchAgent**，plist 文件标签为 `com.apple.system.services.activity`——伪装成系统服务的启动项。

### 信息窃取器

- **形式**：6.6 KB Base64 编码的 Python 脚本
- **投放方式**：2 KB Base64 编码的 bash 安装程序，从 `astral-sh/python-build-standalone` 项目下载独立的 cpython 3.10.18 解释器
- **采集数据**：
  - Terminal 命令历史
  - 已安装应用列表
  - 运行进程快照
  - 系统和硬件配置
  - **macOS Keychain 数据库**
  - Chrome、Brave、Firefox、Safari 浏览器数据
- **外传方式**：压缩为 `temp/collected_data.zip` 通过 Telegram 上传

### LLM 生成痕迹

Python 窃取器中包含表情符号和大量注释头——SentinelOne 认为这很可能是使用 LLM 生成的。

## 为什么 Gaslight 值得关注

### 1. 提示注入的新攻击面：AI 安全工具本身

传统提示词注入攻击 AI 应用（聊天机器人、Agent）。Gaslight 开启了新的攻击面——**攻击 AI 安全分析工具**。恶意软件不再只是躲避沙箱检测，而是主动欺骗分析者的 AI Agent。

这与此前所有 Agent 安全攻击都不同：

| 攻击类型 | 攻击目标 | 示例 |
|----------|---------|------|
| 传统提示词注入 | AI 应用 | 让聊天机器人泄露系统提示 |
| 工具调用攻击 | Agent 工具 | 让 Agent 执行危险命令 |
| **Gaslight** | **AI 安全分析工具** | 让研判 Agent 误判恶意软件为正常 |

### 2. 朝鲜 APT 的 AI 对抗能力升级

高置信度归因于朝鲜威胁组织，说明国家级行为者正在将提示注入武器化，用于对抗防御方的 AI 分析能力。这不是学术研究——是主动在野使用的技术。

### 3. "AI vs AI"安全对抗进入新阶段

Gaslight 展示了一个新的攻防格局：
- **攻击方**：用 LLM 生成恶意代码（Python 窃取器含 LLM 痕迹），用提示注入对抗安全分析
- **防御方**：安全分析越来越依赖 AI 辅助研判，但 AI 工具的感知可以被伪造系统消息操纵

## 防御建议

1. **AI 安全分析工具不应完全信任所分析内容的元数据**——Gaslight 的伪造系统消息利用的就是这种信任
2. **沙箱隔离 + 行为分析仍是可靠防线**——Gaslight 攻击的是研判 Agent，而非底层沙箱
3. **对分析内容中的"系统消息"进行过滤和消毒**——阻断 Markdown 围栏块中的误导性内容
4. **安全运营团队应意识到 AI 辅助工具的局限性**——AI 研判结果需要人工复核，尤其是在面对疑似国家级恶意软件时

## 参考

- The Hacker News：[New Gaslight macOS Malware Uses Prompt Injection to Disrupt AI-Assisted Analysis](https://thehackernews.com/2026/06/new-gaslight-macos-malware-uses-prompt.html)（2026-06-25）
- SentinelOne：[macOS Gaslight Rust Backdoor Turns Prompt Injection on the Analyst, Not the Sandbox](https://www.sentinelone.com/labs/macos-gaslight-rust-backdoor-turns-prompt-injection-on-the-analyst-not-the-sandbox/)
- gbhackers.com：[Gaslight Stealer Embeds Fake System Messages to Mislead AI Malware Analysts](https://gbhackers.com)（2026-07-06）
- Infosecurity Magazine：[macOS Backdoor Uses Prompt Injection to Evade AI Triage](https://infosecuritymagazine.com)（2026-06-23）
- OECD AI Policy Observatory：[North Korea-Linked Gaslight Malware Uses Prompt Injection to Evade AI Analysis](https://oecd.ai)（2026-06-26）
