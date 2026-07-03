---
layout: post
title: "DRIFT：动态规则注入隔离框架保护 LLM Agent 安全"
categories: [sec]
description: "NeurIPS 2025 论文 DRIFT 提出动态规则生成+注入隔离的 LLM Agent 防御框架，在 AgentDojo 等多个基准上验证有效性。已开源。"
tags:
  - AI Agent
  - LLM
  - Prompt注入
  - 防御框架
  - NeurIPS
---

## 项目概述

DRIFT（Dynamic Rule-Based Defense with Injection Isolation）是发表于 **NeurIPS 2025** 的系统级 LLM Agent 防御框架，作者来自 SaFo Lab（Hao Li、Xiaogeng Liu、Hung-Chun Chiu、Dianqi Li、Ning Zhang、Chaowei Xiao）。

核心贡献是：针对 LLM Agent 面临的 Prompt 注入攻击，提出**动态规则生成 + 内存流隔离**的双层防御架构。

## 要解决的问题

LLM Agent 通过调用外部工具完成复杂任务，但这同时引入了 Prompt 注入攻击的风险——外部来源的输入可能误导 Agent 的行为，导致经济损失、隐私泄露或系统被攻破。

已有的系统级防御方案主要依赖静态或预定义的策略规则，面临两个关键挑战：

1. **动态场景适应性**：预定义规则无法覆盖 Agent 在运行时遇到的各种执行路径
2. **内存流隔离**：Agent 在推理过程中将指令和数据混合在同一工作记忆中，无法区分可信系统指令和不可信外部数据

## DRIFT 的核心方法

DRIFT 的防御架构包含两个核心机制：

### 1. 动态规则生成
DRIFT 不为工具调用预设固定的安全策略，而是在 Agent 执行前，根据当前任务上下文**动态生成**一套约束规则。这些规则包含：

- **最小函数轨迹**：Agent 执行过程中应遵循的预期工具调用路径
- **JSON Schema 参数检查清单**：每个工具调用的参数必须符合的格式和范围约束

### 2. 注入隔离
在 Agent 的内存流中建立隔离边界，将外部不可信输入与系统内部指令分开处理，防止注入指令污染 Agent 的执行决策。

## 技术实现

项目已开源，支持在多个基准上评估：

| 基准 | 场景 |
|------|------|
| AgentDojo | 银行、Slack、旅行、工作区 |
| AgentDyn | 购物、GitHub、日常生活 |
| ASB | 额外场景 |

支持的模型提供商包括 OpenAI、Google Gemini、OpenRouter。使用方式：

```bash
# 无攻击评估
python pipeline_main.py \
  --model gpt-4o-mini-2024-07-18 \
  --build_constraints --injection_isolation --dynamic_validation \
  --suites banking,slack,travel,workspace

# 有攻击评估
python pipeline_main.py \
  --model gpt-4o-mini-2024-07-18 --do_attack \
  --attack_type important_instructions \
  --build_constraints --injection_isolation --dynamic_validation \
  --suites banking,slack,travel,workspace
```

## 与本周其他防御方案的关系

| 方案 | 防御层级 | 方法 | 来源 |
|------|---------|------|------|
| DRIFT | Agent 框架层 | 动态规则 + 注入隔离 | **学术研究（NeurIPS 2025）** |
| Cisco AI Defense | SDK 层 | 动态代码重写检测 | 商业产品 |
| NVIDIA SAW | GPU 硬件层 | 可信执行环境 | 硬件方案 |
| Vorlon Guardian Gateway | 网络层 | 代理网关策略执行 | 商业产品 |
| Microsoft 安全分级 | 管理层 | Level 0–4 分级控制 | 方法论 |

DRIFT 的独特价值在于**学术研究驱动的独立防御框架**，来自研究团队而非商业厂商，其方法的可验证性和可复现性是核心优势。

## 项目信息

- **GitHub**: [SaFo-Lab/DRIFT](https://github.com/SaFo-Lab/DRIFT)
- **项目主页**: [safo-lab.github.io/DRIFT](https://safo-lab.github.io/DRIFT/)
- **论文**: [arxiv.org/pdf/2506.12104](https://arxiv.org/pdf/2506.12104)
- **会议**: NeurIPS 2025
- **许可证**: MIT
