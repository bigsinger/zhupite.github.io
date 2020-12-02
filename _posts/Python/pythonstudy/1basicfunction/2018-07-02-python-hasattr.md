---
layout:		post
category:	"python"
title:		"Python的hasattr"
tags:		[python]
---
- Content
{:toc}



```python
class Coordinate:
    x = 10
    y = -5
    z = 0

point1 = Coordinate()
print(hasattr(point1, 'x'))
print(hasattr(point1, 'y'))
print(hasattr(point1, 'z'))
print(hasattr(point1, 'no'))  # 没有该属性

```

关联：[Python的getattr](./python-getattr.html)