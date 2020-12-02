---
layout:		post
category:	"python"
title:		"Python defaultdict多值字典"
tags:		[python]
---
- Content
{:toc}

```python
d = {
    'a' : [1, 2, 3],
    'b' : [4, 5]
}
```

一般来讲，创建一个多值映射字典是很简单的。但是，如果你选择自己实现的话，那么对于值的初始化可能会有点麻烦， 你可能会像下面这样来实现：
```python
d = {}
for key, value in pairs:
    if key not in d:
        d[key] = []
    d[key].append(value)

# 如果使用 defaultdict 的话代码就更加简洁了：
d = defaultdict(list)
for key, value in pairs:
    d[key].append(value)
```
