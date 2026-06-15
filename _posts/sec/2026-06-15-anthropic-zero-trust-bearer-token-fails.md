---
layout: post
title: "Anthropic 的 Agent 零信任框架设对了测试标准，但 Bearer Token 没通过"
categories: [sec]
description: "Anthropic 发布了面向 AI Agent 的零信任安全白皮书，设置了一个极好的设计测试标准——'这个措施让攻击不可能还是仅仅更麻烦？'。但批评者指出，框架推荐的 Bearer Token 方案在自己的测试面前落败了：它只是缩短了令牌泄露的攻击窗口，并没有堵上这扇门。本文深入分析这场关于 Agent 身份认证的精彩辩论。"
tags:
  - AI安全
  - Agent安全
  - 零信任
  - Zero Trust
  - Anthropic
  - Bearer Token
  - DPoP
  - Agent身份认证
---

2026 年 5 月，Anthropic 发布了一份 36 页的白皮书 **《Zero Trust for AI Agents》**，系统性地将零信任安全模型适配到自主 AI Agent 场景。这份框架的逻辑清晰、视野开阔，很快获得了安全社区的广泛认可。

然而仅仅两周后，Hellō 的创始人 Dick Hardt 就发表了一篇尖锐的回应——**框架设置了一个极好的测试标准，但用它去检验框架自身的基线推荐时，Bearer Token 直接落败。**

这是一场极有价值的技术辩论。

---

## Anthropic 框架做了什么

这份框架的核心洞察是：**Agent 不是聊天机器人**。它们解释目标、选择工具、跨会话持久化上下文、协调其他 Agent、执行真实操作。传统的基于边界的安全模型在 Agent 面前根本站不住脚。

框架将零信任原则做了五项适配：

| 传统零信任 | Agent 零信任适配 |
|-----------|-----------------|
| 人类用户身份（User Identity） | **加密根植的 Agent 身份**——每个 Agent 携带可验证的"我是谁、谁部署了我、被授权做什么" |
| 基于角色的访问控制（RBAC） | **任务级（单次）权限**——一次操作完成后权限立即回收 |
| 身份验证一次，持续信任 | **持续验证**——每次操作重新验证 |
| 不考虑内存攻击面 | **内存防护**——防 prompt注入、防 memory poisoning |
| 人工节奏的审计响应 | **Agentic SOAR**——以 AI 速度运行的自动化安全编排 |

这是一个平台无关的框架，适用于 Claude、GPT、Gemini 等任何模型。并且它给出了三个成熟度等级：**Foundation → Advanced → Optimized**，循序渐进。

---

## 最佳的测试标准："不可能"还是"更麻烦"

框架中最闪光的一句话，是一个设计测试：

> **在评估任何安全措施时，问一个问题：这个措施让攻击变得不可能，还是仅仅让它变得更麻烦？**

Anthropic 毫不客气地指出：依赖摩擦力来阻止攻击的措施——额外的跳板、速率限制、非标准端口、短信验证码——在面对"有无限耐心和近乎零单次攻击成本的敌手"时，都会快速退化。**生存下来的措施都有一个共同模式：加密身份、不可导出的凭证、不存在的网络路径（而非仅不方便的路径）。**

> *"拿不定主意时，优选一个移除能力的措施，而非一个限制能力的措施。"*

这个测试的犀利之处在于：它把安全措施分为两类——**关闭的门**和**加了锁的门**。在一个可以锁匠无限次免费试开的场景下，只有没有门（而非上了锁的门）才是有效的。

---

## Bearer Token 的尴尬处境

然后批评来了。

框架的基线建议是：**使用短生命期、窄范围（narrowly scoped）的 Bearer Token**，从高级别走向 mTLS，再到最高等级使用硬件绑定的凭证（hardware-bound credentials）。

现在，把这个基线方案放到框架自己的测试里：

> 一个短生命期的 Bearer Token 是一个**节流阀（throttle）**。它缩短了被盗秘密的有效窗口，**但没有消除这个秘密**。令牌仍然是一个"持有即拥有"（bearer）凭证：谁拿到它就可以用它。缩短生命周期提高了攻击的成本，但没有关上大门。

让凭证窃取 **不可能** 而非 **更麻烦** 的措施应该是：**不存在可窃取的 Bearer Secret**。

具体来说，Agent 应该使用自己私钥对每个请求签名——基于**持有证明（Proof of Possession）**而非持有即拥有（Bearer）。这就是 HTTP Message Signatures、OAuth DPoP（Demonstration of Proof-of-Possession）、FIDO2 这些方案在做的事：

| 方案 | 原理 | 泄露风险 |
|------|------|---------|
| Bearer Token | API Key、JWT，持令牌即获授权 | 令牌可被导出、截获、泄露 |
| 短寿命 Bearer Token | 同上，但有效期短（分钟级） | 窗口缩小但风险仍在 |
| DPoP / Proof-of-Possession | 请求需用私钥签名，令牌与密钥绑定 | 私钥不可导出则不可能冒充 |
| 硬件绑定凭证（FIDO2/TPM） | 私钥嵌入硬件，物理不可导出 | 即使主机被控也无法提取密钥 |

Hardt 指出了一个关键缺失：**框架完全没有提到 DPoP、OAuth Token Exchange、Rich Authorization Requests，或其他任何基于 sender-constrained 的令牌机制。** 框架在 Advanced 等级才提到硬件绑定的凭证，但在所有等级中，Bearer Token 都作为一个残留缺陷存留。

---

## 更深层的几个问题

### 1. 授权粒度：工具级别不够，参数级别才够

框架的授权粒度是 "Agent + 工具"——Agent 被授权使用某个工具（比如"支付工具"）。参数被当作输入验证（input validation），而非授权上下文。

但真实场景需要的授权是：

> **这个 Agent 最多转账 $3,000，给这个收款人，一次性，在周五之前。**

这不是"Agent 有付款工具的访问权限"就能表达的。需要的是 **constrained calls**——参数本身就是授权上下文。支付的金额、收款人、频次、截止时间，这些都是授权决策的一部分，而不是"通过验证后再检查的输入"。

### 2. 委托（Delegation）诊断对了，但处方不够

框架正确识别了**无范围限定的权限继承（unscoped privilege inheritance）**和**混淆代理（confused-deputy）**攻击。但给出的解决方案是日志和检测——"记录下游 Agent 实际使用了哪些权限。"

Hardt 直接反驳：

> **"日志不是一种委托模型。它事后告诉你权限泄漏了。它不能阻止权限泄漏。"**

结构性的修复应该是**派生权限（derived authority）**——子 Agent 收到的权限必须严格更窄、有用途约束、有时效约束，并且可验证地逐级递减。而不是子 Agent 继承全部权限，依赖事后记录来发现问题。

### 3. 证明（Proof）：防篡改的日志 ≠ 授权

框架建议的"证据阶梯"（evidence ladder）最高等级是**不可篡改的审计链（immutable audit trail）和溯源链（provenance chain）**。

批评非常直接：

> **一条不可篡改的未经授权操作日志，仍然是一条未经授权的操作的日志。**

授权证明应该是一个**可验证的制品**——一个授权令牌，它自己的签名就足以证明授权存在。而不是一段事后追加的不可篡改记录。

---

## 更深层的意义

这场技术辩论揭示的不仅是一个方案的优缺点，而是整个 Agent 身份认证领域正在面对的基础性问题：

**当操作的主体从"人"变成"自主 Agent"时，我们如何建立可信的身份和授权系统？**

| 维度 | 人类世界 | Agent 世界 |
|------|---------|-----------|
| 身份载体 | 生物特征 + 密码 + 硬件 | 加密密钥 + 证书 |
| 鉴权频率 | 会话开始时一次 | 每次操作持续验证 |
| 委托模型 | 显式授权 + 可审计 | 派生权限 + 逐级收紧 |
| 凭证泄露 | 可检测（异常登录） | 更难检测（Agent 行为看起来正常） |
| 归责 | 自然人负责 | 部署者 + Agent 双重归责 |

Human-in-the-loop 是一条出路，但当 Agent 成规模部署时，企业不太可能为每一次操作安排人工确认——那等于放弃了"自主"的全部意义。

---

## 实用建议

基于这场辩论，当前可以着手做几件事：

1. **认知上**：接受攻击成本的"不可能/更麻烦"二分法。优先投资能真正"关闭门"的措施。
2. **技术上**：对所有 Agent 认证方案进行一次压力测试——你的方案在当前场景下是通过了"不可能"标准还是"更麻烦"标准？
3. **架构上**：如果使用 Bearer Token，尽快向 DPoP 或 mTLS 迁移。如果使用 API Key，立即升级为短寿命 Bearer Token。
4. **权限设计上**：工具级授权是基础，参数级授权是目标。在设计 Agent 框架时，考虑让授权上下文包含具体参数。
5. **委托模型上**：子 Agent 的权限应该显式更窄，而不是继承全部权限后靠审计"发现"问题。
6. **自我检验**：将 Anthropic 的测试写进你的安全评审清单——每个防守措施都问一句："这扇门是被关上了，还是仅仅锁上了？"

---

## 结语

Anthropic 的零信任框架本身是高质量的行业贡献。它正确诊断了问题，设对了测试标准。而社区对它的批评——特别是关于 Bearer Token 的部分——恰恰证明了这个框架最有价值的部分：**它建立了足够清晰的标准，以至于可以用它来审视自身的局限性。**

这场辩论对所有人都有益：框架发布者得到了反馈来迭代方案，构建者获得了更犀利的评估工具，整个行业对 Agent 认证的思考深度又往前推进了一步。

---

**参考资料**
- [Anthropic: Zero Trust for AI Agents (PDF)](https://cdn.prod.website-files.com/6889473510b50328dbb70ae6/6a1611a04085d7cd3dadc924_Claude-eBook-Zero-Trust-for-AI-Agents-05182026.pdf)
- [Hellō Blog: Anthropic's Zero Trust Sets the Right Test. The Bearer Token Fails It.](https://blog.hello.coop/2026/06/anthropics-zero-trust-for-ai-agents-sets-the-right-test-the-bearer-token-fails-it/)
- [Hacker News Discussion](https://news.ycombinator.com/item?id=48523469)
- [OpenTools: Anthropic Publishes Zero Trust Framework for AI Agents](https://opentools.ai/news/anthropic-zero-trust-ai-agents-framework)
- [CISA Zero Trust Maturity Model](https://www.cisa.gov/zero-trust-maturity-model)
- [OAuth DPoP (RFC 9449)](https://datatracker.ietf.org/doc/html/rfc9449)
