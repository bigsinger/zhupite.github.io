---
layout: post
title: "Wechatsync / 文章同步助手：开源免费的多平台内容分发工具"
categories: [tool]
description: "Wechatsync（文章同步助手）是一个开源免费的 Chrome 扩展，支持一键将文章同步到微信公众号、知乎、掘金、CSDN、头条、小红书等 29+ 内容平台。GitHub 5.7K Stars，采用 TypeScript 开发，提供浏览器扩展、CLI 命令行、JS SDK 和 MCP 集成四层使用方式。本文从项目背景、技术架构、适配器机制、安装使用、集成方式等维度全面介绍这个工具。"
tags:
  - Wechatsync
  - 文章同步助手
  - 开源
  - Chrome扩展
  - 多平台发布
  - MCP
---

如果你同时维护多个内容平台——公众号、知乎、掘金、CSDN、头条——大概率经历过"写完文章后在每个平台分别登录、粘贴、排版、配图"的机械劳动。

[**Wechatsync（文章同步助手）**](https://github.com/wechatsync/Wechatsync) 就是为了解决这个问题而生的开源免费工具。GitHub 上 5.7K Stars、936 Forks，是中文互联网上覆盖最广的多平台同步方案之一。

---

## 一、项目背景

Wechatsync 的作者是开发者 [fun](https://fun0.netlify.app/about/)，项目最早源于 2016 年的一次需求——同事需要在 WordPress 和微信公众号之间同步文章，两边重复排版很痛苦。最初是一个基于搜狗搜索 + 打码平台的爬虫方案，后来随着平台变化逐渐失效，于是在 2019 年重写为 Chrome 扩展形态，2020 年 9 月在 GitHub 开源。

项目的核心理念是 **本地优先、隐私安全**：所有用户信息存储在浏览器本地，不依赖云端服务器。相比 OpenWrite 等云端方案，免去了 Cookie 和 Token 可能被盗用的风险；相比 artipub 等需要自行部署的方案，安装和使用门槛更低。

---

## 二、技术架构概览

Wechatsync 采用 TypeScript 开发，项目结构主要分为三层：

```
┌─────────────────────────────────────────────┐
│  chrome-extension/                          │  展示层
│  - popup 界面                               │
│  - Markdown 编辑器                          │
│  - 同步任务面板                             │
├─────────────────────────────────────────────┤
│  packages/@wechatsync/drivers/              │  适配层
│  - 各平台适配器（zhihu.js, juejin.js 等）   │
│  - BaseAdapter 抽象类                       │
├─────────────────────────────────────────────┤
│  packages/cli/                              │  CLI 层
│  - wechatsync sync article.md -p zhihu     │
├─────────────────────────────────────────────┤
│  article-syncjs / integrations/             │  集成层
│  - JS SDK + PHP/MCP 集成                    │
└─────────────────────────────────────────────┘
```

### 适配器架构

这是项目最核心的设计。每个目标平台对应一个独立的适配器（Adapter），继承自 `BaseAdapter`：

```typescript
class BaseAdapter {
  async getMetaData()    // 获取用户信息和登录状态
  async preEditPost()    // 预处理平台不兼容的文本
  async addPost()        // 创建文章（草稿）
  async uploadFile()     // 上传图片
  async editPost()       // 更新文章（替换图片地址）
}
```

适配器在 JS VM 沙箱中运行，提供了 `$`（jQuery）、`axios`、`turndown`、`CryptoJS` 等常用库，以及 `setCache`/`getCache` 缓存接口。开发者不需要了解扩展的内部逻辑，只需要模拟目标平台的 API 调用即可。

项目还提供了[在线开发工具](https://developer.wechatsync.com/)，支持在浏览器中直接编写、部署、测试适配器，实时查看日志输出——降低了贡献门槛。

---

## 三、支持的平台

截至 2026 年，Wechatsync 官方标注支持 29+ 平台，覆盖了中文互联网主流的自媒体和内容社区：

| 类别 | 平台 |
|------|------|
| **主流自媒体** | 微信公众号、知乎、微博、头条号、百家号、搜狐号、大鱼号、一点资讯 |
| **技术社区** | CSDN、掘金、SegmentFault（思否）、博客园、51CTO、慕课网手记、开源中国 |
| **开放平台** | WordPress、Typecho |
| **其他** | Bilibili、豆瓣、简书 |

支持类型包括 **HTML** 和 **Markdown** 两种格式，不同的平台根据其编辑器特性选择对应的格式。

---

## 四、安装与使用

### 安装方式

**Chrome Web Store（推荐）：**
[Chrome 商店传送门](https://chrome.google.com/webstore/detail/hchobocdmclopcbnibdnoafilagadion)

**开发者模式手动安装：**
1. [下载 ZIP 包](http://wpics.oss-cn-shanghai.aliyuncs.com/WechatSync.zip?date=0625) 并解压
2. 打开 `chrome://extensions`
3. 右上角开启"开发者模式"
4. 拖入解压后的文件夹

### 三种使用场景

**场景一：公众号文章同步到其他平台**

这是 Wechatsync 的核心场景。在公众号文章页点击扩展图标，插件会提取文章正文（基于 Safari 阅读模式算法），然后在弹出的同步面板中选择目标平台，一键同步。支持自动转换格式、上传图片到目标平台。

**场景二：在 Markdown 编辑器中写作并发布**

插件内置了 Markdown 编辑器，可以直接写 Markdown 并同步到支持 Markdown 格式的平台（CSDN、掘金、博客园、思否等），或转换为 HTML 同步到其他平台。

**场景三：从任何网页提取正文并同步**

对于非公众号的普通网页，Wechatsync 同样支持正文提取和同步，实现"任意网页 → 任意平台"的跨站同步。

---

## 五、CLI 模式与集成方案

Wechatsync 官网宣称支持 CLI 模式，可以将发布集成到脚本工作流中：

```bash
wechatsync sync article.md -p zhihu,juejin,csdn
```

对于需要进一步集成的场景，项目提供了多层集成方案：

### 1. JS SDK（article-syncjs）

如果你有自己的编辑器或内容管理系统，可以通过引入 [article-syncjs](https://github.com/wechatsync/article-syncjs) 拉起 Wechatsync 的同步对话框：

```javascript
window.syncPost({
  title: '文章标题',
  content: '<p>HTML 正文</p>'
})
```

### 2. XML-RPC 伪装协议

Wechatsync 内置的 WordPress 和 Typecho 适配器基于 XML-RPC 协议。如果你使用的是其他 PHP 后端（如 DedeCMS、ThinkPHP），可以通过伪装 WordPress XML-RPC 接口来获得 Wechatsync 支持。[PHP 范例参考](https://github.com/wechatsync/Wechatsync/tree/master/intergrations/php)

### 3. 开发者适配器工具

项目提供了在线开发环境 [developer.wechatsync.com](https://developer.wechatsync.com/)，支持：
- 编写和调试适配器代码
- 测试账号识别
- 测试图片上传
- 测试文章同步全流程

### 4. AI / MCP 集成

官网已展示 AI 写作工具的 MCP（Model Context Protocol）集成能力，意味着可以通过 AI 助手或 CLI 工具直接调用 Wechatsync 完成发布。

---

## 六、适配器开发：以头条为例

Wechatsync 的适配器开发流程相当直观。以下是一个简化的头条适配器示例：

```javascript
exports.driver = ToutiaoAdapter

class ToutiaoAdapter {
  async getMetaData() {
    var res = await $.ajax({
      url: 'https://mp.toutiao.com/mp/agw/media/get_media_info',
    })
    res = JSON.parse(res)
    return {
      uid: res.data.user.id,
      title: res.data.user.screen_name,
      supportTypes: ['html'],
      type: 'toutiao',
      displayName: '头条',
    }
  }

  async addPost(post) {
    // 创建草稿
    var res = await $.ajax({
      url: 'https://mp.toutiao.com/mp/agw/article/publish',
      type: 'POST',
      data: {
        title: post.post_title,
        content: post.post_content,
        save: 0,
      },
    })
    return { status: 'success', post_id: res.data.pgc_id }
  }
}
```

开发者在 developer.wechatsync.com 上编写完适配器后，按 `Ctrl+S` 即可部署到本地插件进行测试，调试日志在控制台实时输出。

---

## 七、不足与改进空间

作为开源项目，Wechatsync 也存在一些局限：

| 问题 | 说明 |
|------|------|
| **维护频率** | 最新 Release 为 2021 年的 1.0.10，部分平台的 API 可能已变更 |
| **平台覆盖面** | 虽然宣称 29+ 平台，但部分平台（如小红书、今日头条）的适配器稳定性依赖社区维护 |
| **CLI 成熟度** | CLI 模式已在官网展示，但 GitHub 仓库的 packages/cli 目录仍在演进中 |
| **会话管理** | 依赖浏览器本地 Cookie/Token，需要定期重新登录维持会话 |
| **Markdown 支持** | Markdown 编辑器功能较为基础，不支持实时预览和高级排版 |

---

## 八、总结与推荐场景

**Wechatsync 适合谁用：**
- 同时维护公众号 + 知乎 + 掘金 + CSDN 等多个平台的技术博主
- 希望在自有 CMS/编辑器中集成多平台发布能力的团队
- 对数据隐私敏感、不希望内容经过第三方云服务的内容创作者

**不适合的场景：**
- 需要企业级高频率自动化发布（建议走各平台官方 API）
- 对发布成功率要求极高的生产环境（建议配合人工确认流程）
- 需要英文平台分发（可搭配 cross-post 等工具）

总的来说，Wechatsync 是中文互联网上目前最成熟的开源多平台同步方案。它的适配器架构设计合理，集成方式灵活——从浏览器扩展到 CLI，从 JS SDK 到 MCP——可以应对从个人博主到团队内容分发的多种需求。在商业工具（OpenWrite）和全自建方案之间，Wechatsync 提供了一个开源免费、隐私安全、可扩展的中间选择。

---

**相关资源：**
- [GitHub 仓库](https://github.com/wechatsync/Wechatsync)
- [官方网站](https://www.wechatsync.com/)
- [Chrome 商店](https://chrome.google.com/webstore/detail/hchobocdmclopcbnibdnoafilagadion)
- [API 文档](https://github.com/wechatsync/Wechatsync/blob/master/API.md)
- [适配器开发指南](https://github.com/wechatsync/Wechatsync/blob/master/docs/toturial.md)
- [在线适配器开发工具](https://developer.wechatsync.com/)
