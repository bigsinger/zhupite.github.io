# zhupite.com 优化最佳实践记录

> 整理自 2026/05/28 性能优化 + 搜索修复 + TOC 按钮修复 + UI 卡片增强会话

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
标题: "搜索"（中文）+ 🔍 SVG 图标
输入框: 圆角 50px + 2px 边框 + 内边距 10px 14px
结果: 列表样式 + 悬停高亮 + 分隔线
空结果: display: none 不占位
```

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
