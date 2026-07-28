---
layout: post
title: "ColorTxt：一款会给小说内容上色的本地阅读器"
categories: [tool]
description: "基于 ssnangua/ColorTxt 官方 README、开发文档、CHANGELOG、LICENSE、GitHub 页面和 Release 整理，介绍这款 Electron + Vue 阅读器的核心功能、AI 阅读助手、书源找书、语音朗读和适用场景。"
tags:
  - ColorTxt
  - 小说阅读器
  - Electron
  - AI 阅读
  - 开源软件
---

> 资料来源：本文基于 [ssnangua/ColorTxt](https://github.com/ssnangua/ColorTxt) 官方仓库、README、开发文档、更新日志和 Release 页面整理。项目支持 Windows、macOS、Linux，许可证为 MPL-2.0。

ColorTxt 的定位很明确：**它不是单纯的 TXT 阅读器，而是一款把“内容上色、AI 辅助、书源找书、语音朗读”揉在一起的本地小说阅读器**。如果你想要的是“打开文本、自动识别章节、做高亮、记笔记、还能顺手搜书和听书”，它的功能边界就很贴近这个需求。

一句话总结：**它试图把小说阅读从“看文本”升级成“读文本 + 处理文本 + 理解文本”**。

## 它解决什么问题

传统阅读器常见的问题有两个：

1. 只能看，不能处理；
2. 能处理，但功能碎、体验分散。

ColorTxt 的做法是把这些能力整合到一个桌面应用里：

| 能力 | 说明 |
|---|---|
| 本地阅读 | 支持 `.txt`、`.md`，也能打开常见电子书格式并转换为 `.md` 加载 |
| 章节识别 | 自动识别章节结构，支持自定义规则 |
| 个性上色 | 按高亮规则给内容着色，突出角色、关键词或段落 |
| 笔记与书签 | 划线、记笔记、书签、最近打开记录 |
| 语音朗读 | 支持多 TTS 引擎、旁白 / 对白多音色 |
| AI 阅读助手 | 支持对话、RAG、向量索引、角色卡、文生图、智能排版 |
| 书源找书 | 可多源搜索、在线阅读、整书下载 |
| 编辑模式 | 适合对文本内容直接修正、整理 |

它的特点不是“做了一两个亮点”，而是把小说阅读场景里的常见动作尽量都放进来了。

## 核心技术栈

从仓库信息看，ColorTxt 基于：

- **Electron + Vue + Monaco**
- `better-sqlite3`、`sqlite-vec`
- `opencc`
- `@huggingface/transformers`
- `@node-rs/jieba`

这套组合透露出一个信号：它不是轻壳阅读器，而是一个**带本地数据、分词、向量检索和 AI 能力的桌面应用**。

## 最值得看的几个功能

### 1. 个性内容上色

这是它最有辨识度的功能之一。README 直接把它放在最前面：通过自定义高亮规则给内容着色，目标不是装饰，而是帮助你在长篇小说里更快抓住角色、关键词和结构。

### 2. AI 阅读助手

`DOCS.md` 和 `docs/AI功能.md` 把 AI 能力拆得比较完整：

- 对话
- RAG
- 向量索引
- 角色卡
- 文生图
- 技能与 Agent
- 智能排版

这说明它不是只接一个聊天框，而是试图把 AI 放进阅读工作流里，例如：摘要角色、整理词云、处理排版、辅助理解内容。

### 3. 语音朗读

语音朗读文档列出了多种 TTS provider，包括 Edge、系统语音、通义、MiniMax、小米 MiMo。并且支持多套朗读方案、单音色和多音色组合。

如果你想把小说阅读从“盯屏幕”扩展成“听 + 看”，这一块是实用的。

### 4. 书源找书

`docs/书源找书.md` 说明它兼容 Legado 书源格式，并提供独立找书窗口。这个功能直接把“找书、搜索、在线阅读、整书下载”纳入应用内部，而不是让用户在多个网站之间来回跳。

## 快速上手

开发文档给出的标准命令很直接：

```bash
npm install
npm run dev
```

如果只想打开找书窗口：

```bash
npm run dev:find
```

构建打包：

```bash
npm run build
```

支持平台包括：Windows、macOS、Linux；打包产物默认输出到 `release` 目录。

## 适合谁，不适合谁

### 适合

- 常读本地 TXT / Markdown / 电子书的人；
- 想要章节识别、高亮、笔记、书签一体化体验的人；
- 想在阅读器里直接接入 AI 助手、语音朗读、找书能力的人；
- 喜欢本地桌面应用、而不是纯网页阅读器的人。

### 不适合

- 只想要一个极简、低依赖、几乎零配置的阅读器的人；
- 不接受 Electron 体积和桌面应用复杂度的人；
- 只需要单一功能，比如纯听书、纯 EPUB 阅读的人。

## 版本与项目状态

截至本文抓取时：

| 项目 | 信息 |
|---|---|
| 最新 Release | `v3.1.10` |
| 仓库版本 | `3.1.10` |
| 星标数 | 约 `634`（通过 shields.io 抓取，动态数据） |
| 许可证 | MPL-2.0 |
| 支持平台 | Windows / macOS / Linux |
| 技术栈 | Electron + Vue + Monaco |

CHANGELOG 里 `3.1` 版本新增了番茄时钟、全屏时间显示、书架分类、AI 排版等能力，说明项目仍在持续迭代。

## 结论

ColorTxt 不是“换个皮的阅读器”，而是一个把**阅读、处理、朗读、找书、AI 辅助**拼成完整工作流的桌面工具。

如果你只想打开文本看看，它可能偏重；但如果你希望阅读器不只是阅读，而是能帮你：

- 处理小说格式；
- 标出重点内容；
- 朗读；
- 搜索书源；
- 结合 AI 做整理和理解；

那 ColorTxt 的方向就很清楚。

## 参考资料

- 官方仓库：<https://github.com/ssnangua/ColorTxt>
- README：<https://raw.githubusercontent.com/ssnangua/ColorTxt/main/README.md>
- 开发文档：<https://raw.githubusercontent.com/ssnangua/ColorTxt/main/DOCS.md>
- 开发构建：<https://raw.githubusercontent.com/ssnangua/ColorTxt/main/docs/%E5%BC%80%E5%8F%91%E6%9E%84%E5%BB%BA.md>
- 基础功能：<https://raw.githubusercontent.com/ssnangua/ColorTxt/main/docs/%E5%9F%BA%E7%A1%80%E5%8A%9F%E8%83%BD.md>
- AI 功能：<https://raw.githubusercontent.com/ssnangua/ColorTxt/main/docs/AI%E5%8A%9F%E8%83%BD.md>
- 语音朗读：<https://raw.githubusercontent.com/ssnangua/ColorTxt/main/docs/%E8%AF%AD%E9%9F%B3%E6%9C%97%E8%AF%BB.md>
- 书源找书：<https://raw.githubusercontent.com/ssnangua/ColorTxt/main/docs/%E4%B9%A6%E6%BA%90%E6%89%BE%E4%B9%A6.md>
- LICENSE：<https://raw.githubusercontent.com/ssnangua/ColorTxt/main/LICENSE>
