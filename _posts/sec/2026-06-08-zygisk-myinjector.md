---
layout: post
title: "Zygisk-MyInjector — 自定义 SO 注入脚手架"
date: 2026-06-08 00:00:00 +0800
categories: [sec]
tags: [Android, Zygisk, SO注入, Java, Magisk, Xposed, 开源项目]
description: "Zygisk-MyInjector 是一个支持图形化界面的 Android SO 文件注入工具，基于 Zygisk 实现自定义注入和隐藏功能。"
---

# Zygisk-MyInjector — 自定义 SO 注入脚手架

## 工具简介

**Zygisk-MyInjector**（[GitHub](https://github.com/jiqiu2022/Zygisk-MyInjector)）是由 jiqiu2022 开发的开源项目，使用 **Java** 编写，当前拥有 **644** 颗星。它是一个基于 **Zygisk** 的 Android SO 文件注入工具，提供了**图形化界面**，让用户可以轻松配置和管理注入。

## 核心特性

- **图形化界面**：告别命令行，操作直观简单
- **一键安装**：面具模块快速部署
- **配套管理 APP**：轻松管理注入配置
- **自定义 Linker**：支持自定义 linker 注入
- **自动隐藏**：支持 SO 文件隐藏和反检测
- **Gadget 配置**：支持 Frida gadget 自动生成
- **全局延迟设置**：可设置全局注入延迟

## 版本规划

- **v1.x**：专注功能添加，暂不考虑反检测
- **v2.x**：实现各种检测绕过，达到 100% 无痕注入

## 技术特点

- 基于 Zygisk 实现注入
- 支持 Magisk / KernelSU / APatch
- GitHub CI 自动构建
- 与 soLoader 项目联动，支持自定义 linker

## 适用场景

- Android 安全研究
- 动态分析与逆向工程
- 游戏修改与辅助开发
- Xposed 模块开发与测试
