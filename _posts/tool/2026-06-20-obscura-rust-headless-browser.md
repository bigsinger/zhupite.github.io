---
layout: post
title: "Obscura：纯 Rust 无头浏览器引擎，30MB 内存替代 Chrome，AI Agent 抓取利器"
categories: [tool]
description: "Obscura 是一个纯 Rust 编写的轻量级无头浏览器引擎，30MB 内存、85ms 页面加载、即开即用，可作为 Puppeteer/Playwright 的无缝替代品。内置 V8 引擎、CDP 全兼容、反检测模式，专为 AI Agent 自动化和大规模网页抓取设计。"
tags: [Rust, 无头浏览器, 爬虫, AI Agent, CDP, 开源工具]
---

## 一句话

**Obscura** 是用纯 Rust 打造的轻量级无头浏览器引擎，专为 AI Agent 自动化和网页抓取设计。单二进制、无 Chrome、无 Node.js、无任何外部依赖，能真实运行 V8 JavaScript、完整支持 Chrome DevTools Protocol（CDP），可直接作为 Puppeteer 和 Playwright 的无缝替代品。

> h4ckf0r0day/obscura ⭐ 16K | 🦀 Rust | Apache 2.0 | 2026 年 4 月发布

## 为什么需要它？

AI Agent 和大规模网页抓取时代，传统 Headless Chrome 越来越显得笨重：

| 痛点 | 问题 |
|------|------|
| **内存爆炸** | 每个实例 200MB+，大规模并行时直接撑爆 |
| **启动慢** | Desktop Chrome 改装的 headless，启动 ~2s |
| **反爬为零** | 指纹特征明显，navigator.webdriver 一抓一个准 |
| **依赖沉重** | 需要完整 Chrome 安装，CI/CD 和容器化部署痛苦 |
| **二进制巨大** | 300MB+ 体积，Docker 镜像臃肿 |

Obscura 用另一种思路解决这些问题：不要 Blink 渲染引擎，不要完整 Chromium，只拿真正需要的东西——V8 引擎执行 JS、Servo 解析 HTML/CSS、CDP 做协议兼容。

## 性能对比

| 指标 | Obscura | Headless Chrome |
|------|---------|-----------------|
| **内存占用** | **~30 MB** | 200+ MB |
| **二进制体积** | **~70 MB** | 300+ MB |
| **页面加载（静态 HTML）** | **51 ms** | ~500 ms |
| **页面加载（JS+XHR）** | **84 ms** | ~800 ms |
| **启动速度** | **瞬时** | ~2s |
| **反检测能力** | **内置** | 无 |
| **Puppeteer 兼容** | ✅ 即插即用 | ✅ 原生 |

内存降低 85%、速度提升 5-10 倍——这不是渐进式改进，是量级差异。

## 核心功能

### CLI 三件套

Obscura 提供三个核心命令：

**`obscura fetch <URL>`** — 单页抓取
- 支持真实 JS 渲染、自定义 eval、等待条件（wait-until）
- 输出 HTML / Text / Links 三种格式
- 支持 `--selector` 精确提取

**`obscura scrape <URL1> <URL2>...`** — 多页并行抓取
- `--concurrency` 控制并发数
- 统一 eval 表达式作用于所有页面

**`obscura serve`** — CDP WebSocket 服务器
- 监听端口 9222，Puppeteer/Playwright 直接连接
- AI Agent 通过 WebSocket 远程控制

### Stealth 反检测模式

编译时使用 `--features stealth` 开启，运行时 `--stealth` 启用：

- **指纹随机化**：每会话随机化 GPU、Screen、Canvas、Audio、Battery 等参数
- **真实 Chrome 模拟**：`navigator.userAgentData` 使用 Chrome 145 高熵值
- **事件伪装**：`event.isTrusted = true`
- **隐藏自动化标记**：`navigator.webdriver = undefined`
- **原生函数伪装**：`Function.prototype.toString()` 返回 `[native code]`
- **Tracker 阻断**：自动阻隔 3520 个 analytics/ads/telemetry/fingerprinting 域名

### CDP 全兼容

已实现 Chrome DevTools Protocol 的核心 Domain：

| Domain | 关键方法 | 场景 |
|--------|---------|------|
| **Target** | createTarget, closeTarget, attachToTarget | 标签页管理 |
| **Page** | navigate, getFrameTree, addScriptToEvaluateOnNewDocument | 页面导航 |
| **Runtime** | evaluate, callFunctionOn, getProperties | JS 执行 |
| **DOM** | getDocument, querySelector, querySelectorAll | DOM 操作 |
| **Network** | enable, setCookies, getCookies, setUserAgentOverride | 网络控制 |
| **Fetch** | enable, continueRequest, fulfillRequest, failRequest | 请求拦截 |
| **Input** | dispatchMouseEvent, dispatchKeyEvent | 鼠标/键盘输入 |
| **Storage** | get/set/delete Cookies | Cookie 管理 |

## 技术架构

Obscura 采用 Cargo Workspace 多 crate 架构，高度模块化：

```
┌─────────────────────────────────────────────────────┐
│  obscura-cli (clap 命令行入口)                        │
├─────────────────────────────────────────────────────┤
│  obscura-cdp (WebSocket CDP 服务器)                  │
├─────────────────────────────────────────────────────┤
│  obscura-browser (核心胶水层: Page/BrowserContext)    │
├──────────────────┬──────────────────┬────────────────┤
│  obscura-js      │  obscura-dom     │  obscura-net   │
│  (deno_core V8)  │  (Servo 解析器)   │  (reqwest)     │
└──────────────────┴──────────────────┴────────────────┘
```

- **obscura-dom**：使用 html5ever 解析 HTML，selectors 进行 CSS 查询，来自 Mozilla Servo 项目
- **obscura-js**：通过 `deno_core` 嵌入真实 V8 引擎，每个 Page 拥有独立 JS 上下文
- **obscura-net**：reqwest HTTP 客户端，stealth 模式下启用 tracker 阻断
- **obscura-browser**：胶水层，协调 DOM+JS+Net，实现页面生命周期
- **obscura-cdp**：WebSocket 服务器，暴露 CDP 协议
- **obscura-cli**：clap 驱动的 CLI

这就是为什么它能做到 30MB 内存的关键——没有 Blink 渲染引擎、没有多进程架构、没有 GPU 合成器，只保留真正需要的组件。

## 安装方法

### 方式一：预编译二进制（推荐）

从 [GitHub Releases](https://github.com/h4ckf0r0day/obscura/releases) 下载对应平台文件，解压即可运行：

```bash
# Linux x86_64
curl -LO https://github.com/h4ckf0r0day/obscura/releases/latest/download/obscura-x86_64-linux.tar.gz
tar xzf obscura-x86_64-linux.tar.gz
chmod +x obscura

# macOS Apple Silicon
curl -LO https://github.com/h4ckf0r0day/obscura/releases/latest/download/obscura-aarch64-macos.tar.gz
tar xzf obscura-aarch64-macos.tar.gz

# Windows：下载 .zip 解压即可
```

### 方式二：Docker

```bash
docker run h4ckf0r0day/obscura:latest
# 或使用 distroless 基础镜像（约 57MB 压缩）
```

### 方式三：Arch Linux AUR

```bash
yay -S obscura-browser
```

### 方式四：从源码编译

```bash
git clone https://github.com/h4ckf0r0day/obscura.git
cd obscura

# 普通构建
cargo build --release

# 带 Stealth 模式（强烈推荐）
cargo build --release --features stealth
```

要求 Rust 1.75+。首次构建约 5 分钟（V8 从源码编译），后续增量编译很快。

## 使用教程

### 1. 基础抓取

```bash
# 获取页面 HTML
obscura fetch https://example.com --dump html

# 获取页面纯文本
obscura fetch https://example.com --dump text

# 提取所有链接
obscura fetch https://example.com --dump links

# 指定等待条件
obscura fetch https://news.ycombinator.com --wait-until networkidle0
```

### 2. 并发抓取

```bash
# 并发抓取，结果输出 JSON
obscura scrape URL1 URL2 URL3 --concurrency 5 --format json
```

### 3. 反检测模式

```bash
# 开启 stealth（需要编译时带 --features stealth）
obscura fetch https://example.com --stealth
```

### 4. 启动 CDP 服务器 + Puppeteer 集成

终端 1：启动 Obscura
```bash
obscura serve --port 9222 --stealth
```

终端 2：Puppeteer 连接
```javascript
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.connect({
  browserWSEndpoint: 'ws://127.0.0.1:9222/devtools/browser'
});
const page = await browser.newPage();
await page.goto('https://news.ycombinator.com');
console.log(await page.title());
// 真实 JS 执行、Cookie、表单登录全部支持
```

### 5. Playwright 集成

```javascript
import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP({
  endpointURL: 'ws://127.0.0.1:9222'
});
const page = await browser.newPage();
await page.goto('https://example.com');
```

### 6. AI Agent MCP 模式

Obscura 内置 MCP（Model Context Protocol）支持，可直接作为 Claude Desktop 等 AI 工具的浏览器工具：

```bash
obscura mcp --port 8080
```

AI Agent 通过 MCP 调用来控制浏览器，无需额外配置。

### 7. 代理和隐私控制

```bash
# 使用代理
obscura fetch https://example.com --proxy socks5://127.0.0.1:1080

# 遵守 robots.txt
obscura fetch https://example.com --obey-robots
```

## 同类工具对比

| 维度 | Obscura 🏆 | Playwright | Puppeteer | Splash |
|------|-----------|------------|-----------|--------|
| **内核** | V8（内嵌） | Chromium | Chromium | WebKit (Qt) |
| **内存** | **30 MB** | 200+ MB | 200+ MB | ~150 MB |
| **二进制** | **70 MB** | 300+ MB | 300+ MB | ~100 MB |
| **启动** | **瞬时** | ~2s | ~2s | ~1s |
| **反检测** | **内置** | ❌ | ❌ | ❌ |
| **CDP** | ✅ 原生实现 | ✅ 通过 Chrome | ✅ 通过 Chrome | ❌ 专有 API |
| **MCP/AI Agent** | ✅ 原生支持 | ❌ | ❌ | ❌ |
| **部署** | **单二进制** | 需 Chrome | 需 Chrome | 需依赖 |
| **并行抓取** | ✅ 内置 worker | ⚠️ 手动 | ⚠️ 手动 | ⚠️ 需 Lua |
| **许可** | Apache 2.0 | Apache 2.0 | Apache 2.0 | MIT |

## 适用场景

### AI Agent 的浏览器能力

Obscura 的设计原点就是为 AI Agent 提供浏览器能力。内置 MCP 协议支持，Agent 可以直接用自然语言控制浏览器——翻页、填表、登录、截图、提取数据。传统方案需要 Agent 启动 Chrome 实例、管理 CDP 连接、处理反爬，Obscura 把这些全打包了。

### 大规模数据采集

30MB 内存意味着单机可以跑 30+ 个实例而不会 OOM。配合 `obscura scrape` 的并行能力和 `--stealth` 的反检测模式，这是目前最适合大规模采集的开源方案。

### CI/CD 测试

不需要在 CI 环境里安装 Chrome，一个二进制文件搞定。Docker 镜像基于 distroless/cc，只有 57MB。

### 反爬绕过

内置 stealth 模式 + 3520 个 tracker 域名阻断 + 指纹随机化，不需要额外配置中间人代理或搞 patch。编译时启用了 `stealth` feature 后，一行 `--stealth` 搞定。

## 一些值得注意的点

- **增长极快**：发布 2 个月获得 16K Stars，v0.1.1 单版本下载 2.4 万次，总下载量超 5.4 万
- **社区活跃**：30+ 贡献者，164 个 PR，Issues 只有 4 个（处理速度很快）
- **商业化路线清晰**：已宣布 Obscura Cloud 托管版本，但开源引擎保持 Apache-2.0 且功能完整——"No feature gating, ever"
- **5 家代理服务商赞助**：Swiftproxy、ProxyEmpire、MangoProxy 等，说明在代理/爬虫圈里已经有了认可度
- **30+ 贡献者**中核心开发者 SGavrl 提交 108 commits，项目创建者 h4ckf0r0day 提交 26 次

## 局限性

- **仍在早期开发中**：v0.1.x，API 可能变化
- **不是全家桶**：没有 Playwright/Puppeteer 那样的丰富断言库和定位器
- **JS 兼容性**：deno_core 的 V8 集成 vs 完整 Chromium Blink 渲染，某些极端场景可能表现不一致
- **Stealth 模式需要编译时开启**：预编译二进制默认不带 stealth，需自行 `cargo build --features stealth`

## 总结

Obscura 是一个聚焦的场景化工具——它不做完整浏览器，只做 AI Agent 和抓取需要的那部分。这个取舍带来了量级级别的性能优势，也让它在这两个场景上比 Chrome 更合适。

如果你的场景是：
- 需要让 AI Agent 操控浏览器 ✅
- 大规模页面抓取，内存是瓶颈 ✅
- CI/CD 里不想装 Chrome ✅
- 需要反爬/反检测 ✅

那 Obscura 值得一试。

如果场景是需要完整的 CSS 渲染、复杂的用户交互测试、跨浏览器兼容性测试——Playwright 还是更好的选择。

工具没有好坏，只有合不合适。

---

**项目地址**：[github.com/h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura)

**参考资料**
- 原文：[mp.weixin.qq.com/s/NUEohrYRxKTb2QJ6eHQ-yg](https://mp.weixin.qq.com/s/NUEohrYRxKTb2QJ6eHQ-yg)
- GitHub API 数据：stars 15,964 / forks 1,091 / Apache-2.0 / 2026-04-13 创建
- Hacker News 讨论：`news.ycombinator.com/item?id=47895561`
