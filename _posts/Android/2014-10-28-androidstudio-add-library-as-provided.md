---
layout:		post
category:	"android"
title:		"eclipse中Build Path-Add to Build Path对应到androidstudio的设置，把lib库添加为Provided"
tags:		[android,AndroidStudio]
---



有些时候并不需要添加lib库进行编译，例如在使用xposed的jar包时，只需要在eclipse里Build Path-Add to Build Path即可，如果作为lib库添加进去反而会出现异常。

以下是引用的原文：

\--------------------------------------



#### Next, make the XposedBridge API known to the project. You can download`XposedBridgeApi-<version>.jar` from the first post of [this XDA thread](http://forum.xda-developers.com/xposed/xposed-api-changelog-t2714067). Copy it into a subfolder called `lib`. Then right-click on it and select Build Path => Add to Build Path. The `<version>` from the file name is the one you insert as`xposedminversion` in the manifest.

> Make sure that the API classes are not included (but only referenced) in your compiled APK, otherwise you will get an `IllegalAccessError`. Files in the`libs` (with "s") folder are automatically included by Eclipse, so don't put the API file there.

\--------------------------------------



**在androidstudio对应的设置方法为：**

F4打开工程结构，选择Modules-当前项目-Dependencies-+-选择“Jar or directiories”，

![img](https://img-blog.csdn.net/20141028165303874?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

选择jar包后，在“Scope”栏选择“**Provided**”，不要选择“Complie”。

![img](https://img-blog.csdn.net/20141028165357687?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)