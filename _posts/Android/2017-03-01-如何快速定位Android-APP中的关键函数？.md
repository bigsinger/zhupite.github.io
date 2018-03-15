---
layout:     post
title:      如何快速定位Android APP中的关键函数？
category: Android
description: 
---


## 需求来源
在逆向分析中，肯定是越快地定位到目标函数越好，那么有没有这样的一种工具可以快速地辅助分析人员定位到目标函数呢？

最早的一个想法是这样的：
- 通过某种机制让APP输出函数调用时候的日志记录。
- APP在运行的时候可能会输出很多条记录，而目标函数的调用也会被淹没在日志的大海里，如何定位出来？
- 打开APP，但是不执行目标功能，得到日志记录A。
- 执行目标功能，这时候得到日志记录B。
- 如果把日志A记录设置为白名单，执行过滤，B过滤A，得到日志A，那么F可能会有目标函数的调用记录。
- 如果F中得不到目标函数，说明在得到记录A时，目标函数可能已经执行过了（线程的方式）。
- 如果过滤后的F日志仍然是一个海量数据，那么重复执行目标功能N次，分别得到B2,B3……Bn,并过滤A日志，分别得到过滤后的日志F2,F3……Fn，然后再过滤出被刚好执行了N次的函数。那么这个结果就很可能会比较小了。

## 可能的方法
- APP插桩法：对APP进行反编译，把每个函数调用都加入LOG函数，回编译出新包，安装运行后这样每个函数调用时就会有日志输出。参考：[带你开发一款给Apk中自动注入代码工具icodetools\(完善篇\)](http://www.52pojie.cn/thread-562423-1-1.html)、[Android中利用icodetools工具快速定位App破解中关键点方法](http://www.52pojie.cn/thread-563915-1-1.html)

- 安卓内核MOD或HOOK法：修改安卓系统内核，不修改APP本身，在安卓调用函数开始前后打印LOG。
- 

## 插桩法
- 需要修改APP，针对有加壳保护的无法操作，二次打包有可能会失败，如果APP有签名校验，文件校验等也会失效。
- 整个过程比较耗时，需要进行反编译--遍历插桩--回编译--签名。
- 每个APP都需要修改一遍。
- 无法生成调用树。

## 内核MOD或HOOK法
- 难度在于需要分析到调用函数代码处，并加以修改。
- 源码的编译比较耗时，工程较为庞大和复杂。
- 优点是：黑盒处理，无需每次修改APP。
- 一次MOD，终身使用。
- 可以生成调用树。dvmCallMethod。

## DEMO示例
- DEMO运行后界面上有一个Button，Click事件会依次调用F1,F2,其中F1会调用F3，F3会调用F4，F2会调用F5。DEMO运行后就一直有一个线程或定时器在定时地调用F6函数，F6又会依次调用F1,F2。请用上述方法快速定位出Button的Click函数。如果混淆后呢？如果调用的是native函数呢？能不能捕获到？
- 针对微信，不做逆向分析，请用上述方法快速定位出掷骰子的关键函数。

## 参考
- [带你开发一款给Apk中自动注入代码工具icodetools\(完善篇\)](http://www.52pojie.cn/thread-562423-1-1.html)
- [Android中利用icodetools工具快速定位App破解中关键点方法](http://www.52pojie.cn/thread-563915-1-1.html)
- [TraceDroid\.pdf](chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai/index.html)
- [Tracedroid \- Dynamic Android app analysis](http://tracedroid.few.vu.nl/)
- [android/4\.0\.3/dalvik/vm/mterp/out/InterpC\-portable\.cpp](http://code.metager.de/source/xref/android/4.0.3/dalvik/vm/mterp/out/InterpC-portable.cpp)
- [Dalvik虚拟机的运行过程分析 \- 老罗的Android之旅 \- 博客频道 \- CSDN\.NET](http://blog.csdn.net/luoshengyang/article/details/8914953)
- [Dalvik虚拟机进程和线程的创建过程分析 \- 老罗的Android之旅 \- 博客频道 \- CSDN\.NET](http://blog.csdn.net/Luoshengyang/article/details/8923484)
- 参考xposed代码XposedBridge_hookMethodNative函数
- 参考Android源码/dalvik/vm/interp/Stack.cpp函数[dvmCallMethodV](http://code.metager.de/source/xref/android/4.0.3/dalvik/vm/interp/Stack.cpp)，dvmIsNativeMethod判断函数是否是Native函数。
- [NDroid\.pdf](chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai/index.html)
- [Dynamic Analysis of Android Malware](http://tracedroid.few.vu.nl/thesis.pdf)
- [Android热补丁技术—dexposed原理简析\(阿里Hao\)](http://blog.csdn.net/yueqian_scut/article/details/50939034)

```
替换方法的关键在于native层怎么影响内存里的java代码，我们知道java代码里将一个方法声明为native方法时,对此函数的调用就会到native世界里找，AndFix原理就是将一个不是native的方法修改成native方法，然后在native层进行替换，通过dvmCallMethod_fnPtr函数指针来调用libdvm.so中的dvmCallMethod()来加载替换后的新方法，达到替换方法的目的。Jni反射调用java方法时要用到一个jmethodID指针,这个指针在Dalvik里其实就是Method类,通过修改这个类的一些属性就可以实现在运行时将一个方法修改成native方法。
```

```
Profiler control flow
Whenever the original VM’s bytecode interpreter enters of leaves a function, the
methods TRACE METHOD ENTER, TRACE METHOD EXIT and TRACE METHOD UNROLL
(for unrolling exceptions) are called. These functions check for a global boolean
methodTrace.traceEnabled to be true, and if it is, call dvmMethodTraceAdd()
which writes trace data to an output file
```

