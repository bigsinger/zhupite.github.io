---
layout:		post
category:	"lua"
title:		"Lua的日期时间"
tags:		[lua]
---
- Content
{:toc}


# os.date([format [, time]])
返回一个按format格式化日期、时间的字串或表。若设置time参数，则按time指定的时间格式化，否则按当前时间格式化。

参数format:
- "!": 按格林尼治时间进行格式化。
- "*t": 将返一个带year(4位),month(1-12), day (1--31), hour (0-23), min (0-59), sec (0-61), wday (星期几, 星期天为1), yday (年内天数), and isdst (是否为日光节约时间true/false)的带键名的表; 若没有"*t"则返回一个按C的strftime函数格式化的字符串。

若不带参数，则按当前系统的设置返回格式化的字符串 os.date() <=> os.date("%c")

```lua
t = os.date("*t", os.time())
for i, v in pairs(t) do
	print(i, v)
end

输出：
hour  14
min   58
wday  2
day   10
month 8
year  2009
sec   18
yday  222
isdst false
```

对于其它的格式字符串，os.date会将日期格式化为一个字符串：
```lua
print(os.date("today is %A, in %B"))	-->today is Tuesday, in May
print(os.date("%x", 906000490))			-->09/16/1998
```

## 格式化字符串
```lua
%a		一星期中天数的简写			（Wed）
%A      一星期中天数的全称			（Wednesday）
%b      月份的简写                  （Sep）
%B      月份的全称             		（September）
%c      日期和时间                 	（09/16/98 23:48:10）
%d      一个月中的第几天           	（16）[0 ~ 31]
%H      24小时制中的小时数        	（23）[00 ~ 23]
%I      12小时制中的小时数         	（11）[01 ~ 12]
%j      一年中的第几天           	（259）[01 ~ 366]
%M      分钟数                     	（48）[00 ~ 59]
%m      月份数                 		（09）[01 ~ 12]     
%P      "上午(am)" 或 "下午(pm)"	(pm)
%S      秒数                     	（10）[00 ~ 59]
%w      一星期中的第几天          	（3）[0 ~ 6 = 星期天 ~ 星期六]
%W　　	一年中的第几个星期　　　　　0 ~ 52
%x      日期                    	（09/16/98）
%X      时间                        （23:48:10）
%y      两位数的年份                （90）[00 ~ 99]
%Y      完整的年份                 	（2009）
%%      字符串'%'
```

# os.time([table])
功能：按table的内容返回一个时间值(数字),若不带参数则返回当前时间。

table的字段：year, month, day, hour, min, sec, isdst
```lua
print(os.time()) 									-->1249887340
print(os.time({year=1970, month=1, day=1, hour=0}))	-->10500
```



# os.difftime(t2, t1)
获取两个时间相差的秒数

```lua
t1 = os.time() s = os.difftime(t1, tw) h = s/(60*60) m = s/60%60 S = s%60 print(s,h,m,S)
```

# os.clock()
返回一个程序使用CPU时间的一个近似值。
```lua
local x = os.clock();
print(os.clock())
local s = 0;
for i = 1, 100000000 do
      s = s + i;
end
print(string.format("elapsed time : %.2f\n", os.clock() - x));
```


# 获取年月日时分秒
```lua
local Y = os.date("%Y")
local M = os.date("%m")
local D = os.date("%d")
local Hour = os.date("%H")
local Minute = os.date("%M")
```

# 解析日期字符串
```lua

```

# 获取几天前的时间
```lua
local dt1 = os.time()

function getPrevday(interval)
    local offset = 60 *60 * 24 * interval
    --指定的时间+时间偏移量  
    local newTime = os.date("*t", dt1 - tonumber(offset))
    return newTime
end
```


