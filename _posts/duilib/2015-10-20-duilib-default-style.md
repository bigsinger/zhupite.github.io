---
layout: 	post
category:	"duilib"
title:		利用duilib的default属性定制默认样式
tags:		[duilib,ui]
date:	2015-10-20	
---
下面我们介绍一下duilib的另一种特性，那就是可以定制默认样式，这样做有什么好处呢？

假如我们有10个按钮，按钮样式都一样，如果用之前介绍的方式，则需要在每个Button节点都指定图片背景、宽度、高度等信息，一旦需要改动任何一个属性，则需要在10个按钮里面都改一次，所以为了方便修改，我们可以指定一个默认样式，就算有100个按钮，我们也只需要改一次属性。

方法如下：
给<Window>节点添加一个Default节点即可，其中name属性填写控件的名字，value属性添加控件的属性的值，不过需要将双引号【"】换成【&quot;】，单引号【'】换成【&apos;】,单引号也可以不转换。

XML如下（由于标题栏基本不再变化，所以**后面的教程将省略<!-- 标题栏区 -->那一段XML）**：
```
<Window size="800,600" mininfo="600,400" caption="0,0,0,32" sizebox="4,4,4,4">
    <Default name="Button" value="  height=&quot;25&quot; width=&quot;60&quot; normalimage=&quot;file=&apos;BtnStyle\XP\button_nor.png&apos;&quot; hotimage=&quot;file=&apos;BtnStyle\XP\button_over.png&apos;&quot; pushedimage=&quot;file=&apos;BtnStyle\XP\button_down.png&apos;&quot; focusedimage=&quot;file=&apos;BtnStyle\XP\button_focus.png&apos;&quot; " />
    <VerticalLayout bkcolor="#FFF0F0F0" bkcolor2="#FFAAAAA0">
        <!-- 客户区 -->
        <HorizontalLayout>
            <Button text="XP"       float="true" pos="20,14,0,0"  height="25" />
            <Button text="win7"     float="true" pos="20,50,0,0"  height="25" />
            <Button text="百度杀毒" float="true" pos="20,86,0,0"  height="25" />
            <Button                 float="true" pos="20,132,0,0" height="25" />
        </HorizontalLayout>
    </VerticalLayout>
</Window>
```