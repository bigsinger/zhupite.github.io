---
layout: post
title: "Audit Skills：AI 编码 Agent 的 30 条安全审计不变量"
categories: [sec]
description: "开发者 danygiguere 发布了 Audit Skills——一套面向 AI 编码 Agent 的安全审计检查清单，包含 30 条跨语言不变量规则。这不是一个静态检查工具，而是一套完整的 Agent Skill 系统：Agent 可以在编码过程中实时审计自身产出的安全性，从密钥泄露到 SQL 注入、从竞态条件到 N+1 查询，覆盖安全、正确性和可运维性。"
tags:
  - AI安全
  - Agent安全
  - 审计清单
  - 安全审计
  - 开源项目
  - Agent Skills
  - 代码安全
---

2026 年 6 月 14 日，开发者 danygiguere 在 GitHub 上发布了一个很有意思的项目——**Audit Skills**。它是一套面向 AI 编码 Agent 的安全审计检查清单，包含 30 条**语言无关的不变量规则**。

但如果你只看"30 条规则"这几个字，可能会错过这个项目中更有趣的部分。

---

## 是什么：不止是清单

Audit Skills 不是一份 PDF 文档或一个静态检查工具。它是一个完整的 **Agent Skill 系统**，安装到你的项目后，Agent（Claude Code、Copilot、Cursor、Codex）可以在编码过程中**主动对自己产出的代码进行安全审计**。

```
项目根目录/
├── .agents/
│   └── skills/
│       ├── audit/                              # 主审计技能
│       │   ├── SKILL.md                        # 路由器
│       │   └── references/
│       │       ├── access-data-security/       # 9 条访问与数据安全审计
│       │       ├── input-api-dependency/       # 7 条输入/API 审计
│       │       ├── correctness/                # 7 条正确性审计
│       │       └── operability/                # 7 条可运维性审计
│       ├── audit-idor/                        # 独立可调用的子技能
│       ├── audit-injection/
│       └── ...
├── AGENTS.md                                   # 30 条不变量的一页速查
```

每个审计项都是独立的 Agent Skill，意味着你可以：
- 让 Agent **自动检测**编码中的安全问题
- 通过命令 `/audit` 或 `/audit-idor` 手动触发特定审计
- 审计完成后，用 `/audit-fix-authz` 等修复技能自动修复

---

## 30 条不变量：四类覆盖

### 访问与数据安全（9 条）

| 审计项 | 检查内容 |
|--------|---------|
| `/audit-authorization` | 操作点是否有服务端权限检查——仅 UI 层门禁、读权限检查但写操作未检查 |
| `/audit-authn-session` | 登录/登出/密码重置流程——会话固定、账户枚举、Token 过期 |
| `/audit-idor` | 用户提供的 ID 直接用于资源访问——未验证请求者是否有权限操作该资源 |
| `/audit-data-exposure` | 过度暴露的响应、错误和日志——全模型序列化、堆栈跟踪、PII |
| `/audit-crypto` | 密码哈希、Token 随机性、常量时间比较、自研密码学、密钥管理 |
| `/audit-output-encoding` | XSS——用户数据在 HTML/JS/CSS/URL/Header/Email 中未做上下文适配编码 |
| `/audit-tenant-isolation` | 跨租户泄漏——未限域的查询、无租户的缓存键、跨租户的后台任务 |
| `/audit-csrf` | 状态变更接口使用 Cookie/Session 认证但缺少 CSRF Token 或 Origin 验证 |
| `/audit-mass-assignment` | 请求体直接绑定到模型——可写的 role/owner/balance 字段 |

### 输入与 API（7 条）

| 审计项 | 检查内容 |
|--------|---------|
| `/audit-injection` | SQL/NoSQL、命令、模板、路径注入——输入拼接进查询、Shell 或模板 |
| `/audit-config` | 不安全配置——生产环境 debug、宽松 CORS、缺少安全头、Cookie 标志 |
| `/audit-secrets` | 硬编码凭据、日志或版本控制中的密钥、过宽权限的 Key、无轮换路径 |
| `/audit-api-validation` | 边界验证——类型、范围、允许值列表、信任客户端计算的金额和角色 |
| `/audit-file-handling` | 路径遍历、未验证的上传、缺少大小限制、zip-slip |
| `/audit-ssrf` | 服务端请求用户可控 URL——白名单、私有 IP 范围、重定向重新验证 |
| `/audit-parser-differentials` | 验证器和消费者对同一输入的不同解析——非锚定正则、startswith 白名单 |

### 正确性（7 条）

| 审计项 | 检查内容 |
|--------|---------|
| `/audit-atomicity` | 多存储写入无事务——部分状态在失败后残留 |
| `/audit-idempotency` | 执行两次后行为异常——Webhook、支付、队列重投递、重复提交 |
| `/audit-background-work` | 任务/消费者——无限重试、毒消息、缺少超时、重复/乱序投递 |
| `/audit-state-management` | 竞态条件——在共享状态上 check-then-act 无锁或原子操作 |
| `/audit-exception-handling` | 吞没错误、笼统 catch、丢失的 cause、错误的 HTTP 状态码 |
| `/audit-discarded-async` | Fire-and-forget Bug——Promise 从未 await、bare subscribe、静默不运行的冷写 |
| `/audit-cardinality` | 假设查询匹配一行——UPDATE/DELETE 在非唯一列上扩散、findOne 在非唯一字段 |

### 可运维性（7 条）

| 审计项 | 检查内容 |
|--------|---------|
| `/audit-nplus1` | 集合内循环中的查询或 HTTP/Cache 调用 |
| `/audit-observability` | 静默失败——被吞的错误、无标识符的日志、无指标或告警路径 |
| `/audit-migration-safety` | 锁表的 Schema 变更、无扩缩容策略的破坏性变更、非批量的回填 |
| `/audit-resource-limits` | 输入导致的无限工作——缺少分页、大小上限、速率限制、灾难性正则 |
| `/audit-blocking-io-async` | 事件循环或协程上的阻塞调用、调度器上的 CPU 工作、缺少超时 |
| `/audit-schema-design` | 外键列和热路径缺少索引、ORM 关系无真实外键、浮点金额 |
| `/audit-statelessness` | 在第二个副本或部署中会失效的状态——内存会话、静态可变状态、本地磁盘上传 |

---

## 为什么不是"又一个 linter"

项目 README 中的一句话点出了本质差异：

> *"`/audit` on a 20-line money handler — six bugs a static-analysis scanner
> can't see, because each takes reasoning about ownership, concurrency, and
> retries, not pattern-matching."*

演示中，对一个 20 行的支付处理函数审计，发现了**6 个静态分析工具无法发现的 Bug**——因为每个 bug 都需要推理所有权、并发和重试语义，而非模式匹配。

传统 linter 和 SAST 工具擅长检测**语法层面的问题**（比如 SQL 注入的参数化、硬编码的 Secret），但无法发现：
- **授权缺失**：一个支付接口是否在操作点做了权限检查？工具只能看到"接口调用了 `check_permission()`"，但无法判断调用是否正确
- **竞态条件**：两个操作之间是否存在 check-then-act 窗口？这需要跨函数理解代码逻辑
- **IDOR**：资源 ID 来自请求参数但未验证权限——工具只能看到"读取了 ID"，无法判断是否需要权限校验
- **数据暴露**：返回值是否返回了不该返回的字段？工具能看到字段列表，但无法判断哪些字段是敏感的

AI Agent 的优势恰恰在这里：**它可以在不写规则的情况下，理解代码的语义上下文。** 30 条不变量不定义"如何检测"，而是定义"什么是正确的"，让 Agent 自己去理解和判断。

---

## 设计与使用

### 语言无关的设计

每条检查清单都使用**不变量和检测特征（invariants and detection smells）**，而非框架 API。项目列出了 8 个常见生态作为"识别快捷方式"（Rails、Laravel、Django、Spring、Node、Vapor、.NET、Go），但明确声明这些不是支持列表——Phoenix、FastAPI、Ktor 等同样适用，由 Agent 自行翻译。

### 审计-修复分离

审计和修复是故意分开的步骤。`/audit` 只查找和报告——从不修改代码。修复在你主动要求时才会执行：

```
# 先审计
/audit src/payments/handler.py

# 确认发现后，再要求修复
/audit-fix-authz          # 授权、IDOR、租户隔离的修复模式
/audit-fix-async          # 原子性、幂等性、后台任务、状态管理的修复
/audit-fix-observability  # 可观测性的修复
```

对于大多数问题（注入、密钥泄露、输出编码、N+1 查询），每个 checklist 的 `Example` 部分直接展示了脆弱示例和修复后代码，Agent 可以机械地应用。

对于存在多种有效方案的问题（幂等性：去重表？幂等键？UPSERT？），修复技能提供一个**修复决策树**，让 Agent 根据上下文选择。

### 安装

```bash
# 克隆到项目目录
git clone --depth 1 https://github.com/danygiguere/audit-skills /tmp/audit-skills
cp -R /tmp/audit-skills/.agents your-project/

# 可选：添加到 AGENTS.md 以获得持久感知
cat /tmp/audit-skills/AGENTS.md >> your-project/AGENTS.md
```

安装就是复制 Markdown 文件——**没有可执行代码，没有任何运行时依赖。**

---

## 在 Agent 安全工具生态中的位置

| 工具 | 定位 | 运行时机 | 检查方式 |
|------|------|---------|---------|
| **Agent Gate** | CI 阶段的确定性门禁 | PR 触发时 | 静态规则（GitHub API 读取） |
| **Burpwn** | Agent 通信的拦截代理 | Agent 运行时 | 被动流量捕获与分析 |
| **Audit Skills** | Agent 自身产出的语义审计 | 编码过程中 | AI 理解的语义检查 |

Audit Skills 弥补的是 **Agent 在写代码时对自己产出做语义检查**的能力。它不是一个门禁（像 Agent Gate 那样拦在 CI 中），也不是一个代理（像 Burpwn 那样监听通信），而是一张**内化在 Agent 思维里的安全基线**——让 Agent 在敲下每一行代码时，都能问自己一句：这符合 30 条不变量吗？

---

## 当前状态

| 项目 | 内容 |
|------|------|
| **版本** | v0.2.2 |
| **许可证** | MIT |
| **格式** | Agent Skills（纯 Markdown） |
| **兼容** | Claude Code、GitHub Copilot、Cursor、Codex CLI、OpenCode |
| **仓库** | `github.com/danygiguere/audit-skills` |
| **更新方式** | 复制到项目，通过版本号印章检查更新 |

---

## 结语

审计清单本身就很有价值，但 Audit Skills 真正启发我的是它的设计思路：**在 AI 编码时代，安全基线的最终载体不是规则引擎，而是 AI 本身**。

这不是说静态工具没有用了——Agent Gate、Burpwn 在它们的位置不可或缺。但有一层安全检测只有 AI 能完成：**理解代码的语义——知道这段代码"应该"做什么，然后判断它是否做对了。** 30 条不变量写的不是检测逻辑，而是"什么是正确的"的标准。剩下的判定，交给 Agent。

---

**参考资料**
- [Audit Skills GitHub 仓库](https://github.com/danygiguere/audit-skills)
- [Hacker News 讨论](https://news.ycombinator.com/item?id=48523469)
- [Agent Skills 格式规范](https://github.com/vercel-labs/skills)
- [OWASP Top 10 (2021)](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10 (2023)](https://owasp.org/API-Security/)
