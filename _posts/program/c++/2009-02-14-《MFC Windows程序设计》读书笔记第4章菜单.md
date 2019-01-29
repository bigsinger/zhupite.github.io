---
layout:		post
category:	"program"
title:		"《MFC Windows程序设计》读书笔记第4章菜单"
tags:		[mfc,c++]
---
- Content
{:toc}

在MFC应用程序中可以用一下3中方式创建菜单：
1. 创建菜单资源，并在应用程序运行时加载生成的菜单
2. 将一系列定义菜单内容的数据结构初始化，并用CMenu::LoadMenuIndirect创建菜单
3. 用编程方法创建菜单，调用CreateMenu，InsertMenu和其他CMenu函数将各部分连接起来。

# 创建菜单
## 资源形式创建菜单
其中菜单正文中的"&"定义了和Alt键一起使用的快捷键，用来显示子菜单(&后的字母在显示时带有下划线)和选中子菜单。
某些菜单项里跟在制表符后的文本（如："Open...\tCtrl+O"中的"Ctrl+O"）表示加速键。

## 加载并显示菜单
1. 将菜单资源ID传递给CFrame::Create
```cpp
Create(NULL,_T("MY APP"),WS_OVERLAPPEDWINDOW,rectDefault,NULL,
    MAKEINTRESOURCE(IDR_MAINFRAME));
```
其中MAKEINTRESOURCE宏将一个整型资源ID转换为LPTSTR类型的ID.

2. 用CFrameWnd::LoadFrame函数
```cpp
LoadFrame(IDR_MAINFRAME,WS_OVERLAPPEDWINDOW,NULL,NULL);
```

3. 构造CMenu对象，通过CMenu::LoadMenu加载菜单资源，然后调用CWnd::SetMenu:
```cpp
CMenu menu;
menu.LoadMenu(IDR_MAINFRAME);
SetMenu(menu);
menu.Detach();
```

其中CMenu::Detach将菜单从CMenu对象上卸下，防止菜单随menu的析构函数被过早地清除。
如果需要在SetMenu更换了菜单之后反映这个变化，则要调用CWnd::DrawMenuBar.

# 响应菜单命令
消息映射表中的ON_COMMAND宏会将特定菜单项的WM_COMMAND消息连接到类成员函数或命令处理例程：
```cpp
ON_COMMAND(ID_FILE_SAVE,OnFileSave)
```

这种命令处理例程都没有返回值，也没有参数。

# 命令范围
如果需要将几个菜单项响应命令对应到同一个命令处理例程，使用宏ON_COMMAND_RANGE会显得便捷一些，
而且命令处理例程会含有一个参数，它对应为响应命令的菜单项ID.
```cpp
ON_COMMAND_RANGE(ID_COLOR_RED,ID_COLOR_BLUE,...,OnColor)
...
void CMainWindow::OnColor(UINT nID)
{
...
}
```

# 更新菜单项
1. 在菜单项的命令处理例程中添加更新代码。
2. 将更新代码移到响应WM_INITMENUPOPUP消息的OnInitMenuPopup处理程序中去，
这样的好处是把处理命令的代码与更新菜单的代码分开了。
```cpp
ON_WM_INITMENUPOPUP()
...
void CMainWindow::OnInitMenuPopup(CMenu*pPopupMenu,UINT nIndex,BOOL bSysMenu)
{
if (!bSysMenu&&nIndex==COLOR_MENU_INDEX)
{
   pPopupMenu->CheckMenuItem(...);
}
}
```
- nIndex保存菜单（当前弹出）在最高级菜单中基于0的索引值；
- bSysMenu判断是否是系统菜单。

3. 通过消息映射表中的**ON_UPDATE_COMMAND_UI**宏可以给菜单项分配相应的更新处理程序，当然也有**ON_UPDATE_COMMAND_UI_RANGE**宏。更新处理程序会有一个指向CCmdUI对象的指针参数，可以依此对象的成员函数修改菜单项，
而且这种更新处理也适用于工具条和其他UI对象。
```cpp
ON_UPDATE_COMMAND_UI(ID_COLOR_RED,OnUpdateColorRed)
...
void CMainWindow::OnUpdateColorRed(CCmdUI*pCmdUI)
{
pCmdUI->SetCheck(...);
}
```

# 键盘加速键
如果要加速键起作用，消息循环必须含有一个
::TranslateAccelerator调用，如果是在非框架窗口中，可以：
```cpp
while(GetMessage(&MSG,NULL,0,0))
{
if (!TranslateAccelerator(hWnd,hAccel,&msg))
{
   TranslateMessage(&msg);
   DispatchMessage&msg);
}
}
```

其中hAccel是通过LoadAccelTable(MAKEINTRESOURCE(IDR_MIDR_MAINFRAME));
加载的加速键句柄。如果是在框架窗口中，从CWnd派生一个窗口并使用加速键：
```cpp
m_hAccelTable=::LoadAccelerator(AfxGetInstanceHandle(),MAKEINTRESOURCE(IDR_MIDR_MAINFRAME));
...
BOOL CMainWindow::PreTranslateMessage(MSG *pMsg)
{
if (CWnd::PreTranslateMessage(pMsg))
   return TRUE;
return (m_hAccelTable!=NULL)&&!TranslateAccelerator(hWnd,m_hAccelTable,pMsg)
}
```

# 运行MFC AppWizard

stdAfx.h包含的所有文件被预先编译成文件projectname.pch和stdAfx.obj,
因此编译一次后，他们就不必重新编译，所以在stdAfx.h中不应该包含那些会发送变化
的头文件，否则就失去了预先编译头文件的意义了。
注：
```cpp
#include "stdAfx.h" // 应该放置在最前面
```

CWinApp中有这样的一个消息映射：ON_COMMAND(ID_APP_EXIT,OnAppExit)
因此，如果给某个菜单项ID设置ID_APP_EXIT，则选中它即激活OnAppExit，
OnAppExit是通过继承得到的，它向主窗口发送WM_CLSOE消息来结束程序。

# 通过手工编程修改菜单：
主要是调用CMenu::CreateMenu,CreatePopupMenu,AppendMenu以及其他成员函数。

# 系统菜单
CWnd::GetSystemMenu(FALSE),FALSE通知GetSystemMenu编程者需要一个指针，
指向可以修改的系统菜单副本，在获取了系统菜单之后便可以通过CMenu的
成员函数对其进行DIY了。

注意系统菜单中添加的菜单项必须赋有ID，且是16的倍数，Windows保留系统
菜单命令ID的低四位自己用，这即是为什么要设定ID为16的倍数的原因了。
```cpp
void CMainWindow::OnSysCommand(UINT nID,LPARAM lParam)
{
if ((nID&0xFFF0)==ID_SYSMENU_ABOUT)
{
   ...
}
CFrameWnd::OnSysCommand(nID,lParam);
}
```

# 自制菜单
1. 调用CMenu::ApAppendMenu时传递一个CBitmap对象指针。
2. 使用自制菜单项：在包含有自制菜单的菜单首次显示时，应用程序会收到WM_MEASUREITEM消息和WM_DRAWITEM消息，以后显示菜单只会
收到WM_DRAWITEM消息，而不会再收到WM_MEASUREITEM消息了。

## 创建自制菜单的步骤：
1. 用CMenu::MModifyMenu增加MF_OWNERDRAW标志实现传统菜单到自制菜单的转化。
2. 添加响应WM_MEASUREITEM消息的OnMeasureItem处理程序和相应的消息映射表。
3. 给消息WM_DRAWITEM提供一个OnDrawItem处理程序。
```cpp
afx_msg void OnDrawItem(int nIDCtl,LPDRAWITEMSTRUCT lpdis)
```
画图实际上是在OnDrawItem中完成的，因为DRAWITEMSTRUCT结构中有一个字段提供了设备描述表的句柄。

# OnMenuChar处理
使用自制菜单的弊病是window没有为此提供键盘快捷键，可以通过响应WM_MENUCHAR消息解决。

# 上下文菜单
MFC的ON_WM_CONTEXTMENU宏，把WM_CONTEXTMENU消息和OnContextMenu对应起来。
```cpp
void CChildView::OnContextMenu(CWnd*pWnd,CPoint point)
{
//调用TrackPopupMenu显示菜单
}
```

# TPM_RETURNCMD标志
```cpp
int nCmd=(int)pContextMenu->TrackPopupMenu(TPM_RETURNCMD|TPM_LEFTALIGN|TPM_LEFTBUTTON,           Point.X,Point.Y,AfxGetMainWnd());
```
意即，当弹出式菜单显示后，会返回用户选择的菜单ID,用以进一步操作。
需要注意的是，在菜单项被选中的时候，还是要引发WM_COMMAND消息的，因此不要重复响应。