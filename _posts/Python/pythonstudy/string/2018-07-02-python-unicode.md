---
layout:		post
category:	"python"
title:		"Python的Unicode字符串"
tags:		[python]
---
- Content
{:toc}


# Unicode字符串标准化
```python
s1 = 'Spicy Jalape\u00f1o'
s2 = 'Spicy Jalapen\u0303o'
print(s1)           # Spicy Jalapeño
print(s2)           # Spicy Jalapeño
print(len(s1))      # 14
print(len(s2))      # 15

import unicodedata
t1 = unicodedata.normalize('NFC', s1)
t2 = unicodedata.normalize('NFC', s2)
print(t1==t2)       # True
print(t1)           # Spicy Jalapeño
print(t2)           # Spicy Jalapeño

s = "Marek Čech"    # unicode
line = unicodedata.normalize('NFKD',s).encode('ascii', 'ignore')
print(line)         # b'Marek Cech'
line = str(line, encoding='utf-8', errors='ignore')
print(line)         # Marek Cech
```

去除音标：
```python
import unicodedata
s1 = 'Spicy Jalape\u00f1o'
t1 = unicodedata.normalize('NFD', s1)
s = ''.join(c for c in t1 if not unicodedata.combining(c))
print(s)        # Spicy Jalapeno
```

# encode和decode
在Python3中，字符串默认就是Unicode类型的字符串。

- encode 把Unicode的字符串按照某编码格式编码字符串，最终生成的是bytes类型数据。
- decode 把bytes数据按照某编码格式解码成字符串，最终生成的是str类型。

```python
# 把str转换为bytes
def to_bytes(s):
    # return s.encode('utf-8', 'ignore')
    return bytes(s, encoding='utf-8', errors='ignore')

# 把bytes转换为str
def to_str(b):
    # return b.decode('utf-8', 'ignore')
    return str(b, encoding='utf-8', errors='ignore')
```