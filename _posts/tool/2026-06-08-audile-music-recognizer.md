---
layout: post
title: "Audile（MusicRecognizer）：开源 Android 音乐识别应用，集成 AudD + ACRCloud + Shazam"
categories: [tool]
description: "一款开源的 Android 音乐识别 App，同时集成 AudD、ACRCloud 和 Shazam 三大识别引擎，支持通知栏控制/桌面小组件/快捷磁贴、离线排队识别、曲库管理、歌词获取、多平台跳转。"
keywords: 音乐识别, Android, AudD, ACRCloud, Shazam, 歌曲识别, 开源, Kotlin, Jetpack Compose
tags: [tool, open-source, 音乐识别, Android, AudD, ACRCloud, Shazam, 开源, Kotlin]
---

# Audile（MusicRecognizer）：开源 Android 音乐识别应用，集成 AudD + ACRCloud + Shazam

## 项目概览

**Audile（原名 MusicRecognizer）** 是一款开源的 Android 音乐识别应用，让你快速识别周围正在播放的歌曲。它同时集成了 **AudD、ACRCloud 和 Shazam** 三大音乐识别引擎，使用 Odesli 获取多平台歌曲链接，支持离线排队、通知栏控制、桌面小组件和快捷磁贴。

| 指标 | 数据 |
|------|------|
| 仓库 | https://github.com/aleksey-saenko/MusicRecognizer |
| Stars | **1,126** |
| Forks | 43 |
| 编程语言 | Kotlin |
| 协议 | GPL-3.0 |
| 最低支持 | Android 8.0+ |
| 分发渠道 | F-Droid / GitHub Releases |

---

## 一、为什么需要它

音乐识别并非新鲜事——Shazam 全世界有数亿用户。但 Shazam 等商业方案的问题是：

- **数据归平台**：识别记录无法独立导出
- **功能受限**：免费版有天数限制
- **隐私风险**：需要完整的位置/麦克风权限

Audile 作为开源替代，把**识别引擎做成可插拔的**，用户自己选择使用哪个引擎（或免费额度），所有数据保存在本地曲库中。

---

## 二、三大识别引擎

| 引擎 | 特点 | 商业模式 |
|------|------|---------|
| **AudD** | 支持无 API Key 使用（每日限额少） | 14 天试用 / 付费订阅 |
| **ACRCloud** | 有免费开发者额度 | 注册即有长期免费额度 |
| **Shazam** | 识别准确率极高的商业引擎 | Shazam 免费 API 接口 |

### 引擎选择策略

Audile 支持**配置默认引擎**。如果某个引擎没有结果或无网络，自动排队到下一个引擎。用户可以在设置中自由切换首选引擎。

### API Key 配置

| 引擎 | 获取方式 |
|------|---------|
| **AudD** | https://dashboard.audd.io/ 注册获取 14 天试用 Token |
| **ACRCloud** | https://www.acrcloud.com/ 注册项目，选择 "Recorded Audio" + "Audio Fingerprinting" |

---

## 三、核心功能

### 3.1 识别功能

| 功能 | 说明 |
|------|------|
| **一键识别** | 点击即开始识别 |
| **离线排队** | 无网络时先录音，有网络后自动识别 |
| **失败自定义** | 可设置无网络/无匹配/其他失败时的默认行为 |
| **后台识别** | 通知栏控制识别进程 |

### 3.2 后台与控制

| 功能 | 说明 |
|------|------|
| **通知栏控制** | 无需打开 App 即可管理识别和查看结果 |
| **桌面小组件** | 主屏幕快速启动识别 |
| **快捷设置磁贴** | 下拉通知栏一键开启识别 |
| **后台持续识别** | 支持长时间监听模式 |

### 3.3 曲库管理

| 功能 | 说明 |
|------|------|
| **本地曲库** | 所有识别记录存储在 App 本地 |
| **收藏列表** | 标记喜欢的歌曲 |
| **搜索筛选** | 按歌曲名/艺术家搜索、过滤 |
| **歌曲详情** | 专辑封面、艺人、专辑、年份等信息 |

### 3.4 歌曲详情与跳转

识别成功后，Audile 通过 **Odesli** 获取该歌曲在各个平台的链接：

| 平台 | 说明 |
|------|------|
| Spotify | 直接跳转到 Spotify 播放 |
| Apple Music | 跳转到 Apple Music 播放 |
| YouTube Music | YouTube Music 链接 |
| Deezer | Deezer 平台播放 |
| Tidal | Tidal 高音质播放 |
| 歌词 | 获取并显示歌词（部分引擎支持） |

---

## 四、技术架构

| 组件 | 选型 |
|------|------|
| 开发语言 | Kotlin |
| UI 框架 | Jetpack Compose |
| 设计规范 | Material Design 3 |
| API 客户端 | Retrofit / OkHttp |
| 图片加载 | Coil |
| 数据序列化 | Kotlinx Serialization |
| 构建工具 | Gradle |
| 发行渠道 | F-Droid / GitHub Releases |

---

## 五、优劣势分析

| 优势 | 说明 |
|------|------|
| **三引擎合一** | AudD + ACRCloud + Shazam 同时可用，覆盖率和准确率超高 |
| **开源无广告** | GPL-3.0 开源，完全无广告 |
| **离线排队识别** | 无网络时先录音，网络恢复后自动完成识别 |
| **多平台跳转** | 集成 Odesli，识别后一键跳转到 Spotify/Apple Music/Youtube Music 等 |
| **后台控制完整** | 通知栏 + 桌面小组件 + 快捷磁贴，三种方式控制 |
| **多语言** | WebLate 社区翻译，持续添加新语言 |

| 劣势 | 说明 |
|------|------|
| **需要 API Key** | 免费额度有限，高频使用需要付费订阅 AudD 或 ACRCloud |
| **仅 Android** | 不支持 iOS 平台 |
| **Shazam 接口不稳定** | 第三方逆向接口，可能随时失效 |
| **安装门槛** | 推荐通过 F-Droid 安装，对普通用户有一定门槛 |

---

## 六、适合谁用

- **音乐爱好者**——听到喜欢的歌却不知道名字，一键识别
- **复古音乐寻找者**——听到熟悉的旋律识别不出来名字时
- **DJ / 音乐从业者**——快速识别混音中的采样来源
- **隐私敏感用户**——开源、本地曲库、无用户追踪
- **F-Droid 用户**——已上架 F-Droid，可用客户端直接安装

---

## 总结

Audile 的最大价值在于**打破了单一识别引擎的垄断**。Shazam 再准，也有限制。而 Audile 把 AudD、ACRCloud、Shazam 三个引擎的能力融合在一个开源 App 中——一个识别不到，另一个试试。配合离线排队识别和完整的后台控制体系，几乎是 Android 平台上功能最完整的开源音乐识别方案。

---

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/aleksey-saenko/MusicRecognizer |
| F-Droid | https://f-droid.org/packages/com.mrsep.musicrecognizer/ |
| GitHub Releases | https://github.com/aleksey-saenko/MusicRecognizer/releases |
| AudD API | https://audd.io/ |
| ACRCloud | https://www.acrcloud.com/ |
| Odesli | https://odesli.co/ |
| 翻译平台 | https://hosted.weblate.org/engage/audile/ |
