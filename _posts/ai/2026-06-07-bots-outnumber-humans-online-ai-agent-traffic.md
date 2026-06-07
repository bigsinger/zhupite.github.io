---
layout: post
title: "机器人流量首次超过人类：互联网从未为今天设计"
categories: [ai]
description: "Cloudflare 报告显示 AI Agent 和爬虫已占互联网总流量的 51% 以上——互联网流量结构迎来了 45 年来最根本性的转变。这对网络安全、身份验证、API 防护和基础设施设计意味着什么。"
keywords: bots outnumber humans, AI agent traffic, Cloudflare, bot traffic 51%, non-human identity, internet security
tags:
  - AI Agent
  - Bot Traffic
  - Cloudflare
  - Internet Security
  - Non-Human Identity
  - API Security
  - Web Traffic
---

2026 年初夏，互联网走到了一个标志性节点：**机器人不再只是互联网的一部分，它们已经成为互联网的多数用户。**

Cloudflare 的最新报告显示，AI Agent、爬虫和各类自动化工具贡献的流量首次超过人类用户，占全球互联网总流量的 **51% 以上**。这个数字的含义远不止一份报告的数据——它意味着互联网的结构正在经历根本性的变化，而设计于上世纪 80 年代的互联网协议栈，从未为这个新世界准备过。

## 这 51% 从何而来

机器人和爬虫占据互联网流量并非新闻——过去二十年间，搜索爬虫、监控工具和自动化脚本一直占据着相当比例。但这次的不同在于 **增量来自 AI Agent**。

三个因素共同推动了这轮增长：

- **AI Agent 的大规模部署**：微软 Build 2026 上 Scout 的发布、Google 的 Gemma 4 12B 本地 Agent 方案、Meta 的 Business Agent Platform——主流科技巨头都在将 AI Agent 从演示工具变为实际运行在生产环境中的数字员工。这些 Agent 需要持续与后端 API、数据库和其他 Agent 通信。
- **Agent-to-Agent 通信的指数增长**：随着 DNS-AID、MCP 和 A2A 等协议走向标准化，Agent 之间的互联正在快速增长。一个 Agent 完成一项任务往往需要调用多个上游 Agent，产生远超过传统 API 调用的流量。
- **爬虫和监控工具的 AI 升级**：AI 训练需要在互联网上大规模抓取数据，新一代 AI 爬虫的请求量和频率远超传统搜索引擎爬虫。

结果是：互联网上活动的"非人类实体"数量已经超过了人类。而问题在于，**整个互联网的安全模型都是围绕着人类用户设计的**。

## 安全模型的根本冲突

传统的安全模型建立在几个隐含假设之上：

| 假设 | 当前实际情况 |
|------|------------|
| 用户具有有限的活动窗口（工作时间，8-12 小时/天） | Agent 7×24×365 运行，活动窗口无限制 |
| 用户有稳定的行为模式（IP、设备、时间段） | Agent 可以分布于任意 IP、任意设备、任意时间 |
| 用户通过 CAPTCHA 等方式可验证 | Agent 可以绕过或破解大多数验证机制 |
| 用户执行有限并发操作 | Agent 可发起数千个并行请求 |
| 身份绑定到具体自然人 | Agent 持有独立的 API 密钥和身份凭证 |

当 AI Agent 是流量主体时，基于"人类行为画像"的安全检测机制正在失效。**速率限制、异常 IP 检测、时段分析**——这些曾在 CSRF 和 DDoS 防护中行之有效的手段，在 Agent 流量面前变得越来越模糊。

Akamai 在 2026 年 1 月指出的"悬空 DNS"攻击面只是冰山一角：当 DNS 记录指向不再属于原所有者的资源时，AI Agent 会盲目地连接攻击者控制的端点。DNSSEC 可以解决记录伪造的问题，但更根本的问题是——**当前没有一个标准化的机制来区分"这是一个合法 Agent"和"这是一个恶意 Agent"。**

## 非人类身份（NHI）正在成为最被忽视的风险面

Forbes 文章的深层叙事在于 **非人类身份（Non-Human Identity, NHI）** 正在快速成为企业安全的核心盲区。

传统 IAM 系统管理的是员工账号、服务账号和机器身份。AI Agent 的出现模糊了这些分类的边界：

- Agent 需要访问 API、数据库和文件系统，但它不是服务账号
- Agent 可以执行的业务操作范围远超传统 API 的粒度
- Agent 的行为模式变化更快，因为它由 LLM 驱动，而不是固定的代码逻辑
- 一个受感染的 Agent 可以将恶意指令传递给与之通信的另一个 Agent

Gartner 在 2026 年的安全趋势报告中，将非人类身份管理列为最高优先级的安全投资方向。Ory（发布 Talos 锁定 AI Agent）、Offroad（获得 700 万美元种子轮，专注 AI 身份安全）、Radiant Logic（将身份可见性扩展到 AI Agent）——这些创业公司的出现说明，市场正在快速响应"Agent 身份"这个全新的安全域。

## 不只是安全问题：基础设施也在承受压力

Cisco 在 Computex 2026 期间发出了另一组警告：**AI Agent 之间的通信将导致网络流量激增，迫使企业进行基础设施升级。**

原因不难理解：如果一家企业部署了 100 个 AI Agent，每个 Agent 每小时执行数百次 API 调用、与几十个其他 Agent 通信，产生的流量模式与传统的人类办公网络完全不同。峰值流量不再是上班时的网页浏览，而是 Agent 之间的批量数据交换和模型调用。

传统 API 网关设计时假定调用者是受控的内部服务或已知的第三方。AI Agent 调用的来源、频率和目标都不遵循这些模式。

## 应对的四个方向

**1. 可验证的 Agent 身份标准**

DNS-AID（已在 Linux Foundation 下发布）使用 DNSSEC 签名的 SVCB 记录提供 Agent 的可验证身份。GoDaddy 正在推动的 Agent Name Service（ANS）从公钥基础设施层面解决 Agent 命名问题。这些标准为 Agent 提供了类似 TLS 证书的身份证明，但仍在早期阶段。

**2. 专用的 Agent 运行时隔离**

微软在 Build 2026 上发布执行容器（Execution Containers），为 AI Agent 提供操作系统级别的隔离环境。Cisco 发布了 Agent 内建安全框架。控制 Agent 能够访问什么、执行什么操作，比事后检测恶意行为更有效。

**3. 重新设计 API 安全策略**

Palo Alto Networks 指出，MCP 服务器正在成为"新的未管理 API"。传统的 API 安全策略需要针对 Agent 流量进行重新设计——在 API 网关层面识别和验证调用方 Agent，实施基于 Agent 身份的细粒度访问控制，而不仅仅是基于 API 密钥的粗粒度权限。

**4. 行为基线与异常检测**

对 Agent 建立行为基线——正常的调用频率、调用的 API 范围、处理的数据类型、与其他 Agent 的通信模式。当 Agent 行为偏离基线时触发告警。这需要 Agent 可观测性基础设施的支持。

## 回到起点

Forbes 文章的标题点出了核心：**"The Internet Was Never Built For This"**。互联网的协议栈——DNS、HTTP、TCP/IP——设计于人类通过浏览器访问网页的时代。AI Agent 的涌入不是这个系统的 bug，而是这个系统从未考虑过的使用场景。

现在需要的不是修补漏洞，而是**在一层新协议栈上为 Agent 设计基础身份、认证和安全机制**。DNS-AID、MCP、执行容器、NHI 治理——这些零散工作在 2026 年汇聚成了一个清晰的方向：互联网需要给 AI Agent 建一套专门的"基础设施身份"，就像它在 80 年代为人类建了一套 DNS 一样。

## 参考

1. *Bots Now Outnumber Humans Online And The Internet Was Never Built For This*. Forbes Tech Council, 2026-06-04. https://www.forbes.com/sites/forbestechcouncil/2026/06/04/bots-now-outnumber-humans-online/
2. *Cloudflare Reports Bots Surpass Human Web Traffic*. Let's Data Science. https://letsdatascience.com/cloudflare-bots-surpass-human-traffic/
3. *Building unique, per-customer defenses against advanced bot threats in the AI era*. Cloudflare Blog, 2026. https://blog.cloudflare.com/per-customer-bot-defenses/
4. *Why Non-Human Identities Have Become a Critical Security Challenge*. Security Boulevard / HackerNoon, 2026-06. https://securityboulevard.com/2026/06/non-human-identities-critical-security-challenge/
5. *A live operational risk: Why AI agents are outrunning your security*. TechRadar, 2026-06. https://www.techradar.com/pro/ai-agents-outrunning-security/
