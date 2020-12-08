---
layout:		post
category:	"android"
title:		"AndroidStudio3.x开发调试Android-NDK的C++代码"
tags:		[android,AndroidStudio,ndk]
---



参考：[向您的项目添加 C 和 C\+\+ 代码 \| Android Studio](https://developer.android.google.cn/studio/projects/add-native-code.html?hl=zh-cn)

图片如不能正常显示，可以参考：[ AndroidStudio3.x开发调试Android-NDK的C++代码](https://blog.csdn.net/asmcvc/article/details/78690371)



## 一、新建项目

新建项目，没有发现**Include C++ Support** 选项。因为印象中是有过该选项的，找了半天没找到。

![](http://img.my.csdn.net/uploads/201712/01/1512125795_4480.png)

后来无意间拖了下窗口大小，原来是被隐藏了，真特么坑。

![](http://img.my.csdn.net/uploads/201712/01/1512125852_7403.png)



新建一个测试项目，勾选**Include C++ Support** 选项，看看工程上有哪些不同。

### 1、gradle
首先看gradle文件，android节点下添加：
```groovy
externalNativeBuild {
    cmake {
        path "CMakeLists.txt"
    }
}
```

defaultConfig节点下添加：
```groovy
externalNativeBuild {
    cmake {
        cppFlags "-std=c++14"
    }
}
```


### 2、CPP
与Java节点同级多了一个cpp的节点，对应目录为src\main\cpp，与src\main\java同级，默认只有一个native-lib.cpp文件，没有.mk文件及其他，比较简单：
```C++
#include <jni.h>
#include <string>

extern "C"
JNIEXPORT jstring

JNICALL
Java_com_bigsing_myapplication_MainActivity_stringFromJNI(
        JNIEnv *env,
        jobject /* this */) {
    std::string hello = "Hello from C++";
    return env->NewStringUTF(hello.c_str());
}
```


### 3、CMakeLists.txt
在app目录下多了一个CMakeLists.txt文件。
```makefile
# For more information about using CMake with Android Studio, read the
# documentation: https://d.android.com/studio/projects/add-native-code.html

# Sets the minimum version of CMake required to build the native library.

cmake_minimum_required(VERSION 3.4.1)

# Creates and names a library, sets it as either STATIC
# or SHARED, and provides the relative paths to its source code.
# You can define multiple libraries, and CMake builds them for you.
# Gradle automatically packages shared libraries with your APK.

add_library( # Sets the name of the library.
             native-lib

             # Sets the library as a shared library.
             SHARED

             # Provides a relative path to your source file(s).

             src/main/cpp/native-lib.cpp )


# Searches for a specified prebuilt library and stores the path as a
# variable. Because CMake includes system libraries in the search path by
# default, you only need to specify the name of the public NDK library
# you want to add. CMake verifies that the library exists before
# completing its build.

find_library( # Sets the name of the path variable.
              log-lib

              # Specifies the name of the NDK library that
              # you want CMake to locate.
              log )

# Specifies libraries CMake should link to your target library. You
# can link multiple libraries, such as libraries you define in this
# build script, prebuilt third-party libraries, or system libraries.

target_link_libraries( # Specifies the target library.
                       native-lib

                       # Links the target library to the log library
                       # included in the NDK.
                       ${log-lib} )
```
其中native-lib为最终生成的SO的名称（libnative-lib.so），默认CPU为armeabi-v7a


默认的工程属性不用配置，debugger默认为auto会自动适配，直接在cpp里下断点，调试方式运行App，会自动断下，变量数值均能在调试状态下看到。

![](http://img.my.csdn.net/uploads/201712/01/1512125630_1078.png)

试用了下AndroidStudio对NDK的调试支持的还不错，于是打算把过去的项目也支持起来，方法请看下节。



## 二、已有项目

### 1、安装C++调试器LLDB
由于之前一直没有使用过AndroidStudio调试过native的代码，网上了解到AndroidStudio调试NDK是需要一个LLDB的插件，默认是没有的，所以先手动安装一下。

这里有个另类的方法：“**Edit Configurations**”打开程序配置，在**debugger**里选择**Native**(默认为auto)，然后运行App，因为工程之前一直是只有Java代码的，所以这里选择了Native，AndroidStudio会提示并没有安装C++的调试器，根据提示安装即可。

![](http://img.my.csdn.net/uploads/201712/01/1512125743_2359.png)

可以看出，安装的调试器是LLDB。

![](http://img.my.csdn.net/uploads/201712/01/1512125604_5796.png)

### 2、Link C++ Project with Gradle
在老项目里面添加NDK的支持，可以右键项目选择菜单：**Link C++ Project with Gradle**

![](http://img.my.csdn.net/uploads/201712/01/1512125781_6322.png)

编译方式有两种：CMake和ndk-build，其中ndk-build是传统方式，AndroidStudio默认推荐CMake方式，也许这是以后的主流方式，所以我们选择默认的**CMake**.

![](http://img.my.csdn.net/uploads/201712/01/1512125756_5982.png)

然后是指定CMakeLists.txt文件的路径，这里可以复制新建项目的CMakeLists.txt文件到现有项目的app目录下，把它放到和proguard-rules.pro相同的文件夹下即可。然后把这个CMakeLists.txt文件的全路径输入进去，点OK。

这个时候会发现gradle文件自动添加了：
```groovy
externalNativeBuild {
    cmake {
        path "CMakeLists.txt"
    }
}
```
但是并未指定C++的版本，可以参考新建项目的内容手动添加：
```groovy
externalNativeBuild {
    cmake {
        cppFlags "-std=c++14"
    }
}
```

### 3、整理C++源码的文件组织形式
新建一个cpp目录：src\main\cpp，与src\main\java同级，把C++源码文件移动至此目录下，并有序组织好。

### 4、修改CMakeLists.txt
由于是复制的demo工程的CMakeLists.txt文件，比较简单，不能够满足现有工程，需要修改一下。这里说一下常用的几个功能：
- 设置其他后缀文件（例如.S汇编文件）为可编译源文件：
```makefile
set_property(SOURCE src/main/cpp/art/art_quick_dexposed_invoke_handler.S PROPERTY LANGUAGE C)
```

- 设置多个不定数量的源文件（也即使用*星号通配符的方式）：
```makefile
file(GLOB native_srcs "src/main/cpp/*.cpp" "src/main/cpp/dalvik/*.cpp" "src/main/cpp/art/*.cpp" "src/main/cpp/art/*.S")
add_library( # Sets the name of the library.
             native-lib

             # Sets the library as a shared library.
             SHARED

             # Provides a relative path to your source file(s).
             ${native_srcs}
            )

```

- 链接三方SO库文件（例如我需要使用三方的libsubstrate.so库做测试）：
```makefile
file(GLOB libs src/main/cpp/3rd/libsubstrate.so src/main/cpp/3rd/libsubstrate-dvm.so)
target_link_libraries( # Specifies the target library.
                       native-lib

                       # Links the target library to the log library
                       # included in the NDK.
                       ${libs}
                       ${log-lib} )
```
### 5、恢复debugger为默认的auto
“**Edit Configurations**”打开程序配置，在**debugger**里选择**auto**，因为之前修改为了Native。这样，无论是Java代码还是C++代码均可以调试了。



## 三、CMakeLists.txt配置及学习资源

这个需要持续学习了，毕竟新接触的，有一些参考文件：
- [CMakeList配置之编译多个\.cpp文件客](http://blog.csdn.net/u011028777/article/details/53424927)

- [CMake 学习（一）：使用链接第三方库](http://www.jianshu.com/p/33126d6baa3c)

- [向您的项目添加 C 和 C\+\+ 代码 \| Android Studio](https://developer.android.google.cn/studio/projects/add-native-code.html?hl=zh-cn) 



## 四、总结
- 能支持对C++代码的动态调试，无疑是非常强大的功能，关键现在AndroidStudio对C++代码在编辑器也支持的很好，所以总体是建议迁移过来的。

- 不足就是编译速度太慢了，VisualStudio编译下来秒间就能完成了，AndroidStudio下要十几秒甚至更长。在调试的时候启动LLDB也很慢，有时一直卡在**Starting LLDB server**

- 建议VS和本方法结合使用，需要调试的时候就用AndroidStudio调试，如果仅仅是编译C++代码则可以使用VS，VS的方法参见：[使用VisualStudio高效开发调试AndroidNDK](./using-visualstudio-develop-android-ndk.html)