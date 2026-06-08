---
layout: post
title: "DriverStore Explorer（RAPR）：Windows 驱动存储管理神器，10,000+ Stars"
categories: [tool]
description: "Windows 驱动存储（DriverStore）管理工具，支持查看/添加/删除/导出驱动包，智能清理旧版本驱动，支持 DISM/PnPUtil 多后端，在线/离线映像操作。"
keywords: DriverStore Explorer, RAPR, 驱动管理, Windows, 驱动清理, 驱动存储, 系统工具, C#
tags:
  - DriverStore Explorer
  - RAPR
  - Windows
  - 驱动管理
  - 系统工具
  - 清理工具
---

# DriverStore Explorer（RAPR）：Windows 驱动存储管理神器，10,000+ Stars

## 项目概览

**DriverStore Explorer（又名 RAPR）** 是一款 Windows 驱动存储（DriverStore）管理工具。它面向高级用户和系统管理员，提供了 Windows 系统原生所不具备的驱动存储深度管理能力。

| 指标 | 数据 |
|------|------|
| 仓库 | https://github.com/lostindark/DriverStoreExplorer |
| Stars | **10,876** |
| Forks | 538 |
| 编程语言 | C# |
| 协议 | GPL-2.0 |
| 系统要求 | Windows 7+，.NET Framework 4.7.2+ |
| 安装方式 | 绿色版 / winget |
| 多语言 | 20+ 种语言 |

---

## 一、什么是 DriverStore

**DriverStore（驱动存储）** 是 Windows 用于存放所有第三方驱动程序包的系统目录（通常位于 `C:\Windows\System32\DriverStore\FileRepository`）。

当 Windows 更新、安装新硬件、或通过 Windows Update 自动获取驱动时，驱动程序包会被**复制一份到 DriverStore**——即使硬件不再使用，驱动也不会自动删除。长期积累后，DriverStore 可能膨胀到 **10GB~30GB**。

Windows 原生没有提供可视化清理 DriverStore 的工具。「设置 → 系统 → 存储」中的清理功能效果有限。

---

## 二、核心功能

### 2.1 浏览与查看

| 功能 | 说明 |
|------|------|
| **驱动列表** | 展示所有第三方驱动包，含大小/版本/日期/发布者 |
| **关联设备** | 查看每个驱动关联的设备及其连接状态 |
| **实时搜索** | 按名称/发布者/关键词实时过滤 |
| **排序分组** | 可排序列 + 自定义分组 |
| **CSV 导出** | 导出驱动清单用于分析审计 |

### 2.2 新增与安装

| 功能 | 说明 |
|------|------|
| **添加驱动** | 将新的驱动包导入 DriverStore |
| **安装驱动** | 导入后自动安装到关联设备（可选） |

### 2.3 删除与清理

这是 DriverStore Explorer **最核心的功能**：

| 操作 | 说明 |
|------|------|
| **删除单个驱动** | 从 DriverStore 中移除指定驱动包 |
| **批量删除** | 多选驱动，一次性批量清除 |
| **强制删除** | 删除正在使用中的驱动（慎用！） |
| **智能清理** | 自动识别和选择旧版本/不使用的驱动 |
| **颜色提示** | 已用/未用/旧版本可视区分 |

### 2.4 导出与备份

| 功能 | 说明 |
|------|------|
| **导出驱动** | 将选中或全部驱动导出到指定文件夹 |
| **保留目录结构** | 按驱动包名分类组织导出文件 |

---

## 三、清理策略与风险

### 如何判断哪些驱动可以删除

| 状态 | 颜色 | 含义 | 操作建议 |
|------|------|------|---------|
| **设备存在且在使用** | 正常 | 驱动正在被使用 | ❌ 不要删除 |
| **设备不在线** | 灰色 | 设备未连接（如外接摄像头/U盘） | ✅ 可删除，重新连接设备需重装 |
| **旧版本** | 标记 | 有更新的版本替代 | ✅ 建议清理，释放空间 |

### 警告

> ⚠️ **Driver Store Explorer 修改 Windows 驱动存储。使用不当可能导致系统故障、无法启动或设备失效。删除前请备份驱动。**

---

## 四、技术架构

### 多后端支持

| 后端 | 说明 |
|------|------|
| **Windows API** | 原生 API，自动选择最优方法 |
| **DISM** | 部署映像服务和管理工具 |
| **PnPUtil** | 即插即用工具，Windows 内置 |
| **自动检测** | 程序自动选择可用的最佳后端 |

### 两种工作模式

| 模式 | 说明 |
|------|------|
| **在线模式** | 管理当前运行系统的 DriverStore |
| **离线模式** | 加载 Windows 映像文件（WIM 等），操作离线系统的驱动存储 |

离线模式是**系统管理员和 IT 运维人员**的核心需求——不需要启动 Windows，直接操作离线映像的驱动。

---

## 五、安装方式

| 方式 | 命令 / 步骤 |
|------|------------|
| **绿色版（推荐）** | 下载 ZIP 压缩包 → 解压 → 运行 `Rapr.exe` |
| **Winget 安装** | `winget install lostindark.DriverStoreExplorer` → 运行 `rapr` |
| **源码构建** | Visual Studio 2022 打开 `Rapr.sln` |

---

## 六、优劣势分析

| 优势 | 说明 |
|------|------|
| **可视化驱动存储管理** | Windows 原生不提供，这是功能最强的替代工具 |
| **智能清理** | 自动识别旧版本驱动，避免误删 |
| **批量操作** | 多选 + 进度跟踪，清理效率高 |
| **多后端支持** | Windows API / DISM / PnPUtil 自由切换 |
| **离线映像支持** | 可操作 WIM 等离线系统映像的驱动 |
| **10,000+ Stars** | 长期维护，社区信任度高 |
| **多语言界面** | 20+ 种语言，含简体中文 |

| 劣势 | 说明 |
|------|------|
| **高风险操作** | 误删关键驱动可致系统无法启动 |
| **仅限 Windows** | C# + .NET Framework，平台限制 |
| **需要管理员权限** | 标准用户无法运行 |
| **UWP 驱动管理有限** | 对 Windows Store 驱动的管理支持不足 |

---

## 七、典型应用场景

### 7.1 清理 C 盘空间

> 场景：C 盘空间告急，发现 DriverStore 占用了 15GB。

使用 DriverStore Explorer 的"Select Old Drivers"功能自动选中旧版本驱动，批量删除后释放 5-10GB 空间。

### 7.2 驱动备份

> 场景：要重装系统，担心找不到特定硬件的驱动。

用 DriverStore Explorer 导出所有第三方驱动到 U 盘，重装后通过「设备管理器」或双击 `.inf` 文件重新安装。

### 7.3 系统封装

> 场景：IT 运维需要制作一个精简版的 Windows 部署映像。

在离线模式下加载 WIM 映像，清理不需要的驱动包，减小映像体积。

### 7.4 故障排除

> 场景：更新驱动后设备工作异常。

在 DriverStore Explorer 中找到旧版本驱动，重新安装回退。

---

## 八、适合谁用

- **系统管理员 / IT 运维**——批量管理、离线映像驱动清理
- **喜欢 DIY 系统的玩家**——干净的系统从清理冗余驱动开始
- **存储空间焦虑用户**——C 盘空间不足，DriverStore 是常见的"隐形杀手"
- **系统封装 / 部署工程师**——离线裁剪驱动减少映像体积
- **电脑维修人员**——驱动问题排查和备份

---

## 总结

DriverStore Explorer 已有超过 10 年的历史（原托管在 CodePlex），至今仍然被广泛使用。它的成功得益于一个简单的事实：**Windows 用户多年来一直被 DriverStore 的膨胀所困扰，而微软一直没有提供一个好用的官方清理工具**。

在 Windows 的存储管理工具箱里，DriverStore Explorer 是不可替代的一环。10,876 Stars 就是最好的证言——它解决了一个真实且普遍的问题，并且解决得足够好。

---

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/lostindark/DriverStoreExplorer |
| Releases | https://github.com/lostindark/DriverStoreExplorer/releases |
| Winget | `winget install lostindark.DriverStoreExplorer` |
