---
title: hanzi-writer —— 开源汉字笔画动画 JavaScript 库
description: "Hanzi Writer 是开源汉字笔画动画 JavaScript 库，基于 SVG 渲染汉字的正确笔画顺序，支持简繁体、练习测验模式，是中文教育类网站和 App 的理想选择。"
date: 2026-06-08 00:00:00 +0800
categories: [tool]
tags: [前端开发, 中文教育, 汉字, 笔画动画, SVG]
---

## 项目简介

hanzi-writer 是一个基于 SVG 渲染的开源汉字笔画顺序动画 JavaScript 库。它为中文教育类应用和网站提供了轻量、无依赖的汉字笔画演示与练习功能，是构建汉字学习工具的绝佳底层组件。

项目由 Chanind 开发并维护，经过十余年的迭代，已成为该领域最成熟的开源方案之一。

## GitHub 数据

- **仓库地址**: [chanind/hanzi-writer](https://github.com/chanind/hanzi-writer)
- **在线体验**https://hanziwriter.org/
- **License**: MIT
- **语言**: TypeScript / JavaScript
- **当前版本**: v3.7.3 (2025-09-17)
- **创建时间**: 2014-09-14

配套数据包 [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data) 基于 makemeahanzi 项目提取的汉字笔画数据，提供了数千个常用汉字的笔顺信息。

## 核心功能

- **笔画动画播放**：按标准笔画顺序逐笔演示汉字书写，支持调速和回放
- **笔画练习测验**：用户可按照提示在屏幕上书写，系统自动比对笔画顺序和位置
- **简繁体支持**：同时覆盖简体中文和繁体中文的常用汉字
- **轻量无依赖**：纯前端实现，无需后端服务，不依赖任何第三方库
- **高度可定制**：提供丰富的配置选项，可自定义笔触颜色、背景样式、动画速度等

## 技术栈

| 技术 | 用途 |
|------|------|
| TypeScript | 主要开发语言，提供类型安全 |
| SVG | 渲染引擎，利用矢量图形实现高保真笔画渲染 |
| HTML5 Canvas | 可选渲染模式备选 |

hanzi-writer 不依赖任何第三方 JavaScript 框架，可直接嵌入任何前端项目。

## 使用方式 / 安装

### NPM 安装

```bash
npm install hanzi-writer
```

### CDN 引入

```html
<script src="https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.3/dist/hanzi-writer.min.js"></script>
```

### 基本用法

```javascript
const writer = HanziWriter.create('target-div', '永', {
  width: 400,
  height: 400,
  padding: 5,
});
writer.animateCharacter();
```

只需几行代码即可在指定 DOM 容器中渲染汉字并播放笔画动画。配套的 `hanzi-writer-data` 数据包会自动加载汉字的笔画信息。

## 适用场景

- **中文教育 App 和网站**：作为识字、写字模块的核心组件
- **对外汉语教学平台**：帮助非母语学习者掌握汉字书写顺序
- **电子词典应用**：在查字结果中嵌入笔画动画，增强学习体验
- **儿童教育产品**：结合游戏化设计，让学写字变得有趣

## 竞品对比

| 项目 | 类型 | License | 优势 | 劣势 |
|------|------|---------|------|------|
| **hanzi-writer** | 开源 | MIT | 免费、轻量、无依赖、可定制 | 需自行集成 |
| **Skritter** | 商业 | 闭源 | 完整学习体系、Spaced Repetition | 付费、不对外集成 |
| **Chinese Writer** | 商业 | 闭源 | 游戏化学习体验 | 付费、功能固定 |

Skritter 和 Chinese Writer 都是成熟的商业产品，但作为可嵌入的开源组件，hanzi-writer 在灵活性和成本方面具有明显优势。

## 项目展望

随着中文学习需求的全球化增长，hanzi-writer 作为该领域最成熟的开源方案，未来可探索的方向包括：集成 AI 手写识别以提供更智能的笔画纠错、支持更多字体风格的笔画渲染、以及为儿童教育场景优化的游戏化交互模式。其 MIT 许可也为商业集成提供了极大的便利。

## 社区与生态

hanzi-writer 拥有活跃的社区生态。其配套的 hanzi-writer-data 数据包已经覆盖了数千常用汉字的笔画信息，社区也贡献了多种语言的集成示例，包括 React、Vue、Angular 等前端框架的封装组件。

对于教育类产品的开发者来说，hanzi-writer 不仅是一个工具库，更是一个可扩展的学习平台底座。结合 TTS（文字转语音）和 AI 手写识别，可以构建完整的『听-写-评』学习闭环。

## 参考资料

- [hanzi-writer 官方文档](https://chanind.github.io/hanzi-writer/)
- [hanzi-writer-data 数据包](https://github.com/chanind/hanzi-writer-data)
- [makemeahanzi 项目](https://github.com/skishore/makemeahanzi)
- [GitHub 仓库](https://github.com/chanind/hanzi-writer)
