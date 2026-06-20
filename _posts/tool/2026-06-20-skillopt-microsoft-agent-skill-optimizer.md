---
layout: post
title: "SkillOpt：微软开源，像训练神经网络一样优化 AI Agent 技能——52 项评测全部第一"
categories: [tool]
description: "微软研究院开源 SkillOpt，首次将训练神经网络的方法论（batch、epoch、学习率、验证集）搬到优化 AI Agent Skill 文档上。6 阶段 RefACT 管线驱动，52 项评测全部最佳，最高准确率提升 +39 分。"
tags: [AI Agent, Skill优化, 微软, 开源项目, LLMOps]
---

## 一句话

**SkillOpt** 是微软研究院开源的项目，**第一次把训练神经网络的方法论搬到了优化 AI Agent Skill 上**——有 epoch、batch size、学习率和验证门控，但不碰模型权重。优化产物是一个 300-2000 token 的 Markdown 文件，部署时零额外推理成本。

> microsoft/SkillOpt ⭐ 8.4K | 🐍 Python | MIT | 2026 年 5 月发布

## 为什么需要它？

训练神经网络，epoch、batch size、学习率等等整套流程非常成熟，跑一轮下来结果可复现。

但训练 AI Agent 的 skill 呢？改改 prompt 跑跑看，好就算了不好再改——没有验证集，全凭手感。

SkillOpt 解决的问题就是：**把优化 skill 这件事从盲目试错变成结构化可迭代流程。**

## 核心思想

SkillOpt 的核心想法很直觉：把 Skill 文档当作神经网络里的可训练参数，用训练神经网络的那套纪律去优化它。

| 神经网络 | SkillOpt |
|---------|---------|
| 模型权重 | Skill.md 文档 |
| 梯度 | 基于轨迹的反思分析 |
| 学习率 | 每次编辑的幅度预算 |
| 验证集 | held-out 数据上的评分 |
| Epoch | 多轮迭代优化 |
| Mini-batch | 批量任务 rollout |

最终产物是一个通常只有 **300 到 2000 token** 的 `best_skill.md` 文件。部署时直接作为系统指令喂给模型，不需要任何额外的模型调用，推理成本为零。

## 六阶段 ReflACT 训练管线

```
Rollout(展开) → Reflect(反思) → Aggregate(聚合)
→ Select(选择) → Update(更新) → Evaluate(评估)
```

**第一步：Rollout（展开）**——用当前 skill 文档让目标模型跑一批任务，收集执行轨迹和得分。

**第二步：Reflect（反思）**——一个独立的优化器模型分析这些轨迹，找出 skill 文档里哪些地方导致了错误、哪些地方做得好。

**第三步：Aggregate（聚合）**——聚合多条轨迹的反馈，形成结构化信号。

**第四步：Select（选择）**——从候选编辑中选择最有希望的修改方案。这里有个关键设计：**每次编辑的幅度受文本学习率控制**，不会一口气大改，而是小步迭代。

**第五步：Update（更新）**——把选定的编辑合并成一个候选 skill 文档。如果编辑数量超过预算，按优先级排序只保留最重要的几条。

**第六步：Evaluate（评估）**——**这是最关键的一步**。候选 skill 文档不会直接生效，必须先在验证集上跑一轮评分，只有得分严格优于当前 skill 文档才会被接受。否则修改直接丢弃。

**两个全局机制**：

- **Slow Update（慢更新）**：每个 epoch 结束时对整个训练过程做纵向回顾，提炼全局改进建议
- **Meta Skill（元技能）**：进一步总结更高层次的策略性指导

## 实验结果：52/52 全部领先

| 维度 | 结果 |
|------|------|
| 覆盖范围 | 6 个 benchmark × 7 个目标模型 × 3 种执行框架 = **52 个评测单元** |
| 结果 | **全部 52 个评测单元最佳或并列最佳** |
| 在 GPT-5.5 上（Direct Chat） | 提升 **+23.5** 分 |
| 在 GPT-5.5 上（Codex 代理循环） | 提升 **+24.8** 分 |
| 在 GPT-5.5 上（Claude Code 代理循环） | 提升 **+19.1** 分 |
| 最高单项提升 | **+39.0** 分 |
| 击败的对手 | 人类专家手写 Skill、TextGrad、GEPA、Trace2Skill、EvoSkill |

**迁移能力**：在一个模型上训练出来的 skill，可以直接用在另一个模型上。在 Codex 上优化的技能拿到 Claude Code CLI 上也能用，跨 benchmark 也有泛化性。

## 安装使用

```bash
pip install skillopt
```

配置后端（支持多后端）：
```bash
# Azure OpenAI
export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
export AZURE_OPENAI_API_KEY="***"

# Anthropic Claude
export ANTHROPIC_API_KEY="***"

# Qwen（本地 vLLM）
export QWEN_CHAT_BASE_URL="http://localhost:8000/v1"
```

启动训练：
```bash
python scripts/train.py \
  --config configs/searchqa/default.yaml \
  --optimizer_model gpt-5.5 \
  --target_model gpt-5.5
```

这里有两个模型角色：`optimizer_model`（分析轨迹、生成补丁）和 `target_model`（执行任务的目标模型）。你可以用强模型做优化器，弱模型做目标，用前者的智慧提升后者。

训练完生成 `best_skill.md`，这就是你训练出来的最终技能。

仅评估已有技能无需重新训练：
```bash
python scripts/eval_only.py \
  --config configs/searchqa/default.yaml \
  --skill ckpt/searchqa/gpt5.5_skill.md
```

项目自带 WebUI 监控面板：
```bash
pip install -e ".[webui]"
python -m skillopt_webui.app
```

## 项目状态

| 指标 | 数据 |
|------|------|
| Stars | 8,400 ⭐ |
| Forks | 814 |
| 主语言 | Python |
| 许可证 | MIT |
| 创建时间 | 2026-05-08 |
| 最新版本 | v0.1.0（2026-06-02） |
| 论文 | arXiv:2605.23904 |
| 项目主页 | microsoft.github.io/SkillOpt |

## 总结

SkillOpt 的价值不在于它比 prompt 工程好多少，而是**第一次为 skill 优化提供了可测量、可迭代、可复现的工程框架**。

> 不调模型参数、不改推理代码，只优化一个 Markdown 文件，Agent 准确率提升近 40 分。

对于任何正在用 Agent 做产品的团队，这个方向值得认真关注。

---

**项目地址**：[github.com/microsoft/SkillOpt](https://github.com/microsoft/SkillOpt)
**论文**：[arxiv.org/abs/2605.23904](https://arxiv.org/abs/2605.23904)
**项目主页**：[microsoft.github.io/SkillOpt](https://microsoft.github.io/SkillOpt/)
