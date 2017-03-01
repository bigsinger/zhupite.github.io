---
layout:     post
title:      基于Xposed和Substrate的通用性SO注入
date:       2017-03-01
author:     BIGSINGER
catalog: true
tags:
	- Android
---


## 需求来源
如果需要注入SO且HOOK一些功能做研究分析，必然需要**注入**、**HOOK**，而对于不同的分析目标除了HOOK的函数不同之外，注入部分是相同的，可以把相同部分的代码提出来，做成一个功能，那么以后注入部分就不用再次编写了，分析的时候只需要编写HOOK代码即可。

## 设计
我们把整体分成三个部分：java层、SO loader层、SO HOOK层。java层和SO loader层我们抽象为框架层（负责注入流程），SO HOOK层抽象为应用层（以后研发分析人员只需要编写这个SO即可，关注于函数的HOOK，不必关心注入流程）。

代码尽量在java层代码多写一些，毕竟写java代码要比写C++代码容易些，出错也容易排查，如下是大致的设计流程：
![image](http://img.blog.csdn.net/20170110094504856)
- **注入器Java（Xposed）层**：主要是拦截APP的运行，当APP运行时通过判断包名是否是目标包名来过滤，如果不是则放行，否则就加载配置执行注入SO、注入插件APK、隐藏XPOSED以及其他功能的初始化（诸如微信骰子剪刀石头布的作弊、贪吃蛇大作战作弊、地图的模拟定位等）。这里只介绍注入SO这一块，其他的暂不涉猎。在运行目标APP的时候，事先保存一个配置文件，里面保存了目标APP的包名以及待拦截的SO名称，例如libgame.so或libmono.so。由于在JNI层HOOK函数直接使用了substrate框架，注入SO前先把libsubstrate.so和libsubstratedvm.so加载进去，然后再加载loader（也是一个SO）。
- **注入器SO（loader）层**：loader被加载后，JNI_OnLoad中通过读取配置文件获取目标APP的包名、要拦截的SO名称、要注入的HOOK SO（应用层），然后HOOK dlopen函数，当目标SO被加载时，加载HOOK SO并调用约定导出函数on_dlopen函数，传入足够多的信息过去，这样开发者可以直接利用这些信息处理，不必每次都要重新获取了，也即只关注HOOK的函数本身。
- **HOOK SO（应用层）**：由于在loader层已经对dlopen做了HOOK，所以这里一定不能再用dlopen去获取模块的句柄，而要用从loader层传递过来的原始地址olddlopen，否则会进入死循环。到了这一环节，只需要获取到目标函数进行HOOK即可，代码量就很少了。

## 优势
每次修改SO无须重启手机，编译SO后可以利用AndroidStudio的instantrun功能快速生效，测试效率很高。


## 实现

### 注入器SO（loader）层
HOOK dlopen的代码如下，参考：[如何hook dlopen和dlsym底层函数](http://blog.csdn.net/zhuanshenai/article/details/51752582)
```

Tdlopen olddlopen = NULL;
void* newdlopen(const char* filename, int myflags) {
	LOGD("[soloader]dlopen: %s",filename);
	void *handle = olddlopen(filename, myflags);

	//目标SO加载时，加载注入SO
	if ( strstr(filename, g_config.strHostSO.c_str())!=NULL ) {
		void *hInjectSO = olddlopen(g_config.strInjectSoPath.c_str(), RTLD_NOW);
		Ton_dlopen pOn_dlopen = (Ton_dlopen)olddlsym(hInjectSO, "on_dlopen");
		if ( pOn_dlopen!=NULL ) {
			pOn_dlopen(filename, handle, g_env, g_config.strHostPackage.c_str(), olddlopen, g_pMSHookFunction);
		}
	}
	return handle;
}

bool hookdlopen() {
	void *dlopen_addr = NULL;
	void *dlsym_addr = NULL;

	//获取dlopen地址
	dlopen_addr = get_remote_addr(getpid(), "/system/bin/linker", (void *)dlopen);
	LOGD("[soloader] dlopen_addr: [%p]", dlopen_addr);

	//hook dlopen方法,下面方法类似
	g_pMSHookFunction(dlopen_addr, (void *)&newdlopen, (void**)&olddlopen);

	dlsym_addr = get_remote_addr(getpid(), "/system/bin/linker", (void *)dlsym);
	LOGD("[soloader] dlsym_addr: [%p]", dlsym_addr);
	g_pMSHookFunction(dlsym_addr, (void*)&newdlsym, (void**)&olddlsym);

	return true;
}
//////////////////////////////////////////////////////////////////////////

void *getMSHookFunction()
{
	void *pfunc = NULL;
	void *handle = dlopen("/data/data/com.bigsing.xtool/lib/libsubstrate.so", RTLD_NOW);
	if (handle == NULL) {
		LOGE("[soloader]dlopen libsubstrate.so failed!");
	}else{
		pfunc = dlsym(handle, "MSHookFunction");
		if (NULL == pfunc) {
			LOGE("[soloader]can't find MSHookFunction");
		}
	}

	return pfunc;
}


/************************************************************************/
/* 
Java层（xposed）在handleLoadPackage时会通过System.load加载本SO作为loader。
*/
/************************************************************************/
extern "C" jint JNI_OnLoad(JavaVM* vm, void* reserved)  
{
	JNIEnv* env = NULL;
	jint result = -1;  
	LOGD("[soloader] %s begin", __FUNCTION__);
	if( vm->GetEnv((void**)&env, JNI_VERSION_1_6) != JNI_OK) {
		LOGE("[soloader]utility GetEnv error");
		return result;
	}
	g_env = env;

	//
	LoadConfig(g_config);
	LOGD("[soloader] package name: %s", g_config.strHostPackage.c_str());

	g_pMSHookFunction = (TMSHookFunction)getMSHookFunction();

	if ( g_config.strHostSO.empty()==false ) {
		if ( g_pMSHookFunction!=NULL ) {
			//当目标SO加载时注入SO
			hookdlopen();
		}
	}else{
		//无须拦截SO，那么直接加载咯
		void *hInjectSO = dlopen(g_config.strInjectSoPath.c_str(), RTLD_NOW);
		Ton_dlopen pOn_dlopen = (Ton_dlopen)dlsym(hInjectSO, "on_dlopen");
		if ( pOn_dlopen!=NULL ) {
			pOn_dlopen(NULL, NULL, g_env, g_config.strHostPackage.c_str(), dlopen, g_pMSHookFunction);
		}
	}

	LOGD("[soloader] %s end", __FUNCTION__);
	return JNI_VERSION_1_6;  
}
```

### HOOK SO层
由于loader层传递的信息足够多，很多可以直接使用，因此主要在on_dlopen中完成HOOK处理。
```
/************************************************************************/
/* 
该函数可能会被调用多次，所以要记录初始化标志，HOOK过了就不要再HOOK了。
*/
/************************************************************************/
extern "C" void on_dlopen(const char* libname, void *handle, JNIEnv *env, const char *szPackageName, Tdlopen olddlopen, TMSHookFunction pMSHookFunction) {
	LOGD("[gamedumper]%s begin", __FUNCTION__);
	g_env = env;

	g_pMSHookFunction = pMSHookFunction;
	if ( g_pMSHookFunction==NULL ) {
		//自己再动态获取一遍，但是要记得用olddlopen
	}
	if ( szPackageName==NULL || strlen(szPackageName) < 4 ) {
		g_bDataPathGot = getPackagePath(env, g_strDataPath);
	}else{
		g_strDataPath = "/data/data/";
		g_strDataPath.append(szPackageName);
		g_bDataPathGot = true;
	}

	if ( strstr(libname, "libmono.so")!=0 ) {
		if ( g_bU3dHooked==false ) {
			g_bU3dHooked = hookU3D(handle, olddlopen);
		}
	}else if ( strstr(libname, "libgame.so")!=0 ) {
		if ( g_bCocosHooked==false ) {
			g_bCocosHooked = hookCocos(handle, olddlopen);
		}
	}

	LOGD("[gamedumper]%s end", __FUNCTION__);
}
```

U3D引擎的HOOK：
```
//hook mono_image_open_from_data_with_name
int (*mono_image_open_from_data_with_name_orig)(char *data, int data_len, int need_copy, void *status, int refonly, const char *name) = NULL;
int mono_image_open_from_data_with_name_mod(char *data, int data_len, int need_copy, void *status, int refonly, const char *name) {
	LOGD("[dumplua] mono_image_open_from_data_with_name, name: %s, len: %d, buff: %s", name, data_len, data);
	int ret = mono_image_open_from_data_with_name_orig(data, data_len, need_copy, status, refonly, name);
	saveFile(data, data_len, getNextFilePath(".dll").c_str());
	return ret;
}


bool hookU3D(void *handlelibMonoSo, Tdlopen olddlopen) {
	void *handle = NULL;
	if ( handlelibMonoSo==NULL ) {
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
		handle = handlelibMonoSo;
		LOGD("[dumplua] libmono.so handle: %p", handle);
	}

	void *mono_image_open_from_data_with_name = dlsym(handle, "mono_image_open_from_data_with_name");
	if (mono_image_open_from_data_with_name == NULL){
		LOGE("[dumplua] mono_image_open_from_data_with_name not found!");
		LOGE("[dumplua] dlsym err: %s.", dlerror());
	}else{
		LOGD("[dumplua] mono_image_open_from_data_with_name found: %p", mono_image_open_from_data_with_name);
		g_pMSHookFunction(mono_image_open_from_data_with_name, (void *)&mono_image_open_from_data_with_name_mod, (void **)&mono_image_open_from_data_with_name_orig);
	}

	return true;
}
```

cocos的HOOK：
```
//orig function copy
int (*luaL_loadbuffer_orig)(void *L, const char *buff, int size, const char *name) = NULL;

//local function
int luaL_loadbuffer_mod(void *L, const char *buff, int size, const char *name) {
	LOGD("[dumplua] luaL_loadbuffer name: %s lua: %s", name, buff);
	return luaL_loadbuffer_orig(L, buff, size, name);
}


//hook decryptUF
int (*decryptUF_orig)(void *pInBuff, int len, int *n, int *poutlen, char *name) = NULL;
int decryptUF_mod(void *pInBuff, int len, int *n, int *poutlen, char *name) {
	LOGD("[dumplua] decryptUF_mod 1");
	int ret = decryptUF_orig(pInBuff, len, n, poutlen, name);
	LOGD("[dumplua] decryptUF_mod 2, in buff: %s", (char*)pInBuff);
	LOGD("[dumplua] decryptUF_mod in len: %d n: %d", len, *n);
	LOGD("[dumplua] decryptUF_mod name: %s, outlen: %d ", name, *poutlen);
	LOGD("[dumplua] decryptUF_mod ret buff: %s", (char*)pInBuff);
	saveFile(pInBuff, *poutlen, getNextFilePath(".png").c_str());
	return ret;
}



bool hookCocos(void *handlelibGameSo, Tdlopen olddlopen) {
	LOGD("[dumplua] hook begin");
	void *handle = NULL;
	if ( handlelibGameSo==NULL ) {
		if ( olddlopen==NULL ) {
			handle = dlopen("libgame.so", RTLD_NOW);
		}else{
			handle = olddlopen("libgame.so", RTLD_NOW);
		}
		if (handle == NULL) {
			LOGE("[dumplua]dlopen err: %s.", dlerror());
			return false;
		}
	}else{
		handle = handlelibGameSo;
		LOGD("[dumplua] libgame.so handle: %p", handle);
	}

	void *pluaL_loadbuffer = dlsym(handle, "luaL_loadbuffer");
	if (pluaL_loadbuffer == NULL){
		LOGE("[dumplua] lua_loadbuffer not found!");
		LOGE("[dumplua] dlsym err: %s.", dlerror());
	}else{
		LOGD("[dumplua] luaL_loadbuffer found!");
		g_pMSHookFunction(pluaL_loadbuffer, (void *)&luaL_loadbuffer_mod, (void **)&luaL_loadbuffer_orig);
	}


	//hook decryptUF
	void *decryptUF = dlsym(handle, "_ZN7cocos2d5extra8CCCrypto9decryptUFEPhiPiS3_");
	if ( decryptUF==NULL ) {
		LOGE("[dumplua] _ZN7cocos2d5extra8CCCrypto9decryptUFEPhiPiS3_ (decryptUF) not found!");
		LOGE("[dumplua] dlsym err: %s.", dlerror());
	}else{
		LOGD("[dumplua] _ZN7cocos2d5extra8CCCrypto9decryptUFEPhiPiS3_ (decryptUF) found!");
		g_pMSHookFunction(decryptUF, (void *)&decryptUF_mod, (void **)&decryptUF_orig);
	}


	LOGD("[dumplua] hook end");
	return true;
}


```

## 界面效果
- 包名：从安装的APP列表里选择，来确定目标APP。
- 待注入的SO：配置某个SO加载时要load的SO路径（需要按格式导出on_dlopen函数）。
- 注入插件：此处不讲解。
- 点击添加，则生成一条HOOK记录，追加到底部的列表里，且包名为红色，意义为HOOK生效。
- 点击“run”按钮启动目标APP（启动前会杀死已经运行的该APP，且保存一个配置文件供loader读取），APP启动后XPOSED层就会拦截到，也就是进入handleLoadPackage函数。

![image](http://img.blog.csdn.net/20170110094418246)