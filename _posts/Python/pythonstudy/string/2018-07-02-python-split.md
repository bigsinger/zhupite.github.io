---
layout:		post
category:	"python"
title:		"Python字符串分割split"
tags:		[python]
---
- Content
{:toc}

函数 re.split() 是非常实用的，因为它允许你为分隔符指定多个正则模式。分隔符可以是逗号，分号或者是空格，并且后面紧跟着任意个的空格。
```python
line = 'asdf fjdk; afed, fjek,asdf, foo'
import re
re.split(r'[;,\s]\s*', line) # ['asdf', 'fjdk', 'afed', 'fjek', 'asdf', 'foo']
```

关联：[join](./python-join.html)