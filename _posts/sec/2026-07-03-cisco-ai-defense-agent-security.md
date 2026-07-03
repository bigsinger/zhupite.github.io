---
layout: post
title: "Cisco 发布 AI Defense 方案保护 AI Agent 安全"
categories: [sec]
description: "Cisco 正式发布 AI Defense 方案专门保护企业 AI Agent，提供 Agent Runtime Protection SDK。覆盖 LangChain、OpenClaw、Semantic Kernel 等主流框架，支持请求/响应/ MCP 三层检测。"
tags:
  - AI Agent
  - Cisco
  - AI Defense
  - MCP
  - 运行时防护
---

## 事件基线

2026 年 6 月 30 日，Cisco 在官方安全博客发布 **Cisco AI Defense** 安全方案，专门保护企业部署的 AI Agent。这是继 Cisco 此前推出 AI Defense 通用产品线后，首次针对 Agent 场景发布的专项安全能力。

Cisco 的入局是一个重要信号——当一家安全基础设施巨头专门为一个新赛道发布产品时，说明该赛道已经到了企业安全架构必须面对的程度。

## 产品定位

Cisco AI Defense 不是零散的安全工具，而是覆盖 AI Agent **开发、测试到生产全生命周期**的安全方案。其核心新增是 **Agent Runtime Protection**（Agent 运行时保护），在 OpenAI 兼容 SDK 格式下做到了堪称优雅的集成——一行代码即可生效：

```python
from aidefense.runtime import agentsec
agentsec.protect(config="agentsec.yaml")
```

这背后的实现在技术上值得关注：`agentsec.protect()` 通过**动态代码重写**（dynamic code rewrites），在运行时自动 hook 所有 LLM 调用和 MCP 工具调用，将流量路由到 AI Defense 检测引擎。开发者不需要修改已有代码，也就是说对已有 Agent 项目可以实现零侵入接入。

## 三层检测模型

AI Defense 的检测架构分为三层：

### 1. 请求检测
在 LLM 调用或 MCP 调用发起前，将内容送往 AI Defense 分析——Prompt 注入、敏感数据暴露、策略违规可以在调用发生前就被阻止。

### 2. 响应检测
模型返回后，响应内容同样经过检测——数据泄露、有害内容、合规违规可以在到达应用前被拦截。

### 3. MCP 协议保护
对 MCP 的三种交互类型全覆盖：

| MCP 交互类型 | 检测对象 |
|:-----------:|---------|
| Tools（call_tool） | 参数和返回结果 |
| Prompts（get_prompt） | 来自外部服务器的模板 |
| Resources（read_resource） | 来自外部源的数据 |

## 覆盖的 Agent 层级

Cisco 将 Agent 栈分为三个复杂度层级，AI Defense 全部覆盖：

1. **直接 API 调用**：OpenAI、AWS Bedrock、Google Vertex AI、Azure OpenAI——在最外层做 prompt/response 边界检测
2. **Agent 框架层**：LangChain、LangGraph、CrewAI、AutoGen、Strands、Google ADK、OpenAI Agents SDK——当 LLM 和工具调用发生在框架内部时，自动 hook 框架的底层调用
3. **托管运行时**：AWS Bedrock AgentCore、Google Vertex AI Agent Engine、Microsoft Azure AI Foundry——将保护随 Agent 一起部署到托管环境

## 为何传统安全方案不够

Cisco 在文章中点名指出，WAF 和 API 网关无法保护 Agent 的原因是：它们「不理解 LLM 上下文，不能解析推理链，也看不到 prompt、工具和响应之间相互反馈时出现的威胁」。

Agent 安全的特殊性在于，**威胁不在单一请求中，而在多步调用的语义链条里**。一个 POST 请求到 `/api/v1/chat/completions` 在 API 网关看来千篇一律，但它携带的 payload 可能包含嵌入在外部文档中的间接注入指令。

## 赛道格局的再确认

这是本周 Agent 安全赛道的第三起重要事件：

| 时间 | 事件 | 意义 |
|:----:|------|------|
| 2026-06-29 | Straiker 6400 万 A 轮 | 资本市场验证 |
| 2026-06-30 | Microsoft 标记 MCP 工具描述攻击路径 | 平台厂商定义威胁 |
| 2026-06-30 | Cisco AI Defense Agent Runtime Protection | 安全厂商产品落地 |

三者在两天内几乎同时发生，说明 Agent 安全已经不是「未来趋势」，而是正在发生的企业采购需求。

## 参考资料

- Cisco Blogs: [Securing AI Agents with Cisco AI Defense](https://blogs.cisco.com/security/securing-ai-agents-with-cisco-ai-defense)（2026-06-30）
