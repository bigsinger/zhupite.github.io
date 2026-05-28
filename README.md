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
│   ├── links.yml      # 友链配置
│   ├── skills.yml     # 技能关键词
│   └── social.yml     # 社交账号
├── pages/             # 独立页面
│   ├── about.md       # 关于
│   ├── archives.md    # 文章归档
│   ├── categories.md  # 分类
│   ├── links.md       # 友链展示
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
| 关于 | `/about/` | 个人介绍与站点说明 |
| 赞助 | `/donate/` | 打赏与支持 |

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

### 社交账号（`_data/social.yml`）

```yaml
- sitename: GitHub
  name: 用户名
  url: https://github.com/用户名
```

### 技能标签（`_data/skills.yml`）

按领域分组列出技术关键词：

```yaml
- name: 领域名
  keywords:
    - 关键词1
    - 关键词2
```

### 评论系统

评论区已移除（无第三方服务依赖）。如果需要恢复，推荐使用 **Giscus**（基于 GitHub Discussions）或自行添加其他方案。

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

- ✅ **响应式布局** — 桌面端带侧边栏，移动端自动适配
- ✅ **深色模式** — 自动跟随系统主题
- ✅ **全文搜索** — Simple Jekyll Search，实时模糊匹配
- ✅ **文章目录** — 桌面侧边栏 + 移动端悬浮按钮
- ✅ **Giscus 评论** — 基于 GitHub Discussions
- ✅ **代码高亮** — Rouge + GitHub 风格
- ✅ **Google Analytics** — 站点统计
- ✅ **SEO** — 自动生成 sitemap、结构化数据
- ✅ **图片灯箱** — fancybox（可选开启）

---

*始于 2007，写了 19 年。好记性不如烂笔头。*
