---
layout:		post
category:	"python"
title:		"Jython"
tags:		[python]
---
- Content
{:toc}


Jython 是一根纽带，联系着两种不同编程环境的人群。首要原因是其适合 Python 开发者在 Java 开发环境中使用 Python 快速开发方案原型，并无缝地集成到已有的 Java 平台中。另一个原因是通过为 Java 提供一个脚本语言环境，可以简化无数 Java 程序员的工作。 Java 程序员无须为测试一个简单的类而编写测试套件或驱动程序。



Jython 提供了大部分 Python 功能，且能够实例化 Java 类并与之交互。 Jython 代码会动态地编译成 Java字节码，还可以用 Jython扩展 Java类。通过 Jython，还能使用 Java来扩展 Python。用户能方便地在 Python 中编写一个类，在 Java 环境中就如同原生的 Java 类来使用。甚至可以把 Jython 脚本静态地编译为 Java 字节码。

Java 为 Python 用户带来了一些额外的好处，如可以使用 Java 原生的异常处理（在标准 Python 中是无法使用 Java 的异常的，当与其他 Python 实现做比较时，标准 Python 都是指 CPython），并使用 Java 的垃圾回收器（这样就无须在 Java 中重新实现 Python 的垃圾回收器了）。

由于 Jython 能够访问所有 Java 类，因此能做的事就太多了。比如 (GUI 开发。在 Python中，用 Tkinter 模块中的 Tk 作为默认 GUI 工具包，但是， Tk 不是 Python 的原生工具包。然而， Java 有原生的 Swing。通过 Jython，可以用 Swing 组件写一个 GUI 应用程序。注意，不是用 Java，而是用 Python 编写。

