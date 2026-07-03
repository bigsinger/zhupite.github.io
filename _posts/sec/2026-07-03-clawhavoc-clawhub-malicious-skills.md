---
layout: post
title: "ClawHavoc 大规模攻击：ClawHub 被植入 1,184 个恶意技能，24.7 万次安装"
categories: [sec]
description: "安全研究人员发现代号 ClawHavoc 的大规模供应链攻击，攻击者操纵 ClawHub 排名算法上传 1,184 个恶意 AI Agent 技能，诱导约 24.7 万次安装，含后门、数据窃取和凭证盗窃功能。"
tags:
  - AI Agent
  - OpenClaw
  - ClawHub
  - 供应链攻击
  - 技能市场
---

## 风险速览

2026 年 6 月 29 日，安全社区披露代号 **ClawHavoc** 的大规模供应链攻击——攻击者通过操纵 ClawHub 市场的排名机制，成功上传 **1,184 个恶意 AI Agent 技能**并诱导约 **24.7 万次安装**。这是迄今针对 AI Agent 应用市场最大规模的供应链攻击。

## 攻击细节

### 攻击规模

| 指标 | 数据 |
|------|------|
| 恶意技能数量 | 1,184 个 |
| 累计安装次数 | ~247,000 次 |
| 攻击持续时间 | 2026 年 6 月 |
| 受影响平台 | OpenClaw / ClawHub |
| 攻击编号 | ClawHavoc |

### 攻击手法

攻击者利用了两个关键弱点：

**1. 排名算法操纵**
ClawHub 的自动推荐算法根据技能下载量、评分和更新频率进行排序。攻击者通过自动化脚本大量刷下载量和虚假好评，将恶意技能推送到搜索结果前列。普通用户在搜索常用技能时，最先看到的是被操纵排名的恶意版本。

**2. 审核机制绕过**
恶意技能在外观上完全模仿合法技能——名称、描述、版本号都可信。恶意代码被隐藏在技能的内部配置文件中，部分技能的恶意载荷在审核时处于休眠状态，安装后才激活。

### 恶意能力

被植入的恶意技能包含三类后门：

| 类型 | 功能 | 影响 |
|------|------|------|
| 远程控制后门 | 攻击者可通过 C2 服务器远程操控受感染的 Agent | Agent 完全失控 |
| 数据窃取 | 窃取 Agent 处理过程中的敏感数据 | 数据泄露 |
| 凭证盗窃 | 盗窃 Agent 配置文件中的 API Key 和令牌 | 凭证泄露后可横向扩展攻击 |

## 与过往攻击的关联

这不是 ClawHub 第一次出现大规模恶意技能问题：

| 时间 | 事件 | 规模 |
|:----:|------|:----:|
| 2026 年 2 月 | THN 报道 341 个恶意技能窃取数据 | 341 个 |
| 2026 年 2 月 | Snyk 披露 clawdhub 后门投放 | 数百个 |
| 2026 年 2 月 | SC Media 报道大规模供应链攻击 | — |
| 2026 年 6 月 | **ClawHavoc：排名算法操纵** | **1,184 个 / 24.7 万次安装** |

从 2 月到 6 月，攻击规模在扩大，手法在升级——从单纯上传恶意技能升级为操纵平台排名算法自动传播。攻击者显然在从每次披露中学习并改进。

## 影响评估

24.7 万次安装意味着大量企业环境中的 AI Agent 可能已被植入后门。这些 Agent 如果拥有较高的操作权限（参考 Microsoft 分级模型中的 Level 2–4），攻击者不仅可以从 Agent 窃取数据，还可以利用 Agent 的工具调用能力向内网横向移动。

ClawHavoc 攻击还暴露了一个更深层的问题——**Agent 技能市场的安全模型从根本上就是脆弱的**。只要市场平台依赖下载量和评分作为推荐依据，攻击者就能通过操纵这些指标来毒化供应渠道。传统软件供应链中的「应用商店审核」模式在 Agent 市场面临同样的挑战，但 Agent 技能的攻击面比传统 App 更广（技能直接获得 Agent 的工具调用能力）。

## 参考资料

- gbhackers.com: "ClawHavoc Attack - ClawHub Malicious Skills"（2026-06-29）
- CyberSecurityNews: "ClawHub Skills Expose AI Agents to Remote Control Backdoors and Data Theft Attacks"（2026-06-29）
- cyberpress.org: "ClawHub Ranking Manipulation Lets Malicious Skills Automatically Infect AI Agents"（2026-06-29）
- Unit 42: "OpenClaw's Skill Marketplace and the Emerging AI Supply Chain Threat"（2026-06-23）
- The Hacker News: "Researchers Find 341 Malicious ClawHub Skills Stealing Data from OpenClaw Users"（2026-02-02）
