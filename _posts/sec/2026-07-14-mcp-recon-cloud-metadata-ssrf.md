---
layout: post
title: "MCP 侦察正在升级：公开服务器、AI 配置文件与云元数据 SSRF 同时暴露"
categories: [sec]
description: "综合 GBHackers 与 CyberPress 对同一轮互联网扫描的报道：攻击者正在大规模探测公开 MCP 服务器、AI 助手配置文件和本地 LLM 端点，并尝试通过 SSRF 触达云元数据服务以窃取服务账户令牌。"
tags:
  - MCP
  - SSRF
  - 云元数据
  - AI Agent
  - 供应链风险
---

## 一句话结论

两篇报道共同指向同一个趋势：**攻击者已经把 MCP 服务器、AI 助手配置文件和本地 LLM 端点纳入常规互联网侦察面**。更危险的是，这类扫描并不止于发现服务存在，还会进一步尝试 **SSRF 触达云元数据服务**，以窃取服务账户令牌并接入更深层的云资源。

## 发生了什么

GBHackers 和 CyberPress 报道的其实是同一类扫描活动：研究者从一组 Apache 与 ModSecurity 日志中观察到，攻击者在两周内反复探测：

- 公开 MCP 服务器
- `/.claude/`、`/.cursor/`、`/.vscode/` 等 AI 助手配置文件
- OpenAI 兼容接口和 Ollama 端点
- `/mcp`、`/sse` 这类 MCP 协议入口
- Google Cloud 元数据服务 `metadata.google.internal`

这说明攻击者不再只盯传统 Web 漏洞，而是在把 **AI 工作流基础设施** 一并纳入扫描字典。

## 两类高危动作

### 1. MCP 服务器枚举

攻击者发送的是协议感知型请求，而不是盲扫：

- `POST /mcp`，带正确结构的 JSON-RPC `initialize` 调用
- `GET /sse`，探测旧式 MCP transport
- 继续尝试发现工具、资源、prompt 和后端连接能力

这类请求的目的不是“看看页面在不在”，而是确认目标是否真的是一个可交互的 MCP 服务。一旦 MCP 暴露且未鉴权，攻击者就可能枚举可用工具并追踪到数据库、文件系统、内部 API 或云服务。

### 2. SSRF 直指云元数据

更危险的是，报道中同时出现了指向云元数据服务的 SSRF 载荷。常见参数包括：

- `url`
- `uri`
- `path`
- `dest`

目标则是 `metadata.google.internal` 以及 `169.254.169.254` 一类链接本地地址。

这意味着，攻击者可能在寻找一个能替他们“替服务器发请求”的入口。一旦成功，GCP、AWS、Azure 的实例元数据服务都可能变成服务账户令牌泄露点。

## 这为什么特别危险

MCP 的设计目标是把 LLM 应用接到外部工具和数据源上。它的价值正来自“机器可读的工具入口”。但这也意味着：

| 能力 | 正常用途 | 被滥用时 |
|------|----------|---------|
| 工具发现 | 让 Agent 自动识别可用能力 | 攻击者枚举攻击面 |
| 配置文件读取 | 帮助开发者调试集成 | 泄露 API key、连接地址、MCP 服务器路径 |
| URL fetch / webhook | 调用外部资源 | SSRF 触达内网和云元数据 |
| 本地 LLM 端点 | 自托管推理 | 变成可被滥用的免费模型服务 |

也就是说，MCP 并不是单独一个漏洞点，而是把 **工具调用、配置暴露和外联能力** 统一放进了一个更容易被自动化攻击的入口。

## 日志里看到的“AI 侦察字典”

两篇报道都提到，攻击者在寻找：

- `/.claude/mcp.json`
- `/.cursor/mcp.json`
- `/.cursor/mcp_config.json`
- `/.vscode/mcp.json`
- `/.mcp/config.json`
- `v1/models`
- `api/tags`

这说明攻击者不只是在扫公开 MCP 服务，还在找**开发者本地的 AI 配置痕迹**。如果这些路径被误部署到 Web 根目录，或者被打包进镜像与备份，攻击者就可能顺藤摸瓜拿到：

- MCP 服务地址
- 本地开发凭据
- API token
- 云连接信息

## 影响评估

### 对企业的直接影响

1. **公开 MCP 服务必须默认视为被扫描**
   - 不要假设“没人知道我的 /mcp 路径”
   - 攻击者已经把它写进侦察字典了

2. **AI 助手配置文件不能落在 Web 可访问路径下**
   - `.claude`、`.cursor`、`.vscode`、`.mcp` 必须严格隔离

3. **任何 fetch 型工具都要防 SSRF**
   - link-local、loopback、private range、metadata endpoint 一律拒绝
   - 重定向后也要重新校验

4. **云实例必须最小权限**
   - 一旦元数据服务被打到，弱权限 service account 也可能把攻击范围扩大

### 对 Agent 安全生态的影响

这类扫描说明一个事实：

> **MCP 服务器已经从“集成组件”升级为“攻击面中心”**。

如果企业在生产中使用 Agent、MCP 和本地 LLM 服务，那么最先要做的不是加功能，而是补最基础的暴露面治理：鉴权、白名单、元数据隔离、配置目录封锁、日志告警。

## 防护建议

### 1. 立即盘点暴露面

搜索日志和边界设备，重点看：

- `POST /mcp`
- `GET /sse`
- `/.claude/`
- `/.cursor/`
- `/.vscode/`
- `/.mcp/`
- `/v1/models`
- `/api/tags`
- `metadata.google.internal`
- `169.254.169.254`

### 2. 强制鉴权与最小权限

- 公网 MCP 服务器必须要求认证
- 每个工具单独做授权，不要一把钥匙开所有门
- 运行 MCP 的服务账号使用最小权限

### 3. 限制外联

所有 URL fetch 型工具都应：

- 只允许白名单域名
- 禁止访问 link-local / private / loopback 地址
- 对重定向后的目标再次校验
- 记录请求链路和最终解析地址

### 4. 把 AI 配置视为高敏资产

开发者和运维常见误区是把 `.claude`、`.cursor` 当普通配置看待。实际上它们和 `.env`、`credentials.json` 一样敏感。

## 我的判断

这两篇报道的价值在于，它们把一个抽象趋势变成了可操作的安全信号：

- 攻击者开始**协议感知**地侦察 MCP；
- 攻击者开始**目录感知**地寻找 AI 开发配置；
- 攻击者开始**云原生感知**地用 SSRF 打元数据。

这不是未来时，而是正在发生的现实。

对防守方来说，MCP 不是“一个协议”，而是一整类需要纳入攻防清单的新暴露面。谁还把它当作普通集成层，谁就会被当作默认可扫、默认可打的目标。

## 参考资料

- [GBHackers：Attackers Combine MCP Recon With Cloud Metadata SSRF to Steal Service Account Tokens](https://gbhackers.com/mcp-recon-with-cloud-metadata-ssrf/)
- [CyberPress：Hackers Scan for Exposed MCP Servers, AI Assistant Credentials, and Unauthenticated LLM Endpoints](https://cyberpress.org/hackers-scan-exposed-ai/)
- [Tracebit / Tracebit Context Bombs](https://agentic.tracebit.com/context-bombs/)
- [MCP 官方站点](https://modelcontextprotocol.io/)
