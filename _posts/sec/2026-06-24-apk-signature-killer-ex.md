---
layout: post
title: "ApkSignatureKillerEx：MT 去签原理与对抗的演示项目"
categories: [sec]
description: "一个演示 MT Manager 去除 APK 签名校验原理及其对抗方法的开源项目。用 C 语言实现，从实现层展示 SignatureKiller 的工作机制和对应的检测/防御思路。"
tags:
  - Android
  - 签名校验
  - MT 管理器
  - 逆向
  - 去签
---

> 项目地址：[L-JINBIN/ApkSignatureKillerEx](https://github.com/L-JINBIN/ApkSignatureKillerEx)

在 Android 逆向和重打包领域，**去除签名校验**（去签）是一个经典命题。当修改后的 APK 重新签名安装后，如果原始应用在代码中校验了自己的签名指纹，就会拒绝运行。MT 管理器的 SignatureKiller 是处理这个问题的主流工具之一。

ApkSignatureKillerEx 这个项目做的就是一件事：**演示 MT 去签的原理，以及它的对抗方法。**

## 项目定位

这不是一个可以直接拿来用的去签工具，而是一个**技术演示项目**。作者用 C 语言实现了对 MT SignatureKiller 机制的模拟，同时展示了如何检测这种去签行为并进行对抗。

对于理解 Android 签名校验体系和安全攻防的人来说，这是一个比只看文字分析更直观的学习资源。

## What it 演示

MT 的 SignatureKiller 有一个经典改法：修改 `MultiDexApplication.super` → `KillerApplication`，并新增 `classes3.dex` 承载注入逻辑。业务代码本身不动。这个项目展示了这种改法在底层是如何工作的，以及应用层可以在哪些环节检测异常。

## 适用读者

- 对 Android 重打包和签名校验感兴趣的安全研究员
- 需要理解 MT 去签原理以便更好保护自己应用的开发者
- 逆向工程学习者

> 本文基于项目 README 编写，项目描述较简洁，更多细节需阅读源码。
