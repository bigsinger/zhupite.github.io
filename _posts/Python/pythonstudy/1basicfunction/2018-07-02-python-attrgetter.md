---
layout:		post
category:	"python"
title:		"Python的attrgetter"
tags:		[python]
---
- Content
{:toc}



```python
class User:
    def __init__(self, user_id):
        self.user_id = user_id

    def __repr__(self):
        return 'User({})'.format(self.user_id)

users = [User(23), User(3), User(99)]
print(sorted(users, key=lambda u: u.user_id))
from operator import attrgetter
print(sorted(users, key=attrgetter('user_id')))
```

关联：[使用sorted对字典的排序](./python-sorted.html)、[operator.itemgetter](./python-sorted.html)