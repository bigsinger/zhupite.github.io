---
layout:     post
title:      PySpider HTTP 599 SSL certificate problem错误的解决方法
category: Python
description: 
---

错误信息：
```
[E 160329 11:32:22 base_handler:194] HTTP 599: SSL certificate problem: self signed certificate in certificate chain
    Traceback (most recent call last):
      File "D:\Python27\lib\site-packages\pyspider\libs\base_handler.py", line 187, in run_task
        result = self._run_task(task, response)
      File "D:\Python27\lib\site-packages\pyspider\libs\base_handler.py", line 166, in _run_task
        response.raise_for_status()
      File "D:\Python27\lib\site-packages\pyspider\libs\response.py", line 183, in raise_for_status
        raise http_error
    HTTPError: HTTP 599: SSL certificate problem: self signed certificate in certificate chain
```

**解决方法：**

使用：
```
self.crawl(url, callback=self.index_page, validate_cert=False)
```
并参考[pyspider创建淘女郎图片爬虫任务\-\-出师不利 \- 大星星的专栏 \- 博客频道 \- CSDN\.NET](http://blog.csdn.net/asmcvc/article/details/51016485)文末。
