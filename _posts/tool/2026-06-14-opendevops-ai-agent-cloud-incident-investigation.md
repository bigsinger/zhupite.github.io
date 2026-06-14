---
layout: post
title: "OpenDevOps：调查 AWS/Azure 云安全事件的开源 AI Agent"
categories: [tool]
description: "OpenDevOps 是一个开源的多云 DevOps Agent，支持 AWS 和 Azure，通过 AI Agent 自动调查云安全事件并定位根因。10 个真实故障场景测试中 9/10 找对根因，单次调查中位数仅 52 秒、成本约 $0.03。"
tags:
  - OpenDevOps
  - AI Agent
  - AWS
  - Azure
  - 云安全
  - 事件响应
  - 开源
---

深夜 3 点，告警响了：生产环境 Lambda 错误率飙升。你爬起来，登录 AWS 控制台，翻 CloudWatch 日志、查 CloudTrail、看最近的 ECS 部署变更——这套流程熟练到肌肉记忆，但每次至少半小时起步。

[**OpenDevOps**](https://github.com/AhmadHammad21/OpenDevOps) 正在改变这件事。它是一个开源的多云 DevOps Agent，把上述流程全部自动化：**收到告警 → AI Agent 自动查询多源数据 → 定位根因 → 给出修复方案**——全程不到一分钟，花费不到三分钱。

---

## 一、它解决什么问题

云安全事件响应的核心痛点不是「找不到信息」，而是**信息太多**。

一个 Lambda 错误飙升，可能的原因包括：最近的代码部署、IAM 权限变更、下游 RDS 超时、依赖服务降级、甚至是 CloudWatch 告警阈值误报。人工排查需要在 CloudWatch、CloudTrail、ECS、Lambda、RDS、IAM 之间来回切换。

OpenDevOps 通过 **21 个只读 AWS 工具** 覆盖了这些数据源：

| 服务 | 工具数 | 查询能力 |
|------|--------|---------|
| CloudWatch | 6 | 日志查询、指标分析、告警事件 |
| CloudTrail | 2 | API 调用历史、事件回溯 |
| ECS | 4 | 任务状态、部署变更、服务健康 |
| Lambda | 4 | 函数配置、执行日志、错误追踪 |
| EC2 | 2 | 实例状态、网络异常 |
| RDS | 2 | 连接数、慢查询、故障切换 |
| IAM | 1 | 权限变更、策略分析 |

> 来源：项目 README，21 read-only AWS tools

再加上 **Azure 支持**（通过 `az` CLI + `kubectl` for AKS），一个 Agent 就能横跨两大云平台做事故溯源。

## 二、基准测试：数字不说谎

在 10 个真实故障场景（有真实 AWS + Azure 资源，有预定义 ground truth）上，使用 **gpt-oss-120b**（非前沿模型）测试：

| 指标 | 数值 |
|------|------|
| 根因定位准确率 | **9/10（90%）** |
| 中位调查时间 | **约 52 秒** |
| 单次调查成本 | **约 $0.03** |
| 对比 AWS DevOps Agent | 便宜约 10 倍（$0.03 vs $0.43） |
| 对比人工排查 | 便宜约 1000 倍（$0.03 vs ~$50 工程师工时） |

> **来源：** 项目 README，full benchmark & methodology 在 `apps/documentation/benchmark.md`

值得注意：测试用的是 **gpt-oss-120b**，一个开源大模型。如果换成 Claude、GPT-4 或结合本地 Ollama，效果成本都会有不同取舍。

## 三、核心架构

```
告警源（EventBridge / SQS）
    ↓
OpenDevOps Agent（LangChain DeepAgents）
    ↓
21个AWS只读工具 + Azure CLI + kubectl
    ↓
数据入库（Postgres / SQLite / Memory）
    ↓
根因分析 + 修复建议 → 实时推送到 Dashboard / Slack
```

几个关键设计：

**LLM 无关设计：** 通过 LiteLLM 支持任意模型——OpenAI、Anthropic、OpenRouter、Groq、Gemini、Mistral、本地 Ollama（可直接在离线环境运行）。甚至能自动检测已有 Claude Code 订阅，零额外成本。

**沙箱命令执行：** 所有 bash 命令走白名单验证（仅允许 `aws`、`az`、`kubectl`、`docker`），30 秒超时，禁用 `shell=True`。未来计划演进到隔离 Docker 容器。

**数据主权：** 所有调查数据存在你自己控制的数据库（SQLite 或 Postgres）中，而非托管云服务。满足 HIPAA、PCI、FedRAMP、EU AI Act 等合规要求。

**流式响应：** FastAPI SSE 端点实时流式传输 Agent 推理过程——每一步调用了什么工具、返回了什么结果、Agent 在思考什么，全部实时可见。

> 来源：项目 README 架构/特性章节

## 四、快速上手

### 安装

```bash
git clone https://github.com/AhmadHammad21/OpenDevOps.git
cd OpenDevOps/apps/backend
uv sync
cp .env.example .env
# 编辑 .env——填入 OPENROUTER_API_KEY 和 AWS_PROFILE
```

### 配置 AWS 访问

```bash
aws configure --profile devops-agent-readonly
aws sts get-caller-identity --profile devops-agent-readonly
```

### 运行

**推荐：Docker Compose 一键启动**

```bash
docker compose -f deployment/docker-compose/docker-compose.yml up --build
# 后端: http://localhost:8000
# 前端: http://localhost:80
# Postgres: localhost:5433
```

**本地开发模式**（两个终端）：

```bash
# 终端 1 - 后端
cd apps/backend && uvicorn main:app --reload

# 终端 2 - 前端
cd apps/frontend && npm install && npm run dev
```

> 来源：项目 README Quick Start

### 三种存储后端

| 模式 | 适用场景 | 配置 |
|------|---------|------|
| `memory` | 零配置测试 | 默认，不持久化 |
| `sqlite` | 本地开发 | `CHECKPOINT_BACKEND=sqlite` |
| `postgres` | 生产环境 | `CHECKPOINT_BACKEND=postgres` + 配置 `DATABASE_URL` |

## 五、对比：OpenDevOps vs AWS DevOps Agent

| 维度 | OpenDevOps | AWS DevOps Agent / Q Developer |
|------|-----------|-------------------------------|
| **LLM 选择** | 任意（LiteLLM、Ollama、Claude Code） | 仅 Bedrock 托管模型 |
| **云平台** | AWS + Azure（更多规划中） | 仅 AWS |
| **数据位置** | 你的 VPC / 数据库 | AWS 托管，不可迁移 |
| **定制** | 完全开源，可修改任何代码 | 闭源产品 |
| **费用** | LLM API 原价（或通过 Ollama 免费） | 按次计费 + Bedrock 加价 |
| **自托管** | Docker、Railway、本地、离线环境 | 不支持 |
| **审计** | 所有 Prompt 和工具调用可溯源 | 不可见 |

> 来源：项目 README 对比表格

README 中也诚实指出了 AWS 的优势场景：「如果你 100% 使用 AWS，没有多云计划，且希望零基础设施部署，Amazon Q Developer 的原生控制台集成和仅限 AWS 的信号渠道很难被取代。」

## 六、适用场景

### 适合这样用
- **混合云/多云团队**：同时管理 AWS 和 Azure，需要一个统一的调查入口
- **合规敏感行业**：金融、医疗、政务——数据不能离开 VPC
- **SRE/DevOps 值班团队**：减少告警疲劳，让 AI 做第一轮排查
- **成本敏感团队**：开源自托管，只付 LLM 调用费，或用 Ollama 完全免费

### 需要留意的
- **只读设计**：Agent 只做「调查」不做「修复」，根因定位后需要人工确认执行修复
- **较新项目**：240+ commits，生态和社区仍在建设期
- **依赖云配置**：需要预先配置好 AWS profile 和 Azure Service Principal
- **模型质量影响结果**：虽然 90% 的准确率来自开源模型，但用不同的 LLM 效果会有差异

## 总结

OpenDevOps 是「AI 运维工程师」从概念走向实用工具的一个有力例证。单次调查 52 秒、$0.03 的成本，已经足够低到可以「先跑一次 AI 调查，再看结果决定是否介入」。

对于正在建设云安全响应体系的团队来说，它是一个值得部署评估的开源选择——尤其是那些需要多云支持、数据主权、和完全审计可见性的场景。

**项目地址：** [github.com/AhmadHammad21/OpenDevOps](https://github.com/AhmadHammad21/OpenDevOps)  
**许可协议：** Apache-2.0
