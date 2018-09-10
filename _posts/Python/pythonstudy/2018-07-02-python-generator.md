---
layout:		post
category:	"python"
title:		"Python的生成器表达式"
tags:		[python]
---
- Content
{:toc}


```python
nums = [1, 2, 3, 4, 5]
s = sum(x * x for x in nums)


t = ('ACME', 50, 123.45)
s = ','.join(str(x) for x in t)


portfolio = [
    {'name':'GOOG', 'shares': 50},
    {'name':'YHOO', 'shares': 75},
    {'name':'AOL', 'shares': 20},
    {'name':'SCOX', 'shares': 65}
]
min_shares = min(s['shares'] for s in portfolio)
```