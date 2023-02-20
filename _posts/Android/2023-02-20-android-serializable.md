---
layout:		post
category:	"android"
title:		"Android序列化的一些问题记录"

tags:		[android]
---
- Content
{:toc}
**关键词**：安卓,Android,序列化



在使用 [UnqliteAndroid](https://github.com/xiaoshanlin000/UnqliteAndroid) 库时，在安卓12系统上总是失败，动态调试跟踪发现是这块代码出现了异常：

```java
try {
	return new String(conf.asByteArray(object), ISO_8859_1);
} catch (Exception var2) {
	return null;
}
```

异常信息为：

```java
java.lang.NullPointerException: Attempt to invoke virtual method 'java.lang.Object java.lang.reflect.Field.get(java.lang.Object)' on a null object reference
	at org.nustaq.serialization.FSTClazzInfo$FSTFieldInfo.getObjectValue(FSTClazzInfo.java:873)
	at org.nustaq.serialization.FSTObjectOutput.writeObjectFields(FSTObjectOutput.java:660)
	at org.nustaq.serialization.FSTObjectOutput$3.defaultWriteObject(FSTObjectOutput.java:916)
	at java.io.File.writeObject(File.java:2138)
	at java.lang.reflect.Method.invoke(Native Method)
	at org.nustaq.serialization.FSTObjectOutput.writeObjectCompatibleRecursive(FSTObjectOutput.java:566)
	at org.nustaq.serialization.FSTObjectOutput.writeObjectCompatible(FSTObjectOutput.java:554)
	at org.nustaq.serialization.FSTObjectOutput.writeObjectWithContext(FSTObjectOutput.java:450)
	at org.nustaq.serialization.FSTObjectOutput.writeObjectInternal(FSTObjectOutput.java:327)
	at org.nustaq.serialization.FSTObjectOutput.writeObject(FSTObjectOutput.java:294)
	at org.nustaq.serialization.FSTObjectOutput.writeObject(FSTObjectOutput.java:204)
	at org.nustaq.serialization.FSTConfiguration.asByteArray(FSTConfiguration.java:1182)
	at com.xsl.app.MainActivity.onCreate(MainActivity.java:48)
	at android.app.Activity.performCreate(Activity.java:8488)
	at android.app.Activity.performCreate(Activity.java:8461)
	at android.app.Instrumentation.callActivityOnCreate(Instrumentation.java:1343)
	at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:4602)
	at android.app.ActivityThread.handleLaunchActivity(ActivityThread.java:4842)
	at android.app.servertransaction.LaunchActivityItem.execute(LaunchActivityItem.java:113)
	at android.app.servertransaction.TransactionExecutor.executeCallbacks(TransactionExecutor.java:149)
	at android.app.servertransaction.TransactionExecutor.execute(TransactionExecutor.java:103)
	at android.app.ActivityThread$H.handleMessage(ActivityThread.java:2928)
	at android.os.Handler.dispatchMessage(Handler.java:117)
	at android.os.Looper.loopOnce(Looper.java:205)
	at android.os.Looper.loop(Looper.java:293)
	at android.app.ActivityThread.main(ActivityThread.java:9596)
	at java.lang.reflect.Method.invoke(Native Method)
	at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:586)
	at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:1204)
```



经不断测试发现：无论是封装还是继承`File`在安卓12系统上`fst` 和 `kryo`都会有问题，然而在安卓10及以下系统`fst`却表现良好（`kryo`没测）。

**解决办法**：用一个`中间类作`为跳板，在外部代码再处理与`File`有关的操作。



整体测试下来发现对安卓支持的比较好的还是 `fst`，使用时在 `gradle` 里添加如下代码：

```groovy
implementation 'de.ruedigermoeller:fst:2.57'
```



# 参考

- [fast-serialization/FSTConfiguration.java at master · RuedigerMoeller/fast-serialization](https://github.com/RuedigerMoeller/fast-serialization/blob/master/src/main/java/org/nustaq/serialization/FSTConfiguration.java)
- [EsotericSoftware/kryo: Java binary serialization and cloning: fast, efficient, automatic](https://github.com/EsotericSoftware/kryo)
- [UnqliteAndroid](https://github.com/xiaoshanlin000/UnqliteAndroid) （for最新AndroidStudio版本的代码整理在了：[bigsinger/UnqliteAndroid](https://github.com/bigsinger/UnqliteAndroid)）

