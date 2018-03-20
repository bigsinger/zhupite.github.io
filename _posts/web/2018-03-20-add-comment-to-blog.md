---
layout:		post
category:	"web"
title:		"为GitHubPages博客添加评论系统"
tags:		[web,blog]
---

参考：[Gitment：使用 GitHub Issues 搭建评论系统 \| I'm Sun](https://imsun.net/posts/gitment-introduction/)


> Gitment 是作者实现的一款基于 GitHub Issues 的评论系统。支持在前端直接引入，不需要任何后端代码。可以在页面进行登录、查看、评论、点赞等操作，同时有完整的 Markdown / GFM 和代码高亮支持。尤为适合各种基于 GitHub Pages 的静态博客或项目页面。

# 步骤
## 1. 注册OAuth Application
点击<https://github.com/settings/applications/new>注册一个新的OAuth Application，例如我这里填写：
- Application name：zhupete
- Homepage URL: http://www.zhupite.com
- Application description：朱皮特的个人博客
- Authorization callback URL（这里一定要填域名）：http://www.zhupite.com

注册成功后，会跳转到Developer settings页面，并生成有Client ID和Client Secret。同时也会收到一封邮件：
**[GitHub] A third-party OAuth application has been added to your account**

## 2. 创建新的repository作为评论的仓库
这个repository是用来专门存储评论的，区别于存储博客的repository。

## 3. 博客添加评论代码
我这里使用的是[Simple Elegant](http://jekyllthemes.org/themes/simple-elegant/)模板，建站过程参见：[使用GitHub搭建个人博客 \- 朱皮特个人博客](http://www.zhupite.com/posts/readme.html)。

按要求，需要修改_includes/comment.html文件，直接贴上如下代码：
```
<div id="container"></div>
<link rel="stylesheet" href="https://imsun.github.io/gitment/style/default.css">
<script src="https://imsun.github.io/gitment/dist/gitment.browser.js"></script>
<script>
var gitment = new Gitment({
  id: '页面 ID', // 可选。默认为 location.href
  owner: '你的 GitHub ID',
  repo: '存储评论的 repo名称，非网址',
  oauth: {
    client_id: '你的 client ID',
    client_secret: '你的 client secret',
  },
})
gitment.render('container')
</script>
```
设置示例：
```
<div id="container"></div>
<link rel="stylesheet" href="https://imsun.github.io/gitment/style/default.css">
<script src="https://imsun.github.io/gitment/dist/gitment.browser.js"></script>
<script>
var gitment = new Gitment({
  id: 'location.href',
  owner: 'bigsinger',
  repo: 'commentofzhupite',
  oauth: {
    client_id: '75ae7c080c16673756d6',
    client_secret: '9792dc439aa9281ce21590fdb0f668bc98b9faf8',
  },
})
gitment.render('container')
</script>
```
然后SVN提交GitHub。

随便打开博客的一篇文章，就可以看到评论框了，但是需要点一下**“Initialize Comments”**开启评论。


