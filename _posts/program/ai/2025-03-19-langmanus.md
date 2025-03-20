---
layout:		post
category:	"program"
title:		"langmanus"

tags:		[ai]
---
- Content
{:toc}




# 简介



# 基础环境

- [uv](https://github.com/astral-sh/uv) 包管理器

- [Node.js](https://nodejs.org/) (v22.14.0+)

- [pnpm](https://pnpm.io/installation) ，在powershell里运行：`Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression`

  

# langmanus

## 安装

```bash
# 步骤 1：用uv创建并激活虚拟环境
uv python install 3.12
uv venv --python 3.12

# Windows 系统：
.venv\Scripts\activate

# Unix/macOS 系统：
source .venv/bin/activate

# 步骤 2：安装项目依赖
uv sync
```



```bash
# 克隆仓库
git clone https://github.com/langmanus/langmanus.git
cd langmanus

# 安装依赖
uv sync

# Playwright install to use Chromium for browser-use by default
uv run playwright install
```

## 配置

创建`.env`文件，可以复制示例文件：

```bash
cp .env.example .env
```

修改`.env`文件内容，主要是`API_KEY`的配置.

[DeepSeek 开放平台](https://platform.deepseek.com/api_keys)

```ini
REASONING_API_KEY=sk-***
REASONING_MODEL=deepseek-reasoner
# REASONING_BASE_URL=http://localhost:11434
# REASONING_MODEL=ollama_chat/deepseek-r1:7b
```



[Tavily AI](https://app.tavily.com/home)

```ini
TAVILY_API_KEY=tvly-dev-***
```



[阿里云百炼控制台](https://bailian.console.aliyun.com/) 右上角个人中心创建`API_KEY`，在[模型广场 - 阿里云百炼](https://bailian.console.aliyun.com/#/model-market) 挑选模型，使用帮助参考：[大模型服务平台百炼 阿里云帮助中心](https://help.aliyun.com/zh/model-studio/getting-started/what-is-model-studio)

```ini
# Non-reasoning LLM (for straightforward tasks)
BASIC_API_KEY=sk-***
BASIC_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
BASIC_MODEL=qwen-max-latest

# Vision-language LLM (for tasks requiring visual understanding)
VL_API_KEY=sk-***
VL_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
VL_MODEL=qwen2.5-vl-72b-instruct
```



## 运行

```bash
# 运行项目
uv run main.py
```

如果要开启API服务器，运行：

```bash
# 启动 API 服务器
make serve

# 或直接运行
uv run server.py
```

LangManus 提供一个默认的网页界面（[langmanus/langmanus-web](https://github.com/langmanus/langmanus-web) ），参考 后面章节。

# langmanus-web

## 安装

```bash
# Clone the repository
git clone https://github.com/langmanus/langmanus-web.git
cd langmanus-web

# Install dependencies
pnpm install
```



## 配置

创建`.env`文件，可以复制示例文件：

```bash
cp .env.example .env
```

修改`.env`文件内容，也可以使用默认配置：

```ini
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```



## 运行

```bash
# Run the project in development mode
pnpm dev
```

同时还要运行langmanus的API服务器：

```bash
# 启动 API 服务器
make serve

# 或直接运行
uv run server.py
```

然后在浏览器中访问：http://localhost:3000/



