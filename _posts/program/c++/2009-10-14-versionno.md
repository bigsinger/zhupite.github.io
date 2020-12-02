---
layout:		post
category:	"program"
title:		"程序版本控制"
tags:		[c++]
---
- Content
{:toc}


1. 新建一个VersionNo.h头文件

```c
#define FILEVER        1,0,0,14
#define PRODUCTVER     1,0,0,14
#define STRFILEVER     "1,0,0,14"
#define STRPRODUCTVER  "1,0,0,14"
```

2. 在.rc文件中包含VersionNo.h头文件,并替换关键字.

如原来的rc资源文件内容为:
```c
VS_VERSION_INFO VERSIONINFO
FILEVERSION 1,0,0,1
PRODUCTVERSION 1,0,0,1
FILEFLAGSMASK 0x3fL
#ifdef _DEBUG
FILEFLAGS 0x1L
#else
FILEFLAGS 0x0L
#endif
FILEOS 0x4L
FILETYPE 0x1L
FILESUBTYPE 0x0L
BEGIN
BLOCK "StringFileInfo"
BEGIN
BLOCK "040904b0"
BEGIN
VALUE "Comments", "Sample Application\0"
VALUE "CompanyName", "Microsoft Corp.\0"
VALUE "FileDescription", "MyProject MFC Application\0"
VALUE "FileVersion", "1, 0, 0, 1\0"
VALUE "InternalName", "MyProject\0"
VALUE "LegalCopyright", "Copyright (C) 1999\0"
VALUE "OriginalFilename", "MyProject.EXE\0"
VALUE "ProductName", "MyProject Application\0"
VALUE "ProductVersion", "1, 0, 0, 1\0"
END
END
BLOCK "VarFileInfo"
BEGIN
VALUE "Translation", 0x409, 1200
END
END
```

替换为:
```c
#include "VersionNo.h"
VS_VERSION_INFO VERSIONINFO
FILEVERSION FILEVER
PRODUCTVERSION PRODUCTVER
FILEFLAGSMASK 0x3fL
#ifdef _DEBUG
FILEFLAGS 0x1L
#else
FILEFLAGS 0x0L
#endif
FILEOS 0x4L
FILETYPE 0x1L
FILESUBTYPE 0x0L
BEGIN
BLOCK "StringFileInfo"
BEGIN
BLOCK "080404b0"
BEGIN
VALUE "Comments", "\0"
VALUE "CompanyName", "\0"
VALUE "FileDescription", "22 Microsoft 基础类应用程序\0"
VALUE "FileVersion", STRFILEVER
VALUE "InternalName", "22\0"
VALUE "LegalCopyright", "版权所有 (C) 2007\0"
VALUE "LegalTrademarks", "\0"
VALUE "OriginalFilename", "22.EXE\0"
VALUE "PrivateBuild", "\0"
VALUE "ProductName", "22 应用程序\0"
VALUE "ProductVersion", STRPRODUCTVER
VALUE "SpecialBuild", "\0"
END
END
BLOCK "VarFileInfo"
BEGIN

;    VALUE "Translation", 0x804, 1200
END
END
```

3. 在你的工程源码中也可以方便使用FILEVER, PRODUCTVER ,STRFILEVER, STRPRODUCTVER.
只需包含VersionNo.h头文件即可。

4. 每放出一个版本只要修改VersionNo.h头文件中的版本号，然后编译程序就行了。