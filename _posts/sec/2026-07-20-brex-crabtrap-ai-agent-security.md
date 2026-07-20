---
layout: post
title: "CrabTrap：Brex 开源面向 AI Agent 的出站请求安全代理"
categories: [sec]
description: "Brex 开源 CrabTrap，一个位于 AI Agent 与外部 API 之间的 HTTP/HTTPS 出站代理，通过静态规则、LLM-as-a-judge、审计日志和策略评估控制 Agent 的网络访问。"
tags:
  - CrabTrap
  - Brex
  - AI安全
  - Agent安全
  - 出站代理
---

Brex 开源了 **CrabTrap**，一个面向企业 AI Agent 的出站请求安全代理。它的定位很明确：当 Agent 已经能调用 Slack、Gmail、GitHub 或其他外部 API 时，不能只依赖模型 guardrail 和工具权限，而要在 **每一次出站 HTTP/HTTPS 请求真正到达互联网之前** 做策略判断、阻断和审计。

Crypto Briefing 的报道把它概括为：Brex 在探索部署 OpenClaw 等 Agent 框架时发现，传统模型防护和工具权限不足以约束持有 API Key、OAuth Token、Service Account 的 Agent。因此他们把内部平台 CrabTrap 开源出来，用一个代理层统一接管 Agent 的网络出口。

## CrabTrap 解决什么问题

CrabTrap 是一个 **forward proxy**，不是 WAF，也不是入站防火墙。它位于 Agent 和外部服务之间：

```text
AI Agent → HTTP_PROXY / HTTPS_PROXY → CrabTrap → 外部 API
```

从 GitHub README 看，它会拦截每个出站请求，并依次做几件事：

| 环节 | CrabTrap 的处理 | 安全价值 |
|---|---|---|
| TLS 终止 | 通过自定义 CA 为目标主机生成证书，解密 HTTPS 请求 | 让代理能看到完整请求内容 |
| 静态规则 | 先匹配 URL prefix / exact / glob 规则，可按方法过滤 | 高频已知流量无需调用 LLM |
| LLM Judge | 对未命中静态规则的请求，根据自然语言策略做允许/拒绝判断 | 覆盖未知或边界请求 |
| 审计日志 | 每个请求、决策和响应写入 PostgreSQL | 形成可回放、可追责记录 |
| 评估系统 | 用历史审计日志回放新策略，评估准确性 | 降低策略上线风险 |

这套设计的关键不是“让 LLM 替代网关”，而是 **静态规则优先，LLM 只处理规则覆盖不到的少数请求**。Crypto Briefing 报道中提到，Brex 表示当 Agent 行为稳定后，AI judge 通常只会在少于 3% 的请求上被触发。

## 为什么这类工具会变重要

Agent 安全的核心矛盾在于：Agent 越有用，权限越大；权限越大，出错或被劫持后的影响也越大。

很多团队现在会给 Agent 配置：

- GitHub Token，用于读写仓库；
- Slack / Gmail 权限，用于沟通和通知；
- 云服务凭证，用于部署、查询和运维；
- 内部 API 权限，用于处理业务流程。

如果这些调用只靠模型自己“记住不要越权”，安全边界就太软了。CrabTrap 的思路是把 Agent 的网络出口变成一个明确的控制点：**Agent 可以想做很多事，但每个外部请求都必须经过代理层审计和裁决**。

## 项目能力与边界

从 README 和设计文档看，CrabTrap 已经实现了比较完整的工程骨架：

| 能力 | 状态 |
|---|---|
| HTTP/HTTPS MITM 代理 | 已实现 |
| PostgreSQL 审计日志 | 已实现 |
| 静态 allow / deny 规则 | 已实现 |
| LLM-as-a-judge 策略判断 | 已实现 |
| Web UI、策略编辑、评估结果查看 | 已实现 |
| SSRF 防护与 DNS rebinding 防护 | README 标明支持 |
| OpenTelemetry / Prometheus 指标 | README 标明可选开启 |
| SSO / SAML / OIDC | 实现文档中标为待办 |
| 更细的 RBAC、权限升级流程 | 计划扩展方向 |

它也明确列出了自己 **不做什么**：

- 不检查入站请求；
- 不做敏感数据脱敏；
- 不提供人工审批队列；
- 不过滤上游 API 响应；
- 不检查 WebSocket 升级后的帧内容。

这些边界很重要。CrabTrap 更像是 Agent 出站访问的“审计与策略执行层”，而不是一个覆盖所有 Agent 风险的完整平台。

## Prompt Injection 风险怎么处理

一个有意思的点是：CrabTrap 自己也要面对 prompt injection。

因为 LLM judge 会读取 HTTP 请求，而 URL、Header、Body 都可能包含用户可控内容。如果直接把这些内容拼进 prompt，攻击者就可能通过请求内容影响 judge 的判断。

项目 README 中写到的处理方式是：**把请求 payload JSON 编码，把 policy 内容 JSON escape 后再送入 LLM judge**。这不是彻底解决 prompt injection，但至少避免了把不可信内容作为原始自然语言指令直接拼进判断上下文。

这也说明一个现实：用 LLM 做安全判断时，LLM 自己必须被当成受攻击面治理，而不能被默认视为可信裁判。

## 快速上手方式

项目给出的最短路径是 Docker Compose：

```bash
docker compose up -d
```

默认代理监听：

| 服务 | 地址 |
|---|---|
| Proxy | `localhost:8080` |
| Admin UI | `localhost:8081` |

然后把 Agent 的出站代理指向 CrabTrap：

```bash
export HTTP_PROXY=http://${token}:@localhost:8080
export HTTPS_PROXY=http://${token}:@localhost:8080
```

需要注意的是，CrabTrap 会拦截 HTTPS，因此 Agent 运行环境还要信任它生成的 CA 证书。README 给了 Node.js 和 Python 的环境变量方式，也给了 macOS / Linux 系统信任存储方式。

## 我的判断

CrabTrap 的价值不在于“又多了一个 AI 安全工具”，而在于它把 Agent 安全从抽象的 prompt guardrail 拉回到工程控制点：**网络出口、请求策略、审计日志、历史回放、默认拒绝**。

这类工具适合优先用于几类场景：

1. Agent 已经能访问真实业务 API；
2. Agent 持有长期 Token 或服务账号；
3. 组织希望先 shadow mode 观察 Agent 行为，再逐步收紧策略；
4. 需要对“Agent 到底请求了什么、为什么被允许或拒绝”留下审计证据。

但它不应被理解为一劳永逸的 Agent 安全方案。它看的是出站 HTTP/HTTPS 请求，不能替代身份治理、最小权限、密钥隔离、工具级权限和运行时沙箱。更合理的位置是：**Agent 运行时安全栈中的出站流量控制层**。

## 核验信息

| 项目 | 信息 |
|---|---|
| 项目地址 | [brexhq/CrabTrap](https://github.com/brexhq/CrabTrap) |
| GitHub 描述 | An LLM-as-a-judge HTTP proxy to secure agents in production |
| Star 数 | 714（抓取 GitHub 页面时） |
| 主要语言 | Go（从 `go.mod` 与仓库结构核实） |
| 许可证 | MIT License |
| 发行镜像 | README / QUICKSTART 使用 `quay.io/brexhq/crabtrap:latest` |

## 参考资料

- [Brex open sources CrabTrap to secure enterprise AI agents](https://cryptobriefing.com/brex-crabtrap-ai-agent-security/) — Crypto Briefing，2026-07-17
- [brexhq/CrabTrap](https://github.com/brexhq/CrabTrap) — GitHub 仓库
- [CrabTrap README](https://github.com/brexhq/CrabTrap/blob/main/README.md)
- [CrabTrap Quick Start](https://github.com/brexhq/CrabTrap/blob/main/QUICKSTART.md)
- [CrabTrap Design Document](https://github.com/brexhq/CrabTrap/blob/main/DESIGN.md)
