---
title: VirtualApp — Android 虚拟化引擎，应用多开与沙箱
categories: [sec, android]
tags: [virtualapp, android-virtualization, app-cloning, sandbox, lody]
---

## 项目简介

**VirtualApp** 是一款 Android 虚拟化引擎，可以在手机内部创建一个独立的虚拟空间，在此空间中运行其他 App 而无需修改系统和手机。它被广泛应用于**应用多开、双开微信/QQ、安全沙箱、企业 MDM** 等场景。

该项目由 Lody（中国知名逆向工程师）开发，社区版开源（GPL-3.0），商业版需授权。GitHub 仓库位于 [github.com/asLody/VirtualApp](https://github.com/asLody/VirtualApp)，是中国安全社区最具影响力的 Android 开源项目之一。

## GitHub 数据

| 指标 | 数据 |
|------|------|
| Stars | 10,993 |
| License | GPL-3.0（个人）/ 商业授权（企业） |
| 主要语言 | Java / C++ |
| 商业版最新版本 | v14（2026-06） |
| 创建时间 | 2015 年 |

## 核心功能

- **应用多开**：同时运行多个相同 App 实例（如双开微信）
- **沙箱隔离**：虚拟空间内的 App 与真实系统隔离
- **Intent 劫持**：拦截并修改虚拟空间中的 Activity 启动
- **组件管理**：动态管理四大组件（Activity / Service / BroadcastReceiver / ContentProvider）
- **权限管理**：控制虚拟 App 对真实权限的访问
- **数据隔离**：每个虚拟 App 拥有独立的文件系统与数据目录
- **插件化架构**：支持动态加载插件模块
- **Binder 通信模拟**：模拟 Android 系统服务的 Binder 调用

## 技术栈

| 层次 | 技术 |
|------|------|
| Android Framework 层 | Java（重写系统服务逻辑） |
| Native 层 | C++（系统调用拦截） |
| 核心机制 | Android 系统服务 Hook + Binder 模拟 |

## 安装与使用

**社区版编译：**

```bash
git clone https://github.com/asLody/VirtualApp.git
# 使用 Android Studio 打开项目
# 构建并安装到设备（需要 Android 5.0+）
```

**基本使用：**

1. 安装 VirtualApp 并打开
2. 点击「添加应用」，从列表中选择需要克隆的应用
3. 在虚拟空间内运行克隆后的应用
4. 可为每个虚拟应用独立设置权限策略

## 适用场景

- 多开社交账号（微信、QQ、WhatsApp）
- 安全沙箱（隔离运行可疑应用）
- 企业移动设备管理（MDM）
- 安全测试与 App 行为分析
- 游戏多开（部分游戏限制多开需特殊处理）

## 竞品对比

| 竞品 | 类型 | 优势 | 局限 |
|------|------|------|------|
| **平行空间（Parallel Space）** | 商业闭源 | 界面友好、用户量大 | 闭源、功能受限制 |
| **太极 / VirtualXposed** | 开源 | 结合 Xposed 框架 | 本质是 Xposed 框架，非多开引擎 |
| **Android for Work（工作资料）** | 谷歌官方 | 系统级隔离、安全 | 仅限企业场景、功能受限 |

**核心优势：**
- 开源自选：社区版 GPL-3.0 可自由使用和修改
- 架构成熟：自 2015 年起持续迭代，商业版已验证数百台设备
- 作者实力：Lody 是国内 Android 逆向和系统安全领域的顶级开发者

## 参考资料

- GitHub 仓库：[https://github.com/asLody/VirtualApp](https://github.com/asLody/VirtualApp)
- 商业版官网：[https://www.virtual-app.com/](https://www.virtual-app.com/)
- Lody 的其他作品：[https://github.com/asLody](https://github.com/asLody)
- 相关文章：Android 插件化与虚拟化技术解析
