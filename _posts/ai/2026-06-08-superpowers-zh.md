---
layout: post
title: "superpowers-zh：AI 编程超能力中文增强版 —— 让 18 款 AI 编程工具真正会干活"
categories: [ai]
description: "superpowers（159k+⭐）完整汉化 + 6 个中国原创 skills，支持 Claude Code / Copilot CLI / Hermes Agent / Cursor 等 18 款 AI 编程工具。npx superpowers-zh 一条命令自动识别并安装 20 个工作方法论技能。"
keywords: superpowers, superpowers-zh, AI编程, Claude Code, Copilot CLI, Hermes Agent, skills, 中文增强, MCP
tags: [ai, open-source]
  - superpowers
  - AI编程
  - skills
  - Claude Code
  - 中文增强
---

# superpowers-zh：AI 编程超能力中文增强版

## 项目介绍

**superpowers-zh** 是 [superpowers](https://github.com/obra/superpowers)（159k+⭐）的**中文增强版** —— 在完整翻译上游 14 个技能的基础上，新增了 **6 个面向中国开发者的原创技能**，并适配了 **18 款主流 AI 编程工具**。

一句话定位：**superpowers = AI 编程工具的工作方法论内核；superpowers-zh = 方法论内核 + 18 款工具一键适配 + 国内 Git/CI 生态 + 中文化表达习惯。**

| 维度 | superpowers（英文上游） | superpowers-zh（中文增强版） |
|------|------------------------|-----------------------------|
| Skills 总数 | 14 | **20**（14 翻译 + 6 国产原创） |
| 语言 | 英文 | 中文（技术术语保留英文） |
| 支持工具 | 6 款 | **18 款** |
| 安装方式 | 按工具分别安装 | **`npx superpowers-zh` 一条命令自动识别** |
| Git 平台 | GitHub 为主 | GitHub + Gitee + Coding + 极狐 GitLab + CNB |
| 代码审查风格 | 西方直接风格 | 适配国内团队沟通文化 |
| MCP 构建 | 无 | 独立 `mcp-builder` skill |
| 工作流编排 | 无 | 独立 `workflow-runner` skill（多角色 YAML 编排） |
| 社区 | Discord | 微信公众号 + 微信群 + QQ 群 |

### GitHub 数据

| 项目 | 数据 |
|------|------|
| 仓库 | https://github.com/jnMetaCode/superpowers-zh |
| Stars | 4,880 |
| Forks | 470 |
| 编程语言 | Shell |
| 开源协议 | MIT |
| 创建时间 | 2026-03-20 |
| 最后更新 | 2026-06-08 |

---

## 为什么要用 superpowers-zh？

很多人以为 AI 编程工具装上就能用，结果发现 AI 经常写出你不需要的东西、忘掉已讨论过的约束、或者在错误的方向上越跑越远。**问题不在工具本身，而在 AI 缺少工作方法论。**

装了 superpowers-zh 前后，AI 的工作方式完全不同：

| 场景 | 没装 superpowers-zh | 装了 superpowers-zh |
|------|-------------------|--------------------|
| 需求沟通 | 用户一句话，AI 直接开始写代码 | 先头脑风暴 → 写规格 → 确认后再动手 |
| 实现过程 | 一次写出全部代码，出错要全部重来 | 测试驱动开发（TDD），红绿重构循环 |
| 调试问题 | 盲目改代码，改到对为止 | 四阶段系统化调试：定位→分析→假设→修复 |
| 复杂任务 | 单线程串行处理 | 派遣并行 Agent 并发执行 |
| 代码审查 | 写完就提交 | 自动审查 → 验证通过后提交 |
| 版本管理 | 一个分支改到底 | Git Worktree 隔离开发，结构化管理 |

---

## 支持的 18 款 AI 编程工具

| 工具 | 类型 | 一键安装 |
|------|------|:--------:|
| [Claude Code](https://claude.ai/code) | CLI | `npx superpowers-zh` |
| [Copilot CLI](https://githubnext.com/projects/copilot-cli) | CLI | `npx superpowers-zh --tool copilot` |
| [Hermes Agent](https://github.com/NousResearch/hermes-agent) | CLI | `npx superpowers-zh --tool hermes` |
| [Cursor](https://cursor.sh) | IDE | `npx superpowers-zh` |
| [Windsurf](https://codeium.com/windsurf) | IDE | `npx superpowers-zh` |
| [Kiro](https://kiro.dev) | IDE | `npx superpowers-zh` |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | CLI | `npx superpowers-zh` |
| [Codex CLI](https://github.com/openai/codex) | CLI | `npx superpowers-zh` |
| [Aider](https://aider.chat) | CLI | `npx superpowers-zh` |
| [Trae](https://trae.ai) | IDE | `npx superpowers-zh` |
| [VS Code](https://code.visualstudio.com)（Copilot）| IDE 插件 | `npx superpowers-zh` |
| [DeerFlow 2.0](https://github.com/bytedance/deer-flow) | Agent 框架 | `npx superpowers-zh` |
| [OpenCode](https://opencode.ai) | CLI | `npx superpowers-zh` |
| [OpenClaw](https://github.com/anthropics/openclaw) | CLI | `npx superpowers-zh` |
| [Qwen Code](https://tongyi.aliyun.com/lingma)（通义灵码）| IDE 插件 | `npx superpowers-zh` |
| [Antigravity](https://github.com/anthropics/antigravity) | CLI | `npx superpowers-zh` |
| [Claw Code](https://github.com/ultraworkers/claw-code) | CLI (Rust) | `npx superpowers-zh` |
| [Qoder](https://qoder.com)（阿里 AI IDE） | IDE | `npx superpowers-zh` |

运行 `npx superpowers-zh` 会自动检测项目中使用的工具，将 20 个 skills 安装到正确位置。识别不出时可用 `--tool <name>` 显式指定。

---

## 20 个 Skills 详解

### 翻译自上游的 14 个 Skills

| Skill | 用途 | 核心价值 |
|-------|------|---------|
| **头脑风暴** (brainstorming) | 需求分析 → 设计规格，不写代码先想清楚 | 避免"一句话需求→直接撸码→跑偏"的恶性循环 |
| **编写计划** (writing-plans) | 把规格拆成可执行的实施步骤 | 复杂功能有清晰路线图 |
| **执行计划** (executing-plans) | 按计划逐步实施，每步验证 | 不跳过验证步骤 |
| **测试驱动开发** (test-driven-development) | 严格 TDD：先写测试，再写代码 | 测试覆盖率有保障 |
| **系统化调试** (systematic-debugging) | 四阶段调试法：定位→分析→假设→修复 | 告别"改到对为止"的盲目调试 |
| **请求代码审查** (requesting-code-review) | 派遣审查 agent 检查代码质量 | 提交前多一层质量把关 |
| **接收代码审查** (receiving-code-review) | 技术严谨地处理审查反馈 | 拒绝敷衍，每条反馈都验证 |
| **完成前验证** (verification-before-completion) | 证据先行——声称完成前必须跑验证 | 避免"代码好像没问题"的凭感觉发布 |
| **派遣并行 Agent** (dispatching-parallel-agents) | 多任务并发执行 | 2-3 个独立任务同时跑，效率翻倍 |
| **子 Agent 驱动开发** (subagent-driven-development) | 每个任务一个 agent，两轮审查 | 复杂项目结构化分工 |
| **Git Worktree 使用** (using-git-worktrees) | 隔离式特性开发 | 不污染主分支 |
| **完成开发分支** (finishing-a-development-branch) | 合并/PR/保留/丢弃四选一 | 每次完成都有明确收尾动作 |
| **编写 Skills** (writing-skills) | 创建新 skill 的方法论 | 可自扩展技能体系 |
| **使用 Superpowers** (using-superpowers) | 元技能：如何调用和优先使用 skills | AI 自动知道什么时候该用什么技能 |

### 6 个中国特色原创 Skills

> ⚠️ 前 4 个为「手动调用」skill——需在对话中显式输入 `/chinese-xxx` 才会加载，避免污染上游 skill 的自动调度。

| Skill | 用途 | 调用方式 |
|-------|------|---------|
| **中文代码审查** (chinese-code-review) | 符合国内团队文化的代码审查规范 | `/chinese-code-review` |
| **中文 Git 工作流** (chinese-git-workflow) | 适配 Gitee/Coding/极狐 GitLab/CNB | `/chinese-git-workflow` |
| **中文技术文档** (chinese-documentation) | 中文排版规范、中英混排、告别机翻味 | `/chinese-documentation` |
| **中文提交规范** (chinese-commit-conventions) | 适配国内团队的 commit message 规范 | `/chinese-commit-conventions` |
| **MCP 服务器构建** (mcp-builder) | 构建生产级 MCP 工具，扩展 AI 能力边界 | 自动触发 |
| **工作流执行器** (workflow-runner) | 在 AI 工具内运行多角色 YAML 工作流 | 自动触发 |

---

## 快速安装

```bash
# 推荐方式：npm 安装（自动检测工具并安装）
cd /your/project
npx superpowers-zh
```

> ⚠️ **不要在 `~` 主目录下运行**。v1.2.1+ 会拒绝并提示。

```bash
# 显式指定工具
npx superpowers-zh --tool cursor
npx superpowers-zh --tool trae
npx superpowers-zh --tool hermes

# 卸载
npx superpowers-zh@latest --uninstall

# 查看帮助
npx superpowers-zh --help
```

卸载时会做什么：
- 删除所有装过的 skill 目录（`.claude/skills/`、`.trae/skills/` 等）
- 删除独立 bootstrap 文件
- 清理追加到 `CLAUDE.md` / `HERMES.md` / `GEMINI.md` 里的 superpowers-zh 段，**保留你自己写的内容**

### 手动安装（备选）

```bash
git clone https://github.com/jnMetaCode/superpowers-zh.git

# 选择你使用的工具
cp -r superpowers-zh/skills /your/project/.claude/skills      # Claude Code
cp -r superpowers-zh/skills /your/project/.hermes/skills      # Hermes Agent
cp -r superpowers-zh/skills /your/project/.cursor/skills      # Cursor
cp -r superpowers-zh/skills /your/project/.codex/skills       # Codex CLI
cp -r superpowers-zh/skills /your/project/.trae/rules         # Trae
# 其他工具同理...
```

> ⚠️ 手动 `cp -r skills` 是低保版安装，缺少 hooks + bootstrap 引导文件的自动配置。**强烈推荐用 `npx superpowers-zh` 方式。**

---

## 优劣势分析

| 优势 | 说明 |
|------|------|
| **安装极简** | `npx superpowers-zh` 一条命令自动识别工具并安装，零配置 |
| **覆盖广泛** | 18 款 AI 编程工具，几乎覆盖了市面上所有主流 AI 辅助开发工具 |
| **本地化深入** | 不仅是翻译，而是 4 个中国特色 skill + 国内 Git/CI 平台适配 |
| **社区活跃** | 微信 + QQ 群，中文开发者沟通无门槛 |
| **卸载干净** | 哨兵注释标记，卸载精确切除，不残留 |
| **生态兼容** | 兼容上游新版，国产增量叠加，非独立分支 |

| 劣势 | 说明 |
|------|------|
| **npm 依赖** | 需要 Node.js 环境执行 `npx`，无 Node 的环境要用手动方式 |
| **手动 skill 需记忆** | 4 个中文 skill 需手动输入 `/chinese-xxx` 触发，需要适应期 |
| **英文上游更新滞后** | 同步上游有版本滞后（但这正是国产增量的价值所在） |

---

## 适合谁用

- **国内开发者** —— 习惯了中文沟通方式，希望 AI 用中文输出规范的工作流
- **AI 编程工具用户** —— 无论你用 Claude Code、Cursor 还是 Hermes Agent，都能受益
- **团队/项目协作** —— 中文代码审查、中文提交规范直接适配国内团队文化
- **AI 创业团队** —— DeerFlow 2.0 集成，可与企业级的字节开源 Agent 框架配合
- **想提升 AI 编程质量的人** —— TDD、系统化调试、完成前验证等方法论直接提升输出质量

---

## 总结

superpowers-zh 解决了 AI 编程中一个核心痛点：**AI 不缺少能力，缺少的是"怎么干活"的方法论。** 装上 20 个技能后，AI 不再是收到一句话就乱写代码的工具，而是会先做需求分析、写测试、逐步实现、验证完成、代码审查——整个流程比手动编码还规范。

国内开发者最值得关注的是 4 个中文 skill，它们不是简单的翻译，而是**真正适配国内团队工作习惯**的补充。加上对 Gitee/Coding/极狐 GitLab 等国内平台的支持，让 superpowers-zh 成为国内 AI 编程的最佳伴侣。

---

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/jnMetaCode/superpowers-zh |
| 英文上游 | https://github.com/obra/superpowers |
| npm 包 | https://www.npmjs.com/package/superpowers-zh |
| 配套方法论书籍 | https://book.aibuzhiyu.com/ |
| 安装方式 | `npx superpowers-zh` |
| 开源协议 | MIT |

## 参考资料

- **GitHub 仓库**：项目主页，包含 README 和详细文档。→ https://github.com/jnMetaCode/superpowers-zh
- **英文上游 superpowers**：原始 projects 框架（159k+⭐）。→ https://github.com/obra/superpowers
- **npm 包页面**：包信息、版本历史。→ https://www.npmjs.com/package/superpowers-zh
- **官方微信公众号**：「AI不止语」（微信搜索 AI_BuZhiYu）
