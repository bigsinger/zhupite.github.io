---
layout:		post
category:	"llvm"
title:		"Windows下CMake生成LLVM的VisualStudio2017项目并编译"
tags:		[llvm]
---
1. 下载以下三个源码包：
- LLVM
- Clang
- compiler-rt

下载页面：[LLVM Download Page](http://releases.llvm.org/download.html)

2. 将llvm source code解压。
3. 将cfe（clang source code）解压，文件夹重命名为clang，然后放置到llvm/tools目录下。
4. 将compiler-rt source code解压，文件夹重命名为compiler-rt，然后放置到llvm/projects目录下。
5. 在llvm目录下创建文件夹build，并且在llvm/build目录下创建install文件夹。
6. 使用CMake生成vs工程。

点Configure，选择**Visual Studio 15 2017 Win64**

Optional toolset to use (argument to -T)
```
host=x64
```
如果不出现这个选择对话框，请选择菜单File - Delete Cache，然后重新配置。

![](https://img-blog.csdn.net/20170926205552382)

经过几分钟后，会有飘红出现，不管它，再点一次，不再飘红。然后再点Generate，成功生成sln。

VisualStudio2017打开，我靠，尼玛 **501** 个项目，够喝一壶的了。第一次编译很长，耗时5个多小时，机器环境：i5-4590 3.3GHz CPU 8G内存Win764位。

### 参考
- !!Windows编译LLVM vs2013 cmake-gui http://www.360doc.com/content/18/0116/16/9200790_722421475.shtml
- [WINDOWS\+CMAKE\+VS2017编译OLLVM并整合到VS2017 NDK \- CSDN博客](https://blog.csdn.net/rrrfff/article/details/78105905)
- [Getting Started with the LLVM System using Microsoft Visual Studio — LLVM 7 documentation](https://llvm.org/docs/GettingStartedVS.html)
- 