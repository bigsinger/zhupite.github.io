1|---
2|layout:		post
3|category:	"tool"
4|title:		"如何在线下载爱奇艺视频？爱奇艺视频下载方法汇总"
5|
6|tags:		[iqiyi,爱奇艺,视频,qsv,视频下载]
7|---
8|
9|**关键词**：爱奇艺视频下载，下载爱奇艺视频，视频下载，qsv视频下载
10|
> 📅 **本文更新记录**：2021年1月首次发布；2026年6月更新为最新方案

爱奇艺近年已逐步弃用旧的 .qsv 专有加密格式，转向标准 HLS 流媒体分发。因此推荐策略已变：不再依赖 qsv→mp4 转换，而是直接使用能解析流地址并下载的工具。
16|
17|---
18|
19|# 最新方案（2026年更新）
20|
21|## you-get（Python命令行，强烈推荐）
22|
23|[you-get](https://github.com/soimort/you-get)（Stars 56,800+）支持爱奇艺（iqiyi.com）在线视频下载，可直接下载MP4/FLV格式，无需处理 .qsv 加密文件。
24|
25|> 🎯 **推荐理由**：you-get 直接解析爱奇艺在线视频流，绕过整个 qsv 加密格式的麻烦环节。
26|
27|```bash
28|# 安装
29|pip install you-get
30|
31|# 下载爱奇艺视频
32|you-get "https://www.iqiyi.com/v_xxx.html"
33|
34|# 查看可用画质
35|you-get -i "URL"
36|```
37|
38|## Lux（Go语言高速下载）
39|
40|[lux](https://github.com/iawia002/lux)（Stars 31,387）支持爱奇艺视频在线下载，支持4K画质，Go语言单文件编译，速度快。
41|
42|```bash
43|# 下载爱奇艺视频
44|lux "https://www.iqiyi.com/v_xxx.html"
45|
46|# 查看所有可用画质
47|lux -i "URL"
48|```
49|
50|## .qsv 文件转换方案（已有旧文件时）
51|
52|如果你手里还保存着旧的 .qsv 文件，可以使用以下开源工具转换：
53|
54|### btnkij/qsv2flv（C语言，推荐）
55|
56|[btnkij/qsv2flv](https://github.com/btnkij/qsv2flv)（Stars 229，C语言）——速度快、无多余临时文件。2026年6月仍有Fork活跃。
57|
58|```bash
59|# 转换命令
60|qsv2flv.exe input.qsv output.flv
61|```
62|
63|### fengmoxi/QiyiFLV2MP4（flv→mp4重封装）
64|
65|[QiyiFLV2MP4](https://github.com/fengmoxi/QiyiFLV2MP4)（Stars 51，C#）——将 qsv2flv 产出的 .flv 重封装为 .mp4，修复时间轴问题。
66|
67|**最佳工作流**：
68|```
69|.qsv 文件 → btnkij/qsv2flv → .flv → QiyiFLV2MP4 → .mp4
70|```
71|
72|## N_m3u8DL-RE（m3u8流下载）
73|
74|[N_m3u8DL-RE](https://github.com/nilaoda/N_m3u8DL-RE)（Stars 8,100+）是原N_m3u8DL-CLI的跨平台升级版。配合浏览器猫抓插件嗅探m3u8地址后下载。
75|
76|## ChattyPlay-Agent（一站式全平台）
77|
78|[ChattyPlay-Agent](https://github.com/P1kaj1uu/ChattyPlay-Agent)（Stars 678）支持爱奇艺等20+平台在线解析下载。
79|
80|## 推荐路线（2026年6月）
81|
82|| 使用场景 | 推荐方案 |
83||---------|---------|
84|| 在线下载爱奇艺视频 | **you-get** 或 **lux** |
85|| 已有 .qsv 文件需转换 | **btnkij/qsv2flv** + **QiyiFLV2MP4** |
86|| 嗅探m3u8流后下载 | **N_m3u8DL-RE** |
87|| 一站式全平台 | **ChattyPlay-Agent** |
88|| 需要图形界面 | **GUI-for-you-get** |
89|
90|---
91|
