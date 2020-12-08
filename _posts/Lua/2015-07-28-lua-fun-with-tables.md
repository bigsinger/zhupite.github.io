---
layout:		post
category:	"lua"
title:		"Lua基础教程-FunWithTables"
tags:		[lua]
---
- Content
{:toc}
原文:http://lua-users.org/wiki/FunWithTables

题目:输出1到100之间的数哪些能被3整除,哪些能被5整除.

**常规的做法**是做一个从1到100的循环,让数模3和5,使用if else if这样语句进行判断.

```lua
for i = 1, 100 do
 if i %3 == 0 and i % 5 == 0 then
  print(i .. ' is divisible by both 3 and 5!')
 elseif i % 3 ~= 0 and i % 5 ~= 0 then
  print(i .. ' is not divisible by either 3 or 5!')
 elseif i % 3 == 0 then
  print(i .. ' is divisible by 3 only!')
 elseif i % 5 == 0 then
  print(i .. ' is divisible by 5 only!')
 end
end
```



一个有趣的做法是使用表.因为一个数要么能被3整除要么不被3整除,要么被5整除要么不能整除.

那么一个数能否被3和5整除一共是4种情况.分别用true和false来表示能整除和不能整除,那么结果是:

能被3整除 对 能被5整除/不能被5整除

true 对 true/false)

能被5整除 对 能被3整除/不能被3整除

false 对 true/false

这相当于一个二维数组,第一维是两个元素:true或false ,第二维也是两个元素:true或false.

Lua处理数组是非常强大的,把他们放到表里就是:

```lua
{ ['true']={'true','false'} }
```



**那么上述题目便有了如下的写法:**

```lua
result={ 
 [true] = { [true] = ' is divisible by both 3 and 5!', [false ] = ' is divisible by 3 only!' },
 [false] = { [true] = ' is divisible by 5 only!', [false] = ' is not divisible by either 3 or 5!' }
 }

for i=1,100 do
  print(i .. result[i % 3 == 0][i % 5 == 0] )
end
```



**其他演化的方法有:**

```lua
-- common to both variants
local a, b, c, d  =
  " is not divisible by either 3 or 5",
  " is divisible by 3 but not by 5",
  " is divisible by 5 but not by 3",
  " is divisible by both 3 and 5"

-- variant #1 --
local t = { a,b,c,d }
for x=1,100 do
  print(x .. t[(x%3==0 and 1 or 0) + (x%5==0 and 2 or 0) + 1])
end

-- variant #2 --
for x=1,100 do
  print(x .. (x%3==0 and (x%5==0 and d or b) or (x%5==0 and c or a)))
end
```

