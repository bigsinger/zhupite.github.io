---
layout:     post
category: 	"duilib"
title:      初识duilib
tags:		[duilib,ui]
date:		2015-09-09
---

国内首个开源的DirectUI界面库--DuiLib，DuiLib开发语言为C++，采用纯Win32API，无其他额外依赖；支持图片等资源的压缩，方便携带传播；目前支持的开发平台为vc6-vc10，Demo比较丰富，非常容易上手。



Duilib是一个windows下免费开源的directui界面库，本来代码是托管到谷歌代码的（<https://code.google.com/p/duilib/>），基于众所周知的原因，仓库现已迁移至Github：
https://github.com/duilib/duilib

所以代码优先查看github上的，但是github上的代码并无资源编辑器DuiDesigner的代码，反而是谷歌代码上会有。
谷歌代码svn下载地址：http://duilib.googlecode.com/svn/trunk/


# 资源
- 属性大全：https://raw.githubusercontent.com/duilib/duilib/master/%E5%B1%9E%E6%80%A7%E5%88%97%E8%A1%A8.xml

- duilib入门之贴图描述、类html文本描述、动态换肤、Dll插件、资源打包：
http://www.ithao123.cn/content-3261480.html

# duilib与MFC
强烈不建议将duilib的控件与MFC的控件混用，毕竟这是两套独立的界面管理，一起混用反而显得混乱和多余，根本没有必要。

但是在用duilib处理编写界面的同时，是可以使用MFC的其他非界面相关的类的。

如果您一定要混用，以下可以参考：
- duilib进阶教程 -- 在MFC中使用duilib (1)
- duilib进阶教程 -- 在duilib中使用MFC (2)
