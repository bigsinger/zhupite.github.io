---
layout: post
title: "远程 MCP 服务器 OAuth 实战：3 个安全缺陷和一个 Cloud Run 陷阱"
categories: [sec]
description: "SkillDB 分享了将 MCP 服务器从本地迁移到远程 OAuth 保护的经验，包含安全评审发现的 3 个账号接管漏洞（可伪造 ID Token、Confused Deputy、授权码劫持）和 Cloud Run 部署的 0.0.0.0 重定向陷阱。"
tags:
  - MCP
  - OAuth
  - 安全实践
  - Cloud Run
  - 认证
---

> 原文：[Shipping an OAuth-protected remote MCP server: the spec, 3 security bugs, and a Cloud Run gotcha](https://skilldb.dev/blog/oauth-remote-mcp-server) · SkillDB Team · 2026-06-22

SkillDB 原本是一个本地 MCP 服务器。要让它变成能在 Claude Desktop 里「粘贴 URL → 登录 → 直接用」的远程服务器，需要完整实现 MCP 的 OAuth 授权规范。这篇文章是他们的实战记录，重点在于安全评审发现的 3 个严重缺陷和一个生产环境才暴露的 Cloud Run 陷阱。

## MCP 的 OAuth 规范到底要什么

远程 MCP 服务器需要实现一整套 OAuth 规范栈。Claude Desktop 等客户端按以下协议发现和握手：

1. **WWW-Authenticate 头** — 当 MCP 端点收到无令牌/无效令牌请求时，必须返回 `Bearer resource_metadata="…"` 头，这是触发整个 OAuth 流程的信号
2. **`/.well-known/oauth-protected-resource`** — 声明资源标识符和授权服务器
3. **`/.well-known/oauth-authorization-server`** — 发布 authorize/token/registration 端点，声明要求 PKCE、接受 public clients
4. **动态客户端注册（RFC 7591）** — Claude 没有预注册的 client_id，会实时在 `/register` 端点注册自己。跳过这一步流程立即死
5. **授权码 + PKCE + 同意页面 + 支持刷新令牌轮换的令牌端点**

SkillDB 的选择是：**自己作为授权服务器**（已有 Firebase 认证和用户系统），不引入第三方 IdP。OAuth 登录就是已有的 SkillDB 登录，令牌映射到用户的付费计划。

## 架构决策：没有「内部令牌」

最关键的架构选择是：MCP 服务器直接内联加载内容，调用与公共 API 相同的门控函数，用户身份从验证后的令牌中解析。

初始设计中曾有一个捷径——MCP 服务器签发一个 HS256 的内部 JWT「信任令牌」发送给公共 API。这个设计在安全评审中被否决，原因在下面第 2 个漏洞。

## 3 个安全缺陷

安全评审在首版设计中发现了 **3 个严重漏洞，全部会导致一个用户访问另一个用户的数据**。

### 1. ID Token 检查可伪造

同意页面使用 Firebase ID Token 验证用户身份。最初只用 `verifyIdToken(token)` 做裸验证——**不检查令牌是否已吊销**。一个已退出登录或已被禁用的用户的缓存令牌仍然能生成有效的授权码。

修复：添加 `checkSessionRevoked=true` 参数，同时断言令牌的 audience 是当前 Firebase 项目（防止为其他应用签发的令牌被冒用）。整个同意流程依赖这唯一一次调用。

### 2. 「内部令牌」是 Confused Deputy

初始设计：MCP 服务器为一个用户签发 HS256 对称签名 JWT，发送给公共 API 来解锁内容。问题在于：**这个 API 是面向互联网的**，对称密钥意味着同一个密钥既签名又验证。一旦密钥泄露，任何人都可伪造令牌读取任意用户的私有内容。

修复：删除整个内部令牌机制——MCP 服务器直接内联加载内容，不存在可伪造的令牌，也不存在可供攻击的网络跳转。

### 3. 开放注册 + 弱同意屏幕 = 授权码盗窃

动态客户端注册（DCR）必须开放——这是 Claude 注册的方式。但结合弱同意的步骤，攻击者可以：

- 注册一个带有**恶意 redirect_uri** 的客户端
- 诱骗已登录用户点击同意页面
- 收割授权码

修复：三个改动——
- 同意页面的 POST 提交做 **same-origin 检查**
- 向用户展示**真正的客户端名称和 redirect host**（绝不能使用查询参数传来的值）
- redirect URI 验证使用**精确匹配**（`exact-match redirect validation`）

再加上行业标准配置：强制 PKCE S256、授权码一次性使用且哈希存储（10 分钟 TTL）、刷新令牌每次使用后轮换并在重放时撤销整个家族、跨 PRM/AS metadata/token audience 使用统一资源标识符。

### Cloud Run 陷阱

所有修复上线后，首次连接 Claude Desktop 就失败了：

```
https://0.0.0.0:8080/oauth/authorize?... ERR_ADDRESS_INVALID
```

根因：authorize 端点验证请求后，使用框架的 `url_for()` 生成重定向到同意页面的 URL。在 Cloud Run 上，`url_for()` 解析的是**容器内部绑定地址**——`0.0.0.0`。浏览器收到的是一个死地址。

修复：从代理的 `X-Forwarded-Host` 头推导公共 origin（并有合理的 fallback）。同样的 bug 随后又咬了一次：同意页面的 CSRF 检查比较了 `request.host`——再次拿到内部地址，直到改为比较公共 host。

**教训：如果你在反向代理后面运行，审计每一个构造 URL 或从请求内部读取 host 的地方。**

## 可复用的实践

这篇文章的价值在于它是一份**真实部署的检查清单**：

- OAuth 元数据（well-known 端点）必须写对，客户端靠它发现一切
- ID Token 验证不能只做格式检查——吊销状态和 audience 是必选项
- 远程 MCP 服务器不应创建「内部授权令牌」跨越网络边界——这引入了可伪造的中间凭证
- 动态客户端注册 + 弱同意页面是一个已知的攻击组合，OAuth 生态已经有过多次教训
- 反向代理后面部署时，所有 URL 构造和 host 比较都要审计

> 文中提到的 SkillDB 远程 MCP 服务器也可作为本地服务器使用。相关命令和细节见原文。

**原文链接**：[https://skilldb.dev/blog/oauth-remote-mcp-server](https://skilldb.dev/blog/oauth-remote-mcp-server)
