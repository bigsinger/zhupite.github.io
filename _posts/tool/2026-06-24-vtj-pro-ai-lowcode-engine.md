---
layout: post
title: "VTJ.PRO：AI 驱动的 Vue3 低代码引擎，代码随时进出设计器"
categories: [tool]
description: "VTJ.PRO 是一个开源 AI 低代码引擎，核心差异在于 DSL 与 Vue3 源码双向转换——设计器里拖出来的界面可以导出为标准 Vue 组件，手写代码也能导入设计器继续可视化编辑。支持 Web、H5 和 UniApp。"
tags:
  - 低代码
  - Vue3
  - AI
  - 开源
  - TypeScript
---

低代码平台有一个老问题：**生成代码不可读、无法二次开发、离开平台就废了**。VTJ.PRO 解决这个问题的思路很直接——让代码在可视化设计器和传统工程之间自由流通。

项目托管在 Gitee（[新潮传媒 / VTJ](https://gitee.com/newgateway/vtj)），截至今日 10,000+ Star，最新版本 0.18.7。TypeScript 编写，基于 Vue3 + Vite 生态。官方文档在 [vtj.pro](https://vtj.pro)，在线体验可访问 [app.vtj.pro](https://app.vtj.pro)。

## 核心设计：双向代码转换

VTJ.PRO 最关键的差异化设计是 **DSL ↔ Vue 3 源码双向转换**。

大多数低代码平台的工作流是单向的：拖拽 → 生成 → 导出 →（之后代码不可逆）。VTJ 的设计是双向的：

- 可视化设计完成后，导出为**标准的 Vue 3 单文件组件**（`.vue`），可以直接在 IDE 中继续手写开发
- 已有的手写 Vue 代码也可以**导入设计器**进行可视化调整
- 设计器-渲染器分离架构，产物是纯净 Vue 代码，不锁定

这意味着你可以在低代码设计器和传统编码之间自由切换——拖拽生成界面、手写改逻辑、再导回设计器调整布局，每一步的产物都是可读、可维护、可独立运行的标准 Vue 项目。

## AI 能力

VTJ 的 AI 不是附加功能，而是嵌入了开发流程的多个环节：

- **自然语言生成组件**——描述需求，AI 生成对应 Vue 组件
- **设计稿/截图生成**——上传设计稿或网页截图，AI 识别后生成页面
- **代码修复**——在 AI 对话中修改逻辑，同步反映到设计器
- **逻辑编排**——AI 参与可视化逻辑配置

底层依赖什么模型未说明，但从体验入口看是调用平台的 AI 服务。

## 功能概览

| 特性 | 说明 |
|------|------|
| 主流技术栈 | Vue3 + TypeScript + Vite，深度整合 ElementPlus、Axios、ECharts |
| 源码级定制 | 设计器内可直接编辑源码，满足个性化需求 |
| 零适应成本 | 遵循前端开发习惯，Vue 开发者无需额外学习 |
| 引擎化扩展 | 低代码引擎可独立调用，用于构建自有低代码平台 |
| 多端输出 | 支持 Web（PC）、H5（移动端）、UniApp（跨端） |
| 高复用物料库 | 内置企业级组件库 + 页面模板 + 可定制区块 |
| 私有化部署 | 支持离线运行、自有服务器部署 |

## 快速上手

```bash
# 创建 Web 应用
npm create vtj@latest --registry=https://registry.npmmirror.com -- -t app

# 创建 H5 应用
npm create vtj@latest --registry=https://registry.npmmirror.com -- -t h5

# 创建 UniApp 跨端应用
npm create vtj@latest --registry=https://registry.npmmirror.com -- -t uniapp

# 创建物料开发项目
npm create vtj@latest --registry=https://registry.npmmirror.com -- -t material
```

脚手架会自动搭建项目工程，包含设计器和出码功能。

如果要从源码开发：

```bash
git clone https://gitee.com/newgateway/vtj.git
cd vtj
npm run setup && npm run build && npm run app:dev
```

开发环境要求 Node v20+，使用 pnpm + lerna 管理。

## 适用场景

- **Vue3 技术栈团队**，需要快速搭建管理后台和中台页面
- **已有 Vue 项目**，想引入可视化设计能力但不希望代码被锁定
- **需要多端输出**（PC + H5 + UniApp）的团队
- **对源码可控性有要求**，不接受黑盒代码生成

## 局限

- 框架绑定 Vue3——不同于一些通用低代码平台，VTJ 深度绑定 Vue 生态
- 组件库以 Element Plus 为主，使用其他 UI 库需要自行适配
- AI 功能依赖在线服务，离线场景不可用
- 项目仍处于快速迭代期（0.x 版本），API 可能有变动

## 与同类工具的定位差异

与 Amis（百度开源）、LowCodeEngine（阿里）等低代码方案相比，VTJ 的差异在于：

- **Amis** 是 JSON 配置驱动，偏向后端开发者；VTJ 面向 Vue 前端开发者
- **LowCodeEngine** 是协议层 + 生态，偏向平台建设；VTJ 是开箱即用的引擎 + 设计器
- VTJ 的双向代码转换在同类开源低代码引擎中较少见，大多数方案只做单向输出

**项目地址**：[https://gitee.com/newgateway/vtj](https://gitee.com/newgateway/vtj)
**官方网站**：[https://vtj.pro](https://vtj.pro)
**在线体验**：[https://app.vtj.pro](https://app.vtj.pro)

> 本文基于项目 README 和 Gitee 公开数据编写，未实际安装运行。安装命令取自官方文档。
