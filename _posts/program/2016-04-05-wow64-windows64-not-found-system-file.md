---
layout:		post
category:	"program"
title:		"Windows64位下系统文件提示找不到"
tags:		[c++]
---

```C
PVOID OldValue = NULL;
Wow64DisableWow64FsRedirection(&OldValue);
if ( GetFileAttributes(stShortcut.strTarget)!=-1 ) {
	ShellExecute(NULL, "open", stShortcut.strTarget, stShortcut.strParams, stShortcut.strStartPath, SW_NORMAL);
}else{
	AfxMessageBox("目标文件不存在：\n" + stShortcut.strTarget);
}
Wow64EnableWow64FsRedirection(TRUE);
```