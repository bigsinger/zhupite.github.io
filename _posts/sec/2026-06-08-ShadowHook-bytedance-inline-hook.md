---
layout: post
title: "ShadowHook：字节跳动开源的 Android 内联 Hook 库"
date: 2026-06-08 10:10:00 +0800
categories: [sec]
tags: [android, hook, inline-hook, bytedance, arm64, ndk, security]
description: "ShadowHook 是字节跳动开源的 Android 内联 Hook 库，支持 thumb/arm32/arm64 架构，从 Android 4.1 覆盖到 16，已在抖音等生产级应用中稳定运行。"
---

## 概述

[ShadowHook](https://github.com/bytedance/android-inline-hook) 是**字节跳动**开源的 Android 内联 Hook 库，项目在 GitHub 上名为 `bytedance/android-inline-hook`。截至 2026 年 6 月拥有 **2,301 颗 Star** 和 **392 个 Fork**，采用 MIT 协议。

> 如果你需要 Android PLT Hook 库，字节跳动还有另一个项目 [ByteHook](https://github.com/bytedance/bhook)。

## 核心特性

| 特性 | 说明 |
|------|------|
| **架构支持** | armeabi-v7a (thumb/arm32)、arm64-v8a |
| **Android 兼容** | API Level 16 (4.1) ~ 36 (16)，跨度极大 |
| **Hook 方式** | 支持按地址 Hook / 按「库名+函数名」Hook |
| **自动补 Hook** | 对新加载的 ELF 自动完成 Hook 和拦截，支持回调通知 |
| **递归防护** | 自动防止代理函数间的递归循环调用 |
| **操作记录** | 支持 Hook/拦截操作记录，可随时导出 |
| **ELF 回调** | 支持在 linker 调用 `.init`/`.init_array` 前后注册回调 |
| **符号查询** | 绕过 linker namespace 限制，查询进程中所有 ELF 的符号地址 |
| **栈回溯兼容** | 代理函数中兼容 CFI unwind 和 FP unwind |

## ShadowHook vs 其他 Hook 方案

| 方案 | Hook 方式 | Root 要求 | 生产级 | 架构 |
|------|-----------|-----------|--------|------|
| **ShadowHook** | 内联 Hook | 不需要 | ✅ 字节跳动生产验证 | ARM |
| **ByteHook** | PLT Hook | 不需要 | ✅ 字节跳动生产验证 | ARM |
| **Xposed** | Java Hook | 需要 | ✅ | 跨平台 |
| **Frida** | 动态插桩 | 需要 | ⚠️ 调试为主 | 跨平台 |

## 应用场景

- **安全检测**：Hook 敏感 API 调用，监控应用行为
- **性能监控**：拦截关键函数，统计调用频率和耗时
- **兼容性修复**：在特定厂商 ROM 上修正系统 API 行为
- **逆向分析**：辅助分析第三方库的内部函数调用

## 快速使用

```c
// 按地址 Hook
shadowhook_hook_addr(
    (void *)target_addr, 
    (void *)my_proxy, 
    (void **)&orig_func
);

// 按符号名 Hook
shadowhook_hook_sym(
    "libtarget.so", 
    "target_func", 
    (void *)my_proxy, 
    (void **)&orig_func
);
```

## 总结

ShadowHook 是字节跳动在 Android Hook 领域的重要开源贡献。与许多学术或实验性项目不同，它已在抖音、头条等亿级用户应用中经过严格的稳定性考验，是 Android 原生层 Hook 领域不可绕过的标杆项目。其 v2.0 版本在性能和稳定性上又有了显著提升，强烈推荐所有从事 Android 底层开发的工程师关注。
