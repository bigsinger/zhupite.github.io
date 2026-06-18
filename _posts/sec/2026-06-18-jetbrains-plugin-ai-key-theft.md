---
layout: post
title: "JetBrains 插件安全警报：15 个恶意插件窃取 70,000+ 开发者的 AI API 密钥"
categories: [sec]
description: "Aikido Security 在 JetBrains Marketplace 发现 15 个恶意插件，总安装量超过 70,000 次，专门窃取开发者 AI 服务 API 密钥。这些插件伪装成 AI 编码助手，自 2025 年 10 月起活跃至 2026 年 6 月，目标包括 OpenAI、DeepSeek、SiliconFlow。部分插件甚至实现「付费层」——向付费用户转售窃取来的凭证。"
tags:
  - JetBrains
  - IDE安全
  - API密钥
  - 供应链安全
  - AI Agent安全
  - 恶意插件
  - 凭证窃取
---

## 事件概览

Aikido Security 的安全研究人员在 **JetBrains Marketplace** 上发现了 **15 个恶意插件**，来自 **7 个恶意供应商账户**，总安装量超过 **70,000 次**。这些插件伪装成合法的 AI 编码助手工具，专门窃取开发者的**AI 服务 API 密钥**。

这是自 2025 年 10 月以来持续活跃至 2026 年 6 月的供应链攻击活动。

---

## 攻击技术分析

### 窃取目标

恶意插件针对的 API 密钥服务包括：

| 目标服务 | 密钥特征 |
|---------|---------|
| OpenAI | `sk-` 开头的 API Key |
| DeepSeek | 开发者 API Key |
| SiliconFlow | 平台 API Key |
| 其他 AI 服务 | 各类模型 API Key |

### 窃取机制

1. **即时触发**：当用户在 IDE 中保存 API Key 时，恶意插件立即触发窃取流程
2. **明文外传**：通过**明文 HTTP POST** 请求，将密钥数据发送到攻击者的 C2 服务器（IP: `39.107.60[.]51`）
3. **简单校验**：代码使用 `key.startsWith("sk-")` 这种极简单的格式校验来判断是否为有效密钥
4. **静态凭证**：插件代码中硬编码了 C2 服务器的认证令牌

### "付费层"——凭证转售业务

最令人吃惊的发现是：部分恶意插件实现了 **"付费层"模式**。插件向付费用户发放"替代 API Key"，声称这些是合法密钥——但实际上这些密钥**极有可能来自被窃取的凭证池**。

这意味着：
- 攻击者不只是窃取凭证自用
- 他们将窃取的凭证整理成**转售服务**
- 这是一种高度商业化的攻击模式

---

## 为什么这很重要

**1. IDE 插件生态是高价值攻击目标**

开发者 IDE 中的 API 密钥是企业中最敏感、权限最高的凭证之一。一条 OpenAI 密钥可能对应着整个团队的 AI 使用配额；一条 AWS 密钥可能意味着整个云基础设施的访问权限。而 IDE 插件的权限模型通常是"全有或全无"——安装一个插件，它就获得了访问开发环境所有文件的权限。

**2. 与 GlassWorm 等攻击活动形成关联**

这一发现与之前针对 VS Code 的 **GlassWorm 攻击活动** 形成了呼应。IDE 插件生态的供应链安全问题是系统性的，而非个别事件。

**3. AI 开发者的密钥特别危险**

AI 开发者的 API 密钥决定了：
- 谁可以使用公司的 AI 服务配额
- 谁可以访问部署在云端的 AI Agent
- 谁可以修改 AI 模型和 Agent 配置

窃取 AI 密钥的控制权，就相当于拿到了整个 AI 开发生命周期的入场券。

---

## 缓解措施

| 措施 | 说明 |
|------|------|
| 立即移除受影响插件 | 检查 JetBrains Marketplace 中已安装的插件列表 |
| 轮换已暴露密钥 | 更换所有被窃取的 API Key，包括 AI 服务和云服务 |
| 监控异常 API 使用 | 检查 API 调用日志中的异常访问模式 |
| 实施最小权限 | API Key 使用最小所需权限，而非全量授权 |
| 使用环境变量 | 避免在 IDE 配置文件中明文存储 API Key |

---

## 参考资料

- [GBHackers — JetBrains Plugin Security Alert: 70,000+ Installs Linked to AI Key Theft](https://gbhackers.com/jetbrains-plugin-security-alert/)（2026-06-17）
- Aikido Security 研究报告
- GlassWorm 攻击活动相关分析（2026）
