---
layout:		post
category:	"python"
title:		"Python字符串格式化与对齐"
tags:		[python]
---
- Content
{:toc}

# 字符串格式化
参考：[Python format 格式化函数](http://www.runoob.com/python/att-string-format.html)
```python
print("{:.2f}".format(3.1415926));
# 3.14
```

format() 和 format_map() 更加先进，因此应该被优先选择。 使用 format() 方法还有一个好处就是你可以获得对字符串格式化的所有支持(对齐，填充，数字格式化等待)， 而这些特性是使用像模板字符串之类的方案不可能获得的。
```python
s = '{name} has {n} messages.'
s.format(name='Guido', n=37)    # 'Guido has 37 messages.'

name = 'Guido'
n = 37
s.format_map(vars())            # 'Guido has 37 messages.'
```

# 字符串对齐
```python
text = 'Hello World'
print(text.ljust(20))           # 'Hello World         '
print(text.rjust(20))           # '         Hello World'
print(text.center(20))          # '    Hello World     '
print(text.rjust(20,'='))       # '=========Hello World'
print(text.center(20,'*'))      # '****Hello World*****'

print(format(text, '>20'))      # '         Hello World'
print(format(text, '<20'))      # 'Hello World         '
print(format(text, '^20'))      # '    Hello World     '

print(format(text, '=>20s'))    # '=========Hello World'
print(format(text, '*^20s'))    # '****Hello World*****'

print('{:=>10s} {:>10s}'.format('Hello', 'World')) # '=====Hello      World'
```

在新版本代码中，你应该优先选择 format() 函数或者方法。 format() 要比 % 操作符的功能更为强大。 并且 format() 也比使用 ljust() , rjust() 或 center() 方法更通用， 因为它可以用来格式化任意对象，而不仅仅是字符串。