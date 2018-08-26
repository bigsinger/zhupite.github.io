---
layout: 	post
category:	"duilib"
title:		duilib在界面中创建自定义控件
tags:		[duilib,ui]
date:		2015-10-20
---
```c
CControlUI* CDuiFrameWnd::CreateControl( LPCTSTR pstrClassName )
{
    if (_tcsicmp(pstrClassName, _T("WndPlayPanel")) == 0)
    {
        CDialogBuilder builder;
        CControlUI* pUI = builder.Create(_T("WndPlayPanel.xml"));
        return pUI;
    }

    return NULL;
}
```