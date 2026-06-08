---
layout: post
title: "Animal-Island-UI：动物森友会风格的 React 组件库"
categories: [dev]
description: "一款轻量级 React + TypeScript UI 组件库，设计灵感来自任天堂《集合啦！动物森友会》游戏界面。3,000+ Stars，MIT 开源，支持 npm 安装与 AI 无代码生成页面。"
keywords: animal-island-ui, React, UI组件库, 动物森友会, TypeScript, Nintendo风格, 前端组件
tags: [dev, open-source, React, UI组件库, TypeScript, 动物森友会, 前端开发]
---

# Animal-Island-UI：动物森友会风格的 React 组件库

## 项目介绍

**Animal-Island-UI** 是一款基于 React + TypeScript 的轻量级 UI 组件库，设计灵感来源于任天堂《集合啦！动物森友会》游戏界面。

所有视觉元素、布局、图标和动画均独立设计与实现，未直接使用任何任天堂官方美术素材、代码或资源文件。项目仅供个人前端技术练习和组件开发学习使用。

| 指标 | 数据 |
|------|------|
| 仓库 | https://github.com/guokaigdg/animal-island-ui |
| Stars | 3,135 |
| Forks | 265 |
| 编程语言 | TypeScript |
| 开源协议 | MIT |
| 创建时间 | 2026-04-12 |

此外项目还提供 **Vue 版本**：[animal-island-vue](https://github.com/guokaigdg/animal-island-vue)

---

## 核心特性

| 特性 | 说明 |
|------|------|
| **动物森友会风格** | 圆润可爱的 UI 设计，还原游戏界面的温暖质感 |
| **React + TypeScript** | 类型安全，IDE 智能提示完善 |
| **一键安装** | `npm install animal-island-ui` 即可使用 |
| **AI 无代码生成** | 提供 PROMPT.md，粘贴到 Cursor/Claude/ChatGPT 即可让 AI 生成页面 |
| **Vue 版本同步** | 同一设计系统同时支持 React 和 Vue |
| **生态丰富** | 已被多款第三方项目集成（博客、新标签页、Android UI、Flutter UI 等） |

---

## 快速上手

```bash
npm install animal-island-ui
```

> ⚠️ **重要**：必须引入样式，否则组件无样式无字体。

```tsx
import { Button, Card } from 'animal-island-ui';
import 'animal-island-ui/style';

function App() {
    return (
        <div>
            <Button type="primary">Start Adventure</Button>
            <Card color="app-blue">
                Welcome to the deserted island!
            </Card>
        </div>
    );
}
```

---

## AI 无代码生成页面（4 步完成）

项目内置的 `PROMPT.md` 让非开发者也能快速生成风格页面：

1. 复制 `PROMPT.md` 全部内容
2. 粘贴到任意 AI 工具（Cursor / Claude / ChatGPT / Gemini / DeepSeek）
3. AI 会询问你要什么页面——回复一句话（如"个人博客"、"产品列表"、"FAQ"）
4. 保存返回的 `index.html`，双击预览

**无需安装 npm，无需构建，无需写代码。**

---

## 文档体系

项目提供了多份配套文档，覆盖不同使用场景：

| 文档 | 用途 |
|------|------|
| `PROMPT.md` | 🚀 非开发者一键提示词——粘贴到 AI 工具生成 Animal-Island-UI 风格的 React 页面 |
| `AI_USAGE.md` | AI 代码助手手册——所有组件的 props、types 和默认值，19 条硬规则和复制粘贴样板代码 |
| `DESIGN_PROMPT.md` | 视觉风格提示词——给 v0 / Figma AI / Midjourney / DALL-E，包括色彩、字体、尺寸、剪辑路径和禁止清单 |
| `skill/SKILL.md` | 像素级风格规范 Skill——设计 Token、所有组件 CSS、Demo 布局值、CSS 变量模板和新增组件开发清单 |
| `CONTRIBUTING.md` | 贡献指南 |

---

## 本地开发

```bash
git clone https://github.com/guokaigdg/animal-island-ui.git
cd animal-island-ui
npm install

# 启动 Demo 开发服务器
npm run dev

# 构建组件库
npm run build

# 构建 Demo 站点
npm run build:demo
```

---

## 生态应用案例

Animal-Island-UI 已被多个第三方项目集成和二次移植：

| 项目 | 说明 |
|------|------|
| [Animal Island New Tab](https://ashleycry.github.io/AnimalIslandNewTab/) | 动物森友会风格的新标签页 |
| [ac-site-template](https://github.com/yunxinz/ac-site-template) | 动物森友会主题的个人网站模板 |
| [HiKid](https://github.com/xiaochong/hi-kid) | 儿童英语学习应用 |
| [AnimalIslandUI](https://github.com/liuyuhong0324/AnimalIslandUI) | 动物森友会风格 Android UI 库 |
| [animal_island_flutter](https://github.com/ohmangocat/animal_island_flutter) | 动物森友会风格 Flutter UI 库 |
| [animal-island-blog](https://github.com/guokaigdg/animal-island-blog) | 动物森友会风格博客 |
| [Island Life Journal](https://github.com/TIUCSIB/animal-island-blog) | 岛屿生活照片日记 |

---

## 优劣势分析

| 优势 | 说明 |
|------|------|
| **风格独特** | 动物森友会的可爱 UI 风格在组件库中独树一帜，识别度高 |
| **React + Vue 双版本** | 覆盖两大主流前端框架 |
| **AI 友好** | 内置多份 AI 提示词文档，低代码/无代码用户也能上手 |
| **生态初步形成** | 已被多个第三方项目移植到 Android、Flutter 等平台 |
| **MIT 许可** | 开源友好 |

| 劣势 | 说明 |
|------|------|
| **非商业限制** | 仅供个人学习研究和非商业演示使用，禁止商业用途 |
| **尚无完整文档站** | 目前只有 README 和多份 MD 文档，缺少可交互的 Storybook 等完整文档站点 |
| **组件数量有限** | 作为个人练手项目，组件覆盖面相比 Ant Design/MUI 等成熟库仍有差距 |
| **版权敏感性** | 任天堂商标和版权所有者可能对风格模仿有意见（项目已有声明免责） |

---

## 适合谁用

- **前端开发者**——在个人项目或实验性站点中使用动物森友会风格的 UI
- **设计爱好者**——参考其设计 Token 和 CSS 实现，学习如何还原游戏界面风格
- **动物森友会玩家**——想给自己的个人网站/博客加一套游戏风格界面
- **AI 工具使用者**——通过 PROMPT.md 零代码生成漂亮的页面
- **开源贡献者**——参与组件库迭代、新增组件、翻译文档

---

## 总结

Animal-Island-UI 是一个风格独特、设计精良的 React 组件库。它将任天堂《集合啦！动物森友会》的可爱风格带到了 Web 开发中，而且通过 AI 提示词文档让非开发者也能使用。

项目同时维护 React 和 Vue 两个版本，并已被多个平台（Web / Android / Flutter）的第三方项目集成。如果你喜欢动物森友会的风格，想为自己的个人项目增添一份可爱气息，这个组件库值得一试。

---

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/guokaigdg/animal-island-ui |
| 在线预览（PC） | https://guokaigdg.github.io/animal-island-ui/ |
| npm 包 | https://www.npmjs.com/package/animal-island-ui |
| Vue 版本 | https://github.com/guokaigdg/animal-island-vue |
| 安装方式 | `npm install animal-island-ui` |
| 开源协议 | MIT |

## 参考资料

- **GitHub 仓库**：源代码、文档、Demo。→ https://github.com/guokaigdg/animal-island-ui
- **Vue 版本仓库**：同风格的 Vue 组件库。→ https://github.com/guokaigdg/animal-island-vue
- **在线 Demo**：PC 端预览。→ https://guokaigdg.github.io/animal-island-ui/
