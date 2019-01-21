---
layout:		post
category:	"lua"
title:		"Lua中几种类成员函数的设计方法"
tags:		[lua]
---
- Content
{:toc}

# 一、使用module函数
在Lua的开头文件中声明：
```
module("ClassA", package.seeall)
```
后面声明函数：
```
function test()

end
```
则在其他Lua文件中只要require进本文件，即可ClassA.test()使用。

# 二、利用表
在Lua的开头文件中声明：
```
ClassA = {}
```
后面声明函数：
```
function ClassA.test()  --注意是点

end
```
或者：
```
function test()

end
```

```
ClassA.test = test
```
或者
```
ClassA = {
    test = test,
    create = create,
}
```

则在其他Lua文件中只要require进本文件，即可ClassA.test()使用。

# 三、利用OO设计类
参考[Lua中实现类Class](./lua-class)，需要注意的是上面的设计方法使用时是用的点，如果用OO设计，函数调用时需要用冒号，表字段函数用点。

