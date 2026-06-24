---
layout: post
title: "Linux Foundation 宣布 Agent Name Service：DNS 不是只给网站用的"
categories: [sec]
description: "Agent Name Service 将互联网的 DNS 基础设施扩展到 AI Agent 身份管理，为每个 Agent 分配可验证的数字身份。基于开放标准，得到 Cloudflare、GoDaddy、Salesforce、Cisco 等支持。"
tags:
  - Agent 身份
  - DNS
  - 开放标准
  - Linux Foundation
  - 基础设施
---

Linux Foundation 于 2026 年 6 月 23 日宣布，将发起 **Agent Name Service（ANS）**——一个新的开放标准，旨在为互联网上的 AI Agent 提供可信的身份、验证和发现机制。

这不是一个全新的网络协议。ANS 直接构建在 **DNS（域名系统）** 之上——那个每天处理超过 1 亿次查询、支撑整个互联网运转的全球分布式基础设施。

## 解决的问题

AI Agent 正从实验走向生产系统。Capgemini 的数据显示，**82% 的高管计划在未来 1-3 年内采用 AI Agent**，但围绕如何安全地评估和管理自主系统存在广泛不确定性。

Agent 之间交互时，一个根本问题悬而未决：**我怎么知道对方是谁？**

当一个 Agent 调用了另一个 Agent，或者说一个 Agent 请求访问某个系统，如何确认它的身份真实、权限合法、代码未被篡改？目前没有通用的解决方案，各个平台各有各的围墙花园。

ANS 想解决的就是这个——**基于开放标准、去中心化、可互操作**的 Agent 身份基础设施。

## 技术方案：DNS 扩展

ANS 不引入新的查找网络或专有生态系统。它把 Agent 身份锚定到 DNS：

- Agent 可以被分配一个唯一的标识，像域名一样通过 DNS 解析
- 查询方可验证 Agent 代表谁、有什么权限、代码和操作历史是否真实完整
- 支持 **去中心化标识符（DID）** 和 **法律实体标识符（LEI）**，允许组织将现有身份系统集成到统一的验证模型中

Linux Foundation CEO Jim Zemlin 在公告中说：「AI Agent 将越来越多地跨企业、跨平台、跨数字服务运作，可信身份基础设施是基础性需求。通过构建在 DNS 和开放标准之上，ANS 为全球数字经济中的 Agent 通信提供了一个可扩展、可互操作的框架。」

GoDaddy 首席战略官 Jared Sine 补充：「互联网的成功不是来自专有系统——而是来自开放标准、共享基础设施和致力于协作的生态系统。ANS 建立在已证明的互联网基础之上，为 Agent 在开放网络中被识别和发现创造了路径。」

## 生态支持

ANS 得到了从基础设施到企业平台的广泛支持：

| 组织 | 代表 | 表态要点 |
|------|------|---------|
| Cloudflare | CTO Dane Knecht | DNS 是网络信任的基石，扩展给 Agent 是可行的路径 |
| GoDaddy | CSO Jared Sine | 开放标准让 Agent 在开放网络中被识别和发现 |
| Salesforce | President Srini Tallapragada | 身份对 Agent 跨开放网络运作至关重要 |
| Cisco | SVP Nathan Jokel | 价值在生态开放时才会放大 |
| Infoblox | CLO Wei Chen | DNS 是已有 40 年的信任层，ANS 是最高效的路径 |
| DistributedApps.ai | CEO Ken Huang | LF 的治理模式确保没有单一实体能损害 Agent 发现的完整性 |
| Hashgraph Online | President Michael Kantor | 共享标准让 Agent 跨协议和生态系统移动 |

ANS 相关技术仓库已可在 GitHub 上找到：[github.com/agentnameservice](https://github.com/agentnameservice)

## 意义

**一个关键洞察**：互联网已有的信任基础设施（DNS）已经解决了大规模分布式系统中的身份解析问题——每秒处理数亿次查询、支持数十亿设备。Agent 身份面临的核心挑战（发现、验证、互操作）在架构上与 DNS 解决的问题是同类问题。

ANS 不是要重建这些能力，而是扩展它们的适用范围。这与 Linux Foundation 已有的 B 件——Kubernetes、MCP、OpenSSF、SPDX——形成一致的方法论：**共享的基础设施比孤立的解决方案更持久。**

对组织来说，这意味着未来 Agent 的信任验证不需要依赖平台厂商的专有注册表，而可以基于已有的域名体系。如果你拥有一个域名，你可以在这个域名下为自己的 Agent 签发身份。

> 原文：[Linux Foundation Announces Intent to Launch Agent Name Service](https://www.prnewswire.com/news-releases/linux-foundation-announces-intent-to-launch-agent-name-service-to-establish-trusted-identity-infrastructure-for-ai-agents-302807317.html)

**GitHub 组织**：[https://github.com/agentnameservice](https://github.com/agentnameservice)  
**Linux Foundation**：[https://www.linuxfoundation.org/](https://www.linuxfoundation.org/)

> 本文基于 PRNewswire 新闻稿编写。ANS 项目处于宣布阶段，技术细节和贡献指南将在后续发布。
