---
layout:		post
category:	"python"
title:		"Python网络操作相关"
tags:		[python]
---
- Content
{:toc}


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
```python
import requests

# First request
resp1 = requests.get(url)
...
# Second requests with cookies received on first requests
resp2 = requests.get(url, cookies=resp1.cookies)
```

## 上传文件
```python
import requests
url = 'http://httpbin.org/post'
files = { 'file': ('data.csv', open('data.csv', 'rb')) }

r = requests.post(url, files=files)
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
