---
layout: post
title: "DNS-AID：Linux Foundation 为 AI Agent 打造的 DNS 级服务发现标准"
categories: [ai]
description: "DNS-AID 在 Linux Foundation 下正式发布，利用 DNS SVCB 记录和 DNSSEC 为 AI Agent 提供去中心化的服务发现机制。本文详解其架构设计、安全模型与生态格局。"
keywords: DNS-AID, AI Agent, DNS, service discovery, Linux Foundation, DNSSEC, MCP, Infoblox, agent discovery
tags:
  - DNS-AID
  - AI Agent
  - DNS
  - Linux Foundation
  - Service Discovery
  - DNSSEC
  - MCP
  - Agent to Agent
---

当互联网本身已经在四十年前解决了大规模服务发现问题——靠着 DNS——为什么 AI Agent 还要各自搭建私有的发现机制？

这正是 **DNS-AID**（Domain Name System for AI Discovery）试图回答并解决的问题。5 月 27 日，Linux Foundation 正式将 DNS-AID 纳入管理，联合创始联盟包括 Cloudflare、GoDaddy、Equinix、Internet Systems Consortium（ISC）和 Infoblox 等行业巨头。三天后，Infoblox 就发布了第一个基于该标准的生产系统 Infoblox IQ。

## DNS-AID 要解决什么问题

AI Agent 之间的互联正在快速增长，但一个基础性的问题悬而未决：**Agent 如何找到另一个 Agent？**

当前的现状是：

| 方法 | 问题 |
|------|------|
| 硬编码 URL | 地址一变就断，无法弹性伸缩 |
| 私有注册中心 | 供应商锁定，跨平台互操作障碍 |
| 平台内置目录 | 平台 A 的 Agent 找不到平台 B 的 Agent |

Gartner 2026 年的预测指出：到 2030 年，**半数 AI Agent 部署失败**将源于治理不足和系统间互操作性断裂。NIST 也在 2026 年 2 月正式启动 AI Agent 标准倡议，将身份、安全和互操作性列为优先议题。DNS-AID 正是这场标准化运动的直接产物。

## 架构设计：用现成的 DNS 基础设施

DNS-AID 没有发明新的 DNS 记录类型，也不需要组织运行新的服务器。它是在现有标准之上定义了一套**命名约定**——核心是 RFC 9460 Service Binding（SVCB）记录。

### 命名规则

一个 Agent 在 DNS 中的地址格式为：

```
_<agent-name>._<protocol>._agents.<organization-domain>
```

例如，chatbot.example.com 上一个基于 MCP 的对话 Agent 将被发布为：

```
_chatbot._mcp._agents.example.com
```

### SVCB 记录承载的元数据

SVCB 记录包含发现方 Agent 所需的完整信息：
- 通信协议
- 服务端口
- 能力文档 URI（capability document）
- 能力文档完整性哈希
- 协议版本声明
- 治理策略 URL
- 租户范围标识符

当一个 Agent 需要找到另一个 Agent，只需发送一个标准的 DNS 查询——**不需要特殊客户端、不需要商业注册账户、不需要与目标域运营者预先建立关系**。

## 安全模型：DNSSEC + DANE 双层保障

安全性是 DNS-AID 设计的核心关切。原因很直接：Akamai 2026 年 1 月的一份分析指出，**"悬空 DNS"** 是 AI 部署中最被低估的攻击面之一——当 DNS 记录仍指向已不属于原所有者的云资源时，AI Agent 会盲目地连接到攻击者重新认领的端点。

DNS-AID 提供两重安全保障：

1. **DNSSEC（RFC 4033）**：对从 DNS 根到各 Agent 条目的整条记录链进行加密签名，发现方 Agent 可以密码学验证接收到的记录是真实的、未被篡改的
2. **DANE**（DNS-based Authentication of Named Entities）：将 TLS 证书绑定到 DNS 记录，即使攻击者拦截了连接，也无法在没有控制 DNS 区域的情况下出示有效证书

## 三种发现模式

DNS-AID 支持逐步递进的三种发现模式，对应不同的实际场景：

**直接查找（Direct Lookup）** — 按 Agent 名称直接查询端点。适用于已知道具体 Agent 名称的企业集成场景。

**能力查询（Capability-based Query）** — 在指定域上搜索提供特定功能的 Agent，无需知道具体名称。适用于运行时编排器，比如寻找能处理发票的 Agent。

**域索引遍历（Domain Index Crawl）** — 从已知入口点（域组织下的 `_index._agents` TXT 记录）拉取域内所有已发布 Agent 的完整目录。适用于开发者审计域中暴露了哪些 Agent。

## 生态格局与互补标准

DNS-AID 在 Agent 互联协议栈中处于特定的层级位置：

```
应用层：MCP（Anthropic）— 工具与数据连接
         A2A（Google）  — Agent 间任务协作
         ↓
发现层：DNS-AID — Agent 定位与端点解析
         ↓
基础层：DNS 基础设施 — 全球分布、缓存、联邦治理
```

DNS-AID **不取代** MCP 和 A2A——它是下面那层。SVCB 记录声明目标 Agent 使用哪种协议（MCP、A2A、HTTPS），发现方连接后自动调用对应的协议。

### 竞争与共存

当前 Agent 发现领域的多个方案各有所长：

| 方案 | 方式 | 设计哲学 |
|------|------|---------|
| DNS-AID | SVCB 记录 + DNSSEC | 联邦化、去中心化，继承 DNS 生态 |
| Google A2A Agent Card | `.well-known/agent-card.json` | HTTP 可爬取，简单直接 |
| Microsoft Entra Agent ID | 托管企业目录 | 集中化管控，适合 Azure 生态 |
| 中央 MCP Registry | 单一目录文件 | 集中控制，部署简单 |

DNS-AID 的核心主张是：其他方案都没有继承 DNS 在互联网规模上成功的那些关键特性——**每个解析器中的全球部署、内置缓存自动负载分担、每个域运营者自主控制区域的联邦治理模型、数十年的运营安全实践**。

Verisign 在 2026 年 6 月 1 日发表的 arXiv 论文也独立得出了相同结论：DNS 是 AI Agent 可发现性的正确基础，因为它已经为整个全球互联网处理了名称、身份验证、服务端点和安全状态机制。

## 参考实现与可用性

DNS-AID 在 Linux Foundation 治理下提供完整的参考实现：
- **Python SDK**：集成到现有项目
- **CLI 工具**：命令行管理 Agent 记录
- **MCP 服务器**：与 Anthropic MCP 生态兼容

支持 8 个 DNS 提供商后端：Amazon Route 53、Cloudflare、Infoblox NIOS、Infoblox Universal DDI、Azure DNS、Google Cloud DNS、NS1，以及本地开发用的 BIND9 自托管。Docker Compose 支持开发者在不触及生产 DNS 的情况下测试全栈。

IETF 草案 `draft-mozleywilliams-dnsop-dnsaid-02`（2026 年 5 月 27 日）的贡献者来自 Deutsche Telekom 和 Amazon。GoDaddy 还在同步推进一个互补的 IETF 草案 Agent Name Service（ANS）——ANS 处理 Agent 身份和命名（公钥基础设施），DNS-AID 处理能力发现和端点解析，两者设计为组合使用。

## AI Agent 互联的「DNS 时刻」

DNS-AID 的深远意义在于阻止一种未来：每家 AI 平台运营自己的 Agent 注册中心，复制过去二十年移动计算的「应用商店」动态——平台 A 的 Agent 无法找到平台 B 的 Agent，除非通过商业中介的目录。

建立在开放、联邦化标准之上的 Agent 发现，是 AI Agent 生态走向真正互操作的关键一步。如 Linux Foundation CEO Jim Zemlin 所言：**"AI Agent 正在快速成为现代互联网的连接组织，但没有安全、开放的发现基础设施，这种连接就会变成一种负担。"**

## 参考

1. Adrian Parham. *AI Agent Discovery Gets Open DNS Standard: DNS-AID Launches Under Linux Foundation*. Tech Times, 2026-06-06. https://www.techtimes.com/articles/317904/20260606/ai-agent-discovery-gets-open-dns-standard-dns-aid-launches-under-linux.htm
2. Linux Foundation. *Linux Foundation Announces DNS-AID Project to Advance Decentralized AI Agent Discovery*. 2026-05-27. https://www.linuxfoundation.org/press/linux-foundation-announces-dns-aid-project-to-advance-decentralized-ai-agent-discovery
3. DNS-AID 官方网站. https://dns-aid.org/
4. DNS-AID GitHub 仓库. https://github.com/dns-aid
5. IETF Draft. *draft-mozleywilliams-dnsop-dnsaid-02*. 2026-05-27.
