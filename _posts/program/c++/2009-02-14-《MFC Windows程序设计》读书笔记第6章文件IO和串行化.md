---
layout:		post
category:	"program"
title:		"《MFC Windows程序设计》读书笔记第6章文件IO和串行化"
tags:		[mfc,c++]
---
- Content
{:toc}

# 打开关闭和创建文件
```cpp
1.
CFile file;
if (file.Open(_T("File.txt"),CFile::modeReadWrite))
{
...
}

2.
CFile file(_T("File.txt"),CFile::modeReadWrite);
```

打开已存在文件,不存在则创建:
```cpp
CFile::modeReadWrite|CFile::modeCreate|CFile::modeNoTruncate
```

# 捕获异常:
```cpp
CFile file;
CFileException e;

if (file.Open(_T("File.txt"),CFile::modeReadWrite,&e))
{
...
}
else
{
e.ReportError();
}

// 或

try
{
CFile file(_T("File.txt"),CFile::modeReadWrite);
...
}
catch (CFileException* e)
{
e->ReportError();
e->Delete();
}
```

# 关闭文件:
- file.Close();

# 读和写相关函数:
- CFile::GetLength()
- CFile::GetPosition()
- CFile::Seek()
- CFile::Read()
- CFile::Write()

# CFile派生类
- CMemFile和CSharedFile允许内存可以像文件那样读写;
- CSocketFile对TCP/IP套接字进行了类似的抽象,有时把CSocketFile对象放在CSocket对象和CArchive对象之间,这样就可以用C++的插入符和提取符对打开的套接字进行读写了;
- COleStreamFile使流对象,即表示字节流的COM对象看上去像一个普通文件.
- CStdioFile将编程接口简化为文本文件,在继承CFile类时只增加了两个成员函数:ReadString/WriteString用来读一行或写一行文本.

# 枚举文件和文件夹
例程可以参见P265示例代码,其中判断枚举的是文件的代码为:
```cpp
if (!(fd.dwFileAttributes&FILE_ATTRIBUTE_DIRECTORY))
```

判断是文件夹的语句为:
```cpp
if (fd.dwFileAttributes&FILE_ATTRIBUTE_DIRECTORY)
{
CString name=fd.cFileName;
if (name!=_T(".")&&name!=_T(".."))
{
   //文件夹
}
}
```

# 串行化和CArchive类
MFC重载<<和>>运算符,这两个运算符和CArchive一起简化了串行化过程.
串行化的根本目的在于把应用程序持久数据保存到磁盘上或再从磁盘上读出来.
```cpp
file.Write(&a,sizeof(a));
```

另一种方法是创建CArchive对象,并用<<将整数串行化到文件中:
```cpp
CArchive ar(&file,CArchive::store);
ar<<a;
```

读取时:
```cpp
CArchive ar(&file,CArchive::load);
ar>>a;
```

# 编写可串行化类:
见P267--P277