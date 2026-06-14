---
layout: post
title: "NanoClaw 联手 JFrog：为 AI Agent 引入供应链安全「免疫系统」"
categories: [sec]
description: "NanoClaw（OpenClaw 轻量级版本）宣布与 JFrog 集成，在 Agent 安装第三方包/技能前自动扫描依赖树中的已知漏洞和恶意代码。Agent 下载恶意包时返回 403 拦截并自动重定向到安全版本，无需人工干预。"
tags:
  - NanoClaw
  - JFrog
  - 供应链安全
  - Agent安全
  - OpenClaw
  - 包管理
  - 漏洞防护
---

AI Agent 正在变得越来越自主——它们自动安装包、加载技能、连接 MCP 服务器、执行命令。而这种自主性恰好是攻击者最喜欢利用的盲区：**Agent 在后台下载依赖，没有人类去检查这些包是否安全。**

2026 年 6 月 12 日，NanoClaw（OpenClaw 的企业友好轻量版）宣布与软件供应链安全管理领导者 JFrog 合作，为 Agent 的包安装流程引入自动化安全扫描机制。JFrog 首席战略官 Gal Marder 将其称为 Agent 的 **"免疫系统"**——不是教 Agent 识别每一个零日漏洞，而是让 Agent 根本无法触及恶意代码。

> **来源：** VentureBeat、BackBox.org News（2026.06.12）

---

## 一、背景：Agent 供应链的"信任空白"

2026 年初的 OpenClaw CVE 危机（CVE-2026-25253 等 6 个严重漏洞暴露了 40,000+ 互联网实例）揭示了一个更深层的问题：**Agent 包管理缺乏最基本的供应链安全机制。**

传统软件开发的供应链安全有成熟的工具链——Snyk 扫描 npm 依赖、Trivy 扫容器镜像、Dependabot 自动 PR。但 Agent 的"技能包"和"插件"的供应链安全几乎是空白：

- Agent 自动安装 CLI 工具、MCP 服务器、Python 包——全程无人工审查
- Agent 的操作者可能不是开发者，不知道自己在安装什么
- 攻击者污染开源注册表（如 CanisterWorm 攻击、Axios 包投毒），Agent 作为自动化实体是理想的受害者

> "These agents are doing things that you cannot necessarily control, and you cannot necessarily train." —— Gal Marder, JFrog 首席战略官
>
> "The people who are operating the agents are not necessarily developers, and they are not even aware of the implications." —— Gavriel Cohen, NanoClaw 创始人

## 二、合作方案：Agent 的"免疫系统"

### 工作流程

NanoClaw Agent 的所有软件包请求被**硬路由到 JFrog 的注册表**，而非直接访问公共源：

```
Agent 尝试安装 package
    ↓
请求被路由到 JFrog 注册表
    ↓
JFrog 扫描依赖树：已知漏洞？恶意代码签名？
    ↓
┌─ 安全 ──→ 放行，正常安装
└─ 危险 ──→ 返回 403 错误 + 自动重定向到已批准的安全版本
```

**关键设计：** 不是给 Agent 装一个杀毒软件让它自己判断，而是在基础设施层面让 Agent **无法下载到恶意包。** 这符合 NanoClaw 一贯的安全哲学——环境隔离优于行为检测。

### 双轨模式

| 模式 | 面向 | 费用 | 说明 |
|------|------|------|------|
| **开源社区版** | 个人开发者/社区 | 免费 | 可访问 JFrog 审核后的安全工具、技能包。社区上传的技能需经过扫描才能被他人使用 |
| **企业版** | 企业部署 | 商业 JFrog 许可 | Agent 指向企业内部 JFrog 注册表，遵循企业安全策略和合规要求 |

### 错误处理

当 Agent 尝试安装一个被阻止的包时，JFrog 返回 `403 security policy` 错误，同时自动引导 Agent 安装已批准的替代版本。整个过程**不需要人为干预**——Agent 自身的重试逻辑会处理这个重定向。

## 三、为什么是 NanoClaw

NanoClaw 不是第一个提出 Agent 安全框架的项目，但它是第一个将供应链安全集成到 Agent 包管理基础设施中的。

NanoClaw 本身的设计哲学就是**安全优先**：

- **只读默认**：写操作需要显式授权
- **容器隔离**：每个 Agent 会话运行在独立的 Docker 容器中
- **权限最低**：Agent 只能访问显式挂载的目录

与 JFrog 的集成是这一哲学的延伸——**从"Agent 行为安全"扩展到"Agent 所依赖的代码本身的安全"。**

此前 NanoCo（NanoClaw 背后的公司）已经与 **Vercel**（跨 15 个消息应用的权限对话框）和 **Docker**（安全容器运行环境）建立了合作。JFrog 的加入补齐了供应链安全这个关键拼图。

## 四、对 OpenClaw 生态的意义

OpenClaw 生态在 2026 年上半年经历了一场安全信任危机——512 个漏洞、6 个 CVE、40,000+ 实例暴露在公网。NanoClaw 作为"从安全出发重写"的替代方案，正试图建立一套可复用的 Agent 安全基础设施。

这次与 JFrog 的集成有几个值得关注的信号：

1. **安全基础设施正在成为 Agent 平台的差异化竞争点**——不仅仅是"功能多少"，更是"下载一个技能包安不安全"
2. **供应链安全从"开发者的责任"变成"平台的责任"**——Agent 自动安装依赖时，平台应该替用户做安全检查，而不是让用户自己决定
3. **企业级 Agent 部署的门槛在降低**——合规和安全审计是企业在生产环境部署 Agent 的最大障碍之一，JFrog 集成直接解决了"Agent 用了什么包、谁批准的、有没有漏洞"这个问题

> "A system of record, we need somewhere to track what agents are running by whom and consuming what packages and using what skills and using what MCPs." —— Gal Marder

## 五、局限与展望

### 当前局限

- **仅覆盖 JFrog 注册表中的包**：如果 Agent 从其他源（GitHub Releases、PyPI 直装）下载，此集成不生效
- **依赖 JFrog 的扫描能力**：零日漏洞在 JFrog 扫描规则更新前仍然可能绕过
- **社区版与企业版的体验差异**：免费版能访问的包范围由 JFrog 审核控制，灵活性有限
- **MCP 服务器层面的供应链安全尚未覆盖**：目前主要针对软件包依赖，MCP 服务器的恶意行为不在扫描范围内

### 值得关注的方向

- 如果这个集成模式被证明有效，其他 Agent 平台（OpenClaw、ZeroClaw 等）可能会跟进类似的供应链安全机制
- JFrog 作为跨语言的制品仓库，理论上可以将同样的安全扫描能力扩展到 Agent 生态中的 npm、PyPI、Docker 镜像等
- Agent 的"技能包评分系统"可能随之出现——类似 npm 包的下载量、维护频率、漏洞历史等指标的 Agent 版本

## 总结

NanoClaw 与 JFrog 的合作不是一个孤立的产品集成，它标志着一个趋势：**AI Agent 的安全，正在从"提示词安全"向"供应链安全"延伸。**

当 Agent 越来越自主——自动下载工具、自动加载技能、自动连接外部服务——传统的"人肉审核"模式就失效了。NanoClaw + JFrog 的"免疫系统"思路——在基础设施层面阻断恶意代码，而不是指望 Agent 自己能识别风险——可能是 Agent 供应链安全的正确方向。

对于正在部署 Agent 的企业来说，这也是一个值得关注的信号：Agent 平台的安全能力正在从"要不要安全"进化到"安全能做到什么程度"。
