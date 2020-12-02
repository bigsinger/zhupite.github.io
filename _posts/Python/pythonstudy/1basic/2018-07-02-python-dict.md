---
layout:		post
category:	"python"
title:		"Python的字典"
tags:		[python]
---
- Content
{:toc}

# 字典最大最小元素

```python
prices = {
    'ACME': 45.23,
    'AAPL': 612.78,
    'IBM':  205.55,
    'HPQ':  37.20,
    'FB':   10.75
}

min_price = min(zip(prices.values(), prices.keys()))
print(min_price)    # (10.75, 'FB')
max_price = max(zip(prices.values(), prices.keys()))
print(max_price)    # (612.78, 'AAPL')

prices_sorted = sorted(zip(prices.values(), prices.keys()))
print(prices_sorted)# [(10.75, 'FB'), (37.2, 'HPQ'), (45.23, 'ACME'), (205.55, 'IBM'), (612.78, 'AAPL')]

min_value = prices[min(prices, key=lambda k: prices[k])]
print(min_value)    # 10.75
```

# 字典的键集合值集合
```python
a = {
    'x' : 1,
    'y' : 2,
    'z' : 3
}

b = {
    'w' : 10,
    'x' : 11,
    'y' : 2
}

# Find keys in common
a.keys() & b.keys() # { 'x', 'y' }
# Find keys in a that are not in b
a.keys() - b.keys() # { 'z' }
# Find (key,value) pairs in common
a.items() & b.items() # { ('y', 2) }
```

假如你想以现有字典构造一个**排除几个指定键**的新字典。 下面利用字典推导来实现这样的需求：
```python
# Make a new dictionary with certain keys removed
c = {key:a[key] for key in a.keys() - {'z', 'w'}}
# c is {'x': 1, 'y': 2}
```
