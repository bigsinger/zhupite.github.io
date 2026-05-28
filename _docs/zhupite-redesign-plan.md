# 博客框架改造计划

> **状态**：已完成（2026-05-28）
> **改造来源**：https://itbug.shop/ (源码: https://github.com/mdddj/blog-new) 以及：https://github.com/guokaigdg/animal-island-ui
> **目标项目**：/mnt/f/bigsinger/zhupite.github.io (zhupite.com)

## 基本原则

- **不动**：SEO元数据、网站统计(GA/不蒜子)、Google AdSense、Giscus评论、博客内容、`_config.yml`
- **只改**：视觉风格 — 布局模板 + CSS + 交互细节
- **兼容**：不破坏 `md → GitHub Pages Jekyll 自动构建` 流程

## 设计方向（默认选择）

| 项目 | 选择 |
|------|------|
| 主色 | 暖棕色系 `#725d42` (参考站风格) |
| 暗色模式 | ✅ 加上 `.dark` class 支持 |
| 首页文章列数 | 桌面 2 列（521篇文章较多，3列信息密度过高） |

---

## 改造清单（共10项）

---

### 第1项：新建 `assets/css/theme-modern.css`（核心文件）

所有新样式集中在这里，加载顺序在旧CSS之后叠加覆盖。

**CSS 模块清单：**

| 模块 | 说明 |
|------|------|
| CSS 变量 | `--color-primary: #725d42` 等全局变量 |
| 重置/基准 | 覆盖 PrimerCSS 默认字体、行高 |
| 固定头部 | `position: sticky; backdrop-filter: blur(12px)` |
| 导航栏 | 圆角按钮式链接，hover 高亮 |
| 首页卡片网格 | `display: grid; grid-template-columns: repeat(2, 1fr)` |
| 文章详情页 | 移除旧蓝色 banner，干净白色容器 |
| 普通页面 | 统一卡片式容器 |
| 侧边栏 | 所有小部件圆角卡片化 |
| 标签/分类 | `border-radius: 9999px` pill 样式 |
| 底部 | 极简风格，保留版权和统计 |
| 分页器 | 圆角按钮组 |
| 响应式 | 手机单列、平板2列、桌面2列 |
| 暗色模式 | `html.dark` class + CSS 变量切换 |
| 动效 | card hover 上移 + 阴影过渡 |

---

### 第2项：修改 `_includes/header.html`

- **`<head>` 部分不变**（SEO/meta/analytics/AdSense 不动）
- **修改 `<header class="site-header">`**：
  - 改为 sticky 固定顶栏 + backdrop-blur 毛玻璃
  - 导航链接改为圆角按钮样式
  - 删除旧的 hamburger 菜单逻辑
  - 响应式：手机上改为水平滚动导航
- **保留** `{% assign assets_base_url %}`、CDN加载、JS引用

---

### 第3项：修改 `index.html`

- **banner 区域**：从蓝色渐变改为简洁顶部（保留 subtitle/location/github）
- **文章列表 (`<ol class="repo-list">`)**：
  - 从列表式改为卡片网格 `display: grid`
  - 卡片：白底 + 圆角 + 阴影 + hover 上移 + 暖色顶部边框
  - 保留置顶、日期、分类、摘要全部信息
- **侧边栏**：保留所有 widget，样式靠 CSS 覆盖
- **分页器**：保留逻辑，样式改为圆角按钮

---

### 第4项：修改 `_layouts/post.html`

- **删除** `section.collection-head.geopattern`（旧蓝色 geo pattern banner）
- **替换为** 简洁文章头区域（标题 + 日期/分类/字数/阅读量）
- **文章容器**：`<article>` 加卡片样式（白底 + 圆角 + 阴影）
- **保留**：评论、相关文章、广告位、版权声明、侧边栏
- **相关文章**：从列表改为卡片样式

---

### 第5项：修改 `_layouts/page.html`

- **删除** 旧 `collection-head.geopattern` banner
- **文章容器**：统一用新卡片容器样式
- **保留**：`{{ content }}`、侧边栏、评论

---

### 第6项：修改 `_layouts/categories.html`

- 保持分类列表逻辑不变
- 改为卡片式展示

---

### 第7项：修改 `_includes/footer.html`

- 精简为极简 footer（保留 site.author、版权、TOP按钮）
- 保留 `visit-stat.html` 不蒜子统计
- 保留 GitHub 图标链接
- 去掉多余的边框样式

---

### 第8项：修改侧边栏组件

| 文件 | 改动 |
|------|------|
| `sidebar-search.html` | 搜索框改圆角 + 边框样式 |
| `sidebar-categories-cloud.html` | 分类标签改圆角 pills |
| `sidebar-popular-repo.html` | GitHub 仓库列表卡片化 |
| `sidebar-post-nav.html` | 目录卡片化 |
| `sidebar-ad.html` | 广告容器加卡片包装 |
| `sidebar-detail-ad.html` | 同上 |
| `sidebar-qrcode.html` | 二维码卡片化 |

---

### 第9项：不动文件清单（验收用）

以下文件完全不动：

- ✅ `_config.yml`
- ✅ `_posts/*`（521篇文章）
- ✅ `_drafts/*`
- ✅ `_wiki/*`
- ✅ `pages/*.md` (10个页面：404/about/archives/categories/donate/fragments/links/mindmap-viewer/open-source/wiki)
- ✅ `CNAME` / `favicon.ico` / `robots.txt` / `ads.txt` / `baidu_verify_*.html`
- ✅ `Gemfile` / `LICENSE` / `README.md` / `.gitignore`
- ✅ `_data/*.yml` (links/skills/social)
- ✅ `assets/js/*`（全部 JS 文件）
- ✅ `assets/vendor/*`（第三方库）
- ✅ `_layouts/compress.html`
- ✅ `_layouts/fragment.html`
- ✅ `_layouts/gallery.html`
- ✅ `_layouts/mindmap.html`
- ✅ `_layouts/wiki.html`
- ✅ `_includes/seo-structured-data.html`
- ✅ `_includes/comments.html`
- ✅ `_includes/copyright.html`
- ✅ `_includes/sns-share.html`
- ✅ `_includes/visit-stat.html`
- ✅ `_includes/content-footer-ad.html`
- ✅ `_includes/content-header-ad.html`
- ✅ `_includes/footer-ad.html`

---

### 第10项：验证步骤（改造完成后）

| # | 验证项 | 方法 |
|---|--------|------|
| 1 | Jekyll 本地构建成功 | `bundle exec jekyll build` |
| 2 | 首页结构正常 | 检查 `_site/index.html` |
| 3 | 文章页正常 | 检查 `_site` 下随机文章 |
| 4 | 分类页正常 | 检查 `_site/categories/` |
| 5 | 侧边栏功能正常 | 搜索/分类云/仓库 |
| 6 | SEO 标签完整 | 检查 `<meta>`、`og:`、`twitter:` |
| 7 | GA 脚本存在 | gtag.js 引用 |
| 8 | AdSense 存在 | adsbygoogle 脚本 |
| 9 | Giscus 评论正常 | comments.html 引用 |
| 10 | 响应式适配 | 手机/平板/桌面 |
| 11 | 不蒜子统计 | visit-stat.html 加载 |
| 12 | 暗色模式切换 | `.dark` class 样式正常 |
