---
layout:		post
category:	"python"
title:		"Python字符串查找与匹配"
tags:		[python]
---
- Content
{:toc}

# find
```python
s.find(‘substr’)
```
查找到则返回子串出现的索引号，否则返回 -1

# match
如果你打算做大量的匹配和搜索操作的话，最好先编译正则表达式，然后再重复使用它。 模块级别的函数会将最近编译过的模式缓存起来，因此并不会消耗太多的性能， 但是如果使用预编译模式的话，你将会减少查找和一些额外的处理损耗。
```python
text1 = '11/27/2012'
text2 = 'Nov 27, 2012'
datepat = re.compile(r'\d+/\d+/\d+')
print(datepat.match(text1)) # <_sre.SRE_Match object; span=(0, 10), match='11/27/2012'>
print(datepat.match(text2)) # None
```

关于匹配结果group的使用：

```python
text1 = '11/27/2012'
text2 = 'Nov 27, 2012'
datepat = re.compile(r'\d+/\d+/\d+')
print(datepat.match(text1).group(0)) # 11/27/2012

datepat = re.compile(r'(\d+)/(\d+)/(\d+)')
m = datepat.match(text1)
print(m.group(0))   # 11/27/2012    匹配的字符串
print(m.group(1))   # 11            匹配的第1个元素
print(m.group(2))   # 27            匹配的第2个元素
print(m.group(3))   # 2012          匹配的第3个元素
```

# findall和finditer
返回所有的匹配结果：
```python
datepat = re.compile(r'\d+/\d+/\d+')
text = 'Today is 11/27/2012. PyCon starts 3/13/2013.'
print(datepat.findall(text))    # ['11/27/2012', '3/13/2013']
```
	
如果匹配数量非常大，一次性匹配完成需要消耗大量时间和内存，不如以迭代的方式返回匹配结果：
```python
text = 'Today is 11/27/2012. PyCon starts 3/13/2013.'
datepat = re.compile(r'(\d+)/(\d+)/(\d+)')
for m in datepat.finditer(text):
    print(m.groups())
```

# fnmatch和fnmatchcase
使用 Unix Shell 中常用的通配符(比如 *.py , Dat[0-9]*.csv 等)去匹配文件名字符串，fnmatch 模块（顾名思义，可以理解为filename match）提供了两个函数：fnmatch() 和 fnmatchcase()，前者使用系统默认的文件名大小写敏感规则（如Windows上文件名大小写是不敏感的，Mac上文件名大小写是敏感的），后者严格使用大小写敏感规则。
```python
from fnmatch import fnmatch, fnmatchcase
print(fnmatch('foo.txt', '*.txt'))       # True
print(fnmatch('foo.txt', '?oo.txt'))     # True
print(fnmatch('Dat45.csv', 'Dat[0-9]*')) # True
names = ['Dat1.csv', 'Dat2.csv', 'config.ini', 'foo.py']
[name for name in names if fnmatch(name, 'Dat*.csv')] # ['Dat1.csv', 'Dat2.csv']

# 使用大小写敏感规则
print(fnmatchcase('foo.txt', '*.TXT'))  # False

# On OS X (Mac)
fnmatch('foo.txt', '*.TXT') # False

# On Windows
fnmatch('foo.txt', '*.TXT') # True
```

fnmatch() 函数匹配能力介于简单的字符串方法和强大的正则表达式之间。如果在数据处理操作中只需要简单的通配符就能完成的时候，这通常是一个比较合理的方案。如果你的代码需要做文件名的匹配，最好使用 [glob](./python-glob.html) 模块。


# startswith endswith
方法必须要输入一个元组（tuple）或字符串（str）作为参数。 如果你恰巧有一个 list 或者 set 类型的选择项， 要确保传递参数前先调用 tuple() 将其转换为元组类型。

```python
import os
filenames = os.listdir('.') # [ 'Makefile', 'foo.c', 'bar.py', 'spam.c', 'spam.h' ]
[name for name in filenames if name.endswith(('.c', '.h')) ] # ['foo.c', 'spam.c', 'spam.h']
any(name.endswith('.py') for name in filenames) # True

if name.startswith(('http:', 'https:', 'ftp:')):
    ...
```
```python
# 切片的方法实现
url = 'http://www.python.org'
url[:5] == 'http:' or url[:6] == 'https:' or url[:4] == 'ftp:'

# 正则表达式的方法实现
re.match('http:|https:|ftp:', url)
```

# 字符串最短匹配
.*?
```python
text2 = 'Computer says "no." Phone says "yes."'
str_pat = re.compile(r'"(.*?)"')
print(str_pat.findall(text2))  # ['no.', 'yes.']
```

# 字符串多行匹配
当字符串中有换行符的时候，点（.）虽说是匹配任意字符，但是不能匹配换行符，这就会导致有些匹配会失效，因此需要把换行符也考虑在内：
```python
comment = re.compile(r'/\*(.*?)\*/')
text1 = '/* this is a comment */'
text2 = '''/* this is a
multiline comment */
'''

print(comment.findall(text1))   # [' this is a comment ']
print(comment.findall(text2))   # []

comment = re.compile(r'/\*((?:.|\n)*?)\*/')
print(comment.findall(text2))   # [' this is a\nmultiline comment ']
```

re也提供了re.DOTALL选项来达到上述目的：
```python
comment = re.compile(r'/\*(.*?)\*/', re.DOTALL)
print(comment.findall(text2))   # [' this is a\nmultiline comment ']
```


关联：[glob](./python-glob.html)