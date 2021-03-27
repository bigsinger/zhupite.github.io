---
layout:		post
category:	"soft"
title:		"Windows电脑截图工具汇总--截屏软件"
tags:		[screen]
---
- Content
{:toc}
​	

# Snipaste

官网：[Snipaste](https://www.snipaste.com/)，QT C++编写

亮点功能：

- 马赛克
- 画线条时比较比较丝滑



# Flameshot

GitHub：[flameshot-org/flameshot: Powerful yet simple to use screenshot software](https://github.com/flameshot-org/flameshot)，QT C++编写

亮点功能：

- **序号**，每次点一下序号自动加一，比较适合做教程演示步骤的时候打序号。
- 高亮背景

![](https://flameshot.org/media/animatedUsage.gif)



# ShareX

官网：[ShareX - The best free and open source screenshot tool for Windows](https://getsharex.com/)，GitHub：[ShareX/ShareX: ShareX is a free and open source program that lets you capture or record any area of your screen and share it with a single press of a key. It also allows uploading images, text or other types of files to many supported destinations you can choose from.](https://github.com/ShareX/ShareX)

C#编写。



# 微信/QQ截屏插件PrScrn.dll

微信安装目录下的PrScrn.dll开直接复用，该模块仅有一个导出函数PrScrn，没有参数直接调用即可：

```c#
[DllImport("PrScrn.dll")]
public static extern void PrScrn();
```



也可以创建快捷方式，下次直接双击截图，目标：

```
rundll32.exe PrScrn.dll,PrScrn
```



优点：

- 体积小，仅有1M多大小。
- 模块化，方便集成到其他软件里调用。

缺点：

- 功能较简单，但够用

