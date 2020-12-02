---
layout:		post
category:	"program"
title:		"MFC注册系统热键RegisterHotKey"
tags:		[mfc,c++]
---
- Content
{:toc}

```cpp
// .h 中添加
afx_msg LRESULT OnHotKey(WPARAM   wParam,LPARAM   lParam);


// .cpp 中添加
BEGIN_MESSAGE_MAP(CNewsDlg, CDialog)
    ON_WM_PAINT()
    ON_WM_QUERYDRAGICON()
    //}}AFX_MSG_MAP
    ON_WM_LBUTTONDOWN()
    ON_WM_ERASEBKGND()
    ON_WM_CREATE()
    ON_WM_DESTROY()
    ON_WM_MOVE()
    ON_WM_TIMER()
    ON_MESSAGE(WM_HOTKEY,OnHotKey) //添加内容
END_MESSAGE_MAP()


void CNewsDlg::SetHotKey(void)
{
	::RegisterHotKey(m_hWnd,9999,MOD_CONTROL   |   MOD_WIN,   'K'); 
}

void CNewsDlg::UnHotKey(void)
{
	BOOL m_iskeyUnregistered = UnregisterHotKey(GetSafeHwnd(),9999);
}

LRESULT CNewsDlg::OnHotKey(WPARAM   wParam,LPARAM   lParam)
{ 
    if(!::IsWindowVisible(m_hWnd)) ShowWindow(SW_SHOW); //显示窗口 
    else ShowWindow(SW_HIDE); //隐藏窗口 
    return 0;
}
```