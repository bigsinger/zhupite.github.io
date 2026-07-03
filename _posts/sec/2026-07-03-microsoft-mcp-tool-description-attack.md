---
layout: post
title: "Microsoft 将 MCP 工具描述标记为隐藏的 AI Agent 攻击路径"
categories: [sec]
description: "Microsoft 安全团队警告 MCP 工具描述字段可被嵌入恶意指令，AI Agent 基于语义理解选择工具时触发非预期操作。含 Claude Code 系统接管攻击分析，影响评估和防护建议。"
tags:
  - AI Agent
  - MCP
  - 供应链安全
  - Prompt注入
---

## 风险速览

Microsoft Incident Response 和 Defender 安全研究团队发出警告：MCP（Model Context Protocol）工具的描述字段（Tool Descriptions）可能成为 AI Agent 生态中隐藏的攻击路径。攻击者无需代码注入，只需在描述字段中嵌入恶意指令，就能让 AI Agent 在正常执行任务时泄露数据或执行非预期操作。

这不是一个代码漏洞，而是 Agent 生态中语义信任层面的新攻击面——Agent 通过读取工具描述的自然语言来判断何时调用工具，而描述本身可以携带指令。

## 威胁模型

### 攻击前提

- 目标组织使用了支持 MCP 协议的 AI Agent（如 Microsoft 365 Copilot、Copilot Studio 或 Azure AI Foundry 构建的自定义 Agent）
- Agent 连接了至少一个第三方 MCP 工具（或非严格管控的 MCP 工具）
- 工具描述的更新没有经过重新审批机制

### 攻击链

```
第三方 MCP 工具 → 攻击者修改工具描述字段（嵌入隐藏指令）
    ↓
Agent 读取更新后的工具描述 → 语义理解认为该工具适合当前任务
    ↓
Agent 调用该工具 → 触发隐藏指令（如「将最近 30 张发票附加到本次调用」）
    ↓
数据被外传到攻击者控制的服务器
    ↓
每一步操作在 Agent 看来都是合法的，不会触发告警
```

### 关键弱点

**MCP 将指令和数据混合在同一位置。** 工具描述存放在 Agent 的工作记忆中，与真实的系统指令相邻。编辑工具描述的效果等同于改写系统提示词（System Prompt），但工具描述的更新通常没有代码变更那样的审查流程。

Microsoft 将这一问题定位为「工具之间的信任边界失效」——不是 Copilot 本身的漏洞，而是接入外部工具后产生的信任缺口。

### 更深层的设计缺陷

问题的根源在于 **MCP 协议核心设计中的信任边界问题**。当 MCP 工具的 name 和 description 字段被攻击者篡改后，Agent 会在语义理解层面被误导——它将本应保密的数据（如发票明细、用户凭证、内部文件路径）作为参数传递给攻击者控制的工具或服务器。由于 Agent 认为这些参数是完成当前任务所必需的，它不会产生任何怀疑。

这不是某个实现的 Bug，而是 **MCP 协议本身缺少对「指令来源可信度」的分级机制**。工具描述作为纯文本与系统指令共享同一语义空间，Agent 无法区分哪些文本来自可信管理员、哪些来自第三方工具声明。

## 影响范围

### 学术验证

TaskGen 基准测试（2025 年 8 月发布）在 45 个真实 MCP 服务器和 20 个主流 AI 模型上测试了此攻击，**成功率高达 72.8%**，且模型几乎从不拒绝执行被篡改的工具描述。

### 已知案例

| 事件 | 时间 | 描述 |
|------|------|------|
| Invariant Labs MCP 工具指令隐藏 | 2025 | 在计算器工具描述中隐藏指令，诱使 Cursor 编辑器读取用户 SSH 密钥并外传 |
| postmark-mcp 供应链投毒 | 2025 年 9 月 | npm 包经过 15 次正常发布后，在 1.0.16 版本中插入一行代码，将 Agent 发送的每封邮件秘密 BCC 给攻击者 |
| Claude Code 系统完整接管攻击 | 2026-06-30 | Cybernews 报道又一起针对 Claude Code 的攻击链，利用 MCP 工具配置宽松实现开发者系统完全控制 |
| OWASP Agentic AI Top 10 | 2025 年 12 月 | 将「Agent 供应链漏洞」列为 Top 10 安全风险之一 |

## 攻击的隐蔽性

此攻击路径最危险之处在于 Agent 的每一步操作在单点看来都是合法的：

1. **工具是经审批的**——第三方的「发票丰富化服务」已通过安全评估
2. **数据查询使用的是分析人员的权限**——符合授权原则
3. **外呼请求发往已允许的服务器**——网络层面无异常
4. **攻击者隐藏在 Agent 的语义理解中**——没有传统恶意代码

正如 Microsoft 团队所述：「Agent 从不违反规则。每一步看起来都正常，因此在默认配置下不会有告警触发。」

## Claude Code 攻击链：从 MCP 配置到系统接管

2026 年 6 月 30 日，Cybernews 报道了又一起针对 Claude Code 的攻击链，展示了 MCP 信任问题的另一面——**当 MCP 工具的 allowedCommands 或 path 参数配置宽松时，Agent 可执行任意系统命令**。

攻击手法：

1. 攻击者构造恶意的 MCP 工具配置文件和一个恶意 Git 仓库
2. 开发者使用 Claude Code 打开/分析该仓库时触发攻击
3. Claude Code 信任 MCP 工具声明，执行了攻击者预设的 allowedCommands
4. 攻击者实现对开发者系统的完整控制权接管

这起攻击与此前 disclosed 的 Invariant Labs Cursor SSH 密钥窃取攻击一脉相承——核心都是 AI Coding Agent 对 MCP 工具声明的过度信任。Claude Code 作为当前最流行的 AI 编码助手之一，连续的攻击披露表明 **AI Coding Agent 的攻击面远未被充分理解**。

## Microsoft 的防护建议

### 1. 供应链管控
将所有已连接的工具视为供应链的一部分，维护批准的发布者清单，关闭「允许所有」模式，限定 Agent 只能调用特定的工具。

### 2. 工具描述变更审计
将工具描述视为系统提示词一样对待，每次变更走代码审查流程，检查描述文本中是否存在不应出现在帮助字段中的指令。

### 3. 高风险操作人工确认
涉及资金转移、数据外发、账户变更等操作，必须有人工审批环节。

### 4. Agent 身份与行为基线
为每个 Agent 分配独立的身份，记录行为日志，设定正常行为的基线，标记异常端点、异常数据量或异常查询模式。

### 5. 最小行动原则
不仅是最小权限（Least Privilege），更需最小行动（Least Agency）——即使低权限 Agent 在无检查的情况下自主行动，也可能造成实质性损害。

Microsoft 将其产品映射到各防护环节：Prompt Shields、Purview DLP、Entra Agent ID、Defender for Cloud 和 Sentinel。

## 尚不确定的部分

- 已有具体 CVE 编号或 PoC 的公开披露细节
- 该攻击路径在 Copilot 以外的 Agent 框架（如 Anthropic 的 Claude、LangChain Agent）中的具体表现
- 行业整体受影响的 Agent 部署比例

## 参考资料

- Microsoft: "Securing AI agents: When AI tools move from reading to acting"（2026-06-30）— Microsoft Security Blog
- Microsoft: "Updating the taxonomy of failure modes in agentic AI systems"（2026-06-04）
- The Hacker News: [Microsoft Warns Poisoned MCP Tool Descriptions Can Make AI Agents Leak Data](https://thehackernews.com/2026/06/microsoft-warns-poisoned-mcp-tool.html)（2026-06-30）
- Cybernews: [Another Claude Code attack allows full takeover of developers' systems](https://cybernews.com/security/claude-code-attack-full-takeover/)（2026-06-30）
- TechRepublic: "Microsoft Flags MCP Tool Descriptions as Hidden AI Agent Attack Path"（2026-07-02）
- TaskGen 基准测试（2025 年 8 月）— 45 个 MCP 服务器 + 20 个模型测试，成功率 72.8%
- OWASP Top 10 for Agentic Applications（2025 年 12 月）
