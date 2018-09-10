---
layout:		post
category:	"python"
title:		"Python按指定键求最大最小元素"
tags:		[python]
---
- Content
{:toc}


按指定键求字典最大最小元素：
```python
min(rows, key=itemgetter('uid'))
# {'fname': 'John', 'lname': 'Cleese', 'uid': 1001}
max(rows, key=itemgetter('uid'))
# {'fname': 'Big', 'lname': 'Jones', 'uid': 1004}
```

关联：[operator.itemgetter](./python-sorted.html)