---
layout: post
title: "OWASP 发布 Agent 安全成熟度框架 AASMF——业界首个标准化评估体系"
categories: [sec]
description: "OWASP 在 Infosecurity Europe 2026 上发布 Agentic AI Security Maturity Framework（AASMF），业界首个专门针对 AI Agent 安全的 5 级成熟度评估框架，覆盖身份与访问控制、运行时保护、供应链安全、监控与响应 4 个核心维度"
keywords: OWASP AASMF, Agent安全成熟度, 成熟度框架, OWASP Agent安全, IAM, 供应链安全, 运行时保护
tags:
  - OWASP
  - Agent 安全
  - 成熟度框架
  - 安全治理
  - AASMF
---

## 背景：Agent 安全从「拼凑措施」进入「体系化建设」阶段

过去一年，AI Agent 从实验室原型迅速走向企业生产环境。Copilot、AutoGPT、Claude Code、MCP 生态——Agent 的部署数量正在爆炸式增长。

但安全措施的演进速度显然没有跟上。大多数组织对 Agent 安全的做法仍然是"拼凑式"的：发现 Prompt 注入，就加一层输入过滤；碰到工具误用，就收紧 API 权限。**缺少一个系统性的框架来回答一个根本问题——我的 Agent 安全到底做得怎么样？**

2026 年 6 月 5 日，OWASP 在 Infosecurity Europe 2026 大会上正式发布了 **Agentic AI Security Maturity Framework（AASMF）**，填补了这个空白。这是业界首个专门针对 AI Agent 安全的成熟度评估框架。

---

## 框架全景

AASMF 采用 **5 级成熟度模型 × 4 个核心安全维度** 的矩阵结构：

### 5 个成熟度等级

| 等级 | 名称 | 核心特征 | 一句话描述 |
|------|------|---------|-----------|
| Level 1 | **初始级（Initial）** | 无专门 Agent 安全措施 | "跑起来了，听天由命" |
| Level 2 | **定义级（Defined）** | 基本安全策略就位 | "有规矩了，但不一定执行" |
| Level 3 | **管理级（Managed）** | 细粒度管控 + 运行时监控 + 定期审计 | "能管住，但靠人" |
| Level 4 | **量化级（Quantified）** | 指标驱动的量化安全管理 | "能度量，靠数据说话" |
| Level 5 | **优化级（Optimizing）** | AI 驱动的自适应安全 | "能自愈，系统自我进化" |

### 4 个核心安全维度

| 维度 | 覆盖范围 | 对应传统安全领域 |
|------|---------|----------------|
| **身份与访问控制（IAM）** | Agent 身份全生命周期——创建、认证、授权、审计、吊销 | IAM |
| **运行时保护（Runtime）** | Agent 执行环境的安全隔离、行为监控、异常检测 | 主机安全 / EDR |
| **供应链安全（Supply Chain）** | Agent 技能/插件的安全审核、依赖管理、版本追溯 | 软件供应链安全 |
| **监控与响应（Monitor & Respond）** | Agent 操作的实时监控、事件响应、取证分析 | SIEM / SOAR |

---

## 逐级解读：从「听天由命」到「自我进化」

### Level 1 — 初始级

这是绝大多数 Agent 部署当前的现状。

**特征：**
- 依赖 Agent 平台默认的安全配置
- 没有专门针对 Agent 的身份管理——Agent 直接继承用户权限
- 没有 Agent 运行时监控
- 第三方 Agent 技能/插件未经安全审核直接使用

**风险：** 微软刚发布的 7 种 Agent 攻击向量（身份欺骗、权限继承、工具链污染等）在此等级下几乎全部有效。

**典型组织：** 研发团队自建 PoC、个人开发者实验项目、刚引入 Agent 的小团队。

---

### Level 2 — 定义级

从"裸奔"进入了"有规矩"的阶段。

**特征：**
- 建立了基本的 Agent 安全策略文档
- 实施了 Agent 身份认证（至少有了账号体系）
- 部署了基础日志记录（Agent 做了什么，有日志可查）
- 对 Agent 的技能/插件引入了人工审核流程

**典型组织：** 有计划地引入 Agent 的中型企业，或受到合规压力的金融/医疗行业组织。

---

### Level 3 — 管理级

**这是当前行业头部企业应该达到的目标等级。**

**特征：**
- 实现了 Agent 权限的细粒度管理——每个 Agent 有自己的最小权限集
- 运行时行为监控就位——能检测 Agent 的异常操作
- 定期安全审计——每季度或每月审计 Agent 行为
- 身份生命周期管理——Agent 创建/挂起/吊销有标准化流程

**技术支撑：** 这个等级需要 Microsoft MXC、Agent 365、或同等企业级 Agent 安全平台的支持。

---

### Level 4 — 量化级

从"能管住"到"能度量"。

**特征：**
- 建立了 Agent 安全的 KPI 指标体系（如：异常行为检测率、平均响应时间、配置合规率）
- 安全投入与安全效果之间有数据支撑
- 基于风险评分动态调整 Agent 权限

**价值：** 有了量化指标，安全团队可以向管理层展示 Agent 安全的 ROI，为预算争取提供依据。

---

### Level 5 — 优化级

**这是未来的方向，当前很少有组织能达到。**

**特征：**
- AI 驱动的自适应安全控制——系统根据威胁情报自动调整 Agent 的隔离级别
- 自动化的安全策略优化——系统从历史事件中学习，持续改进安全规则
- 自我修复能力——检测到 Agent 被攻破后，自动隔离、取证、重建

---

## AASMF 的行业意义

### 填补了标准化空白

OWASP 在安全框架领域有辉煌的历史：**ASVS**（应用安全验证标准）和 **SAMM**（软件保障成熟度模型）都已成为行业事实标准。AASMF 继承了它们的方法论和品牌信任，有望成为 Agent 安全领域的下一个事实标准。

### 为组织提供了路线图

过去，安全团队面对"我们的 Agent 安全做得怎么样"这个问题时，只能靠感觉回答。AASMF 提供了一个清晰的坐标系——你现在在 Level 几，下一步该往哪走。

### 继承了 OWASP 的框架方法论

AASMF 的 4 个维度（IAM、Runtime、Supply Chain、Monitor & Respond）与 SAMM 的业务功能分类一脉相承，5 级成熟度模型也与 SAMM 保持一致。这意味着：

- 已经实施 SAMM 的组织可以平滑地将 AASMF 集成到现有的安全治理体系中
- 安全从业者对框架的学习成本很低

---

## 框架的局限性

任何框架都有其自身的局限和适用边界，AASMF 也不例外：

| 局限 | 说明 | 影响 |
|------|------|------|
| **缺乏认证方案** | 框架定义了"什么算到了 Level 3"，但没有说"怎么验证你真的到了 Level 3" | 企业自评可能存在偏差 |
| **静态模型 vs 快速变化** | 成熟度模型是静态的，而 Agent 安全威胁每周都在变化 | 框架需要持续更新 |
| **面向企业级** | 主要针对企业级 Agent 部署场景 | 个人/小团队 Agent 用户适用性有限 |

> 📌 **注意**：OWASP 在 ASVS 和 SAMM 的发展过程中也经历过类似的阶段——先有框架，后有评估工具和认证机制。AASMF 的评估工具化大概率是下一步。

---

## 对管理者的借鉴价值

如果贵组织正在或计划引入 AI Agent，以下建议可供参考：

1. **先做 AASMF 自评** — 花半天时间对照 4 个维度 5 个等级，定位当前成熟度
2. **Level 2 是底线** — 如果连基本的 Agent 身份认证和日志记录都没有，建议先补齐再大规模部署
3. **Level 3 是目标** — 细粒度权限 + 运行时监控 + 定期审计，是应对已知 Agent 攻击向量的最低安全水位
4. **不要急于 Level 4/5** — 量化管理和自适应安全需要足够的数据积累，不是靠采购工具就能达成的

---

## 参考资料

- **原文**：Infosecurity Europe: OWASP Introduces Agentic AI Security Maturity Framework — Infosecurity Magazine  
  → https://www.infosecuritymagazine.com/owasp-agentic-ai-maturity-framework/
- **OWASP AASMF 官方页面**：待 OWASP 官方发布后更新
- **OWASP SAMM**：软件保障成熟度模型（AASMF 的参照模型）  
  → https://owaspsamm.org/
- **OWASP ASVS**：应用安全验证标准  
  → https://owasp.org/www-project-application-security-verification-standard/
