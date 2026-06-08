---
layout: post
title: "Models.dev：AI 模型数据库的开源方案 — 统一查询所有模型的规格与定价"
categories: [ai]
description: "Models.dev 是一个收录了 200+ 模型、覆盖 Anthropic/OpenAI/Google 等主流厂商的开源 AI 模型数据库，提供统一 API 查询模型规格、定价、上下文窗口和基准评测分数"
keywords: Models.dev, AI Model Database, open-source, model spec, pricing, TOML, API
tags:
  - Models.dev
  - AI Model Database
  - 开源
  - 模型规格
  - API
---

## Models.dev 是什么

**Models.dev** 是一个开源的 AI 模型数据库项目，系统化地收录了市面上主流 AI 模型的规格、定价、能力和基准评测数据。它由 [SST](https://sst.dev) 团队创建并维护，同时也是 [opencode](https://opencode.ai) 的内部模型数据源。

| 项目信息 | 数据 |
|---------|------|
| GitHub 仓库 | https://github.com/anomalyco/models.dev |
| Stars | 4,833 |
| Forks | 1,076 |
| 语言 | TypeScript |
| 许可证 | MIT |
| 创建时间 | 2025-06-04 |

核心定位：**用一套统一的数据格式和 API，解决「没有一个数据库包含所有可用 AI 模型信息」的问题。**

## 核心特性

| 特性 | 说明 |
|------|------|
| **统一 API** | 通过 JSON 端点一次性获取所有模型的定价、能力、限值数据 |
| **TOML 存储** | 数据以 TOML 格式存储在 Git 仓库中，天然支持版本控制和社区贡献 |
| **Provider 中立** | 模型元数据与 Provider 服务信息分离，分别管理 |
| **社区驱动** | 任何人可通过 Pull Request 添加或更新模型信息 |
| **AI SDK 兼容** | Model ID 与 AI SDK（vercel/ai-sdk）的标识符一致 |
| **SVG Logo 服务** | 各 Provider 的 Logo 以 SVG 格式提供，支持 API 获取 |
| **自动校验** | 通过 GitHub Action 自动验证 TOML 格式和字段完整性 |

## 快速上手

### 获取完整模型目录

```bash
# 获取所有模型完整信息（含 Provider 端点和定价）
curl https://models.dev/api.json

# 仅获取模型自身元数据（不含 Provider 信息）
curl https://models.dev/models.json

# 同时获取两套数据合一的目录
curl https://models.dev/catalog.json
```

### 获取 Provider Logo

```bash
# 替换 provider 为 Provider ID，如 anthropic、openai、google
curl https://models.dev/logos/anthropic.svg
```

## 数据模型

Models.dev 使用两层数据架构：**模型元数据**（Model Metadata）和 **Provider 模型定义**（Provider Model Definition）。

### 模型元数据

模型元数据存储模型本身的属性，不依赖任何 Provider。存放在 `models/` 目录下。

```toml
name = "GPT-5"
family = "gpt"
release_date = "2025-08-07"
last_updated = "2025-08-07"
attachment = true
reasoning = true
temperature = false
tool_call = true
structured_output = true
open_weights = false

[limit]
context = 400_000
input = 272_000
output = 128_000

[modalities]
input = ["text", "image"]
output = ["text"]

[[benchmarks]]
name = "Benchmark Name"
score = 72.5
metric = "accuracy"
source = "https://example.com/results"
```

| 字段 | 说明 |
|------|------|
| `name` | 模型显示名称 |
| `family` | 模型系列（如 gpt、claude、gemini） |
| `release_date` / `last_updated` | 发布日期 / 最后更新日期 |
| `attachment` / `reasoning` / `tool_call` / `structured_output` / `temperature` | 能力布尔标志 |
| `open_weights` | 是否公开权重 |
| `[limit]` | 上下文窗口、输入输出 token 上限 |
| `[modalities]` | 支持的输入/输出模态（text、image、audio、video、pdf） |
| `[[benchmarks]]` | 基准评测分数，每个评测条目包含名称、分数、指标和来源 |

### Provider 模型定义

Provider 模型定义存放在 `providers/<provider_id>/models/` 下，包含定价、服务信息等 Provider 特定的数据。

```toml
base_model = "openai/gpt-5"

[cost]
input = 1.25
output = 10.00
cache_read = 0.125

[limit]
context = 200_000  # 可选覆盖
output = 32_000
```

关键设计：**`base_model` 机制**让封装模型（Wrapper Provider）可以引用已有的模型元数据，只需覆写 Provider 特有的定价和限值，无需重复定义。

### Provider 定义

```toml
name = "Provider Name"
npm = "@ai-sdk/provider"       # AI SDK Package 名称
env = ["PROVIDER_API_KEY"]     # 认证用环境变量
doc = "https://example.com/docs/models"  # 文档链接
```

对于 OpenAI 兼容接口的 Provider：

```toml
npm = "@ai-sdk/openai-compatible"
api = "https://api.example.com/v1"
```

### Schema 字段全览

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | String | 模型显示名称 |
| `attachment` | Boolean | 支持文件附件 |
| `reasoning` | Boolean | 支持思考链 |
| `tool_call` | Boolean | 支持工具调用 |
| `structured_output` | Boolean | 支持结构化输出 |
| `temperature` | Boolean | 支持温度控制 |
| `knowledge` | String | 知识截止日期 |
| `release_date` | String | 首次公开日期 |
| `last_updated` | String | 最近更新日期 |
| `open_weights` | Boolean | 权重是否公开 |
| `status` | String | 状态（alpha/beta/deprecated） |
| `cost.input` | Number | 每百万输入 token 价格（USD） |
| `cost.output` | Number | 每百万输出 token 价格（USD） |
| `cost.reasoning` | Number | 思考 token 价格（USD） |
| `cost.cache_read/write` | Number | 缓存读写定价（USD） |
| `cost.input/output_audio` | Number | 音频 token 定价（USD） |
| `limit.context/input/output` | Number | Token 限制 |
| `modalities.input/output` | String[] | 支持的模态 |

## 如何贡献

### 添加模型元数据

在 `models/` 下按 Provider 路径创建 TOML 文件。例如 `models/openai/gpt-5.toml`。

### 添加 Provider 模型

1. 检查 `providers/` 目录是否已有该 Provider
2. 如有必要，创建 Provider 目录及 `provider.toml`
3. 可选：添加 `logo.svg`（使用 `currentColor`，无固定尺寸）
4. 在 `providers/<id>/models/` 下创建模型的 TOML 文件
5. 提交 Pull Request

### 使用 base_model 复用元数据

对于封装/转售已有模型的 Provider，使用 `base_model` 引用已有元数据：

```toml
base_model = "anthropic/claude-opus-4-6"

[cost]
input = 5.00
output = 25.00
```

可使用 `base_model_omit` 移除不需要继承的字段。

### 验证

提交后 GitHub Action 会自动执行：
- 所有必填字段存在
- 数据类型正确
- 值在可接受范围内
- TOML 语法有效

本地验证命令：

```bash
bun run compare:migrations
```

这条命令会打印每次迁移的 diff，确保生成的 JSON 只在预期范围内变化。

## 实战场景

### 场景一：批量比较模型定价

```bash
# 获取所有模型的完整数据，用 jq 查询特定条件下的定价
curl -s https://models.dev/api.json | jq '.[] | select(.cost.input < 1) | {name, cost}'
```

### 场景二：在 AI SDK 项目中做模型发现

Models.dev 的 Model ID 与 AI SDK 的标识符完全一致。你可以用 `catalog.json` 来做动态的模型选择 UI。

### 场景三：CI/CD 中验证模型配置

在自动化流水线中拉取 `models.dev` 的 TOML 文件，对比内部配置是否与官方数据一致。

## 优劣势分析

| 优势 | 劣势 |
|------|------|
| 统一数据格式，覆盖主流模型 | 数据依赖社区贡献，可能有延迟 |
| TOML 存储天然支持版本控制 | 非官方数据源，以社区维护为准 |
| 开源 + MIT 许可证，商用友好 | 部分稀有模型可能无人维护 |
| Model ID 与 AI SDK 对齐 | 暂不支持非 API 型模型（如本地大模型） |
| 提供 API、JSON、TOML 三种访问方式 | 需要 Bun 环境进行本地开发和验证 |

## 适合谁用

- **AI 应用开发者** — 需要在应用内动态获取模型规格和定价
- **模型价格比较平台的构建者** — 可基于此数据集二次开发
- **AI SDK 用户** — Model ID 与 AI SDK 一致，可无缝集成
- **关注模型市场动态的研究者** — 通过 API 追踪模型发布节奏和定价变化
- **开源贡献者** — 希望通过 PR 参与 AI 模型数据生态建设

## 总结

Models.dev 解决了 AI 模型信息分散的痛点。它通过 TOML + API 的双层架构，让模型元数据与 Provider 服务数据解耦，既保持了数据的可维护性，又提供了便捷的查询接口。对于需要批量比较 AI 模型、在应用中集成模型选择功能的开发者来说，是一个值得关注的开源方案。

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/anomalyco/models.dev |
| 官方网站 | https://models.dev |
| API 端点 | https://models.dev/api.json |

## 参考资料

- **Models.dev GitHub 仓库**：项目源代码、README、贡献指南。→ https://github.com/anomalyco/models.dev
- **SST（项目维护方）**：创建 models.dev 的团队。→ https://sst.dev
- **AI SDK**：Models.dev Model ID 兼容的 AI 开发工具包。→ https://ai-sdk.dev
