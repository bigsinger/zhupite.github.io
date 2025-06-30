---
layout:        post
category:    "android"
title:        "Windows下Android NDK开发的几种方法总结"
tags:        [android,ndk]
---



# AndroidStudio开发+NDK发布

2025-6-30新增。

增加该方法的背景是：

1. 使用AndroidStudio直接开发和发布的so文件体积非常庞大，无论使用何种优化方案体积仍是很大，远远没有NDK编译的so文件体积小。

2. 使用VisualStudio又会因为头文件的包含出现一些代码和语法上的问题，影响编码效率。

因为以上两个问题，再加上现在AndroidStudio也比较强大，对C/CPP也能比较好的支持，所以综合下来选择使用AndroidStudio与NDK组合的方式进行开发和发布，亲身实践下来效果最好。下面详解步骤。

## NDK编译配置

1. 假设我们的工程名叫`Demo`，则在`Demo`的根目录下创建一个名为`jni`的目录，注意必须是这个名称，否则后面NDK编译的时候会出现莫名其妙的错误。

2. 然后在这个`jni`目录下创建`Android.mk`和`Application.mk`，以及项目需要的C/CPP头文件和源码文件。
   
   例如：`Android.mk`
   
   ```makefile
   LOCAL_PATH := $(call my-dir)
   
   include $(CLEAR_VARS)
   
   LOCAL_MODULE    := demo
   LOCAL_SRC_FILES := demo.cpp
   
   LOCAL_LDLIBS 	:= -llog  -ldl
   LOCAL_CFLAGS    := -D_STLP_USE_NEWALLOC
   LOCAL_CFLAGS    += -fvisibility=hidden -ffunction-sections -fdata-sections
   LOCAL_CFLAGS    += -fPIC
   
   LOCAL_LDFLAGS	:= -Wl,--gc-sections
   LOCAL_LDFLAGS	+= -Wl,--version-script=$(LOCAL_PATH)/ld_script
   
   include $(BUILD_SHARED_LIBRARY)
   ```

  `Application.mk`：      

```makefile
APP_OPTIM := release              # 使用 Release 优化（-O2）
NDK_DEBUG := 0                    # 禁用调试信息（否则会编译 Debug）
APP_STRIP_MODE := all             # 编译后自动 strip 掉符号

APP_ABI := all
APP_STL := stlport_static
APP_PLATFORM  := android-14
```

3. 配置NDK编译环境。
   
   这里为了方便更改NDK的版本，写了一个配置文件：`ndk-config.txt`：

```
ndkpath=D:\Android\Sdk\ndk\
ndkversion=16.1.4479499
```

当需要修改NDK的路径和版本时，只需要修改本文件即可。



以及读取该配置文件的批处理：`ndk-config.bat`：

```batch
@echo off
REM 本脚本提供变量给外部脚本使用，须禁用setlocal
REM setlocal EnableDelayedExpansion

echo -------------------------------
echo --------NDK CONFIG ENTER-------
echo -------------------------------

REM 定义配置文件路径
set "config_file=ndk-config.txt"

REM 读取配置文件
for /f "tokens=1,2 delims==" %%a in (%config_file%) do (
    set "%%a=%%b"
)

REM 输出变量值以验证
echo NDK Path: %ndkpath%
echo NDK Version: %ndkversion%

REM 将变量传递给调用者
set "ndkpath=%ndkpath%"
set "ndkversion=%ndkversion%"
set "ndk=%ndkpath%%ndkversion%\ndk-build.cmd"
echo ndk = %ndk%

echo -------------------------------
echo --------NDK CONFIG ENTER-------
echo -------------------------------
REM endlocal
```

然后是NDK编译的批处理和清理批处理文件，分别如下。

`build.bat`

```batch
@echo off
setlocal EnableDelayedExpansion

REM 调用 ndk-config.bat 获取ndk变量
call ndk-config.bat

echo -------------------------------
echo --------NDK BUILD ENTER--------
echo -------------------------------
set dir=%~dp0
cd /d %dir%

echo Using NDK = %ndk%
if exist %ndk% ( call %ndk% )else ( call ndk-build )

echo -------------------------------
echo --------NDK BUILD EXIT--------
echo -------------------------------
endlocal
```

`buildto.bat`

```batch
@echo off
setlocal EnableDelayedExpansion

REM 当前批处理所在目录
set "dir=%~dp0"

REM 切换到当前目录
cd /d "%dir%"

REM 调用当前目录下的 ndk.bat（如果有）
call %dir%build.bat


echo -------------------------------
echo 正在复制 JNI 编译的所有 ABI 库文件...
echo -------------------------------

REM 定义拷贝源目录和目标目录
set "from=..\libs"
set "to=..\publish"

set /a n=0

REM 遍历源目录下的所有子文件夹
for /d %%i in ("%from%\*") do (
    REM 获取子文件夹名称
    set "folder=%%~nxi"
    REM 定义源文件路径和目标文件夹路径
    set "src=%%i\*.so"
    set "dst=!to!\!folder!\"

    REM 检查目标文件夹是否存在，如果不存在则创建
    if not exist "!dst!" mkdir "!dst!"

    REM 遍历子文件夹中的所有 .so 文件
    for %%f in (!src!) do (
        REM 检查文件是否存在
        if exist "%%f" (
            REM 复制文件
            copy /Y "%%f" "!dst!" >nul
            echo 成功复制: %%f
            set /a n+=1
        ) else (
            echo 错误: 找不到文件 %%f
        )
    )
)

echo -------------------------------
echo 总共成功复制 !n! 个文件。
echo -------------------------------

endlocal
```



`clean.bat`

```batch
@echo off
setlocal EnableDelayedExpansion

REM 调用 ndk-config.bat 获取ndk变量
call ndk-config.bat

echo -------------------------------
echo --------NDK CLEAN ENTER--------
echo -------------------------------

set dir=%~dp0
cd /d %dir%

echo Using NDK = %ndk%
if exist %ndk% (call %ndk% clean) else (call ndk-build clean)

echo -------------------------------
echo --------NDK CLEAN EXIT---------
echo -------------------------------
endlocal
```

并将上述的文件都放在与`mk`相同目录下。



## AndroidStudio环境配置

1. 使用AndroidStudio导入一个极简的项目，例如Demo；

2. 然后把上述NDK编译配置的jni目录整个目录移动到Demo的根目录下，无须放置在`src/main/cpp`目录下，虽说可以但没必要，目录越浅越好嘛。

3. 右键Demo项目，添加C++支持，然后选择导入已有的`Android.mk`文件，选择前一步的jni目录下的`Android.mk`文件即可，然后等待同步。

4. 工程同步完成后，开始对工程做精简：
   
   1. 删除`AndroidManifest.xml`、`proguard-rules.pro`、`res`目录、`src`目录；
   
   2. 基本上Demo项目目录下只有`build.gradle`文件和`jni`目录。

5. 配置`build.gradle`文件，如下是一个最简的内容：
   
   ```groovy
   apply plugin: 'com.android.library'
   
   android {
       compileSdk 36
       namespace 'com.dummy'
   
       defaultConfig {
           minSdk 21
           externalNativeBuild {
               ndkBuild {
                   cppFlags ''
               }
           }
       }
   
       ndkVersion '16.1.4479499'
       externalNativeBuild {
           ndkBuild {
               path file('jni/Android.mk')
           }
       }
   }
   ```

如果想要增加编译任务，例如编译debug还是release版本，可以注册任务：

```groovy
// 只构建 Debug 版 so
tasks.register("buildSoDebugOnly") {
    group = "native"
    description = "Build only Debug native .so libraries"
    dependsOn "externalNativeBuildDebug"
}

// 只构建 Release 版 so
tasks.register("buildSoReleaseOnly") {
    group = "native"
    description = "Build only Release native .so libraries"
    dependsOn "externalNativeBuildRelease"
}

// 同时构建 Debug 和 Release
tasks.register("buildSoAll") {
    group = "native"
    description = "Build both Debug and Release native .so libraries"
    dependsOn "externalNativeBuildDebug", "externalNativeBuildRelease"
}
```





## 方案总结

1. 开发阶段，直接在AndroidStudio里编写代码，不会出现类型找不到的情况，也不用像在VisualStudio里需配置包含目录了。借助于AndroidStudio提供的SDK Manager，可以方便地安装和切换不同的版本。

2. 在AndroidStudio里还可以编译代码，只不过编译出的so文件体积大了点。

3. 如果有必要还可以使用AndroidStudio的App项目类型，进行jni代码的调试，如果需要的话就把精简工程那一环节略过即可。

4. 发布阶段，直接双击`build.bat`即可，通过NDK编译的so文件体积非常小。

5. 综合来看，就是开发阶段不影响效率，发布阶段保证文件体积。





# 以前的方案



**准备工作：**

下载NDK： http://developer.android.com/tools/sdk/ndk/index.html，建议使用最新版的。

**一、手动编译**

参考《 [windows下编译使用NDK并调用SO文件](./how-to-develop-android-ndk.html)》

**二、vs-android**

网址： https://code.google.com/p/vs-android/

```
vs-android is intended to provide a collection of scripts and utilities to support integrated development of Android NDK C/C++ software under Microsoft Visual Studio. vs-android supports only Visual Studio 2010, 2012 and 2013. Earlier versions lack the MSBuild integration with the C/C++ compilation systems.
```

vs-android仅适用vs2010以上版本，而且具体使用发现仍有许多问题，编译NDK时出现大量错误。

**三、结合方法一和方法二，配合使用vs2005和ndk-build.cmd**

参考：[使用VisualStudio高效开发调试Android NDK](./using-visualstudio-develop-android-ndk.html)

我们知道Visual Studio是目前最强大的编译器，尤其针对C/C++的开发时更是无可匹敌的，优势就在于开发C/C++代码的高效，因为通常使用androidstudio或者eclipse开发C/C++效率堪忧，即使使用了相应的插件。具体操作方法如下：

1、在android项目的jni目录下新建.sln解决方案，新建项目时选择空项目，然后把jni目录下的源码文件全部添加到新建项目中去，如图：

![img](http://note.youdao.com/yws/public/resource/c2130592b76336a7a42be477d8c540e8/F05CF8DBCD1142F2ABA26EB88CD2DA4E) ![img](http://note.youdao.com/yws/public/resource/c2130592b76336a7a42be477d8c540e8/4D134A02B2614E4CBC6803A56516D34D)

打开项目属性-C/C++-常规-附加包含目录，添加NDK的include目录，由于针对不同平台的include目录有很多，可以只选择一个包含即可，这里只是为了在vs中编写代码时能找到相应的声明而已，也就是说我们这里仅仅使用了vs强大的编写C/C++代码的功能，这里我添加的是：D:\ndk\platforms\android-19\arch-x86\usr\include

![img](http://note.youdao.com/yws/public/resource/c2130592b76336a7a42be477d8c540e8/8B3D85714B5F449FBB9B5E2A08F6F1C3)

打开项目属性-生成事件-预生成事件-命令行，添加批处理文件的调用：build.bat。

![img](http://note.youdao.com/yws/public/resource/c2130592b76336a7a42be477d8c540e8/F5526B4E7E5744008D24C8540409EE32)

build.bat内容如下：

```
set dir=%~dp0 set ndk=d:\ndk\ndk-build.cmd cd /d %dir% if exist %ndk% ( %ndk% )else ( ndk-build ) pause
```

其实很简单的命令，仅仅是进入jni目录调用ndk-build执行编译操作。

当然jni目录下的Android.mk文件还是要手动配置的，如：

```
LOCAL_PATH := $(call my-dir) include $(CLEAR_VARS) LOCAL_LDLIBS += -llog LOCAL_MODULE := Hellojni LOCAL_SRC_FILES := main.cpp include $(BUILD_SHARED_LIBRARY)
```

然后直接在vs2005里面执行编译命令，输出：

```
1>------ 已启动生成: 项目: jni, 配置: Debug Win32 ------ 1>正在执行预生成事件... 1>[armeabi] Compile++ thumb: Hellojni <= main.cpp 1>f:/eclipse_workspace/Hellojni//jni/main.cpp: In function 'void msg(JNIEnv*, jobject, jstring)': 1>f:/eclipse_workspace/Hellojni//jni/main.cpp:56:2: error: 'pszstr1' was not declared in this scope 1>make.exe: *** [f:/eclipse_workspace/Hellojni//obj/local/armeabi/objs/Hellojni/main.o] Error 11>生成日志保存在“file://f:\eclipse_workspace\Hellojni\jni\Debug\BuildLog.htm” 1>jni - 1 个错误，0个警告 ========== 生成: 0 已成功, 1 已失败, 0 最新, 0 已跳过 ==========
```

根据编译输出可以知道main.cpp文件的第56行使用了未定义的变量，这里不能双击定位到错误代码行，需要手动定位到相应代码行，解决掉问题后重新编译：

```
1>------ 已启动生成: 项目: jni, 配置: Debug Win32 ------ 1>正在执行预生成事件... 1>[armeabi] Compile++ thumb: Hellojni <= main.cpp 1>[armeabi] SharedLibrary : libHellojni.so 1>[armeabi] Install : libHellojni.so => libs/armeabi/libHellojni.so 1>正在编译... 1>main.cpp 1>d:\ndk\platforms\android-19\arch-x86\usr\include\sys\cdefs.h(252) : fatal error C1189: #error : "No function renaming possible"1>生成日志保存在“file://f:\eclipse_workspace\Hellojni\jni\Debug\BuildLog.htm” 1>jni - 1 个错误，0 个警告 ========== 生成: 0 已成功,1 已失败, 0 最新, 0 已跳过 ==========
```

当出现这种编译结果时，实际上hellojni的so文件已经编译成功，后面的错误不用理会。libHellojni.so生成在相对jni目录的..\ libs\armeabi下。

**完美解决方案：**

项目属性“常规”-“配置类型”修改为“生成文件”：

![img](http://note.youdao.com/yws/public/resource/c2130592b76336a7a42be477d8c540e8/B72CB6D0C2894CEA82FD249C53B987C7)

会出现一个NMake的选项，直接填“生成命令行”为“../build.bat”：

![img](http://note.youdao.com/yws/public/resource/c2130592b76336a7a42be477d8c540e8/7259ACE264564BF7B354AF50B71EDFAB)

由于工程属性修改为“生成文件”，属性中无法再设置NDK的头文件了（代码提示要用），所以考虑把头文件包含目录设置为全局的，

打开vs“工具”-“选项”-“项目和解决方案”-“VC++目录”，设置包含文件目录新增“D:\ndk\platforms\android-19\arch-x86\usr\include”：

![img](http://note.youdao.com/yws/public/resource/c2130592b76336a7a42be477d8c540e8/62C3C472A34A4497B8F70A4413690E89)

注意：这种头文件的包含是全局的，使用VAX的"Go"打不开头文件，需要右键“打开文档<jni.h>”的方式，一旦打开头文件后VAX会自动缓存，之后所有的类型便都可以代码自动提示和完成了。

再次编译：

```
1>------ 已启动生成: 项目: anep, 配置: Debug Win32 ------ 1>正在执行生成文件项目操作 1>Android NDK: WARNING:f:/client/android/anep/project//jni/Android.mk:anep: LOCAL_LDLIBS is always ignored for static libraries 1>[armeabi] Install : libtest.so => libs/armeabi/libtest.so 1>已复制 1 个文件。 1>生成日志保存在“file://f:\client\android\anep\project\jni\src\Debug\BuildLog.htm” 1>anep - 0 个错误，0 个警告 ========== 生成: 1 已成功, 0 已失败, 0 最新, 0 已跳过 ==========
```

成功，没有讨厌的错误了。再说一句，vs真强大。

**四、eclipse**

参考《 [Android 学习笔记——利用JNI技术在Android中调用、调试C++代码](http://blog.csdn.net/asmcvc/article/details/10006215)》、《 [Eclipse NDK 配置](http://www.cnblogs.com/chenjiajin/archive/2012/04/12/2444188.html)》

只不过我们不要使用javah生成头文件，全部通过注册的方式导出函数。

也可以为eclipse添加C/C++开发插件：CDT。

评价：eclipse虽说笨重臃肿，确是相当的稳定，而且配置也相当简单。但是在编辑C/C++上无优势，android的java层开发远远不如AndroidStudio来得高效。

**五、AndroidStudio**

参考：《 [使用AndroidStudio编译NDK的方法及错误解决方案](./using-androidstudio-develop-android-ndk.html)》

评价：慢，不是一般的慢，在编辑C/C++没优势不说编译速度又是超级慢，弃之。AndroidStudio也许只在android的java层开发才是无敌的。

**六、Android++Native development and debugging extension for Visual Studio**

http://android-plus-plus.com/

Available soon for Windows……