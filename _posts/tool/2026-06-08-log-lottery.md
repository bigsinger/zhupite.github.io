---
title: log-lottery - 炫酷3D年会抽奖工具，开源免费开箱即用
description: 一款基于Three.js+Vue3构建的3D球体动态抽奖应用，支持奖品、人员、界面、图片音乐全面配置，适合年会等各类活动场景。
categories: [tool]
tags: [抽奖, 年会, Three.js, Vue3, 3D, 开源工具]
---

## log-lottery 是什么

**log-lottery** 是一个基于 Three.js + Vue 3 构建的 3D 球体动态抽奖应用，专为年会、活动抽奖场景设计。它提供了一个炫酷的 3D 球体抽奖界面，支持奖品配置、人员名单管理、界面定制、背景音乐和图片设置等丰富功能，真正做到开箱即用。

> 项目口号：🎈🎈🎈🎈 年会抽奖程序，threejs+vue3 3D球体动态抽奖应用

## 核心特性

| 特性 | 说明 |
|------|------|
| 🕍 3D 球体抽奖 | 基于 Three.js 的炫酷 3D 球体动画抽奖效果 |
| 💾 本地持久化 | 配置数据本地存储，无需后端服务 |
| 🎁 奖品配置 | 灵活的奖品奖项设置，支持多轮抽奖 |
| 👱 人员管理 | 抽奖名单设置与管理，支持 Excel 导入 |
| 🎼 背景音乐 | 播放背景音乐，烘托现场氛围 |
| 🖼️ 图片配置 | 更换背景图片，自定义界面风格 |
| 📊 Excel 导入导出 | 人员名单 Excel 导入，抽奖结果 Excel 导出 |
| 🎈 临时抽奖 | 支持增加临时抽奖环节 |
| 🧨 国际化 | 多语言支持 |
| 🚅 Docker 构建 | 支持 Docker 部署 |

## 快速上手

**在线使用（无需安装）：**
直接访问：<https://lottery.to2026.xyz/log-lottery> 或 <https://log1997.github.io/log-lottery/>

**Docker 部署：**
```bash
docker pull log1997/log-lottery
docker run -d -p 8080:80 log1997/log-lottery
```

**本地开发：**
```bash
git clone https://github.com/LOG1997/log-lottery.git
cd log-lottery
npm install
npm run dev
```

使用建议：进入网站后，若遇到图片无法显示或报错，请先到「全局配置 - 界面配置」菜单中点击「重置所有数据」按钮清除数据后更新。

## 优劣势

**优势：**
- 炫酷的 3D 球体抽奖视觉效果，现场氛围感强
- 功能高度集成：人员管理、奖品配置、音乐背景一应俱全
- 支持 Excel 导入导出，与办公流程无缝衔接
- 可 Docker 部署，运维简单
- 开源免费，MIT 协议
- 支持临时抽奖和弹幕（开发中）

**劣势：**
- 推荐使用 PC 端最新版 Chrome 或 Edge 浏览器
- 暂不支持内定功能（开发者明确声明）
- 弹幕功能仍在开发中

## 适合谁用

- 公司年会组织者
- 活动策划人员
- 需要抽奖环节的任何线下活动
- 对 3D 可视化抽奖感兴趣的前端开发者

## 项目地址

- GitHub: <https://github.com/LOG1997/log-lottery>
- 在线体验: <https://lottery.to2026.xyz/log-lottery>
- 备用地址: <https://log1997.github.io/log-lottery/>
- 仓库统计: ⭐ 3327 Stars | 🍴 786 Forks | 📜 MIT License
