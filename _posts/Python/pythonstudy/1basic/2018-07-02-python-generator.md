---
layout:		post
category:	"python"
title:		"Python的生成器表达式"
tags:		[python]
---
- Content
{:toc}


```python
>>> L = [x * x for x in range(10)]
>>> L
[0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
>>> g = (x * x for x in range(10))
>>> g
<generator object <genexpr> at 0x104feab40>
```
[]生成一个列表，()则生成了一个generator（生成器）。


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

**那么为什么要用生成器呢？**

列表是一次性生成在内存里的，如果需要构造成千上万个元素或者无限多个的时候，列表使用起来就比较蹩脚了，这个时候就需要使用生成器了，生成器可以看作是一个函数，或者说是一个迭代器，每调一次.next()才会生成一个元素，直到元素全部取完，因此通常使用for来遍历。

除了上述方法可以创建生成器外，函数中使用yield也可以创建生成器，解释生成器常用的例子是斐波那契数列：
```python
def fib(max):
    a, b = 1, 1
    while a < max:
        yield a #generators return an iterator that returns a stream of values.
        a, b = b, a+b

g = fib(20)
print g
for n in g:
    print n
```

调用next时，执行到yield会把a返回给调用者，当前代码停止在yield处，且环境变量不变，下一次next时会从上次的yield处继续执行。

可以用类来解释这一逻辑：

```python
class Fib:
    def __init__(self, max):
        self.max = max
    def __iter__(self):
        self.a = 0
        self.b = 1
        return self
    def next(self):
        fib = self.a
        if fib > self.max:
            raise StopIteration
        self.a, self.b = self.b, self.a + self.b
        return fib

f = Fib(20)
for n in f:
    print n
```
也就是说环境变量是被保存状态，下次接着使用，不会被重新初始化。
用类可以实现，通过yield可以直接用一个函数来实现，函数式编程？

---

用yield模拟线程调度：

```python
def thread1():
    for x in range(4):
        yield  x

def thread2():
    for x in range(4,8):
        yield  x

threads=[]
threads.append(thread1())
threads.append(thread2())

#写这个函数，模拟线程并发
def run(threads):
    for t in threads:
        try:
            print t.next()
        except StopIteration:
            pass
        else:
            threads.append(t)

run(threads)
```
