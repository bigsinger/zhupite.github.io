---
layout: post
title: "Google Colab CLI：从终端远程调用 GPU/TPU，AI Agent 也能用"
categories: [ai]
description: "Google 正式发布 Colab CLI（Command-Line Interface），让你直接从终端、脚本甚至 AI Agent 中远程调用 Colab 的 CPU、GPU（T4/L4/G4/H100/A100）和 TPU（v5e/v6e）资源。支持会话管理、代码执行、文件操作、自动保活等完整功能链，一个命令完成「启动 VM → 执行脚本 → 回收资源」的全生命周期。面向 Agent 生态的设计使它成为 AI 开发者的基础设施级工具。"
keywords: Google Colab, Colab CLI, GPU, TPU, AI Agent, cloud computing, terminal, MCP, google-colab-cli
tags:
  - Google
  - Colab
  - CLI
  - GPU
  - TPU
  - AI Agent
  - Machine Learning
  - Cloud Computing
---

如果你平时用 Google Colab 跑模型训练或数据处理，应该习惯了打开浏览器 → 新建笔记本 → 连接运行时 → 运行代码 → 关闭标签页这一套流程。

但对于开发者——尤其是习惯终端工作流、或者想自动化运维 ML 任务的开发者来说，这个流程太"重"了。

**Colab CLI** 就是为此设计的：一个命令行工具，让你从终端直接调用 Colab 的云端算力，无需打开浏览器。

更值得关注的是，它还为 **AI Agent** 提供了基础设施层的对接能力。Agent 可以通过 CLI 直接调用 GPU 资源执行任务，不再受限于纯文本处理。

## Colab CLI 是什么

Colab CLI 是 Google 官方出品的命令行工具，包名为 `google-colab-cli`，GitHub 仓库托管于 [googlecolab/google-colab-cli](https://github.com/googlecolab/google-colab-cli)。

它的核心能力可以概括为一句话：**从终端远程调用 Colab 的 GPU 和 TPU 资源，无需打开浏览器**。

但它的价值不止于此。Colab CLI 提供了一个完整的远程执行框架，涵盖：

- **会话管理**：创建、查询、终止 VM 运行时
- **代码执行**：运行 Python 脚本、Jupyter Notebook、交互式 REPL 甚至 TTY 控制台
- **文件操作**：上传、下载、删除、远程编辑文件
- **自动化工件**：`colab run` 一个命令完成「启动 VM → 执行脚本 → 自动回收」
- **自动保活**：后台守护进程防止空闲 VM 被回收

这些能力使之成为一个可以嵌入开发工作流、CI/CD 流程、甚至 AI Agent 调用链中的基础设施工具。

## 核心特性详解

### 1. 即时 VM 预配

`colab new` 命令可在数秒内预配一个运行时，支持的加速器类型非常丰富：

| 类型 | 型号 |
|------|------|
| CPU | 标准 CPU 运行时 |
| GPU | T4、L4、G4、H100、A100 |
| TPU | v5e (1 芯片)、v6e (1 芯片) |

参数示例：

```bash
# 创建默认 CPU 会话
colab new

# 创建指定 GPU 会话
colab new -s trainer --gpu A100

# 创建 TPU 会话
colab new -s tpu-runner --tpu v6e1
```

### 2. 灵活的执行模式

代码执行有四种模式，覆盖从简单到复杂的各种场景：

**模式一：stdin 管道**

```bash
echo "print('Hello from Colab!')" | colab exec
```

**模式二：本地脚本执行**

```bash
colab exec -s trainer -f train.py
```

**模式三：交互式 REPL**

```bash
colab repl
```

**模式四：TTY 远程控制台**

```bash
colab console
```

这四种模式本质上对应了不同的集成场景：stdin 适合管道链式调用，脚本适合批量任务，REPL 适合调试，控制台适合深度运维。

### 3. 短期任务神器：`colab run`

这是 CLI 的杀手级功能——把「创建 VM → 上传脚本 → 执行 → 下载结果 → 销毁 VM」打包为一条命令：

```bash
colab run --gpu A100 train.py
```

相当于一键版的批处理作业。结合 `--keep` 参数还可以保留结束后 VM 供后续检查。

### 4. 自动保活

Colab 浏览器的免费版有约 90 分钟的空闲超时，付费版也有时间限制。Colab CLI 内置了自动保活后台守护进程，使用期间 VM 不会被自动回收——这对长时间训练任务非常关键。

### 5. Google Drive 挂载 + GCP 认证

```bash
colab drivemount -s analysis /content/drive
colab auth -s trainer
```

可以直接挂载 Google Drive 访问数据集，或认证 GCP 服务（BigQuery、Cloud Storage 等）。这对于依赖 Google Cloud 生态的工作流来说，让本地开发与云端执行之间的衔接极其丝滑。

### 6. 日志归档

```bash
colab log -s trainer -o execution_log.ipynb
colab log -s trainer -o execution_log.md
```

支持导出为 Jupyter Notebook（`.ipynb`）、Markdown（`.md`）或 JSONL（`.jsonl`）格式，方便存档和审阅。

## 快速上手

### 安装

```bash
pip install google-colab-cli
```

或使用 `uv`（推荐，更快）：

```bash
uv tool install google-colab-cli
```

**注意**：当前仅支持 Linux 和 macOS，暂不支持 Windows。Windows 用户需要通过 WSL 使用。

### 示例：A100 训练 + 模型下载 + 自动回收

```bash
colab new -s trainer --gpu A100
colab install -s trainer torch transformers
colab exec -s trainer -f train.py
colab download -s trainer checkpoints/model.bin ./model.bin
colab stop -s trainer
```

### 示例：一个命令跑完整任务

```bash
colab run --gpu T4 train.py
```

### 示例：Shebang 模式

直接在脚本头部声明。这样脚本本身即可作为可执行文件运行：

```python
#!/usr/bin/env -S colab run --gpu L4 --keep
import torch
print("L4 GPU Available:", torch.cuda.is_available())
print("Device Name:", torch.cuda.get_device_name(0))
```

保存为 `train.py`、`chmod +x`、`./train.py` 即可——完全透明的远程 GPU 体验。

## AI Agent 视角：为什么这是基础设施级工具

作为经常和 AI Agent 打交道的人，我认为 Colab CLI 的设计中有一个很容易被忽略的关键点：**它对 Agent 生态的友好程度**。

传统的 Colab 是为"人"设计的——你需要打开浏览器、点击按钮、手动执行单元格。而 Colab CLI 是为"进程"和"Agent"设计的：

- **管道友好**：`echo "code" | colab exec` 模式天然适配 shell 管道和 Agent 的代码生成 + 执行流程
- **无状态设计**：`colab run` 的「启动 → 执行 → 销毁」模式，Agent 无需管理会话生命周期
- **退出代码**：标准化的退出状态码，Agent 可以判断执行是否成功并决定下一步

Google 还同时推出了 [Colab MCP Server](https://github.com/googlecolab/colab-mcp)，一个面向 AI Agent 框架（如 Claude Desktop、Cline 等实现了 MCP 协议的客户端）的 Colab 交互接口。如果你用的是 MCP 生态的工具，可以直接通过 MCP 协议调用 Colab 算力。这个项目目前有 **659 个 Star**，远超 CLI 本身的 111 个，侧面说明了 AI Agent 社区对这个能力的需求旺盛。

可以想象这样的场景：一个 AI 编码 Agent 在写完训练脚本后，**自主地**调用 Colab CLI 启动一个 A100 实例、上传脚本、监控执行进度、下载模型权重——完全无须人工介入。

## 与同类工具的对比

| 特性 | Colab CLI | Colab MCP Server | Google Cloud AI Platform | AWS SageMaker CLI |
|------|-----------|-------------------|------------------------|-------------------|
| 启动速度 | 秒级 | 秒级 | 分钟级 | 分钟级 |
| 免费额度 | 有 | 有 | 无 | 无 |
| Agent 友好 | 管道/stdout | MCP 协议 | REST API | REST API |
| GPU 可选 | T4/H100/A100 等 | 同左 | 全系列 | 全系列 |
| 自动保活 | 内置 | 需手动 | 有 | 有 |
| 文件管理 | upload/download/ls | 同左 | 云存储 | 云存储 |
| 梯级作业 | `colab run` | 需自建 | Batch API | Batch API |
| 平台支持 | Linux/macOS | 跨平台 | 全平台 | 全平台 |

Colab CLI 最大的差异化优势在于**极低的启动延迟**和**零配置门槛**——不需要配置云账号的 IAM、VPC、子网等基础设施，一条命令就能用上 GPU。

## 局限性

1. **无 Windows 支持**：当前不支持 Windows 原生运行，需要 WSL。
2. **需要付费订阅**：虽然 Colab 有免费版，但 GPU/TPU 的大量使用需要订阅 Colab 付费计划（按计算单元计费）。
3. **运行时上限**：单次会话有最长使用时长限制（免费版约 12 小时，付费版更长但非无限制）。
4. **网络依赖**：所有代码和文件需要通过网络传输，数据量较大时受限。
5. **Python >= 3.13**：目前强制要求 Python 3.13 及以上版本，对部分旧系统不友好。
6. **比浏览器少一些交互特性**：无法使用 Colab 的交互式可视化、实时表格渲染等浏览器端功能。

## 适合谁用

| 用户类型 | 推荐程度 | 说明 |
|---------|---------|------|
| ML 开发者 | ⭐⭐⭐⭐⭐ | 本地编码 + 远程 GPU 执行，无缝衔接 |
| AI Agent 开发者 | ⭐⭐⭐⭐⭐ | 为 Agent 提供云端算力执行能力 |
| 运维/DevOps | ⭐⭐⭐⭐ | CI/CD 管道中按需调用 GPU 计算 |
| 数据科学家 | ⭐⭐⭐ | 如果习惯 Jupyter 生态则 Colab MCP 更合适 |
| 教育/教学 | ⭐⭐⭐ | 简化学生的 GPU 配置流程 |
| Windows 用户 | ⭐⭐ | 需要 WSL 环境 |

## 总结

Colab CLI 是 Google 把 Colab 从"浏览器里的免费 GPU"升级为"终端里的云端算力"的重要一步。它的设计干净利落——安装一条命令、启动一条命令、执行任务一条命令、停止一条命令，所有操作都符合 CLI 的 Unix 哲学。

对于 AI Agent 开发者，它的意义更大。在 Agent 能够自动编写和运行代码的今天，最缺的就是**一个简单、可靠、且 Agent 可以直接调用的云端计算接口**。Colab CLI（以及与之配套的 Colab MCP Server）正好填补了这个空白。

当前项目仍处于早期（GitHub 111 Stars），但其背后是 Google 官方团队的长期维护，API 设计和文档质量都不错。如果你的工作流中需要频繁使用 GPU/TPU 资源，值得一试。

---

## 参考资料

1. [Google Colab CLI GitHub 仓库](https://github.com/googlecolab/google-colab-cli)
2. [Google Colab MCP Server GitHub 仓库](https://github.com/googlecolab/colab-mcp)
3. [PyPI: google-colab-cli](https://pypi.org/project/google-colab-cli/)
4. [Google Colab 官方文档](https://colab.research.google.com/)
5. [Colab 付费计划与计算单元说明](https://colab.research.google.com/signup)
