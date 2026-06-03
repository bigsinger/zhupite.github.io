---
layout: post
title: GitHub Pages 博客 SEO 最佳实践 — 从诊断到落地的全流程
categories: [dev]
description: 基于 Hermes Agent 对 zhupite.com 的完整 SEO 优化实践，记录 AI 能自动完成的 8 项工作和仍需人工介入的 5 个环节，附详细操作步骤和代码。
keywords: GitHub Pages, SEO, Jekyll, 博客优化, 图片alt, JSON-LD, 结构化数据, Hermes Agent
---

## 前言

我的博客 [zhupite.com](https://zhupite.com) 基于 GitHub Pages + Jekyll 搭建，运营多年积累了 500+ 篇文章，但流量和搜索引擎收录一直不理想。最近我用 Hermes Agent 对全站做了一次系统性的 SEO 诊断和优化，收获很大。

这篇文章不是纯理论，而是**完整的落地复盘**——分为两大部分：**AI 自动完成的部分**和**需要人工处理的部分**。希望能帮助到同样在 GitHub Pages/Jekyll 上写博客的朋友。

> 本文所有操作均基于 Jekyll 静态博客 + GitHub Pages 环境，主题源自 [mzlogin/mzlogin.github.io](https://github.com/mzlogin/mzlogin.github.io)。

---

## 第一部分：Hermes Agent 自动完成的部分

以下 8 项工作是 AI 自动扫描、诊断并执行的，几乎不需要人工介入。

### 1. 全站 SEO 诊断

这是第一步，也是最关键的一步——不了解现状就无从优化。

Hermes 扫描了以下关键文件：

| 文件 | 检查内容 | 发现的问题 |
|------|---------|-----------|
| `_config.yml` | 插件、URL、作者信息 | 无 `baidu` 验证配置 |
| `_layouts/default.html` | 基础 HTML 结构 | 无异常 |
| `_layouts/post.html` | 文章页布局 | 无相关文章推荐 |
| `_includes/header.html` | SEO meta 标签集中地 | 大问题区 |
| `404.md` | 404 页面 | 残留旧域名跳转 |
| `robots.txt` | **不存在** | 需要新建 |
| `sitemap.xml` | 有 `jekyll-sitemap` 插件 | 自动生成，正常 |
| `_posts/` 下 521 篇文章 | 图片、description | 0 篇有 description，216 张图片缺 alt |

诊断结论：**全站有 description 的文章为 0，缺 alt 图片占比 48%**，缺乏结构化数据、Twitter Card、Open Graph 标签。

### 2. 核心 SEO 标签注入

在 `_includes/header.html` 中注入了一系列 SEO 关键标签，这是单次修改、全站生效的**杠杆操作**：

**Description 模板 fallback**

521 篇文章没有任何人工编写的 description，如果逐篇加就是灾难。解决方案是模板级 fallback：

{% raw %}
```html
<meta name="description" content="{% if page.excerpt %}{{ page.excerpt | strip_html | strip_newlines | truncate: 200 }}{% elsif page.description %}{{ page.description | truncate: 200 }}{% elsif content %}{{ content | strip_html | strip_newlines | truncate: 200 }}{% endif %}">
```
{% endraw %}

> **注意**：`truncatewords` 对中文无效（按空格分词），必须用 `truncate` 按字符截取。

**Twitter Card + Open Graph**

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@bigsinger">
<meta property="og:title" content="{{ page.title }}">
<meta property="og:description" content="...">
<meta property="og:url" content="{{ page.url | prepend: site.url }}">
<meta property="og:image" content="{% if page.og_image_url %}{{ page.og_image_url }}{% elsif page.photo_url %}{{ page.photo_url | prepend: site.url }}{% else %}{{ site.url }}/favicon.ico{% endif %}">
```

**Canonical URL**（防止内容重复被搜索引擎惩罚）

```html
<link rel="canonical" href="{{ page.url | prepend: site.url }}">
```

### 3. 结构化数据 JSON-LD

Google 强烈推荐的结构化数据。Hermes 创建了 `_includes/seo-structured-data.html`，包含四组 JSON-LD：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "首页", "item": "{{ site.url }}" },
    { "@type": "ListItem", "position": 2, "name": "{{ page.categories | first }}", "item": "{{ site.url }}/categories/" },
    { "@type": "ListItem", "position": 3, "name": "{{ page.title }}", "item": "{{ site.url }}{{ page.url }}" }
  ]
}
</script>
```

其他三组分别是 **Person**（作者信息）、**BlogPosting**（文章结构化）、**WebSite**（站点信息）。

> ⚠️ **踩坑记录**：BlogPosting 的 `keywords` 字段一开始写在了 JSON 对象**外面**，导致语法错误。在 `{}` 内的最后一个字段后面加逗号也是常见错误。务必用 [Google Rich Results Test](https://search.google.com/test/rich-results) 验证。

### 4. DNS 预解析与资源预连接

加速第三方资源加载，提升 Core Web Vitals：

```html
<link rel="dns-prefetch" href="//fastly.jsdelivr.net">
<link rel="preconnect" href="https://fastly.jsdelivr.net">
<link rel="dns-prefetch" href="//pagead2.googlesyndication.com">
<link rel="preconnect" href="https://pagead2.googlesyndication.com">
<link rel="dns-prefetch" href="//www.googletagmanager.com">
<link rel="preconnect" href="https://www.googletagmanager.com">
```

`dns-prefetch` 和 `preconnect` 的区别：`preconnect` 更激进——不仅解析 DNS，还预先建立 TCP 连接和 TLS 握手，适合关键资源域名。

### 5. 图片 alt 批量修复

这是此次优化中**工作量最大**的部分。全站 447 张图片中，221 张（48%）缺 alt。

**修复策略分三批：**

| 批次 | 图片类型 | 修复方式 | 数量 |
|------|---------|---------|------|
| 第一批 | 本地图片 | 文件名映射为中文（`guizi1.jpg` → `衣柜效果图`） | 111 |
| 第三批 | 外部图片 | URL 特征 + 文章标题 + 上下文推断 | 98 |

**本地图片文件名 → 中文描述的映射表**示例：

```python
FILENAME_ALT = {
    "guizi1": "衣柜效果图",
    "tynkzq": "太阳能控制器",
    "sandboxAppDown": "沙箱APP下载界面",
    "tvPlayMenu1": "电视播放菜单",
    # ... 更多映射
}
```

**外部图片按 URL 特征分类**：

```python
def url_to_alt(url, title):
    if "p3-juejin.byteimg.com" in url:
        return f"{title} - 封面"  # Python 掘金系列封面
    if "zhimg.com" in url:
        return "自然通风-风压原理示意图"  # 知乎图片
    if "csdn" in url:
        return f"{title} - 操作截图"
    # ...
```

对于 Python 掘金系列的 **49 张重复封面图**，统一使用 `alt="Python教程 - 封面"`，保持一致性。

### 6. 相关文章推荐（内链优化）

内链是 SEO 的重要环节。在 `_layouts/post.html` 的文章末尾添加了同分类的相关文章推荐：

{% raw %}
```html
{% if page.categories %}
{% assign category = page.categories | first %}
{% assign related = site.categories[category] | where_exp:"item","item.url != page.url" | sort: 'date' | reverse | limit: 5 %}
{% if related.size > 0 %}
<div class="related-posts">
  <h3>📖 相关文章</h3>
  <ul>
  {% for post in related %}
    <li><a href="{{ site.url }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
  </ul>
</div>
{% endif %}
{% endif %}
```
{% endraw %}

显示效果：文章底部自动出现同分类的 5 篇最新相关文章，增加页面停留时间和爬虫抓取深度。

### 7. 图片懒加载

在 `assets/js/main.js` 中为所有文章图片添加原生懒加载：

```javascript
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.article-content img[src]').forEach(function(img) {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });
});
```

使用浏览器原生 `loading="lazy"` 属性，无需额外 JS 库，对 Core Web Vitals 的 Largest Contentful Paint (LCP) 有显著改善。

### 8. 其他自动化修复

- **`robots.txt`**：新建，包含 Sitemap 指向、爬取延迟设置、Disallow /404.html
- **`article:tag`**：根据 `page.categories` 自动输出 `<meta property="article:tag">`
- **域名残留清理**：将 `_config.yml` 和多个模板文件中的 `mazhuang.org` 替换为 `zhupite.com`
- **404 页面优化**：清除过期域名跳转，重新导向博客首页和分类页

---

## 第二部分：需要人工处理的环节

AI 做了 80% 的工作，但以下 5 个环节必须有人的判断和操作。

### 2.1 百度站长验证

AI 可以在模板中注入百度验证的 meta 标签，但**验证码本身必须从百度站长平台获取**。

操作步骤：

1. 打开 [百度资源搜索平台](https://ziyuan.baidu.com)
2. 添加站点 `https://zhupite.com`
3. 选择「文件验证」或「HTML 标签验证」
4. 获取验证码（例如 `code-xxxxxxxx`）
5. 填入 `_config.yml`：

```yaml
baidu:
    verification: code-xxxxxxxx   # 替换为你的真实验证码
```

然后提交 Sitemap：`https://zhupite.com/sitemap.xml`

### 2.2 Google Search Console 配置

同样，AI 能帮你植入 Google 验证 meta 标签，但你需要自己：

1. 打开 [Google Search Console](https://search.google.com/search-console)
2. 添加资源（域名类型或 URL 前缀）
3. 获取验证令牌
4. 配置方式已在 `_includes/header.html` 中准备好：
```html
<meta name="google-site-verification" content="你的验证码">
```

后续关键操作：
- **提交 Sitemap** → 监控收录进度
- **检查核心网页指标** → 看 LCP/FID/CLS
- **查看搜索外观** → 看 Rich Results 是否正常显示

### 2.3 文章 description 人工优化

虽然模板 fallback 已经保证了 100% 的文章都有 description（自动截取正文前 200 字符），但**自动截取的内容不一定完美**——可能从列表或代码块中间截断。

建议用爬虫或脚本找出截断效果不佳的文章，逐篇人工写 description。在 frontmatter 中加上：

```yaml
---
description: "这篇文章详细讲解了...涵盖...适合..."
---
```

**高优先级文章**：流量 Top 20 的文章、首页置顶文章、系列教程入口文章。

### 2.4 图片 alt 的精细化校验

自动生成的 alt 虽然有语义，但不如人写的精准。建议重点关注：

- **系列教程截图**：自动生成的 alt 可能不准确（如 `CSDN博客截图` 过于泛化）
- **装修系列**：`衣柜效果图` 这种目录结构图，如果能写成 `木工打衣柜的成品效果-展示衣柜内部隔板和挂衣区` 会更好
- **算法动图**：`归并排序动图演示` → `归并排序递归分割与合并过程演示` 更详细

一个实用的扫描脚本：

```python
import os, re

for root, dirs, files in os.walk("_posts"):
    for f in files:
        if not f.endswith(".md"): continue
        content = open(os.path.join(root, f), encoding="utf-8").read()
        for m in re.finditer(r'!\[([^\]]*)\]\(([^)]+)\)', content):
            alt = m.group(1).strip()
            if len(alt) < 5:  # 过短的 alt 可能质量不佳
                print(f"{f}: {alt}")
```

### 2.5 持续监控与迭代

SEO 不是一次性工作。建议设置定时任务（可用 Hermes Agent 的 cron 功能）：

| 频率 | 任务 | 工具 |
|------|------|------|
| **每周** | 检查 Google Search Console 新问题 | 手动 |
| **每月** | 运行一次全站 SEO 扫描 | Hermes + 脚本 |
| **每月** | 检查 sitemap 是否覆盖最新文章 | 自动 |
| **每季度** | 检查 Core Web Vitals 变化 | PageSpeed Insights |
| **有新文章时** | 提交到 Google Search Console 请求索引 | 手动或 API |

---

## 总结

GitHub Pages 博客的 SEO 优化是一个投入产出比很高的事情。从我们的实践来看：

**AI 能高效完成的**：
- 全站扫描诊断（找到所有问题点）
- 模板级标签注入（一次修改，全站生效）
- 结构化数据（JSON-LD）
- 资源加载优化（DNS Prefetch、懒加载）
- 批量数据修复（图片 alt、description 模板）
- 内链优化（相关文章）

**需要人来做**：
- 平台验证（百度、Google Search Console 注册）
- 核心文章的精调（description、alt 润色）
- 持续监控（定期查看 Search Console）

如果你也在运营 GitHub Pages 博客，建议先做一次完整的诊断，找出"杠杆点"——那些改动一行代码就能影响全站的项目。模板层的 SEO 标签、JSON-LD 结构化数据、robots.txt 和 sitemap，就是这样的高杠杆点。

---

*注：本文的 SEO 优化工作由 Hermes Agent 辅助完成。所有改动代码已开源在 [zhupite.github.io](https://github.com/bigsinger/zhupite.github.io) 仓库。*
