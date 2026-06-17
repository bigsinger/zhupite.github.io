---
layout: post
title: "BrowserAct：专为 AI Agent 设计的浏览器自动化 CLI，三层反检测 + 人机接力 + 多账号隔离"
categories: [tool]
description: "BrowserAct 是一个面向 AI Agent 的浏览器自动化 CLI 工具，提供 Stealth 反检测浏览器、Chrome 登录态复用、人机接力处理验证码、多账号独立隔离等特性。支持 20 任务并发，配套 Skill Forge 可沉淀可复用流程。MIT 协议。"
tags:
  - BrowserAct
  - 浏览器自动化
  - AI Agent
  - 反检测
  - 开源
  - 效率工具
  - CLI
---

AI Agent 操控浏览器这个方向，说起来很美好——让 Agent 自动填表单、抓数据、操作网页。但真正跑起来，问题一个接一个：打开的浏览器没有登录态、页面还没加载完 Agent 就开始找元素、遇到验证码直接中断任务、多账号场景切换混乱。

这不是模型能力不够，而是缺少一个**稳定的浏览器执行层**。

[**BrowserAct**](https://github.com/browser-act/skills) 正是为解决这个问题而生的——一套为 AI Agent 设计的真实浏览器自动化 CLI。它不是一个简单的浏览器控制工具，而是一个**带反检测、可人机接力、支持多账号隔离的完整执行环境**。

---

## 一、解决的问题

当前 AI Agent 操控浏览器的常见困境：

| 问题 | 表现 | BrowserAct 的方案 |
|------|------|------------------|
| 反爬拦截 | Cloudflare、WAF 等直接拦截 Agent 访问 | 三层反检测体系：环境层 → 执行层 → 人工层 |
| 页面动态加载 | JS 渲染内容 curl/web_fetch 拿不到 | 真实浏览器引擎，完整渲染 |
| 验证码 / 扫码 | 遇到就中断，任务从头再来 | 人机接力：远程链接让人处理，Agent 继续 |
| 登录态丢失 | 每次启动浏览器都要重新登录 | Chrome 模式复用本地登录态 |
| 多账号混乱 | Cookie、代理、指纹互相串 | 独立浏览器环境，完全隔离 |
| 并发冲突 | 多个任务争抢浏览器 Session | 最多 20 任务并发，各走各的 Session |

---

## 二、核心功能

### 1. 三层反检测突破体系

| 层级 | 机制 | 解决什么问题 |
|------|------|------------|
| **环境层** (Layer 1) | Stealth 指纹伪装、TLS 轮换、代理切换 | 绝大多数拦截根本不会触发 |
| **执行层** (Layer 2) | 自动验证码求解、一步提取受保护页面 | 需要验证的页面也能拿到数据 |
| **人工层** (Layer 3) | 生成远程链接，人在任意设备接管 | 最后一道防线，不留死角 |

### 2. 三种浏览器模式

BrowserAct 不搞「通用浏览器」，而是按真实场景设计了三种模式：

| 模式 | 适用场景 | 核心特点 |
|------|---------|---------|
| **Chrome 模式** (`chrome`) | 复用本地 Chrome 登录态 | 导入本地 Profile 或 CDP 附加，免登录 |
| **Stealth 隐身模式** (`stealth` privacy) | 批量采集，无需登录 | 每次全新指纹 + 代理轮换，零残留 |
| **Stealth 固定身份** (`stealth` fixed) | 长登录、多账号并行 | 固定指纹 + 固定 IP，不被标记为 Bot |

### 3. 人机接力（Remote Assist）

遇到扫码登录、短信验证、CAPTCHA 这类必须人处理的步骤时，Agent **不会直接失败**。它会生成一个远程链接，你把链接发给任何人或自己在其他设备打开，完成验证后 Agent 继续在同一浏览器 Session 执行，**不需要从头开始**。

### 4. 多任务并发 & 多账号隔离

- **跨浏览器并行**：独立的 Cookie、指纹、代理，网站无法关联
- **同浏览器多 Session**：共享登录态，独立执行，互不阻塞
- **隐身模式**：每次全新指纹 + 空 Profile，跑完零残留
- 支持同时运行最多 **20 个工作流**

### 5. 为 Agent 推理优化的交互

BrowserAct 的 CLI 输出不是传统 JSON/HTML 格式，而是：

- **索引化文本**：`state` 命令返回带索引的元素列表，Agent 可以直接 `click 3` 或 `input 2 "hello"`，不需要解析 DOM
- **语义记忆**：每个浏览器携带 `desc` 描述，按语义匹配任务
- **并发安全**：Session 所有权 + 显式命名，多 Agent 操作不会冲突

### 6. Skill Forge：流程沉淀

配套的 [**Skill Forge**](https://github.com/browser-act/skills/tree/main/browser-act-skill-forge) 可以把跑通的浏览器操作流程打包成可复用的 Skill。下次直接调用，不需要重新探索。已经有一个 30+ 预置 Skill 的方案目录，覆盖 Amazon、Google Maps、YouTube、Reddit、知乎等常见站点。

### 7. 安全确认门（Confirmation Gate）

敏感操作——创建/删除浏览器、导入 Profile、修改代理、安全隐私开关——需要**用户显式确认**。每次独立决策，不凭之前的授权自动放行。

---

## 三、快速安装

### 前提

- Python 3.12+
- uv 包管理器

### 安装

```bash
uv tool install browser-act-cli --python 3.12
```

或者在 Claude Code / Cursor 等 Agent 环境中，直接告诉 Agent：

> Install browser-act. Skill source: https://github.com/browser-act/skills/tree/main/browser-act . Verify it works after installation.

### 快速开始

```bash
# 提取受保护页面内容
browser-act stealth-extract https://example.com

# 打开浏览器并导航
browser-act --session my-task browser open <id> https://example.com

# 查看可交互元素
browser-act --session my-task state

# 按索引点击
browser-act --session my-task click 3

# 填写输入框
browser-act --session my-task input 2 "hello world"
```

### 加载技能信息

```bash
browser-act get-skills core --skill-version 2.0.2
```

这个命令会在每个会话开始时运行，获取环境状态、可用浏览器列表、操作指南。

---

## 四、定价模式

BrowserAct 采用**大部分功能免费**的策略：

| 功能 | 免费 (无需注册) | 免费 (登录) | 付费 |
|------|:--------------:|:----------:|:----:|
| 浏览器自动化 (Chrome / Chrome-Direct) | ✅ | ✅ | ✅ |
| Stealth 浏览器 (≤5 个) | — | ✅ | ✅ |
| stealth-extract | — | ✅ | ✅ |
| solve-captcha / remote-assist | — | ✅ | ✅ |
| Privacy 模式 / Skill Forge | — | ✅ | ✅ |
| Stealth 浏览器 (>5 个) | — | — | ✅ |
| 动态代理 / 静态代理 | — | — | ✅ |

Star 了仓库后在 Discord 可领 **500 免费积分**。

---

## 五、与同类工具对比

| 维度 | BrowserAct | Playwright | Puppeteer | Selenium |
|------|-----------|-----------|-----------|----------|
| 反检测/反爬 | ✅ 三层体系 | ❌ 原生暴露 | ❌ 原生暴露 | ❌ 原生暴露 |
| 人机接力 | ✅ Remote Assist | ❌ | ❌ | ❌ |
| Agent 优化输出 | ✅ 索引化文本 | ❌ DOM/JSON | ❌ DOM/JSON | ❌ DOM/JSON |
| 多账号隔离 | ✅ 独立浏览器环境 | 需手动 | 需手动 | 需手动 |
| 并发模型 | ✅ 20 任务内置 | 需自行实现 | 需自行实现 | 需自行实现 |
| 安装复杂度 | ⭐ `uv tool install` | ⭐⭐ npm | ⭐⭐ npm | ⭐⭐⭐ 需驱动 |
| 协议 | MIT | Apache 2.0 | Apache 2.0 | Apache 2.0 |

---

## 六、适合谁用

- **AI Agent 开发者**：需要让 Agent 操控真实浏览器获取数据、填写表单
- **爬虫/采集场景**：频繁被反爬拦截，需要 Stealth 指纹 + 代理轮换
- **多账号运营**：需要在独立浏览器环境中隔离管理多个账号
- **网页自动化测试**：需要比 Playwright 更强的反检测能力
- **Agent Skill 作者**：想把浏览器操作流程沉淀为可复用 Skill

---

**项目地址**：[GitHub - browser-act/skills](https://github.com/browser-act/skills)

**官网**：[www.browseract.com](https://www.browseract.com)

**CLI 包**：`browser-act-cli` v0.1.30（PyPI）

**许可证**：MIT 协议
