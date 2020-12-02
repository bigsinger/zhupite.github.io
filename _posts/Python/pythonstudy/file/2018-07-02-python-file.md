---
layout:		post
category:	"python"
title:		"Python文件操作"
tags:		[python]
---
- Content
{:toc}


# 不使用with
不使用with打开文件赋值给变量，最终使用完成后要手动关闭，使用with无须手动关闭。
```python
f = open('somefile.txt', 'rt')
data = f.read()
f.close()
```

# 读写文本文件
带t的模式，例如读取文本用’rt’，写入文本用’wt’，追加文本用’at’。

一次性读取文件文本内容为一个字符串：
```python
with open('somefile.txt', 'rt') as f:
    data = f.read()
```

逐行迭代：
```python
with open('somefile.txt', 'rt') as f:
    for line in f:
        # process line
        ...
```

写入文本：
```python
with open('somefile.txt', 'wt') as f:
    f.write(text1)
    f.write(text2)
    ...
```
- readline()读取一行内容，放到一个字符串变量，返回str类型。
- readlines() 读取文件所有内容，按行为单位放到一个列表中，返回list类型。
- xreadlines()返回一个生成器，来循环操作文件的每一行。循环使用时和readlines基本一样，但是直接打印就不同。

# 指定文件的编码格式
默认是utf-8，如果不是，可以在打开的时候指定：
```python
with open('somefile.txt', 'rt', encoding='latin-1') as f:
    ...
```

# 读写字节文件
带b的模式，例如读取文本用’rb’，写入文本用’wb’
```python
with open('somefile.bin', 'rb') as f:
    data = f.read(16)
    text = data.decode('utf-8')

with open('somefile.bin', 'wb') as f:
    text = 'Hello World'
    f.write(text.encode('utf-8'))
```

二进制I/O还有一个鲜为人知的特性就是数组和C结构体类型能直接被写入，而不需要中间转换为自己对象。

```python
import array
nums = array.array('i', [1, 2, 3, 4])
with open('data.bin','wb') as f:
    f.write(nums)
```

很多对象还允许通过使用文件对象的 readinto() 方法直接读取二进制数据到其底层的内存中去。
```python
import array
a = array.array('i', [0, 0, 0, 0, 0, 0, 0, 0])
with open('data.bin', 'rb') as f:
    f.readinto(a)           # 16

print(a)                    # array('i', [1, 2, 3, 4, 0, 0, 0, 0])
```

# 文件不存在才写
Python3新功能，使用x代替w即可。如果文件不存在可以正常写，如果文件已经存在则报异常FileExistsError，也即不允许覆盖已有的文件。
```python
with open('somefile', 'xt') as f:
    f.write('Hello\n')
```

等价于：
```python
if not os.path.exists('somefile'):
    with open('somefile', 'wt') as f:
        f.write('Hello\n')
else:
    print('File already exists!')
```

# 关联
- [Python操作CSV文件](./python-csv.html)
- [Python操作CSV文件](./python-stringio-bytesio.html)