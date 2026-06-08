---
layout: post
title: "WSL Dashboard：轻量高性能的 WSL 实例管理 GUI 工具"
categories: [tool]
description: "基于 Rust + Slint 构建的现代 WSL 管理界面。支持实例启停、端口转发、HTTP 代理、USB 设备管理、多语言（29种语言）。内存占用仅 ~10MB，单文件便携运行。"
keywords: WSL Dashboard, WSL管理, WSL2, Linux子系统, Rust, Slint, 端口转发, 系统托盘
tags: [tool, open-source, WSL, WSL2, Rust, Windows, 系统管理]
---

# WSL Dashboard：轻量高性能的 WSL 实例管理 GUI 工具

## 项目介绍

**WSL Dashboard** 是一款现代化的 WSL（Windows Subsystem for Linux）实例管理图形界面。基于 **Rust + Slint** 构建，提供高性能、低内存占用的原生体验。

如果你同时管理多个 WSL 发行版（Ubuntu、Debian、Alpine 等），WSL Dashboard 可以替代命令行操作，通过直观的 GUI 完成所有管理任务。

| 指标 | 数据 |
|------|------|
| 仓库 | https://github.com/owu/wsl-dashboard |
| Stars | 2,594 |
| Forks | 133 |
| 编程语言 | Rust |
| UI 框架 | Slint |
| 开源协议 | GPL-3.0 |
| 创建时间 | 2026-01-18 |

---

## 核心功能

### 实例管理

| 功能 | 说明 |
|------|------|
| **一键启停** | 启动、停止、强制终止、注销 WSL 实例 |
| **实时状态监控** | 查看磁盘使用情况和文件位置 |
| **设为默认** | 将指定实例设置为 WSL 默认发行版 |
| **迁移 (Move VHDX)** | 将实例的虚拟磁盘迁移到其他驱动器 |
| **导出/克隆** | 导出为 `.tar` 或 `.tar.gz` 归档文件 |

### 快速集成

- **一键启动**到 Terminal、VS Code 或文件资源管理器
- 可自定义工作目录
- 支持启动脚本钩子

### 智能安装

| 安装来源 | 说明 |
|---------|------|
| Microsoft Store | 从商店安装官方发行版 |
| GitHub Releases | 下载社区发行版 |
| 本地文件 | 安装 RootFS/VHDX 文件 |
| 内置 RootFS 下载 | 从应用内直接下载并安装 |

### 网络管理

- **端口转发管理**：自动创建防火墙规则
- **全局 HTTP 代理**：统一代理配置

### USB 设备管理

与 `usbipd-win` 集成，通过 Dashboard UI 管理 USB 设备：

- 绑定本地 USB 设备
- 附加/分离到 WSL 实例
- 跨实例共享

---

## 性能表现

WSL Dashboard 最突出的特点之一是其极低的内存占用：

| 模式 | 内存占用 |
|------|---------|
| 系统托盘（静默模式） | **~10MB** |
| 窗口模式（标准语言） | **~18MB** |
| 窗口模式（大字体语言如中日韩） | **~38MB** |

这是同类工具中几乎无法企及的效率——对比 Electron 构建的同类应用动辄 200MB+ 的内存占用。

---

## 界面特性

- **暗色/亮色模式切换**
- **Skia 驱动的高性能渲染**
- 平滑动画和现代化 UI
- **29 种语言支持**
- **系统托盘集成**：双击显示/隐藏，右键菜单完整功能
- **智能启动**：配置开机自启、静默启动到托盘（`/silent` 参数）

### 语言支持

英语、简体中文、繁体中文、印地语、西班牙语、法语、阿拉伯语、孟加拉语、葡萄牙语、俄语、乌尔都语、印尼语、德语、日语、土耳其语、韩语、意大利语、荷兰语、瑞典语、捷克语、希腊语、匈牙利语、希伯来语、挪威语、丹麦语、芬兰语、斯洛伐克语、斯洛文尼亚语、冰岛语。

---

## 设置选项

通过 Dashboard 的设置界面可配置：

- 默认 WSL 安装目录
- 日志目录和日志级别（Error/Warn/Info/Debug/Trace）
- 界面语言（跟随系统或手动选择）
- 暗色模式
- 操作后是否自动关机 WSL
- 更新检查频率（每日/每周/双周/每月）
- 开机自启（自动修复路径）
- 启动时最小化到托盘
- 关闭按钮行为（退出/最小化到托盘）
- 侧边栏标签自定义显示

---

## 系统要求

- Windows 10 或 Windows 11（已启用 WSL，推荐 WSL 2）
- 至少安装了一个 WSL 发行版
- 64 位 CPU，推荐 4GB 内存以上

---

## 安装方法

### 方式一：下载预编译二进制（推荐）

1. 访问 [GitHub Releases](https://github.com/owu/wsl-dashboard/releases) 页面
2. 下载最新 `wsldashboard` Windows 可执行文件
3. 解压后运行 `wsldashboard.exe`

**无需安装，单文件便携运行。**

### 方式二：从源码构建

```bash
git clone https://github.com/owu/wsl-dashboard.git
cd wsl-dashboard
cargo run --release
```

需要 Rust 1.92+ 和 Cargo。

---

## 优劣势分析

| 优势 | 说明 |
|------|------|
| **极致低内存** | ~10MB 系统托盘占用，对比同类 Electron 工具优势巨大 |
| **Rust + Slint 原生** | 性能远超 Electron 方案，启动即用 |
| **功能全面** | 实例管理、网络、USB、安装、迁移一应俱全 |
| **多语言支持** | 29 种语言，覆盖全球主要用户群 |
| **单文件便携** | 下载即用，无需安装器 |
| **暗色模式** | 现代化 UI 风格 |

| 劣势 | 说明 |
|------|------|
| **仅限 Windows** | 定位明确——管理 WSL，必须在 Windows 上运行 |
| **项目较新** | 2,500+ Stars，社区仍需时间成熟 |
| **无 Microsoft Store 分发** | 只有 GitHub Releases 下载（README 已警告 Store 上有山寨版） |

---

## 适合谁用

- **WSL 多发行版用户**——同时管理 Ubuntu、Debian、Alpine 等多个实例
- **开发者**——经常在 WSL 中开发，需要快速启动/停止实例
- **网络配置需求者**——需要管理端口转发和 HTTP 代理的 WSL 用户
- **USB 设备共享需求者**——需要在 WSL 中使用 USB 设备
- **对系统资源敏感的用户**——反感 Electron 应用的高内存占用

---

## 总结

WSL Dashboard 是目前 WSL 管理工具中的一股清流——**Rust + Slint 构建**带来的性能优势是 Electron 方案无法比拟的。~10MB 的托盘内存占用、完整的实例管理功能、网络和 USB 管理能力，让它在同类工具中脱颖而出。

如果你使用 WSL 2 并经常与多个发行版打交道，WSL Dashboard 可以显著提升你的管理效率。下载即用、无需安装的设计也让部署变得极其简单。

---

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/owu/wsl-dashboard |
| Release 页面 | https://github.com/owu/wsl-dashboard/releases |
| 开源协议 | GPL-3.0 |

## 参考资料

- **GitHub 仓库**：源代码、Release 下载、Issues。→ https://github.com/owu/wsl-dashboard
- **HelloGitHub 推荐**：被 HelloGitHub 收录推荐。→ https://hellogithub.com/repository/owu/wsl-dashboard
