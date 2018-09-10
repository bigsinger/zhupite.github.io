---
layout:		post
category:	"python"
title:		"Python切片slice"
tags:		[python]
---
- Content
{:toc}

[start, stop, step = 1)

切片可以跟常量定义在一起，方便修改和使用：
```python
record = '....................100 .......513.25 ..........'
cost = int(record[20:23]) * float(record[31:37])
print(cost)

SHARES = slice(20, 23)
PRICE = slice(31, 37)
cost = int(record[SHARES]) * float(record[PRICE])
print(cost)
```

替换和删除列表中的元素：
```python
items = [0, 1, 2, 3, 4, 5, 6]
a = slice(2, 4)
print(items[2:4])
print(items[a])
items[a] = [10,11]
print(items)            # [0, 1, 10, 11, 4, 5, 6]
del items[a]
print(items)            # [0, 1, 4, 5, 6]
```
