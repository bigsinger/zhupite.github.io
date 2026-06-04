---
layout: post
title: 《MFC Windows程序设计》读书笔记
category: dev
tags: [mfc, c++, Windows编程, GDI, 读书笔记]
date: 2009-02-14 12:00:00 +0800
---

> 《MFC Windows程序设计》（Programming Windows with MFC）是Jeff Prosise的经典MFC教程，
> 本篇笔记整理了书中第1~6章的核心内容，涵盖MFC框架机制、GDI绘图、鼠标键盘输入、
> 菜单系统、集合类及文件串行化等主题。



---

## 一、杂记
> MFC基础与消息映射

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

---

## 二、在窗口中绘图
> GDI绘图与设备描述表

# 专门用途的设备描述表类

![专门用途的设备描述表类](http://hiphotos.baidu.com/asmcvc/pic/item/76129e032054b0573812bb18.jpg)

有时可以用CMindowDC创造特殊效果，如绘制标题栏和带圆角的窗口。
若想在窗口非客户区作图，可借助OnNcPaint处理程序捕获WM_NCPAINT消息。
OnNcPaint不需要调用BeginPaint和EndPaint。

需要操作屏幕时，只要创建CClientDC或CWindowDC对象，构造函数的参数
传递NULL即可。

# 设备描述表属性
每当从windows中获取设备描述表时，设备描述表都被设置为默认值。如果
不想在使用设备描述表时反复对它进行初始化设定，则可以用CDC::SaveDC
保存它的状态，并在下次使用时用CDC::RestoreDC将它恢复；另一种方法：
注册WNDCLASS时使用CS_OWNDC样式，这样windows便会分配它设置好的设备
描述表。

# 映射模式
映射模式是设备描述表的属性，用以确定从逻辑坐标值到设备坐标值的转换方式。

# 可编程映射模式
只有MM_ISOTROPIC和MM_ANISOTROPIC映射模式允许倒转x轴和y轴的方向，
这两个映射模式的区别为：MM_ISOTROPIC中x方向和y方向具有同一个缩放比例，
也即水平方向上的一个单位和垂直方向上的一个单位长度相等。Isotropic意即
“各个方向上相等”。
用MM_ISOTROPIC映射模式画圆和正方形是非常理想的：
CRect rect;
GetClientRect(&rect);
dc.SetMapMode(MM_ISOTROPIC);
dc.SetWindowExt(500,500);
dc.SetViewportExt(rect.Width(),rect.Height());
dc.Ellips(0,0,500,500);

代码中，将窗口的逻辑尺寸设为500单位x500单位，再把逻辑单位转换为设备单位时，
由于使用了MM_ISOTROPIC映射模式，GDI将输出设备的长宽也考虑进去了。
SetWindowExt设定“窗口”范围，SetViewportExt设定“视口”范围。窗口尺寸以逻辑
单位计算呢，视口尺寸以设备单位(如像素点)计算。
一般来说，视口范围是画图所在窗口的大小(以像素点数目计算)，而窗口范围是指以
逻辑单位表示的窗口尺寸。

注：
CWnd::GetClientRect,rect.Width,rect.Height返回的是以像素点表示的尺寸，由于默认
的映射模式为MM_TEXT，因此像素点和一个逻辑单位长度相等，如果是在其他映射模式下
编程，则需使用CDC::DPtoLP和CDC::LPtoDP在逻辑坐标值和设备坐标值之间进行转换。
在响应鼠标单击的命中测试时，LPtoDP和DPtoLP是必不可少的，因为鼠标单击后获取
的是设备坐标值，如果你已经使用了其他映射模式画了一个矩形，则应当调用这两个函数
的一个统一坐标单位后进行Hit测试。

# 移动原点
默认方式下，设备描述表的原点位于显示平面的左上角。使用CDC::SetWindowOrg移动
窗口原点；使用CDC::SetViewportOrg移动视口原点。但是只能使用两个函数中的一个。
如果是使用SetViewportOrg，则只需将需要设为原点的(x,y)坐标作为参数传入即可，
如将窗口中心设为原点：
dc.SetViewportOrg(rect.Width()/2,rect.Height()/2);
如果是使用SetWindowOrg，则情况要复杂一些，它意味着设定了新的原点后，原来原点的
新坐标变化。例如仍将窗口中心设置为原点,

则编程代码应为：SetWindowOrg(-rect.Width()/2,-rect.Height()/2);

# GDI画笔和CPen类

创建基本画笔
1. CPen pen(PS_SOLID,1,RGB(255,0,0));
2. CPen pen;
pen.CreatePen(PS_SOLID,1,RGB(255,0,0));
3. CPen pen;
LOGPEN lp;
lp.lopnStyle = PS_SOLID;
lp.lopnWidth.x=1;
lp.lopnColor = RGB(255,0,0);
pen.CreatePenIndirect(&lp);

"NULL笔"用于创建无边框图，"NULL画刷"画图内部透明。

使用画笔：在创建了画笔之后，即可以选入设备描述表使用了
...
CPen *pOldPen = dc.SelectObject(&pen);
dc.Ellipse(....);

扩展笔
参见CPen构造函数的其他重载形式。

# GDI画刷和CBrush类
画刷三种基本类型:单色，带阴影线，带图案。
创建单色画刷：
1. CBrush brush(RGB(255,0,0));
2. CBrush brush;
brush.CreateSolidBrush(RGB(....));
3. CBrush::CreateBrushIndirect(&LOGBRUSH);

创建阴影线画刷：
1. CBrush brush(HS_DIAGCROSS,RGB(...));
2. CBrush brush;
brush.CreateHatchBrush(HS_DIAGCROSS,RGB(...));

CDC::SetBkMode(TRANSPARENT);用于设置背景填充色为透明。

画刷原点：
见书P55

# 画文本

![画文本](http://hiphotos.baidu.com/asmcvc/pic/item/0590db1be6ede2398718bf3b.jpg)


# GDI字体和CFont类
CFont font；构造了CFont对象之后，就可以通过其成员函数创建字体了，如果以像素
为单位指定字体尺寸，则调用CreateFont或CreateFontIndirect；若以点(一点相当于1/72英寸)
为单位指定字体尺寸，则调用CreatePointFont或CreatePointFontIndirect。如：
CFont font；
font.CreatePointFont(120,_T("Times New Roman"));
是创建12点的字体，第一个参数大小是期望字体大小的10倍。使用CreatePointFontIndirect可以
创建加粗，倾斜等格式的字体：
LOGFONT lf；
::ZeroMemory(&lf,sizeof(lf));
lf.lfHeight = 120;
lf.lfWeight = FW_BOLD;
lf.lfItalic = TRUE;
::lstrcpy(lf.lfFaceName,_T("Times New Roman"));

CFont font;
font.CreatePointFontIndirect(&lf);

光栅字体与TrueType字体
创建旋转字体：
调用CFont::CreateFontIndirect或CFont::CreatePointFontIndirect创建一种字体(适用于TrueType字体)，
在LOGFONT结构的lfEscapment和lfOrientation设定为旋转的角度(*10倍)。

备用对象
 
![备用对象](http://hiphotos.baidu.com/asmcvc/pic/item/6ee4b8162399b138962b433b.jpg) 

使用备用对象：
1. dc.SelectStockObject(NULL_PEN);
2. pen.CreateStockObject(NULL_PEN);

取消对GDI对象的选定：
CPen*pPen = new CPen(....);
CPen*pOldPen = dc.SelectObject(pPen);
....
dc.SelectObject(pOldPen);
delete pPen;

其他：
OnCreate处理程序：
int CMainWindow::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
if(CFrameWnd::OnCreate(lpCreateStruct)==-1)
     return -1;
....
return 0;
}

---

## 三、鼠标和键盘
> 输入处理机制

rect.DeflateRect(16,16);可以将一个矩形在各个方向上缩小16个像素。

由于CString类重载了LPCTSTR运算符，因此可以吧一个CString传递给接受LPCTSTR数据类型的函数。

CWnd是所有窗口类的根。

- CalcWindowRect：给定一个指向包含窗口客户区坐标的CRect对象的指针，CalcWindowRect将计算出相应的窗口矩形。

- PostNcDestroy：窗口在被销毁前接受的最后一条消息是WM_NCDESTROY,MFC的CWnd类包括一个默认的OnNcDestroy处理程序，
它执行一些清楚任务，最后调用名为PostNcDestroy的虚函数。

**CWinApp::ExitInstance**和**CWnd::PostNcDestroy**都可以做收尾工作。

# 非客户区鼠标消息
与客户区鼠标消息类似，将消息ID的下划线后加上“NC”即可。

处理程序原型为：
```cpp
afx_msg void OnMsgName(UINT nHitTest,CPoint point)
```

其中nHitTest为命中测试码：
```cpp
HTCAPTION标题栏;
HTCLOSE关闭按钮;
HTGROWBOX/HTSIZE还原按钮;
HTHSCROLL/HTVSCROLL水平/垂直;
HTMENU菜单栏;
HTREDUCE最小化按钮;
HTSYSMENU系统菜单;
HTZOOM最大化.
```

如果禁用“双击标题栏最大化窗口”，则：ON_WM_NCLBUTTONDBLCLK(),对应的处理程序为：OnNcLButtonDblClk
```cpp
void CMainWindow::OnNcLButtonDblClk(UINT nHitTest,CPoint point)
{
if (nHitTest!=HTCAPTION)
{
CWnd::OnNcLButtonDblClk(nHitTest,point);
}
}
```

# WM_NCHITTEST消息
Windows处理WM_NCHITTEST消息时，首先使用光标坐标确定所在窗口位置，然后再产生一个客户区域活非客户区域鼠标消息。

创建一个可以在客户区拖动的窗口：
```cpp
ON_WM_NCHITTEST()
.
.
.
UINT CMainWindow::OnNcHitTest(CPoint point)
{
UINT nHitTest=CFrameWnd::OnNcHitTest(point);
if (nHitTest==HTCLIENT)
{
nHitTest=HTCAPTION;
}
return nHitTest;
}
```

# WM_MOUSELEAVE和WM_MOUSEHOVER消息
使用::TrackMouseEvent()可以实现当光标离开窗口时接收WM_MOUSELEAVE消息，而光标在窗口上停滞时接收WM_MOUSEHOVER消息。
因为窗口接收WM_MOUSELEAVE消息，所以很容易知道光标何时进入窗口或在窗口中移动了。
::TrackMouseEvent()只接受一个指向TRACKMOUSEEVENT结构的指针做参数。
```cpp
typedef struct tagTRACKMOUSEEVENT {
DWORD cbSize;
DWORD dwFlags;
HWND hwndTrack;
DWORD dwHoverTime;
} TRACKMOUSEEVENT, *LPTRACKMOUSEEVENT;
```

其中dwFlags保存位标志指示调用者要执行的操作：
- 设定TME_LEAVE则注册接收WM_MOUSELEAVE消息；
- 设定TME_HOVER则注册接收WM_MOUSEHOVER消息。

hwndTrack是目标窗口句柄，也即WM_MOUSELEAVE和WM_MOUSEHOVER消息将发给它。
dwHoverTime以毫秒计，常设置为HOVER_DEFAULT(400毫秒)。

::TrackMouseEvent()在产生WM_MOUSELEAVE和WM_MOUSEHOVER消息时，其例程的作用（影响）就消失了，也即无法产生下一次的WM_MOUSELEAVE和WM_MOUSEHOVER消息了，这就意味着，必须在WM_MOUSELEAVE和WM_MOUSEHOVER消息处理例程最后再一次调用::TrackMouseEvent()以启用这种作用（影响）。

示例代码：
```cpp
ON_WM_MOUSEMOVE()
ON_MESSAGE(WM_MOUSELEAVE,OnMouseLeave)
ON_MESSAGE(WM_MOUSEHOVER,OnMouseHover)
.
.
.
void CMainWindow::OnMouseMove(UINT nFlags,CPoint point)
{
if (!m_bMouseOver)
{
TRACE(_T("Mouse Enter\n"));
m_bMouseOver=TRUE;

   TRACKMOUSEEVENT tme;
tme.cbSize=sizeof(tme);
tme.dwFlags=TME_HOVER | TME_LEAVE;
tme.hwndTrack=m_hWnd;
tme.dwHoverTime=HOVER_DEFAULT;
::TrackMouseEvent(&tme);
}
}

LRESULT CMainWindow::OnMouseLeave(WPARAM wParam,LPARAM lParam)
{
TRACE(_T("Mouse Leave\n"));
m_bMouseOver=FALSE;
return 0;
}

LRESULT CMainWindow::OnMouseHover(WPARAM wParam,LPARAM lParam)
{
TRACE(_T("Mouse Hover\n"));
TRACKMOUSEEVENT tme;
tme.cbSize=sizeof(tme);
tme.dwFlags=TME_HOVER | TME_LEAVE;
tme.hwndTrack=m_hWnd;
tme.dwHoverTime=HOVER_DEFAULT;
::TrackMouseEvent(&tme);

return 0;
}
```

# 鼠标滚轮
滚轮滚动时，窗口将接收WM_MOUSEWHEEL消息，处理原型：
```cpp
BOOL OnMouseWheel(UINT nFlags,short zDelta,CPoint point);
```
其中zDelta是滚轮旋转的距离，按此值来决定窗口页面向前或向后翻动的页数或行数。

首先查询与WHEEL_DELTA单位对应的行数，然后用zDelta乘以这个行数并除以WHEEL_DELTA来确定滚动的行数。
```cpp
ON_WM_MOUSEWHEEL()
.
.
.
BOOL CMainWindow::OnMouseWheel(UINT nFlags,short zDelta,CPoint point)
{
BOOL bUp=TRUE;
int nDelta =zDelta;

if (zDelta<0)
{
bUp=FALSE;
nDelta=-zDelta;
}
UINT nWheelScrollLines;
::SystemParametersInfo(SPI_GETWHEELSCROLLLINES,0,&nWheelScrollLines,0);
if (nWheelScrollLines==WHEEL_PAGESCROLL)
{
SendMessage(WM_VSCROLL,MAKEWPARAM(bUp?SB_PAGEUP:SB_PAGEDOWN),0,0);
}
else
{
int nLines=(nDelta*nWheelScrollLines)/WHEEL_DELTA;
while (nLines--)
{
SendMessage(WM_VSCROLL,MAKEWPARAM(bUp?SB_LINEUP:SB_LINEDOWN),0,0);
}
}
return TRUE;
}
```

# 捕获鼠标
考虑一种情形：在窗口中按下左键并不松开，然后移动鼠标到本窗口外，则再发生鼠标消息此窗口是无法接收到的。若想接收，则需捕获鼠标。
```cpp
void CMainWindow::OnLButtonDown(UINT nFlags,CPoint point)
{
SetCapture();
}

void CMainWindow::OnLButtonUp(UINT nFlags,CPoint point)
{
if (GetCapture()==this)
{
ReleaseCapture();
}
}
```

那么就算鼠标在按下后离开了窗口，CMainWindow依然可以接收WM_MOUSEMOVE消息，若鼠标没有被捕获或被其他线程的窗口捕获，则GetCapture()返回NULL,可以判断捕获鼠标的窗口是否是自己：
```cpp
if (GetCapture()==this)
```

另：为防止应用程序独占鼠标，系统不会向鼠标键已释放是否但未释放捕获的窗口发送鼠标消息。

其他：
1. 设置光标：AfxGetApp()->LoadStandardCursor(IDC_CROSS);

2. 
```cpp
BOOL CMainWindow::OnSetCursor(CWnd*pWnd,UINT nHitTest,UINT message)
{
if (nHitTest==HTCLIENT)
{
::SetCursor(m_hCursor);
return TRUE;
}
return CFrameWnd::OnSetCursor(pWnd,nHitTest,message);
}
```

3. 利用OnSetCursor程序可以实现自定义的光标显示效果

4. 显示或隐藏光标： ::ShowCursor(TRUE/FALSE);

5. 沙漏型光标
```cpp
CWaitCursor wait; //构造函数显示沙漏型光标，析构函数恢复光标
wait.Restore();   //恢复光标为先前状态
```
如果要替换沙漏型光标，可以通过覆盖CWinApp的虚函数DoWaitCursor来更改。

6. ::GetCursorPos(); ::GetMessagePos(); SetCursorPos();

7. 
```cpp
::ClipCursor(&rect); //将光标锁定在rect区域内
::ClipCursor(NULL);   //解锁光标
```

输入焦点
```cpp
WM_SETFOCUS ->OnSetFocus
WM_KILLFOCUS->OnKillFocus

pWnd->SetFocus();
CWnd*pFocusWnd=CWnd::GetFocus();
```

# 击键消息
击键消息处理程序：
```cpp
afx_msg void OnMsgName(UINT nChar,UINT nRepCnt,UINT nFlags)
```

- nChar 为虚拟键代码，见P127表3-9
- nFlags是位标志见P126表；如果希望自己的程序不管自动重复输入产生的击键事件，则只须忽略先前键状态值（nFlags的第14位）为1的WM_KEYDOWN消息即可。

## shift状态及切换::GetKeyState(VK_SHIFT);
返回负值表示shift键被按下，参数同样可以是：
```cpp
VK_CONTROL,
VK_MENU(Alt键状态也可以通过nFlags的第13位标志测试)，也可以检测鼠标键(
VK_LBUTTON,
VK_MBUTTON,
VK_RBUTTON)
```

也可以测试NUM LOCK（VK_NUMLOCK）,Caps Lock（VK_CAPITAL）以及Scroll Lock（VK_SCROLL）键是否处于锁定状态，如：
```cpp
::GetKeyState(VK_NUMLOCK)&0x01
```

在Num Lock键被锁定时返回非零，否则返回零。

**注：** ::GetKeyState()不应该在键盘消息处理程序之外调用，若确定想知道键盘键或鼠标键的当前状态，或想在键盘消息处理程序之外检测键盘键或鼠标键，可以使用::GetAsyncKeyState().

GetAsyncKeyState判断鼠标左键是否处于按下的状态:GetAsyncKeyState(VK_LBUTTON)?b_lbdown=true:b_lbdown=false;

# 字符消息
::TranslateMessage()将与字符键有关的击键消息转换为WM_CHAR消息
```cpp
void CMainWindow::OnChar(UINT nChar,UINT nRepCnt,UINT nFlags)
{
if (nChar>=_T('A')&&nChar<=_T('Z'))
{
}
}
```

# 插入符
P133表3-10，插入符有关的处理函数


# 处理WM_LBUTTONDOWN，WM_LBUTTONUP，WM_MOUSEMOVE消息的Button
```cpp
#pragma once


// CMyButton

class CMyButton : public CButton {
	DECLARE_DYNAMIC(CMyButton)
private:
	BOOL m_bMouseDown;
public:
	HWND m_hHandle;
public:
	CMyButton();
	virtual ~CMyButton();

protected:
	afx_msg void OnLButtonDown(
		UINT nFlags,
		CPoint point
	);
	afx_msg void OnLButtonUp(
		UINT nFlags,
		CPoint point
	);
	afx_msg void OnMouseMove(
		UINT nFlags,
		CPoint point
	);

	DECLARE_MESSAGE_MAP()
};


// MyButton.cpp : 实现文件
//

#include "stdafx.h"
#include "GetUserList.h"
#include "MyButton.h"


// CMyButton

IMPLEMENT_DYNAMIC(CMyButton, CButton)

CMyButton::CMyButton() {
	m_bMouseDown = FALSE;
}

CMyButton::~CMyButton() {
}


BEGIN_MESSAGE_MAP(CMyButton, CButton)
	ON_WM_LBUTTONDOWN()
	ON_WM_LBUTTONUP()
	ON_WM_MOUSEMOVE()
END_MESSAGE_MAP()

// CMyButton 消息处理程序

void CMyButton::OnLButtonDown(
	UINT nFlags,
	CPoint point
) {
	m_bMouseDown = TRUE;
	SetCursor(AfxGetApp()->LoadCursor(IDC_CROSS));
	SetCapture();
}
void CMyButton::OnLButtonUp(
	UINT nFlags,
	CPoint point
) {
	m_bMouseDown = FALSE;
	ReleaseCapture();
	SetCursor(AfxGetApp()->LoadCursor(IDC_ARROW));
}
void CMyButton::OnMouseMove(
	UINT nFlags,
	CPoint point
) {
	if (m_bMouseDown) {
		POINT pt;
		GetCursorPos(&pt);
		m_hHandle = ::WindowFromPoint(pt);
		char szClass[100];
		GetClassName(m_hHandle, szClass, 100);
		this->SetWindowText(szClass);
	}

}
```

---

## 四、菜单
> 菜单系统与命令处理


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

---

## 五、MFC集合类
> 数组、列表与映射表

# 数组，MFC数组类CArray
在头文件Afxtempl.h中定义了CArray,它实际上是一个模板类,利用它可以创建任何数据类型的类型安全数组.
非模板化数组类定义在Afxcoll.h中,有:**CByteArray**,**CWordArray**,**CDwordArray**...

# 相关函数
- SetSize用来指定数组大小，重载“[]”运算符调用数组的SetAt函数或GetAt函数，
- InsertAt用以插入元素或一个数组。
- GetSize或GetUpperBound获取数组元素个数。
- 删除函数：RemoveAt，RemoveAll，如果数组元素保存的是指向对象的指针时，
要首先清除对象再删除数组元素以防止内存泄露：
```cpp
delete arr[i];
arr.RemoveAt(i);
```

- 动态调整数组大小：SetSize，SetAtGrow，Add

当减小数组时，SetSize并不会自动缩小保存数组数据的缓冲区，需要调用**FreeExtra**，如：
```cpp
array.SetSize(50);
array.SetSize(20);
array.FreeExtra();
```

同样，对于RemoveAt和RemoveAll之后再调用FreeExtra可以缩小数组空间为剩下元素需要的最新尺寸。

# 用CArray创建类型安全数组类
声明一个CPoint对象的类型安全数组：
```cpp
CArray<CPoint,CPoint&>array;
```
第一个参数指定了数组中的数据类型，第二个参数指定类型在参数列表中的表示方法。另：非模板化数组类CUIntArray可以如下定义：
```
typedef CArray<UINT ,UINT> CUIntArray;
```

# 列表
可以将之前讲述的数组看做是顺序存储的线性表，这里的列表视为链表，这里的列表是双向链表且不是循环的。

# MFC列表类
非模板化列表类有：CObList（数据类型：CObject指针），CPtrList（数据类型：void指针），CStringList（数据类型：Cstring）。
列表中的位置由抽象数值POSITION标示，POSITION实际上是指向CNode数据结构的指针。

# 用CList创建类型安全列表类
CList<CPoint,CPoint&>list;

如果在CList中使用了类而不是原始数据类型而且调用列表的Find函数，则必须实现下列之一：

1. 类重载==运算符
2. 覆盖模板函数CompareElements。

否则程序不会得到编译。

重载==运算符：
```cpp
class CPoint3D
{
public:
CPoint3D(){x=y=z=0}
CPoint3D(int xPos,int yPos,int zPos)
{
   x=xPos;
   y=yPos;
   z=zPos;
}
operator==(CPoint3D point)const
{
   return (x==point.x&&y==point.y&&z==point.z);
}
public:
int x,y,z;
};
```

覆盖模板函数CompareElements:
```cpp
class CPoint3D
{
public:
CPoint3D(){x=y=z=0}
CPoint3D(int xPos,int yPos,int zPos)
{
   x=xPos;
   y=yPos;
   z=zPos;
}
public:
int x,y,z;
};

BOOL AFXAPI CompareElements(const CPoint3D*P1,const CPoint3D*P2)
{
return(P1->x==P2->x&&P1->y==P2->y&&P1->z&&P2->z);
}
```

# 映射表
设计映射表的主要目的就是给定一个关键字，可以很快地在表中找到对应的项目，通常只查找一次。
映射表生成后不久，会为一个列表分配内存空间，该表实际上是一个指向CAssoc结构指针的数组，MFC使用CAssoc结构来给映射表添加项目和关键字。

例如CMapStringToString定义CAssoc：
```cpp
struct CAssoc
{
CAssoc*pNext;
UINT nHashKey;
CString key;
CString Value;
};
```
CAssoc结构存放在散列表数组中，索引号为：i=nHashValue%nHashTableSize,参见P254图5-1，如果索引号相同，则会链成一个链表。

# 用CMap创建类型安全映射表
CMap<CString,CString&,CPoint,CPoint&>map;
如果使用自己的类调用CMap::Lookup则仍需重载==运算符或覆盖CompareElements函数。

# 类型指针类
```cpp
CTypedPtrList<CObList,CLine*>list;
...
CLine*pLine=new CLine(x,0,x,100);
list.AddTail(pLine);                     //CLine*--》CObject*
...
CLine*pLine=list.GetNext(pos); //无需强制转换了
```

---

## 六、文件IO和串行化
> 文件操作与数据持久化

# 打开关闭和创建文件
```cpp
1.
CFile file;
if (file.Open(_T("File.txt"),CFile::modeReadWrite))
{
...
}

2.
CFile file(_T("File.txt"),CFile::modeReadWrite);
```

打开已存在文件,不存在则创建:
```cpp
CFile::modeReadWrite|CFile::modeCreate|CFile::modeNoTruncate
```

# 捕获异常:
```cpp
CFile file;
CFileException e;

if (file.Open(_T("File.txt"),CFile::modeReadWrite,&e))
{
...
}
else
{
e.ReportError();
}

// 或

try
{
CFile file(_T("File.txt"),CFile::modeReadWrite);
...
}
catch (CFileException* e)
{
e->ReportError();
e->Delete();
}
```

# 关闭文件:
- file.Close();

# 读和写相关函数:
- CFile::GetLength()
- CFile::GetPosition()
- CFile::Seek()
- CFile::Read()
- CFile::Write()

# CFile派生类
- CMemFile和CSharedFile允许内存可以像文件那样读写;
- CSocketFile对TCP/IP套接字进行了类似的抽象,有时把CSocketFile对象放在CSocket对象和CArchive对象之间,这样就可以用C++的插入符和提取符对打开的套接字进行读写了;
- COleStreamFile使流对象,即表示字节流的COM对象看上去像一个普通文件.
- CStdioFile将编程接口简化为文本文件,在继承CFile类时只增加了两个成员函数:ReadString/WriteString用来读一行或写一行文本.

# 枚举文件和文件夹
例程可以参见P265示例代码,其中判断枚举的是文件的代码为:
```cpp
if (!(fd.dwFileAttributes&FILE_ATTRIBUTE_DIRECTORY))
```

判断是文件夹的语句为:
```cpp
if (fd.dwFileAttributes&FILE_ATTRIBUTE_DIRECTORY)
{
CString name=fd.cFileName;
if (name!=_T(".")&&name!=_T(".."))
{
   //文件夹
}
}
```

# 串行化和CArchive类
MFC重载<<和>>运算符,这两个运算符和CArchive一起简化了串行化过程.
串行化的根本目的在于把应用程序持久数据保存到磁盘上或再从磁盘上读出来.
```cpp
file.Write(&a,sizeof(a));
```

另一种方法是创建CArchive对象,并用<<将整数串行化到文件中:
```cpp
CArchive ar(&file,CArchive::store);
ar<<a;
```

读取时:
```cpp
CArchive ar(&file,CArchive::load);
ar>>a;
```

# 编写可串行化类:
见P267--P277