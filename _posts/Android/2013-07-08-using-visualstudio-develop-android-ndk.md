---
layout:		post
category:	"android"
title:		"使用VisualStudio高效开发调试Android NDK"
tags:		[android,ndk]
---



该方法挺早的，只不过发出来的较晚，时间已经不记得了，那个时候还没有AndroidStudio，主流开发还是用eclipse（参考：[Windows下编译使用Android NDK，调用SO文件](https://blog.csdn.net/asmcvc/article/details/9311541)），因为讨厌eclipse，当时使用IDEA配置的Java层开发，NDK层开发用VisualStudio配置的。



图片如果显示不全可以参考：[使用VisualStudio高效开发调试AndroidNDK](https://blog.csdn.net/asmcvc/article/details/78646826)



# 场景

- 场景一：Java层代码与SO的开发分为不同的程序猿负责，开发SO的时候基本上APK的其他文件不会修改。
- 场景二：主要代码就是C++，Java层代码也只是个DEMO，Java代码基本没啥修改。

常见的做法是：
1. 使用编辑器或者编译器编写C++代码。
2. 使用NDK命令编译SO。
3. 重新打包APK，或者直接替换APK中的SO文件再重签名。
4. 安装到手机。
5. 运行。
6. 崩溃。
7. 排错。

如此往复，有限的时间和精力在无限的编译和调试之中全部都耗完。

当然会问：为啥不用AndroidStudio自带的NDK开发，试过，不好用。这里推荐一种方法，搭建很简单，使用起来很方便又节省时间，分享给大家。


# 步骤
以vs2008为例（高版本亦可，不知道vs2017是不是对NDK开发支持的很好了，一直没敢尝试）

## 新建VS解决方案，添加源码
新建一个空的解决方案，然后把自己编写的c++的头文件和源文件都添加进来。

![image](https://img-my.csdn.net/uploads/201709/08/1504865667_9420.png)



![image](https://img-my.csdn.net/uploads/201709/08/1504865674_9949.png)


## 设置VS工程属性
项目属性“常规”-“配置类型”修改为“生成文件”：
![image](https://img-my.csdn.net/uploads/201709/08/1504865658_3250.png)


## 添加头文件包含，启动自动代码完成
这里主要是把NDK开发的include目录包含进来，
打开vs“工具”-“选项”-“项目和解决方案”-“VC++目录”，设置包含文件目录新增“D:\ndk\platforms\android-19\arch-x86\usr\include”：

![](https://img-my.csdn.net/uploads/201709/08/1504865780_8509.png)

手动把D:\ndk\platforms\android-19\arch-x86\usr\include目录下的jni.h拖入VS中打开，此时VAX开始自动索引，这时候JNI开发相关的关键字便可以正常识别了。使用自动提示写起来就比较快速，而且也不容易出错。

![](https://img-my.csdn.net/uploads/201709/08/1504866255_1396.png)

## 配置自动化脚本
![image](http://img.my.csdn.net/uploads/201709/08/1504865751_8662.png)

其中build.bat脚本：
```bat
set dir=%~dp0
set modulename=test
set modulefile=..\libs\armeabi\lib%modulename%.so

cd /d %dir%

call ./ndk.bat

if exist %modulefile% ( 
	copy %modulefile% ..\main\jniLibs\armeabi\lib%modulename%.so 
	call ./debug.bat com.bigsing.hooktest
)
```
编译成功后会根据JNI在AndroidStudio项目工程的位置把SO文件复制到对应的libs目录下。最重要的步骤就是后面调用debug.bat的脚本地方，后面再说。

其中clean.bat脚本：
```bat
set dir=%~dp0
set ndk=d:\Android\ndk\ndk-build.cmd

cd /d %dir%

if exist %ndk% ( %ndk% clean)else ( ndk-build clean)
```
这个是清理用的。


其中debug.bat脚本需要一个参数，就是你当前测试APK的包名，注意我上面调用的方式是：==call ./debug.bat com.bigsing.hooktest==，需要你测试的APP已经在手机中安装过，脚本会删除已经存在的SO文件，然后导入新编译好的SO。
```bat
set dir=%~dp0
set package=%1%
set modulename=test
set modulefile=..\libs\armeabi\lib%modulename%.so
set destso=/data/data/%package%/lib/lib%modulename%.so

cd /d %dir%

echo off
if exist %modulefile% ( 
	echo 1.delete old file: %destso%
	adb shell "su -c ' rm %destso%'"
	
	echo 2.push so to /data/local/tmp
	adb push %dir%%modulefile% /data/local/tmp/lib%modulename%.so
	
	echo 3.copy so to /data/data/%package%/lib
	adb shell "su -c ' cp /data/local/tmp/lib%modulename%.so /data/data/%package%/lib'"
	
	echo 4.chmod 755 so
	adb shell "su -c ' chmod 755 /data/data/%package%/lib/lib%modulename%.so'"
	echo success
	
	echo u can rm other data here...
	adb shell "su -c ' rm -r /data/data/%package%/databases'"
	adb shell "su -c ' rm -r /data/data/%package%/shared_prefs'"
	adb shell "su -c ' rm -r /data/data/%package%/cache'"
	
)else ( 
	echo error! file not found: %dir%%modulefile%
)
echo on
```

## 编译
在VS里直接按F7会执行编译操作，便会调用【生成命令行】build.bat，如果代码编写得没有问题，则会产生如下类似日志：
```log
1>------ 已启动生成: 项目: HookTest, 配置: Debug Win32 ------
1>正在执行生成文件项目操作
1>[armeabi] Compile++ thumb: test <= test.cpp
1>[armeabi] SharedLibrary  : libtest.so
1>[armeabi] Install        : libtest.so => libs/armeabi/libtest.so
1>已复制         1 个文件。
1>1.delete old file: /data/data/com.bigsing.hooktest/lib/libtest.so
1>2.push so to /data/local/tmp
1>[ 78%] /data/local/tmp/libtest.so
1>[100%] /data/local/tmp/libtest.so
1>f:\svnlocal\hooktest\app\src\jni\..\libs\armeabi\libtest.so: 1 file pushed. 3.3 MB/s (83248 bytes in 0.024s)
1>3.copy so to /data/data/com.bigsing.hooktest/lib
1>4.chmod 755 so
1>success
1>生成日志保存在“file://f:\svnlocal\hooktest\app\src\jni\src\Debug\BuildLog.htm”
1>HookTest - 0 个错误，0 个警告
========== 生成: 成功 1 个，失败 0 个，最新 0 个，跳过 0 个 ==========
```
如果编译出错，会产生如下类似日志：
```
1>------ 已启动生成: 项目: HookTest, 配置: Debug Win32 ------
1>正在执行生成文件项目操作
1>[armeabi] Compile++ thumb: test <= test.cpp
1>f:/svnlocal/hooktest/app/src//jni/src/test.cpp: In function '_jstring* Java_com_bigsing_hooktest_NativeHandler_getString(JNIEnv*, jclass, jobject, jint, jstring)':
1>f:/svnlocal/hooktest/app/src//jni/src/test.cpp:35:1: error: expected unqualified-id before '}' token
1> }
1> ^
1>f:/svnlocal/hooktest/app/src//jni/src/test.cpp:35:1: error: expected ';' before '}' token
1>f:/svnlocal/hooktest/app/src//jni/src/test.cpp: In function '_jstring* getInfo(JNIEnv*, jclass, jobject, jint, jstring)':
1>f:/svnlocal/hooktest/app/src//jni/src/test.cpp:73:2: error: expected unqualified-id before '}' token
1>  }else if((int)paramInt == 2){
1>  ^
1>f:/svnlocal/hooktest/app/src//jni/src/test.cpp:73:2: error: expected ';' before '}' token
1>make.exe: *** [f:/svnlocal/hooktest/app/src//obj/local/armeabi/objs/test/src/test.o] Error 1
1>生成日志保存在“file://f:\svnlocal\hooktest\app\src\jni\src\Debug\BuildLog.htm”
1>HookTest - 4 个错误，0 个警告
========== 生成: 成功 0 个，失败 1 个，最新 0 个，跳过 0 个 ==========
```
其实很容易找到出错的源码文件及对应的行号。

# 节省了哪些时间？
## 1、蹩脚编辑器开发C++浪费的时间
借助VS和VAX强大的索引和自动完成代码来节省开发时间，保证代码的正确性。

## 2、重新编译APK的时间
整个过程不需要重新编译AndroidStudio工程。

## 3、重新签名的时间
整个过程不需要签名APK包。

## 4、安装APK的时间
只需安装一次APK包，后面调试测试的时候均无需安装APK包。


# 原理与总结
只要APK安装一次之后，它的SO路径就固定了，就在/data/data/包名/lib/下，因此我们可以在编译成功后，把原SO文件删除，然后把新编译的SO文件push到lib目录下，最后重新运行一下APP就会加载新的SO了。

如果担心数据缓存会对测试造成影响，则可以在脚本中编写删除缓存文件的命令（上面的脚本会删除cache、database、shared_prefs目录），如果有需要还可以编写自动杀死已经在运行的APP并自动打开的命令。


优化你的流程，专注你的开发！