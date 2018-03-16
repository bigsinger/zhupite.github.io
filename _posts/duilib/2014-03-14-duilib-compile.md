---
layout: 	post
category:	"duilib"
title:		如何编译duilib
tags:		[duilib,ui]
date:		2014-03-14
---


## 编译错误：
```None
1>f:\xxx\duilib\Control/UIWebBrowser.h(76) : error C2061: 语法错误: 标识符“ __RPC__out”
1>f:\xxx\duilib\Control/UIWebBrowser.h(77) : error C2061: 语法错误: 标识符“ __RPC__deref_out_opt”
1>f:\xxx\duilib\Control/UIWebBrowser.h(78) : error C2061: 语法错误: 标识符“ __RPC__in”
1>f:\xxx\duilib\Control/UIWebBrowser.h(78) : error C2059: 语法错误: “ )”
1>f:\xxx\duilib\Control/UIWebBrowser.h(78) : error C2143: 语法错误: 缺少“ )”( 在“;”的前面 )
1>f:\xxx\duilib\Control/UIWebBrowser.h(102) : error C2061: 语法错误: 标识符“ __RPC__in_opt”
1>f:\xxx\duilib\Control/UIWebBrowser.h(102) : error C2059: 语法错误: “ )”
1>f:\xxx\duilib\Control/UIWebBrowser.h(102) : error C2143: 语法错误: 缺少“ )”( 在“;”的前面 )
1>f:\xxx\duilib\Control/UIWebBrowser.h(103) : error C2061: 语法错误: 标识符“ __RPC__in_opt”
1>f:\xxx\duilib\Control/UIFlash.h(36) : error C2061: 语法错误: 标识符“ __RPC__out”
1>f:\xxx\duilib\Control/UIFlash.h(37) : error C2061: 语法错误: 标识符“ __RPC__deref_out_opt”
1>f:\xxx\duilib\Control/UIFlash.h(38) : error C2061: 语法错误: 标识符“ __RPC__in”
1>f:\xxx\duilib\Control/UIFlash.h(38) : error C2059: 语法错误: “ )”
1>f:\xxx\duilib\Control/UIFlash.h(38) : error C2143: 语法错误: 缺少“ )”( 在“;”的前面 )
```

**解决方案：**
在StdAfx.h头文件中添加包含：
```
#include <rpcsal.h>
```
注意这个文件在DirectX\Include目录中，因此需要在工程属性的C++目录中设置这个包含目录。

## 链接错误：
1>UILabel.obj : error LNK2001: 无法解析的外部符号 "unsigned int (__stdcall* ATL::g_pfnGetThreadACP)(void)" (?g_pfnGetThreadACP@ATL@@3P6GIXZA)
1>UIWebBrowser.obj : error LNK2001: 无法解析的外部符号 "unsigned int (__stdcall* ATL::g_pfnGetThreadACP)(void)" (?g_pfnGetThreadACP@ATL@@3P6GIXZA)
1>../bin/DuiLib_d.dll : fatal error LNK1120: 1 个无法解析的外部命令

**解决方案：**
在StdAfx.cpp文件中添加库文件：
```
#pragma comment (lib , "atls.lib" )
```



