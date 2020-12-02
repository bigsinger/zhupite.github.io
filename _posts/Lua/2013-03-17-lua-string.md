---
layout:		post
category:	"lua"
title:		"Lua字符串函数库string"
tags:		[lua]
---

Lua中操纵字符串的功能基本来自于string库，字符串库中的一些函数是非常简单的：

## Lua字符串操作简单函数
#### string.reverse(str)
返回一个字符串的倒序排列
```
string.reverse("abcde")
->edcba
```

#### string.dump(function)
返回指定函数的二进制代码(函数必须是一个Lua函数，并且没有上值)

- **string.len**(s)			返回字符串s的长度。
- **string.rep**(s, n)		返回重复n次字符串s的串。如果使用string.rep("a", 2^20)可以创建一个1M字节的字符串（测试需要）。
- **string.lower**(s)		将s中的大写字母转换成小写。如果想不关心大小写对一个数组进行排序的话，可以这样：`table.sort(a, function (a, b) return string.lower(a) < string.lower(b) end)`
- **string.upper**(s)       将s中的小写字母转换成大写。
string.upper和string.lower都依赖于本地环境变量。所以，如果你在 European Latin-1环境下，表达式：`string.upper("a??o")    --> "A??O"`    
- **string.sub**(s,i,j)		函数截取字符串s的从第i个字符到第j个字符之间的串。Lua中，字符串的第一个字符索引从 **1** 开始。也可以使用负索引，负索引从字符串的结尾向前计数：-1指向最后一个字符，-2指向倒数第二个，以此类推。所以， string.sub(s, 1, j)返回字符串s的长度为j的前缀；string.sub(s, j, -1)返回从第j个字符开始的后缀。如果不提供第3个参数，默认为-1，因此我们将最后一个调用写为string.sub(s, j)；string.sub(s, 2, -2)返回去除第一个和最后一个字符后的子串，示例：
```
s = "[in brackets]"
print(string.sub(s, 2, -2)) --> in brackets
```
**记住**：Lua中的字符串是恒定不变的。string.sub函数以及Lua中其他的字符串操作函数都不会改变字符串的值，而是返回一个新的字符串。一个常见的错误是：
`string.sub(s, 2, -2)`
认为上面的这个函数会改变字符串s的值。如果你想修改一个字符串变量的值，你必须将变量赋给一个新的字符串：
`s = string.sub(s, 2, -2)`
- **string.char**函数和string.byte函数用来将字符在字符和数字之间转换。string.char获取0个或多个整数，将每一个数字转换成字符，然后返回一个所有这些字符连接起来的字符串。
- **string.byte**(s, i)将字符串s的第i个字符的转换成整数；第二个参数是可选的，缺省情况下i=1。下面的例子中，我们假定字符用ASCII表示：
```
print(string.char(97)) --> a
i = 99; print(string.char(i, i+1, i+2)) --> cde
print(string.byte("abc")) --> 97
print(string.byte("abc", 2)) --> 98
print(string.byte("abc", -1)) --> 99 
```
上面最后一行，我们使用负数索引访问字符串的最后一个字符。
- **string.format**(formatstring, ...)函数用来格式化字符串, 第一个参数是格式, 之后是对应格式中每个代号的各种数据. 由于格式字符串的存在, 使得产生的长字符串可读性大大提高了. 这个函数的格式很像C语言中的printf().函数string.format在用来对字符串进行格式化的时候，特别是字符串输出，是功能强大的工具。这个函数有两个参数，你完全可以照C语言的printf来使用这个函数。第一个参数为格式化串：由指示符和控制格式的字符组成。指示符后的控制格式的字符可以为：十进制'd'；十六进制'x'；八进制'o'；浮点数'f'；字符串's'。在指示符'%'和控制格式字符之间还可以有其他的选项：用来控制更详细的格式，比如一个浮点数的小数的位数：
格式字符串可能包含以下的转义码:
```
%c - 接受一个数字, 并将其转化为ASCII码表中对应的字符
%d, %i - 接受一个数字并将其转化为有符号的整数格式
%o - 接受一个数字并将其转化为八进制数格式
%u - 接受一个数字并将其转化为无符号整数格式
%x - 接受一个数字并将其转化为十六进制数格式, 使用小写字母
%X - 接受一个数字并将其转化为十六进制数格式, 使用大写字母
%e - 接受一个数字并将其转化为科学记数法格式, 使用小写字母e
%E - 接受一个数字并将其转化为科学记数法格式, 使用大写字母E
%f - 接受一个数字并将其转化为浮点数格式
%g(%G) - 接受一个数字并将其转化为%e(%E, 对应%G)及%f中较短的一种格式
%q - 接受一个字符串并将其转化为可安全被Lua编译器读入的格式
%s - 接受一个字符串并按照给定的参数格式化该字符串
```

为进一步细化格式, 可以在%号后添加参数. 参数将以如下的顺序读入:
1. 符号: 一个+号表示其后的数字转义符将让正数显示正号. 默认情况下只有负数显示符号.
2. 占位符: 一个0, 在后面指定了字串宽度时占位用. 不填时的默认占位符是空格.
3. 对齐标识: 在指定了字串宽度时, 默认为右对齐, 增加-号可以改为左对齐.
4. 宽度数值
5. 小数位数/字串裁切: 在宽度数值后增加的小数部分n, 若后接f(浮点数转义符, 如%6.3f)则设定该浮点数的小数只保留n位, 若后接s(字符串转义符, 如%5.3s)则设定该字符串只显示前n位.

在这些参数的后面则是上述所列的转义码类型(c, d, i, f, ...).
```
print(string.format("pi = %.4f", PI))
      --> pi = 3.1416

d = 5; m = 11; y = 1990
print(string.format("%02d/%02d/%04d", d, m, y))
        --> 05/11/1990

tag, title = "h1", "a title"
print(string.format("<%s>%s</%s>", tag, title, tag))
        --> <h1>a title</h1>
```
第一个例子，%.4f代表小数点后面有4位小数的浮点数。第二个例子%02d代表以固定的两位显示十进制数，不足的前面补0。而%2d前面没有指定0，不足两位时会以空白补足。对于格式串部分指示符得详细描述清参考lua手册，或者参考C手册，因为Lua调用标准C的printf函数来实现最终的功能。

以下是一些例子:
```
string.format("%%c: %c", 83)            输出S
string.format("%+d", 17.0)              输出+17
string.format("%05d", 17)               输出00017
string.format("%o", 17)                 输出21
string.format("%u", 3.14)               输出3
string.format("%x", 13)                 输出d
string.format("%X", 13)                 输出D
string.format("%e", 1000)               输出1.000000e+03
string.format("%E", 1000)               输出1.000000E+03
string.format("%6.3f", 13)              输出13.000
string.format("%q", "One\nTwo")         输出"One\
                                        　　Two"
string.format("%s", "monkey")           输出monkey
string.format("%10s", "monkey")         输出    monkey
string.format("%5.3s", "monkey")        输出  mon
```

## 模式匹配相关函数
- string.find	字符串查找
- string.gsub	全局字符串替换
- string.gfind	全局字符串查找
- string.gmatch	返回查找到字符串的迭代器


#### string.match(str, pattern, init)
string.match()只寻找源字串str中的第一个配对. 参数init可选, 指定搜寻过程的起点, 默认为1.
在成功配对时, 函数将返回配对表达式中的所有捕获结果; 如果没有设置捕获标记, 则返回整个配对字符串. 当没有成功的配对时, 返回nil.

```
string.match("abcdaef", "a")
-> a
```

#### string.gmatch(str, pattern)
这是一个返回迭代器的函数. 实际的用例如下:
```
s = "hello world from Lua"
for w in string.gmatch(s, "%a+") do
　print(w)
end
```
这里是一个捕获并将配对字符分别存到不同变量的例子:
```
t = {}
s = "from=world, to=Lua"
for k, v in string.gmatch(s, "(%w+)=(%w+)") do
　t[k]=v
end
for k, v in pairs(t) do
　print(k, v)
end
```


#### string.gfind(s, pattern)
返回一个迭代器，迭代器每执行一次，返回下一个匹配串；
iter = string.gfind("a=b c=d", "[^%s+]=[^%s+]")
print(iter()) <== a=b
print(iter()) <== c=d
通常用于泛性for循环,下面的例子结果同上
for s in string.gfind("a=b c=d", "[^%s+]=[^%s+]") do print(s)
end

#### string.find(str, pattern, pos, plain) 
第1个参数：源字符串
第2个参数：待搜索之模式串
第3个参数：从pos位置开始搜索
找到匹配返回：匹配串开始和结束的位置，否则返回nil

```
s = "hello world"
i, j = string.find(s, "hello")
print(i, j) --> 1 5print(string.sub(s, i, j)) --> helloprint(string.find(s, "world")) --> 7 11
i, j = string.find(s, "l")
print(i, j) --> 3 3print(string.find(s, "lll")) --> nil格式化的模式串
s = "Deadline is 30/05/1999, firm"
date = "%d%d/%d%d/%d%d%d%d"print(string.sub(s, string.find(s, date))) --> 30/05/1999下面的表列出了Lua支持的所有字符类：
```

string.find的基本应用就是用来在目标串（subject string）内搜索匹配指定的模式的串。函数如果找到匹配的串返回他的位置，否则返回nil.最简单的模式就是一个单词，仅仅匹配单词本身。比如，模式'hello'仅仅匹配目标串中的"hello"。当查找到模式的时候，函数返回两个值：匹配串开始索引和结束索引。
```
s = "hello world"
string.find(s, "hello")    --> 1    5
string.find(s, "world")    --> 7    11
string.find(s, "l")        --> 3    3
string.find(s, "lll")      --> nil
```
string.find函数第三个参数是可选的：标示目标串中搜索的起始位置。当我们想查找目标串中所有匹配的子串的时候，这个选项非常有用。我们可以不断的循环搜索，每一次从前一次匹配的结束位置开始。下面看一个例子，下面的代码用一个字符串中所有的新行构造一个表：
```
local t = {}      -- 存放回车符的位置
local i = 0
while true do
    i = string.find(s, "\n", i+1)  -- 查找下一行
    if i == nil then break end
    table.insert(t, i)
end
```



#### string.sub(str,sPos,ePos)
string.gsub的功能是截取字符串，他从指定起始位置截取一个字符串。string.sub可以利用string.find返回的值截取匹配的子串。
对简单模式而言，匹配的就是其本身
```
s = "hello world"
local i, j = string.find(s, "hello")    --> 1    5
string.sub(s, i, j)        				--> hello
```

#### string.gsub(str, sourcestr, desstr)
string.gsub的基本作用是用来查找匹配模式的串，并将使用替换串其替换掉：
string.gsub函数有三个参数：目标串，模式串，替换串。
```
s = string.gsub("Lua is cute", "cute", "great")
print(s)      --> Lua is great
s = string.gsub("all lii", "l", "x")
print(s)      --> axx xii
s = string.gsub("Lua is great", "perl", "tcl")
print(s)      --> Lua is great
```
第四个参数是可选的，用来限制替换的范围：
```
s = string.gsub("all lii", "l", "x", 1)
print(s)          --> axl lii
s = string.gsub("all lii", "l", "x", 2)
print(s)          --> axx lii
```
string.gsub的第二个返回值表示他进行替换操作的次数。例如，下面代码涌来计算一个字符串中空格出现的次数：
```
_, count = string.gsub(str, " ", " ") 	--注意，_ 只是一个哑元变量

```

#### string.gsub(s, pattern, func)
第3个参数：自定义函数，对找到的匹配操作，并传出替换值
```
s, n = string.gsub("hello world", "l+", function(s) return"xxx"end)
print(s, n) <== hexxxo worxxxd 
```


1. string库中所有的字符索引从前往后是1,2,...、从后往前是-1,-2,...
2. string库中所有的function都不会修改参数中的字符串，而是返回一个结果
```
	s = "[abc]" string.len(s) 	<==返回5
	string.rep("abc", 2) 		<==返回"abcabc"
	string.lower("ABC") 		<==返回"abc"
	string.upper("abc") 		<==返回"ABC"
	string.sub(s, 2)     		<==返回"abc]"
	string.sub(s, -2)    		<==返回"c]"
	string.sub(s, 2, -2) 		<==返回"abc"
	string.format(fmt, ...)		<==返回一个类似printf的格式化字符串
```


#### string.gsub(str, pattern, repl, n)
string.gsub()函数根据给定的配对表达式对源字符串str进行配对, 同时返回源字符串的一个副本, 该副本中成功配对的所有子字符串都将被替换. 函数还将返回成功配对的次数.实际的替换行为由repl参数的类型决定:
当repl为字符串时, 所有成功配对的子字符串均会被替换成指定的repl字串.
当repl为table时, 对每个成功配对的子字符串, 函数均会试图寻找以其为key值的table中的元素, 并返回该元素. 如果该配对包含任何捕获信息, 则以编号为1号的捕获作为key值进行查找.
当repl为函数时, 每个成功配对的子字符串均会作为参数被传入到该函数中去.
在repl是table或函数时, 如果该table或函数返回了字串或数字的值, 这个值依然会被用于替换副本字串中的配对子字串. 如果该table/函数返回的值为空, 将不发生替换.
n参数可选, 当它被指定时, string.gsub()函数只对源字符串中的前n个成功配对的成员进行操作.
以下是几个例子:
```
> print(string.gsub("hello world", "(%w+)", "%1 %1"))
hello hello world world 2

> print(string.gsub("hello Lua", "(%w+)%s*(%w+)", "%2 %1"))
Lua hello 1

> string.gsub("hello world", "%w+", print)
hello world 2

> lookupTable = {["hello"] = "hola", ["world"] = "mundo"}
> print(string.gsub("hello world", "(%w+)", lookupTable))
hola mundo 2
```
