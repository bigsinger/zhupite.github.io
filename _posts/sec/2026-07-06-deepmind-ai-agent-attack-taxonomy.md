---
categories: [sec]
title: Google DeepMind 建立 AI Agent 六类攻击分类法：Agent Traps 正式框架
description: Google DeepMind 发布 SSRN 论文《AI Agent Traps》，建立针对 AI Agent 的六类攻击分类法：内容注入、语义操控、认知状态与记忆投毒、行为控制、系统性多 Agent 攻击、人在回路陷阱。隐藏提示注入攻击成功率 86%，子 Agent 劫持 58%-90%。该分类法与 OWASP Agentic AI Top 10 互补。
tags: [Agent Security, DeepMind, 攻击分类法, AI Agent Traps, 提示注入, 安全框架]
---

## 一句话结论

Google DeepMind 研究团队发布 **《AI Agent Traps》** 论文（SSRN preprint），建立了首个系统的 AI Agent 攻击分类法，定义了 **六类攻击类型**：内容注入陷阱、语义操控、认知状态与记忆投毒、行为控制、系统性多 Agent 攻击和人在回路陷阱。其中隐藏提示注入成功率 **86%**，子 Agent 劫持成功率 **58%-90%**。该分类法与 OWASP Agentic AI Top 10 互补，有望成为 Agent 安全领域的标准化参考框架。

> **来源说明**：原文 Crypto Briefing 全文提取。DeepMind 论文以 SSRN 预印本形式发布（论文 ID: 6372438）。SecurityWeek 于 4 月已报道同一研究。

## 论文概要

| 项目 | 内容 |
|------|------|
| **论文标题** | AI Agent Traps |
| **作者** | Matija Franklin, Nenad Tomasev, Julian Jacobs, Joel Z. Leibo, Simon Osindero |
| **机构** | Google DeepMind |
| **形式** | SSRN 预印本 |
| **核心贡献** | 首个 AI Agent 攻击系统分类法，含 6 大类、每类多种子类型 |
| **定位** | 攻击者通过恶意网页内容设置陷阱，利用 Agent 的指令遵循、工具链调用和目标优先级排序能力来武器化 |


## 六类攻击分类法

### 1️⃣ 内容注入陷阱（Content Injection Traps）

通过 Web 内容嵌入有害指令，Agent 在无意识中处理这些内容。

**实现方式**：
- 隐藏在 HTML 注释或元数据属性中的指令
- 通过 JavaScript 或数据库调用动态注入陷阱
- 利用**隐写术**和格式语言语法隐藏陷阱
- **白底白字文本**——人类不可见但机器可读
- 操纵图像像素

**攻击成功率**：隐藏提示注入 **86%**，子 Agent 劫持 **58%-90%**

### 2️⃣ 语义操控（Semantic Manipulation）

不注入隐藏指令，而是**扭曲合法内容的语义**，引导 Agent 得出错误结论或执行有害操作。

**实现方式**：
- 精心选择语言使 Agent 产生认知偏差
- 针对 Agent 的验证机制（过滤有害输出的过滤器）
- 将 Agent 的人格描述反馈给它以改变其行为

### 3️⃣ 认知状态与记忆投毒（Cognitive State and Memory Poisoning）

攻击 Agent 的**持久化记忆系统**——不只是一个会话，而是可能改变 Agent 的所有后续决策。

**实现方式**：
- 污染 Agent 使用的外部数据源
- 向内部存储（如持久化日志）注入数据
- 通过精心构造的环境交互改变 Agent 的策略

### 4️⃣ 行为控制（Behavioral Control）

操控 Agent 的**动作选择机制**，利用其指令遵循能力。

**实现方式**：
- 在外部资源中嵌入越狱（jailbreak）
- 通过不可信输入迫使 Agent 泄露特权信息
- 迫使 Agent 生成**以 Agent 权限运行但服务于攻击者的子 Agent**

### 5️⃣ 系统性多 Agent 攻击（Systemic and Multi-Agent Attacks）

利用运行在同一环境中的**多个 Agent 的交互关系**。

**攻击向量**：
- **同质化**：利用所有 Agent 共享的相同弱点
- **序列依赖**：一个 Agent 的输出是另一个 Agent 的输入
- **行为同步**：同步触发多个 Agent 的错误行为
- **协作利用**：利用 Agent 间的信任假设
- **假名身份**：利用伪匿名身份破坏网络系统的信任假设和共识流程

### 6️⃣ 人在回路陷阱（Human-in-the-Loop Traps）

利用 AI Agent 将决策移交给人类操作员的时刻，**操纵 Agent 转而攻击人类用户**。

**示例**：
- 不可见的提示注入伪装成**修复指令**，诱使 Agent 向人类用户重复勒索软件命令
- 利用人类与 Agent 之间的信任边界

## 关键攻击成功率数据

| 攻击类型 | 成功率 |
|----------|--------|
| 隐藏提示注入（内容注入） | **86%** |
| 子 Agent 劫持（内容注入） | **58%-90%** |

## 与 OWASP Agentic AI Top 10 的关系

DeepMind 的分类法与 **OWASP Agentic AI Top 10**（最新版）形成互补：

| 维度 | OWASP Agentic AI Top 10 | DeepMind AI Agent Traps |
|------|------------------------|------------------------|
| **角度** | 应用安全——开发者的 Agent 有哪些风险 | 攻击分类——攻击者如何利用恶意内容攻击 Agent |
| **侧重** | Agent 框架自身的安全漏洞 | Agent 与环境交互中的攻击面 |
| **覆盖** | 身份认证、授权、数据保护等 | 内容注入、记忆投毒、多 Agent 交互等 |
| **重叠** | Agent 目标劫持、工具滥用 | 行为控制、内容注入 |

两者结合可形成 Agent 安全的**完整威胁全景**。

## 论文提出的防御方向

### 技术防御
- 通过训练数据增强来**加固底层模型**
- 部署**运行时防御**（与 SkillDetonate 等检测工具一致）
- 建立**标准化评估基准**以识别这些威胁

### 生态治理
- 改善数字生态系统的**卫生状况**
- 建立**内容治理框架**
- 开发者、安全研究人员和政策制定者的**持续协作**

> "确保 Agent 免受环境操控是一项基础性挑战，需要开发者、安全研究人员和政策制定者之间的持续协作，以及标准化评估基准的建立。解决这一挑战是实现可信 Agent 生态系统的前提。"——DeepMind 研究团队

## 为什么这对今日的 Agent 安全研究至关重要

DeepMind 的分类法发布于 Agent 安全威胁密集曝光的同一时期——此前一周已有 SkillCloak（恶意技能绕过静态扫描）、T3MP3ST（自主红队框架）、Gaslight（提示注入对抗安全分析）等多篇研究。DeepMind 的分类法为这些零散的安全威胁提供了**统一的分类框架**，使安全研究人员和从业者能够：

1. **标准化描述**：用统一的语言描述不同类型的攻击
2. **识别覆盖盲区**：对照 DeepMind 的六类分类，检查自己的 Agent 防护是否覆盖全部攻击面
3. **优先级排序**：根据攻击成功率（如 86% 的注入成功率）确定防御优先级

## 参考

- Crypto Briefing：[Google DeepMind establishes taxonomy of six attack types for AI agents](https://cryptobriefing.com/google-deepmind-ai-agent-attack-taxonomy/)（2026-07-06）
- SSRN：[AI Agent Traps](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6372438) — Google DeepMind（论文 ID: 6372438）
- SecurityWeek：[Google DeepMind Researchers Map Web Attacks Against AI Agents](https://www.securityweek.com/google-deepmind-researchers-map-web-attacks-against-ai-agents/)（2026-04-06）
- OWASP：[Agentic AI Top 10](https://genai.owasp.org/)
