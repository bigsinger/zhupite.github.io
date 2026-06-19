---
layout: post
title: "VmpProject：开源 ARM64 .so 虚拟化保护方案解析"
categories: [sec]
tags: [vmp, arm64, reverse-engineering, android, obfuscation]
---

# VmpProject：开源 ARM64 .so 虚拟化保护方案解析

> 原文作者：二手的程序员
> 原文链接：[VMP 开源项目研究](https://mp.weixin.qq.com/s/wDFmzteXDpVDzUl6v-wpVQ)
> 项目地址：[github.com/lxz-jiandan/VmpProject](https://github.com/lxz-jiandan/VmpProject)

## 项目概览

VmpProject 是一个面向 **Android ARM64 `.so`（ELF 动态库）**的离线加固与运行时接管工程。它做的事情说起来很直接：**把你的原始函数离线翻译成虚拟机字节码（payload），运行时用自研 VM 引擎执行，外部调用方式完全不变。**

项目当前 ⭐68，由国内开发者 lxz-jiandan 维护，全中文文档，是研究 ARM64 VMP 实现不可多得的开源参考。

它的核心意义在于——不像 OLLVM 那样做编译器层混淆，也不像商业加固那样闭源，而是**把一套完整的虚拟化保护方案从零搭出来给你看**。

## 工作原理

VmpProject 的工作原理可以拆为**离线加固**和**运行时执行**两个阶段。

### 阶段1：离线翻译（VmProtect）

```
原始 so → 扫描符号 → 选定加固函数 → 反汇编 → 
指令翻译（ARM64 → 自定义VM字节码）→ 生成payload → 
嵌入patch后的so
```

具体流程：

1. **扫描so**，收集符号列表
2. **筛选目标函数**（通过参数指定，支持多种模式）
3. **反汇编目标函数**，统计所有 ARM64 指令，逐一确认 VM 是否支持
4. **翻译指令** —— 将 ARM64 指令翻译成自定义虚拟机指令。注意：**这里做的是纯语义映射，不是基于 IR 的虚拟机**，每一条 ARM64 指令都有对应的 VM 指令
5. **Patch 原始 so** —— 将每个加固函数的入口替换为 trampoline stub

### 阶段2：运行时接管（VmEngine）

加固后的 so 加载时，VmEngine 自动完成初始化和接管。

关键的路由模型：

```
trampoline_stub（每个加固函数一条）:
  MOV  X2, #symbolKey    ← 该函数的唯一路由 key（即 funAddr）
  MOV  X3, #soId          ← 模块 ID
  B    vm_takeover_dispatch_by_key
```

设计亮点：

- 使用 `B`（无条件跳转）而不是 `BL`（带链接）—— 调用方的返回地址（LR/X30）仍然指向原本的下一条指令
- 当 `vm_takeover_dispatch_by_key` 执行 `RET` 时，**直接回到原始调用方**，不需要额外的返回处理
- 支持多 so：通过 `symbolKey + soId` 唯一标识，不是固定槽位

```
调用方:
  BL  fun_add           ← LR = 调用方下一条指令地址
       │
       trampoline:
         B  vm_takeover_dispatch_by_key   ← B 不修改 LR！
              │
              dispatch_by_key:
                ...execute...              ← LR 仍然是调用方下一条指令地址
                RET                        ← 直接回到调用方
```

### 虚拟机的执行引擎

核心是一个 `execute` 循环，每步三件事：

```
1. 构造 vmcontext 结构体，包含寄存器状态
2. 获取虚拟指令（从字节码中取出下一条）
3. 执行虚拟指令（根据 opcode 调用对应的 handler）
```

伪代码：

```c
while(true) {
    Context ctx;
    opcode = ctx.inst[i];
    opcode_handlers[opcode](&ctx);
}
```

每个虚拟指令都有自己的 handler 做解释执行。**要逆向这个 VMP，核心就是逆出 `opcode_handlers` 数组的具体实现**，拿到每个 handler 的语义后，再配合 trace 就能理解原始函数在做什么。

## 项目结构

```
VmpProject/
├── VmEngine/          # 运行时引擎（Android Native）
├── VmProtect/         # 离线加固工具（C++/CMake）
├── demo/              # 演示 Android App
├── shared/patchbay/   # 跨模块数据协议
├── tools/             # 自动化回归脚本
├── libovert.so        # 预编译运行时库
├── llvm-objdump.exe   # 辅助工具
└── readelf.exe        # 辅助工具
```

## 实操：编译与使用

### 构建 VmProtect（Windows/MinGW 环境）

```powershell
cmake -S VmProtect -B VmProtect/cmake-build-debug -G Ninja
cmake --build VmProtect/cmake-build-debug --target VmProtect -j 12
```

### 构建 Android Native 部分

```powershell
cd demo && ./gradlew.bat externalNativeBuildDebug --rerun-tasks
```

### 执行保护

```powershell
VmProtect.exe --mode protect `
  --input-so libdemo.so `
  --vmengine-so libvmengine.so `
  --output-so libvmengine_patch.so `
  --function fun_add --function fun_for
```

### 一键回归验证

项目提供了完整的 Python 自动化回归脚本：

```bash
python tools/run_install_start_regression.py --project-root . --rerun-tasks
```

## 核心设计亮点

### 1. 指令翻译策略：Fail-Fast

翻译引擎使用 elfkit 做结构化翻译，当遇到 VM 不支持的指令时**立即报错**。这种方式虽然限制了可保护函数的范围，但避免了未知指令可能导致的运行时崩溃，在工程上更稳健。

### 2. BL 处理方式

函数调用指令（BL/BLR）在离线阶段被抽象为**稳定索引**，运行时按实际加载地址重新计算跳转目标。这解决了不同 so 加载基址不同的问题。

### 3. 自定义 Linker

payload 的装载不依赖系统 linker，而是通过**嵌入 payload + 自定义 loader**的方式完成。这使得 VM 的字节码数据与宿主 so 解耦，更安全。

## 逆向 VMP 的方法论

对于 VmpProject 这类 VMP 保护，逆向的核心思路是：

1. **定位 opcode_handlers 数组** —— 这是 VM 的"语义字典"
2. **为每个 opcode 建立语义映射** —— 搞清楚每个虚拟指令对应什么 ARM64 操作
3. **提取 payload（字节码）** —— 需要从保护后的 so 中找到嵌入的 payload 数据
4. **构造 trace** —— 用已知的 handler 去解释执行 payload，生成指令序列
5. **从 trace 恢复原始函数** —— 用 ARM64 知识将 VM 指令序列翻译回可理解的代码

VmpProject 的 open source 性质让我们可以**直接对照源码理解 VMP 的全貌**，这对于学会逆向商业 VMP 产品（如 VMProtect、VMP 加固）非常关键。

## 局限与展望

| 局限 | 说明 |
|------|------|
| 仅支持 ARM64 | 不支持 x86/ARM32 |
| 指令集覆盖有限 | 不支持的函数会直接报错 |
| 仅 route4 主线就绪 | 文档明确其他路线尚在开发 |
| 依赖 Windows/MinGW | 跨平台性有待改善 |
| 项目早期（68⭐） | 生态尚未形成，使用时需自己踩坑 |

尽管如此，VmpProject **是可运行的 ARM64 VMP 开源实现中最完整的一个**，对想深入理解虚拟化保护技术的逆向工程师来说是极好的学习材料。

---

*参考来源：*
1. [VmpProject](https://github.com/lxz-jiandan/VmpProject) — lxz-jiandan
2. [VMP 开源项目研究](https://mp.weixin.qq.com/s/wDFmzteXDpVDzUl6v-wpVQ) — 二手的程序员，2026-05-20
