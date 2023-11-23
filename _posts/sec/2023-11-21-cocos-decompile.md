---
layout:		post
category:	"sec"
title:		"cocos逆向工程汇总"

tags:		[]
---
- Content
{:toc}




[Download Cocos2d-x](https://www.cocos2d-x.org/download)

# Cocos2dx-JS



## 解密

常规在`libcocos2djs.so`文件中搜索Ascil字符串`Cocos Game`、`main.js`、`jsb-adapter/jsb-builtin.js`等一些常规的普遍关键词来尝试定位Key。如果没找到，用IDA看下so文件有没有做过加密混淆，没有的话就结合`applicationDidFinishLaunching`函数等来寻找明文的Key值，或者hook关键函数来打印Key值。如果游戏做了混淆或其他安全手段，需要分析处理。

一般来说，文本方式打开`cocos`引擎的so文件，搜索特征字符串：`Cocos Game`，在后面紧接着的明文字符串就是密钥。

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



## 密钥分析过程

IDA分析 `libcocos2djs.so`，查找如下函数分析上下文关联寻找线索：

```c
jsb_set_xxtea_key
applicationDidFinishLaunching
xxtea_decrypt
do_xxtea_decrypt 
```



## 重建

Cocos2dx-js引擎做的游戏在运行时会先检测内存里面有没有js文件，有的话就直接运行js文件，没有的话就从jsc转换出js文件，所以解密后的js文件直接丢入原包就行（除了一些做了文件验证形式的安全手段的游戏）。jsc解密后，还得在同目录下的index.json（config.json）文件把`encrypted`改成`flase`，不然会打不开。



# Cocos2dx-Lua

`AppDelegate`.cpp源码：

```c
bool AppDelegate::applicationDidFinishLaunching() {
    // register lua engine
    LuaEngine* pEngine = LuaEngine::getInstance();
    ScriptEngineManager::getInstance()->setScriptEngine(pEngine);

    
    LuaStack* stack = pEngine->getLuaStack();
    stack->setXXTEAKeyAndSign("2dxLua", strlen("2dxLua"), "XXTEA", strlen("XXTEA"));
    
    lua_State* L = stack->getLuaState();
    
    lua_module_register(L);

    lua_getglobal(L, "_G");
    if (lua_istable(L,-1))//stack:...,_G,
    {
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32 || CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID ||CC_TARGET_PLATFORM == CC_PLATFORM_IOS || CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
        register_assetsmanager_test_sample(L);
#endif
        register_test_binding(L);
    }
    lua_pop(L, 1);

#if CC_64BITS
    FileUtils::getInstance()->addSearchPath("src/64bit");
#endif
    FileUtils::getInstance()->addSearchPath("src");
    FileUtils::getInstance()->addSearchPath("res");
    pEngine->executeScriptFile("controller.lua");

    return true;
}
```

`luaLoadBuffer`里调用`xxtea_decrypt`解密了lua脚本，然后调用`luaL_loadbuffer`加载解密后的脚本，所以直接hook 函数`luaL_loadbuffer`就可以dump出解密过的lua脚本了。

```c
AppDelegate::applicationDidFinishLaunching {
	setXXTEAKeyAndSign
	executeScriptFile {
        getDataFromFile
        luaLoadBuffer {
              xxtea_decrypt
                  luaL_loadbuffer {
                  luajit
              }
          }
		executeFunction
    }
}
```



**密key的找寻方法**

key在打包后的cocos的lib库的libcocos2dlua.so中

1. 第一种方法是`libcocos2dlua.so`使用IDA打开string窗口，全局查找加密sign。点击进入查找结果，在该结果的上方3行能够发现加密key。
2. 第二种方法，用`strings`工具查找字符串。终端运行 `strings -a libcocos2dlua.so` ，查找`sign`，观察`sign`上方的字符串，即为key。

# 参考

- [Cocos2DX-JS 加密逆向探究解密app实战](https://www.52pojie.cn/thread-1362276-1-1.html)
- [关于Cocos2dx-js游戏的jsc文件解密(二)](https://www.52pojie.cn/thread-1449982-1-1.html)
- [cocos2dx lua 反编译](https://bbs.pediy.com/thread-216800.htm)
- [cocos2dx游戏逆向实战](https://www.52pojie.cn/forum.php?mod=viewthread&tid=1634085)
- [cocos2d-x官方引用的xxtea加密解密算法源码](https://github.com/cocos2d/cocos2d-x-3rd-party-libs-bin/tree/v3/xxtea)
- [XXTEA 可逆加密解密算法 C++ C#兼容版本](http://www.waitingfy.com/archives/1157)
- [安卓逆向之Luac解密反编译](https://www.yuanrenxue.cn/app-crawl/luac.html)

