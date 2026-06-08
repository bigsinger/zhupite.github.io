---
layout: post
title: "TInjector：Zygote 劫持实现应用启动前注入"
date: 2026-06-08 10:40:00 +0800
categories: [sec]
tags: [android, injector, zygote, hook, frida, so-injection]
description: "TInjector 通过劫持 Android Zygote 进程实现在 App 启动前注入 SO 文件，支持 Android 9~13 和 arm64，提供多种隐藏方式避免检测。"
---

## 概述

[TInjector](https://github.com/Mrack/TInjector) 是一个通过**劫持 Zygote 进程**实现应用启动前注入 SO 的工具。截至 2026 年 6 月获得 **352 颗 Star** 和 **122 个 Fork**，采用 GPL-3.0 协议。

## 核心原理

Android 系统中，所有应用进程都由 **Zygote** 进程孵化而来（`fork()` + 加载应用）。TInjector 的创新在于：

1. 在 Zygote 层进行劫持监控
2. 当检测到目标应用包名被 fork 时
3. 在应用启动代码执行**之前**注入自定义 SO
4. SO 加载完成后，应用本身的代码才开始执行

这确保了注入的代码在应用自身的任何检测逻辑之前就已经运行。

## 功能特性

| 特性 | 说明 |
|------|------|
| **注入时机** | App 启动前（Zygote spawn 模式） |
| **Android 兼容** | 9.0 ~ 13.0 |
| **架构支持** | arm64-v8a |
| **隐藏方式** | remap 隐藏、ELF 头移除隐藏、soinfo 隐藏 |
| **注入模式** | 按包名注入、按 PID 注入 |

## 多种隐藏机制

TInjector 提供了三种 SO 隐藏方式：

1. **`--hide` (remap 隐藏)**：通过内存 remap 方式重新映射 SO 的内存段，使其不在常规的内存映射列表中出现
2. **`--hide1` (soinfo 隐藏)**：从 linker 的内部链表中移除 SO 的 soinfo，使 `/proc/self/maps` 和 `dl_iterate_phdr` 无法遍历到
3. **ELF 头移除**：移除 SO 的 ELF 头部标记，进一步增加检测难度

## 使用方法

```shell
# 编译
ndk-build

# 推送文件到设备
adb shell mkdir /data/local/tmp/inject
adb push libtcore.so /data/local/tmp/inject/
adb push tinjector /data/local/tmp/inject/

# 注入
su
cd /data/local/tmp/inject
chmod 777 libtcore.so
chmod +x tinjector
./tinjector -p com.target.app /data/local/tmp/inject/libtcore.so --hide
```

## 同类项目

| 项目 | 注入时机 | 隐藏方式 |
|------|----------|----------|
| **TInjector** | Zygote fork 时 | remap + soinfo + elf 头 |
| **TInjector_Symbi** | Zygote fork 时 | 共生模式，更隐蔽 |
| **Zygisk-MyInjector** | Zygisk 框架 | 图形化管理 |
| **BetterInject** | 运行时 ptrace | 无 |

## 总结

TInjector 的"启动前注入"思路在 Android 注入领域独树一帜：传统的 ptrace 注入需要在进程运行后才能附加，而此时应用可能已经完成了反注入检测。TInjector 从 Zygote 层面下手，确保注入代码优先执行，再配合三重隐藏机制，是一套非常完整的 Android 注入方案。
