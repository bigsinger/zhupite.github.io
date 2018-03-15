---
layout:     post
category: 	"duilib"
title:      DuiDesigner改进：不绘制绿色边框
tags:		[duilib,ui,duidesigner]
date:		2015-10-10
---

默认效果如左图，想修改为右图：
![img](http://img.blog.csdn.net/20151010164141042)

![img](http://img.blog.csdn.net/20151010164150649)

代码中搜索RGB颜色表示：0,255,0，找到函数：CLayoutManager::DrawAuxBorder
注释掉所有对此函数的调用即可。