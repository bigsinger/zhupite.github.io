---
layout:		post
category:	"android"
title:		"基于Xposed的通用破解签名的方法"
tags:		[android,签名,xposed]
---



```java
@Override
public void initZygote(IXposedHookZygoteInit.StartupParam startupParam) throws Throwable {
    XposedBridge.log("initZygote: " + startupParam.toString());
    XposedHelpers.findAndHookMethod("java.security.Signature", null, "verify", byte[].class, new XC_MethodHook() {
        protected void afterHookedMethod(MethodHookParam param) throws Throwable {
            XposedBridge.log("Signature verify disabled");
            param.setResult(Boolean.TRUE);
        }
    });
}
```

启用xposed插件后，任意修改APK包的文件，无须重新签名就可以安装成功。