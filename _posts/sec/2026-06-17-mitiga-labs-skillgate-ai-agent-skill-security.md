---
layout: post
title: "Mitiga Labs 推出 Skillgate：专门检测 AI Agent 技能中的恶意代码和配置风险"
categories: [sec]
tags: [mitiga, skillgate, agent-security, skill-supply-chain, prompt-injection, agent-scanning, open-source-security, claude-code]
description: "Mitiga Labs 推出免费工具 Skillgate，专门扫描 AI Agent 技能文件和配置中的安全风险。扫描 50,000+ AI 指令文件后发现 1,230+ 泄露的 API 密钥和大量恶意技能，填补了 Agent 技能供应链安全这一空白领域。"
---

2026 年 6 月 16 日，Mitiga Labs 正式发布 **Skillgate**——一款专门用于检测 AI Agent 技能（Skills）和配置文件中安全风险的免费扫描工具。这是业界首批聚焦 **Agent 技能供应链安全** 的产品之一。

## 一、Agent 技能为什么需要安全检测

当 AI Agent（尤其是 Claude Code 这类编码 Agent）开始从 GitHub、npm、内部仓库等地方加载技能文件时，**Agent 技能供应链的攻击面** 正在快速膨胀。

一个 Agent 技能（Skill）本质上是一组指令和配置的组合，告诉 Agent：
- 它具备什么能力
- 如何调用工具和 API
- 在什么场景下执行什么操作
- 它的系统提示词和行为边界

这些文件目前以 **SKILL.md**（带有 YAML frontmatter）、**CLAUDE.md**、**settings.json**（Hook 配置）、以及被引用的 Shell 脚本等形式存在于代码仓库中。

问题在于：**这些东西没有签名，没有沙箱，没有安全审查。**

### 1.1 真实威胁：Mitiga Labs 的调研数据

Mitiga Labs 在发布 Skillgate 之前做了一项大规模的调研——扫描了 **50,000+ AI 指令文件**，覆盖 **7,000+ 公开仓库**，发现的结果触目惊心：

| 发现类型 | 数量 |
|---------|:---:|
| 泄露的 API 密钥 | **1,230+** |
| 被劫持的 Claude Base URL | 多处 |
| 恶意/间谍技能（Spyware Skills） | 大量 |
| 权限过高的工具调用 | 普遍存在 |

这些发现意味着：**攻击者正在利用 Agent 技能的开放性，将恶意代码伪装成合法的技能文件，等待 Agent 在运行时加载并执行。**

### 1.2 技能攻击的具体手法

Skillgate 的检测规则覆盖了以下典型攻击模式：

- **Prompt Injection**：在技能文件中嵌入隐藏指令，覆盖 Agent 的原始系统提示词
- **Hook RCE（CVE-2025-59536）**：在 Claude Code 的 Hook 配置中嵌入恶意 Shell 命令，在用户看到信任对话框之前就已经自动执行
- **Base64 混淆**：将恶意指令编码后藏在技能文件中
- **零宽 Unicode 字符**：利用不可见字符绕过文本审查
- **凭证窃取**：技能文件中嵌入窃取 OAuth Token 或 API Key 的指令
- **工具劫持**：修改 Agent 的工具调用配置，将数据重定向到攻击者控制的端点

## 二、Skillgate 是什么

Skillgate 是 Mitiga Labs 推出的 **免费开源安全扫描器**，专门针对 AI Agent 的技能文件和配置文件。

### 2.1 核心能力

**检测引擎**：内置 **80+ 条检测规则**（编号 SG-001 起），覆盖：
- 恶意技能检测
- Prompt Injection 模式识别
- Hook RCE 漏洞扫描
- API Key 和凭证泄露检测
- 配置错误检查
- 权限过高的工具调用检测

**扫描范围**：
| 文件类型 | 说明 |
|---------|------|
| SKILL.md | Claude Code 技能文件（含 YAML frontmatter） |
| CLAUDE.md | 系统提示词配置文件 |
| settings.json | Hook 配置文件和运行时设置 |
| Shell 脚本 | 被技能引用的可执行脚本 |

**评分机制**：每个检测结果带有风险评分，帮助用户快速判断严重程度。

### 2.2 工作方式

Skillgate 可以在 Agent 运行技能文件**之前**进行扫描，实现前置安全检查。它遵循 "先扫描，再运行" 的安全模型——这本质上是一种 **Agent 技能的静态分析安全测试（SAST）**。

它与 Mitiga 已有的研究成果和工具生态配合使用，包括 Claude Code 安全审计、MCP 安全检测等。

## 三、行业意义：填补 Agent 技能供应链安全的空白

### 3.1 OWASP ASI-08 的落地

OWASP Agentic AI Top 10 中，**ASI-08（Agent 技能/工具供应链风险）** 是一个关键风险类别。但此前市场上几乎没有专门针对 Agent 技能文件安全性的检测工具。

Skillgate 的出现，让 ASI-08 从一个"理论风险"变成了"可检测、可量化"的安全指标。

### 3.2 "技能安全"正在成为 Agent 安全的下一战场

Agent 安全目前在三个层面竞争：

| 安全层面 | 代表产品 | 成熟度 |
|---------|---------|:-----:|
| Agent 运行时安全 | Cisco、CrowdStrike、Saviynt | 发展中 |
| Agent 框架安全 | LangChain、AutoGen 的安全插件 | 早期 |
| **Agent 技能供应链安全** | **Skillgate（Mitiga Labs）** | **刚刚起步** |

Skillgate 是目前唯一一个专注于这一层的公开工具。考虑到 GitHub 上已有近万个 Agent 技能相关的仓库，这个空白领域的市场潜力巨大。

### 3.3 免费 + 开源的策略

Skillgate 以免费工具形式发布，这是一个聪明的策略：
- 低门槛吸引开发者试用，迅速建立用户群
- 免费扫描器积累 Agent 技能威胁数据，反哺 Mitiga 的威胁情报
- 与 Mitiga 的商业化云安全平台形成"免费工具 + 企业级平台"的互补

## 四、如何开始使用

Skillgate 目前可以在 [skillgate.mitiga.ai](https://skillgate.mitiga.ai/) 上直接使用。你只需要：
1. 提供 Agent 技能文件的 URL 或直接上传文件
2. Skillgate 自动扫描并生成安全报告
3. 根据检测结果修复或拒绝有风险的技能

对于 CI/CD 集成场景，Skillgate 也支持自动化扫描，可以在技能文件进入仓库之前进行安全检查。

## 五、小结

Agent 正在快速进入生产环境，但 Agent 技能的安全检测还是荒漠。Mitiga Labs 的 Skillgate 是这个荒漠里的第一口水井——它可能还不是最深的，但它指明了方向。

对于任何在生产中使用 AI Agent（特别是 Claude Code 等编码 Agent）的团队来说，**在加载任何一个技能文件之前先跑一遍 Skillgate**，应该成为标配操作。

---

**参考资料**

1. [Skillgate 官方网站](https://skillgate.mitiga.ai/) — Free scanner from Mitiga Labs
2. [Mitiga Labs](https://mitiga.io/mitiga-labs) — 研究团队主页
3. [Mitiga 博客](https://mitiga.io/blog) — *Modern Malware — Spyware Skills, Hijacked Base URLs, and 1,230+ Leaking API Keys in AI Instruction Files*
4. [Mitiga 新闻页面](https://mitiga.io/news) — Press & Cloud Security Insights
5. [OWASP Agentic AI Top 10](https://owasp.org/www-project-agentic-ai-top-10/) — ASI-08: Agent Skill/Supply Chain Risk
6. CVE-2025-59536 — Claude Code Hook Remote Code Execution Vulnerability
7. Business Wire 原文（2026-06-16）— *Mitiga Labs Launches Skillgate to Detect Risks in AI Agent Skills and Configurations*
