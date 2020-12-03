---
layout:		post
category:	"web"
title:		"使用Gittalk为GitHubPages博客添加评论系统"
tags:		[web,blog]
---



本文介绍如何使用 [Gittalk](https://github.com/gitalk/gitalk) 为GitHubPages博客创建评论系统。



# 步骤
## 1. 创建新的公开的仓库用来存放评论

这个repository是用来专门存放评论的，区别于存储博客的repository，例如：[**blog-comments**](https://github.com/bigsinger/blog-comments)



## 2. 注册OAuth Application

点击  [Register a new OAuth application](https://github.com/settings/applications/new) 注册一个新的OAuth Application，例如我这里填写：
- Application name：blog-comments
- Homepage URL: https://www.zhupite.com
- Application description：朱皮特的烂笔头
- Authorization callback URL（这里一定要填域名）：https://www.zhupite.com

注册成功后，会跳转到Developer settings页面，并生成有**clientID**和**clientSecret**。同时也会收到一封邮件：
**[GitHub] A third-party OAuth application has been added to your account**



## 3. 博客添加评论代码
我这里使用的是 [mzlogin.github.io: Jekyll Themes / GitHub Pages 博客模板](https://github.com/mzlogin/mzlogin.github.io) 模板，建站过程参见：[使用GitHub搭建个人博客 \- 朱皮特个人博客](./readme.html)。

按要求，需要修改 **_config.yml** 配置文件，替换对应的 **clientID**和**clientSecret** 即可，然后提交GitHub。



随便打开一篇博客文章，就可以看到评论框了，使用GitHub账号登录即可评论。


