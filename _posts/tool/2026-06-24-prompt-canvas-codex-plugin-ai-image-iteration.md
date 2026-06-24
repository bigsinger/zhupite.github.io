---
layout: post
title: "Prompt Canvas：把 AI 画图的版本管理搬到无限画布上"
categories: [tool]
description: "Prompt Canvas 是一个 Codex 插件，基于 tldraw 无限画布管理 AI 图片迭代，支持截图驱动和批注驱动两种修改方式，所有数据存本地。"
tags:
  - Codex 插件
  - AI 生图
  - 画布工具
  - 版本管理
  - 开源
---

用 AI 图片生成工具的人都会遇到一个场景：一张图从 v1 改到 v5，改位置、换颜色、调细节，回头翻聊天记录已经完全不知道哪个版本是哪条消息生成的了。Prompt Canvas 把这个问题搬到一个无限画布上解决。

这是一个 [Codex](https://github.com/openclaw/openclaw) 插件，作者是林月半子（[lqshow](https://github.com/lqshow)），灵感来自钟二信的 [Cowart](https://github.com/zhongerxin/cowart)，但做了不同的产品定位。项目已开源（没有说明许可证），代码托管在 [GitHub](https://github.com/lqshow/prompt-canvas)。

## 解决了什么

AI 图片生成的工作流本质上是迭代的——不是一次性输出就能满意。但在对话界面里，迭代缺乏空间感：

- v1 和 v5 之间隔了十几轮对话，翻回去很麻烦
- 一张图片上的多个修改点（换颜色、改位置、加元素）只能用文字描述，沟通效率低
- 不同版本之间缺少可视化对比

Prompt Canvas 把迭代过程放在一个 **tldraw** 无限画布上：每张图有版本号，v1、v2、v3 并排展示，图片上的批注（箭头、圈、文字）直接表达了修改意图。

## 核心工作流

### 两种修改方式

**截图驱动**（最快）：点截图按钮把当前画布发给 Codex，用自然语言说「把蓝色毛衣换红色」，Codex 看图就能理解意图。

**批注驱动**（最精确）：进入批注模式，在图片上画箭头、圈和文字标注，然后点「提交给 Codex」。系统会把批注转换成结构化指令，存到本地文件，Codex 通过 MCP 工具读取并执行。

后者是 Prompt Canvas 的核心设计。批注不是简单的截图识别，而是被解析成带空间位置的结构化数据：

```
目标版本：v1
视觉批注 (2)：
1. [箭头] 位于 上方: "再加几片牛肉"
2. [画笔圈] 覆盖约 5.2% 区域，位于 中部: "汤色再浓一点"
```

Codex 拿到这份说明书后，调用生图 Skill 生成新版本，再把新图回填到画布上。旧图保留、新图放在右侧，完整保留迭代轨迹。

### 本地文件驱动的协作设计

批注提交后，文件存到项目目录 `canvas/pages/<canvas>/_pending/`：

```
_pending/
├── _done/           ← 已处理归档
│   ├── submit-20260622T071330.json
│   └── submit-20260622T071330.md
├── submit-20260622T075222.json   ← 待处理
└── submit-20260622T075222.md     ← 待处理
```

.md 文件是给 Codex 读的指令说明书，.json 是结构化数据。Codex 通过 MCP 工具 `prompt_canvas_get_pending_submits` 轮询这个文件夹，拿到任务后生成新图并标记为已处理。这不依赖 Codex 实时在线，任何时候来取都可以处理。

## 架构

```
用户 (画布批注) → Flask 后端 (SQLite) → _pending/ 文件 → MCP 工具 → Codex + 生图 Skill → 回填画布
```

关键组件：

- **画布前端**：基于 tldraw 的 React 应用，内嵌 AI Image Holder 自定义 shape
- **Flask 后端**：REST API + SSE + SQLite 持久化
- **MCP Server**：把画布能力暴露给 Codex 调用
- **Codex Skills**：打开画布、生图、批注修图三个 skill

数据全部存在本地——SQLite 数据库 + 文件系统，没有联网后端。关掉 Codex 再打开，上次的迭代记录还在。

## 快速上手

### 作为 Codex 插件安装

```bash
# 1. 添加插件市场
codex plugin marketplace add lqshow/prompt-canvas

# 2. 安装生图 Skill 依赖（作者封装的 linyuebanzi-image-gen）
npx skills add lqshow/linyuebanzi-skills -g

# 3. 在 Codex 插件面板找到 Prompt Canvas，点击安装

# 4. 告诉 Codex "打开一个新的画布"，自动完成后续配置
```

### 不依赖插件模式

```bash
# 手动注册 MCP server
codex mcp add prompt-canvas -- python3 $(pwd)/mcp-server/prompt_canvas_mcp.py

# 安装前端依赖并构建
npm install
npm run build

# 启动画布服务
./scripts/start-canvas.sh /path/to/your/codex-project
```

### 配置

项目提供 `.env.example`，默认端口 `52846`。画布数据存储在 Codex 项目目录的 `canvas/` 下，包括画布快照（JSON）、图片资源（assets/）和待处理提交（_pending/）。

## 适用场景

- **用 Codex 频繁生成 AI 图片**，需要版本管理
- **需要精确控制修改区域**，批注比自然语言更省沟通成本
- **对数据隐私敏感**，所有数据本地存储
- **需要回溯迭代过程**，每一版的图片和批注记录都保留

## 局限

- 依赖 Codex 环境，不是独立工具
- 生图能力依赖外部 API（作者使用自己的 linyuebanzi-image-gen Skill，没有 GPT Image 订阅）
- 画布服务的启动和配置有一定门槛
- a> 目前属于个人项目阶段，文档以 README 为主

## 与 Cowart 的区别

Prompt Canvas 和灵感来源 Cowart 走了不同的路线：

| 维度 | Prompt Canvas | Cowart |
|------|-------------|--------|
| 定位 | 图片迭代管线 | 通用创意画布 |
| 生图方式 | 批注 → 结构化指令 → Codex 执行 | 截图直接让 Codex 看图生图 |
| 协作文档 | 本地 _pending/ 文件队列 | 实时截图对话 |
| 适用用户 | 生产管线型（多轮迭代） | 自由创意型（快速原型） |

两者不冲突，甚至可以在一次工作流里混合使用。

## 实现细节

项目结构：

```
.
├── .mcp.json              # MCP 服务器注册
├── server.py              # Flask 后端
├── imagegen.py            # Mock 生图（fallback）
├── canvas/                # tldraw 画布前端
├── mcp-server/            # MCP server
│   └── prompt_canvas_mcp.py
├── skills/prompt-canvas/  # Codex skills
└── scripts/               # 启动脚本
```

技术栈：前端 tldraw + React（Vite 构建），后端 Python Flask，MCP 层通过 Python 实现，所有持久化走 SQLite。生图走 Codex 调用的外部 Skill，本地 `imagegen.py` 仅作为 mock fallback。

**项目地址**：[https://github.com/lqshow/prompt-canvas](https://github.com/lqshow/prompt-canvas)
**参考文章**：[Prompt Canvas：把 AI 画图的版本管理搬到无限画布上](https://mp.weixin.qq.com/s/bnbeOWjlG2_znoG-2p9Zdw)（公众号「林月半子的AI笔记」）

> 本文基于项目 README 和原作者公众号文章编写，未实际安装运行。安装命令取自官方文档。
