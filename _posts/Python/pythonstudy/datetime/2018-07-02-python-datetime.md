---
layout:		post
category:	"python"
title:		"Python日期时间"
tags:		[python]
---
- Content
{:toc}


- datetime.date：表示日期的类。常用的属性有year, month, day
- datetime.time：表示时间的类。常用的属性有hour, minute, second, microsecond
- datetime.datetime：表示日期时间
- datetime.timedelta：表示时间间隔，即两个时间点之间的长度
```python
timedelta([days[, seconds[, microseconds[, milliseconds[, minutes[, hours[, weeks]]]]]]])
```

# 日期运算，日期加上或者减去一个偏移
日期加一天：
```python
day = date.today() + datetime.timedelta(days=1)
```

```python
from datetime import datetime,timedelta
a = datetime(2012, 9, 23)
print(a + timedelta(days=10))       # 2012-10-03 00:00:00

b = datetime(2012, 12, 21)
d = b - a
print(d.days)                       # 89

now = datetime.today()
print(now)                          # 2012-12-21 14:54:43.094063
print(now + timedelta(minutes=10))  # 2012-12-21 15:04:43.094063
```
对大多数基本的日期和时间处理问题， datetime 模块已经足够了。 如果你需要执行更加复杂的日期操作，比如处理时区，模糊时间范围，节假日计算等等， 可以考虑使用 [dateutil模块](https://pypi.org/project/python-dateutil/)。

日期的格式化输出：
```python
from datetime import datetime
t = datetime.now()
s = t.strftime('%Y-%m-%d %H:%M:%S')
print(s)            # 2018-07-05 20:32:39
```

# strptime解析字符串的日期
```python
from datetime import datetime
text = '2018-06-20'
y = datetime.strptime(text, '%Y-%m-%d')
z = datetime.now()  # 2018-07-05
diff = z - y
print(diff.days)    # 15
```

# 格式化为书信形式的日期
```python
z = datetime.now()
nice_z = datetime.strftime(z, '%A %B %d, %Y')
print(nice_z)       # Thursday July 05, 2018
```

# 字符串自行解析日期
strptime() 的性能要比你想象中的差很多， 因为它是使用纯Python实现，并且必须处理所有的系统本地设置。 如果你要在代码中需要解析大量的日期并且已经知道了日期字符串的确切格式，可以自己实现一套解析方案来获取更好的性能。 比如，如果你已经知道所以日期格式是 YYYY-MM-DD ，你可以像下面这样实现一个解析函数：
```python
from datetime import datetime
def parse_ymd(s):
    year_s, mon_s, day_s = s.split('-')
    return datetime(int(year_s), int(mon_s), int(day_s))

print(parse_ymd(text))
```
实际测试中，这个函数比 datetime.strptime() 快7倍多。 如果你要处理大量的涉及到日期的数据的话，那么最好考虑下这个方案！

# 获取上一个星期五，获取下一个星期五
```python
from datetime import datetime
from dateutil.relativedelta import relativedelta
from dateutil.rrule import *
d = datetime.now()
print(d)                                  # 2018-07-05 20:10:50.228688

# Next Friday
print(d + relativedelta(weekday=FR))      # 2018-07-06 20:10:50.228688

# Last Friday
print(d + relativedelta(weekday=FR(-1)))  # 2018-06-29 20:10:50.228688
```