---
layout:		post
category:	"python"
title:		"Python不定数量的变量"
tags:		[python]
---
- Content
{:toc}


使用场景：
1. 去掉一个最高分和一个最低分，保留中间数据。
2. 去掉开头或者末尾几个数据。

```python
def drop_first_last(grades):
    first, *middle, last = grades
    return avg(middle)
```
解压的不定量变量永远都是列表类型，不管解压的电话号码数量是多少（包括 0 个）。 所以，任何使用到不定量变量的代码就不需要做多余的类型检查去确认它是否是列表类型了。


