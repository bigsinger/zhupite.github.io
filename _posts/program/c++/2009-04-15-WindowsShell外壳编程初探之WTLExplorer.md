---
layout:		post
category:	"program"
title:		"WindowsShell外壳编程初探之WTLExplorer"
tags:		[mfc,c++]
---
- Content
{:toc}


今天被"Windows Shell外壳编程"搞残了.本来就是想在自己的应用程序中浏览文件,右键能够显示系统菜单.但是网上搜了一大堆资料都是讲"Shell扩展编程"的,差点没把我气死.后来在看雪找到了一个主题,见:http://bbs.pediy.com/showthread.php?p=573210

下载了一个"WTLExplorer",哇塞!妈妈咪呀!这正是我所想要的,不过很可惜弹出的系统菜单不支持子菜单项的现实,于是又修改了一下终于可行了.

将ShellMgr.cpp文件中的DoContextMenu函数修改为:
```cpp
BOOL CShellMgr::DoContextMenu(HWND hWnd, LPSHELLFOLDER lpsfParent, LPITEMIDLIST lpi, POINT point) {
	LPCONTEXTMENU spContextMenu;
	LPCONTEXTMENU pCtxMenuTemp = NULL;
	int menuType = 0;
	g_pIContext2 = NULL;
	g_pIContext3 = NULL;

	HRESULT hr = lpsfParent->GetUIObjectOf(hWnd, 1, (const struct _ITEMIDLIST**)&lpi, IID_IContextMenu, 0, (LPVOID*)&pCtxMenuTemp);
	if (FAILED(hr))
		return FALSE;

	if (pCtxMenuTemp->QueryInterface(IID_IContextMenu3, (void**)&spContextMenu) == NO_ERROR) {
		menuType = 3;
	} else if (pCtxMenuTemp->QueryInterface(IID_IContextMenu2, (void**)&spContextMenu) == NO_ERROR) {
		menuType = 2;
	} else if (pCtxMenuTemp->QueryInterface(IID_IContextMenu, (void**)&spContextMenu) == NO_ERROR) {
		menuType = 1;
	}

	HMENU hMenu = ::CreatePopupMenu();
	if (hMenu == NULL)
		return FALSE;

	// Get the context menu for the item.
	hr = spContextMenu->QueryContextMenu(hMenu, 0, 1, 0x7FFF, CMF_EXPLORE | CMF_NORMAL);
	if (FAILED(hr))
		return FALSE;

	// subclass window
	WNDPROC oldWndProc = NULL;
	if (menuType > 1) {
		// only subclass if it is IID_IContextMenu2 or IID_IContextMenu3
		oldWndProc = (WNDPROC)::SetWindowLongPtr(hWnd, GWL_WNDPROC, (LONG)HookWndProc);
		if (menuType == 2) {
			g_pIContext2 = (LPCONTEXTMENU2)spContextMenu;
		} else {
			g_pIContext3 = (LPCONTEXTMENU3)spContextMenu;
		}
	}

	int idCmd = ::TrackPopupMenu(hMenu, TPM_LEFTALIGN | TPM_RETURNCMD | TPM_RIGHTBUTTON, point.x, point.y, 0, hWnd, NULL);

	// unsubclass
	if (oldWndProc) {
		SetWindowLongPtr(hWnd, GWL_WNDPROC, (LONG)oldWndProc);
	}

	if (idCmd != 0) {
		USES_CONVERSION;

		// Execute the command that was selected.
		CMINVOKECOMMANDINFO cmi = { 0 };
		cmi.cbSize = sizeof(CMINVOKECOMMANDINFO);
		cmi.fMask = 0;
		cmi.hwnd = hWnd;
		cmi.lpVerb = T2CA(MAKEINTRESOURCE(idCmd - 1));
		cmi.lpParameters = NULL;
		cmi.lpDirectory = NULL;
		cmi.nShow = SW_SHOWNORMAL;
		cmi.dwHotKey = 0;
		cmi.hIcon = NULL;
		hr = spContextMenu->InvokeCommand(&cmi);
	}

	::DestroyMenu(hMenu);

	return TRUE;
}
```

再添加一个静态函数HookWndProc:
```cpp
static LRESULT CALLBACK HookWndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam) {
	switch (message) {
	case WM_MENUCHAR: // only supported by IContextMenu3
		if (g_pIContext3) {
			LRESULT lResult = 0;
			g_pIContext3->HandleMenuMsg2(message, wParam, lParam, &lResult);
			return(lResult);
		}
		break;
	case WM_DRAWITEM:
	case WM_MEASUREITEM:
		if (wParam) {
			break; // if wParam != 0 then the message is not menu-related
		}

	case WM_INITMENUPOPUP:
		if (g_pIContext2) {
			g_pIContext2->HandleMenuMsg(message, wParam, lParam);
		} else {
			g_pIContext3->HandleMenuMsg(message, wParam, lParam);
		}

		return(message == WM_INITMENUPOPUP ? 0 : TRUE);
		break;
	default:
		break;
	}

	return ::CallWindowProc((WNDPROC)GetProp(hWnd, TEXT("oldWndProc")), hWnd, message, wParam, lParam);
}
```

这样就能显示系统菜单的子菜单项了,效果如图:

![](http://hiphotos.baidu.com/asmcvc/pic/item/acd0f0229668cdd1d6cae268.jpg)