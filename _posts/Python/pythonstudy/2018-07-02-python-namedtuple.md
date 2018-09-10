---
layout:		post
category:	"python"
title:		"Python的命名元组结构体namedtuple"
tags:		[python]
---
- Content
{:toc}

命名元组另一个用途就是作为字典的替代，因为字典存储需要更多的内存空间。 如果你需要构建一个非常大的包含字典的数据结构，那么**使用命名元组会更加高效**。 但是需要注意的是，不像字典那样，一个命名元组是不可更改的。
```python
from collections import namedtuple
Subscriber = namedtuple('Subscriber', ['addr', 'joined'])
sub = Subscriber('jonesy@example.com', '2012-10-19')
Subscriber(addr='jonesy@example.com', joined='2012-10-19')
```

如果你真的需要改变属性的值，那么可以使用命名元组实例的 **_replace()** 方法， 它会创建一个全新的命名元组并将对应的字段用新的值取代。
```python
Stock = namedtuple('Stock', ['name', 'shares', 'price'])
s = Stock('ACME', 100, 123.45)
s = s._replace(shares=75)
```