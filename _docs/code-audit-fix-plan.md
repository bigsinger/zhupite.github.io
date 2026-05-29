# 代码审计修复计划

> 基于 2026-05-29 代码审计报告制定的执行计划
> 原则：逐步修复，每步独立提交，不破坏现有功能

---

## 目录

1. [阶段一：修复 BUG（无风险）](#阶段一修复-bug无风险)
2. [阶段二：清理死代码（低风险）](#阶段二清理死代码低风险)
3. [阶段三：CSS 代码质量改进（低风险）](#阶段三css-代码质量改进低风险)
4. [阶段四：可改进项（中/低风险）](#阶段四可改进项中低风险)
5. [阶段五：无需操作项](#阶段五无需操作项)
6. [执行检查清单](#执行检查清单)

---

## 阶段一：修复 BUG（无风险）

> 这些是功能级 BUG，应优先修复。

### 1.1 fragments.md — 标签过滤 JS 重写（jQuery → 原生 JS）

**现状**：`pages/fragments.md` L44-L63 使用 `jQuery(function() { $(".listing-item")... })` 做客户端标签过滤，但 jQuery 已移除，JS 完全失效，点标签不筛选。

**修复方案**：

```javascript
// 替换 L44-L63 的 jQuery 代码为：
<script>
(function() {
  function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]);
    return null;
  }

  var tag = getUrlParam('tag');
  if (!tag) return;

  var items = document.querySelectorAll('.listing-item');
  for (var i = 0; i < items.length; i++) {
    var itemTags = items[i].getAttribute('tags') || '';
    if (itemTags.indexOf(tag) < 0) {
      items[i].style.display = 'none';
    }
  }
})();
</script>
```

**影响范围**：仅 `pages/fragments.md`，其他页面无影响。

**验证方式**：访问 `https://zhupite.com/fragments/?tag=xxx`，确认标签过滤生效。

---

### 1.2 CSS 未定义变量补全

**现状**：CSS 中使用了 `--animal-radius-md`（L776, L1620）和 `--animal-bg-hover`（L781, L1353, L1480）但未在 CSS 变量区定义。当前有 fallback 值，功能正常但语义不完整。

**修复方案**：在 `theme-modern.css` 的 `:root` 变量区（L6-L69）补加两个变量定义：

```css
/* 在 --animal-gap-xl 后面补齐 */
--animal-radius-md: 8px;
--animal-bg-hover: rgba(0,0,0,0.04);
```

同时，暗色模式 `.dark` 块中也需要对应（可选，视是否需要暗色差异）：

```css
/* 暗色 hover 可以更可见一些 */
.dark {
  --animal-bg-hover: rgba(255,255,255,0.06);
}
```

**影响范围**：仅补变量定义，不改变任何现有样式（fallback 值与原值相同）。

**验证方式**：构建后检查页面样式无变化。

---

### 1.3 robots.txt — 确认与清理

**现状**：`robots.txt` 中 `Disallow: /assets/` 阻断了搜索引擎抓取 assets 目录。

**分析**：站点的图片存放在 `/images/` 路径下（不是 `/assets/images/`），CSS/JS 存放在 `/assets/css/` 和 `/assets/js/` 下。**搜索引擎不需要抓取 CSS/JS 文件**，所以 `Disallow: /assets/` 实际上不影响内容收录。

**建议**：无操作，保持现状。但如果今后有文章图片移到 `/assets/images/`，需注意取消此 Disallow。

---

## 阶段二：清理死代码（低风险）

> 这些文件未被引用，删除不影响功能。建议逐项确认后分批删除。

### 2.1 删除 `ads.txt`

**理由**：`header.html` L149 已注释移除 AdSense 脚本（"不赚钱，影响加载"），`ads.txt` 保留了 AdSense 发布商 ID，已成孤立文件。保留可能导致 Google AdSense 控制台提示配置不一致。

**操作**：删除文件即可。

---

### 2.2 删除 `_data/social.yml`

**理由**：全站无任何模板引用 `site.data.social`。社交链接硬编码在：
- `_includes/sidebar-profile.html`（L8-L16）
- `_includes/footer.html`（L18-L26）

文件内容重复且未被使用。

**操作**：删除文件。

验证命令：`grep -r "site.data.social" _includes/ _layouts/ pages/ --include="*.html" --include="*.md"` → 无结果即安全。

---

### 2.3 删除 `_data/skills.yml`

**理由**：全站无任何模板引用 `site.data.skills`。21 行技能分类数据未被使用。

**操作**：删除文件。

验证命令：`grep -r "site.data.skills" _includes/ _layouts/ pages/ --include="*.html" --include="*.md"` → 无结果即安全。

---

### 2.4 删除 `_includes/sns-share.html`

**理由**：
- 模板头注释："Disabled: share, fancybox, jquery — removed in 2026-05-28 cleanup"
- `_config.yml` 中不存在 `components.share` 配置
- `sns-share.html` 中 `{% if site.components.share.enabled %}` 条件永假
- `default.html` 和 `post.html` 中**没有** `{% include sns-share.html %}` 引用

**操作**：删除文件。

---

### 2.5 CSS 死代码选择性清理

> 以下 CSS 规则可以安全移除，按保守程度分为"立即删除"和"保留观察"两类。

#### 立即删除（确认无用）

| CSS 选择器/规则 | 行号 | 理由 |
|----------------|------|------|
| `.octicon { fill: currentColor; }` | L1166 | 旧 Primer 图标类，所有图标已改为内联 SVG |
| `.share { margin-top: 24px; }` | L1383 | 分享功能已移除 |
| `.dark .site-header { background:... }` | L1845 | 旧主题 header 类，当前用 `.site-header-modern` |
| `.page-header, .post-header { display: none; }` | L1858-1859 | 注释说"old redundant styles kept for compatibility" |
| `*, *::before, *::after { box-sizing: border-box; }` | L1864 | **与 L90 完全重复**，Prmer 兼容层中的重复声明 |

#### 保留观察（Primer 兼容层）

| CSS 规则块 | 行号 | 说明 |
|-----------|------|------|
| `.container`, `.columns`, `.column` 网格类 | L1884-L1896 | 用于兼容旧文章中的容器类 |
| 基础排版（h1-h6, p, ul, blockquote 等） | L1868-L1882 | 部分可能与现有样式重叠 |
| 浮动类（`.left`, `.right`, `.text-center`, `.hidden`） | L1899-L1903 | 可能被旧文章引用 |
| 脚注样式 | L1905-L1911 | 部分文章使用了 footnotes |
| 图片说明 | L1913-L1914 | `img + em` 可能在某些文章中使用 |

**建议**：Primer 兼容层（§21, L1861-L1903）整块保留，等日后统一审查旧文章后再决定是否清理。**这块代码不会影响性能**（仅约 40 行，选择器特异度低，实际极少命中）。

---

## 阶段三：CSS 代码质量改进（低风险）

> 不影响功能，但提升可维护性。

### 3.1 CSS 章节重新编号

**现状**：多处编号重复或跳号：
- §17 出现两次（L1492 搜索覆盖层, L1818 性能懒加载）
- §18 出现两次（L1643 暗色模式表格, L1858 旧冗余样式）
- §19 出现两次（L1847 响应式, 注释书写的管理页）
- §20 实际是 L1845 的旧样式覆盖

**修复方案**：对 CSS 顶部注释的 Section 号重新规划，按功能域分组：

| 新编号 | 区域 | 当前行范围 |
|--------|------|-----------|
| §1 | CSS Variables（`:root` + `.dark`） | L6-87 |
| §2 | Base Reset | L89-137 |
| §3 | Header Navigation | L139-352 |
| §4 | Main Layout (blog-layout) | L354-384 |
| §5 | Section Header | L386-424 |
| §6 | Post Card Grid | L426-597 |
| §7 | Pagination | L599-661 |
| §8 | Sidebar Cards | L663-852 |
| §9 | TOC Sidebar | L854-1049 |
| §10 | Footer | L1051-1121 |
| §11 | Tools (gotop) | L1123-1157 |
| §12 | Page Content + Post Detail | L1159-1281 |
| §13 | Categories Index | L1283-1373 |
| §14 | Comments + Share | L1375-1383 |
| §15 | Article Tables | L1385-1490 |
| §16 | Search Overlay | L1492-1641 |
| §17 | Dark Mode Overrides | L1643-1816 |
| §18 | Performance | L1818-1821 |
| §19 | Copyight Dark Mode | L1823-1836 |
| §20 | Archive Dark Mode | L1838-1842 |
| §21 | Primer Compatibility | L1845-1914 |
| §22 | Code Block Header | L1919-1986 |
| §23 | Post Navigation | L1988-2046 |
| §24 | Sticky Badge | L2048-2092 |
| §25 | TOC Highlight | L2094-2118 |

**操作**：按上表逐行修正 `/* ===== N. Section Name ===== */` 注释。注意**不要改动任何 CSS 选择器或属性**，只改注释行。

---

### 3.2 CSS 重复声明的清理（Primer 兼容层）

**现状**：L90 和 L1864 各有一个 `*, *::before, *::after { box-sizing: border-box; }`，完全重复。

**操作**：删除 L1864 的那一个（Primer 兼容层内），保留 L90 的。

---

## 阶段四：可改进项（中/低风险）

> 这些不是 bug，但值得优化。

### 4.1 index.html — Liquid 颜色映射去重

**现状**：在 `sticky_posts` 循环（70 行）和 `regular_posts` 循环（70 行）中，各有一份完全相同的 32 行分类→颜色映射逻辑。

**修复方案**：将颜色映射提取为 Liquid include 片段：

**创建** `_includes/category-color.liquid`：

```liquid
{% assign cat_color = "default" %}
{% if post.categories.size > 0 %}
{% assign first_cat = post.categories[0] | downcase %}
{% if first_cat == "dev" %}{% assign cat_color = "teal" %}
{% elsif first_cat == "sec" %}{% assign cat_color = "red" %}
{% elsif first_cat == "tool" %}{% assign cat_color = "orange" %}
{% elsif first_cat == "life" %}{% assign cat_color = "green" %}
{% elsif first_cat == "thinking" %}{% assign cat_color = "purple" %}
{% elsif first_cat == "travel" %}{% assign cat_color = "pink" %}
{% elsif first_cat == "reads" %}{% assign cat_color = "yellow" %}
{% elsif first_cat == "web" or first_cat == "flutter" %}{% assign cat_color = "blue" %}
{% elsif first_cat == "ai" %}{% assign cat_color = "purple" %}
{% elsif first_cat == "android" %}{% assign cat_color = "green" %}
{% elsif first_cat == "kotlin" %}{% assign cat_color = "orange" %}
{% elsif first_cat == "rust" %}{% assign cat_color = "teal" %}
{% elsif first_cat == "c++" or first_cat == "cpp" %}{% assign cat_color = "pink" %}
{% elsif first_cat == "docker" %}{% assign cat_color = "yellow" %}
{% elsif first_cat == "java" %}{% assign cat_color = "red" %}
{% endif %}
{% endif %}
```

然后在 `index.html` 两个循环中分别替换为 `{% include category-color.liquid %}`。

**注意**：Liquid 的 `{% include %}` 继承父作用域的变量，所以 `post` 变量在每个循环中可用，`cat_color` 会被 include 内赋值后带回到父作用域。**这一步需要仔细验证** Liquid 的变量作用域行为。

**风险**：如果 Liquid include 内变量赋值不回传，可以用 `{%- capture cat_color -%}{% include category-color.liquid %}{%- endcapture -%}` 模式。

**建议优先级**：低（纯代码整洁，不影响功能）

---

### 4.2 Rouge CSS 外部化

**现状**：`_includes/rouge-github.css.html`（~3KB）通过 `{% include %}` 内联到每个 HTML 页面的 `<head>` 中，无法浏览器缓存。

**方案 A**：改为 `<link>` 引用外部 CSS 文件
- 将 `_includes/rouge-github.css.html` 移到 `assets/css/rouge-github.css`
- 在 `header.html` 中将 `<style>{% include rouge-github.css.html %}</style>` 改为 `<link rel="stylesheet" href="{{ site.url }}/assets/css/rouge-github.css">`

**方案 B**：保留现状
- 3KB 内联大小在可接受范围，且减少一个 HTTP 请求
- 对于 600+ 文章、绝大多数页面只被查看一次的场景，内联反而更快

**建议**：采用**方案 B**（保留现状），3KB 内联 CSS 的收益 > 外部化后的缓存收益。

---

### 4.3 Google Fonts FOUT 决策

**现状**：`header.html` L170 使用 `media="print" onload="this.media='all'"` 技术，字体下载完成后切换会触发 FOUT。

**选项**：

| 选项 | 效果 | 权衡 |
|------|------|------|
| 保持现状 | 不阻塞渲染，有轻微 FOUT | 用户可接受，页面更快可见 |
| 改为阻塞加载 `media="all"` | 无 FOUT，但阻塞渲染 | 约 50-100ms 额外延迟 |
| 移除 Google Fonts | 无 FOUT，完全自托管 | 字体可能不如原版美观 |

**建议**：**保持现状**。对于内容型博客，首屏内容更快显示比无 FOUT 更重要。

---

### 4.4 `jekyll-github-metadata` 插件决策

**现状**：`_config.yml` 中包含此插件，`pages/open-source.md` 使用 `site.github.public_repositories` 展示 GitHub 仓库列表。

**分析**：
- GitHub Pages 中此插件**自动激活**，无需额外配置
- 会触发 GitHub API 调用，增加构建时间（约 1-3 秒）
- 如果 `open-source.md` 页面访问量极低，可以考虑移除

**建议**：有 `menu` 配置但未在 `_config.yml` 的 `navs` 中注册，说明这个页面**不在导航栏中**。如果实际访问少，可考虑移除 `jekyll-github-metadata` 插件和 `open-source.md` 页面。否则保留现状。

---

## 阶段五：无需操作项

> 这些在审计报告中被标注，但经研判后决定不处理。

| 项目 | 原因 |
|------|------|
| `_includes/sidebar-tags.html` 标签链接到 `/categories/#tag` 无效 | 已与用户确认，之前尝试修复后被要求回退到原始状态，按用户意愿保留 |
| `_data/links.yml` 删除 | 🌟 **注意**：`pages/links.md` 使用了 `site.data.links`，所以此文件**不能删除** |
| `robots.txt` Disallow `/assets/` | 图片在 `/images/` 下不受影响，保留现状 |
| Primer 兼容层（§21, L1861-L1903）整块 | 保留供旧文章兼容，仅清理重复声明 |

---

## 执行检查清单

### 建议执行顺序

```
第 1 步 [BUG]  修复 fragments.md jQuery → 原生JS
第 2 步 [BUG]  补全 CSS 未定义变量
第 3 步 [清理] 删除 ads.txt
第 4 步 [清理] 删除 _data/social.yml, _data/skills.yml
第 5 步 [清理] 删除 _includes/sns-share.html
第 6 步 [CSS]  清理 CSS 死代码（确认无用的规则）
第 7 步 [CSS]  修正 CSS 章节编号
第 8 步 [改进] index.html Liquid 颜色映射去重（可选）
```

### 每步验证

每步修改后执行以下验证：

```bash
# 本地构建验证（如可用）
bundle exec jekyll build 2>&1 | tail -20

# 确认无 Jekyll 构建错误
grep -i "error\|warning" _site/ 2>/dev/null || echo "OK"

# 检查关键页面可访问
# 浏览器手动测试：
# - https://zhupite.com/fragments/?tag=xxx（步骤1）
# - https://zhupite.com/（首页无变化）
# - https://zhupite.com/categories/（分类页无变化）
# - 随机文章页（格式正常）
```

### 提交规范

每步独立提交，消息格式：

```
fix(code-audit): N. 操作说明

- 审计报告引用：#N
```

示例：

```
fix(code-audit): 1.1 fragments.md jQuery 重写为原生JS

- 替换 L44-L63 的 jQuery 标签过滤代码为原生 JS
- 解决 jQuery 移除后标签筛选失效的问题
```

---

## 附录：关键文件引用

| 文件 | 用途 |
|------|------|
| `_includes/footer.html` | 页脚（Busuanzi 统计、社交图标） |
| `_includes/header.html` | 头部模板（CSS 加载、搜索覆盖层、Google Fonts） |
| `_includes/sidebar-profile.html` | 侧栏个人资料卡片（社交链接硬编码） |
| `_includes/sns-share.html` | 分享组件（计划删除） |
| `_includes/category-color.liquid` | 新建——分类颜色映射（优化策略） |
| `assets/css/theme-modern.css` | 主样式表（2118 行） |
| `assets/js/main.js` | 主 JS（287 行） |
| `pages/fragments.md` | 片段页（需修复 jQuery） |
| `pages/open-source.md` | 开源项目页（依赖 jekyll-github-metadata） |
| `_config.yml` | 站点配置 |
| `_data/social.yml` | 社交数据文件（计划删除） |
| `_data/skills.yml` | 技能数据文件（计划删除） |
| `ads.txt` | AdSense 验证文件（计划删除） |
