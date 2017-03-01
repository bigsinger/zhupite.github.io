---
layout:     post
title:      使用AndroidStudio编译NDK的方法及错误解决方案
subtitle:   
date:     2017-03-01
author:   BIGSINGER
catalog: true
tags: 
- Android
---


**2015年12月14日更新：**

> 这些内容均是在AndroidStudio出现之前整理总结的，那时候eclipse的ADT bundle盛行，只有intelij IDEA带的插件开发Android应用程序，但是个人不喜欢用eclipse，所以尽管带插件的intelij IDEA有很多蹩脚和不足之处，依然觉得比eclipse好过百倍（个人喜好，不喜勿喷），还是坚持用了下来，现在的AndroidStudio版本比之前强百倍，但是NDK这块的支持依然不敢苟同，毕竟是超越不了VS，所以也在那个时候独创了VS编译NDK的方法（其实也是奇技淫巧啦~），编程效率也是极高的，下面的篇幅如果看不懂可以不用再看，直接点传送门“[Windows下Android NDK开发的几种方法总结](http://blog.csdn.net/asmcvc/article/details/24457557)”参考第三个方法“三、结合方法一和方法二，配合使用vs2005和ndk-build.cmd”即可。

**以下是原文**

## 参考资料：
- [【android ndk】macos环境下Android Studio中利用gradle编译jni模块及配置](http://demo.netfoucs.com/ashqal/article/details/21869151)
- [Android Studio, gradle and NDK integration – ph0b's](https://ph0b.com/android-studio-gradle-and-ndk-integration/)
- [Gradle Plugin User Guide \- Android Studio Project Site](http://tools.android.com/tech-docs/new-build-system/user-guide)
- [New Build System \- Android Studio Project Site](http://tools.android.com/tech-docs/new-build-system)

## 实践证明：
- 0.4.2只有在gradle1.10版本下创建只包含AndroidLibrary模块的工程时才能正常编译，gradle1.9版本不可以。
- 0.4.6使用gradle1.10可以。
- 0.5.0无论是gradle1.10还是gradle1.11版本都可以生成so库。
- 0.5.5的不能编译NDK，无论是gradle1.10还是gradle1.11版本都不能生成so库，屙血尿脓。

## 下载AndroidStudio：
AndroidStudio的历史版本下载列表：[Android Studio Canary Channel \- Android Studio Project Site](http://tools.android.com/download/studio/canary)

## 下载NDK：
下载链接：[Android NDK \| Android Developers](https://developer.android.com/ndk/index.html)，**注意NDK一定要r9+版本的**，否则编译时会出现如下错误：
```
Execution failed for task ':hellojni:compileDebugNdk'.
> com.android.ide.common.internal.LoggedErrorException: Failed to run command:
    D:\ndk\ndk-build.cmd NDK_PROJECT_PATH=null APP_BUILD_SCRIPT=F:\androidstudio\test\hellojni\build\ndk\debug\Android.mk APP_PLATFORM=android-19 NDK_OUT=F:\androidstudio\test\hellojni\build\ndk\debug\obj NDK_LIBS_OUT=F:\androidstudio\test\hellojni\build\ndk\debug\lib APP_ABI=armeabi,armeabi-v7a
Error Code:
    2
Output:
    D:/ndk/build/core/setup-app.mk:63: *** Android NDK: Aborting    .  Stop.
```

## 下载gradle：

- [gradle-1.9-all.zip](http://download.csdn.net/detail/xxhongdev/6834859)
- [gradle-1.10-all.zip](http://download.csdn.net/detail/xinghuacheng/7026815)
- [gradle-1.11-all.zip](http://download.csdn.net/detail/d1387968/7097249)


通过[Android Studio Canary Channel \- Android Studio Project Site](http://tools.android.com/download/studio/canary)下载的历史版本通常是绿色的压缩包，可以直接解压缩使用，但是不包含SDK，需要额外下载SDK，由于之前下载了ADT(版本：adt20131030)，所以后面直接使用ADT目录下的SDK。通过[下载 Android Studio 和 SDK 工具 \| Android Studio](https://developer.android.com/studio/index.html)首页下载的AndroidStudio为安装版本，包含了SDK，可以下载后直接安装，首次使用创建项目会比较慢，可以参考[“AndroidStudio创建项目时一直处于building“project name”gradle project info的解决办法”](http://blog.csdn.net/asmcvc/article/details/24313425)来解决。

## 创建项目：
运行AndroidStudio后，创建新项目，新项目会有一个默认的Module，这里项目名称为JNIDemo，Module为app。
![](http://img.blog.csdn.net/20160331135105379)

然后通过向导完成项目的创建。

AndroidStudio还是非常慢的，长时间处于这种状态：

![](http://img.blog.csdn.net/20160331135110973)

经过漫长的等待后终于完成项目的创建，然后在这个项目下创建一个Module，New Module->Android Library：
![](http://img.blog.csdn.net/20160331135116364)

不勾选“Create activity”然后点击“Finish”完成创建，此时项目结构如图：

![](http://img.blog.csdn.net/20160331135120301)

app和hellojni均为JNIDemo下的两个Module，这里把hellojni作为生成so库的NDK开发层，把app作为调用so库的APK引用开发层。

在hellojni模块的src/main下创建jni目录，并在jni目录下新建文件main.cpp，代码如下：
```
#include <stdio.h>
#include <stdlib.h>
#include <jni.h>
#include <assert.h>
#include <sys/types.h>
#include <android/log.h>

#define LOG_TAG "Hellojni"
#define LOGE(...)  __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)
#define LOGI(...)  __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)


//注册native api的类#define JNIREG_CLASS "com/example/test9/app/MainActivity"

extern "C" {
    JNIEXPORT void msg(JNIEnv *env, jobject  clazz, jstring str);
};


//jstring to char* char* jstringTostring(JNIEnv* env, jstring jstr) 
{ 
    char* rtn = NULL; 
    jclass clsstring = env->FindClass("java/lang/String"); 
    jstring strencode = env->NewStringUTF("utf-8"); 
    jmethodID mid = env->GetMethodID(clsstring, "getBytes", "(Ljava/lang/String;)[B"); 
    jbyteArray barr= (jbyteArray)env->CallObjectMethod(jstr, mid, strencode); 
    jsize alen = env->GetArrayLength(barr); 
    jbyte* ba = env->GetByteArrayElements(barr, JNI_FALSE); 
    if (alen > 0) 
    { 
        rtn = (char*)malloc(alen + 1); 
        memcpy(rtn, ba, alen); 
        rtn[alen] = 0; 
    } 
    env->ReleaseByteArrayElements(barr, ba, 0); 
    return rtn; 
}

JNIEXPORT void msg(JNIEnv *env, jobject  clazz, jstring str)
{
    char *pszstr = NULL; 

    pszstr = jstringTostring(env, str);
    LOGI("%s", pszstr);
    free(pszstr);
}

/**
* Table of methods associated with a single class.
*/static JNINativeMethod gMethods[] = {
    { "msg", "(Ljava/lang/String;)V", (void*)msg},
};

/*
* Register native methods for all classes we know about.
*/static int registerNativeMethods(JNIEnv* env)
{
    int nError = 0;
    jclass clazz = NULL;

    clazz = env->FindClass(JNIREG_CLASS);
    if (clazz == NULL) {
        LOGE("clazz is null");
        return JNI_FALSE;
    }

    nError = env->RegisterNatives(clazz, gMethods, sizeof(gMethods) / sizeof(gMethods[0]) );
    if ( nError < 0 ) {
        LOGE("RegisterNatives error: %d num: %d",nError, sizeof(gMethods) / sizeof(gMethods[0]) );
        return JNI_FALSE;
    }

    return JNI_TRUE;
}

/*
* Set some test stuff up.
*
* Returns the JNI version on success, -1 on failure.
*/
JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved)
{
    JNIEnv* env = NULL;
    jint result = -1;

    if(vm->GetEnv((void**) &env,JNI_VERSION_1_6) != JNI_OK){
        return -1;
    }
    assert(env != NULL);

    if (!registerNativeMethods(env)) {
        LOGE("registerNativeMethods failed");
        return -1;
    }

    /* success -- return valid version number */
    result = JNI_VERSION_1_6;

    return result;
}
```
这里只导出一个msg函数打印传递进来的字符串，仅作测试。再在jni目录下新建一个empty.cpp文件，内容为空，这个是为了解决NDK的bug所作的，以防编译出错。

打开local.properties，设置正确的SDK路径和NDK路径：
```
sdk.dir=D\:/adt20131030/sdk
ndk.dir=D\:/ndk
```
打开项目gradle/wrapper目录下的gradle-wrapper.properties文件，修改：
```
#Wed Apr 10 15:27:10 PDT 2013
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
distributionUrl=http\://services.gradle.org/distributions/gradle-1.9-all.zip
```
为：
```
#Wed Apr 10 15:27:10 PDT 2013
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
distributionUrl=http\://services.gradle.org/distributions/gradle-1.10-all.zip
```
并打开项目根目录下的build.gradle文件，修改：
```
// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    repositories {
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:0.7.+'
    }
}

allprojects {
    repositories {
        mavenCentral()
    }
}
```
为（指定使用gradle1.10则修改为0.9.+，指定使用gradle1.11则修改为0.9.2）：
```
// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    repositories {
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:0.9.+'
    }
}

allprojects {
    repositories {
        mavenCentral()
    }
}
```
**解释：**
参考[New Build System \- Android Studio Project Site](http://tools.android.com/tech-docs/new-build-system)知道
```
0.7.0
Requires Gradle 1.9
Requires Studio 0.4.0
```

```
0.9.0
Compatible with Gradle 1.10 and 1.11
Using Gradle 1.11 requires Android Studio 0.5.0
```
如果配置的是0.7.+则默认使用gradle1.9，如果设置为0.9.+则默认使用gradle1.10。

另外还需要注意的是gradle1.9下没有buildTypes标签，需要将debug、release标签直接放在android标签内，在gradle1.10下debug、release需要放在buildTypes标签内，buildTypes在android内。这里hellojni配置的build.gradle文件内容如下：
```
assert gradle.gradleVersion >= "1.10"

apply plugin: 'android-library'

android {
    compileSdkVersion 19
    buildToolsVersion "19.0.3"

    defaultConfig {
        minSdkVersion 8
        targetSdkVersion 16
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            runProguard false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.txt'
            ndk {
                moduleName "hellojni"
                abiFilters "armeabi", "armeabi-v7a", "x86"
            }
        }

        debug {
            ndk {
                moduleName "hellojni"
                //stl "stlport_shared"
                ldLibs "log", "z", "m"
                //cFlags "-Wall -Wextra -I " + projectDir + "/src/main/jni/include"
                abiFilters "armeabi", "armeabi-v7a", "x86"
            }
        }
    }

    productFlavors {
        x86 {
            versionCode Integer.parseInt("6" + defaultConfig.versionCode)
            ndk {
                abiFilter "x86"
            }
        }
        mips {
            versionCode Integer.parseInt("4" + defaultConfig.versionCode)
            ndk {
                abiFilter "mips"
            }
        }
        armv7 {
            versionCode Integer.parseInt("2" + defaultConfig.versionCode)
            ndk {
                abiFilter "armeabi-v7a"
            }
        }
        arm {
            versionCode Integer.parseInt("1" + defaultConfig.versionCode)
            ndk {
                abiFilters "armeabi", "armeabi-v7a"
            }
        }
        fat
    }
}

dependencies {
    compile 'com.android.support:appcompat-v7:19.+'
    compile fileTree(dir: 'libs', include: ['*.jar'])
}
```
然后选择hellojni项目右键“Make Module hellojni”，等待一段时间后会在项目下生成build-ndk目录，目录下会有一些不同版本的so库文件生成，如图：
![](http://img.blog.csdn.net/20160331135123739)

注意这里的Android.mk文件每次编译都会重新由工具自动生成，而非手动编辑的，我觉得这一点设计就比较差劲。例如如果想要使用log输出函数__android_log_print，需要添加“LOCAL_LDLIBS :=  -llog”，则在build.gradle文件中添加如下的配置：
```
debug {
    ndk {
        ldLibs "log"
    }
}
```
由gradle根据配置再去生成Android.mk文件，最后再调用ndk进行编译。


右键工程选择Open Module Settings，选择Modules-app，打开Dependencies选项卡点击“+”号，选择Module dependency，在打开的对话框中选择hellojni。
![](http://img.blog.csdn.net/20160331135126676)

但是测试发现设置依赖没有效果，如果直接编译app，hellojni并没有编译，仍需要手动编译hellojni。


## 调用native函数：

APP项目中，在MainActivity类中声明native函数：
```
public native void msg(String str);
```
并添加静态代码加载hellojni库：
```
static {
    System.loadLibrary("hellojni");
}
```
在MainActivity::onCreate中调用native函数打印一句log：
```
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    msg("MainActivity onCreate");
}
```

还需要将hellojni生成的so库文件打包进APK，仍需要配置build.gradle文件，添加：
```
task copyNativeLibs(type: Copy) {
    from fileTree(dir: '../hellojni/build/ndk/arm/debug/lib', include: 'armeabi/*.so') into 'build/lib'
}
tasks.withType(Compile) {
    compileTask -> compileTask.dependsOn copyNativeLibs
}
clean.dependsOn 'cleanCopyNativeLibs'
tasks.withType(com.android.build.gradle.tasks.PackageApplication) { pkgTask ->
    pkgTask.jniFolders = [new File(buildDir, 'lib')]
}
```
参考：[Android Studio添加so库](http://blog.csdn.net/caesardadi/article/details/18264399)

其中copyNativeLibs任务是从相对app的项目路径'../hellojni/build/ndk/arm/debug/lib'下复制所有armeabi子目录的so文件到本项目build目录下的lib目录中，执行效果：

![](http://img.blog.csdn.net/20160331135130192)

这样最后打包生成的apk包才会包含有hellojni的so库文件。


## 测试：

编译运行app，apk安装完毕运行时输出log信息：


后面列出了可能出现的gradle错误以及解决方案，以供参考。

## 错误及解决方案
### 错误：
```
Execution failed for task ':hellojni:compileDebugNdk'.
> com.android.ide.common.internal.LoggedErrorException: Failed to run command:
    D:\ndk\ndk-build.cmd NDK_PROJECT_PATH=null APP_BUILD_SCRIPT=F:\androidstudio\test\hellojni\build\ndk\debug\Android.mk APP_PLATFORM=android-19 NDK_OUT=F:\androidstudio\test\hellojni\build\ndk\debug\obj NDK_LIBS_OUT=F:\androidstudio\test\hellojni\build\ndk\debug\lib APP_ABI=armeabi,armeabi-v7a
Error Code:
    2
Output:
    make.exe: *** No rule to make target `F:\androidstudio\test\hellojni\build\ndk\debug\obj/local/armeabi/objs/jnimain/F_\androidstudio\test\hellojni\src\main\jni', needed by `F:\androidstudio\test\hellojni\build\ndk\debug\obj/local/armeabi/objs/jnimain/F_\androidstudio\test\hellojni\src\main\jni\hellojni.o'.  Stop.
```
### 解决方案：
这是NDK在Windows下一个bug，当只编译一个文件时出现，解决方法就是再添加一个空的文件即可。
原文见：[Android Studio, gradle and NDK integration – ph0b's](https://ph0b.com/android-studio-gradle-and-ndk-integration/)
> This may come from a current NDK bug on Windows, when there is only one source file to compile. You only need to add one empty source to make it work again.


### 错误：
```
Could not determine the dependencies of task ':hellojni:compileArmDebugJava'.
> failed to find Build Tools revision 19.0.3
```

### 解决方案：
这个Build Tools是指“Android SDK Build-tools”，打开SDK Manager勾选相应版本（例如这里是19.0.3）安装即可。
![](http://img.blog.csdn.net/20160331135134333)


### 错误：
```
FAILURE: Build failed with an exception.

* What went wrong:
Task 'assembleArmDebug' not found in project ':hellojni'. Some candidates are: 'assembleDebug'.

* Try:
Run gradle tasks to get a list of available tasks. Run with --stacktrace option to get the stack trace. Run with --info or --debug option to get more log output.
```

### 解决方案：
在android{ }中添加：
```
    productFlavors{
        arm {
        }
    }
```
若有类似错误可以参考加入相应的标签：
```
    productFlavors {
        x86 {
            versionCode Integer.parseInt("6" + defaultConfig.versionCode)
            ndk {
                abiFilter "x86"
            }
        }
        mips {
            versionCode Integer.parseInt("4" + defaultConfig.versionCode)
            ndk {
                abiFilter "mips"
            }
        }
        armv7 {
            versionCode Integer.parseInt("2" + defaultConfig.versionCode)
            ndk {
                abiFilter "armeabi-v7a"
            }
        }
        arm {
            versionCode Integer.parseInt("1" + defaultConfig.versionCode)
            ndk {
                abiFilter "armeabi"
                //abiFilters "armeabi", "armeabi-v7a"
            }
        }
        fat
    }
```

### 错误：
```
Execution failed for task ':hellojni:compileDebugNdk'.
> java.io.IOException: Cannot run program "D:\ndk\ndk-build": CreateProcess error=193, %1 ??????Ч?? Win32 ??ó
```

### 解决方案：
在使用gradle1.9版本时遇到，使用gradle1.10版本来解决。


### 错误：
```
A problem occurred evaluating project ':app'.
> Could not create plugin of type 'AppPlugin'.
```

### 解决方案：
```
Don’t use latest Gradle (version 1.10), downgrade to 1.9。
```
参考：[android studio – czech rage](http://blog.vyvazil.eu/tag/android-studio/)

但是如果我们使用gradle1.9版本的话又会出现错误：
```
Execution failed for task ':hellojni:compileDebugNdk'.
> java.io.IOException: Cannot run program "D:\ndk\ndk-build": CreateProcess error=193, %1 ??????Ч?? Win32 ??ó
```
无论使用哪个版本都有问题，后来仔细查看了下'AppPlugin'这个错误是出现在‘app’模块上的而非‘hellojni’模块上，于是考虑新建工程项目并且只在该工程下建立一个库模块，不再创建app模块，如图：
![](http://img.blog.csdn.net/20160331135134333)

这里不勾选**Create custom launcher icon**和**Create activity**，直接finish完成，其他配置参考前述，最后编译后可以生成so库文件：
![](http://img.blog.csdn.net/20160331135137286)

### 错误：
这个错误忘记记录了囧

### 解决方案：
```
File-Settings-Gradle-Gradle VM options：-Xmx512m
```
![](http://img.blog.csdn.net/20160331135140208)
