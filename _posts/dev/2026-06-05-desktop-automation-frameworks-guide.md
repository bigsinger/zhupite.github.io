---
layout: post
title: 开源桌面自动化框架选型指南 — 15 款工具横向对比
categories: [dev]
description: 基于 GitHub 实时数据，横向对比 15 款开源桌面自动化框架，涵盖 PyAutoGUI、Pywinauto、Airtest、Playwright、Skyvern-AI 等，按找图点击、OCR 定位、UI 树控制、AI 视觉四大路线分类，附 6 大场景选型推荐
keywords: 桌面自动化, RPA, PyAutoGUI, Airtest, Playwright, SikuliX, Skyvern-AI, AutoHotkey, 开源框架
tags:
  - 桌面自动化
  - RPA
  - Python
  - AI
  - PyAutoGUI
---

## 前言

做桌面自动化时，最头疼的问题不是"能不能实现"，而是"该选哪个框架"。

市面上的开源方案五花八门：有的只管找图点击，有的走 UI 控件树，有的靠 AI 视觉理解界面，还有的只针对浏览器。不同场景下，选错框架意味着多走很多弯路。

这篇文章基于 2026-06-05 的 GitHub 实时数据，把 15 款主流开源桌面自动化框架按技术路线分类梳理，每款给出核心能力、优势和不足，最后按场景给出选型建议。

| 路线 | 代表框架 | 核心思路 |
|------|---------|---------|
| 图像匹配型 | PyAutoGUI, SikuliX | 截图 → OpenCV 模板匹配 → 点击坐标 |
| 控件树型 | Pywinauto, Python-UIAutomation | 通过 Accessibility API 定位原生控件 |
| 综合全能型 | Airtest, TagUI, OpenRPA | 截图 + 找图 + OCR 全内置 |
| AI 视觉型 | Skyvern-AI, Self-Operating-Computer | 多模态大模型理解界面 → 行动 |
| Web 专用型 | Playwright, Puppeteer | 浏览器 DOM 定位，不碰原生桌面 |
| Windows 轻量型 | AutoHotkey, WinAppDriver | 脚本化、热键触发、后台控制 |

---

## A. 图像匹配型（基于 OpenCV 找图点击）

这类框架的核心流程是：**截图 → 在截图中用模板匹配找目标图 → 获取坐标 → 模拟点击**。适合无法获取控件句柄的场景（游戏、自绘界面、远程桌面）。

### 1️⃣ PyAutoGUI ⭐12,544

Python 生态中最流行的桌面自动化库，门槛极低，五行代码就能跑起来。

```python
import pyautogui
pos = pyautogui.locateOnScreen('button.png')
pyautogui.click(pos)
```

| 维度 | 评价 |
|------|------|
| ✅ 优势 | 纯 Python，API 简洁直观；跨平台（Win/Mac/Linux）；截图、鼠标、键盘功能齐全 |
| ❌ 不足 | 找图仅支持纯模板匹配（缩放/旋转不鲁棒）；无内置 OCR；最后更新 2024-08，维护偏慢；高 DPI 下坐标偏移需额外处理 |
| 🎯 适合 | 入门学习、简单重复点击任务、快速原型 |

### 2️⃣ SikuliX ⭐3,197

始于 MIT 实验室的老牌项目，脚本 + IDE 一体化。

| 维度 | 评价 |
|------|------|
| ✅ 优势 | Jython/Python 脚本 + 可视化 IDE；内置 Tesseract OCR；跨平台 |
| ❌ 不足 | Java 依赖较重；找图速度一般；OCR 精度受限于 Tesseract 版本；中文需额外配置 |
| 🎯 适合 | Java 技术栈团队、需要可视化区域选择的场景 |

---

## B. 控件树型（通过 UI Automation 定位元素）

不靠截图找图，而是直接通过操作系统提供的 Accessibility 树（UI Automation / MSAA）定位原生控件——**找到按钮文本 → 直接点击**，比图像匹配快且准。

### 3️⃣ Pywinauto ⭐6,055

Windows GUI 自动化的事实标准。

| 维度 | 评价 |
|------|------|
| ✅ 优势 | 支持 Win32 API + UI Automation 双后端；控件层级/文本/类名多种定位方式；Python 生态，学习成本低 |
| ❌ 不足 | 仅支持 Windows；无截图/找图/OCR（可配合 EasyOCR 补充）；自绘控件/游戏无法使用 |
| 🎯 适合 | 标准 Windows 桌面应用自动化（WinForms/WPF/Qt/MFC） |

### 4️⃣ Python-UIAutomation-for-Windows ⭐3,501

专注通过 Microsoft UI Automation API 获取控件信息。

| 维度 | 评价 |
|------|------|
| ✅ 优势 | 对 WPF/Qt 控件支持优于 Pywinauto；纯控件属性定位，速度极快 |
| ❌ 不足 | 仅支持 Windows；自绘界面不可用；社区相对较小 |
| 🎯 适合 | 需要精确控件定位的 Windows 应用自动化 |

---

## C. 综合全能型（截图 + 找图 + OCR 全内置）

### 5️⃣ Airtest ⭐≈8,500

网易出品的自动化测试框架，国内最流行。

| 维度 | 评价 |
|------|------|
| ✅ 优势 | 内置 OpenCV 模板匹配 + 特征点匹配（SIFT/ORB）；内置 PaddleOCR（中文极佳）；有 AirtestIDE；支持 Windows + Android + iOS |
| ❌ 不足 | 偏向移动端/游戏测试场景；纯桌面应用场景稍显笨重 |
| 🎯 适合 | 需要找图 + OCR + 跨平台的 Python 项目；移动端/游戏自动化 |

### 6️⃣ TagUI ⭐≈6,000

全功能 RPA 框架，支持 Web + 桌面混合自动化。

| 维度 | 评价 |
|------|------|
| ✅ 优势 | JS/Python 双语言；内置 Tesseract OCR + OpenCV 找图；脚本语法简洁；跨平台 |
| ❌ 不足 | 项目维护不活跃，社区较小；功能全面但深度有限 |
| 🎯 适合 | 简单的 Web + 桌面混合 RPA 脚本场景 |

### 7️⃣ OpenRPA ⭐≈1,800

完整的企业级 RPA 框架。

| 维度 | 评价 |
|------|------|
| ✅ 优势 | C# .NET 生态；图形化工作流设计器；截图 + 图像匹配 + OCR 全功能 |
| ❌ 不足 | 仅支持 Windows；重量级，学习曲线陡；AGPL-3.0 许可证对商用不友好 |
| 🎯 适合 | 需要图形化工作流的 Windows 企业 RPA 场景 |

---

## D. AI 视觉型（用大模型理解界面）

2024-2025 年兴起的新路线。不依赖固定模板图片，而是用多模态 AI 模型理解屏幕内容并决定操作——对界面变化极鲁棒，但速度慢、有 API 成本。

### 8️⃣ Skyvern-AI ⭐21,829

AI 驱动自动化框架的明星项目。

| 维度 | 评价 |
|------|------|
| ✅ 优势 | 多模态 AI 视觉理解界面元素 → 自动操作；自然语言驱动；对复杂/动态界面鲁棒性极强 |
| ❌ 不足 | 需要调用 AI 模型，速度慢；有 API 成本；不适合高频简单点击 |
| 🎯 适合 | 复杂 Web 界面、频繁改版的系统、传统模板匹配搞不定的场景 |

### 9️⃣ Self-Operating-Computer ⭐10,248

完全由 AI 驱动的桌面操作框架。

| 维度 | 评价 |
|------|------|
| ✅ 优势 | 输入自然语言指令即可；速度快于 Skyvern；跨平台 |
| ❌ 不足 | 依赖 GPT-4V/Claude 等付费 API；执行稳定性受限于 AI 模型能力 |
| 🎯 适合 | 实验性 AI 自动化项目、需要快速概念验证的场景 |

---

## E. Web 浏览器专用型

如果目标应用是 Web 页面或 Electron 套壳应用，**不要用桌面自动化框架**，浏览器自动化才是正确路线。

### 🔟 Playwright ⭐≈70,000+

Web 自动化王者。

| 维度 | 评价 |
|------|------|
| ✅ 优势 | 支持 Chromium/Firefox/WebKit；自动等待机制；截图 + DOM 定位 + 键盘鼠标；TypeScript/Python/Java/C# 多重语言 |
| ❌ 不足 | 仅限 Web 页面，不能控制原生桌面应用；无内置图像匹配/OCR |
| 🎯 适合 | Web 应用 / Electron 应用自动化（首选） |

### 1️⃣1️⃣ Puppeteer ⭐≈90,000+

Playwright 的前辈。

| 维度 | 评价 |
|------|------|
| ✅ 优势 | 生态成熟，文档丰富 |
| ❌ 不足 | 仅支持 Chromium；功能已被 Playwright 超越 |
| 🎯 适合 | Chromium-only 场景，或已有 Puppeteer 投入的项目 |

---

## F. Windows 轻量辅助型

### 1️⃣2️⃣ AutoHotkey v2 ⭐≈4,500

Windows 自动化的瑞士军刀。

| 维度 | 评价 |
|------|------|
| ✅ 优势 | 零依赖、即写即用、资源占用极低；热键/热字符串触发；ImageSearch 找图；支持后台 ControlClick |
| ❌ 不足 | 仅限 Windows；ImageSearch 精度有限；无内置 OCR |
| 🎯 适合 | 日常办公自动化快捷键、简单重复点击、游戏辅助 |

### 1️⃣3️⃣ WinAppDriver ⭐≈3,700

Microsoft 官方维护的 Windows 自动化驱动（已停止更新）。

| 维度 | 评价 |
|------|------|
| ✅ 优势 | 通过 Appium 协议控制 UWP/WinForms/WPF |
| ❌ 不足 | 微软已停止更新，推荐转向 Appium Windows Driver |
| 🎯 适合 | 已有 Appium 体系的团队做 Windows 端测试 |

---

## 一句话选型指南

| 你的需求 | 首选框架 |
|---------|---------|
| Python + 跨平台 + 找图 + OCR | **Airtest** |
| Python 简单入门 | **PyAutoGUI** |
| Windows 原生桌面应用（非自绘） | **Pywinauto** |
| Web / Electron 应用 | **Playwright** |
| Windows 轻量脚本 + 热键 | **AutoHotkey** |
| 复杂界面 / AI 驱动 | **Skyvern-AI** |
| Java 技术栈 | **SikuliX** |
| 企业级图形化 RPA | **OpenRPA** |

---

## 技术栈速查

| 编程语言 | 推荐框架 |
|---------|---------|
| Python | PyAutoGUI, Pywinauto, Airtest, Python-UIAutomation |
| TypeScript/JS | Playwright, Puppeteer |
| Java | SikuliX |
| C# (.NET) | WinAppDriver, OpenRPA |
| 自定义脚本 | AutoHotkey |

---

## 几点补充

1. **纯图像匹配有天花板**：OpenCV 的 `matchTemplate` 对缩放/旋转/颜色变化敏感。高精度场景推荐 Airtest 的 SIFT/ORB 特征匹配或 AI 视觉方案。
2. **OCR 怎么选**：中文场景选 PaddleOCR，多语言均衡选 EasyOCR，通用成熟选 Tesseract。
3. **DPI 缩放坑**：Windows 高 DPI（150%/200%）会导致截图坐标偏移。Pywinauto 走 UI Automation 不受影响，PyAutoGUI 需要手动校准。
4. **macOS 权限**：截图和辅助功能需要系统授权；Linux 需 X11 或 Wayland 兼容层。

> 以上数据均基于 2026-06-05 GitHub 实时搜索结果，后续各项目的 star 数和版本可能会更新。
