---
layout:     post
category: 	"duilib"
title:      "DUILIB界面设计技巧：如何设计可切换的TAB页面"
tags:		[duilib,ui]
date:		2015-09-29
---

如图所示的窗口TAB页面如何设计呢？

![img](http://img.blog.csdn.net/20151010164647924)

主窗体的标题头我们设计一个HorizontalLayout，TAB页前面再增加一个HorizontalLayout用于显示LOGO，这不多表述。
为TAB按钮们添加一个HorizontalLayout，然后添加四个Option作为TAB按钮：

![img](http://img.blog.csdn.net/20151010164638325)

之所以选择Option是因为Option有选择状态（selected）属性可以设置，当被选择时我们就可以显示底部的小三角了。
设置按钮大小为：宽65高80，字体颜色为白色，FONT为1显示粗体。
文字居中对齐，TextPadding为：0, 0, 0, 20，也就是文字距离底部20像素居中显示。

设置foreimage为设计好的白色PNG图片，并设置好dest位置以便看上去是居中显示的，这里是：20,10,41,34

设置selectedimage，当选择时就显示的小三角图片，最重要的还是dest，这里是：25,72,39,80

第一个TAB按钮为默认选中状态，所以设置第一个按钮的selected属性为TRUE即可。

如图所示的窗口TAB页面如何设计呢？

主窗体的标题头我们设计一个HorizontalLayout，TAB页前面再增加一个HorizontalLayout用于显示LOGO，这不多表述。
为TAB按钮们添加一个HorizontalLayout，然后添加四个Option作为TAB按钮：
之所以选择Option是因为Option有选择状态（selected）属性可以设置，当被选择时我们就可以显示底部的小三角了。
设置按钮大小为：宽65高80，字体颜色为白色，FONT为1显示粗体。
文字居中对齐，TextPadding为：0, 0, 0, 20，也就是文字距离底部20像素居中显示。

设置foreimage为设计好的白色PNG图片，并设置好dest位置以便看上去是居中显示的，这里是：20,10,41,34

设置selectedimage，当选择时就显示的小三角图片，最重要的还是dest，这里是：25,72,39,80

第一个TAB按钮为默认选中状态，所以设置第一个按钮的selected属性为TRUE即可。