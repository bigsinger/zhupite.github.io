---
layout:		post
category:	"tool"
title:		"如何在线下载爱奇艺视频？爱奇艺视频下载方法汇总"

tags:		[iqiyi,爱奇艺,视频,qsv,视频下载]
---

**关键词**：爱奇艺视频下载，下载爱奇艺视频，视频下载，qsv视频下载

> 📅 **本文更新记录**：2021年1月首次发布；2026年6月更新最新方案（原内容保留为历史章节）

![视频下载工具](https://pic2.zhimg.com/v2-b0b081c501ddf7ab0f02e812d0be6b5c_1440w.jpg?source=172ae18b)

爱奇艺近年已逐步弃用旧的 .qsv 专有加密格式，转向标准 HLS 流媒体分发。因此推荐策略已变：不再依赖 qsv→mp4 转换，而是直接使用能解析流地址并下载的工具。以下将2025-2026年推荐的方案放在前面，老方案保留在后供参考。

---

# 最新方案（2026年更新）

## you-get（Python命令行，强烈推荐）

[you-get](https://github.com/soimort/you-get)（Stars 56,800+）支持爱奇艺（iqiyi.com）在线视频下载，可直接下载MP4/FLV格式，无需处理 .qsv 加密文件。

> 🎯 **推荐理由**：you-get 直接解析爱奇艺在线视频流，绕过整个 qsv 加密格式的麻烦环节。

```bash
# 安装
pip install you-get

# 下载爱奇艺视频
you-get "https://www.iqiyi.com/v_xxx.html"

# 查看可用画质
you-get -i "URL"
```

## Lux（Go语言高速下载）

[lux](https://github.com/iawia002/lux)（Stars 31,387）支持爱奇艺视频在线下载，支持4K画质，Go语言单文件编译，速度快。

```bash
# 下载爱奇艺视频
lux "https://www.iqiyi.com/v_xxx.html"

# 查看所有可用画质
lux -i "URL"
```

## .qsv 文件转换方案（已有旧文件时）

如果你手里还保存着旧的 .qsv 文件，可以使用以下开源工具转换：

### btnkij/qsv2flv（C语言，推荐）

[btnkij/qsv2flv](https://github.com/btnkij/qsv2flv)（Stars 229，C语言）——速度快、无多余临时文件。2026年6月仍有Fork活跃。

```bash
# 转换命令
qsv2flv.exe input.qsv output.flv
```

### fengmoxi/QiyiFLV2MP4（flv→mp4重封装）

[QiyiFLV2MP4](https://github.com/fengmoxi/QiyiFLV2MP4)（Stars 51，C#）——将 qsv2flv 产出的 .flv 重封装为 .mp4，修复时间轴问题。

**最佳工作流**：
```
.qsv 文件 → btnkij/qsv2flv → .flv → QiyiFLV2MP4 → .mp4
```

## N_m3u8DL-RE（m3u8流下载）

[N_m3u8DL-RE](https://github.com/nilaoda/N_m3u8DL-RE)（Stars 8,100+）是原N_m3u8DL-CLI的跨平台升级版。配合浏览器猫抓插件嗅探m3u8地址后下载。

## ChattyPlay-Agent（一站式全平台）

[ChattyPlay-Agent](https://github.com/P1kaj1uu/ChattyPlay-Agent)（Stars 678）支持爱奇艺等20+平台在线解析下载。

## 推荐路线（2026年6月）

| 使用场景 | 推荐方案 |
|---------|---------|
| 在线下载爱奇艺视频 | **you-get** 或 **lux** |
| 已有 .qsv 文件需转换 | **btnkij/qsv2flv** + **QiyiFLV2MP4** |
| 嗅探m3u8流后下载 | **N_m3u8DL-RE** |
| 一站式全平台 | **ChattyPlay-Agent** |
| 需要图形界面 | **GUI-for-you-get** |

---

> **⚠️ 注意**：以下为本文2021年首次发布时的旧方案，部分工具可能已失效，保留仅供历史参考。

---

# 历史方案（2021年记录）

## 在线直接下载

### V视频助手

- [V视频助手\-一键下载在线视频\(支持VIP\)](http://v.ranks.xin/)

使用方法：

1. 在爱奇艺视频播放页面，右键点击，在弹出的菜单中选择：**复制视频页面地址**，获取到爱奇艺视频网址。

2. 打开V视频助手（http://v.ranks.xin/），把爱奇艺视频网址直接粘贴到视频地址栏里，然后点击**解析视频**按钮。

3. 在解析结果里，可以看到解析出的结果：**【高清】点击预览并保存**，**下载超清/蓝光** 。可以直接免费点击高清的结果进行下载，超清蓝光的结果下载需要注册。

该方法有个优点是直接下载的是MP4格式的视频，不需要额外进行qsv视频转mp4了，比较省事。

缺点是下载速度有时不是很好，该方法比较适合短小的视频，毕竟V视频助手也需要转码，比较费时，对于比较长的视频不太建议使用该方法。

### tool.lu在线工具

[下载地址解析 \- 在线工具](https://tool.lu/videoparser/)

使用方法：输入爱奇艺视频网址，点击**获取下载地址**按钮，出现结果后直接点击，会打开新的网页播放视频，直接另存为保存即可，保存的也是mp4格式的视频。

### 硕鼠

[FLVCD \- 硕鼠官网\|FLV下载\|视频下载](http://www.flvcd.com/)

提示：因接到爱奇艺公司要求，目前已停止了对爱奇艺视频的解析支持。

## m3u8视频源下载

这个是我目前为止发现最为专业的下载方式，因此操作方法可能也会比较复杂一些，需要借助的工具：谷歌浏览器、[猫抓插件](https://chrome.google.com/webstore/detail/jfedfbgedapdagkghmgibemcoggfppbb) （谷歌打不开的话可以从GitHub下载： [猫抓 chrome媒体嗅探插件](https://github.com/xifangczy/cat-catch/releases)）、[N_m3u8DL-CLI](https://github.com/nilaoda/N_m3u8DL-CLI)（已升级为跨平台版 [N_m3u8DL-RE](https://github.com/nilaoda/N_m3u8DL-RE)）。

**m3u8 downloader**的可执行程序名叫：**N_m3u8DL-CLI**，只有一个主程序文件，依赖ffmpeg.exe（这个文件网上很容易找到下载，也可以在[N_m3u8DL-CLI使用说明书](https://nilaoda.github.io/N_m3u8DL-CLI/) 上面直接点击下载）。

- 不支持优酷视频解密
- 支持AES-128-CBC加密自动解密
- 支持多线程下载
- 支持下载限速
- 支持断点续传
- 支持Master List
- 支持直播流录制(BETA)
- 支持自定义HTTP Headers
- 支持自动合并 (二进制合并或使用ffmpeg合并)
- 支持选择下载m3u8中的指定时间段/分片内容
- 支持下载路径为网络驱动器的情况
- 支持下载外挂字幕轨道、音频轨道
- 支持仅合并为音频
- 自动使用系统代{过}{滤}理（可禁止）
- 提供SimpleG简易的GUI生成常用参数

![%E7%9B%B4%E6%8E%A5%E4%BD%BF%E7%94%A](https://nilaoda.github.io/N_m3u8DL-CLI/source/images/%E7%9B%B4%E6%8E%A5%E4%BD%BF%E7%94%A8.gif)

N_m3u8DL使用比较简单，下面详细说下步骤：

1. 在谷歌浏览器中播放爱奇艺视频，需要下载什么清晰度的就切换什么清晰度的。
2. 猫爪插件会显示一些数字，点开查看，找到后缀为**.m3u8**的项（一般来说找最后面的一条m3u8，如果切换了视频清晰度，就找最后面的一条），复制其URL网址，这个网址实际上就是视频源。
3. 打开N_m3u8DL，命令行中直接复制上一步骤复制的m3u8视频源，不出错的话，程序就会自动解析视频源并下载了。
4. 等待下载完成，视频默认会保存在N_m3u8DL同目录下的**Downloads**文件夹内，视频格式也是mp4格式的。

- **优点**：直接下载mp4格式，视频清晰度可以自由选择。
- **缺点**：专业性较高，环境配置起来比较复杂。只能手动下载，比较难以批量化操作，技术能力好的可以把需要的各个工具紧密连接起来，做成自动批量化操作。

作者还提供了一个建议的GUI界面版，见：[SimpleGUI · N\_m3u8DL\-CLI文档](https://nilaoda.github.io/N_m3u8DL-CLI/SimpleGUI.html)，有需要的可以体验下。

[使用Javascript获取m3u8](https://nilaoda.github.io/N_m3u8DL-CLI/GetM3u8.html)，方便快速获取m3u8。

[LinetvParser 一款解析Linetv的程序，可导出BAT文件供`N_m3u8DL-CLI`下载](https://nilaoda.github.io/N_m3u8DL-CLI/LinetvParser.html)，貌似不支持爱奇艺视频。

## 三方视频下载工具

### VideoCrawlerEngine

[ZSAIm/VideoCrawlerEngine](https://github.com/ZSAIm/VideoCrawlerEngine): 起源于旧项目爱奇艺解析器(iqiyi-parser)在开发、维护和扩展的过程中遇到的一些问题，而实现的一个基于任务流式的可视化爬虫引擎。引擎的执行单元是节点。脚本节点(script)作为根节点来完成对节点和流程的描述，经由任务节点(task)解析流程描述并生成节点的执行队列，最后交由工作者执行池处理。整个过程可视可控，所有节点处理器都以插件的形式导入，以最大程度实现易扩展性。

## 爱奇艺视频客户端下载

当然也可以使用爱奇艺官网提供的视频客户端下载视频，下载地址：[爱奇艺视频官方最新版下载](http://app.iqiyi.com/pc/player/index.html)

### 操作步骤

​	安装好客户端后，搜索任意一个视频即可进行视频下载，下载的时候会弹出一个对话框，主要是用来选择视频的清晰度的，提供了三种清晰度：**标清**、**高清**、**超清**。视频的清晰度越高，体积越大，下载的时间也会长一些，大家可以根据实际需要进行下载。

​	注意，使用爱奇艺官网视频客户端下载的视频，是**qsv**格式的视频，该视频格式是爱奇艺专用的加密视频，只能用爱奇艺视频客户端进行播放，使用其他播放器是无法播放的（迅雷播放器、暴风影音播放器、potplayer均不行）。

如果想要使用其他播放器播放，或者放到手机里播放，需要先将下载好的爱奇艺qsv视频转换为MP4格式视频。

这里推荐一款软件服务：[全能视频转换专家\-转换任意格式视频](http://www.xcxzq.com)，可以使用该软件进行转换，也可以联系该软件客服，可以提供人工qsv转码。也提供人工直接代下MP4视频服务。

- **优点**：可以批量化，比较适合需要批量下载视频的场景，先批量下载好爱奇艺qsv视频，然后再一次性批量转换qsv视频到mp4视频。
- **缺点**：视频下载时不能直接使用视频网址，有个折中的办法是在浏览器中登录爱奇艺视频并播放一下视频，记录下播放历史，然后在视频客户端中找到播放历史中的视频点击下载。但如果是下载剧集就非常方便了。
