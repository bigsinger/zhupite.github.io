---
layout:		post
category:	"soft"
title:		"禁用Windows系统无用服务，解决占用内存过高磁盘使用过高提升电脑速度性能的解决方法"

tags:		[Windows,service]
---
- Content
{:toc}
**关键词**：Windows，win10，系统服务, service，服务主机，本地服务，网络受限，磁盘100%，电脑性能



![](https://t11.baidu.com/it/u=2522340688,1801666634&fm=173&app=49&f=JPEG?w=640&h=430&s=CD52E813372E750940F440DA0200C0B2)

![](https://filestore.community.support.microsoft.com/api/images/05fcb00c-4656-4a3d-aa9e-99443fcab2fa?upload=true)

# 1、禁用无用系统服务

打开系统服务管理，有两种方式：

- 按下WIN+R，然后输入services.msc 回车
- 右键电脑 - 管理 - 服务和应用程序 - 服务



找到以下服务并禁用：

- Homegroup Listener
- Homegroup Provider
- Superfetch
- Connected User Experiences and Telemetry
- Sysmain
- Diagnostic Execution Service
- Diagnostic Policy Service
- Diagnostic Service Host
- Diagnostic System Host
- DiagTrack Diagnostics Tracking Service



禁用方法：

- 先右键选中后停止服务
- 右键菜单查看属性 - 常规 - 启动类型，选择禁用
- 属性 - 恢复 ，第一次失败、第二次失败、后续失败全部选择「无操作」







# 2、退出家庭组策略

家庭组策略会导致磁盘占用100%的情况，但是这个功能一般用户又用不到，鸡肋功能，可以直接关闭掉。



可以参考微软官方的回答：

- [Windows 8.1或Windows 10磁盘占用率100%的原因及解决方法 Microsoft Community](https://answers.microsoft.com/zh-hans/windows/forum/windows_10-files/windows-81%E6%88%96windows/2f75da7c-fd52-4dc1-b452-17de3b23fb8d?tm=1440987391608)
- [服务主机: 本地系统(网络受限） 硬盘占用率太大 Microsoft Community](https://answers.microsoft.com/zh-hans/windows/forum/windows_8-hardware/%e6%9c%8d%e5%8a%a1%e4%b8%bb%e6%9c%ba/d98a0681-d879-4375-ab5a-dda1c71939f0?messageId=18f788d8-81c9-4bbe-b081-ad889a261f17)
- 





打开控制面板 - 选择家庭组和共享选项（网络和Internet下面），然后点「离开家庭组」。





# 3、排除三方软件或服务

- 按Win键+R，输入msconfig，打开系统配置。
- 在“系统配置”对话框中的“服务”选项卡上，点按或单击选中“隐藏所有 Microsoft 服务”复选框，然后点按或单击“全部禁用”。(如果您启用了指纹识别功能，请不要关闭相关服务）
- 在“系统配置”对话框的“启动”选项卡上，单击“打开任务管理器”。
- 在任务管理器的“启动”选项卡上，针对每个启动项，选择启动项并单击“禁用”。
- 在“系统配置”对话框的“启动”选项卡上，单击“确定”，然后重新启动计算机。



# 4、关闭IPv6协议

Windows 8.1和Windows10默认开启了IPv6协议，这同样会增加磁盘占用率，而目前IPv6地址还未普及，所以可以先关闭IPv6协议



# 最后的办法：重装系统

如果以上方法均无效，可以尝试重新安装操作系统来解决。

[下载 Windows 10](https://www.microsoft.com/zh-cn/software-download/windows10)

