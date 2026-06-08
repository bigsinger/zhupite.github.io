1|---
2|layout:		post
3|category:	"tool"
4|title:		"如何在线下载优酷视频？优酷视频下载方法汇总"
5|
6|tags:		[youku,优酷,视频,kux,视频下载]
7|---
8|
9|**关键词**：优酷视频下载，下载优酷视频，视频下载，kux视频下载
10|
> 📅 **本文更新记录**：2021年1月首次发布；2026年6月更新为最新方案

优酷近年已逐步弃用旧的 .kux 专有加密格式，转向标准 HLS 流媒体分发。因此推荐策略已变：不再依赖 kux→mp4 转换，而是直接使用能解析流地址并下载的工具。
16|
17|---
18|
19|# 最新方案（2026年更新）
20|
21|## you-get（Python命令行，强烈推荐）
22|
23|[you-get](https://github.com/soimort/you-get)（Stars 56,800+）支持优酷（youku.com）在线视频下载，稳定可靠。
24|
25|> 🎯 **推荐理由**：you-get 直接解析优酷在线视频流，绕过整个 kux 加密格式的麻烦环节。
26|
27|```bash
28|# 安装
29|pip install you-get
30|
31|# 下载优酷视频
32|you-get "https://v.youku.com/v_show/id_xxx.html"
33|
34|# 查看可用画质
35|you-get -i "URL"
36|
37|# 指定画质
38|you-get "URL" --format=hd3
39|```
40|
41|## Lux（Go语言高速下载）
42|
43|[lux](https://github.com/iawia002/lux)（Stars 31,387，Go语言）支持优酷视频在线下载，Go单文件编译，速度极快。
44|
45|```bash
46|# 下载优酷视频
47|lux "https://v.youku.com/v_show/id_xxx.html"
48|
49|# 查看所有可用画质
50|lux -i "URL"
51|```
52|
53|## .kux 文件转换方案（已有旧文件时）
54|
55|如果你手里还保存着旧的 .kux 文件，可以使用以下工具转换：
56|
57|### jsjtsty/KUXConverter（C++，推荐）
58|
59|[jsjtsty/KUXConverter](https://github.com/jsjtsty/KUXConverter)（Stars 39）是一个轻量级的 .kux→.mp4 转换工具，C++编写，直接将优酷加密 kux 文件转为标准 MP4。工具本身功能稳定，虽已较久未更新但转换功能仍可用。
60|
61|```bash
62|# 使用
63|KUXConverter.exe input.kux output.mp4
64|```
65|
66|## N_m3u8DL-RE（m3u8流下载）
67|
68|[N_m3u8DL-RE](https://github.com/nilaoda/N_m3u8DL-RE)（Stars 8,100+）是原N_m3u8DL-CLI的跨平台升级版。不过请注意：N_m3u8DL的旧版本曾标注"不支持优酷视频解密"，新版需要实际测试。
69|
70|## ChattyPlay-Agent（一站式全平台）
71|
72|[ChattyPlay-Agent](https://github.com/P1kaj1uu/ChattyPlay-Agent)（Stars 678）支持优酷等20+平台在线解析下载。
73|
74|## 推荐路线（2026年6月）
75|
76|| 使用场景 | 推荐方案 |
77||---------|---------|
78|| 在线下载优酷视频 | **you-get** 或 **lux** |
79|| 已有 .kux 文件需转换 | **jsjtsty/KUXConverter** |
80|| 一站式全平台 | **ChattyPlay-Agent** |
81|| 需要图形界面 | **GUI-for-you-get** |
82|
83|---
84|
