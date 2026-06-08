---
layout: post
title: "libsodium — 现代、便携、易用的加密库"
date: 2026-06-08 00:00:00 +0800
categories: [sec]
tags: [C, 加密, 密码学, 安全, sodium, NaCl, 开源项目]
description: "libsodium 是 NaCl 加密库的便携式跨平台分支，提供加密解密、数字签名、安全密码哈希等现代密码学功能。"
---

# libsodium — 现代、便携、易用的加密库

## 工具简介

**libsodium**（[GitHub](https://github.com/jedisct1/libsodium)）是由 jedisct1 维护的开源加密库，使用 **C** 语言编写，当前拥有 **13733** 颗星。它是著名加密库 [NaCl](http://nacl.cr.yp.to/) 的**便携式跨平台分支**，在保持 API 兼容的同时扩展了功能，简化了安全应用的开发。

## 核心特性

- **加密与解密**：使用现代算法安全地加密/解密数据
- **数字签名**：创建和验证签名以确保数据真实性
- **密码哈希**：安全密码哈希与存储
- **跨平台支持**：Windows（MinGW/Visual Studio）、iOS、Android、JavaScript、WebAssembly
- **友好的 API**：提供所有核心密码学操作，易于集成
- **Zig 包支持**：可作为 Zig 语言的包直接使用

## 技术特点

- **语言**：C（核心）、多种语言绑定
- **许可证**：NOASSERTION（ISC 风格）
- **持续集成**：GitHub CI、Azure CI、Coverity Scan、CodeQL
- **完善的文档**：安装指南、快速入门、完整 API 文档

## 应用场景

- 应用程序数据加密存储
- 网络通信加密（TLS 替代方案）
- 数字签名和身份验证
- 密码哈希和密钥管理
- IoT 设备和嵌入式系统
