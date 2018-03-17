---
layout:		post
category:	"program"
title:		"C#创建线程线程消息更新界面"
tags:		[c#]
---

创建线程：
```
Thread th = new Thread(threadWork);
th.Start(param);
```
线程函数：
```
void threadWork(object param)
{
    string sParam = (string)param;
    log("xxx\n", Color.Blue);
    //dowork....
    workEnd(null);
}
```

更新界面的函数：
```
private delegate void delegate_WorkEnd(string Msg);
private void workEnd(string tmp)
{
    if (this.InvokeRequired)
    {
        var hander = new delegate_WorkEnd(wrapperEnd);
        this.Invoke(hander, tmp);
    }
    else
    {
        this.btnStart.Enabled = true;
    }
}
```
