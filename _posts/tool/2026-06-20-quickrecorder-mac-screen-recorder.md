---
layout: post
title: "QuickRecorder：macOS 开源录屏工具，5MB 轻量级替代，免费开源性能极致"
categories: [tool]
description: "QuickRecorder 是一款专为 macOS 设计的轻量级屏幕录制工具，基于苹果官方的 ScreenCapture Kit 框架开发。5MB 安装包、8.4K Stars、免费开源，支持窗口/应用/移动设备录制和 Presenter Overlay 叠加。"
tags: [macOS, 录屏, 开源工具, Swift, ScreenCapture]
---

## 一句话

**QuickRecorder** 是一款专为 macOS 设计的轻量级屏幕录制工具，基于苹果官方的 ScreenCapture Kit 框架原生开发，提供极致流畅的录屏体验。全免费、开源、无广告、不到 5MB。

> lihaoyun6/QuickRecorder ⭐ 8.4K | 🦊 Swift | AGPL-3.0 | macOS 12.3+

## 为什么需要它？

macOS 上的录屏工具有个尴尬的生态：功能好点的（ScreenFlow、Camtasia）卖几百块，免费的要么功能残缺、要么有内购、要么带水印。App Store 上甚至有人把系统自带的屏幕录制能力包装一下，标价 38 元"纯坑小白"。

QuickRecorder 的作者就是看不惯这个——直接做个功能更强、完全免费、开源的替代品。安装包不到 5MB，功能却比大部分付费软件还全。

## 核心功能

### 四种录制模式

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| **屏幕录制** | 全屏或区域录制 | 常规录屏 |
| **窗口录制** | 单个窗口跟随录制 | 软件操作教程 |
| **应用录制** | 特定应用窗口录制 | 应用演示 |
| **移动设备录制** | 录制 iPhone/iPad 屏幕 | 手机演示、App 测试 |

### 特色功能

**Presenter Overlay（演示者叠加）** ——完全支持 macOS 14+ 的功能，录像时将摄像头画面实时叠加到录制内容中。做教程、演示时不用后期合成，录制时直接搞定。

**鼠标高亮 + 屏幕放大**——录制教程和演示时，高亮显示鼠标位置，支持屏幕局部放大。这个细节对教学类视频非常实用，观看者能清楚知道你点的是哪里。

**音频回环录制**——免驱录制系统声音，无需额外安装驱动即可同时录制系统音频和麦克风音频。

**HEVC Alpha 视频**——支持录制带透明通道的 HEVC 格式视频，适用于需要后期合成的专业场景。这个功能在免费工具里很少见。

**跨设备录制**——同时录制 Mac 屏幕 + iPhone/iPad 屏幕（支持雷电或有线连接）。适合需要手机+电脑混合内容创作的场景。

**快捷键支持**——集成 Swift 开发的快捷键库，提供流畅的快捷操作体验。

## 技术特点

基于苹果官方的 ScreenCapture Kit 框架开发，纯 Swift 实现，原生 macOS 体验。不依赖第三方录屏驱动或内核扩展，系统兼容性好。

安装包仅约 5MB（DMG 约 4.6MB），运行内存占用低，不影响系统流畅度。

## 安装方法

### 方式一：直接下载

从 [GitHub Releases](https://github.com/lihaoyun6/QuickRecorder/releases) 下载最新版，解压安装。

### 方式二：Homebrew

```bash
brew install lihaoyun6/tap/quickrecorder
```

**系统要求**：macOS 12.3+

## 项目状态

| 指标 | 数据 |
|------|------|
| Stars | 8,375 ⭐ |
| Forks | 476 |
| 主语言 | Swift |
| 许可证 | AGPL-3.0 |
| 最新版本 | v1.6.9（2025-06-11） |
| Open Issues | 163 |
| 安装包 | ~5MB |
| 系统要求 | macOS 12.3+ |

## 总结

QuickRecorder 把录屏这件事做到了足够简单、足够干净。免费、功能全、体验顺滑，背后还有开发者那份"看不惯就自己做、要做就做到更好"的侠客精神。

如果你用 Mac 需要录屏，QuickRecorder 是当前最推荐的免费选择。

---

**项目地址**：[github.com/lihaoyun6/QuickRecorder](https://github.com/lihaoyun6/QuickRecorder)
