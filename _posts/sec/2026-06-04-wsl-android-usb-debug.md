---
layout: post
title: "WSL 真机调试环境搭建最佳实践 — Android USB 调试全流程"
categories: [sec]
description: "从零搭建 WSL2 + Android 真机 USB 调试环境：usbipd-win 桥接、ADB 配置、权限修复、一键脚本，覆盖 Redmi 3S/LineageOS 等常见设备"
tags:
  - WSL
  - ADB
  - Android
  - USB调试
  - 逆向
---

# WSL + Android 真机 USB 调试环境搭建最佳实践

> **建立时间**：2026-06-04
> **目标硬件**：Redmi 3S (land) / LineageOS
> **适用场景**：Android 逆向分析、App 调试、应用安全测试

---

## 架构总览

WSL2 默认不支持 USB 设备直通。借助 `usbipd-win`，可以将 Windows 宿主机上的 USB 设备通过 USB/IP 协议共享给 WSL2 Linux 内核。数据流如下：

```
Windows 宿主机
  ┌──────────────────────────────────────────────┐
  │  usbipd-win (USB/IP 服务端)                  │
  │  监听 USB 设备并通过网络共享给 WSL            │
  └──────────────┬───────────────────────────────┘
                 │ USB/IP 协议 (TCP)
  ┌──────────────▼───────────────────────────────┐
  │  WSL2 Linux                                   │
  │  ┌──────────┐  ┌─────────────────────────┐   │
  │  │ vhci_hcd │◄─│ ADB Server (5037)       │   │
  │  │ (虚拟USB) │  │ /tmp/platform-tools/adb │   │
  │  └──────────┘  └─────────────────────────┘   │
  └──────────────────────────────────────────────┘
                      │ USB
  ┌──────────────────▼──────────────────────────┐
  │  手机：Redmi 3S (LineageOS) / USB 调试已开启 │
  └─────────────────────────────────────────────┘
```

---

## 一、Windows 端：安装 usbipd-win

### 1.1 安装

```powershell
# 方式一：winget 安装（推荐）
winget install --interactive --exact dorssel.usbipd-win

# 方式二：手动下载安装
# https://github.com/dorssel/usbipd-win/releases/latest
```

> ⚠️ **注意**：usbipd-win 5.0+ 改变了命令语法，以下均使用新版语法。

### 1.2 查看安装路径

```powershell
C:\Program Files\usbipd-win\usbipd.exe
```

> ⚠️ 该路径 **不会自动加入系统 PATH**，使用时需用完整路径或手动加入环境变量。

### 1.3 将 usbipd 加入 PATH（可选，推荐）

1. 打开「系统属性」→「高级」→「环境变量」
2. 在系统变量 `Path` 中添加：`C:\Program Files\usbipd-win`
3. 重启 PowerShell

---

## 二、WSL 端：安装 ADB

> 如果 `sudo` 不可用，可直接下载 ADB 二进制包（无需 root 权限）。

```bash
# 下载 Android platform-tools 到临时目录
curl -sL -o /tmp/platform-tools.zip \
  "https://dl.google.com/android/repository/platform-tools-latest-linux.zip"

# 解压（使用 Python，无需 unzip）
python3 -c "
import zipfile, os
os.chdir('/tmp')
with zipfile.ZipFile('platform-tools.zip', 'r') as z:
    z.extractall()
"

# 设置可执行权限
chmod +x /tmp/platform-tools/adb

# 验证
/tmp/platform-tools/adb --version
```

> 💡 **建议别名**：在 `~/.bashrc` 或 `~/.zshrc` 中添加：
> ```bash
> alias adb='/tmp/platform-tools/adb'
> ```

---

## 三、手机端：准备工作

1. **开启「开发者选项」**
   - 设置 → 关于手机 → 连续点击「版本号」7 次
2. **开启「USB 调试」**
   - 设置 → 开发者选项 → USB 调试 → 开启
3. **关闭「MIUI 优化」**（MIUI 系统建议关闭，避免限制）
4. 用 USB 数据线连接电脑

---

## 四、连接流程（每日操作）

### Step 1 — 确保 WSL 处于活跃状态

> WSL2 VM 需要有至少一个终端开着，否则 usbipd 无法 attach。

```bash
# 打开一个 WSL 终端并保持
wsl
```

### Step 2 — Windows 端：列出并绑定设备

**管理员 PowerShell** 执行：

```powershell
# 列出所有 USB 设备，找到 Android 设备
& "C:\Program Files\usbipd-win\usbipd.exe" list
```

示例输出：

```
usbipd: info: Connected devices
2-10    Google Inc.  Android  ...  Redmi 3S
```

记录 **BUSID**（示例中为 `2-10`）。

```powershell
# 绑定设备（共享给 WSL）
& "C:\Program Files\usbipd-win\usbipd.exe" bind --busid 2-10
```

> ⚠️ **bind 只需要做一次**，后续 attach 即可。如果要解除绑定：
> ```powershell
> & "C:\Program Files\usbipd-win\usbipd.exe" unbind --busid 2-10
> ```

### Step 3 — Windows 端：Attach 到 WSL

**普通 PowerShell**（无需管理员）执行：

```powershell
& "C:\Program Files\usbipd-win\usbipd.exe" attach --wsl --busid 2-10
```

> 🔄 如果想把设备还回 Windows：
> ```powershell
> & "C:\Program Files\usbipd-win\usbipd.exe" detach --busid 2-10
> ```

### Step 4 — WSL 端：启动 ADB 并验证

```bash
# 重启 ADB 服务（清除旧的授权状态）
/tmp/platform-tools/adb kill-server
/tmp/platform-tools/adb start-server

# 查看设备
/tmp/platform-tools/adb devices -l
```

预期输出（首次需要手机授权）：

```
List of devices attached
d671ac4a7d33           device usb:1-1 product:lineage_Mi8937 model:Redmi_3S device:land
```

### Step 5 — 手机授权

首次连接时，手机屏幕会弹出 **「允许 USB 调试吗？」** 对话框：

- ✅ **勾选「一律允许使用此计算机进行调试」**
- ✅ 点击 **「允许」**

---

## 五、权限问题处理

### 现象：`no permissions (missing udev rules?)`

```
d671ac4a7d33  no permissions (missing udev rules? user is in the plugdev group)
```

### 解决方案：配置 udev 规则

```bash
# 创建 udev 规则文件
echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="18d1", ATTR{idProduct}=="4e11", MODE="0666", GROUP="plugdev"' \
  > /tmp/51-android.rules

# 安装规则（需要 sudo）
sudo cp /tmp/51-android.rules /etc/udev/rules.d/
sudo chmod 644 /etc/udev/rules.d/51-android.rules
sudo udevadm control --reload-rules
sudo udevadm trigger

# 重启 ADB
/tmp/platform-tools/adb kill-server
/tmp/platform-tools/adb start-server
/tmp/platform-tools/adb devices
```

### 常见厂商 Vendor ID 速查表

| 厂商 | Vendor ID |
|------|-----------|
| Google / AOSP | `18d1` |
| Samsung | `04e8` |
| Xiaomi | `2717` (旧) / `18d1` (AOSP) |
| Huawei | `12d1` |
| OPPO | `22d9` |
| vivo | `2d95` |
| OnePlus | `2d95` |
| Meizu | `2a45` |

> 若不确定 Vendor ID，从 sysfs 实时读取：
> ```bash
> cat /sys/bus/usb/devices/1-1/idVendor
> cat /sys/bus/usb/devices/1-1/idProduct
> cat /sys/bus/usb/devices/1-1/product
> ```

---

## 六、常用 ADB 命令速查

```bash
# 查看已连接设备
adb devices -l

# 进入 shell
adb shell

# 安装 APK
adb install path/to/app.apk

# 卸载应用
adb uninstall com.package.name

# 列出所有第三方应用
adb shell pm list packages -3

# 提取 APK
adb shell pm path com.package.name        # 查看 APK 路径
adb pull /data/app/.../base.apk output.apk # 拉取到本地

# 查看日志
adb logcat

# 截图
adb shell screencap /sdcard/screen.png
adb pull /sdcard/screen.png

# 屏幕录制
adb shell screenrecord /sdcard/demo.mp4

# 传输文件
adb push local/file /sdcard/
adb pull /sdcard/file local/

# 查看设备信息
adb shell getprop ro.build.version.sdk    # Android API 级别
adb shell getprop ro.product.model         # 型号
```

---

## 七、故障排除

### 7.1 `usbipd` 命令找不到

```powershell
# 用完整路径
& "C:\Program Files\usbipd-win\usbipd.exe" list

# 或把路径加入 PATH（推荐）
```

### 7.2 `usbipd wsl attach` 命令不存在

usbipd-win 5.0+ 已移除 `wsl` 子命令，改用：

```powershell
usbipd attach --wsl --busid <BUSID>
```

而不是旧的：

```powershell
usbipd wsl attach --busid <BUSID>    # ❌ 已废弃
```

### 7.3 `adb: no permissions`

```
no permissions (missing udev rules? user is in the plugdev group)
```

→ 见 [第五节：权限问题处理](#五权限问题处理)

### 7.4 设备状态为 `unauthorized`

```
d671ac4a7d33  unauthorized
```

→ 查看手机屏幕，点击 **「允许 USB 调试」** 弹窗。

### 7.5 Attach 后 WSL 看不到设备

```bash
# 检查 USB 设备是否已挂载
ls -la /sys/bus/usb/devices/
cat /sys/bus/usb/devices/1-1/idVendor 2>/dev/null

# 如果完全看不到，试试先 detach 再重新 attach
# PowerShell 执行：
& "C:\Program Files\usbipd-win\usbipd.exe" detach --busid 2-10
& "C:\Program Files\usbipd-win\usbipd.exe" attach --wsl --busid 2-10
```

### 7.6 连接不稳定 / 经常断开

可能原因：

- USB 线材质量差 → 换原装线
- USB 接口供电不足 → 换到主板后置接口
- WSL VM 休眠 → 保持一个 WSL 终端窗口常开

---

## 八、一键连接脚本

### Windows 端脚本（`connect_android.ps1`）

```powershell
# 保存为 connect_android.ps1，以管理员运行
$USBIPD = "C:\Program Files\usbipd-win\usbipd.exe"
$BUSID = "2-10"   # 改成你的实际 BUSID

Write-Host "=== 绑定并 Attach Android 设备到 WSL ==="
& $USBIPD bind --busid $BUSID
Start-Sleep -Seconds 1
& $USBIPD attach --wsl --busid $BUSID
Write-Host "✅ 完成！请在 WSL 中执行 adb devices 验证"
```

### WSL 端脚本（`check_adb.sh`）

```bash
#!/bin/bash
# 保存为 check_adb.sh 并 chmod +x
ADB=/tmp/platform-tools/adb

$ADB kill-server 2>/dev/null
$ADB start-server
$ADB devices -l
```

---

## 九、完整的全流程速查

```
┌────────────────────────────────────────────────────────┐
│  Windows (管理员 PowerShell)                            │
│  usbipd list                          → 找 BUSID       │
│  usbipd bind --busid <BUSID>          → 共享设备       │
├────────────────────────────────────────────────────────┤
│  Windows (普通 PowerShell)                             │
│  usbipd attach --wsl --busid <BUSID>  → 桥接到 WSL    │
├────────────────────────────────────────────────────────┤
│  WSL                                                    │
│  adb kill-server && adb start-server  → 重启 ADB      │
│  adb devices                          → 验证连接       │
│  [首次] 手机弹窗 → 勾选「一律允许」→ 确认             │
└────────────────────────────────────────────────────────┘
```

---

## 十、参考链接

- [usbipd-win GitHub](https://github.com/dorssel/usbipd-win)
- [Microsoft WSL USB 设备连接文档](https://learn.microsoft.com/zh-cn/windows/wsl/connect-usb)
- [Android Debug Bridge 官方文档](https://developer.android.com/studio/command-line/adb)
