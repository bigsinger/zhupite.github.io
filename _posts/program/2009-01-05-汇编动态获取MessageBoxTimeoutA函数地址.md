---
layout:		post
category:	"program"
title:		"汇编动态获取MessageBoxTimeoutA函数地址"
tags:		[]
---
- Content
{:toc}

```asm
.386
.model flat,stdcall
option casemap:none

include         windows.inc
include         kernel32.inc
includelib     kernel32.lib

_PROCVAR6     typedef proto :dword,:dword,:dword,:dword,:dword,:dword
PROCVAR6     typedef ptr _PROCVAR6

.data?
hDllInstance        dd             ?
lpMessageBoxTimeout     PROCVAR6     ?

.data
szCaption        db     'Test By Sing',0
szText             db     'MessageBoxTimeout! Wait for 3seconds...',0
szUser32dll        db     'user32.dll',0
szMessageBoxTimeoutA    db     'MessageBoxTimeoutA',0
        
.code
start:
    invoke     LoadLibrary,addr szUser32dll
    .if    eax
        mov         hDllInstance,eax
        invoke     GetProcAddress,hDllInstance,addr szMessageBoxTimeoutA
        mov         lpMessageBoxTimeout,eax
        invoke     lpMessageBoxTimeout,NULL,offset szText,offset szCaption,MB_OK,0,3000
    .endif
    invoke     ExitProcess,NULL
end     start
```