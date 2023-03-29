---
layout:		post
category:	"program"
title:		"cef编译及使用-Windows上编译cef"
tags:		[]
---
- Content
{:toc}


可以从以下站点下载cef源码：

- [CEF Automated Builds](https://cef-builds.spotifycdn.com/index.html#windows32)
- [CEF Automated Builds](http://opensource.spotify.com/cefbuilds/index.html)
- [cefbuilds](https://cefbuilds.com/)
- 如果以上连接均失效，可以直接搜索关键词「**CEF Automated Builds**」找到新的站点，主要是下载的源码很便于编译和使用。

使用CEF的DUILB开源项目参考：
[karllen/cef3\-duilib\-YDDemo: cef3\+duilib开源仿有道词典](https://github.com/karllen/cef3-duilib-YDDemo)

Google Code上倒是可以下载，但是是老的版本，2012年的：
[Google Code chromiumembedded](https://code.google.com/archive/p/chromiumembedded/downloads)

但是好处是有vs2005、vs2008、vs2010版本的sln，不需要使用CMake转换。





# nmake编译（推荐）

2023年3月29日补充。受益于GPT4，有了更加简便高效的编译方法，也就是把`CMakeLists.txt`转换成`Makefile`再用`nmake`编译。详细参考：[CMake、CMakeLists.txt、GCC、Clang、LLVM、MinGW、交叉编译](https://zhupite.com/program/CMake-GCC-Clang-LLVM-MinGW-CrossCompile.html)

1. 确保已经安装了CMake。如果没有安装，可以从官方网站[下载CMake](https://cmake.org/download/)并安装。

2. 在`CMakeLists.txt`里面找到`PRINT_CEF_CONFIG()`，在其前面添加如下代码：

   ```cmake
   if(MSVC)
       if(CMAKE_BUILD_TYPE STREQUAL "Debug")
           set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} /MTd")
   		add_definitions(/D_ITERATOR_DEBUG_LEVEL=2)
           target_compile_definitions(libcef_dll_wrapper PRIVATE _HAS_ITERATOR_DEBUGGING=1)
           target_compile_definitions(libcef_dll_wrapper PRIVATE _ITERATOR_DEBUG_LEVEL=2)
           message(STATUS "Setting _ITERATOR_DEBUG_LEVEL to 2 for Debug build")
       else()
           set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} /MT")
   		add_definitions(/D_ITERATOR_DEBUG_LEVEL=0)
           target_compile_definitions(libcef_dll_wrapper PRIVATE _HAS_ITERATOR_DEBUGGING=0)
           target_compile_definitions(libcef_dll_wrapper PRIVATE _ITERATOR_DEBUG_LEVEL=0)
           message(STATUS "Setting _ITERATOR_DEBUG_LEVEL to 0 for Debug build")
       endif()
   endif()
   
   
   # Display configuration settings.
   PRINT_CEF_CONFIG()
   ```

3. 使用如下的命令转换：

   ```bash
   cmake -G "NMake Makefiles" -DCMAKE_BUILD_TYPE=Debug   -D_HAS_ITERATOR_DEBUGGING=1 -D_ITERATOR_DEBUG_LEVEL=2
   cmake -G "NMake Makefiles" -DCMAKE_BUILD_TYPE=Release
   ```

4. 使用`nmake`编译。

对于`cef`来说，只需要把编译出来的`libcef_dll_wrapper.lib`拿来使用即可，其他文件直接包里的即可。



# VisualStudio2017、2019编译

VisualStudio2017、2019编译非常快速，使用**CMake**对cef_binary_3.3578.1860.g36610bd_windows32创建build项目，创建成功后只编译**libcef_dll_wrapper**即可，其他lib和资源使用编译好的即可。



2021年3月3日，以下载 **cef_binary_88.2.9+g5c8711a+chromium-88.0.4324.182_windows32_minimal** 为例，使用**CMake-gui**转换，默认是64位版本（如果需要使用32位版本，转换的时候注意选择**Win32**），转换后的vs工程默认就是Unicode字符集MTd(MT)的，直接编译**libcef_dll_wrapper**即可，生成的lib拷走，其他的lib直接使用现成的。



# 如何使用

## 必须文件

经测试主程序目录下须携带以下文件：

```
libcef.dll
chrome_elf.dll
icudtl.dat
v8_context_snapshot.bin
cef.pak
cef_extensions.pak
cef_200_percent.pak
cef_100_percent.pak
```

如果主程序运行仍然出错，可能就是资源文件没有配齐，可以再复制一些cef的资源文件进去试试。



##  注意

- 尽量链接release版本的，要链接：libcef.lib、cef_sandbox.lib、**libcef_dll_wrapper**
- 字符串要传递的时候，需转换为Unicode，可使用std::wstring转换，注意使用CStringW转换可能会有问题。
- VisitDOM只能在render进程中使用，无法在browser进程中使用。



## cef的通信及同步调用JS

- [cef 带返回值的js调用](https://blog.csdn.net/bo_wen/article/details/78779791)
- [cef中c++和javascript数据交互的几种方法](https://www.jianshu.com/p/ee5c26c0f339)
- **CefFrame::ExecuteJavaScript**
- [chromiumembedded / cef / wiki / JavaScriptIntegration](https://bitbucket.org/chromiumembedded/cef/wiki/JavaScriptIntegration.md)



## 常见问题

- **cefinitialize崩溃**：说明exe执行路径下缺少相关文件导致初始化失败，可以把**Resources**目录下的locales文件夹、icudtl.dat、cef*.pak等文件复制过来。
- base::Bind not found：解决办法：修改为base::BindOnce，会提示找不到OnceCallback，需要在cef_bind.h头文件中添加对cef_callback.h文件的包含，这个太坑了。






# 老版本VisualStudio编译（不推荐，系较早时期研究cef的记录）
从[CEF Automated Builds](http://opensource.spotify.com/cefbuilds/index.html)下载Windows 32-bit Builds，找到Minimal Distribution或Standard Distribution（版本里面有CMakeLists.txt才能用CMake转换）下载。

vs2008能编译的较新的版本 **11/19/2016 - CEF 3.2840.1518.gffd843c / Chromium 54.0.2840.99**，往后的不能编译，可能需要vs2015.

一个可用的稳定版本：**10/12/2016 - CEF 3.2785.1485.g2b5c3a7 / Chromium 53.0.2785.116**，但是网页乱码 解析不完全。

CMake转换的时候会出错：
```
Error in configuration process, project files may be invalid
```

可以看看输出的错误信息是：
```None
CMake Error at CMakeLists.txt:202 (add_subdirectory):
  The source directory

    F:/opensource/cef_binary_3.3163.1669.ge260cbb_windows32_minimal/tests/cefclient

  does not contain a CMakeLists.txt file.


CMake Error at CMakeLists.txt:203 (add_subdirectory):
  add_subdirectory given source "tests/cefsimple" which is not an existing
  directory.


CMake Error at CMakeLists.txt:204 (add_subdirectory):
  add_subdirectory given source "tests/gtest" which is not an existing
  directory.


CMake Error at CMakeLists.txt:205 (add_subdirectory):
  add_subdirectory given source "tests/ceftests" which is not an existing
  directory.
```
就是几个测试用的工程不存在，我们不需要这些，直接打开CMakeLists.txt进行修改找到：
```
add_subdirectory(tests/cefclient)
add_subdirectory(tests/cefsimple)
add_subdirectory(tests/gtest)
add_subdirectory(tests/ceftests)
```
注释掉，改为：
```
# add_subdirectory(tests/cefclient)
# add_subdirectory(tests/cefsimple)
# add_subdirectory(tests/gtest)
# add_subdirectory(tests/ceftests)
```
保存后重新用CMake转换一次即可生成vs项目，vs2008的也完全没问题，轻便。



打开VS->项目->属性->配置属性->C/C++->常规->将警告视为错误修改为“否”，字节编码改为**多字节**。



# 参考
- [CEF Wiki](https://bitbucket.org/chromiumembedded/cef/wiki/browse/)
- [CEF Windows开发环境搭建](http://blog.csdn.net/foruok/article/details/50468642)
- [使用CMake创建CEF3的vs2015的工程文件](http://blog.csdn.net/liuyan20092009/article/details/53787655)
- [Windows上使用CEF嵌入基于chrome内核浏览器小例](http://blog.csdn.net/mfcing/article/details/43953433)
- [libcef编译使用–使用VS2015](http://blog.jianchihu.net/libcef-build-use.html)
- [菜鸟与 cef 的邂逅之旅（一）：cef 源码获取与编译](http://blog.csdn.net/u012814856/article/details/76263059)
- [菜鸟与 cef 的邂逅之旅（二）：Soui 中接入 Cef3 的实现](http://blog.csdn.net/u012814856/article/details/76578218)
- [菜鸟与 cef 的邂逅之旅（三）：Cef3 中 C\+\+ 与 JavaScript 的互相调用](http://blog.csdn.net/u012814856/article/details/76595871#comments)
- [菜鸟与 cef 的邂逅之旅（四）：Soui 离屏渲染封装 Cef3 细节分析](http://blog.csdn.net/u012814856/article/details/77120731)

  
