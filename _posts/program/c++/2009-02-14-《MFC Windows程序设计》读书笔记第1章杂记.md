---
layout:		post
category:	"program"
title:		"《MFC Windows程序设计》读书笔记第1章杂记"
tags:		[mfc,c++]
---
- Content
{:toc}


第一章 杂记

MFC的好处就在于Microsoft已经为你写好了几万行代码，并对其进行了测试。

# MFC简介
MFC提供了一组包含Windows API的基于面向对象的C++类库，有些类可以直接使用，有些类作为基类。MFC也是一个应用程序的框架结构，为应用程序处理许多杂务。

**文档**（CDocument）仅仅是程序数据的抽象表示。


**CObject**给那些继承它的类提供了3个重要特性：

1. 串行化支持
2. 运行时类信息支持
3. 诊断和调试支持

# AFX函数
MFC全局函数形式提供的API，以**Afx**开头，如：
**AfxGetApp**，**AfxGetMainWnd**...


指定窗口风格:

- CWnd的Create函数
- PreCreateWindow修改参数

**CPaintDC**只在WM_PAINT消息处理程序中使用，是CDC的一个特殊例子。

# 消息映射
消息映射是一个将消息和成员函数相互关联的表。当框架窗口接收到了一个消息，MFC将搜索该窗口的消息映射，如果存在一个处理xx消息的处理程序，然后就调用它。


将消息映射添加到一个类中需要做的工作：

1. 通过将**DECLARE_MESSAGE_MAP**语句添加到类声明中，声明消息映射。
2. 通过放置标示消息的宏来执行消息映射，相应的类将在对**BEGIN_MESSAGE_MAP**和**END_MESSAGE_MAP**的调用之间处理消息。
3. 添加成员函数来处理消息。

如：
```cpp
afx_msg void OnPaint();
afx_msg LRESULT OnSetText(WPARAM wParam,LPARAM,lParam);

BEGIN_MESSAGE_MAP(CMainWindow,CFrameWnd)
ON_WM_PAINT()
ON_MESSAGE(WM_SETTEXT,OnSetText)
END_MESSAGE_MAP
```

# 消息映射的工作方式
通过检查afxwin.h中的DECLARE_MESSAGE_MAP,BEGIN_MESSAGE_MAP,END_MESSAGE_MAP宏以及wincore.cpp中的CWnd::WindowProc代码，来找到消息映射是如何工作的。

DECLARE_MESSAGE_MAP宏在类声明中添加3个成员：一个名为_messageEntries的AFX_MSGMAP_ENTRY结构数组,其中包含将消息与消息处理程序关联的信息;一个名为messageMap的静态AFX_MSGMAP结构,其中包含一个指向基类的messageMap结构的指针，和一个指向_messageEntries结构的指针；一个名为GetMessageMap的虚函数，它返回messageMap的地址。

BEGIN_MESSAGE_MAP包含 GetMessageMap函数的实现，和初始化messageMap结构的代码，出现在BEGIN_MESSAGE_MAP和END_MESSAGE_MAP之间的宏都将填入到_messageEntries数组中。

END_MESSAGE_MAP使用一个NULL条目结束数组。
对于如下的语句：
```cpp
//In the class delcaration
DECLARE_MESSAGE_MAP()

//In the class implementation
BEGIN_MESSAGE_MAP(CMainWindow,CFrameWnd)
ON_WM_PAINT()
END_MESSAGE_MAP
```

编译器的预处理程序将会生成如下的语句：
```cpp
//In the class delcaration
private:
   static const AFX_MSGMAP_ENTRY _messageEntries[];
protected:
static const AFX_MSGMAP messageMap;
virtual const AFX_MSGMAP *GetMessageMap() const;

//In the class implementation
const AFX_MSGMAP *CMainWindow::GetMessageMap() const
{return &CMainWindow::messageMap;}

const AFX_MSGMAP CMainWindow::messageMap = {
&CFrame::messageMap,
&CMainWindow::_messageEntries[0]
};

const AFX_MSGMAP_ENTRY CMainWindow:_messageEntries[] = {
{WM_PAINT,0,0,0,AfxSig_vv,
(AFX_PMSG)(AFX_PMSGW)(void(CWnd::*)(void))OnPaint},
{0,0,0,0,AfxSig_end,(AFX_PMSG)0}
};
```

要分派消息，框架调用CMainWindow从CWnd继承下来的WindowProc虚函数，WindowProc调用OnWndMsg，而OnWndMsg又调用GetMessageMap获取一个指向CmainWindow::messageMap的指针，兵搜索CMainWindow::_messageEntries数组来获取一个消息ID与当前正等待处理的消息ID相匹配的条目，若找到了则调用相关联的处理程序。否则，OnWndMsg从CMainWindow::messageMap获取指向CFrameWnd::messageMap的指针并作为基类重复上述过程。

**字符集**
_T宏，参见《Advanced Windows》(1997，Microsoft Press)--Jeffrey Richter关于Unicode的章节。

**其他：**
Project菜单->General->MFC->Use MFC In A Shared Dll这样生成的应用程序大小会比较小些。

