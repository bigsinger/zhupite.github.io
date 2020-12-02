---
layout:		post
category:	"python"
title:		"Python的requests库"
tags:		[python]
---

```python
#  coding:utf-8

import requests

#下面开始介绍requests的使用，环境语言是python3，使用下面的网址作为参考
#http://www.sse.com.cn/market/bonddata/data/tb/

request_param = {'jsonCallBack': 'jsonpCallback6588',
            'isPagination': 'true',
            'sqlId': 'COMMON_BOND_XXPL_ZQXX_L',
            'BONDTYPE': '地×××府债券',
            'pageHelp.pageSize': '25',
            'pageHelp.pageNo': '2',
            'pageHelp.beginPage': '2',
            'pageHelp.cacheSize': '1',
            'pageHelp.endPage': '21'}

user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36'
referer = 'http://www.sse.com.cn/market/bonddata/data/ltb/'
#设置headers
headers = {'User-Agent': user_agent, 'Referer': referer}
#设置代理
proxy = {
    "http":"http://113.214.13.1:8000"
}

# 需要请求的URL地址
request_url = 'http://query.sse.com.cn/commonQuery.do?'

#设置请求地址
response = requests.get(request_url, headers=headers, proxies=proxy, params=request_param);
print(response.status_code)
#文本响应内容
print(response.text)
#json格式响应内容
print(response.json())
#二进制响应内容
print(response.content)
#原始格式
print(response.raw)
```