---
layout: post
title: "BleachBit：Windows 和 Linux 上的系统清理工具"
categories: [tool]
description: "BleachBit 是一个开源免费的系统清理工具，支持 Windows 和 Linux。可以清理浏览器缓存、系统日志、临时文件、回收站等数百种垃圾文件，释放磁盘空间并保护隐私。GitHub 5.9K Stars，GPLv3 许可证，Python 开发，2026 年 4 月发布 v6.0 版本。本文介绍它的主要功能和使用方式。"
tags:
  - BleachBit
  - 系统清理
  - 开源
  - Windows工具
  - Linux工具
  - 隐私保护
---

系统用久了，磁盘空间总是不够。浏览器缓存、应用日志、系统临时文件、回收站、剪贴板历史……这些碎片化的垃圾文件分散在各处，手动清理费时费力。

[**BleachBit**](https://www.bleachbit.org) 是一个老牌的开源系统清理工具，支持 Windows 和 Linux，GitHub 5.9K Stars，2026 年 4 月刚发布了 v6.0 版本。项目从 2014 年持续维护至今，已有超过十年历史。

---

## 一、它能清理什么

BleachBit 内置了数百条清理规则，覆盖常见的系统和应用：

| 类别 | 清理内容 |
|------|---------|
| **浏览器** | Chrome/Firefox/Edge/Opera 的缓存、历史记录、Cookie、下载记录、会话 |
| **系统** | 回收站、剪贴板、最近文档、临时文件、日志文件、内存转储 |
| **应用** | Adobe Reader、VLC、Skype、Spotify、VS Code、Slack 等常用软件的缓存和日志 |
| **开发工具** | Git 历史、pip 缓存、npm 缓存、Docker 构建缓存、Java 临时文件 |
| **深度清理** | 磁盘空间覆盖擦除（防止恢复）、内存释放、文件粉碎 |

除了释放磁盘空间，BleachBit 还有一个隐私保护的作用——清理浏览器历史、表单记录、临时文件，减少被追踪的风险。

---

## 二、使用方式

### 图形界面

安装后打开软件，左侧是分类列表，勾选你想要的清理项，点"预览"查看将被删除的文件，确认后点"删除"。

操作流程很简单：**勾选 → 预览 → 确认 → 清理**。

### 命令行

BleachBit 也支持命令行模式，适合脚本或定时任务：

```bash
# 预览将删除的文件
bleachbit --preview system.cache

# 执行清理
bleachbit --clean system.cache

# 清理多个项目
bleachbit --clean system.cache system.temp browser.cache
```

命令行模式让 BleachBit 可以集成到自动化运维流程中——比如在 CI 环境中清理构建缓存，或者在服务器上定期清理日志。

### 清理器定义文件（CleanerML）

BleachBit 使用 XML 格式的清理器定义文件。如果你有自定义的软件需要清理规则，可以自己写一个 `.xml` 文件，指定要删除的路径和文件模式。社区也贡献了大量现成的清理器定义。

---

## 三、安装

**Linux**——各发行版包管理器直接安装：

```bash
# Debian/Ubuntu
sudo apt install bleachbit

# Fedora
sudo dnf install bleachbit

# Arch Linux
sudo pacman -S bleachbit
```

**Windows**——从[官网](https://www.bleachbit.org/download)下载安装包，安装后直接运行。

> **注意：** BleachBit 是系统级清理工具，以当前用户权限运行。Linux 上如果需要清理系统范围的目录（如 `/tmp`、`/var/log`），建议以 sudo 运行。清理前建议先用预览功能检查会删除的文件，确认无误后再执行。

---

## 四、和其他工具比

| 对比维度 | BleachBit | CCleaner | 系统自带磁盘清理 |
|---------|-----------|----------|--------------|
| **开源** | 是 | 否 | 是（内置） |
| **跨平台** | Windows + Linux | Windows 为主 | 仅 Windows |
| **清理规则数** | 数百条 | 类似 | 有限 |
| **命令行模式** | 支持 | 受限 | 不支持 |
| **隐私擦除** | 支持（文件覆盖） | 需付费版 | 不支持 |
| **更新频率** | 持续维护 | 持续 | 系统更新附带 |

BleachBit 最大的优势是**开源**和**跨平台**。如果你在 Windows 和 Linux 之间切换，同一套工具两边都能用；如果你在意隐私，BleachBit 不会将你的清理数据上传到云端；如果你需要自动化，命令行模式也给了足够的灵活性。

---

**相关链接：**
- [官网](https://www.bleachbit.org)
- [GitHub 仓库](https://github.com/bleachbit/bleachbit)
- [文档](https://docs.bleachbit.org)
- [下载](https://www.bleachbit.org/download)
