---
layout:		post
category:	"soft"
title:		"Windows电脑广告弹窗怎么去掉？一招教你彻底根治流氓弹窗"
tags:		[]
---
- Content
{:toc}
​	现在的广告弹框做的比较专业，在Windows电脑自带的任务管理器里已经很难定位到弹框的进程了，那么如何找到弹出广告窗口的程序呢？这里教大家一个绝招，彻底解决流氓弹窗。



# 准备工具

[process-explorer](https://docs.microsoft.com/en-us/sysinternals/downloads/process-explorer)



# 操作步骤

1. 下载process-explorer。
2. 运行process-explorer，找到工具栏上面的**瞄准镜**按钮（鼠标放上去显示：**Find Window's Process(drag over window)**）。
3. 点击瞄准镜按钮不松移动到广告弹框上面，然后松开，process-explorer会自动定位到弹流氓窗口的进程。
4. 右键查看进程的属性，找到进程路径，删除或者卸载掉即可。



# 弹框广告去除案例

## FlashHelperService弹框广告去除办法

某一日电脑右下角弹出一个广告窗口，使用process-explorer定位后，看到是**FlashHelperService.exe**进程弹出的，但是找不到具体的程序路径，process-explorer显示：拒绝访问。



实际上FlashHelperService是一个服务，需要先结束服务，再找到程序路径删除掉，具体步骤如下：

- 打开任务管理器，找到服务页面，找到**Flash Helper Service**服务，然后停止该服务。
- 然后右键该服务，选择：打开服务，在弹出的窗口里面，接着搜索服务：**Flash Helper Service**， 搜索到后右键查看其**属性**，就可以看到该服务对应的**可执行文件路径**了，例如我的电脑上该服务的可执行文件路径是："C:\Windows\SysWOW64\Macromed\Flash\FlashHelperService.exe"，把该文件改名或者删除掉。
- 在上面的服务选项卡里，把该服务的**启动类型**修改为**禁用**，这样以后该服务都不会再运行了。



## 美图秀秀弹窗广告去除

定位到是进程：MessageBox.exe、XiuXiuRender.exe，任务管理器结束进程后，到美图秀秀安装目录下，将这两个文件重命名或者删除掉。



