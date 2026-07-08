---
categories: [sec]
title: Halo：开源防篡改运行时证据——为 AI Agent 行为可审计性提供新方案
description: 开发者 bkuan001 发布 Halo——一个开源的、防篡改的 AI Agent 运行时证据记录系统。Halo 在 Agent 运行时捕获每个决策步骤、工具调用和数据访问行为，以密码学哈希链确保日志不可篡改。支持 4300 行 Python 零依赖实现、多种 Agent 框架适配器（OpenAI Agents SDK、LangChain、Claude Code 等），并引入 Witness 见证人机制解决完整性证明问题。
tags: [Halo, Agent 安全, 可审计性, 运行时证据, 日志审计, 哈希链, 合规]
---

## 一句话结论

开发者 **bkuan001** 发布 **Halo**——一个开源的、防篡改的 AI Agent 运行时证据记录系统。Halo 在 Agent 运行时捕获每个决策步骤、工具调用和数据访问行为，以密码学哈希链确保日志不可篡改。该工具为审计和合规场景提供了可验证的 Agent 行为链，支持在发生安全事件时追溯 Agent 的完整操作过程。

## 核心价值：从「承诺」到「可验证证据」

当客户的合规团队问「你的 Agent 用我们的数据做了什么？」，今天的回答通常是文字保证。Halo 试图改变这一点——它让每个 Agent 行为变成一条可验证的记录链。任何人(包括不信任记录生成方)都可以验证该链从未被篡改。

| 维度 | 传统做法 | Halo 方案 |
|------|---------|-----------|
| **证据形式** | 文字承诺/SOC 2 报告 | 可验证的哈希链 HTML 报告 |
| **审计能力** | 事后人工追溯 | 实时、密码学保证的完整性 |
| **信任模型** | 信任记录方 | 零信任——链可被任何第三方验证 |
| **合规覆盖** | SOC 2 自我评估 | AIUC-1、OWASP GenAI、AARM R5/R6、EU AI Act、ISO 42001 |

## 架构设计

### 核心机制：哈希链

Halo 的记录格式基于经典哈希链（hash chain）：

- 每条记录包含 `integrity.hash` 和 `integrity.prev_hash`
- 计算方式：取记录中除 `integrity.hash` 外的字段，将 `integrity.prev_hash` 设为上条记录的哈希值，按 RFC 8785（JSON 规范化方案）规范化，取 SHA-256
- 首条记录的 `prev_hash` 为 64 个零
- 验证时会重新计算每条哈希并检查所有链接

该机制无需任何密钥即可验证——这正是其设计要点。

### 完整性 vs 完备性

Halo 明确区分了两个概念：

1. **完整性（Integrity）**：链未被编辑或重排 —— 由哈希链保证
2. **完备性（Completeness）**：没有记录被删除 —— 需要外部证人

对于完备性，Halo 引入了 **Witness 见证人**机制：

```
halo anchor audit.jsonl witness.jsonl           # 锚定检查点
halo anchor audit.jsonl witness.jsonl --check   # 验证完备性
```

见证人仅持有记录计数和链头哈希（fingerprint），**不接触记录内容**。被托管、可信的见证人机制将是项目的可持续模式。

## 技术特性

### 零依赖 + 可审计

Halo 仅有 ~4,300 行 Python 代码，**零运行时依赖**（仅标准库）。`pip install halo-record` 只安装一个包，没有任何网络调用（见证人功能可选，仅发送计数和链指纹，不发送记录内容）。

### 安全设计：原始输入从不入记录

调用参数以哈希形式存储，仅保留**脱敏摘要**——原始值永不进入记录。脱敏是基于正则的尽力而为，被定位为纵深防御而非绝对保证。

### 多框架适配

Halo 插件架构设计，支持多种捕获/摄入路径：

| 方式 | 说明 |
|------|------|
| **原生记录器** | `from halo import trace` 包装任意 Agent 入口函数 |
| **OpenTelemetry GenAI spans** | 接入符合 OTel 标准的 Agent 框架 |
| **MCP 拦截器** | 拦截 MCP 协议工具调用 |
| **LiteLLM 回调** | 通过 LiteLLM 回调接入 |
| **LangChain / LangGraph** | 原生回调适配器 |
| **OpenAI Agents SDK** | Hook 接入 |
| **Claude Code Hook** | PostToolUse 钩子，无需改代码 |
| **网关/反向代理日志** | 从已有日志摄入 |

每种适配器的记录带 `source` 标签，报告会披露证据的收集方式。

### CLI 命令一览

```
halo verify   验证 schema + 哈希链（非零退出，CI 友好）
halo report   渲染为自验证 HTML Runtime Report
halo serve    按租户提供 HTTP 访问的报告服务
halo grant    指定报告接收者（邮箱或域名）
halo anchor   见证链头，或 --check 检查完备性
halo demo     搭建完整供应商 Demo
halo hook     Claude Code PostToolUse 钩子
```

## 合规价值

Halo 定位为**证据层（evidence layer）**，而非认证本身。它产出的可验证运行时报告可以被接入各类合规框架：

- **安全问卷 & SOC 2**：用可验证的 Runtime Report 替代截图和文字说明
- **AIUC-1**：提供持续运行时证据而非审计时重建的证据
- **OWASP GenAI 安全项目**：Agent 边界行为（过度授权、工具滥用、敏感信息泄露）的真实记录
- **AARM（CSA）**：满足 R5/R6 的防篡改行为收据——哈希链 + 独立见证
- **EU AI Act**：高风险 AI 系统的日志和记录义务
- **ISO 42001 / NIST AI RMF**：管理控制的操作证据

## 项目状态

- **许可证**：Apache-2.0
- **语言**：Python（~4,300 行）+ TypeScript（halo-record-ts，相同链格式，跨语言可验证）
- **GitHub**：[bkuan001/halo-record](https://github.com/bkuan001/halo-record)
- **Demo**：`uvx --from halo-record halo demo --serve` 或 `pip install halo-record && halo demo --serve`

## 我的看法

Agent 行为的不可篡改审计是 Agent 安全治理的核心需求。Halo 的几个设计选择值得关注：

✅ **哈希链 + 零信任验证**：密码学保证的可验证性，让审计从"信任我"变成"验证我"，这是 Agent 安全合规从手工作坊走向工业化的关键一步。

✅ **4300 行 + 零依赖**：可审计性是安全工具自身的基本要求。这样的代码量使企业安全团队可以放心审读后再采用。

✅ **Witness 见证人机制**：诚实地区分了完整性（链未改）和完备性（没删记录）。后者需要外部见证，Halo 没有虚假承诺"全自动解决"，而是给出了清晰的信任模型。

⚠️ **脱敏策略**：文档明确标注脱敏是"defense-in-depth, not a guarantee"，对于金融、医疗等强合规场景，需要结合数据粒度的策略定义使用。

Halo 填补了 Agent 运行时证据记录的市场空白。在这个领域，此前缺乏一个轻量、开源、非侵入式的标准化方案——特别是在 Claude Code、OpenAI Agents SDK 等主流 Agent 框架的适配方面。对于金融、医疗等强合规行业，这种防篡改设计为 Agent 责任追溯提供了可落地的技术基础。
