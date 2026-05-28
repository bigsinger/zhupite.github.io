# zhupite.com 博客系统设计文档

> **版本**：v1.0  
> **目标项目**：`/mnt/f/bigsinger/zhupite.github.io`（GitHub Pages + Jekyll）  
> **文章规模**：521 篇（持续增长中）  
> **设计风格**：Animal Crossing 暖色调 — 参考 itbug.shop  
> **设计原则**：从零规划，不以"改旧"为出发点，而以"盖新"为思维方式

---

## 第一章：项目全景

### 1.1 什么是 zhupite.com

zhupite.com 是一个**个人知识博客**，运行在 GitHub Pages 上，基于 Jekyll 静态站点生成器。521 篇文章涵盖技术（Android、Kotlin、Flutter、AI、Rust、Docker、Java）、生活（旅行、阅读、思考）等多个领域。

### 1.2 核心约束（不可变更红线）

| 约束 | 原因 |
|------|------|
| 不动 `_posts/` | 521 篇文章，逐一修改不现实 |
| 不动 `_wiki/`、`_drafts/` | wiki 和草稿 |
| 不动 `pages/*.md`（10 个页面） | 纯内容页 |
| 不动第三方 JS（`assets/vendor/`） | 非项目代码，风险不可控 |
| 不动 SEO/统计/广告 HTML | GA、AdSense、不蒜子、Giscus 评论链入 |
| 不动 Gemfile | 依赖锁定 |
| 必须兼容 GitHub Pages 构建流程 | `git push` → 自动构建 → 发布 |
| 不得在 inline script 中使用 `//` 行注释 | compress_html 插件会吞噬换行，详见 7.3 |

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
└── 搜索结果 (内联)              — SimpleJekyllSearch 客户端搜索
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
| 首页列数 | 桌面 2 列 | 521 篇文章，3 列信息密度过高 |
| 卡片圆角 | 20px | 比传统 8px 更柔和、更有"卡片感" |
| 头部方案 | sticky + backdrop-blur | 长文章时保持导航可访问 |
| 暗色模式 | CSS class 切换（`.dark`） | 无需 JS 框架，兼容 GitHub Pages |
| TOC 方案 | 纯 JS 生成（桌面侧边栏 + 移动端底部抽屉） | 不依赖 jQuery，零外部依赖 |
| 搜索方案 | SimpleJekyllSearch（客户端） | GitHub Pages 无后端，JSON 数据源 |
| 评论方案 | Giscus（GitHub Discussions） | 无需数据库，与 GitHub 生态集成 |

---

## 第三章：Design Token 系统

### 3.1 色彩系统

#### 3.1.1 全局变量

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

#### 3.1.2 卡片颜色变体（9 种）

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

#### 3.1.3 暗色模式覆盖

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

### 3.2 阴影系统

```css
/* 卡片基础阴影 — 轻、暖 */
--animal-shadow-sm:  0 2px 4px 0 rgba(61,52,40,0.06);
--animal-shadow-base: 0 3px 10px 0 rgba(61,52,40,0.1);
--animal-shadow-lg:  0 8px 24px 0 rgba(61,52,40,0.14);

/* 3D 按钮阴影 — 配合压感效果 */
--animal-shadow-btn: 0 4px 0 #bdaea0;
```

### 3.3 圆角系统

```css
--animal-radius-sm:   16px;    /* 小卡片 / 按钮 */
--animal-radius-base: 18px;    /* 默认 */
--animal-radius-lg:   24px;    /* 大卡片 */
--animal-radius-xl:   20px;    /* 文章卡片 */
--animal-radius-full: 50px;    /* 标签 / 搜索框 */
```

### 3.4 间距系统

```css
--animal-gap-xs: 4px;
--animal-gap-sm: 8px;
--animal-gap-md: 12px;
--animal-gap-lg: 16px;
--animal-gap-xl: 24px;
--animal-gap-2xl: 32px;
```

### 3.5 字体系统

```css
/* 英文字体用 Nunito（柔和圆润），中文字体 fallback */
--animal-font: 'Nunito', 'Noto Sans SC', 'PingFang SC',
               'Microsoft YaHei', sans-serif;
```

---

## 第四章：组件架构

### 4.1 组件树

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
│   └── Sidebar (桌面显示, 手机隐藏)
│       ├── Profile Card
│       ├── TOC Card (文章页专用, sticky)
│       ├── Search Card
│       ├── Categories Card
│       ├── Tags Card
│       ├── Popular Repo Card
│       ├── QR Code Card (文章页)
│       └── Ad Cards
├── Mobile TOC (文章页专用)
│   ├── Floating Button (fixed 右下)
│   └── Drawer Overlay (底部弹出)
└── Footer
    ├── Copyright
    └── Visit Stats (不蒜子)
```

### 4.2 核心组件规范

#### 4.2.1 Post Card（首页文章卡片）

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
- Hover：上浮 4px（`translateY(-4px)`），阴影从 sm 升级到 lg
- 过渡曲线：`cubic-bezier(0.4, 0, 0.2, 1)` — 先快后缓
- 分类标签：圆角 pill + `backdrop-filter: blur(2px)` 提高可读性

#### 4.2.2 Sidebar Card（侧边栏卡片）

```
┌─────────────────────────────────────┐
│  📂 文章分类                         │ ← .sidebar-card-title (带 SVG 图标)
├─────────────────────────────────────┤
│  [Android] [Kotlin] [Flutter]       │ ← pill 标签
│  [AI] [Travel] [Life]              │
└─────────────────────────────────────┘
```

**规范**：与主卡片统一设计语言，内边距 20px，hover 上浮 2px + 阴影递进。

#### 4.2.3 TOC（文章目录系统）

| 组件 | 形态 | 可见性 |
|------|------|--------|
| 桌面 TOC | 侧边栏 sticky 卡片 | ≥1024px |
| 移动端按钮 | 右下 floating button | <1024px |
| 移动端抽屉 | 底部弹出 overlay | 点击按钮后 |

**TOC 生成规则**：
- 抓取 `.main-content` 内的 `h1/h2/h3/h4`
- 不足 2 个标题时自动隐藏
- h1 → `toc-h1`（14px 加粗，无缩进）
- h2 → `toc-h2`（13px，无缩进）
- h3 → `toc-h3`（12px，缩进 16px）
- h4 → `toc-h4`（11px，缩进 32px）
- 点击滚动时 `scroll-margin-top: 80px` 防止被头部遮盖
- **滚动高亮**：IntersectionObserver（`rootMargin: '-50px 0px -65% 0px'`）实时标记当前可见章节，左侧 3px 品牌色指示条动画过渡

#### 4.2.4 Pagination（分页器）

3D 按钮风格，参考 itbug.shop：
- 基础：`box-shadow: 0 4px 0 #bdaea0`，`transform: translateY(0)`
- 点击：`transform: translateY(2px)`，阴影缩小
- 当前页：品牌色填充

#### 4.2.5 Mobile Header

- ≥1024px：水平导航链接
- <1024px：hamburger 按钮（三条横线），展开后为可折叠导航
- 导航项：pill 样式（圆角 50px + 边框 + hover 背景色）

### 4.3 状态管理

| 状态 | 管理方式 | 说明 |
|------|----------|------|
| 暗色模式 | `localStorage` + `document.documentElement.classList` | 用户选择持久化，初始化在 `<head>` 内联脚本中执行（防闪白） |
| TOC 活跃章节 | `IntersectionObserver`（`rootMargin: '-50px 0px -65% 0px'`） | 由 `assets/js/main.js` 集中管理，桌面侧边栏 + 移动端两处同时高亮 |
| 移动端抽屉 | CSS class `open` + `body.style.overflow = 'hidden'` | 无第三方依赖 |
| 搜索结果 | `SimpleJekyllSearch` 内部状态 | JSON 数据源 `/assets/search_data.json` |

---

## 第五章：布局系统

### 5.1 断点体系

| 断点 | 范围 | 布局行为 |
|------|------|----------|
| 手机 | <768px | 1 列卡片，底部导航抽屉，隐藏侧边栏 |
| 平板 | 768-1023px | 2 列卡片，隐藏侧边栏 |
| 桌面 | ≥1024px | 2-3 列卡片，显示侧边栏，TOC sticky |
| 宽屏 | ≥1400px | `max-width` 约束，留白适读 |

```css
/* 容器宽度控制 */
--container-max: 1200px;        /* 最大内容宽度 */
--container-padding: 16px;      /* 两侧内边距 */
--sidebar-width: 300px;         /* 侧边栏宽度 */
```

### 5.2 页面布局矩阵

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

---

## 第六章：CSS 架构

### 6.1 加载顺序

```
primer.css（GitHub 基础样式，改不了）
    ↓
bundle-legacy.css（6 个小旧 CSS 合并，15KB）
    ↓
theme-modern.css（核心设计系统，35KB，持续增长）
```

### 6.2 theme-modern.css 模块组织

| 模块 # | 名称 | 行号 | 说明 |
|--------|------|------|------|
| 1 | CSS Variables | L7-87 | Design Token 定义 |
| 2 | Base Reset | L89-115 | 覆盖 Primer 默认值 |
| 3 | Skip Link | L118-129 | 无障碍跳过导航 |
| — | Anchor Offset | L131-138 | `scroll-margin-top` |
| 4 | Header Navigation | L139-350 | sticky 头部 + 导航 + 暗色切换 + 移动端 |
| 5 | Main Layout | L354-376 | 内容区 + 侧边栏 flex |
| 6 | Section Header | L379-417 | 首页"最新文章"区域 |
| 7 | Post Card Grid | L419-590 | 卡片网格 + 颜色变体 + badge |
| 8 | Pagination | L591-653 | 3D 按钮分页器 |
| 9 | Sidebar Cards | L655-876 | 侧边栏所有组件 |
| 10 | TOC | L878-1062 | 目录系统（桌面+移动） |
| 11 | Footer | L1064-1134 | 极简底部 |
| 12 | Tools | L1136-1163 | 回到顶部 |
| 13 | Page Content | L1165-1169 | 首页特有 |
| 14 | Inline SVG | L1171 | 图标 |
| 15 | Post Detail | L1174-1325 | 文章详情页 |
| 16 | Dark Mode | L1330-1477 | 暗色覆盖 |
| 17 | Lazy Loading | L1479-1482 | 图片懒加载 |
| 18 | Dark fixes | L1484-1503 | 特殊暗色修复 |
| 19 | Responsive | L1476-1486 | 响应式断点 |
| 20 | Dark mode Primers | L1473 | Primer 元素暗色覆盖 |
| 21 | Primer Compat | L1490-1550 | 旧 Primer 样式兼容 |
| **22** | **Code Block Header** | **L1551-1618** | **代码块语言标签 + 复制按钮** |
| **23** | **Prev/Next Nav** | **L1620-1678** | **上下篇导航卡片** |
| **24** | **Sticky Badge** | **L1680-1702** | **文章置顶徽章** |
| **25** | **TOC Highlight** | **L1704-1720** | **TOC 滚动高亮指示条** |

### 6.3 CSS 设计原则

1. **全在 theme-modern.css** — 不分散到多个 CSS 文件，避免覆盖链混乱
2. **CSS 变量驱动** — 颜色/阴影/圆角全用 var()，改一个变量影响全局
3. **选择器极简** — 优先 `.class`，慎用嵌套（最多 3 层）
4. **移动端优先** — `@media (min-width: ...)` 做桌面增强
5. **无 !important** — 优先级冲突通过选择器特异性解决

---

## 第七章：性能策略

### 7.1 性能目标

| 指标 | 目标 |
|------|------|
| 首次内容渲染 (FCP) | < 1.5s |
| 最大内容渲染 (LCP) | < 2.5s |
| CSS 请求数 | ≤ 4 |
| 阻塞 JS | 0 |

### 7.2 性能措施

| 措施 | 实施方式 | 效果 |
|------|----------|------|
| CSS 合并 | 6 个小 CSS → `bundle-legacy.css` | 减少 5 个 HTTP 请求 |
| 脚本 defer | 所有 `<script>` 加 `defer` | 不阻塞渲染 |
| 条件加载 | geopattern.js 仅非 post 页加载 | 减少不必要 JS 执行 |
| 重复引用消除 | wiki 等 layout 中清除重复 `comments.html` | 减少 DOM 节点 |
| 背景色预置 | `<head>` 内联 `background: #f8f8f0` | 消除白屏闪烁 |
| 暗色无闪烁 | `<head>` 内联脚本读取 localStorage 设置 class | 消除暗色模式闪白 |
| 图片懒加载 | `loading="lazy"` + CSS 模糊占位 | 视口外图片延迟加载 |
| 字体异步 | Nunito 用 `display=swap` | 文字立即可见 |

### 7.3 关键：compress_html 陷阱

`compress.html` 是 Jekyll 的 HTML 压缩 layout，它会把 `<script>` 内的多行 JS 合并为一行。

**⚠️ 行注释陷阱**：
```javascript
// ❌ 压缩后变成：// 暗色模式初始化(function(){...})();
// 导致整段代码被注释掉
// 暗色模式初始化
(function() { ... })();

// ✅ 安全
/* 暗色模式初始化 */
(function() { ... })();
```

**⚠️ 括号匹配陷阱**：
```javascript
// ❌ 多了一层 }) 在压缩后难以发现
});

// ✅ 准确匹配
});
```

---

## 第八章：响应式策略

### 8.1 视觉行为矩阵

| 元素 | 手机 (<768px) | 平板 (768-1023px) | 桌面 (≥1024px) |
|------|---------------|-------------------|----------------|
| 导航 | hamburger → 折叠面板 | hamburger → 折叠面板 | 水平链接 |
| 侧边栏 | 隐藏 | 隐藏 | 显示（300px 宽） |
| 文章卡片 | 1 列 | 2 列 | 2 列 |
| TOC | floating button + 底部抽屉 | floating button + 底部抽屉 | 侧边栏 sticky |
| gotop | 隐藏（浏览器自带） | 隐藏 | 显示 |
| 分页器 | 单行压缩 | 正常 | 正常 |
| 搜索 | 侧边栏内 | 侧边栏内 | 侧边栏内 |

### 8.2 断点实现

```css
/* 手机默认（无媒体查询） */
/* 平板增强 */   @media (min-width: 768px) { ... }
/* 桌面增强 */   @media (min-width: 1024px) { ... }
/* 宽屏限制 */   @media (min-width: 1400px) { .container { max-width: 1200px; } }
```

---

## 第九章：开发与迭代规范

### 9.1 工作流

```
本地修改 → git add → git commit → git push
                                     ↓
                          GitHub Pages 自动构建（1-2 分钟）
                                     ↓
                           curl 线上验证 / 浏览器 Ctrl+F5
```

### 9.2 代码审查清单（自检）

每次提交前检查：

| # | 检查项 | 方法 |
|---|--------|------|
| 1 | `//` 行注释 | `grep -rn "^\s*//" _includes/ _layouts/ --include="*.html"` |
| 2 | CSS 变量存在 | `grep -rn "var(--xxx)" assets/css/` 确认定义 |
| 3 | compress_html 兼容 | 线上 curl 查看压缩后 inline JS 是否有语法错误 |
| 4 | Git 状态 | `git status` 确认只改目标文件 |
| 5 | 权限文件 | 确保不动 `_config.yml`、`_posts/*`、`Gemfile` |
| 6 | 首次试试 | 如果是首次改某个文件，先读通内容再改 |

### 9.3 文件操作权限矩阵

| 目录 | 可修改 | 可新建 | 可删除 | 说明 |
|------|--------|--------|--------|------|
| `assets/css/` | ✅ | ✅ | ❌ | theme-modern.css 可改，旧 CSS 只可合并（不单删） |
| `_includes/` | ✅（部分） | ❌ | ❌ | 可改 header/footer/sidebar-post，不可动评论/广告/SEO |
| `_layouts/` | ✅（部分） | ❌ | ❌ | 可改 post/page/default，不可动 compress |
| `index.html` | ✅ | — | ❌ | 首页模板 |
| `_posts/` | ❌ | — | ❌ | 521 篇文章 |
| `_config.yml` | ✅（谨慎） | — | ❌ | 可修改评论/字数统计等配置项 |
| `_docs/` | ✅ | ✅ | ✅ | 项目文档，自由操作 |
| `assets/js/main.js` | ✅ | — | ❌ | 统一 JS 入口，所有前端逻辑集中于此 |
| `assets/vendor/` | ❌ | — | ❌ | 第三方库 |

---

## 第十章：组件详细规范

### 10.1 Header（粘贴头）

| 属性 | 值 |
|------|-----|
| 定位 | `position: sticky; top: 0; z-index: 40` |
| 背景 | 亮色 `rgba(255,255,255,0.9)`，暗色 `rgba(20,18,16,0.85)` |
| 毛玻璃 | `backdrop-filter: blur(20px)` |
| 高度 | `min-height: 64px` |
| 导航项 | 圆角按钮风格，hover 背景色变化 |
| 暗色切换 | Sun/Moon SVG 图标，localStorage 持久化 |

### 10.2 Post Card（文章卡片）

| 属性 | 值 |
|------|-----|
| 布局 | CSS Grid，`gap: 20px` |
| 圆角 | 20px |
| 边框 | 2px solid `rgba(114,93,66,0.1)` |
| 基础阴影 | `0 2px 4px 0 rgba(61,52,40,0.06)` |
| Hover 上浮 | `translateY(-4px)` |
| Hover 阴影 | `0 8px 24px 0 rgba(61,52,40,0.14)` |
| 过渡 | `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` |
| 顶部装饰线 | 3px 高，色值与卡片颜色变体匹配，hover 时透明度从 0.3→0.8 |

### 10.3 TOC（文章目录）

| 功能 | 实现 |
|------|------|
| 标题抓取 | `.main-content` 下的 `h1/h2/h3/h4` |
| 隐藏条件 | 标题数 < 2 |
| 锚点偏移 | CSS `scroll-margin-top: 80px` |
| 活跃跟踪 | `IntersectionObserver` + `rootMargin: '-50px 0px -65% 0px'`，由 `assets/js/main.js` 管理 |
| 高亮样式 | 当前活跃项加粗 (`font-weight: 700`) + 左侧 3px 品牌色指示条 + 平滑过渡 |
| 点击滚动 | 原生 `<a href="#id">` 行为 |
| 移动端触发 | floating button（48×48，品牌色，右下 24px） |
| 移动端抽屉 | 底部弹出，半透明遮罩，Escape 关闭 |

### 10.4 Pagination（分页器）

```css
/* 3D 按钮效果 */
.pagination a, .pagination span {
  box-shadow: 0 4px 0 #bdaea0;
  transform: translateY(0);
  transition: all 0.1s ease;
}
.pagination a:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #bdaea0;
}
```

### 10.5 Dark Mode（暗色模式）

| 特性 | 实现 |
|------|------|
| 切换触发 | Header 中的 Sun/Moon 按钮 |
| 持久化 | `localStorage.setItem('theme', 'dark')` |
| 初始化 | `<head>` 内联脚本，在页面渲染前读取 localStorage 并设置 `.dark` class |
| CSS 作用域 | `.dark { ... }` class 覆盖 |
| 覆盖范围 | 背景色、文字色、边框色、卡片色、代码块、表格、引用块、图片、HR |

### 10.6 上一篇 / 下一篇导航（Post Detail）

**位置**：`_layouts/post.html`，文章正文与评论区之间。

```
┌─────────────────────────────────────────────┐
│  ← 上一篇                                    │
│  文章标题到这里                              │
├─────────────────────────────────────────────┤
│  下一篇 →                                    │
│  下篇文章标题                                │
└─────────────────────────────────────────────┘
```

| 属性 | 值 |
|------|-----|
| 实现方式 | Jekyll 原生 `page.previous` / `page.next` 变量 |
| 布局 | 两行卡片式，flex 上下排列（桌面可考虑左右） |
| 首/末篇 | 灰色 disabled 状态，提示"已是第一篇/最后一篇" |
| 圆角 | 16px（`--animal-radius-sm`） |
| 阴影 | `0 2px 8px 0 rgba(61,52,40,0.08)` |
| Hover | 品牌色边框 + 轻微上浮 |
| 响应式 | 移动端保持上下两行，间距 `--animal-gap-lg` |

### 10.7 代码块交互：语言标签 + 复制按钮（Code Block Header）

**位置**：`assets/js/main.js`（Section 3）+ `theme-modern.css`（Section 22）。

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
| 语言标签 | 左侧 SVG 图标 + 语言名，`font-size: 11px`，大写 |
| 复制按钮 | 右侧 SVG 图标 + "复制" 文字 |
| 复制反馈 | 点击后按钮变为绿色 + "已复制" 文字，2 秒后恢复 |
| API 优先 | `navigator.clipboard.writeText()` |
| 降级方案 | `document.execCommand('copy')`（fallback） |
| header 插入 | 动态创建 `.code-header`，插入到 `<pre>` 之前 |
| 防重复处理 | `data-code-processed` 属性标记已处理的代码块 |

### 10.8 文章置顶（Sticky / Pinned Post）

**位置**：`index.html`（首页逻辑），`theme-modern.css` Section 24。

| 属性 | 值 |
|------|-----|
| 触发条件 | 文章 frontmatter 中设置 `sticky: true` |
| 排序逻辑 | Liquid 过滤 `paginator.posts \| where: "sticky", true` 后优先显示，再接普通文章 |
| 视觉标识 | 卡片左上角橙色 `📌 置顶` 徽章（pill 样式） |
| 徽章样式 | `background: linear-gradient(135deg, #f59e0b, #f97316)`，白色文字，`font-size: 11px` |
| 颜色变体 | 置顶文章强制使用橙色变体（`--card-orange`） |
| 置顶数量 | 建议 ≤ 3 篇，无硬性限制 |

---

## 第十一章：定制化与扩展

### 11.1 分类→颜色映射

所有分类映射在 `index.html` 中用 Liquid 逻辑维护：

```
dev → teal,     sec → red,     tool → orange,   life → green
thinking → purple,  travel → pink,  reads → yellow,  web → blue
flutter → blue,    ai → purple,     android → green,  kotlin → orange
rust → teal,       c++/cpp → pink,  docker → yellow,  java → red
default → #f7f3df (暖米)
```

### 11.2 侧边栏组件可插拔

侧边栏通过 `sidebar-post.html` 统一 Include，顺序固定。如需调整：
1. 修改 `sidebar-post.html` 中的 include 顺序
2. 在 `theme-modern.css` 对应模块中调整样式

### 11.3 广告位

| 广告位文件 | 出现位置 |
|-----------|----------|
| `content-header-ad.html` | 文章正文上方 |
| `content-footer-ad.html` | 文章正文下方 |
| `sidebar-ad.html` | 侧边栏 |
| `sidebar-detail-ad.html` | 文章页侧边栏 |
| `footer-ad.html` | 底部 |

---

## 第十二章：未来优化方向

| 优先级 | 优化项 | 说明 | 难度 |
|--------|--------|------|------|
| P1 | 移除旧 sidebar-post-nav.html | 文件已从 git 恢复但不再使用，可以彻底删除 | 低 |
| P2（✅ 已解决） | ~~重写 TOC 内联脚本为外部 JS~~ | 已迁移至 `assets/js/main.js`，`sidebar-post.html` 仅保留 HTML 生成 | — |
| P2 | 全文搜索替换旧颜色引用 | 项目中仍有少量 Primer 默认色（`#0366d6` 等），逐步替换为 CSS 变量 | 低 |
| P2 | 文章页面包屑导航 | 在文章头部增加分类面包屑，提升可导航性 | 低 |
| P2 | 图片懒加载加模糊占位 | 当前已用 `loading="lazy"`，可加低质量 blur-up 占位 | 中 |
| P3 | RSS Feed 优化 | 当前使用 Jekyll 默认 feed，可定制 | 低 |
| P3 | Service Worker 缓存 | GitHub Pages 不支持 SW 注册，但可通过 Cloudflare Workers 实现 | 高 |
| P3 | 文章阅读进度条 | 顶部细条指示当前阅读进度 | 低 |
| P3 | 文章目录可折叠 | 嵌套 h3/h4 可折叠，减少长目录的视觉负担 | 中 |

---

## 附录 A：关键文件索引

| 文件 | 用途 | 说明 |
|------|------|------|
| `assets/css/theme-modern.css` | 核心设计系统 | 1720 行，25 个模块，持续增长 |
| `assets/css/bundle-legacy.css` | 6 个旧 CSS 合并 | 15KB，兼容层，不改动 |
| `assets/js/main.js` | 统一 JS 入口（原生 JS） | gotop、图片懒加载、代码块语言标签+复制按钮、TOC 滚动高亮 |
| `_includes/sidebar-post.html` | 侧边栏 + TOC + 搜索 + 分类 | TOC HTML 生成（JS 逻辑在 main.js） |
| `_includes/header.html` | 头部导航 | sticky + 暗色切换 + hamburger |
| `_includes/footer.html` | 底部 | 极简 + 统计 |
| `_includes/comments.html` | 评论系统 | Utterances（基于 GitHub Issues） |
| `index.html` | 首页模板 | 卡片网格 + 侧边栏 + 分页器 + 置顶文章逻辑 |
| `_layouts/post.html` | 文章详情页 layout | 正文 + 字数统计 + 代码块 + 前后篇导航 + TOC + 评论 |
| `_layouts/default.html` | 默认 layout 骨架 | 嵌套 compress.html |
| `_docs/zhupite-redesign-plan.md` | 原始改造计划 | 10 项改造清单 |
| `_docs/optimization-best-practices.md` | 优化最佳实践 | 8 大经验总结 |

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
| Utterances | 基于 GitHub Issues 的评论插件，无需 OAuth App 和第三方 proxy |
| compress_html | Jekyll 插件，压缩 HTML 输出，但有 JS 兼容性陷阱 |
| Code Header | 代码块顶部的语言标签 + 复制按钮组合组件 |
| Sticky Post | 设置了 `sticky: true` 的置顶文章，在首页优先显示 |
| Primer CSS | GitHub 的 CSS 框架，zhupite.com 的历史基础样式 |
