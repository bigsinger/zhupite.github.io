---
layout:		post
category:	"sec"
title:		"cocos逆向工程汇总"

tags:		[]
---
- Content
{:toc}




# Cocos2d-x

[Download Cocos2d-x](https://www.cocos2d-x.org/download)

# 密钥

文本方式打开`cocos`引擎的so文件，搜索特征字符串：`Cocos Game`，在后面紧接着的明文字符串就是密钥。



`cocos2dx-js`解密，`coco2dx`生成的`jsc`并不是真正意义上的编译出来的字节码，只是做一层压缩和`xxtea`加密，因此解密过程就是先做`xxtea`解密和解压缩。网上有一个解密的`python`脚本：

```python
#!/usr/bin/python3
# -*- coding: utf-8 -*-
##运行需求
##pip install cffi
##pip install xxtea-py
import os
import xxtea
import zlib
 
##获取当前目录下所有jsc文件
def getFileList():
    fs=[]
    dirpath='./'
    for root,dirs,files in os.walk(dirpath):
        for file in files:
            if(file.endswith('.jsc')):
                fs.append(os.path.join(root,file))
    return fs
   
def Fix(path,key):
    f1=open(path,'rb').read()
    print("正在解密:%s"%(path))
    d1=xxtea.decrypt(f1,key)
    d1=zlib.decompress(d1,16+zlib.MAX_WBITS)
    print("解密完成:%s"%(path))
    f2=open(path.replace('.jsc','.js'),'wb')
    f2.write(d1)
     
def run(key):
    for f in getFileList():
        #print(f)
        Fix(f,key)
         
 
key = "xxxxxxx-xxxx-xx"
run(key)
```

# 参考

- [Cocos2DX-JS 加密逆向探究解密app实战](https://www.52pojie.cn/thread-1362276-1-1.html)
- [cocos2dx lua 反编译](https://bbs.pediy.com/thread-216800.htm)

