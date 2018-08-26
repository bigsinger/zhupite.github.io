---
layout: 	post
category:	"duilib"
title:		可以考虑将DUILIB皮肤工程添加到VisualStudio的工程向导里去制作代码模板
tags:		[duilib,ui]
---

参考：
ref:http://www.codeproject.com/Articles/43653/Visual-C-Express-Custom-Wizard


可重用的代码模板：
```c
class CDuiFrameWnd : public WindowImplBase
{
public:
    virtual LPCTSTR    GetWindowClassName() const   {   return _T("DUIMainFrame");  }
    virtual CDuiString GetSkinFile()                {   return _T("duilib.xml");  }
    virtual CDuiString GetSkinFolder()              {   return _T("");  }
};
```
```c
int APIENTRY _tWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPTSTR lpCmdLine, int nCmdShow)
{
    CPaintManagerUI::SetInstance(hInstance);

    CDuiFrameWnd duiFrame;
    duiFrame.Create(NULL, _T("DUIWnd"), UI_WNDSTYLE_FRAME, WS_EX_WINDOWEDGE);
    duiFrame.CenterWindow();
    duiFrame.ShowModal();
    return 0;
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Window size="800,600"> <!-- 窗口的初始尺寸 -->
    <HorizontalLayout bkcolor="#FF00FF00"> <!-- 整个窗口的背景 -->
        <Button name="btnHello" text="Hello World"/> <!-- 按钮的属性，如名称、文本 -->
    </HorizontalLayout>
</Window>
```