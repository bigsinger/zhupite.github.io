---
layout:		post
category:	"program"
title:		"《MFC Windows程序设计》读书笔记第3章鼠标和键盘"
tags:		[mfc,c++]
---
- Content
{:toc}

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