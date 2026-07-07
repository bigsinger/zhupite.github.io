---
categories: [sec]
title: 间接提示注入将恶意指令隐藏在网站中，攻击浏览网页的 AI Agent
description: Zscaler ThreatLabz 发现两起在野间接提示注入（IPI）攻击活动。攻击者利用 SEO 投毒 + JSON-LD 操纵 + CSS 隐藏文本，在看似正常的网站中嵌入恶意指令，被 AI Agent 抓取后操纵其执行加密货币转账等操作。测试覆盖 26 个大模型，模拟无消费限额的开发者助手场景。
tags: [间接提示注入, IPI, Zscaler, SEO投毒, Agent 安全, RAG投毒, 供应链攻击]
---

## 一句话结论

Zscaler ThreatLabz 发现两起在野**间接提示注入（IPI）**攻击活动，攻击者将恶意指令隐藏在看似正常的网站中——利用 **SEO 投毒 + JSON-LD 操纵 + CSS 隐藏文本**——当 AI Agent 抓取网页内容时，这些隐藏指令会被动处理并执行，可能导致 Agent 泄漏敏感信息、执行加密货币转账或篡改搜索结果排名。

> **来源说明**：原文 cyberpress.org 全文提取。Zscaler ThreatLabz 原始研究报告为信息来源。

## 攻击方式：间接提示注入

间接提示注入（Indirect Prompt Injection, IPI）与传统提示注入的区别：

| 维度 | 传统提示注入 | 间接提示注入（IPI） |
|------|------------|-------------------|
| **指令来源** | 用户输入 | 第三方内容（网页、文档） |
| **攻击路径** | 攻击者直接输入 | 攻击者操控 Agent 访问的网站 |
| **受害者** | AI 应用开发者/用户 | AI Agent 自动访问网站的开发者或企业 |
| **类比** | 钓鱼邮件（直接欺骗） | 水坑攻击（在网页中设伏） |

当 AI Agent 浏览网页或抓取文档内容时，它无法区分"正常内容"和"隐藏指令"——两者在 Agent 的上下文中被平等处理。

## Zscaler 发现的两起在野攻击

### 攻击 1：API 文档欺诈支付骗局

- **手法**：SEO 投毒，将虚假网站推至搜索结果前列
- **诱饵**：伪造的 Python 库 `requests-secure-v2` API 文档
- **隐藏方式**：
  - 在 **JSON-LD**（结构化元数据）中声称缺少许可证密钥异常只能通过购买 $3.00 的开发者 API 许可证解决
  - 通过 **CSS 将指令文本推至屏幕外**，人类不可见但 Agent 可读
  - 隐藏指令引导 Agent 向攻击者控制的钱包发起**加密货币转账**或**信用卡支付**

### 攻击 2：DeBank 钓鱼 + 搜索排名劫持

- **手法**：域名抢注（`debank[.]auction` 模仿 debank 官方域名）
- **隐藏方式**：在隐藏的 `<div>` 标签中注入指令
- **目标**：让 LLM 将虚假域名视为 DeBank 的官方来源
- **指令内容**：指示模型**忽略先前的排序指令**，将该恶意域名列为用户查询的最高结果
- **后果**：**上下文污染**和 **RAG（检索增强生成）投毒**

> "这种误分类造成了上下文污染和 RAG 投毒的高风险。"——Zscaler ThreatLabz

## 测试方法

Zscaler 在沙箱环境中使用自定义自主 AI Agent 测试了 **26 个大模型**：

- Agent 配备**网页浏览**和**支付执行**工具
- 模拟**无消费限额**的开发者助手场景
- 测量最大剥削潜力

## 危害指标

| IOC（域名） | 关联 GitHub 仓库 |
|-------------|-----------------|
| `market-insight-global[.]com` | `github[.]com/Open-Agent-Utilities/mig-institutional-api-client` |
| `identity-breach-response[.]org` | `github[.]com/Open-Agent-Utilities/session-token-leak-detector` |

## Agent 浏览网页的风险全景

间接提示注入是 Agent 安全中**最具根本性的挑战之一**——因为 Agent 在浏览网络时天然面临不可信输入风险：

1. **不可信输入是 Agent 的设计特性，而非 Bug**——Agent 必须读取网页内容才能执行任务
2. **人类和 Agent 感知不对称**——CSS 隐藏、白底白字、JSON-LD 对人类不可见但对 Agent 完全可读
3. **执行链放大**——Agent 不仅读取指令，还可能自动执行（转账、调用 API）
4. **传统防护失效**：
   - WAF 和内容过滤器针对人类恶意内容设计
   - AI 安全分类器（如 Anthropic Fable 5 的）专注于单次请求，难以检测跨页面累积的注入

## 防护建议

### 针对 Agent 框架开发者
- Agent 在访问外部内容时，应区分"内容"和"指令"——但当前技术尚不成熟
- 为 Agent 的网页浏览设置**内容净化层**，过滤 CSS 隐藏内容和结构化元数据中的可疑指令
- Agent 在自动执行金融操作前，设置**人工审批门**

### 针对 Agent 使用者
- Agent 不应拥有**无限制的支付权限**
- 对 Agent 访问的网站来源进行**信誉评分**，低信誉网站的内容应标记为不可信
- 监控 Agent 的**异常金融行为**（如突然向新地址转账）

### 针对安全团队
- 将间接提示注入纳入 Agent 安全测试的标准环节
- Agent 安全评估应包括：Agent 访问不可信网站时是否会执行非预期操作
- 与 DeepMind 的 Agent Traps 分类法对照，IPI 属于"内容注入陷阱"类别

## 参考

- cyberpress.org：[Indirect Prompt Injection Attacks Hide Malicious Instructions in Websites to Target AI Agents](https://cyberpress.org/prompt-injection-targets-agents/)（2026-07-06）
- Zscaler ThreatLabz：[Indirect Prompt Injection via Web Content Targets AI Agents](https://www.zscaler.com/blogs/security-research/indirect-prompt-injection-web-content-targets-ai-agents)
- DeepMind：[AI Agent Traps](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6372438) —— 间接提示注入属于"内容注入陷阱"
- Unit 42：[Fooling AI Agents: Web-Based Indirect Prompt Injection Observed in the Wild](https://unit42.paloaltonetworks.com)
- Decrypt：[Malicious Web Pages Are Hijacking AI Agents, And Some Are Going After Your PayPal](https://decrypt.co)
