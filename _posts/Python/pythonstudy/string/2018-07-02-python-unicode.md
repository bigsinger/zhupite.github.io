---
layout:		post
category:	"python"
title:		"Python的Unicode字符串"
tags:		[python]
---
- Content
{:toc}


# Unicode字符串标准化
```python
s1 = 'Spicy Jalape\u00f1o'
s2 = 'Spicy Jalapen\u0303o'
print(s1)           # Spicy Jalapeño
print(s2)           # Spicy Jalapeño
print(len(s1))      # 14
print(len(s2))      # 15

import unicodedata
t1 = unicodedata.normalize('NFC', s1)
t2 = unicodedata.normalize('NFC', s2)
print(t1==t2)       # True
print(t1)           # Spicy Jalapeño
print(t2)           # Spicy Jalapeño

s = "Marek Čech"    # unicode
line = unicodedata.normalize('NFKD',s).encode('ascii', 'ignore')
print(line)         # b'Marek Cech'
line = str(line, encoding='utf-8', errors='ignore')
print(line)         # Marek Cech
```

去除音标：
```python
import unicodedata
s1 = 'Spicy Jalape\u00f1o'
t1 = unicodedata.normalize('NFD', s1)
s = ''.join(c for c in t1 if not unicodedata.combining(c))
print(s)        # Spicy Jalapeno
```

# encode和decode
在Python3中，字符串默认就是Unicode类型的字符串。

- encode 把Unicode的字符串按照某编码格式编码字符串，最终生成的是bytes类型数据。
- decode 把bytes数据按照某编码格式解码成字符串，最终生成的是str类型。

```python
# 把str转换为bytes
def to_bytes(s):
    # return s.encode('utf-8', 'ignore')
    return bytes(s, encoding='utf-8', errors='ignore')

# 把bytes转换为str
def to_str(b):
    # return b.decode('utf-8', 'ignore')
    return str(b, encoding='utf-8', errors='ignore')
```

# 规范
- 脚本文件编码
由于需要经常性使用到中文字符，因此Python脚本新建后，请在头部添加代码：
```
# coding: utf-8
```

# UNICODE转GBK：
```
s.encode('gbk', 'ignore')
```

# UNICODE转UTF-8
```
s.encode('utf-8', 'ignore')
```

# GBK
- GBK转UNICODE

Windows下的命令行参数为GBK编码，因此需要对字符串进行转换，转换方法有两种。

方法一：

```

# Create a new Unicode object from the given encoded string.
# encoding defaults to the current default string encoding.
# errors can be 'strict', 'replace' or 'ignore' and defaults to 'strict'.

unicode(s, "gbk", "ignore")
```
方法二：
```
s.decode('gbk', 'ignore')
```

跨平台判断：

```
if sys.platform == 'win32':
    # win下命令行参数为gbk编码，转换字符
    pass
else:
    pass
```

# UTF-8
- UTF-8转换为UNICODE
```
unicode(s, "utf-8", "ignore")
```
或：
```
s.decode('utf-8', 'ignore')
```


# 汇总整理成函数库

```
# win下命令行参数为gbk编码：star.gbk2unicode(sys.argv[1]) + u'也有'
def gbk2unicode(s):
    return s.decode('gbk', 'ignore')

# 脚本文件#coding:utf-8时默认不带u的字符串为utf8字符串：star.utf82unicode('我')
def utf82unicode(s):
    return s.decode('utf-8', 'ignore')

# 带u的字符串为unicode
# star.unicode2gbk(u'\u4e5f\u6709')
# star.unicode2gbk(u'也有')
def unicode2gbk(s):
    return s.encode('gbk')

# 带u的字符串为unicode
# star.unicode2utf8(u'\u4e5f\u6709')
# star.unicode2utf8(u'也有')
def unicode2utf8(s):
    return s.encode('utf-8')

# win下命令行参数为gbk编码：star.gbk2utf8(sys.argv[1]) + '也有'
def gbk2utf8(s):
    return s.decode('gbk', 'ignore').encode('utf-8')

def utf82gbk(s):
    return s.decode('utf-8', 'ignore').encode('gbk')

```

# 有关字符集的错误
## UnicodeEncodeError  gbk codec can t encode character
```
    return f.write(buf)
UnicodeEncodeError: 'gbk' codec can't encode character u'\ufffd' in position 82363: illegal multibyte sequence
```

```python
def write(filename, buf):
    try:
        with open(filename, 'w') as f:
            return f.write(buf)
    except Exception as e:
        print e
        return None

write(r'log3.txt', page_content.encode('gbk', 'ignore'))
```
这个解决办法是：unicode字符集先转换为gbk

## Python抓取gb2312字符集网页中文乱码
最近在学习Python，练习用Python抓取网页内容并解析，在解析gb2312字符集网页时出现中文乱码：
```
UnicodeEncodeError: 'gbk' codec can't encode character u'\xbb' in position 0: illegal multibyte sequence
```

原因及解决方案：网页中的字符编码方式重新编码一次即可：

```
# 使用requests库封装一个简单的通过get方式获取网页源码的函数
def getsource(url):
    html = requests.get(url)
    s = html.text.encode(html.encoding)
    s = s.decode('gb2312', 'ignore')    #转换为unicode
    # print s
    return s
```
当然# coding: utf-8也是要加的。

参考：[Python编码unicode Gbk Utf8字符集转换的正确姿势 \- 大星哥的博客 \| BIGSINGER Blog](2017/02/27/Python%E7%BC%96%E7%A0%81UNICODE-GBK-UTF8%E5%AD%97%E7%AC%A6%E9%9B%86%E8%BD%AC%E6%8D%A2%E7%9A%84%E6%AD%A3%E7%A1%AE%E5%A7%BF%E5%8A%BF/)

## Python在print打印输出或者写文件遇到的中文异常
如果直接print或者写入到文件的时候出现错误：
```
UnicodeEncodeError: 'gbk' codec can't encode character u'\xa0' in position 156: illegal multibyte sequence
```
则请转换为ascii再打印：
```
desc_asc = desc.encode('gb2312','ignore')
print desc_asc
```
注意上面的代码中desc是Unicode字符串。

## gb2312的网页源码转换为Unicode
```
html = requests.get(url)
print html.encoding
source = html.text.encode(html.encoding)
source = source.decode('gb2312', 'ignore')    #转换为unicode
selector = etree.HTML(source)
```

如果出现错误：
```
UnicodeEncodeError: 'gbk' codec can't encode character u'\xa0' in position 156: illegal multibyte sequence
```

则说明Unicode的字符在按中文gbk输出的时候有问题，那么怎么办呢？
人为地帮它转换为gbk格式：
```
text = text.encode('gb2312','ignore')
```
