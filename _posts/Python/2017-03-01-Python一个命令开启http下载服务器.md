---
layout:     post
title:      Python一个命令开启http下载服务器
category: python
---

- 下载并安装Python

- 例如这里想把命令E:\easytest作为提供下载的目录，那么在cmd里cd到该目录下，并执行命令：
```
python -m SimpleHTTPServer 
```

如果提示错误：
```
No module named SimpleHTTPServer
```

则试一下命令：
```
python -m http.server
```

以下是命令执行记录作为参考：

```
E:\easytest>D:\Python34\python.exe  -m SimpleHTTPServer
D:\Python34\python.exe: No module named SimpleHTTPServer

E:\easytest>D:\Python34\python.exe  -m http.server
```



开启多线程：
[Multithreaded Python Simple HTTP Server](https://kdecherf.com/blog/2012/07/29/multithreaded-python-simple-http-server/)

这个脚本不支持Python3.x，所以需要安装2.x的Python。


python -m CGIHTTPServer 8081