---
layout:		post
category:	"python"
title:		"Python的排序函数sorted"
tags:		[python]
---
- Content
{:toc}

使用operator.itemgetter和sorted

```python
rows = [
    {'fname': 'Brian', 'lname': 'Jones', 'uid': 1003},
    {'fname': 'David', 'lname': 'Beazley', 'uid': 1002},
    {'fname': 'John', 'lname': 'Cleese', 'uid': 1001},
    {'fname': 'Big', 'lname': 'Jones', 'uid': 1004}
]

from operator import itemgetter
rows_by_fname = sorted(rows, key=itemgetter('fname'))
rows_by_uid = sorted(rows, key=itemgetter('uid'))
print(rows_by_fname)
print(rows_by_uid)

itemgetter() 函数也支持多个 keys，比如下面的代码
rows_by_lfname = sorted(rows, key=itemgetter('lname','fname'))
print(rows_by_lfname)

rows_by_fname = sorted(rows, key=lambda r: r['fname'])
rows_by_lfname = sorted(rows, key=lambda r: (r['lname'],r['fname']))
```
但是lambda表达式没有itemgetter速度快。

```python
min(rows, key=itemgetter('uid'))
# {'fname': 'John', 'lname': 'Cleese', 'uid': 1001}
max(rows, key=itemgetter('uid'))
# {'fname': 'Big', 'lname': 'Jones', 'uid': 1004}
```