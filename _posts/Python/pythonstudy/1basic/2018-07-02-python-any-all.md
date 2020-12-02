---
layout:		post
category:	"python"
title:		"Python的any all"
tags:		[python]
---
- Content
{:toc}

- any: 只要满足一个条件为True就返回True否则返回False。
- all: 全部条件满足True才返回True否则返回False。

如下脚本判断某目录下是否存在.py后缀的文件：

```python
import os
files = os.listdir('dirname')
if any(name.endswith('.py') for name in files):
    print('There be python!')
else:
    print('Sorry, no python.')

if any(name.endswith(('.c', '.h')) for name in listdir(dirname)):
    ...
```