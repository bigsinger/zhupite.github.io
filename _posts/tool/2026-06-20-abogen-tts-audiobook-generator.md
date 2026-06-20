---
layout: post
title: "Abogen：开源有声书生成器，把 EPUB/PDF 一键转成带字幕的音频，本地运行、自然发音"
categories: [tool]
description: "Abogen 是一个开源 TTS 工具，底层跑 Kokoro-82M 模型，能把 EPUB、PDF、TXT、字幕文件转成有声书和配套字幕。PyQt6 桌面端 + Flask Web UI 双界面，支持 M4B 苹果有声书格式、语音混音器、队列批量处理、Audiobookshelf 直连。4.8K Stars，MIT 协议。"
tags: [TTS, 有声书, 开源工具, Kokoro, Python]
---

## 一句话

**Abogen** 是一个把电子书、PDF、TXT、Markdown、字幕文件转成有声书和配套字幕的开源 TTS 工具。底层跑的是 Kokoro-82M 模型，不需要云服务，本地运行，效果自然。

> denizsafak/abogen ⭐ 4.8K | 🐍 Python | MIT | 2025 年 4 月发布

## 为什么需要它？

做有声书、配音素材、带字幕音频这件事，一直处于"要么花钱、要么折腾"的状态：

| 方案 | 问题 |
|------|------|
| **商业 TTS API**（Azure / ElevenLabs） | 付费、有字数限制、数据要上传云端 |
| **本地 TTS 引擎**（espeak / pyttsx3） | 发音机械感强，像机器人读课文 |
| **Kokoro 原始模型** | 好用但只有 CLI，没有 UI，没有字幕生成，没有批量处理 |
| **手动操作** | 用工具转文本 → 另一工具转语音 → 第三工具加字幕 → 第四工具打包 |

Abogen 做了一件事：**把这条流程串起来，打包成一个安装即用的工具。** 拖个文件进去，出来的是带字幕的音频，中间什么都不用管。

## 核心功能

### 1. 拖进文件，几秒出音频

桌面端 PyQt6 写的，不花哨但该有的都有。拖 EPUB 或 PDF 进输入框，调语速（0.1-2.0）、选声音、选格式，点 Start，几秒后音频就出来了。

实测：RTX 2060 Mobile（笔记本中端卡）跑 3000 字，11 秒出 3 分多钟音频。CPU 也能跑，对显卡要求不高。

输出格式给了五种：

| 格式 | 说明 | 最佳场景 |
|------|------|---------|
| **WAV** | 无损 | 后续精编 |
| **FLAC** | 无损压缩 | 存档 |
| **MP3** | 通用格式 | 兼容性最广 |
| **OPUS** | 极高压缩比，音质损失小 | ⭐ 最实用，体积最小 |
| **M4B** | 苹果有声书格式 | iPhone / Audiobookshelf 推送 |

M4B 格式带章节信息，推给 iPhone 或 Audiobookshelf 体验最好。

### 2. 同步字幕生成，粒度可调

这是 Abogen 最实用的功能之一——语音和字幕同步生成，而且字幕的分段粒度可以精确控制：

- 按行切
- 按句子切
- 按句子+逗号切
- 按单词数切（1 词/条、2 词/条……）
- 句子高亮模式：读到哪里亮到哪里

**注意**：单词级字幕只对英文有效（Kokoro 只给英文出了 token 级时间戳）。中文走句子和逗号拆分路径，体验不差，只是字幕稍长。

内置 spaCy 做英文句子边界检测，主要对付 "Mr." "Dr." 这类缩写。Settings 里默认关闭，用英文内容记得开。

### 3. 语音混音器，自己捏声音

这个功能比较少见——不同 Kokoro 语音模型按权重混在一起，调出自己的声音。调完保存成 profile，下次直接选，不用重新调。

支持的语言：

| 语言 | 说明 |
|------|------|
| 美式英语 | 男女声齐全 |
| 英式英语 | 男女声齐全 |
| 西班牙语 | 有限 |
| 法语 | 有限 |
| 印地语 | 有限 |
| 意大利语 | 有限 |
| 日语 | 需额外安装 misaki 包 |
| 巴西葡萄牙语 | 有限 |
| **中文普通话** | ✅ 男女声都有 |

### 4. 队列模式，批量处理

一次处理一堆文件的场景：

- txt 和字幕文件直接拖进队列列表
- PDF、EPUB 等从主窗口点 "Add to Queue"
- 每个文件绑定加入队列时的配置，改主窗口配置不影响已排文件
- "Override" 开关统一覆盖所有文件配置

### 5. Web UI（比桌面端多三样）

命令行打 `abogen-web`，浏览器开 `localhost:8808`，Flask 写的界面。比桌面端多出的核心功能：

**LLM 文本规范化**——把 don't、can't、I'll 这类缩写丢给大模型处理完再送给 TTS。Ollama 本地跑也行，OpenAI API 也行。Settings 里填 URL、key、选模型，不开这功能发音差别挺明显。

**Audiobookshelf 直连**——填好 Base URL、Library ID、文件夹和 API Token，生成完的音频直接推书库。前面套了 Nginx Proxy Manager 的话记得在 Advanced 加 proxy_set_header，header 丢了上传直接挂。

**Supertonic TTS**——额外的 TTS 引擎选项。

### 6. 章节标记和元数据处理

ePub、PDF、Markdown 文件处理时自动插入 `<<CHAPTER_MARKER:章节标题>>` 标记，按标记拆成独立音频文件。某个章节出错了只重跑那个就行。

纯文本里手写这些标记也认。

M4B 支持元数据标签，文本开头写：
```
<<METADATA_TITLE:三体>>
<<METADATA_ARTIST:刘慈欣>>
```

封面图自动从 ePub 和 PDF 里提取嵌入。

时间戳文本也支持：txt 里每段前面写 `HH:MM:SS` 格式的时间码，Abogen 按时间轴出音频，做定时旁白或视频配音时省事。

## 安装

### Windows

如果不想折腾 Python 环境，直接下载仓库跑 `WINDOWS_INSTALL.bat`，它自己会处理所有依赖（包括 Python 和 CUDA），基本算一键启动。唯一需要手动装的是 [espeak-ng](https://github.com/espeak-ng/espeak-ng/releases/latest)。

用 uv 安装（推荐）：

```bash
# NVIDIA GPU
uv tool install --python 3.12 abogen[cuda] --extra-index-url https://download.pytorch.org/whl/cu128

# 无 GPU / AMD
uv tool install --python 3.12 abogen
```

### macOS

```bash
brew install espeak-ng

# Apple Silicon
uv tool install --python 3.13 abogen --with "kokoro @ git+https://github.com/hexgrad/kokoro.git,numpy<2"
```

### Linux

```bash
sudo apt install espeak-ng  # Ubuntu/Debian

# 含 CUDA 支持
uv tool install --python 3.12 abogen[cuda] --extra-index-url https://download.pytorch.org/whl/cu128
```

## 使用

**启动桌面端**：
```bash
abogen
```

**启动 Web UI**：
```bash
abogen-web
# 浏览器打开 http://localhost:8808
```

## 底层模型：Kokoro-82M

Abogen 底层用的是 [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)，一个 8200 万参数的开源 TTS 模型：

| 属性 | 值 |
|------|-----|
| 参数规模 | 82M（小而强） |
| 模型权重大小 | ~328MB（FP32） |
| 许可证 | Apache-2.0（可商用） |
| HuggingFace 下载 | **1700 万+**（热度极高） |
| 推理 | GPU/CPU 均可，低门槛 |

82M 参数的模型能在消费级 GPU 上实时推理，这是 Abogen 可以广泛部署的基础。MIT + Apache-2.0 双开源许可，没有商用顾虑。

## 同类项目对比

| 维度 | Abogen 🏆 | Edge TTS | Piper TTS | Coqui TTS | 商业 TTS API |
|------|-----------|----------|-----------|-----------|-------------|
| **部署** | **本地，单命令** | 需 Edge 浏览器 | 本地，C++ | 本地，Python | 云端 |
| **UI** | **PyQt6 + Web 双界面** | ❌ 仅 CLI | ❌ 仅 CLI | ❌ 仅 CLI | 有云端控制台 |
| **字幕生成** | ✅ **内置，粒度可控** | ❌ | ❌ | ❌ | ❌ |
| **有声书格式** | ✅ M4B + 进度记忆 | ❌ | ❌ | ❌ | 需额外处理 |
| **批量处理** | ✅ 队列模式 | ❌ | ❌ | ❌ | 有限 |
| **语音混音** | ✅ 权重混音 | ❌ | ❌ | ❌ | ❌ |
| **中英文支持** | ✅ | ✅ 中文好 | ✅ | ✅ | ✅ |
| **离线** | ✅ **完全离线** | ❌ 需网络 | ✅ | ✅ | ❌ 需网络 |
| **单价** | **免费** | 免费 | 免费 | 免费 | 按字符计费 |

## 几个不太爽的地方

- **桌面端和 Web 端功能没对齐**。Web 端有 LLM 规范化 / Audiobookshelf 集成 / Supertonic TTS，桌面端还没有。用两个界面感觉像在用两套软件。
- **单词级字幕中文用不了**。Kokoro 的限制，只给英文出了 token 级时间戳。
- **Web UI 和桌面端截图风格不统一**，UI/UX 没有做到一致。
- **Kokoro-82M 的中文发音可以接受**，但如果对中文 TTS 有超高要求（比如播客级），可能需要考虑专门的商业中文 TTS。

## 项目状态

| 指标 | 数据 |
|------|------|
| Stars | 4,874 ⭐ |
| Forks | 321 🍴 |
| 许可证 | MIT |
| 主语言 | Python |
| 创建时间 | 2025 年 4 月 |
| 最新版本 | v1.3.1（2026-02-06） |
| 底层模型 | Kokoro-82M（Apache-2.0，HuggingFace 1700 万+ 下载） |

Roadmap 里有 PDF OCR、多语言界面翻译，项目维护状态健康，issue 有人回，PR 有人合。

## 总结

Abogen 不是那种一眼精致的商业产品。它是一个作者和贡献者们把真实需求一个个补上去的开源项目——能解决你的问题，但使用体验还有打磨空间。

不过工具类的评判标准从来都是功能 > 体验：

- 能拖 EPUB ✅
- 能吃 PDF ✅
- 能生成字幕 ✅
- 能做 M4B ✅
- 能批量跑 ✅
- 能进 Web UI ✅
- 能接 Audiobookshelf ✅
- 能让 LLM 帮忙洗文本 ✅
- 完全本地离线 ✅

最值得说的是，它没有停在"文本转语音"这个浅层功能上。它开始处理生成之后的事情：章节提取、元数据、队列管理、书架集成。真正麻烦的，往往就在这些地方。

---

**项目地址**：[github.com/denizsafak/abogen](https://github.com/denizsafak/abogen)

**参考资料**
- 原文：[mp.weixin.qq.com/s/O02XieSaMvCYW4TOoqAn6w](https://mp.weixin.qq.com/s/O02XieSaMvCYW4TOoqAn6w)
- GitHub API 数据：stars 4,874 / forks 321 / MIT / 2025-04 创建
- Kokoro-82M：[huggingface.co/hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
- PyPI：[pypi.org/project/abogen](https://pypi.org/project/abogen/)
