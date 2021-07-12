---

layout:		post
category:	"program"
title:		".NET Framework的项目工程转换为.NET项目工程"
tags:		[c#,net]
---
- Content
{:toc}
打开powershell，输入命令进行安装：

```
dotnet tool install -g try-convert
```



进入到项目工程目录进行转换，可以指定解决方案文件名：

```
cd path_to_project
try-convert
try-convert -w xxx.sln
```



