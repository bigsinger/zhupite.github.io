---
layout:		post
category:	"android"
title:		"安卓手机改无电池直供电"

tags:		[android]
---
- Content
{:toc}


本质是电源模拟电池供电，具体可以参考 [How to power Phone Forever Without Battery](https://www.youtube.com/watch?v=0cOEc7ZG6rg)，比较简单直接。要区分好正负极，以及外加电容和二极管做保护。模拟电池供电的那一路电源通过USB和充电器供电，原来的USB充电口继续供电不变，开机仍按电源键保持不变。如果两路电源都供电的话，拔插两路电源任意一个手机均能正常工作。

学习历程可以参考 [手机改无电池，直接外置电源供电使用（二）](https://www.bilibili.com/video/BV1MR4y1176W) 的个人视频。先是电池外置，然后再模拟电池供电。

想要玩的花的话可以参考 [【合集】手机改直供电最简单靠谱方法_手机改直供电教程_手机改直供电源](https://www.douyin.com/video/7200357696279809319) 。



**插电自动启动**

这个猜测是工作室的需求，插电就能自动启动，提高自动化效率的，不然一个个开机也挺麻烦的。

- 软件实现就是改boot配置，但是这个需要ROOT手机，挺麻烦的，耗时也长，不推荐。
- 硬件实现，结合C005延时芯片实现，参考上述合集视频。

# 参考

- [How to power Phone Forever Without Battery](https://www.youtube.com/watch?v=0cOEc7ZG6rg)
- [手机改无电池，直接外置电源供电使用（二）](https://www.bilibili.com/video/BV1MR4y1176W)
- [【合集】手机改直供电最简单靠谱方法_手机改直供电教程_手机改直供电源](https://www.douyin.com/video/7200357696279809319)
- [支持无电池设备   Android 开源项目  Android Open Source Project](https://source.android.com/docs/core/power/batteryless?hl=zh-cn)
