---
layout: post
title: "ApkSignatureKillerEx：MT 去签原理与对抗的演示项目"
categories: [sec]
description: "一个演示 MT Manager 去除 APK 签名校验原理及其对抗方法的开源项目。用 C 语言实现，从实现层展示 SignatureKiller 的工作机制和对应的检测/防御思路。"
tags:
  - Android
  - 签名校验
  - MT 管理器
  - 逆向
  - 去签
---

> 项目地址：[L-JINBIN/ApkSignatureKillerEx](https://github.com/L-JINBIN/ApkSignatureKillerEx)

在 Android 逆向和重打包领域，**去除签名校验**（去签）是一个经典命题。当修改后的 APK 重新签名安装后，如果原始应用在代码中校验了自己的签名指纹，就会拒绝运行。MT 管理器的 SignatureKiller 是处理这个问题的主流工具之一。

ApkSignatureKillerEx 这个项目做的就是一件事：**演示 MT 去签的原理，以及它的对抗方法。**

## 项目定位

这不是一个可以直接拿来用的去签工具，而是一个**技术演示项目**。作者用 C 语言实现了对 MT SignatureKiller 机制的模拟，同时展示了如何检测这种去签行为并进行对抗。

对于理解 Android 签名校验体系和安全攻防的人来说，这是一个比只看文字分析更直观的学习资源。

## 原理

### 两层绕过架构

MT 的 SignatureKiller 采用 **Java 层 + Native 层** 两层联动的方式绕过签名校验，ApkSignatureKillerEx 完整复现了这一机制：

#### Java 层：PackageManager 签名劫持

项目中的 `KillerApplication.java`（位于 `killer/src/main/java/`）在 `static` 初始化块中做了以下工作：

1. **替换 `PackageInfo.CREATOR`**：通过反射，将 `PackageInfo.CREATOR` 替换为自定义的 `Parcelable.Creator`。当应用调用 `PackageManager.getPackageInfo()` 时，返回的 `PackageInfo` 对象中的签名数组会被替换为一个预埋的 fake signature（Base64 硬编码）。

2. **清理签名缓存**：清空 `PackageManager.sPackageInfoCache`、`Parcel.mCreators` 和 `Parcel.sPairedCreators`，确保后续所有获取签名的 API 调用都返回假签名而非真实签名。

这一步针对的是通过 `PackageManager.getPackageInfo()` 获取签名的校验方式——最常见的一类。

#### Native 层：文件描述符劫持

`mt_jni.c` 通过 **xhook** 框架（PLT/GOT Hook）劫持了四个系统调用：

| 被 Hook 的函数 | 作用 |
|---|---|
| `open` | 打开文件 |
| `open64` | 打开大文件（64 位偏移） |
| `openat` | 在指定目录 fd 下打开文件 |
| `openat64` | openat 的 64 位偏移版本 |

当应用通过 `ZipFile` 等方式读取自身 APK 文件（例如读取 `META-INF/*.RSA` 或 `META-INF/*.DSA` 证书文件）时，xhook 会拦截对原始 APK 路径的 `open` 调用，并将路径重定向到 `assets/SignatureKiller/origin.apk`——一个**预埋在 killer 模块 assets 目录中的原版 APK 文件**。该文件在运行时会解压到 app 的数据目录下。

这样，应用读取到的是原版 APK 中的签名证书，而非重打包后的新签名。

### 对抗方法：绕过 xhook

既然去签工具 Hook 了 `open` / `openat` 系统调用，对抗思路就很直接——**绕过 PLT/GOT 层的 Hook**。

项目中的 `app` 模块实现了这一点：

- `openat.c`（位于 `app/src/main/c/`）使用 **ARM / ARM64 内联汇编** 直接发起 `svc #0`（超级调用），以 `__NR_openat` 系统调用号调用内核。这种方式完全绕过了 libc 的 PLT/GOT，xhook 根本无法拦截。

- `MainActivity` 演示了三种获取签名的方法及其差异：

| 方法 | 实现方式 | 去签后结果 |
|---|---|---|
| `signatureFromAPI()` | `PackageManager.getPackageInfo().signatures` | ❌ 被 Killer 拦截，返回假签名 |
| `signatureFromAPK()` | 通过 `ZipFile` 读取 APK 中 `META-INF/*.RSA` 证书 | ❌ `ZipFile` 底层调用了 `open`，被 xhook 重定向到原版 APK，返回原签名 |
| `signatureFromSVC()` | Native 内联汇编发起 syscall，直接打开 APK 文件 | ✅ 绕过 xhook，永远返回真实签名 |

SVC 在这里代表 **Supervisor Call**（超级用户调用），即直接发起系统调用。这种方式的可靠性也分场景：

- 当去签工具在应用进程启动时通过修改 Application 类注入（如 SignatureKiller 的 KillerApplication 模式），SVC 可以生效
- 如果去签工具通过更底层的方案注入（如内核级 Hook），SVC 也可能被拦截

## 如何使用

### 环境要求

- Android Studio（2021.3+）
- Android NDK（项目中 CMake 编译 Native 代码）
- Gradle 7.3+

### 构建步骤

1. **克隆项目**：
```bash
git clone https://github.com/L-JINBIN/ApkSignatureKillerEx.git
```

2. **用 Android Studio 打开项目根目录**，等待 Gradle 同步完成。

3. **项目结构**：
   - `killer/` — SignatureKiller 实现模块，编译生成 `libSignatureKiller.so`
   - `app/` — 测试应用，编译生成 APK，演示三种签名获取方式的对比

4. **构建并安装**：
   - 直接点击 Run 或执行 `./gradlew assembleDebug`
   - 安装生成的 `app/build/outputs/apk/debug/app-debug.apk`

### 运行说明

安装后打开应用，界面会显示四行信息：

- **Expected**：预期的真实签名 MD5 值
- **From API**：通过 PackageManager API 获取的签名 MD5（蓝色=匹配，红色=不匹配）
- **From APK**：通过读取 APK 中 RSA 证书文件获取的签名 MD5（蓝色=匹配，红色=不匹配）
- **From SVC**：通过内联汇编 syscall 获取的签名 MD5（蓝色=匹配，红色=不匹配）

在默认开启去签的状态下，API 和 APK 方式都会显示红色（不匹配），SVC 方式显示蓝色（匹配），直观呈现了三种方式的差异。

### 切换去签状态

`MainActivity` 中的 `App` 类：

```java
static {
    new bin.mt.signature.KillerApplication(); // 注释掉这句即可关闭去签
}
```

注释掉这行后重新构建安装，三种方式都会显示蓝色匹配，用于对比去签前后的行为差异。

### 签名文件说明

项目中预置了两个 JKS 签名文件：
- `fake.jks` — 重打包时使用的假签名（模拟攻击者签名）
- `key.jks` — 项目自身的调试签名

`assets/SignatureKiller/origin.apk` 是预埋的原版 APK，当 xhook 检测到对原始 APK 路径的读取请求时，将路径重定向到此文件。

## 适用读者

- 对 Android 重打包和签名校验感兴趣的安全研究员
- 需要理解 MT 去签原理以便更好保护自己应用的开发者
- 逆向工程学习者
