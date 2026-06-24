---
layout: post
title: "Codex Desktop App 从入门到高手：2026 完整指南"
categories: [tool]
description: "以 Codex Desktop App 为主线，从安装登录到高手配置——插件选择哲学、MCP 优先级、12 个自建 Skills、AGENTS.md 模板、Windows 安全沙箱、Local Environments。重度开发者的完整桌面端工作台搭建方案。"
tags:
  - Codex
  - 桌面应用
  - AI 编码
  - 技能系统
  - AGENTS.md
---

Codex 在 2026 年已经不是单纯的命令行工具——**Codex App 才是主力工作台**。本文以 macOS/Windows 原生桌面应用为主线，覆盖截至 2026 年 6 月仍然有效的全部主要功能。

但本文不止是功能罗列——它更是一份**重度开发者的工作台配置思路**。不追求装很多插件，而是做一套「固定开发环境 + 少量高价值插件 + 项目级 Skills + AGENTS.md 规范」。Codex 官方也建议把它当作「可配置、可持续改进的队友」：用 AGENTS.md 固化项目规则，用 MCP 接外部系统，把重复工作沉淀为 Skills，再把稳定流程自动化。

> 需要 ChatGPT Plus、Pro、Business、Edu 或 Enterprise 计划。部分高级功能（Computer Use）仅限 Pro 及以上。

---

## 一、安装与首次启动

### 下载安装

Codex App 提供 macOS 和 Windows 版，直接[下载](https://chatgpt.com/codex?app-landing-page=true)。

下载后用 ChatGPT 账号登录。首次启动会让你选择或创建一个项目目录——Codex 会在该目录下读写文件。

### 界面概览

- **左侧栏** — 项目列表、线程列表
- **中央区域** — 对话面板，底部输入框
- **右侧边栏** — Artifacts（文件预览、计划、来源、摘要）
- **顶部工具栏** — 运行、线程切换、设置

### 第一个项目

选择项目目录后，确认「本地模式」已激活，然后发第一条消息：

> 告诉我这个项目的结构和作用

Codex 会读取项目文件、理解结构，直接回答。不用写 prompt 模板，不用配 system message。

---

## 二、多线程并行

Codex App 支持一个项目内打开**多个线程**，每个线程是独立上下文。左侧栏显示所有线程，点击切换。

- **线程 A** — 修复 bug
- **线程 B** — 编写测试
- **线程 C** — 审查 PR

每个线程有独立文件修改历史、独立终端会话、独立执行日志。线程状态持久化——关掉 App 再打开还在。

---

## 三、Review 与变更管理

Codex App 内建**代码审查面板**。Codex 完成修改后，你可以：

1. 查看 **diff 视图** — 逐文件、逐行审查
2. **处理 PR 反馈**
3. **Stage / Unstage** 文件
4. **提交** — 写 commit message
5. **推送** — 直接到远程仓库

全程在 App 内完成，不需要切换终端。

**审查工作流**：

```
Codex 完成修改 → Review 面板 → 审查 diff → 不满意处输入反馈
→ Codex 再改 → 确认 → Stage → Commit → Push
```

---

## 四、Worktrees（工作台树）

Worktrees 是 Git 的一个功能——让你在同一仓库的不同分支上**同时工作**。App 内建 worktree 支持，每个线程可以关联到不同的 worktree，修改完全隔离。

这对重度开发特别有用：不想动现有工作区就开新 worktree 尝试想法，不满意直接丢弃，不影响主分支。

---

## 五、Automations（自动化）

App 支持**定时任务**：安排 Codex 在指定时间或事件触发下执行任务。

- **每日依赖检查**
- **定时代码健康扫描**
- **CI 后自动审查 PR**
- **月度重构**

Automations 的核心概念是「唤醒线程」——一个已保存的线程可以被自动唤醒执行任务，完成后报告结果，回到休眠。这不等于 CI 脚本——Codex 会像人一样理解上下文做出判断，而非执行固定 shell 命令。

---

## 六、内建浏览器

App 自带一个浏览器，可以渲染和交互网页：

- **渲染预览** — 前端代码写完后直接看效果
- **浏览器操作** — 点击、填写表单、导航
- **调试** — 查看 DOM、网络请求、Console
- **截图反馈** — 截屏作为新需求的参考

前端开发的闭环：Codex 写代码 → 浏览器渲染 → 看效果 → 继续改。

---

## 七、Computer Use 与 Appshots

> Pro 及以上计划可用

Computer Use 让 Codex 操作你的**本地应用**——启动 Xcode、操作模拟器、执行 GUI 流程。

**Appshots** 是配套功能：一键截图最前端窗口发给 Codex，附带可提取文本。报错窗口、设计稿、第三方工具界面——截图即可。

---

## 八、Chrome 扩展

通过 Chrome 扩展，Codex 可以用你**已登录的 Chrome** 执行浏览器任务，无需重新认证。

### 安装方式

Codex App → Plugins → Add Chrome plugin，然后安装 Chrome 扩展并确认 Connected。

### 安全注意事项

Chrome 扩展权限较高（读取修改网站数据、浏览历史等）。通过 allowlist/blocklist 管理网站访问，**不要打开「始终允许所有网站」**。本地开发服务器和公共页面优先用内建浏览器。

---

## 九、图片生成与 Sites 部署

### 图片生成

App 内置图片生成能力。开发代码时，一个线程里就能生成占位图、配图、图标。图片自动保存到项目目录。

### Sites 一键部署

通过 Sites 插件，App 内直接构建和部署托管网站：

1. 描述想要什么网站
2. Codex 生成代码
3. 内建浏览器预览
4. 修改满意后一键部署
5. 获得公开 URL

不需要配置服务器、域名或 CI/CD。

---

## 十、IDE 扩展同步

如果同时在 VS Code / Cursor / Windsurf 中使用 Codex IDE 扩展，App 和 IDE 之间共享 Auto Context 和活跃线程——App 开始的任务可以在 IDE 中继续。

---

## 十一、Remote 远程连接

通过 ChatGPT 移动端 App，可以在手机上：

- 发起任务给桌面 Codex
- 审批操作请求
- 查看执行结果
- 继续对话

桌面在跑长时间任务时，手机上查看进度、批准操作。

---

## 十二、插件选择哲学

**不要追求装很多插件**。Codex 的官方建议也是：少而精，聚焦高价值。

插件和 Skills 的区别：

| 维度 | 插件 | Skill |
|------|------|-------|
| 本质 | 可安装分发单元 | 可复用工作流指令 |
| 包含 | Skills + MCP 配置 + Hooks | SKILL.md + 脚本 + 模板 |
| 作用 | 引入新能力和连接 | 沉淀开发方法和规范 |
| 共享 | 插件市场分发 | 项目级或全局 |

### 推荐优先安装的插件

#### 1. Codex Security Plugin（强烈推荐）

如果你做安全产品、Agent 安全、SCA 相关，这个插件优先级最高。它是 Codex 官方的安全审查插件，可以扫描代码漏洞、验证发现并提供证据和修复建议。

**扫描类型**：

| 用法 | 作用 |
|------|------|
| 普通安全扫描 | 扫整个仓库或模块 |
| Deep Scan | 重点模块深度扫描 |
| Diff Scan | 检查未提交改动 |
| Fix Finding | 生成最小修复补丁 |
| Export | 导出 JSON/CSV/SARIF |

**常用提示词**：

```
Use $codex-security:security-scan to scan this repository for security vulnerabilities.
```

```
Use $codex-security:security-diff-scan to review my current uncommitted changes
for security regressions. Focus on authentication, authorization, input handling,
filesystem access, network requests, secrets, and unsafe command execution.
```

普通扫描适合首次审查和日常评估；Deep Scan 更慢但更全面；PR 和本地改动应使用 diff-focused review。

#### 2. Chrome Plugin（前端/后台管理推荐）

需要 Codex 操作登录后的站点、内部工具、后台系统时安装。安装位置：Codex App → Plugins → Add Chrome plugin。

#### 3. GitHub Code Review（团队协作推荐）

在 PR 中通过 `@codex review` 请求审查，Codex 会审查 PR diff 并遵循仓库 AGENTS.md 规则。

建议在 AGENTS.md 中加入：

```
## Review guidelines
- 重点检查认证、授权、越权访问、敏感信息泄露
- 重点检查文件读写、命令执行、网络请求、MCP/Tool 调用
- 不要只给风格建议，优先报告 P0/P1 风险
- 所有修复建议必须给出影响范围和回归测试建议
```

#### 4. Linear / Slack 集成（按需）

- **Linear**：issue 指派给 Codex 或在 issue 评论 @Codex，适合需求流转和缺陷修复
- **Slack**：频道或线程里 @Codex 发起任务，适合多人协作场景

如果你是个人在 Windows Desktop 上重度开发，不一定马上装；多人协作时值得配。

---

## 十三、MCP 配置推荐

MCP 是 Codex 连接外部系统的标准协议。App、CLI、IDE 共享 MCP 配置，一个地方配好到处能用。

支持 STDIO 本地进程、Streamable HTTP、Bearer Token、OAuth 等模式。

### 按优先级配置

| MCP 类型 | 推荐度 | 用途 |
|---------|--------|------|
| OpenAI/官方 Docs MCP | 高 | 查官方文档，减少过时 API 写法 |
| GitHub MCP | 高 | issue、PR、代码搜索 |
| Chrome/浏览器 MCP | 高 | 前端验证、后台操作 |
| 自研 Agent Security / SCA Knowledge MCP | **很高** | 见下方 |
| Figma MCP | 中高 | 从原型图生成前端页面 |
| 数据库 MCP | 中（只读） | SQLite/PostgreSQL/MySQL 表结构查询 |
| Linear MCP | 中 | 需求/任务管理 |
| Jira/Confluence 知识库 MCP | 中 | 内部文档接入 |

### 最值得自研的 MCP：Agent Security / SCA Knowledge

你的场景里最高的投入产出比是**自建一个安全知识 MCP**，让 Codex 可以查询：

- Agent 安全检测项
- SCA 规则库
- 漏洞库 / 威胁情报
- Skill / MCP 安全风险特征
- 公司内部开发规范
- 常见误报说明
- 修复模板

这样 Codex 在写扫描器、规则、报告模板、检测项文档时，会明显更贴近你的产品。

---

## 十四、自建 Skills（核心部分）

Skills 是可复用工作流。官方说明：Skills 在 CLI、IDE Extension、App 都可用。Codex 先只读取 skill 名称、描述和路径，决定使用某个 skill 时才加载完整 SKILL.md——所以**不要无限堆技能，要做少而准**。

安装位置：

- 项目级：`项目根目录/.agents/skills/`
- 个人全局：`$HOME/.agents/skills/`

### 推荐自建的 12 个 Skills

| Skill 名称 | 用途 |
|-----------|------|
| **repo-onboarding** | 新项目接入时自动读目录、技术栈、启动方式，生成项目地图 |
| **spec-to-implementation** | 根据 spec/md/原型，拆成开发任务逐步实现 |
| **safe-refactor** | 重构前先建测试基线，小步提交，不大改架构 |
| **bug-reproduce-fix** | 先复现 → 定位 → 最小修复 → 验证 |
| **dotnet-csharp-backend** | .NET/C#/ASP.NET Core/SQLite/EF Core/Dapper 后端开发规范 |
| **vanilla-web-ui** | HTML + CSS + 原生 JS 前端实现规范 |
| **security-first-review** | 每次提交前检查认证、授权、文件、网络、命令执行 |
| **agent-security-design** | Agent 安全产品设计规范：行为监测、工具管控、沙箱、MCP 安全 |
| **sca-cli-development** | 专用于 Python/JS SCA CLI 项目的开发指导 |
| **report-prototype-builder** | 根据检测项生成安全报告、HTML 原型、仪表盘 |
| **test-and-verify** | 强制运行测试、lint、build，总结验证结果 |
| **release-notes-and-changelog** | 生成 changelog、版本说明、PR 描述 |

### Skill 编写示例结构

```markdown
# my-skill-name

为 xxx 任务提供可复用的行为模板。

## 触发条件
当用户要求 xxx 时自动激活。

## 执行步骤
1. 分析项目结构
2. 识别关键文件
3. 执行 xxx 操作
4. 验证结果

## 注意事项
- 不要修改 xxx 文件
- 执行前确认 xxx
```

---

## 十五、AGENTS.md（最基础的约束）

AGENTS.md 比 Skill 更基础。Codex 做任何工作前会先读取它。越靠近当前目录的文件优先级越高。**建议每个重度开发项目根目录都放一个。**

```markdown
# AGENTS.md
## 项目定位
这是一个重度开发项目，Codex 必须以资深工程师方式工作：
先理解现有架构，再提出计划，再小步修改，再验证。

## 工作方式
- 不要一上来大面积重构
- 修改前先阅读相关文件、启动方式、测试方式、配置文件
- 每次任务先输出简短实施计划
- 优先小步提交，避免一次修改过多模块
- 修改后必须运行可用的 build/test/lint
- 如果测试无法运行，说明原因和替代验证方式
- 不要删除用户已有功能，除非任务明确要求
- 不要引入新的生产依赖，除非先说明原因和影响

## 技术栈偏好
- 后端优先使用 .NET 8/9、C#、ASP.NET Core
- 本地存储优先 SQLite
- 前端优先 HTML + CSS + 原生 JavaScript
- 可视化使用 ECharts
- Python 用于 CLI、扫描器、数据同步、规则处理、SCA 相关任务

## 安全要求
- 重点检查认证、授权、越权、敏感信息泄露
- 重点检查命令执行、文件读写、网络请求、反序列化、路径穿越
- Agent/MCP/Skill 场景下，重点检查 prompt injection、tool abuse、
  data exfiltration、越权工具调用
- 不要把密钥、token、cookie、内部地址写入代码或日志
- 对任何外部输入都要有校验、边界和错误处理

## 完成标准
- 代码可以编译或运行
- 有必要的测试或手动验证步骤
- 总结修改文件、修改原因、风险点、后续建议
```

---

## 十六、Local Environments 与 Actions

重度开发不要每次让 Codex 猜怎么启动项目。App 支持配置 **Local Environments**：为 worktree 配置 setup script，并为项目配置常用 actions。

配置放在项目根目录 `.codex/` 文件夹里，可以提交到 Git 仓库共享。

### 建议配置的 Actions

| Action | 命令 |
|--------|------|
| Build backend | `dotnet build` |
| Run backend tests | `dotnet test` |
| Run frontend dev | `npm run dev` |
| Run lint | `npm run lint` |
| Python tests | `pytest` |
| Security scan | `semgrep scan .` |
| SCA sync | `python -m sca_cli sync` |
| Generate report | `python -m sca_cli report --format html` |

### Worktree 的 Setup Script 建议

.NET 项目：
```
dotnet restore
dotnet build
```

Node 项目：
```
npm install
npm run build
```

---

## 十七、Windows Desktop 安全配置

Windows 上建议优先使用 Codex 的 **elevated sandbox**。Windows 原生 agent mode 会用 sandbox 阻止工作目录外的文件写入，并阻止未经批准的网络访问。elevated 是首选，unelevated 是较弱回退。

配置示例（`.codex/config.toml` 或全局配置）：

```
[windows]
sandbox = "elevated"
```

### 重度开发安全建议

1. **项目必须是 Git 仓库**
2. **每个大任务使用 Worktree**，不要直接操作主目录
3. **不给 Codex 全盘目录权限**
4. **Chrome 插件只给必要域名授权**
5. **数据库 MCP 尽量只读**
6. **密钥、token、客户代码不要让 Codex 通过浏览器任务随意读取**

---

## 十八、最终推荐组合

```
必装插件：
- Codex Security Plugin
- Chrome Plugin
- Codex IDE Extension
- GitHub Code Review / GitHub 集成

建议配的 MCP：
- OpenAI Docs / 文档类 MCP
- 自研 Agent Security / SCA Knowledge MCP
- GitHub MCP
- 只读数据库 MCP
- Figma MCP（如果常从原型开发页面）
- Linear MCP（如果用 Linear）

必须自建的 Skills（12个）：
- repo-onboarding
- spec-to-implementation
- dotnet-csharp-backend
- vanilla-web-ui
- security-first-review
- agent-security-design
- sca-cli-development
- bug-reproduce-fix
- safe-refactor
- test-and-verify
- report-prototype-builder
- release-notes-and-changelog

优先级最高的配置：
1. AGENTS.md（每个项目根目录）
2. Local Actions（.codex/）
3. Worktree（每个大任务）
4. Codex Security Plugin（首次扫描 + Diff Scan）
5. Elevated Sandbox（Windows）
```

**一句话总结**：插件负责接系统和工具，Skills 负责沉淀你的开发方法，AGENTS.md 负责约束每个项目的行为边界。对于 Windows Desktop + 安全产品 + .NET/C# + 前端原型 + Python 扫描器的重度开发方式，最关键的是先把 AGENTS.md、Worktree、Local Actions、Codex Security Plugin 配好。

---

## 附录：常用 CLI 参考

虽然本文以 App 为主线，但以下是几个偶尔用到的 CLI 命令：

```bash
# 安装 Skill（在 App 的 Skills 面板也有等效操作）
npx skills add <package-name>

# 添加插件市场源
codex plugin marketplace add <owner>/<repo>

# 查看日志（调试用）
codex -c log_dir=./.codex-log
tail -F ./.codex-log/codex-tui.log
```

---

**官方入口**：[https://openai.com/zh-Hans-CN/codex/](https://openai.com/zh-Hans-CN/codex/)
**开发者文档**：[https://developers.openai.com/codex](https://developers.openai.com/codex)
**App 文档**：[https://developers.openai.com/codex/app](https://developers.openai.com/codex/app)
**GitHub 仓库**：[https://github.com/openai/codex](https://github.com/openai/codex)

> 本文基于 OpenAI Codex 官方文档（2026 年 6 月）编写，以 Desktop App 为主要使用界面。部分高级功能需要 Pro 及以上计划。
