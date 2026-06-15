---
layout: post
title: "OpenRouter Fusion API：多模型并行推理正在接近 Fable 5 水平"
categories: [ai]
description: "OpenRouter 发布了 Fusion API，采用多模型并行推理 + Judge + Synthesizer 的三阶段流水线架构。在 DRACO 深度研究基准上，Gemini 3 Flash + Kimi + DeepSeek 的组合得分 64.7%，仅落后 Claude Fable 5 不到 1 个百分点，而成本只有一半。本文深入分析这一 compound AI 方案的技术原理和行业意义。"
tags:
  - AI
  - OpenRouter
  - Fusion API
  - 多模型推理
  - Compound AI
  - DRACO基准
  - Fable 5
  - 深度研究
---

2026 年 6 月 13 日，OpenRouter 正式发布了 **Fusion API**——一个**多模型并行推理 + 裁决（Judge）+ 综合（Synthesizer）** 的三阶段复合 AI（Compound AI）系统。它在 DRACO 深度研究基准上的表现令人瞩目：一个由 Gemini 3 Flash、Kimi K2.6 和 DeepSeek V4 Pro 组成的"廉价面板"，得分 64.7%，仅落后 Claude Fable 5（65.3%）不到 1 个百分点，而成本只有后者的一半。

这条消息来自 X 上 @Lonely__MH 的分享，获得了不少关注。

---

## 什么是 Fusion API

Fusion 不是又一个"更好的单模型"，而是一个**模型编排系统**。它运行在 OpenRouter 的服务端，将用户请求并行分发给多个模型，然后通过裁决+综合生成最终答案。

核心 Insight 在于：**不同模型在不同维度上有各自的优势，如果能有效组合，可以将各自的短板互相补足。**

---

## 三阶段流水线

### 阶段一：面板并行推理（Panel）

用户的 Prompt 被同时发送给一组模型（"面板"）。OpenRouter 称之为"小组讨论"（panel deliberation）——每个模型独立生成回答，互不干扰。

所有面板模型都启用相同的工具：`web_search`（通过 Exa）和 `web_fetch`（通过 Exa）。

### 阶段二：裁决模型分析（Judge）

裁决模型读取面板中所有模型的输出，生成一份**结构化分析**，覆盖：

- **共识点（Consensus）**——模型们都同意的内容
- **矛盾点（Contradictions）**——模型之间意见不一致的地方
- **部分覆盖（Partial Coverage）**——只有部分模型覆盖的方面
- **独特洞察（Unique Insights）**——某个模型独有的有价值的观点
- **盲区（Blind Spots）**——面板集体遗漏的内容

### 阶段三：综合模型输出（Synthesizer）

综合模型基于裁决分析撰写最终答案。裁决模型和综合模型可以是同一个，也可以不同。

```
用户 Prompt
    │
    ▼
┌─────────────────────┐
│   并行推理（面板）    │
│                     │
│  Gemini 3 Flash ──┐ │
│  Kimi K2.6      ──┤ │
│  DeepSeek V4 Pro ──┘ │
└─────────┬───────────┘
          │ 面板输出
          ▼
┌─────────────────────┐
│   裁决（Judge）       │
│  结构化分析面板输出    │
└─────────┬───────────┘
          │ 分析结果
          ▼
┌─────────────────────┐
│   综合（Synthesizer） │
│  撰写最终答案        │
└─────────┬───────────┘
          │ 最终输出
          ▼
```

---

## DRACO 基准测试结果

DRACO（Deep Research Accuracy, Completeness, and Objectivity）是 Perplexity AI 开发的深度研究任务评测集，包含 100 个任务，覆盖 10 个领域（学术、金融、法律、医学、技术等），每个任务使用约 39 个加权评分标准进行评估。

以下是 OpenRouter 官方公布的 Fusion 基准测试结果：

| 排名 | 方案 | 分数 |
|:---:|------|:---:|
| 1 | Fusion: **Fable 5 + GPT-5.5**（Opus 4.8 综合） | **69.0%** |
| 2 | Fusion: Opus 4.8 + GPT-5.5 + Gemini 3.1 Pro（Opus 4.8 综合） | 68.3% |
| 3 | Fusion: Opus 4.8 + GPT-5.5（Opus 4.8 综合） | 67.6% |
| 4 | Fusion: Opus 4.8 + Opus 4.8（Opus 4.8 综合） | 65.5% |
| 5 | **单模型: Claude Fable 5** | **65.3%** |
| **6** | **Fusion: Gemini 3 Flash + Kimi K2.6 + DeepSeek V4 Pro（Opus 4.8 综合）** | **64.7%** |
| 7 | 单模型: DeepSeek V4 Pro | 60.3% |
| 8 | 单模型: GPT-5.5 | 60.0% |
| 9 | 单模型: Claude Opus 4.8 | 58.8% |
| 10 | 单模型: Kimi K2.6 | 53.7% |
| 11 | 单模型: Gemini 3.1 Pro | 45.4% |
| 12 | 单模型: Gemini 3 Flash | 43.1% |

### 三个关键发现

**1. 组合总是优于单体**

所有 Fusion 配置的得分都高于同层的任何单模型。不是"有时候有用"，而是**在所有测试场景中一致性收益**。

**2. 自组合也能提升**

Opus 4.8 和自己组队（2x Opus 4.8，由 Opus 4.8 综合）得到了 65.5%，比单 Opus 4.8 的 58.8% 高出 **6.7 个百分点**。这说明收益不仅来自"模型多样性"，裁决-综合这个步骤本身就能通过聚合不同的推理路径来提升质量。

**3. 廉价面板逼近前沿**

最值得注意的是第 6 名：Gemini 3 Flash（43.1%）+ Kimi K2.6（53.7%）+ DeepSeek V4 Pro（60.3%）这三个模型单独看都不在顶尖，但组合后达到 **64.7%**——超过 GPT-5.5（60.0%）和 Opus 4.8（58.8%），仅落后 Fable 5 **不到 1 个百分点**，而成本只有 Fable 5 的一半。

---

## 技术细节与使用方式

### 自定义面板

Fusion 允许完全自定义面板配置。用户可以在 API 调用中指定参与面板的模型和综合模型：

```json
{
  "model": "openrouter/fusion",
  "messages": [{ "role": "user", "content": "..." }],
  "plugins": [{
    "id": "fusion",
    "model": "google/gemini-3-flash-preview",
    "analysis_models": [
      "google/gemini-3-flash-preview",
      "moonshotai/kimi-k2.6",
      "deepseek/deepseek-v4-pro"
    ]
  }]
}
```

### 四种使用模式

| 模式 | 说明 |
|------|------|
| **Chatroom UI** | 访问 openrouter.ai/fusion，无需代码 |
| **模型别名** | `"model": "openrouter/fusion"` → 由 OpenRouter 自动选择默认面板 |
| **服务端工具** | 在 tools 中添加 `{ "type": "openrouter:fusion" }`，让基础模型自行判断何时调用 |
| **插件模式** | 在正常 API 调用中使用 `"plugins": [{ "id": "fusion", ... }]` 显式配置面板 |

### 延迟

Fusion 的延迟通常是标准单模型调用的 **2–3 倍**——因为需要等待所有面板模型完成，再执行裁决和综合。这是它目前最明显的权衡。

---

## 行业意义

### Compound AI 不是新概念，但 Fusion 给了它一个产品形态

复合 AI 系统（Compound AI Systems）在学术界已经被讨论了一段时间。但 OpenRouter 将其包装成一个**即插即用的 API**——调用方不需要管理多个 API Key、不需要编排工作流、不需要实现裁决逻辑。这是从"论文概念"到"产品可用"的关键一步。

### 对"前沿模型"叙事的影响

如果廉价组合可以接近 Fable 5 的水平，那"追逐最强单模型"的投资回报率就需要重新计算。对于预算有限的团队，这可能意味着用 GPT-5.5 的成本获得接近 Fable 5 级别的输出质量。

当然，Fusion 不是万能的：
- DRACO 不包含长时间跨度的推理任务（这是 Fable 5 的优势领域）
- Fusion 不适合编码任务，更适合作为编码模型的辅助工具
- 2–3 倍的延迟惩罚在某些场景下不可接受

### 与多 Agent 管理的结合

@Lonely__MH 的推文中提到"结合多 Agent 管理的思路，大有可为"。这是一个值得展开的点：

Fusion 是**多模型方案**，而 Omnigent、Claude Code 等是**多 Agent 方案**。两者可以结合：
- **Fusion** 负责"提升单个答案的质量"——用多个模型的输出合成更好的输出
- **多 Agent** 负责"执行复杂工作流"——不同 Agent 负责不同子任务

一个可能的架构：Agent 在执行深度研究任务时，调用 Fusion API 获取高质量答案，再将该答案整合到自己的工作流中。

---

## 一些保留意见

1. **基准局限性**：DRACO 是文本级基准，不包含多模态、代码生成、长期推理等维度。Fusion 在这些场景下的表现尚未验证。
2. **裁决模型依赖**：当前基准使用 Gemini 3.1 Pro Preview 作为裁判，如果裁判模型本身有偏见，会影响评分。
3. **Fable 5 的任务完成率**：Fable 5 只完成了 93/100 个任务（7 个因内容过滤被阻断），直接对比存在微小的不公平。
4. **长期推理**：Fable 5 在需要长时间深度推理的任务上有显著优势，这些任务可能未被 DRACO 充分覆盖。

---

## 结语

Fusion API 最重要的贡献不是"打败了 Fable 5"（其实并没有，只是接近），而是**证明了 Compound AI 的工程可行性**。当你在 API 调用中加一行配置就能让多个模型并行工作并获得一致性的质量提升时，复合 AI 就从"工程团队才能搭建的高级方案"变成了"任何开发者都能使用的标配能力"。

组合优于单体，在 AI 领域也被验证了。

---

**参考资料**
- [OpenRouter: Introducing the Fusion API](https://openrouter.ai/blog/fusion)
- [DRACO Benchmark (arXiv: 2602.11685)](https://arxiv.org/abs/2602.11685)
- [OpenRouter Fusion 官网](https://openrouter.ai/fusion)
- [X 原文: @Lonely__MH](https://x.com/lonely__mh/status/2066107660920115636)
- [Perplexity AI: DRACO 论文](https://arxiv.org/abs/2602.11685)
