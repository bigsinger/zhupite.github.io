---
layout:		post
category:	"python"
title:		"Python的urllib库"
tags:		[python]
---
Urllib分为四个模块，但是常用的是三个模块。

- request：基本的请求模块，也就是发出请求的。
- error：错误模块，比如请求超时模块，404等，#URLError和HTTPError，HTTPError是URLError的子类，专门处理Http异常消息的，比如404,500等信息。
- parse：解析模块，解析请求成功偶返回的结果进行解析。
- robotparser：这个模块不常用，这里不做解释。

### 读取网页内容
```
#coding:utf-8  
import urllib.request  

req = urllib.request.urlopen('https://www.imooc.com/course/list')  
    buf = req.read()  
    #buf = buf.encode('utf-8')  
```

```python
#  coding:utf-8

import urllib.request
import urllib.parse
import urllib.error

#下面开始介绍urllib的使用，环境语言是python3，使用下面的网址作为参考
#http://www.sse.com.cn/market/bonddata/data/tb/

#设置属性
user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36'
referer = 'http://www.sse.com.cn/market/bonddata/data/ltb/'
#设置headers
headers = {'User-Agent': user_agent, 'Referer': referer}
#请求参数
request_param = {'jsonCallBack': 'jsonpCallback6588',
            'isPagination': 'true',
            'sqlId': 'COMMON_BOND_XXPL_ZQXX_L',
            'BONDTYPE': '地×××府债券',
            'pageHelp.pageSize': '25',
            'pageHelp.pageNo': '2',
            'pageHelp.beginPage': '2',
            'pageHelp.cacheSize': '1',
            'pageHelp.endPage': '21'}
request_param_encode = urllib.parse.urlencode(request_param).encode(encoding='UTF8')

# 需要请求的URL地址
request_url = 'http://query.sse.com.cn/commonQuery.do?'

# 使用Request来设置Headers
request = urllib.request.Request(request_url, request_param_encode, headers)

#设置代理服务器
proxy = urllib.request.ProxyHandler({'http':'113.214.13.1:8000'})
#挂载和安装一下
opener = urllib.request.build_opener(proxy)
urllib.request.install_opener(opener)

#具体细节开始使用
try:
    #这个是没有超时时间的，如果想要超时时间，可进行设置
    response = urllib.request.urlopen(request)
    data = response.read()
    print(data.decode('utf-8'))
# 异常处理模块，urllib有一个模块是error模块，是处理这块问题的
#URLError和HTTPError，HTTPError是URLError的子类，专门处理Http异常消息的，比如404,500等信息
except urllib.error.URLError as e:
    if hasattr(e, 'code'):
        print('HttpError')
        print(e.code)
    elif hasattr(e, 'reason'):
        print("URLError")
        print(e.reason)
```

## urllib.parse
**解析url**
urlparse() 函数可以将 URL 解析成 ParseResult 对象。对象中包含了六个元素，分别为：
- 协议（scheme）
- 域名（netloc）
- 路径（path）
- 路径参数（params）
- 查询参数（query）
- 片段（fragment）

```
from urllib.parse import urlparse

url='http://user:pwd@domain:80/path;params?query=queryarg#fragment'

parsed_result=urlparse(url)

print('parsed_result 包含了',len(parsed_result),'个元素')
print(parsed_result)
```
结果为:

```
parsed_result 包含了 6 个元素
ParseResult(scheme='http', netloc='user:pwd@domain:80', path='/path', params='params', query='query=queryarg', fragment='fragment')
```
ParseResult 继承于 namedtuple ，因此可以同时通过索引和命名属性来获取 URL 中各部分的值。

为了方便起见， ParseResult 还提供了 username 、 password 、 hostname 、 port 对 netloc 进一步进行拆分。

```
print('scheme  :', parsed_result.scheme)
print('netloc  :', parsed_result.netloc)
print('path    :', parsed_result.path)
print('params  :', parsed_result.params)
print('query   :', parsed_result.query)
print('fragment:', parsed_result.fragment)
print('username:', parsed_result.username)
print('password:', parsed_result.password)
print('hostname:', parsed_result.hostname)
print('port    :', parsed_result.port)
```
结果为：

```
scheme  : http
netloc  : user:pwd@domain:80
path    : /path
params  : params
query   : query=queryarg
fragment: fragment
username: user
password: pwd
hostname: domain
port    : 80
```
除了 urlparse() 之外，还有一个类似的 urlsplit() 函数也能对 URL 进行拆分，所不同的是， urlsplit() 并不会把 路径参数(params) 从 路径(path) 中分离出来。

当 URL 中路径部分包含多个参数时，使用 urlparse() 解析是有问题的：
```
url='http://user:pwd@domain:80/path1;params1/path2;params2?query=queryarg#fragment'

parsed_result=urlparse(url)

print(parsed_result)
print('parsed.path    :', parsed_result.path)
print('parsed.params  :', parsed_result.params)
```
结果为：

```
ParseResult(scheme='http', netloc='user:pwd@domain:80', path='/path1;params1/path2', params='params2', query='query=queryarg', fragment='fragment')
parsed.path    : /path1;params1/path2
parsed.params  : params2
```
这时可以使用 urlsplit() 来解析：

```
from urllib.parse import urlsplit
split_result=urlsplit(url)

print(split_result)
print('split.path    :', split_result.path)
# SplitResult 没有 params 属性
```
结果为：

```
SplitResult(scheme='http', netloc='user:pwd@domain:80', path='/path1;params1/path2;params2', query='query=queryarg', fragment='fragment')
split.path    : /path1;params1/path2;params2
```
若只是要将 URL 后的 fragment 标识拆分出来，可以使用 urldefrag() 函数：

```
from urllib.parse import urldefrag

url = 'http://user:pwd@domain:80/path1;params1/path2;params2?query=queryarg#fragment'

d = urldefrag(url)
print(d)
print('url     :', d.url)
print('fragment:', d.fragment)
```
结果为：
```
DefragResult(url='http://user:pwd@domain:80/path1;params1/path2;params2?query=queryarg', fragment='fragment')
url     : http://user:pwd@domain:80/path1;params1/path2;params2?query=queryarg
fragment: fragment
```
**组建URL**
ParsedResult 对象和 SplitResult 对象都有一个 geturl() 方法，可以返回一个完整的 URL 字符串。

```
print(parsed_result.geturl())
print(split_result.geturl())
```
结果为：

```
http://user:pwd@domain:80/path1;params1/path2;params2?query=queryarg#fragment
http://user:pwd@domain:80/path1;params1/path2;params2?query=queryarg#fragment
```
但是 geturl() 只在 ParsedResult 和 SplitResult 对象中有，若想将一个普通的元组组成 URL，则需要使用 urlunparse() 函数：

```
from urllib.parse import urlunparse
url_compos = ('http', 'user:pwd@domain:80', '/path1;params1/path2', 'params2', 'query=queryarg', 'fragment')
print(urlunparse(url_compos))
```
结果为：
```
http://user:pwd@domain:80/path1;params1/path2;params2?query=queryarg#fragment
```
**相对路径转换绝对路径**
除此之外， urllib.parse 还提供了一个 urljoin() 函数，来将相对路径转换成绝对路径的 URL。

```
from urllib.parse import urljoin

print(urljoin('http://www.example.com/path/file.html', 'anotherfile.html'))
print(urljoin('http://www.example.com/path/', 'anotherfile.html'))
print(urljoin('http://www.example.com/path/file.html', '../anotherfile.html'))
print(urljoin('http://www.example.com/path/file.html', '/anotherfile.html'))
```
结果为：
```
http://www.example.com/path/anotherfile.html
http://www.example.com/path/anotherfile.html
http://www.example.com/anotherfile.html
http://www.example.com/anotherfile.html
```
**查询参数的构造和解析**
使用 urlencode() 函数可以将一个 dict 转换成合法的查询参数：

```
from urllib.parse import urlencode

query_args = {
    'name': 'dark sun',
    'country': '中国'
}

query_args = urlencode(query_args)
print(query_args)
```
结果为：
```
name=dark+sun&country=%E4%B8%AD%E5%9B%BD
```
可以看到特殊字符也被正确地转义了。

相对的，可以使用 parse_qs() 来将查询参数解析成 dict。

```
from urllib.parse import parse_qs
print(parse_qs(query_args))
```
结果为：

```
{'name': ['dark sun'], 'country': ['中国']}
```
如果只是希望对特殊字符进行转义，那么可以使用 quote 或 quote_plus 函数，其中 quote_plus 比 quote 更激进一些，会把 : 、 / 一类的符号也给转义了。

```
from urllib.parse import quote, quote_plus, urlencode

url = 'http://localhost:1080/~hello!/'
print('urlencode :', urlencode({'url': url}))
print('quote     :', quote(url))
print('quote_plus:', quote_plus(url))
```
结果为：

```
urlencode : url=http%3A%2F%2Flocalhost%3A1080%2F%7Ehello%21%2F
quote     : http%3A//localhost%3A1080/%7Ehello%21/
quote_plus: http%3A%2F%2Flocalhost%3A1080%2F%7Ehello%21%2F
```
可以看到 urlencode 中应该是调用 quote_plus 来进行转义的。

逆向操作则使用 unquote 或 unquote_plus 函数：

```
from urllib.parse import unquote, unquote_plus

encoded_url = 'http%3A%2F%2Flocalhost%3A1080%2F%7Ehello%21%2F'
print(unquote(encoded_url))
print(unquote_plus(encoded_url))
```
结果为：

```
http://localhost:1080/~hello!/
http://localhost:1080/~hello!/
```
你会发现 unquote 函数居然能正确地将 quote_plus 的结果转换回来。

1. 获取url参数

```
>>>from urllib import parse

>>> url =r'[https://docs.python.org/3.5/search.html?q=parse&check_keywords=yes&area=default](https://docs.python.org/3.5/search.html?q=parse&check_keywords=yes&area=default)'

>>> parseResult=parse.urlparse(url)

>>> parseResult

ParseResult(scheme='https', netloc='docs.python.org', path='/3.5/search.html', params='', query='q=parse&check_keywords=yes&area=default', fragment=' ')

>>> param_dict=parse.parse_qs(parseResult.query)

>>> param_dict

{'q': ['parse'],'check_keywords': ['yes'],'area': ['default']}

>>> q=param_dict['q'][0]

>>> q

'parse'

#注意：加号会被解码，可能有时并不是我们想要的

>>> parse.parse_qs('proxy=183.222.102.178:8080&task=XXXXX|5-3+2')

{'proxy': ['183.222.102.178:8080'],'task': ['XXXXX|5-3 2']}
```
2. urlencode

```
>>> from urllib import parse
>>> query = {
  'name': 'walker',
  'age': 99,
  }
>>> parse.urlencode(query)
'name=walker&age=99'
```
3. quote/quote_plus

```
>>> from urllib import parse
>>> parse.quote('a&b/c')  #未编码斜线
'a%26b/c'
>>> parse.quote_plus('a&b/c')  #编码了斜线
'a%26b%2Fc'

```
4. unquote/unquote_plus

```
from urllib import parse
>>> parse.unquote('1+2')  #不解码加号
'1+2'
>>> parse.unquote_plus('1+2')  #把加号解码为空格
'1 2'
```
参考：
- [Python 的 urllib\.parse 库解析 URL \- 简书](https://www.jianshu.com/p/2bc58444f2ca)