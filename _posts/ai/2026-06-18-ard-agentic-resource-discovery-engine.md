---
layout: post
title: "AI Agent 有了自己的「搜索引擎」：ARD 协议让 Agent 自主发现工具和资源"
categories: [ai]
description: "Google、Microsoft、NVIDIA、GitHub 等 11 家巨头联合发布 Agentic Resource Discovery（ARD）协议，让 AI Agent 能像人类用搜索引擎找网页一样，自主发现可调用的工具、技能和其他 Agent。架构采用「目录（Catalog）+ 注册中心（Registry）」模型，域名所有权充当信任锚点。OpenAI 和 Anthropic 未参与。"
tags:
  - ARD
  - Agentic Resource Discovery
  - AI Agent
  - MCP
  - 协议标准
  - Google
  - Microsoft
  - GitHub
---

## 新闻核心

AI Agent 正在获得自己的"搜索引擎"。

Google、Microsoft、GoDaddy、Hugging Face、NVIDIA、Salesforce、ServiceNow、Databricks、Snowflake、GitHub 和 Cisco——11 家平时互为竞争对手的科技巨头——联合发布了一项名为 **Agentic Resource Discovery（ARD）** 的新标准。

ZDNet 以《AI agents are getting their own search engine》为题报道了这一事件。

> *"就像开放网络使信息民主化一样，ARD 正在使 AI 资源发现民主化。"*——Google 官方博客

---

## 背景：为什么 Agent 需要自己的搜索引擎

2024 年，Anthropic 推出了 **MCP（Model Context Protocol）**，标准化了 AI Agent 与外部数据源之间的通信协议。MCP 解决了"Agent 如何与服务器对话"的问题——就像 HTTP 标准化了浏览器与网站之间的通信。

但 MCP 没有解决的问题是：**Agent 怎么知道有哪些工具和服务可以用？**

ZDNet 的比喻非常到位：

> MCP 让开发 App 成为可能。但在没有 App Store 之前，用户很难找到和使用这些 App。ARD，通俗来讲，就是**那个 App Store**。

Microsoft 技术院士 Ramanathan Guha 的表述更直接：

> *"AI 的能力受限于它被连接了什么。AI 只能使用明确连接到它的东西，其他的一切就像不存在一样。"*

目前的情况是：每个 Agent 只能使用被"显式配置"给它的工具。如果某个部门的 Agent 不知道另一个部门有可用的数据分析服务，那这个服务对它来说就像不存在一样。

**ARD 要解决的就是这个信息差。** 它是专为 AI Agent 设计的资源发现协议——Agent 的"搜索引擎"。

---

## ARD 技术架构

### 两大核心组件

ARD 采用**目录（Catalog）+ 注册中心（Registry）**的架构模型：

| 组件 | 类比 | 说明 |
|------|------|------|
| **Catalog（目录）** | 🌐 网页 | 组织在自己的域名下托管 `ai-catalog.json` 文件，描述自己提供的能力和工具 |
| **Registry（注册中心）** | 🔍 搜索引擎 | 爬取 Catalog、建立索引，Agent 查询时返回匹配的能力和元数据 |

**工作流程**：

```
组织 A 发布 ai-catalog.json → Registry 爬取并索引 → Agent 查询 Registry → 
获得匹配结果 → 验证发布者身份 → 连接工具并执行
```

### 信任模型

一个关键问题是：**如果 Agent 能自主发现和使用工具，如何防止恶意工具被调用？**

ARD 的信任模型基于**域名所有权**：

- 一个 Catalog 托管在 `microsoft.com` 上，其可信度由域名所有权担保
- 架构层次**模拟 DNS**，而非传统的 Web 搜索引擎
- 在生产环境中支持加密信任元数据、Agent 身份、信任清单和出口策略

Google 指出，企业级控制还涵盖：Agent Identity、Trust Manifests、Egress Policies 和 Pinned Endpoints。

### 与 MCP 的关系

| 协议 | 解决什么问题 | 类比 |
|------|------------|------|
| **MCP** | Agent 如何与工具通信 | HTTP 协议 |
| **ARD** | Agent 如何发现可用工具 | Google 搜索引擎 |

两者是互补关系，不是替代关系。ARD 处在 MCP 的"上游"——它帮助 Agent 决定调用哪个工具，然后通过 MCP 完成调用。

---

## 首批实现

| 平台 | 产品 | 说明 |
|------|------|------|
| **GitHub** | Agent Finder | 基于 ARD 构建，让 Copilot 能在运行时从公开或私有 Registry 中发现和调用 MCP 服务器、技能、工具和 Agent |
| **Hugging Face** | Discover Tool | ARD 参考实现，提供语义搜索，可搜索"数千个技能和 MCP 服务器" |
| **Google** | Agent Registry（Gemini Enterprise） | 内置于 Gemini Enterprise Agent 平台，原生 ARD 支持将在"未来几个月"上线 |

ARD 规范以 **Apache 2.0** 许可证开放，基于 Linux Foundation 工作组开发的 AI Catalog 数据模型。规范地址：AgenticResourceDiscovery.org。

---

## 参与者与缺席者

这份名单本身就值得玩味：

**✅ 参与方**：Google、Microsoft、GoDaddy、Hugging Face、NVIDIA、Salesforce、ServiceNow、Databricks、Snowflake、GitHub、Cisco

**❌ 未参与**：OpenAI、Anthropic

OpenAI 和 Anthropic 的缺席可能意味着两件事：
- 它们可能有自己的 Agent 资源发现方案（生态锁定策略）
- 或者它们认为 ARD 的信任模型还不够成熟，暂时观望

无论哪种解释，这个"缺席"本身就是一个信号。

---

## 安全担忧

文章也坦诚指出了安全风险：

1. **攻击面扩大**：如果 Agent 能自动发现和调用工具，攻击者就有新的理由去攻击域名、部署流水线和 Catalog 文件
2. **高价值目标**：一个成功被篡改的 Catalog 可以影响大量 Agent，成为高杠杆攻击入口
3. **域名锚点依赖**：信任模型依赖 DNS 安全，但 DNS 本身并非不可攻破
4. **Hugging Face 的示例令人不安**：数千个技能和 MCP 服务器可通过语义搜索被 Agent 发现——"你能理解为什么这让我有点担心吗？"（文章原话）

文章作者（ZDNet）的立场是：不认为自己比 Google、Microsoft、Cisco 更懂安全，但 ARD 创造的高价值目标确实是采用者需要认真对待的问题。

---

## 行业意义

1. **MCP 之后的第二块拼图**：MCP 解决了通信，ARD 解决了发现。两者合在一起，Agent 工具调用的基础设施才算基本完整。

2. **去中心化 vs 平台锁定**：ARD 的核心理念是去中心化——任何组织都可以发布自己的 Catalog，任何 Registry 都可以爬取和索引。Google 称这是"没有中央守门人的开放生态"。但实际落地中，大平台的 Registry 可能会形成事实垄断。

3. **OpenAI 和 Anthropic 的缺席是一个信号**：AI 领域的"标准化"往往伴随着激烈的生态竞争。谁控制了 Agent 资源发现层，谁就在 Agent 生态中占据了战略位置。

---

## 参考资料

- [ZDNet — AI agents are getting their own search engine](https://www.zdnet.com/article/ai-agents-are-getting-their-own-search-engine/)（2026-06-18，作者 Steven Vaughan-Nichols）
- Agentic Resource Discovery 规范：https://AgenticResourceDiscovery.org
- Google 官方博客 — ARD 公告
- GitHub Agent Finder 产品公告
- Hugging Face Discover Tool 文档
