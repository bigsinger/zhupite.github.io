---
layout: post
title: "LuaJIT Decompiler v2：新一代 LuaJIT 字节码反编译器"
date: 2026-06-08 10:50:00 +0800
categories: [sec]
tags: [luajit, decompiler, lua, reverse-engineering, bytecode]
description: "LuaJIT Decompiler v2 是一个用 C++ 编写的 LuaJIT 字节码反编译器，修复了旧版 Python 版本的所有缺陷，支持 goto 语句和剥离字节码的还原。"
---

## 概述

[LuaJIT Decompiler v2](https://github.com/marsinator358/luajit-decompiler-v2) 是一个完全用 **C++** 重写的 LuaJIT 字节码反编译器。截至 2026 年 6 月拥有 **454 颗 Star** 和 **122 个 Fork**。

## 背景

LuaJIT 因其卓越的性能被广泛应用于游戏（如《魔兽世界》、移动端 Unity 游戏）、嵌入式系统和高性能脚本场景。但这也意味着大量 LuaJIT 编译后的字节码文件（`.luac`）需要逆向分析。

旧版基于 Python 的反编译器存在诸多问题：
- 对 goto 语句支持不完整
- 剥离了局部变量和 upvalue 信息的字节码无法正确还原
- 各种边界情况下的崩溃

LuaJIT Decompiler v2 的目标就是解决这些问题。

## 核心能力

| 能力 | 说明 |
|------|------|
| **完整 goto 支持** | 正确处理 LuaJIT 字节码中的跳转和 goto 结构 |
| **剥离字节码还原** | 即使字节码被剥离了 locals/upvalues 信息也能还原 |
| **批量处理** | 支持拖放文件或文件夹批量反编译 |
| **使用简单** | 拖放即用，无需复杂配置 |

## 使用方法

```
# 直接拖放
将 .luac 文件拖到可执行文件上即可

# 命令行使用
luajit-decompiler-v2.exe -?   # 查看帮助
luajit-decompiler-v2.exe input.luac -o output.lua

# 批量处理
luajit-decompiler-v2.exe folder/   # 反编译整个文件夹
```

所有成功反编译的 `.lua` 文件默认输出到 `output` 目录。

## 技术亮点

该项目基于一篇学术论文中的布尔表达式反编译算法实现：

> [www.cse.iitd.ac.in/~sak/reports/isec2016-paper.pdf](https://www.cse.iitd.ac.in/~sak/reports/isec2016-paper.pdf)

该算法能更准确地将字节码中的条件分支还原为高级的布尔表达式语法，尤其擅长处理复杂的嵌套条件和短路求值。

## TODO（开发中）

- 大端字节码支持
- 条件赋值逻辑的进一步优化

## 应用场景

- **游戏 Modding**：修改 LuaJIT 驱动的游戏逻辑
- **安全审计**：分析被 LuaJIT 字节码保护的应用
- **学习研究**：理解 LuaJIT 的字节码格式和反编译技术

## 总结

LuaJIT Decompiler v2 是目前社区中较为活跃的 LuaJIT 反编译器之一，其 C++ 实现带来了远超旧版 Python 版本的性能和稳定性。对于游戏安全研究者和 Mod 开发者来说，这是一个实用价值很高的工具。
