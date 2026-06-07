---
layout: post
title: "Aquifer：为 AI Agent 尖峰流量设计的 MCP 运行时"
categories: [ai]
description: "Aquifer 是一个自托管 MCP 网关运行时，专门解决分布式 AI Agent 批量调用工具时的尖峰流量问题。它用 SQLite 做持久队列、支持 MCP 和 HTTP 双协议、动态速率控制、L8 无信任 Webhook 交付，一个二进制就能跑。v0.2.0 于 2026-06-06 发布。"
keywords: Aquifer, MCP, MCP Server, AI Agent, traffic management, rate limiting, queuing, Go, SQLite
tags:
  - MCP
  - AI Agent
  - Traffic Management
  - Go
  - SQLite
  - Open Source
---

MCP（Model Context Protocol）生态正在快速膨胀。随着越来越多的 Agent 开始调用外部工具和 API，一个以前只在后端分布式系统里才会遇到的问题，现在跑到了 Agent 基础设施的层面：**尖峰流量**。

分布式 Agent 会在极短时间内发出大量工具调用请求，直接冲击后端服务。没有流量协调层，后果就是：后端被请求淹没、上游 API 返回 429、一个慢依赖拖垮整个系统。

**Aquifer** 就是用来解决这个问题的。它是一个自托管的 MCP 网关运行时，核心能力一句话就能说清：「吸收 Agent 的尖峰，按速率平稳释放」。

## Aquifer 是什么

Aquifer 是一个用 Go 写的开源项目（MIT 协议），定位为 **MCP 流量框架**（MCP Traffic Framework）。它的 GitHub 仓库是 [github.com/rjpruitt16/aquifer](https://github.com/rjpruitt16/aquifer)，当前版本 v0.2.0（2026-06-06 发布，正好是昨天）。

项目的核心架构很清晰——**一个持久化队列 + 可插拔适配器**：

- 请求通过 MCP 工具或 HTTP API 进入队列
- 队列持久化到 SQLite，崩溃不丢数据，重启自动恢复
- 工作线程按配置的速率（RPS）逐步派发
- 上游通过响应头实时控制派发速率

整个项目只有一个二进制文件，没有外部依赖。部署模式是**侧车（sidecar）**方式——每台应用服务器旁边跑一个实例，SQLite 存在本地持久卷上。

> 目前 GitHub 上只有 4 个 Star、0 个 Fork，属于非常早期的项目。但它的设计理念和解决的真实痛点，值得 Agent 生态的开发者关注。

## 两种使用模式

Aquifer 支持两种接入方式，覆盖 Agent 端和后端两个方向。

### 模式一：MCP 工具模式 — 协调分布式 Agent

这是 Aquifer 作为 MCP 生态成员的核心场景。Agent 不直接调用目标工具 API，而是通过 Aquifer 的 MCP 接口提交请求：

```
Agent → aquifer_enqueue_job → Aquifer 队列 → 目标 API
```

Aquifer 暴露的 MCP 工具有：

| 工具 | 作用 |
|------|------|
| `aquifer_enqueue_job` | 将 HTTP 请求入队，等待速率控制后自动派发 |
| `aquifer_get_job` | 查询作业状态和元数据 |
| `aquifer_health` | 健康检查和协议元数据 |
| `aquifer_l8_metadata` | L8 公钥元数据 |
| `aquifer_l8_challenge` | 回答 L8 挑战 |

Agent 调用 `aquifer_enqueue_job` 后立即拿到 job_id 返回，不需要阻塞等待执行完成。结果通过 Webhook 回调或 SSE 流推送回来。

### 模式二：HTTP API 模式 — 保护你的后端

后端服务可以直接对外暴露 Aquifer 的 HTTP 接口，用于：

**保护自己的 API 不被 Agent 冲垮：**
```
Agent → POST /jobs → Aquifer → 你的后端（以受控速率）
```

**保护外部 API 不被自己冲垮：**
```
你的应用 → POST /jobs → Aquifer → OpenAI/Stripe（以受控速率）
```

两种场景下，**速率控制权归上游**。配置设定了速率上限，上游的响应头 `X-Aquifer-Rps` 可以降低但不能超过上限。压力缓解后速率自动回升。

## 核心功能深度解析

### 1. 持久任务队列

所有任务写入 SQLite，崩溃后重启自动恢复。正在派发的任务标记为 `in_flight`，5 分钟未完成自动重置为 `queued`。单个任务 panic 不会影响其他任务——panic 隔离到作业级别。

任务有 TTL 机制：

| 状态 | TTL |
|------|-----|
| `queued` | 24 小时 |
| `completed` | 30 分钟 |
| `failed` | 2 小时 |

### 2. 灵活的速率配置

通过 YAML 配置文件按上游主机名设置速率：

```yaml
upstreams:
  api.openai.com:
    rps: 10          # 每秒最多 10 个请求
    max_concurrent: 3  # 最多 3 个并发
  your-backend.internal:
    rps: 50
    max_concurrent: 10
```

Aquifer 使用带抖动（jitter）的派发策略，避免请求在时间刻度上扎堆。

### 3. 动态速率控制（Dynamic Rate Control）

这是 Aquifer 最巧妙的设计——**上游在运行时通过响应头反向控制速率**：

| 响应头 | 作用 |
|--------|------|
| `X-Aquifer-Rps` | 降低对该上游的派发速率 |
| `X-Aquifer-Max-Concurrent` | 降低最大并发数 |
| `X-Aquifer-Account-Queue: enabled` | 按用户隔离队列 |

这意味着后端可以在负载高时给 Aquifer 发信号，而不需要改动任何 Agent 代码。这比传统的固定速率限制要灵活得多——压力高峰过去后，速率自动回升。

### 4. L8 无信任 Webhook 协议

Aquifer 实现了一个叫 **L8 v0.1** 的轻量级挑战-响应协议，用于消除 Webhook 交付中的共享密钥。

**传统做法的问题**：发送方和接收方必须共享一个 HMAC 密钥，这个密钥存储在数据库里，可能被窃取、误记日志、忘记轮换。

**L8 的做法**：接收方发布 Ed25519 公钥（`GET /.well-known/l8`），发送方用私钥签名消息，接收方本地验签。整个过程不需要查数据库、不需要发 HTTP 请求——一次 `Ed25519.Verify()` 微秒级完成。

```
首次：接收方发布公钥 → Aquifer 发起挑战 → 验证签名 → 缓存信任
之后：每次 Webhook 携带 X-L8-Signature → 接收方本地验签
```

### 5. SSE 实时流

Aquifer 支持 Server-Sent Events（SSE），客户端可以订阅某个 job 的状态变更：

```
event: queued
event: dispatching
event: completed   # 含响应体和状态码
event: position    # 每 2 秒一次，显示排队位置
```

即使连接断开，重新连接后也会收到已错过状态的回放事件。Webhook 和 SSE 同时触发，Aquifer 官方将其比喻为：「电话通话（SSE）+ 语音信箱（Webhook），永远不会错过结果」。

### 6. 自动扩缩容信号

Aquifer 在每个出站请求中附带负载数据：

| 请求头 | 含义 |
|--------|------|
| `X-Aquifer-Total-Jobs` | 当前节点总任务数 |
| `X-Aquifer-Queue-Depth` | 等待派发的任务数 |
| `X-Aquifer-Flow-Rate` | 当前派发速率（RPS） |

你的后端服务读取这些头，在队列增长时触发扩缩容动作：

```python
total_jobs = int(request.headers.get("X-Aquifer-Total-Jobs", 0))
if total_jobs > 500:
    scale_up()  # 调用 Fly.io / k8s HPA / ASG
```

### 7. 可插拔适配器架构

Aquifer 的核心是一个框架无关的队列+派发引擎。不同的接入层通过适配器实现适配：

```go
type FrameworkAdapter interface {
    Name() string
    Start(ctx context.Context, aquifer *Aquifer) error
}
```

当前内置适配器：

| 适配器 | 环境变量 | 用途 |
|--------|---------|------|
| HTTP | `AQUIFER_ADAPTER=http` | 标准 REST/SSE API |
| MCP stdio | `AQUIFER_ADAPTER=mcp-stdio` | MCP 服务器（stdio 协议） |

第三方也可以写自定义适配器，Aquifer 提供了 Go 包级别的导入支持和 `RunAdapter` 辅助函数。

## 快速上手

### 安装

```bash
# 直接安装（需要 Go）
go install github.com/rjpruitt16/aquifer/cmd/aquifer@latest

# 或 Docker
docker run -p 8080:8080 -v $(pwd)/data:/data \
  -e AQUIFER_ADAPTER=http \
  -e DB_PATH=/data/aquifer.db \
  ghcr.io/rjpruitt16/aquifer

# 或部署到 Fly.io（项目提供了 fly.toml 模板）
```

### 配置

创建 `aquifer.yml`：

```yaml
defaults:
  rps: 2
  max_concurrent: 1

upstreams:
  api.openai.com:
    rps: 10
    max_concurrent: 3
```

### 投递一个任务

```bash
curl -X POST http://localhost:8080/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.openai.com/v1/chat/completions",
    "method": "POST",
    "headers": {"Authorization": "Bearer sk-..."},
    "body": "{\"model\":\"gpt-4o\",\"messages\":[{\"role\":\"user\",\"content\":\"hello\"}]}",
    "webhook_url": "https://yourapp.com/webhooks/aquifer"
  }'
```

## 与同类工具的对比

Aquifer 的定位比较特殊——它不是传统的 API 网关或消息队列，而是专门为 **Agent 调用的尖峰流量**这一场景设计的轻量工具。跟几类相关工具对比一下：

| 维度 | Aquifer | 传统消息队列（RabbitMQ/Redis） | API 网关（Kong/Envoy） | 自定义轮子 |
|------|---------|-------------------------------|----------------------|-----------|
| **部署复杂度** | 单二进制 | 需要集群/运维 | 需要服务网格 | 自研 |
| **Agent 原生支持** | ✅ MCP 工具直接调用 | ❌ 需要适配层 | ❌ 需要适配层 | 看实现 |
| **速率控制** | RPS + 动态回压 | 有限 | 支持 | 看实现 |
| **持久化** | SQLite 本地文件 | 需要数据库集群 | 通常不持久化 | 看实现 |
| **Webhook 交付** | 内置（含 L8 签名） | 需自建 | 有限 | 自建 |
| **SSE 实时推送** | 内置 | 需自建 | 有限 | 自建 |
| **部署模型** | 侧车/单机 | 集群 | 网关层 | 看架构 |

Aquifer 最大的优势是 **为 MCP/Agent 生态原生设计**，一个二进制开箱即用。短期内它不是一个大规模分布式消息总线的替代品，但对于规模适中的 Agent 部署（几十到几百个并发 Agent 调用），它的复杂度和能力刚好匹配。

## 优劣势分析

### 优势

| 优势 | 说明 |
|------|------|
| **部署极简** | 单二进制 + SQLite 文件，没有外部依赖 |
| **Agent 原生** | MCP 工具直接调用，Agent 无需改代码 |
| **动态回压** | 上游实时控制速率，远超固定速率限制 |
| **双向保护** | 既保护后端免受 Agent 洪流，也保护外部 API 免受自己洪流 |
| **L8 协议** | 创新性的无信任 Webhook，消除共享密钥困境 |
| **适配器架构** | 可扩展，支持自定义框架接入 |

### 劣势

| 劣势 | 说明 |
|------|------|
| **早期项目** | 仅 4 个 Star，社区和生态几乎为零 |
| **单机部署限制** | SQLite 不适合高并发写入，水平扩展需手动分区 |
| **Go 包模式** | 自定义适配器需要 Go 语言实现 |
| **缺少 Web UI** | 目前纯 API 操作，没有管理后台 |
| **功能覆盖有限** | 没有重试策略、延迟调度、工作流等高级队列特性 |
| **Linux/macOS 优先** | 项目未明确说明 Windows 支持情况 |

## 适合谁用

- **Agent 平台开发者** — 如果你的 Agent 平台需要协调多个 Agent 的工具调用流量，Aquifer 是最轻量的选择
- **MCP Server 维护者** — 作为下游 MCP Server，可以用 Aquifer 保护自己不被突发调用冲垮
- **自建 Agent 基础设置的团队** — 需要 Agent 流量治理但又不想上全套消息队列的团队
- **独立开发者** — 一个人维护的 Agent 项目，Aquifer 的单二进制 + SQLite 模式完美匹配

## 从 Agent 基础设施演进看 Aquifer

去年我开始关注 MCP 生态时，更多还是关注「MCP Server 能不能让 Agent 调用外部工具」这个基础问题。现在生态已经进化到第二阶段：**MCP 的基础设施工具开始出现**。

- Colab CLI（昨天写了博客）让 Agent 能直接调用 GPU/TPU
- Colab MCP Server 让 Agent 通过 MCP 协议访问 Colab
- Aquifer 让 Agent 的流量有序化

这些工具的共同特点是：**它们不解决 Agent「能不能」的问题，而是解决 Agent「跑得好不好」的问题**。这是一个生态走向成熟的重要标志。

Aquifer 项目的名称取得很妙——**Aquifer** = 含水层，寓意像地下蓄水层一样吸收地表（Agent 请求）的洪流雨，然后稳定地释放到地下（后端服务）。这个隐喻精准地概括了它的核心价值。

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/rjpruitt16/aquifer |
| 安装方式 | `go install github.com/rjpruitt16/aquifer/cmd/aquifer@latest` |
| Docker 镜像 | `ghcr.io/rjpruitt16/aquifer` |
| 协议 | MIT |

## 总结

Aquifer 是一个定位精准的轻量 MCP 网关运行时，专门处理分布式 AI Agent 工具调用时的尖峰流量问题。它的核心设计——**持久队列 + 双协议接入 + 动态速率控制 + L8 无信任签名**——让一个二进制文件就能解决 Agent 流量治理中最棘手的几个问题。

虽然项目非常早期（v0.2.0，4 Stars），但其设计理念和解决的真实需求值得关注。如果你正在搭建 Agent 平台，或者维护被 Agent 高频调用的后端服务，可以把 Aquifer 加入你的工具箱观察。对于 Agent 基础设施这个正在快速成形的领域，像 Aquifer 这样的工具只会越来越多——早关注比晚关注好。

---

## 参考资料

- **GitHub 仓库**：项目源代码和完整 README。→ https://github.com/rjpruitt16/aquifer
- **Docker 镜像**：`ghcr.io/rjpruitt16/aquifer`
- **Go 包文档**：`pkg.go.dev/github.com/rjpruitt16/aquifer`
