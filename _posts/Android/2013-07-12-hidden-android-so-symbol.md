---
layout:		post
category:	"android"
title:		"Android JNI-SO函数名隐藏hidden"
tags:		[android,ndk]
---



参考： Android jni隐藏so动态库的内部符号表

LOCAL_CFLAGS  := -Werror **-fvisibility=hidden**

LOCAL_CPPFLAGS += -std=c++11 **-fvisibility=hidden**