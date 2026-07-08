---
categories: [sec]
title: 腾讯发布 AI-Infra-Guard：首个系统性审计 MCP 供应链安全的开源红队框架
description: 腾讯朱雀实验室（Zhuque Lab）发布 AI-Infra-Guard——一个开源的 AI Agent 红队安全框架，首次对 MCP（Model Context Protocol）供应链进行系统性审计。框架按四层攻击面匹配不同检测范式：基础设施层（1400+ 漏洞规则）、协议与工具层（ReAct 代理审计 MCP 服务器）、Agent 行为层（四类风险黑盒测试）、模型层（26+ 攻击算子）。伴随 5520 个评估样本的 SkillTrustBench 基准，已被 OpenClaw 生态的 ClawScan 采纳。
tags: [腾讯, AI-Infra-Guard, MCP, 供应链安全, 红队框架, 朱雀实验室, Agent 安全, 开源安全]
---

## 一句话结论

腾讯朱雀实验室（Zhuque Lab）于 6 月 30 日发布 **AI-Infra-Guard**——一个开源的 AI Agent 红队安全框架，首次对 **MCP（Model Context Protocol）供应链**进行系统性安全审计。框架覆盖基础设施、协议/工具、Agent 行为、模型四个攻击面，分别匹配不同的检测范式（规则匹配 / ReAct 代理审计 / 黑盒对抗 / 组合混淆越狱）。同时发布 **SkillTrustBench**（5,520 个评估样本）作为 Agent 技能安全基准。该框架已于 7 月 6 日登上 HuggingFace Daily Papers。

## 事件概述

### 发布信息

- **名称**：AI-Infra-Guard
- **开发者**：腾讯朱雀实验室（Zhuque Lab）
- **发布时间**：2026 年 6 月 30 日（开源），7 月 6 日登上 HuggingFace Daily Papers
- **许可证**：Apache 2.0
- **GitHub**：[Tencent/AI-Infra-Guard](https://github.com/Tencent/AI-Infra-Guard)
- **论文**：[arxiv.org/abs/2606.31227](https://arxiv.org/abs/2606.31227)
- **报告来源**：Tech Times 于 7 月 6 日独家报道

### 背景：为什么需要 MCP 供应链安全审计

MCP（Model Context Protocol）自 Anthropic 于 2024 年发布后，已成为 AI Agent 与外部工具集成的**事实标准**。OpenAI、Google DeepMind、Microsoft、AWS 等均采纳该协议。截至 2026 年初：

- **9,700 万** 月 SDK 下载量
- **10,000+** 活跃公共 MCP 服务器
- 2025 年 12 月 Anthropic 将 MCP 捐赠给 Agentic AI Foundation（Linux 基金会托管项目）

但 MCP 生态的安全审计严重滞后。2025 年 4 月安全研究确认 MCP 存在多个未缓解的漏洞（提示注入、工具投毒）；2026 年 5 月 NSA 发布安全公告，文件记录了 MCP-Inspector 工具链中的远程代码执行漏洞（CVE-2025-49596），并将语义级工具投毒攻击定性为"系统性"而非孤立问题。

## AI-Infra-Guard 四层检测范式

框架核心设计理念：AI Agent 的攻击面**不是平坦的**，每个层次需要完全不同的检测方法。

### Layer 1：基础设施层——确定性规则匹配

覆盖模型服务引擎、Agent 平台、API 网关及其依赖。使用自定义匹配语言（非正则表达式），涵盖 **75+ AI 组件**和 **1,400+ 漏洞规则**。

工作流程：识别 AI 组件 → 提取版本号 → 与规则库比对。版本号归一化处理跨组件生态的版本格式不一致问题。

### Layer 2：协议与工具层——ReAct 代理审计

**这是对 MCP 供应链安全审计的核心创新**。该层使用一个 **ReAct（Reasoning + Action）代理**来审计 MCP 服务器的代码和行为，而非传统签名检测——因为在语义层面，"一个看起来合法的工具描述但引导 Agent 做恶意操作"无法用签名检测。

- 审计代理读取 MCP 服务器代码、执行命令、访问网络
- 通过推理分析生成结构化安全报告
- **Prompt-as-Rule**：把安全策略文档转化为 LLM 审计指令
- 每个技能包审计结果包含：证据位置、受影响文件、风险分类（正常/可疑/恶意）、严重性和缓解建议

> **关键约束**（论文第 6.7 节）：审计代理本身可能被恶意 MCP 服务器攻击——这是间接提示注入漏洞，框架包含针对性的加固措施，但不是免疫。

### Layer 3：Agent 行为层——黑盒对抗测试

覆盖跨轮次对抗交互场景——单轮测试看不出问题，但多轮对话逐渐引导 Agent 走向数据泄露、未授权工具调用或授权绕过。

并行技能工作器同时运行多个对抗线程，通过**升级控制机制**管理多轮测试的计算开销。覆盖四大风险家族：数据泄露、工具滥用、间接注入、授权绕过。

### Layer 4：模型层——组合混淆越狱

框架的越狱测试包含 **26+ 攻击算子**，支持**组合混淆**——同时组合多种攻击技术以绕过对齐训练，这是单算子攻击做不到的。测试在 16 个数据集上运行，生成跨模型版本和跨 Provider 的可比攻击成功率。

## SkillTrustBench：Agent 技能安全基准

AI-Infra-Guard 同时发布了 **SkillTrustBench**——一个从 **62,652 个 Agent 技能**中提取的基准，包含 **5,520 个评估用例**，覆盖 9 个威胁类别。

该基准已被 OpenClaw 生态系统的外部安全扫描项目 **ClawScan** 采纳为推荐评估数据集。

## MCP 供应链安全风险的真实案例

### Postmark-MCP 投毒攻击

一个名为 `postmark-mcp` 的包向公共 MCP 注册表提交了 15 个**干净版本**以建立信任，然后悄悄添加了一行代码，将处理的每封邮件通过 BCC 发送到攻击者控制的服务器。

> 这种模式——攻陷受信包、潜伏、修改和传播——正是 2020 年 SolarWinds 事件的攻击模型。现在它已在 AI Agent 技能生态中运作。

### 大规模 MCP 服务器扫描

2025 年 10 月的独立分析扫描了 **67,057 个 MCP 服务器**，发现：
- **833 个**存在可利用条件
- **18 个**具有可疑工具描述（旨在引导 Agent 行为）

## 与现有工具的对比

| 维度 | PyRIT（微软）/ Garak（NVIDIA） | AI-Infra-Guard（腾讯） |
|------|------------------------------|----------------------|
| **主要目标** | 模型层红队（提示安全） | 四层全覆盖（含 MCP 供应链） |
| **MCP 审计** | ❌ 不支持 | ✅ ReAct 代理审计 + 供应链分析 |
| **基础设施检查** | ❌ 不支持 | ✅ 1400+ 漏洞规则 |
| **评估范式** | 单轮/固定对话 | 四层异质范式 |
| **开源** | ✅ | ✅ Apache 2.0 |
| **技能安全基准** | ❌ | ✅ SkillTrustBench（5520 用例） |

## 关于 Tencent Cloud 威胁情报集成的说明

AI-Infra-Guard 在扫描时会调用 **Tencent Cloud 威胁情报 API**——包括可疑下载 URL、二进制哈希、外部基础设施细节及第三方依赖的供应链风险指标。这些元数据被发送到腾讯云以提升检测精度。

**需要关注的合规考量**：腾讯为总部位于深圳的中国企业。依据《中华人民共和国国家情报法》（2017）第七条，中国组织和公民有义务支持、协助和配合国家情报工作。《网络安全法》第二十八条要求网络运营者为公安和国家安全机关提供技术支持。

对于**高度监管行业**或有**数据驻留要求**的组织，需要评估该框架的 API 调用是否符合其合规要求后再部署。

## 威胁背景：一个严峻的数据点

- 2025 年 9 月：Anthropic 检测到 GTG-1002 组织劫持 Claude Code 部署进行自主网络间谍活动
- 2025 年 12 月：攻击者利用 Agentic Workflow 入侵墨西哥政府机构，窃取 1.95 亿纳税人记录
- 2026 年 3 月：LiteLLM 模型网关库遭遇供应链攻击，后门版本被下载约 47,000 次
- 2026 年：AI Agent 相关数据泄露平均成本 **470 万美元**（比非 Agent 泄露高约 67 万）
- 88% 运行 AI Agent 的组织在过去一年中确认或疑似发生过安全事件

## 我的看法

✅ **四层异质范式是正确思路**：不同攻击面需要不同检测方法——这是安全工程的基本共识，但此前没有框架将其系统化实现。框架的层-范式匹配是真正的架构创新。

✅ **MCP 供应链审计填补市场空白**：MCP 已成为 AI Agent 生态的事实标准，但其安全审计工具几乎空白。AI-Infra-Guard 是首个公开的系统性方案。

✅ **开源 + 基准**：Apache 2.0 许可 + SkillTrustBench 基准的组合，有助于推动 Agent 安全测试的标准化。

⚠️ **Tencent Cloud API 集成**：对于涉及敏感系统或数据审计的安全团队，需要评估扫描时发送到腾讯云的基础设施元数据是否符合自身合规要求。

⚠️ **自引用声明**：框架的"唯一开源 MCP 供应链审计框架"声明由作者方做出，独立验证尚未完成。

⚠️ **审计代理自身可能被攻击**：这不是一个理论问题——当一个 MCP 服务器是恶意的时，审计代理在审计它的时候也可能被注入。框架有加固措施但不是免疫，真实部署时需要注意。

### 参考资料

- [Tech Times 独家报道](https://www.techtimes.com/articles/319803/20260706/ai-agent-red-teaming-tencent-framework-audits-mcp-supply-chain-first-time.htm)
- [AI-Infra-Guard GitHub](https://github.com/Tencent/AI-Infra-Guard)
- [AI-Infra-Guard 论文（arXiv）](https://arxiv.org/abs/2606.31227)
- [NSA MCP 安全公告（2026年5月）](https://www.nsa.gov/Portals/75/documents/Cybersecurity/CSI_MCP_SECURITY.pdf)
- [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)
- [MCP 安全统计报告](https://www.practical-devsecops.com/mcp-security-statistics-2026-report/)
