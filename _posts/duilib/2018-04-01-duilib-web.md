---
layout:		post
category:	"duilib"
title:		"duilib创建IE浏览器的方式"
tags:		[duilib,ui]
---

### 方式一：
```xml
<ActiveX name="web" clsid="{8856F961-340A-11D0-A96B-00C04FD705A2}" delaycreate="false" />
```
这个方法更通用，也可以创建其他ActiveX控件，但是如果指定要创建浏览器的话不建议这么做，被坑了N多年。

### 方式二：
```xml
<WebBrowserEx name="web" clsid="{8856F961-340A-11D0-A96B-00C04FD705A2}" delaycreate="true" homepage="www.xxx.com" autonavi="true"/>
```
推荐该方法，主要参考：[HackerJLY/CPP\_JS\_Inter\_Call\_In\_DuiLib: CPP\_JS\_Inter\_Call\_In\_DuiLib, IE WebBrowser](https://github.com/HackerJLY/CPP_JS_Inter_Call_In_DuiLib)

### 方法三：
自定义节点的办法，例如在pageTab1.xml皮肤文件里添加一个自定义名称的节点：
```xml
<web />
```
然后重载函数CreateControl：
```c
CControlUI* CMainWnd::CreateControl(LPCTSTR pstrClass)
{
	if (_tcscmp(pstrClass, _T("pageTab1")) == 0) {
		return new CPageXXX1UI;
	}
	else if (_tcscmp(pstrClass, _T("pageTab2")) == 0) {
		return new CPageXXX2UI;
	}
	return NULL;
}
```
假设web是
```c
class CDialogBuilderCallbackOfPageXXX1UI : IDialogBuilderCallback
{
public:
	virtual CControlUI* CreateControl(LPCTSTR pstrClass) {
		CControlUI* pCtrl = NULL;

		if (_tcscmp(pstrClass, _T("web")) == 0) {
			CWebWnd *pBrowser = new CWebWnd();
			pBrowser->SetParentWnd(g_pMainWnd->GetHWND());
			pCtrl = (CControlUI *)pBrowser;

			pBrowser->OpenWebBrowser();
			wstring sUrl = L"www.baidu.com";
			VARIANT url;
			url.vt = VT_LPWSTR;
			url.bstrVal = (BSTR)sUrl.c_str();
			pBrowser->OpenURL(&url);

			RECT rect;
			rect.top = 0;
			rect.left = 0;
			rect.right = 500;
			rect.bottom = 500;
			pBrowser->SetWebRect(&rect);
		}
		return pCtrl;
	}
};

class CPageXXX1UI : public CContainerUI
{
public:
	CPageXXX1UI()
	{
		CDialogBuilder builder;
		CContainerUI* pPage = static_cast<CContainerUI*>(builder.Create(_T("pageTab1.xml"), (UINT)0, (DuiLib::IDialogBuilderCallback *)new CDialogBuilderCallbackOfPageXXX1UI(), g_pPaintManager));
		if(pPage) {
			this->Add(pPage);
		}
		else {
			this->RemoveAll();
			return;
		}
	}
};
```
这种方法略微麻烦，但是可定制性强一点，如果不想使用IE内核的浏览器，可以在代码里面创建基于其他内核的浏览器，例如CEF。