---
layout: post
title: "android-protectors：用 300 行 C 代码理解 JNI_OnLoad 入口劫持"
date: 2026-06-19 10:30:00 +0800
categories: [sec]
tags: [android, native, linker, elf, anti-tamper]
---

# android-protectors：用 300 行 C 代码理解 JNI_OnLoad 入口劫持

> 原文作者：二手的程序员
> 原文链接：[VMP 开源项目研究](https://mp.weixin.qq.com/s/wDFmzteXDpVDzUl6v-wpVQ)
> 项目地址：[github.com/aprz512/android-protectors](https://github.com/aprz512/android-protectors)

## 项目背景

android-protectors 是 VmpProject 作者提到的一个"副产品"——在研究某防护库时发现了一个蜜罐机制，于是做了这个简化的教学实现。

项目当前 ⭐7，属于**教学演示性质**，核心代码只有约 300 行 C。但它揭示了一个在 Android Native 安全中非常关键的技术：**如何在 linker 调用 JNI_OnLoad 之前修改它的入口地址**。

如果你一直想搞清楚 Android linker 如何加载 so、`.dynsym` 符号表如何解析、`.init_array` 和 `JNI_OnLoad` 的执行顺序，这个项目是最干净的学习样本。

## 核心原理：9 步攻击链

项目的核心模块 `jnionload` 实现了一套完整的 ELF `.dynsym` 符号表篡改流程：

```
第1步：通过 __attribute__((constructor)) 注册 .init_array 构造函数
第2步：Android linker 在调用 JNI_OnLoad 之前，先执行 .init_array
第3步：解析当前 .so 的 ELF Header 和 Program Header
第4步：定位 PT_DYNAMIC，解析 DT_SYMTAB、DT_STRTAB、DT_GNU_HASH
第5步：在 .dynsym 中查找 "JNI_OnLoad" 符号
第6步：使用 mprotect 修改 .dynsym 页面权限（去掉只读）
第7步：将 JNI_OnLoad 的 st_value 改为 fake_JNI_OnLoad
第8步：linker 调用 dlsym("JNI_OnLoad") 时获取篡改后的入口
第9步：fake_JNI_OnLoad 执行保护逻辑后委托给 real_JNI_OnLoad
```

成功后的日志输出：

```
[init_array] +++ .init_array executing +++
[patch] Found 'JNI_OnLoad' at symbol index ...
[patch] ★★★ st_value PATCHED: ... → ... ★★★
[fake_JNI_OnLoad] +++ Wrapper JNI_OnLoad called +++
[real_JNI_OnLoad] Real JNI_OnLoad executing
```

## 技术要点拆解

### 为什么 .init_array 可以在 JNI_OnLoad 之前执行？

这是 Android linker 的固定加载顺序：

```
dlopen → linker 解析 ELF → 加载依赖库 →
执行 .init_array（构造函数）→ 调用 JNI_OnLoad
```

`__attribute__((constructor))` 修饰的函数会被编译器收集到 `.init_array` 段，在 so 加载时由 linker 自动调用，**早于 `JNI_OnLoad`**。

### 如何在运行时找到 JNI_OnLoad 符号？

项目手工解析了 ELF 的四个关键结构：

```c
// 1. 定位 ELF Header
Elf64_Ehdr *ehdr = (Elf64_Ehdr *)base_addr;

// 2. 遍历 Program Header 找到 PT_DYNAMIC
Elf64_Phdr *phdr = (Elf64_Phdr *)(base_addr + ehdr->e_phoff);
for (int i = 0; i < ehdr->e_phnum; i++) {
    if (phdr[i].p_type == PT_DYNAMIC) {
        dyn = (Elf64_Dyn *)(base_addr + phdr[i].p_vaddr);
    }
}

// 3. 从 PT_DYNAMIC 中找 DT_SYMTAB、DT_STRTAB、DT_GNU_HASH
// 4. 在 GNU hash 的 buckets/chains 中查找 "JNI_OnLoad"
```

### 兼容已重定位和未重定位的 d_ptr

so 加载时，linker 会对 `d_ptr` 进行重定位。这个项目做了两种情况的兼容处理：

- 如果 `d_ptr` 的值落在 so 的加载范围内 → 认为是已重定位
- 否则 → 认为未重定位，直接用 `base_addr + d_ptr`

### 安全性考量

```
// 修改符号表前解除内存保护
mprotect(dynsym_page_start, page_size, PROT_READ | PROT_WRITE);
// 修改完成后再恢复只读
mprotect(dynsym_page_start, page_size, PROT_READ);
```

修改之后**恢复只读权限**是一个容易被忽略的重要步骤。如果不恢复，攻击者可以通过扫描可写页面发现篡改痕迹。

## 项目结构

```
android-protectors/
├── app/                          # 示例 Android App
│   └── src/main/java/.../MainActivity.kt
├── jnionload/                    # 核心模块（300行 C）
│   ├── readme.md
│   └── src/main/cpp/
│       ├── jni_onload_tamper.c   # 核心实现
│       └── CMakeLists.txt
├── build.gradle.kts
├── settings.gradle.kts
└── gradle/
```

## 构建与运行

```bash
# 完整构建 APK
./gradlew assembleDebug

# 仅构建 native 模块
./gradlew :jnionload:externalNativeBuildDebug

# 安装并查看日志
adb install -r app/build/outputs/apk/debug/app-debug.apk
logcat -s JniOnLoadTamper JniOnLoadLibrary MainActivity
```

**环境要求**：
- Android NDK
- minSdk 24+
- 支持 `__attribute__((constructor))` 的 NDK 版本

## 这个方案的意义

这个项目只有 7 个 star，代码也只有 300 行，但它提供了一个非常干净的教学样本。

| 知识点 | 实际代码 |
|--------|---------|
| ELF 文件头解析 | `Elf64_Ehdr` 遍历 |
| Program Header 遍历 | `PT_DYNAMIC` 定位 |
| 动态符号表解析 | `DT_SYMTAB` / `DT_STRTAB` |
| GNU Hash 查找 | `DT_GNU_HASH` buckets+chains 遍历 |
| mprotect 内存权限修改 | 临时解除只读保护 |
| .init_array 构造函数 | `__attribute__((constructor))` |

如果你想**理解 Android linker 加载过程的底层机制**，但又不想去啃 Linker 源码，最快的方式就是读这个项目的 `jni_onload_tamper.c`。

## 扩展思考

这个方案的**实际用途**不仅限于"保护"。反过来思考：

- **加固检测**：检测 `JNI_OnLoad` 的 `st_value` 是否被篡改
- **Hook 框架**：可以在 .init_array 中劫持任意导出函数
- **反逆向**：配合 VmpProject 这类 VMP 方案，在入口被调用前做完整性校验

这也是为什么作者说它像"蜜罐"——一个看似正常的保护方案，实际上你可以用它来做很多事情。

---

*参考来源：*
1. [android-protectors](https://github.com/aprz512/android-protectors) — aprz512
2. [VMP 开源项目研究](https://mp.weixin.qq.com/s/wDFmzteXDpVDzUl6v-wpVQ) — 二手的程序员，2026-05-20
