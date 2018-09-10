---
layout:		post
category:	"python"
title:		"Python过滤序列元素"
tags:		[python]
---
- Content
{:toc}

# 列表推导

```python
mylist = [1, 4, -5, 10, -7, 2, 3, -1]
[n for n in mylist if n > 0]    # [1, 4, 10, 2, 3]
[n for n in mylist if n < 0]    # [-5, -7, -1]
```
使用列表推导的一个潜在缺陷就是如果输入非常大的时候会产生一个非常大的结果集，占用大量内存。 如果你对内存比较敏感，那么你可以使用生成器表达式迭代产生过滤的元素。。

使用列表推导进行字典过滤：
```python
prices = {
    'ACME': 45.23,
    'AAPL': 612.78,
    'IBM': 205.55,
    'HPQ': 37.20,
    'FB': 10.75
}
# Make a dictionary of all prices over 200
p1 = {key: value for key, value in prices.items() if value > 200}
# {'AAPL': 612.78, 'IBM': 205.55}
tech_names = {'AAPL', 'IBM', 'HPQ', 'MSFT'}
p2 = {key: value for key, value in prices.items() if key in tech_names}
# {'AAPL': 612.78, 'IBM': 205.55, 'HPQ': 37.2}
```

# 生成器表达式
```python
mylist = [1, 4, -5, 10, -7, 2, 3, -1]
pos = (n for n in mylist if n > 0)
l = list(pos)   # [1, 4, 10, 2, 3]
```

# filter
```python
values = ['1', '2', '-3', '-', '4', 'N/A', '5']
def is_int(val):
    try:
        x = int(val)
        return True
    except ValueError:
        return False
ivals = list(filter(is_int, values))
print(ivals)    # ['1', '2', '-3', '4', '5']

seq = [1, 2, 3, 4, 5]
result = list(filter(lambda x: x > 2, seq))
print(result)   # [3, 4, 5]
```


# itertools.compress
```python
addresses = [
    '5412 N CLARK',
    '5148 N CLARK',
    '5800 E 58TH',
    '2122 N CLARK',
    '5645 N RAVENSWOOD',
    '1060 W ADDISON',
    '4801 N BROADWAY',
    '1039 W GRANVILLE',
]
counts = [ 0, 3, 10, 4, 1, 7, 6, 1]

from itertools import compress
more5 = [n > 5 for n in counts] 
# [False, False, True, False, False, True, True, False]

l = list(compress(addresses, more5))    
# ['5800 E 58TH', '1060 W ADDISON', '4801 N BROADWAY']
```
先创建一个 Boolean 序列，指示哪些元素符合条件。 然后 compress() 函数根据这个序列去选择输出对应位置为 True 的元素。
