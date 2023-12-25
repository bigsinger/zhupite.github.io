---
layout:		post
category:	"sec"
title:		"cocos逆向工程汇总"

tags:		[]
---
- Content
{:toc}


Cocos2d-x 是一款国产的开源的手机游戏开发框架，基于MIT许可证发布。引擎核心采用C++编写，提供C++、Lua、JavaScript 三种编程语言接口，跨平台支持 iOS、Android 等智能手机，Windows、Mac 等桌面操作系统，以及 Chrome, Safari, IE 等 HTML5 浏览器。

Cocos2d-x 降低了手机游戏的技术从业门槛，在全球范围得到广泛使用和认可。腾讯、网易、盛大、掌趣等国内游戏大厂，以及任天堂、Square Enix、Gamevil、DeNA、LINE等国际大厂均已使用cocos2d-x引擎开发并推出了自己的手游产品。使用cocos2d-x引擎的历年代表作有《我叫MT Online》《捕鱼达人》《大掌门》《刀塔传奇》《放开那三国》《全民飞机大战》《欢乐斗地主》《开心消消乐》《保卫萝卜》《梦幻西游》《大话西游》《神武》《问道》《征途》《列王的纷争》《热血传奇》《传奇世界》《剑与家园》《乱世王者》《传奇霸业》等。



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



```js
Interceptor.attach(Module.findBaseAddress("libcocos2djs.so").add(0x22E5CC), {
    onEnter: function(args) {
        console.log(Memory.readUtf8String(args[2]));
    },

    onLeave: function(retval) {
    }
});
```



## uuids

最近的（3.8可用）：

- [MD5 缓存 - Cocos Creator 3.8 手册](https://docs.cocos.com/creator/manual/zh/editor/publish/build-options.html?h=getuuidfromurl#md5-%E7%BC%93%E5%AD%98)
- [getUrlWithUuid](https://docs.cocos.com/creator/3.4/api/en/cocos-core-asset-manager/Function/getUrlWithUuid)  [getUuidFromURL](https://docs.cocos.com/creator/3.4/api/en/cocos-core-asset-manager/Function/getUuidFromURL) （实际上这两个函数在3.8里面也有的，但是文档里搜不到，有点坑！）
- [【cocos creator】获取资源uuid_cocos 3.7通过文件路径获取文件uuid](https://blog.csdn.net/K86338236/article/details/125508703)

```js
import { assetManager } from 'cc';


var url = 'res/import/fc/fc991dd7-0033-4b80-9d41-c8a86a702e59.json';
var uuid = assetManager.utils.getUuidFromURL(url); // fc991dd7-0033-4b80-9d41-c8a86a702e59


var url = assetManager.utils.getUrlWithUuid('fcmR3XADNLgJ1ByKhqcC5Z', {isNative: false});
// json path, 'assets/main/import/fc/fc991dd7-0033-4b80-9d41-c8a86a702e59.json';

var url = assetManager.utils.getUrlWithUuid('fcmR3XADNLgJ1ByKhqcC5Z', {isNative: true, nativeExt: '.png'});
// png path, 'assets/main/native/fc/fc991dd7-0033-4b80-9d41-c8a86a702e59.png';
```



在 [Utils - Creator 内置的一些工具函数](https://docs.cocos.com/creator/manual/zh/editor/extension/api/utils.html) 中也有所介绍：

```js
Editor.Utils.UUID.decompressUUID("4329tMArhImq290WvA8tWd");		// 43dbdb4c-02b8-489a-adbd-d16bc0f2d59d
Editor.Utils.UUID.compressUUID("43dbdb4c-02b8-489a-adbd-d16bc0f2d59d")	// 43dbdtMArhImq290WvA8tWd
```

直接点击主菜单中的 **开发者 -> 构建调试工具（或开关开发人员工具）**，在`Console`控制台里输入命令即可查询到原始 `UUID`。



3.4版本里还有API接口`decodeUuid`可以调用（解码 uuid，返回原始 uuid），之后的版本不再有。

```js
const uuid = 'fcmR3XADNLgJ1ByKhqcC5Z';
const originalUuid = decodeUuid(uuid); // fc991dd7-0033-4b80-9d41-c8a86a702e59
```

看接口文档，是定义在这里：[cocos-engine/cocos/core/utils/decode-uuid.ts at 3.4.2 · cocos/cocos-engine](https://github.com/cocos/cocos-engine/blob/3.4.2/cocos/core/utils/decode-uuid.ts)  把代码抠出来重建：`decode-uuid.ts`：

```js
/*
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2020 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

/**
 * @packageDocumentation
 * @module core
 */


//import { BASE64_VALUES } from './misc';
//////////////////////////////////////
const BASE64_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const values:number[] = new Array(123); // max char code in base64Keys
for (let i = 0; i < 123; ++i) { values[i] = 64; } // fill with placeholder('=') index
for (let i = 0; i < 64; ++i) { values[BASE64_KEYS.charCodeAt(i)] = i; }

// decoded value indexed by base64 char code
const BASE64_VALUES = values;
//////////////////////////////////////



const HexChars = '0123456789abcdef'.split('');

const _t = ['', '', '', ''];
const UuidTemplate = _t.concat(_t, '-', _t, '-', _t, '-', _t, '-', _t, _t, _t);
const Indices = UuidTemplate.map((x, i) => (x === '-' ? NaN : i)).filter(isFinite);

/**
 * @en
 * Decode uuid, returns the original uuid
 *
 * @zh
 * 解码 uuid，返回原始 uuid
 *
 * @param  base64 - the encoded uuid
 * @returns the original uuid
 *
 * @example
 * ```ts
 * const uuid = 'fcmR3XADNLgJ1ByKhqcC5Z';
 * const originalUuid = decodeUuid(uuid); // fc991dd7-0033-4b80-9d41-c8a86a702e59
 * ```
 */
export default function decodeUuid (base64: string) {
    const strs = base64.split('@');
    const uuid = strs[0];
    if (uuid.length !== 22) {
        return base64;
    }
    UuidTemplate[0] = base64[0];
    UuidTemplate[1] = base64[1];
    for (let i = 2, j = 2; i < 22; i += 2) {
        const lhs = BASE64_VALUES[base64.charCodeAt(i)];
        const rhs = BASE64_VALUES[base64.charCodeAt(i + 1)];
        UuidTemplate[Indices[j++]] = HexChars[lhs >> 2];
        UuidTemplate[Indices[j++]] = HexChars[((lhs & 3) << 2) | rhs >> 4];
        UuidTemplate[Indices[j++]] = HexChars[rhs & 0xF];
    }
    return base64.replace(uuid, UuidTemplate.join(''));
}
```

使用：

```js
import decodeUuid from './decode-uuid';

const uuid = 'fcmR3XADNLgJ1ByKhqcC5Z';
const originalUuid = decodeUuid(uuid); // fc991dd7-0033-4b80-9d41-c8a86a702e59
```





## 重建

步骤：解密`jsc` - 定位启动场景（`launchScene`） - 解密uuids - 重建场景（scene）



**解密`jsc`** 

`Cocos2dx-js`引擎做的游戏在运行时会先检测内存里面有没有`js`文件，有的话就直接运行`js`文件，没有的话就从`jsc`转换出`js`文件，所以解密后的`js`文件直接丢入原包就行（除了一些做了文件验证形式的安全手段的游戏）。`jsc`解密后，还得在同目录下的`index.json`（config.json）文件把`encrypted`改成`flase`，不然会打不开。



**定位启动场景（`launchScene`）**

在 `settings.js` 里找到启动的场景：

```json
window._CCSettings = { 
    platform: "android", 
    groupList: ["default", "static", "ui", "3D"], 
    collisionMatrix: [[true], [false, false], [false, false, false], [false, false, false, false]], 
    hasResourcesBundle: true, 
    hasStartSceneBundle: false, 
    remoteBundles: [], 
    subpackages: [], 
    launchScene: "db://assets/Scene/loadScene.fire", 
    orientation: "", 
    server: "", 
    jsList: [] 
};
```

之后在 `index.js` 中搜索：`loadScene` （或 `"loadScene"`）。

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



## 反编译

使用`unluac.jar`：

```bash
java -jar unluac.jar ./StoreItemDlg.luac > ./StoreItemDlg.luac.lua
```



## 抓包

抓游戏客户端与服务器的通信数据：

```js
//函数定义 void LuaWebSocket::onMessage(WebSocket* ws, const WebSocket::Data& data)


// 这种方式可以精确的hook某个函数但需要自行查找函数调用地址，动态调试需要自行查找偏移地址。
// 用 nm -DC libcocos2dlua.so | grep -i LuaWebSocket::onMessage 可以找到so内静态的调用地址。
//var func = Module.findBaseAddress("libcocos2dlua.so").add(0x8244b4);



//  当函数是全局唯一时可以用这种方式，如果存在多个函数名则hook无效。
var func = Module.findExportByName("libcocos2dlua.so" , "LuaWebSocket::onMessage");
var Log = Java.use("android.util.Log");
Interceptor.attach(func, {
  onEnter: function (args) {
    // 在不知道数据类型前先这样看看hook后是否有数据，有数据再用对应数据类型的读函数或转换函数。数据类型不对会导致hook失败。
    Log.e("frida-HOOK", "ws:"+args[1]);
    Log.e("frida-HOOK", "data:"+args[2]);
  }
});
```



Dump lua文件的frida脚本， 脚本文件放置路径为/data/local/tmp/frida_script.js：

```js
var func = Module.findBaseAddress("libcocos2dlua.so").add(0x93ad2d);
//var func = Module.findBaseAddress("libcocos2dlua.so").add(0x93ad0d);

Interceptor.attach(func, {
  onEnter: function (args) {
    this.fileout = "/sdcard/lua/" + Memory.readCString(args[3]).split("/").join(".");
    console.log("read file from: "+this.fileout);
    var tmp = Memory.readByteArray(args[1], args[2].toInt32());
    var file = new File(this.fileout, "w");
    file.write(tmp);
    file.flush();
    file.close();
  }
});
```

获取sign和key的frida脚本， 脚本文件放置路径为/data/local/tmp/frida_script.js

```js
var func = Module.findBaseAddress("libcocos2dlua.so").add(0x6ea6d4);
//var func = Module.findExportByName("libcocos2dlua.so" , "cocos2d::LuaStack::setXXTEAKeyAndSign");
var Log = Java.use("android.util.Log");

Interceptor.attach(func, {
  onEnter: function (args) {
    Log.e("frida-HOOK", "key:"+Memory.readCString(args[1]));
    Log.e("frida-HOOK", "sign:"+Memory.readCString(args[3]));
  }
});
```



# 参考

- [Cocos Creator：构建流程简介与常见问题指南](https://www.mvrlink.com/cocos-creator-build-process-and-faq/)
- [Cocos2DX-JS 加密逆向探究解密app实战](https://www.52pojie.cn/thread-1362276-1-1.html)
- [关于Cocos2dx-js游戏的jsc文件解密(二)](https://www.52pojie.cn/thread-1449982-1-1.html)
- [Cocos2d-lua工程运行流程的理解](https://www.jianshu.com/p/781d835c88c9)
- [浅谈Cocos2d-x下Lua文件的保护方式](https://blog.shi1011.cn/rev/android/1216)
- [cocos2dx-Lua引擎游戏脚本及图片资源解密与DUMP_luajit解密](https://blog.csdn.net/asmcvc/article/details/54098090)
- [cocos2dx lua 反编译](https://bbs.pediy.com/thread-216800.htm)
- [cocos2dx游戏逆向实战](https://www.52pojie.cn/forum.php?mod=viewthread&tid=1634085)
- [cocos2d-x官方引用的xxtea加密解密算法源码](https://github.com/cocos2d/cocos2d-x-3rd-party-libs-bin/tree/v3/xxtea)
- [XXTEA 可逆加密解密算法 C++ C#兼容版本](http://www.waitingfy.com/archives/1157)
- [安卓逆向之Luac解密反编译](https://www.yuanrenxue.cn/app-crawl/luac.html)
- [Cocos2d-x与LuaJIT汇编的初步解密](https://bbs.kanxue.com/thread-222825.htm)
- [Dr-MTN/luajit-decompiler](https://github.com/Dr-MTN/luajit-decompiler)
-  [luajit-lang-toolkit](https://github.com/franko/luajit-lang-toolkit)
- [Lua绑定的Socket通信源码](https://github.com/cocos2d/cocos2d-x/blob/76903dee64046c7bfdba50790be283484b4be271/cocos/scripting/lua-bindings/manual/network/Lua_web_socket.cpp#L468)
- [Lua绑定的XMLHttpRequest通信源码（http请求会用到）](https://github.com/cocos2d/cocos2d-x/blob/76903dee64046c7bfdba50790be283484b4be271/cocos/scripting/lua-bindings/manual/network/lua_xml_http_request.cpp)
- [Lua绑定的Downloader源码（下载文件用到）](https://github.com/cocos2d/cocos2d-x/blob/76903dee64046c7bfdba50790be283484b4be271/cocos/scripting/lua-bindings/manual/network/lua_downloader.cpp)
- [frida内存检索svc指令查找sendto和recvfrom进行hook抓包](https://www.wangan.com/p/7fy74705bc6187fb)

