1|---
2|layout:		post
3|category:	"tool"
4|title:		"如何在线下载YouTube视频？油管视频下载软件汇总"
5|
6|tags:		[YouTube,油管,视频,视频下载]
7|---
8|
9|**关键词**：YouTube视频下载，下载YouTube视频，视频下载，下载油管视频，油管视频下载
10|
> 📅 **本文更新记录**：2021年1月首次发布；2026年6月更新为最新方案
14|
15|---
16|
17|# 最新方案（2026年更新）
18|
19|以下为2025-2026年推荐的YouTube下载方案，以开源免费工具为主，持续活跃维护。
20|
21|## yt-dlp（强烈推荐）
22|
23|[yt-dlp](https://github.com/yt-dlp/yt-dlp) 是youtube-dl的活跃分支，已成为2025-2026年YouTube下载的行业标准。基于youtube-dl但更新更频繁，修复了大量YouTube API变更导致的下载失败问题。
24|
25|- **Stars**: 100,000+（GitHub）
26|- **最新版本**: v2026.03.17（每月多次更新）
27|- **类型**: 命令行（CLI）
28|- **平台**: Windows / macOS / Linux
29|- **协议**: Unlicense（完全开源免费）
30|
31|### 核心特性
32|
33|- 支持YouTube全格式下载（4K/8K/60FPS/HDR/VR）
34|- 支持播放列表/频道批量下载
35|- 支持字幕下载（自动生成、翻译字幕）
36|- 支持音视频分离、格式转换
37|- 支持Cookie登录破解年龄限制
38|- 支持断点续传、限速下载
39|- 支持YouTube Music/Shorts/直播流
40|
41|### 快速上手
42|
43|```bash
44|# 安装（Windows可用winget或直接下载exe）
45|winget install yt-dlp
46|
47|# 下载视频（默认最佳画质）
48|yt-dlp "https://www.youtube.com/watch?v=xxx"
49|
50|# 下载为MP4（指定画质）
51|yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" "URL"
52|
53|# 下载为MP3音频
54|yt-dlp -x --audio-format mp3 "URL"
55|
56|# 下载整个播放列表
57|yt-dlp "播放列表URL"
58|
59|# 查看可用的所有格式
60|yt-dlp -F "URL"
61|```
62|
63|### 图形界面封装
64|
65|- **[Tartube](https://github.com/axcore/tartube)**（v2.5.231，推荐）：yt-dlp的完整GUI前端，支持下载计划、数据库管理、直播录制等
66|- **[youtube-dl-gui](https://github.com/oleksis/youtube-dl-gui)**（v1.8.5）：轻量级wxPython前端仍在维护
67|
68|## Cobalt（在线零安装方案）
69|
70|[Cobalt](https://cobalt.tools) 是一个2025年兴起的开源在线下载服务，无需安装任何软件，粘贴链接即可下载。后端开源，支持自托管。
71|
72|- **类型**: Web在线服务 / 自托管
73|- **版本**: v11.7.1
74|- **协议**: AGPL-3.0（开源）
75|
76|### 特点
77|
78|- 零安装：浏览器打开即用
79|- 支持YouTube / Bilibili / TikTok / Twitter / Instagram等数十个站点
80|- 自动选择最佳画质
81|- 无广告、无追踪、隐私友好
82|- 可自托管Docker实例
83|
84|使用方法：打开 [cobalt.tools](https://cobalt.tools)，粘贴YouTube视频链接，选择画质和格式，点击下载即可。
85|
86|## MeTube（自托管Web界面）
87|
88|[MeTube](https://github.com/alexta69/metube) 是一个基于Docker的自托管YouTube下载Web UI，后端依赖yt-dlp。
89|
90|- **类型**: Web UI（自托管）
91|- **特点**: 可通过浏览器管理下载队列，支持多用户，适合家庭/NAS使用
92|
93|```bash
94|# Docker一键部署
95|docker run -d -p 8081:8081 ghcr.io/alexta69/metube
96|```
97|
98|## gallery-dl（元数据 & 图片下载）
99|
100|[gallery-dl](https://github.com/mikf/gallery-dl)（v1.32.2）专注于下载图库、封面、缩略图和元数据，适合需要YouTube封面/缩略图的场景。也支持几十个其他网站。
101|
102|## 推荐路线（2026年6月）
103|
104|| 使用场景 | 推荐方案 |
105||---------|---------|
106|| 偶尔下载，不想装软件 | **Cobalt.tools**（在线零安装） |
107|| 命令行/自动化/批量下载 | **yt-dlp**（功能最强） |
108|| 习惯图形界面 | **Tartube**（yt-dlp GUI前端） |
109|| 自托管/Docker/NAS | **MeTube**（Web UI） |
110|| 仅下载封面/缩略图 | **gallery-dl** |
111|
112|---
113|
