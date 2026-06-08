---
layout: post
title: "WhatCable：macOS 菜单栏神器 —— 一眼看清你的 USB-C 线到底能干什么"
categories: [tool]
description: "macOS 菜单栏应用，用日常英语告诉你 Mac 上每根 USB-C 线的真实能力——充电功率、数据传输速率、雷电协议版本。附 CLI 命令行工具和 Homebrew 安装方式。"
keywords: WhatCable, USB-C, macOS, Thunderbolt, 充电诊断, USB-PD, 菜单栏工具, Swift
tags:
  - WhatCable
  - macOS
  - USB-C
  - Thunderbolt
  - 充电诊断
---

# WhatCable：macOS 菜单栏神器 —— 一眼看清你的 USB-C 线到底能干什么

## 项目介绍

**WhatCable** 是一款 macOS 菜单栏应用，能告诉你 Mac 上每根 USB-C 线**到底能做什么**，以及**为什么你的 Mac 可能充电慢**。

USB-C 接口外表完全一样，但内在能力天差地别——可能是 USB 2.0 充电线，也可能是 240W / 40 Gbps 的 Thunderbolt 4 线。macOS 的 IOKit 其实已经暴露了这些信息，WhatCable 只是把它们变成了**一目了然的菜单栏弹窗**。

| 指标 | 数据 |
|------|------|
| 仓库 | https://github.com/darrylmorley/whatcable |
| Stars | 5,570 |
| Forks | 169 |
| 编程语言 | Swift |
| 系统要求 | macOS 14+（Sonoma），Apple Silicon 专用 |
| 开源协议 | MIT（基础版免费） |

> WhatCable 基础版完全免费开源，还有提供额外功能的 **WhatCable Pro**（£9.99 一次性购买）。

---

## 核心功能

### 每端口一目了然

打开菜单栏，每个 USB-C 端口会显示一行**日常英语**描述：

| 状态 | 说明 |
|------|------|
| ✅ Thunderbolt / USB4 | 高速数据 + 视频 + 充电全功能 |
| ✅ USB device | 普通 USB 设备 |
| ✅ Display connected | 外接显示器 |
| ✅ Charging only | 仅充电 |
| ⚠️ Slow USB / charge-only cable | 慢速或仅充电线 |
| ⚪ Nothing connected | 端口闲置 |

### 充电诊断（最实用的功能）

当有设备插入时，会显示一个**充电诊断横幅**，明确指出瓶颈所在：

- **"Cable is limiting charging speed"** —— 线缆额定功率低于充电器，瓶颈在线上
- **"Charging at 30W (charger can do up to 96W)"** —— Mac 当前在请求低功率（如电池快满时）
- **"Charging well at 96W"** —— 充电器、线、设备完全匹配，无瓶颈
- **"Battery full, not charging"** —— 电池已满，不充电

### 数据速率诊断

用日常英语告诉你是什么在限制数据传输速度：

- "Cable is limiting data speed" —— 线缆速率低于端口和设备
- "Device runs at 10 Gbps, this is the fastest it supports" —— 设备自身限制，不是线的问题
- "Running slower than expected" —— 链路降级运行

### 线缆 e-marker 信息

显示线缆芯片中的完整信息：

- 线缆额定速度（USB 2.0、5/10/20/40/80 Gbps）
- 电流等级（3A/5A，对应 60W/100W/240W）
- e-marker 芯片供应商
- **线缆信任信号**：当 e-marker 报告的值看起来异常时（Zero vendor ID、保留位模式、未注册 VID），显示橙色警示卡

### 更多功能

| 功能 | 说明 |
|------|------|
| **充电器 PDO 列表** | 充电器广告的每个电压档位（5V/9V/12V/15V/20V…），实时高亮当前协商档位 |
| **连接的设备身份** | 供应商名称和产品类型，从 PD Discover Identity 响应解码 |
| **USB 设备列表** | 存储设备、Hub、外设在物理端口下分组显示 |
| **Thunderbolt 拓扑** | 活动中的 Thunderbolt/USB4 链路的每通道速率、代数、完整交换拓扑 |
| **线缆识别** | 如果 e-marker 指纹匹配数据库中已知线缆，显示品牌和型号 |
| **活跃传输** | USB 2 / USB 3 / Thunderbolt / DisplayPort |
| **桌面小组件** | WidgetKit 小/中/大三种尺寸，桌面实时查看 |
| **⌥-click** | 按住 Option 点击菜单栏图标，查看底层 IOKit 属性 |

### 设置选项

点击弹窗顶部的齿轮图标进入设置：

- 隐藏空端口
- 登录时启动
- 切换为普通 Dock 应用（而非菜单栏图标）
- 调整字体大小
- 显示技术详情
- **切换语言**：支持英语、简体中文、繁体中文、日语、韩语、法语、德语、西班牙语等 20 种语言
- 连接/断开线缆时通知
- 匿名贡献端口数据以改进硬件覆盖

---

## CLI 命令行工具

WhatCable 自带 `whatcable` 命令行工具，与菜单栏应用共享同一诊断引擎：

```bash
# 查看所有端口的人类可读摘要
whatcable

# 输出示例
USB-C Port 1
  ✓ Charging well at 96W
  Cable: 5A, 100W, USB4 40 Gbps
  Charger: 5V / 9V / 15V / 20V PDOs

USB-C Port 2
  ! Cable is limiting charging speed
  Cable: 3A, 60W, USB 2.0
  Device: External SSD, USB 10 Gbps

# JSON 格式输出
whatcable --json

# 持续监控（Ctrl+C 退出）
whatcable --watch

# 包含底层 IOKit 属性
whatcable --raw

# 打开预填的 GitHub Issue
whatcable --report

# Pro 版：实时功耗遥测
whatcable --monitor
```

---

## 安装方式

### 方式一：手动安装（推荐）

1. 从 [Release 页面](https://github.com/darrylmorley/whatcable/releases/latest) 下载最新 `WhatCable.zip`
2. 解压后拖 `WhatCable.app` 到 `/Applications`
3. 应用已由 Apple 签名并公证，无 Gatekeeper 警告

> 不在 Mac App Store 上架——App Sandbox 会阻止 WhatCable 所需的底层 IOKit 读取。

### 方式二：Homebrew 安装

```bash
brew tap darrylmorley/whatcable
brew install --cask whatcable
```

Homebrew 会自动安装菜单栏应用并将 `whatcable` CLI 添加到 PATH。

### 仅 CLI（无菜单栏）

```bash
brew tap darrylmorley/whatcable
brew install whatcable-cli
```

适用于纯终端环境或脚本场景。

### 手动安装后 CLI 仍可用

CLI 工具在应用包内：

```bash
ln -s /Applications/WhatCable.app/Contents/Helpers/whatcable /usr/local/bin/whatcable
```

---

## WhatCable Pro（付费解锁额外功能）

£9.99 一次性购买，支持 2 台 Mac。额外功能：

| 功能 | 说明 |
|------|------|
| **实时功耗监测** | 系统电源输入图表 |
| **协商诊断** | 端口/线缆/设备各受支持 vs 实际协商的全部分析，标出薄弱环节 |
| **显示诊断** | 读取显示器真实分辨率（5K/6K 也可），检查 DSC 压缩状态，识别 HDMI/DP 转接器 |
| **端口健康计数** | 端口的物理健康指标 |
| **线缆阻抗估算** | 线缆质量评估 |
| **引脚图与液体检测** | 物理层诊断 |

---

## 工作原理

WhatCable 读取四类 IOKit 服务，无私有 API、无辅助守护进程：

| IOKit 服务 | 提供的信息 |
|-----------|----------|
| `AppleHPMInterfaceType10/11/12`（M3系列）<br>`AppleTCControllerType10/11`（M1/M2） | 每端口状态：连接、传输、插头方向、e-marker 存在 |
| `IOPortFeaturePowerSource` | 充电器完整的 PDO 列表 + 当前活跃 PDO |
| `IOPortTransportComponentCCUSBPDSOP` / `SOPp` / `SOPpp` | PD Discover Identity VDO |
| XHCI controller 子树 | USB 设备 → 物理端口的映射 |

线缆速率和功率解码遵循 **USB Power Delivery 规范（USB-PD R3.2 V1.2，2026 年 3 月）**。供应商名称来自捆绑的 SQLite 数据库，合并 USB-IF 官方供应商列表、社区 `usb.ids` 列表和用户贡献的线缆指纹。

---

## 从源码构建

```bash
git clone https://github.com/darrylmorley/whatcable.git
cd whatcable

swift build                   # 编译所有
swift run WhatCable           # 运行菜单栏应用（开发模式）
swift run whatcable-cli       # 运行 CLI
swift test                    # 运行测试套件
```

需要 Swift 5.9+（Xcode 15+）。

---

## 优劣势分析

| 优势 | 说明 |
|------|------|
| **极其实用** | 物理线缆无法区分能力，这个痛点每个 Mac 用户都会遇到 |
| **无私有 API** | 纯 IOKit 读取，无隐私风险 |
| **界面优雅** | 菜单栏弹窗设计精良，日常英语输出直观 |
| **CLI 配套** | 终端场景也有完整功能，脚本可集成 |
| **多语言支持** | 20 种语言，包括简体中文 |
| **社区驱动** | 线缆指纹数据库由用户贡献持续完善 |

| 劣势 | 说明 |
|------|------|
| **仅限 macOS** | 不支持 Windows/Linux（依赖 IOKit） |
| **仅 Apple Silicon** | Intel Mac 无法使用（Intel 的 Titan Ridge 控制器不暴露所需 IOKit 数据） |
| **需 macOS 14+** | 不支持 macOS Ventura 及更早版本 |
| **Pro 版收费** | 高端诊断功能需 £9.99 购买（但基础版已足够好用） |

---

## 适合谁用

- **Mac 用户** —— 你的抽屉里有多少根"看起来一毛一样"的 USB-C 线？再也不用猜了
- **IT 管理员** —— 给团队配发显示器、拓展坞和线缆时，快速验证每根线的实际能力
- **充电焦虑者** —— 搞不清为什么 Mac 充得慢，WhatCable 直接告诉你瓶颈在哪
- **硬件开发/测试工程师** —— CLI 的 JSON 输出和 Watch 模式可集成到自动化测试
- **数码爱好者** —— 对有 e-marker 芯片的线缆好奇，想了解 USB-PD 协议的细节

---

## 总结

WhatCable 解决了一个几乎每个 Mac 用户都遇到过但没人给出好方案的问题：**USB-C 线缆能力信息不透明。** 一根黑色线可能只能充电，另一根可能是 Thunderbolt 4 全功能线——外表完全一样。

WhatCable 的菜单栏弹窗设计得足够优雅，日常英语输出让非技术用户也能理解。CLI 工具则让高级用户可以深度使用。基础版完全免费且功能完整，Pro 版的功耗监测和显示诊断适合需要更深度诊断的用户。

如果你有一台 Apple Silicon Mac，**强烈推荐装上 WhatCable**，安装只需两分钟，但从此你再也不用对着抽屉里那一堆 USB-C 线发呆了。

---

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/darrylmorley/whatcable |
| 官方网站 | https://whatcable.uk |
| WhatCable Pro | https://whatcable.uk/pro |
| Release 页面 | https://github.com/darrylmorley/whatcable/releases/latest |
| Homebrew | `brew tap darrylmorley/whatcable && brew install --cask whatcable` |
| 开源协议 | MIT（基础版） |

## 参考资料

- **GitHub 仓库**：源代码、Release 下载、Issue 反馈。→ https://github.com/darrylmorley/whatcable
- **官方网站**：概览、截图、CLI 文档。→ https://whatcable.uk
- **USB-PD 规范**：USB Power Delivery R3.2 V1.2（2026 年 3 月），线缆速率和功率解码的依据。
