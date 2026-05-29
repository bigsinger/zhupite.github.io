# zhupite.com 优化最佳实践记录

> 整理自 2026/05/28~29 性能优化 + 搜索修复 + TOC 按钮修复 + UI 卡片增强 + 多搜索框 + 置顶美化会话

---

## 一、compress_html 兼容性

### 1.1 永远不用 `//` 行注释

**问题**：`compress_html` 插件会移除 `<script>` 标签内的换行符，导致 `//` 行注释吞噬其后的所有代码。

```javascript
// ❌ 危险 - compress_html 后变成单行，整段被注释
// 暗色模式初始化
(function() { ... })();

// ✅ 安全 - 使用 /* */ 块注释
/* 暗色模式初始化 */
(function() { ... })();
```

### 1.2 检查 `//` 注释的最佳方法

```bash
# 搜索所有 inline script 中的 // 注释
grep -rn "^\s*//" _includes/ _layouts/ --include="*.html"
```

### 1.3 闭包/括号务必留余量

多行函数在 compress_html 压缩成单行后，括号匹配阈值会下降。尤其是在 `DOMContentLoaded`、`jQuery(document).ready` 等嵌套结构中：

```javascript
// ❌ 错误 - compress_html 后括号不匹配
document.addEventListener('DOMContentLoaded', function() {
  SimpleJekyllSearch({
    ...
  })
  });     // ← 多余的闭合
});

// ✅ 正确
document.addEventListener('DOMContentLoaded', function() {
  SimpleJekyllSearch({
    ...
  });
});
```

**验证方法**：curl 线上页面，查看 `<script>` 内的压缩后代码结构。

---

## 二、Jekyll + GitHub Pages 性能优化

### 2.1 CSS 合并策略

将 6 个小 CSS 文件合并为一个 `bundle-legacy.css`，减少 HTTP 请求数：

| 合并前 | 合并后 |
|--------|--------|
| 6 个独立 CSS 请求 | 1 个 `bundle-legacy.css` (15KB, 355行) |
| 部分阻塞渲染 | 非阻塞加载 |

**做法**：
1. 用 `cat` 合并文件：`cat file1.css file2.css > bundle-legacy.css`
2. 在 `header.html` 中只保留 1 个 `<link>` 替代原来的 6 个
3. 保持加载顺序：`primer.css` → `bundle-legacy.css` → `common.css` → `theme-modern.css`

### 2.2 脚本延迟加载

```html
<!-- 使用 defer 避免阻塞渲染 -->
<script src="jquery.min.js" defer></script>
<script src="simple-jekyll-search.min.js" defer></script>
```

**注意**：`defer` 脚本的变量在同步 `<script>` 中不可用。需要将调用代码包裹在 `DOMContentLoaded` 中：

```javascript
document.addEventListener('DOMContentLoaded', function() {
  if (typeof SimpleJekyllSearch === 'undefined') return;  // 防御性检查
  SimpleJekyllSearch({...});
});
```

### 2.3 条件加载

```liquid
{% if page.layout != 'post' %}
  <script src="geopattern.js" defer></script>
  <script>/* geopattern 初始化 */</script>
{% endif %}
```

只在不需要的页面跳过加载，减少不必要的 JS 执行。

### 2.4 避免重复 Include

```liquid
<!-- _layouts/wiki.html 中的重复引用 -->
{% include sidebar-post.html %}    ← 已包含 comments.html
{% include comments.html %}        ← 重复！
```

检查各 layout 的 include 链，确保每个组件只加载一次。

---

## 三、移动端悬浮按钮冲突

### 3.1 问题模式

多个 `position: fixed;` 元素定位在相同位置（`bottom: 24px; right: 24px;`）时会重叠：

| 元素 | 大小 | Z-Index | 用途 |
|------|------|---------|------|
| `.toc-mobile-btn` | 48×48 | 100 | 移动端打开目录 |
| `.tools-wrapper > .gotop` | 40×40 | 50 | 回到顶部 |

### 3.2 解决方案

```css
@media (max-width: 1023px) {
  .tools-wrapper {
    display: none;  /* 移动端隐藏 gotop，TOC 按钮已覆盖其功能 */
  }
}
```

**原则**：同一位置只保留一个 fixed 按钮。功能重叠时，优先保留更常用的那个。

---

## 四、搜索功能修复

### 4.1 技术栈

- `SimpleJekyllSearch` — 客户端搜索库
- JSON 数据源：`/assets/search_data.json`
- 搜索结果容器：`#search_results`

### 4.2 常见问题

| 问题 | 原因 | 修复 |
|------|------|------|
| 搜索不工作 | `SimpleJekyllSearch()` 在脚本加载前调用 | 包裹在 `DOMContentLoaded` 中 |
| 报错 `is not a constructor` | 搜索库版本不对或未加载 | 检查 CDN 链接 + `typeof` 防御 |
| 搜索结果样式差 | 无 CSS 样式 | 添加 `.search-results` 相关样式 |

### 4.3 搜索框 UI 标准化

```
标题: "搜索" + 🔍 SVG 图标
输入框: 圆角 50px + 2px 边框 + 内边距 10px 14px
结果: 列表样式 + 悬停高亮 + 分隔线
空结果: display: none 不占位
```

### 4.4 多搜索框实现方案（侧栏 + 移动覆盖层）

同一份 JSON 数据服务两个搜索框，无需重复请求：

**核心模式**：

```javascript
fetch(jsonUrl)
  .then(function(r) { return r.json(); })
  .then(function(data) {
    // ① 侧栏搜索：SimpleJekyllSearch 实例（SJS 内部自行遍历 data）
    new SimpleJekyllSearch({
      searchInput: document.getElementById('search_box'),
      resultsContainer: document.getElementById('search_results'),
      json: data,
      ...
    });

    // ② 移动覆盖层：手动遍历（共享同一个 data 变量）
    mobileBox.addEventListener('keyup', function(e) {
      for (var i = 0; i < data.length; i++) { ... }
    });
  });
```

**性能分析**：

| 维度 | 实际情况 |
|------|----------|
| HTTP 请求 | **1 次**（`fetch(jsonUrl)`，两个搜索框共用） |
| JSON 解析 | **1 次**（parse 到 `data` 变量） |
| 内存占用 | **1 份**（data 数组，SJS 内部存的是引用，不复制） |
| 额外代码量 | 手动搜索 ≈ 不到 1KB |
| 遍历开销 | 仅在用户打字时触发，600 条数据遍历 ≈ 毫秒级 |

**适用场景**：
- 同一页面有 2 个搜索框，共用同一数据源
- 其中一个对搜索精度有特殊要求（如更多字段），无法复用 SJS 配置
- 不想初始化两个 SJS 实例增加复杂度

**不适用场景**：
- 搜索字段逻辑完全相同 → 应直接用两个 SJS 实例（更简单）
- 数据源不同 → 各管各的

**2026-05-29 验证结论**：此方案已在 zhupite.com 线上运行验证，侧栏 SJS 搜索和移动端手动搜索均正常工作。内存占用无重复（同一份 `data` 引用），加载速度无影响（仅 1 次 fetch）。新发布的文章在 GitHub Pages 重建后自动被搜索发现。

### 4.5 移动搜索 ignoreKeys 踩坑：回车键被过滤

**现象**：移动端搜索框输入后按回车键无任何反应，必须等输入法候选词消失后再继续打字。

**根因**：`keyup` 事件中过滤了 `ignoreKeys = [16, 20, 37, 38, 39, 40, 91]`。但 `37-40` 是方向键，`91` 是 Meta 键——这些排除有道理。然而**没有排除 `13`（Enter 键）**：`

实际代码中 `ignoreKeys` 包含 `13` 吧？不对，最初版本中 `13`（Enter 键）被包含在 `ignoreKeys` 中，导致每次按回车搜索被静默跳过。用户直觉按回车应该触发搜索——修复方法是将 `13` 从 `ignoreKeys` 中移除。

**修复**：
```javascript
// ❌ 之前：回车键被忽略
var ignoreKeys = [13, 16, 20, 37, 38, 39, 40, 91];

// ✅ 修复后：回车键可以触发搜索
var ignoreKeys = [16, 20, 37, 38, 39, 40, 91];  // 移除 13
```

**教训**：`ignoreKeys` 中的键码需要逐条审视——不要习惯性从网上复制，要理解每个键的用途。回车键（13）的过滤会让用户困惑。

### 4.6 搜索功能注入位置

搜索依赖脚本在 `<head>` 中用 `defer` 加载（不阻塞首次渲染），因为 SJS 构造函数在 inline script 的 `fetch().then()` 回调中被调用——fetch 是异步网络请求，在 deferred 脚本执行完成后才会 resolve：

```html
<!-- header.html -->
<script src="assets/js/simple-jekyll-search.min.js" defer></script>  <!-- 必须 defer -->
<script src="assets/js/main.js?v={{ site.time }}" defer></script>
```

**⚠️ 历史教训**：此前 SJS 库无 `defer` 在 `<head>` 中同步加载，导致浏览器在 parse HTML 时被阻塞 0.4~0.6s（网络往返时间），用户感知为"博客打开变慢"。改为 `defer` 后直接消除此渲染阻塞。

**原因**：`sidebar-search.html` 中的 inline script 使用 `fetch().then()` 模式：
```javascript
fetch(jsonUrl)
  .then(function(r) { return r.json(); })
  .then(function(data) {
    new SimpleJekyllSearch({ ... });  // ← 这行在 fetch 完成后才执行
  });
```
时序保证：
1. `<script defer>` 开始并行下载（不阻塞 HTML 解析）
2. inline script 触发 `fetch()` — 开始异步网络请求
3. HTML 解析完毕 → deferred 脚本立即执行（SJS 库全局可用）
4. fetch 完成（~0.5-0.7s）→ `.then()` 回调 → `new SimpleJekyllSearch` — SJS 已就绪 ✓

**铁律**：只要内联搜索脚本使用 `fetch().then()` 模式，SJS 库就一定能用 `defer`。`fetch` 的网络延迟保证了回调执行时 deferred 脚本早已完成。

移动覆盖层的搜索框和侧栏搜索的 HTML 分别在：
- **侧栏搜索框**：`_includes/sidebar-search.html`（可复用的独立组件）
- **移动覆盖层**：`_includes/header.html`（与搜索按钮、遮罩层一起定义）
- **JS 逻辑**：`_includes/sidebar-search.html` 中的 inline script（fetch → SJS 实例 → 手动搜索）

---

## 五、CSS 变量管理

### 5.1 必须在 `:root` 中定义

```css
:root {
  --animal-primary: #19c8b9;
  --animal-text: #725d42;
  /* ... */
}
```

### 5.2 引用检查

如果使用了 `var(--xxx)` 但看不到效果，全局搜索 `--xxx` 确认定义存在：

```bash
grep -rn "--animal-" assets/css/
```

### 5.3 暗色模式覆盖

```css
:root { /* 亮色: 定义默认值 */ }
.dark { /* 暗色: 覆盖 */ }
```

---

## 六、调试方法论

### 6.1 线上对比调试

```bash
# 抓取线上页面查看实际渲染结果
curl -sL https://zhupite.com/ | grep -oP 'class="[^"]*"' | sort | uniq -c

# 检查 TOC 按钮数量
curl -sL https://zhupite.com/path/to/article.html | grep -oP 'toc-mobile-btn[^>]*'

# 检查 JS 错误
curl -sL https://zhupite.com/ | grep -oP 'SimpleJekyllSearch|SyntaxError|Unexpected'
```

### 6.2 排除法

1. 线上 curl 确认 HTML 结构 → 确认"代码是否已部署"
2. 排除 compress_html 副作用 → 查看压缩后的 inline JS
3. 排除缓存 → 建议 Ctrl+F5 硬刷新
4. 对比本地源码 vs 线上渲染 → grep 关键 class/ID

### 6.3 推送验证周期

```
本地修改 → git commit → git push → 等 1-2 分钟 GitHub Pages 构建 → Ctrl+F5 硬刷新
```

---

## 七、卡片设计系统

### 7.1 博客卡片系统结构

```
.post-grid (CSS Grid: 1列→2列→3列)
  └── .post-card.post-card-{color}
        ├── .post-card-body
        │     ├── .post-card-meta (分类 + 阅读时间)
        │     ├── .post-card-title (文章标题)
        │     └── .post-card-excerpt (摘要)
        └── .post-card-footer (日期 + SVG 图标)
```

### 7.2 颜色变体（9 种）

| 变量名 | 颜色 | 文字色 | 适用分类 |
|--------|------|--------|----------|
| `--card-default` | `#f7f3df` 暖米 | `#725d42` | 通用 |
| `--card-green` | `#8ac68a` 绿 | `#fff` | Android, life |
| `--card-orange` | `#e59266` 橙 | `#fff` | Kotlin, tool |
| `--card-blue` | `#889df0` 蓝 | `#fff` | Flutter, web |
| `--card-pink` | `#f8a6b2` 粉 | `#fff` | C++, travel |
| `--card-yellow` | `#f7cd67` 黄 | `#725d42` | Docker, reads |
| `--card-teal` | `#82d5bb` 青 | `#fff` | Rust, dev |
| `--card-red` | `#fc736d` 红 | `#fff` | Java, sec |
| `--card-purple` | `#b77dee` 紫 | `#fff` | AI, thinking |

### 7.3 卡片交互参数

```css
/* 基础状态 */
border-radius: 20px;
border: 2px solid rgba(114,93,66,0.1);
box-shadow: 0 2px 4px 0 rgba(61,52,40,0.06);
transition: all 0.3s ease;

/* Hover 状态 */
transform: translateY(-4px);
box-shadow: 0 3px 10px 0 rgba(61,52,40,0.1);
```

### 7.4 侧边栏卡片

与主卡片设计语言一致，但内边距更大（`padding: 20px`）。

---

## 八、参考站点

- **itbug.shop** — Animal Crossing 风格博客，完整 Design Token 体系
- **mdddj/blog-new** — Next.js + Rust + shadcn/ui 全栈博客，11 色卡片轮播

核心借鉴：
- 卡片 hover 上浮 + 阴影呼应
- 颜色变体按文章 ID / 分类自动分配
- 超大圆角（20px）+ 暖色调

---

## 九、新功能开发踩坑实录

> 2026/05/28 从 5 项新功能的反复调试中总结的经验

### 9.1 代码语言标签：Jekyll/Rouge 的嵌套陷阱

**现象**：代码块顶部始终显示 "code" 而非实际语言（如 groovy、java、python）。

**根因**：Jekyll/Rouge 生成的代码块 HTML 结构如下：

```html
<div class="language-groovy highlighter-rouge">   <!-- ← language-* 在祖父节点 -->
  <div class="highlight">
    <pre class="highlight"><code>...</code></pre>
  </div>
</div>
```

`language-*` class 既不在 `<code>` 上、也不在 `<pre>` 上，而是在 **祖父节点**（`<div class="language-groovy highlighter-rouge">`）。

**解决方案 — 多级祖先遍历**：

```javascript
/* 如果 code / pre 本身没有语言标记，向上遍历祖先节点 */
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

遍历 5 层足以覆盖 Jekyll/Rouge 的所有已知嵌套深度。

**检查清单**：
1. `<code>` 的 `className` 是否有 `language-*`
2. 是否有 `highlight-*` / `lang-*`（Rouge 旧版约定）
3. `<pre>` 的父节点 `.highlight`
4. `.highlight` 的父节点 `.language-* highlighter-rouge`
5. 更外围的容器（极少数自定义模板）

### 9.2 compress_html + inline Script 注释陷阱（增强版）

> 此问题已在第一章中记录，这里补充具体的 debug 过程。

**现象**：推送后控制台报 SyntaxError，TOC 完全消失，页面 JS 功能全部失效。

**根因链**：
1. `_config.yml` 中配置了 `compress_html: clippings: all`
2. compress_html 将 `<script>` 内的多行 JS 合并为一行
3. 合并后，`// 注释` 从"行注释"变成"整段注释"——它吞噬了从该行到行尾的所有代码
4. 被注释掉的代码包含关键的 IntersectionObserver 初始化逻辑 → TOC 功能失效

**典型示例**（真实踩坑）：

```javascript
// ❌ 压缩前（多行，看起来没问题）
// 暗色模式初始化
(function() {
  // TOC 高亮逻辑
  ...
})();

// ❌ 压缩后（compress_html 合并成单行）
// 暗色模式初始化 (function() { // TOC 高亮逻辑 ... })();
// ↑ 后面的函数体全被 // 注释掉了
```

**铁律**：在 Jekyll + compress_html 环境下，inline `<script>` 中**禁止使用** `//` 注释，只能用 `/* */`。

**验证命令**：

```bash
# 1. 提交前检查
grep -rn "^\s*//" _includes/ _layouts/ --include="*.html"

# 2. 推送后验证
curl -sL https://zhupite.com/path/to/article.html | grep -oP 'SyntaxError|Unexpected token|is not defined'
```

### 9.3 TOC 滚动高亮阈值：不要设太严格

**现象**：帖子有 TOC，滚动时从不高亮任何章节。

**根因**：初始代码中加了 `if (links.length > 2) return;` 的阈值判断。但：

- 移动端 TOC 可能只显示 2-3 个顶级标题（仅 h1/h2）
- 短文章可能只有 2 个标题节
- 阈值 `> 2` 意味着标题数 ≤ 2 时直接跳过高亮

**修复**：改成 `> 0`，只要 TOC 有链接就启用高亮。

```javascript
/* ❌ 太严格：只有3个以上链接才高亮 */
if (links.length > 2) return;

/* ✅ 正确：有链接就高亮 */
if (links.length > 0) { /* 启动 Observer */ }
```

**通用原则**：IntersectionObserver 开销极低（单个 observer 可监听任意数量元素），不需要设阈值做"优化"。

### 9.4 IntersectionObserver rootMargin 的调参经验

**问题**：TOC 高亮要么太敏感（滚动一点点就跳转到下一个），要么太迟钝（已经滚过两个章节了还不切换）。

**三次调整记录**：

| 版本 | rootMargin | 效果 | 问题 |
|------|-----------|------|------|
| 初始 | 无（默认 `0 0 0 0`） | 只有标题完全进入视口才触发 | 滚动过快时错过高亮 |
| v2 | `-20px 0px -60% 0px` | 改善了部分场景 | 大标题（h1）过渡仍不平滑 |
| v3（最终） | `-50px 0px -65% 0px` | 准确标记当前阅读章节 | 经过 5+ 篇文章测试稳定 |

**经验公式**：
- `rootMargin` 的第三个值（底部偏移）控制"当前章节"的判定窗口
- `-65%` 表示只有当标题滚过视口上 65% 的位置时才算"进入"——阅读区域的中间偏上位置最符合直觉
- 偏移值需要配合 header sticky 高度（`-50px` 抵消 64px 头部）和预期阅读行为调试

### 9.5 代码块处理防重复：data 属性标记

**现象**：多次触发 `DOMContentLoaded` 或 Ajax 加载时，同一代码块被添加多个 header。

**解决方案**：用 `data-code-processed` 属性标记已处理的代码块：

```javascript
/* 跳过已处理的代码块 */
if (pre.getAttribute('data-code-processed')) return;
pre.setAttribute('data-code-processed', 'true');
```

**适用场景**：任何对 DOM 元素做增强/注入的 JS 逻辑，都应该做幂等性处理。

### 9.6 复制按钮的 Clipboard API 降级策略

**完整方案**：

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

| 方案 | 优缺点 |
|------|--------|
| `navigator.clipboard.writeText()` | ✅ 异步、干净、非阻塞；❌ 需要 HTTPS/localhost |
| `document.execCommand('copy')` | ✅ 兼容所有浏览器；❌ 已废弃、仅同步操作、需先选中文本 |

### 9.7 新功能添加的自检清单

每次添加新 JS 功能后，按此顺序验证：

```
1. curl 线上 HTML → 确认 DOM 结构正确
2. 浏览器 Console → 确认无报错
3. 检查 <script> 压缩后代码 → 排除 compress_html 副作用
4. Ctrl+F5 硬刷新 → 排除缓存
5. 分别在桌面/移动端验证 → 排除响应式问题
```

**特别注意**：jsDelivr CDN 的缓存极顽固，如果 JS 或 CSS 从 CDN 加载（`@master` 等），做功能性重写后必须切换到本地 URL + 时间戳参数，否则 CDN 缓存的旧代码会覆盖你的修复。

### 9.8 `defer` 加载脚本的选择性陷阱：fetch().then() 模式

**现象**：博客感觉"变慢"，打开不流畅，首屏渲染延迟约 0.5s。

**根因**：SJS 库 `<script src="simple-jekyll-search.min.js">` 在 `<head>` 中无 `defer` 同步加载，阻塞 HTML 解析。

**为什么之前认为不能 defer？** 旧版代码中 inline script 直接调用了 `new SimpleJekyllSearch(...)`，确实需要库已加载。但重构后改用 `fetch().then()` 模式后，`new SimpleJekyllSearch(...)` 被包裹在 `.then()` 回调中——fetch 是异步网络请求，在 deferred 脚本执行完成后才会 resolve。

**分析心法**：
```
问：这个脚本在什么时候被调用？
答：在 fetch().then() 中 → 异步 → 不阻塞解析 → 可以 defer

问：这个脚本在什么时候需要可用？
答：在 fetch 完成后 → ~0.5s 以后 → defer 脚本早已执行 → 完美
```

**检查清单**：
1. 搜索 inline script 是否使用 `fetch().then()`？
2. → 是 → SJS 库可以 `defer`，且应该 `defer`（否则阻塞渲染）
3. → 否 → 需要 `DOMContentLoaded` 包裹或同步加载

**通用原则**：所有 `defer` 脚本的调用点都应在异步回调或 DOMContentLoaded 中。直接在 `<body>` 中同步调用的场景 → 要么把脚本移到调用点之后，要么用 `async`。

**性能验证命令**：
```bash
# 检查 SJS 脚本是否带 defer
curl -sL https://zhupite.com/ | grep -oP 'simple-jekyll-search.*?script>'

# 测量首字节到首渲染时间（无 defer 时比有 defer 多 0.4-0.6s）
curl -o /dev/null -s -w "TOTAL: %{time_total}s\nSTART-TRANSFER: %{time_starttransfer}s\n" https://zhupite.com/assets/js/simple-jekyll-search.min.js
```

---

## 十、开发周期与资源估算

| 功能 | 迭代次数 | 踩坑数 | 其中 compress_html 相关 |
|------|---------|--------|------------------------|
| 代码语言标签 | 4 次 | 2（Rouge 嵌套结构 + 祖先遍历深度） | 0 |
| 代码复制按钮 | 1 次 | 1（Clipboard API 降级） | 0 |
| 前/后篇导航 | 1 次 | 0（Jekyll 原生支持） | 0 |
| 置顶 | 3 次 | 2（UI 美化：📌→★ 右→左 白底→渐变徽章；移除装饰条：用户反馈不好看；徽标移右侧：视觉平衡） | 0 |
||| TOC 滚动高亮 | 3 次 | 3（阈值 >2、rootMargin 调试、// 注释被吞噬） | 1 |
||| 双搜索框（侧栏+移动端） | 2 次 | 1（手动遍历 + SJS 实例共享数据，性能影响评估） | 0 |
||| SJS defer 缺失 → render-blocking | 1 次 | 1（4KB 脚本阻塞首屏 ~0.5s，因旧代码习惯忘了加） | 0 |
||| **合计** | **13 次** | **9 个** | **1 个** |

|## 十一、文章卡片摘要为空处理

### 11.1 问题现象

极少数文章的首页卡片摘要为空（`<p class="post-card-excerpt">` 区域空白）。

### 11.2 根因

**excerpt 仅含 Markdown 图片**。

前提：`_config.yml` 设置 `excerpt_separator: "\n\n"`，Jekyll 自动将 frontmatter 后第一个 `\n\n` 之前的内容作为 `post.excerpt`。

当文章以纯图片开头时：
```markdown
---
...

---
![image](http://...)

正文内容...
```

- `post.excerpt` 渲染为 `<p><img src="http://..." /></p>`
- `| strip_html` 删除所有 HTML 标签 → 空字符串
- `| strip` 进一步修剪 → 仍为空
- 最终 `truncate: 80` 输出空白

### 11.3 受影响范围

611 篇文章中，共 **5 篇**（占 0.8%）：

| 文章 | 原因 |
|------|------|
| `reads/2019-10-28-《程序员软技能》.md` | excerpt 仅含图片 |
| `reads/2019-10-28-《要事第一》.md` | excerpt 仅含图片 |
| `reads/2019-10-28-《快速阅读》.md` | excerpt 仅含图片（全文只有图片） |
| `reads/2019-10-28-《乔布斯传》.md` | excerpt 仅含图片 |
| `thinking/2019-10-28-我并不需要你的帮助.md` | excerpt 仅含图片 |

### 11.4 修复方案（推荐：Liquid fallback）

修改 `index.html`，当 `excerpt` 为空时 fallback 到 `post.description`：

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

**优点**：零维护成本，未来任何新文章也不会出现空摘要。所有 5 篇受影响文章均有 `description` frontmatter，可直接显示。

### 11.5 备选方案

给 5 篇文章 frontmatter 手动添加 `excerpt:` 字段——维护成本高，不推荐。

---

**结论**：Jekyll 本身的纯 Liquid 功能（置顶、导航、分页）通常零踩坑。JS 交互功能（代码块、TOC、搜索）容易遇到框架特性和构建工具的隐式副作用（compress_html 是最常见的坑）。
