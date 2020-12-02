---
layout:		post
category:	"python"
title:		"Python的zip函数"
tags:		[python]
---
- Content
{:toc}

zip() 函数创建的是一个只能访问一次的迭代器


```
x = [1, 2, 3]

y = [4, 5, 6]

z = [7, 8, 9]

xyz = zip(x, y, z)

print xyz #[(1, 4, 7), (2, 5, 8), (3, 6, 9)]

u = zip(*xyz)

print u #[(1, 2, 3), (4, 5, 6), (7, 8, 9)]
```

## 参考：
- [Python的zip函数 \- frydsh \- 博客园](http://www.cnblogs.com/frydsh/archive/2012/07/10/2585370.html)