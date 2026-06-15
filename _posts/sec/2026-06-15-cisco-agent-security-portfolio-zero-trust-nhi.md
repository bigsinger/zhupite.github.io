---
layout: post
title: "Cisco 布局 Agent 安全全栈：从零信任到 NHI 治理的完整拼图"
categories: [sec]
description: "Cisco 在过去 90 天内完成了 Agent 安全领域的系统性布局。从 RSAC 2026 的零信任 Agent 访问发布，到收购 Galileo（AI 可观测性）和 Astrix（NHI 治理），再到推出 DefenseClaw 开源安全框架和 Splunk Agentic SOC，Cisco 正在将 Agent 安全从零散的防护点整合为覆盖发现→身份→权限→运行时→可观测的全栈方案。"
tags:
  - AI安全
  - Agent安全
  - Cisco
  - 零信任
  - NHI
  - ZTNA
  - MCP
  - DefenseClaw
  - Galileo
  - Astrix
---

2026 年的 Agent 安全领域正在目睹一个有趣的现象：**网络巨头正在比安全厂商更积极地进入这个市场。**

3 月的 RSAC 2026 上，Cisco 发布了其 Agent 安全战略的初始框架。到 6 月中旬，随着对 Galileo 和 Astrix 的收购推进，以及 DefenseClaw 开源框架和 Splunk Agentic SOC 的上线，Cisco 的 Agent 安全拼图已经基本成形。

---

## 底层逻辑：从 Access Control 到 Action Control

Cisco 对 Agent 安全的核心洞察是：**传统的零信任架构是为人类设计的，不适用于 AI Agent。**

Cisco 安全集团 SVP Tom Gillis 在 RSAC 上明确阐述了这一转变：

> *"我们认为必须从访问控制（Access Control）演进到行为控制（Action Control）。它需要更细粒度、更智能——允许对某些任务进行选择性访问，而非广泛的通用访问。"*

这个判断抓住了本质：

| 维度 | 人类用户 | AI Agent |
|------|---------|----------|
| **鉴权方式** | 长生命周期凭据（密码/SSO Session） | 短生命周期、任务绑定的 Token |
| **访问频率** | 有限、可预测 | 高频、非线性 |
| **行为边界** | 人类判断约束 | 需要外部策略明确定义 |
| **凭据泄露** | 登录异常可检测 | 行为"看起来正常"时更难发现 |
| **管控粒度** | 应用/资源级别 | 操作/参数级别 |

Cisco 的方案不是零散的独立产品，而是基于其已有的安全平台（Secure Access SSE、Duo IAM、Identity Intelligence）的**原生扩展**。

---

## 完整拼图

### 1. 身份与发现：Agent 也有人管

Cisco 的第一个动作是解决"谁是这个 Agent"的问题。

- **Duo IAM** 现在支持 Agent 身份注册——每个 Agent 对应一个可追责的人类负责人
- **Cisco Identity Intelligence** 自动发现 Agent 身份和相关的非人类身份（NHI）
- 收购 **Astrix Security**（据报约 $3.5 亿）进一步增强了 NHI 治理能力——覆盖 Agent 的发现、生命周期管理、权限治理、威胁检测和集中式密钥管理

Astrix 收购的意义在于：**Agent 的身份问题本质上就是 NHI 问题。** 当一个 Agent 拥有 API Key、Service Token 和数据库凭证时，它就是企业身份体系中一个"非人类身份"。传统的 IAM 工具设计之初就没有考虑过这个场景。

收购后 Astrix 的能力将集成到 Cisco Identity Intelligence 中，并延伸到 Secure Access 和 Duo IAM。

### 2. 零信任访问 + MCP 策略执行

在 Secure Access（SSE）中，Cisco 增加了：
- **MCP 协议策略执行**——Agent 与 MCP 服务器之间的通信受到 ACL 管控
- **意图感知监控（Intent-Aware Monitoring）**——不仅仅是记录流量，而是判断 Agent 的行为**是否符合其被授权的意图**

后者是一个重要的技术进步：传统 SSE 只能做"是否允许连接"的决策，而 Cisco 的方案试图做"当前的操作是否像是在做 Agent 被授权要做的事"的推理。这不完美，但方向是对的。

### 3. AI Defense：攻防工具箱

#### Explorer Edition（免费）

Cisco 推出了一款免费的 AI 安全测试工具——**AI Defense Explorer Edition**，基于 Global 2000 客户使用的验证引擎。开发者、AppSec 和安全研究员可以在部署前对模型和应用做红队测试：

- **动态 Agent 红队测试**——多轮对抗性测试
- **模型与应用安全测试**——Prompt Injection、Jailbreak 抵抗力
- **API 优先访问**——可集成到 GitHub Actions、GitLab、Jenkins 等 CI/CD

#### Agent Runtime SDK

一个将安全策略直接嵌入 Agent 工作流的 SDK，支持 AWS Bedrock AgentCore、Google Vertex Agent Builder、Azure AI Foundry、LangChain 等主流框架。

### 4. DefenseClaw：开源 Agent 安全框架

Cisco 开源了 **DefenseClaw**，一个安全的 Agent 开发框架，包含：
- **技能扫描器（Skills Scanner）**——确保每个技能被扫描和沙箱化
- **MCP 扫描器**——验证每个 MCP 服务器的安全性
- **AI BoM（AI Bill of Materials）**——自动盘点 AI 资产
- **CodeGuard**——代码安全防护

计划与 **NVIDIA OpenShell** 集成作为沙箱运行时。

### 5. 可观测性：Galileo 收购 → Splunk

Cisco 在 4 月宣布收购 **Galileo Technologies**（AI 可观测性初创公司，创始团队来自 Google、Uber AI 和 Apple），将其整合到 Splunk 中。

Galileo 带来的是：
- 多 Agent 系统的**实时监控**
- **行为护栏**（检测幻觉、偏见、异常行为）
- 从开发到生产的**全生命周期评估工具**

这使 Splunk 从"基础设施可观测性"演变到"AI Agent 可观测性"——不仅仅是看日志和指标，而是看 Agent 的行为是否在预期范围内。

> *Cisco 总裁 Jeetu Patel 将 AI Agent 形容为"极度聪明但无所畏惧的少年"——能产出惊艳的成果，也能犯灾难性的错误。*

### 6. Splunk Agentic SOC

Splunk 在 2026 年推出了一系列 Agentic SOC 能力：

| 能力 | 说明 | 可用时间 |
|------|------|---------|
| **Exposure Analytics** | 持续更新的资产/用户清单 + 实时风险评分 | 2026年4-5月 |
| **Detection Studio** | 统一检测工程工作区，映射 MITRE ATT&CK | 已上线 |
| **Federated Search** | 跨环境数据关联搜索 | 2026年4-5月 |
| **Triage Agent** | AI 驱动的告警分诊 | 2026年6月 |
| **Guided Response Agent** | AI 引导的响应编排 | 2026年6月 |
| **Malware Threat Reversing Agent** | 恶意软件逆向分析 Agent | 已上线 |

---

## 时间线：90 天的系统性布局

```
2026-03-23  RSAC 2026：零信任 Agent 访问 + AI Defense 发布
2026-04-07  宣布收购 Galileo（AI 可观测性）
2026-04-10  宣布收购 Astrix Security（NHI 治理）
2026-05-??  DefenseClaw 开源发布
2026-06     Splunk Agentic SOC 陆续上线
```

这不是零散的产品更新，而是一个**系统性的架构布局**——从身份（Astrix）到访问控制（Zero Trust SSE）到开发安全（DefenseClaw/Explorer Edition）到运行时防护（Runtime SDK）到可观测性（Galileo/Splunk），覆盖了 Agent 的完整生命周期。

---

## 对行业的意义

### 网络视角 vs 端点视角

Cisco 的网络视角与 CrowdStrike/SentinelOne 等端点安全厂商形成互补：

| 视角 | 代表方 | 优势 | 局限 |
|------|-------|------|------|
| **网络端** | Cisco、Zscaler | 可监控 Agent 的通信流量、MCP 协议交互 | 看不到 Agent 内部行为 |
| **端点/运行时** | CrowdStrike、SentinelOne | 可监控 Agent 进程行为、文件系统访问 | 可能遗漏网络层的横向移动 |
| **身份/API** | Astrix、OAuth 厂商 | 关注凭证、权限、API 调用模式 | 对行为异常的检测有限 |

三种视角需要整合才能真正覆盖 Agent 安全。Cisco 通过收购 Astrix（身份）和 Galileo（可观测性）正在试图补齐后两种能力。

### Cisco 入场的三点影响

1. **标准化推动**：Cisco 的 MCP 策略执行能力将推动 MCP 协议的安全标准化
2. **渠道渗透**：Cisco 在全球有庞大的渠道网络，合作伙伴现在可以向企业客户销售 Agent 安全方案
3. **价格下行**：Cisco 通常走平台化路线，其 Agent 安全能力作为现有安全平台的功能扩展（而非独立产品）销售，可能压低专业 Agent 安全厂商的定价空间

---

## 结语

Cisco 的 Agent 安全布局揭示了一个趋势：**当 Agent 安全从"新锐创业公司话题"变成"企业 CIO 优先事项"时，拥有渠道、平台和客户关系的大厂天然有优势。**

90 天内，通过 3 次产品发布 + 2 次收购，Cisco 构建了覆盖 Agent 全生命周期的安全拼图。它是否是最优的技术方案仍有争议，但从市场覆盖角度看，这个布局的速度和广度值得关注。

---

**参考资料**
- [Cisco Newsroom: Reimagines Security for the Agentic Workforce (2026-03-23)](https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2026/m03/cisco-reimagines-security-for-the-agentic-workforce.html)
- [CRN: Cisco Unveils Zero Trust For AI Agents: 5 Things To Know](https://www.crn.com/news/security/2026/cisco-unveils-zero-trust-for-ai-agents-5-things-to-know)
- [MSSP Alert: Cisco to Acquire Astrix Security](https://www.msspalert.com/brief/cisco-to-acquire-astrix-security-to-secure-ai-agents-and-non-human-identities)
- [Cisco: Zero Trust for Agentic AI](https://www.cisco.com/site/us/en/solutions/artificial-intelligence/security/securing-agentic-ai/index.html)
- [AgentMarketCap: Cisco's 72-Hour Agent Security Play](https://agentmarketcap.ai/blog/2026/04/16/cisco-galileo-astrix-glasswing-agent-security-bundle-m-and-a)
- [Converge Digest: Cisco Extends Zero Trust to Agentic AI at RSA 2026](https://convergedigest.com/cisco-extends-zero-trust-and-ai-defense-to-agentic-ai-at-rsa-2026/)
