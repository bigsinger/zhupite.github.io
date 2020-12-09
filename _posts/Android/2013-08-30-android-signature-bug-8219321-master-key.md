---
layout:		post
category:	"android"
title:		"手动打造apk利用ANDROID-8219321漏洞(Master Key)绕过android签名校验"
tags:		[android,签名]
---



图片显示不全参考：[手动打造apk利用ANDROID-8219321漏洞(Master Key)绕过android签名校验](https://blog.csdn.net/asmcvc/article/details/10582407)



**测试apk：**

安卓读书
Ver:3.8.28(1236)
Package:com.jiasoft.swreader



**下载地址：**

http://gdown.baidu.com/data/wisegame/baeae6c8115d22fa/anzhuodushu_1236.apk



**分析过程：**

反编译目标apk，查看AndroidManifest.xml：

<application android:label="@string/app_name" android:icon="@drawable/icon" android:name=".MyApplication">



就在MyApplication的smali代码的OnCreate入口处添加打印log信息的代码：

```
  #debug by sing
  const-string v1, "TAG"
  const-string v2, "log by sing"
  invoke-static {v1,v2} ,Landroid/util/Log;->d(Ljava/lang/String;Ljava/lang/String;)I
  #debug by sing
```



**具体效果如图：**

![img](https://img-blog.csdn.net/20130830105122500?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)



**回编译**成apk2，证明修改有效，安装并运行查看log信息输出：

![img](https://img-blog.csdn.net/20130830105224687?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

说明修改成功。



**注意下面操作：**

把apk2包中的classes.dex文件添加到原目标apk包的原classes.dex的前面，使得最终生成的包为apk3，压缩包结构为：

![img](https://img-blog.csdn.net/20130830105703453?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)



**重新安装修改后的apk3，运行后能够正常输出log信息：**

![img](https://img-blog.csdn.net/20130830105722015?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

**运行界面正常：**

![img](https://img-blog.csdn.net/20130830105805156?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

**如何利用及危害：**

只要把目标classes.dex复制一份并修改，按照上述方法构造apk，即可绕过签名。



**应用程序如何保护自身：**

自己代码内部做签名校验、Hash值校验等。