---
layout:		post
category:	"python"
title:		"Python元编程"
tags:		[python]
---
- Content
{:toc}

# 装饰器
写了一个装饰器作用在某个函数上，但是这个函数的重要的元信息比如名字、文档字符串、注解和参数签名都丢失了。如下，函数的\_\_name\_\_值是装饰器内部函数的名称，而不是原始函数名：
```python
def timethis(func): 
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(func.__name__, end - start)
        return result
    return wrapper

@timethis
def countdown(n):
    while n > 0:
        n -= 1

print(countdown.__name__)           # wrapper
```

如果想要保留函数的元信息，则可以使用functools 库中的 @wraps 装饰器来注解底层包装函数。如下，**对装饰器的内部函数使用装饰器**@wraps，这样输出的函数名便是原函数名了。
```python
import time
from functools import wraps

def timethis(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(func.__name__, end - start)
        return result
    return wrapper

print(countdown.__name__)           # countdown
```

对应地，获取函数签名信息时，对于装饰器在使用@wraps前后获取原始函数签名信息分别输出：(n)、(*args, **kwargs)
```python
from inspect import signature
print(signature(countdown))
```

# __wrapped__
一个装饰器已经作用在一个函数上，你想撤销它，直接访问原始的未包装的那个函数。假设装饰器是通过 @wraps 来实现的，那么可以通过访问 \_\_wrapped\_\_ 属性来访问原始函数：
```python
@somedecorator
def add(x, y):
    return x + y
orig_add = add.__wrapped__
orig_add(3, 4)
```

直接访问未包装的原始函数在调试、内省和其他函数操作时是很有用的。 但是我们这里的方案仅仅适用于在包装器中正确使用了 @wraps 或者直接设置了 \_\_wrapped\_\_ 属性的情况。

但是，这有一个可能的隐患，就是一个函数存在多个装饰器的时候，通过访问 \_\_wrapped\_\_获取的函数可能是不可知的。还有一种情况是，并非所有的装饰器内部函数都会使用@wraps，所以使用\_\_wrapped\_\_也不一定有作用。

# 带参数的装饰器
我经常使用的一个装饰器就是用来打印函数耗时的，通常我会保存如下的代码片段，以供随时使用：
```python
# 函数装饰器，让函数打印耗时
def logtime(func):
    def wrapper(*args, **kwargs):
        print(func.func_name + u" start")
        startTime = time.time()
        ret = func(*args, **kwargs)
        print(u"%s end, time used: %.1f s" % (func.func_name, time.time() - startTime))
        return ret
    return wrapper

# 指定一个名称
def logtimewithname(name = None):
    def wrapper(func):
        def wrapper2(*args, **kwargs):
            _name = name
            if name is None:
                _name = func.func_name
            else:
                _name = name
            print(_name + u" start")
            startTime = time.time()
            res = func(*args, **kwargs)
            print(u"%s end, time used: %.1f s" % (_name, time.time() - startTime))
            return res
        return wrapper2
    return wrapper
```

第一个装饰器无须参数，它默认打印被装饰的函数名称。第二个装饰器携带一个参数，用来指定打印名称，而且这个参数是一个默认参数，如果未指定则使用函数名打印。使用效果如下：
```python
@logtimewithname('扫描1')
def scan1():
    pass

def scan2():
    pass

scan1()
# 扫描1 start
# 扫描1 end, time used: 0.0 s

f = logtimewithname('扫描2')(scan2)
f()
# 扫描2 start
# 扫描2 end, time used: 0.0 s
```
而且这个例子可以看出，装饰器其实就是一个函数，它的参数是函数—也即待装饰的函数。

# 参数类型检查的装饰器
在编程规范中使用，特别是在接口调用中，可以通过使用装饰器来对函数参数类型进行强制性要求：
```python
from inspect import signature
from functools import wraps

def typeassert(*ty_args, **ty_kwargs):
    def decorate(func):
        # If in optimized mode, disable type checking
        if not __debug__:
            return func

        # Map function argument names to supplied types
        sig = signature(func)
        bound_types = sig.bind_partial(*ty_args, **ty_kwargs).arguments

        @wraps(func)
        def wrapper(*args, **kwargs):
            bound_values = sig.bind(*args, **kwargs)
            # Enforce type assertions across supplied arguments
            for name, value in bound_values.arguments.items():
                if name in bound_types:
                    if not isinstance(value, bound_types[name]):
                        raise TypeError(
                            'Argument {} must be {}'.format(name, bound_types[name])
                            )
            return func(*args, **kwargs)
        return wrapper
    return decorate
```

使用时：
```python
@typeassert(str, str)
def add(x, y):
    return x + y

print(add('hello', 'world'))
print(add(1, 2))
'''
  File "F:/osopen/studypython/Main.py", line 55, in <module>
    print(add(1, 2))
  File "F:/osopen/studypython/Main.py", line 43, in wrapper
    'Argument {} must be {}'.format(name, bound_types[name])
TypeError: Argument x must be <class 'str'>
'''
```

# 属性装饰器
可以使用内置的property，实际上它是一个类，它的类函数getter和setter就是装饰器，可以按如下方式使用：
```python
class Person:
    # Create a property instance
    first_name = property()

    # Apply decorator methods
    @first_name.getter
    def first_name(self):
        return self._first_name

    @first_name.setter
    def first_name(self, value):
        if not isinstance(value, str):
            raise TypeError('Expected a string')
        self._first_name = value

p = Person()
p.first_name = 'jim'
print(p.first_name)
p.first_name = 100     # 异常
```
使用这种方法来引用对象的成员变量的好处是可以对内容进行有效性判断，比直接使用对象的成员变量要好的多。但是这完全可以按照C++的方法，对类导出两个函数：set和get函数即可。因此这种使用方法就略显鸡肋了。


# 为函数增加参数的装饰器
在装饰器中给被包装函数增加额外的参数，但是不能影响这个函数现有的调用规则。可以使用关键字参数来给被包装函数增加额外参数，例如在**调试模式**下控制其输出：
```python
from functools import wraps

def optional_debug(func):
    @wraps(func)
    def wrapper(*args, debug=False, **kwargs):
        if debug:
            print('Calling', func.__name__)
        return func(*args, **kwargs)

    return wrapper

@optional_debug
def spam(a,b,c):
    print(a,b,c)

spam(1,2,3)
spam(1,2,3, debug=True)
```

# 装饰类并打印其行为
例如访问了类的成员变量和函数时，输出出来作为执行路径。一种方法是对类进行装饰来实现：
```python
def log_getattribute(cls):
    # Get the original implementation
    orig_getattribute = cls.__getattribute__

    # Make a new definition
    def new_getattribute(self, name):
        print('访问:', name)
        return orig_getattribute(self, name)

    # Attach to the class and return
    cls.__getattribute__ = new_getattribute
    return cls

# Example use
@log_getattribute
class A:
    def __init__(self,x):
        self.x = x
    def spam(self):
        pass

a = A(42)
a.x             # 访问: x
a.spam()        # 访问: spam
```

第二种方法是使用类继承的方式，重载**\_\_getattribute\_\_**函数即可：
```python
class LoggedGetattribute:
    def __getattribute__(self, name):
        print('访问:', name)
        return super().__getattribute__(name)

# Example:
class A(LoggedGetattribute):
    def __init__(self,x):
        self.x = x
    def spam(self):
        pass

a = A(42)
a.x             # 访问: x
a.spam()        # 访问: spam
```

# 元类创建单实例类、缓存类
创建单实例类，也即只存在一个实例。
```python
class Singleton(type):
    def __init__(self, *args, **kwargs):
        self.__instance = None
        super().__init__(*args, **kwargs)

    def __call__(self, *args, **kwargs):
        if self.__instance is None:
            self.__instance = super().__call__(*args, **kwargs)
            return self.__instance
        else:
            return self.__instance

# Example
class PathManager(metaclass=Singleton):
    def __init__(self):
        print('Creating PathManager')

pm1 = PathManager()     # Creating PathManager
pm2 = PathManager()     #
pm3 = PathManager()     #

print(pm1 is pm2)       # True
print(pm2 is pm3)       # True
```

创建缓存类：
```python
import weakref

class Cached(type):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__cache = weakref.WeakValueDictionary()

    def __call__(self, *args):
        if args in self.__cache:
            return self.__cache[args]
        else:
            obj = super().__call__(*args)
            self.__cache[args] = obj
            return obj

# Example
class Spam(metaclass=Cached):
    def __init__(self, name):
        print('Creating Spam({!r})'.format(name))
        self.name = name

a = Spam('Guido')   # Creating Spam('Guido')
b = Spam('Diana')   # Creating Spam('Diana')
c = Spam('Guido')   # Cached
print(a is b)       # False
print(a is c)       # True
```

# 按定义顺序使用类的属性
按定义顺序使用类的属性，通常由以下应用场景：序列化、映射到数据库等。
```python
from collections import OrderedDict

# A set of descriptors for various types
class Typed:
    _expected_type = type(None)
    def __init__(self, name=None):
        self._name = name

    def __set__(self, instance, value):
        if not isinstance(value, self._expected_type):
            raise TypeError('Expected ' + str(self._expected_type))
        instance.__dict__[self._name] = value

class Integer(Typed):
    _expected_type = int

class Float(Typed):
    _expected_type = float

class String(Typed):
    _expected_type = str

# Metaclass that uses an OrderedDict for class body
class OrderedMeta(type):
    def __new__(cls, clsname, bases, clsdict):
        d = dict(clsdict)
        order = []
        for name, value in clsdict.items():
            if isinstance(value, Typed):
                value._name = name
                order.append(name)
        d['_order'] = order
        return type.__new__(cls, clsname, bases, d)

    @classmethod
    def __prepare__(cls, clsname, bases):
        return OrderedDict()


class Structure(metaclass=OrderedMeta):
    def as_csv(self):
        return ','.join(str(getattr(self,name)) for name in self._order)
```
关键点就是OrderedMeta元类中定义的 **\_\_prepare\_\_()** 方法。 这个方法会在开始定义类和它的父类的时候被执行。它必须返回一个映射对象以便在类定义体中被使用到。 我们这里通过返回了一个OrderedDict而不是一个普通的字典，可以很容易的捕获定义的顺序。

在 \_\_new\_\_() 方法中对于元类中被修改字典的处理。 尽管类使用了另外一个字典来定义，在构造最终的 class 对象的时候， 我们仍然需要将这个字典转换为一个正确的 dict 实例。 通过语句 d = dict(clsdict) 来完成这个效果。

使用示例：
```python
# Example use
class Stock(Structure):
    name = String()
    shares = Integer()
    price = Float()

    def __init__(self, name, shares, price):
        self.name = name
        self.shares = shares
        self.price = price

s = Stock('GOOG',100,490.1)
print(s.name)
print(s.as_csv())

t = Stock('GOOG','a lot',490.1) # 异常，指示第二个参数必须是int：TypeError: Expected <class 'int'>
```
上面的as_csv()函数可以按照属性定义的顺序序列化为一个字符串保存到cvs文件中。

在框架底层，我们必须捕获定义的顺序来将对象映射到元组或数据库表中的行（就类似于上面例子中的 as_csv() 的功能）。 这节演示的技术非常简单，并且通常会比其他类似方法（通常都要在描述器类中维护一个隐藏的计数器）要简单的多。

# 监控类的定义
通常可以通过定义一个元类，一个基本元类通常是继承自 type 并重定义它的 \_\_new\_\_() 方法 或者是 \_\_init\_\_() 方法。
```python
class MyMeta(type):
    def __new__(self, clsname, bases, clsdict):
        # clsname is name of class being defined
        # bases is tuple of base classes
        # clsdict is class dictionary
        print('class: ' + clsname)
        return super().__new__(self, clsname, bases, clsdict)

class MyMeta(type):
    def __init__(self, clsname, bases, clsdict):
        super().__init__(clsname, bases, clsdict)
        print('class: ' + clsname)
        # clsname is name of class being defined
        # bases is tuple of base classes
        # clsdict is class dictionary
```

元类的一个关键特点是它允许你在定义的时候检查类的内容。在重新定义 \_\_init\_\_() 方法中， 你可以很轻松的检查类字典、父类等等。并且，一旦某个元类被指定给了某个类，那么就会被继承到所有子类中去。 因此，一个框架的构建者就能在大型的继承体系中通过给一个顶级父类指定一个元类去捕获所有下面子类的定义。 使用时：
```python
class Root(metaclass=MyMeta):
    pass

class A(Root):
    pass

class B(Root):
    pass

'''
输出
class: Root
class: A
class: B
'''
```

# 使用元类对编程进行规范
例如实现一个在Python代码中不允许出现大小写混合命名（java习惯）的规范：
```python
class NoMixedCaseMeta(type):
    def __new__(cls, clsname, bases, clsdict):
        for name in clsdict:
            if name.lower() != name:
                raise TypeError('Bad attribute name: ' + name)
        return super().__new__(cls, clsname, bases, clsdict)

class Root(metaclass=NoMixedCaseMeta):
    pass

class A(Root):
    def foo_bar(self): # Ok
        pass

class B(Root):
    def fooBar(self): # TypeError: Bad attribute name: fooBar
        pass
```

# 强制派生类的重载函数与基类保持一致
我在开发Windows应用程序的时候遇到过一个坑，派生类的重载函数被某次不小心多改了一个参数，导致运行逻辑出错，未能调用到基类的同名函数。Python下面来强制让派生类的重载函数与基类保持一致的方法如下：
```python
from inspect import signature
import logging

class MatchSignaturesMeta(type):
    def __init__(self, clsname, bases, clsdict):
        super().__init__(clsname, bases, clsdict)
        sup = super(self, self)
        for name, value in clsdict.items():
            if name.startswith('_') or not callable(value):
                continue
            # Get the previous definition (if any) and compare the signatures
            prev_dfn = getattr(sup,name,None)
            if prev_dfn:
                prev_sig = signature(prev_dfn)
                val_sig = signature(value)
                if prev_sig != val_sig:
                    logging.warning('Signature mismatch in %s. %s != %s',
                                    value.__qualname__, prev_sig, val_sig)

# Example
class Root(metaclass=MatchSignaturesMeta):
    pass
```

使用时：
```python
class A(Root):
    def foo(self, x, y):
        pass

    def send_message(self, x, y, z):
        pass

# Class with redefined methods, but slightly different signatures
class B(A):
    def foo(self, a, b):
        pass

    def send_message(self, x, y):
        pass
```

运行出错：
```python
WARNING:root:Signature mismatch in B.foo. (self, x, y) != (self, a, b)
WARNING:root:Signature mismatch in B.send_message. (self, x, y, z) != (self, x, y) 
```


在大型面向对象的程序中，通常将类的定义放在元类中控制是很有用的。 元类可以监控类的定义，警告编程人员某些没有注意到的可能出现的问题。

有人可能会说，像这样的错误可以通过程序分析工具或IDE去做会更好些。诚然，这些工具是很有用。 但是，如果你在构建一个框架或函数库供其他人使用，那么你没办法去控制使用者要使用什么工具。 因此，对于这种类型的程序，如果可以在元类中做检测或许可以带来更好的用户体验。

# 自定义with（上下文管理器）


```python
import time
from contextlib import contextmanager

@contextmanager
def timethis(label):
    start = time.time()
    try:
        yield
    finally:
        end = time.time()
        print('{}: {}'.format(label, end - start))

# Example use
with timethis('counting'):
    n = 10000000
    while n > 0:
        n -= 1
```
在函数 timethis() 中，yield 之前的代码会在上下文管理器中作为 \_\_enter\_\_() 方法执行， 所有在 yield 之后的代码会作为 \_\_exit\_\_() 方法执行。 如果出现了异常，异常会在yield语句那里抛出。

高级上下文管理器，实现一个类似的事务操作，当出现异常时with中的操作不会生效。

```python
from contextlib import contextmanager

@contextmanager
def list_transaction(orig_list):
    working = list(orig_list)
    yield working
    orig_list[:] = working

items = [1, 2, 3]
with list_transaction(items) as working:
   working.append(4)
   working.append(5)

print(items)    # [1, 2, 3, 4, 5]

try:
    with list_transaction(items) as working:
        working.append(6)
        working.append(7)
        raise RuntimeError('oops')
except:
    pass

print(items)    # [1, 2, 3, 4, 5]
```