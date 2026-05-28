# zhupite.com

我的个人博客：<https://zhupite.com>

基于 Jekyll + GitHub Pages 构建。

## 技术栈

- **框架**：Jekyll 静态站点生成器
- **部署**：GitHub Pages（自动构建）
- **评论**：Giscus（基于 GitHub Discussions）
- **搜索**：Simple Jekyll Search + 本地 JSON 索引
- **样式**：自建 theme-modern.css（原生 CSS，无框架依赖）
- **JavaScript**：原生 ES5（无 jQuery 依赖）
- **代码高亮**：Rouge + GitHub 风格本地样式

## 目录结构

| 路径 | 说明 |
|------|------|
| `_posts/` | 博客文章 |
| `_wiki/` | Wiki 页面（集合目录） |
| `_layouts/` | 布局模板 |
| `_includes/` | 组件片段 |
| `_data/` | 结构化数据（友链、技能等） |
| `_docs/` | 项目文档和改造记录 |
| `assets/css/` | 样式文件 |
| `assets/js/` | JavaScript 文件 |
| `pages/` | 独立页面（关于、友链、Wiki 索引等） |

## 本地开发

```bash
# 安装依赖
bundle install

# 启动本地服务器
bundle exec jekyll serve
```

> 注意：GitHub Pages 自动构建，本地非必需。如无本地 Ruby 环境，可直接推送 master 分支触发线上构建。
