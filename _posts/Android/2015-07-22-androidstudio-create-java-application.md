---
layout:		post
category:	"android"
title:		"在AndroidStudio中创建java应用"
tags:		[android,AndroidStudio]
---



参考： [利用AndroidStudio开发java工程的办法](http://jingyan.baidu.com/article/3a2f7c2e6b2f4726afd61185.html)

现在用的是AndroidStudio1.0版本，配置差不多。

首先新建一个project，然后再创建一个新的Module：

![img](http://note.youdao.com/yws/public/resource/bd624b2e09b532283740779035fae40d/108187E07951471B8E35DBA2DF0DE979)

选择最下面的Java Library，然后Next：

![img](http://note.youdao.com/yws/public/resource/bd624b2e09b532283740779035fae40d/9627E34D015D46C5927D02BBC4095BD2)

Finish成功后的工程结构如图：

![img](http://note.youdao.com/yws/public/resource/bd624b2e09b532283740779035fae40d/8CF875FA6A3D4337AEA91B6976AF3764)

在MyClass里添加静态的main函数：

```
public class MyClass { public static void main(String[] args) { System.out.println("main"); } }
```

这个时候还不能直接运行或者调试，需要配置一下。

点击菜单的Run->Edit Configuration，然后点击+选择Application：

![img](http://note.youdao.com/yws/public/resource/bd624b2e09b532283740779035fae40d/57637516CE2E44F686B5AAE0AC8C8F8A)

Main Class选择设置为com.example.MyClass：

![img](http://note.youdao.com/yws/public/resource/bd624b2e09b532283740779035fae40d/93613433118D492F9D295252780C05BF)

配置成功后就可以运行了。

如果测试代码需要添加三方的jar包，则F4打开工程配置：

![img](http://note.youdao.com/yws/public/resource/bd624b2e09b532283740779035fae40d/7502A3AEB3214F6F8A7C53EE0824E219)

选择lib模块，在Dependencies中点击+选择File dependency，选择对应的jar包文件即可，只可惜一次不能选择多个jar包文件，只能逐个添加。