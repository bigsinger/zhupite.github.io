---

layout:		post
category:	"program"
title:		".NET反编译工具汇总"
tags:		[c#,net]
---
- Content
{:toc}
# 反编译



## DnSpy（开源）推荐

​    dnSpy是一款开源的基于ILSpy发展而来的.net程序集的编辑，反编译，调试神器。GitHub地址：[dnSpy/dnSpy: .NET debugger and assembly editor](https://github.com/dnSpy/dnSpy)



## ILSpy（开源）

ILSpy软件本身是C#程序，是一款开源软件，GitHub地址：[icsharpcode/ILSpy: .NET Decompiler with support for PDB generation, ReadyToRun, Metadata (&more) - cross-platform!](https://github.com/icsharpcode/ILSpy)



## .NET Reflector（收费）

[.NET Decompiler: Decompile Any .NET Code | .NET Reflector](https://www.red-gate.com/products/dotnet-development/reflector/)



## de4dot（开源）

de4dot是一款C#编写的基于GPLv3协议的一个开源的.net反混淆脱壳工具，是目前.net下非常不错的一款反编译工具。支持Dotfuscator，.NET Reactor，MaxtoCode,SmartAssembly,Xenocode等10多个反混淆工具。

GitHub地址：[de4dot/de4dot: .NET deobfuscator and unpacker.](https://github.com/de4dot/de4dot)



## JetBrains dotPeek（免费）

官方网址：http://www.jetbrains.com/decompiler/

JetBrains dotPeek是JetBrains公司发布的一款免费的.NET反编译器。

dotPeek算比较小众的一款，它生成的代码质量很高，它还会尝试到源代码服务器上抓取代码。DotPeek的导航功能和快捷键非常便捷。它还能精确查找符号的使用，同时支持插件。



## JustDecompile（免费）

官网：https://www.telerik.com/products/decompiler.aspx

JustDecompile是Telerik公司推出一个免费的.net反编译工具，支持插件，与Visual Studio 集成，能够创建Visual Studio project文件。JustDecompile与Reflector相比的话，个人更喜欢JustDecompile，因为他免费，而且对于一些C#动态类型的反编译效果比较好，对于某个第三方程序集，如果它缺乏文档，或者是一个bug 或性能问题的根源，反编译往往是最快捷的解决方案。Telerik已经将 Reflexil、程序集编辑器（assembly editor）和 De4Dot 等插件集成到了JustDecompile中。



## Simple Assembly Explorer（免费）

Simple Assembly Explorer（简称SAE）是一款专业的.Net程序解密分析必备工具。



## ildasm

微软开发工具里的反编译工具，配合ilasm进行重新编译。

用法可以参考微软官方文档：[Ildasm.exe (IL Disassembler) | Microsoft Docs](https://docs.microsoft.com/en-us/dotnet/framework/tools/ildasm-exe-il-disassembler)



ilasm命令如下，反编译后生成 il 文件和 res 文件：

```
ildasm Assembly-CSharp.dll /output:Assembly-CSharp.il
```

对il文件进行修改后回编译：

```
ilasm /dll /res:Assembly-CSharp.res Assembly-CSharp.il /out:Assembly-CSharp.dll
```

# 反编译插件

## Reflexil（开源）

Reflexil is an assembly editor and runs as a plug-in for Red Gate's **Reflector**, **ILSpy** and **Telerik's JustDecompile**.

GitHub地址：[sailro/Reflexil: The .NET Assembly Editor](https://github.com/sailro/Reflexil)



# 查壳脱壳

## NETUnpack 

脱壳工具NETUnpack，可以脱去DotNetReactor等加的壳



## DotNet Id

DotNet Id是一款net的查壳工具。DotNet Id官方最新版可以查是哪些软件保护加密或混淆处理的：MaxToCode .Net Reactor Rustemsoft Skater Goliath Obfuscator PE Compact Spices Obfuscator Themida  Dotfuscator Xenocode Smart Assembly CliSecure  Phoenix Protector CodeVeil。



## Protection ID

## ScanId



## **ExtremeDumper**（开源）

GitHub地址：[wwh1004/ExtremeDumper: .NET Assembly Dumper](https://github.com/wwh1004/ExtremeDumper)

[使用方式](https://www.52pojie.cn/thread-712611-1-1.html)：

> 1. 启动加壳后的程序
> 2. 启动ExtremeDumper（32位壳启动32位的，64位壳启动64位的）
> 3. 尝试这3种Dump方式：在主界面直接右键转储进程（选项->转储方式 选择 Me**g**aDumper）|在主界面右键查看模块列表，在新弹出的窗口中转储指定模块（选项->转储方式 选择 Me**g**aDumper）|在主界面右键查看模块列表，在新弹出的窗口中转储指定模块（选项->转储方式 选择 Me**t**aDumper）
> 4. Dump文件不能启动的，用[AssemblyRebuilder](https://www.52pojie.cn/thread-699172-1-1.html)重建下程序集。