---
layout: post
title: "youdaonote-pull：有道云笔记一键导出备份脚本"
categories: [tool]
description: "Python 脚本一键导出/备份有道云笔记所有笔记。自动转换为 Markdown 格式，支持图床图片下载或上传到 SM.MS。全过程本地运行，无需担心数据安全。"
keywords: youdaonote-pull, 有道云笔记, 笔记导出, 笔记备份, Python, Markdown转换
tags: [tool, open-source]
  - 有道云笔记
  - 笔记导出
  - Python
  - 数据备份
---

# youdaonote-pull：有道云笔记一键导出备份脚本

## 项目介绍

**youdaonote-pull** 是一个 Python 脚本，用于将**有道云笔记**中的所有笔记一键导出/备份到本地。解决有道云笔记无法导出笔记的痛点。

有道云笔记的 Mac 客户端和网页端去除了导出所有笔记的功能。此脚本通过模拟有道云笔记的 API 接口，将所有笔记按原格式下载到本地。

| 指标 | 数据 |
|------|------|
| 仓库 | https://github.com/DeppWang/youdaonote-pull |
| Stars | 1,789 |
| Forks | 360 |
| 编程语言 | Python |
| 开源协议 | MIT |
| 创建时间 | 2019-09-06 |

---

## 核心功能

| 功能 | 说明 |
|------|------|
| **全量导出** | 将所有笔记（文件）按原格式下载到本地 |
| **自动转 Markdown** | 「笔记」类型文件自动从 Xml/Json 转换为 Markdown |
| **图片本地化** | 有道云笔记图床图片下载到本地 |
| **图床迁移** | 支持选择上传到 SM.MS 图床 |
| **增量更新** | 多次运行只导出新增/修改的笔记，不会覆盖本地已修改文件 |
| **选择性导出** | 可指定导出某个文件夹 |

---

## 使用步骤

### 一、准备工作

#### 1. 安装 Git 并克隆项目

```bash
git clone https://github.com/DeppWang/youdaonote-pull.git
cd youdaonote-pull
```

#### 2. 安装 Python3 和依赖包

```bash
# macOS
python3 -m venv venv
. venv/bin/activate
pip3 install -r requirements.txt

# Windows
python -m venv venv
. venv/bin/activate
pip install -r requirements.txt
```

#### 3. 设置 Cookies 登录

由于有道云笔记登录升级加入了图形验证码，脚本目前**只能使用 Cookies 登录**，不能使用账号密码。

在 `cookies.json` 中填写你的登录 Cookies：

```json
{
    "cookies": [
        ["YNOTE_CSTK", "**", ".note.youdao.com", "/"],
        ["YNOTE_LOGIN", "**", ".note.youdao.com", "/"],
        ["YNOTE_SESS", "**", ".note.youdao.com", "/"]
    ]
}
```

获取方法：浏览器中登录有道云笔记 → 打开 DevTools(F12) → Network → 找到第一个请求 → 复制 Cookie 值。

> 脚本完全本地运行，不必担心 Cookies 泄露。

#### 4. 配置参数 `config.json`

```json
{
    "local_dir": "",
    "ydnote_dir": "",
    "smms_secret_token": "",
    "is_relative_path": true
}
```

| 参数 | 说明 |
|------|------|
| `local_dir` | 本地存放导出文件的文件夹（可选，默认为当前文件夹） |
| `ydnote_dir` | 有道云笔记指定导出文件夹名（可选，导出全部则不填） |
| `smms_secret_token` | SM.MS 的 Secret Token（可选，不填则仅下载到本地） |
| `is_relative_path` | Markdown 中图片/附件是否使用相对路径（可选） |

示例（Windows）：

```json
{
    "local_dir": "D:/Documents/youdaonote-pull/test",
    "ydnote_dir": "",
    "smms_secret_token": "SGSLk9yWdTe4RenXYqEPWkqVrx0Yexample"
}
```

### 二、运行导出

```bash
# macOS/Linux
python3 pull.py

# Windows
python pull.py
```

### 三、多次导出（增量同步）

再次运行同样的命令即可。脚本会根据有道云笔记文件最后修改时间与本地文件最后修改时间对比，判断是否需要更新。

- 只导出**新增、修改或未导出**的笔记
- **不会覆盖**本地已经修改的文件
- ⚠️ 不要同时在有道云笔记和本地修改同一个文件

---

## 工作原理

有道云笔记的正常使用流程是：浏览器（前端）调用服务器（后端）接口 → 接口返回文件内容 → 前端渲染显示。

youdaonote-pull 的原理是找到有道云笔记的 API 接口，模拟接口调用，将本应由前端显示的内容直接存放到本地文件。Xml 转换为 Markdown 借助了 `xml.etree.ElementTree`。

---

## 优劣势分析

| 优势 | 说明 |
|------|------|
| **完全本地运行** | 数据不经过第三方服务器，安全可控 |
| **自动转 Markdown** | 有道云笔记的私有 Xml 格式转为通用 Markdown，方便迁移到 Obsidian/Typora 等 |
| **图床图片处理** | 支持下载到本地或上传到 SM.MS，解决外链失效问题 |
| **增量更新** | 多次运行智能对比，不会破坏本地已修改文件 |
| **MIT 开源** | 可自由使用和修改 |

| 劣势 | 说明 |
|------|------|
| **仅支持 Cookies 登录** | 由于有道云笔记加了验证码，无法用账号密码自动登录 |
| **配置门槛** | 需要手动获取 Cookies 和配置 JSON，非技术用户可能觉得复杂 |
| **依赖有道云 API** | 如果有道云修改接口，脚本可能失效（需要社区及时跟进） |
| **图片转换复杂** | 需要额外配置 SM.MS Token 才能将图床图片上传到公共图床 |

---

## 适合谁用

- **有道云笔记老用户**——想迁移到 Obsidian / Typora / Notion 等更开放的笔记工具
- **需要备份笔记的人**——担心云端数据丢失，想本地留一份离线备份
- **从有道云笔记转出的所有用户**——因为官方去除了导出功能，这是目前最完整的替代方案

---

## 总结

youdaonote-pull 解决了一个非常具体的痛点：**有道云笔记去除了导出功能，用户想迁移却出不去。** 这个脚本提供了一个相对完整的解决方案——导出所有笔记、自动转 Markdown、处理图床图片。对于想要从有道云笔记迁移到 Obsidian 等开放笔记工具的用户来说，这是一个必备工具。

---

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/DeppWang/youdaonote-pull |
| Release 页面 | https://github.com/DeppWang/youdaonote-pull/releases |
| 开源协议 | MIT |

## 参考资料

- **GitHub 仓库**：源代码、Issue、使用教程。→ https://github.com/DeppWang/youdaonote-pull
- **作者博文**：更简单的使用教程和原理解析。→ https://depp.wang/2020/06/11/how-to-find-the-api-of-a-website-eg-note-youdao-com
- **B 站视频教程**：https://www.bilibili.com/video/BV11F411F7vG/
