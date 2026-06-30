---
layout: post
title: "Agent 安全扫描 / 测评开源项目清单（34 个项目）"
categories: [sec]
description: "一份收录 34 个 Agent 安全扫描、红队测试、运行时防护和行为监控开源项目的综合性清单，按 SAST/动态测试/运行时安全/行为监控/治理/供应链分类，附场景推荐。"
tags:
  - Agent 安全
  - AI 安全
  - 开源项目
  - SAST
  - 红队测试
  - 运行时安全
  - MCP 安全
  - 安全扫描
---

> **数据来源**：GitHub 搜索（采集时间 2026-06-25）
> **共收录**：34 个项目

以下是截至 2026 年 6 月，围绕 AI Agent 安全检测、扫描、红队评估和运行时防护的**主要开源项目**。按功能定位分为六大类。

---

## 一、SAST 静态安全扫描（代码级检测）

在 Agent / MCP 服务器 / Skill 代码层面做静态分析，发现不安全代码执行、敏感信息泄露、权限过度申请等风险。

| # | 项目 | ⭐ Stars | 厂商 | 定位 | 许可证 |
|---|------|---------|------|------|--------|
| 1 | **NVIDIA / SkillSpector** | ~10.4k | NVIDIA | AI 技能安全扫描器，检测不安全代码执行/敏感信息泄露/权限过度申请/供应链漏洞，输出 SARIF 标准报告 | Apache-2.0 |
| 2 | **snyk / agent-scan** | ~2.6k | Snyk | AI Agent/MCP 服务器/Agent 技能安全扫描器，Snyk 漏洞数据库背书 | Apache-2.0 |
| 3 | **cisco-ai-defense / skill-scanner** | ~2.2k | Cisco | Agent Skills 安全扫描器，Cisco AI Defense 产品线的一部分 | — |
| 4 | **AgentGG** | 本地记录 | 开源社区 | Agent 专用 SAST，检测 Prompt注入/工具权限/MCP安全/信任链/数据管道/依赖漏洞 6 大类风险 | MIT |
| 5 | **bruc3van / agent-skills-guard** | ~370 | 独立开发者 | Agent Skills 安全扫描 + 可视化桌面管理应用（Rust 编写） | — |
| 6 | **kurtpayne / skillscan-security** | ~6 | 独立开发者 | Agent Skills/MCP 工具包安全扫描器，含提示注入/IOC匹配/恶意软件检测/ML分类 | Apache-2.0 |
| 7 | **Arm / Metis** | 本地记录 | Arm | AI Agent 代码安全框架，检测提示注入/越权调用/数据泄露，性能优于传统 SAST | 开源 |

---

## 二、安全测试 / 红队评估框架（动态测试）

通过黑盒或半白盒方式对 Agent / LLM 做红队测试和攻击模拟。

| # | 项目 | ⭐ Stars | 厂商 | 定位 | 许可证 |
|---|------|---------|------|------|--------|
| 8 | **Tencent / AI-Infra-Guard** | ~3.9k | 腾讯 | 全栈 AI 红队平台，集成 OpenClaw Security Scan/Agent Scan/Skills Scan/MCP 扫描 | Apache-2.0 |
| 9 | **GH05TCREW / pentestagent** | ~2.6k | 社区 | AI Agent 黑盒安全测试框架，支持漏洞赏金/红队/渗透测试 | MIT |
| 10 | **samugit83 / redamon** | ~2.0k | 社区 | AI 驱动 Agent 红队自动化框架，从侦察到利用全流程 | MIT |
| 11 | **confident-ai / deepteam** | ~1.9k | Confident AI | LLM 和 AI Agent 红队测试框架 | Apache-2.0 |
| 12 | **msoedov / agentic_security** | ~1.9k | 社区 | LLM 漏洞扫描器 / AI 红队工具包，含模糊测试 | Apache-2.0 |
| 13 | **microsoft / RAMPART** | ~365 | 微软 | pytest 原生 Agent 安全测试框架，支持跨提示注入/工具调用/数据外泄测试，概率行为断言，CI/CD 集成 | MIT |
| 14 | **AgentSafeLabs / safelabs-eval** | 本地记录 | AgentSafeLabs | OWASP ASI Top 10 对齐的 Agent 安全评估框架，内置 30 个对抗性提示，零 LLM 成本 | Apache-2.0 |
| 15 | **microsoft / clarity-agent** | 本地记录 | 微软 | Agent 安全结构化设计助手，多视角失败分析（安全/人为/对抗/运维），.clarity-protocol/ 输出 | 开源 |

---

## 三、运行时安全防护（Firewall / Proxy / DLP）

在 Agent 运行的流量层面做实时检测和拦截，包括 MCP 协议扫描。

| # | 项目 | ⭐ Stars | 厂商 | 定位 | 许可证 |
|---|------|---------|------|------|--------|
| 16 | **splx-ai / agentic-radar** | ~983 | Splx AI | LLM Agent 工作流安全扫描器，CLI + DevSecOps 集成 | Apache-2.0 |
| 17 | **luckyPipewrench / pipelock** | ~729 | 社区 | 开源 AI Agent 防火墙，扫描 MCP / A2A / WebSocket 流量，DLP 支持 | Apache-2.0 |
| 18 | **Pantheon-Security / Medusa** | ~600 | Pantheon Security | AI 优先安全扫描器，79 分析器/4 万规则，含 Agent/MCP/LLM 检测 | AGPL-3.0 |
| 19 | **project-codeguard / rules** | ~409 | CodeGuard | Agent 安全规则框架，将安全默认嵌入 AI 编码 Agent 流程 | — |
| 20 | **SleuthCo / clawshield-public** | ~132 | SleuthCo | Agent 安全代理，eBPF 内核级检测，扫描每条消息的提示注入/PII/密钥 | Apache-2.0 |
| 21 | **SineWaveAI / agent-security-scanner-mcp** | ~111 | SineWaveAI | MCP 安全扫描服务器，430 万+ 包幻影检测，1000+ 漏洞规则 | MIT |
| 22 | **raiph-ai / fireclaw** | ~17 | 社区 | Agent 防火墙（4 阶段提示注入检测管道 + 社区威胁库） | AGPL-3.0 |
| 23 | **EresusSecurity / Eresus-sentinel** | ~13 | Eresus | AI/LLM 安全扫描器 — 模型分析 + 提示注入防火墙 + MCP 验证 + Pickle/SafeTensors/GGUF 模糊测试 | — |
| 24 | **EctoSpace / EctoClaw** | ~2 | 社区 | AI 防火墙 + 安全代理，"行车记录仪+紧急刹车" 阻断坏命令 | Apache-2.0 |
| 25 | **technosiveuk-ui / SentinelMCP** | ~11 | 社区 | MCP 协议防火墙/安全网关，YAML 规则引擎 + 审计日志 | Apache-2.0 |
| 26 | **cyberranger93 / mcp-guardian** | ~0 | 社区 | 本地 MCP 安全防火墙/扫描器/审计层 | MIT |
| 27 | **Claw Patrol** | 本地记录 | Deno 社区 | Agent 安全防火墙（双向流量过滤 + 行为基线异常检测），Docker 一键部署 | MIT |

---

## 四、行为监控 / 异常检测

对 Agent 运行时的行为做基线比对和异常发现。

| # | 项目 | ⭐ Stars | 厂商 | 定位 | 许可证 |
|---|------|---------|------|------|--------|
| 28 | **GEDD（aws-samples/sample-GEDD）** | 本地记录 | AWS | Agent "静默失败"检测，运行时行为偏差比对，CloudWatch 集成 | 开源 |
| 29 | **aparnaa19 / AgentForensics** | ~12 | 社区 | Agent 会话实时安全监控框架，检测提示注入/数据泄露等 | MIT |
| 30 | **Yassin-H-Rassul / AgentShield** | ~2 | 社区 | 多层欺骗式检测框架，识别被攻陷的工具使用 Agent | — |

---

## 五、治理 / 策略管控

为 Agent 工具调用和运行时提供策略引擎、审批工作流和审计管道。

| # | 项目 | ⭐ Stars | 厂商 | 定位 | 许可证 |
|---|------|---------|------|------|--------|
| 31 | **Microsoft Agent 治理工具包** | 本地记录 | 微软 | Agent 工具使用治理框架（YAML 策略引擎 + 审批工作流 + 审计管道 + 风险评分器），支持 OpenAI Agents SDK | 开源 |
| 32 | **Google Genkit Middleware** | 本地记录 | Google | 运行时拦截 + 策略执行中间件（AllowList / Retry / Fallback / ContentFilter） | Apache-2.0 |
| 33 | **Google Agent Executor（google/ax）** | 本地记录 | Google | 分布式 Agent 运行时（Go），内置 gVisor 安全沙箱 / 事件审计 / 会话隔离 | Apache-2.0 |

---

## 六、供应链 / 基准测试

| # | 项目 | ⭐ Stars | 厂商 | 定位 | 许可证 |
|---|------|---------|------|------|--------|
| 34 | **saint-viperx / SCR_Bench** | ~11 | 社区 | LLM Agent 技能生态安全风险评估基准，检测"孤立安全/组合危险"技能 | MIT |

---

## 按场景推荐

### 快速上手扫一遍 Agent 代码安全
- **AgentGG**（MIT）→ 安装即扫，6 大类风险
- **snyk/agent-scan**（Apache-2.0）→ Snyk 数据库背书

### CI/CD 集成安全测试
- **microsoft/RAMPART**（MIT，pytest 原生）→ `pip install` + 一行代码集成
- **Tencent/AI-Infra-Guard**（Apache-2.0）→ 全栈红队平台

### Agent 运行时流量检测
- **Claw Patrol**（MIT）→ Docker 一键部署
- **pipelock**（Apache-2.0）→ MCP/A2A/WebSocket 支持
- **SleuthCo/clawshield**（Apache-2.0）→ eBPF 内核级

### 红队安全评估
- **confident-ai/deepteam** → LLM+Agent 红队
- **AgentSafeLabs/safelabs-eval** → OWASP ASI 标准对齐
- **pentestagent** → 黑盒渗透框架

### 设计阶段安全左移
- **microsoft/clarity-agent** → 写代码前想清楚"为什么"/"出错了会怎样"

### MCP 协议安全
- **SentinelMCP** → 透明代理模式
- **SineWaveAI/agent-security-scanner-mcp** → MCP 扫描服务器

---

> **说明**：标 ⭐ 数为 GitHub star 近似值（采集时间 2026-06-25）。"本地记录"项目未标注 star 数。标注"开源"但未注许可证的需进一步确认许可证类型。
>
> 建议下一步：选 2-3 个高优先级项目做深度试用（如 snyk/agent-scan、Tencent/AI-Infra-Guard、microsoft/RAMPART），评估实际效果。
