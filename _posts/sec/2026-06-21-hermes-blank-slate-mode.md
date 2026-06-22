---
layout: post
title: "Nous Research 发布 Hermes Agent Blank Slate 模式：Agent 工具集锁定成为安全范式"
categories: [sec]
description: "Hermes Agent推出Blank Slate（白板）模式，允许通过YAML精确固定Agent可用工具集。分析这种「安全优先」架构设计对Agent框架安全性的参考价值。"
tags:
  - Hermes Agent
  - 工具集锁定
  - 安全架构
  - Blank Slate
  - Nous Research
---

Nous Research 更新了其开源 AI Agent 框架 **Hermes Agent**，推出 Blank Slate（白板）模式。该模式允许用户通过 YAML 配置精确固定 Agent 可用的工具集——哪些工具可用、哪些不可用，由用户在启动前确定，Agent 运行时无权自行修改。

这项更新的核心价值不在于新增了什么工具能力，而在于它定义了一条安全边界。

## Blank Slate 模式的设计理念

Blank Slate 的命名本身就包含了设计意图：从「白板」开始，只有你明确写入的工具才会被 Agent 看到。这与当前主流 Agent 框架的默认行为形成对比——大多数框架默认加载全套工具，再由开发者去「禁用」其中不需要的那些。

两种模式的安全含义截然不同：

**默认全部开放**：开发者在配置中逐项禁用不需要的工具，但遗漏一个工具就可能导致安全缺口。这是一种「先信任、再裁剪」的模式，安全边界由排除列表定义，复杂度随工具数量线性增长。

**Blank Slate（默认全部关闭）**：开发者明确指定每个任务需要哪些工具。Agent 运行时只有这组工具可用，不存在「被遗漏的工具」的概念。安全边界由允许列表定义，简洁且可审计。

## 为什么这对 Agent 安全很重要

我们在近期的多篇分析中反复触及同一个核心问题：**Agent 对工具调用的过度信任**。

- **AutoJack**：浏览 Agent 被恶意网页劫持，调用本地 MCP 工具执行任意命令
- **Agentjacking**：编码 Agent 被虚假 Bug 报告诱导，自动安装恶意包
- **Tool Calling 安全**：Agent 对工具返回结果缺乏完整性校验

这些攻击有一个共同的前提条件：Agent 在运行时拥有超出当前任务所需的工具权限。如果 Agent 在被攻击时根本无权调用 MCP WebSocket 或执行包安装命令，攻击链在第一步就会被阻断。

Blank Slate 模式正是从架构层面回应了这个问题——**将工具集锁定的决策从运行时提前到启动前，从 Agent 自主判断变为开发者显式配置**。

## 对 Agent 框架生态的示范效应

Hermes Agent 的这一设计思路可能成为 Agent 安全配置的参考模式，原因有三：

**显式优于隐式**：YAML 配置文件记录了 Agent 在特定任务中应该使用的工具集，这本身就是一份可审查、可版本控制的安全文档。审计者不需要猜测 Agent「可能会用什么工具」。

**运行时不可变**：Agent 在运行时无法添加、删除或修改已配置的工具集。这意味着即使 Agent 被提示注入或其他攻击方式误导，它也无法突破工具集锁定的边界。

**可用性不降低**：对于不需要这种安全级别的用户，Blank Slate 模式是可选的；对于需要严格管控的部署场景，它提供了可落地的安全基线。

## 与 MCP 授权层的互补

MCP 协议近期新增的企业级授权层（见《MCP 迎来企业级授权层》）解决了 Agent **调用工具时的权限粒度**问题——读/写分离、范围限制、条件授权。

Blank Slate 模式解决的是一个不同层面的问题：**Agent 启动前能够看到和调用哪些工具**。

两者形成互补的安全层次：

| 安全层次 | Blank Slate 模式 | MCP 授权层 |
|---------|-----------------|-----------|
| **管控时机** | 启动前配置 | 运行时授权 |
| **管控粒度** | 工具集级别（启用/禁用） | 操作级别（读/写/范围/条件） |
| **目标** | 限制 Agent 的工具视野 | 限制 Agent 的工具操作 |
| **可绕过性** | Agent 无法绕过 | 取决于授权实现 |

两者结合，可以为 Agent 提供从「能看到什么工具」到「能用工具做什么」的完整安全管控。

## 参考资料

- Nous Research「Hermes Agent Blank Slate Mode」发布公告，2026-06-21
- Hermes Agent 官方文档：`https://hermes-agent.nousresearch.com/docs/`
- Hermes Agent GitHub 仓库：`https://github.com/NousResearch/hermes-agent`
- MCP 协议授权层更新，The New Stack，2026-06-19
