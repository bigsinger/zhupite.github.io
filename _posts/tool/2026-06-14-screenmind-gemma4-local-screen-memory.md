---
layout: post
title: "ScreenMind：4GB GPU 上运行的本地 AI 屏幕记忆，隐私优先的 Recall 替代方案"
categories: [tool]
description: "ScreenMind 是一个开源 AI 屏幕记忆工具，在仅 4GB 显存的 GPU 上本地运行 Gemma 4 视觉模型分析每帧截图。支持智能截图、混合搜索、语音备忘录、会议转录，100% 本地运行。MIT 协议。"
tags:
  - ScreenMind
  - Gemma 4
  - 视觉AI
  - 本地AI
  - 隐私保护
  - 效率工具
  - 开源
---

如果你关注过 Microsoft Recall 引发的隐私争议——截图明文存储、无需用户同意、云端分析——就知道「屏幕记忆」这个概念本身很好，但实现方式决定了它是否安全。

[**ScreenMind**](https://github.com/ayushh0110/ScreenMind) 是一个全新的开源项目，思路很简单：用 Gemma 4 视觉模型在本地分析所有屏幕截图，一切数据不出你的电脑。**而它的硬件要求低到惊人——只需要一块 4GB 显存的 GPU。**

---

## 一、解决的问题

日常使用电脑时，大量有价值的信息一闪而过：
- 聊天里说的某个链接、地址、任务
- 开会时白板上画的流程图
- 某个网页上看到的重要数字

手动记录太麻烦，录屏又太大。ScreenMind 的做法是**智能截图 + AI 本地分析**：只在屏幕内容实际变化时截图，然后用 Gemma 4 理解画面内容并建立索引。之后你可以通过自然语言搜索、对话式回顾，甚至让它自动生成每日总结。

> 来源：项目 README，「Smart Capture — Content-change detection, not a fixed timer」

## 二、亮点：4GB GPU 跑视觉模型

这是项目最吸引人的地方。Gemma 4 E2B 是一个多模态模型（视觉 + 语音 + 推理），通常认为需要 12GB+ 显存才能本地运行。ScreenMind 通过底层 **llama.cpp** 推理引擎将其压缩到 **4GB 显存**可用的水平。

README 中的最低要求明确写着：

> **Requirements:** Python 3.10+ · GPU recommended (4GB+ VRAM) · ~5GB disk for model

这意味着：
- 绝大多数带独立显卡的笔记本（NVIDIA GTX 1650 4GB 及以上）都能跑
- 不需要云计算、不需要 API Key、没有按 token 计费
- 首次下载模型约 5GB，之后完全离线

## 三、核心功能

### 智能截图与 AI 分析

| 功能 | 说明 |
|------|------|
| 智能捕获 | 内容变化检测触发截图，非固定间隔 |
| 视觉分析 | 识别应用名、活动类型、场景描述、空间布局 |
| 三种分析模式 | **精确**（~76s，深度思考+布局分析）、**均衡**（~40s）、**快速**（~12s，免思考模式） |
| 应用感知缓存 | 按应用类型差异化缓存——通讯类应用刷新频率高于 IDE |
| 重型应用自动暂停 | 检测到游戏、视频编辑器、3D 软件时自动暂停截图 |

### 搜索与交互

- **混合搜索**：语义向量（MiniLM 嵌入） + 全文搜索（FTS5），既支持模糊含义搜索也支持精确关键词
- **对话式回顾**：基于 RAG 的聊天，支持追问——问「Ishaa 在 Discord 上说了什么？」就能直接定位到当时的聊天内容
- **Day Rewind**：整日屏幕回放，支持 播放/暂停/拖拽/变速

### 语音与会议

- **语音备忘录**：`Ctrl+Shift+V` 按住说话，Gemma 4 原生音频编码器转录（无需 Whisper）
- **会议转录**：自动检测 Zoom/Teams/Meet，分段录音 + map-reduce 摘要生成

### 隐私机制

| 能力 | 实现方式 |
|------|---------|
| 100% 本地 | 模型下载后零网络请求，无遥测 |
| 敏感信息过滤 | 自动模糊信用卡、SSN、API Key、密码 |
| 存储加密 | AES 加密（Fernet + OS keyring） |
| PIN 锁定 | 仪表盘会话锁，可配置自动超时 |
| 隐身模式 | 一键暂停，不记录任何内容 |

## 四、快速上手

安装非常直接：

```bash
git clone https://github.com/ayushh0110/ScreenMind.git
cd ScreenMind
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
python main.py
```

第一次运行会自动下载 Gemma 4 E2B GGUF 模型（~5GB），启动 `llama-server`，然后在 **http://127.0.0.1:7777** 打开仪表盘。

> 来源：项目 README Quick Start

**系统全局快捷键：**
- `Ctrl+Shift+B` — 即时标记截图
- `Ctrl+Shift+P` — 暂停/恢复
- `Ctrl+Shift+V` — 按住录制语音备忘录

所有快捷键可在 Settings 面板中自定义。

## 五、生态集成

ScreenMind 不仅仅是监控工具，它还提供了完整的集成体系：

| 集成 | 说明 |
|------|------|
| Agent 平台 | 用 Markdown 或 Python 编写自动化脚本 |
| MCP 服务器 | 将屏幕历史暴露给 Claude Desktop、Cursor、VS Code |
| Obsidian | 自动同步每日摘要到 Obsidian 仓库 |
| Notion | 推送摘要到 Notion 数据库 |
| Webhooks | 向 Slack、Discord、IFTTT 发送事件（HMAC 签名 + 自动重试） |
| 自动化书签 | 关键词触发（`git push`、`deploy` 等）自动标记重要时刻 |

MCP 服务器这个设计很有意思——你可以在 Cursor 里直接问「我当时在哪个文件里写了那个函数」，AI 编码助手就能通过 MCP 协议检索你的屏幕历史来回答。

## 六、对比：ScreenMind vs Microsoft Recall

| 维度 | ScreenMind | Microsoft Recall |
|------|-----------|-----------------|
| **运行方式** | 100% 本地，无网络请求 | 云端分析 + 遥测 |
| **数据存储** | AES 加密，OS keyring 保护 | 明文截图存储 |
| **隐私** | 敏感信息自动模糊，无遥测 | 曾因隐私问题被大量批评 |
| **硬件要求** | 4GB VRAM 即可运行 | 需要 Copilot+ PC（高通/NPU） |
| **模型** | Gemma 4 E2B（开源） | 专有云端模型 |
| **集成** | MCP、Obsidian、Notion、Webhooks | 仅限 Windows 生态 |
| **许可** | MIT 开源 | 闭源 |

## 七、适用场景与不足

### 适合谁用
- **隐私敏感的开发者**：想用屏幕记忆但不想数据上云
- **低配 GPU 用户**：4GB 显存在 2026 年已经是相当亲民的配置
- **多工具协作的重度用户**：频繁切换 IDE、聊天、浏览器，需要 AI 辅助回顾
- **会议记录需求**：自动转录 Zoom/Teams/Meet 并生成结构化摘要

### 需要注意的
- **首次设置需要 ~5GB 模型下载**：虽然不是每天都下的，但初次安装需要一定的网络和磁盘空间
- **快速模式 12s，精确模式 76s**：分析不是实时的，取决于你选择的模式和硬件
- **目前只有 Windows/macOS/Linux 支持**：尚未提供移动端或 Docker 化部署
- **活跃度待观察**：项目较新，社区和贡献者生态正在建设中

## 总结

ScreenMind 在「AI 本地运行」和「低硬件门槛」之间找到了一个难得的平衡点。4GB GPU 运行多模态视觉模型这件事本身就是一个有意义的实践验证——说明经过适当的推理引擎优化（llama.cpp + Gemma 4 E2B），边缘设备完全能承载 AI 屏幕记忆这样的复杂任务。

如果你对 Recall 的隐私问题感到不舒服，又希望有一个可靠的 AI 屏幕记忆工具，ScreenMind 是一个值得把玩的开源选择。

**项目地址：** [github.com/ayushh0110/ScreenMind](https://github.com/ayushh0110/ScreenMind)  
**许可协议：** MIT
