---
layout:		post
category:	"python"
title:		"Python网络操作相关"
tags:		[python]
---
- Content
{:toc}

# httplib2
```
import httplib2
    http = httplib2.Http()
    response_headers, content = http.request(url, 'GET')
print "response headers:", response_headers
print "content:", content
```

# urllib2
```
import urllib2
    response = urllib2.urlopen(url)
    content = urllib2.urlopen(url).read()
print "response headers:", response.headers
print "content:", content
```
* GET带参数请求
```
import urllib, urllib2   
data = {'data1':'XXXXX', 'data2':'XXXXX'} 
data = urllib.urlencode(data)
    full_url = url+'?'+data
    response = urllib2.urlopen(full_url)
```

* POST表单请求
```
import urllib, urllib2  
data = {'data1':'XXXXX', 'data2':'XXXXX'}
data = urllib.urlencode(data)
    req = urllib2.Request(url=url, data=data)
    response = urllib2.urlopen(req)
```

* 使用代理
```
import urllib2
proxies = {'http':'http://XX.XX.XX.XX:XXXX'}
proxy_support = urllib2.ProxyHandler(proxies)
opener = urllib2.build_opener(proxy_support, urllib2.HTTPHandler)
urllib2.install_opener(opener) # 安装opener，此后调用urlopen()时都会使用安装过的opener对象
response = urllib2.urlopen(url)
```

* 加入指定的header
```
#code1
import urllib2
request = urllib2.Request('http://www.baidu.com/')
request.add_header('User-Agent', 'fake-client')
response = urllib2.urlopen(request)
print response.read()
```
- 伪装成浏览器
```
#…

headers = {
    'User-Agent':'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.1.6) Gecko/20091201 Firefox/3.5.6'
}
req = urllib2.Request(
    url = 'http://secure.verycd.com/signin/*/http://www.verycd.com/',
    data = postdata,
    headers = headers
)
#...
```

- 对付反盗链
```
某些站点有所谓的反盗链设置，其实说穿了很简单，
就是检查你发送请求的header里面，referer站点是不是他自己，
所以我们只需要像把headers的referer改成该网站即可，以cnbeta为例：
#Code3
headers = {
    'Referer':'http://www.cnbeta.com/articles'
}
headers是一个dict数据结构，你可以放入任何想要的header，来做一些伪装。
```

* [urllib2的使用细节与抓站技巧](http://blog.csdn.net/pleasecallmewhy/article/details/8925978)



# urllib.request
## get请求
发送一个简单的HTTP GET请求到远程的服务上，可以这样做：
```python
from urllib import request, parse

# Base URL being accessed
url = 'http://httpbin.org/get'

# Dictionary of query parameters (if any)
parms = {
   'name1' : 'value1',
   'name2' : 'value2'
}

# Encode the query string
querystring = parse.urlencode(parms)    # name1=value1&name2=value2

# Make a GET request and read the response
u = request.urlopen(url+'?' + querystring)
resp = u.read()
```

### 带参数请求get
```python
data = {'data1':'XXXXX', 'data2':'XXXXX'}
Requests：data为dict，json
import requests
    response = requests.get(url=url, params=data)

Urllib2：data为string
import urllib, urllib2   
data = {'data1':'XXXXX', 'data2':'XXXXX'} 
data = urllib.urlencode(data)
    full_url = url+'?'+data
    response = urllib2.urlopen(full_url)
```

## headers头
```python
from urllib import request, parse
...
# Extra headers
headers = {
    'User-agent' : 'none/ofyourbusiness',
    'Spam' : 'Eggs'
}

req = request.Request(url, querystring.encode('ascii'), headers=headers)

# Make a request and read the response
u = request.urlopen(req)
resp = u.read()
```

## post
如果你需要使用POST方法在请求主体中发送查询参数，可以将参数编码后作为可选参数提供给 urlopen() 函数，就像这样：
```python
from urllib import request, parse

# Base URL being accessed
url = 'http://httpbin.org/post'

# Dictionary of query parameters (if any)
parms = {
   'name1' : 'value1',
   'name2' : 'value2'
}

# Encode the query string
querystring = parse.urlencode(parms)

# Make a POST request and read the response
u = request.urlopen(url, querystring.encode('ascii'))
resp = u.read()
```
```python
# coding:utf8
import requests

def getResponse():
    # general部分的request url
    url = 'https://www.gebiz.gov.sg/ptn/opportunity/BOListing.xhtml'
    # 完全从request hreader里处理过来的数据
    headers = {'host': 'www.gebiz.gov.sg',
                'method': 'POST',
                'path': '/ptn/opportunity/BOListing.xhtml',
                'scheme': 'https',
                'version': 'HTTP/1.1',
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'accept-encoding': 'gzip, deflate',
                'accept-language': 'en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4',
                'cache-control': 'max-age=0',
                'content-length': '486',
                'content-type': 'application/x-www-form-urlencoded',
                'dnt': '1',
                'cookie': '__cfduid=d3945804a6f00d7cb1bb79047fd1f1e101456553632; BIGipServerPTN2_PRD_Pool=18964640.47873.0000; wlsessionid=edosaUufRur8IsiykZH7-o1WhSA1eV348F07T4udzbLUxNDjB_Wj!1656571856',
                'faces-request': 'partial/ajax',
                'origin': 'https://www.gebiz.gov.sg',
                'referer': 'https://www.gebiz.gov.sg/ptn/opportunity/BOListing.xhtml?origin=menu',
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36',
               }
    # 完全从form data里处理过来的数据
    data = {
        'contentForm': ' contentForm',
        'contentForm': ' j_idt54_listButton2_HIDDEN-INPUT:',
        'contentForm': ' j_idt61_searchBar_INPUT-SEARCH:',
        'contentForm': ' j_idt203_select:0',
        'contentForm:j_id36': 'contentForm:j_idt260_2_2',
        'javax.faces.ViewState:-6614576643680056808': '7012720147893489297',
        'javax.faces.source:contentForm': 'j_idt260_2_2',
        'javax.faces.partial.event': 'click',
        'javax.faces.partial.execute':'contentForm:j_idt260_2_2 contentForm:j_idt260',
        'javax.faces.partial.render':'contentForm:j_idt209',
        'javax.faces.behavior.event': 'action',
        'javax.faces.partial.ajax': 'true',
    }
    # 使用requests发送post请求
    resp = requests.post(url, headers=headers, data=data)
    return resp

if __name__ == '__main__':
    print('start')
    print(getResponse().content)
```

# requests
如果需要交互的服务比较复杂，可以用 requests 库。

## headers头
如果你需要在发出的请求中提供一些自定义的HTTP头，例如修改 user-agent 字段,可以创建一个包含字段值的字典，并创建一个Request实例然后将其传给 urlopen() ，如下：
```python
import requests

# Base URL being accessed
url = 'http://httpbin.org/post'

# Dictionary of query parameters (if any)
parms = {
   'name1' : 'value1',
   'name2' : 'value2'
}

# Extra headers
headers = {
    'User-agent' : 'none/ofyourbusiness',
    'Spam' : 'Eggs'
}

resp = requests.post(url, data=parms, headers=headers)

# Decoded text returned by the request
text = resp.text
```

## auth
```python
import requests
resp = requests.get('http://pypi.python.org/pypi?:action=login', auth=('user','password'))
```

## cookies
使用cookie登陆，服务器会认为你是一个已登陆的用户，所以就会返回给你一个已登陆的内容。因此，需要验证码的情况可以使用带验证码登陆的cookie解决。
```python
import requests            
requests_session = requests.session() 
response = requests_session.post(url=url_login, data=data)
```
若存在验证码，此时采用response = requests_session.post(url=url_login, data=data)是不行的，做法应该如下：
```python
response_captcha = requests_session.get(url=url_login, cookies=cookies)
response1 = requests.get(url_login) # 未登陆
response2 = requests_session.get(url_login) # 已登陆，因为之前拿到了Response Cookie！
response3 = requests_session.get(url_results) # 已登陆，因为之前拿到了Response Cookie！
```


```python
import requests

# First request
resp1 = requests.get(url)
...
# Second requests with cookies received on first requests
resp2 = requests.get(url, cookies=resp1.cookies)
```

### 从响应中获取cookie
requests已经封装好了很多操作，自动管理cookie, session保持连接,抓取数据后结束
那么我们就可以先访问该站的某个页，建立了session连接之后，获取cookie，再伪造头进行访问。
```python
import requests
s = requests.session()
s.get("https://www.gebiz.gov.sg/ptn/opportunity/BOListing.xhtml?origin=menu")
print s.cookies

# 下面是打印结果
<RequestsCookieJar[<Cookie __cfduid=d18b8067e8b19399aeb04f93f8f7fd5f81456743568 for .gebiz.gov.sg/>, <Cookie BIGipServerPTN2_PRD_Pool=52519072.47873.0000 for www.gebiz.gov.sg/>, <Cookie wlsessionid=jgAsrtUaMpsz9zrTPYxz3IYG1V1NN6G1tJWd-_hPnEFPGll5eNpS!1863425311 for www.gebiz.gov.sg/>]>
```

最后拼接cookie串：
```python
cook_value = ''
for x in s.cookies:
    cook_value += x.name + '=' + x.value + ';'
cook_value = cook_value[:len(cook_value)-1]
print(cook_value)
#打印结果
__cfduid=d9ed16845e45ce7496268e8b2293dadc81456745242;BIGipServerPTN2_PRD_Pool=18964640.47873.0000;wlsessionid=nUIsyGBSLqjakq4P5dEDh4TNUJBYtw4nIpxkyITzrj2A5CalOWZ9!-936114045
```


## 使用代理
适用情况：限制IP地址情况，也可解决由于“频繁点击”而需要输入验证码登陆的情况。
这种情况最好的办法就是维护一个代理IP池，网上有很多免费的代理IP，良莠不齐，可以通过筛选找到能用的。对于“频繁点击”的情况，我们还可以通过限制爬虫访问网站的频率来避免被网站禁掉。
```python
import requests
proxies = {'http':'http://XX.XX.XX.XX:XXXX'}
response = requests.get(url=url, proxies=proxies)
```

```python
Requests：
import requests
proxies = {'http':'http://XX.XX.XX.XX:XXXX'}
response = requests.get(url=url, proxies=proxies)

Urllib2：
import urllib2
proxies = {'http':'http://XX.XX.XX.XX:XXXX'}
proxy_support = urllib2.ProxyHandler(proxies)
opener = urllib2.build_opener(proxy_support, urllib2.HTTPHandler)
urllib2.install_opener(opener) # 安装opener，此后调用urlopen()时都会使用安装过的opener对象
response = urllib2.urlopen(url)
```

* 自动管理cookie
    * 参考个人笔记[《requests会自动管理cookies》](http://note.youdao.com/share/?id=a7395b9d02c1ec56300ffe658b9ce74f&type=note)

* requests.session获取特殊验证值
    * 参考个人笔记[requests.session获取特殊验证值](http://note.youdao.com/share/?id=396acae1852d16fbd6a373672b286394&type=note)



## 上传文件
```python
import requests
url = 'http://httpbin.org/post'
files = { 'file': ('data.csv', open('data.csv', 'rb')) }

r = requests.post(url, files=files)
```


## 通用
* gzip解压缩
在Code2中最后获取的数据是gzip压缩过的（在这个样例中返回的数据是服务器决定的），可以写进文件查看，对其进行解压缩：
```
#Code4
import gzip,StringIO

compressedData = response.read()
compressedStream=StringIO.StringIO(compressedData)
gzipper=gzip.GzipFile(fileobj=compressedStream)
data=gzipper.read()
```

* 限制频率

```
Requests，Urllib2都可以使用time库的sleep()函数：
import time
time.sleep(1)
```


# http.client
如果你决定坚持使用标准的程序库而不考虑像 requests 这样的第三方库，那么也许就不得不使用底层的 http.client 模块来实现自己的代码。比方说，下面的代码展示了如何执行一个HEAD请求：
```python
from http.client import HTTPConnection

c = HTTPConnection('www.python.org', 80)
c.request('HEAD', '/index.html')
resp = c.getresponse()

print('Status', resp.status)
for name, value in resp.getheaders():
    print(name, value)
```

# socketserver
## 创建TCP服务器
创建一个TCP服务器的一个简单方法是使用 socketserver 库。例如，下面是一个简单的应答服务器：
```python
from socketserver import BaseRequestHandler, TCPServer

class EchoHandler(BaseRequestHandler):
    def handle(self):
        print('Got connection from', self.client_address)
        while True:

            msg = self.request.recv(8192)
            if not msg:
                break
            self.request.send(msg)

if __name__ == '__main__':
    serv = TCPServer(('', 20000), EchoHandler)
    serv.serve_forever()
```

定义了一个特殊的处理类，实现了一个 handle() 方法，用来为客户端连接服务。 request 属性是客户端socket，client_address 有客户端地址。 为了测试这个服务器，运行它并打开另外一个Python进程连接这个服务器：
```python
from socket import socket, AF_INET, SOCK_STREAM
s = socket(AF_INET, SOCK_STREAM)
s.connect(('localhost', 20000))
s.send(b'Hello')
s.recv(8192)
```

socketserver 可以让我们很容易的创建简单的TCP服务器。 但是，默认情况下这种服务器是单线程的，一次只能为一个客户端连接服务。 如果你想处理多个客户端，可以初始化一个 ForkingTCPServer 或者是 ThreadingTCPServer 对象。例如：
```python
from socketserver import ThreadingTCPServer

if __name__ == '__main__':
    serv = ThreadingTCPServer(('', 20000), EchoHandler)
    serv.serve_forever()
```
使用fork或线程服务器有个潜在问题就是它们会为每个客户端连接创建一个新的进程或线程。 由于客户端连接数是没有限制的，因此一个恶意的黑客可以同时发送大量的连接让你的服务器奔溃。

如果你担心这个问题，你可以创建一个预先分配大小的工作线程池或进程池。 你先创建一个普通的非线程服务器，然后在一个线程池中使用 serve_forever() 方法来启动它们。
```python
if __name__ == '__main__':
    from threading import Thread
    NWORKERS = 16
    serv = TCPServer(('', 20000), EchoHandler)
    for n in range(NWORKERS):
        t = Thread(target=serv.serve_forever)
        t.daemon = True
        t.start()
    serv.serve_forever()
```

## 创建UDP服务器
跟TCP一样，UDP服务器也可以通过使用 socketserver 库很容易的被创建。 例如，下面是一个简单的时间服务器：
```python
from socketserver import BaseRequestHandler, UDPServer
import time

class TimeHandler(BaseRequestHandler):
    def handle(self):
        print('Got connection from', self.client_address)
        # Get message and client socket
        msg, sock = self.request
        resp = time.ctime()
        sock.sendto(resp.encode('ascii'), self.client_address)

if __name__ == '__main__':
    serv = UDPServer(('', 20000), TimeHandler)
    serv.serve_forever()
```
先定义一个实现 handle() 特殊方法的类，为客户端连接服务。 这个类的 request 属性是一个包含了数据报和底层socket对象的元组。client_address 包含了客户端地址。

我们来测试下这个服务器，首先运行它，然后打开另外一个Python进程向服务器发送消息：
```python
from socket import socket, AF_INET, SOCK_DGRAM
s = socket(AF_INET, SOCK_DGRAM)
s.sendto(b'', ('localhost', 20000))
s.recvfrom(8192)
```

# socket
## 服务端
```python
# 绑定
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
ip = "10.240.208.158"
port = 1886
sock.bind((ip, port))
# 监听连接
# 循环监控连接
while True:
    # 接收连接
    this_data, address = sock.recvfrom(2048)
    key_word = this_data.decode("utf-8")
    print('收到咨询：' + key_word)
    # 响应信息
    rst, address, issend = answer(key_word, address)
    if (issend == 0):
        sock.sendto(rst.encode("utf-8"), address)
sock.close()
```

## 客户端
```python
import socket
import pyperclip

ip = '10.240.208.158'
port = 1886
while True:
    # 连接
    # socket.socket(通信方式,套接字类型)
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.connect((ip, port))
    # 发送数据
    keywd = input("\r\n咨询问题:")
    if (keywd == "end"):
        break
    bstring = keywd.encode("utf-8")
    sock.sendall(bstring)
    # 接收服务端返回的数据
    rst = sock.recv(2048).decode("utf-8")
    answer = str(rst)
    print("\r\n客服回复:" + answer)
    pyperclip.copy(answer)
sock.close()

```



# 爬虫库
* mechanize [Python使用mechanize模拟登录、抓取数据的代码](http://blog.csdn.net/cnweike/article/details/8076440)
* selenium

# 反反爬虫
* [如何应对网站反爬虫策略？如何高效地爬大量数据?](https://www.zhihu.com/question/28168585)

# 爬虫框架
* scrapy
[基于Scrapy网络爬虫的搭建](http://www.lining0806.com/%E5%9F%BA%E4%BA%8Escrapy%E7%BD%91%E7%BB%9C%E7%88%AC%E8%99%AB%E7%9A%84%E6%90%AD%E5%BB%BA/)

* pyspider

# 爬虫案例
* [lining0806/WechatSearchProjects: 使用Scrapy或Requests递归抓取微信搜索结果](https://github.com/lining0806/WechatSearchProjects)
* [教你分分钟学会用python爬虫框架Scrapy爬取心目中的女神 \- 战神王恒 \- 博客园](http://www.cnblogs.com/wanghzh/p/5824181.html)
* 