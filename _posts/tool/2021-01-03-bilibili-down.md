1|---
2|layout:		post
3|category:	"tool"
4|title:		"如何在线下载哔哩哔哩视频？B站视频下载方法汇总"
5|
6|tags:		[bilibili,哔哩哔哩,视频,视频下载]
7|---
8|
9|**关键词**：哔哩哔哩视频下载，下载哔哩哔哩视频，视频下载，下载bilibili视频，B站视频下载
10|
> 📅 **本文更新记录**：2021年1月首次发布；2026年6月更新为最新方案

![视频下载工具](https://pic2.zhimg.com/v2-b0b081c501ddf7ab0f02e812d0be6b5c_1440w.jpg?source=172ae18b)

本文汇总B站（bilibili）视频下载的各种方法。B站API频繁更新，以下为2025-2026年仍在活跃维护的工具推荐。
16|
17|---
18|
19|# 最新方案（2026年更新）
20|
21|以下为截至2026年6月仍在积极维护的B站视频下载工具。
22|
23|## BBDown（命令行首选）
24|
25|[BBDown](https://github.com/nilaoda/BBDown) 是B站专用的命令行下载器，C#编写，功能最为全面。与本文2021年首次提到的BBDown是同一项目（持续维护至今）。
26|
27|- **Stars**: 13,877
28|- **最新活动**: 2026年6月仍有推送
29|- **类型**: 命令行（CLI）
30|- **平台**: Windows / Linux / macOS
31|- **协议**: MIT（开源免费）
32|
33|### 核心特性
34|
35|- 支持4K/8K/HDR/杜比视界
36|- 支持音视频分离、多线程下载
37|- 支持登录Cookie / 扫码登录
38|- 可下载弹幕、字幕、封面、互动视频
39|- 高度可脚本化，适合自动化批量下载
40|- 支持番剧、课程、收藏夹、UP主投稿批量下载
41|
42|### 快速上手
43|
44|```bash
45|# Windows直接下载exe，命令行执行
46|BBDown "https://www.bilibili.com/video/BV1xxx"
47|
48|# 使用Cookie登录（获取高清画质）
49|BBDown --cookie "SESSDATA=xxx" "BV1xxx"
50|
51|# 下载整个收藏夹
52|BBDown "https://www.bilibili.com/medialist/play/xxx"
53|
54|# 下载弹幕/字幕
55|BBDown --danmaku "BV1xxx"
56|```
57|
58|## downkyicore（图形界面推荐）
59|
60|[downkyicore](https://github.com/yaobiao131/downkyicore) 是原版 downkyi（哔哩下载姬）的跨平台重构版，C#编写，支持Windows/macOS/Linux。
61|
62|- **Stars**: 7,346
63|- **类型**: 图形界面（GUI）
64|- **协议**: GPL-3.0（开源免费）
65|
66|### 特点
67|
68|- 支持8K/HDR/杜比视界
69|- 批量下载UP主投稿、收藏夹、番剧、课程
70|- 内置工具箱（音视频提取、去水印等）
71|- 扫码登录获取会员画质
72|- 跨平台（Windows/macOS/Linux）
73|
74|> ⚠️ 原版 [downkyi](https://github.com/leiurayer/downkyi)（Stars 24,362）最后更新2025年7月，建议优先使用重构版 **downkyicore**。
75|
76|## mediago（跨平台通用下载器）
77|
78|[mediago](https://github.com/caorushizi/mediago) 是一个跨平台视频下载器，内置视频嗅探引擎，支持解析m3u8/HLS流。
79|
80|- **Stars**: 8,999
81|- **最新活动**: 2026年6月
82|- **类型**: 图形界面（GUI）
83|- **协议**: MIT（开源免费）
84|
85|支持B站以外还支持YouTube、抖音等数十个网站。
86|
87|## Bili23-Downloader（轻量跨平台）
88|
89|[Bili23-Downloader](https://github.com/ScottSloan/Bili23-Downloader) 是一款开源跨平台的B站专用下载工具。
90|
91|- **Stars**: 4,742
92|- **最新活动**: 2026年6月
93|- **类型**: 图形界面（GUI）
94|- **协议**: GPL-3.0
95|
96|特点：多线程加速、音视频分离、弹幕元数据获取、自定义命名、UP主投稿/收藏夹批量下载。
97|
98|## BilibiliDown（全平台GUI）
99|
100|[BilibiliDown](https://github.com/nICHEnnnnm/BilibiliDown) - Stars 4,939，活跃维护，支持稍后再看、收藏夹、UP主视频批量下载。
101|
102|## Lux（通用命令行下载器）
103|
104|[lux](https://github.com/iawia002/lux)（Stars 31,387，Go语言）是一个通用型视频下载CLI，支持B站、YouTube、抖音、腾讯视频、爱奇艺、优酷等数十个网站。命令简洁高效，适合脚本集成。
105|
106|```bash
107|# 下载B站视频
108|lux "https://www.bilibili.com/video/BV1xxx"
109|
110|# 列表所有可用画质
111|lux -i "URL"
112|```
113|
114|## yutto（番剧/课程下载）
115|
116|[yutto](https://github.com/yutto-dev/yutto)（Stars 1,874，Python编写）是一款专注于B站番剧、课程下载的工具，支持弹幕下载和多线程。
117|
118|## 推荐路线（2026年6月）
119|
120|| 使用场景 | 推荐方案 |
121||---------|---------|
122|| 图形界面、功能全面 | **downkyicore** 或 **Bili23-Downloader** |
123|| 命令行/自动化批量 | **BBDown**（B站专用） |
124|| 多平台通用下载 | **lux**（Go语言，全平台） |
125|| 番剧/课程/收藏夹 | **BBDown** 或 **yutto** |
126|| 偶尔下载一两个视频 | **mediago** 或浏览器插件 |
127|| NAS/emby媒体库 | **bilibili-video-downloader**（带nfo刮削） |
128|
129|---
130|
