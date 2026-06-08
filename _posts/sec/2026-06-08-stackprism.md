---
layout: post
title: "StackPrism（栈棱镜）：开源网页技术栈识别浏览器扩展 —— 从 6 个维度透视任意网站的技术构成"
categories: [sec]
description: "基于 Manifest V3 的浏览器扩展，从页面运行时、DOM、资源URL、响应头、动态加载和JS版权注释6个维度识别网站技术栈。支持Chrome/Edge/Firefox，内置2000+识别规则，覆盖50+技术类目。"
keywords: StackPrism, 栈棱镜, 网页技术栈识别, 浏览器扩展, Chrome扩展, Manifest V3, Wappalyzer替代
tags: [sec, open-source, StackPrism, 技术栈识别, Chrome扩展, 安全研究, 开源]
---

# StackPrism（栈棱镜）：开源网页技术栈识别浏览器扩展

## 项目介绍

**StackPrism（栈棱镜）** 是一款基于 **Manifest V3** 的网页技术栈识别浏览器扩展，支持 **Chrome / Edge / Firefox** 三大浏览器。

它的核心能力是：**访问任意网站，一眼看穿这个网站用了什么前端框架、后端技术、CDN、SaaS、分析工具和安全配置。** 它不是简单的 HTML 资源 URL 匹配，而是从 **6 个维度**并行收集线索，合并去重后按 50+ 个类目分组展示。

> 项目名称"栈棱镜"的寓意：像棱镜一样，把网页背后无形的技术栈折射出来。

| 指标 | 数据 |
|------|------|
| 仓库 | https://github.com/setube/stackprism |
| Stars | 703 |
| Forks | 48 |
| 编程语言 | TypeScript |
| 浏览器支持 | Chrome / Edge / Firefox |
| 扩展规范 | Manifest V3 |
| 创建时间 | 2026-05-08 |
| 最后更新 | 2026-06-07 |

---

## 为什么要用 StackPrism？

市面上已经有一些同类工具（如 Wappalyzer、BuiltWith），但它们通常只做**静态 HTML 资源 URL 匹配**——看页面加载了哪些 JS/CSS 文件，从文件名猜出框架。这种方式漏识率高，遇到动态加载的 SPA 基本失效。

StackPrism 的差异化在于**多通道并行检测**：

| 检测通道 | 做了什么 |
|---------|---------|
| **静态扫描** | 注入脚本扫 DOM、全局变量、CSS 类名、CSS 变量、`<meta>` 标签 |
| **响应头观察** | Service Worker 监听 `webRequest.onHeadersReceived`，捕获所有请求的响应头 |
| **动态资源监听** | `PerformanceObserver` + `MutationObserver` 累积页面交互后新加载的脚本/样式/iframe |
| **JS 版权注释扫描** | 后台异步抓主 bundle 开头的版权注释，识别打包进 chunk 的第三方依赖 |

4 路结果合并去重后，按 **50+ 个类目**分组展示，并对**伪造响应头、自身检测、模糊误报**等场景做了主动收敛。

---

## 核心功能

### 识别覆盖范围

| 维度 | 类目示例 |
|------|---------|
| **前端** | 前端框架 / UI 框架 / 前端库 / 构建与运行时 |
| **服务端** | Web 服务器 / 后端框架 / CDN 与托管 / 开发语言 |
| **内容** | 网站程序 / 主题模板 / CMS / 电商平台 / RSS |
| **第三方** | SaaS / 探针监控 / AI 大模型 / 第三方登录 / 支付 |
| **营销** | 广告 / 营销 / 统计 / 分析 / 标签管理 |
| **安全** | HTTPS / HTTP/2 / HTTP/3 / CSP / Cookie 同意 |

### 规则引擎架构

StackPrism 的规则系统是**数据驱动**的——绝大多数检测改规则 JSON 即可，无需碰代码：

```
public/rules/
├── index.json              # 规则加载清单
├── page/*.json             # 页面源码、DOM、资源 URL、动态资源规则
├── headers/*.json          # 服务端响应头与 Cookie 规则
└── self-host-suppress.json # 自身站点抑制规则
public/tech-links.json      # 技术名 → 官网/仓库 URL 映射
```

每条规则的字段格式：

```jsonc
{
  "name": "技术名称",
  "category": "前端框架",      // 50+ 类目之一
  "patterns": ["正则或关键词"],
  "matchType": "regex",        // 或 "keyword"
  "matchIn": ["html", "resources", "url", "headers", "dynamic"],
  "confidence": "高",          // 高 / 中 / 低
  "kind": "类型说明",
  "selectors": ["CSS 选择器"],
  "globals": ["window 全局变量名"],
  "classPrefixes": ["类名前缀"]
}
```

### 高性能设计

- **规则即数据**：50+ 个 JSON 规则文件集中维护
- **构建期预编译**：`vite.config.ts` 的 `precompileRulesPlugin` 在构建时为每条规则注入 `__hints`（最长 literal 段去重排序取前 3）和 `__keywordCombined`（keyword 合并正则）
- **运行时候选过滤**：`rule-matcher.ts` 优先用预编译的 hints 做候选过滤，只有命中候选的才进入完整匹配

### 对误报和干扰的主动处理

| 干扰类型 | 处理方式 |
|---------|---------|
| **伪造响应头** | 识别 ≥4 种主体身份字段同时存在的伪造场景，将相关类目降级为低置信度并附警示 |
| **自身检测抑制** | `self-host-suppress.json` 当用户在 StackPrism 自己的域上时跳过同名识别 |
| **短关键词误报** | 规则编写约束：避免 `spring` / `phoenix` / `column` / `container` 等宽泛关键词，优先用高特征信号 |

---

## 安装方式

### 浏览器扩展商店

| 浏览器 | 安装链接 |
|--------|---------|
| Chrome Web Store | [安装链接](https://chromewebstore.google.com/detail/stackprism/cagpdifljieeiajlhlcboelglkalofak) |
| Edge Add-ons | [安装链接](https://microsoftedge.microsoft.com/addons/detail/stackprism/ojgmhlogaoiegdonnlnibeoikbleccno) |
| Firefox Add-ons | [安装链接](https://addons.mozilla.org/firefox/addon/stackprism/) |

### 从源码安装（开发模式）

```bash
git clone https://github.com/setube/stackprism.git
cd stackprism
pnpm install

# Chrome / Edge 构建
pnpm run build

# Firefox 构建
pnpm run build:firefox
```

Chrome/Edge 加载方式：

1. 打开 `chrome://extensions` 或 `edge://extensions`
2. 右上角开启「开发者模式」
3. 点「加载已解压的扩展程序」，选 `dist/` 目录

Firefox 加载方式：

1. 打开 `about:debugging#/runtime/this-firefox`
2. 点「临时载入附加组件」，选 `dist-firefox/manifest.json`
3. 或运行 `pnpm run build:firefox` 后在 `release/` 目录获取 `.xpi` 文件双击安装

---

## 开发与贡献

```bash
# 开发模式 + 热更新
pnpm run dev

# 类型检查
pnpm run typecheck

# ESLint
pnpm run lint

# 生产构建（含规则预编译）
pnpm run build

# Firefox 构建 + .xpi 打包
pnpm run build:firefox

# VitePress 文档站本地预览
pnpm run docs:dev
```

提交代码前请确保三条检查全部通过：

```bash
pnpm run typecheck && pnpm run lint && pnpm run build
```

---

## 注意事项

- **后端识别不保证完整**：很多站点隐藏 `Server` / `X-Powered-By` 等响应头，后端结果会以"线索 + 置信度"形式展示
- **伪造响应头**：扩展会主动识别 ≥4 种主体身份字段同时存在的伪造场景
- **首次安装请刷新目标页**：让 service worker 捕获主文档响应头
- **源代码搜索是 DOM 快照**：基于当前页面的 `outerHTML`，不等同于服务器最初返回的原始 HTML
- **Chrome 系统页 / 商店页 / 内置页**：通常不允许注入检测脚本
- **动态监控异步累积**：content script 在后台累积交互后新加载的资源，重新打开 popup 可看到合并结果

---

## 优劣势分析

| 优势 | 说明 |
|------|------|
| **6 通道并行检测** | 远比单纯 URL 匹配的识别率高，特别是 SPA 和动态加载场景 |
| **MV3 架构** | Service Worker 事件驱动，无后台常驻进程，内存占用低 |
| **规则数据驱动** | 添加新技术只需改 JSON，无需动代码，社区贡献门槛低 |
| **被动防误报** | 伪造响应头检测、自身抑制、宽关键词约束，三层机制 |
| **三浏览器支持** | Chrome + Edge + Firefox，覆盖面广 |
| **构建期预编译** | 提示预处理大幅降低运行时匹配开销 |

| 劣势 | 说明 |
|------|------|
| **项目较新** | 2026 年 5 月创建，Stars 数量相对较低，社区活跃度有待积累 |
| **规则维护依赖社区** | 前端生态变化快，新框架/新 SaaS 需要社区持续贡献规则 |
| **后端识别有局限** | 很多网站隐藏响应头，后端技术栈识别不全 |
| **非商业许可** | CC BY-NC-SA 4.0，不允许商业使用和商业二次分发 |
| **无 API 模式** | 目前仅作为浏览器扩展，没有 SDK 或 API 供程序化调用（对比 Wappalyzer 有 npm 包） |

---

## 适合谁用

- **安全研究人员** —— 快速了解目标站点的技术构成，为漏洞分析和渗透测试提供情报
- **前端开发者** —— 看到好网站想知道它用什么技术栈实现的
- **产品/竞品分析** —— 研究竞品用了哪些第三方服务（分析/支付/CDN 等），辅助技术选型
- **CTF 选手** —— 快速识别 Web 题目使用了什么框架和中间件
- **运维/DevOps** —— 检查 CDN 托管、Web 服务器版本、HTTP/2/3 支持情况

---

## 与同类工具的对比

| 维度 | StackPrism | Wappalyzer | BuiltWith |
|------|-----------|-----------|-----------|
| 开源性 | ✅ 完全开源 | ❌ 闭源 | ❌ 闭源 |
| 检测通道 | 6 个维度 | 静态 URL + 正则 | 静态 URL + 正则 |
| MV3 支持 | ✅ 原生 | 迁移中 | 未迁移 |
| 误报抑制 | 伪造头检测 + 自身抑制 + 宽词约束 | 基础 | 基础 |
| 自定义规则 | JSON 数据驱动 | 需修改扩展 | 不支持 |
| 浏览器 | Chrome/Edge/Firefox | Chrome/Firefox | Chrome/Edge/Firefox |
| 商业使用 | ❌ CC BY-NC-SA | ✅ 有付费计划 | ✅ 有付费计划 |
| API/SDK | ❌ 无 | ✅ 有 npm 包 | ✅ 有 API |

---

## 总结

StackPrism（栈棱镜）是目前为数不多的**开源、多通道、MV3 原生**的网页技术栈识别扩展。它的 6 通道并行检测设计、数据驱动的规则系统、以及对误报的主动处理，让它在同类工具中走出了差异化路线。

对于安全研究人员和前端开发者来说，StackPrism 提供了一个直观的工具来揭示网站的幕后技术构成。虽然项目尚在早期（700+ Stars），但规则系统设计和三浏览器支持已经展现出了不错的潜力。如果你有发现新技术栈的需求，欢迎通过 Issue 或 PR 贡献规则。

---

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/setube/stackprism |
| Chrome Web Store | https://chromewebstore.google.com/detail/stackprism/cagpdifljieeiajlhlcboelglkalofak |
| Edge Add-ons | https://microsoftedge.microsoft.com/addons/detail/stackprism/ojgmhlogaoiegdonnlnibeoikbleccno |
| Firefox Add-ons | https://addons.mozilla.org/firefox/addon/stackprism/ |
| 开源协议 | CC BY-NC-SA 4.0 |

## 参考资料

- **GitHub 仓库**：源代码、Issues、Discussions、规则文件。→ https://github.com/setube/stackprism
- **Chrome Web Store**：扩展商店页面，点击即装。→ https://chromewebstore.google.com/detail/stackprism/cagpdifljieeiajlhlcboelglkalofak
- **Edge Add-ons**：Edge 扩展商店页面。→ https://microsoftedge.microsoft.com/addons/detail/stackprism/ojgmhlogaoiegdonnlnibeoikbleccno
- **Firefox Add-ons**：Firefox 扩展商店页面。→ https://addons.mozilla.org/firefox/addon/stackprism/
