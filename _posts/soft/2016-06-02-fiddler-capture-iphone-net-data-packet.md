---
layout:		post
category:	"soft"
title:		"使用Fiddler对iPhone苹果手机的应用进行网络数据抓包分析"
tags:		[fiddler,iPhone]
---



# 配置Fiddler

首先下载安装 Fiddler，运行后选择菜单Tools->Fiddler Options。

选中"Decrpt HTTPS traffic"，Fiddler就可以截获HTTPS请求：

![img](https://img-blog.csdn.net/20160602134706313)

选中"Allow remote computers to connect"，是允许别的机器把HTTP/HTTPS请求发送到Fiddler上来：

![img](https://img-blog.csdn.net/20160602134712532)

配置完成后 **重启Fiddler**。



# iPhone上安装Fiddler证书

获取当前电脑的IP地址，例如我这里是： 10.241.13.110

则在iPhone中打开safari并访问地址 [http://10.241.13.110:8888](http://10.241.13.110:8888/)，点 "FiddlerRoot certificate"然后安装证书：

![img](https://img-blog.csdn.net/20160602134717922)

![img](https://img-blog.csdn.net/20160602134723829)

![img](https://img-blog.csdn.net/20160602134729141)

![img](https://img-blog.csdn.net/20160602134734454)



# 在iPhone上设置Fiddler为代理

在 iPhone上打开设置->无线局域网，点击当前WIFI后面的i图标查看当前连接信息，滚动到底部的HTTP代理，切换为“手动”：

![img](https://img-blog.csdn.net/20160602134741141)

服务器输入电脑的ip地址，端口输入8888。

所有配置完成，随便在手机上操作应用程序，发生网络请求的都会被Fiddler拦截到。



# 参考

- [Fiddler怎么对IPhone手机的数据进行抓包分析](http://www.cr173.com/html/20064_1.html)

- [Fiddler add-ons--Eric’s Extensions for Fiddler](http://www.telerik.com/fiddler/add-ons)