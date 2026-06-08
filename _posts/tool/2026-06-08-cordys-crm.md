---
layout: post
title: "Cordys CRM：飞致云出品的新一代开源 AI CRM 系统"
categories: [tool]
description: "飞致云（1Panel 团队）推出的开源 AI CRM 系统，覆盖线索到回款（L2C）全流程管理，集成 DataEase BI 分析引擎、CRM Skills AI 接口、MCP Server，为私有化部署而生。"
keywords: Cordys CRM, CRM系统, 开源CRM, AI CRM, 飞致云, 1Panel, L2C, DataEase
tags: [tool, open-source, "Cordys CRM", 飞致云, CRM, 开源, AI, 私有化部署]
---

# Cordys CRM：飞致云出品的新一代开源 AI CRM 系统

## 项目概览

**Cordys CRM** 是飞致云（Fit2Cloud）继 1Panel、JumpServer、DataEase 之后推出的又一款重磅开源产品，定位为"集信息化、数字化、智能化于一体"的客户关系管理系统。

| 指标 | 数据 |
|------|------|
| 仓库 | https://github.com/1Panel-dev/CordysCRM |
| Stars | **2,257** |
| Forks | 453 |
| 编程语言 | Java（后端）+ Vue.js（前端） |
| 开源协议 | FIT2CLOUD Open Source License（基于 GPLv3） |
| 创建时间 | 2025-08-24 |
| 部署方式 | Docker 一键部署 |

---

## 一、什么是 Cordys CRM

Cordys CRM 是一个覆盖 **L2C（Lead to Cash，从线索到回款）** 全流程的开源 CRM 系统。它的团队背景（飞致云）值得关注——飞致云旗下拥有 JumpServer（堡垒机）、1Panel（服务器面板）、DataEase（BI 工具）、MaxKB（知识库）等众多知名开源产品。

> 2025 年 7 月，飞致云正式用自己的 Cordys CRM 替换了使用了 **7 年的 Salesforce CRM**——这就是所谓的"吃自己的狗粮"。

---

## 二、核心功能模块

### 2.1 线索管理

| 功能 | 说明 |
|------|------|
| 线索获取 | 多渠道线索导入与自动分配 |
| 线索评分 | 按规则自动评分，识别高质量线索 |
| 智能分配 | 按区域/产品/能力自动分派给对应销售 |
| 线索流转 | 跟进状态追踪，自动转入客户 |

### 2.2 客户与联系人

- 客户档案管理（公司信息、行业、规模等）
- 联系人关联与层级管理
- 客户交互历史全记录
- 客户分群与标签管理

### 2.3 商机跟进

| 功能 | 说明 |
|------|------|
| 商机阶段管理 | 自定义销售阶段（发现→确认→方案→报价→谈判→赢单/输单） |
| 赢率预测 | 基于阶段和历史数据的成交概率分析 |
| 跟进记录 | 每次沟通的日志与待办事项 |
| 竞争分析 | 记录竞争对手信息与优劣势 |

### 2.4 合同与回款

| 模块 | 功能 |
|------|------|
| **标讯** | 商机线索与公开招标信息对接 |
| **报价** | 报价单生成与管理，支持模板化报价 |
| **合同** | 合同创建、审批、归档、变更管理 |
| **回款** | 回款计划、回款执行与到账确认 |
| **发票** | 发票管理，含工商抬头管理 |
| **审批流** | 自定义审批流程与审批记录 |

### 2.5 BI 分析与 AI

| 特性 | 说明 |
|------|------|
| **DataEase 集成** | 深度融合 DataEase 分析引擎，销售数据可视化 |
| **CRM Skills** | 开放 AI 接口，支持 OpenClaw、WorkBuddy 等 AI 助手 7×24 小时在线 |
| **MCP Server** | 开放 MCP 协议接口，支持第三方工具集成 |
| **MaxKB 对接** | 对接飞致云 MaxKB 知识库，实现智能问答 |

---

## 三、快速部署

### Docker 一键部署

```bash
docker run -d \
  --name cordys-crm \
  --restart unless-stopped \
  -p 8081:8081 \
  -p 8082:8082 \
  -v ~/cordys:/opt/cordys \
  1panel/cordys-crm
```

部署后访问 `http://<你的服务器IP>:8081/`，默认账号 `admin` / 密码 `CordysCRM`。

### 其他安装方式

| 方式 | 说明 |
|------|------|
| **1Panel 应用商店** | 通过 1Panel 面板一键安装 |
| **离线安装包** | 支持无互联网环境的部署 |

---

## 四、技术架构

| 组件 | 技术选型 |
|------|---------|
| 后端框架 | Spring Boot |
| 前端框架 | Vue.js + Naive UI + Vant UI |
| 数据库 | MySQL |
| 缓存 | Redis |
| 基础设施 | Docker |
| BI 引擎 | DataEase |
| AI 接口 | CRM Skills + MCP Server |
| 移动端 | 响应式设计，移动端适配 |

---

## 五、Roadmap 演进

| 时间 | 版本 | 重点功能 |
|------|------|---------|
| 2024.09 | 第一行代码 | 项目启动 |
| 2025.07 | v1.0 | 替换飞致云自身 Salesforce（吃狗粮） |
| 2025.08 | v1.1.6 | 开始公开测试 |
| 2025.10 | v1.2.0 | 开放 MCP Server，对接 MaxKB |
| 2025.11 | v1.3.0 | 代码正式开源 |
| 2025.12 | v1.4.0 | 标讯、报价、合同模块 |
| 2026.01 | v1.5.0 | 工商抬头、发票、回款管理 |
| 2026.03 | CRM Skills | 正式发布 AI 接口 |
| 2026.03 | v1.6.0 | 订单模块、计算组件增强 |
| 2026.05 | v1.7.0 | **审批流、审批记录**（最新） |

---

## 六、优劣势分析

| 优势 | 说明 |
|------|------|
| **全链路覆盖** | 线索→客户→商机→合同→回款，端到端闭环 |
| **私有化部署** | Docker 一键部署，数据 100% 自主可控 |
| **AI 能力整合** | CRM Skills 接口 + MCP Server，AI 可深入销售每个环节 |
| **BI 分析内建** | 融合 DataEase，数据可视化开箱即用 |
| **飞致云生态** | 与 1Panel、JumpServer、MaxKB 等产品无缝整合 |
| **自身验证** | 飞致云已用其替换 Salesforce 超过 1 年 |

| 劣势 | 说明 |
|------|------|
| **开源协议有额外限制** | 不能替换 Logo 和版权信息，商业授权需联系官方 |
| **Docker 依赖** | 部署需要 Docker 环境和 Linux 服务器 |
| **社区规模初期** | 2,257 Stars，相比 Salesforce/SugarCRM 生态尚小 |
| **AI 能力依赖外部模型** | CRM Skills 本身是接口层面，实际 AI 效果需要外部模型支撑 |
| **定制化门槛** | 深层定制需要 Java/Vue 开发能力 |

---

## 七、适合谁用

- **中小企业**——需要一个开箱即用、私有化部署的 CRM
- **正在从 Salesforce 迁移的团队**——开源 CRM 的国产替代方案
- **已经使用 1Panel/JumpServer 的组织**——飞致云生态用户，整合成本低
- **关注数据安全的公司**——私有化部署，数据完全自主可控
- **希望引入 AI 的销售团队**——CRM Skills 接口让 AI 深入销售流程

---

## 总结

Cordys CRM 最值得关注的点不是功能列表，而是**它的团队背景和自用验证**——飞致云用 7 年代码替换了 Salesforce，这意味着 Cordys CRM 已经经受了真实企业场景的考验。

对于中国市场的企业来说，Cordys CRM 提供了 Salesforce、HubSpot 等海外 CRM 的**国产开源替代方案**，特别是在数据主权和私有化部署方面有明显的本地化优势。

---

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/1Panel-dev/CordysCRM |
| 官方文档 | https://cordys.cn/docs/ |
| Docker 镜像 | `1panel/cordys-crm` |
| CRM Skills | https://github.com/1Panel-dev/CordysCRM-skills |
