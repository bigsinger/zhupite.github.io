---
layout:		post
category:	"python"
title:		"Python删除字符串两端不需要的字符"
tags:		[python]
---
- Content
{:toc}

```python
s = ' hello world \n'
s.strip()               # 'hello world'
s.lstrip()              # 'hello world \n'
s.rstrip()              # ' hello world'

t = '-----hello====='
t.lstrip('-')           # 'hello====='
t.strip('-=')           # 'hello'
```

从文件中读取多行数据，配合生成器表达式：
```python
with open(filename) as f:
    lines = (line.strip() for line in f)
    for line in lines:
        print(line)
```