---
layout: post
title: "Higress 调研：把 AI Gateway、MCP 托管与安全治理收口到同一个入口"
categories: [sec]
description: "基于 Higress GitHub 仓库与 README 的调研，梳理这款 AI Native API Gateway 如何同时承载 LLM API、MCP Server、Ingress、微服务与安全网关能力，并分析它在 Agent 时代的网关与治理价值。"
tags:
  - Higress
  - AI Gateway
  - MCP
  - API Gateway
  - Agent 安全
---

## 一句话结论

Higress 不是一个“普通网关加 AI 插件”，而是一个已经把 **AI Gateway、MCP 托管、流量治理和安全控制**放进同一架构里的开源网关项目。它的价值在 Agent 时代尤其明显：既能统一管理 LLM API，又能托管 MCP Server，还能在入口层做认证、鉴权、限流、审计和观测。

## 我先给结论

如果你要评估一个面向企业的 Agent 入口层，Higress 很像一个现实可落地的候选项：

- 它有成熟的 API Gateway 底座；
- 有 AI Gateway 能力；
- 明确支持 MCP Server 托管；
- 可以通过 Wasm 插件扩展；
- 能把工具调用、模型调用和安全策略统一收口。

这意味着它不是单点“AI 插件”，而是一个可以放进企业网关体系、身份体系和审计体系里的中枢。

## 项目概览

| 维度 | 信息 |
|------|------|
| 仓库 | `higress-group/higress` |
| 项目定位 | AI Native API Gateway |
| 语言 | Go |
| 许可证 | Apache-2.0 |
| Star 数 | 8,866 |
| Fork 数 | 1,193 |
| 默认分支 | `main` |
| 最近更新 | 2026-07-16 |
| 相关仓库 | `openapi-to-mcpserver`、`higress-console`、`higress-standalone`、`plugin-server` |

Higress 的 README 里直接写明，它基于 Istio 和 Envoy，可以用 Go/Rust/JS 编写 Wasm 插件，并提供控制台、AI Gateway、MCP Server 托管、Ingress Gateway、微服务网关和安全防护网关能力。

## 它为什么值得研究

### 1. 它把 AI Gateway 和 MCP 放到了同一个入口层

这是 Higress 最值得关注的地方。README 里明确说，它支持：

- 主流 LLM provider；
- 本地自建模型（如 vLLM、Ollama）；
- 通过插件方式托管 MCP Server；
- 对 LLM API 与 MCP API 做统一管理。

这意味着企业不需要把“模型调用”和“工具调用”拆成完全独立的治理链，而可以在同一层做：

- 认证
- 鉴权
- 限流
- 观测
- 审计
- 动态更新

### 2. 它不是纸面概念，MCP 能力已经进到代码里

我在仓库里核验到多个和 MCP 直接相关的实现文件：

- `pkg/ingress/kube/annotations/mcpserver.go`
- `pkg/ingress/kube/annotations/mcpserver_test.go`
- `api/networking/v1/mcp_bridge.proto`
- `api/networking/v1/mcp_bridge.pb.go`

这说明 MCP 不是 README 营销语，而是已经进入配置和控制面模型。

### 3. 它有清晰的插件化治理方式

Higress 的核心扩展方式是 Wasm 插件。README 里强调：

- 可用 Go/Rust/JS 写插件；
- 插件可独立升级；
- 支持流量无损热更新；
- 适合在入口层叠加安全逻辑。

这对 Agent 场景很重要，因为 Agent 入口常常需要比普通 API 网关更多的策略：

- 哪些 MCP server 可以访问；
- 哪些模型可以调用；
- 哪些工具调用需要审批；
- 哪些请求要记录审计；
- 哪些路径要限流或阻断。

## 代码层面能看到什么

### 1. MCP Server 的入口是可配置的

在 `pkg/ingress/kube/annotations/mcpserver.go` 里，Higress 通过注解解析 MCP Server 配置。关键字段包括：

- `mcp-server`
- `mcp-server-match-rule-domains`
- `mcp-server-match-rule-type`
- `mcp-server-match-rule-value`
- `mcp-server-upstream-type`
- `mcp-server-enable-path-rewrite`
- `mcp-server-path-rewrite-prefix`

它会把这些配置汇总进 `globalContext.McpServers`，说明 MCP Server 已经被纳入网关编排对象，而不是临时脚本。

### 2. McpBridge 是一等公民

`api/networking/v1/mcp_bridge.proto` 定义了 `McpBridge`、`RegistryConfig`、`ProxyConfig` 等消息体。这里能看到：

- registry 类型；
- 域名和端口；
- Nacos / Consul / ZK / SNI / protocol 等参数；
- `enableMCPServer`、`allowMcpServers`、`mcpServerBaseUrl` 等字段；
- 与传统服务发现和 MCP 托管的组合。

这说明 Higress 的 MCP 设计不是“只托管一个 server”，而是围绕注册、代理、发现和控制平面来构建的。

### 3. AI provider 目录说明它是多模型统一入口

仓库中的 `plugins/wasm-go/extensions/ai-proxy/provider` 目录包含大量模型适配：

- OpenAI
- Azure
- Bedrock
- Claude
- Gemini
- DeepSeek
- Qwen
- Ollama
- vLLM
- ZhipuAI
- 其他国内外 provider

这说明 Higress 不只是面向一个模型厂商，而是面向多供应商、多部署形态的统一 AI 流量层。

## 对 Agent 安全的意义

Higress 的价值，放在 Agent 时代可以概括成四个词：

### 1. 统一入口

把模型调用和工具调用收口到同一网关，避免 Agent 直连每个后端。

### 2. 统一治理

用同一套网关能力做：

- authn / authz
- token rate limit
- audit log
- observability
- traffic policy

### 3. 统一扩展

通过 Wasm 插件给 Agent 入口增加额外安全逻辑，而不需要改每个后端服务。

### 4. 统一落地

Higress 既能跑在 Docker，也能进 K8s，还能做企业版部署。这让它比很多“只停留在 demo 阶段”的 AI 网关更容易进入生产。

## 和 openapi-to-mcpserver 的关系

Higress README 里还明确推荐了 `openapi-to-mcpserver`。我也核验了那个仓库：它是一个把 OpenAPI 文档快速转换为 Higress 远程 MCP Server 配置的工具。

这条链路很有意思：

```text
OpenAPI → MCP Server → Higress 统一托管与治理 → AI Agent 调用
```

这意味着企业可以把已有 API 资产相对平滑地纳入 Agent 时代，而不是重新从头改造后端。

## 我怎么看

如果只看名字，Higress 像一个 API Gateway 项目；但如果看 README、目录结构和代码，Higress 更像一个 **Agent 入口基础设施平台**：

- 对 LLM，它是 AI Gateway；
- 对工具，它是 MCP 托管层；
- 对企业，它是统一认证、限流、审计和观测层；
- 对开发者，它是可扩展的 Wasm 插件平台。

这类项目在 Agent 时代的意义会越来越大，因为企业最缺的不是一个“会回答问题的模型”，而是一个能把模型、工具、身份和策略统一起来的入口。

## 适合什么团队

Higress 很适合以下团队重点研究：

- 已经在做 AI Gateway 的平台团队；
- 想托管 MCP Server 的 Agent 团队；
- 需要统一模型路由、限流和审计的企业；
- 想把 Agent 纳入既有 API Gateway / IAM / SIEM 体系的安全团队。

## 参考资料

- [Higress GitHub 仓库](https://github.com/higress-group/higress)
- [Higress 官方站点](https://higress.cn/)
- [Higress MCP 快速开始](https://higress.cn/ai/mcp-quick-start/)
- [openapi-to-mcpserver](https://github.com/higress-group/openapi-to-mcpserver)
