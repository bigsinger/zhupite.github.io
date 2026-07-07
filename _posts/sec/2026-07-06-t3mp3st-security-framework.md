---
categories: [sec]
title: T3MP3ST 安全框架：35 个工具将 AI 编码 Agent 变为 0day 漏洞猎人
description: 研究员 Elder Plinius 发布开源框架 T3MP3ST（⭐2,791），通过 35 个内置工具将 Claude Code、Codex、Hermes 等 AI 编码 Agent 转化为自主红队平台。在 XBEN 套件上达到 90.1% pass@1，在 10 个训练截止日期后的真实 CVE 上准确命中 8/10 的文件/行号/CWE 分类。
tags: [T3MP3ST, AI Agent, 红队, 漏洞挖掘, 安全框架, 开源工具, 0day]
---

## 一句话结论

**T3MP3ST** 是一个开源的自主红队框架（AGPL-3.0，⭐2,791），通过 35 个内置工具将已有的 AI 编码 Agent（Claude Code、Codex、Hermes）转化为 0day 漏洞猎人。它无需新 API 密钥、不依赖云基础设施，即可执行从侦察到利用到报告的完整杀伤链，在 XBEN 套件上达到 **90.1% pass@1**，并在训练截止日期后的真实 CVE 上实现 **8/10 精确文件/行号/CWE 分类**。这一项目展示了 AI Agent 在安全测试中的巨大正面潜力，同时也引发了对 Agent 生成的攻击代码可能被恶意使用的深刻担忧。

> **来源说明**：原文 CyberSecurityNews URL 可访问。本文综合 CyberSecurityNews 报道及 GitHub 项目 README 成文。

## 项目概况

| 项目 | 内容 |
|------|------|
| **名称** | T3MP3ST |
| **作者** | Elder Plinius |
| **仓库** | github.com/elder-plinius/T3MP3ST |
| **许可证** | AGPL-3.0 |
| **创建时间** | 2026-07-02 |
| **Stars** | ⭐2,791（快速增长中） |
| **核心概念** | 你的 AI 编码 Agent 已经是黑客——T3MP3ST 为它配备了一个武器库 |

## 核心技术架构

### 8 操作员杀伤链

T3MP3ST 将任务映射到 MITRE ATT&CK 和 Cyber Kill Chain，由 8 个操作员（Operator）构成：

| 操作员 | 阶段 | MITRE | 功能 |
|--------|------|-------|------|
| **Recon（侦察）** | 侦察 | TA0043 | OSINT、网络发现、资产枚举 |
| **Scanner（扫描器）** | 发现 | TA0007 | 漏洞扫描、服务指纹识别 |
| **Exploiter（利用）** | 初始访问 | TA0001 | 漏洞利用、载荷投递 |
| **Infiltrator（渗透）** | 横向移动 | TA0008 | 后渗透、提权 |
| **Exfiltrator（窃取）** | 收集/窃取 | TA0009/10 | 数据提取、凭据收集 |
| **Ghost（幽灵）** | 持久化 | TA0003 | 持久化、隐蔽、清理 |
| **Coordinator（协调器）** | C2 | TA0011 | 任务控制、编排 |
| **Analyst（分析师）** | 报告 | — | 发现归总、报告生成 |

> **当前状态**：Recon 引擎是✅稳定的、有基准测试的。Exploiter 等下游操作员运行相同的工具驱动推理循环，但作为协调 swarm 尚未通过充分验证（⚠️实验性）。

### "Keyless"设计

T3MP3ST 不提供自己的模型，而是利用用户机器上已有的 AI 编码 Agent 作为"大脑"：
- **已有 Agent**：Claude Code、Codex、Hermes
- **离线模式**：Ollama、LM Studio、vLLM
- **API 模式**：OpenRouter、Anthropic、OpenAI、xAI（Grok Build）

> "无新 API 密钥，无云租户，无第二张账单。你的 Agent 就是大脑，T3MP3ST 是围绕它搭建的战争机器。"

### 35 个内置工具

框架默认包含 **35 个工具**，启用 `T3MP3ST_FULL_ARSENAL` 后扩展至 **83 个**（含 Metasploit、Hydra 等后渗透驱动，置于人工审批门后）。所有工具数量可通过 `verify-claims` 命令从已提交的 JSON 重新计算验证。

## 基准测试结果

T3MP3ST 最大的特点是**所有数字均可复现**——`npm run verify-claims` 从已提交的 JSON 数据重新计算每项指标。

| 套件 | 结果 | 说明 |
|------|------|------|
| **XBEN**（黑盒，104 挑战） | **90.1% pass@1** | XBOW 自称 85%；可复现的等级判决 |
| **XBEN**（白盒，单独报告） | **98.7% pass@1**，最佳 104/104 | 不与黑盒数字混用 |
| **Cybench**（40 任务，无提示） | **23/40 (58%)** | 单次运行 pass@1，每个 flag 对照已提交的 Oracle 评分 |
| **CVE-Zero**（10 个截止日期后 CVE） | **8/10 精确文件/行号/CWE** | **防记忆/防过拟合**：CVE 在训练截止日期之后，且从未用于优化提示词 |

### CVE-Zero 的特殊意义

10 个 CVE 均为 2026 年披露的真实漏洞，覆盖 7 种编程语言：
- 单 Agent **8/10** 精确命中**文件、行号和 CWE 分类**
- 完整工具包发现**全部 10 个**
- 这些 CVE 在模型训练截止日期之后——排除了记忆效应
- n=10，方向性证据

## 覆盖领域

| 领域 | 状态 |
|------|------|
| 🕸️ **Web 应用** | ✅ 核心——XBEN 90.1% |
| 📂 **代码审计** | ✅ 已证明——CVE-Zero 8/10 |
| 🚩 **CTF** | ✅ 已证明——Cybench 23/40 |
| 🤖 **嵌入式/IoT/OT** | ✅ CVE 流水线运行中 |
| 📦 **供应链** | ⚠️ 专项检测（CWE-829） |
| 💰 **智能合约** | ⚠️ 仅复现，非原创发现 |
| ☁️ **云** | 🚧 开发中 |
| 📱 **移动端** | 🚧 开发中 |
| 🔐 **二进制/逆向** | 🚧 开发中 |

## 安全与道德设计

1. **杀伤链范围限定**（Egress-scope containment）：内置网络工具自动拒绝目标/子域名范围之外的主机——`SCOPE DENIED`
2. **AGPL-3.0 许可证**：无担保，作者不认可未经授权的使用
3. **仅授权测试**：明确声明仅限在拥有**书面授权**的系统上使用
4. **真实性文化**：README 中的每个数字都可以从已提交的数据重新计算→`npm run verify-claims` 全绿通过

## 双刃剑意义

> "开源、无需密钥、可复现的自主攻击框架——这是安全研究员手中的利器，也是潜在攻击者工具箱中的新条目。"

### 正面：红队民主化

- 将需要数年经验的安全测试能力，通过 Agent 编排推向更广泛的受众
- 可复现的基准测试让团队能客观评估自己的安全测试能力
- 协调披露流水线可加速漏洞发现和修复

### 负面：武器化风险

- 35 个工具的任意组合均可被恶意使用
- 无需专门的安全知识即可运行复杂攻击链路
- 跨领域覆盖（Web、代码、嵌入式）扩大了潜在攻击面
- 与同日的**持久化状态攻击**研究形成对照——Agent 可用于防御也可用于攻击

## 参考

- CyberSecurityNews：[T3MP3ST Security Framework With 35 Tools, Turns AI Coding Agents Into 0-Day Bug Hunters](https://cybersecuritynews.com/t3mp3st-security-framework/)（2026-07-05）
- GitHub：[elder-plinius/T3MP3ST](https://github.com/elder-plinius/T3MP3ST)（⭐2,791，AGPL-3.0）
- Reddit r/blueteamsec：[T3MP3ST: autonomous red teaming platform](https://www.reddit.com/r/blueteamsec/comments/1unyh0x/t3mp3st_autonomous_red_teaming_platform/)
- XBEN 基准测试：[XBOW 104-challenge suite](https://xbow.com)
