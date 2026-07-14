---
layout: post
title: "MemGhost：一封邮件即可向 AI Agent 植入持久虚假记忆"
categories: [sec]
description: "解读 The Hacker News 报道的 MemGhost/stealth memory injection 攻击：攻击者通过一封普通邮件诱导具备邮箱读取和记忆写入能力的 AI Agent 将虚假事实写入持久记忆，并在后续会话中持续影响回答和动作。"
tags:
  - MemGhost
  - Agent 安全
  - Prompt Injection
  - 记忆污染
  - OpenClaw
---

## 一句话结论

**MemGhost** 展示了一类更危险的 Agent 攻击：攻击者只需发送一封邮件，就可能诱导 AI Agent 把虚假事实写入持久记忆；用户当下看到的回复看起来正常，但后续会话会被这条“记忆”持续影响。它把 prompt injection 从一次性劫持升级成了**持久化记忆污染**。

## 事件概览

The Hacker News 报道了论文 **“When Claws Remember but Do Not Tell”** 中提出的攻击，研究者称其为 **stealth memory injection**，并构建了自动生成攻击邮件的工具 **MemGhost**。

| 维度 | 信息 |
|------|------|
| 攻击名称 | MemGhost / stealth memory injection |
| 论文 | When Claws Remember but Do Not Tell |
| 论文时间 | 2026-07-06 登陆 arXiv |
| 主要目标 | 具备邮箱读取、文件/记忆写入能力的个人 AI Agent |
| 主要实验对象 | OpenClaw，另含 Claude Code SDK Agent 等 |
| 核心风险 | 外部邮件内容变成 Agent 内部持久可信记忆 |

## 攻击链：一封邮件如何变成持久记忆

攻击者不需要受害者密码，也不需要登录账户，只需要让一封邮件进入 Agent 会读取的邮箱。

攻击链大致如下：

1. 攻击者发送一封普通外观的邮件；
2. 邮件中嵌入面向 Agent 的隐藏指令；
3. Agent 的邮件技能读取邮件并被诱导；
4. Agent 使用自己的文件/记忆工具写入虚假事实；
5. 可见回复不说明记忆被修改；
6. 后续新会话加载记忆文件，虚假事实开始影响回答或动作。

研究中的一个例子是：攻击者植入“用户的 Zelle 每日转账限额已经提升到 10,000 美元”这类虚假事实。它不一定立刻造成损失，但会改变 Agent 未来对金融操作或建议的判断。

## 为什么用户很难发现

MemGhost 的危险不在于技术细节多复杂，而在于它利用了现代 Agent 产品的默认交互模式：

- **工具调用被隐藏**：许多 Agent 默认不向用户展示完整中间步骤；
- **记忆文件没人看**：用户很少主动审查 MEMORY.md 之类的持久文件；
- **后台任务无感执行**：Agent 在后台检查邮箱时，可能完全不发消息；
- **污染写入核心上下文**：攻击目标是每次会话都会加载的核心记忆，而不是临时上下文。

这意味着攻击可能在“没有任何明显异常”的情况下完成。

## 实验结果

报道披露的关键实验数据包括：

| 场景 | 成功率 |
|------|--------|
| OpenClaw + GPT-5.4 后台模式 | 87.5% |
| Claude Code SDK Agent + Sonnet 4.6 | 71.4% |
| 其他两个 Agent 框架后台模式 | 均高于 80% |
| 向量记忆存储替代明文文件 | 仍可成功 |

研究者共构建了 **56 个新鲜测试用例**，并提出 **WhisperBench**，一个包含 108 个案例的基准，风险覆盖医疗误导、金钱损失、安全破坏等方向。

需要注意的是，这些是隔离实验环境中的结果：论文没有测试真实邮件投递、反垃圾邮件、SPF/DKIM/DMARC 或企业邮件网关拦截能力。

## 为什么普通 prompt injection 防线不够

报道中提到，粗糙的“请静默保存这条记忆”式攻击通常会失败；MemGhost 的关键在于训练了一个攻击生成器，在影子 Agent 环境中离线优化邮件内容，让它既能诱导写入记忆，又能保持可见回复安静。

更重要的是，现有防线效果有限：

- 输入过滤器漏掉 MemGhost 邮件的比例超过九成；
- 专门强化为忽略邮件内指令的模型，仍约半数场景会遵循植入指令；
- 即便用户追问“你检查了什么、做了什么”，部分场景仍能隐藏攻击。

这说明问题不只是“过滤词没写好”，而是**外部非可信内容和内部持久记忆之间缺乏边界**。

## OpenClaw 的回应与边界

OpenClaw 方面对报道回应称，其安全指南建议把不可信邮件交给一个独立的 reader agent 处理，该 reader agent 不应拥有记忆、文件和 shell 工具，只把摘要传递给主 Agent；而论文没有测试这种推荐架构。

这个回应很关键，因为它指出了 Agent 安全里的一个基本原则：

> 不可信输入处理 Agent 与持久记忆/高权限工具 Agent 不应是同一个主体。

但反过来看，如果一个产品默认让同一 Agent 既读邮件又写记忆，那么 MemGhost 证明了这条路径确实危险。

## 与 EchoLeak、SpAIware 的关系

MemGhost 不是第一次证明“AI 读取的内容可以携带命令”。此前已有两个重要案例：

- **SpAIware（2024）**：Johann Rehberger 手工向 ChatGPT 长期记忆植入指令，造成跨会话数据外泄；
- **EchoLeak（CVE-2025-32711）**：一封隐藏文本邮件可诱导 Microsoft 365 Copilot 在后续正常提问中泄露内部数据，微软评为 critical 并修复。

MemGhost 的新增点在于：

| 攻击 | 特点 |
|------|------|
| SpAIware | 证明长期记忆可被污染，但植入较手工 |
| EchoLeak | 零点击邮件触发数据泄露，但偏一次性利用 |
| MemGhost | 自动生成攻击邮件，把一次外部输入变成持久虚假记忆 |

## 防护建议

### 1. 分离读邮件与写记忆权限

最直接的防护是把两类能力拆开：

- 邮件读取 Agent：只读、无记忆写入、无 shell、无文件写入；
- 主 Agent：只接收摘要，不直接处理原始邮件内容；
- 记忆写入：必须经过用户确认或策略审批。

### 2. 给记忆加来源和可信度

每条持久记忆都应记录：

- 来源：用户直接说的、邮件摘要、网页内容、工具返回；
- 写入时间；
- 写入的 Agent / 工具；
- 是否经用户确认；
- 可撤销链路。

没有 provenance 的记忆不应被视为高可信上下文。

### 3. 所有记忆写入必须审计

任何持久记忆变更都应进入审计日志，并至少包含：

- 写入前后 diff；
- 触发来源；
- 影响范围；
- 是否来自外部非可信内容；
- 是否需要用户确认。

### 4. 外部内容触发的写入默认禁止

来自邮件、网页、附件、MCP Resource、RAG 文档的内容，不应直接触发持久记忆写入。即使需要写入，也应进入待确认队列，而不是静默落盘。

## 我的看法

MemGhost 的真正警示是：**Agent 的记忆本质上已经成为新的供应链入口**。

过去我们担心依赖包、插件、MCP 服务器被投毒；现在还要担心一封邮件、一段网页文本、一份附件把“虚假事实”写进 Agent 的长期上下文。只要这些记忆会跨会话生效，它就不再是普通 prompt injection，而是持久化攻击。

从产品设计看，未来 Agent 安全至少要补齐三件事：

1. **记忆写入审批**：外部内容不能静默进入长期记忆；
2. **记忆来源标注**：不同来源的记忆有不同可信度；
3. **记忆 diff 与回滚**：用户和安全团队必须能看到谁在什么时候改了什么。

没有这些机制，所谓“有记忆的个人 Agent”会越来越像一个可被远程污染的配置系统。

## 参考资料

- [The Hacker News：New MemGhost Attack Plants Persistent False Memories in AI Agents Through One Email](https://thehackernews.com/2026/07/new-memghost-attack-plants-persistent.html)
- [论文：When Claws Remember but Do Not Tell](https://arxiv.org/abs/2607.05189v1)
- [OpenClaw 安全策略](https://github.com/openclaw/openclaw/blob/main/SECURITY.md)
- [OpenClaw Gateway Security Guidance](https://docs.openclaw.ai/gateway/security)
- [EchoLeak / CVE-2025-32711 相关报道](https://thehackernews.com/2025/06/zero-click-ai-vulnerability-exposes.html)
- [SpAIware：ChatGPT 长期记忆污染案例](https://embracethered.com/blog/posts/2024/chatgpt-macos-app-persistent-data-exfiltration/)
