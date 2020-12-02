---
layout:     post
title:      unity3d引擎的游戏的脚本DUMP及HOOK方案优化
category: android
tags:		[android]
date:		2017-03-01
description: 
---


对unity3d引擎的游戏，重要的资源就是C#脚本，脚本是被打包到APK的assets目录下的一些dll文件，有的APP可能会对其加密，运行的时候再动态解密。可以通过HOOK **libmono.so**中的函数**mono_image_open_from_data_with_name**就可以DUMP出原始内容，如果加入的有其他加解密代码，可以进一步地对解密函数进行HOOK，也是可以DUMP出内容的。

下面这个是以天天飞车为例进行的分析，先看一段LOG：
```
01-06 17:27:39.045 9550-9550/? I/Xposed: java.lang.Runtime loadLibrary() afterHookedMethod: tprt
01-06 17:27:39.155 9550-9550/? I/Xposed: Hid process: de.robv.android.xposed.installer
01-06 17:27:39.155 9550-9550/? I/Xposed: Hid process: com.netease.l10:PushService
01-06 17:27:39.155 9550-9550/? D/TssSDK: process_name: com.tencent.game.SSGame
01-06 17:27:39.155 9550-9550/? D/dalvikvm: Trying to load lib /data/app-lib/com.tencent.game.SSGame-1/libtprt.so 0x422f8cc0
01-06 17:27:39.155 9550-9550/? D/dalvikvm: Shared lib '/data/app-lib/com.tencent.game.SSGame-1/libtprt.so' already loaded in same CL 0x422f8cc0
01-06 17:27:39.155 9550-9550/? I/Xposed: java.lang.Runtime loadLibrary() afterHookedMethod: tprt
01-06 17:27:39.165 9550-9550/? D/SUBSTRATEHOOK: the dlopen name =: /data/app-lib/com.tencent.game.SSGame-1/libtersafe.so
01-06 17:27:39.655 9550-9550/? D/SUBSTRATEHOOK: the dlopen name =: /data/app-lib/com.tencent.game.SSGame-1/libmono.so
01-06 17:27:39.660 9550-9550/? D/SUBSTRATEHOOK: the dlopen name =: libmono.so
01-06 17:27:39.660 9550-9550/? D/SUBSTRATEHOOK: [newdlopen] hook libmono.so
01-06 17:27:39.660 9550-9550/? D/SUBSTRATEHOOK: [dumplua] libmono.so handle: 0x726c3924
01-06 17:27:39.660 9550-9550/? D/SUBSTRATEHOOK: [dumplua] mono_image_open_from_data_with_name_0 found: 0x7698fc4c

```

```
01-06 17:27:39.750 9550-9550/? I/Xposed: java.lang.Runtime loadLibrary() afterHookedMethod: main
01-06 17:27:39.755 9550-9550/? D/SUBSTRATEHOOK: the dlopen name =: /data/app-lib/com.tencent.game.SSGame-1/libmono.so
01-06 17:27:39.755 9550-9550/? D/SUBSTRATEHOOK: the dlopen name =: /data/app-lib/com.tencent.game.SSGame-1/libunity.so
01-06 17:27:39.775 9550-9550/? D/SUBSTRATEHOOK: the dlopen name =: libc.so
```

用IDA查看libmain.so发现有加载mono的逻辑，但是实际HOOK发现在main之前就已经加载了mono，原因是libtersafe.so里面有加载mono的逻辑，因为tersafe在main之前加载，所以才导致了mono比main更早地被加载了。通过上面的LOG时间顺序可以看出来。

而且这个mono并不是通过java层代码加载的，因此我们之前的xposed通过HOOK Runtime的load及loadLibrary是无法拦截mono的加载的（之前分析cocos的时候是通过拦截game这个so加载的时候注入的SO）。

```java
//当目标SO加载时再注入
private void hookLoadSharedLibrary(final XC_LoadPackage.LoadPackageParam lpparam, final String hostSoName) {
    if (TextUtils.isEmpty(hostSoName) == true) {
        return;
    }

    /*
      xposed不能HOOK java.lang.System loadLibrary函数，参考：[Hooking System.loadLibrary causes crash. #87] https://github.com/rovo89/XposedBridge/issues/87
     */
    XC_MethodHook.Unhook unhook = findAndHookMethod(Runtime.class, "loadLibrary", String.class, ClassLoader.class, new XC_MethodHook() {
        @Override
        protected void beforeHookedMethod(MethodHookParam param) throws Throwable {
            //XposedBridge.log("java.lang.Runtime loadLibrary() beforeHookedMethod: " + param.args[0]);
        }

        @Override
        protected void afterHookedMethod(MethodHookParam param) throws Throwable {
            super.afterHookedMethod(param);
            String target = (String) param.args[0];
            XposedBridge.log("java.lang.Runtime loadLibrary() afterHookedMethod: " + target);
            if (target.equals(hostSoName)) {
                loadInjectSoFile(lpparam);
            }
        }
    });

    if (unhook != null) {
        XposedBridge.log("java.lang.Runtime loadLibrary() hook ok");
    } else {
        XposedBridge.log("java.lang.Runtime loadLibrary() hook failed");
    }

    findAndHookMethod(Runtime.class, "load", String.class, new XC_MethodHook() {
        @Override
        protected void beforeHookedMethod(MethodHookParam param) throws Throwable {
            //XposedBridge.log("java.lang.Runtime load() beforeHookedMethod: " + param.args[0]);
        }

        @Override
        protected void afterHookedMethod(MethodHookParam param) throws Throwable {
            super.afterHookedMethod(param);
            XposedBridge.log("java.lang.Runtime load() beforeHookedMethod: " + param.args[0]);
        }
    });
}                                                             
```

因为这里的mono是被别其他的SO在初始化的时候（JNI_OnLoad）通过dlopen加载的，所以就导致了在xposed中无法拦截目标SO的加载事件，很容易漏网。那么该怎么办呢？
- **想法一**：如果APP有SO（一个或多个），即使有个别SO是在其他SO的JNI_OnLoad中通过dlopen加载的，那么至少要有一个SO是要通过java层代码加载。那就要面临一个问题，到底应该拦截哪个SO呢？就像上面的那个例子一样，本来以为只要拦截main这个so的加载，但是tersafe被加载的时候mono就已经被加载了。而且每次要具体分析哪个SO加载了目标SO，还是有点麻烦的，不够通用。
- **想法二**：在xopsed层不拦截Runtime的load及loadLibrary函数了，只要拦截到APP启动，就load注入SO，也就是第一时间把SO注入到目标APP中去。然后被注入的SO HOOK掉dlopen函数来拦截目标SO的加载，当目标SO加载时（libmono.so或libgame.so）再去做其他HOOK操作。由于Runtime的load及loadLibrary函数最终还是要调用到JNI层的dlopen函数，因此该方法可行，且不会漏掉SO的加载。

想法二可行是可行，但是会引来两个个问题：
- **问题一**：注入SO由于过早地被加载到目标进程，在JNI_OnLoad中动态获取目标APP的包名会失效。
- **问题二**：dlopen被HOOK，自己的代码需要调用的时候需谨慎，以免进入死循环。

## 解决办法
- **问题一**：注入SO由于过早地被加载到目标进程，在JNI_OnLoad中动态获取目标APP的包名会失效。下面代码中getPackagePath的是获取/data/data/com.youzu.android.snsgz类似路径的。
```c
extern "C" jint JNI_OnLoad(JavaVM* vm, void* reserved)  
{
	JNIEnv* env = NULL;
	jint result = -1;  
	LOGD("[dumplua] %s begin", __FUNCTION__);
	if( vm->GetEnv((void**)&env, JNI_VERSION_1_6) != JNI_OK) {
		LOGE("utility GetEnv error");
		return result;
	}

	g_thisenv = env;
	g_bDataPathGot = getPackagePath(env, g_strDataPath);
	LOGD("[dumplua] data path: %s", g_strDataPath.c_str());
	hook();

	LOGD("[dumplua] %s end", __FUNCTION__);
	return JNI_VERSION_1_6;  
}
```
**解决办法**：先缓存一个JNIEnv指针，记录路径是否获取成功的状态。等到后面保存文件的时候再判断一下，如果之前没有成功获取到路径，那么在保存文件之前获取一下即可。
```c
string getNextFilePath(const char *fileExt) {
	char buff[100] = {0};
	++g_nCount;
	if ( g_bDataPathGot==false ) {
		g_bDataPathGot = getPackagePath(g_thisenv, g_strDataPath);
	}
	sprintf(buff, "%s/cache/%d%s", g_strDataPath.c_str(), g_nCount, fileExt);
	return buff;
}
```
动态获取包名的代码可以参考：[android jni签名验证(一)](http://www.xiaobaiyey.com/598.html)

- **问题二**：dlopen被HOOK，自己的代码需要调用dlopen的时候需谨慎，以免进入死循环。

**解决办法**：缓存目标SO的句柄，后期直接使用，规避对dlopen的调用或者调用olddlopen。参考：[如何hook dlopen和dlsym底层函数](http://blog.csdn.net/zhuanshenai/article/details/51752582)
```c
void* (*olddlopen)(const char* filename, int myflags) = NULL;
void* newdlopen(const char* filename, int myflags) {
	LOGD("the dlopen name =: %s",filename);
	void *handle = olddlopen(filename, myflags);

	if ( strcmp(filename, "libmono.so")==0 ) {
		if ( g_bU3dHooked==false ) {
			//libmono.so加载了，但是发现之前并没有HOOK成功
			g_handlelibMonoSo = handle;
			LOGD("[%s] hook libmono.so", __FUNCTION__);
			g_bU3dHooked = hookU3D();
		}
	}else if ( strcmp(filename, "libgame.so")==0 ) {
		if ( g_bCocosHooked==false ) {
			g_handlelibGameSo = handle;
			LOGD("[%s] hook libgame.so", __FUNCTION__);
			g_bCocosHooked = hookCocos();
		}
	}
	return handle;
}



bool hookU3D() {
	void *handle = NULL;
	if ( g_handlelibMonoSo==NULL ) {
		if ( olddlopen==NULL ) {
			handle = dlopen("libmono.so", RTLD_NOW);
		}else{
			handle = olddlopen("libmono.so", RTLD_NOW);
		}
		if (handle == NULL) {
			LOGE("[dumplua]dlopen err: %s.", dlerror());
			return false;
		}
	}else{
		handle = g_handlelibMonoSo;
		LOGD("[dumplua] libmono.so handle: %p", handle);
	}

	void *mono_image_open_from_data_with_name = dlsym(handle, "mono_image_open_from_data_with_name");
	if (mono_image_open_from_data_with_name == NULL){
		LOGE("[dumplua] mono_image_open_from_data_with_name not found!");
		LOGE("[dumplua] dlsym err: %s.", dlerror());
	}else{
		LOGD("[dumplua] mono_image_open_from_data_with_name found: %p", mono_image_open_from_data_with_name);
		MSHookFunction(mono_image_open_from_data_with_name, (void *)&mono_image_open_from_data_with_name_mod, (void **)&mono_image_open_from_data_with_name_orig);
	}

	return true;
}
```
这里是拦截的天天飞车的LOG信息：

```
01-06 17:19:41.075 1286-1397/? D/SUBSTRATEHOOK: [dumplua] mono_image_open_from_data_with_name, name: /data/app/com.tencent.game.SSGame-1.apk/assets/bin/Data/Managed/UnityEngine.dll, len: 310272, buff: MZ�
01-06 17:19:41.345 1286-1397/? D/SUBSTRATEHOOK: [dumplua] mono_image_open_from_data_with_name, name: /data/app/com.tencent.game.SSGame-1.apk/assets/bin/Data/Managed/Assembly-CSharp-firstpass.dll, len: 2926592, buff: MZ�
01-06 17:19:41.625 1286-1397/? D/SUBSTRATEHOOK: [dumplua] mono_image_open_from_data_with_name, name: /data/app/com.tencent.game.SSGame-1.apk/assets/bin/Data/Managed/Assembly-CSharp.dll, len: 7148544, buff: MZ�
01-06 17:19:41.690 1286-1397/? D/SUBSTRATEHOOK: [dumplua] mono_image_open_from_data_with_name, name: /data/app/com.tencent.game.SSGame-1.apk/assets/bin/Data/Managed/UnityEngine.UI.dll, len: 171520, buff: MZ�
01-06 17:19:41.690 1286-1397/? D/SUBSTRATEHOOK: [dumplua] mono_image_open_from_data_with_name, name: /data/app/com.tencent.game.SSGame-1.apk/assets/bin/Data/Managed/poly2tri.dll, len: 43008, buff: MZ�

```

稍微复杂点的qn游戏的mono_image_open_from_data_with_name被修改过，添加了一个mono_image_open_from_data_with_name_0函数，在里面做进一步的操作，但是mono_image_open_from_data_with_name_0并没有导出，可以通过两个函数的偏移差来动态计算。

- IDA里分别查看两个函数的地址，并记下偏移差：001E1888 - 00190A7C = 50E0C 
- 代码先获取mono_image_open_from_data_with_name的地址，再加上偏移差（50E0C），然后进行HOOK

```c
int (*mono_image_open_from_data_with_name_orig)(char *data, int data_len, int a3, int a4, int a5, int a6, char a7, int a8) = NULL;
int mono_image_open_from_data_with_name_mod(char *data, int data_len, int a3, int a4, int a5, int a6, char a7, int a8) {
	LOGD("[dumplua] mono_image_open_from_data_with_name, len: %d, buff: %s", data_len, data);
	int ret = mono_image_open_from_data_with_name_orig(data, data_len, a3, a4, a5, a6, a7, a8);
	//saveFile(data, data_len, getNextFilePath(".dll").c_str());
	return ret;
}

MSHookFunction((void *)((char *)(mono_image_open_from_data_with_name) +0x50E0C), (void *)&mono_image_open_from_data_with_name_mod, (void **)&mono_image_open_from_data_with_name_orig);
```
