---
layout: post
categories: [tool]
title: "MooTool：一款跨平台开发者常备小工具集合"
tags: [开源, 工具, JavaFX, 跨平台, 开发者工具, GitHub]
description: "MooTool 是一站式跨平台（Windows/macOS/Linux）开发者辅助工具集合，集成翻译、HTTP 调试、UA 解析、图片 OCR、Cron 解析、JSON/Protobuf 互转、系统信息查看等十多个高频小工具，一个 App 覆盖开发者的日常"工具箱"需求。"
---

## MooTool 是什么

**MooTool** 是一站式跨平台开发者辅助工具集，由开发者「周波」在 GitHub 上开源维护。

它的核心理念很简单：**把开发人员日常高频使用的零散小工具，整合到一个桌面 App 里。**

当前支持 Windows、macOS、Linux 三大平台，使用 JavaFX 构建原生桌面界面，提供多主题和系统托盘支持。

> 项目地址：[https://github.com/rememberber/MooTool](https://github.com/rememberber/MooTool)

---

## 内置了哪些工具

MooTool 将功能以 Tab 页形式组织在一个窗口中，侧栏还提供批量文本操作面板。目前集成的主要工具有：

### 翻译模块

支持中、英、日、韩、法、西、德、俄等 20+ 语言的互译，支持自动检测输入语言。翻译源使用 Google / Bing，失败时自动降级——网络不稳定时不会直接报错。

### HTTP 请求工具

支持 GET / POST / PUT / DELETE / HEAD / PATCH / OPTIONS 等常见方法。适合日常调试 API 接口，不用专门打开 Postman 或 cURL。

### User-Agent 分析

- **UA 解析**：从 UA 字符串中提取浏览器类型、渲染引擎、操作系统、设备类型/品牌/型号
- **UA 预设**：快速选择 Chrome、Firefox、Safari、Edge、微信内置浏览器、curl 等常见 UA，方便测试不同客户端表现

### 编码与字符串工具

- **Native ↔ ASCII**：字符与十进制/十六进制编码互转
- **随机字符串生成**：指定长度，纯数字/纯字母/字母数字组合
- **颜色混合计算**：取反、相交、相加、差值、平均等运算

### 图片工具

- **图片缩放**：放大、缩小、原始尺寸、适应窗口
- **图片 OCR**：基于 Tesseract 的文字识别，支持从图片中提取文字

### Cron 表达式解析

支持 Linux 标准的 5 段格式，也支持 Quartz 框架的 6 段和 7 段格式。输入表达式即可看到对应的执行时间描述——调试定时任务时很方便。

### 代码格式化

粘贴文本后一键格式化，支持：
- Nginx 配置文件
- Java 代码
- XML
- HTML

### 系统信息查看

基于 OSHI 库采集本机系统与硬件信息，进入 Tab 或点击刷新时按需加载，不会在启动时拖慢速度。

### JSON ↔ Protobuf 互转

在配置文件和协议调试场景中高频使用的功能——JSON 与 Protobuf 二进制格式之间的相互转换。

### 更多

- **PDF 相关工具**
- **环境变量查看**
- **配置文件格式转换**
- **历史记录**：所有模块统一管理历史输入输出，支持搜索、应用、复制、删除与清空

---

## 界面与使用体验

MooTool 的界面设计走的是实用路线：

- **多 Tab 布局**：各工具以标签页切换，不重叠不干扰
- **侧栏批量文本操作**：支持选中行批量处理，减少重复操作
- **系统托盘**：macOS / Windows 下关闭窗口时隐藏到托盘，应用继续在后台运行
- **多主题切换**：Flat Light/Dark、macOS、One Dark、Monokai 等多种配色，照顾不同偏好

---

## 技术栈与构建

| 维度 | 说明 |
|------|------|
| **语言** | Java |
| **UI 框架** | JavaFX |
| **平台覆盖** | Windows、macOS (Intel + Apple Silicon)、Linux |
| **系统信息** | OSHI |
| **OCR** | Tesseract |
| **打包方式** | Maven + jlink，支持各平台原生安装包 |
| **JDK 管理** | 自动化脚本下载 Eclipse Temurin 21，不依赖本地 JDK 版本 |

项目在 GitHub Actions 上配置了 CI，打标签时会自动构建各平台安装包并上传到 Release。也支持本地构建指定平台包，如 `mvn clean package -Pmac-arm64` 直接打出 macOS Apple Silicon 的 dmg。

---

## 适合谁用

**如果你是以下角色之一，MooTool 值得一试：**

- **后端开发**：经常调试 API、看系统日志、写 Cron 表达式、做 JSON/Protobuf 互转
- **前端开发**：需要模拟不同 UA 测试页面效果、处理图片和文字识别
- **运维工程师**：查看系统信息、解析 Nginx 配置、处理环境变量
- **全栈/独立开发者**：一个人扛所有事，桌面放一个 MooTool 顶五六个在线工具站

**它解决的是这样一个场景：** 平时开发中总有那么几十个小操作——查个编码、转个格式、看下 UA、测个接口。每个操作都能在网上找到在线工具，但来回切换浏览器标签、忍受广告、担心数据泄露，体验很差。MooTool 把它们全部拉到本地、放在一个窗口里，没网也能用。

## 参考资料

- **GitHub 仓库**：[https://github.com/rememberber/MooTool](https://github.com/rememberber/MooTool)
- **Gitee 镜像**：[https://gitee.com/zhoubochina/MooTool/releases](https://gitee.com/zhoubochina/MooTool/releases)
