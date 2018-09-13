---
layout:		post
category:	"program"
title:		"通过manifest文件使VC应用程序获得管理员权限"
tags:		[c++]
---
- Content
{:toc}

还有这个东西 超恶心，我吐啊吐

VC编译出来的应用程序在vista下运行，有可能因为权限问题，不能成功运行。

用以下办法，给应用程序添加一个manifest文件，程序运行时系统就会跳出UAC对话框，获得管理权限。

1.打开应用程序的源代码工程

2.添加一个“custom”资源,"resource type"填24,把资源ID改为1，然后把以下内容复制到资源内容中保存
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
<assemblyIdentity
version="1.0.0.0"
processorArchitecture="X86"
name="mulitray.exe.manifest"
type="win32"
/>
<trustInfo xmlns="urn:schemas-microsoft-com:asm.v3">
<security>
<requestedPrivileges>
<requestedExecutionLevel level="requireAdministrator" uiAccess="false"/>
</requestedPrivileges>
</security>
</trustInfo>
</assembly>
```