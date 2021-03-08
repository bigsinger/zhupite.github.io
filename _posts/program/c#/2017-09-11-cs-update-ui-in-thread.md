---

layout:		post
category:	"program"
title:		"C#创建线程及线程消息更新界面UI"
tags:		[c#,wpf,winform]
---

# 创建线程

```c#
new Thread(new ThreadStart(this.ThreadMethod)).Start();

// new Thread(new ThreadStart(this.ThreadMethod)).Start(param);
```



# 线程函数

```c#
private void ThreadMethod() {

    //...
    
    ThreadPool.QueueUserWorkItem((o) => {
        Application.Current.Dispatcher.BeginInvoke(DispatcherPriority.SystemIdle, new Action(() => {
            ImageSource i = getItemImageIndex(item);
            item.imageSource = i;
        }));
    });
    
    //...
}
```



# 线程通知更新UI

- 结合lambda表达式，代码会简洁一些。
- WPF中使用：Application.Current.Dispatcher.BeginInvoke
- winform中使用SynchronizationContext的Post或Send
- 注：不要再用 **InvokeRequired** 的方式了，太蹩脚了。
- 注：WPF中使用SynchronizationContext无效，实测会出现问题。



## WPF应用在线程中通知更新UI

```c#
private void ThreadMethod() {

    //...
    
    ThreadPool.QueueUserWorkItem((o) => {
        Application.Current.Dispatcher.BeginInvoke(DispatcherPriority.SystemIdle, new Action(() => {
            ImageSource i = getItemImageIndex(item);
            item.imageSource = i;
        }));
    });
    
    //...
}
```

## winform应用在线程中通知更新UI

```c#
private SynchronizationContext mContext;            //UI线程同步上下文

mContext = SynchronizationContext.Current; 			//获取UI线程同步上下文

mContext.Post((o) => {
    //updateUI code..
}, param);


```





