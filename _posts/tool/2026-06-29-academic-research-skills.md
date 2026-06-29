---
layout: post
title: "Academic Research Skills：在 Claude Code 中完成学术研究全流程的开源技能套件"
categories: [tool]
description: "Academic Research Skills 是 Claude Code 的插件技能套件，覆盖学术研究的完整管线——文献调研、论文写作、同行评审、答辩修订到最终发布。基于 10 阶段管线架构，含引用验证、框架锁定检测、多视角审稿等深度功能"
keywords: academic research, Claude Code, AI research, paper writing, peer review, open source
tags:
  - open-source
  - Claude-Code
  - academic-writing
  - research-tool
  - AI-agent
---

> **更新日志**：本文基于 ARS v3.13.0，2026 年 6 月数据。

## Academic Research Skills 是什么

**Academic Research Skills**（下文简称 ARS）不是一个大模型，不是一篇论文模板，而是一套完整的 **Claude Code 技能套件**——覆盖学术研究从文献调研、论文撰写、同行评审、修改答辩到最终发布的全管线。

核心设计哲学：**AI 是你的副驾驶，不是飞行员。** ARS 处理苦活累活（查文献、格式化引用、验证数据、检查逻辑一致性），让研究者专注于不可替代的部分：定义问题、选择方法、解释数据和写出论点。

| 项目信息 | 数据 |
|---------|------|
| GitHub 仓库 | https://github.com/Imbad0202/academic-research-skills |
| Stars | ~35,000 |
| Forks | 2,888 |
| 语言 | Python + Markdown 提示词 |
| 许可证 | CC BY-NC 4.0 |
| 当前版本 | v3.13.0 |
| 创建时间 | 2026-02-26 |
| DOI | [10.5281/zenodo.20696614](https://doi.org/10.5281/zenodo.20696614) |
| 安装环境 | Claude Code CLI / VS Code / JetBrains（v3.7.0+） |

### 安装

在 Claude Code 中输入以下命令即可 30 秒安装：

```text
/plugin marketplace add Imbad0202/academic-research-skills
/plugin install academic-research-skills
```

之后输入 `/ars-plan` 即可开始对话式论文结构规划。

## 为什么需要 ARS

### AI 写论文的三个结构性问题

ARS 作者在 v3.0 开发过程中遇到了三个提示工程无法解决的结构性限制，它们的解决方案反过来成了 ARS 最有价值的设计：

**框架锁定（Frame-lock）**：让 AI 对自己写的论文做「魔鬼代言人」攻击，AI 四个回合都在框架内打转——攻击论点，但从不动摇前提。验证 AI 和生成 AI 共享同一个认知框架，这个模式导致了 2.7 版应力测试中 31% 的引用错误率。

**谄媚（Sycophancy）**：每次用户反驳魔鬼代言人的攻击，AI 让步得太快。模型训练奖励对话和谐——「用户反驳了」被当作攻击不对的证据，而实际上用户只是固执。

**意图误判（Intent misdetection）**：苏格拉底式导师总想收敛产出结果（「要我写出来吗？」），但用户可能还在探索阶段。两者看起来都是参与，但需要相反的 AI 行为。

### 行业背景

Lu 等人（2026，*Nature* 651:914-919）构建了 **The AI Scientist**——首个通过 ICLR 2025 盲审自动发表论文的 AI 全自动研究系统。但文章列出的失败模式：实现 bug、幻觉结果、捷径依赖、bug-作为-洞察重构、方法论编造、框架锁定、引用幻觉。

ARS 的立场很明确：**人类研究者 + AI 增强 > 任何一方单独工作。**

Zhao 等人（2026-05）审计了 arXiv/bioRxiv/SSRN/PMC 上 250 万篇论文中的 1.11 亿条引用，保守估计 2025 年有 146,932 条幻觉引用。ARS v3.7+ 的引用验证功能正是由此驱动。

## 核心架构：4 大技能 + 10 阶段管线

ARS 不是一个单一工具，而是一个由多项技能组成的编排体系：

### 四大技能

| 技能 | 版本 | 核心能力 |
|------|------|---------|
| **Deep Research** | v2.11.0 | 13-agent 研究团队，8 种模式（深度研究/快速简报/系统综述/苏格拉底引导/事实核查/文献综述/三方扫描/研究评审） |
| **Academic Paper** | v3.2.0 | 12-agent 论文写作管线，11 种模式（全文/计划/大纲/修订/摘要/格式转换/引用检查/披露声明/答辩审计等） |
| **Academic Paper Reviewer** | v1.10.0 | 7-agent 多视角同行评审（主编 + 3 名动态审稿人 + 魔鬼代言人），0-100 分评级 |
| **Academic Pipeline** | v3.13.0 | 10 阶段管线编排器，含完整性验证、R&R 追溯矩阵 |

### 10 阶段管线流程

```
Stage 1  研究        → RQ Brief + 方法论蓝图
Stage 2  写作        → 论文全文草稿
Stage 2.5 完整性验证  → 引用审计（不可跳过）
Stage 3  同行评审    → 主编 + 3 审稿人 + 魔鬼代言人
Stage 3' 再评审      → 修订后验证
Stage 4  修订        → 点对点回复审稿人
Stage 4.5 最终验证   → 零回归检查（不可跳过）
Stage 5  格式化/发布  → APA 7.0 / IEEE / Chicago → MD/DOCX/LaTeX/PDF
Stage 6  流程总结    → 6 维合作质量评估
```

管线保证：每一步都要用户确认；Stage 2.5 和 4.5 的完整性验证**不可跳过**。

### 关键创新

**引用验证（v3.7.1+）**：每一条引文携带定位锚点（三层引用定位）。可选审计模式（`ARS_CLAIM_AUDIT=1`）会获取源文献对照判断，输出 5 种 HIGH-WARN 类别：

| 警告类别 | 含义 |
|---------|------|
| claim-not-supported | 被引文献不支持该主张 |
| negative-constraint-violation | 违反否定约束 |
| fabricated-reference | 引用幻觉 |
| anchorless | 缺少定位锚点 |
| constraint-violation-uncited | 违反约束且未引用 |

**魔鬼代言人让步阈值协议**：DA 必须对每次反驳评分 1-5，只有评分 ≥4 时才允许让步。反谄媚规则：不允许连续让步、跟踪让步率、检测框架锁定。

**苏格拉底导师意图检测**：在对话开始时和每 3 轮后分类用户意图——探索模式（禁用自动收敛，上限 60 轮）vs 目标导向模式（标准收敛行为）。

**样式校准（Style Calibration）**：从研究者过往作品学习写作风格，让 AI 辅助的输出更贴近个人而非机器感。写作质量检查会捕获让文章显得「AI 生成」的模式。

## 快速上手

### 完整管线

```
你: I want to write a research paper on AI's impact on higher education QA
→ ARS 从 Stage 1 开始引导你完成全过程
```

### 独立技能

```text
# 深度研究
"Research the impact of AI on higher education"      → 完整模式
"Give me a quick brief on X"                          → 快速简报
"Do a systematic review on X with PRISMA"             → 系统综述
"Guide my research on X"                              → 苏格拉底模式
"Fact-check these claims"                             → 事实核查

# 论文写作
"Write a paper on X"                                  → 完整模式
"Guide me through writing a paper"                    → 规划模式
"I have a draft, here are reviewer comments"          → 修订模式
"Check citations"                                     → 引用检查

# 同行评审
"Review this paper"                                   → 完整模式
"Check the methodology"                               → 方法论审核
```

### 搭配使用

ARS 还有一个配套的 [Experiment Agent](https://github.com/Imbad0202/experiment-agent)，填补研究阶段和写作阶段之间的实验执行空白。流程：

```
ARS Stage 1 RESEARCH  → RQ Brief + 方法论蓝图
       ↓
experiment-agent     → 执行实验 → 验证结果
       ↓
ARS Stage 2 WRITE    → 用已验证的实验结果写论文
```

## 适用场景

| 场景 | 为什么用 ARS |
|------|-------------|
| **写期刊论文** | 10 阶段管线 + 完整性验证，从选题到发表的完整支持 |
| **写文献综述** | PRISMA 系统综述模式 + CrossCheck | Semantic Scholar 验证 |
| **投稿前自审** | 7 视角同行评审 + 魔鬼代言人攻击论文 |
| **修改 reviewer 意见** | R&R 追溯矩阵 + 点对点回复生成 |
| **检查引用完整性和准确性** | 三层定位锚点 + 可审计引用验证 |
| **多语言写作** | 中文（简/繁）/ 英文 / 日文 / 韩文，双语摘要 |
| **跨格式输出** | APA/Chicago/MLA/IEEE/Vancouver → MD/DOCX/LaTeX/PDF |

## 局限与注意事项

- **需要 Claude Code**：这不是独立工具，是 Claude Code 的插件。需要 Anthropic API Key
- **许可证 CC BY-NC 4.0**：非商业用途免费，商业使用需另外授权
- **Token 消耗**：完整管线估约 $4-6（15k 词论文），但实际取决于模型版本和使用模式
- **不是全自动**：设计为「人在回路中」，每个阶段需要用户确认
- **引用验证覆盖率**：v3.8 的 claim audit 基于可获取的源文献，源文献不可达时无法验证
- **需要真实 Python**：部分功能（PreToolUse 防护、修订补丁模式、提交包验证）需要真实 Python 解释器（Windows 下注意 Microsoft Store 占位符问题）

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/Imbad0202/academic-research-skills |
| 实验代理配套 | https://github.com/Imbad0202/experiment-agent |
| Codex CLI 版 | https://github.com/Imbad0202/academic-research-skills-codex |
| 教学技能配套 | https://github.com/YujxZJCN/teaching-skills |
| 架构文档 | https://github.com/Imbad0202/academic-research-skills/blob/main/docs/ARCHITECTURE.md |
| 设置指南 | https://github.com/Imbad0202/academic-research-skills/blob/main/docs/SETUP.md |
| 性能与成本 | https://github.com/Imbad0202/academic-research-skills/blob/main/docs/PERFORMANCE.md |
| Zenodo DOI | https://doi.org/10.5281/zenodo.20696614 |

## 参考资料

- **ARS GitHub 仓库**：完整技能套件和文档。→ https://github.com/Imbad0202/academic-research-skills
- **The AI Scientist (Lu et al., 2026, Nature)**：全自动 AI 研究系统的第一个实例。→ https://www.nature.com/articles/s41586-025-09242-x
- **Zhao et al. (2026)**：250 万篇论文的引用审计，发现 14.6 万条幻觉引用。→ https://arxiv.org/abs/2605.07723
- **PaperOrchestra (Song et al., 2026, Google)**：ARS v3.3 的部分设计灵感。→ https://arxiv.org/abs/2604.05018
