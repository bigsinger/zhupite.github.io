---
layout:		post
category:	"lua"
title:		"Lua的select函数：从列表中多个元素的第N个开始选取"
tags:		[lua]
---
```lua
--select函数是返回参数列表中指定位置之后的参数，例如可以用于string.find函数：
local  name,value = select(3, string.find('name=tom', '(%w+)=(%w+)'))
--就可以直接返回我们需要的两个值，而不在有多出来的两个起始、中止位置的变量值。
print( string.find('name=tom', '(%w+)=(%w+)') )
print( select(3, string.find('name=tom', '(%w+)=(%w+)')) )
--输出:
1 8 name tom
name tom

```