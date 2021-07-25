---
layout:		post
category:	"web"
title:		"GitHub Pages博客网站绑定阿里云域名"
tags:		[web,blog]
---

本文介绍如何把阿里云域名解析到GitHub Pages博客网站，例如我的博客小站：https://zhupite.com/，建站过程参见：[使用GitHub搭建个人博客 \- 朱皮特的烂笔头](./readme.html)。



# 1、在阿里云控制台解析域名

实际发现最好把一下解析方式都添加一下：CNAME，A，NS。

设置的最终结果是这样的：

![](https://img2020.cnblogs.com/blog/2103047/202008/2103047-20200814164249838-2040267843.png)



## 1.1 CNAME记录

- 记录类型：CNAME
- 主机记录：www
- 解析线路：默认
- 记录值：zhupite.github.io
- TTL：默认



## 1.2 A记录

把以下几个GitHub的IP全部添加进去，不要只添加ping得的IP记录。

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

- 记录类型：A
- 主机记录：@
- 解析线路：默认
- 记录值：就是上面的IP
- TTL：默认



## 1.3 NS记录

把以下2个NameServer全部添加进去：

```
F1G1NS1.DNSPOD.NET
F1G1NS2.DNSPOD.NET
```

- 记录类型：NS
- 主机记录：@
- 解析线路：默认
- 记录值：就是上面的内容
- TTL：默认



# 2、在GitHub后台设置

在作为博客的仓库（例如zhupite.github.io）后台进行设置：Settings - GitHub Pages - Custom domain

输入：www.zhupite.com

然后Save





# 3、在仓库根目录创建CNAME

在仓库根目录下创建CNAME文件，内容只有一行域名，例如：

```
zhupite.com
```

并提交到GitHub。



实际测试发现没有这个CNAME文件也可以。
