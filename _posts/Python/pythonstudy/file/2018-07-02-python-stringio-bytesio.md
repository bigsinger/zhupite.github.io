---
layout:		post
category:	"python"
title:		"Python字符串IO模拟文件"
tags:		[python]
---
- Content
{:toc}

使用 io.StringIO() 和 io.BytesIO() 类来创建类似文件操作字符串数据，但是并不能提供一个可供操作的文件对象指针，可以用于简单的单元测试。
```python
s = io.StringIO()
s.write('Hello World\n')        # 12
print('This is a test', file=s) # 15

# Get all of the data written so far
s.getvalue()    # 'Hello World\nThis is a test\n'

# Wrap a file interface around an existing string
s = io.StringIO('Hello\nWorld\n')
s.read(4)       # 'Hell'
s.read()        # 'o\nWorld\n'
```

io.StringIO 只能用于文本。如果你要操作二进制数据，要使用 io.BytesIO 类来代替。
```python
s = io.BytesIO()
s.write(b'binary data')
s.getvalue()                # b'binary data'
```

# 关联
- [Python文件操作](./python-file.html)