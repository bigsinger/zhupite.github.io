---
layout:		post
category:	"python"
title:		"Python文件遍历"
tags:		[python]
---
- Content
{:toc}

# glob
默认是不递归的，支持通配符，*,?,[]这三个通配符，*代表0个或多个字符，?代表一个字符，[]匹配指定范围内的字符，如[0-9]匹配数字。
```python
import glob
for file_name in glob.glob(r'E:/CloudMusic/' + r'*.mp[3,4]'):
    print(file_name)
```

当想使用递归搜索时，有点变态，你必须这样使用：
```python
for file_name in glob.glob("E:/CloudMusic/**/" + '*.mp*', recursive=True):
    print(file_name)
# 或
for file_name in glob.glob("E:/CloudMusic/**" + '/*.mp*', recursive=True):
    print(file_name)
```
也即使用两个星号（**）表示有0个或者多个子目录，这个是固定用法，别无他法，然后再开启recursive=True。

glob.glob同时获取所有的匹配路径，而 glob.iglob一次只获取一个匹配路径。当遍历大量文件的时候最好还是逐个迭代：
```python
for file_name in glob.iglob("E:/CloudMusic/**/" + '/*.mp*', recursive=True):
    print(file_name)
```

# os.walk递归遍历查找文件

```python
# 在目录中递归查找文件名含有text的文件
def find_file(start_dir, text):
    for relpath, dirs, files in os.walk(start_dir):
        for file_name in files:
            if text in file_name:
                full_path = os.path.join(start_dir, relpath, file_name)
                print(os.path.normpath(os.path.abspath(full_path)))

find_file(r'E:/CloudMusic', 'mp')
'''
E:\CloudMusic\Coldplay - Viva la Vida.mp3
E:\CloudMusic\Various Artists - Here We Are Again (《喜剧之王》插曲).mp3
E:\CloudMusic\任素汐 - 我要你.mp3
E:\CloudMusic\王珞丹,朴树 - 清白之年.mp3
E:\CloudMusic\马克西姆.姆尔维察 - Croatian Rhapsody.mp3
E:\CloudMusic\黄龄 - 痒.mp3
E:\CloudMusic\MV\Coldplay - Viva La Vida.mp4
'''
```

## 应用举例
## 对单个文件或目录下文件进行解密处理的模板代码

```python
# coding: utf-8

import os
import sys
import star

def decode_file(inFile, outFile):
    inBuff = bytearray(star.read(inFile))
    n = len(inBuff)
    outBuff = bytearray(n)
    for i in range(0, n):
        outBuff[i] = (~(inBuff[i] ^ 0x15)) &0xff
    star.write(outFile, outBuff)

#批量处理
@star.logtimewithname(u"解密")
def decode_folder(inPath, outPath):
    count = 0
    for path, d, filelist in os.walk(inPath):
        for filename in filelist:
            _, exts = os.path.splitext(filename)
            if exts in ['.lua', '.png']:
                inFile = os.path.join(path, filename)
                decode_file(inFile, inFile)
            count += 1
    print u"共处理 " + str(count) + u" 个文件"

if __name__=='__main__':
    if len(sys.argv) < 2:
        print u'输入文件夹路径或单个文件路径'
    else:
        filepath = sys.argv[1]
        # win下命令行参数为gbk编码
        filepath = filepath.decode('gbk', 'ignore')
        print filepath
        if os.path.isdir(filepath):
            decode_folder(filepath, filepath)
        else:
            decode_file(filepath, filepath)
    os.system('pause')
```
