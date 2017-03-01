---
layout:     post
title:      Python库beautifulsoup的安装与使用
date:     2017-03-01
author:   BIGSINGER
catalog: true
tags: 
    - Python
---

在[Python Extension Packages for Windows](http://www.lfd.uci.edu/~gohlke/pythonlibs/)
上找到相应的库，解压后把bs4目录复制到Python安装目录下的lib目录下。
参考：[Python爬虫利器二之Beautiful Soup的用法觅](http://cuiqingcai.com/1319.html)
```
#coding:utf-8

from bs4 import BeautifulSoup

html = ...
soup = BeautifulSoup(html,"lxml")
print soup.title
```
要指定解释器，否则会报错：
```
<title>The Dormouse's story</title>
D:\Python27\lib\bs4\__init__.py:166: UserWarning: No parser was explicitly specified, so I'm using the best available HTML parser for this system ("lxml"). This usually isn't a problem, but if you run this code on another system, or in a different virtual environment, it may use a different parser and behave differently.

To get rid of this warning, change this:

 BeautifulSoup([your markup])

to this:

 BeautifulSoup([your markup], "lxml")

  markup_type=markup_type))

Process finished with exit code 0
```