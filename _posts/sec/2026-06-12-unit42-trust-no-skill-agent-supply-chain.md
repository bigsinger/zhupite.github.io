---
layout: post
title: "Unit 42《Trust No Skill》解读：AI Agent 供应链完整性验证，从零信任开始"
categories: [sec]
description: "Palo Alto Networks Unit 42 发布《Trust No Skill: Integrity Verification for AI Agent Supply Chains》报告，系统化提出 Agent Skills/Plugins/Tools 多层验证框架，涵盖签名验证、行为基线、异常检测和溯源图谱，强调 MCP Server 作为工具入口的供应链风险。"
tags:
  - AI Agent
  - 供应链安全
  - Unit 42
  - Palo Alto Networks
  - MCP
  - 技能验证
  - 软件供应链
  - 安全框架
---

Palo Alto Networks 的 Unit 42 团队在 6 月 11 日发布了一份极具分量的研究报告——《Trust No Skill: Integrity Verification for AI Agent Supply Chains》，直指 AI Agent 生态系统的阿喀琉斯之踵：**Skills 的供应链完整性**。

这已经是近一周内第三份重磅的 Agent 安全文件了——五眼联盟的《Agentic AI 安全指南》、AI CERTs 的《联邦 Agent 治理手册》、360 的 SkillsGuard 检测平台，而 Unit 42 这份报告切口最精准：**我不是在教你如何用 Agent，而是在教你如何信任你装进的每一个 Skill**。

## 核心观察：Skills 是新的软件供应链面

报告的核心洞察很直白：

> 传统软件供应链关注的是库、依赖、容器镜像。AI Agent 时代的供应链面变成了 **Skills、Plugins 和 Tools**——这些代码片段决定了 Agent 能做什么、不能做什么，而它们的**来源验证和完整性保护严重不足**。

想想看：你允许一个 Agent 安装一个来自社区的 Skill，这个 Skill 可能只有几十行代码，但它可以访问本地文件系统、调用网络 API、甚至拥有执行系统命令的权限。在现有的生态里，大部分平台对 Skill 的唯一检查就是做个格式校验。这相当于打开了后门让别人进来。

报告特别点名了 **MCP Server**——作为 Model Context Protocol 的核心组件，MCP Server 是 Agent 获取外部工具能力的入口。当 Agent 通过 MCP 协议连接到一个 Server 时，它本质上是将这个 Server 提供的所有工具纳入了自己的技能清单。如果这个 MCP Server 是恶意的或被篡改过的，Agent 的整个行为边界就不可控了。

## 四层验证框架

Unit 42 提出的解决方案是一个多层验证框架：

### 第一层：技能代码的签名验证

这是最基础的防线——每个 Skill 在发布前应由开发者签名，Agent 在执行前验证签名链。类似于 npm 的包签名 + Git 的 commit 签名，但更难的地方在于：Agent Skills 不像传统库有成熟的 Registry 和 CI/CD 流程。签名谁来管？密钥怎么分发？撤销机制是什么？

### 第二层：运行时行为基线设定

签了名不代表代码没问题。Unit 42 提出给每个 Skill 建立运行时行为基线——它通常访问哪些文件？调用哪些 API？网络走哪个方向？当行为偏离基线时（比如一个翻译 Skill 突然开始扫描 `/etc/passwd`），Agent 应该立即阻断并告警。

### 第三层：异常权限调用检测

这里和 AI CERTs 的四级权限模型异曲同工。报告建议对 Agent Skills 执行细粒度的权限隔离——每个 Skill 在安装时声明所需权限，运行时的权限调用必须与实际用途一致。如果一个只需要网络读取权限的 Skill 尝试调用文件系统写入，就是明显的异常。

### 第四层：供应链溯源图谱

这是最 "零信任" 的一层——建立从 Skill 原始来源 → 发布者 → 版本历史 → 依赖关系 → 集成点的完整溯源图谱。类似于软件物料清单（SBOM），但面向 Agent Skills。当漏洞被披露时，可以快速定位所有受影响的 Agent 实例。

## MCP Server：最值得警惕的入口

报告中多次强调 MCP Server 的供应链风险，这一点非常关键。MCP 协议的目的是让 Agent 能够调用外部工具——数据库查询、文件操作、API 调用、代码执行等。这意味着一个 MCP Server 实际上是一个**能力代理**：Agent 信任 Server，Server 信任背后的系统。

如果攻击者能够控制一个广泛使用的 MCP Server（比如一个代理 SQL 查询的 Server），他就能在所有使用这个 Server 的 Agent 实例上执行任意 SQL。

**这和传统的 API 供应链攻击很像，但风险面更大**——因为 MCP Server 被 Agent 赋予了高度的执行信任。

## 影响的深度

Unit 42 作为 Palo Alto Networks 的威胁情报团队，其报告的分量在于：

1. **行业首个系统化的 Agent 技能完整性验证方法论**——在此之前，没有公开研究这么体系化地拆解 Skill 供应链的安全问题
2. **框架可操作性强**——四层框架可以直接映射到具体的技术实现（代码签名工具、运行时监控、溯源系统）
3. **与现有趋势高度吻合**——和五眼联盟的安全指南、AI CERTs 的治理手册、360 SkillsGuard 的检测能力形成互补，覆盖了从治理→检测→验证的完整链条

## 值得关注的盲区

报告框架很扎实，但有几个问题可能需要后续补充：

- **性能开销**：四层验证在 Agent 实时推理场景下，延迟增量是多少？
- **标准落地**：签名验证和溯源图谱需要生态系统层面的标准支持，目前还没有统一的 Agent Skill 签名标准
- **谁审计审计者**：溯源图谱本身的安全性——如果溯源数据本身被篡改，整个信任链就失效了

## 结语

《Trust No Skill》这个标题取得很好——它借用了零信任安全模型的核心原则 "Never Trust, Always Verify"，只是把 "身份" 换成了 "Skill"。在 AI Agent 生态快速发展的当下，这个原则来得正是时候。

从五眼联盟的指南到 AI CERTs 的治理，从 360 的检测到 Unit 42 的验证——2026 年 6 月这一周，Agent 安全的拼图正在快速补全。
