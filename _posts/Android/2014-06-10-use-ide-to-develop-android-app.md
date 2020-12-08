---
layout:		post
category:	"android"
title:		"使用IDE搭建Android应用开发环境"
tags:		[android,AndroidStudio]
---



**参考：**[Android Studio使用說明](http://rritw.com/a/JAVAbiancheng/ANT/20130619/373257.html) 

**提高开发效率**

开发工具eclipse、androidstudio，vs2005，测试环境（真机）

**快速搭建开发环境：**

下载JDK（区分32位64位）安装，配置好环境变量。

1、adt（64位机可安装32位版本） ，如adt-bundle-windows-x86-20140321.zip

2、androidstudio（64位机可安装32位版本），如：android-studio-ide-134.1058404-windows5.0.zip

3、NDK，最好是最新的，至少要r9+版本的。

以上全部解压缩，无需安装。ADT里有SDK和SDKManager，androidstudio历史版本里无SDK（首页最新版一般是含有SDK的安装版本），eclipse和androidstudio都使用adt里的sdk即可。

SDKManager由于谷歌被墙的原因更新的时候特别慢，而且有时会失败，需要将host文件添加以下内容：

```
#Google主页
203.208.46.146 www.google.com
#这行是为了方便打开Android开发官网 现在好像不翻墙也可以打开
74.125.113.121 developer.android.com
#更新的内容从以下地址下载
203.208.46.146 dl.google.com
203.208.46.146 dl-ssl.google.com
```

修改后速度会很快。

第一次使用androidstudio需要设置下AndroidSDK路径：Configure--ProjectDefaults--ProjectStructure

![img](C:\Users\hzzhuxingxing\AppData\Local\YNote\data\pushebp@163.com\95f487df452e4a55b2a64edfad4dc641\untitle.png)

![img](C:\Users\hzzhuxingxing\AppData\Local\YNote\data\pushebp@163.com\5e3c74ed094a4f9d984daa54e9e8956b\untitle.png)

![img](C:\Users\hzzhuxingxing\AppData\Local\YNote\data\pushebp@163.com\552b638afba3459396e409183712ed96\untitle.png)

![img](C:\Users\hzzhuxingxing\AppData\Local\YNote\data\pushebp@163.com\b03c8edeb48b4648b16c34c0c7b6cda4\untitle.png)

窗口预览：

![img](C:\Users\hzzhuxingxing\AppData\Local\YNote\data\pushebp@163.com\ab838107122249ca8262e050207c3eb6\untitle.png)

![img](C:\Users\hzzhuxingxing\AppData\Local\YNote\data\pushebp@163.com\cea7bb588b6f4a85b749b89ec50225a5\untitle.png)

[使用IntelliJ IDEA开发前的基本设置，有助于提高开发效率](./using-idea-develop-android-app.html)

**创建eclipse和androidstudio同时支持的项目**

androidstudio支持打开eclipse的项目，反之不行，具体操作参考：[《创建eclipse和androidstudio同时支持的android项目》](https://app.yinxiang.com/shard/s3/nl/407431/8872bcdc-167b-4352-befd-b7968485193f)

**优缺点对比：**

1、androidstudio开发时无论布局还是代码，引用到图片时左侧行号前会显示图片出来。

2、替换文件名，类名等提供安全替换机制，搜索项目中引用处。

3、添加文件、删除文件、重命名文件等的文件操作自动执行svn操作，代码提交时很少会遗漏文件。

4、代码提示自动完善接近vs，代码开发效率完胜eclipse，不用自己一个个地写代码。

5、自动补全（ctrl+shift+enter），例如写一个if按下ctrl+shift+enter自动补全，函数，定义语句等均支持，补全后自动跳到下一行。

6、支持贴近vs的代码正行复制、剪贴、粘贴。

7、支持文件打开定位。

8、直接支持代码优化、导入库优化。

9、UI开发高效，这个自己体验。

10、支持自定义和代码提示、代码完善、文件模板。如创建class后自动生成private static final String TAG = "类名"; 文件备注信息等。如定义try之后自动补全try catch，st之后自动补全为String。

11、写代码很舒服--这个有点主观了呵呵。

**缺点：**

对jni开发的支持不好，对mk文件又增加了一层封装，增加了繁琐性。一般vs+eclipse开发。

logcat比较弱，有时需要开monitor。

**NDK开发**

[《Windows下Android NDK开发的几种方法总结》](./ways-to-develop-android-ndk.html)

可以采用vs+eclipse开发，eclipse支持动态调试JNI，参考：[《Android 学习笔记——利用JNI技术在Android中调用、调试C++代码》](http://blog.csdn.net/asmcvc/article/details/10006215)之“6、Java与C++联合调试 ”。

创建文件模板，如创建class后自动生成private static final String TAG = "类名"; 文件备注信息等。