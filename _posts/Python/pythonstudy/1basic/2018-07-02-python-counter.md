---
layout:		post
category:	"python"
title:		"Python的collections.Counter出现频率最高的元素"
tags:		[python]
---
- Content
{:toc}


```python
words = [
    'look', 'into', 'my', 'eyes', 'look', 'into', 'my', 'eyes',
    'the', 'eyes', 'the', 'eyes', 'the', 'eyes', 'not', 'around', 'the',
    'eyes', "don't", 'look', 'around', 'the', 'eyes', 'look', 'into',
    'my', 'eyes', "you're", 'under'
]
from collections import Counter
word_counts = Counter(words)
# 出现频率最高的3个单词
top_three = word_counts.most_common(3)
print(top_three)        # [('eyes', 8), ('the', 5), ('look', 4)]
print(word_counts['eyes'])  # 8

morewords = ['why','are','you','not','looking','in','my','eyes','eyes']
word_counts.update(morewords)
print(word_counts)
# Counter({'eyes': 10, 'the': 5, 'look': 4, 'my': 4, 'into': 3, 'not': 2, 'around': 2, "don't": 1, "you're": 1, 'under': 1, 'why': 1, 'are': 1, 'you': 1, 'looking': 1, 'in': 1})
```

可以看出Counter内部维护的是一个字典，统计出关键元素的数量。Counter 对象在几乎所有需要制表或者计数数据的场合是非常有用的工具。 在解决这类问题的时候你应该优先选择它，而不是手动的利用字典去实现。
