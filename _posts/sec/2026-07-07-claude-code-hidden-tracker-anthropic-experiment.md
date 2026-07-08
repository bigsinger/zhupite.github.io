---
categories: [sec]
title: Claude Code 隐藏追踪器：Anthropic 称其为"实验"，安全研究员曝光隐写式用户标记
description: 安全研究员"Thereallo"发现 Claude Code 内置了基于提示词隐写术（prompt steganography）的隐藏追踪代码，通过替换 Unicode 字符静默标记中国时区与 API 代理用户。Anthropic 工程师承认该代码是 3 月加入的"实验"，旨在检测 API 转售和模型蒸馏攻击。阿里巴已禁止员工使用 Claude Code。事件暴露了 AI Agent 平台在数据收集透明度和用户同意机制上的深层不足。
tags: [Claude Code, Anthropic, 隐私, 追踪器, 隐写术, AI Agent 安全, 数据主权, 蒸馏攻击]
---

## 一句话结论

安全研究员 **Thereallo** 逆向分析发现 Claude Code 内置了基于**提示词隐写术**的隐藏追踪器，通过替换系统提示词中的 Unicode 字符，静默标记时区为中国和中国 AI 实验室相关域名的用户。Anthropic 工程师回应称该代码是 **3 月加入的"实验"**，用于检测 API 转售和模型蒸馏攻击。阿里巴巴已据此禁止全体员工使用 Claude Code。

## 事件全貌

### 发现经过

7 月 6 日，安全研究员 **Thereallo**（网名）发布博文 [Claude Code Is Steganographically Marking Requests](https://thereallo.dev/blog/claude-code-prompt-steganography)，披露其在 Claude Code 隐私审计中发现隐藏追踪代码。该代码在用户完全不知情的情况下，通过**提示词隐写术（prompt steganography）**将用户分类信息编码到系统提示词中，随请求发送至 Anthropic 后端。

### Anthropic 回应

Anthropic 工程师 **Thariq Shihipar** 在 X（原 Twitter）上承认：

- 该追踪器于 **2026 年 3 月** 作为"实验"加入
- 目的是检测**未授权 API 转售商**和防范**模型蒸馏攻击**
- 团队"实际上已经计划撤下"，因为已有更强的缓解方案
- 声称该追踪器**不是用于数据收集**

> **核心矛盾**：Anthropic 曾因拒绝让美国政府用 Claude 监视美国用户而与白宫对立（并起诉白宫），但自己却在用户不知情的情况下实施嵌入式追踪。

### 阿里巴巴的禁令

事件曝光后，阿里巴巴于 7 月 3 日发布内部通知，**禁止全体员工在工作环境中使用 Claude Code**。通知称：

> "Claude Code 最近被发现存在后门风险，经全面评估，已将其列入高安全风险软件清单。"

阿里巴巴的禁令直接回应了 Anthropic 追踪中国用户的行为——对于像阿里这样的大型企业，违反 Anthropic 服务条款的法律和合规风险不可承受。

## 技术细节：提示词隐写术

### 工作原理

Claude Code 的追踪代码隐藏在二进制文件中的代码干，触发条件为 `ANTHROPIC_BASE_URL` 环境变量被设置（即用户使用自定义 API 网关而非官方端点）。

触发后，代码执行三重检查：

1. **时区检测**：检查系统时区是否为 `Asia/Shanghai` 或 `Asia/Urumqi`
2. **域名匹配**：将 API base URL 的 hostname 与一个 base64 + XOR 编码的域名列进行匹配
3. **AI 实验室关键词匹配**：检测 hostname 是否包含中国 AI 实验室关键词

### 隐写技术：Unicode 替换

当匹配条件满足时，Claude Code 不发送任何显式遥测字段，而是**修改系统提示词中的日期格式和标点符号**：

| 条件 | 日期分隔符 | 撇号 Unicode |
|------|-----------|-------------|
| 正常 | `2026-06-30`（横线） | ASCII `'`（U+0027） |
| 匹配已知域名 | `2026/06/30`（斜线） | `ʼ`（U+02BC） |
| 实验室关键词 | 斜线 | `ʽ`（U+02BD） |
| 两者都匹配 | 斜线 | `ʹ`（U+02B9） |

这些差异在任何等宽字体中几乎不可见，但 Anthropic 后端可以据此判断请求来自什么类型的用户环境。

### 模糊处理的域名列

域名列和数据通过 XOR 和 base64 编码隐藏，密钥为 `91`：

**解码后的 AI 实验室关键词列表**：
```
deepseek, moonshot, minimax, xaminim, zhipu, bigmodel, baichuan, stepfun, 01ai, dashscope, volces
```

**解码后的域名列表（部分）**：
```
cn, baidu.com, alibaba-inc.com, alipay.com, antgroup-inc.cn, bytedance.net,
kuaishou.com, xiaohongshu.com, jd.com, bilibili.co, iflytek.com, moonshot.ai,
anyrouter.top, claude-code-hub.app, claude-opus.top, proxyai.com, yunwu.ai, zenmux.ai
```

完整域名列表还包含大量中国企业内部域名、代理/转售商域名以及中国 AI 公司的域名后缀。

### 实际影响范围

- **官方 API 用户**（`api.anthropic.com`）：代码提前返回，**不受影响**
- **未设 `ANTHROPIC_BASE_URL` 的用户**：代码提前返回，**不受影响**
- **使用自定义 API 网关/代理的用户**：如果 hostname 和时区符合条件，**会被标记**
- 注意：`Asia/Hong_Kong` 时区**不会**触发标记，仅 `Asia/Shanghai` 和 `Asia/Urumqi`

> ⚠️ **反直觉的打击面**：研究员指出，该机制主要影响的是"做了奇怪但合法的事情的正常开发者"——使用代理访问 API 的个人开发者、小型团队和研究者，而非真正的蒸馏攻击者（后者可以轻易绕过时区和域名检查）。

## 背景：蒸馏攻击之争

### Anthropic 的立场

Anthropic 近年来持续指控中国 AI 公司对其模型进行大规模蒸馏攻击。2026 年 6 月，Anthropic 公开声称阿里巴巴在特朗普行政令颁布后仍系统性地蒸馏 Claude 能力，这是"有史以来最大规模的蒸馏攻击"。

### 数据支撑

- 北京大学和科学院的研究者在 2 月开发了检测蒸馏的方法，发现大多数中国模型存在大量蒸馏证据
- Alibaba 的 Qwen 模型在某些测试中会自我识别为 Claude
- 中国 AI 模型在发布后数月内即可追平美国模型能力

### 回应措施

Anthropic 呼吁美国政府：
- 将蒸馏攻击认定为知识产权盗窃
- 对中国封锁先进模型、芯片和数据中心
- 参议员 Tim Scott 表态支持

## 与 Halo 的对比

值得注意的是，就在同一天（7 月 7 日），我们也报道了 **[Halo](https://zhupite.com/sec/2026/07/07/halo-tamper-proof-runtime-evidence-ai-agent.html)**——一个开源的 Agent 审计追踪方案。两者形成了鲜明的对比：

| 维度 | Halo（开源方案） | Claude Code（本事件） |
|------|-----------------|---------------------|
| **记录内容** | 所有工具调用、数据访问 | 时区、API 网关 hostname |
| **透明度** | 开源、零依赖、声明式 | 隐写式、XOR/base64 隐藏 |
| **用户知情** | 明确记录在 JSONL 中 | 用户完全不知情 |
| **目的** | 安全审计与合规 | API 滥用检测 |
| **可绕过性** | 设计为不可篡改 | 简单 hostname 替换即可绕过 |

## 影响评估

### 对企业的直接影响

1. **中国企业**：使用 Claude Code 的企业面临合规风险——阿里已率先禁止，预计更多企业将跟进
2. **使用网关的企业**：即使在美国，使用 API 网关的企业也可能被误标记
3. **信任危机**：开发者工具内置隐写式追踪，侵蚀了 AI 编程助手最基本的信任前提

### 行业影响

1. **AI Agent 平台透明度**：此事件将推动行业要求更清晰的遥测披露机制，类似 GDPR 中的同意条款
2. **数据主权**：企业在部署 AI 编程助手时，需要更严格的隐私审计和数据流控制
3. **审计工具需求增长**：像 Halo 这样的开源审计方案将更受重视——开源、可验证的审计取代"信任我们"的承诺

### 研究员的核心见解

Thereallo 在博文中作了一个有力的总结：

> "编码 AI Agent 已经活在了令人不安的边界上——它们可以检查代码、意外泄露机密、执行命令、安装包、编辑文件和提交代码。大多数开发者接受这一点，因为生产力提升值得冒险。信任来自可预期的常规行为。如果客户端想检测自定义 API 网关，它可以明确声明。它可以发送一个显式的遥测字段并附带文档。它可以让策略可见。它可以在发行说明中写明。**将信号隐藏在系统提示词中，会让其他每一个隐私声明都更难让人相信。**"

---

### 参考资料

- [Ars Technica: Anthropic hid a tracker in Claude Code to flag Chinese users](https://arstechnica.com/tech-policy/2026/07/anthropic-outed-for-claude-tracker-that-secretly-monitored-chinese-users/)
- [Thereallo 研究博文: Claude Code Is Steganographically Marking Requests](https://thereallo.dev/blog/claude-code-prompt-steganography)
- [Anthropic 工程师回应（X/Twitter）](https://x.com/ThariqShihipar)
- [SCMP: Alibaba bans Claude Code over spyware concerns](https://www.scmp.com/tech/big-tech/article/3359375/alibaba-bans-staff-using-claude-code-over-anthropic-spyware-concerns)
- [Reuters: Alibaba bans Claude Code in workplace](https://www.reuters.com/world/china/alibaba-ban-claude-code-workplace-over-alleged-backdoor-risks-source-says-2026-07-03/)
