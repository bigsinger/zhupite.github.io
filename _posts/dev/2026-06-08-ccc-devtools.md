---
layout: post
title: "ccc-devtools — Cocos Creator 网页调试利器"
date: 2026-06-08 00:00:00 +0800
categories: [dev]
tags: [Cocos Creator, TypeScript, 调试工具, 游戏开发, devtools, 开源项目]
description: "ccc-devtools 是 Cocos Creator 的网页预览调试工具，支持实时节点树浏览、属性编辑、性能分析等功能。"
---

# ccc-devtools — Cocos Creator 网页调试利器

## 工具简介

**ccc-devtools**（[GitHub](https://github.com/potato47/ccc-devtools)）是由 potato47 开发的开源工具，使用 **TypeScript** 编写，当前拥有 **1238** 颗星。它为 Cocos Creator 游戏引擎提供了强大的**网页预览调试功能**，让开发者可以像浏览器 DevTools 一样调试游戏。

## 核心特性

- **实时节点树**：运行时查看完整的场景节点层级结构
- **属性同步编辑**：选中节点后实时修改并同步属性值
- **控制台引用**：一键输出节点/组件引用到控制台
- **UI 标记**：在页面上标记 UI 节点位置
- **FPS 监控**：独立的调试信息面板，显示 FPS 等性能数据
- **Profiler 分析**：内置性能分析工具

## 使用方式

在 Cocos Creator 项目根目录下运行一条命令即可安装：

```bash
npx cccdev@latest init
```

工具会自动检测 Cocos Creator 版本并安装调试模板到 `preview-template/` 目录，刷新浏览器即可使用。

## 技术亮点

- 支持 Cocos Creator 3.x
- 纯前端实现，零后端依赖
- 基于 Preact + Vite 构建
- 支持 Bun 运行时
