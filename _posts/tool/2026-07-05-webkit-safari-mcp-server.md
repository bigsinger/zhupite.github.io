---
categories: [tool]
title: WebKit 发布 Safari MCP 服务器：17 个工具让 AI Agent 直接调试浏览器
description: Apple 的 WebKit 团队在 Safari Technology Preview 247 中发布了首个主流浏览器引擎原生的 MCP 服务器，提供 17 个工具供 AI 编码 Agent 直接连接活动浏览器窗口，实时读取 DOM、检查网络请求、捕获截图和执行 JavaScript，无需开发者手动描述问题。
tags: [MCP, Safari, WebKit, AI Agent, 浏览器调试, Apple, WebDriver]
---

## 一句话结论

Apple 的 WebKit 团队发布了 **Safari MCP 服务器**——首个由主流浏览器引擎原生内置的 MCP（Model Context Protocol）服务器。提供 17 个工具，让 AI 编码 Agent（Claude、Codex、Gemini 等）直接连接到活动 Safari 窗口，实时读取 DOM、检查网络请求、查看控制台日志、捕获截图和执行 JavaScript，彻底消除传统调试中"手动描述 Bug → Agent 猜测 → 修复不完整"的循环。

> **来源说明**：原文 PPC Land URL 不可达。本文通过 Google News RSS 定位，经 r.jina.ai 提取 WebKit 官方公告、MacRumors、Tech Times、MacStories 等多篇报道综合成文。

## 事件

2026 年 7 月 1 日，WebKit 团队（由 Saron Yitbarek 执笔）在 Safari Technology Preview 247 中发布了 Safari MCP 服务器。这是继 2025 年 9 月 Google 推出 Chrome DevTools MCP（仍为公开预览）之后，第二个主流浏览器引擎的 MCP 集成——且是以**原生方式**内置在浏览器引擎层。

## 17 个工具一览

Safari MCP 服务器提供 17 个工具，覆盖调试全流程：

| 类别 | 工具 | 功能 |
|------|------|------|
| **导航** | navigate_to_url | 导航到指定 URL |
| | create_tab | 创建新标签页（可指定 URL） |
| | close_tab | 关闭标签页 |
| | switch_tab | 切换标签页 |
| | list_tabs | 列出所有标签页 |
| **页面检查** | get_page_content | 提取页面文本内容（Markdown/HTML/JSON） |
| | page_info | 获取当前页面的 URL、标题和加载状态 |
| | screenshot | 捕获当前页面截图（PNG） |
| **DOM 交互** | page_interactions | 执行序列化 DOM 交互（点击、输入、滚动、悬停） |
| | evaluate_javascript | 在页面中执行 JavaScript 并返回结果 |
| **运行时** | browser_console_messages | 返回控制台日志 |
| | browser_dialogs | 列出并响应浏览器对话框（含 JavaScript 提示） |
| **网络** | list_network_requests | 列出当前标签页的网络请求摘要 |
| | get_network_request | 获取单个网络请求的完整详情（含 Headers、Body、时序） |
| **布局测试** | set_viewport_size | 设置视口大小 |
| | set_emulated_media | 模拟 CSS 媒体类型（如 print） |
| | wait_for_navigation | 等待页面加载完成 |

## 架构设计

### 不是新的二进制文件

Safari MCP 服务器并非全新的工具，而是构建在 **safaridriver** 之上——Apple 从 Safari 10（2016 年）开始内置的 W3C WebDriver 实现。WebKit 团队为其添加了一个 `--mcp` 标志，使其使用 MCP 协议（JSON-RPC 2.0 over stdio）代替传统的 WebDriver REST API。

### 会话隔离

- 服务器创建一个**专用自动化窗口**，与用户的正常 Safari 窗口完全隔离
- 隔离通过 Apple 的 XPC 进程间通信层在操作系统级别强制执行
- Agent **无法访问** AutoFill 数据、保存的密码、浏览历史等个人信息
- 页面内容、截图、控制台数据直接发给连接的 Agent，**不发送给 Apple**

### 与 Chrome DevTools MCP 的对比

| 维度 | Safari MCP | Chrome DevTools MCP |
|------|-----------|-------------------|
| 底层协议 | WebDriver（W3C 标准） | Chrome DevTools Protocol |
| 通信方式 | stdio 子进程 | WebSocket 调试端口 |
| 资源占用 | 会话期间才启动 | Chrome 需持续运行，Apple Silicon 上 CPU 占用 40-60% |
| 会话隔离 | 专用隔离窗口，无法访问个人数据 | 可连接到用户现有认证会话 |
| 状态 | Safari Technology Preview | 公开预览（2025 年 9 月起） |
| 平台 | 仅 macOS | 跨平台 |

## 五大官方用例

WebKit 官方列出了五个设计场景：

1. **Safari 中开发**：Agent 帮助编写的代码可直接在 Safari 中检查渲染效果
2. **兼容性测试**：Agent 可打开站点，检查计算样式和布局，无需开发者手动切换窗口
3. **性能分析**：Agent 执行 JavaScript 评估导航时序和资源加载时间
4. **可访问性检查**：检查缺失的标签、错误的 ARIA 属性和对比度问题
5. **用户状态验证**：确认表单状态、页面元素和交互流程（如结账流程）的正确性

## 安装与使用

### 前置条件

- 安装 **Safari Technology Preview**（与稳定版 Safari 可并存运行）
- 启用开发者设置：Safari 设置 → 高级 → 为 Web 开发者显示功能
- 启用远程自动化：Safari 设置 → 开发者 → 启用远程自动化和外部代理

### 连接命令

**Claude 用户**：
```bash
/Applications/Safari\ Technology\ Preview.app/Contents/MacOS/safaridriver --mcp
```

**Codex 用户**：等效命令

**其他 MCP Agent**：通过 JSON 配置片段引用 safari-mcp-stp

### 无需显式指令

Agent 安装后，简单的自然语言指令即可触发使用：
- "在我的 Safari 站点上找 Bug"
- "我的站点在 Safari 中可访问性如何？"
- "看看我的网站在 Safari 中的性能表现"

## 行业意义

### 1. 主流浏览器引擎首次原生支持 MCP

这是主流浏览器引擎首次将 MCP 协议内置到浏览器层。此前 MCP 主要用于工具/数据源集成，而 Safari MCP 将 Agent 直接连接到浏览器渲染引擎本身——一个重大的应用场景扩展。

### 2. Apple 的 MCP 布局完成

- **Xcode 27** 已原生内置 MCP 实现（mcpbridge 二进制）
- **Safari MCP** 补齐了浏览器端
- Apple 成为唯一在 IDE 和浏览器两端都提供第一方 MCP 支持的厂商

### 3. 推动跨浏览器 Agent 调试标准

WebKit 的举措可能推动：
- **Chromium** 将 DevTools MCP 从公开预览升级为稳定功能
- **Firefox** 跟进实现自己的 MCP 服务器
- 形成跨浏览器的 Agent 调试共同标准

### 4. 从"人工描述"到"Agent 自主观察"

Safari MCP 的根本性改变：**Agent 不再依赖开发者描述 Bug，而是自己观察浏览器状态**。这与 Anthropic Fable 5 中"设计时安全"的理念异曲同工——都指向 Agent 能力的边界扩张。

## 局限

- **仅 Safari Technology Preview**：尚未进入稳定版 Safari
- **仅 macOS**：safaridriver 不运行在 Windows 或 Linux 上
- **单会话限制**：一次只能运行一个自动化会话
- **无认证会话访问**：自动化窗口无法使用保存的密码——调试需要登录的功能时需要额外处理
- **提示词注入风险**：恶意网页可在 Agent 检查时注入指令。WebKit 的建议：只连接你信任的 Agent

## 参考

- PPC Land（原文，不可达）：[WebKit ships Safari MCP server with 17 tools for AI debugging agents](https://ppc.land)（2026-07-05）
- WebKit 官方公告：[Introducing the Safari MCP server for web developers](https://webkit.org/blog/18136/introducing-the-safari-mcp-server-for-web-developers/)（2026-07-01）
- MacRumors：[Apple Releases Safari Technology Preview 247 With MCP Server for AI Agent Integration](https://www.macrumors.com/2026/07/01/apple-releases-safari-technology-preview-247/)（2026-07-01）
- Tech Times：[Safari Gives AI Agents a Live Browser Window: 17 Tools, No Apple Cloud](https://www.techtimes.com)（2026-07-02）
- MacStories：[Safari's New MCP Server Is Great for Agents](https://www.macstories.net)（2026-07-02）
- Google：[Chrome DevTools MCP server](https://developer.chrome.com/blog/chrome-devtools-mcp)（2025-09）
