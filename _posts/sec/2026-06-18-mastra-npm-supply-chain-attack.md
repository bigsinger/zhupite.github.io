---
layout: post
title: "Mastra npm 供应链攻击：140+ 包被投毒，AI Agent 开发者成定向目标"
categories: [sec]
description: "Mastra AI Agent开发框架的npm生态系统遭受大规模供应链攻击，超过140个相关包被植入恶意postinstall脚本窃取API密钥。分析攻击链、波及范围和防护建议。"
tags:
  - 供应链攻击
  - npm
  - Mastra
  - AI Agent
  - 投毒
---

Mastra（AI Agent 开发框架）的 npm 生态系统遭受了迄今规模最大的 AI Agent 供应链攻击。超过 **140 个与 Mastra 相关的 npm 包被投毒**，攻击者在包中植入恶意 postinstall 脚本，可在安装时窃取环境变量中的 API 密钥和凭据。

## 攻击概况

| 项目 | 内容 |
|------|------|
| **攻击目标** | Mastra AI Agent 开发框架的 npm 生态系统 |
| **攻击规模** | 140+ 个 npm 包被投毒 |
| **攻击手法** | 恶意 postinstall 脚本窃取环境变量凭据 |
| **披露方** | Microsoft 安全团队 / Cybernews / Security Boulevard |
| **披露日期** | 2026-06-18 |
| **影响对象** | 使用 Mastra 框架的 AI Agent 开发者 |
| **攻击意图** | 定向针对 AI Agent 开发者的供应链投毒 |

## 攻击链分析

根据微软安全团队的详细分析，此次攻击的完整链条如下：

### 初始投毒

攻击者通过某种方式获取了 Mastra npm 包的发布权限（可能的手段包括：维护者账号凭证泄露、npm 令牌泄露、社会工程攻击）。在获取权限后，攻击者在多个 Mastra 核心包和扩展包的安装脚本中插入了恶意代码。

### 恶意载荷：postinstall 脚本

被投毒的包在 `postinstall` 钩子中植入了恶意脚本。当开发者执行 `npm install` 时，npm 会在包安装完成后自动运行 postinstall 脚本。这个脚本的核心功能是：

1. 检查运行环境中的环境变量（`process.env`）
2. 提取包含敏感关键词的环境变量值：`API_KEY`、`OPENAI_API_KEY`、`ANTHROPIC_API_KEY`、`AWS_ACCESS_KEY`、`AZURE_*`、`TOKEN`、`SECRET`、`PASSWORD` 等
3. 将窃取的凭据加密后发送到攻击者控制的远程服务器

### 扩散路径

由于 Mastra 包之间存在紧密的依赖关系，投毒影响迅速扩散：

```
单个受污染核心包
       ↓
被该包依赖的 10+ 中间包间接感染
       ↓
依赖中间包的 100+ 扩展包/示例项目被波及
       ↓
安装任一受感染包的开发者环境被窃取凭据
```

超过 140 个包的总感染面意味着，即使开发者只安装了一个 Mastra 核心包，其依赖树中也可能包含被投毒的包。

## 为什么 AI Agent 开发者是高价值目标

这是攻击者首次**明确将 AI Agent 开发者作为目标**的大规模供应链攻击。背后的考量十分清晰：

**环境变量中存有高价值凭据**：AI Agent 开发者通常在环境变量中配置多个 AI 服务的 API 密钥——OpenAI、Anthropic、Azure OpenAI、Hugging Face 等。这些密钥直接对应金钱（按 token 付费的 API 调用额度）。

**开发环境可信**：开发者的本地环境、CI/CD 环境和内部测试环境通常拥有最高级别的系统权限和网络访问权限。一旦被攻破，攻击者可以从开发环境向生产环境横向移动。

**信用链传递**：被植入后门的 Agent 应用在部署后可能进一步窃取其运行环境中的客户数据，形成二次扩散。

## 对 Mastra 用户的影响

如果你或你的团队在过去一段时间内使用过 Mastra 框架，以下场景可能受到影响：

- 本地开发环境运行过 `npm install mastra-*` 或任何 Mastra 相关包
- CI/CD 流水线在构建过程中自动安装了 Mastra 依赖
- Docker 镜像构建时包含了受影响的 Mastra 包
- 使用基于 Mastra 构建的 Agent 应用的服务器

## 检测与修复

**立即检查**：

1. 检查项目依赖中是否包含 Mastra 相关的 npm 包
2. 检查 lock 文件中包的完整性校验值是否与官方公布的纯净版本一致
3. 检查环境变量和凭据是否已被泄露（观察 API 调用日志中的异常请求）

**修复措施**：

- 立即轮换所有在受影响环境中使用过的 API 密钥和凭据
- 清除 npm 缓存，重新安装经过验证的纯净版本
- 检查 CI/CD 和 Docker 构建历史，确认无残留后门组件
- 审计代码仓库中是否有未授权的提交或异常改动

**长期防护**：

- 对 npm 安装启用完整性验证（使用 `npm audit` signatures 和锁文件）
- 限制开发环境中的 postinstall 脚本执行权限
- 对关键凭据使用专用密钥管理服务（Vault、AWS Secrets Manager），而非环境变量
- 在 CI/CD 中使用最小凭据原则，构建环境不应持有生产环境凭据

## 参考资料

- Cybernews「Mastra npm supply chain attack」，2026-06-18，`https://www.cybernews.com/news/mastra-npm-supply-chain-attack/`
- Microsoft 安全团队分析报告，2026-06-18
- Security Boulevard 相关报道，2026-06-18
- npm 安全文档：`https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities`
