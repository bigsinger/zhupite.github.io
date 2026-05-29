# zhupite.com 开发设计文档

> **版本**：v3.0（合并整理版）  
> **目标项目**：`/mnt/f/bigsinger/zhupite.github.io`（GitHub Pages + Jekyll）  
> **文章规模**：611 篇（持续增长中）  
> **设计风格**：Animal Crossing 暖色调 — 参考 itbug.shop  
> **设计原则**：从零规划，不以"改旧"为出发点，而以"盖新"为思维方式  
> **文档来源**：合并自 `_docs/` 目录下 6 份设计/审计/优化文档

---

## 目录

1. [第一部分：项目概述](#第一部分项目概述)
   - [第一章：项目全景](#第一章项目全景)
   - [第二章：设计哲学](#第二章设计哲学)
   - [第三章：改造历程](#第三章改造历程)
2. [第二部分：设计系统](#第二部分设计系统)
   - [第四章：Design Token 系统](#第四章design-token-系统)
   - [第五章：组件架构](#第五章组件架构)
   - [第六章：布局系统](#第六章布局系统)
3. [第三部分：技术实现](#第三部分技术实现)
   - [第七章：CSS 架构](#第七章css-架构)
   - [第八章：JavaScript 架构](#第八章javascript-架构)
   - [第九章：性能策略](#第九章性能策略)
   - [第十章：响应式策略](#第十章响应式策略)
4. [第四部分：技术债务与重构](#第四部分技术债务与重构)
   - [第十一章：旧主题剥离方案](#第十一章旧主题剥离方案)
   - [第十二章：代码审计与修复](#第十二章代码审计与修复)
5. [第五部分：开发规范与迭代](#第五部分开发规范与迭代)
   - [第十三章：开发与迭代规范](#第十三章开发与迭代规范)
   - [第十四章：踩坑实录与最佳实践](#第十四章踩坑实录与最佳实践)
   - [第十五章：验证流程](#第十五章验证流程)
6. [附录](#附录)
   - [附录A：关键文件索引](#附录a关键文件索引)
   - [附录B：术语表](#附录b术语表)
   - [附录C：旧文件清理清单](#附录c旧文件清理清单)

---

# 第一部分：项目概述

---

## 第一章：项目全景

### 1.1 什么是 zhupite.com

zhupite.com 是一个**个人知识博客**，运行在 GitHub Pages 上，基于 Jekyll 静态站点生成器。611 篇文章涵盖技术（Android、Kotlin、Flutter、AI、Rust、Docker、Java）、生活（旅行、阅读、思考）等多个领域。

### 1.2 核心约束（不可变更红线）

| 约束 | 原因 |
|------|------|
| 不动 `_posts/` | 611 篇文章，逐一修改不现实 |
| 不动 `_wiki/`、`_drafts/` | wiki 和草稿 |
| 不动 `pages/*.md`（10 个页面） | 纯内容页 |
| 不动第三方 JS（`assets/vendor/`） | 非项目代码，风险不可控 |
| 不动 SEO/统计/广告 HTML | GA、AdSense、不蒜子、Giscus 评论链入 |
| 不动 Gemfile | 依赖锁定 |
| 必须兼容 GitHub Pages 构建流程 | `git push` → 自动构建 → 发布 |
| 不得在 inline script 中使用 `//` 行注释 | compress_html 插件会吞噬换行，详见第十四章 |

### 1.3 站点地图

```
zhupite.com
├── 首页 (index.html)            — 文章卡片网格 + 侧边栏 + 分页器
├── 文章详情页 (post layout)     — 文章正文 + TOC + 侧边栏 + 评论
├── 普通页面 (page layout)       — about/404/donate/links 等
├── 分类页面 (categories layout) — 分类索引
├── 归档页 (archives.md)         — 时间线归档
├── 碎片页 (fragment layout)     — 碎片笔记
├── 图库页 (gallery layout)      — 图片集
├── 思维导图 (mindmap layout)    — 思维导图
├── WIKI (wiki layout)           — 知识库
└── 搜索结果 (内联)              — 客户端搜索
```

### 1.4 当前架构（改造前）

```
加载链（按顺序）
┌──────────────────────────────────────────────────────────────────┐
│ 1. primer.css + vendor 子文件   (28KB) — GitHub Primer CSS 框架 │
│ 2. bundle-legacy.css            (16KB) — 6 个旧主题 CSS 合并     │
│ 3. common.css                   (2KB)  — 旧主题通用样式           │
│ 4. octicons.css                 (212KB)— GitHub Octicons 图标字体│
│ 5. rouge-theme code highlight   (CDN)  — mzlogin/rouge-themes    │
│ 6. share.min.css                (条件)  — 分享按钮（已禁用）      │
│ 7. fancybox.css                 (条件)  — 图片灯箱（已禁用）      │
│ 8. theme-modern.css             (35KB) — 新主题（覆盖层）         │
│ 9. Nunito/Noto SC 字体          (Google Fonts)                    │
├──────────────────────────────────────────────────────────────────┤
│ JS: jQuery 83KB + 已禁用组件的 JS                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 1.5 目标架构（改造后）

```
┌──────────────────────────────────────────────────────────────┐
│ 1. theme-modern.css (预计 ~45KB)  ← 独立自足，移除全部旧依赖 │
│ 2. rouge-github.css (本地)        ← 代码高亮                 │
│ 3. Nunito/Noto SC 字体            ← Google Fonts             │
├──────────────────────────────────────────────────────────────┤
│ JS: 仅 condition-flowchart 和 condition-sequence（4篇文章）   │
└──────────────────────────────────────────────────────────────┘
```

---

## 第二章：设计哲学

### 2.1 核心原则

1. **内容第一** — 设计服务于阅读，不喧宾夺主
2. **温暖舒适** — 暖棕色调 + 柔和圆角，像翻阅一本旧书
3. **一致的语言** — 所有组件共享 Design Token，视觉不割裂
4. **渐进增强** — 基础功能无需 JS，增强体验依靠 JS
5. **隔离覆盖** — 新 CSS 叠加在 Primer CSS 之上，不修改旧文件

### 2.2 设计方向决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 主色 | 暖棕色 `#725d42` + 蓝绿点缀 `#19c8b9` | 参考 itbug.shop Animal Crossing 风格 |
| 首页列数 | 桌面 2 列 | 611 篇文章，3 列信息密度过高 |
| 卡片圆角 | 20px | 比传统 8px 更柔和、更有"卡片感" |
| 头部方案 | sticky + backdrop-blur | 长文章时保持导航可访问 |
| 暗色模式 | CSS class 切换（`.dark`） | 无需 JS 框架，兼容 GitHub Pages |
| TOC 方案 | 纯 JS 生成（桌面侧边栏 + 移动端底部抽屉） | 零外部依赖 |
| 搜索方案 | SimpleJekyllSearch（客户端，双搜索框） | GitHub Pages 无后端，JSON 数据源 |
| 评论方案 | Giscus（GitHub Discussions） | 无需数据库，与 GitHub 生态集成 |

### 2.3 参考站点

| 站点 | 参考价值 |
|------|----------|
| **itbug.shop** | Animal Crossing 风格博客，完整 Design Token 体系 |
| **mdddj/blog-new** | Next.js + Rust + shadcn/ui 全栈博客，11 色卡片轮播 |

核心借鉴：卡片 hover 上浮 + 阴影呼应；颜色变体按分类自动分配；超大圆角（20px）+ 暖色调。

---

## 第三章：改造历程

### 3.1 改造时间线

```
2026-05-28 — 初始改造（zhupite-redesign-plan）
  10 项改造清单完成 → 上线新主题
2026-05-28~29 — 性能优化 + 功能迭代（optimization-best-practices）
  CSS 合并、defer 加载、搜索修复、TOC、代码块、置顶等
2026-05-29 — 第一次代码审计（code-audit-fix-plan）
  jQuery 重写、CSS 补全、死代码清理
2026-05-31 — 第二次代码审计（fix-plan-v2）
  BUG 修复、进一步清理、CSS 质量改进
```

### 3.2 初始改造清单（10 项）

改造来源：[itbug.shop](https://itbug.shop/) | [源码](https://github.com/mdddj/blog-new) | [animal-island-ui](https://github.com/guokaigdg/animal-island-ui)

| # | 改造项 | 涉及文件 | 说明 |
|---|--------|----------|------|
| 1 | 新建核心 CSS | `assets/css/theme-modern.css` | 所有新样式集中于此 |
| 2 | 修改头部 | `_includes/header.html` | sticky + backdrop-blur |
| 3 | 修改首页 | `index.html` | 列表 → 卡片网格 |
| 4 | 修改文章页 | `_layouts/post.html` | 移除旧蓝色 banner |
| 5 | 修改普通页面 | `_layouts/page.html` | 统一卡片容器 |
| 6 | 修改分类页 | `_layouts/categories.html` | 卡片式展示 |
| 7 | 修改底部 | `_includes/footer.html` | 极简风格 |
| 8 | 侧边栏组件 | 多个 `_includes/sidebar-*.html` | 卡片化改造 |
| 9 | 不动文件 | 见"核心约束" | 验收用 |
| 10 | 验证 | — | 12 项检查清单 |

### 3.3 功能迭代综述

| 功能 | 迭代次数 | 踩坑数 | 其中 compress_html 相关 |
|------|---------|--------|------------------------|
| 代码语言标签 | 4 次 | 2 | 0 |
| 代码复制按钮 | 1 次 | 1 | 0 |
| 前/后篇导航 | 1 次 | 0 | 0 |
| 置顶 | 3 次 | 2 | 0 |
| TOC 滚动高亮 | 3 次 | 3 | 1 |
| 双搜索框（侧栏+移动端） | 2 次 | 1 | 0 |
| SJS defer 缺失 → render-blocking | 1 次 | 1 | 0 |
| **合计** | **13 次** | **9 个** | **1 个** |

---

# 第二部分：设计系统

---

## 第四章：Design Token 系统

### 4.1 色彩系统

#### 4.1.1 全局变量

```css
:root {
  /* 🎨 品牌色 — 蓝绿点缀 */
  --animal-primary:         #19c8b9;
  --animal-primary-hover:   #3dd4c6;
  --animal-primary-active:  #50b9ab;

  /* 📝 文字色 — 暖棕系 */
  --animal-text:            #725d42;
  --animal-text-secondary:  #9f927d;
  --animal-text-muted:      #c4b89e;

  /* 🏠 背景色 — 米白暖调 */
  --animal-bg:              #f8f8f0;
  --animal-bg-card:         #f7f3df;
  --animal-bg-secondary:    #f0e8d8;
  --animal-bg-header:       rgba(255,255,255,0.9);

  /* 🔲 边框色 */
  --animal-border:          #aaa69d;
  --animal-border-light:    #e8e2d6;
  --animal-border-card:     rgba(114,93,66,0.1);
}
```

#### 4.1.2 卡片颜色变体（9 种）

| Token | 色值 | 文字色 | 适用分类 |
|-------|------|--------|----------|
| `--card-default` | `#f7f3df` 暖米 | `#725d42` | 通用 / 未分类 |
| `--card-green` | `#8ac68a` 绿 | `#fff` | Android, life |
| `--card-orange` | `#e59266` 橙 | `#fff` | Kotlin, tool |
| `--card-blue` | `#889df0` 蓝 | `#fff` | Flutter, web |
| `--card-pink` | `#f8a6b2` 粉 | `#fff` | C++, travel |
| `--card-yellow` | `#f7cd67` 黄 | `#725d42` | Docker, reads |
| `--card-teal` | `#82d5bb` 青 | `#fff` | Rust, dev |
| `--card-red` | `#fc736d` 红 | `#fff` | Java, sec |
| `--card-purple` | `#b77dee` 紫 | `#fff` | AI, thinking |

#### 4.1.3 暗色模式覆盖

```css
.dark {
  --animal-bg:              #1a1816;
  --animal-bg-card:         #2a2824;
  --animal-bg-secondary:    #35322e;
  --animal-bg-header:       rgba(20,18,16,0.85);
  --animal-text:            #d4cdc0;
  --animal-text-secondary:  #a89f8e;
  --animal-border:          #4a473e;
  --animal-border-light:    #3a3730;
}
```

### 4.2 阴影系统

```css
--animal-shadow-sm:  0 2px 4px 0 rgba(61,52,40,0.06);
--animal-shadow-base: 0 3px 10px 0 rgba(61,52,40,0.1);
--animal-shadow-lg:  0 8px 24px 0 rgba(61,52,40,0.14);
--animal-shadow-btn: 0 4px 0 #bdaea0;  /* 3D 按钮阴影 */
```

### 4.3 圆角系统

```css
--animal-radius-sm:   16px;    /* 小卡片 / 按钮 */
--animal-radius-base: 18px;    /* 默认 */
--animal-radius-lg:   24px;    /* 大卡片 */
--animal-radius-xl:   20px;    /* 文章卡片 */
--animal-radius-full: 50px;    /* 标签 / 搜索框 */
```

### 4.4 间距系统

```css
--animal-gap-xs: 4px;
--animal-gap-sm: 8px;
--animal-gap-md: 12px;
--animal-gap-lg: 16px;
--animal-gap-xl: 24px;
--animal-gap-2xl: 32px;
```

### 4.5 字体系统

```css
--animal-font: 'Nunito', 'Noto Sans SC', 'PingFang SC',
               'Microsoft YaHei', sans-serif;
```

### 4.6 CSS 变量管理原则

1. **必须在 `:root` 中定义** — `.dark` 中做覆盖
2. **引用检查** — 如果 `var(--xxx)` 看不到效果，全局搜索 `--xxx` 确认定义存在
3. **补全规范** — 以下变量已确认存在定义（当变量缺少显式定义时，必须在 `:root` 补齐）：
   - `--animal-radius-md: 8px;`
   - `--animal-bg-hover: rgba(0,0,0,0.04);`（暗色 `rgba(255,255,255,0.06)`）

---

## 第五章：组件架构

### 5.1 组件树

```
Page
├── Header (sticky)
│   ├── Brand/Logo
│   ├── Desktop Nav (水平链接)
│   ├── Theme Toggle (暗色模式切换)
│   └── Mobile Hamburger (≤1023px)
├── Mobile Nav (≤1023px, 可折叠)
│   └── Nav Items (pill 样式)
├── Main Layout
│   ├── Main Content (.main-content)
│   │   ├── [首页] Section Header
│   │   ├── [首页] Post Grid (CSS Grid)
│   │   │   └── Post Card × N
│   │   ├── [首页] Pagination
│   │   ├── [文章] Article Header (标题/日期/字数/阅读量)
│   │   ├── [文章] Article Content (markdown 正文)
│   │   ├── [文章] Related Posts
│   │   ├── [文章] Share Section
│   │   ├── [文章] Copyright Notice
│   │   ├── [文章] Ad (content-header / content-footer)
│   │   └── [文章] Comments (Giscus)
│   ├── Sidebar (桌面显示, 手机隐藏)
│   │   ├── Profile Card
│   │   ├── TOC Card (文章页专用, sticky)
│   │   ├── Search Card
│   │   ├── Categories Card
│   │   ├── Tags Card
│   │   ├── Popular Repo Card
│   │   ├── QR Code Card (文章页)
│   │   └── Ad Cards
│   └── 搜索系统
│       ├── [桌面] Sidebar SJS 搜索（≥1024px）
│       └── [移动端] Header 按钮 → 覆盖层搜索（<1024px，共享数据）
├── Mobile TOC (文章页专用)
│   ├── Floating Button (fixed 右下)
│   └── Drawer Overlay (底部弹出)
└── Footer
    ├── Copyright
    └── Visit Stats (不蒜子)
```

### 5.2 核心组件规范

#### 5.2.1 Post Card（首页文章卡片）

```
┌─────────────────────────────────────┐
│         [分类标签]  ·  x min read    │ ← .post-card-meta
│                                     │
│  文章标题（链接，hover 渐变下划线）   │ ← .post-card-title
│                                     │
│  文章摘要（截断，最多 2 行）         │ ← .post-card-excerpt
│                                     │
│  📅 2026-05-28                   ▼ │ ← .post-card-footer
└─────────────────────────────────────┘
```

**交互规则**：
- 基础：20px 圆角，2px 淡边框，顶部 3px accent 装饰线（色值与卡片变体匹配）
- 置顶卡片：无装饰线，改用 ★ 置顶徽章（内联于 meta 行最左，`order: -1`）
- Hover：上浮 4px（`translateY(-4px)`），阴影从 sm 升级到 lg
- 过渡曲线：`cubic-bezier(0.4, 0, 0.2, 1)` — 先快后缓
- 分类标签：圆角 pill + `backdrop-filter: blur(2px)`
- 摘要：`post.excerpt | strip_html | strip | truncate: 80`，为空时 fallback 到 `page.description`

**卡片颜色映射（Liquid 逻辑在 `index.html` 中维护）**：

```
dev → teal,     sec → red,     tool → orange,   life → green
thinking → purple,  travel → pink,  reads → yellow,  web → blue
flutter → blue,    ai → purple,     android → green,  kotlin → orange
rust → teal,       c++/cpp → pink,  docker → yellow,  java → red
default → #f7f3df (暖米)
```

#### 5.2.2 Sidebar Card（侧边栏卡片）

```
┌─────────────────────────────────────┐
│  📂 文章分类                         │ ← .sidebar-card-title (带 SVG 图标)
├─────────────────────────────────────┤
│  [Android] [Kotlin] [Flutter]       │ ← pill 标签
│  [AI] [Travel] [Life]              │
└─────────────────────────────────────┘
```

与主卡片统一设计语言，内边距 20px，hover 上浮 2px + 阴影递进。

#### 5.2.3 TOC（文章目录系统）

| 组件 | 形态 | 可见性 |
|------|------|--------|
| 桌面 TOC | 侧边栏 sticky 卡片 | ≥1024px |
| 移动端按钮 | 右下 floating button | <1024px |
| 移动端抽屉 | 底部弹出 overlay | 点击按钮后 |

**TOC 生成规则**：
- 抓取 `.main-content` 内的 `h1/h2/h3/h4`
- 不足 2 个标题时自动隐藏；只要有标题就启用高亮（`> 0` 阈值）
- h1 → `toc-h1`（14px 加粗，无缩进）、h2 → `toc-h2`（13px，无缩进）
- h3 → `toc-h3`（12px，缩进 16px）、h4 → `toc-h4`（11px，缩进 32px）
- 点击滚动时 `scroll-margin-top: 80px` 防止被头部遮盖
- **滚动高亮**：IntersectionObserver（`rootMargin: '-50px 0px -65% 0px'`）实时标记当前可见章节，左侧 3px 品牌色指示条动画过渡

#### 5.2.4 Pagination（分页器）

3D 按钮风格：
- 基础：`box-shadow: 0 4px 0 #bdaea0`，`transform: translateY(0)`
- 点击：`transform: translateY(2px)`，阴影缩小
- 当前页：品牌色填充

#### 5.2.5 文章置顶（Sticky / Pinned Post）

| 属性 | 值 |
|------|-----|
| 触发条件 | 文章 frontmatter 中设置 `sticky: true` |
| 排序逻辑 | Liquid 过滤 `paginator.posts \| where: "sticky", true` 后优先显示 |
| 视觉标识 | 📍 定位针图标 + "置顶" 文字，内联在 meta 行最左（`order: -1`） |
| 徽章位置 | 卡片 `<div class="post-card-meta">` 内部，非绝对定位 |
| 悬停效果 | 背景透明度降低，边框切换为主题色 |
| 颜色变体 | 置顶文章保留各自分类的颜色变体 |
| 置顶数量 | 建议 ≤ 3 篇，无硬性限制 |

#### 5.2.6 上一篇 / 下一篇导航

**位置**：`_layouts/post.html`，文章正文与评论区之间。

| 属性 | 值 |
|------|-----|
| 实现方式 | Jekyll 原生 `page.previous` / `page.next` 变量 |
| 布局 | 两行卡片式，flex 上下排列 |
| 首/末篇 | 灰色 disabled 状态，提示"已是第一篇/最后一篇" |
| 圆角 | 16px（`--animal-radius-sm`） |
| Hover | 品牌色边框 + 轻微上浮 |

#### 5.2.7 代码块交互：语言标签 + 复制按钮

```
┌──────────────────────────────────────┐
│  [<> groovy]              [📋 复制] │  ← .code-header
├──────────────────────────────────────┤
│  <pre class="highlight">             │
│    <code> ... </code>                │
│  </pre>                              │
└──────────────────────────────────────┘
```

| 功能 | 实现 |
|------|------|
| 语言检测 | 优先从 `<code>` 的 `language-*` class 提取；失败则检查 `highlight-*` / `lang-*`；仍无结果则向上遍历 `<pre>` 的祖先节点（最多 5 层）匹配 `language-*` |
| 降级显示 | 无法识别语言时显示 "code" |
| 复制反馈 | 点击后按钮变为绿色 + "已复制" 文字，2 秒后恢复 |
| API 优先 | `navigator.clipboard.writeText()` |
| 降级方案 | `document.execCommand('copy')`（fallback） |
| 防重复处理 | `data-code-processed` 属性标记已处理的代码块 |

### 5.3 状态管理

| 状态 | 管理方式 | 说明 |
|------|----------|------|
| 暗色模式 | `localStorage` + `document.documentElement.classList` | 用户选择持久化，初始化在 `<head>` 内联脚本中执行（防闪白） |
| TOC 活跃章节 | `IntersectionObserver`（`rootMargin: '-50px 0px -65% 0px'`） | 由 `assets/js/main.js` 集中管理 |
| 移动端抽屉 | CSS class `open` + `body.style.overflow = 'hidden'` | 无第三方依赖 |
| 搜索结果 | `SimpleJekyllSearch` 内部状态（侧栏）+ 手动遍历（移动端） | 同一 JSON 数据源 |

---

## 第六章：布局系统

### 6.1 断点体系

| 断点 | 范围 | 布局行为 |
|------|------|----------|
| 手机 | <768px | 1 列卡片，底部导航抽屉，隐藏侧边栏 |
| 平板 | 768-1023px | 2 列卡片，隐藏侧边栏 |
| 桌面 | ≥1024px | 2 列卡片，显示侧边栏，TOC sticky |
| 宽屏 | ≥1400px | `max-width` 约束，留白适读 |

### 6.2 容器尺寸

```css
--container-max: 1200px;        /* 最大内容宽度 */
--container-padding: 16px;      /* 两侧内边距 */
--sidebar-width: 300px;         /* 侧边栏宽度 */
```

### 6.3 页面布局矩阵

| 页面类型 | Layout 文件 | 主要布局 | 侧边栏 | TOC | 评论 |
|----------|-------------|----------|--------|-----|------|
| 首页 | `index.html` + `default.html` | 网格 + 侧边栏 | ✅ | ❌ | ❌ |
| 文章详情 | `_layouts/post.html` | 正文 + 侧边栏 | ✅ | ✅ | ✅ |
| 普通页面 | `_layouts/page.html` | 正文 + 侧边栏 | ✅ | ❌ | ✅ |
| 分类索引 | `_layouts/categories.html` | 全宽 | ❌ | ❌ | ❌ |
| 碎片笔记 | `_layouts/fragment.html` | 全宽 | ❌ | ❌ | ✅ |
| 图库 | `_layouts/gallery.html` | 自定义 | ❌ | ❌ | ❌ |
| 思维导图 | `_layouts/mindmap.html` | 全宽 | ❌ | ❌ | ❌ |
| WIKI | `_layouts/wiki.html` | 正文 + 侧边栏 | ✅ | ✅ | ✅ |

### 6.4 视觉行为矩阵

| 元素 | 手机 (<768px) | 平板 (768-1023px) | 桌面 (≥1024px) |
|------|---------------|-------------------|----------------|
| 导航 | hamburger → 折叠面板 | hamburger → 折叠面板 | 水平链接 |
| 侧边栏 | 隐藏 | 隐藏 | 显示（300px 宽） |
| 文章卡片 | 1 列 | 2 列 | 2 列 |
| TOC | floating button + 底部抽屉 | floating button + 底部抽屉 | 侧边栏 sticky |
| gotop | 隐藏（浏览器自带） | 隐藏 | 显示 |
| 分页器 | 单行压缩 | 正常 | 正常 |
| 搜索 | 侧栏内 + 覆盖层 | 侧栏内 + 覆盖层 | 侧栏内 |

### 6.5 断点实现

```css
/* 手机默认（无媒体查询） */
/* 平板增强 */   @media (min-width: 768px) { ... }
/* 桌面增强 */   @media (min-width: 1024px) { ... }
/* 宽屏限制 */   @media (min-width: 1400px) { .container { max-width: 1200px; } }
```

---

# 第三部分：技术实现

---

## 第七章：CSS 架构

### 7.1 加载顺序

```
primer.css（GitHub 基础样式，改不了）
    ↓
bundle-legacy.css（6 个小旧 CSS 合并，15KB）
    ↓
theme-modern.css（核心设计系统，35KB，持续增长）
```

### 7.2 theme-modern.css 模块组织（2100+ 行）

| 模块 # | 名称 | 说明 |
|--------|------|------|
| §1 | CSS Variables | Design Token 定义（`:root` + `.dark`） |
| §2 | Base Reset | 覆盖 Primer 默认值 |
| §3 | Skip Link | 无障碍跳过导航 |
| §4 | Header Navigation | sticky 头部 + 导航 + 暗色切换 + 移动端 |
| §5 | Main Layout | 内容区 + 侧边栏 flex |
| §6 | Section Header | 首页"最新文章"区域 |
| §7 | Post Card Grid | 卡片网格 + 颜色变体 + badge |
| §8 | Pagination | 3D 按钮分页器 |
| §9 | Sidebar Cards | 侧边栏所有组件 |
| §10 | TOC | 目录系统（桌面+移动） |
| §11 | Footer | 极简底部 |
| §12 | Tools | 回到顶部 |
| §13 | Page Content | 首页特有 |
| §14 | Inline SVG | 图标 |
| §15 | Post Detail | 文章详情页 |
| §16 | Search Overlay | 移动端搜索覆盖层 |
| §17 | Dark Mode Overrides | 暗色覆盖 |
| §18 | Performance | 懒加载等 |
| §19 | Copyright Dark Mode | 文档信息框暗色 |
| §20 | Archive Dark Mode | 归档页暗色 |
| §21 | Primer Compatibility | 旧文章兼容层 |
| §22 | Code Block Header | 代码块语言标签 + 复制按钮 |
| §23 | Post Navigation | 上下篇导航卡片 |
| §24 | Sticky Badge | 文章置顶徽章 |
| §25 | TOC Highlight | TOC 滚动高亮指示条 |

### 7.3 CSS 设计原则

1. **全在 theme-modern.css** — 不分散到多个 CSS 文件
2. **CSS 变量驱动** — 颜色/阴影/圆角全用 var()，改一个变量影响全局
3. **选择器极简** — 优先 `.class`，慎用嵌套（最多 3 层）
4. **移动端优先** — `@media (min-width: ...)` 做桌面增强
5. **无 `!important`** — 优先级冲突通过选择器特异性解决

### 7.4 旧主题依赖清单

| # | 文件 | 大小 | 用途 | 是否可移除 |
|---|------|------|------|-----------|
| 1 | `assets/vendor/primer-css/css/primer.css` | 28KB | 基础 CSS 框架 | ✅ 可替换 |
| 2 | `assets/css/bundle-legacy.css` | 16KB | 6 个旧 CSS 合并 | ✅ 可移除 |
| 3 | `assets/css/globals/common.css` | 2KB | 旧主题全局样式 | ✅ 可移除 |
| 4 | `assets/vendor/octicons/` | 212KB | Octicons 图标字体 | ✅ 可移除 |
| 5 | `assets/vendor/jquery/dist/jquery.min.js` | 83KB | jQuery（已确认无实际作用） | ✅ 可移除 |
| 6 | `assets/vendor/share.js/` | 88KB | 分享组件（已禁用） | ✅ 可移除 |
| 7 | `assets/vendor/gitalk/` | 32KB | 旧评论系统（已用 Giscus 替代） | ✅ 可移除 |
| 8 | `assets/js/geopattern.js` | 20KB | 旧 banner 背景（已禁用） | ✅ 可移除 |
| 9 | `assets/js/jquery.toc.js` | 8KB | 旧 TOC（已替代） | ✅ 可移除 |
| 10 | `assets/vendor/busuanzi/` | 2KB | 不蒜子统计（另有 CDN 版本） | ✅ vendor 可删 |
| 11 | `_layouts/compress.html` | 4.5KB | 旧压缩方案（有 `//` 注释陷阱） | ✅ 可替换 |
| 12 | `assets/vendor/flowchart.js/` | 30KB+ | 流程图渲染 | ⚠️ **保留**（4 篇旧文章） |
| 13 | `assets/vendor/js-sequence-diagrams/` | 50KB+ | 序列图渲染 | ⚠️ **保留**（4 篇旧文章） |

---

## 第八章：JavaScript 架构

### 8.1 总览

所有前端 JS 逻辑集中在 `assets/js/main.js` 中，文件以 `defer` 方式加载。使用原生 JS（无 jQuery / 无第三方运行时依赖）。

### 8.2 main.js 模块划分

| 模块 | 功能 | 说明 |
|------|------|------|
| Section 1 | 暗色模式切换 | localStorage 持久化 + Sun/Moon 图标切换 |
| Section 2 | TOC 滚动高亮 | IntersectionObserver 管理 |
| Section 3 | 代码块增强 | 语言标签 + 复制按钮 |
| Section 4 | 搜索初始化 | fetch JSON → SJS 实例 + 手动遍历 |
| Section 5 | 移动端 TOC 抽屉 | open/close 控制 |

### 8.3 搜索系统（Search System）

#### 8.3.1 架构概览

```
search_data.json（Jekyll 构建时生成）
     │
     └── fetch（客户端，1 次 HTTP 请求）
           │
           ├── SimpleJekyllSearch 实例
           │     └── 监听 #search_box → 输出到 #search_results（侧栏）
           │
           └── 手动遍历 keyup 回调
                 └── 监听 #mobileSearchBox → 输出到 #mobileSearchResults（移动覆盖层）
```

| 特性 | 说明 |
|------|------|
| 技术方案 | SimpleJekyllSearch（客户端搜索）+ 手动遍历 |
| 数据源 | `/assets/search_data.json`（Jekyll 构建时从全站文章生成） |
| 请求数 | **1 次** fetch，两个搜索框共享同一份 `data` 引用 |
| 内存占用 | **无重复** — SJS 内部存引用，不复制数据 |
| 侧栏搜索 | SJS 实例：全文模糊匹配 |
| 移动端搜索 | 手动遍历：匹配 `title`、`keywords`、`category` 三个字段 |
| 加载方式 | SJS 库用 `defer`（不阻塞渲染），fetch 异步执行 |

#### 8.3.2 关键代码

```javascript
/* assets/js/main.js — 搜索初始化 */
(function initSearch() {
  var input = document.getElementById('search_box');
  if (!input) return;
  var jsonUrl = input.getAttribute('data-json-url');
  if (!jsonUrl) return;

  fetch(jsonUrl)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      /* ① 侧栏：SJS 实例（唯一实例） */
      new SimpleJekyllSearch({
        searchInput: input,
        resultsContainer: document.getElementById('search_results'),
        json: data,
        searchResultTemplate: '<li><a href="{url}">{title}</a></li>',
        limit: 20,
        fuzzy: false
      });

      /* ② 移动端：手动遍历（共享 data 引用） */
      var mobileBox = document.getElementById('mobileSearchBox');
      var mobileResults = document.getElementById('mobileSearchResults');
      if (!mobileBox || !mobileResults) return;

      var ignoreKeys = [16, 20, 37, 38, 39, 40, 91];
      mobileBox.addEventListener('keyup', function(e) {
        if (ignoreKeys.indexOf(e.which) >= 0) return;
        var term = e.target.value.trim().toLowerCase();
        if (!term) { mobileResults.innerHTML = ''; return; }
        var html = '';
        var count = 0;
        for (var i = 0; i < data.length && count < limit; i++) {
          var item = data[i];
          if (
            (item.title && item.title.toLowerCase().indexOf(term) >= 0) ||
            (item.keywords && item.keywords.toLowerCase().indexOf(term) >= 0) ||
            (item.category && item.category.toLowerCase().indexOf(term) >= 0)
          ) {
            html += '<li><a href="' + item.url + '">' + item.title + '</a></li>';
            count++;
          }
        }
        mobileResults.innerHTML = html || '<li class="no-results">未找到相关内容</li>';
      });
    });
})();
```

#### 8.3.3 性能分析

| 维度 | 值 |
|------|-----|
| 数据量 | ~612 条文章记录（持续增长） |
| 数据大小 | ~100KB JSON |
| fetch 耗时 | ~0.5-0.7s |
| HTTP 请求 | 1 次（缓存破坏参数 `?v=时间戳`） |
| 渲染阻塞 | 0（SJS defer + fetch 异步） |

---

## 第九章：性能策略

### 9.1 性能目标

| 指标 | 目标 |
|------|------|
| 首次内容渲染 (FCP) | < 1.5s |
| 最大内容渲染 (LCP) | < 2.5s |
| CSS 请求数 | ≤ 4 |
| 阻塞 JS | 0 |

### 9.2 性能措施

| 措施 | 实施方式 | 效果 |
|------|----------|------|
| CSS 合并 | 6 个小 CSS → `bundle-legacy.css` | 减少 5 个 HTTP 请求 |
| 脚本 defer | 所有 `<script>` 加 `defer` | 不阻塞渲染 |
| inline script 消除 | 搜索初始化从 inline 移入 deferred main.js | 消除 parser-blocking |
| 条件加载 | geopattern.js 仅非 post 页加载 | 减少不必要 JS 执行 |
| 重复引用消除 | wiki 等 layout 中清除重复 `comments.html` | 减少 DOM 节点 |
| 背景色预置 | `<head>` 内联 `background: #f8f8f0` | 消除白屏闪烁 |
| 暗色无闪烁 | `<head>` 内联脚本读取 localStorage 设置 class | 消除暗色模式闪白 |
| 图片懒加载 | `loading="lazy"` + CSS 模糊占位 | 视口外图片延迟加载 |
| 字体异步 | Nunito 用 `display=swap` | 文字立即可见 |

### 9.3 改造前后对比

| 指标 | 改造前 | 改造后 |
|------|--------|--------|
| CSS 请求数 | 5-7 个 | **2 个** |
| CSS 体积（含字体） | ~280KB | ~55KB |
| JS 请求数 | 5 个（含 jQuery 83KB） | **1-3 个**（有条件） |
| 总下载量 | ~350KB | ~80KB |
| HTTP 请求减少 | — | **减少 60-70%** |

### 9.4 图片懒加载

当前已用 `loading="lazy"` + CSS 模糊占位。未来可考虑低质量 blur-up 占位。

### 9.5 Google Fonts 处理

使用 `media="print" onload="this.media='all'"` 技术，不阻塞渲染，有轻微 FOUT（可接受）。

### 9.6 Rouge CSS 内联决策

3KB 的代码高亮 CSS 内联在 `<head>` 中。对于 600+ 文章、绝大多数页面只被查看一次的场景，内联更快 — 保留现状。

---

## 第十章：响应式策略

### 10.1 移动端悬浮按钮冲突

| 元素 | 大小 | Z-Index | 用途 |
|------|------|---------|------|
| `.toc-mobile-btn` | 48×48 | 100 | 移动端打开目录 |
| `.tools-wrapper > .gotop` | 40×40 | 50 | 回到顶部 |

**解决方案**：移动端隐藏 gotop，TOC 按钮已覆盖其功能：

```css
@media (max-width: 1023px) {
  .tools-wrapper {
    display: none;
  }
}
```

### 10.2 Mobile Header

- ≥1024px：水平导航链接
- <1024px：hamburger 按钮（三条横线），展开后为可折叠导航
- 导航项：pill 样式（圆角 50px + 边框 + hover 背景色）

---

# 第四部分：技术债务与重构

---

## 第十一章：旧主题剥离方案

### 11.1 使用旧主题标记的 Layout 文件

| Layout | 旧主题痕迹 | 改造方式 |
|--------|-----------|----------|
| `_layouts/fragment.html` | `geopattern` banner + `columns` 旧网格 + 引用 `sidebar-post-nav.html` | 用 page.html 风格重写 |
| `_layouts/wiki.html` | 同上 | 用 page.html 风格重写 |
| `_layouts/gallery.html` | 可能也有旧标记 | 用 page.html 风格重写 |
| `_layouts/mindmap.html` | 含 mzlogin CDN 引用 + 旧容器 | 保留功能，重写容器 |

### 11.2 执行计划（6 轮，串行执行）

```
Round 1: 基础准备（无风险）
├── 下载 rouge-github.css 到本地
├── 删除 sidebar-categories-nav.html（0 引用）
└── 提交 + 推送

Round 2: theme-modern.css 独立化（核心，最高风险）
├── 从 primer.css 移植 ~270 行基础样式到 theme-modern.css
├── 验证构建 + 线上检查
└── 提交 + 推送

Round 3: Header/Footer 精简（依赖 Round 2）
├── 删除旧 CSS/JS 引用
├── 删除 jQuery + 已禁用组件
├── 验证
└── 提交 + 推送

Round 4: Layout 重写（依赖 Round 3）
├── 重写 fragment.html / wiki.html / gallery.html / mindmap.html
├── 验证所有页面类型
└── 提交 + 推送

Round 5: compress.html 替换（最后执行，高风险）
├── 编写极简版
├── 替换旧文件
├── 全站功能验证
└── 提交 + 推送

Round 6: 收尾清理
├── 删除旧 vendor 目录（保留 flowchart/sequence）
├── 删除旧 JS/CSS 文件
└── 最终回归测试
```

### 11.3 直观对比

| 维度 | 改造前 | 改造后 |
|------|--------|--------|
| CSS 文件数 | 7 个（含 vendor 和 CDN） | **2 个**（theme-modern + rouge） |
| CSS 体积 | ~280KB（含字体图标） | ~55KB |
| JS 请求 | 5 个（jQuery + 禁用组件等） | **有条件加载**（仅 flowchart/sequence） |
| JS 体积 | ~140KB | ~0KB（默认不加载） |
| 总网络请求 | ~15 个 | ~8 个 |
| 总下载量 | ~350KB | ~80KB |

### 11.4 需移植的基础样式（from primer.css）

| 模块 | 说明 | 预计行数 |
|------|------|----------|
| CSS Reset | `box-sizing: border-box`、body margin 清零、字体基准 | ~30 行 |
| 排版 | h1-h6、p、a、ul/ol、blockquote、hr | ~50 行 |
| 表格 | table、th、td、带边框表格 | ~20 行 |
| 代码 | pre、code、kbd、samp 样式 | ~30 行 |
| 表单 | input、button 基础样式 | ~20 行 |
| 响应式容器 | `.container`、`.columns`（兼容旧文章中标记） | ~30 行 |
| markdown-body | 文章正文基础排版（GitHub 风格） | ~80 行 |
| 旧兼容层 | 旧文章中极少用到的 class | ~10 行 |
| **小计** | | **~270 行** |

---

## 第十二章：代码审计与修复

### 12.1 第一次审计修复计划

基于 2026-05-29 代码审计报告。共分五个阶段。

#### 阶段一：修复 BUG（无风险）

| # | 问题 | 严重度 | 修复方案 |
|---|------|--------|----------|
| 1.1 | fragments.md 标签过滤 JS（jQuery → 原生 JS） | 🔴 | 重写 jQuery 标签过滤为原生 JS `querySelectorAll` |
| 1.2 | CSS 未定义变量补全 | 🔴 | 补齐 `--animal-radius-md` 和 `--animal-bg-hover` |
| 1.3 | robots.txt Disallow `/assets/` | 🟡 | 保持现状（图片在 `/images/` 下不受影响） |

#### 阶段二：清理死代码（低风险）

| # | 文件 | 理由 | 操作 |
|---|------|------|------|
| 2.1 | `ads.txt` | AdSense 已禁用，孤立文件 | 删除 |
| 2.2 | `_data/social.yml` | 全站无任何模板引用 | 删除 |
| 2.3 | `_data/skills.yml` | 全站无任何模板引用 | 删除 |
| 2.4 | `_includes/sns-share.html` | 分享功能已禁用，永假条件 | 删除 |
| 2.5 | CSS 死代码 | 确认无用的规则（`.octicon`、`.share`、重复声明等） | 删除约 15 行 |

#### 阶段三：CSS 代码质量改进（低风险）

| # | 问题 | 修复方案 |
|---|------|----------|
| 3.1 | CSS 章节重新编号 | 按功能域重新规划 §1-§25 |
| 3.2 | CSS 重复声明 | 删除 Primer 兼容层中重复的 `box-sizing: border-box` |

#### 阶段四：可改进项

| # | 项目 | 优先级 | 建议 |
|---|------|--------|------|
| 4.1 | index.html Liquid 颜色映射去重 | 低 | 提取为 `_includes/category-color.liquid` |
| 4.2 | Rouge CSS 外部化 | 低 | 保留现状（3KB 内联更快） |
| 4.3 | Google Fonts FOUT | 低 | 保持现状 |
| 4.4 | jekyll-github-metadata 插件决策 | 低 | 保留现状 |

#### 阶段五：无需操作项

| 项目 | 原因 |
|------|------|
| `_includes/sidebar-tags.html` 标签链接无效 | 已与用户确认保留原始状态 |
| `_data/links.yml` 删除 | `pages/links.md` 使用了 `site.data.links`，不能删除 |
| `robots.txt` Disallow `/assets/` | 图片在 `/images/` 下不受影响 |
| Primer 兼容层整块 | 保留供旧文章兼容，仅清理重复声明 |

### 12.2 第二次审计修复计划（v2）

基于 2026-05-31 第二次代码审计报告。

#### 阶段一：修复 BUG

| # | 问题 | 严重度 | 涉及文件 | 修复方案 |
|---|------|--------|----------|----------|
| 1.1 | 分类页死代码 | 🟢 | `pages/categories.md` | 删除 L11-L25 未被渲染的代码块 |
| 1.2 | `open-source.md` 样式修复 | 🔴 | `pages/open-source.md`, CSS | 确认是否保留页面，补充必要 CSS |
| 1.3 | `_fragments` 数据集缺失 | 🔴 | `pages/fragments.md` | 确认 `_fragments/` 是否应存在 |
| 1.4 | 侧栏标签锚点跳转失效 | 🔴 | 侧栏标签链接 | 选项 A：不修改（跳到顶部安全）；选项 B：检测锚点 |

#### 阶段二：清理死代码

| # | 操作 | 风险 |
|---|------|------|
| 2.1 | 删除 `_layouts/fragment.html` 和 `_layouts/gallery.html` | 极低（未被引用） |
| 2.2 | 从 theme-modern.css 删除 10 个未使用 Primer 类 | 极低（已确认无引用） |

#### 阶段三：CSS 代码质量改进

| # | 问题 | 修复 |
|---|------|------|
| 3.1 | `copyright.html` 暗色模式兼容 | 用 CSS 变量替代内联样式 `background-color:#deebf7` |
| 3.2 | `post-card-reading` 缺 CSS | 补充 `.post-card-reading { font-size: 12px; color: var(--animal-text-secondary); }` |

#### 可改进项

| # | 项目 | 优先级 |
|---|------|--------|
| 4.1 | `comments.html` 默认主题优化 | 低（default 从未触发） |
| 4.2 | 分页器"片段"菜单项 | 低 |
| 4.3 | `rouge-github.css.html` 内联优化 | 低（保留现状） |

---

# 第五部分：开发规范与迭代

---

## 第十三章：开发与迭代规范

### 13.1 工作流

```
本地修改 → git add → git commit → git push
                                     ↓
                          GitHub Pages 自动构建（1-2 分钟）
                                     ↓
                           curl 线上验证 / 浏览器 Ctrl+F5
```

### 13.2 代码审查清单（自检）

每次提交前检查：

| # | 检查项 | 方法 |
|---|--------|------|
| 1 | `//` 行注释 | `grep -rn "^\s*//" _includes/ _layouts/ --include="*.html"` |
| 2 | CSS 变量存在 | `grep -rn "var(--xxx)" assets/css/` 确认定义 |
| 3 | compress_html 兼容 | 线上 curl 查看压缩后 inline JS 是否有语法错误 |
| 4 | Git 状态 | `git status` 确认只改目标文件 |
| 5 | 权限文件 | 确保不动 `_config.yml`、`_posts/*`、`Gemfile` |
| 6 | 首次试试 | 如果是首次改某个文件，先读通内容再改 |

### 13.3 文件操作权限矩阵

| 目录 | 可修改 | 可新建 | 可删除 | 说明 |
|------|--------|--------|--------|------|
| `assets/css/` | ✅ | ✅ | ❌ | theme-modern.css 可改，旧 CSS 只可合并（不单删） |
| `_includes/` | ✅（部分） | ❌ | ❌ | 可改 header/footer/sidebar-post，不可动评论/广告/SEO |
| `_layouts/` | ✅（部分） | ❌ | ❌ | 可改 post/page/default，不可动 compress |
| `index.html` | ✅ | — | ❌ | 首页模板 |
| `_posts/` | ❌ | — | ❌ | 611 篇文章 |
| `_config.yml` | ✅（谨慎） | — | ❌ | 可修改评论/字数统计等配置项 |
| `_docs/` | ✅ | ✅ | ✅ | 项目文档，自由操作 |
| `assets/js/main.js` | ✅ | — | ❌ | 统一 JS 入口 |
| `assets/vendor/` | ❌ | — | ❌ | 第三方库 |

### 13.4 新功能添加的自检清单

每次添加新 JS 功能后：

```
1. curl 线上 HTML → 确认 DOM 结构正确
2. 浏览器 Console → 确认无报错
3. 检查 <script> 压缩后代码 → 排除 compress_html 副作用
4. Ctrl+F5 硬刷新 → 排除缓存
5. 分别在桌面/移动端验证 → 排除响应式问题
```

**特别注意**：jsDelivr CDN 的缓存极顽固，如果 JS/CSS 从 CDN 加载（`@master` 等），做功能性重写后必须切换到本地 URL + 时间戳参数。

### 13.5 提交规范

```
fix(v2): N. 操作说明

- 审计报告引用：阶段 X.Y
```

---

## 第十四章：踩坑实录与最佳实践

### 14.1 compress_html 兼容性（最常踩的坑）

#### 14.1.1 永远不用 `//` 行注释

**问题**：`compress_html` 插件会移除 `<script>` 标签内的换行符，导致 `//` 行注释吞噬其后的所有代码。

```javascript
// ❌ 危险 - compress_html 后变成单行，整段被注释
// 暗色模式初始化
(function() { ... })();

// ✅ 安全 - 使用 /* */ 块注释
/* 暗色模式初始化 */
(function() { ... })();
```

#### 14.1.2 检查 `//` 注释的最佳方法

```bash
grep -rn "^\s*//" _includes/ _layouts/ --include="*.html"
```

#### 14.1.3 闭包/括号务必留余量

多行函数在 compress_html 压缩成单行后，括号匹配阈值会下降。

```javascript
// ❌ 错误 - compress_html 后括号不匹配
document.addEventListener('DOMContentLoaded', function() {
  SimpleJekyllSearch({ ... })  // 少了分号
  });     // ← 多余的闭合
});      // ← 这行在压缩后紧跟前一行，无法判断

// ✅ 正确
document.addEventListener('DOMContentLoaded', function() {
  SimpleJekyllSearch({ ... });
});
```

### 14.2 代码语言标签：Jekyll/Rouge 的嵌套陷阱

**现象**：代码块顶部始终显示 "code" 而非实际语言。

**根因**：Jekyll/Rouge 生成的代码块 HTML 结构中，`language-*` class 在**祖父节点**（`<div class="language-groovy highlighter-rouge">`），不在 `<code>` 上。

**解决方案 — 多级祖先遍历**：

```javascript
if (!lang) {
  var ancestor = pre;
  for (var a = 0; a < 5; a++) {
    ancestor = ancestor.parentNode;
    if (!ancestor) break;
    var ac = ancestor.className || '';
    var am = ac.match(/language-(\w+)/);
    if (am) { lang = am[1]; break; }
  }
}
```

### 14.3 TOC 滚动高亮：阈值与 rootMargin

#### 阈值问题

**现象**：帖子有 TOC，滚动时从不高亮任何章节。

**根因**：初始代码中加了 `if (links.length > 2) return;` 阈值判断。`> 2` 意味着标题数 ≤ 2 时直接跳过高亮。

**修复**：改成 `> 0`，只要 TOC 有链接就启用高亮。

#### rootMargin 调参经验

| 版本 | rootMargin | 效果 |
|------|-----------|------|
| 初始 | 无（默认 `0 0 0 0`） | 只有标题完全进入视口才触发 |
| v2 | `-20px 0px -60% 0px` | 改善了部分场景 |
| v3（最终） | `-50px 0px -65% 0px` | 准确标记当前阅读章节 |

### 14.4 代码块处理防重复：data 属性标记

```javascript
if (pre.getAttribute('data-code-processed')) return;
pre.setAttribute('data-code-processed', 'true');
```

**适用场景**：任何对 DOM 元素做增强/注入的 JS 逻辑，都应该做幂等性处理。

### 14.5 复制按钮的 Clipboard API 降级策略

```javascript
copyBtn.addEventListener('click', function() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    /* ✅ 现代 API：异步，不阻塞 UI */
    navigator.clipboard.writeText(text).then(function() {
      // 显示"已复制"反馈
    });
  } else {
    /* ⚠️ 降级方案：select + execCommand */
    var range = document.createRange();
    range.selectNodeContents(code || pre);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('copy');
    sel.removeAllRanges();
  }
});
```

### 14.6 移动搜索 ignoreKeys 踩坑

**现象**：移动端搜索框输入后按回车键无任何反应。

**根因**：`ignoreKeys` 中包含了 `13`（Enter 键码），导致回车被静默跳过。

**修复**：从 `ignoreKeys` 中移除 `13`。

### 14.7 Parser-blocking inline script 消除

**问题**：`_includes/sidebar-search.html` 中的 inline `<script>` 阻塞 HTML 解析。

**修复方案**：将内联脚本移入 deferred 的 `main.js`，Liquid 变量通过 `data-*` 属性传递。

```html
<!-- 原来 -->
<script>var jsonUrl = '{{ site.url }}/assets/search_data.json';</script>

<!-- 现在 -->
<input data-json-url="{{ site.url }}/assets/search_data.json?v={{ 'now' | date: '%s' }}">
```

### 14.8 `defer` 加载脚本的选择性陷阱：fetch().then() 模式

**问题**：博客感觉"变慢"，打开不流畅，首屏渲染延迟约 0.5s。

**根因**：SJS 库 `<script>` 在 `<head>` 中无 `defer` 同步加载，阻塞 HTML 解析。

**为什么之前认为不能 defer？** 旧版代码中 inline script 直接调用了 `new SimpleJekyllSearch(...)`。但重构后改用 `fetch().then()` 模式后，`new SimpleJekyllSearch(...)` 被包裹在 `.then()` 回调中 — fetch 的异步性保证了回调执行时 defer 脚本早已执行。

**铁律**：只要内联搜索脚本使用 `fetch().then()` 模式，SJS 库就一定能用 `defer`。

### 14.9 调试方法论

#### 线上对比调试

```bash
# 抓取线上页面查看实际渲染结果
curl -sL https://zhupite.com/ | grep -oP 'class="[^"]*"' | sort | uniq -c

# 检查 TOC 按钮数量
curl -sL https://zhupite.com/path/to/article.html | grep -oP 'toc-mobile-btn[^>]*'

# 检查 JS 错误
curl -sL https://zhupite.com/ | grep -oP 'SimpleJekyllSearch|SyntaxError|Unexpected'
```

#### 排除法

1. 线上 curl 确认 HTML 结构 → 确认"代码是否已部署"
2. 排除 compress_html 副作用 → 查看压缩后的 inline JS
3. 排除缓存 → Ctrl+F5 硬刷新
4. 对比本地源码 vs 线上渲染 → grep 关键 class/ID

#### 推送验证周期

```
本地修改 → git commit → git push → 等 1-2 分钟 GitHub Pages 构建 → Ctrl+F5 硬刷新
```

### 14.10 文章卡片摘要为空处理

**问题**：极少数文章的首页卡片摘要区域空白。

**根因**：文章以纯图片开头时，`post.excerpt` 渲染为 `<p><img...>`，`strip_html` 后变为空字符串。

**受影响范围**：611 篇文章中共 5 篇（占 0.8%）。

**修复方案（Liquid fallback）**：

```liquid
{%- capture excerpt_raw %}{{ post.excerpt | strip_html | strip }}{% endcapture -%}
<p class="post-card-excerpt">
  {% if excerpt_raw != '' %}
    {{ excerpt_raw | truncate: 80 }}
  {% elsif post.description %}
    {{ post.description | truncate: 80 }}
  {% endif %}
</p>
```

---

## 第十五章：验证流程

### 15.1 快速验证脚本

保存为 `quick-verify.sh` 并在每轮改造后运行：

```bash
#!/bin/bash
# quick-verify.sh — 快速验证站点核心功能

URL="https://zhupite.com"
PASS=0; FAIL=0
check() { local desc="$1"; local result="$2"
  if [ "$result" = "PASS" ]; then echo "  ✅ $desc"; ((PASS++))
  else echo "  ❌ $desc — $result"; ((FAIL++)); fi
}

echo "=== 1. HTTP 状态码 ==="
for p in "/" "/travel/杭州爬山路线.html" "/categories/" "/about/"; do
  code=$(curl -so /dev/null -w '%{http_code}' "$URL$p")
  [ "$code" = "200" ] && check "$p (HTTP $code)" PASS || check "$p (HTTP $code)" FAIL
done

echo -e "\n=== 2. 首页关键元素 ==="
HTML=$(curl -s $URL/)
echo "$HTML" | grep -q 'post-card' && check "首页卡片" PASS || check "首页卡片" "缺失"
echo "$HTML" | grep -q 'site-header-modern' && check "网站头部" PASS || check "网站头部" "缺失"
echo "$HTML" | grep -q 'sidebar-content' && check "侧边栏" PASS || check "侧边栏" "缺失"
echo "$HTML" | grep -q 'pagination-modern' && check "分页器" PASS || check "分页器" "缺失"

echo -e "\n=== 3. CSS/JS 统计 ==="
CSS=$(echo "$HTML" | grep -oP 'href="[^"]*\.css"' | sort -u | wc -l)
JS=$(echo "$HTML" | grep -oP 'src="[^"]*\.js"' | sort -u | wc -l)
echo "$CSS" | grep -q "^[12]$" && check "CSS 请求数: $CSS" PASS || check "CSS 请求数: $CSS" "预期 1-2"
echo "$JS" | grep -q "^[0123]$" && check "JS 请求数: $JS" PASS || check "JS 请求数: $JS" "预期 0-3"

echo -e "\n=== 4. 文章页关键元素 ==="
AH=$(curl -s $URL/travel/杭州爬山路线.html)
echo "$AH" | grep -q 'toc-mobile-btn' && check "TOC 按钮" PASS || check "TOC 按钮" "缺失"
echo "$AH" | grep -q 'giscus' && check "Giscus 评论" PASS || check "Giscus 评论" "缺失"
echo "$AH" | grep -q 'markdown-body' && check "文章正文" PASS || check "文章正文" "缺失"

echo -e "\n=== 5. JS 错误检测 ==="
AH_ERR=$(echo "$AH" | grep -oP 'SyntaxError|Unexpected token|\bis not\b' | head -5)
[ -z "$AH_ERR" ] && check "JS 无语法错误" PASS || check "JS 错误: $AH_ERR" FAIL

echo -e "\n=== 6. 旧主题残留检查 ==="
echo "$HTML" | grep -q 'primer\.css' && check "primer.css 残留" "仍然存在" || check "primer.css 已移除" PASS

echo -e "\n============================"
echo "通过: $PASS | 失败: $FAIL | 总数: $((PASS+FAIL))"
[ "$FAIL" -gt 0 ] && echo "⚠️ 有验证失败项" || echo "✅ 全部通过"
```

### 15.2 手动视觉检查清单

| 页面 | URL | 检查内容 |
|------|-----|----------|
| 首页 | `https://zhupite.com/` | 卡片布局、侧边栏、搜索框、分页器、暗色切换 |
| 文章页 | `https://zhupite.com/travel/杭州爬山路线.html` | TOC（21 项）、正文、代码块、评论、暗色 |
| 旧文章 | `https://zhupite.com/dev/python-http-server.html` | 代码高亮、排版 |
| 分类页 | `https://zhupite.com/categories/` | 分类列表、跳转 |
| About | `https://zhupite.com/about/` | 用户信息、GitHub 链接 |
| 碎片页 | `https://zhupite.com/fragments/《十年之约》` | fragment layout（确认不报错） |
| Wiki | `https://zhupite.com/wiki/vim-cheatsheet/` | wiki layout |
| 移动端 | Chrome DevTools 模拟手机 | 导航、卡片、TOC 按钮、搜索 |

### 15.3 灰度发布与回滚策略

每轮分 2 次提交：
- **Push 1**：改动代码（不改动旧文件引用时）→ 等待 Pages 构建 → 验证
- **Push 2**：删除旧文件（当前轮次确认无误后）→ 再次验证

回滚：
```bash
git revert HEAD --no-edit
git push
```

---

# 附录

---

## 附录 A：关键文件索引

| 文件 | 用途 | 说明 |
|------|------|------|
| `assets/css/theme-modern.css` | 核心设计系统 | ~2100 行，25 个模块 |
| `assets/css/bundle-legacy.css` | 6 个旧 CSS 合并 | 15KB，兼容层（待剥离） |
| `assets/js/main.js` | 统一 JS 入口（原生 JS） | 暗色切换、TOC 高亮、代码块增强、搜索初始化 |
| `_includes/header.html` | 头部导航 | sticky + 暗色切换 + hamburger + 搜索覆盖层 |
| `_includes/sidebar-post.html` | 侧边栏 + TOC + 分类 | TOC HTML 生成（JS 逻辑在 main.js） |
| `_includes/sidebar-search.html` | 侧栏搜索组件 | 纯 HTML（JS 已迁移至 main.js） |
| `_includes/footer.html` | 底部 | 极简 + 统计 |
| `_includes/comments.html` | 评论系统 | Utterances（基于 GitHub Issues） |
| `index.html` | 首页模板 | 卡片网格 + 侧边栏 + 分页器 + 置顶逻辑 |
| `_layouts/post.html` | 文章详情页 layout | 字数统计 + 代码块 + 前后篇导航 + TOC + 评论 |
| `_layouts/default.html` | 默认 layout 骨架 | 嵌套 compress.html |
| `_layouts/fragment.html` | 碎片页 layout | 待重写 |
| `_layouts/wiki.html` | WIKI layout | 待重写 |
| `_layouts/gallery.html` | 图库页 layout | 待重写 |
| `_layouts/mindmap.html` | 思维导图 layout | 待重写 |
| `pages/fragments.md` | 片段页面 | 需修复 jQuery 引用 |

---

## 附录 B：术语表

| 术语 | 说明 |
|------|------|
| Design Token | 设计系统的原子单位（颜色、间距、阴影等 CSS 变量） |
| Card | 圆角矩形容器，带阴影和 hover 动效，用于承载内容 |
| Pill | 圆角标签（`border-radius: 9999px`），用于导航项和分类标签 |
| Sticky Header | 固定在顶部的导航栏，不随页面滚动而消失 |
| TOC | Table of Contents，文章目录 |
| Drawer | 从底部滑入的抽屉式面板，用于移动端 TOC |
| Utterances | 基于 GitHub Issues 的评论插件，无需 OAuth App |
| compress_html | Jekyll 插件，压缩 HTML 输出，但有 JS 兼容性陷阱 |
| Code Header | 代码块顶部的语言标签 + 复制按钮组合组件 |
| Sticky Post | 设置了 `sticky: true` 的置顶文章 |
| Primer CSS | GitHub 的 CSS 框架，站点的历史基础样式 |

---

## 附录 C：旧文件清理清单（最终版）

### 可直接删除的文件

```bash
# Dead includes
_includes/sidebar-categories-nav.html

# Old CSS
assets/css/bundle-legacy.css
assets/css/globals/common.css
assets/css/globals/          # 整个目录

# Old vendor (primers/octicons/gitalk/share/busuanzi)
assets/vendor/primer-css/
assets/vendor/octicons/
assets/vendor/gitalk/
assets/vendor/share.js/
assets/vendor/busuanzi/

# Old JS
assets/js/geopattern.js
assets/js/jquery.toc.js

# Old layout reference
_includes/sidebar-post-nav.html

# Unused data files
_data/social.yml
_data/skills.yml
ads.txt

# Dead includes (sharing)
_includes/sns-share.html

# Unused CSS component directories (如存在)
assets/css/components/
assets/css/posts/
assets/css/sections/
```

### 保留的文件

```bash
# 4 篇旧文章依赖
assets/vendor/flowchart.js/          ← 保留
assets/vendor/js-sequence-diagrams/  ← 保留
```

---

> **文档版本**：v3.0（合并整理版）  
> **合并来源**：原 `_docs/` 目录下 6 份文档 — `blog-system-design-doc.md`、`optimization-best-practices.md`、`fix-plan-v2.md`、`code-audit-fix-plan.md`、`old-theme-strip-plan.md`、`zhupite-redesign-plan.md`  
> **最后更新**：2026-05-31
