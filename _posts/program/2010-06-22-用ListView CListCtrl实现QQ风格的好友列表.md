---
layout:		post
category:	"program"
title:		"用ListView CListCtrl实现QQ风格的好友列表"
tags:		[mfc,c++]
---
- Content
{:toc}

一直想做个QQ那样的好友列表，即选中某项后可以放大显示。如果用Windows的ListView，主要要解决一个动态设置列表项高度的问题，但我翻遍了MSDN也没有找到解决方法，网上找的有3种方法设置listview列表项高度：

1.设置字体，把列表项撑起来。
2.设置图片，也是把列表项撑起来。
3.响应WM_MEASUREITEM，但这个消息只在列表被创建时发生一次。

以上方法都只能设置所有列表项的高度，不能为不同列表项单独设置不同的高度。我查了各种资料，似乎只有一种方法：从CreateWindow开始重新做一个，研究了下QQ的实现方式，也是如此。

但是在我准备从头写的时候还是想到了一个用ListView实现的办法，那就是把两行并为一行。几经周折，终于通过从CListCtrl派生一个类实现了大致的效果：

![](http://hiphotos.baidu.com/asmcvc/pic/item/4a90f60369725f4a3812bb59.jpg)

加入了头像的好友列表：

![](http://hiphotos.baidu.com/asmcvc/pic/item/3912b31baeae0e248718bf59.jpg)

原理就是在用户单击某行后，在此行下面插入一个新行，用自绘把这两行画成1行，当选中其他行时再把此行删除。具体方法为：

1.插入一个CListCtrl控件，把它的风格设为Report，Single Selection，No Column Header，Owner Draw Fixed。

2.从CListCtrl派生一个类，响应WM_MEASUREITEM或用一个图片设置所有列表项的高度，本例中为22。

3.准备3张图片，分别为选中列表项的上半部、下半部和没有选中的列表项背景。

4.响应WM_LBUTTONDOWN，在消息处理函数中完成列表项的插入和删除操作。需要注意的是改变选中项时在上次选中项的上面插入和下面插入的情况是不同的，要分别考虑。

5. 重载DrawItem（不是OnDrawItem），根据当前选中项的状态进行绘制。这里比较麻烦的是DrawItem在WM_LBUTTONDOWN时 就会触发，而列表选中项在鼠标弹起时才会改变，所以在WM_LBUTTONDOWN消息处理函数中就要根据情况提前设置好选中的列表项。

至于QQ的好友分组，用TreeView应该也能实现这种效果，可能比用ListView还简单，直接把选中项跟他的子叶画成一行就行了。

下面为VC6下的例程：
http://www.cppblog.com/Files/getborn/ListExample.rar

下面为列表类：
http://www.cppblog.com/Files/getborn/class%20CFriendList.rar

最后修改完善了下，效果图：

![](http://hiphotos.baidu.com/asmcvc/pic/item/e5b1a095fd888875d0135eef.jpg)