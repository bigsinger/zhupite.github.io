---
categories: [sec]
title: ModelCop 发布 AI Agent 安全平台，瞄准 250 亿美元机器身份市场
description: 安全初创公司 ModelCop 正式发布 AI Agent 安全平台，聚焦 $250 亿规模的机器身份市场。平台提供 Agent 身份发现、凭证管理、行为监控和威胁检测能力，目标客户群为部署大规模 Agent 集群的企业。标志 Agent 安全进入专业化产品阶段。
tags: [ModelCop, Agent 安全, 机器身份, IAM, 身份管理, 凭证管理]
---

## 一句话结论

安全初创公司 **ModelCop** 正式发布 AI Agent 安全平台，瞄准 **250 亿美元**的机器身份市场。平台提供 Agent 身份发现、凭证管理、行为监控和威胁检测四大核心能力，目标客户群为部署大规模 Agent 集群的企业。这标志着 Agent 安全正在从开源工具和框架插件阶段，进入专业化商业产品阶段，与传统的 IAM（身份与访问管理）市场形成差异化竞争。

> **来源说明**：原文 PR Newswire 发布于 2026 年 6 月 17 日，后经多个渠道转载。本文经核实，原文链接目前返回 404，基于用户摘要及 Google News 搜索确认的文章标题/摘要撰写。

## 产品定位：Agent 时代的机器身份管理

ModelCop 的核心洞察是：**AI Agent 是新一代的"机器身份"**——它们有自己的身份标识、需要访问敏感系统和数据、自主执行操作。但传统 IAM 工具是为人类用户设计的，无法理解 Agent 的行为模式。

| 维度 | 传统 IAM（人类身份） | Agent 身份管理 |
|------|---------------------|----------------|
| **身份主体** | 人类用户 | AI Agent（无人类身份） |
| **认证方式** | 密码/MFA/SSO | API 密钥/服务账号/令牌 |
| **行为模式** | 可预测的办公模式 | 动态生成的代码执行 |
| **审计需求** | 登录/访问日志 | 工具调用链/决策轨迹 |
| **权限粒度** | 应用/数据权限 | 工具级/SQL 级/文件级 |

ModelCop 将这一市场称为**机器身份市场**，引用数据称其规模达 **250 亿美元**——涵盖服务账号、API 密钥、机器人凭证、工作负载身份以及现在的 AI Agent 身份。

## 四大核心能力

### 1. Agent 身份发现

自动发现企业环境中运行的所有 AI Agent——包括正式的（经 IT 批准的 Claude Code、Codex、Copilot）和**影子 Agent**（员工未经批准自行部署的）：

- 扫描网络中的 Agent 服务端口和进程
- 识别与大模型 API 端点的通信
- 发现 Agent 使用的服务账号和 API 密钥
- **影子 Agent 检测**——发现未经批准的 Agent 部署

### 2. 凭证管理

Agent 在执行任务时需要访问各种系统——数据库、云服务、代码仓库——这意味着它们需要持有凭证。ModelCop 提供：

- Agent 调用凭证的安全存储和轮换
- 最小权限原则——Agent 只能使用完成任务所需的最小权限
- 凭证泄露检测——当 Agent 的 API 密钥被异常使用时发出告警
- 自动化凭证回收——Agent 下线时自动撤销所有关联凭据

### 3. 行为监控

监控 Agent 在执行任务过程中的行为模式变化：

- 工具调用频率和序列的基线建立
- 异常访问模式检测（如 Agent 突然访问从未接触过的数据库）
- 跨 Agent 的横向移动检测
- 与已有 SIEM/SOAR 系统的集成

### 4. 威胁检测

针对 Agent 特有的攻击向量提供专项检测：

- **提示词注入检测**：当 Agent 的输入被恶意操纵时
- **凭证滥用检测**：Agent 的 API 密钥被用于非预期场景
- **权限提升检测**：Agent 尝试执行超出其权限范围的操作
- **数据异常外传**：Agent 向非预期目的地发送数据

## 市场背景：为什么 ModelCop 现在推出

ModelCop 的产品发布时间并非偶然——它是 Agent 安全赛道深化的必然结果：

1. **Agent 部署量爆发**：企业开始大规模部署 AI 编码 Agent（Claude Code、Codex、Copilot），每个 Agent 都是一个需要管理的"数字员工"
2. **安全问题从零星事件变成系统性风险**：SkillCloak（恶意技能绕过扫描）、Gaslight（提示注入对抗检测）、持久化状态攻击——威胁已经超出"单次修复"的范畴
3. **传统 IAM 工具的真空**：CrowdStrike、Okta、CyberArk 等身份安全厂商尚未推出针对 Agent 身份的专项产品

## 竞争格局

| 类别 | 代表厂商/项目 | 侧重 |
|------|--------------|------|
| **Agent 身份管理** | ModelCop（新进入） | 身份发现、凭证管理 |
| **Agent 运行时安全** | Orca（开源）、Eve Security | 命令拦截、行为监控 |
| **Agent 安全框架** | T3MP3ST（开源） | 自主红队/攻击测试 |
| **Agent 合规治理** | TC260 标准、AI CERTs | 合规框架与认证 |
| **传统 IAM 延伸** | CyberArk、Okta（正在布局） | 服务账号/机器身份 |

ModelCop 的独特定位在于它专注于**身份层**——在 Agent 执行任何操作之前，先确保它的身份是已知的、凭证是安全的、权限是最小的。

## 参考

- PR Newswire（原文，404）：[ModelCop Launches AI Agent Security Platform, Targets $25B Machine Identity Market](https://www.prnewswire.com/news-releases/modelcop-launches-ai-agent-security-platform-targets-25b-machine-identity-market-302386290.html)（2026-06-17）
- Yahoo Finance（原文镜像，404）：同标题
- 关联市场数据：机器身份市场规模 $250 亿（来源：PR Newswire 引用）
