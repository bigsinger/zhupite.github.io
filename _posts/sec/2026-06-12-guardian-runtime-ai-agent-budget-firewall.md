---
layout: post
title: "Guardian Runtime：开源的本地 AI Agent 用量追踪与预算防火墙"
categories: [sec]
tags: [guardian-runtime, ai-agent, budget, finops, security, token-tracking, open-source, local-proxy]
description: "Guardian Runtime 是一个零延迟、本地优先的 LLM 运行时防火墙。无需修改 Agent 代码即可实现硬预算管控、密钥泄漏阻断和 Token 压缩，防止 Agent 死循环烧掉 $100 API 账单。"
---

当 AI Agent 进入生产环境，一个最让团队头疼的问题是：**它什么时候会意外烧掉一大笔 API 费用？**

今年 6 月初，一个名为 **Guardian Runtime** 的开源项目在 Hacker News 上以 Show HN 形式发布，直接回应了这个问题。作者 **ashishp15** 的动机非常实际：

> 自主 Agent 在循环中运行。如果一个 Agent 卡在无限重试 bug fix 的循环里，或者意外把 1GB 的日志文件塞进上下文窗口，你第二天醒来可能面对一张 **$100 的 API 账单**。

## 三板斧：Guardian Runtime 解决什么问题

Guardian Runtime 定位为**本地优先的 LLM 运行时防火墙**，在 Agent 发送请求到 LLM 提供商之前拦截并处理。它解决了三个风险：

| 风险 | 问题 | Guardian 的解法 |
|------|------|----------------|
| 💸 **FinOps 风险** | Agent 死循环产生意外 API 费用 | **硬预算**：设置每日上限（如 $5/天），超限自动阻断 |
| 🔒 **安全风险** | API 密钥、DB 密码被上传到第三方 LLM | **密钥扫描**：零延迟检测并拦截泄漏的敏感凭据 |
| 🏛 **合规风险** | PII 数据发送到境外 API 违反 GDPR | **PII 脱敏**：自动检测并匿名化邮箱、电话等敏感实体 |

## 架构：中间人代理模式

Guardian Runtime 的核心是一个**本地反向代理**，部署在 Agent 和 LLM 提供商之间：

```
Agent / 开发工具            Guardian Runtime              云端 LLM
     │                            │                           │
     │  1. Prompt + Context       │                           │
     │ ────────────────────────▶  │                           │
     │                            │ [安全防火墙]               │
     │                            │ ├─ 扫描 AWS 密钥/Secrets  │
     │                            │ └─ 若发现威胁 → 阻断      │
     │                            │ [Token 优化器]            │
     │                            │ ├─ 压缩多余空白符         │
     │                            │ └─ Terse Mode             │
     │                            │ [FinOps 预算]             │
     │                            │ ├─ 检查当日消费           │
     │                            │ └─ 超限 → 阻断            │
     │                            │  2. 清洗后的 Prompt       │
     │                            │ ───────────────────────▶  │
     │                            │  3. LLM 响应              │
     │                            │ ◀───────────────────────  │
     │                            │ [输出防护]                │
     │                            │  审计泄漏的 PII           │
     │  4. 安全响应               │                           │
     │ ◀───────────────────────── │                           │
```

关键设计原则是：**所有检查发生在本地，不依赖云端服务。** 数据在通过代理之前不会离开机器。

## 三种集成方式，零代码改动

### 1. 代理模式（任何 CLI Agent）

这是最简单的接入方式——启动代理，设置环境变量，Agent 的所有流量自动经过 Guardian。

```bash
# 安装
pip install "guardian_runtime[all]"

# 启动代理
guardian_runtime proxy --port 8080

# 设置环境变量，Agent 流量自动经过代理
export ANTHROPIC_BASE_URL=http://localhost:8080
claude
```

适用于：Claude Code、Aider、GitHub Copilot CLI 等终端 Agent，以及 Cursor、Windsurf 等 IDE。

### 2. SDK 模式（Python 应用）

将 Guardian Runtime 作为 Python SDK 集成到应用中：

```python
from guardian_runtime import GuardianRuntime, GuardianRuntimeBlockedError

gr = GuardianRuntime.from_policy("policy.yaml")

try:
    response = gr.complete(
        model="gpt-4o",
        messages=[{"role": "user", "content": "My AWS Key is AKIAIOSFODNN7EXAMPLE"}],
        raise_on_block=True
    )
except GuardianRuntimeBlockedError as e:
    print(f"本地阻断: {e.response.violations[0].detail}")
```

### 3. 策略文件模式（团队共享配置）

编写 `policy.yaml`，团队一致执行：

```yaml
version: "1.0"
agents:
  default:
    cost:
      daily_budget: 10.00          # 每日硬上限 $10
      max_input_tokens: 50000       # 单次最大输入 Token
    input_guard:
      pii_detection: true           # PII 检测
      scan_secrets: true            # 密钥扫描
    optimizer:
      terse_mode: true              # 精简输出模式
```

## 核心功能拆解

### 1. 硬预算（Hard Budgets）

不是"提醒式"预算，而是**严格执行**。一旦 Agent 当日的 API 消费超过设定阈值：

- 代理模式：返回 HTTP 403，Agent 收到阻断错误
- SDK 模式：抛出 `GuardianRuntimeBlockedError` 异常
- 阻断信息明确：`🚨 [BUDGET_EXCEEDED] Daily budget of $10.00 exceeded.`

### 2. 密钥扫描（Secret Scanner）

基于 Microsoft Presidio + 正则表达式，在请求发出前扫描：

- AWS Access Key（AKIA...）、GitHub Token、数据库连接串
- 自定义正则模式
- 零延迟检查，不增加调用耗时

### 3. Terse Mode（精简模式）

通过在 system prompt 中注入简洁指令，强制 LLM 输出更短的响应。官方数据显示：**输出 Token 减少 40-70%，且不牺牲准确率。**

```yaml
optimizer:
  enabled: true
  terse_mode: true
```

### 4. 会话分析仪表盘

内置 `analytics` 命令，实时查看 Token 消费和成本：

```bash
guardian_runtime analytics          # 仪表盘
guardian_runtime analytics --all    # 所有会话详情
guardian_runtime logs --tail 20     # 实时日志
```

### 5. 越狱防御

检测并阻断 DAN（Do Anything Now）类提示注入、系统提示提取等攻击模式。

## 入侵式防御 vs 非入侵式设计

Guardian Runtime 的设计哲学与同类工具有明显区别：

| 对比维度 | Guardian Runtime | Trajeckt | Azure Container Apps Sandbox |
|---------|-----------------|---------|---------------------------|
| **部署位置** | 本地（本地机器） | 云端网关 | 云端基础设施 |
| **管控层面** | LLM 调用层 | 工具调用层 | 进程/虚拟机层 |
| **核心职责** | 预算 + 防泄漏 | 计划强制 | 进程隔离 |
| **集成方式** | 环境变量/代理 | MCP 网关配置 | 基础设施部署 |
| **是否修改 Agent** | 否（透明代理） | 否（网关） | 否（沙箱） |
| **适合场景** | 个人开发者/小团队 | 企业 Agent 治理 | 企业多租户隔离 |

三者的关系更像是**分层防御**的三个层次，而非替代关系。你可以同时使用它们——沙箱隔离进程，Trajeckt 管控工具调用，Guardian Runtime 控制预算和防泄漏。

## 一条命令接入

```bash
pip install "guardian_runtime[all]"
```

无需注册、无需 API Key、零配置。所有数据保存在 `~/.guardian_runtime/` 目录下。

项目地址：**[github.com/ashp15205/guardian-runtime](https://github.com/ashp15205/guardian-runtime)**（MIT 协议）

---

*参考资料：*
- [Guardian Runtime 文档站](https://ashp15205.github.io/guardian-runtime/)
- [PyPI: guardian-runtime](https://pypi.org/project/guardian-runtime/)
- [Show HN 原文](https://news.mcan.sh/item/48456339)
