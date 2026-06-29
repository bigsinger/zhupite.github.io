---
layout: post
title: "CapsWriter-Offline：Windows 上完全离线的语音输入利器，按住说话松开即输"
categories: [tool]
description: "CapsWriter-Offline 是 Windows 平台的离线语音输入工具。按住 CapsLock 或鼠标侧键说话，松开自动上屏。支持 Paraformer / SenseVoice / FunASR / Qwen3-ASR 四种离线模型，热词替换、LLM 润色、文件转录一应俱全"
keywords: CapsWriter, speech-to-text, offline voice input, Windows, ASR, voice typing
tags:
  - open-source
  - Windows
  - speech-to-text
  - voice-input
  - ASR
---

> **更新日志**：本文基于 CapsWriter-Offline v2.6，2026 年 6 月数据。

## CapsWriter-Offline 是什么

**CapsWriter-Offline** 是一个专为 Windows 打造的完全离线语音输入工具。核心交互非常简单——**按住 CapsLock 键（或鼠标侧键双击）说话，松开就自动上屏。**

不用联网、不用注册账号、不收集你的语音数据。所有识别在本地完成，一句话录完即刻出字，延迟在 0.6-4 秒之间（取决于所选模型和硬件）。

| 项目信息 | 数据 |
|---------|------|
| GitHub 仓库 | https://github.com/HaujetZhao/CapsWriter-Offline |
| Stars | ~5,800 |
| Forks | 540 |
| 语言 | Python |
| 许可证 | MIT |
| 当前版本 | v2.6 |
| 创建时间 | 2023-05-28 |
| 平台支持 | Windows 10/11（64 位） |
| 运行环境 | VC++ 运行库 + FFmpeg（可选，用于文件转录） |

## 为什么需要它

语音输入在 PC 上一直有几个痛点：

- **在线方案延迟高**：需要上传音频、等待云端识别、返回结果，网络波动直接卡顿
- **离线方案配置复杂**：Kaldi、Whisper 等需要 Python 环境、CUDA、模型下载，普通用户门槛太高
- **快捷键不顺手**：许多工具需要手动点击按钮开始/停止录音，打断打字流

CapsWriter-Offline 的设计哲学就是「无感输入」——按住一个键就说，松开就出字，不需要任何额外操作。完全离线保证了隐私和低延迟，一个 U 盘就能带走，保密电脑也能用。

## 支持的识别模型

工具内置四种离线引擎，准确率和速度各有侧重：

| 引擎 | 准确性 | 速度 | 格式 | 显卡加速 |
|------|--------|------|------|---------|
| **Paraformer** | ★★★☆☆ | ★★★★★ | ONNX | ❌ |
| **SenseVoice-Small** | ★★★☆☆ | ★★★★★ | ONNX | ✅ DirectML/Vulkan |
| **Fun-ASR-Nano** | ★★★★☆ | ★★★★☆ | ONNX + GGUF | ✅ |
| **Qwen3-ASR** | ★★★★★ | ★★★☆☆ | ONNX + GGUF | ✅ |

实测 20 秒音频转录延迟参考：

| 模型 | CPU U9-285H | GPU RTX5050 |
|------|-------------|-------------|
| Paraformer | 0.6s | — |
| SenseVoice-Small | 0.6s | 0.15s |
| Fun-ASR-Nano | 2.0s | 0.5s |
| Qwen3-ASR-1.7B | 4.0s | 1.0s |

Paraformer 在 CPU 上最快，Qwen3-ASR 准确率最高但需要 GPU 才能发挥实时性能。

## 快速上手

### 1. 安装

```bash
# 准备环境
# 确保已安装 VC++ 运行库
# 若要文件转录功能，安装 ffmpeg 并加入系统 PATH
```

1. 从 [Latest Release](https://github.com/HaujetZhao/CapsWriter-Offline/releases/latest) 下载软件本体
2. 从 [Models Release](https://github.com/HaujetZhao/CapsWriter-Offline/releases) 下载模型包
3. 将模型解压放入 `models/` 目录
4. 双击 `start_server.exe`（自动最小化到托盘）
5. 双击 `start_client.exe`（自动最小化到托盘）
6. **按住 CapsLock 键或双击鼠标侧键，说话，松开即上屏**

### 2. 配置

所有配置在 `config_server.py` 和 `config_client.py` 中直接编辑，覆盖：

- 默认引擎和模型路径
- 热词和替换规则
- 角色（LLM 润色）配置
- 录音设备和快捷键
- 录音保存和日记归档

### 3. 热词系统

CapsWriter-Offline 的热词系统是其核心差异化功能：

**热词替换**（`hot.txt`）：记录偏僻词（人名、专业术语），通过音素模糊匹配，相似度超过阈值则强制替换识别结果。例如自动将「深度学习框架」纠正为「PyTorch」。

**规则替换**（`hot-rule.txt`）：用正则或简单等号规则做精准替换，适合固定短语替换。

**自定义短语**：设置常用短语缩写，语音识别后自动展开为完整短语。

### 4. LLM 角色

支持通过 LLM 对识别结果做后处理。预置了几个角色模板：

- **润色**：修正口语表达，使其更书面
- **小助理**：对识别结果做 AI 摘要或补充

当识别结果的开头匹配角色名称时，自动交由该角色处理。

### 5. 文件转录

直接把音视频文件拖到客户端窗口，自动输出三种格式：

- `.srt` — 字幕文件
- `.txt` — 纯文本
- `.json` — 带时间戳的结构化数据

## 深入功能

### 录音模式

| 模式 | 操作方式 | 适用场景 |
|------|---------|---------|
| **按住说话** | 按住 CapsLock/鼠标侧键 → 说话 → 松开 | 日常语音输入，最推荐 |
| **对讲机模式** | 按一下开始 → 再按一下结束 | 长段落口述 |
| **单击录音** | 单击开始 → 再单击停止 | 需要手动控制 |

### 托盘菜单

右键托盘图标可快捷操作：
- 添加热词
- 复制最近结果
- 清除 LLM 记忆
- 隐藏/显示 CLI 窗口
- 切换录音模式

### 日记归档

按日期保存每一句语音及其识别结果，所有录音文件都存为本地音频，隐私不丢失。

### C/S 架构

服务端和客户端分离。即使旧电脑（如 Win7）跑不动服务端模型，也可以用客户端连接其他机器上的服务端进行输入。

## 适合谁用

| 用户 | 场景 |
|------|------|
| **文字工作者** | 写稿、复盘会议录音，比键盘输入快 3-5 倍 |
| **程序员** | 口述注释、文档、代码思路，偶尔输入长文本 |
| **保密单位员工** | 完全离线，不接触互联网，物理隔离电脑也能用 |
| **口述写作者** | 长时间语音输入，对讲机模式连段输出 |
| **视频创作者** | 拖拽视频文件自动生成字幕和文本 |
| **需要数字 ITN 的用户** | 自动「十五六个」→「15~16个」，数字格式规范 |

## 局限

- **仅 Windows 10/11**：没有 macOS 和 Linux 版本。作者推荐同类工具 LazyTyper 和 闪电说
- **模型下载体量大**：需额外下载模型包，不能开箱即用
- **需要 VC++ 运行库**：部分电脑需单独安装
- **Qwen3-ASR 需要 GPU**：CPU 上延迟 4 秒，体验不如 Paraformer
- **没有图形化安装向导**：模型目录结构需要手动配置

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/HaujetZhao/CapsWriter-Offline |
| 最新 Release | https://github.com/HaujetZhao/CapsWriter-Offline/releases/latest |
| 模型发布页 | https://github.com/HaujetZhao/CapsWriter-Offline/releases |
| 文档目录 | https://github.com/HaujetZhao/CapsWriter-Offline/tree/main/docs |

## 参考资料

- **CapsWriter-Offline README**：完整文档和使用说明。→ https://github.com/HaujetZhao/CapsWriter-Offline
- **Sherpa-ONNX**：项目使用的推理框架之一。→ https://github.com/k2-fsa/sherpa-onnx
- **FunASR**：阿里达摩院开源 ASR 工具包。→ https://github.com/modelscope/FunASR
