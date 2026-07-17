---
layout: post
title: "1Password 为 Claude 做了什么：让 Agent 用账号，但看不见密码"
categories: [sec]
description: "1Password 为 Claude 提供的浏览器集成，把凭证注入限制在 1Password 控制的安全通道里，让 Claude 能完成登录和多步网页任务，但密码与 MFA 代码不会进入模型上下文。"
tags:
  - 1Password
  - Claude
  - credential security
  - AI Agent
  - browser automation
---

SiliconANGLE 这篇报道讲的是一个很典型的 Agent 安全方向：**让 AI Agent 能用账号，但不要看见账号本身。**

1Password 推出了 **1Password for Claude**，本质上是一种浏览器集成：Claude 需要登录网站完成任务时，可以调用用户在 1Password 里保存的凭证，但这些凭证不会进入 AI 模型、不会进模型记忆，也不会进入 Anthropic 的系统。

## 先说结论

这类方案的核心价值是把“Agent 需要登录”这件事，从**暴露密码**改成**授权代理使用密码**。

> 不是把秘密交给 Agent，而是让 Agent 获得“代用权限”。

这和很多传统做法很不一样。传统上，要么把账号密码贴进 Agent 上下文，要么让人每一步都手动登录；1Password 试图把两者之间的空间补上。

## 这套方案怎么工作

根据报道，1Password for Claude 的工作方式是：

- 用户在 1Password 里保存登录凭证；
- Claude 需要访问某个网站时，向 1Password 请求当前会话所需的凭证；
- 用户通过一次生物识别提示批准或拒绝；
- 1Password 通过自己控制的安全通道把凭证注入目标网站；
- 密码和 MFA 一次性码始终留在模型外部。

它强调的是 **session-based access** 和 **scoped approval**：

- 只对当前会话生效；
- 只覆盖已批准的项目；
- 不留下长期 standing access。

## 为什么这是安全问题

Agent 一旦能浏览网页、填表、触发流程，就会很快碰到登录问题。这里真正难的是：

1. **不能让秘密进入模型上下文**；
2. **不能让 Agent 拿到永久授权**；
3. **不能让一次登录权限在后续任务里无限复用**。

1Password 这次的设计，明显是在回答这三个问题。

### 它试图解决的风险

| 风险 | 传统做法的问题 | 1Password 的思路 |
|---|---|---|
| 密码泄露到上下文 | Agent 可直接读取 | 密码不进入模型 |
| MFA 代码被复用 | 会落到日志或上下文 | MFA 保持在外部通道 |
| 长期授权过宽 | 一次授权长期有效 | 仅限当前会话 |
| 多站点多步骤任务 | 反复人工登录 | 代理跨站完成登录 |

## Agentic Mode 是什么

报道里还有一个配套功能叫 **Agentic Mode**。

它的作用是：当兼容的 agent 控制浏览器时，1Password 的 vault 会自动锁定，只保留当前任务授权过的凭证，其余内容不可访问。

这意味着 1Password 不只是“给 Claude 一个密码”，而是在尝试建立一种更严格的边界：

- Agent 正在工作时，vault 进入受控状态；
- 只对当前任务开放少量凭证；
- 任务结束后不留下额外暴露面。

## 这个方向的意义

我认为这类产品的意义不在于“让 Agent 更强”，而在于**让 Agent 更像受控执行体，而不是拿着完整密钥库的半自动用户**。

它和之前的几类 Agent 安全思路可以拼起来看：

- **凭证隔离**：不要让 Agent 看到真正的 secret；
- **运行时控制**：不要只在模型入口做过滤；
- **会话级授权**：不要把一次批准变成永久权限；
- **任务结束回收**：不要让用过的访问继续悬挂。

这和 Warden、Agent Vault Proxy 这类工具的方向其实很接近，只是 1Password 走的是商业产品路线，强调的是浏览器与密码管理器之间的安全通道。

## 适用范围和限制

报道里提到，1Password for Claude 目前先支持：

- Mac 用户；
- business / family / individual plans；
- 1Password desktop app 和 browser extensions；
- Claude desktop app 和 browser extensions。

同时，它还提到一些后续能力，比如支付卡和姓名地址等个人数据的支持会在后续推出。

这说明它目前更像是**浏览器登录场景的 credential access layer**，而不是完整的通用 Agent 安全平台。

## 我的判断

这条产品线很值得关注，因为它解决的是一个特别现实的问题：

> 当 AI Agent 真正开始替人登录、点击、填写和提交时，怎么保证“能做事”不等于“能看见秘密”。

这恰好是企业最在意的边界。

如果这类能力未来能覆盖更多浏览器 Agent、CLI Agent 和 MCP 工具链，它会成为企业 Agent 安全基线的一部分：

- 最小权限；
- 会话级授权；
- 凭证不进上下文；
- 外部安全通道注入；
- 任务结束即收回。

## 参考资料

- SiliconANGLE：*1Password brings secure credential access to Anthropic's Claude*，2026-07-16
- Google News RSS：同题报道与来源元数据
