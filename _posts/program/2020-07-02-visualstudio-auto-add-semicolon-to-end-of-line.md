---
layout:		post
category:	"program"
title:		"VisualStudio自动在代码行末尾添加分号"
tags:		[c++]
---
- Content
{:toc}


​	IDEA系列的IDE开发工具，都是在按下Shift+Ctrl+Enter组合快捷键之后在代码行末尾补全分号并自动换行，大大提高效率。然后VisualStudio却没有这样的快捷键，编程效率低下，完全跟不上速度啊，后来找了个插件勉强用着吧：**Productivity Power Tools**



​	菜单选择「扩展」-「管理扩展」，搜索「**Productivity Power Tools**」安装。如果搜索不到，也可以到这里[Productivity Power Tools 2017/2019 - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=VisualStudioPlatformTeam.ProductivityPowerPack2017)自行下载安装。



安装成功后，重新运行VisualStudio，使用快捷键 **Shift + Enter** 自动补全最后的分号，并换行。

这点跟IDEA系列还是有点区别，不过也可以勉强接受了。



不过后来发现在VisualStudio2019里编写代码时，直接在括号里面（注意无须移动光标到括号外面）输入分号，编辑器会自动把分号移动到括号外面，这点很好用，这样就不用安装上面的插件了，爽歪歪。