---
layout: post
title: "Cynative：面向云、代码与运行时的只读深度安全研究 Agent"
categories: [sec]
description: "梳理开源项目 Cynative 的定位、只读安全边界、云与代码连接器、沙箱执行和证据校验机制，分析它为什么更像一个面向企业基础设施的 Deep Research 安全 Agent，而不是普通 MCP 工具拼装。"
tags:
  - Cynative
  - Agent 安全
  - 云安全
  - 开源工具
  - DevSecOps
---

## 一句话结论

**Cynative 是一个开源的深度安全研究 Agent**：它让前沿大模型在企业自己的代码、云账号和运行时环境中做安全研究，但默认坚持 **read-only by construction**——每次工具调用在附加凭据之前都要先过只读策略、主机约束和动作分类，写操作必须显式开启。

这类工具的价值不只是“让 AI 帮忙查云安全问题”，而是在尝试回答一个更现实的问题：

> 如果让 Agent 拿着真实云凭据做安全研究，怎样避免它误删资源、泄露密钥或被提示注入带偏？

## 项目信息

| 维度 | 信息 |
|------|------|
| 项目 | Cynative |
| 仓库 | [github.com/cynative/cynative](https://github.com/cynative/cynative) |
| 语言 | Go |
| 许可证 | Apache-2.0 |
| 当前 Stars | 70（调研时） |
| 最新 Release | v1.5.1（2026-07-10） |
| 定位 | 面向基础设施的 Deep Cybersecurity Research Agent |

Help Net Security 对它的概括很准确：Cynative 不是单纯的聊天式助手，而是一个能跨代码、云和运行时做“证据驱动安全研究”的本地 Agent。

## 它解决什么问题

传统安全自动化工具通常是确定性扫描器：规则明确、范围明确、输出稳定。但面对复杂云环境时，很多问题需要跨系统推理：

- GitHub Actions 中的 OIDC 配置是否能导致云账号提权？
- 某个云权限是从哪次 PR 引入的？
- 源码里泄露的凭据现在还有多大爆炸半径？
- 运行时资源和 IaC 是否发生漂移？

Cynative 的目标就是让模型带着这些问题去查你的真实环境，但又尽量把风险边界控制在“只读研究”内。

README 中的典型用法是：

```bash
cynative "what in my cloud is publicly exposed that shouldn't be?"
cynative -p "which IAM roles can escalate to admin?"
cynative -p "cloud credentials leaked in source code and their current blast radius"
```

## 核心设计：Read-only by construction

Cynative 最值得关注的不是“用了大模型”，而是它围绕 Agent 风险做的安全边界设计。

### 1. 凭据附加前先授权

Cynative 会在给请求附加真实凭据之前，先检查：

1. URL 是否为 HTTPS；
2. 请求主机是否是该 connector 允许的服务；
3. 请求动作是否符合只读策略；
4. 解析后的 IP 是否仍在允许范围；
5. 通过后才附加凭据发送请求。

这和很多 MCP / coding agent 的模式不同：后者常常是“Agent 拿到环境凭据后自己决定怎么用”。Cynative 则把动作门禁放在模型之外。

### 2. 云厂商动作分类来自实时来源

Help Net Security 采访中，Cynative 联合创始人 Shaked Zin 强调：动作读写分类不是项目手工维护的一张静态表，而是来自云厂商自己的实时来源。

例如 AWS 侧会使用：

- AWS Service Reference API；
- 社区 `iam-dataset` 作为 fallback；
- AWS SDK service models 做操作分类；
- `iam:SimulateCustomPolicy` 检查新动作是否被 SecurityAudit 允许。

如果一个新动作无法确认是只读，就会 fail closed：宁可短期拒绝一个新读操作，也不让一个新写操作漏过去。

### 3. 对 AWS assumed-role 做 STS 降权

在 AWS assumed-role 场景下，Cynative 会通过 STS 重新派发一个受限 session，并用 `SecurityAudit` 等托管策略缩小权限。这意味着 AWS IAM 本身也会执行边界，而不只是客户端代码在自律。

需要注意：README 明确说明，**只有 AWS assumed-role 身份支持 credential downscoping**；IAM user 和 root 身份仍使用基础凭据，只能依赖 Cynative 的客户端动作门禁和主机限制。因此上游凭据仍要遵循最小权限。

## 支持哪些系统

Cynative 的 connector 覆盖面相当实用：

| Connector | 系统 | 默认防护 |
|-----------|------|---------|
| GitHub | GitHub REST API | 只读分类，secret scanning 端点阻断 |
| GitLab | GitLab REST API | 默认只读，CI variables 阻断 |
| AWS | AWS APIs | SecurityAudit + 动作模拟 |
| GCP | Google Cloud APIs | roles/viewer |
| Azure | Azure Resource Manager | Reader |
| EKS/GKE/AKS | 托管 Kubernetes | live view RBAC |
| Kubernetes | 自管理集群 | kubeconfig + view RBAC |

模型侧则通过嵌入的 Bifrost SDK 接入 23+ provider，包括 OpenAI、Anthropic、Azure OpenAI、Bedrock、Vertex/Gemini、Ollama、vLLM 等。

## 它和“Coding Agent + MCP”有什么不同

Cynative README 里直接拿它和 coding agent + MCP 做了对比。核心差异可以概括为：

| 维度 | Coding Agent + MCP | Cynative |
|------|-------------------|----------|
| 凭据使用 | 常常沿用 ambient credentials | 凭据附加前做动作门禁 |
| 只读策略 | 通常是可选过滤 | 默认只读，fail closed |
| 执行方式 | 一次一个工具调用 | 在沙箱中生成代码并并发查询 |
| 结果可信度 | 依赖模型输出 | verifier 交叉验证证据 |
| 审计 | 分散在会话日志中 | JSONL 审计日志，写不进去就中止 |
| 供应链 | 多 MCP/技能组合 | 单个开源二进制 + 内置 connectors |

这也是它值得单独关注的地方：它没有把“连接器越多越好”作为卖点，而是把**如何安全地让 Agent 使用连接器**作为核心设计。

## Prompt Injection 边界：它不声称免疫

Cynative 对 prompt injection 的态度比较务实。项目方承认：只读门禁约束的是动作，不约束模型推理本身。也就是说，恶意代码注释、云资源标签、日志内容或配置文件中的文本，仍可能影响模型判断。

它的主张是“containment”：

- 被投毒的输入可能让模型得出错误结论；
- 但不应让模型执行写操作、横向移动或破坏性动作；
- findings 需要经过独立 verifier 二次校验；
- 无法只读确认的结果会被标记为 UNVERIFIED 或低置信度。

这比“我们完全防住 prompt injection”更可信。对于真实企业环境，能把潜在损害限制在错误判断层，而不是放大成云资源变更，本身已经是重要安全边界。

## 安装与使用

官方推荐 Homebrew：

```bash
brew install cynative/tap/cynative
```

配置模型后即可运行：

```bash
export CYNATIVE_LLM_PROVIDER=anthropic
export CYNATIVE_LLM_MODEL=claude-opus-4-8
export ANTHROPIC_API_KEY=...

cynative -p "which IAM roles can escalate to admin?"
```

Windows 可通过 Scoop：

```powershell
scoop bucket add cynative https://github.com/cynative/scoop-bucket
scoop install cynative
```

它会使用当前 shell 中已有的云、GitHub、GitLab、Kubernetes 凭据，不维护独立凭据库。因此上线前要特别注意：**不要用高权限个人凭据直接跑，先准备专用只读凭据。**

## 我怎么看

Cynative 代表了安全 Agent 的一个重要方向：

> 不是把 MCP 和云凭据直接交给模型，而是在模型之外建立可验证的动作边界。

它的优势在于：

1. **适合复杂云安全问题**：可以跨 GitHub、云账号、Kubernetes 和运行时推理；
2. **默认只读**：减少 AI Agent 自己造成事故的风险；
3. **本地运行**：数据和模型选择留在操作者环境内；
4. **证据校验**：不把模型的一句话当作漏洞结论。

局限也很清楚：

- 只读不等于无风险，读取敏感配置本身就需要审计；
- prompt injection 仍可能污染结论；
- AWS 之外的 connector 主要依赖客户端动作门禁；
- 对企业落地来说，仍需配合权限治理、审计平台和变更流程。

总体看，Cynative 不是传统扫描器的替代品，而更像一个**安全研究副驾驶**：它能帮你提出和验证跨系统问题，但你仍要给它一个严格的执行边界。

## 参考资料

- [Help Net Security：Cynative: Open-source deep research agent](https://www.helpnetsecurity.com/2026/07/13/cynative-open-source-deep-research-agent/)
- [GitHub：cynative/cynative](https://github.com/cynative/cynative)
- [Cynative connector guides](https://github.com/cynative/cynative/tree/main/docs/connectors)
- [Bifrost SDK](https://github.com/maximhq/bifrost)
