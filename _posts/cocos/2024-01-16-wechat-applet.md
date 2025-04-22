---

layout:        post
category:    "sec"
title:        "微信小程序小游戏反编译"

tags:        []
---

- Content
  {:toc}

# 安装包

- 手机端：`/data/data/com.tencent.mm/MicroMsg/{用户ID}/appbrand/pkg`
- 电脑端：`D:\Tencent\msgxyz\WeChat Files\Applet`
- 

使用工具： [wux1an/wxapkg: 微信小程序反编译工具，.wxapkg 文件扫描 + 解密 + 解包工具](https://github.com/wux1an/wxapkg)

调用参数：

```
wxapkg unpack -o unpack -r "D:\Tencent\WeChat Files\Applet\wx32348465709"
```

或者用封装后的工具，直接拖放待反编译的小程序目录下的任意一个`.wxapkg`后缀的文件到`apkinfo`上。

# 抓包

[HttpDebuggerPro](https://www.httpdebugger.com/) 抓包就很方便。

推荐抓包方式：

- 安卓：Reqable/HttpCanary
- iOS：Reqable/Stream
- Windows：Fiddler+Burp/Yakit 、 Proxifer+Burp/Yakit 、Reqable+Burp/Yakit 
- MacOS：Reqable+Burp/Yakit

# 解包

参考微信官方文档：[控制代码包内的资源文件](https://developers.weixin.qq.com/miniprogram/dev/framework/performance/tips/start_optimizeA.html)

[zstd解压工具](https://github.com/mcmilk/7-Zip-zstd/releases)

### [DragonBones 骨骼动画资源](https://docs.cocos.com/creator/manual/zh/asset/dragonbones.html)

DragonBones 骨骼动画资源包括：

- `.json`/`.dbbin` 骨骼数据
- `.json` 图集数据
- `.png` 图集纹理

# Debug

[WeChatOpenDevTools-Python: WeChatOpenDevTool 微信小程序强制开启开发者工具](https://github.com/JaveleyQAQ/WeChatOpenDevTools-Python)

1. 首先 USB 数据线连接手机进入调试模式。
2. 手机微信访问 http://debugxweb.qq.com/?inspector=true 确定是否可以用(能打开就可用)
3. 微信上打开你需要调试的页面
4. 谷歌浏览器地址栏输入 chrome://inspect/#devices

# 源码还原

[biggerstar/wedecode: 全自动化，微信小程序 wxapkg 包 源代码还原工具, 线上代码安全审计](https://github.com/biggerstar/wedecode)
