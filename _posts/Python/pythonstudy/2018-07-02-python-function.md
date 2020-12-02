---
layout:		post
category:	"python"
title:		"Python函数"
tags:		[python]
---
- Content
{:toc}


# 可变位置参数
```python
def avg(first, *rest):
    return (first + sum(rest)) / (1 + len(rest))

avg(1, 2)           # 1.5
avg(1, 2, 3, 4)     # 2.5
```

# 可变关键字参数
```python
import html
def make_element(name, value, **attrs):
    keyvals = [' %s="%s"' % item for item in attrs.items()]
    attr_str = ''.join(keyvals)
    element = '<{name}{attrs}>{value}</{name}>'.format(
                name=name,
                attrs=attr_str,
                value=html.escape(value))
    return element

# Example
# <item size="large" quantity="6">Albatross</item>
print(make_element('item', 'Albatross', size='large', quantity=6))

# <p>&lt;spam&gt;</p>
print(make_element('p', '<spam>'))
```

同时接受任意数量的位置参数和关键字参数，可以同时使用 \* 和 \*\*
```python
def anyargs(*args, **kwargs):
    print(args) # A tuple
    print(kwargs) # A dict
```
一个\*参数只能出现在函数定义中最后一个位置参数后面，而 \*\*参数只能出现在最后一个参数。 有一点要注意的是，在*参数后面仍然可以定义其他参数。
```python
def a(x, *args, y):
    pass

def b(x, *args, y, **kwargs):
    pass
```
```python
def exmaple2(required_arg, *arg, **kwarg):
   if arg:
       print("arg: ", arg)
   if kwarg:
       print("kwarg: ", kwarg)
exmaple2("Hi", 1, 2, 3, keyword1 = "bar", keyword2 = "foo")
# arg:  (1, 2, 3)
# kwarg:  {'keyword2': 'foo', 'keyword1': 'bar'}
```

当传入了更多实参的时候：
- \*arg会把多出来的位置参数转化为tuple
- \*\*kwarg会把关键字参数转化为dict


# 函数默认参数
默认参数的值应该是不可变的对象，比如None、True、False、数字或字符串，默认参数不能为[]
```python
def initlogging(logFile = u"log.txt", toFile = False):
    pass
```

# 指定函数参数类型返回值类型
```python
def add(x:int, y:int) -> int:
    return x + y

# Help on function add in module __main__:
# add(x:int, y:int) -> int
help(add)
print(add.__annotations__)  # {'x': <class 'int'>, 'y': <class 'int'>, 'return': <class 'int'>}
```

# partial偏函数固定参数
```python
import functools

max1=functools.partial(max,5)
max1(1,2,3)
#相当于
args=(5,1,2,3)
max(*args)
```

# 带状态更新的回调函数
例如对于一个函数，在处理完成后需要调用一下回调函数：
```python
def apply_async(func, args, *, callback):
    # Compute the result
    result = func(*args)

    # Invoke the callback with the result
    callback(result)

def add(x, y):
    return x + y
```

通常，不带任何状态更新的回调函数会是如下形式：
```python
def print_result(result):
    print('Got:', result)
```

那么，在具体使用时便不会有回调函数的状态信息：
```python
apply_async(add, (2, 3), callback=print_result)             # Got: 5
apply_async(add, ('hello', 'world'), callback=print_result) # Got: helloworld
```

那如果我们想要加入回调函数的状态信息呢？例如加入第几次调用的信息，该怎么办呢？
## 通过类来实现
```python
class ResultHandler:
    def __init__(self):
        self.sequence = 0

    def handler(self, result):
        self.sequence += 1
        print('[{}] Got: {}'.format(self.sequence, result))

r = ResultHandler()
apply_async(add, (2, 3), callback=r.handler)                # [1] Got: 5
apply_async(add, ('hello', 'world'), callback=r.handler) # [2] Got: helloworld
```

## 通过闭包实现
```python
def make_handler():
    sequence = 0
    def handler(result):
        nonlocal sequence
        sequence += 1
        print('[{}] Got: {}'.format(sequence, result))
    return handler

handler = make_handler()
apply_async(add, (2, 3), callback=handler)                # [1] Got: 5
apply_async(add, ('hello', 'world'), callback=handler)  # [2] Got: helloworld
```

## 通过协程实现
对于协程，你需要使用它的 send() 方法作为回调函数：
```python
def make_handler():
    sequence = 0
    while True:
        r = yield
        sequence += 1
        print('[{}] Got: {}'.format(sequence, r))

handler = make_handler()
next(handler) # Advance to the yield
apply_async(add, (2, 3), callback=handler.send)               # [1] Got: 5
apply_async(add, ('hello', 'world'), callback=handler.send) # [2] Got: helloworld
```