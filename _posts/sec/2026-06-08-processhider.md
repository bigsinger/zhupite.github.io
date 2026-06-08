---
title: ProcessHider — Windows 进程隐藏/伪装工具（安全研究用）
categories: [sec]
tags: [processhider, rootkit, dkom, process-hiding, windows-kernel]
---

## 项目简介

**ProcessHider** 是一款开源的 Windows 进程隐藏/伪装工具，通过内核级技术（DKOM / 断链）从用户态和内核态隐藏指定进程。该项目由 M00nRise 开发，旨在展示 Windows 内核安全机制的局限性，**仅供安全研究和教育目的使用**。

⚠️ **重要声明：** ProcessHider 本质上是 rootkit 技术的实现，用于隐藏恶意行为。请务必在受控的实验室环境中使用，切勿用于非法用途。

GitHub 仓库位于 [github.com/M00nRise/ProcessHider](https://github.com/M00nRise/ProcessHider)。该项目自 2023 年 6 月起已停更，仅支持旧版 Windows 系统。

## GitHub 数据

| 指标 | 数据 |
|------|------|
| Stars | 749 |
| License | N/A（未明确声明） |
| 主要语言 | C++ |
| 创建时间 | 2017 年 |
| 最后更新 | 2023 年 6 月（已停更） |

## 核心功能

- **进程隐藏**：使目标进程从任务管理器、Process Explorer 等工具中消失
- **进程伪装**：将目标进程伪装成系统进程（如 svchost.exe）
- **多进程支持**：可同时隐藏/伪装多个进程
- **黑名单机制**：通过配置文件指定需要隐藏的进程名

### 实现原理

- **断链技术（EPROCESS）**：从内核的进程链表（ActiveProcessLinks）中摘除目标进程的 EPROCESS 节点
- **DKOM（Direct Kernel Object Manipulation）**：直接修改内核对象，绕过常规安全检查

## 技术栈

| 层次 | 技术 |
|------|------|
| 用户态程序 | C++（NT API） |
| 内核态驱动 | C++，Windows Driver Kit（WDK） |
| 核心机制 | EPROCESS 断链，DKOM |

## 安装与使用

> ⚠️ 以下操作仅在受控的虚拟机/实验室环境中执行。

**1. 编译驱动和用户态程序：**

```bash
# 使用 Visual Studio 打开解决方案
# 分别编译驱动项目（.sys）和用户态项目（.exe）
```

**2. 加载驱动：**

```bash
# 需要管理员权限
sc create ProcessHider binPath= "C:\Path\To\ProcessHider.sys" type= kernel
sc start ProcessHider
```

**3. 使用隐藏功能：**

```bash
ProcessHider.exe --hide notepad.exe
ProcessHider.exe --disguise cmd.exe svchost.exe
```

**4. 卸载驱动：**

```bash
sc stop ProcessHider
sc delete ProcessHider
```

## 适用场景（仅限安全研究）

- Windows 内核安全机制研究与教学
- Rootkit 检测技术与 EDR 开发测试
- 内核级 Hook 与防御方案验证
- 安全竞赛（CTF）中的内核挑战

## 竞品对比

| 竞品 | 类型 | 特点 | 局限 |
|------|------|------|------|
| **Process Explorer** | 系统工具 | 微软官方进程查看器 | 用于查看，不提供隐藏功能 |
| **Rootkit 隐藏技术** | 安全研究 | 专业级内核隐藏 | 实现复杂，门槛高 |
| **EDR / AV 检测引擎** | 安全防御 | 检测并阻止进程隐藏 | 属于对立面，非隐藏工具 |

**核心差异：** ProcessHider 是一个面向安全研究和教育目的的开源学习项目，展示了现代 Windows 内核中进程可视化的基本原理和绕过方法。相比专业的 rootkit 框架，其代码量较小、易于理解，适合初学者学习内核安全。

## 参考资料

- GitHub 仓库：[https://github.com/M00nRise/ProcessHider](https://github.com/M00nRise/ProcessHider)
- Windows 内核编程相关：[《Windows Internals》第七版（Part 1）](https://docs.microsoft.com/en-us/sysinternals/resources/windows-internals)
- DKOM 技术参考：[Rootkit: Attacking the Windows Kernel — Greg Hoglund](https://www.amazon.com/Rootkit-Attacking-Windows-Greg-Hoglund/dp/0321294319)
