---
layout: post
title: 『ReClass.NET』——.NET 平台类结构逆向重构工具
description: "ReClass.NET 是 .NET 平台的类/结构体逆向重构工具，用于在进程内存中重建 C++ 类布局，辅助游戏逆向和恶意软件分析中的数据结构还原。"
date: 2026-06-08 10:50:00 +0800
categories: [sec]
tags: [reverse-engineering, memory-analysis, class-reconstruction, dotnet, game-hacking]
---

## 项目简介

ReClass.NET 是一款基于 .NET WPF 框架开发的远程进程类/结构体逆向重构工具。它通过分析目标进程的内存布局，帮助逆向工程师还原 C/C++ 类的虚函数表、成员变量布局和继承关系。在游戏逆向分析中，ReClass.NET 是解析对手游戏引擎类结构的首选工具。项目已于 2019 年停止更新，社区推荐使用其后继分支（如 ReClassEx 等）。

## GitHub 数据

- **仓库地址**: [ReClassNET/ReClass.NET](https://github.com/ReClassNET/ReClass.NET)
- **Stars**: 2,162 | **Forks**: 402
- **License**: MIT
- **主要语言**: C# / C / C++
- **版本**: v1.2（2019-04-15）
- **维护状态**: 已停更（社区建议使用后继分支）
- **定位**: .NET 平台类/结构体逆向重构工具

## 核心功能

1. **远程进程内存分析**：附加到目标进程，读取并解析其运行时内存数据
2. **类/结构体布局逆向重构**：通过可视化界面还原类的成员变量偏移、类型、大小和虚函数表
3. **内存查看器**：实时查看和编辑目标进程的原始内存数据
4. **内存扫描器**：支持按特征码（Signature/AOB）在目标进程内存中搜索
5. **调试器集成**：可与 x64dbg、OllyDbg 等调试器配合使用
6. **自动虚函数解析**：自动扫描和识别虚函数表（VTable），还原多态继承关系
7. **手动/自动模式**：支持手动拖放创建节点，也支持自动解析

## 技术栈

- **C# .NET WPF**：主界面框架，MVVM 架构
- **C / C++**：底层内存读取模块，通过 P/Invoke 调用 Win32 API
- **Win32 API**：ReadProcessMemory、WriteProcessMemory、OpenProcess 等系统调用
- **x64dbg / OllyDbg**：配合使用的第三方调试器

## 安装与使用

**下载与运行**：

从 [GitHub Releases](https://github.com/ReClassNET/ReClass.NET/releases) 下载最新版本（v1.2），解压后直接运行可执行文件。需要安装 .NET Framework 4.7.2 或更高版本。

**基本使用流程**：

1. 启动 ReClass.NET，点击「File」→「Select Process」
2. 选择目标进程（如 game.exe）
3. 创建新类：右键 →「New Class」→ 输入类名和基址
4. 添加成员：在节点中右键添加不同类型的字段（int/float/pointer/string 等）
5. 观察右侧内存视图实时显示当前偏移处的数据
6. 验证成员偏移正确后，导出为 C/C++ 头文件格式

**导出示例**：

```cpp
// 导出头文件片段
class CPlayer {
public:
    char pad_0000[0x8];           // 0x0000
    int32_t m_iHealth;            // 0x0008
    int32_t m_iArmor;             // 0x000C
    float m_fPositionX;           // 0x0010
    float m_fPositionY;           // 0x0014
    char pad_0018[0x8];           // 0x0018
    class CWeapon* m_pWeapon;     // 0x0020
}; // sizeof(CPlayer) = 0x28
```

## 适用场景

- **游戏逆向分析**：解析游戏引擎的类结构、玩家对象、物品对象等
- **恶意软件分析**：分析恶意进程的内存结构，识别隐藏数据和加密密钥
- **C++ 类布局还原**：学习 C++ 对象模型，包括虚函数、菱形继承等复杂场景
- **培训教学**：教授内存结构分析和类布局识别的入门工具
- **漏洞挖掘**：分析目标软件的内部数据结构，发现潜在安全漏洞

## 竞品对比

| 对比项 | ReClass.NET | ReClass（原版） | ReClassEx | IDA Pro |
|--------|------------|----------------|-----------|---------|
| 框架 | .NET WPF | C++ MFC | .NET WPF | Qt |
| 平台 | Windows | Windows | Windows | 多平台 |
| 虚函数解析 | 自动 | 手动 | 增强自动 | 专业级 |
| 维护状态 | 已停更 | 已停更 | 活跃 | 商业更新 |
| 导出格式 | C/C++ 头文件 | C/C++ | C/C++/JSON | IDA 数据库 |
| 上手难度 | 低 | 中等 | 低 | 极高 |
| 免费 | ✅ MIT | ✅ | ✅ | ❌ 商业付费 |

## 参考资料

- GitHub 仓库: [https://github.com/ReClassNET/ReClass.NET](https://github.com/ReClassNET/ReClass.NET)
- ReClassEx（后继分支）: [https://github.com/ReClassEx/ReClassEx](https://github.com/ReClassEx/ReClassEx)
- x64dbg: [https://x64dbg.com/](https://x64dbg.com/)
- Win32 API: ReadProcessMemory — [MSDN](https://docs.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-readprocessmemory)
