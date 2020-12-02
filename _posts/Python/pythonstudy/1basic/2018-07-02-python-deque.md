---
layout:		post
category:	"python"
title:		"Python的队列deque"
tags:		[python]
---
- Content
{:toc}

使用 **deque(maxlen=N)** 构造函数会新建一个固定大小的队列。当新的元素加入并且这个队列已满的时候，最老的元素会自动被移除掉，可以满足只保留最后最近N个元素的需求。
```python
from collections import deque
d = deque(5)
d.append(5)
d.pop()

d.appendleft(4)
d.popleft()
```
如果你不设置最大队列大小，那么就会得到一个无限大小队列，你可以在队列的两端执行添加和弹出元素的操作。

在队列两端插入或删除元素时间复杂度都是 O(1) ，区别于列表，在列表的开头插入或删除元素的时间复杂度为 O(N) 。

# 删除相同元素并保持顺序
如果仅仅是消除重复元素，通常可以简单的构造一个集合。然而，这种方法不能维护元素的顺序，生成的结果中的元素位置被打乱。
```python
def dedupe(items):
    seen = set()
    for item in items:
        if item not in seen:
            yield item
            seen.add(item)

a = [1, 5, 2, 1, 9, 1, 5, 10]

list(dedupe(a)) # [1, 5, 2, 9, 10]
```

```python
def dedupe(items, key=None):
    seen = set()
    for item in items:
        val = item if key is None else key(item)
        if val not in seen:
            yield item
            seen.add(val)

a = [ {'x':1, 'y':2}, {'x':1, 'y':3}, {'x':1, 'y':2}, {'x':2, 'y':4}]
l = list(dedupe(a, key=lambda d: (d['x'],d['y'])))
# [{'x': 1, 'y': 2}, {'x': 1, 'y': 3}, {'x': 2, 'y': 4}]
list(dedupe(a, key=lambda d: d['x']))
# [{'x': 1, 'y': 2}, {'x': 2, 'y': 4}]
```

如果想读取一个文件，消除重复行，可以像这样做：
```python
with open(somefile,'r') as f:
   for line in dedupe(f):
```