---
layout: post
title: 『Cheat Engine』——游戏修改与内存调试领域的瑞士军刀
date: 2026-06-08 10:40:00 +0800
categories: [sec]
tags: [game-hacking, memory-scanning, reverse-engineering, debugger, lua]
---

## 项目简介

Cheat Engine（简称 CE）是游戏修改和内存调试领域最经典、最全面的工具集。它不仅是一个内存扫描器，更是一个完整的逆向工程开发环境，集成了调试器、反汇编器、内存查看器、代码注入引擎和 Lua 脚本引擎。CE 已被广泛应用于游戏修改、逆向工程学习、软件漏洞分析等多个领域。最新版本为 7.5（2023 年发布），由 Dark Byte 在 Lazarus/Delphi 环境下持续开发。

## GitHub 数据

- **仓库地址**: [cheat-engine/cheat-engine](https://github.com/cheat-engine/cheat-engine)
- **Stars**: 18,406 | **Forks**: 2,584
- **License**: GPL-3.0
- **主要语言**: Pascal / Lua / C / C++
- **版本**: 7.5（2023-02-23）
- **定位**: 专注于游戏修改 / 内存调试的开发环境

## 核心功能

1. **内存扫描**：支持精确值扫描、模糊值扫描（增/减/不变/变化）、多级指针扫描、字符串扫描、数组扫描
2. **内置调试器**：支持断点（内存断点、硬件断点、条件断点）、单步执行、步过/步入
3. **反汇编器**：内置 x86/x64 反汇编引擎，支持实时查看和修改汇编指令
4. **内存查看与编辑**：十六进制查看器，可实时修改内存中任意数值
5. **代码注入**：支持 DLL 注入、代码洞（Code Cave）注入、AOB（Array of Bytes）自动汇编
6. **Lua 脚本引擎**：完整的自动化脚本支持，可实现复杂的修改逻辑和工具链
7. **Speedhack**：加速或减速游戏运行速度（需要管理员权限）
8. **网络抓包**：内置网络流量监听功能
9. **Trainers 生成**：将修改逻辑打包为独立的训练器（Trainer）可执行文件

## 技术栈

- **Pascal**：主界面和核心逻辑（Lazarus / Delphi）
- **Lua**：脚本扩展与自动化
- **C / C++**：底层驱动（DBVM、内核驱动）和性能敏感组件
- **DBVM**：Cheat Engine 自研的虚拟机技术，用于绕过反调试

## 安装与使用

**下载安装**：从 [GitHub Releases](https://github.com/cheat-engine/cheat-engine/releases) 下载安装包或便携版。

**基本使用流程**：

1. 启动 Cheat Engine，点击「Select a process to open」按钮
2. 选择目标游戏或进程
3. 在「Value」输入框中输入要搜索的数值（如游戏中的血量/金钱）
4. 点击「First Scan」进行首次扫描
5. 在游戏中改变该数值，输入新值，点击「Next Scan」
6. 重复步骤 5 直到结果唯一
7. 双击结果添加到下方列表，修改 Value 即可

**Lua 脚本示例**：

```lua
-- 简单的无限血量脚本
local function infiniteHealth()
    local healthAddr = AOBScan("F3 0F 11 05 * * * * F3 0F 10")
    if healthAddr then
        healthAddr[0].writeFloat(9999)
    end
end
```

## 适用场景

- **游戏修改**：修改血量、金钱、经验值、掉落率等游戏参数
- **逆向工程学习**：入门级逆向工程的最佳教学工具
- **软件漏洞分析**：通过内存扫描发现缓冲区溢出等漏洞
- **内存结构教学**：学习进程内存布局、堆栈结构、指针等概念
- **自动化测试**：配合 Lua 脚本实现游戏自动化测试

## 竞品对比

| 对比项 | Cheat Engine | IDA Pro | x64dbg | GameGuardian |
|--------|-------------|---------|--------|-------------|
| 核心定位 | 游戏修改/内存调试 | 静态逆向分析 | 动态调试 | Android 游戏修改 |
| 内存扫描 | 最强（多级指针/模糊扫描） | 不支持 | 有限 | 中等 |
| 平台 | Windows | 多平台 | Windows | Android |
| 价格 | 免费开源 | 商业付费 | 免费开源 | 免费 |
| 调试器 | 内置完整 | 可选 | 核心功能 | 无 |
| Lua 脚本 | 原生支持 | IDC/Python | 插件 | 有限 |
| 上手难度 | 低 | 极高 | 较高 | 低 |

## 参考资料

- GitHub 仓库: [https://github.com/cheat-engine/cheat-engine](https://github.com/cheat-engine/cheat-engine)
- 官方论坛: [https://forum.cheatengine.org/](https://forum.cheatengine.org/)
- 官方 Wiki: [https://wiki.cheatengine.org/](https://wiki.cheatengine.org/)
- DBVM: [https://dbvm.net/](https://dbvm.net/)
