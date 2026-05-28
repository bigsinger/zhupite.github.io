# zhupite.com 旧主题剥离与独立化改造方案

> **目标**：完全剥离 mzlogin 旧主题框架，使站点独立、轻量、自给自足
> **核心原则**：改造后视觉效果 **零变化**，用户感知不到改版，只感到更快
> **版本**：v1.1（已自检修正）
> **状态**：待执行

---

## 第一章：现状分析

### 1.1 当前架构（改造前）

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
│ 8. theme-modern.css             (35KB) — 我们的新主题（覆盖层）   │
│ 9. Nunito/Noto SC 字体          (Google Fonts)                    │
├──────────────────────────────────────────────────────────────────┤
│ JS: jQuery 83KB + 已禁用组件的 JS                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 旧主题依赖精确清单

| # | 文件 | 实际大小 | 用途 | 是否可移除 |
|---|------|----------|------|-----------|
| 1 | `assets/vendor/primer-css/css/primer.css` | **28KB** | 基础 CSS 框架（重置、网格等） | ✅ 可替换 |
| 2 | `assets/css/bundle-legacy.css` | **16KB** | 6 个旧 CSS 合并 | ✅ 可移除 |
| 3 | `assets/css/globals/common.css` | **2KB** | 旧主题全局样式 | ✅ 可移除 |
| 4 | `assets/vendor/octicons/` | **212KB** | Octicons 图标字体（含 .ttf/.woff/.eot 等） | ✅ 可移除 |
| 5 | 旧 layout 文件（见 1.3） | — | 使用旧主题标记的布局 | ✅ 可重写 |
| 6 | `assets/vendor/jquery/dist/jquery.min.js` | **83KB** (+125KB map) | jQuery。**确认已无实际作用**：所有引用处（geopattern、fancybox）均已通过 `if enabled` 指令禁用 | ✅ 可移除 |
| 7 | `assets/vendor/share.js/` | **88KB** | 分享组件（已禁用） | ✅ 可移除 |
| 8 | `assets/vendor/flowchart.js/` | 30KB+ | 流程图渲染 | ⚠️ **保留**（4 篇旧文章引用） |
| 9 | `assets/vendor/js-sequence-diagrams/` | 50KB+ | 序列图渲染 | ⚠️ **保留**（4 篇旧文章引用） |
| 10 | `assets/vendor/gitalk/` | **32KB** | 旧评论系统（已用 Giscus 替代） | ✅ 可移除 |
| 11 | `assets/js/geopattern.js` | **20KB** | 旧 banner 背景（已禁用 `if geopattern.enabled`） | ✅ 可移除 |
| 12 | `assets/js/jquery.toc.js` | **8KB** | 旧 TOC（已用我们自己的 `sidebar-post.html` 替代） | ✅ 可移除 |
| 13 | `assets/vendor/busuanzi/` | 2KB | 不蒜子统计（另有 CDN 版本）+ `visit-stat.html` 已保留 | ✅ vendor 可删 |
| 14 | `_layouts/compress.html` | **4.5KB** | 旧压缩方案（有 `//` 注释陷阱） | ✅ 可替换 |
| 15 | `_includes/sidebar-post-nav.html` | 376B | 旧 TOC 组件（不再引用自 includes，但 **fragment.html/wiki.html 仍引用**） | ⚠️ 需先修改 layout |
| 16 | `_includes/sidebar-categories-nav.html` | 554B | 旧分类导航（**无任何文件引用**，纯死代码） | ✅ 可直接删除 |

> **修正说明 v1.1**：实际检查发现 octicons 含字体文件（212KB），jQuery 83KB（已有 map 125KB但线上不加载），且 jQuery 在 footer.html 的两处使用 (`geopattern` + `fancybox`) 均被 `{% if site.components.xxx.enabled %}` 包裹且已禁用，所以 jQuery 是安全的死亡代码。

### 1.3 使用旧主题标记的 Layout 文件

| Layout | 旧主题痕迹 | 改造方式 |
|--------|-----------|----------|
| `_layouts/fragment.html` | `geopattern` banner + `columns` 旧网格 + 引用 `sidebar-post-nav.html` | 用 page.html 风格重写 |
| `_layouts/wiki.html` | 同上 | 用 page.html 风格重写 |
| `_layouts/gallery.html` | 可能也有旧标记 | 用 page.html 风格重写 |
| `_layouts/mindmap.html` | 含 mzlogin CDN 引用 + 旧容器 | 保留功能，重写容器 |

### 1.4 旧文章中嵌入的旧主题标记

| 引用类型 | 检查结果 |
|----------|----------|
| 旧文章引用 `collection-head`/`geopattern`/`octicon` class | **0 篇** — 无旧文章使用这些 class |
| flowchart/sequence 插件引用 | **4 篇** — 保留 vendor 文件 |

---

## 第二章：目标架构（改造后）

### 2.1 加载链

```
┌──────────────────────────────────────────────────────────────┐
│ 1. theme-modern.css (预计 ~45KB)  ← 独立自足，移除全部旧依赖 │
│ 2. rouge-github.css (本地)        ← 代码高亮                 │
│ 3. Nunito/Noto SC 字体            ← Google Fonts             │
├──────────────────────────────────────────────────────────────┤
│ JS: 仅 condition-flowchart 和 condition-sequence（4篇文章）   │
└──────────────────────────────────────────────────────────────┘
```

**效果对比**：

| 指标 | 改造前 | 改造后 |
|------|--------|--------|
| CSS 请求数 | 5-7 个 | **2 个**（theme-modern.css + 代码高亮） |
| CSS 体积（含字体） | ~280KB | ~55KB |
| JS 请求数 | 5 个（含 jQuery 83KB + 已禁用组件） | **1-3 个**（有条件） |
| 总下载量 | ~350KB | ~80KB |
| HTTP 请求减少 | — | **减少 60-70%** |

### 2.2 核心改动

#### 改动 A：theme-modern.css 独立化（核心）

当前 theme-modern.css（1520 行）是**覆盖层**，依赖 primer.css 提供基础样式。需要移植 primer 的核心功能：

**需从 primer.css 移植的基础样式**：

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

> 移植完成后，theme-modern.css 约 1800 行，完全自给自足。

#### 改动 B：header.html 精简

**删除的引用**：

```diff
- <link rel="stylesheet" href="primer.css">          ← 28KB
- <link rel="stylesheet" href="bundle-legacy.css">   ← 16KB
- <link rel="stylesheet" href="common.css">           ← 2KB
- <link rel="stylesheet" href="octicons.css">         ← 212KB
- <link rel="stylesheet" href="share.min.css">        ← 已禁用
- <link rel="stylesheet" href="fancybox.css">         ← 已禁用
- <link rel="stylesheet" href="CDN/rouge-themes">     ← 改为本地
- <script src="jquery.min.js">                        ← 已无用 83KB
```

**保留的引用**：

```html
<link rel="stylesheet" href="assets/css/theme-modern.css">
<link rel="stylesheet" href="assets/css/rouge-github.css">  ← 本地化
<!-- SEO / GA / AdSense / 百度站长 / Giscus 等 — 全部保留 -->
```

#### 改动 C：Layout 重写（fragment.html / wiki.html / gallery.html / mindmap.html）

旧模板（以 fragment.html 为例）：
```html
<section class="collection-head small geopattern" data-pattern-id="...">
  <div class="container"><div class="columns">...
  {% include sidebar-post-nav.html %}
```

新模板：
```html
<div class="page-detail">
  <header class="page-detail-header">
    <h1 class="page-detail-title">{{ page.title }}</h1>
  </header>
  <article class="article-content markdown-body">{{ content }}</article>
</div>
```

功能保留清单：
- ✅ 内容正文（markdown-body）
- ✅ 评论（Giscus）
- ✅ 侧边栏（TOC + 搜索 + 广告）
- ⚠️ 旧文章中嵌入的 `.container`/`.columns` 标记 — 通过兼容层保证显示

#### 改动 D：compress.html 替换

旧方案（4.5KB，复杂的 Liquid 压缩，有 `//` 注释陷阱）→ 极简版

> 保留 HTML 压缩功能，消除注释陷阱风险。

#### 改动 E：代码高亮本地化

当前 CDN 引用：`https://fastly.jsdelivr.net/gh/mzlogin/rouge-themes@master/dist/github.css`

→ 下载为本地文件 `assets/css/rouge-github.css`

---

## 第三章：执行计划（6 轮，串行执行）

### 3.1 执行顺序

```
Round 1: 基础准备（无风险）
├── 下载 rouge-github.css 到本地
├── 删除 sidebar-categories-nav.html（死代码，0 引用）
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

### 3.2 可直接删除的文件（确认 0 引用）

```bash
rm _includes/sidebar-categories-nav.html     # 0 引用，死代码
```

### 3.3 需 Round 4 完成后删除的文件

```bash
rm _includes/sidebar-post-nav.html           # 被 fragment/wiki 引用，重写后可删
```

### 3.4 保留的文件（旧文章依赖）

```bash
# 4 篇文章引用了 flowchart/sequence 插件，保留 vendor
assets/vendor/flowchart.js/          ← 保留
assets/vendor/js-sequence-diagrams/  ← 保留
```

---

## 第四章：验证流程

### 4.1 每轮执行后的验证

每完成一轮改动后，**必须**执行以下验证，确认无误后才能进入下一轮。

#### 第 1 步：Jekyll 本地构建

```bash
cd /mnt/f/bigsinger/zhupite.github.io
bundle exec jekyll build --safe
echo "Jekyll 构建退出码: $?"
```

**如果构建失败** → 立即回退当前轮次的所有改动。

#### 第 2 步：关键页面在线检查（GitHub Pages 构建后）

```bash
URL="https://zhupite.com"

# 首页状态检查
echo "首页 HTTP: $(curl -so /dev/null -w '%{http_code}' $URL/)"
echo "文章页 HTTP: $(curl -so /dev/null -w '%{http_code}' $URL/travel/杭州爬山路线.html)"
echo "分类页 HTTP: $(curl -so /dev/null -w '%{http_code}' $URL/categories/)"
echo "About页 HTTP: $(curl -so /dev/null -w '%{http_code}' $URL/about/)"

# CSS 加载数
echo "CSS 数: $(curl -s $URL/ | grep -oP 'href="[^"]*\.css"' | sort -u | wc -l)"

# JS 错误检测
echo "JS 语法错误: $(curl -s $URL/travel/杭州爬山路线.html | grep -oP 'SyntaxError|Unexpected token|\bis not\b' | head -5)"
```

#### 第 3 步：视觉元素验证（15 项）

| # | 验证项 | 方法 | 判定标准 |
|---|--------|------|----------|
| 1 | 首页卡片 | 检查 `.post-card` 是否存在 | ≥1 个 |
| 2 | 首页侧边栏 | 检查 `.sidebar-content` | ≥1 个 |
| 3 | 首页头部 | 检查 `.site-header-modern` | ≥1 个 |
| 4 | 首页分页器 | 检查 `.pagination-modern` | ≥1 个 |
| 5 | 文章页 TOC | 检查 `.toc-mobile-btn` | ≥1 个（杭州文章 >19 个条目） |
| 6 | 文章内容 | 检查 `.post-detail` 或 `.markdown-body` | ≥1 个 |
| 7 | 文章评论 | 检查 `giscus` 或 `data-giscus` | ≥1 个 |
| 8 | 暗色模式 | 检查 `data-theme` 或 `dark-mode` class | 存在切换按钮 |
| 9 | 分类页 | 检查 `.category-group` | ≥1 个 |
| 10 | About 页 | 检查 `bigsinger` | ≥1 个 |
| 11 | 旧文章列表 | 随机打开 3 篇不同分类旧文章 | 正常渲染 |
| 12 | 代码高亮 | 打开含代码块的文章 | 代码块有颜色 |
| 13 | 响应式 | 检查 `@media` 断点 | 移动端布局正常 |
| 14 | Google Fonts | 检查 `fonts.googleapis.com` link | 存在 |
| 15 | GA/统计 | 检查 `google-analytics` | 存在 |

**验证脚本**：

```bash
#!/bin/bash
URL="https://zhupite.com"

echo "=== 1. 核心页面状态 ==="
for p in "/" "/travel/杭州爬山路线.html" "/categories/" "/about/"; do
  echo "$p: $(curl -so /dev/null -w '%{http_code}' $URL$p)"
done

echo -e "\n=== 2. 首页关键元素 ==="
HTML=$(curl -s $URL/)
echo "post-card: $(echo "$HTML" | grep -c 'post-card')"
echo "site-header: $(echo "$HTML" | grep -c 'site-header-modern')"
echo "sidebar: $(echo "$HTML" | grep -c 'sidebar-content')"
echo "pagination: $(echo "$HTML" | grep -c 'pagination-modern')"

echo -e "\n=== 3. CSS/JS 统计 ==="
echo "CSS files: $(echo "$HTML" | grep -oP 'href="[^"]*\.css"' | sort -u | wc -l)"
echo "JS files: $(echo "$HTML" | grep -oP 'src="[^"]*\.js"' | sort -u | wc -l)"

echo -e "\n=== 4. 文章页关键元素 ==="
AH=$(curl -s $URL/travel/杭州爬山路线.html)
echo "TOC按钮: $(echo "$AH" | grep -c 'toc-mobile-btn')"
echo "Giscus: $(echo "$AH" | grep -c 'giscus')"

echo -e "\n=== 5. JS 错误 ==="
echo "JS 错误: $(echo "$AH" | grep -oP 'SyntaxError|Unexpected token')"

echo -e "\n=== ✓ 验证完成 ==="
```

#### 第 4 步：灰度发布验证（每轮分 2 次提交）

```
Push 1: 改动代码（不改动旧文件引用时）
  → 等待 GitHub Pages 构建（1-2 分钟）
  → 执行步骤 2-3
  → 如失败：git revert HEAD && git push

Push 2: 删除旧文件（当前轮次确认无误后）
  → 等待 Pages 构建
  → 再次执行步骤 2-3
```

#### 第 5 步：回滚策略

```bash
# 快速回滚
git revert HEAD --no-edit
git push

# 如果需要回滚多步
git reset --hard <last-stable-commit-hash>
git push --force-with-lease
```

> **注意**：每次验证必须**等待 GitHub Pages 构建完成**（约 1-2 分钟）后再访问线上页面。建议 Ctrl+F5 强制刷新清除缓存。

---

## 第五章：详细改动清单

### Round 1：基础准备

**提交信息**：`chore: 代码高亮本地化 + 删除死代码 sidebar-categories-nav`

```bash
# 1. 下载代码高亮 CSS
wget -O assets/css/rouge-github.css \
  https://fastly.jsdelivr.net/gh/mzlogin/rouge-themes@master/dist/github.css

# 2. 删除死代码
rm _includes/sidebar-categories-nav.html

# 3. header.html 中修改 rouge 引用为本地
#    将 CDN URL → assets/css/rouge-github.css
```

### Round 2：theme-modern.css 独立化（核心改动）

**提交信息**：`refactor: theme-modern.css 自给自足 — 不再依赖 primer.css`

操作步骤：
1. 打开 theme-modern.css 文件
2. 在末尾（或合适位置）插入 primer.css 中移植的样式模块：
   - CSS Reset
   - 基础排版
   - 表格样式
   - 代码样式
   - 表单样式
   - 响应式容器（`.container`、`.columns`）
   - markdown-body 文章正文样式
   - 旧兼容层
3. 保存、构建验证

### Round 3：Header/Footer 精简

**提交信息**：`refactor: header/footer 精简 — 移除旧 CSS/JS 引用和已禁用组件`

```diff
# header.html 删除：
- <link rel="stylesheet" href="primer.css">
- <link rel="stylesheet" href="bundle-legacy.css">
- <link rel="stylesheet" href="common.css">
- <link rel="stylesheet" href="octicons.css">
- <link rel="stylesheet" href="share.min.css">    (条件加载，已禁用)
- <link rel="stylesheet" href="fancybox.css">     (条件加载，已禁用)
- CDN → 本地 rouge-github.css
- <script src="jquery.min.js">

# footer.html 删除：
- jQuery(document).ready(...) 包裹的 geopattern (条件，已禁用)
- jQuery(document).ready(...) 包裹的 fancybox  (条件，已禁用)
- fancybox CSS 引用（条件加载，已禁用）
```

### Round 4：Layout 重写

**提交信息**：`refactor: 重写 fragment/wiki/gallery/mindmap layout — 统一为 page 风格`

旧模式：
```html
<section class="collection-head small geopattern" data-pattern-id="...">
  <div class="container"><div class="columns">...
  {% include sidebar-post-nav.html %}
```

新模式：
```html
<div class="page-detail">
  <header class="page-detail-header">
    <h1 class="page-detail-title">{{ page.title }}</h1>
  </header>
  <article class="article-content markdown-body">{{ content }}</article>
</div>
```

同时，将 fragment.html 和 wiki.html 中的侧边栏引用从 `sidebar-post-nav.html` 改为 `sidebar-post.html`：

```diff
- {% include sidebar-post-nav.html %}
+ {% include sidebar-post.html %}
```

### Round 5：compress.html 替换

**提交信息**：`refactor: 替换 compress.html 为极简版 — 消除 // 注释陷阱`

保留 HTML 压缩功能，简化 Liquid 逻辑，移除复杂的 `_LINE_FEED` 机制。

### Round 6：收尾清理

**提交信息**：`chore: 清理旧 vendor/JS/CSS 目录 — 移除旧主题残留`

```bash
# 删除旧 vendor（保留 flowchart/sequence）
rm -rf assets/vendor/primer-css/
rm -rf assets/vendor/octicons/
rm -rf assets/vendor/gitalk/
rm -rf assets/vendor/share.js/
rm -rf assets/vendor/busuanzi/

# 删除旧 JS
rm -f assets/js/geopattern.js
rm -f assets/js/jquery.toc.js

# 删除旧 CSS
rm -f assets/css/bundle-legacy.css
rm -rf assets/css/components/        # 检查是否存在
rm -rf assets/css/globals/
rm -rf assets/css/posts/             # 检查是否存在
rm -rf assets/css/sections/          # 检查是否存在

# 删除已重写的旧 layout 引用文件
rm -f _includes/sidebar-post-nav.html
```

---

## 第六章：风险与应对

### 6.1 风险矩阵

| 风险 | 概率 | 影响 | 应对方案 |
|------|------|------|----------|
| theme-modern.css 漏移植样式导致页面错乱 | 中 | 高 | 每轮执行完整验证流程；回滚策略就绪 |
| 旧文章中嵌入 primer/octicons 标记 | **低**（已检查 0 篇） | 低 | 添加兼容层兜底 |
| compress.html 替换后构建失败 | 低 | **极高** | 保留旧文件副本，最后执行 |
| jQuery 仍有依赖 | **低**（已确认仅禁用组件使用） | 中 | 验证流程中的 JS 错误检测 |
| flowchart/sequence 旧文章加载失败 | 低 | 低（4 篇） | 保留 vendor 文件不删 |
| 第三方 CDN 加载慢 | 中 | 低 | 字体等已考虑预连接 |

### 6.2 兼容层样式

在 theme-modern.css 末尾添加，为旧文章中可能引用的旧 class 提供兜底：

```css
/* ===== 旧主题兼容层（兜底） ===== */
.collection-head { /* 旧标题容器 — 降级为普通块 */ }
.geopattern { background: var(--animal-bg); }
.octicon { display: none !important; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.columns { display: flex; gap: 20px; }
.column.three-fourths { flex: 3; }
.column.one-fourth { flex: 1; }
```

---

## 第七章：改造前后对比总表

### 7.1 文件维度

| 维度 | 改造前 | 改造后 |
|------|--------|--------|
| CSS 文件数 | 7 个（含 vendor 和 CDN） | **2 个**（theme-modern + rouge） |
| CSS 体积 | ~280KB（含字体图标） | ~55KB |
| JS 请求 | 5 个（jQuery + 禁用组件等） | **有条件加载**（仅 flowchart/sequence） |
| JS 体积 | ~140KB | ~0KB（默认不加载） |
| 总网络请求 | ~15 个 | ~8 个 |
| 总下载量 | ~350KB | ~80KB |
| HTML 复杂度 | 旧 compress 4.5KB | 极简版 0.5KB |

### 7.2 功能维度

| 功能 | 改造前 | 改造后 | 变化 |
|------|--------|--------|------|
| 首页卡片 | ✅ | ✅ | 无变化 |
| 文章正文 | ✅ | ✅ | 无变化 |
| TOC 导航 | ✅ | ✅ | 无变化 |
| 搜索 | ✅ | ✅ | 无变化 |
| 暗色模式 | ✅ | ✅ | 无变化 |
| 评论 (Giscus) | ✅ | ✅ | 无变化 |
| 分类页面 | ✅ | ✅ | 无变化 |
| About 页面 | ✅ | ✅ | 无变化 |
| 代码高亮 | ✅ | ✅ | 从 CDN 改为本地 |
| 图片灯箱 | ❌ 禁用 | ❌ 禁用 | 无变化（已移除代码） |
| 分享按钮 | ❌ 禁用 | ❌ 禁用 | 无变化（已移除代码） |

---

## 附录 A：验证脚本

将以下内容保存为 `quick-verify.sh` 并在每轮改造后运行：

```bash
#!/bin/bash
# quick-verify.sh — 快速验证站点核心功能
# 用法: bash quick-verify.sh
# 说明: 每轮改动后执行，通过全部检查后才算该轮完成

URL="https://zhupite.com"
PASS=0
FAIL=0
check() {
  local desc="$1"; local result="$2"
  if [ "$result" = "PASS" ]; then
    echo "  ✅ $desc"; ((PASS++))
  else
    echo "  ❌ $desc — $result"; ((FAIL++))
  fi
}

echo "=== 1. HTTP 状态码 ==="
for p in "/" "/travel/杭州爬山路线.html" "/categories/" "/about/"; do
  code=$(curl -so /dev/null -w '%{http_code}' "$URL$p")
  [ "$code" = "200" ] && check "$p (HTTP $code)" "PASS" || check "$p (HTTP $code)" "FAIL"
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
echo "$HTML" | grep -q 'octicons\.css' && check "octicons.css 残留" "仍然存在" || check "octicons.css 已移除" PASS
echo "$HTML" | grep -q 'jquery\.min\.js' && check "jQuery 残留" "仍然存在" || check "jQuery 已移除" PASS
echo "$HTML" | grep -q 'bundle-legacy\.css' && check "bundle-legacy 残留" "仍然存在" || check "bundle-legacy 已移除" PASS

echo -e "\n============================"
echo "通过: $PASS | 失败: $FAIL | 总数: $((PASS+FAIL))"
[ "$FAIL" -gt 0 ] && echo "⚠️ 有验证失败项，请检查后再推进下一轮" || echo "✅ 全部通过，可以进入下一轮"
```

---

## 附录 B：手动视觉检查清单

自动化脚本检查通过后，建议手动检查以下页面（浏览器硬刷新）：

| 页面 | URL | 检查内容 |
|------|-----|----------|
| 首页 | `https://zhupite.com/` | 卡片布局、侧边栏、搜索框、分页器、暗色切换 |
| 文章页 | `https://zhupite.com/travel/杭州爬山路线.html` | TOC（21 项）、正文、代码块、评论、暗色 |
| 旧文章 | `https://zhupite.com/dev/python-http-server.html` | 代码高亮、排版 |
| 分类页 | `https://zhupite.com/categories/` | 分类列表、跳转 |
| About | `https://zhupite.com/about/` | 用户信息、GitHub 链接 |
| 碎片页 | `https://zhupite.com/fragments/《十年之约》——献给所有坚持写作的博客作者` | fragment layout（确认不报错） |
| Wiki | `https://zhupite.com/wiki/vim-cheatsheet/` | wiki layout |
| 移动端 | Chrome DevTools 模拟手机 | 导航、卡片、TOC 按钮、搜索 |

---

## 附录 C：旧文件清理清单（最终版）

### 直接删除（Round 1 或 Round 6）

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

# Old compress
_layouts/compress.html  # 替换为新版后删除旧版

# Unused CSS component directories
assets/css/components/   # 如存在
assets/css/posts/        # 如存在
assets/css/sections/     # 如存在
```

### 保留的文件

```bash
# 4 篇旧文章依赖
assets/vendor/flowchart.js/          ← 保留
assets/vendor/js-sequence-diagrams/  ← 保留

# jQuery 虽然自身可删，但如果想保留.map文件参考，可保留
# 但实际使用时会被删除，因为 header.html 不再引用
```
