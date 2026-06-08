# 朱皮特的烂笔头

我的个人博客：[zhupite.com](https://zhupite.com) → 一个写了 600+ 篇博客的技术站点，涵盖 Android 逆向、C++/C# 开发、读书笔记、徒步攻略等。

---

## 快速开始

### 写作与发布

1. 在 `_posts/` 目录下创建 Markdown 文件，命名格式：`YYYY-MM-DD-文章标题.md`
2. 文章头部需包含 YAML frontmatter：

```yaml
---
layout: post
title: 文章标题
subtitle: 副标题（可选）
date: 2025-05-28
author: zhupite
header-img: /assets/images/banner.jpg（可选）
catalog: true
sticky: true                # 设为 true 可在首页置顶（可选）
tags: [标签1, 标签2]
---
```

3. 正文直接写 Markdown，支持代码高亮、图片、表格等标准语法
4. 推送到 GitHub 的 `master` 分支，GitHub Pages 会自动编译并发布

### 创建新页面

在 `pages/` 目录下添加 `.md` 文件，frontmatter 示例：

```yaml
---
layout: page
title: 页面名
description: 页面描述
permalink: /page-name/
menu: 导航名
---
```

然后在 `_config.yml` 的 `navs` 节添加导航链接。

---

## 项目结构

```
├── _posts/            # 博客文章（Markdown）
├── _layouts/          # 页面模板（HTML + Liquid）
├── _includes/         # 组件片段（header, footer, sidebar 等）
├── _data/             # 结构化数据
│   └── links.yml      # 友链配置
├── pages/             # 独立页面
│   ├── about.md       # 关于
│   ├── archives.md    # 文章归档
│   ├── categories.md  # 分类
│   ├── links.md       # 友链展示
│   ├── search.md      # 站内搜索
│   ├── donate.md      # 赞助
│   └── 404.md         # 404 页面
├── assets/
│   ├── css/           # 样式文件
│   └── js/            # JavaScript
├── images/            # 图片资源
└── _config.yml        # 站点配置
```

---

## 主要页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 博客文章列表（分页，每页 10 篇） |
| 分类 | `/categories/` | 按分类浏览文章 |
| 文章归档 | `/archives/` | 按时间线浏览所有文章 |
| 友链 | `/links/` | 高质量站点推荐，7 个分类 |
| 搜索 | `/search/` | 按关键词、分类、标签检索文章 |
| 关于 | `/about/` | 个人介绍与站点说明 |
| 赞助 | `/donate/` | 打赏与支持（需自行配置收款码图片） |

---

## 配置指南

### 站点信息（`_config.yml`）

```yaml
url: https://zhupite.com           # 站点域名
title: 朱皮特的烂笔头               # 站点标题
subtitle: "自由的飞翔"               # 副标题
description: "..."                  # 站点描述
repository: bigsinger/zhupite.github.io
```

### 导航栏

编辑 `_config.yml` 的 `navs` 节，添加或调整菜单项：

```yaml
navs:
  - href: /
    label: 首页
  - href: /categories/
    label: 分类
```

### 友链数据（`_data/links.yml`）

每个站点包含以下字段：

```yaml
- name: 站点名称
  url: https://example.com
  src: dev          # 分类标识：tech-news | dev | security | design | cloud | tools | life
  desc: 简介（可选）
```

### 赞助页面收款码

在 `pages/donate.md` 中配置微信 / 支付宝收款码图片：

```yaml
wechat_qr: /images/donate_weixin.jpg
alipay_qr: /images/donate_alipay.jpg
```

将对应的图片文件放入 `images/` 目录即可。如果图片不存在，页面会显示加载失败占位。

### 评论系统

使用 **Utterances**（基于 GitHub Issues 的评论插件）。读者用 GitHub 账号登录后即可发表评论，所有评论存储在指定仓库的 Issues 中。

#### 前置条件

在 [GitHub Apps](https://github.com/apps/utterances) 安装 Utterances 应用，授权访问评论仓库。

#### 配置说明

在 `_config.yml` 中配置：

```yaml
utterances:
  repo: bigsinger/blog-comments   # GitHub 评论仓库（owner/repo）
  issue_term: pathname              # 页面与 Issue 的关联方式
  theme: github-light               # 主题（github-light / github-dark / preferred-color-scheme）
```

#### 页面控制

在文章或页面的 frontmatter 中设置 `comments: false` 可禁用评论区。

---

### 文章字数统计

每篇文章底部会显示 **字数** 与 **预估阅读时间**。在 `_config.yml` 中配置：

```yaml
components:
  word_count:
    enabled: true              # 开启字数统计
    words_per_minute: 350      # 阅读速度（字/分钟），用于计算阅读时长
```

---

### 文章功能配置

以下 5 项功能覆盖文章的阅读与代码体验，大部分是自动启用，少数需要 frontmatter 配置。

#### 自动启用（无需配置）

| 功能 | 触发方式 | 说明 |
|------|----------|------|
| 📋 **代码复制按钮** | 鼠标悬停代码块 → 右上角按钮 | 点击复制全文，2 秒反馈"已复制" |
| 🏷️ **代码语言标签** | 自动检测代码块语言 | 显示在代码块左上角，如 `groovy`、`java` |
| ⏪ **上一篇 / 下一篇导航** | 文章底部自动生成 | 利用 Jekyll `page.previous` / `page.next`，首末篇自动禁用 |
| 📚 **TOC 滚动高亮** | 滚动文章时目录自动跟随 | 桌面侧边栏 + 移动端抽屉同步高亮 |

#### Frontmatter 配置

**文章置顶** — 在文章 frontmatter 中添加 `sticky: true`：

```yaml
---
layout: post
title: 置顶文章示例
  sticky: true            # 首页优先显示，meta 行「📍 置顶」徽章
tags: [标签1, 标签2]
---
```

- 置顶文章在首页优先于普通文章显示
- 支持多篇置顶（建议 ≤ 3 篇）
- 置顶文章卡片 meta 行显示「📍 置顶」毛玻璃徽章（无装饰条），桌面端唯一可见
- 取消置顶只需删除 `sticky: true` 或设为 `false`

---

## 主题参考

本博客的 UI 风格参考了以下项目，致以感谢：

- **[Animal Design System (itbug.shop)](https://itbug.shop/)** — 源码：[mdddj/blog-new](https://github.com/mdddj/blog-new)
- **[Animal Island UI](https://github.com/guokaigdg/animal-island-ui)** — 动物森友会风格 UI 组件

在此基础之上进行了大量定制：自建样式集（theme-modern.css）、原生 JavaScript（无 jQuery）、11 种彩色卡片变体等。

---

## 部署

本项目使用 **GitHub Pages** 自动构建与托管。

- 将 Markdown 文章推送到 `master` 分支即可触发构建
- 构建过程完全由 GitHub 端完成，**无需在本地安装 Ruby/Jekyll**
- 域名通过 CNAME 自动绑定，HTTPS 由 GitHub 自动配置

**本地预览（可选，非必需）：**

```bash
# 安装 Ruby + Bundler 后
bundle install
bundle exec jekyll serve
```

---

## 功能特性

一个温暖舒适的轻量级博客——600+ 篇文章，零框架依赖，原生 JavaScript，纯 GitHub Pages。

### 📱 阅读体验

| 特性 | 说明 |
|------|------|
| 📖 **响应式布局** | 桌面端带侧边栏（300px），移动端自动适配单列，平板双列卡片网格 |
| 🌓 **深色模式** | 跟随系统 / 手动切换，localStorage 持久化，初始化无闪烁 |
| 📚 **文章目录** | 桌面侧边栏 sticky 定位 + 移动端悬浮按钮弹出底部抽屉 |
| 🔍 **全文搜索** | 原生 JavaScript 客户端实时匹配，无后端依赖；侧栏、移动端覆盖层与 `/search/` 搜索页共享同一数据源；搜索逻辑全部位于 deferred main.js，不阻塞首屏渲染 |
| ⏪ **上一篇/下一篇** | 文章底部卡片式导航，首末篇优雅禁用 |
| 📊 **字数统计** | 精确统计 + 阅读时长（350字/分钟），文章顶部显示 |
| 📌 **文章置顶** | 首页优先显示（第2页起不显示），meta 行内联「📍 置顶」毛玻璃徽章，悬停时边框变主题色 |

### 💻 代码体验

| 特性 | 说明 |
|------|------|
| 🏷️ **语言标签** | 自动识别 50+ 编程语言（Rouge 高亮），智能检测祖先节点 class |
| 📋 **一键复制** | 代码块右上角复制按钮，Clipboard API 优先 + execCommand 降级，2 秒反馈 |
| 🎨 **Rouge 高亮** | GitHub 风格语法着色，521 篇文章零改动 |

### 🎨 视觉设计

| 特性 | 说明 |
|------|------|
| 🐾 **Animal Design** | 暖棕色调 + 柔和圆角（16-20px），参考 Animal Crossing 风格 |
| 🃏 **彩色卡片网格** | 9 种颜色变体按分类智能分配（Android→绿、Kotlin→橙、旅行→粉…） |
| ⬆️ **3D 按钮** | 分页器和交互元素带按压动效（压下 2px + 阴影收缩） |
| 🖼️ **图片懒加载** | native `loading="lazy"` + 淡入效果，视口外延迟加载 |

### 📐 技术架构

| 特性 | 说明 |
|------|------|
| 🚀 **零框架依赖** | 原生 JavaScript（重写自 jQuery），所有功能一个 `main.js` |
| 🎯 **CSS 变量驱动** | 25 个模块化 CSS 区域，Design Token 统一控制颜色/阴影/圆角/间距 |
| ⚡ **GitHub Pages** | `git push` 自动构建发布，无需本地 Ruby/Jekyll 环境 |
| 💬 **Utterances 评论** | 基于 GitHub Issues，读者用 GitHub 登录即可评论，零 OAuth 代理 |
| 🔍 **SEO 友好** | 自动 sitemap、结构化数据、Open Graph 协议、规范 URL |
| 📡 **Google Analytics** | 站点流量统计（可选） |
| 🧩 **渐进增强** | 基础功能无需 JS，JS 仅增强已存在的 HTML 结构 |

> 始于 2007，写了 19 年。好记性不如烂笔头。
