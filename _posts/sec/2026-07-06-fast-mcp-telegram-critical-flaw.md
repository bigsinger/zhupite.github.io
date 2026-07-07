---
categories: [sec]
title: fast-mcp-telegram 关键漏洞：路径遍历绕过 Bearer Token 认证劫持 Telegram 会话
description: MCP 生态中的 fast-mcp-telegram 服务器（≤0.19.0）存在路径遍历漏洞（GHSA-rxw2-pc8j-vxwm），攻击者可提交 `../fast-mcp-telegram/telegram` 作为令牌绕过 Bearer Token 认证，劫持默认 Telegram 会话，读取/发送消息、调用任意 MTProto API。MCP Server 生态的安全漏洞直接影响 Agent 工具调用的安全根基。
tags: [MCP, fast-mcp-telegram, 认证绕过, 路径遍历, 漏洞, Agent 安全]
---

## 一句话结论

**fast-mcp-telegram**（一个用于 Telegram 集成的流行 MCP 服务器）存在严重安全漏洞（**GHSA-rxw2-pc8j-vxwm**），影响 v0.19.0 及以下版本。攻击者可提交 `../fast-mcp-telegram/telegram` 作为 Bearer Token，绕过认证直接劫持服务器的默认 Telegram 会话——读取和发送消息、调用任意 MTProto API、访问附件功能——**无需知道任何有效令牌**。

> **来源说明**：原文 cyberpress.org 全文提取。漏洞编号 GHSA-rxw2-pc8j-vxwm。

## 漏洞详情

| 项目 | 内容 |
|------|------|
| **组件** | fast-mcp-telegram（MCP Telegram 集成服务器） |
| **漏洞类型** | 路径遍历 + 认证绕过 |
| **编号** | GHSA-rxw2-pc8j-vxwm |
| **影响版本** | ≤ 0.19.0 |
| **修复版本** | 0.19.1 |
| **发现者** | DavidCarliez |
| **严重性** | 关键（Critical） |

## 漏洞原理

### 正常认证逻辑

`SessionFileTokenVerifier.verify_token()` 在检查令牌时：

1. 检查令牌是否为保留字符串 `"telegram"`——如果是，则拒绝（防止与默认 legacy 会话冲突）
2. 否则，将令牌拼接到文件路径中：`~/.config/fast-mcp-telegram/<token>.session`
3. 检查该文件是否存在

### 漏洞：路径未规范化

验证器**未对路径分隔符进行消毒**，也未规范化结果文件路径。攻击者可提交：

```
../fast-mcp-telegram/telegram
```

该令牌绕过了 `"telegram"` 字符串的精确匹配检查（因为是不同的字符串），但经过路径解析后，实际指向的是：

```
~/.config/fast-mcp-telegram/../fast-mcp-telegram/telegram.session
→ ~/.config/fast-mcp-telegram/telegram.session  （默认 session 文件）
```

**结果**：攻击者无需知道任何有效 Bearer Token，就能以默认会话身份登录。

## 影响范围

通过该漏洞认证后，攻击者获得完整的 Telegram MCP 工具访问权限：

- 读取和发送消息
- 调用任意 MTProto API
- 访问附件相关的工具接口

**关键点**：FastMCP 的 account-prefix 中间件（用于按账户标签区分工具）**不能缓解此漏洞**——因为中间件在认证之后运行，它只会忠实地为遍历令牌解析到的账户暴露加前缀的工具。

## 根因分析

| 问题 | 描述 |
|------|------|
| 路径规范化缺失 | 令牌字符串直接拼入文件路径，未调用路径规范化 |
| 无字符黑名单 | 未拒绝正斜杠、反斜杠、双点号、绝对路径 |
| 两个位置的相同问题 | 相同模式出现在 `src/client/connection.py` 中 |
| 前缀中间件不防御 | 中间件在认证下游，无法恢复被破坏的认证边界 |

## 修复建议

GitHub 安全公告建议：

1. **强制执行严格的令牌格式**——仅匹配生成的 URL 安全 base64 令牌
2. **拒绝任何包含斜杠、反斜杠、点号、空段或绝对路径的令牌**
3. **最终会话路径**在授权前必须解析并验证为配置会话目录的直接子目录
4. **在所有认证入口点**（URL 认证中间件、设置流程、会话清理例程）一致应用此验证
5. 添加涵盖遍历别名和编码路径的**回归测试**

## 缓释措施

- **立即升级**至 v0.19.1
- 无法立即修补的：检查服务器上是否存在默认的 `telegram.session` 文件，考虑**删除或迁移**该文件作为临时缓解
- 在 HTTP 认证模式下运行的 fast-mcp-telegram 管理员应立即行动

## 对 MCP 生态安全的影响

此漏洞暴露出 MCP Server 生态中一个更深层的安全问题：

| 层面 | 问题 |
|------|------|
| **认证实现** | 许多 MCP 服务器的认证实现是自定义的、临时的，缺乏统一的安全审核 |
| **路径处理** | 文件路径拼接时缺少规范化是常见的安全反模式 |
| **令牌验证** | Bearer Token 验证不应依赖文件存在性判断 |
| **生态成熟度** | MCP 生态仍处于早期，安全最佳实践尚未标准化 |

**标准化认证和审计机制亟需加强**——这不仅是 fast-mcp-telegram 的问题。随着 MCP 成为 Agent 与工具通信的事实标准，每个 MCP Server 的认证实现都可能成为 Agent 工具调用链的安全短板。

## 参考

- cyberpress.org：[fast-mcp-telegram Critical Flaw Lets Attackers Bypass Bearer Token Authentication](https://cyberpress.org/fast-mcp-telegram-critical-flaw/)（2026-07-06）
- GitHub Advisory：[GHSA-rxw2-pc8j-vxwm](https://github.com/advisories/GHSA-rxw2-pc8j-vxwm)
- fast-mcp-telegram 项目：[GitHub](https://github.com)（v0.19.1 已修复）
