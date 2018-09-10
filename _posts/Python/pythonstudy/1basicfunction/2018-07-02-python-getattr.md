---
layout:		post
category:	"python"
title:		"Python的getattr"
tags:		[python]
---
- Content
{:toc}


getattr() 函数用于返回一个对象属性值: 
```python
getattr(object, name[, default])
```

```python
class InfoCollection(object):

    def collect(self): 
        # 根据平台的不同，执行不同的方法
        try:
            func = getattr(self, platform.system())
            info_data = func()
        except AttributeError:
            sys.exit("不支持当前操作系统： [%s]! " % platform.system())

    def Linux(self):
        return linux_sys_info()

    def Windows(self):
        return windows_sys_info()
```

例如脚本不支持Mac系统，当在Mac上运行时会报AttributeError错误并输出当前的系统平台：Darwin


关联：[Python的hasattr](./python-hasattr.html)