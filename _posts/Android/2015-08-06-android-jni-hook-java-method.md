---
layout:		post
category:	"android"
title:		"JNI Hook java层方法"
tags:		[Android,hook,jni]
---



图片显示不全的话可以参考：[JNI Hook java层方法](https://blog.csdn.net/asmcvc/article/details/47315817)



参考： [注入安卓进程,并hook java世界的方法](http://bbs.pediy.com/showthread.php?t=186054)

测试应用程序界面：

![img](https://img-blog.csdnimg.cn/img_convert/1cd7db74741164437473b469e588b516.png)

点击“SayHello”按钮时，旁边的文本标签显示字符串“MainActivity hello”，点击“GetMac”按钮时，旁边的文本标签显示当前mac地址。

代码：



```java
package com.example.jnihookjava;

import android.app.Activity;
import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.os.Build;
import android.widget.Button;
import android.widget.TextView;

publicclass MainActivity extends Activity {

    publicstaticfinal String TAG = "MainActivity";

    static {
        Log.e(TAG, "static code");
        System.loadLibrary("so");
    }

    private Button btn_hook;
    private Button btn_hello;
    private Button btn_mac;
    private TextView tv_hello;
    private TextView tv_mac;
    private TextView tv_hook;

    private String hello() {
        return TAG + " hello";
    }
    privatenative String hook();

    @Override
    protectedvoid onCreate(Bundle savedInstanceState) {
        Log.e(TAG, "onCreate");
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        btn_hook = (Button)findViewById(R.id.btn_hook);
        btn_hello = (Button)findViewById(R.id.btn_hello);
        btn_mac = (Button)findViewById(R.id.btn_mac);
        tv_hello = (TextView)findViewById(R.id.tv_hello);
        tv_mac = (TextView)findViewById(R.id.tv_mac);
        tv_hook = (TextView)findViewById(R.id.tv_hook);

        btn_hook.setOnClickListener(new View.OnClickListener() {
            @Override
            publicvoid onClick(View v) {
                tv_hook.setText(hook());
            }
        });

        btn_hello.setOnClickListener(new View.OnClickListener() {
            @Override
            publicvoid onClick(View v) {
                tv_hello.setText(hello());
            }
        });

        btn_mac.setOnClickListener(new View.OnClickListener() {
            @Override
            publicvoid onClick(View v) {
                WifiManager wifi = (WifiManager) getSystemService(Context.WIFI_SERVICE);
                WifiInfo info = wifi.getConnectionInfo();
                tv_mac.setText(info.getMacAddress());
            }
        });
    }

    @Override
    publicboolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main, menu);
        returntrue;
    }

}
```

activity_main布局文件：

```xml
<?xml version="1.0" encoding="utf-8"?><LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"><LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"><Button
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="SayHello"
            android:id="@+id/btn_hello"/><TextView
            android:id="@+id/tv_hello"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"/></LinearLayout><LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"><Button
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="GetMac"
            android:id="@+id/btn_mac"/><TextView
            android:id="@+id/tv_mac"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"/></LinearLayout><LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"><Button
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="hook"
            android:id="@+id/btn_hook"/><TextView
            android:id="@+id/tv_hook"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"/></LinearLayout></LinearLayout>
```

AndroidManifest.xml需要添加权限：

```xml
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
```

按钮“hook”调用libso.so导出的函数hook：

```c
extern"C" JNIEXPORT jstring JNICALL Java_com_example_jnihookjava_MainActivity_hook(JNIEnv *env, jclass clazz){
	Hook();
    return env->NewStringUTF("hook ok");;
}
```



```c
#include "MethodHooker.h"
#include "jni.h"
#include "android_runtime/AndroidRuntime.h"
#include "android/log.h"
#include "stdio.h"
#include "stdlib.h"
#include "native.h"
#include <dlfcn.h>
#define ANDROID_SMP 0
#include "Dalvik.h"
#include "alloc/Alloc.h"#define ALOG(...) __android_log_print(ANDROID_LOG_VERBOSE, __VA_ARGS__)

staticbool g_bAttatedT;
static JavaVM *g_JavaVM;

void init()
{
    g_bAttatedT = false;
    g_JavaVM = android::AndroidRuntime::getJavaVM();
}

static JNIEnv *GetEnv()
{
    int status;
    JNIEnv *envnow = NULL;
    status = g_JavaVM->GetEnv((void **)&envnow, JNI_VERSION_1_4);
    if(status < 0)
    {
        status = g_JavaVM->AttachCurrentThread(&envnow, NULL);
        if(status < 0)
        {
            return NULL;
        }
        g_bAttatedT = true;
    }
    return envnow;
}

staticvoid DetachCurrent()
{
    if(g_bAttatedT)
    {
        g_JavaVM->DetachCurrentThread();
    }
}

staticint computeJniArgInfo(const DexProto* proto)
{
    constchar* sig = dexProtoGetShorty(proto);
    int returnType, jniArgInfo;
    u4 hints;

    /* The first shorty character is the return type. */switch (*(sig++)) {
    case'V':
        returnType = DALVIK_JNI_RETURN_VOID;
        break;
    case'F':
        returnType = DALVIK_JNI_RETURN_FLOAT;
        break;
    case'D':
        returnType = DALVIK_JNI_RETURN_DOUBLE;
        break;
    case'J':
        returnType = DALVIK_JNI_RETURN_S8;
        break;
    case'Z':
    case'B':
        returnType = DALVIK_JNI_RETURN_S1;
        break;
    case'C':
        returnType = DALVIK_JNI_RETURN_U2;
        break;
    case'S':
        returnType = DALVIK_JNI_RETURN_S2;
        break;
    default:
        returnType = DALVIK_JNI_RETURN_S4;
        break;
    }

    jniArgInfo = returnType << DALVIK_JNI_RETURN_SHIFT;

    hints = dvmPlatformInvokeHints(proto);

    if (hints & DALVIK_JNI_NO_ARG_INFO) {
        jniArgInfo |= DALVIK_JNI_NO_ARG_INFO;
    } else {
        assert((hints & DALVIK_JNI_RETURN_MASK) == 0);
        jniArgInfo |= hints;
    }

    return jniArgInfo;
}

int ClearException(JNIEnv *jenv){
    jthrowable exception = jenv->ExceptionOccurred();
    if (exception != NULL) {
        jenv->ExceptionDescribe();
        jenv->ExceptionClear();
        returntrue;
    }
    returnfalse;
}

bool isArt(){
    returnfalse;
}

static jclass findAppClass(JNIEnv *jenv,constchar *apn){
    //获取Loaders
    jclass clazzApplicationLoaders = jenv->FindClass("android/app/ApplicationLoaders");
    jthrowable exception = jenv->ExceptionOccurred();
    if (ClearException(jenv)) {
        ALOG("Exception","No class : %s", "android/app/ApplicationLoaders");
        return NULL;
    }
    jfieldID fieldApplicationLoaders = jenv->GetStaticFieldID(clazzApplicationLoaders,"gApplicationLoaders","Landroid/app/ApplicationLoaders;");
    if (ClearException(jenv)) {
        ALOG("Exception","No Static Field :%s","gApplicationLoaders");
        return NULL;
    }
    jobject objApplicationLoaders = jenv->GetStaticObjectField(clazzApplicationLoaders,fieldApplicationLoaders);
    if (ClearException(jenv)) {
        ALOG("Exception","GetStaticObjectField is failed [%s","gApplicationLoaders");
        return NULL;
    }
    jfieldID fieldLoaders = jenv->GetFieldID(clazzApplicationLoaders,"mLoaders","Ljava/util/Map;");
    if (ClearException(jenv)) {
        ALOG("Exception","No Field :%s","mLoaders");
        return NULL;
    }
    jobject objLoaders = jenv->GetObjectField(objApplicationLoaders,fieldLoaders);
    if (ClearException(jenv)) {
        ALOG("Exception","No object :%s","mLoaders");
        return NULL;
    }
    //提取map中的values
    jclass clazzHashMap = jenv->GetObjectClass(objLoaders);
    jmethodID methodValues = jenv->GetMethodID(clazzHashMap,"values","()Ljava/util/Collection;");
    jobject values = jenv->CallObjectMethod(objLoaders,methodValues);

    jclass clazzValues = jenv->GetObjectClass(values);
    jmethodID methodToArray = jenv->GetMethodID(clazzValues,"toArray","()[Ljava/lang/Object;");
    if (ClearException(jenv)) {
        ALOG("Exception","No Method:%s","toArray");
        return NULL;
    }

    jobjectArray classLoaders = (jobjectArray)jenv->CallObjectMethod(values,methodToArray);
    if (ClearException(jenv)) {
        ALOG("Exception","CallObjectMethod failed :%s","toArray");
        return NULL;
    }

        int size = jenv->GetArrayLength(classLoaders);

        for(int i = 0 ; i < size ; i ++){
            jobject classLoader = jenv->GetObjectArrayElement(classLoaders,i);
            jclass clazzCL = jenv->GetObjectClass(classLoader);
            jmethodID loadClass = jenv->GetMethodID(clazzCL,"loadClass","(Ljava/lang/String;)Ljava/lang/Class;");
            jstring param = jenv->NewStringUTF(apn);
            jclass tClazz = (jclass)jenv->CallObjectMethod(classLoader,loadClass,param);
            if (ClearException(jenv)) {
                ALOG("Exception","No");
                continue;
            }
            return tClazz;
        }
    ALOG("Exception","No");
    return NULL;
}



bool HookDalvikMethod(jmethodID jmethod){
    Method *method = (Method*)jmethod;
    //关键!!将目标方法修改为native方法    SET_METHOD_FLAG(method, ACC_NATIVE);

    int argsSize = dvmComputeMethodArgsSize(method);
    if (!dvmIsStaticMethod(method))
        argsSize++;

    method->registersSize = method->insSize = argsSize;

    if (dvmIsNativeMethod(method)) {
        method->nativeFunc = dvmResolveNativeMethod;
        method->jniArgInfo = computeJniArgInfo(&method->prototype);
    }
}

bool ClassMethodHook(HookInfo info){

    JNIEnv *jenv = GetEnv();

    jclass clazzTarget = jenv->FindClass(info.tClazz);
    if (ClearException(jenv)) {
        ALOG("Exception","ClassMethodHook[Can't find class:%s in bootclassloader",info.tClazz);

        clazzTarget = findAppClass(jenv,info.tClazz);
        if(clazzTarget == NULL){
            ALOG("Exception","%s","Error in findAppClass");
            returnfalse;
        }
    }

    jmethodID method = jenv->GetMethodID(clazzTarget,info.tMethod,info.tMeihodSig);
    if(method==NULL){
        ALOG("Exception","ClassMethodHook[Can't find method:%s",info.tMethod);
        returnfalse;
    }

    if(isArt()){
        //HookArtMethod(jenv,method);
    }else{
        HookDalvikMethod(method);
    }

    JNINativeMethod gMethod[] = {
        {info.tMethod, info.tMeihodSig, info.handleFunc},
    };

    //func为NULL时不自行绑定,后面扩展吧if(info.handleFunc != NULL){
        //关键!!将目标方法关联到自定义的native方法if (jenv->RegisterNatives(clazzTarget, gMethod, 1) < 0) {
            ALOG("RegisterNatives","err");
            returnfalse;
        }
    }

    DetachCurrent();
    returntrue;
}


JNIEXPORT jstring JNICALL hello(JNIEnv *env, jclass clazz)  
{  
    //__android_log_print(ANDROID_LOG_VERBOSE, "tag", "call <native_printf> in java");return env->NewStringUTF("hello from native");;
}

JNIEXPORT jstring JNICALL getmac(JNIEnv *env, jclass clazz)  
{  
    //__android_log_print(ANDROID_LOG_VERBOSE, "tag", "call <native_printf> in java");return env->NewStringUTF("getmac from native");;
}

HookInfo hookInfos[] = {
    {"android/net/wifi/WifiInfo","getMacAddress","()Ljava/lang/String;",(void*)getmac},
    {"com/example/jnihookjava/MainActivity","hello","()Ljava/lang/String;",(void*)hello},
    //{"android/app/ApplicationLoaders","getText","()Ljava/lang/CharSequence;",(void*)test},};

int getpHookInfo(HookInfo** pInfo){
    *pInfo = hookInfos;
    returnsizeof(hookInfos) / sizeof(hookInfos[0]);
}

int Hook(){
    init();
    ClassMethodHook(hookInfos[0]);
    ClassMethodHook(hookInfos[1]);
}
```







**测试效果：**

点击“hook”按钮显示“hook ok”说明hook成功，再次点击“SayHello”、“GetMac”按钮分别显示出底层native函数返回的结果：

![img](https://img-blog.csdnimg.cn/img_convert/084f5d67209b2e1929ddd98c91cb3593.png)

由于是在当前程序中做的替换修改，因此手机无需root。如果是注入到其他进程则需要root，注入其他进程并hook其java层方法的流程：

使用注入器inject将libso.so注入并调用其一个函数，该函数再调用Hook函数完成函数修改，后面代码相同。

```java
package com.example.jnihookjava;

import android.app.Activity;
import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.os.Build;
import android.widget.Button;
import android.widget.TextView;

publicclass MainActivity extends Activity {

    publicstaticfinal String TAG = "MainActivity";

    static {
        Log.e(TAG, "static code");
        System.loadLibrary("so");
    }

    private Button btn_hook;
    private Button btn_hello;
    private Button btn_mac;
    private TextView tv_hello;
    private TextView tv_mac;
    private TextView tv_hook;

    private String hello() {
        return TAG + " hello";
    }
    privatenative String hook();

    @Override
    protectedvoid onCreate(Bundle savedInstanceState) {
        Log.e(TAG, "onCreate");
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        btn_hook = (Button)findViewById(R.id.btn_hook);
        btn_hello = (Button)findViewById(R.id.btn_hello);
        btn_mac = (Button)findViewById(R.id.btn_mac);
        tv_hello = (TextView)findViewById(R.id.tv_hello);
        tv_mac = (TextView)findViewById(R.id.tv_mac);
        tv_hook = (TextView)findViewById(R.id.tv_hook);

        btn_hook.setOnClickListener(new View.OnClickListener() {
            @Override
            publicvoid onClick(View v) {
                tv_hook.setText(hook());
            }
        });

        btn_hello.setOnClickListener(new View.OnClickListener() {
            @Override
            publicvoid onClick(View v) {
                tv_hello.setText(hello());
            }
        });

        btn_mac.setOnClickListener(new View.OnClickListener() {
            @Override
            publicvoid onClick(View v) {
                WifiManager wifi = (WifiManager) getSystemService(Context.WIFI_SERVICE);
                WifiInfo info = wifi.getConnectionInfo();
                tv_mac.setText(info.getMacAddress());
            }
        });
    }

    @Override
    publicboolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main, menu);
        returntrue;
    }

}
```

activity_main布局文件：

```xml
<?xml version="1.0" encoding="utf-8"?><LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"><LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"><Button
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="SayHello"
            android:id="@+id/btn_hello"/><TextView
            android:id="@+id/tv_hello"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"/></LinearLayout><LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"><Button
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="GetMac"
            android:id="@+id/btn_mac"/><TextView
            android:id="@+id/tv_mac"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"/></LinearLayout><LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"><Button
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="hook"
            android:id="@+id/btn_hook"/><TextView
            android:id="@+id/tv_hook"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"/></LinearLayout></LinearLayout>
```

AndroidManifest.xml需要添加权限：

```xml
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
```

按钮“hook”调用libso.so导出的函数hook：

```c
extern"C" JNIEXPORT jstring JNICALL Java_com_example_jnihookjava_MainActivity_hook(JNIEnv *env, jclass clazz){
    Hook();
    return env->NewStringUTF("hook ok");;
}
```



```c
#include "MethodHooker.h"
#include "jni.h"
#include "android_runtime/AndroidRuntime.h"
#include "android/log.h"
#include "stdio.h"
#include "stdlib.h"
#include "native.h"
#include <dlfcn.h>
#define ANDROID_SMP 0
#include "Dalvik.h"
#include "alloc/Alloc.h"#define ALOG(...) __android_log_print(ANDROID_LOG_VERBOSE, __VA_ARGS__)

staticbool g_bAttatedT;
static JavaVM *g_JavaVM;

void init()
{
    g_bAttatedT = false;
    g_JavaVM = android::AndroidRuntime::getJavaVM();
}

static JNIEnv *GetEnv()
{
    int status;
    JNIEnv *envnow = NULL;
    status = g_JavaVM->GetEnv((void **)&envnow, JNI_VERSION_1_4);
    if(status < 0)
    {
        status = g_JavaVM->AttachCurrentThread(&envnow, NULL);
        if(status < 0)
        {
            return NULL;
        }
        g_bAttatedT = true;
    }
    return envnow;
}

staticvoid DetachCurrent()
{
    if(g_bAttatedT)
    {
        g_JavaVM->DetachCurrentThread();
    }
}

staticint computeJniArgInfo(const DexProto* proto)
{
    constchar* sig = dexProtoGetShorty(proto);
    int returnType, jniArgInfo;
    u4 hints;

    /* The first shorty character is the return type. */switch (*(sig++)) {
    case'V':
        returnType = DALVIK_JNI_RETURN_VOID;
        break;
    case'F':
        returnType = DALVIK_JNI_RETURN_FLOAT;
        break;
    case'D':
        returnType = DALVIK_JNI_RETURN_DOUBLE;
        break;
    case'J':
        returnType = DALVIK_JNI_RETURN_S8;
        break;
    case'Z':
    case'B':
        returnType = DALVIK_JNI_RETURN_S1;
        break;
    case'C':
        returnType = DALVIK_JNI_RETURN_U2;
        break;
    case'S':
        returnType = DALVIK_JNI_RETURN_S2;
        break;
    default:
        returnType = DALVIK_JNI_RETURN_S4;
        break;
    }

    jniArgInfo = returnType << DALVIK_JNI_RETURN_SHIFT;

    hints = dvmPlatformInvokeHints(proto);

    if (hints & DALVIK_JNI_NO_ARG_INFO) {
        jniArgInfo |= DALVIK_JNI_NO_ARG_INFO;
    } else {
        assert((hints & DALVIK_JNI_RETURN_MASK) == 0);
        jniArgInfo |= hints;
    }

    return jniArgInfo;
}

int ClearException(JNIEnv *jenv){
    jthrowable exception = jenv->ExceptionOccurred();
    if (exception != NULL) {
        jenv->ExceptionDescribe();
        jenv->ExceptionClear();
        returntrue;
    }
    returnfalse;
}

bool isArt(){
    returnfalse;
}

static jclass findAppClass(JNIEnv *jenv,constchar *apn){
    //获取Loaders
    jclass clazzApplicationLoaders = jenv->FindClass("android/app/ApplicationLoaders");
    jthrowable exception = jenv->ExceptionOccurred();
    if (ClearException(jenv)) {
        ALOG("Exception","No class : %s", "android/app/ApplicationLoaders");
        return NULL;
    }
    jfieldID fieldApplicationLoaders = jenv->GetStaticFieldID(clazzApplicationLoaders,"gApplicationLoaders","Landroid/app/ApplicationLoaders;");
    if (ClearException(jenv)) {
        ALOG("Exception","No Static Field :%s","gApplicationLoaders");
        return NULL;
    }
    jobject objApplicationLoaders = jenv->GetStaticObjectField(clazzApplicationLoaders,fieldApplicationLoaders);
    if (ClearException(jenv)) {
        ALOG("Exception","GetStaticObjectField is failed [%s","gApplicationLoaders");
        return NULL;
    }
    jfieldID fieldLoaders = jenv->GetFieldID(clazzApplicationLoaders,"mLoaders","Ljava/util/Map;");
    if (ClearException(jenv)) {
        ALOG("Exception","No Field :%s","mLoaders");
        return NULL;
    }
    jobject objLoaders = jenv->GetObjectField(objApplicationLoaders,fieldLoaders);
    if (ClearException(jenv)) {
        ALOG("Exception","No object :%s","mLoaders");
        return NULL;
    }
    //提取map中的values
    jclass clazzHashMap = jenv->GetObjectClass(objLoaders);
    jmethodID methodValues = jenv->GetMethodID(clazzHashMap,"values","()Ljava/util/Collection;");
    jobject values = jenv->CallObjectMethod(objLoaders,methodValues);

    jclass clazzValues = jenv->GetObjectClass(values);
    jmethodID methodToArray = jenv->GetMethodID(clazzValues,"toArray","()[Ljava/lang/Object;");
    if (ClearException(jenv)) {
        ALOG("Exception","No Method:%s","toArray");
        return NULL;
    }

    jobjectArray classLoaders = (jobjectArray)jenv->CallObjectMethod(values,methodToArray);
    if (ClearException(jenv)) {
        ALOG("Exception","CallObjectMethod failed :%s","toArray");
        return NULL;
    }

        int size = jenv->GetArrayLength(classLoaders);

        for(int i = 0 ; i < size ; i ++){
            jobject classLoader = jenv->GetObjectArrayElement(classLoaders,i);
            jclass clazzCL = jenv->GetObjectClass(classLoader);
            jmethodID loadClass = jenv->GetMethodID(clazzCL,"loadClass","(Ljava/lang/String;)Ljava/lang/Class;");
            jstring param = jenv->NewStringUTF(apn);
            jclass tClazz = (jclass)jenv->CallObjectMethod(classLoader,loadClass,param);
            if (ClearException(jenv)) {
                ALOG("Exception","No");
                continue;
            }
            return tClazz;
        }
    ALOG("Exception","No");
    return NULL;
}



bool HookDalvikMethod(jmethodID jmethod){
    Method *method = (Method*)jmethod;
    //关键!!将目标方法修改为native方法    SET_METHOD_FLAG(method, ACC_NATIVE);

    int argsSize = dvmComputeMethodArgsSize(method);
    if (!dvmIsStaticMethod(method))
        argsSize++;

    method->registersSize = method->insSize = argsSize;

    if (dvmIsNativeMethod(method)) {
        method->nativeFunc = dvmResolveNativeMethod;
        method->jniArgInfo = computeJniArgInfo(&method->prototype);
    }
}

bool ClassMethodHook(HookInfo info){

    JNIEnv *jenv = GetEnv();

    jclass clazzTarget = jenv->FindClass(info.tClazz);
    if (ClearException(jenv)) {
        ALOG("Exception","ClassMethodHook[Can't find class:%s in bootclassloader",info.tClazz);

        clazzTarget = findAppClass(jenv,info.tClazz);
        if(clazzTarget == NULL){
            ALOG("Exception","%s","Error in findAppClass");
            returnfalse;
        }
    }

    jmethodID method = jenv->GetMethodID(clazzTarget,info.tMethod,info.tMeihodSig);
    if(method==NULL){
        ALOG("Exception","ClassMethodHook[Can't find method:%s",info.tMethod);
        returnfalse;
    }

    if(isArt()){
        //HookArtMethod(jenv,method);
    }else{
        HookDalvikMethod(method);
    }

    JNINativeMethod gMethod[] = {
        {info.tMethod, info.tMeihodSig, info.handleFunc},
    };

    //func为NULL时不自行绑定,后面扩展吧if(info.handleFunc != NULL){
        //关键!!将目标方法关联到自定义的native方法if (jenv->RegisterNatives(clazzTarget, gMethod, 1) < 0) {
            ALOG("RegisterNatives","err");
            returnfalse;
        }
    }

    DetachCurrent();
    returntrue;
}


JNIEXPORT jstring JNICALL hello(JNIEnv *env, jclass clazz)  
{  
    //__android_log_print(ANDROID_LOG_VERBOSE, "tag", "call <native_printf> in java");return env->NewStringUTF("hello from native");;
}

JNIEXPORT jstring JNICALL getmac(JNIEnv *env, jclass clazz)  
{  
    //__android_log_print(ANDROID_LOG_VERBOSE, "tag", "call <native_printf> in java");return env->NewStringUTF("getmac from native");;
}

HookInfo hookInfos[] = {
    {"android/net/wifi/WifiInfo","getMacAddress","()Ljava/lang/String;",(void*)getmac},
    {"com/example/jnihookjava/MainActivity","hello","()Ljava/lang/String;",(void*)hello},
    //{"android/app/ApplicationLoaders","getText","()Ljava/lang/CharSequence;",(void*)test},};

int getpHookInfo(HookInfo** pInfo){
    *pInfo = hookInfos;
    returnsizeof(hookInfos) / sizeof(hookInfos[0]);
}

int Hook(){
    init();
    ClassMethodHook(hookInfos[0]);
    ClassMethodHook(hookInfos[1]);
}
```

