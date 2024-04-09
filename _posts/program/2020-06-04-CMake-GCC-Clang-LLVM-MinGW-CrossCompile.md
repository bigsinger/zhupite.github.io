---
layout:		post
category:	"program"
title:		"Makefile、CMake、CMakeLists.txt、GCC、Clang、LLVM、MinGW、交叉编译"
tags:		[c++]
---
- Content
{:toc}
# CMake

​	CMake是一个跨平台的安装（编译）工具，可以用简单的语句来描述所有平台的安装(编译过程)。他能够输出各种各样的makefile或者project文件，能测试编译器所支持的C++特性,类似UNIX下的automake。 **CMake 的组态档取名为 CMakeLists.txt**。Cmake 并不直接建构出最终的软件，而是产生标准的建构档（如 Unix 的 Makefile 或 Windows Visual C++ 的 projects/workspaces），然后再依一般的建构方式使用。这使得熟悉某个集成开发环境（IDE）的开发者可以用标准的方式建构他的软件，这种可以使用各平台的原生建构系统的能力是 CMake 和 SCons 等其他类似系统的区别之处。



# CMakeLists.txt

一种建构软件专用的特殊编程语言写的**CMake脚本**。cmake的所有语句都写在一个CMakeLists.txt的文件中，CMakeLists.txt文件确定后，直接使用cmake命令进行运行，但是这个命令要指向CMakeLists.txt所在的目录，cmake之后就会产生我们想要的makefile文件。



# GCC

​	GCC原名为**GNU C语言编译器**（GNU C Compiler），只能处理C语言。但其很快扩展，变得可处理C++，后来又扩展为能够支持更多编程语言，如Fortran、Pascal、Objective -C、Java、Ada、Go以及各类处理器架构上的汇编语言等，所以改名GNU编译器套件（GNU Compiler Collection）

​	

​	虽然我们称GCC是C语言的编译器，但使用gcc由C语言源代码文件生成可执行文件的过程不仅仅是编译的过程，而是要经历四个相互关联的步骤∶预处理（也称**预编译**，Preprocessing）、**编译**（Compilation）、**汇编**（Assembly）和**链接**（Linking）。

​	

​	命令gcc首先调用cpp进行预处理，在预处理过程中，对源代码文件中的文件包含（include）、预编译语句（如宏定义define等）进行分析。接着调用cc1进行编译，这个阶段根据输入文件生成以.i为后缀的目标文件。汇编过程是针对汇编语言的步骤，调用as进行工作，一般来讲，.S为后缀的汇编语言源代码文件和汇编、.s为后缀的汇编语言文件经过预编译和汇编之后都生成以.o为后缀的目标文件。当所有的目标文件都生成之后，gcc就调用ld来完成最后的关键性工作，这个阶段就是连接。在连接阶段，所有的目标文件被安排在可执行程序中的恰当的位置，同时，该程序所调用到的库函数也从各自所在的档案库中连到合适的地方。



# Clang

​	Clang是一个由Apple主导编写，基于LLVM的C/C++/Objective-C编译器。



​	Clang是一个C++编写、基于LLVM、发布于LLVM BSD许可证下的C/C++/Objective-C/Objective-C++编译器。它与GNU C语言规范几乎完全兼容（当然，也有部分不兼容的内容，包括编译命令选项也会有点差异），并在此基础上增加了额外的语法特性，比如C函数重载（通过__attribute__((overloadable))来修饰函数），其目标（之一）就是超越GCC。



​	2013年4月,Clang已经全面支持C++11标准，并开始实现C++1y特性（也就是C++14，这是C++的下一个小更新版本）。Clang将支持其普通lambda表达式、返回类型的简化处理以及更好的处理constexpr关键字。



### Clang相比GCC的优势

- Clang 采用的是 **BSD** 协议的许可证，而 GCC 采用的是 GPL 协议，显然前者更为宽松；
- Clang 是一个**高度模块化**开发的轻量级编译器，编译速度快、占用内存小、有着**友好的出错提示**。



​	例如这个文章《[gcc与clang对比](https://blog.csdn.net/sinat_36629696/article/details/79979274)》说的是 “if 判断语句错误使用了 =” 的案例，GCC编译没有提示出错，而Clang会给出提示。当然除此之外，GCC的错误提示有时让人一头雾水不好排查，而Clang给出的错误提示比较友好。



Android NDK 已在具体应用中放弃了 GCC，全面转向 Clang，正如很早前 Android NDK 在 Changelog 中提到的那样：

```
Everyone should be switching to Clang.
GCC in the NDK is now deprecated.
```

- Android NDK 从 r11 开始建议大家切换到 Clang，并且把 GCC 标记为 deprecated，将 GCC 版本锁定在 GCC 4.9 不再更新；
- Android NDK 从 r13 起，默认使用 Clang 进行编译，但是暂时也没有把 GCC 删掉，Google 会一直等到 libc++ 足够稳定后再删掉 GCC；
- Android NDK 在 r17 中宣称不再支持 GCC 并在后续的 r18 中删掉 GCC，具体可见 NDK 的版本历史。





# LLVM

[LLVM 10.0.0 Release Notes — LLVM 10 documentation](https://releases.llvm.org/10.0.0/docs/ReleaseNotes.html)	

LLVM（**Low Level Virtual Machine**），是以 BSD 许可来开发的开源的编译器框架系统，基于 C++ 编写而成，利用虚拟技术来优化以任意程序语言编写的程序的编译时间、链接时间、运行时间以及空闲时间，最早以 C/C++ 为实现对象，对开发者保持开放，并兼容已有脚本。LLVM 计划启动于 2000 年，最初由 University of Illinois at Urbana-Champaign 的 Chris Lattner 主持开展，2006 年 Chris Lattner 加盟苹果公司并致力于 LLVM 在苹果公司开发体系中的应用，所以苹果公司也是 LLVM 计划的主要资助者。目前 LLVM 因其宽松的许可协议，更好的模块化、更清晰的架构，成为很多厂商或者组织的选择，已经被苹果 IOS 开发工具、Facebook、Google 等各大公司采用，像 Swift、Rust 等语言都选择了以 LLVM 为后端。



​	在理解 LLVM 之前，先说下传统编译器的工作原理，基本上都是三段式的，可以分为**前端**、**优化器**和**后端**。

- 前端负责解析源代码，检查语法错误，并将其翻译为抽象的语法树；
- 优化器对这一中间代码进行优化，试图使代码更高效；
- 后端则负责将优化器优化后的中间代码转换为目标机器的代码，这一过程后端会最大化的利用目标机器的特殊指令，以提高代码的性能。
  

基于这个认知，我们可以认为 LLVM 包括了两个概念：一个广义的 LLVM 和一个狭义的 LLVM 。广义的 LLVM 指的是一个完整的 LLVM 编译器框架系统，包括了前端、优化器、后端、众多的库函数以及很多的模块；而狭义的 LLVM 则是聚焦于编译器后端功能的一系列模块和库，包括代码优化、代码生成、JIT 等。

![](https://xuhehuan.com/wp-content/uploads/2018/07/Clang-LLVM.jpg)

对应到这个图中，可以非常明确的找出它们的关系。整体的编译器架构就是 LLVM 架构；Clang 大致可以对应到编译器的前端，主要处理一些和具体机器无关的针对语言的分析操作；编译器的优化器和后端部分就是之前提到的 LLVM 后端，即狭义的 LLVM。





# MinGW-w64

介绍最全的文章《[MinGW-w64安装教程](https://www.jianshu.com/p/d66c2f2e3537)》，可以参考，下面摘取部分。

### **一、什么是 MinGW-w64 ？**

​	MinGW 的全称是：Minimalist GNU on Windows 。它实际上是将经典的开源 C语言编译器 GCC 移植到了 Windows 平台下，并且包含了 Win32API ，因此可以将源代码编译为可在 Windows 中运行的可执行程序。而且还可以使用一些 Windows 不具备的，Linux平台下的开发工具。一句话来概括：**MinGW 就是 GCC 的 Windows 版本** 。

​	MinGW 现已被 MinGW-w64 所取代，且 MinGW 也早已停止了更新，以后介绍和使用均默认是指MinGW-w64。



### **二、为什么使用 MinGW-w64 ？**

​	很多开源项目都是**CMake脚本**这种，在Windows上不方便编译。一个办法是使用CMakeGUI转换为VisualStudio的sln工程，另一个办法就是使用MinGW-w64进行编译。



### **三、如何下载安装 MinGW-w64 ？**

官网：http://mingw-w64.org/， 点开 Downloads 下载页面，向下找到[SourceForge](http://sourceforge.net/projects/mingw-w64/files/mingw-w64/mingw-w64-release/)的链接打开，在sourceforge中返回到Home然后选择**Toolchains targetting Win64**进入找已经编译好的可执行文件，下载安装。



或者直接访问以下链接：[MinGW-w64 - for 32 and 64 bit Windows - Browse /Toolchains targetting Win64/Personal Builds/mingw-builds at SourceForge.net](https://sourceforge.net/projects/mingw-w64/files/Toolchains%20targetting%20Win64/Personal%20Builds/mingw-builds/)，Windows开发平台建议选择：threads-win32/seh，其他可以根据下载的热度逐级点开下载。



注意不要下载在线安装版，会非常慢，推荐用上述的方法下载编译好的离线安装包，在线安装的方法参考：[MinGW-w64安装教程 - 简书](https://www.jianshu.com/p/d66c2f2e3537)



# Linux下编译

进入到有`Makefile`文件的目录下，直接使用命令编译：

```bash
make
```

有时候需要设置下包含目录路径：

```bash
export LUAPATH=/mnt/f/bigsinger/lib2/lua53
```

为工具设置下别名或链接：

```bash
# 为lua起个别名lua53
sudo ln -s /usr/bin/lua /usr/bin/lua53
```



# Windows使用Makefile或CMakeLists.txt编译

2023-3-29补充。得益于`GPT4`，直接问到了最简单的编译方法。现在很多开源项目的工程是配置的`Makefile`或`CMakeLists.txt`，在Windows上可以通过如下方法快速编译，非常爽歪歪。

其实推荐在`Windows`上进入`WSL`系统下按照`Linux`的方式编译，比较方便快捷。

## Makefile

直接在Windows搜索栏里搜索`prompt`找到`VisualStudio`的对应版本的控制台，进入到源码目录下，直接调用`nmake`命令即可编译，非常简单：

```bash
nmake -f makefile
```

如果想编译`debug`或`release`模式，可以在`Makefile`里添加如下类似的代码：

```makefile
!IFNDEF DEBUG
DEBUG = 0
!ENDIF

!IF $(DEBUG)
!MESSAGE Compiling in debug mode (DEBUG = $(DEBUG))
!ELSE
!MESSAGE Compiling in release mode (DEBUG = $(DEBUG))
!ENDIF
```

`nmake`的时候参考如下方式编译：

```bash
nmake -f makefile DEBUG=1
```

当然也可以直接咨询GPT去修改完善`Makefile`。

## CMakeLists.txt

相对`Makefile`只需要多一个步骤，也就是把`CMakeLists.txt`转换成`Makefile`再用`nmake`编译。

1. 确保已经安装了CMake。如果没有安装，可以从官方网站[下载CMake](https://cmake.org/download/)并安装。

2. 使用如下的命令转换：

   ```bash
   cmake -G "NMake Makefiles" -DCMAKE_BUILD_TYPE=Debug   -D_HAS_ITERATOR_DEBUGGING=1 -D_ITERATOR_DEBUG_LEVEL=2
   cmake -G "NMake Makefiles" -DCMAKE_BUILD_TYPE=Release
   ```

3. 使用`nmake`编译，可以参考前文。



注意，如果需要修改一些编译配置，可以修改`CMakeLists.txt`内容做一些修改，例如：

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
```

并配合`cmake`转换命令的参数使用，参考步骤2.





# 交叉编译

​	交叉编译是在一个平台上生成另一个平台上的可执行代码。**同一个体系结构可以运行不同的操作系统；同样，同一个操作系统也可以在不同的体系结构上运行。



​	一个经常会被问到的问题就是，“**既然我们已经有了主机编译器，那为什么还要交叉编译呢？**”其实答案很简单：

- 有时是因为**目的平台上不允许或不能够安装我们所需要的编译器**，而我们又需要这个编译器的某些特征；
- 有时是因为**目的平台上的资源贫乏**，无法运行我们所需要编译器；
- 有时又是因为**目的平台还没有建立**，连操作系统都没有，根本谈不上运行什么编译器。



​	另一个经常会被问到的问题就是：“**既然可以交叉编译，那还要主机编译干吗？**”其实答案也很简单，**交叉编译是不得已而为之**！与主机编译相比，**交叉编译受的限制更多**，虽然在理论上我们可以做任何形式的交叉编译，但事实上，由于受到专利、版权、技术的限制，并不总是能够进行交叉编译，尤其是在业余条件下！举例来说，我们至今无法生成惠普公司专有的som格式的可执行文件，因此我们根本无法做目的平台为HPPA-HPUX的交叉编译。


​	交叉编译这个概念的出现和流行是和嵌入式系统的广泛发展同步的。我们常用的计算机软件，都需要通过编译的方式，把使用高级计算机语言编写的代码（比如C代码）编译（compile）成计算机可以识别和执行的二进制代码。比如，我们在Windows平台上，可使用Visual C++开发环境，编写程序并编译成可执行程序。这种方式下，我们使用PC平台上的Windows工具开发针对Windows本身的可执行程序，这种编译过程称为**native compilation**（**本机编译**）。然而，**在进行嵌入式系统的开发时**，运行程序的目标平台通常具有有限的存储空间和运算能力，比如常见的ARM平台，其一般的静态存储空间大概是16到32MB，而CPU的主频大概在100MHz到500MHz之间。这种情况下，在ARM平台上进行本机编译就不太可能了，这是因为一般的编译工具链（compilation tool chain）需要很大的存储空间，并需要很强的CPU运算能力。为了解决这个问题，交叉编译工具就应运而生了。通过交叉编译工具，我们就可以在CPU能力很强、存储空间足够的主机平台上（比如PC上）编译出针对其他平台的可执行程序。



​	要进行交叉编译，我们**需要在主机平台上安装对应的交叉编译工具链**（cross compilation tool chain），然后用这个交叉编译工具链编译我们的源代码，最终生成可在目标平台上运行的代码。常见的交叉编译例子如下：

1. 在Windows PC上，利用ADS（ARM开发环境），使用armcc编译器，则可编译出针对ARM CPU的可执行代码。
1. 在Linux PC上，利用arm-linux-gcc编译器，可编译出针对Linux ARM平台的可执行代码。
1. 在Windows PC上，利用cygwin环境，运行arm-elf-gcc编译器，可编译出针对ARM CPU的可执行代码。



在做实际工作之前，我想我们应该先掌握一些关于交叉编译的基本知识。

- **宿主机（host）** ：编辑和编译程序的平台，一般是基于X86的PC机，通常也被称为主机。
- **目标机（target）**：用户开发的系统，通常都是非X86平台。host编译得到的可执行代码在target上运行。
- **prefix**：交叉编译器的安装位置。





### 其他参考：

[Clion 交叉编译配置 - 简书](https://www.jianshu.com/p/bf903adc0c1b)

[GNU Toolchain | GNU-A Downloads – Arm Developer](https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-a/downloads)

[How to set up with Clion a Cross Compile environment For Raspberry Pi 3? – IDEs Support (IntelliJ Platform) | JetBrains](https://intellij-support.jetbrains.com/hc/en-us/community/posts/115000792144-How-to-set-up-with-Clion-a-Cross-Compile-environment-For-Raspberry-Pi-3-)

[交叉编译环境_linux 交叉编译环境_arm-linux交叉编译环境 - 云+社区 - 腾讯云](https://cloud.tencent.com/developer/information/%E4%BA%A4%E5%8F%89%E7%BC%96%E8%AF%91%E7%8E%AF%E5%A2%83)



# IDE对编译工具的支持

## CLion

因为MinGW-w64只有命令行方式，使用起来比较麻烦，开发效率很低。可以使用jetbrain强大的IDE工具 CLion 结合使用，具体方法如下。



首先下载并安装MinGW-w64，方法参考前面章节。

在CLion中打开菜单： File | Settings | Build, Execution, Deployment | **Toolchains**，

![](https://intellij-support.jetbrains.com/hc/user_images/iHmhND9ptdWQ9hxYZH0xEQ.png)





## VisualStudio

自VisualStudio2017开始，VisualStudio也支持对CMake项目的打开了，也就是不必用CMakeGUI转换工程了，参考：[VS2019直接编译cmake项目](https://blog.csdn.net/v759291707/article/details/104270896)，微软官方文档：[Visual Studio 中的 CMake 项目 | Microsoft Docs](https://docs.microsoft.com/zh-cn/cpp/build/cmake-projects-in-visual-studio?view=vs-2019)

