---
layout: 	post
category:	"duilib"
title:		DUILIB的消息处理HandleMessage
tags:		[duilib,ui]
---

duilib还提供了另外一种响应的方法，即消息映射**DUI_BEGIN_MESSAGE_MAP**，可以将**DUI_MSGTYPE_CLICK**消息映射到指定的函数（比如OnClick），这和在Notify判断msg.sType是一样的效果，具体请参见duilib的RichListDemo。
    
先看看下面几段代码：
```c
DUI_BEGIN_MESSAGE_MAP(CPage1, CNotifyPump)
    DUI_ON_MSGTYPE(DUI_MSGTYPE_CLICK,OnClick)
    DUI_ON_MSGTYPE(DUI_MSGTYPE_SELECTCHANGED,OnSelectChanged)
    DUI_ON_MSGTYPE(DUI_MSGTYPE_ITEMCLICK,OnItemClick)
DUI_END_MESSAGE_MAP()
```

```c
LRESULT HandleMessage(UINT uMsg, WPARAM wParam, LPARAM lParam)
{
    LRESULT lRes = 0;
    BOOL bHandled = TRUE;
    switch (uMsg)
    {
    case WM_KEYDOWN:        lRes = OnKeyDown(uMsg, wParam, lParam, bHandled); break;
    case WM_LBUTTONDOWN:    lRes = OnLButtonDown(uMsg, wParam, lParam, bHandled); break;
    case WM_MOUSEMOVE:      lRes = OnMouseMove(uMsg, wParam, lParam, bHandled); break;
    default:                bHandled = FALSE; break;
    }
    if (bHandled) return lRes;
 
    return CWindowWnd::HandleMessage(uMsg, wParam, lParam);
}
```

```c
void Notify(TNotifyUI& msg)
{
    if( msg.sType == _T("windowinit") )
    {
    }      
    else if( msg.sType == _T("click") )
    {
    }
}  
```