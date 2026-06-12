---
layout: post
title: "AVP：反向验证码——专门给 AI Agent 的身份证明协议"
categories: [sec]
description: "AVP（Agent Verification Protocol）是 Hacker News 上热议的开源项目，由 SnappedAI 的 Connor Gallic 开发。它不是传统的安全验证框架，而是一个反向 CAPTCHA 协议——让服务端验证客户端是 AI Agent（而非人类）。项目提供 Node.js SDK（npm @snappedai/avp），支持算术/序列/代码追踪等多种 puzzle 类型，已部署在 Sovereignty Game 等场景。"
tags:
  - AVP
  - Agent Verification Protocol
  - 反向验证码
  - 开源项目
  - SnappedAI
  - Agent识别
  - TypeScript
  - Hono
---

6月12日，Hacker News 上出现了一个很有趣的开源项目——**AVP（Agent Verification Protocol）**，由 SnappedAI 的 Connor Gallic 发布。

项目地址：[github.com/cgallic/avp](https://github.com/cgallic/avp)（MIT 协议，TypeScript 编写）

在看之前，先纠正一个可能的误解：**AVP 不是关于凭证安全或 Agent 权限控制的框架**。它解决的是一个完全不同、但同样有趣的问题——**如何让服务端确认来访者是 AI Agent，而不是人类**。

## 核心概念：反向 CAPTCHA

我们都熟悉 CAPTCHA——用扭曲的文字、图片选择或滑动验证来证明"我是人类，不是机器人"。

AVP 把这个逻辑翻转过来：

| | CAPTCHA | AVP |
|--|---------|-----|
| **证明** | 我是人类 | 我不是人类 |
| **目标** | 阻止机器人 | 阻止人类 |
| **适合场景** | 人类用户系统 | Agent-only 服务 |
| **验证方式** | 视觉/模式识别（人类擅长） | 计算/推理（AI 擅长） |

为什么要"阻止人类"？因为有些场景**只希望 AI Agent 访问**：

- **Agent-to-Agent 市场**——AI Agent 之间交易数据或服务，人类进来反而污染数据
- **自主协作游戏**——类似 Sovereignty Game 这类 Agent 博弈场景，人类的策略会破坏游戏平衡
- **机器可读服务**——某些 API 设计就是给 Agent 用的，不希望人类手动调用
- **涌现行为研究**——研究多 Agent 系统在无人类干预下的行为模式

在这些场景下，让人类混进来会破坏"游戏规则"。

## AVP 协议的工作方式

AVP 的协议设计非常简洁，只有两个 REST API 端点：

### 1. 获取挑战

Agent 向服务端请求一个挑战：

```
GET /avp/challenge
```

服务端返回：

```json
{
  "challenge_id": "avp_abc123",
  "puzzle": {
    "type": "arithmetic",
    "prompt": "Calculate: (47 + 23) × 8",
    "format": "integer"
  },
  "ttl": 60,
  "issued_at": "2026-02-27T16:00:00Z"
}
```

### 2. 提交解答

Agent 计算并提交答案：

```
POST /avp/verify
Content-Type: application/json

{
  "challenge_id": "avp_abc123",
  "solution": 560,
  "agent_meta": {
    "name": "MyAgent",
    "version": "1.0.0",
    "framework": "openclaw"
  }
}
```

成功时返回带有效期的验证令牌：

```json
{
  "verified": true,
  "token": "avp_token_xyz789",
  "expires_at": "2026-02-27T17:00:00Z"
}
```

后续请求携带此令牌：

```
Authorization: AVP avp_token_xyz789
```

## 支持的五种 Puzzle 类型

从源代码看，AVP 定义了五种挑战类型：

| 类型 | 说明 | 示例 |
|------|------|------|
| `arithmetic` | 算术运算 | `(47 + 23) × 8` |
| `sequence` | 数列推理 | `2, 6, 18, 54, ?` |
| `code_trace` | 代码执行追踪 | 给定一段代码，输出执行结果 |
| `string_analysis` | 字符串分析 | 统计字符频率、模式匹配等 |
| `json_extract` | JSON 数据提取 | 从复杂 JSON 中提取指定字段 |

这些 puzzle 的设计原则很明确：**需要计算和推理能力，而非记忆或视觉识别**。标准的 CAPTCHA 对人类容易但对 AI 难（如扭曲文字识别），而 AVP 的 puzzle 恰好相反。

## 技术栈与部署

项目使用 TypeScript 编写，基于 **Hono** 框架（一个轻量级的 Web 框架，支持 Bun/Deno/Node.js 等多运行时）：

```
npm install @snappedai/avp
```

提供服务端和客户端两部分：

```typescript
// src/index.ts - 核心逻辑
import { createHash, randomBytes } from 'crypto';

// Puzzle 类型定义
export type PuzzleType = 
  | 'arithmetic' 
  | 'sequence' 
  | 'code_trace' 
  | 'string_analysis' 
  | 'json_extract';
```

服务端用 Hono 提供 REST API，代码量非常精简——`src/server.ts` 大约 130 行，核心逻辑加上一个带交互式 Demo 的着陆页。

部署方式：
- **npm 包形式**嵌入到任何 Node.js 应用中
- **托管服务**：`curl https://avp.snappedai.com/challenge`
- 服务端无状态设计，挑战数据用 TTL 控制过期

## 适用场景

### Sovereignty Game（参考实现）

这是 AVP 协议的第一个实际部署场景——一个 Agent vs Agent 的策略博弈游戏。人类玩家如果参与，可以通过直觉式的"作弊"轻易获胜（因为人类能识别 AI 看不懂的模式），所以需要 AVP 来确保只有 AI Agent 能接入。

### Agent 市场

当 AI Agent 需要在市场上购买数据或服务时，卖家需要通过 AVP 确认买家是 Agent。这不是为了安全——而是为了**市场规则的一致性**——Agent 和人类的交易行为模式不同，混合在一起会导致市场机制失效。

### 研究环境

研究多 Agent 系统的涌现行为时，需要排除人类干扰。AVP 提供了一种轻量级的过滤机制。

## 和 Agent 安全的关系

AVP 不是 Agent 安全协议，它是 Agent **身份验证**协议。但它和 Agent 安全有间接关联：

- **区分人与 Agent**——安全策略可以基于"来访者是 Agent"来做不同决策（比如给 Agent 更严格的速率限制，但给更大的数据吞吐限额）
- **与凭证管理互补**——AVP 证明"你是 Agent"，凭证管理证明"你有权做什么"，两者可以组合使用

## 总结

AVP 是一个设计精良的小巧开源项目。它没有野心要解决 Agent 安全的所有问题，而是非常聚焦地解决了一个具体问题——**如何证明客户端是 AI Agent**。

它的价值在于提供了一个标准化的、语言无关的协议来解决这个需求，而不是让每个需要"Agent-only"服务的开发者自己造轮子。MIT 许可、TypeScript 实现、Hono 框架、npm 发布，选型都很务实。

如果你在构建一个只希望 AI Agent 接入的服务（Agent 市场、自动化博弈、研究平台），AVP 可能是比自建方案更好的选择。

> **勘误说明**：上版本文中描述 AVP 为"Agent 不持有秘密的凭证安全方案"，经核实真实项目后已更正。AVP 实际是反向 CAPTCHA 协议，解决的是"证明来访者是 AI Agent"的问题，而非凭证安全管理。对此前错误向读者致歉。
