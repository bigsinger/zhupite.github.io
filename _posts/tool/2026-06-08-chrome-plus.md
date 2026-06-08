---
layout: post
title: "Chrome++ Next：通过 DLL 劫持实现 Chrome 完整便携化与标签增强"
categories: [tool]
description: "一个 version.dll 注入项目，通过 DLL 劫持技术为 Chrome 添加双击关闭标签、老板键、翻译快捷键、便携化数据目录等原生无法实现的功能。"
keywords: Chrome, DLL劫持, 便携版, 标签增强, 老板键, 浏览器增强, version.dll
tags: [tool, open-source, Chrome, 浏览器增强, DLL注入, 便携版, 标签管理, 开源工具]
---

# Chrome++ Next：通过 DLL 劫持实现 Chrome 完整便携化与标签增强

## 项目概览

**Chrome++ Next** 是一个通过 DLL 劫持技术为 Google Chrome 添加增强功能的工具。你只需将一个 `version.dll` 文件放到 Chrome 安装目录下，启动 Chrome 时它会自动被加载，为浏览器注入标签、快捷键、便携化、命令行和政策控制等能力。

| 指标 | 数据 |
|------|------|
| 仓库 | https://github.com/Bush2021/chrome_plus |
| Stars | **1,976** |
| Forks | 162 |
| 编程语言 | C++ |
| 协议 | GPL-3.0（v1.6.0 起） |
| 目标平台 | Windows |

---

## 一、工作原理

Chrome++ 使用 Windows 经典的 **DLL 劫持（DLL Hijacking）** 技术：

```
正常 Chrome.exe 启动
    ↓
Windows 搜索所需的 DLL（如 version.dll）
    ↓
chrome_plus 的 version.dll 位于同目录 → Windows 先加载它
    ↓
version.dll 加载原始 system32/version.dll → 不破坏原有功能
    ↓
注入增强逻辑（钩子 + 补丁）→ 实现新功能
```

### DLL 劫持为何可行

Windows 在执行 `chrome.exe` 时会按以下顺序搜索 DLL：**当前目录 → 系统目录 → PATH 环境变量目录**。`version.dll` 是 Chrome 启动时必须加载的系统 DLL，将自定义的 `version.dll` 放到 Chrome 同目录下，Windows 会优先加载它。自定义 DLL 在完成自身初始化后，再重定向调用到真正的系统 `version.dll`，保证原有功能不受影响。

---

## 二、核心功能

### 2.1 标签页增强

| 功能 | 说明 |
|------|------|
| **双击关闭标签** | 双击标签即可关闭，无需点击 × 按钮 |
| **右键关闭标签** | 右键点击标签直接关闭（按住 Shift 保留原右键菜单） |
| **保留最后一个标签** | 最后一个标签不关闭浏览器窗口 |
| **鼠标滚轮切换标签** | 在标签栏区域滚动滚轮切换标签 |
| **右键滚轮切换** | 按住右键时使用滚轮切换标签 |
| **新标签打开** | 地址栏输入 / 书签点击强制在新标签打开 |

### 2.2 快捷键与输入映射

| 功能 | 说明 |
|------|------|
| **老板键** | 一键隐藏所有 Chrome 窗口并静音，再按恢复 |
| **翻译快捷键** | 配置一键翻译当前页面的快捷键 |
| **按键映射** | 支持将任意快捷键映射为 Chrome 命令 ID %}

### 2.3 便携化部署

**这是 Chrome++ 最核心的功能之一**——让 Chrome 成为真正的绿色便携版：

| 功能 | 说明 |
|------|------|
| **自定义数据目录** | 强制指定 `data_dir` 和 `cache_dir`，数据全在 Chrome 目录内 |
| **附加命令行** | 通过 `command_line` 追加 Chromium 启动开关 |
| **启动/退出命令** | 支持 Chrome 启动时和退出时执行自定义命令 |

#### 为什么需要便携化

Chrome 默认将用户数据存储在 `%LOCALAPPDATA%\Google\Chrome\User Data`，这意味着：
- 重装系统后所有配置、扩展、书签全部丢失
- 无法将配置好的 Chrome 随身携带到 U 盘
- 无法在多台电脑间同步一致的浏览器环境

Chrome++ 通过 `data_dir` 和 `cache_dir` 覆盖，可以将所有数据存储在 Chrome 程序目录的子目录中，实现真正的**即拷即用**。

### 2.4 浏览器环境控制

| 功能 | 说明 |
|------|------|
| **忽略企业策略** | `ignore_policies` 忽略注册表中的企业 Chrome 策略 |
| **win32k 降级** | 仅在 Chrome++ 本身导致启动崩溃时启用 win32k 回退 |
| **显示密码** | `show_password` 显示已保存密码的明文 |
| **新标签页控制** | 通过 `new_tab_disable` / `new_tab_disable_name` 控制新标签页行为 |

---

## 三、安装与使用

### 安装步骤

1. 从 [Releases](https://github.com/Bush2021/chrome_plus/releases) 下载最新版 `version.dll`
2. 将 `version.dll` 放到 `chrome.exe` 同级目录
3. 启动 Chrome，所有功能自动启用

### 推荐安装方式

使用 [Chrome 离线安装包](https://github.com/Bush2021/chrome_installer) 解压两次，直接使用解压后的 Chrome 程序文件——卸载官方版 Chrome 以避免冲突，即可获得纯正的便携版 Chrome。

### 配置文件

所有功能通过 `chrome++.ini` 配置文件控制（参考 [`src/chrome++.ini`](https://github.com/Bush2021/chrome_plus/blob/main/src/chrome++.ini)）：

```ini
[tab]
double_click_close=1
right_click_close=1
keep_last_tab=1

[hotkey]
boss_key=Ctrl+Shift+Z
translate=Alt+T

[portable]
data_dir=./User Data
cache_dir=./Cache
```

---

## 四、优劣势分析

| 优势 | 说明 |
|------|------|
| **DLL 劫持，无需源码修改** | 不修改 Chrome 二进制文件，不影响自动更新 |
| **便携化能力极强** | 数据和缓存全部在程序目录内，U 盘即插即用 |
| **标签增强实用** | 双击/右键关闭标签等功能是浏览器原生缺失的刚需 |
| **老板键经典功能** | 一键隐藏+静音，紧急场景完美隐身 |
| **启动时间无感** | 注入过程极快，用户无感知 |

| 劣势 | 说明 |
|------|------|
| **仅限 Windows** | DLL 劫持是 Windows 平台特有技术 |
| **仅支持 Google Chrome** | 其他 Chromium 内核浏览器可能兼容但不保证 |
| **杀毒软件可能报毒** | DLL 劫持技术被恶意软件滥用，可能触发误报 |
| **需要维护版本兼容** | Chrome 更新可能破坏钩子兼容性 |
| **配置需要手动编辑** | 无 GUI 配置界面 |

---

## 五、适合谁用

- **需要便携版 Chrome 的用户**——U 盘随身携带，即插即用
- **习惯双击关闭标签的用户**——原生 Chrome 不支持此功能
- **担心被老板发现刷网页的用户**——老板键一键隐身
- **有多台电脑需要同步 Chrome 环境的用户**——U 盘 + 便携版 = 多机同步
- **安全研究人员**——需要独立隔离的浏览器环境

---

## 总结

Chrome++ 代表了一类**"小而美"的 Windows 原生工具**——利用 DLL 劫持这种底层技术，在不修改目标程序源码的前提下，给用户带来实质性的体验提升。

它的核心价值在于**填补了 Chrome 原生的功能空白**：双击关闭标签、便携化数据目录、老板键……这些功能 Chrome 的内核开发者至今没有原生实现，而 Chrome++ 用一个 200KB 的 DLL 就解决了。

---

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/Bush2021/chrome_plus |
| Releases | https://github.com/Bush2021/chrome_plus/releases |
| Chrome 离线安装包 | https://github.com/Bush2021/chrome_installer |
| setdll（辅助加载工具） | https://github.com/Bush2021/setdll/ |
