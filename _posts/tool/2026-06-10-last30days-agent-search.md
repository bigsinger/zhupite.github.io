---
layout: post
categories: [tool]
title: "Last30Days：让 AI Agent 用过去 30 天的互联网数据做研究"
tags: [AI Agent, 搜索, 开源, 信息检索, 趋势]
description: "Last30Days 是一个 AI Agent 技能，能跨 Reddit、X、YouTube、Hacker News、Polymarket 和整个网络搜索过去 30 天的信息，以点赞数、投票和真实资金作为排序依据而非编辑推荐，最后合成一份有据可查的摘要。"
---

# Last30Days：让 AI Agent 用过去 30 天的互联网数据做研究

> 传统的搜索引擎靠爬虫和算法排名，**Last30Days 靠的是 AI Agent + 社交信号 + 真实金钱投票**。

**Last30Days** 是一个 AI Agent 技能，由 **mvanhorn** 开发，在 GitHub 上曾获得 **#1 Repository of the Day** 的殊荣。它能够在 Reddit、X（Twitter）、YouTube、Hacker News、Polymarket 和整个网络搜索过去 30 天的信息，并以全新的排序逻辑整合出有据可查的研究摘要。

## 与众不同的搜索哲学

传统搜索引擎的排序逻辑是：**编辑算法决定什么内容重要**。

Last30Days 的排序逻辑是：**用户的点赞、投票和真实金钱决定什么内容重要**。

| 数据源 | 排序依据 |
|--------|----------|
| Reddit | Upvotes（点赞数） |
| X | Likes（喜欢数） |
| YouTube | Views/Likes（观看/点赞数） |
| Hacker News | Upvotes（投票数） |
| Polymarket | 真实资金（真金白银的赌注） |
| Web | 综合社交信号 |

这种"社交信号排序"的逻辑直观而有效：**被最多人认可的内容，通常最有价值**。而 Polymarket 的加入更引人注目——真金白银的预测市场代表了最真实的"集体智慧"。

## 核心能力

### 跨平台一站式搜索

过去如果你想了解某个话题的近期讨论，可能需要分别打开 Reddit、X、YouTube、HN 等平台逐一搜索。Last30Days 通过一个 AI Agent 技能，将这些数据源整合在一起。

### 30 天时间窗口

聚焦"最近 30 天"的信息，确保研究的时效性。这在快速变化的技术领域（如 AI、加密货币、新兴工具）中尤为重要。

### AI 合成摘要

搜索完成后，AI Agent 会自动将来自多个平台的信息整合为一份结构化的摘要，包含：
- 主要发现和趋势
- 来源引用（具体链接）
- 不同平台的观点对比

## 使用场景

1. **技术调研**：了解某个框架或工具的最新社区评价
2. **市场研究**：追踪某个产品发布后的用户反馈
3. **趋势判断**：通过 Polymarket 的真实资金流向判断市场信心
4. **内容创作**：获取多平台的素材和观点，辅助写作

## 为什么它是 GitHub #1？

Last30Days 解决了 AI Agent 的一个核心痛点——**AI 的训练数据是有截止日期的**（通常是几个月甚至几年以前），但用户需要的往往是**最新信息**。Last30Days 为 AI Agent 装上了"实时搜索"的眼睛。

## 快速使用

```bash
# 安装技能（取决于你的 Agent 平台）
# 然后在对话中使用：
/research topic="Kubernetes 2025 最佳实践"
```

## 结语

Last30Days 的核心理念很清晰：**让信息检索回归到人的判断**。不是编辑选什么你就看什么，而是大家都在关注什么、用真金白银在押注什么，你就看什么。这是一种更民主、更动态、更真实的信息获取方式。

---

**项目地址**：[https://github.com/mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill)
**曾获荣誉**：GitHub Trending #1 Repository of the Day
