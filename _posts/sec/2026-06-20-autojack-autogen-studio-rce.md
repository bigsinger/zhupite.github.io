---
layout: post
title: "AutoJack：Microsoft AutoGen Studio 零点击 RCE 攻击链解析"
categories: [sec]
description: "微软安全团队披露AutoJack漏洞链——攻击者只需构造恶意网页，即可在用户无交互的情况下对运行AI浏览代理的主机实施远程代码执行。解析三阶段攻击原理、受影响条件与修复措施。"
tags:
  - AutoGen Studio
  - RCE
  - AI Agent安全
  - MCP
  - 微软
---

微软安全研究团队（Microsoft Defender Security Research Team）披露了一个代号 **AutoJack** 的攻击手法。攻击者只需构造一个恶意网页，当 AI 浏览代理（browsing agent）访问该页面时，无需任何用户交互即可对主机实施远程代码执行（RCE）。这是自 AI Agent 框架诞生以来最严重的远程劫持漏洞之一。

## 漏洞速览

| 项目 | 内容 |
|------|------|
| **漏洞名称** | AutoJack — AutoGen Studio 零点击 RCE |
| **披露方** | Microsoft Defender Security Research Team |
| **披露日期** | 2026-06-18 |
| **受影响框架** | Microsoft AutoGen Studio（基于 AutoGen 框架的 Agent 构建平台） |
| **攻击前提** | Agent 拥有浏览器能力，且可访问外部网页 |
| **攻击效果** | 远程代码执行，完全控制主机 |
| **是否需要用户交互** | 否（零点击） |
| **PoC 状态** | 微软已证实攻击路径，未公开利用代码 |

## 攻击链分析

AutoJack 不是单一漏洞，而是一条由三个安全缺陷串联而成的攻击链：

### Issue 1：Origin 白名单被 Agent 自身绕过

AutoGen Studio 的 WebSocket 端点配置了 Origin 白名单来限制跨域请求。然而，当 Agent 作为浏览器代理访问外部页面时，**恶意页面可以控制发起 WebSocket 连接时的 Origin 头**。

攻击者可以让恶意页面在发起 WebSocket 连接时，将 Origin 伪造为白名单中的合法值（如 `localhost` 或内部域名），从而绕过 Origin 验证。Agent 自身的行为成了第一道防线的破坏者——它在访问不可信网页时，无意中为攻击者提供了操控 Origin 头的能力。

### Issue 2：认证中间件为 MCP 放行

AutoGen Studio 的认证中间件在实现上存在一个关键缺口：**MCP WebSocket 端点被显式排除在认证检查之外**。设计者的意图是简化本地 MCP 工具调用的认证流程，但由于 Issue 1 的存在，这个例外变成了开放的入口。

认证检查与 Origin 验证的组合本应是纵深防御的最后两道闸门，但在 AutoJack 链中，两者被同时绕过：Origin 被伪造，MCP 路径无认证。

### Issue 3：`server_params` 从 URL 中读取可执行参数

这是整个攻击链中最致命的一环。AutoGen Studio 的 MCP 服务允许从 URL 的 `server_params` 参数直接读取和传递启动命令。这意味着攻击者可以将任意命令编码到 URL 中，当 Agent 通过 MCP WebSocket 启动新服务时，这些命令被不加校验地执行。

攻击者构造的恶意页面可以：
1. 通过伪造的 WebSocket 连接发送恶意 `server_params`
2. 触发 AutoGen Studio 在后台启动恶意进程
3. 获取命令执行结果并回传

### 攻击链串联

完整攻击流程如下：

```
① 攻击者部署恶意网页（含恶意 WebSocket + 伪造 Origin + 携带 server_params）
       ↓
② AI 浏览代理正常访问该网页
       ↓
③ 恶意页面绕过 Origin 白名单 → 通过无认证的 MCP WebSocket 端点
       ↓
④ 发送包含恶意 server_params 的 MCP 请求
       ↓
⑤ AutoGen Studio 执行攻击者命令 → 主机被 RCE
```

整个过程中用户唯一的操作就是使用 Agent 浏览网页——甚至不需要点击页面上的任何元素。

## 受影响条件

- 使用 **AutoGen Studio** 框架构建并部署了具备浏览能力的 AI Agent
- 未应用微软在 2026-06-18 发布的安全更新
- Agent 可以访问外部 URL（即非完全隔离的内部环境）

## 修复与缓解

微软在披露公告中同步发布了修复措施：

**官方修复**：
- 修复 Origin 白名单的验证逻辑，禁止从 WebSocket 请求中信任可伪造的 Origin 头
- 为 MCP WebSocket 端点添加必要的认证检查，移除「认证例外」
- 停止从 URL 参数 `server_params` 读取可执行命令，改为使用安全的内部配置传递方式

**即时缓解措施**：
- 限制 AI 浏览代理访问的外部域名范围，使用允许列表而非拒绝列表
- 在代理与后端服务之间增加独立的认证令牌，不依赖 Origin 头
- 监控 MCP WebSocket 连接中的异常 `server_params` 请求
- 将 Agent 运行在最小权限容器中，即使发生 RCE 也限制横向移动

**微软 Defender 检测**：
- Microsoft Defender for Endpoint 已更新检测规则，可识别 AutoJack 攻击特征
- 具体检测名称和规则未公开披露

## 更深层的问题

AutoJack 揭示了一个 Agent 安全领域的根本性缺陷：**传统 Web 安全边界在 Agent 场景下完全失效**。

- **localhost 不再可信**：Agent 浏览器与本地服务之间的连接不再安全，因为 Agent 本身可能被外部内容操纵
- **Origin 头不再可靠**：在 Agent 控制浏览器的情况下，攻击者可以伪造任意 HTTP 头
- **「内部」接口需要外部级安全**：任何 Agent 可调用的本地端点都必须假设攻击者能够直接访问

微软在公告中强调，这不仅仅是一个 AutoGen Studio 的问题，而是整个 Agent 生态普遍存在的安全假设漏洞。当 Agent 具备「连接外部内容」和「调用本地工具」两种能力时，它们之间的安全边界必须被重新审视。

## 参考资料

- Microsoft Security Blog「AutoJack: How a single page can RCE the host running your AI agent」，2026-06-18，`https://www.microsoft.com/en-us/security/blog/2026/06/18/autojack-single-page-rce-host-running-ai-agent/`
- Microsoft AutoGen Studio 官方文档：`https://microsoft.github.io/autogen/`
- 多家安全媒体（Let's Data Science、cyberpress）已报道此漏洞链，Hacker News 上有相关讨论
