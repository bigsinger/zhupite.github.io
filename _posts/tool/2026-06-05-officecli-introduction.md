---
layout: post
title: "OfficeCLI — AI Agent 专属的 Office 文档操作 CLI"
categories: [tool]
description: "OfficeCLI 是首个为 AI Agent 设计的 Office 文档 CLI 工具，单个二进制文件即可创建、读取、编辑 Word、Excel、PowerPoint，无需安装 Office。内置渲染引擎、批量处理、MCP 服务，开源免费。"
keywords: OfficeCLI, Office, CLI, AI Agent, 文档自动化, Word, Excel, PowerPoint, 开源, MCP
tags:
  - OfficeCLI
  - 文档自动化
  - AI Agent
  - CLI工具
  - 开源
  - Word
  - Excel
  - PowerPoint
---

## OfficeCLI 是什么

[OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) 是一个**为 AI Agent 量身打造的 Office 文档操作 CLI 工具**。它让你（或你的 AI Agent）只用一行命令就能创建、读取和编辑 Word、Excel、PowerPoint 文件。

特点非常突出：

- **单个二进制文件** — 将 .NET 运行时内置，下载即用，无需安装 Office
- **三种格式全支持** — `.docx` / `.xlsx` / `.pptx`，一个工具搞定
- **AI 原生设计** — 所有命令输出 JSON，Agent 可直接消费
- **内置渲染引擎** — 不装 Office 也能把文档渲染成 HTML 或截图
- **内建公式与透视表引擎** — 150+ Excel 函数自动求值
- **MCP 服务器** — 可作为 MCP 工具被 Claude Code 等直接调用

项目使用 C# 编写，Apache-2.0 协议，GitHub **6,100+ Star**，配套有桌面客户端 [AionUi](https://github.com/iOfficeAI/AionUi)。

> 一句话：AI Agent 操作 Office 文档的标准化接口，像操作文件系统一样操作 docx/pptx/xlsx。

## 核心特性

### 1. 路径式元素定位

OfficeCLI 用稳定的路径语法定位文档元素，Agent 无需理解 XML 命名空间：

```bash
# 定位幻灯片和形状
officecli get deck.pptx '/slide[1]/shape[2]'

# CSS 风格查询
officecli query report.docx "paragraph[style=Heading1]"
officecli query report.docx "run:contains(TODO)"
```

路径使用 1-based 索引和元素本地名称，比 XPath 更简洁。

### 2. 三层操作架构

从简单到深入，按需选择：

| 层级 | 用途 | 命令 |
|------|------|------|
| **L1: 阅读** | 文档内容的语义化视图 | `view`（支持 text/outline/annotated/html/svg/screenshot 等） |
| **L2: DOM** | 结构化元素操作 | `get`、`query`、`set`、`add`、`remove`、`move`、`swap` |
| **L3: 原始 XML** | 直接 XPath 访问，万能回退 | `raw`、`raw-set`、`add-part`、`validate` |

```bash
# L1 — 文档概览
officecli view report.docx annotated

# L2 — 添加幻灯片
officecli add deck.pptx / --type slide --prop title="Q4 报告"

# L3 — 直接注入 XML
officecli raw-set report.docx document --xpath "//w:p[1]" --action append --xml '<w:r><w:t>插入文本</w:t></w:r>'
```

### 3. 内置渲染引擎

不再需要 Office 来预览文档效果。OfficeCLI 内置了从零编写的渲染引擎，支持：

- **`view html`** — 生成独立的 HTML 文件，所有资源内联
- **`view screenshot`** — 逐页 PNG 截图，多模态 AI 可直接读取
- **`watch`** — 启动本地 HTTP 服务，实时预览，每次修改自动刷新

```bash
officecli view deck.pptx html -o /tmp/deck.html
officecli view deck.pptx screenshot -o /tmp/deck.png
officecli watch deck.pptx    # 打开 http://localhost:26315
```

> 没有可视化，Agent 生成幻灯片就像闭着眼睛操作 — 它能看到元素结构，但不知道标题是否溢出、两个形状是否重叠。内置渲染引擎让 Agent 在任何环境下（包括 CI/Docker）都能「看」到自己的输出。

### 4. 内置公式与透视表引擎

150+ Excel 函数自动求值，写入 `=SUM(A1:A2)` 后 `get` 单元格即可读到计算结果，无需 Office 回算。支持动态数组函数（`FILTER` / `UNIQUE` / `SORT` / `SEQUENCE`）。

透视表也是一条命令创建：

```bash
officecli add sales.xlsx '/Sheet1' --type pivottable \
  --prop source='Data!A1:E10000' --prop rows='Region,Category' \
  --prop cols=Quarter --prop values='Revenue:sum,Units:avg'
```

### 5. 模板合并

`merge` 命令将 `{{key}}` 占位符替换为 JSON 数据，支持在段落、表格、形状、页眉页脚、图表标题中替换：

```bash
# Agent 设计一次模板，下游填充 N 次（省 tokens，保证一致性）
officecli merge invoice-template.docx invoice-001.docx '{"client":"Acme","total":"$5,200"}'
officecli merge q4-template.pptx q4-acme.pptx data.json
```

避免 Agent 每次从头生成报告时输出 N 个不一致的布局。

### 6. 文档转储（Round-trip）

`dump` 将任意 `.docx` 序列化为可回放的批处理 JSON，Agent 从已有文档学习结构化规格后直接修改和回放：

```bash
officecli dump existing.docx -o blueprint.json
officecli batch new.docx --input blueprint.json
```

### 7. 暂停模式（Resident）与批处理

- **暂停模式**：文档保留在内存中，多次操作只开/关一次文件
- **批处理模式**：多条命令在一个打开/保存周期内执行

```bash
# 暂停模式
officecli open report.docx
officecli set report.docx /body/p[1]/r[1] --prop bold=true
officecli close report.docx

# 批处理模式
echo '[{"command":"set","path":"/slide[1]/shape[1]","props":{"text":"Hello"}}]' \
  | officecli batch deck.pptx --json
```

## 快速上手

```bash
# 1. 安装（macOS / Linux）
curl -fsSL https://raw.githubusercontent.com/iOfficeAI/OfficeCLI/main/install.sh | bash

# Windows（PowerShell）
irm https://raw.githubusercontent.com/iOfficeAI/OfficeCLI/main/install.ps1 | iex

# 验证安装
officecli --version

# 2. 创建一个 PowerPoint
officecli create deck.pptx

# 3. 添加内容
officecli add deck.pptx / --type slide --prop title="Hello, World!"
officecli add deck.pptx '/slide[1]' --type shape \
  --prop text="这是一段文字" --prop x=2cm --prop y=5cm

# 4. 实时预览
officecli watch deck.pptx

# 5. 导出为 HTML
officecli view deck.pptx html -o /tmp/deck.html
```

## AI Agent 集成

### 方式一：MCP 服务器

OfficeCLI 内置 MCP 服务，一条命令注册到你的 AI 工具：

```bash
officecli mcp claude    # Claude Code
officecli mcp cursor    # Cursor
officecli mcp vscode    # VS Code / Copilot
```

所有文档操作以 JSON-RPC 工具形式暴露，无需 Shell 权限。

### 方式二：Skill 自动安装

安装二进制后，OfficeCLI 自动检测 Claude Code、Cursor、Copilot 等工具的配置目录并安装 Skill 文件。手动方式：

```bash
curl -fsSL https://officecli.ai/SKILL.md
# 将内容提供给 AI Agent 即可
```

### 为什么 Agent 喜欢 OfficeCLI

- **确定性 JSON 输出** — 每条命令支持 `--json`，一致的模式，Agent 无需解析 stdout
- **路径式寻址** — Agent 不需要理解 XML 命名空间就能操作文档
- **渐进复杂度** — 从只读视图开始，逐步升级到 DOM 操作，最后才需要原始 XML
- **自愈工作流** — 流程化的错误码（`not_found`、`invalid_value`）附带建议值，Agent 可以自行修正
- **自我可视化** — 能在 CI/无头环境下「看到」生成的文档样式是否正确

## 对比其他方案

| | OfficeCLI | Microsoft Office | LibreOffice | python-docx/openpyxl |
|---|---|---|---|---|
| 开源免费 | ✅ | ❌ 付费 | ✅ | ✅ |
| AI原生CLI+JSON | ✅ | ❌ | ❌ | ❌ |
| 单文件零安装 | ✅ | ❌ | ❌ | ❌（需 Python + pip）|
| 任意语言调用 | ✅ CLI | ❌ COM/Add-in | ❌ UNO API | Python 专用 |
| 路径式元素访问 | ✅ | ❌ | ❌ | ❌ |
| 原始 XML 回退 | ✅ | ❌ | ❌ | 部分 |
| 内置渲染引擎 | ✅ | ❌ | ❌ | ❌ |
| 无头 HTML/PNG 输出 | ✅ | ❌ | 部分 | ❌ |
| 模板合并 | ✅ | ❌ | ❌ | ❌ |
| 实时预览 | ✅ | ❌ | ❌ | ❌ |
| 跨平台 | ✅ | Windows/Mac | ✅ | ✅ |
| Word+Excel+PPT | ✅ | ✅ | ✅ | 分开的库 |

## 优劣势分析

### 优势

| 优势 | 说明 |
|------|------|
| **真正的零依赖** | 单二进制，不装 Office、不装 .NET Runtime、不装 Python |
| **AI Agent 体验一流** | JSON 输出、MCP 服务、Skill 自动安装、自愈错误机制 |
| **所见即所得** | 内置渲染引擎让 Agent（和人类）都能预览文档外观 |
| **功能覆盖完整** | Word/Excel/PPT 全部支持，公式、透视表、动画、3D 模型 |
| **开发友好** | 路径语法直观，Python 等语言可一行调用获取 JSON |

### 劣势

| 劣势 | 说明 |
|------|------|
| **体积较大** | 因内嵌 .NET 运行时，单二进制约 50-100MB |
| **不支持旧格式** | 仅 `.docx`/`.xlsx`/`.pptx`，不兼容 `.doc`/`.xls`/`.ppt` |
| **依赖插件扩展** | 如 `.pdf` 导出需要通过插件扩展 |
| **Excel 微调有限** | 由于无 GUI，单元格格式微调不如手动操作灵活 |
| **社区相对年轻** | 相比 python-docx 等成熟库，文档和社区还在成长 |

## 适合谁用

- **AI Agent 用户** — 想让 Agent 帮你生成 PPT 汇报、Excel 报表、Word 文档
- **文档自动化工程师** — 需要批量生成合同、发票、报告等标准化文档
- **CI/CD 管道** — 在 Docker 中无头生成 Office 文档并验证
- **开发者** — 不想记 python-docx/openpyxl/python-pptx 三个库不同 API
- **不装 Office 的用户** — 偶尔需要创建或编辑 Office 文件，但不想安装庞大的 Office 套件

## 总结

OfficeCLI 的出现解决了 AI Agent 操作 Office 文档的「最后一公里」问题。在此之前，Agent 要生成文档要么用 python-docx 等库（需要复杂编程），要么依赖 Office 的 COM 接口（只限 Windows）。OfficeCLI 给出了一个更干净的答案：**一个跨平台、零依赖、AI 原生的 CLI 工具**。

配合它的渲染引擎和 MCP 服务，Agent 可以完成「生成文档 → 预览效果 → 发现并修复问题 → 再生成」的完整闭环。如果你正在寻找一种让 AI 直接产出可交付 Office 文件的方式，OfficeCLI 是目前最好的选择。
