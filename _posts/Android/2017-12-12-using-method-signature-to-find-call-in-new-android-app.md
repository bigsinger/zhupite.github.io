---
layout:     post
title:      使用函数签名特征定位新版本App里的关键call函数
category: 	android
tags:		[android]
---


## 需求来源
如果以前有定位过老版本的函数，但是版本重新发布一般会由于proguard的混淆而变化，也有可能大版本升级后函数的声明也会发生变化。 但是如果知道一个大概的特征，也可以快速定位，不用再去反编译APK包逆向分析一遍。

## 案例
例如微信的骰子游戏，网上能搜到相关的xposed插件：[veryyoung/RandomGame](https://github.com/veryyoung/RandomGame/blob/335f627d0192dd572b9e52d7bc3dea6414c6d1ed/app/src/main/java/me/veryyoung/wechat/randomgame/Main.java)，大概了解到函数的返回值类型为int，有int类型参数。

## 根据函数签名特征设置有过滤条件的HOOK
那么就可以设置这样一个过滤条件：
```
if (strcmp(szRetTypeClassName,"int")==0 && strstr(sParams.c_str(), "int"))
```

## 分析日志
连续扔几次骰子：

![](http://img.my.csdn.net/uploads/201712/12/1513051649_8452.png)

拦截输出：

```None
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int a(java.lang.Integer, int); sig: (Ljava/lang/Integer;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::a ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 19
[onCall] --> com.tencent.mm.sdk.platformtools.bh int a(java.lang.Integer, int); sig: (Ljava/lang/Integer;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::a ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int a(java.lang.Integer, int); sig: (Ljava/lang/Integer;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::a ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 300
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 300
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 300
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 300
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 300
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 300
[onCall] --> com.tencent.mm.modelsfs.FileOp int b(java.lang.String, [B, int); sig: (Ljava/lang/String;[BI)I
[onCall] <-- com.tencent.mm.modelsfs.FileOp::b ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 300
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 300
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 300
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 300
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 300
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int a(java.lang.Integer, int); sig: (Ljava/lang/Integer;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::a ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 1600000
[onCall] --> com.tencent.mm.sdk.platformtools.t int a(android.content.Intent, java.lang.String, int); sig: (Landroid/content/Intent;Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.t::a ret int 1
[onCall] --> com.tencent.mm.sdk.platformtools.t int a(android.content.Intent, java.lang.String, int); sig: (Landroid/content/Intent;Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.t::a ret int 1
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 50
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 50
[onCall] --> com.tencent.mm.sdk.platformtools.bh int ee(int, int); sig: (II)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::ee ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 1
[onCall] --> com.tencent.mm.sdk.platformtools.t int a(android.content.Intent, java.lang.String, int); sig: (Landroid/content/Intent;Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.t::a ret int 1
[onCall] --> com.tencent.mm.booter.NotifyReceiver$NotifyService int onStartCommand(android.content.Intent, int, int); sig: (Landroid/content/Intent;II)I
[onCall] --> com.tencent.mm.a.n int c([B, int); sig: ([BI)I
[onCall] <-- com.tencent.mm.a.n::c ret int 1
[onCall] --> com.tencent.mm.a.n int c([B, int); sig: ([BI)I
[onCall] <-- com.tencent.mm.a.n::c ret int 533
[onCall] <-- com.tencent.mm.booter.NotifyReceiver$NotifyService::onStartCommand ret int 2
[onCall] --> com.tencent.mm.sdk.platformtools.bh int m(java.lang.Object, int); sig: (Ljava/lang/Object;I)I
[onCall] error 5
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::m ret NULL
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.u int AH(int); sig: (I)I
[onCall] error 5
[onCall] <-- com.tencent.mm.sdk.platformtools.u::AH ret NULL
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int m(java.lang.Object, int); sig: (Ljava/lang/Object;I)I
[onCall] error 5
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::m ret NULL
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 1
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 1
[onCall] --> com.tencent.mm.booter.NotifyReceiver$NotifyService int onStartCommand(android.content.Intent, int, int); sig: (Landroid/content/Intent;II)I
[onCall] --> com.tencent.mm.a.n int c([B, int); sig: ([BI)I
[onCall] <-- com.tencent.mm.a.n::c ret int 1
[onCall] --> com.tencent.mm.a.n int c([B, int); sig: ([BI)I
[onCall] <-- com.tencent.mm.a.n::c ret int 373
[onCall] <-- com.tencent.mm.booter.NotifyReceiver$NotifyService::onStartCommand ret int 2
[onCall] --> com.tencent.mm.sdk.platformtools.bh int m(java.lang.Object, int); sig: (Ljava/lang/Object;I)I
[onCall] error 5
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::m ret NULL
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.u int AH(int); sig: (I)I
[onCall] error 5
[onCall] <-- com.tencent.mm.sdk.platformtools.u::AH ret NULL
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int m(java.lang.Object, int); sig: (Ljava/lang/Object;I)I
[onCall] error 5
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::m ret NULL
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 1
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 1
[onCall] --> com.tencent.mm.sdk.platformtools.t int a(android.content.Intent, java.lang.String, int); sig: (Landroid/content/Intent;Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.t::a ret int 1
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 50
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 50
[onCall] --> com.tencent.mm.sdk.platformtools.bh int ee(int, int); sig: (II)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::ee ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 1
[onCall] --> com.tencent.mm.sdk.platformtools.t int a(android.content.Intent, java.lang.String, int); sig: (Landroid/content/Intent;Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.t::a ret int 1
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 50
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 50
[onCall] --> com.tencent.mm.sdk.platformtools.bh int ee(int, int); sig: (II)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::ee ret int 5
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 1
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 50
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 50
[onCall] --> com.tencent.mm.sdk.platformtools.bh int ee(int, int); sig: (II)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::ee ret int 4
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 1
[onCall] --> com.tencent.mm.sdk.platformtools.t int a(android.content.Intent, java.lang.String, int); sig: (Landroid/content/Intent;Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.t::a ret int 1
[onCall] --> com.tencent.mm.booter.NotifyReceiver$NotifyService int onStartCommand(android.content.Intent, int, int); sig: (Landroid/content/Intent;II)I
[onCall] --> com.tencent.mm.a.n int c([B, int); sig: ([BI)I
[onCall] <-- com.tencent.mm.a.n::c ret int 1
[onCall] --> com.tencent.mm.a.n int c([B, int); sig: ([BI)I
[onCall] <-- com.tencent.mm.a.n::c ret int 405
[onCall] <-- com.tencent.mm.booter.NotifyReceiver$NotifyService::onStartCommand ret int 2
[onCall] --> com.tencent.mm.sdk.platformtools.bh int m(java.lang.Object, int); sig: (Ljava/lang/Object;I)I
[onCall] error 5
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::m ret NULL
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.u int AH(int); sig: (I)I
[onCall] error 5
[onCall] <-- com.tencent.mm.sdk.platformtools.u::AH ret NULL
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 0
[onCall] --> com.tencent.mm.sdk.platformtools.bh int m(java.lang.Object, int); sig: (Ljava/lang/Object;I)I
[onCall] error 5
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::m ret NULL
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 1
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 1
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 50
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 50
[onCall] --> com.tencent.mm.sdk.platformtools.bh int ee(int, int); sig: (II)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::ee ret int 5
[onCall] --> com.tencent.mm.sdk.platformtools.bh int getInt(java.lang.String, int); sig: (Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.bh::getInt ret int 1
[onCall] --> com.tencent.mm.sdk.platformtools.t int a(android.content.Intent, java.lang.String, int); sig: (Landroid/content/Intent;Ljava/lang/String;I)I
[onCall] <-- com.tencent.mm.sdk.platformtools.t::a ret int 1
```

很容易在日志里面看到0, 5, 4, 5这几个数字，那么很容易知道
```
com.tencent.mm.sdk.platformtools.bh int ee(int, int); sig: (II)I
```
就是我们要找的函数了。
