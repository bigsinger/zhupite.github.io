---
categories: [sec]
title: Cloudflare 发布系列工具构建可信 Agent 互联网
description: Cloudflare 发布系列新工具为 Agentic AI 构建统一的信任和安全基础设施，涵盖 Agent 身份验证、API 访问控制、沙箱执行和异常流量检测。继 4 月 Agents Week 后，Cloudflare 持续扩展 Mesh、沙箱和身份层能力，标志着 CDN/安全巨头正式进入 Agent 安全市场。
tags: [Cloudflare, Agent 安全, 可信互联网, Mesh, 沙箱, 身份验证, 零信任]
---

## 一句话结论

Cloudflare 发布了一系列新工具，旨在为 Agentic AI 构建**统一的信任和安全基础设施**。这些工具涵盖 Agent 身份验证、API 访问控制、沙箱执行环境和 Agent 流量异常检测，标志着 CDN/安全基础设施巨头正式进入 Agent 安全市场。Cloudflare 的入场将加速 Agent 安全基础设施建设，为企业提供网络层的 Agent 流量可见性和控制能力——其全球网络优势是纯软件安全厂商难以匹敌的。

> **来源说明**：原文 digital terminal URL 经 Google News RSS 确认。由于访问频率限制，本文综合 Cloudflare 官方博客的多个相关公告（Agents Week 2026、Cloudflare Mesh、Sandboxing AI Agents、Cloudflare One Stack 等）成文。

## Cloudflare 的 Agent 安全布局时间线

| 时间 | 事件 |
|------|------|
| **2026 年 4 月** | Agents Week——发布多项 Agent 基础设施产品 |
| **4 月** | Cloudflare Mesh 发布——用户、节点、Agent、Worker 的私有网络 |
| **4 月** | Cloudflare + Anthropic——Claude Managed Agents 的安全沙箱 |
| **4 月** | 沙箱认证——动态、身份感知的安全沙箱认证 |
| **4 月** | 按目的区分 AI 爬虫，开启直接收费模式 |
| **6 月** | Cloudflare One Stack——Agent 驱动的部署 |
| **6 月** | Monetization Gateway——x402 协议为 Agent 资源收费 |
| **7 月** | 新一轮 Agent 信任工具发布（本文报道） |

## 核心工具

### 1. Agent 身份验证

Cloudflare 利用其全球网络基础设施，为 Agent 提供统一的身份层：

- **Agent 身份注册**：每个 Agent 在 Cloudflare 网络上获得唯一身份标识
- **动态认证**：Agent 连接时实时验证身份，无需静态 API 密钥
- **与 Workers 集成**：Cloudflare Workers 作为 Agent 的执行环境，自带身份验证

### 2. API 访问控制

Agent 的核心交互方式是 API 调用。Cloudflare 将 API 安全能力延伸至 Agent 场景：

- **Agent 级别 API 速率限制**——基于 Agent 身份而非 IP
- **工具调用审计**——每次 Agent 的 API 调用可追溯
- **最小权限 API 代理**——Agent 只能调用其被授权访问的 API 端点
- **MCP 协议支持**——Cloudflare 已实现 Agent 与工具之间的安全 MCP 通信

### 3. Agent 沙箱执行

Cloudflare 与 Anthropic 合作，将 Claude Managed Agents 运行在 Cloudflare 的 Workers 沙箱中：

- **100x 更快**的沙箱启动速度（对比传统容器）
- **隔离的执行环境**——每个 Agent 在独立的 Worker 实例中运行
- **沙箱认证**——动态、身份感知的认证机制
- **资源配额**——CPU、内存、网络严格限制

### 4. Agent 流量异常检测

利用 Cloudflare 的全球网络可见性：

- 基于正常 Agent 通信模式的 **行为基线**
- 检测 Agent 向非预期目的地的**数据外传**
- 识别 Agent 通信中的**异常模式**（如高频调用特定 API）

## 关键产品：Cloudflare Mesh

Cloudflare Mesh 是为 Agent 世界设计的私有网络基础设施：

> "为所有人提供安全的私有网络——用户、节点、Agent、Worker。"

Mesh 的核心创新在于将**零信任网络访问**（ZTNA）从人类用户扩展到 AI Agent：

- Agent 作为第一类网络实体
- 每个 Agent 有独立身份和访问策略
- 所有 Agent 通信经过加密、认证和审计
- 无需 VPN——Agent 通过 Cloudflare 边缘网络直接连接受保护的资源

## 行业意义

### 1. 网络基础设施厂商的入场

Cloudflare 的布局意味着 Agent 安全不再只是安全初创公司和小众开源项目的领域。作为全球最大的 CDN 和安全网络之一，Cloudflare 可以：

- 在网络层**观察**所有 Agent 流量（它已经能看到的 HTTP/API 流量）
- 在网络层**阻断**恶意 Agent 通信
- 提供**即插即用**的 Agent 安全，无需企业安装额外代理

### 2. 与安全厂商的差异化竞争

| 维度 | Cloudflare | 安全初创公司 | 开源工具 |
|------|-----------|-------------|---------|
| **覆盖层** | 网络层 + 应用层 | 应用层 | 应用层 |
| **部署方式** | DNS 代理/边缘网络 | Agent/库 | CLI/自托管 |
| **流量可见性** | 全局流量可见 | 有限 | 无 |
| **规模** | 全球边缘网络 | 单个实例 | 无 |

### 3. Agent 身份的标准化

Cloudflare 对 Agent 身份的支持，加上与 GoDaddy 的合作伙伴关系（"开放 Agent 网络"），可能推动 Agent 身份标识成为互联网基础设施的一部分——就像 TLS 证书对网站身份所做的那样。

## 参考

- digital terminal（原文，待获取全文）：[Cloudflare Releases New Tools to Build Trusted Agent Internet](https://www.digitalterminal.com)（2026-07-06）
- Cloudflare 博客：[Secure private networking for everyone: users, nodes, agents, Workers — introducing Cloudflare Mesh](https://blog.cloudflare.com)（2026-04-20）
- Cloudflare 博客：[Sandboxing AI agents, 100x faster](https://blog.cloudflare.com)（2026-04-07）
- Cloudflare 博客：[Dynamic, identity-aware, and secure Sandbox auth](https://blog.cloudflare.com)（2026-04-12）
- Cloudflare 博客：[Cloudflare Brings Secure, Scalable Sandboxes to Claude Managed Agents](https://blog.cloudflare.com)（2026-04-13）
- Cloudflare 博客：[Introducing the Cloudflare One stack — agent-powered deployment](https://blog.cloudflare.com)（2026-06-16）
- Cloudflare 博客：[Cloudflare and GoDaddy Partner to Help Enable an Open Agentic Web](https://blog.cloudflare.com)（2026-03-24）
