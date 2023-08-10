---
layout:		post
category:	"soft"
title:		"RunAsDate使用指定的日期时间运行应用程序"

tags:		[]
---
- Content
{:toc}


[RunAsDate](https://www.nirsoft.net/utils/run_as_date.html) 使用指定的日期时间运行应用程序

![](https://www.nirsoft.net/utils/runasdate.gif)



某称程度上可以用来解决软件授权到期问题，但是作者做了免责声明，也不保证所有的软件授权到期问题都能解决。

目前最新版支持到Windows10系统，主要技术原理是HOOK了时间相关的 API（GetSystemTime、GetLocalTime、GetSystemTimeAsFileTime、NtQuerySystemTime、GetSystemTimePreciseAsFileTime），以达到修改日期时间的目标。



