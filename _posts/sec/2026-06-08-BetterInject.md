---
layout: post
title: "BetterInject：Android Ptrace 共享库注入方案"
date: 2026-06-08 10:20:00 +0800
categories: [sec]
tags: [android, injector, ptrace, shared-library, hook, arm64]
description: "BetterInject 是一个基于 Ptrace 的 Android 共享库注入器，支持 Android 5~14 及 arm/arm64/x86/x86_64 架构，能绕过 linker namespace 限制。"
---

## 概述

[BetterInject](https://github.com/XiaBei-cy/BetterInject) 是一个基于 **Ptrace** 的 Android 共享库注入器（Shared Library Mod Injector）。截至 2026 年 6 月获得 **18 颗 Star**，采用 GPL-3.0 协议。虽未大规模推广，但其技术方案在 Android 注入领域有较高的参考价值。

## 支持范围

| 维度 | 支持情况 |
|------|----------|
| **Android 版本** | 5.0 ~ 14.0 |
| **CPU 架构** | arm、arm64、x86、x86_64 |
| **模拟器** | 支持（libhoudini.so / libndk_translation.so） |
| **注入方式** | Ptrace 附加 + 远程调用 |

## 核心功能

- **Ptrace 注入**：通过 ptrace 系统调用附加目标进程，在目标进程内加载 SO 文件
- **Linker 绕过**：突破 Android linker namespace 限制，注入到隔离进程
- **Memfd 支持**：支持通过 memfd 方式加载 SO，避免文件落地
- **自动启动**：支持自动化注入流程
- **JNI 支持**：在注入的 SO 中可以使用 JNI，通过 `JNI_OnLoad` 获取 JavaVM 环境

## 配置与使用

编辑 `Client/Client.cpp` 中的 `package_name` 为目标应用包名，在 `Server/Server.cpp` 中添加注入后的执行逻辑：

```cpp
extern "C" jint JNIEXPORT JNI_OnLoad(JavaVM* vm, void *key)
{
    if (key != (void*)1337)
        return JNI_VERSION_1_6;

    JNIEnv *env = nullptr;
    if (vm->GetEnv((void**)&env, JNI_VERSION_1_6) == JNI_OK)
    {
        // 在这里编写注入后的逻辑
    }
    return JNI_VERSION_1_6;
}
```

## 技术原理

Ptrace 注入的核心流程：
1. `ptrace(PTRACE_ATTACH)` 附加到目标进程
2. 在目标进程中分配内存（`mmap` 远程调用）
3. 将 SO 文件路径写入分配的内存
4. 远程调用 `dlopen` / `__loader_dlopen` 加载 SO
5. 触发 SO 的构造函数或 `JNI_OnLoad`

## 同类项目对比

| 项目 | 注入方式 | 架构 | 特点 |
|------|----------|------|------|
| **BetterInject** | Ptrace | 全架构 | 配置灵活，代码清晰 |
| **AndKittyInjector** | Ptrace | ARM | 更成熟的 Ptrace 方案 |
| **TInjector** | Zygote 劫持 | arm64 | App 启动前注入 |
| **Reinject** | 内核驱动 | 全架构 | 外部内核驱动注入 |

## 总结

BetterInject 是一个清晰简洁的 Ptrace 注入实现，适合作为 Android 注入技术的学习参考。项目代码量不大但架构完整，覆盖了 Ptrace 注入的完整流程，对理解 Android 进程注入机制有很好的教学意义。
