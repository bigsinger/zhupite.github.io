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