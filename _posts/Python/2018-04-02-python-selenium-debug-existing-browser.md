---
layout:		post
category:	"python"
title:		"Python使用selenium附加已经打开的Chrome浏览器"
tags:		[python,selenium]
---

网上的代码基本上都是新打开一个浏览器示例，这样的打开方式有一个缺点，就是如果网页需要输入账号密码的时候比较麻烦，每次都需要输入。我们平时使用浏览器的时候，一般都会有一段时间不需要输入密码，如果selenium能直接用我们已经打开的浏览器示例就好了，这样便省去了登录的过程。

网上搜索到的可行的一个办法，是在谷歌论坛里找到的，这里以谷歌浏览器Chrome为例：

### 步骤
1. 关闭所有Chrome浏览器，并用命令行方式启动：

```
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
" --remote-debugging-port=8888
```
实际上是开放了一个调试端口，这个端口可以自行修改。待浏览器启动后，执行下面的Python代码。


2. Python代码：

```python
from selenium import webdriver
from selenium.webdriver import ChromeOptions

options = ChromeOptions()
options.debugger_address = "127.0.0.1:" + '8888'
browser = webdriver.Chrome(executable_path="C:\Program Files (x86)\Google\Chrome\Application\chromedriver.exe", chrome_options=options)
# browser.get("www.zhupite.com")
```
如果网址 www.zhupite.com 之前有登录过，这个时候默认是已登录状态，不会要求输入账号密码的，省就省在这一步。

因为第一步启动了一个开放了调试端口为8888的Chrome浏览器，这里直接使用选项**debugger_address**来配置，后面Selenium打开的新窗口就是直接在这个开放了调试端口的浏览器中操作了。

### 参考
更多选项可以参考：[38、Selenium 之订制启动Chrome的选项（Options）](https://blog.csdn.net/duzilonglove/article/details/78517429)