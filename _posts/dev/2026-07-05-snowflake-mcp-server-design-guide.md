---
categories: [dev]
title: Snowflake MCP 服务器设计指南：在企业数据边界内构建安全的 Agent 工具面
description: Snowflake 发布了官方 MCP 服务器设计指南与线上实操实验室，围绕如何安全地将 AI Agent 连接到企业数据平台，涵盖 Cortex Analyst/Cortex Search/SYSTEM_EXECUTE_SQL/GENERIC/CORTEX_AGENT_RUN 五类工具，以及基于角色的权限模型、数据脱敏和审计日志。MCP 服务器作为原生 Snowflake 对象，通过 CREATE MCP SERVER 一行 SQL 创建。
tags: [Snowflake, MCP, 企业数据, Agent 安全, Cortex AI, 数据治理]
---

## 一句话结论

Snowflake 发布了官方的 **MCP 服务器设计指南**，聚焦于如何在 Snowflake 的安全边界内构建 AI Agent 可调用的治理化工具面。通过 `CREATE MCP SERVER` 语句，用户可以声明式地定义五类 MCP 工具——从只读问答（Cortex Analyst/Cortex Search）到 SQL 执行（SYSTEM_EXECUTE_SQL）、存储过程包装（GENERIC）再到完整的 Agent 委派（CORTEX_AGENT_RUN）——全部运行在 Snowflake 的 RBAC、数据脱敏和审计日志框架内。

> **来源说明**：原文 URL 为 8 月 13 日线上实操实验室注册页（尚未来临）。本文综合 Snowflake 官方博客《MCP Servers on Snowflake Unify and Extend Data Agents》（2025 年 7 月）、Snowflake 开源 MCP 仓库（Snowflake-Labs/mcp）及 The New Stack 报道等多来源资料成文。

## Snowflake MCP 服务器的两种形态

Snowflake 的 MCP 服务器能力分为两个阶段：

| 形态 | 状态 | 描述 |
|------|------|------|
| **开源 MCP 服务器** | 已发布 | GitHub: Snowflake-Labs/mcp，需用户自行部署，通过配置文件 + 编程访问令牌连接 |
| **托管 MCP 服务器** | Preview 中 | 作为原生 Snowflake 对象管理，`CREATE MCP SERVER` 一行 SQL 创建，自动继承 RBAC 和审计 |

设计指南和线上实操实验室针对的是**托管 MCP 服务器**形态。

## 五类 MCP 工具

托管 MCP 服务器暴露五类工具，覆盖从只读到可执行的完整谱系：

| 工具类型 | 功能 | 安全模型 |
|----------|------|---------|
| **Cortex Analyst** | 语义视图问答（结构化数据） | 只读，依赖 RBAC，通过语义模型限制可查询的列和行 |
| **Cortex Search** | 自然语言搜索（非结构化数据） | 只读，搜索结果受行级安全策略控制 |
| **SYSTEM_EXECUTE_SQL** | 执行用户自定义的 SQL 查询 | 可通过 `read_only` 参数限制只能读；受角色所能操作的仓库大小限制 |
| **GENERIC** | 包装存储过程，让 Agent 执行写回操作 | 最小权限原则——只授予存储过程所需的最小权限，人为审批写入操作 |
| **CORTEX_AGENT_RUN** | 将整个 Cortex Agent 暴露为单个工具 | 委派多步骤工作，Agent 内所有操作仍受 Snowflake 安全边界控制 |

> "工具面，以及它的爆炸半径，是一个有意的设计选择。"——Snowflake MCP 服务器设计指南

## 核心设计原则

### 1. 声明式 MCP 服务器创建

```sql
CREATE MCP SERVER my_server
  WITH TOOLS = (Cortex Analyst, Cortex Search, SYSTEM_EXECUTE_SQL)
  -- 工具面和爆炸半径是有意设计的选择
```

MCP 服务器作为原生 Snowflake 对象，直接集成到 Snowflake 的权限体系中。每次工具调用都以**连接用户的角色**运行，OAuth、RBAC、数据脱敏和审计自动生效。

### 2. 最小权限工具面

指南强调每个工具的描述（description）就是 Agent 的**全部 API 表面**。工具描述需要精确、无歧义，因为 Agent 会基于描述来决定何时调用哪个工具。

"工具的描述就是 Agent 的全部 API 表面。如果描述写得模糊，Agent 可能在不应使用该工具的场景下调用它。"

### 3. 安全边界内执行

所有数据操作都在 Snowflake 的安全边界内完成：
- **数据不离开 Snowflake**——Agent 通过 MCP 获得的是查询结果，而非原始数据访问
- **RBAC 自动生效**——Agent 以调用用户的角色身份执行
- **数据脱敏策略**自动应用到查询结果
- **审计日志**记录每次工具调用

### 4. 写入操作的特殊处理

对于 GENERIC 工具（写操作）：
- 将存储过程包装为 GENERIC 工具时，只授予该过程所需的最小权限
- 写入操作应保留人为审批环节
- 在专用 Warehouse 上运行，使用最小权限

## 上手路径

设计指南给出了清晰的渐进式路径：

1. **只读问答**：创建语义视图 + Cortex Search 服务 → 组装 MCP 服务器 → 连接 AI 客户端
2. **添加 SQL 执行**：添加 SYSTEM_EXECUTE_SQL，通过 `read_only` 和角色限制接触范围
3. **添加写回操作**：将存储过程包装为 GENERIC 工具，Agent 可执行真实操作（如读取客户评价后提交支持工单）
4. **委派多步骤**：可选地将整个 Cortex Agent 暴露为单个工具

## Agent 数据安全的最佳实践融合

Snowflake 的 MCP 指南与近期多家数据平台厂商（Databricks 等）的 MCP 方案形成一致的安全模式：

- **数据不离开平台**：Agent 通过 MCP 获取查询结果，原始数据始终在平台边界内
- **权限与身份绑定**：Agent 调用权限 = 调用用户的角色权限，无权限提升
- **审计永不遗漏**：每次 MCP 工具调用都是可审计的 Snowflake 操作
- **读/写分离**：只读工具和写工具在架构层面清晰分离
- **最小爆炸半径**：通过 `CREATE MCP SERVER` 精确声明 Agent 可调用的工具集

## 参考

- Snowflake 官方（8月13日实操实验室注册页）：[Designing a Snowflake MCP Server, Built for Your Data](https://www.snowflake.com/en/webinars/virtual-hands-on-lab/designing-a-snowflake-mcp-server-built-for-your-data-2026-08-13/)
- Snowflake 官网博客：[MCP Servers on Snowflake Unify and Extend Data Agents](https://www.snowflake.com/en/blog/mcp-servers-on-snowflake-unify-and-extend-data-agents/)（2025-07-15）
- GitHub：[Snowflake-Labs/mcp](https://github.com/Snowflake-Labs/mcp) —— 开源 MCP 服务器
- The New Stack：[Snowflake MCP Server Opens Enterprise Data for Wider AI Use](https://thenewstack.io/snowflake-mcp-server-opens-enterprise-data-for-wider-ai-use/)（2025-10-02）
- Snowflake 文档：[Cortex Agents + MCP 快速入门](https://quickstarts.snowflake.com/guide/mcp-server-for-cortex-agents/index.html)
