---
layout:     post
category: 	"duilib"
title:      DuiDesigner改进：不绘制绿色边框
tags:		[duilib,ui,duidesigner]
date:		2015-10-10
---

默认效果如上图，想修改为下图：

![img](http://img.blog.csdn.net/20151010164141042)

![img](http://img.blog.csdn.net/20151010164150649)

代码中搜索RGB颜色表示：0,255,0，找到函数：CLayoutManager::DrawAuxBorder
注释掉所有对此函数的调用即可。

## 参考
- [DuiDesigner修改：增强选择元素后的用户体验](http://blog.csdn.net/asmcvc/article/details/49026061)
- [关于duilib中的list的扩展探索](http://blog.csdn.net/asmcvc/article/details/49281339)
- [duilib CTileLayoutUI 控件](http://blog.csdn.net/asmcvc/article/details/50292295)
- [duilib中ListCtrl控件的实现](http://blog.csdn.net/asmcvc/article/details/50292333)
