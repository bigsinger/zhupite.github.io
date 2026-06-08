---
layout: post
title: "易开发 DeveloperHelper：Android 逆向与开发调试一站式助手"
date: 2026-06-08
categories: [sec]
tags: [developer-helper, android, reverse-engineering, xposed, debugging, kotlin, decompile]
description: DeveloperHelper（易开发）是一款面向 Android 开发者和逆向工程师的辅助工具，提供应用分析、布局审查、脱壳管理等功能，支持 Android 5.0+。
---

## 概述

[DeveloperHelper（易开发）](https://github.com/WrBug/DeveloperHelper) 是一款面向 Android 开发人员和逆向分析人员的综合辅助工具。它集成了应用信息查看、布局分析、脱壳管理、数据库编辑等常用功能，是 Android 开发调试和逆向分析的全能助手。

- **GitHub Stars**: ⭐ 1,417
- **语言**: Kotlin
- **许可证**: MIT
- **Fork 数**: 259
- **最近更新**: 2025年8月

## 核心功能

### 1. 应用信息分析

| 功能 | 说明 |
|------|------|
| 版本信息 | versionCode, versionName |
| TopActivity | 当前前台 Activity |
| 加固检测 | 自动识别应用加固类型 |
| Uid 信息 | 应用用户 ID |
| 安装时间 | 首次安装和更新时间 |
| Data 目录 | 应用数据目录路径 |

### 2. APK 信息

- APK 文件路径
- MD5/SHA1 哈希值
- SharedPreference 查看与编辑
- 数据库查看与修改

### 3. 布局分析 (Layout Inspector)

DeveloperHelper 提供了强大的布局分析功能：

- 查看 Widget Class 名称
- 获取 View ID
- 查看 enable/clickable 等状态
- 获取 View 文本内容
- 精确获取 View 位置坐标

这对于 UI 自动化测试和逆向分析布局结构非常有帮助。

### 4. 脱壳应用管理

基于 Xposed 框架实现对加固应用的脱壳功能：

- 支持 Android Pie (SDK 28) 及以上版本
- 需要 EdXposed 框架支持
- 脱壳应用统一管理界面

## 技术架构

项目基于 Kotlin 语言开发，采用 Xposed 模块架构实现部分核心功能：

```kotlin
// 典型的 Xposed Hook 实现模式
XposedHelpers.findAndHookMethod(
    "android.app.Activity",
    lpparam.classLoader,
    "onResume",
    XC_MethodHook() {
        afterHookedMethod { param ->
            // 获取当前 Activity 信息
        }
    }
)
```

## 版本演进

| 版本 | 新增功能 |
|------|---------|
| v1.0 | 基础应用信息查看 |
| v1.0.1 | 布局分析功能 |
| v1.0.2 | 数据库查看与编辑 |
| v1.0.3 | Android Pie EdXposed 支持 + 脱壳功能 |

## 应用场景

1. **日常开发调试**：快速查看应用信息、数据库、SharedPreference
2. **UI 分析**：分析第三方应用的界面布局结构
3. **逆向脱壳**：对加固应用进行脱壳处理
4. **安全审计**：分析应用的加固类型和基本信息

## 安装方式

```bash
# 方式一：GitHub Releases
# 下载最新 APK 直接安装
# https://github.com/WrBug/DeveloperHelper/releases

# 方式二：酷安市场
# 搜索 "易开发" 下载安装
```

## 总结

DeveloperHelper 将开发调试和逆向分析中常用的功能整合到一个应用中，极大地提升了日常工作效率。虽然 Star 数不算特别高（1,417），但其功能设计理念非常实用——在应用中查看数据库、SharedPreference、布局信息等功能，可以避免在开发过程中频繁使用 Android Studio 或 ADB 命令。对于 Android 开发者和逆向工程师来说，这是一款值得常备的工具。
