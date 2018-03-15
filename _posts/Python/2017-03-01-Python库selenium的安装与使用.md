---
layout:     post
title:      Python库selenium的安装与使用
category: python
---

下载：[selenium 3\.0\.2 : Python Package Index](https://pypi.python.org/pypi/selenium#downloads)

浏览器驱动：
- [Downloads \- ChromeDriver \- WebDriver for Chrome](https://sites.google.com/a/chromium.org/chromedriver/downloads)
- [chromedriver\.storage\.googleapis\.com/index\.html?path=2\.21/](http://chromedriver.storage.googleapis.com/index.html?path=2.21/)
- 
```
# coding:utf-8

import star
from selenium import webdriver

browser = webdriver.Chrome()
browser.get('http://www.baidu.com/')
```

运行后提示错误：
```
D:\Python27\python.exe F:/PycharmProjects/test/seleniumStudy.py
Traceback (most recent call last):
  File "F:/PycharmProjects/test/seleniumStudy.py", line 6, in <module>
    browser = webdriver.Chrome()
  File "D:\Python27\lib\selenium\webdriver\chrome\webdriver.py", line 61, in __init__
    self.service.start()
  File "D:\Python27\lib\selenium\webdriver\common\service.py", line 69, in start
    os.path.basename(self.path), self.start_error_message)
selenium.common.exceptions.WebDriverException: Message: 'chromedriver' executable needs to be in PATH. Please see https://sites.google.com/a/chromium.org/chromedriver/home

Exception AttributeError: "'Service' object has no attribute 'process'" in <bound method Service.__del__ of <selenium.webdriver.chrome.service.Service object at 0x02AE3510>> ignored

Process finished with exit code 1
```
说明是浏览器驱动器没有安装，点击上面的网址安装谷歌浏览器的驱动器，并设置好驱动器的路径到环境变量PATH中去。
我因为之前设置过Python的环境变量：D:\Python27，所以这里直接把下载的chromedriver.exe复制到D:\Python27目录下即可，不用额外再设置了。

再次执行脚本，发现谷歌浏览器新开了一个窗口并打开了百度的网址。
