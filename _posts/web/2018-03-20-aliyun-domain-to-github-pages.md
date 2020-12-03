---
layout:		post
category:	"web"
title:		"GitHub Pages博客网站绑定阿里云域名"
tags:		[web,blog]
---

本文介绍如何把阿里云域名解析到GitHub Pages博客网站，例如我的博客小站：https://zhupite.com/，建站过程参见：[使用GitHub搭建个人博客 \- 朱皮特的烂笔头](http://www.zhupite.com/posts/readme.html)。



# 1、在阿里云控制台解析域名



## 方法一：CNAME（推荐）

- 记录类型：CNAME
- 主机记录：www
- 解析线路：默认
- 记录值：bigsinger.github.io
- TTL：默认



- 记录类型：CNAME

- 主机记录：@

- 解析线路：默认

- 记录值：bigsinger.github.io

- TTL：默认

  

## 方法二：A（不推荐）

ping一下博客地址获取到IP地址，然后添加A记录。

- 记录类型：A
- 主机记录：www
- 解析线路：默认
- 记录值：IP
- TTL：默认



- 记录类型：A
- 主机记录：@
- 解析线路：默认
- 记录值：IP
- TTL：默认





# 2、在GitHub后台设置

在作为博客的仓库（例如bigsinger.github.io）后台进行设置：Settings - GitHub Pages - Custom domain

输入：www.zhupite.com

然后Save





# 3、在仓库根目录创建CNAME

在仓库根目录下创建CNAME文件，内容只有一行域名，例如：

```
zhupite.com
```

并提交到GitHub。



实际测试发现没有这个CNAME文件也可以。

