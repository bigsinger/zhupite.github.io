---
layout: post
title: "NVIDIA 发布 Secure Agent Workspace，用 GPU 硬件隔离保护 AI Agent"
categories: [sec]
description: "NVIDIA 发布 Secure Agent Workspace 参考设计，基于 Confidential Computing 为 AI Agent 提供 GPU 硬件级安全隔离。Agent 运行在加密的 GPU 内存中，主机 OS 被攻破也无法读取执行上下文。"
tags:
  - AI Agent
  - NVIDIA
  - Secure Agent Workspace
  - 机密计算
  - GPU 安全
---

## 事件基线

2026 年 6 月 30 日，NVIDIA 在官方技术博客发布 **Secure Agent Workspace（SAW）参考设计**，为运行在企业 GPU 基础设施上的 AI Agent 提供硬件级安全隔离。这是一个架构层面的产品——不是 SDK，不是网关，而是定义了「Agent 应该怎样安全地运行」的完整参考架构。

## 核心设计理念

Secure Agent Workspace 提出了一个架构上的根本转变：**用户的设备（笔记本、浏览器、IDE、终端）只作为表现层（Presentation Layer），Agent 的执行发生在受管工作区（Managed Workspace）中**。

```
用户设备（表现层）         受管工作区（执行层）
     ↓                          ↓
  浏览器/IDE/终端     →    GPU 机密计算空间
                            ↓
                    身份、网络、凭证、策略、审计、人工审批
```

在这个架构下，Agent 执行的安全不再依赖用户终端的安全状态，而是由企业 GPU 基础设施强制执行。

## 安全机制

SAW 基于 **NVIDIA Confidential Computing** 技术，核心能力包括：

- **GPU 内存加密**：Agent 运行时的内存、模型权重和中间数据在 GPU 内部加密，即使主机操作系统被攻破，攻击者也无法读取 Agent 的执行上下文
- **硬件级隔离**：Agent 之间的隔离在 GPU 硬件层面完成，而非依赖 OS 进程隔离
- **可信执行环境**：通过 GPU 的 TEE（可信执行环境）确保 Agent 代码的完整性和机密性

## 实施路线：两阶段演进

NVIDIA 将 SAW 的实现分为两个阶段：

### 第一阶段：外围安全
在虚拟机外围建立安全边界——谁可以进入、如何进入、获得什么工作区、工作区可以访问哪些服务。

- 每个用户获得独立的企业管理 VM
- SSO 管控访问，未经认证无法开启工作区
- 默认阻止所有互联网流量，仅允许指向预审批服务的连接
- 任何修改系统的 Agent 操作必须经人工审批
- 所有工作区活动日志汇总到单一安全监控点

### 第二阶段：运行时安全
在 VM 内部增加对 Agent 实际行为的管控，保护向工具调用边界。

- Agent 在专用运行时中运行，实时监控每个动作
- 中央策略系统定义 Agent 的授权范围（可读文件、可执行的命令、可访问的服务）
- 凭证通过安全代理管理，Agent 不接触原始密钥
- 每次 Agent 执行操作前自动检查安全规则是否生效

## 本周 Agent 安全产品总览

加上 NVIDIA，本周已有五起 Agent 安全相关的重要发布：

| 时间 | 产品 | 防护层级 |
|:----:|------|---------|
| 2026-06-29 | Straiker 6400 万 A 轮 | 运行时行为分析 |
| 2026-06-30 | Microsoft MCP 攻击路径警告 | 平台安全标准 |
| 2026-06-30 | Cisco AI Defense SDK | 软件层检测 |
| 2026-06-30 | NVIDIA Secure Agent Workspace | **GPU 硬件层隔离** |
| 2026-07-01 | Vorlon Guardian Gateway | 网络代理网关 |

NVIDIA 的入局标志着 Agent 安全正从软件层向**硬件层延伸**。当 GPU 厂商开始定义 Agent 的安全执行环境时，说明 Agent 已经不再是「实验性项目」，而是企业基础设施的一部分。

## 参考资料

- NVIDIA Technical Blog: [How to Govern Autonomous Agents in Enterprise AI Factories](https://developer.nvidia.com/blog/how-to-govern-autonomous-agents-in-enterprise-ai-factories/)（2026-06-30）
