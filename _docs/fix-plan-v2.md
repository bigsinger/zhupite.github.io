# 第二次代码审计修复计划（v2）

> 基于 2026-05-31 第二次代码审计报告
> 原则：逐步修复，每步独立提交，验证通过后再继续，不破坏现有功能

---

## 目录

1. [阶段一：修复 BUG](#阶段一修复-bug)
2. [阶段二：清理死代码](#阶段二清理死代码)
3. [阶段三：CSS 代码质量改进](#阶段三css-代码质量改进)
4. [阶段四：可改进项](#阶段四可改进项)
5. [执行检查清单](#执行检查清单)

---

## 阶段一：修复 BUG

### 1.1 分类页 `categories.md` 死代码清理（非双重渲染）

**问题**：`_layouts/categories.html` 中没有 `{{ content }}` 标签，因此 `categories.md` 的内容体（`<section class="container posts-content">`...循环）在 Jekyll 编译后**被丢弃**，实际不渲染在页面上。这是从未被使用的死代码。

**验证确认**：
```bash
curl -s https://zhupite.com/categories/ | grep -c 'container posts-content'
# 返回 0 → 该片段未被渲染
curl -s https://zhupite.com/categories/ | grep -c 'category-group'
# 返回 39 → 仅布局模板中的彩色分类组生效
```

**修复方案**：删除 `categories.md` 内容体中无用代码块，仅保留前注。

**文件**：
- `pages/categories.md` — 删除 L11-L25 的 `<section class="container posts-content">`...`<!-- /section.content -->` 代码块

**风险**：极低。该代码从未被渲染，删除不影响任何功能。

---

### 1.2 `open-source.md` 样式修复

**问题**：该页面使用大量旧 Primer 框架 CSS 类（`text-center`, `one-third-column`, `card`, `geopattern`, `octicon`, `card-image` 等），这些类在清理死 CSS 时已被移除，页面布局和图标不可见。

**修复方案**：需要确认是否保留这个页面。
- 选项 A：保留页面，补充必要的 CSS（`.card-image`, `.thumbnail`, `.octicon` 等）
- 选项 B：彻底重写为现代样式
- 选项 C：确认是否要废弃，不再显示

**验证**：打开 https://zhupite.com/open-source/ 查看布局是否恢复。

**风险**：中。需要新增 CSS 但只影响此独立页面。

---

### 1.3 `_fragments` 数据集缺失

**问题**：`pages/fragments.md` 大量引用 `site.fragments`，但 `_fragments/` 目录不存在，所有循环渲染为空；标签过滤 JS 也无法工作。

**涉及文件**：
- `pages/fragments.md` — 依赖 `site.fragments` 的数据显示和标签筛选
- 需要确认 `_fragments/` 是否应该存在 → 如果只是废弃页，则归档页面不变，仅确认即可

**验证**：查看 https://zhupite.com/fragments/ 页面内容是否合理。

---

### 1.4 侧栏标签/分类锚点跳转失效

**问题**：侧栏标签链接指向 `categories/#{{ tag[0] }}`，但 `_layouts/categories.html` 中的锚点 `id` 基于 `category[0]` 生成。标签名和分类名不完全对齐（如标签 `c++` 在分类中无对应锚点）。

**修复方案**：
- 侧栏标签链接指向 `/categories/#` 无匹配时，页面可能空跳转
- 更安全的方案：如果点击的标签名在 `_layouts/categories.html` 中无对应锚点，则不做跳转，或聚焦到页面顶部并展示搜索结果

**选项 A（简单）**：不做更改，因为点击无效标签只是跳到页面顶部，不报错也不影响功能。
**选项 B（推荐）**：标签链接改为在 `/categories/` 页面加载后检测锚点是否存在，不存在则用 `pushState` 替换历史记录。

**验证**：点击侧栏所有标签和分类链接，确认都能定位到正确锚点。
**风险**：低。

---

## 阶段二：清理死代码

### 2.1 删除死布局文件

**问题**：`fragment.html` 和 `gallery.html` 未被任何文章/页面引用，且内容一致。

**修复方案**：删除两个文件。

```bash
rm _layouts/fragment.html _layouts/gallery.html
```

**验证**：`grep -rl 'layout: fragment\|layout: gallery' _posts/ pages/` 应返回空。
**风险**：极低。

---

### 2.2 删除 9 个死 CSS 类

**问题**：CSS 末尾 "Primer Compatibility Layer" 区块中的 `.clearfix`、`.columns`、`.four-fifths`、`.one-fifth`、`.one-fourth`、`.one-half`、`.single-column`、`.three-fourths`、`.two-thirds`、`.hidden` 共 10 个类未被模板使用。

**注意**：`open-source.md` 使用了 `.one-third`、`.column`、`.container`、`.text-center`、`.left`、`.right`，这些要保留。

**修复方案**：从 `theme-modern.css` 中删除未使用类的规则（约 25 行）。

```css
/* 保留的Primer类（被open-source.md使用） */
.column { float: left; padding: 0 10px; }
.one-third { width: 33.333%; }
.container { ... }
.text-center { text-align: center; }
.left { float: left; }
.right { float: right; }

/* 以下可删除 */
.clearfix::before, .clearfix::after { ... }
.columns { ... }
.four-fifths { width: 80%; }
.one-fifth { width: 20%; }
.one-fourth { width: 25%; }
.one-half { width: 50%; }
.single-column { padding: 0 10px; }
.three-fourths { width: 75%; }
.two-thirds { width: 66.667%; }
.hidden { display: none; }
```

**验证**：用 `grep -rn 'class="[^"]*clearfix\|class="[^"]*columns' _includes/ _layouts/ pages/ index.html` 确认无引用后删除。
**风险**：极低（这些类已确认不被使用）。

---

## 阶段三：CSS 代码质量改进

### 3.1 `copyright.html` 暗色模式兼容

**问题**：`_includes/copyright.html` 使用内联样式 `background-color:#deebf7`，在暗色模式下突兀。应该使用 CSS 变量。

**修复方案**：
- 在 `theme-modern.css` 中定义 `.copyright-box` 样式
- 在 `copyright.html` 中使用类名替代内联样式
- 暗色模式用 `.dark .copyright-box` 覆盖背景色

**新增 CSS**：
```css
.copyright-box {
  margin-top: 2em;
  padding: 0 1.5em;
  border: 1px solid var(--animal-border-card);
  border-radius: var(--animal-radius-sm);
  background: var(--animal-bg-secondary);
  color: var(--animal-text);
}
```

**验证**：切换暗色/亮色模式，文档信息框颜色随之变化。
**风险**：低。

---

### 3.2 补充 `post-card-reading` CSS

**问题**：`index.html` 中使用 `<span class="post-card-reading">` 显示阅读时长，但 CSS 中无此类的定义，仅靠继承父元素样式。

**修复方案**：在 `.post-card-meta` 后追加：
```css
.post-card-reading { font-size: 12px; color: var(--animal-text-secondary); }
```

**验证**：首页文章卡片上的阅读时长文字样式统一。
**风险**：极低。

---

### 3.3 删除 Windows 行尾 `\r\n`

**问题**：大量 HTML/MD 文件使用 `\r\n` 行尾，可能导致 Liquid 处理工具异常。

**修复方案**：
```bash
find . -type f \( -name '*.html' -o -name '*.md' -o -name '*.yml' -o -name '*.liquid' \) -not -path './.git/*' -not -path './_site/*' -exec dos2unix {} \;
```

**风险**：中。`\r\n` 转 `\n` 在 git 中会产生大量更改行，可能影响 diff 历史。可以仅处理此次修复涉及的文件，不做全局转换。

**推荐**：仅在本次修复涉及的文件上做 dos2unix，不做全量。或者作为可选项：本次暂不处理，等下次需要大规模修改时统一做。

---

## [可选] 阶段四：可改进项

### 4.1 `comments.html` 默认主题优化

`site.utterances.theme | default: 'github-light'` 但配置中使用了 `preferred-color-scheme`。default 从未被触发。不影响功能，可忽略。

### 4.2 `rouge-github.css.html` 内联优化

209 行/3KB 内联在 `<head>` 中 render-blocking。但这是语法高亮专用样式，仅渲染代码块时需要。可考虑合并到 `theme-modern.css` 中减少请求。

### 4.3 分页器 "片段"菜单项

`pages/fragments.md` 设置 `menu: 片段` 但 `_config.yml` 导航中无此条目。要么加入导航，要么删除该字段。

---

## 执行检查清单

### 前置检查

```bash
# 确保工作区干净
cd /mnt/f/bigsinger/zhupite.github.io
git status
```

### 每步后验证

| 验证 | 方法 |
|------|------|
| 分类页不重复 | 打开 /categories/ 手动数文章条数 |
| open-source 页面 | 打开 /open-source/ 确认布局正常 |
| fragments 页面 | 打开 /fragments/ 确认内容合理 |
| 标签锚点 | 点击侧栏标签链接，确认定位正确 |
| 暗色模式 | 切换主题，检查文档信息框颜色 |
| 首页阅读时长 | 检查卡片上的阅读时间显示 |

### 提交规范

```bash
fix(v2): N.操作说明

- 审计报告引用：阶段 X.Y
```

---

## 附录：本次审计问题总览

| 编号 | 严重度 | 问题 | 涉及文件 |
|------|--------|------|----------|
| 1.1 | 🔴 | 分类页文章重复渲染 | `pages/categories.md`, `_layouts/categories.html` |
| 1.2 | 🔴 | open-source.md 样式损坏 | `pages/open-source.md`, CSS |
| 1.3 | 🔴 | _fragments 数据集缺失 | `pages/fragments.md` |
| 1.4 | 🔴 | 标签锚点跳转失效 | 侧栏标签链接 |
| 2.1 | 🟡 | 死布局文件 | `_layouts/fragment.html`, `_layouts/gallery.html` |
| 2.2 | 🟡 | 死 CSS 类 | CSS 末尾 Primer 兼容层 |
| 3.1 | 🟡 | copyright 暗色模式 | `_includes/copyright.html`, CSS |
| 3.2 | 🟠 | post-card-reading 缺 CSS | CSS |
| 3.3 | 🔵 | Windows 行尾 | 多文件 |
