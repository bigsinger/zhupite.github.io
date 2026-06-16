---
layout: post
title: "AutomatiQ：你正常浏览网站，AI 自动帮你写好爬虫脚本"
categories: [tool]
tags: [automatiq, ai-agent, scraper, rpa, open-source, web-automation]
description: "AutomatiQ 是一个开源的反向工程 AI Agent。你只需正常浏览一次网站，它就自动分析网络请求和操作行为，生成可独立运行的 Python 自动化/爬虫脚本。支持本地 LLM，pip install 即用。"
---

写爬虫或者网页自动化脚本，最耗时的环节通常不是写代码本身，而是**搞清楚目标网站的请求流程**——页面加载了什么接口、参数怎么构造、Cookie 如何携带、哪个请求返回了你要的数据。

**AutomatiQ** 试图用一种全新的方式解决这个问题：你正常浏览网站，它看着你操作，然后自动帮你写脚本。

> 项目地址：[github.com/StoneSteel27/AutomatiQ](https://github.com/StoneSteel27/AutomatiQ) | MIT 协议 | Python 3.11+

## 一句话概括

> AutomatiQ watches you browse, then an AI agent reverse-engineers your session into a standalone Python automation/extraction script.

——你浏览，AI 反向工程，产出可直接运行的 Python 脚本。

## 三步工作流

整个过程分三个阶段：

```
你浏览网站 → AI 分析操作 → 自动产出脚本
  ① Record     ② Compile      ③ Agent
```

### ① Recording — 录制浏览过程

AutomatiQ 启动一个 Chrome 浏览器（通过 CDP 协议），你在其中正常操作网站——点击、输入、翻页。它会记录：

- 所有网络请求和响应体
- Cookie 变化
- 用户的交互操作（点击、输入、导航）
- 时间戳

操作完成后按 `Ctrl+C` 结束录制。

### ② Compilation — 视觉+请求分析

录制的内容被切分成**逐操作的视频片段**。AI 视觉模型（默认 Gemini Flash）观看每个片段，分析：

- 你点击了什么元素
- 页面上发生了什么变化
- 操作是否成功

同时，网络请求被解码、去重、结构化，形成一个完整的"工作区 Dump"——包含了所有你需要知道但通常需要手动分析的信息。

### ③ Agent — 自动写脚本

一个 LLM 驱动的"调查员"Agent 读取工作区 Dump，在隔离的 Python/IPython 沙箱中迭代实验，最终生成一个**可独立运行的 Python 脚本**。

这个 Agent 不是一次性生成就完事——它会在沙箱中测试假设、验证结果、发现错误并修复，直到脚本能正确运行。

## 安装与使用

### 安装

```bash
pip install automatiq
```

### 配置 API Key

默认使用 Google Gemini 3 Flash，也支持任意 LiteLLM 兼容的提供商：

```bash
export GEMINI_API_KEY=your_key_here

# 或使用 OpenAI
export OPENAI_API_KEY=your_key_here
```

### 一行命令启动

```bash
automatiq run https://example.com
```

浏览器自动打开，你正常浏览网站，完成后按 `Ctrl+C`，Agent 开始工作。

### 分步模式

如果需要录制多个会话或稍后再跑 Agent，可以分步执行：

```bash
automatiq record https://example.com   # 先录制
automatiq agent                        # 再跑 Agent 生成脚本
automatiq agent --target path/to/sess  # 对指定会话运行
```

## 支持本地模型

AutomatiQ 底层使用 LiteLLM，可以切换为本地模型（Ollama、LM Studio、vLLM）：

```bash
automatiq run https://example.com \
  --model openai/llama3.3 \
  --recorder-model openai/llava \
  --base-url http://localhost:11434/v1
```

这意味着**所有分析都在本地完成**，不需要将浏览数据发送到第三方 API。

## 配置参数

通过 `~/.automatiq/config.toml` 可以持久化配置：

```toml
[models]
agent    = "gemini/gemini-3-flash-preview"
recorder = "gemini/gemini-3.1-flash-lite-preview"

[agent]
max_steps       = 60
sandbox_timeout = 60

[recording]
fps                   = 3
segment_pad           = 2
merge_gap_threshold   = 1.5
max_frames_per_prompt = 8
```

优先级：**CLI 参数 > 配置文件 > 默认值**。

## 技术方案拆解

AutomatiQ 的技术栈值得拆开看一下：

| 组件 | 作用 |
|------|------|
| **Chrome CDP** | 录制浏览器网络请求和用户交互 |
| **视觉 LLM** | 逐帧分析用户操作意图和页面变化 |
| **LiteLLM** | 统一的模型接入层，支持 100+ 提供商 |
| **IPython 沙箱** | 隔离执行实验代码，防止无限循环 |
| **会话管理** | 将录制→分析→生成的工作流串联 |

它的核心思路不是"猜"接口——而是**利用 Chrome 开发者工具级别的网络记录，加上视觉 AI 对用户操作意图的理解**，两者结合来推导出完整的自动化流程。

## 作者说明

AutomatiQ 目前处于 **Alpha 阶段**。作者在 HN 上提到：

- 理论上 **60%-90%** 的网站可以用纯 requests 方式自动化
- 已在 **BookMyShow**、**MakeMyTrip** 等网站上验证
- 在 Reddit r/webscraping 上为两个爬虫需求一次性生成了可用方案
- 不是完全自主的 Agent——你可以随时暂停、对话、引导 Agent 的反向工程过程

## 和传统方案的区别

| 维度 | 传统爬虫 | 传统 RPA（Selenium/Playwright） | **AutomatiQ** |
|:----|:---------|:-------------------------------|:-------------|
| 需要理解网站结构 | ✅ 是 | ✅ 是 | ❌ **不需要** |
| 需要写代码 | ✅ 是 | ✅ 是 | ❌ **AI 写** |
| 浏览器依赖 | ❌ 不一定 | ✅ 需要真实浏览器 | ❌ **requests 即可** |
| 上手时间 | 小时~天 | 小时~天 | **分钟级** |
| 输出产物 | 自定义脚本 | 浏览器自动化脚本 | **requests 脚本** |

AutomatiQ 的差异化在于：**不需要你成为网站专家**。你只需要做你最擅长的事——浏览网页——剩下的交给 AI 去反向工程。

## 小结

AutomatiQ 解决的是自动化/爬虫开发中最"脏"的那部分工作：理解目标网站的请求流程。通过"录制 → 分析 → 生成"的三步流程，把专业开发者的逆向工作变成了**自然浏览 + AI 分析**。

对于经常和网页数据打交道但不想每次都被反爬、参数构造折磨的开发者来说，这算是一个值得关注的工具。

---

**参考资料**

1. [GitHub: StoneSteel27/AutomatiQ](https://github.com/StoneSteel27/AutomatiQ)
2. [HN: Show HN: AutomatiQ](https://news.ycombinator.com/item?id=48554751)
3. [YouTube Demo: BookMyShow 爬取演示](https://www.youtube.com/watch?v=OfMvAQP5pkM)
4. [LiteLLM 提供商文档](https://docs.litellm.ai/docs/providers)
5. [PyPI: automatiq](https://pypi.org/project/automatiq/)
