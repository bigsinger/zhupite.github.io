---
layout:		post
category:	"android"
title:		"Android常见错误UnsatisfiedLinkError的解决方案"
tags:		[android]
---
* content
{:toc}
想必很多开发者和我们一样，遇到过许多UnsatisfiedLinkError的困难，着实令人头疼，现在总结一下，希望能帮助更多的人。



# 一、常见原因

- lib库不同目录下的SO文件参差不齐。
- lib库目录下的SO不符合相应的CPU架构。
- 64-bit下使用System.load加载SO：”lib_xyz.so” is 32-bit instead of 64-bit（正确方法是使用System.loadLibrary）。
- java代码混淆导致。
- 注册方式不对，或函数已经被其他类注册。
- empty/missing DT_HASH in “libxxxx.so” (built with –hash-style=gnu?)

# 二、常见错误现象

### 1、Android NDK 运行错误：java.lang.UnsatisfiedLinkError: Couldn't load XXX from loader dalvik.system.PathClassLoader xxx findLibrary returned null
```java
18:45:52.320  10741-10741/com.example.hellojni E/AndroidRuntime﹕ FATAL EXCEPTION: main
Process: com.example.hellojni, PID: 10741
java.lang.UnsatisfiedLinkError: Couldn't load hello-jni from loader dalvik.system.PathClassLoader[DexPathList[[zip file "/data/app/com.example.hellojni-1.apk"],nativeLibraryDirectories=[/data/app-lib/com.example.hellojni-1, /vendor/lib, /system/lib]]]: findLibrary returned null
        at java.lang.Runtime.loadLibrary(Runtime.java:358)
        at java.lang.System.loadLibrary(System.java:526)
        at com.example.hellojni.HelloJni.<clinit>(HelloJni.java:64)
        at java.lang.Class.newInstanceImpl(Native Method)
        at java.lang.Class.newInstance(Class.java:1208)
        at android.app.Instrumentation.newActivity(Instrumentation.java:1061)
        at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:2107)
        at android.app.ActivityThread.handleLaunchActivity(ActivityThread.java:2239)
        at android.app.ActivityThread.access$800(ActivityThread.java:141)
        at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1202)
        at android.os.Handler.dispatchMessage(Handler.java:102)
        at android.os.Looper.loop(Looper.java:136)
        at android.app.ActivityThread.main(ActivityThread.java:5047)
        at java.lang.reflect.Method.invokeNative(Native Method)
        at java.lang.reflect.Method.invoke(Method.java:515)
        at com.android.internal.os.ZygoteInit$MethodAndArgsCaller.run(ZygoteInit.java:793)
        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:609)
        at dalvik.system.NativeStart.main(Native Method)
```

### 2、java.lang.UnsatisfiedLinkError: Native method not found
注册方式不对，或函数已经被其他类注册。


### 3、Android NDK UnsatisfiedLinkError: dlopen failed: empty/missing DT_HASH in "libxxxx.so" (built with --hash-style=gnu?)
```java
java.lang.UnsatisfiedLinkError: dlopen failed: empty/missing DT_HASH in "cpplibrary.so" (built with --hash-style=gnu?)
   at java.lang.Runtime.loadLibrary(Runtime.java:365)
   at java.lang.System.loadLibrary(System.java:526)
```
参考：[c\+\+ \- Android NDK UnsatisfiedLinkError: "dlopen failed: empty/missing DT\_HASH" \- Stack Overflow](http://stackoverflow.com/questions/28638809/android-ndk-unsatisfiedlinkerror-dlopen-failed-empty-missing-dt-hash)

### 4、java.lang.UnsatisfiedLinkError: dlopen failed: "lib_xyz.so" is 32-bit instead of 64-bit



# 三、常见出错原因及解决方案

### 1、java代码混淆导致
由于Native层需要注册到java层函数，如果java层对应的类名和函数名在打包的时候被混淆了，肯定是会出现异常的。此类问题比较定位解决，但是也比较容易忘记。解决办法就是在proguard混淆时keep掉对应的类和函数。

### 2、lib库不同目录下的SO文件参差不齐
发现很多APK包打出来，lib目录下同时带着armeabi、armeabi-v7a，但是armeabi目录下可能有3个SO，而armeabi-v7a下只有2个SO，更有甚者还有armeabi、armeabi-v7a、x86、x86_64、arm64-v8a全部都有，但是不同目录下的SO个数都不一样。

```
/jniLibs/
    |
    +---armeabi/
    |     |
    |     +---libFirstLibrary.so
    |     +---libSecondLibrary.so
    |
    +---armeabi-v7a/
          |
          +---libFirstLibrary.so
```

这样打出来的APK包，在安装的时候会让Android系统“很为难”，它搞不清到底该选择哪个SO来安装。有时可能会造成某个SO的漏安装，那么在APP运行的时候加载SO时就会出现异常了。

**解决方案：**

1、只保留lib下的一个目录足够（armeabi或armeabi-v7a保留一个），其他目录全部不用配置。

2、如果想继续多配置几个CPU架构的lib目录，那就全部配置齐全。实际上有时候很难做到，特别是当需要使用三方库的SO的时候，往往并不那么容易找的齐全。由于全部打齐全会对APK的体积有增加，所以还是推荐第一种方案。

### 3、lib库目录下的SO不符合相应的CPU架构
同上面的问题差不多，有些APK包打出来，同时配置了armeabi和arm64-v8，但是却在arm64-v8放置了某个或多个armeabi版本的SO，那么在APP运行的时候就会报类似的错误："lib_xyz.so" is 32-bit instead of 64-bit

还有遇到一种情况，笔者测试机的CPU_ABI为armeabi-v7a，CPU_ABI2为armeabi，安装运行一个测试用的APK（只含有一个armeabi的so：libtest.so，且编译确实为armeabi版本），运行崩溃，显示找不到libtest.so的UnsatisfiedLinkError错误。解决：只编译armeabi-v7a版本的libtest.so，安装运行，OK。按理说这种是可以运行的，很奇怪，不知道是不是跟AndroidStudio3.0在debug下有关系。

### 4、64-bit下使用System.load加载SO
参考：[Use 32\-bit jni libraries on 64\-bit android \- Stack Overflow](http://stackoverflow.com/questions/27186243/use-32-bit-jni-libraries-on-64-bit-android)

```
Found an explanation: 64-bit Android can use 32-bit native libraries as a fallback, 
only if System.loadlLibrary() can't find anything better in the default search path. 
You get an UnsatisfiedLinkError if you force the system to load the 32-bit library using System.load() with the full library path. 
So the first workaround is using System.loadLibrary() instead of System.load().
```
64-bit处理器可以向下兼容32-bit指令集，即可以运行32-bit动态库，所以APK包仍然可以只保留lib下的一个目录足够（armeabi或armeabi-v7a保留一个），其他目录全部不用配置。

有一种组合错误，就是APK的lib库打的参差不齐，又在64-bit下使用System.load加载SO。
有一个APP在MX5（android5.0.1）下出现了以下异常：

```java
Caused by: java.lang.UnsatisfiedLinkError: dlopen failed: "/data/data/com.xxx.pris/app_lib/libPDEEngine.so" is 32-bit instead of 64-bit
```
首先可以大致知道这是一个64位的机器，查看机器信息，确实是arm64-v8a。首先就是看APK的lib目录打的对不对，果然
armeabi下有12个SO，而armeabi-v7a下却只有11个SO。但是他们使用了Relinker来尝试安全加载SO来降低UnsatisfiedLinkError的异常。

```java
public static void loadLibrary(final Context context, final String library) {
if (context == null) {
    throw new IllegalArgumentException("Given context is null");
}

if (TextUtils.isEmpty(library)) {
    throw new IllegalArgumentException("Given library is either null or empty");
}

try {
    System.loadLibrary(library);
    return;

} catch (final UnsatisfiedLinkError ignored) {
    // :-(
    CrashHandler.leaveBreadcrumb("ReLinker: System.loadLibrary failed");
}

final File workaroundFile = getWorkaroundLibFile(context, library);
if (!workaroundFile.exists()) {
    unpackLibrary(context, library);
}

System.load(workaroundFile.getAbsolutePath());
}
```
可以看出，如果因为SO打的参差不齐导致了APK在安装的时候SO就已经有遗漏的没有被安装进lib的加载目录。那么System.loadLibrary的时候便会有异常，然后代码尝试解压并释放所需要的SO文件，但是这个时候只能通过System.load来加载了，又由于当前是arm64-v8a的机器，所以就出现了[Use 32\-bit jni libraries on 64\-bit android \- Stack Overflow](http://stackoverflow.com/questions/27186243/use-32-bit-jni-libraries-on-64-bit-android)的问题。


# 四、总结
如果问题出现时可以尝试通过以上的几种方法来排查，如果有其他没有罗列的情形可以继续收集整理。
如果想要规避以上的问题，**最好的办法就是打好打全相应CPU架构的SO文件。**


# 五、参考
- [动态链接库加载原理及HotFix方案介绍 \- DEV CLUB](http://dev.qq.com/topic/57bec216d81f2415515d3e9c)
- [安装APK时SO库的选择策略\-\-网易实践者社区](http://ks.netease.com/blog?id=2178)
- [The Perils of Loading Native Libraries on Android – Keepsafe Engineering – Medium](https://medium.com/keepsafe-engineering/the-perils-of-loading-native-libraries-on-android-befa49dce2db)
- 
