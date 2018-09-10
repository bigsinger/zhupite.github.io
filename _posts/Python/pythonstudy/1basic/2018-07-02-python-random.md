---
layout:		post
category:	"python"
title:		"Python随机数random"
tags:		[python]
---
- Content
{:toc}

```python
import random
values = [1, 2, 3, 4, 5, 6]

# 随机取1个元素
print(random.choice(values))    # 3

# 随机取样：取若干个元素
print(random.sample(values, 3)) # [2, 5, 4]

# 生成随机数
print(random.randint(0,10))     # 7

# 生成0到1范围内均匀分布的浮点数
random.seed()                   # Seed based on system time or os.urandom()
random.seed(12345)              # Seed based on integer given
random.seed(b'bytedata')        # Seed based on byte data
print(random.random())          # 0.5760441534182749
```