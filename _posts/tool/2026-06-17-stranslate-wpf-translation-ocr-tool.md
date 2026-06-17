---
layout: post
title: "STranslate 2.0：开源即用即走的 WPF 翻译 OCR 工具，集成 OpenAI/Gemini/DeepL 等数十种服务"
categories: [tool]
description: "STranslate 是一款基于 WPF 的开源翻译与 OCR 工具，支持增量翻译、图片翻译、划词翻译等多种模式。集成 OpenAI、Gemini、DeepL、Google 等数十种翻译服务，内置微信 OCR 引擎，提供插件系统、TTS、生词本等功能。MIT 协议。"
tags:
  - STranslate
  - WPF
  - 翻译工具
  - OCR
  - 开源
  - 效率工具
  - C#
---

如果你每天需要频繁翻译、截图识别文字、或在不同翻译服务间对比结果，多半已经受够了这样的体验：打开浏览器 → 访问网页翻译 → 粘贴文本 → 切换标签页对比 → 再来一遍。次数多了，就想要一个**常驻后台、即用即走**的本地翻译工具。

[**STranslate**](https://github.com/STranslate/STranslate) 就是为这个场景而生的——基于 WPF 的 Windows 桌面翻译 OCR 工具，**v2.0 已累积 7200+ Star**，最新版本 v2.0.7。它的核心理念很简单：按住一个键划词，松开即翻译；想对比多家结果，一次查询同时返回；要识别图片文字，无需联网本地 OCR。

而且它有完整的 **插件系统**，翻译/OCR/TTS 都可以通过社区插件扩展。

---

## 一、解决的问题

市面上的翻译工具有三大类，各有局限：

| 类型 | 代表 | 痛点 |
|------|------|------|
| 网页翻译 | Google Translate、DeepL Web | 每次打开浏览器，无法离线，无法跨应用 |
| 浏览器插件 | 沉浸式翻译 | 只能在浏览器内用，无法翻译桌面应用内容 |
| 商业桌面软件 | 有道翻译官、QTranslate | 部分收费、服务单一、无法自定义 |

STranslate 切入的是 **「桌面级即用即走」** 的空缺——它常驻系统托盘，通过全局热键 + 鼠标划词触发，不打断工作流：

- **增量翻译**：按住热键 → 滑词选中 → 松开即翻；重复选择持续追加，适合长句分段翻译
- **多服务并发**：同时查询 OpenAI、DeepL、Google 等多家，一次展示全部结果
- **本地 OCR**：内置微信 OCR 引擎，截屏即识别，无需网络
- **图片翻译**：识别图片文字后直接在原图上排版译文

---

## 二、核心功能

### 增量翻译

这是 STranslate 最具特色的交互方式。配置一个全局热键（比如 Ctrl+Shift+T），按住时激活取词窗口，鼠标滑过文本即可逐段添加，松开按键自动翻译。

整个过程不离开当前工作窗口——写代码时翻译注释、读 PDF 时翻译段落、看外文文档时查词，都只需要一个按键+鼠标划选。输入框里支持 Ctrl+滚轮实时调整字体大小。

### 多翻译服务并发

STranslate 不绑定单一翻译引擎，支持同时配置多个服务并**并发查询**：

| 类别 | 支持的服务 |
|------|-----------|
| 大模型翻译 | OpenAI、Gemini、Claude、Ollama、OpenRouter |
| 专业翻译 | DeepL(DeepLX)、Google(网页)、阿里翻译、腾讯翻译 |
| 国产模型 | 通义千问、DeepSeek、火山引擎 |
| 其他 | Azure Translator、小牛翻译 |

所有服务可同时启用，翻译结果并列显示，方便对比不同引擎的质量差异。

### 内嵌 OCR（离线可用）

内置微信 OCR 引擎，截屏后自动识别文字，无需联网。另支持通过插件接入 PaddleOCR、Gemini OCR、火山引擎 OCR 等。

### 图片翻译

配置 OCR 服务 + 图片翻译服务后，截取包含外文的图片，STranslate 会识别文字并在原图上还原排版，直接呈现译文——适合阅读外文漫画、截图、扫描件。

### 插件系统

基于 .NET 的模块化插件架构，官方市场和社区提供了 20+ 插件：

**翻译插件**：Ali、Claude、DeepLX、Gemini、GoogleWebsite、Ollama、OpenRouter、QwenMt、DeepSeek、AzureTranslator、NiuTrans 等

**OCR 插件**：Paddle、Gemini、火山引擎、LongCat

**TTS 插件**：MiMo、Vocu、FishAudio、Unisound

**生词本插件**：墨墨背单词

插件以 `.spkg` 格式分发，拖拽到插件页面即可安装。

### 自定义 Prompt & TTS

可以利用大模型的自定义 Prompt 做文本润色、内容总结、代码解释、语法纠错——相当于一个本地 AI 助手。

TTS 方面集成 Microsoft Edge TTS 引擎，支持多语言朗读、语速音调可调。社区插件还提供了 FishAudio、Vocu 等更多语音选择。

### 生词本

内置生词本功能，翻译时一键收藏词汇，支持本地备份与恢复。结合社区插件可同步到墨墨背单词等 App。

### HTTP API

STranslate 提供完整的 HTTP 接口，可被其他工具或脚本调用：

```shell
# 翻译
curl http://127.0.0.1:50020/translate -d "你好世界"

# OCR 识别图片
curl http://127.0.0.1:50020/ocr -d "D:\\tmp\\stranslate.png"

# 静默截图OCR（直接复制到剪贴板）
curl http://127.0.0.1:50020/ocr_silence

# TTS 朗读
curl http://127.0.0.1:50020/tts_silence -d "Hello World"
```

配合 SnipDo（微软商店免费工具），可以在任何应用的右键菜单中加入「翻译到 STranslate」选项。

### 其他细节

- **二维码识别**：截图识别二维码内容
- **回译模式**：翻译后再译回原文，验证翻译质量
- **明暗主题**：跟随系统或手动切换
- **历史记录**：保存所有翻译记录，支持搜索回顾
- **管理员模式**：解决部分应用内划词获取不到文本的问题
- **静默翻译**：不弹出界面，翻译结果直接复制到剪贴板

---

## 三、与同类工具对比

| 维度 | STranslate | QTranslate | 有道翻译官 | 沉浸式翻译 |
|------|-----------|------------|-----------|-----------|
| 平台 | Windows (WPF) | Windows | Windows/macOS | 浏览器扩展 |
| 开源 | ✅ MIT 协议 | ❌ 免费闭源 | ❌ 商业软件 | ❌ 部分开源 |
| 多服务并发 | ✅ | ❌ | ❌ | ✅ |
| 本地 OCR | ✅ 微信 OCR | ❌ | ❌ | ❌ |
| 图片翻译 | ✅ | ❌ | ✅ | ❌ |
| 插件系统 | ✅ .NET 插件 | ❌ | ❌ | ❌ |
| HTTP API | ✅ | ❌ | ❌ | ✅ (有限) |
| 划词翻译 | ✅ 增量模式 | ✅ | ✅ | ✅ (浏览器内) |
| TTS | ✅ Edge TTS | ❌ | ✅ | ❌ |
| 生词本 | ✅ | ❌ | ✅ | ❌ |
| 自定义 Prompt | ✅ | ❌ | ❌ | ❌ |

---

## 四、快速上手

### 安装

从 [GitHub Releases](https://github.com/STranslate/STranslate/releases) 下载最新版本（v2.0.7），解压后直接运行 `STranslate.exe`——无需安装，绿色便携。

### 基础设置

1. 启动后系统托盘出现 STranslate 图标，右键进入「设置」
2. 在 **翻译** 页面配置翻译服务（OpenAI、DeepL、Google 等）
3. 在 **OCR** 页面配置文本识别服务（默认已开启微信 OCR）
4. 在 **热键** 页面设置增量翻译、截图翻译等全局热键
5. 设置 → 常规 → 勾选「开机自启」和「以管理员权限启动」

### 日常使用

- **增量翻译**：按热键 → 鼠标滑词选择文本 → 松开即翻译
- **截图翻译**：按截图翻译热键 → 框选区域 → 自动识别并翻译
- **图片翻译**：截图 → 识别文字 → 在原图位置呈现译文
- **插件扩展**：从文档站下载 `.spkg` 插件 → 拖拽到插件页面

---

## 五、适合谁用

- **开发者**：翻译技术文档、代码注释，通过 API 集成到工作流
- **学生/研究者**：阅读外文学术论文、PDF，划词即翻
- **跨境从业者**：频繁对比多引擎翻译结果，保证翻译准确性
- **多语言阅读者**：截图识别外文图片、漫画、扫描件
- **效率工具控**：喜欢键盘操作、快捷键驱动、常驻后台的工具

---

**项目地址**：[GitHub - STranslate/STranslate](https://github.com/STranslate/STranslate) | [Gitee - zggsong/STranslate](https://gitee.com/zggsong/STranslate)

**文档站点**：[stranslate.zggsong.com](https://stranslate.zggsong.com)

**许可证**：MIT 协议，完全开源免费，无需注册账号即可使用全部功能。
