---
layout: post
title: "Penpot：开源设计平台，比 Figma 多一份归属权"
categories: [tool]
description: "Penpot 是一个开源的设计与原型协作平台，支持自托管、实时协作、设计 Token 和 MCP 服务器，面向需要设计资产所有权和定制能力的团队。"
tags:
  - 设计工具
  - 开源
  - Figma 替代
  - 协作设计
  - 自托管
---

Penpot 是一个开源的设计与原型协作平台，定位上对标 Figma、Sketch 和 InVision，但有一个根本区别：**你拥有你的设计基础设施**。

项目采用 MPL-2.0 许可证，源码托管在 [GitHub](https://github.com/penpot/penpot)，当前最新版本是 2026 年 6 月 11 日发布的 [2.16.0](https://github.com/penpot/penpot/releases/tag/2.16.0)。既可以直接在浏览器中使用 Penpot 托管的在线版，也可以在自有服务器上用 Docker 部署。

## 它解决什么问题

设计流程中有一个长期存在的不对称：开发者有 Git 和自托管仓库，能完整控制代码资产的版本、权限和备份；而设计资产往往托管在 SaaS 平台上，公司对数据只有使用权，没有真正的代码级控制权和数据迁移自由。

Penpot 的目标是让设计基础设施获得和代码基础设施相同的自主权：

- **自托管**：用 Docker 在自有服务器上跑，数据不出网
- **开放标准**：设计的存储格式是 SVG、CSS 和 JSON，而非私有二进制格式
- **无供应商锁定**：许可证和格式双重保障迁移自由

## 核心工作流

### 设计与原型

Penpot 提供一套完整的矢量设计工具：画板、图层、形状、文本、组件、钢笔路径——功能和 Figma 等主流工具处于同一量级。支持多页面文档和实时多人协作，光标和选区状态实时同步。

### CSS Grid 与 Flex Layout

一个值得关注的功能是 Penpot 原生支持 CSS Grid 和 Flexbox 布局引擎。设计师在画布上搭建的布局可以直接输出为 CSS 代码，开发者从 Inspect 面板拿到的样式基本可以直接用。这种做法减少了「设计还原」的翻译误差。

### Design Tokens（设计 Token）

Penpot 内置了 Design Tokens 系统，这是 2.x 系列的核心能力。设计师可以定义颜色、字号、间距、圆角等原子级设计变量，然后在组件和画板中引用。Token 修改后所有引用的地方自动更新。开发者可以通过 API 或 MCP 服务器读取 Token 列表，让设计和开发共用同一个变量源。

### MCP 服务器

Penpot 在 2.x 中加入了 MCP（Model Context Protocol）服务器支持。这是一个值得注意的设计：通过标准协议，AI 工具和开发者脚本可以直接读取和操作 Penpot 中的设计数据——获取 Token 列表、读取图层属性、导出 SVG。这意味着设计文件不再是黑箱，而是可编程的资产。

### 插件系统与开放 API

Penpot 提供基于 Web 标准（HTML/CSS/JS 构建插件 UI）的插件系统，以及 REST API（支持 Access Token 认证）。自动化工作流、与内部工具集成、批量导出等场景可以通过 API 和 Webhook 完成。

## 快速上手

### 使用云端版

最直接的方式是访问 [penpot.app](https://penpot.app/)，注册账号后在浏览器中直接使用，不需要安装任何软件。

### 自托管部署

官方提供 Docker Compose 编排，部署流程大致如下：

```bash
git clone https://github.com/penpot/penpot.git
cd penpot/docker
# 使用官方 Docker Compose 配置文件
cp config.env.template config.env
# 编辑 config.env 设置域名、邮箱等
docker compose -p penpot up -d
```

启动后访问 `http://your-server:9001` 即可看到 Penpot 界面。官方文档的 [安装指南](https://help.penpot.app/technical-guide/getting-started/) 提供了更详细的配置选项，包括反向代理、SSL 和外部数据库设置。

### 熟悉界面

Penpot 的界面布局与主流设计工具相似：左侧图层/组件/资源面板，中央画布，右侧属性面板。上手门槛不高。建议从官方提供的 [Learning Center](https://learn-penpot.com/) 教程开始。

## 适用场景

- **对数据安全有要求的团队**——金融、医疗、政务等领域，设计资产需要留在自己的服务器上
- **有定制需求的团队**——需要 API 集成、自动导出、CI/CD 管线接入的团队
- **预算敏感的开源/非营利项目**——零许可费的开源工具
- **希望设计-开发对齐的团队**——CSS Grid/Flex 布局和 Design Tokens 能减少还原偏差

## 局限与现状

- **插件生态**：不如 Figma 成熟，社区插件数量有限，部分高级场景需自己开发
- **字体与技术资源**：自托管需自行处理字体授权和技术运维（Docker、数据库、备份）
- **学习成本**：从 Figma 迁移到 Penpot 的团队成员需要时间适应工具差异
- **部分高级功能**：如高级动画、复杂原型交互，Penpot 仍不如 Figma 完整
- **性能**：复杂大型文件（数百画板、大量图层）下性能表现不如 Figma 流畅

## 项目状况

Penpot 由 Kaleidos 公司维护（同属开源公司，与 Taiga 项目同一团队），自 2021 年开源至今积累了稳定的社区和商业用户。版本迭代频率大约每月一个次要版本。核心架构使用 Clojure（后端）和 ClojureScript（前端），通过 WebSocket 实现实时协作。

对于「需要一个开放设计平台、不想被 SaaS 锁定」的团队，Penpot 是目前最成熟的选项。它未必能在每项功能上超越 Figma，但从数据归属权和基础设施自主性的角度看，它提供了一个根本性的不同选择。

**项目地址**：[https://github.com/penpot/penpot](https://github.com/penpot/penpot)
**官方网站**：[https://penpot.app/](https://penpot.app/)
**文档**：[https://help.penpot.app/](https://help.penpot.app/)
