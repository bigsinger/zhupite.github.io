---
layout: post
title: "AppShark：字节跳动开源的 Android 静态污点分析平台"
date: 2026-06-08 11:00:00 +0800
categories: [sec]
tags: [android, static-analysis, vulnerability, bytecode, taint-analysis, bytedance]
description: "AppShark 是字节跳动开源的 Android 应用静态污点分析平台，可自动扫描 APK 中的漏洞和合规问题，支持自定义检测规则和路径遍历分析。"
---

## 概述

[AppShark](https://github.com/bytedance/appshark) 是**字节跳动**开源的 Android 应用静态污点分析平台。截至 2026 年 6 月收获 **1,734 颗 Star** 和 **180 个 Fork**，采用 Apache-2.0 协议。

项目使用 **Kotlin** 编写，专注于对 APK 文件进行自动化的漏洞扫描和合规检测。

## 核心能力

| 能力 | 说明 |
|------|------|
| **污点分析** | 追踪敏感数据从 Source 到 Sink 的完整路径 |
| **合规检测** | 检测隐私合规问题，如敏感权限违规调用 |
| **路径遍历** | 自动发现文件路径遍历漏洞 |
| **自定义规则** | 支持编写 JSON5 格式的检测规则 |
| **多入口分析** | 支持多 Activity、Service 等入口点的全量分析 |
| **超时控制** | 可配置单入口分析超时时间，防止无限循环 |

## 为什么需要 AppShark

随着移动应用隐私合规法规日益严格（如《个人信息保护法》、GDPR 等），传统的静态分析工具在以下方面存在不足：

- **误报率高**：大量不精确的告警，人工筛选成本高
- **不能跨方法追踪**：无法追踪经过多层函数调用的数据流
- **缺少定制能力**：无法针对特定业务场景编写检测规则

AppShark 采用精确的**过程间污点分析**算法，显著降低误报率，并提供了灵活的规则系统。

## 快速开始

```shell
# 前提条件：JDK 11（已验证不支持 JDK 8/16）

# 编译
./gradlew build -x test

# 运行
java -jar build/libs/AppShark-0.1.2-all.jar config/config.json5
```

配置文件示例：

```json5
{
  apkPath: "/path/to/target.apk",
  out: "/path/to/output",
  rulePath: "./config/rules",
  maxPointerAnalyzeTime: 300
}
```

## 检测规则示例

AppShark 的规则使用 JSON5 格式，可灵活定义 Source、Sink 和传播路径：

```json5
[
  {
    id: "find-webview-addjavascriptinterface",
    severity: "HIGH",
    sinks: [
      {
        "method": "void addJavascriptInterface(Object, String)"
      }
    ],
    description: "WebView addJavascriptInterface 风险检测"
  }
]
```

## 应用场景

- **隐私合规审计**：自动检测 SDK 是否存在违规收集个人信息的行为
- **App 安全测试**：在发布前扫描 APK 的潜在安全漏洞
- **第三方 SDK 审核**：集成到 CI/CD 流程中自动化检测引入的 SDK
- **路径遍历游戏**：项目文档中附带了一个"路径遍历游戏"，帮助用户理解分析能力

## 总结

AppShark 是字节跳动在移动安全领域的重要开源贡献。与 MobSF 等全功能移动安全框架不同，AppShark 专注于**静态污点分析**这一领域，做到了极致的深度和精确度。其自定义规则系统和 JDK 11 的轻量依赖使其非常适合集成到企业的 DevSecOps 流程中。对于 Android 安全工程师和隐私合规团队来说，这是一个不可多得的利器。
