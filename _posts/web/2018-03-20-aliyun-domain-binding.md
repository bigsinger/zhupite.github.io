---
layout:		post
category:	"web"
title:		"阿里云域名绑定"
tags:		[web,blog]
---

本文介绍如何把阿里云域名解析到GitHub Pages博客网站，例如我的博客小站：<https://zhupite.com/，建站过程参见：[使用GitHub搭建个人博客> \- 朱皮特的烂笔头](./readme.html)。

# 阿里云

以下需要绑定的域名均是在阿里云购买的。

目前添加域名解析非常方便了，在阿里云的云解析管理后台，选择「快速添加解析」，在弹出的对话框中勾选域名、输入IP地址即可。

## 虚拟主机

1. 购买一个独享的虚拟主机（一年500）；虚拟主机页面：<https://www.aliyun.com/product/ecs/hosting>  参考：[阿里云虚拟主机配置版本选择，共享独享、基础、标准、高级和豪华选择攻略-阿里云开发者社区](https://developer.aliyun.com/article/1604753)
2. 在主机管理控制台，管理主机，绑定到域名；
3. 在云解析管理后台再做一下域名绑定；
4. 绑定的时候记得开启https，根据提示可以使用个人用户免费证书，在「数字证书管理服务管理控制台」- 证书管理 - SSL证书管理 - 个人测试证书（原免费证书）按照向导免费创建，创建成功后有一定缓存时间，然后在域名绑定那开启https，在对话框的底部会有一个选择框，勾选上即可。

## GitHub Pages

### 1、在阿里云控制台解析域名

实际发现最好把一下解析方式都添加一下：CNAME，A，NS。

设置的最终结果是这样的：

![](https://img2020.cnblogs.com/blog/2103047/202008/2103047-20200814164249838-2040267843.png)

#### 1.1 CNAME记录

- 记录类型：CNAME
- 主机记录：www
- 解析线路：默认
- 记录值：zhupite.github.io
- TTL：默认

#### 1.2 A记录

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

#### 1.3 NS记录

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

### 2、在GitHub后台设置

在作为博客的仓库（例如zhupite.github.io）后台进行设置：Settings - GitHub Pages - Custom domain

输入：www.zhupite.com

然后Save

### 3、在仓库根目录创建CNAME

在仓库根目录下创建CNAME文件，内容只有一行域名，例如：

```
zhupite.com
```

并提交到GitHub。

实际测试发现没有这个CNAME文件也可以。
