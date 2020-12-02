---
layout:		post
category:	"python"
title:		"Python字符串替换"
tags:		[python]
---
- Content
{:toc}

# replace
```python
text = 'yeah, but no, but yeah, but no, but yeah'
s = text.replace('yeah', 'yep') # 'yep, but no, but yep, but no, but yep'
```

# translate
相当于多个replace的功能，首先提供一个映射表，需要删除的部分对应为None，需要替换的部分对应好替换后的字符串即可：
```python
s = 'pýtĥöñ\fis\tawesome\r\n'
remap = {
    ord('\t') : ' very ',
    ord('\f') : ' ',
    ord('\r') : None # Deleted
}
a = s.translate(remap)
print(a)    # pýtĥöñ is very awesome
import unicodedata
b = unicodedata.normalize('NFD', a)
b = b.encode('ascii', 'ignore').decode('ascii')
print(b)    # python is very awesome
```

文本字符清理一个最主要的问题应该是运行的性能。一般来讲，代码越简单运行越快。 对于简单的替换操作， str.replace() 方法通常是最快的，甚至在你需要多次调用的时候。 比如，为了清理空白字符，你可以这样做：
```python
def clean_spaces(s):
    s = s.replace('\r', '')
    s = s.replace('\t', ' ')
    s = s.replace('\f', ' ')
    return s
```
如果你去测试的话，你就会发现这种方式会比使用 translate() 或者正则表达式要快很多。另一方面，如果你需要执行任何复杂字符对字符的重新映射或者删除操作的话， tanslate() 方法会非常的快。

# sub
```python
text = 'Today is 11/27/2012. PyCon starts 3/13/2013.'
s = re.sub(r'(\d+)/(\d+)/(\d+)', r'\3-\1-\2', text)
# Today is 2012-11-27. PyCon starts 2013-3-13.
```
\3表示用捕获的第三个元素替换，\1和\2类似。

替换规则用**函数回调**来处理：
```python
from calendar import month_abbr
def change_date(m):
   mon_name = month_abbr[int(m.group(1))]
   return '{} {} {}'.format(m.group(2), mon_name, m.group(3))

text = 'Today is 11/27/2012. PyCon starts 3/13/2013.'
datepat = re.compile(r'(\d+)/(\d+)/(\d+)')
print(datepat.sub(change_date, text))
# 'Today is 27 Nov 2012. PyCon starts 13 Mar 2013.'
```

# subn
如果除了替换后的结果外，还想知道有多少次替换，可以使用 re.subn()。
```python
newtext, n = datepat.subn(r'\3-\1-\2', text)
# newtext = 'Today is 2012-11-27. PyCon starts 2013-3-13.'
# n = 2
```

# re.IGNORECASE忽略大小写的搜索替换
忽略大小写的搜索替换可以使用标志flags=re.IGNORECASE：
```python
text = 'UPPER PYTHON, lower python, Mixed Python'
re.findall('python', text, flags=re.IGNORECASE)         # ['PYTHON', 'python', 'Python']
re.sub('python', 'snake', text, flags=re.IGNORECASE)    # 'UPPER snake, lower snake, Mixed snake'
```

```python
text = 'UPPER PYTHON, lower python, Mixed Python'

def matchcase(word):
    def replace(m):
        text = m.group()
        if text.isupper():
            return word.upper()
        elif text.islower():
            return word.lower()
        elif text[0].isupper():
            return word.capitalize()
        else:
            return word
    return replace

s = re.sub('python', matchcase('snake'), text, flags=re.IGNORECASE)
print(s)    # UPPER SNAKE, lower snake, Mixed Snake
```

# escape和unescape
关联：[escape和unescape](./python-escape.html)