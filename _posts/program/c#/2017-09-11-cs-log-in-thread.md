---
layout:		post
category:	"program"
title:		"C#日志输出函数封装支持线程中使用"
tags:		[c#]
---
[C\#在RichTextBox中显示不同颜色文字的方法\_C\#教程\_脚本之家](http://www.jb51.net/article/69791.htm)
```c#
#region 日志记录、支持其他线程访问 参考：C#在RichTextBox中显示不同颜色文字的方法 http://www.jb51.net/article/69791.htm
public delegate void LogAppendDelegate(string text, Color color);
private void _log(string text, Color color)
{
    this.rtLog.SelectionColor = color;
    this.rtLog.AppendText(text + "\n");
}

private void log(string text, Color color)
{
    LogAppendDelegate la = new LogAppendDelegate(_log); 
    this.rtLog.Invoke(la, text, color);
}

private void LOGD(string text)
{
    log(text, Color.Black);
}

private void LOGW(string text)
{
    log(text, Color.Orange);
}

private void LOGE(string text)
{
    log(text, Color.Red);
}
#endregion
```
