---
layout: post
title: "AgentGG：首个开源AI Agent代码安全扫描器"
categories: [sec, tool]
tags:
  - Agent安全
  - SAST
  - 开源工具
  - 代码审计
  - Prompt注入
description: "AgentGG 是专为 AI Agent 代码设计的开源静态安全扫描器，MIT 许可。可检测 Prompt 注入、工具权限配置错误、MCP 服务器配置缺陷等 5 类 Agent 特有漏洞，支持 LangChain/CrewAI/Semantic Kernel 等主流框架。"
---

## AgentGG 是什么

AgentGG 是首个面向 AI Agent 代码的开源 SAST（静态应用安全测试）扫描器，2026年6月发布，MIT 许可证。它的核心定位是填补 Agent 代码安全分析工具的空白。

传统的 SAST 工具（如 SonarQube、Fortify）擅长发现 SQL 注入、XSS、缓冲区溢出等传统 Web 漏洞，但它们不理解 Agent 特有的安全模式——Prompt 注入、工具调用权限泄露、Agent 间信任关系等。AgentGG 就是为解决这些问题而生的。

## 提供的功能

### 支持的检测类型

| 检测类型 | 说明 |
|---------|------|
| **Prompt 注入漏洞** | 分析 Agent 指令中是否存在可被外部输入污染的注入点 |
| **工具调用权限配置错误** | 检测 Agent 工具函数是否暴露了不应暴露的操作权限 |
| **不安全数据处理管道** | 分析数据在 Agent 各环节流转时是否存在未校验/未隔离的处理路径 |
| **Agent 间信任关系漏洞** | 检测多 Agent 协作场景下，Agent 之间的身份认证和授权是否足够 |
| **MCP 服务器不安全配置** | 检查 MCP（Model Context Protocol）服务器配置中的安全缺陷，如未鉴权的工具暴露 |

### 支持的主流框架

AgentGG 能够解析和分析以下框架构建的 Agent 代码：

- **OpenClaw** — Agent 编排框架的代码分析
- **LangChain** — 链式调用和数据管道的安全审计
- **CrewAI** — 多 Agent 协作场景的信任关系检查
- **Semantic Kernel** — Microsoft 的 AI 编排 SDK 代码扫描

### 修复建议

与传统 SAST 仅报告问题不同，AgentGG 提供**基于 AI 的修复建议**，帮助开发者理解漏洞成因并获取可直接参考的修复方案。这一点对于 Agent 安全这种新兴领域尤为重要——开发者可能知道某个写法有问题，但不一定知道"正确写法应该是什么"。

## 如何使用

AgentGG 作为命令行工具使用，安装和运行非常简单：

```bash
# 安装
pip install agentgg

# 扫描单个文件
agentgg scan agent.py

# 扫描整个项目
agentgg scan .

# 指定框架类型（自动检测失效时使用）
agentgg scan --framework langchain .

# 输出格式
agentgg scan --format json .
agentgg scan --format sarif .
```

也支持集成到 CI/CD 流水线：

```yaml
# GitHub Actions 示例
- name: Agent Security Scan
  run: |
    pip install agentgg
    agentgg scan . --format sarif --output results.sarif
```

## 定位

AgentGG 的定位非常清晰：**面向 Agent 开发者的免费静态安全分析工具**，不做全栈安全平台。

它和传统 SAST 的关系是互补而非替代：

| 对比项 | 传统 SAST（如 SonarQube） | AgentGG |
|--------|--------------------------|---------|
| 检测范围 | SQL注入、XSS、CSRF等Web漏洞 | Prompt注入、工具权限、MCP配置等 |
| 框架支持 | Spring、Django等Web框架 | LangChain、CrewAI、Semantic Kernel等 |
| 修复建议 | 通用最佳实践 | AI辅助的Agent特定修复方案 |
| 许可证 | 商业/社区版 | MIT开源免费 |

从产业位置看，AgentGG 填补了"Agent 代码安全分析"这块空白。在此之前，开发者检测 Agent 安全问题基本靠手动 code review 或者靠运行时拦截工具（如 Guardrails、AI Firewall），缺乏在开发阶段前置发现问题的手段。AgentGG 把安全左移到了编码阶段。

## 价值

1. **免费开源**：MIT 许可，没有商业 Licens 限制，适合个人开发者和小团队直接使用。

2. **填补工具空白**：Agent 开发框架已经在快速成熟（LangChain 已有 10 万+ Star），但 Agent 安全分析工具几乎为零。AgentGG 是第一个系统性的直面这个问题的开源工具。

3. **安全教育价值**：AgentGG 的报告和修复建议本身就能帮助开发者建立 Agent 安全意识。开发者可能第一次知道「原来 Agent 之间的信任关系也需要鉴权」或「这个工具函数不应该暴露给 LLM」。

4. **生态信号**：AgentGG 的出现说明 Agent 安全正在从「意识阶段」进入「工具体系化阶段」。有开源工具 → 有规范实践 → 有商业产品，这是一个成熟市场演进的标准路线。

5. **CI/CD 集成**：支持 SARIF 输出格式意味着它可以无缝融入现有的安全 DevSecOps 流水线，与 GitHub Advanced Security 等平台对接。
