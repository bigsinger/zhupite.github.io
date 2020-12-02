---
layout: 	post
category:	"duilib"
title:		关于duilib的字体font
tags:		[duilib,ui]
date:	2015-10-20	
---


前面介绍了Default属性，属于全局属性，而字体也是全局属性，也是定义到一级子节点。
```xml
<Font name="20号字体" size="20" bold="false" italic="false" />
<Font name="15号字体" size="15" bold="false" italic="false" />
```
序号从0开始，上述顺序中，第0个字体就是name为【20号字体】的字体，所以如果想用这个字体，只需要在控件的属性里指定字体序号即可，如：
```xml
<Button text="字体测试" font="0"/>
```
