---
layout:		post
category:	"tool"
title:		"如何在线下载YouTube视频？油管视频下载软件汇总"

tags:		[YouTube,油管,视频,视频下载]
---

**关键词**：YouTube视频下载，下载YouTube视频，视频下载，下载油管视频，油管视频下载

> 📅 **本文更新记录**：2021年1月首次发布；2026年6月更新最新方案（原内容保留为历史章节）

本文介绍各种下载YouTube视频的方法或工具软件。随着时间推移，部分老工具已停更或失效，下方将最新的推荐方案放在前面，老方案保留在后供参考。

---

# 最新方案（2026年更新）

以下为2025-2026年推荐的YouTube下载方案，以开源免费工具为主，持续活跃维护。

## yt-dlp（强烈推荐）

[yt-dlp](https://github.com/yt-dlp/yt-dlp) 是youtube-dl的活跃分支，已成为2025-2026年YouTube下载的行业标准。基于youtube-dl但更新更频繁，修复了大量YouTube API变更导致的下载失败问题。

- **Stars**: 100,000+（GitHub）
- **最新版本**: v2026.03.17（每月多次更新）
- **类型**: 命令行（CLI）
- **平台**: Windows / macOS / Linux
- **协议**: Unlicense（完全开源免费）

### 核心特性

- 支持YouTube全格式下载（4K/8K/60FPS/HDR/VR）
- 支持播放列表/频道批量下载
- 支持字幕下载（自动生成、翻译字幕）
- 支持音视频分离、格式转换
- 支持Cookie登录破解年龄限制
- 支持断点续传、限速下载
- 支持YouTube Music/Shorts/直播流

### 快速上手

```bash
# 安装（Windows可用winget或直接下载exe）
winget install yt-dlp

# 下载视频（默认最佳画质）
yt-dlp "https://www.youtube.com/watch?v=xxx"

# 下载为MP4（指定画质）
yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" "URL"

# 下载为MP3音频
yt-dlp -x --audio-format mp3 "URL"

# 下载整个播放列表
yt-dlp "播放列表URL"

# 查看可用的所有格式
yt-dlp -F "URL"
```

### 图形界面封装

- **[Tartube](https://github.com/axcore/tartube)**（v2.5.231，推荐）：yt-dlp的完整GUI前端，支持下载计划、数据库管理、直播录制等
- **[youtube-dl-gui](https://github.com/oleksis/youtube-dl-gui)**（v1.8.5）：轻量级wxPython前端仍在维护

## Cobalt（在线零安装方案）

[Cobalt](https://cobalt.tools) 是一个2025年兴起的开源在线下载服务，无需安装任何软件，粘贴链接即可下载。后端开源，支持自托管。

- **类型**: Web在线服务 / 自托管
- **版本**: v11.7.1
- **协议**: AGPL-3.0（开源）

### 特点

- 零安装：浏览器打开即用
- 支持YouTube / Bilibili / TikTok / Twitter / Instagram等数十个站点
- 自动选择最佳画质
- 无广告、无追踪、隐私友好
- 可自托管Docker实例

使用方法：打开 [cobalt.tools](https://cobalt.tools)，粘贴YouTube视频链接，选择画质和格式，点击下载即可。

## MeTube（自托管Web界面）

[MeTube](https://github.com/alexta69/metube) 是一个基于Docker的自托管YouTube下载Web UI，后端依赖yt-dlp。

- **类型**: Web UI（自托管）
- **特点**: 可通过浏览器管理下载队列，支持多用户，适合家庭/NAS使用

```bash
# Docker一键部署
docker run -d -p 8081:8081 ghcr.io/alexta69/metube
```

## gallery-dl（元数据 & 图片下载）

[gallery-dl](https://github.com/mikf/gallery-dl)（v1.32.2）专注于下载图库、封面、缩略图和元数据，适合需要YouTube封面/缩略图的场景。也支持几十个其他网站。

## 推荐路线（2026年6月）

| 使用场景 | 推荐方案 |
|---------|---------|
| 偶尔下载，不想装软件 | **Cobalt.tools**（在线零安装） |
| 命令行/自动化/批量下载 | **yt-dlp**（功能最强） |
| 习惯图形界面 | **Tartube**（yt-dlp GUI前端） |
| 自托管/Docker/NAS | **MeTube**（Web UI） |
| 仅下载封面/缩略图 | **gallery-dl** |

---

> **⚠️ 注意**：以下为本文2021年首次发布时的旧方案，部分工具可能已停更或失效，保留仅供历史参考。

---

# 历史方案（2021年记录）

## Gihosoft TubeGet

[Gihosoft TubeGet](https://www.jihosoft.cn/tubeget/tutorial/)：免费、简单易用的YouTube视频下载软件。

### 一键下载高清视频

Download YouTube Videos Free

专注于下载YouTube超高清视频，支持720P、1080P、2K、4K、8K分辨率视频的获取。不仅仅下载YouTube视频，TubeGet还支持从各种流媒体网站上保存视频：包括Vimeo、Bilibili、Twitch等视频网站，Facebook、Twitter、Instagram、Tumblr等社交媒体，以及Mixcloud、SoundCloud等音乐网站。

TubeGet除了下载YouTube单个视频，还支持批量下载播放列表、频道里的全部视频。YouTube上的字幕文件（自带、自动生成、翻译），360°VR全景视频，48/60FPS高帧率视频，高清封面，3D视频等都支持保存。另外，这款YouTube下载器还可将音乐视频转换成MP3音频格式。

### 集成多种实用工具

Integrated with Multiple Utilities

特有的一键下载模式，只需提前设置好下载分辨率、下载位置、字幕语言，即可快速将YouTube视频保存到Windows或Mac电脑上。除了YouTube视频保存功能，Gihosoft TubeGet还有视频格式转换的功能，可以将下载的油管WebM视频转换成MP4、MKV、AVI、MOV格式。

在转换视频的同时，你还可以合成视频和字幕文件。选择转换格式后，点击"添加字幕"选项，导入下载完成的字幕文件。然后选择将字幕以硬字幕或软字幕的方式进行合成，最后点击"转换"按钮，就可以将字幕文件和视频合并成一个整体了。

### YouTube 视频下载方法

作为一款功能强大的youtube视频下载器，Gihosoft TubeGet不仅下载速度很快，而且操作也极为流畅简便。怎样在Windows和Mac电脑上面下载YouTube视频呢？只需简单的三步即可：

![1.复制和粘贴视频链接](https://www.jihosoft.cn/tubeget/dist/img/img-step-copy-link.png)

1. 复制和粘贴视频链接

![progress](https://www.jihosoft.cn/tubeget/dist/img/step-progress.png)

![2.选择下载分辨率](https://www.jihosoft.cn/tubeget/dist/img/img-step-selected-resolution.png)

2. 选择下载分辨率

![progress](https://www.jihosoft.cn/tubeget/dist/img/step-progress.png)

![3.开始下载视频](https://www.jihosoft.cn/tubeget/dist/img/img-step-download.png)

3. 开始下载视频

## youtube-dl（已基本停更，建议迁移至yt-dlp）

[youtube-dl](https://github.com/ytdl-org/youtube-dl)：Command-line program to download videos from YouTube.com and other video sites。这是一个开源免费的命令行版视频下载工具，支持YouTube的视频下载以及其他平台的视频下载，功能强大，但是因为是命令行版，使用上不是很方便，可以使用对应的界面版：[youtube-dl-gui](https://github.com/MrS0m30n3/youtube-dl-gui)（A cross platform front-end GUI of the popular youtube-dl written in wxPython），这个是基于 **youtube-dl** 封装的图形界面版YouTube视频下载工具，使用操作起来比较方便，直接下载使用对应的 [release](https://github.com/MrS0m30n3/youtube-dl-gui/releases) 版即可。

> ⚠️ 截至2026年，原版youtube-dl已基本停止更新（最后版本2024.07.11），因YouTube频更API已无法正常工作，请优先使用其活跃分支 **yt-dlp**。

## YouTubeByClick

**YouTubeByClick破解版**是一个功能强大的音视频下载工具，支持所有主流的视频网址，不管是国内外的都可以，还可以下载整个播放列表，无需重复的操作，并且下载的视频有着高清的画质。使用YouTube By Click下载来自于YouTube, Dailymotion, Vimeo, Facebook 以及40+网站的音乐和视频，格式包括HD, MP3, MP4, AVI和全部其他格式。

![YouTubeByClick](http://pic.3h3.com/up/2020-7/202007030914059004.jpg)
