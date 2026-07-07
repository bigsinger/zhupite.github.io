---
layout: post
title: "开源博客框架横评：Astro / Hugo / Jekyll / Hexo / Grav"
categories: [tool]
tags: [blog, static-site-generator, astro, hugo, jekyll, hexo, grav, comparison]
---

## 为什么做这个横评

现在写博客的选择太多了。GitHub Pages 的 Jekyll、极速的 Hugo、灵活的 Grav、现代的 Astro……每个都说自己最快最易用。选框架已经变成一个需要调研的决策，这篇文章帮你一次性看明白。

我选了目前社区最活跃的五个开源博客框架做横评：**Astro、Hugo、Jekyll、Hexo、Grav**。评测维度覆盖 GitHub 数据、编程语言、建站速度、增量构建、SEO 支持和部署方式等。

## 一句话结论

| 你的需求 | 推荐框架 |
|---------|---------|
| 最快构建速度、纯内容站点 | **Hugo** |
| 现代前端体验、混合渲染 | **Astro** |
| 与 GitHub Pages 深度集成 | **Jekyll** |
| Node.js 生态、入门快 | **Hexo** |
| 动态管理后台、PHP 环境 | **Grav** |

---

## 核心对比表

| 对比维度 | Astro | Hugo | Jekyll | Hexo | Grav |
|---------|-------|------|--------|------|------|
| **GitHub Stars** | 60,754 | 88,861 | 51,541 | 41,770 | 15,558 |
| **编程语言** | TypeScript | Go | Ruby | TypeScript | PHP |
| **许可证** | NOASSERTION | Apache-2.0 | MIT | MIT | MIT |
| **最新版本** | v7.0.6 | v0.164.0 | v4.4.1 | v8.1.2 | v2.0.7 |
| **首次发布** | 2021年 | 2013年 | 2008年 | 2012年 | 2014年 |
| **构建速度** | 中（大规模数分钟） | **极快（<1s 千页）** | 慢（千页级数分钟） | 中（百页秒级） | N/A（动态） |
| **增量构建** | ✅ 路由缓存 | ✅ 亚秒级增量 | ⚠️ 实验性 | ⚠️ 部分支持 | N/A |
| **是否纯静态** | 混合（SSG+SSR） | **纯静态** | **纯静态** | **纯静态** | ❌ 动态 PHP |
| **是否需要数据库** | ❌ 不需要 | ❌ 不需要 | ❌ 不需要 | ❌ 不需要 | ❌ 不需要（文件驱动） |
| **是否需要后端运行时** | ❌ 构建后无需 | ❌ 单二进制 | ❌ 需 Ruby 环境 | ❌ 需 Node.js | ✅ 需 PHP 运行时 |
| **PHP 版本要求** | N/A | N/A | N/A | N/A | PHP 8.3+ |
| **SEO 支持** | 极优（原生） | 良好 | 良好（插件） | 良好（插件） | 良好（插件） |
| **Sitemap** | ✅ 内置 | ✅ 内置 | ✅ 官方插件 | ✅ 官方插件 | ✅ 插件 |
| **RSS Feed** | ✅ 官方指南 | ✅ 内置 | ✅ 官方插件 | ✅ 官方插件 | ✅ 插件 |
| **管理后台** | ❌ 无 | ❌ 无 | ❌ 无 | ❌ 无 | ✅ 有（Admin） |
| **学习曲线** | 低 | 中 | 低 | 低 | 中 |
| **主题生态** | 85+ 集成 | 丰富 | 数百主题 | 446 主题 | 插件丰富 |
| **GitHub Pages 原生集成** | ❌ 需 CI | ❌ 需 CI | ✅ **原生** | ❌ 需 CI | ❌ 不支持 |

---

## 各框架详析

### Astro — 现代内容网站框架

> 官网：https://astro.build | GitHub：withastro/astro

Astro 是相对年轻但增长最快的 SSG。它的核心创新是 **Islands 架构**——页面默认输出零 JavaScript，只有需要交互的"组件岛"才会加载 JS。

**关键特征：**
- Astro v7 的编译器从 Go 重写为 **Rust**（基于 oxc），官方测试 docs.astro.build（6,313 页）构建时间从 114s 降至 73s（↓35.8%）
- 支持**混合模式**：同一站点既可预渲染静态页面，也可按需 SSR
- 与 React/Vue/Svelte/SolidJS 无缝集成，可在同一项目混用
- 默认 Content Collections 提供类型安全的 Markdown/MDX 内容管理

**适合人群：**
- 想要**极致的页面性能和优秀开发者体验**的前端开发者
- 需要内容网站（企业官网、文档站、博客）+ 少量动态交互的场景
- 愿意使用现代前端工具链（Vite、TypeScript）

**不适合：**
- 只想"Markdown 写完即部署"极简流程的用户
- 重度交互的 SPA 应用
- 万页级大站首次构建仍需数分钟

---

### Hugo — 极速静态网站生成器

> 官网：https://gohugo.io | GitHub：gohugoio/hugo

Hugo 是用 Go 编写的单二进制 SSG，以极致构建速度著称。官方数据：平均每页 **1 毫秒**，千页站点构建在**亚秒级**完成。

**关键特征：**
- 单二进制分发，**无任何运行时依赖**——下载即用
- `hugo server` 自带 LiveReload 热更新
- 原生支持**多语言站点**、多格式内容（Markdown/AsciiDoc/Org-mode/reStructuredText）
- 模板语言 Go Template 学习曲线略高，但模板能力强大
- **最活跃的社区**：88k+ stars，高频发布（月更 1-3 版本），维护状态极佳

**构建速度对比（参考）：**
- 比 Jekyll 快 10-100x
- 比 Gatsby/Next.js 快 50-200x
- 自身极快，增量构建的需求不像在其他框架中那么关键

**适合人群：**
- **内容量大的站点**（文档站、知识库、数千页博客）
- 追求极致构建速度的用户
- 需要多语言支持的国际化站点

**不适合：**
- 不熟悉 Go Template 语法的前端开发者（需额外学习）
- 需要动态/交互功能的站点（Hugo 纯静态）

---

### Jekyll — GitHub Pages 原配

> 官网：https://jekyllrb.com | GitHub：jekyll/jekyll

Jekyll 是最老牌的 SSG（2008 年），最大的优势是 **GitHub Pages 原生集成**——`git push` 即部署，无需 CI 配置，免费 HTTPS 和自定义域名。

**关键特征：**
- GitHub Pages 的上游引擎，**推送即发布**
- 使用 Liquid 模板引擎（Shopify 开发），上手简单
- 官方 SEO 三件套（jekyll-seo-tag / jekyll-sitemap / jekyll-feed）覆盖绝大多数 SEO 需求
- 主题可通过 RubyGems 分发，数百主题可选
- v4.4 支持 `--incremental` 增量构建（仍标记为实验性功能）

**劣势明显：**
- **大型站点构建速度慢**——千页级站点完整构建需数分钟
- 增量构建不够成熟，部分场景不兼容
- 依赖 Ruby 环境，**Windows 安装体验较差**
- GitHub Pages 模式下插件受限（只允许白名单插件）
- 社区活跃度近年有所下降

**适合人群：**
- **GitHub Pages 用户**——零配置发布
- 小到中型博客（几十到几百篇文章）
- 习惯 Markdown 写作的开发者

---

### Hexo — Node.js 生态的首选

> 官网：https://hexo.io | GitHub：hexojs/hexo

Hexo 是 Node.js 生态中最老牌、最成熟的 SSG（2012 年）。**中文社区极强**，文档完善、教程丰富，是国内程序员博客的首选框架之一。

**关键特征：**
- 基于 Node.js 异步 I/O，百篇博客通常在 **1-5 秒**内构建完成
- 模板引擎灵活——支持 EJS、Pug、Nunjucks、Swig 多种选择
- **最好的中文生态之一**——完善的中文文档、大量中文教程、活跃的 QQ/微信群
- 轻量级：`npm install -g hexo-cli` → `hexo init blog` → `npm install` 即可运行
- 主题市场 446+ 主题，插件市场 509+ 插件

**需要注意：**
- 非真正的**差分增量构建**（使用 db.json 缓存），大站全量重建较慢
- Node.js 构建时内存占用较高
- 大版本升级可能涉及 breaking changes（如 v6→v7→v8）

**适合人群：**
- 熟悉 Node.js/JavaScript 的开发者
- 中文用户/面向中文读者的博客
- 需要快速上手、中小规模的个人博客

---

### Grav — 带后台的扁平化 CMS

> 官网：https://getgrav.org | GitHub：getgrav/grav

Grav 和前面四个**完全不同**——它不是静态站点生成器，而是一个**基于文件的动态 CMS**。它不需要数据库，但需要 PHP 运行时来提供页面服务。

**关键特征：**
- **扁平化文件存储**——文章和配置都是 Markdown + YAML 文件，支持 Git 版本控制
- **自带管理后台**——Admin 插件提供可视化编辑器、页面管理、用户管理等
- 基于 Symfony 组件 + Twig 模板引擎，插件体系完整
- 支持完整的动态功能——用户系统、自定义内容类型、定时发布、草稿等
- 需要 **PHP 8.3+** 环境运行

**核心差异点：**
- **不是静态的**——每收到一个页面请求都由 PHP 处理并渲染输出（有缓存机制但仍是动态）
- 不能被 GitHub Pages 等静态托管服务托管——需要支持 PHP 的 Web 服务器
- 部署流程复杂——需 FTP/SFTP 同步或 CI 部署到 PHP 主机
- 页面加载速度明显慢于纯静态 HTML

**适合人群：**
- **需要可视化编辑后台**的非技术用户
- 已有 PHP 主机环境的用户
- 需要动态功能（用户系统、表单、草稿管理）的站点
- 希望在 CMS 灵活性 + 文件管理之间取得平衡

---

## 场景推荐总结

### 纯静态博客（GitHub Pages 免费托管）

| 框架 | 推荐指数 | 理由 |
|------|---------|------|
| **Jekyll** | ⭐⭐⭐⭐⭐ | GitHub Pages 原生集成，最适合 |
| **Hugo** | ⭐⭐⭐⭐ | CI 配置后也方便，速度快 |
| **Hexo** | ⭐⭐⭐⭐ | npm deploy 到 gh-pages 分支 |
| **Astro** | ⭐⭐⭐ | 需配置 CI/CD，稍复杂 |

### 企业官网/文档站

| 框架 | 推荐指数 | 理由 |
|------|---------|------|
| **Hugo** | ⭐⭐⭐⭐⭐ | 速度最快，适合大型站点 |
| **Astro** | ⭐⭐⭐⭐⭐ | 现代前端体验，SEO 优秀 |
| **Grav** | ⭐⭐⭐ | 需要后台管理的场景 |

### 个人技术博客

| 框架 | 推荐指数 | 理由 |
|------|---------|------|
| **Hexo** | ⭐⭐⭐⭐⭐ | 中文生态好，入门快 |
| **Jekyll** | ⭐⭐⭐⭐⭐ | GitHub Pages 零成本 |
| **Hugo** | ⭐⭐⭐⭐ | 速度快，主题多 |
| **Astro** | ⭐⭐⭐⭐ | 现代体验，开发者友好 |

---

## 参考来源

- Astro 官方文档：https://docs.astro.build
- Hugo 官网：https://gohugo.io
- Jekyll 官方文档：https://jekyllrb.com/docs/
- Hexo 中文文档：https://hexo.io/zh-cn/docs/
- Grav 官网：https://getgrav.org
- GitHub 仓库数据：https://github.com/withastro/astro / gohugoio/hugo / jekyll/jekyll / hexojs/hexo / getgrav/grav
- Astro v7 发布公告：https://astro.build/blog/astro-7/
