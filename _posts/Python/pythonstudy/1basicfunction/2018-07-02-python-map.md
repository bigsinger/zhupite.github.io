---
layout:		post
category:	"python"
title:		"Python的map"
tags:		[python]
---
- Content
{:toc}

map是Python内置的高阶函数，它接收一个函数f和一个list，并通过把函数f依次作用在 list 的每个元素上，得到一个新的 list 并返回。对传入的list的每一个元素进行映射，返回一个新的映射之后的list。

**注意：**map()函数不改变原有的 list，而是返回一个新的 list。

```python
def f(x):
    return x*x
print map(f, [1, 2, 3, 4, 5, 6, 7, 8, 9])

# 输出结果：
# [1, 4, 9, 10, 25, 36, 49, 64, 81]
```
利用map()函数，可以把一个 list 转换为另一个 list，只需要传入转换函数。

由于list包含的元素可以是任何类型，因此，map() 不仅仅可以处理只包含数值的 list，事实上它可以处理包含任意类型的 list，只要传入的函数f可以处理这种数据类型。

**任务：**假设用户输入的英文名字不规范，没有按照首字母大写，后续字母小写的规则，请利用map()函数，把一个list（包含若干不规范的英文名字）变成一个包含规范英文名字的list： 
输入：['adam', 'LISA', 'barT'] 
输出：['Adam', 'Lisa', 'Bart']
```python
def format_name(s):
    s1=s[0:1].upper()+s[1:].lower();
    return s1;

print map(format_name, ['adam', 'LISA', 'barT'])

```

实现 “1,2,3” 变成 [‘1’,’2’,’3’]：
```python
L = [1,2,3]
NL =list(map(str,L))
print(NL)

```

## 参考
- [python map函数 \- 超级学渣渣 \- 博客园](http://www.cnblogs.com/superxuezhazha/p/5714970.html)
- 