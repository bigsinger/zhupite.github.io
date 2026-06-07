---
layout: post
title: "OpenToonz：从吉卜力工作室走出的开源 2D 动画制作软件"
categories: [tool]
description: "OpenToonz 是一款基于 Studio Ghibli 定制版 Toonz 的开源 2D 动画制作软件。本文介绍其历史渊源、核心技术架构与特色功能，以及 2026 年最新版本动态。"
tags:
  - OpenToonz
  - 开源软件
  - 动画制作
  - Studio Ghibli
  - 2D Animation
  - 创作工具
---

> *OpenToonz 发布 v1.7.1（2026-06-04）和 v1.8.0rc（2026-05-29），距上一个稳定版 v1.6.0（2022）已过去四年，新版在 macOS 和 Windows 端均有重要更新。*

---

## 一、一段非同寻常的软件史

在开源软件的世界里，很少有项目拥有像 OpenToonz 这样的血统——它不仅是制作了《千与千寻》《幽灵公主》《哈尔的移动城堡》的 **吉卜力工作室** 的核心生产工具，而且它的历史可以追溯到 1990 年代意大利 Digital Video 公司开发的商业动画软件 Toonz。

三个关键节点：

| 时间 | 事件 |
|------|------|
| **1990s** | Digital Video 开发 Toonz，成为欧洲专业的 2D 动画生产工具 |
| **2001** | 吉卜力在《千与千寻》制作中首次大规模使用 Toonz 的线拍和上色流程 |
| **2008~2014** | 吉卜力内部深度定制 Toonz，形成 Studio Ghibli Version，用于《阿丽埃蒂》《起风了》等全部后续作品 |
| **2016.03** | DWANGO 与 Digital Video、吉卜力合作，将 Toonz Studio Ghibli Version 开源为 **OpenToonz**，采用 Modified BSD License |

从商业软件到开源项目，OpenToonz 的 30 年演化是动画工业史的一个独特切片——它不是由技术公司创造的开源软件，而是**从一个工作室的内部生产工具生长出来的开源项目**。

---

## 二、技术架构概览

OpenToonz 采用 **C++** 编写，核心渲染引擎基于 **OpenGL**。项目结构大致分为以下几个模块：

```
opentoonz/
├── toonz/sources/         ← 核心源码（C++）
│   ├── image/             图像处理引擎
│   ├── toonzlib/          动画数据模型
│   ├── stopmotion/        逐格动画支持
│   └── tnzcore/           基础工具库
├── toonz/plugins/         ← 插件系统（Fx SDK）
├── thirdparty/            ← 第三方依赖（Qt、OpenCV、libjpeg 等）
├── stuff/                 ← 资源文件（画笔预设、样式表）
└── doc/                   构建说明
```

### 渲染管线

OpenToonz 的渲染管线采用 **节点图（Node Graph）** 方式组织。每一帧画面从输入图像开始，经过一系列处理节点（颜色校正、合成、特效等）后输出最终画面。这种方式与 Maya 的 Hypershade 或 Blender 的 Shader Editor 类似，但专门为 2D 动画工作流设计：

```
[扫描原画] → [清稿/上色] → [合成层] → [特效节点] → [输出]
     ↓            ↓            ↓
   GTS扫描     调色板     xsheet/时间轴
```

关键优势在于：**节点的输出是分辨率独立的**。OpenToonz 支持以 **dpi 感知的真实比例** 处理图像，这意味着 4K 甚至 8K 的制作流程不需要额外适配。

### 数据模型

与主流的逐帧绘制不同，OpenToonz 的核心数据模型围绕 **xsheet（曝光表）** 构建——这是传统动画工业中用于记录每一帧胶转数、层序和拍摄指令的表格。xsheet 模型天然适用于 "原画→中间画→上色→摄影" 的传统管线：

- **Level（层）**：一组序列帧，可以是扫描图、矢量图或合成结果
- **Xsheet（曝光表）**：时间维度的层编排，每行对应一帧
- **Column（列）**：垂直方向的层叠加顺序
- **Camera Stand（摄影台）**：控制每层的平移、旋转和缩放

---

## 三、核心技术特色

### 3.1 GTS——吉卜力开发的专用扫描工具

GTS（Ghibli Toonz Scanner）是 OpenToonz 最具特色的工具之一。它专门针对动画制作的扫描需求设计：

- 支持 **4 种扫描模式**：黑白/彩色/二值化/非二值化
- **按中间画编号自动序列扫描**——传统逐帧编号扫描效率提升数倍
- 扫描参数可保存，**重扫时可复现相同设置**
- 兼容 TWAIN 标准扫描仪
- **线条抗锯齿处理**，无需后期修正
- 调色板数据与画稿数据分离，**可临时配色预览**

GTS 是吉卜力内部多年生产实践的产物——当你在 OpenToonz 中使用 GTS 时，使用的实际上是吉卜力扫描部门的数字化工作流。

### 3.2 Fx SDK 与深度学习特效

DWANGO 为 OpenToonz 开发了一套 **Fx SDK（特效插件开发套件）**，允许开发者用 C++ 编写图像处理插件，在 OpenToonz 的节点图中作为 FX 节点使用。

最有意思的是 DWANGO 的机器学习研究团队基于此 SDK 发布的两款效果器：

- **风格迁移效果器**：利用深度学习将画面自动转换为特定艺术风格
- **陈旧光线效果器**：模拟数字时代之前经典动画作品中特有的散射光效果

这意味着学术界的图像处理研究成果能够直接以插件形式进入动画制作管线，**缩短了从研究论文到动画画面的距离**。

### 3.3 矢量与栅格混合管线

OpenToonz 同时支持 **栅格图像**（扫描稿、照片）和 **矢量图形**（Toonz Vector 格式）。矢量和栅格可以在同一合成中自由混合：

- 矢量层支持无限缩放和无损变换
- 可用彩色二值化 TGA 序列与 OpenToonz 格式互转
- 与其他工作流兼容的序列帧输出

### 3.4 两种操作界面：xsheet 与 timeline

OpenToonz 提供了两套时间轴操作界面：

- **Xsheet 模式**：传统动画工业的曝光表界面，每格显示每一帧每一层的胶转数
- **Timeline 模式**：更接近 Premiere/AE 的横轴时间线，适合数字原生用户

这个设计体现了 OpenToonz 的核心理念——**尊重传统工作流，同时拥抱数字新范式**。

---

## 四、2026 年版本动态

OpenToonz 在 2022 年发布 v1.6.0 后经历了较长的沉寂期。2026 年 5~6 月，项目突然活跃，连续发布了三个版本：

| 版本 | 日期 | 类型 | 平台 |
|------|------|------|------|
| **v1.7.0** | 2026-05-29 | 正式版 | Windows（exe 55.6MB）+ macOS（pkg 105MB） |
| **v1.7.1** | 2026-06-04 | 维护版 | Windows + macOS |
| **v1.8.0rc** | 2026-05-29 | Release Candidate | Windows（exe）+ macOS（pkg 105MB） |

主要变化集中在：

- **macOS 端重新支持 Apple Silicon（M 系列芯片）**——v1.6.0 时期需要 Rosetta 2 转译，v1.7+ 原生支持 ARM64
- **Windows 端编译器升级至 MSVC 2022**——解决了在高 DPI 屏幕上的显示问题
- **Qt6 迁移**——从 Qt5 迁移至 Qt6，修复了 HiDPI 缩放和 Wayland 兼容性
- **CI/CD 升级**——GitHub Actions 全面替代旧的 AppVeyor 构建管道

对于 macOS 用户来说，v1.7 系列的最大意义是解决了 Apple Silicon 长期缺乏原生支持的痛点。OpenToonz 在 M 系列芯片上的性能有显著提升，特别是渲染预览和 GTS 扫描处理环节。

---

## 五、与同类工具对比

| 维度 | OpenToonz | Blender (Grease Pencil) | TVPaint | Toon Boom Harmony |
|------|-----------|------------------------|---------|-------------------|
| **定位** | 传统 2D 动画管线 | 3D 中的 2D 插件 | 位图动画专用 | 专业级 2D 动画套件 |
| **定价** | **免费开源** (BSD) | **免费开源** (GPL) | €1,290 | $1,320+/年 |
| **传统 xsheet** | ✅ 原生支持 | ❌ 无 | ✅ | ✅ |
| **矢量支持** | ✅ 混合 | ✅ 矢量笔刷 | ❌ 仅栅格 | ✅ |
| **扫描工具** | ✅ GTS（行业级） | ❌ | ❌ | ❌ |
| **节点合成** | ✅ | ✅ | ❌ | ✅ |
| **Fx SDK** | ✅ C++ 插件 | ✅ Python | ❌ | ❌ |
| **深度学习集成** | ✅ 内置效果器 | ✅ Custom Nodes | ❌ | ❌ |
| **学习曲线** | 中-高 | 中 | 低-中 | 高 |
| **社区规模** | 小（专精） | 极大 | 中等 | 大 |

OpenToonz 的核心竞争力不在于通用性，而在于**对传统手绘动画管线的专业化支持**——它是唯一一个内置了 TWAIN 扫描仪驱动、xsheet 原生设计、且来自吉卜力实际生产环境的开源动画软件。

---

## 六、安装与快速体验

**系统要求：**

| 平台 | 要求 |
|------|------|
| **Windows** | 7 SP1/8.1/10/11（64-bit 必需） |
| **macOS** | 10.14 Mojave+（v1.7+ 原生支持 Apple Silicon） |
| **Linux** | 需自行编译（参考 `doc/how_to_build_linux.md`） |

**安装步骤：**

```bash
# macOS
# 从 GitHub Releases 下载 .pkg 安装包
curl -OL https://github.com/opentoonz/opentoonz/releases/download/v1.7.1/OpenToonz.pkg
sudo installer -pkg OpenToonz.pkg -target /

# Windows
# 从 GitHub Releases 下载 Setup.exe，双击安装即可

# Linux（从源码编译）
git clone https://github.com/opentoonz/opentoonz.git
cd opentoonz
# 参考 doc/how_to_build_linux.md 安装依赖后：
mkdir build && cd build
cmake ..
make -j$(nproc)
```

**首次启动提示：**

OpenToonz 首次启动时会在 `~/OpenToonz/` 下创建工作区目录（`projects/`、`stuff/`、`fxs/`）。如果需要在多台机器间共享画笔预设和样式表，将 `stuff/` 目录同步即可。**首次启动时会自动下载 GTS 驱动和示例项目**，需要保持网络连接。

---

## 七、总结与展望

OpenToonz 不是那种适合所有人"装来玩玩"的软件，但它对特定人群——**传统动画专业学生、研究动画数字化管线的开发者、以及怀念吉卜力制作流程的创作者**——具有不可替代的价值。

几个值得关注的趋势：

1. **v1.8.0 正式版预计将在 2026 年下半年发布**，包含完整的 Apple Silicon 原生支持和新版 Fx SDK 文档
2. **社区翻译活跃**——项目在 Weblate 上托管多语言翻译，简体中文的覆盖度正在提升
3. **从"遗产软件"到"持续维护"的转变**——2026 年的密集发布说明项目维护者正在恢复活力，这对开源生态至关重要
4. **Fx SDK 的 AI 集成潜力**——随着更多研究团队使用 SDK 发布效果器，OpenToonz 可能成为 "动画界的 OpenCV"——一个学术成果快速落入生产环境的实验场

---

## 参考

1. *OpenToonz GitHub Repository*. https://github.com/opentoonz/opentoonz
2. *OpenToonz 官方站点*. https://opentoonz.github.io/
3. *OpenToonz User Manual*. https://opentoonz.readthedocs.io/
4. *Toonz Studio Ghibli Version 开源化公告*. DWANGO, 2016. https://dwango.co.jp/news/2016/0318.html
5. *OpenToonz Features*. https://opentoonz.github.io/e/features.html
6. *OpenToonz Documentation Repository*. https://github.com/opentoonz/opentoonz_docs
