---
layout:		post
category:	"android"
title:		"XPOSED从这里开始"
tags:		[Android,hook,xposed]
---



**安装包：**

[de.robv.android.xposed.installer_v33_36570c.apk](http://dl-xda.xposed.info/modules/de.robv.android.xposed.installer_v33_36570c.apk) (770.28 KB)



**插件：**

模拟位置 (FakeLocation) | Xposed Module Repository http://repo.xposed.info/module/com.rong.xposed.fakelocation

最新版：http://dl-xda.xposed.info/modules/com.rong.xposed.fakelocation_v561_ba3ae4.apk

WechatLuckyMoney | Xposed Module Repository http://repo.xposed.info/module/me.veryyoung.wechat.luckymoney

RandomGame | Xposed Module Repository http://repo.xposed.info/module/me.veryyoung.wechat.randomgame

wechatluckmoney 微信抢红包 | Xposed Module Repository http://repo.xposed.info/module/gzp.wechatluckmoney



**ZjDroid：**

halfkiss/ZjDroid: Android app dynamic reverse tool based on Xposed framework. https://github.com/halfkiss/ZjDroid

ZjDroid工具介绍及脱壳详细示例 - bamb00 - 博客园 http://www.cnblogs.com/goodhacker/p/3961045.html

需要下载XposedBridgeApi的jar包：

http://forum.xda-developers.com/xposed/xposed-api-changelog-developer-news-t2714067

目前为XposedBridgeApi-54.jar

要设置为provided而不能是compile：

```groovy
provided files('libs/XposedBridgeApi-54.jar')
```

AndroidManifest.xml里**application下**添加：

```xml
<!-- Xposed -->
<meta-data
    android:name="xposedmodule"
    android:value="true" />
<meta-data
    android:name="xposedminversion"
    android:value="54" />
<meta-data
    android:name="xposeddescription"
    android:value="bigsing" />
```

完整参考：[6、XPOSED二、叉叉助手框架--用XPOSED实现]()

插件编写完成后，卸载重新安装，这时就能在xposed里看到该模块了，勾选启用，重启下手机。



**踩坑：**

1、明明使用了provided，结果jar包还是编译进了APK包里，导致调试多次没有效果，最后删除工程libs下的jar包，采用：

```groovy
provided 'de.robv.android.xposed:api:82'

//如果需要引入文档，方便查看的话
provided 'de.robv.android.xposed:api:82:sources'
```



**2、函数类型：如果函数类型没有写对，会出现找不到对应类型函数的错误：**

```
java.lang.NoSuchMethodError: com.umeng.update.UmengUpdateAgent#forceUpdate()#exact
```



**参考：**

官网：http://repo.xposed.info/

官方文档：Xposed Framework API http://api.xposed.info/reference/packages.html