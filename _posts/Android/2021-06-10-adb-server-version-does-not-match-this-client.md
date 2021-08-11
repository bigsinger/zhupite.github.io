---
layout:		post
category:	"android"
title:		"解决：adb 提示adb server version(31) doesn't match this client（41）解决办法"
tags:		[android]
---
- Content
{:toc}
**关键词**：adb，安卓模拟器，安卓，雷电模拟器，夜神模拟器。



# 问题

adb连接安卓模拟器（雷电模拟器、夜神模拟器）时报错：

```
adb server version(36) doesn‘t match this client(41)；killing...
```



# 问题原因

本地的adb版本和模拟器的adb版本不一致，字面意思就是本地端的adb版本是41，设备端的adb版本是36。



# 解决办法

1. 将本地的adb.exe、AdbWinApi.dll、AdbWinUsbApi.dll替换到模拟器目录下三个文件，夜神模拟器需要同步替换nox_adb.exe。本地的adb路径需要看电脑的环境变量设置的路径，对于Android开发来说一般是在Android SDK路径下，例如我的是：D:\Android\Sdk\platform-tools\adb.exe
2. 替换完成后，重启模拟器。