---
layout: post
title: "Horizon：用 AI 构建你专属的新闻雷达，每天自动生成双语日报"
categories: [tool]
description: "Horizon 是一个开源免费的 AI 新闻雷达工具，GitHub 5.9K Stars。从 Hacker News、RSS、Reddit、Telegram、Twitter/X、GitHub 等多源抓取内容，用 AI 打分去重后生成中英双语日报，支持 GitHub Pages 站点、邮件订阅、飞书/Slack/Discord 推送等多种分发方式。本文介绍它的主要功能、使用方法和适用场景。"
tags:
  - Horizon
  - 新闻聚合
  - AI
  - 开源
  - 信息筛选
  - MCP
  - 飞书
---

如果你每天花不少时间刷各种信息流——Hacker News、Reddit、RSS、Telegram 群、GitHub Trending——大概率遇到过这种情况：同一个新闻在几个平台都看到，有些内容质量参差，有些值得深读的又可能错过。

[**Horizon**](https://github.com/Thysrael/Horizon) 就是为了解决这个问题而生的。它是一个开源的 AI 新闻雷达，GitHub 上 5.9K Stars，2026 年 2 月才开始的项目，到 6 月已经积累了近千个 Fork，增长很快。

简单说：它帮你把多个信息源的内容抓到一起，用 AI 打分发精选，每天自动生成一份日报，推送到你想要的地方。

---

## 一、它能做什么

Horizon 的核心工作流是这样的：

```
多个信息源 → 并发抓取 → 跨源去重 → AI 打分过滤 → 补充背景 → 
生成日报 → 分发到站点/邮件/IM
```

具体来说：

**信息源覆盖**——Hacker News、RSS/Atom、Reddit（子版块+用户帖）、Telegram 公开频道、Twitter/X（指定用户）、GitHub（用户动态+Release）、OpenBB（金融新闻）。

**AI 参与筛选**——每条内容由 AI 打 0-10 分，只有超过你设定阈值的才会进入日报。支持 Claude、GPT、Gemini、DeepSeek、豆包、MiniMax，以及任何 OpenAI 兼容的 API（也包括 Ollama 本地模型）。

**跨源去重**——同一个新闻在 Hacker News 和 Reddit 上都出现了？Horizon 自动合并，不会在你的日报里出现两次。

**背景补充**——对新闻报道中提到的不熟悉的概念、公司、项目，AI 会自动搜索补充背景解释。比如一篇关于"TPU v6"的新闻，日报里会自动带上 TPU 是什么、v6 相比前代有什么变化。

**社区评论摘要**——Hacker News 和 Reddit 的评论区的讨论也会被收集和提炼，让你不只是看到新闻标题，还能了解社区的看法。

**双语输出**——同一组信息源，同时生成英文和中文两个版本的日报。

---

## 二、怎么用

### 安装

有两种方式：

```bash
# 方式一：本地安装（推荐 uv）
git clone https://github.com/Thysrael/Horizon.git
cd Horizon
uv sync

# 方式二：Docker
docker compose run --rm horizon
```

### 配置

**推荐方式：交互式向导**

```bash
uv run horizon-wizard
```

它问你的兴趣领域（比如"LLM inference"、"嵌入式"、"web security"），然后自动生成配置文件。这是上手最快的方式。

**手动配置**：复制 `.env.example` 填 API Key，复制 `data/config.example.json` 定制信息源和偏好。

一个最小配置示例：

```json
{
  "ai": {
    "provider": "openai",
    "model": "gpt-4",
    "api_key_env": "OPENAI_API_KEY"
  },
  "sources": {
    "rss": [
      { "name": "Simon Willison", "url": "https://simonwillison.net/atom/everything/" }
    ]
  },
  "filtering": {
    "ai_score_threshold": 6.0
  }
}
```

### 运行

```bash
uv run horizon               # 最近 24 小时
uv run horizon --hours 48    # 最近 48 小时
```

日报生成后保存在 `data/summaries/` 目录。

### 自动化

项目提供了现成的 [GitHub Actions 工作流](https://github.com/Thysrael/Horizon/blob/main/.github/workflows/daily-summary.yml)，配置好后每天自动运行，生成日报并部署到 GitHub Pages。

---

## 三、日报去哪了

Horizon 支持多种输出方式，你可以选一个或多个：

| 方式 | 说明 |
|------|------|
| **GitHub Pages 站点** | 生成的日报 Markdown 自动发布为静态站点，每天更新 |
| **邮件订阅** | 自托管 SMTP/IMAP 邮件列表，自动处理订阅和退订 |
| **Webhook 推送** | 支持飞书、钉钉、Slack、Discord 或任意自定义 Webhook |
| **MCP 服务** | 以 MCP Server 方式对外暴露，AI 助手可以直接调用 |

推送消息支持模板化定制，不是纯文本复制，可以按你的需求调整格式。

---

## 四、一些亮点

### 评分阈值可以调

AI 打出来的分数不一定都准。Horizon 允许你设定阈值（默认 6.0），只有超过这个分数的内容才会进入日报。你可以根据你的口味调高或调低——想让日报精简就设高一些，想多覆盖一些就设低一些。

### 分类平衡

如果你同时关注 AI 和金融，但 AI 新闻每天有 50 条而金融只有 3 条——Horizon 支持按分类设定上限，防止某一类话题完全占据你的日报。比如 AI 类最多 5 条，金融类最多 5 条，其他类最多 3 条。

### 配置中的变量注入

配置文件中任何字符串都可以用 `${VAR_NAME}` 引用环境变量。这个细节在实践中有用——比如私有的 RSS 订阅地址、Webhook 地址、自定义 Header，都不需要硬编码在配置文件里。

### 社区信息源共享

项目官网 [horizon1123.top](https://horizon1123.top) 有一个社区信息源市场，大家可以分享自己发现的好信息源。如果你发现了一个值得关注的 RSS 或 Telegram 频道，也可以在官网提交，让更多人看到。

---

## 五、适用场景

| 场景 | 说明 |
|------|------|
| **技术博主/从业者** | 每天跟踪 Hacker News、GitHub Trending、技术 RSS，不想手动刷 |
| **投资/金融关注者** | 配合 OpenBB 源跟踪特定公司的新闻和财报动态 |
| **多语言需求** | 需要同时关注英文和中文技术社区的内容 |
| **团队信息同步** | 通过飞书/Slack/Discord Webhook 把日报推送到团队群 |
| **自建信息流** | 不想被平台算法推荐左右，自己定义信息源和筛选标准 |

---

## 六、需要注意的

- **需要 AI API Key**——核心的 AI 评分功能需要配置 LLM 的 API Key（OpenAI、Claude 或国产模型都行）。本地 Ollama 也可用，但评分质量取决于模型能力。
- **不是实时推送**——Horizon 的模式是定时运行（每天一次或几次），生成的是日报/摘要，而不是实时消息推送。如果你需要秒级通知，它不是这个定位。
- **自托管**——需要自己找地方跑（本地机器、服务器、GitHub Actions 都行），不是 SaaS 服务。
- **信息源质量决定上限**——AI 评分和去重做得再好，信息源本身的质量仍然是最终日报质量的基础。

---

**相关链接：**
- [GitHub 仓库](https://github.com/Thysrael/Horizon)
- [在线演示站点](https://thysrael.github.io/Horizon/)
- [配置指南](https://thysrael.github.io/Horizon/configuration)
- [社区信息源共享](https://horizon1123.top)
