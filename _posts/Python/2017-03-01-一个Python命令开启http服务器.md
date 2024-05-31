---
layout:     post
title:      一个Python命令开启http服务器
category: python
---

- 下载并安装Python

- 如把`E:\test`作为服务器根目录，则在该目录下执行命令：
```bash
python -m SimpleHTTPServer 	8080	# Python2
python -m http.server 8080			# Python3
```



如果要解决跨域问题`blocked by CORS policy: No 'Access-Control-Allow-Origin' header`，可以启用如下的`Python`脚本。

```python
#!/usr/bin/env python
try:
	# Python 3
	from http.server import HTTPServer, SimpleHTTPRequestHandler, test as test_orig
	import sys
	def test (*args):
	test_orig(*args, port=int(sys.argv[1]) if len(sys.argv) > 1 else 8000)
except ImportError: # Python 2
	from BaseHTTPServer import HTTPServer, test
	from SimpleHTTPServer import SimpleHTTPRequestHandler

    
class CORSRequestHandler (SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST')
        self.send_header('Access-Control-Allow-Headers', 'x-requested-with,content-type')
        SimpleHTTPRequestHandler.end_headers(self)
    
if __name__ == '__main__':
    test(CORSRequestHandler, HTTPServer)
```


