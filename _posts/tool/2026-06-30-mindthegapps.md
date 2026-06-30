---
layout: post
title: "MindTheGapps：LineageOS 官方推荐的 Google 服务安装包"
categories: [tool]
description: "介绍 MindTheGapps 项目——为 LineageOS 等第三方 ROM 提供 Google 服务的安装包方案，包括仓库结构、获取方式和构建方法。"
tags:
  - LineageOS
  - GApps
  - Android
  - 开源工具
---

MindTheGapps 是为 LineageOS 等自定义 Android ROM 提供 Google 服务（GApps）的安装包项目。它与 LineageOS 的关系，类似于当年的 OpenGApps——但作为**官方推荐**方案，LineageOS 的安装指引中直接链接到 MindTheGapps 的下载地址。

## 项目从哪里来

MindTheGapps 最早由 LineageOS 核心开发者 mikeioannina 命名，源代码托管在 **GitLab**：

- [MindTheGapps/vendor_gapps](https://gitlab.com/MindTheGapps/vendor_gapps) — 手机/平板版 GApps 源码（103 Stars, 133 Forks）
- [MindTheGapps/vendor_gapps_tv](https://gitlab.com/MindTheGapps/vendor_gapps_tv) — Android TV 版 GApps 源码（6 Stars, 14 Forks）

**GitHub** 上的 [MindTheGapps 组织](https://github.com/orgs/MindTheGapps/repositories) 现已声明「Moved to GitLab」，GitHub 上保留了 30 个预编译的 ZIP 发布包仓库，覆盖 Android 9 到 Android 16（LineageOS 16 到 22）的各版本和架构。

## 分支命名：Android 甜品代号

GitLab 仓库的分支名直接使用 Android 内部分支代号，一眼可看出对应版本：

| 分支 | Android 版本 | LineageOS 版本 |
|------|-------------|---------------|
| `vic` | Android 15 | LineageOS 22 |
| `upsilon` | Android 14 | LineageOS 21 |
| `tau` | Android 13 | LineageOS 20 |
| `sigma` | Android 12 | LineageOS 19 |
| `rho` | Android 11 | LineageOS 18 |
| `qoppa` | Android 10 | LineageOS 17 |
| `pi` | Android 9 | LineageOS 16 |

当前默认分支为 **`baklava`**（Android 16/Baklava），另有 `cinnamonbun` 分支对应 Android 17。

## 支持哪些设备和架构

MindTheGapps 为以下架构提供安装包：

- **arm**（32 位 ARM）
- **arm64**（64 位 ARM）
- **x86**（32 位 Intel/AMD）
- **x86_64**（64 位 Intel/AMD）

以及 Android TV 专用包（带 `-ATV` 后缀）。

从 GitHub 发布的仓库来看，当前可用的预编译包覆盖了从 Android 9（LineageOS 16）到 Android 16（LineageOS 22）的完整版本矩阵，每个版本下都对应 `arm`、`arm64`、`arm64-ATV`、`arm-ATV` 等组合。

## 与 OpenGApps 的关系

MindTheGapps 是从 OpenGApps 之后成长起来的主流 GApps 选项。二者的核心差异在于：

- **OpenGApps** 提供更细化的「尺寸选择」（pico/nano/mini/full/stock），用户按需选择
- **MindTheGapps** 保持「大一统」风格——每版本一个包，包含完整的 Google 服务框架

对于 LineageOS 用户，下载页面直接建议使用 MindTheGapps 而非 OpenGApps，因为其安装脚本对 LineageOS 的分区布局做了针对性适配。

## 获取方式

### 下载预编译包

从 GitHub [MindTheGapps 组织](https://github.com/orgs/MindTheGapps/repositories) 找到对应 Android 版本和架构的仓库，进入 **Releases** 页面下载 ZIP 包。例如：

- `16.0.0-arm64` — Android 13 arm64
- `15.0.0-arm64` — Android 12 arm64
- `14.0.0-arm64` — Android 11 arm64

### 自行编译（从 GitLab 源码）

如需从源码构建，使用 GNU Make：

```bash
# 清理输出目录
make distclean

# 编译 arm 版
make gapps_arm

# 编译 arm64 版
make gapps_arm64

# 编译 x86_64 版
make gapps_x86_64

# TV 版同理，使用 gapps_tv_arm / gapps_tv_arm64
```

编译产物为已签名的可刷入 ZIP 包，可直接通过 Recovery（如 TWRP）刷入。

### 集成到 LineageOS 构建

如果自己编译 LineageOS，也可以将 MindTheGapps 直接内联到 ROM 中：

1. 将仓库同步到源码目录下的指定路径（如 `vendor/gapps`）
2. 在设备的 `device.mk` 中 `include $GAPPS_PATH/$ARCH/$ARCH-vendor.mk`

## 许可证

源码部分采用 **GPL v2**，其中预编译的 Google 专有文件（`arm/arm64/common/x86/x86_64/proprietary` 下的 APK/SO）为闭源文件，归 Google 所有，保留在仓库中仅为了方便用户打包。

## 限制与注意

- **不兼容所有 ROM**：MindTheGapps 主要面向 LineageOS 及 AOSP 系 ROM，其他非原生 Android 系统可能不兼容
- **非 Google 认证**：包内的应用不包含 Google Play Protect 认证，个别应用可能因 SafetyNet/Play Integrity 检测失败而无法运行（可借助 Magisk + Zygisk 模块绕过）
- **刷入后不可降级**：GApps 安装后不可随意删除，建议刷机前先备份数据
- **不是 MicroG**：如果只需登录 Play 服务但不依赖闭源组件，MicroG 是替代方向，但兼容性和功能覆盖不如完整 GApps
- **无分体包**：目前只有「全量包」选项，无法像 OpenGApps 那样只安装 pico/nano 最小集

## 参考资料

- MindTheGapps GitLab 主仓库：<https://gitlab.com/MindTheGapps/vendor_gapps>
- MindTheGapps GitLab TV 仓库：<https://gitlab.com/MindTheGapps/vendor_gapps_tv>
- GitHub 发布包仓库：<https://github.com/orgs/MindTheGapps/repositories>
- LineageOS 安装指引（内置 GApps 来源推荐）：<https://lineageos.org/>
