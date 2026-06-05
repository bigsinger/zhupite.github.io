---
layout: post
title: "OpenCLI — 把任意网站变成 CLI，让 AI Agent 操控你的浏览器"
categories: [tool]
description: "OpenCLI 是一个将网站转化为 CLI 命令的开源工具，内置 100+ 网站适配器，同时可作为 AI Agent 的浏览器操控接口，让 Agent 像人一样操作网页。免费、开源、基于 Node.js。"
keywords: OpenCLI, CLI, 浏览器自动化, AI Agent, 网站适配器, browser-use, 开源工具
tags:
  - OpenCLI
  - CLI工具
  - 浏览器自动化
  - AI Agent
  - 开源
---

## OpenCLI 是什么

[OpenCLI](https://github.com/jackwener/OpenCLI) 是一个将**任意网站转化成 CLI 命令**的开源工具。它本质上做了三件事：

1. **把网站数据变成终端命令** — 通过内置适配器，直接 `opencli bilibili hot` 就能获取 B 站热搜，无需写爬虫
2. **让 AI Agent 操控浏览器** — Agent 可以像人一样导航、点击、填表单、提取内容
3. **统一管理本地 CLI 工具** — 把 `gh`、`docker` 等命令行工具纳入同一个入口

项目使用 JavaScript 编写，遵循 Apache-2.0 协议，目前 GitHub 上已有 **23,500+ Star**，社区活跃。

> 一句话：让网站像 API 一样可调用，让 AI 像人一样操作浏览器。

## 核心特性

### 1. 100+ 内置网站适配器

覆盖国内外主流平台，无需写代码即可通过命令行获取数据：

| 类别 | 网站 |
|------|------|
| 社交媒体 | 小红书、B站、知乎、Twitter/X、Reddit、微博、LinkedIn |
| 资讯 | HackerNews、掘金、虎扑 |
| 电商 | 1688、Amazon |
| 搜索/学术 | Google Scholar、DuckDuckGo |
| 娱乐 | Spotify、Chess.com、小宇宙 |
| 网盘 | 夸克网盘 |
| AI工具 | Claude、Gemini、NotebookLM |

以 `opencli zhihu hot -f json` 这样的方式即可获取知乎热搜，支持 `table`（默认）、`json`、`yaml`、`md`、`csv` 五种输出格式。

### 2. AI Agent 浏览器操控

这是 OpenCLI 最出彩的能力 — 安装 `opencli-browser` skill 后，AI Agent（Claude Code、Cursor 等）就能操控你的浏览器：

- **导航**：打开任意 URL
- **读取**：结构化 DOM 快照（不是截图，是可交互的文本结构）
- **交互**：点击按钮、填写表单、选择下拉、按键操作
- **提取**：从页面抓取数据或拦截网络 API 响应
- **等待**：等待元素出现、文本变化、页面跳转

所有的 `opencli browser` 命令由 Agent 内部处理，你只需要用自然语言描述需求。

### 3. 适配器开发框架

如果需要适配的网站不在内置列表中，可以使用 `opencli-adapter-author` skill 来编写自己的适配器，流程：

1. **侦察** — 分析网站是 SPA / SSR / JSONP 还是其他模式
2. **发现** — 找到正确的 API 端点
3. **选认证方式** — PUBLIC / COOKIE / INTERCEPT / UI / LOCAL
4. **解码字段** — 设计输出列
5. **验证** — `opencli browser recon verify`

适配器数据持久化到 `~/.opencli/sites/<site>/`，下次为同一站点写适配器时可直接复用上下文。

### 4. 插件系统

社区可以贡献第三方插件，通过以下方式管理：

```bash
opencli plugin install github:user/opencli-plugin-my-tool
opencli plugin list
opencli plugin update --all
opencli plugin uninstall my-tool
```

已支持的社区插件包括 GitHub Trending、多平台热搜聚合器、稀土掘金文章、VK 等。

### 5. 下载功能

支持从多个平台下载媒体内容：

```bash
opencli xiaohongshu download <url> --output ./xhs
opencli bilibili download BV1xxx --output ./bilibili
opencli twitter download elonmusk --limit 20 --output ./twitter
opencli zhihu download <url>                    # Markdown 导出
```

## 快速上手

```bash
# 1. 安装（需要 Node.js >= 20）
npm install -g @jackwener/opencli

# 2. 安装浏览器桥接扩展（Chrome 应用商店或手动安装）
opencli doctor    # 验证安装

# 3. 运行你的第一条命令
opencli list                       # 查看所有可用命令
opencli hackernews top --limit 5   # 获取 HackerNews 热榜
opencli bilibili hot -f json       # 以 JSON 格式输出 B 站热搜
```

浏览器桥接通过 Chrome 扩展 + 本地守护进程实现，守护进程在需要时自动启动。

## 使用场景

| 场景 | 说明 |
|------|------|
| **日常信息获取** | 在终端查看热搜、刷论坛、查商品，无需打开浏览器 |
| **数据采集** | 通过 JSON 格式输出，配合 jq 等工具做数据处理 |
| **AI Agent 自动化** | 让 Agent 登录网站、填写表单、提取数据、发送消息 |
| **适配器开发** | 为无 API 的网站写适配器，让它变成可编程接口 |
| **CLI 入口统一** | 将 `gh`、`docker`、`notion` 等工具统一到 `opencli` 入口 |

## AI Agent 集成

OpenCLI 提供了多个 Agent 技能：

| Skill | 用途 |
|-------|------|
| **opencli-browser** | 操控浏览器 — 导航、点击、填表、提取 |
| **opencli-browser-sitemap** | 使用站点地图导航 |
| **opencli-adapter-author** | 编写新网站适配器 |
| **opencli-autofix** | 修复已损坏的适配器 |
| **opencli-usage** | 快速参考所有命令 |

安装方式：

```bash
npx skills add jackwener/opencli
```

Agent 使用你的已登录 Chrome 会话操作网页，不需要额外的 API Key。

## 优劣势分析

### 优势

| 优势 | 说明 |
|------|------|
| **即装即用** | 100+ 内置适配器，零代码获取网站数据 |
| **浏览器复用** | 利用已登录的 Chrome 会话，无需处理认证 |
| **Agent 友好** | 结构化输出（JSON/YAML/CSV），Agent 可直接消费 |
| **低门槛开发** | 适配器框架有完整的脚手架，新手也能快速上手 |
| **统一入口** | 替代 `curl` + 爬虫 + 多个 CLI 的零散方案 |

### 劣势

| 劣势 | 说明 |
|------|------|
| **依赖浏览器** | 浏览器桥接需要 Chrome/Chromium，无头环境受限 |
| **Node.js 门槛** | 需要 Node.js >= 20，非前端开发者需要安装运行时 |
| **网站适配器维护** | 网站改版可能导致内置适配器失效，需要及时更新 |
| **Chrome 扩展依赖** | 必须安装浏览器扩展，对部分企业环境不够友好 |

## 适合谁用

- **终端重度用户** — 习惯在命令行工作的开发者
- **AI Agent 使用者** — 需要让 Agent 操作网页的 Claude Code / Cursor 用户
- **爬虫工程师** — 不想处理反爬，直接复用浏览器会话获取数据
- **数据爱好者** — 想快速从各平台获取结构化数据做分析
- **效率追求者** — 想用一个命令代替打开 N 个浏览器标签页

## 总结

OpenCLI 的核心理念很简单：**让网站像本地命令一样可调用**。它不只是一个爬虫工具，也不只是一个浏览器自动化框架，而是一个三层架构的统一入口 — 对普通用户来说是 CLI 工具，对 AI Agent 来说是浏览器接口，对开发者来说是适配器平台。

如果经常需要在各个网站间来回切换获取信息、或者想让 AI Agent 帮你操作网页，OpenCLI 值得一试。
