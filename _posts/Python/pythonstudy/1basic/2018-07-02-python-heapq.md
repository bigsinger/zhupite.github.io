---
layout:		post
category:	"python"
title:		"Python的堆heapq"
tags:		[python]
---
- Content
{:toc}

# 堆heapq与最大最小N个元素

```python
import heapq
nums = [1, 8, 2, 23, 7, -4, 18, 23, 42, 37, 2]
print(heapq.nlargest(3, nums))     # Prints [42, 37, 23]
print(heapq.nsmallest(3, nums)) # Prints [-4, 1, 2]
```
如果元素是元组，则依此进行比较，也即第一个元素相同的话再比较第二个，以此类推，如果元素为自定义的类，则要实现大小比较的方法，否则会出现异常。
```python
import heapq
nums = [(10, 0, 'heapq'), (-1, 1, 'python'), (-1, 2, 'helllo')]
print(heapq.nlargest(3, nums))  # [(10, 0, 'heapq'), (-1, 2, 'helllo'), (-1, 1, 'python')]
print(heapq.nsmallest(3, nums)) # [(-1, 1, 'python'), (-1, 2, 'helllo'), (10, 0, 'heapq')]
```

两个函数都能接受一个关键字参数，用于更复杂的数据结构中。例如，对每个元素进行对比的时候，以 price 的值进行比较。
```python
portfolio = [
    {'name': 'IBM', 'shares': 100, 'price': 91.1},
    {'name': 'AAPL', 'shares': 50, 'price': 543.22},
    {'name': 'FB', 'shares': 200, 'price': 21.09},
    {'name': 'HPQ', 'shares': 35, 'price': 31.75},
    {'name': 'YHOO', 'shares': 45, 'price': 16.35},
    {'name': 'ACME', 'shares': 75, 'price': 115.65}
]
cheap = heapq.nsmallest(3, portfolio, key=lambda s: s['price'])
expensive = heapq.nlargest(3, portfolio, key=lambda s: s['price'])
```

在底层实现里面，首先会先将数据进行堆排序后放入一个列表中：
```python
nums = [1, 8, 2, 23, 7, -4, 18, 23, 42, 37, 2]
import heapq
heap = list(nums)
heapq.heapify(heap) # 在底层实现里面，首先会先将集合数据进行堆排序后放入一个列表中
print(heap)           # [-4, 2, 1, 23, 7, 2, 18, 23, 42, 37, 8]
print(max(nums))     # 42
print(min(heap))     # -4
print(heapq.heappop(heap)) # -4
print(heapq.heappop(heap)) # 1
print(heapq.heappop(heap)) # 2
print(heap)           # [2, 7, 8, 23, 42, 37, 18, 23]
```

**经验：**
1. 当要查找的元素个数相对比较小的时候，函数 nlargest() 和 nsmallest() 是很合适的。 
2. 如果你仅仅想查找唯一的最小或最大（N=1）的元素的话，那么使用 min() 和 max() 会更快些。 
3. 如果 N 的大小和集合大小接近的时候，通常先排序这个集合然后再使用切片操作会更快点 （ sorted(items)[:N] 或者是 sorted(items)[-N:] ）。

# 堆实现的优先级队列
根据堆heapq的特点，内部数据会进行堆排序放在列表里，在heappop的时候弹出最小的那个。
```python
import heapq

class PriorityQueue:
    def __init__(self):
        self._queue = []
        self._index = 0

    def push(self, item, priority):
        heapq.heappush(self._queue, (-priority, self._index, item))
        self._index += 1

    def pop(self):
        return heapq.heappop(self._queue)[-1]

class Item:
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return 'Item({!r})'.format(self.name)


q = PriorityQueue()
q.push(Item('foo'), 1)
q.push(Item('bar'), 5)
q.push(Item('spam'), 4)
q.push(Item('grok'), 1)
print(q.pop())  # Item('bar')
print(q.pop())  # Item('spam')
print(q.pop())  # Item('foo')
print(q.pop())  # Item('grok')
```

上面把优先级取负数，这样最大的优先级就变成了最小的插入在了堆的首位，heappop的时候便能把首位的优先级最大的数据弹出来了。

使用三元组数据的技巧是：
1. 优先以优先级排序
2. 优先级相同时可以使用插入的顺序进行排序（index），否则Item是无法比较的，会报错。
