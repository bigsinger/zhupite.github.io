---
layout:		post
category:	"soft"
title:		"APE格式音乐文件批量分割转换成MP3"

tags:		[]
---
- Content
{:toc}


主要使用 [foobar2000](https://www.foobar2000.org/) 进行分割转换，支持输出格式的选择和文件名自定义。转换`MP3`需要一个三方工具：`LAME`，可以在这里下载：[mp3-lame-bundle - RareWares](https://www.rarewares.org/mp3-lame-bundle.php)

转换方法：

1. 运行 `foobar2000` ，打开菜单 `File` - `Open` ，同时选择 `APE`和`CUE` 文件，软件加载成功后会显示歌曲列表。
2. 右键列表，在弹出的菜单中选择 `Convert` - `...`，在弹出的转换配置向导里可以设置输出的文件格式和文件名。
3. `Output format` 默认是`WAV`，修改为`MP3`格式，音质根据实际情况选择，默认足够。文件名配置我一般使用这个格式：`%track% %title% - %artist%`，下面有预览，如果是自己想要的效果就OK。
4. 点击 Convert，会让选择保存目录，其次会让选择 `LAME`所在目录，选择好后即可自动转换。速度很快，一会就完成了。

