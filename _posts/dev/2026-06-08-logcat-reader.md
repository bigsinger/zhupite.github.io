---
layout: post
title: "LogcatReader — Android 设备上的 Logcat 日志阅读器"
date: 2026-06-08 00:00:00 +0800
categories: [dev]
tags: [Android, Kotlin, Logcat, 调试工具, Jetpack Compose, 开源项目]
description: "LogcatReader 是一款在 Android 设备上查看系统日志的应用程序，支持过滤、搜索、记录和导出 logcat 日志。"
---

# LogcatReader — Android 设备上的 Logcat 日志阅读器

## 工具简介

**LogcatReader**（[GitHub](https://github.com/darshanparajuli/LogcatReader)）是由 darshanparajuli 开发的开源 Android 应用，使用 **Kotlin** 编写，当前拥有 **842** 颗星。它让开发者直接在 Android 设备上方便地查看、过滤和分析 **logcat** 系统日志。

## 核心特性

- **美观的 UI**：支持深色/浅色主题
- **强大的过滤**：按应用（包名）、标签、消息、优先级、PID、TID 等过滤
- **正则搜索**：消息、标签和包名支持正则表达式
- **日志记录**：记录、保存、分享或导出 logcat 日志
- **丰富显示**：紧凑模式等多种显示选项

## 技术亮点

- 使用 **Jetpack Compose** 构建界面
- 基于 **Kotlin Coroutines** 实现异步处理
- 支持 F-Droid 和 Google Play 双渠道分发
- 代码风格遵循 Square 规范

## 使用前提

需要授予 `android.permission.READ_LOGS` 权限：

```bash
adb shell pm grant com.dp.logcatapp android.permission.READ_LOGS
adb shell am force-stop com.dp.logcatapp
```

## 适用场景

- 无电脑环境下的 Android 开发调试
- 现场问题排查与日志采集
- 应用性能监控与分析
