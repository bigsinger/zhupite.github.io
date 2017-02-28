---
layout:     post
title:      Python编码unicode Gbk Utf8字符集转换的正确姿势
date:       2017-02-27
author:     BIGSING
catalog: true
tags:
    - Python
---

# 规范
- 脚本文件编码
由于需要经常性使用到中文字符，因此Python脚本新建后，请在头部添加代码：
```
# coding: utf-8
```
或者为pycharm设置代码模版，这样每次新建Python文件时会自动带上以上代码。如果不添加，即使中文字符串以u开头，也是编译不通过的。

# UNICODE
- 脚本中的字符最好使用UNICODE编码（英文可以不需要，但是中文尽量使用），因为UNICODE编码是比较好的“中间”字符集，比较容易向GBK和UTF-8转换。例如：
```
print u"你好"
```
如果不带u的字符在包含了# coding: utf-8的脚本中默认字符为UTF-8，一般也不会有什么问题。


- UNICODE转GBK：
```
# 带u的字符串为unicode
s.encode('gbk')
```

- UNICODE转UTF-8
```
# 带u的字符串为unicode
s.encode('utf-8')
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
