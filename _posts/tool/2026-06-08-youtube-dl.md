---
title: youtube-dl —— 开源视频下载领域的标杆项目
description: "youtube-dl 是开源视频下载领域的里程碑项目（140,459 Stars），支持从 YouTube 及 1000+ 网站下载视频，虽原生开发放缓但其活跃 Fork yt-dlp 已接棒。"
date: 2026-06-08 00:00:00 +0800
categories: [tool]
tags: [视频下载, YouTube, CLI, Python, 已停更]
---

## 项目简介

youtube-dl 是开源视频下载领域无可争议的标杆项目，凭借 140K+ Stars 成为 GitHub 上最受关注的开源工具之一。它是一个命令行程序，不仅支持 YouTube，还覆盖了 1000+ 网站的在线视频下载，支持从分辨率选择到字幕下载的全方位功能。

虽然官方已不再发布新版本，但 youtube-dl 开创了整个视频下载工具类别，其架构和设计被无数后继项目继承和发展。

## GitHub 数据

- **仓库地址**: [ytdl-org/youtube-dl](https://github.com/ytdl-org/youtube-dl)
- **Stars**: 140,459 | **Forks**: 10,673
- **License**: Unlicense（公有领域）
- **语言**: Python
- **当前版本**: 2021.12.17（已停发新版）
- **维护状态**: 官方不再发布新版本，社区活跃 Fork 为 yt-dlp

## 核心功能

- **YouTube 下载**：支持任意分辨率，从 144p 到 8K，包括 HDR
- **1000+ 网站提取器**：覆盖 YouTube、Vimeo、Dailymotion、Bilibili 等主流视频站
- **格式选择**：自动选择最佳画质/码率组合，或手动指定视频/音频格式
- **字幕/缩略图**：自动下载视频字幕、自动生成的字幕和缩略图
- **播放列表**：支持单视频、播放列表、频道、用户上传的批量下载
- **限速与代理**：内置限速选项和代理配置，适应不同网络环境
- **输出模板**：灵活的文件命名模板，支持自定义输出目录结构
- **外部下载器集成**：支持 aria2c、axel 等下载器加速

## 技术栈

| 技术 | 用途 |
|------|------|
| Python | 主要开发语言 |
| FFmpeg（可选） | 视频、音频后期处理与合并 |
| 跨平台 | 支持 Windows / macOS / Linux |

## 使用方式 / 安装

### PIP 安装

```bash
pip install youtube-dl
```

### 基本使用

```bash
# 下载最佳画质视频
youtube-dl https://www.youtube.com/watch?v=dQw4w9WgXcQ

# 列出所有可用格式
youtube-dl -F https://www.youtube.com/watch?v=dQw4w9WgXcQ

# 指定格式下载
youtube-dl -f 137+140 https://www.youtube.com/watch?v=dQw4w9WgXcQ

# 下载播放列表
youtube-dl -f best https://www.youtube.com/playlist?list=PLxxxxx

# 限速下载
youtube-dl -r 500K https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### 推荐迁移到 yt-dlp

由于官方已停更，建议新用户直接使用 yt-dlp：

```bash
pip install yt-dlp
```

yt-dlp 保持同样的命令行接口，同时增加了大量新站点支持和性能改进。

## 适用场景

- **YouTube 批量下载**：备份整个频道或播放列表
- **在线视频离线备份**：将流媒体视频保存到本地
- **媒体资产存档**：机构级视频资源归档
- **内容创作者**：为自己的视频制作本地备份

## 竞品对比

| 项目 | 类型 | 状态 | 特点 |
|------|------|------|------|
| **youtube-dl**（经典版） | 开源 CLI | ⏸ 已停更 | 开创性项目，140K Stars |
| **yt-dlp**（推荐替代） | 开源 CLI | ✅ 活跃 | youtube-dl 社区活跃 Fork，功能最全 |
| **FFmpeg** | 开源 CLI | ✅ 活跃 | 通用多媒体处理，非专用下载工具 |
| **4K Video Downloader** | 商业 GUI | ✅ 维护 | 图形界面友好，免费版有限制 |

youtube-dl 的历史地位无可替代——它证明了视频下载工具可以开源、跨平台、覆盖海量站点，其 Unlicense 许可更将代码完全捐献给了公有领域。

## 参考资料

- [youtube-dl 官方仓库](https://github.com/ytdl-org/youtube-dl)
- [yt-dlp（推荐替代）](https://github.com/yt-dlp/yt-dlp)
- [youtube-dl 官方文档](https://github.com/ytdl-org/youtube-dl#readme)
- [FFmpeg 官方文档](https://ffmpeg.org/)
