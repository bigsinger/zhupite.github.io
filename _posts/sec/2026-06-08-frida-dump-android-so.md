---
layout: post
title: "frida-dump-android-so — Frida 一键 Dump 安卓 SO 文件"
date: 2026-06-08 00:00:00 +0800
categories: [sec]
tags: [Frida, Android, SO Dump, 逆向工程, ELF, 内存Dump, Python, 开源项目]
description: frida-dump-android-so 是一个基于 Frida 的 Python 脚本，用于一键从 Android 进程内存中 Dump 已加载的 SO 动态库文件。
---

# frida-dump-android-so — Frida 一键 Dump 安卓 SO 文件

## 工具简介

**frida-dump-android-so**（[GitHub](https://github.com/qweraqq/frida-dump-android-so)）是由 qweraqq 开发的一款基于 **Frida** 的 **Python** 脚本工具，当前拥有 **32** 颗星。它的核心功能非常简单直接：**一行命令，从 Android 进程内存中一键 Dump 出已加载的 SO 文件。**

## 核心功能

- **一键 Dump**：指定进程名和 SO 文件名，自动 Dump 内存中的 SO
- **Frida 驱动**：利用 Frida 的动态插桩能力，Hook dlopen 捕获 SO 加载
- **简单易用**：Python 脚本，单文件即可运行

## 使用方法

```bash
python frida-dump-so.py com.abc libDexHelper.so
```

## 配合 SoFixer 修复

由于 Frida 的内联 Hook 会在函数开头增加 trampoline，Dump 出的 SO 文件需要使用 **SoFixer** 进行修复：

```bash
./SoFixer-Linux-64 -s libDexHelper.so -o libDexHelper-fixed.so -m 0x78017d8000 -d
```

| 参数 | 说明 |
|------|------|
| `-s` | 待修复的 SO 文件路径 |
| `-o` | 修复后的 SO 输出路径 |
| `-m` | 内存 Dump 的基地址（十六进制） |
| `-d` | 输出调试信息 |

## 技术特点

| 指标 | 数据 |
|------|------|
| 仓库 | https://github.com/qweraqq/frida-dump-android-so |
| Stars | 32 |
| Forks | 14 |
| 编程语言 | Python |
| 创建时间 | 2024-03-19 |
| 最后更新 | 2025-11-16 |

## 参考项目

- [SoFixer](https://github.com/F8LEFT/SoFixer) — SO 文件修复工具
- [frida hook dlopen 文章](https://bbs.kanxue.com/thread-277034.htm) — 了解 SO 加载流程
- [frida hook init_array 文章](https://bbs.kanxue.com/thread-267430.htm) — 早期 SO 初始化 Hook
