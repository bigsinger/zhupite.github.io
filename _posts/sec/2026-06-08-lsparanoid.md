---
layout: post
title: "LSParanoid — Android 应用字符串混淆工具"
date: 2026-06-08 00:00:00 +0800
categories: [sec]
tags: [Android, Kotlin, 混淆, 安全, LSPosed, Gradle, 开源项目]
description: "LSParanoid 是 LSPosed 团队开发的 Android 应用字符串混淆 Gradle 插件，通过注解自动混淆字符串常量。"
---

# LSParanoid — Android 应用字符串混淆工具

## 工具简介

**LSParanoid**（[GitHub](https://github.com/LSPosed/LSParanoid)）是由 LSPosed 团队开发的开源项目，使用 **Kotlin** 编写，当前拥有 **424** 颗星。它是一个 **Android 字符串混淆 Gradle 插件**，通过简单的注解即可自动混淆代码中的字符串常量。

## 核心特性

- **注解驱动**：使用 `@Obfuscate` 注解标记需要混淆的类
- **Gradle 插件**：无缝集成到 Android 构建流程
- **可配置**：支持种子值、类过滤、依赖包含等配置
- **缓存支持**：设置种子后可实现构建缓存
- **变体过滤**：支持按构建变体选择性混淆

## 使用方式

```kotlin
// settings.gradle.kts
pluginManagement {
  repositories { mavenCentral() }
  plugins {
    id("org.lsposed.lsparanoid") version "..."
  }
}
```

```kotlin
// build.gradle.kts
plugins { id("org.lsposed.lsparanoid") }

lsparanoid {
  seed = null
  classFilter = null
  includeDependencies = false
  variantFilter = { true }
}
```

在需要混淆的类上添加 `@Obfuscate` 注解即可。

## 技术特点

- 基于 Gradle Plugin 开发
- 支持配置缓存（Configuration Cache）
- 需要 Java 17+ 运行 Gradle 守护进程
- 发布在 Maven Central

## 适用场景

- Android 应用安全加固
- 防止逆向工程中的字符串分析
- 保护敏感 API Key 和配置信息
