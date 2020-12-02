---
layout:		post
category:	"python"
title:		"Python GUI编程"
tags:		[python]
---
- Content
{:toc}


# tkinter
tkinter是 Python的默认 GUI库。它基于 Tk工具包，该工具包最初是为工具命令语言（ToolCommand Language， Tcl）设计的。 Tk 普及后，被移植到很多其他的脚本语言中，包括 Perl（Perl/Tk）、 Ruby（Ruby/Tk）和 Python（Tkinter）。结合 Tk 的 GUI 开发的可移植性与灵活性，以及与系统语言功能集成的脚本语言的简洁性，可以让你快速开发和实现很多与商业软件品质相当的 GUI 应用。

tkinter 在系统中不是默认必须安装的，需要先安装。让 GUI 程序启动和运行起来需要以下 5 个主要步骤：
1. 导入 Tkinter 模块（或 from Tkinter import *）。
2. 创建一个顶层窗口对象，用于容纳整个 GUI 应用。
3. 在顶层窗口对象之上（或者“其中”）构建所有的 GUI 组件（及其功能）。
4. 通过底层的应用代码将这些 GUI 组件连接起来。
5. 进入主事件循环。

## Tk 控件
- Button 与 Label 类似，但提供额外的功能，如鼠标悬浮、按下、释放以及键盘活动/事件
- Canvas 提供绘制形状的功能（线段、椭圆、多边形、矩形），可以包含图像或位图
- Checkbutton 一组选框，可以勾选其中的任意个（与 HTML 的 checkbox 输入类似）
- Entry 单行文本框，用于收集键盘输入（与 HTML 的文本输入类似）
- Frame 包含其他控件的纯容器
- Label 用于包含文本或图像
- LabelFrame 标签和框架的组合，拥有额外的标签属性
- Listbox 给用户显示一个选项列表来进行选择
- Menu 按下 Menubutton 后弹出的选项列表，用户可以从中选择
- Menubutton 用于包含菜单（下拉、级联等）
- Message 消息。与 Label 类似，不过可以显示成多行
- PanedWindow 一个可以控制其他控件在其中摆放的容器控件
- Radiobutton 一组按钮，其中只有一个可以“按下”（与 HTML 的 radio 输入类似）
- Scale 线性“滑块”控件，根据已设定的起始值和终止值，给出当前设定的精确值
- Scrollbar 为 Text、 Canvas、 Listbox、 Enter 等支持的控件提供滚动功能
- Spinbox Entry 和 Button 的组合，允许对值进行调整
- Text 多行文本框，用于收集（或显示）用户输入的文本（与 HTML 的 textarea 类似）
- Toplevel 与 Frame 类似，不过它提供了一个单独的窗口容器


# 其他GUI
- Tk 接口扩展（Tix）
- Python MegaWidgets（PMW）
- wxWidgets 和 wxPython
- GTK+和 PyGTK
- Tile/Ttk
- PyQt
- FXPy
- PyFLTK (fltk)
- PyOpenGL (OpenGL)
- win32ui
- swing