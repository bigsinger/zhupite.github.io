---
categories: [sec]
title: SkillCloak：恶意 AI Agent 技能利用自解压打包技术绕过全部 8 款静态扫描器
description: 香港科技大学研究团队发布 SKILLCLOAK 工具，通过自解压打包技术将恶意 Agent 技能藏入扫描器跳过的目录（如 .git/），运行时才解码。经测试绕过全部 8 款扫描器超过 90%、大部分超过 99%。研究还发布了运行时检测工具 SKILLDETONATE，可捕获 97% 的攻击。
tags: [Agent Security, SkillCloak, 供应链攻击, 恶意技能, Agent 生态, 静态扫描, 运行时检测]
---

## 一句话结论

香港科技大学团队发布 **Cloak and Detonate** 论文（arXiv:2607.02357），其中提出的 **SKILLCLOAK** 框架利用自解压打包技术，将恶意 Agent 技能藏入扫描器自动跳过的目录（如 `.git/`），在运行时才解码执行——绕过全部 **8 款静态扫描器超过 90%**，大部分超过 **99%**。同一团队开发了运行时检测工具 **SKILLDETONATE**，通过沙箱行为监控捕获 **97% 的攻击**（2% 误报）。Agent 技能市场的供应链安全面临严峻挑战，**静态签名检测已经不够了**。

> **来源说明**：原文 The Hacker News 文章完整提取。论文来自香港科技大学，发布于 arXiv。

## 攻击背景：Agent 技能生态的供应链脆弱性

AI 编码 Agent（Claude Code、Codex、OpenClaw）通过**技能（skills）**扩展能力——技能是一个小包，通常包含一个 Markdown 指令文件加几个脚本。因为技能只是文件的集合，同一个技能可以在不同 Agent 上运行。关键风险：**技能以 Agent 自身的权限运行——你的文件、你的终端、你保存的密码。**

### 已有证据表明威胁真实存在

| 来源 | 发现 |
|------|------|
| **Bitdefender** | 某公共市场上约 **17%** 的技能携带隐藏恶意代码 |
| **Koi Security（ClawHavoc）** | 单个活动中发现 **341** 个恶意技能（后增至 824） |
| **Unit 42（Palo Alto）** | 发现 5 个绕过内置扫描的恶意技能（含 Mac 密码窃取器、加密货币劫持） |
| **Mozilla 0DIN** | 一个看似干净的 GitHub 仓库引导 Claude Code 打开反向 Shell——恶意代码从未在仓库中，安装脚本在运行时从 DNS 记录拉取 |

## SKILLCLOAK：两种规避技术

### 1. 轻量化改写

用以下操作符替换扫描器依赖的关键字：
- **字符替换**：用其他字母表中的相似字符替换（如拉丁 `a` → 西里尔 `а`）
- **换行分割**：将敏感命令跨行分割，使扫描器的正则模式不再匹配

结果：在大部分扫描器上绕过率 >**80%**，在某一款上达到 **96%**。

### 2. 自解压打包（强力技术）

将完整恶意负载移入扫描器跳过的目录（如 `.git/`、`build/`），只留下一个无害的解码器。Agent 运行时才重建完整的恶意技能。

> "扫描器跳过这些目录以节省时间和减少误报——这正是该技巧利用的盲点。"

**结果**：绕过全部 8 款扫描器超过 **90%**，大部分超过 **99%**。Cisco 的扫描器（测试中最强的一款）在打包前捕捉 99%，打包后仅约 **10%**——最大的性能落差。

### 攻击成本

- **对攻击者**：几乎为零——被包装的技能在 Claude Code 和 Codex 上运行效果与原版无异
- **对防御者**：静态扫描仅需数秒，但被打包后完全不可靠

## SKILLDETONATE：运行时行为检测

由于外观可以被伪造，研究团队提出了**行为检测**方案：

### 工作原理
1. 在沙箱中运行技能
2. 在操作系统层面监控其行为——读什么、写什么、数据发往哪里
3. 追踪敏感数据的**流向**而非内容——base64 或加密无法绕过
4. 执行技能在运行时才构建的指令——这正是打包技巧隐藏负载的地方

### 检测效果

| 场景 | SKILLDETONATE | Cisco 扫描器 |
|------|--------------|-------------|
| 攻击检测（受控测试） | **97%** | 打包前 99%，打包后 ~10% |
| 误报率 | **2%** | — |
| 真实世界恶意技能 | **87%** | — |
| 处理速度 | 每个技能数分钟 | 每个技能数秒 |

### 可操作的检测信号

即使技能通过了扫描，防御者仍可关注以下迹象：

1. **大型或高熵文件**藏在扫描器通常跳过的目录中（如 `.git/`、`build/`）
2. **技能在运行时解包或组装代码**，而非以明文方式提供
3. **远超合理大小的文件填充**——利用扫描器大小上限的逃避技巧

## Agent 生态系统的防御升级路径

论文和 THN 报道给出了清晰的方向：

### 短期：改进扫描策略
- 技能扫描时**哈希**，每次运行前重新校验——捕获运行后解包的负载
- 标记在忽略目录中包藏不透明二进制块或超预期填充的技能

### 长期：运行时监控
- 从"外观检查"转向"行为观察"——信任决策从市场网关移到执行技能的主机
- Agent 框架应内建运行时行为审计能力（参考 TC260 标准中的相关要求）

### 根本性安全实践
- 技能仅从**经过审查的来源安装**
- Agent 遵循**最小权限原则**——不运行在存有价值秘密的机器上
- 加密/混淆/自解压的技能需要**额外审查**而非自动信任

## 参考

- The Hacker News：[SkillCloak Lets Malicious AI Agent Skills Evade Static Scanners with Self-Extracting Packing](https://thehackernews.com/2026/07/new-skillcloak-technique-lets-malicious.html)（2026-07-06）
- arXiv：[Cloak and Detonate](https://arxiv.org/abs/2607.02357)——香港科技大学（2026-07）
- The Hacker News：[Fake AI Agent Skill Passed Security, Reached Tens of Thousands of Agents](https://thehackernews.com/2026/06/fake-ai-agent-skill-passed-security.html)（2026-06）
- Bitdefender：[Helpful Skills or Hidden Payloads? OpenClaw Malicious Skill Trap](https://www.bitdefender.com/en-us/blog/labs/helpful-skills-or-hidden-payloads-bitdefender-labs-dives-deep-into-the-openclaw-malicious-skill-trap)
- Koi Security：[ClawHavoc: 341 Malicious ClawedBot Skills Found](https://www.koi.ai/blog/clawhavoc-341-malicious-clawedbot-skills-found-by-the-bot-they-were-targeting)
- Mozilla 0DIN：[Clone This Repo and I Own Your Machine](https://0din.ai/blog/clone-this-repo-and-i-own-your-machine)
