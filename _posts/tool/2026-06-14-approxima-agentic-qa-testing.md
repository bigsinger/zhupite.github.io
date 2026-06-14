---
layout: post
title: "Approxima：开源 Agentic QA 工具，用英语写测试、AI 自动找回归缺陷"
categories: [tool]
description: "Approxima 是一个开源 Agentic Web 测试平台，用自然语言描述测试步骤，AI 驱动的浏览器代理自动执行并检测回归缺陷。支持 Goal Mode（自动探索生成步骤）、自愈（UI 变化后自动修复）、Live Screencast。MIT 协议。"
tags:
  - Approxima
  - AI测试
  - Agentic QA
  - 回归测试
  - E2E测试
  - 开源
  - Y Combinator
---

端到端测试长期以来有两个让人头痛的选择：

**要么**用 Playwright/Cypress 写脚本——精准但脆弱，UI 但凡改个 class 名或挪个按钮，就跑红一堆 case，维护成本比写代码还高。
**要么**用托管 AI QA 平台——省心但你的测试数据、历史记录、发布信心全锁在别人服务器上，还按月付费。

[**Approxima**](https://github.com/Approxima-AI/Approxima-OSS) 试图给出第三个选项：**开源 + Agentic（智能代理驱动）**。用英语写测试步骤，AI 代理在真实浏览器中执行，UI 变了它会自己修复。

它来自 Y Combinator 2026 冬季批次的新创公司 Approxima，创始人是两位 2025 届滑铁卢大学毕业生（Ethan Pronev 曾在 Jane Street/Citadel 做交易系统，Ashish Selvaraj 曾在 Databricks/Microsoft 做基础设施）。目前在 GitHub 上以 MIT 协议开源。

---

## 一、它解决了什么问题

传统的自动测试工具无论怎么演变，始终困在两种模式里：

| 方案 | 优势 | 致命问题 |
|------|------|---------|
| **脚本化 E2E 测试** | 精确、稳定、可控 | Selector 随 UI 改动频繁失效，维护成本高 |
| **托管 AI QA 平台** | 无需维护 selector | 测试数据和历史锁在第三方，数据主权丧失 |

Approxima 的解法是两个结合的：**把测试写成意图（intent）而非选择器（selector）**，底层用 Playwright 驱动真实浏览器，上层用 LLM 解析意图、适配变化、自我修复。同时因为完全开源 MIT，你可以永远自托管。

## 二、核心能力

### 用英语写测试（Journeys）

一个 Journey（测试旅程）就是一段有序的英语步骤列表：

```
- Click Sign in
- Enter $TEST_EMAIL in the email field
- Verify the dashboard shows 3 projects
- Click on the first project
- Verify the project detail page loads
```

Agent 在真实浏览器中逐条执行，每步截屏 + 视觉验证。可以分组为 Suite，通过 cron 定时运行或手动触发。

### Goal Mode：不知道步骤？告诉它目标就行

这是最有意思的功能。如果你不确知某条测试路径的具体步骤，可以直接给一个**目标**：

```
"Sign up, create a project, and invite a teammate"
```

Agent 会自己探索你的应用，找到完成目标的所有步骤，然后把它们**回写**到 Journey 里，并立即启动一次验证运行确认可复现。之后这条测试就变成了确定性的 Journey，不需要人手动写步骤。

### Skills：可复用的步骤组

比如「登录」这个操作可以定义为一个 Skill：

```
Login: enter email, enter password, click submit
```

然后在多个 Journey 中直接引用为一行。更新 Skill 会自动更新所有引用它的 Journey。Goal Mode 发现已存在的 Skill 时，会自动将匹配的步骤折叠为单行引用。

### Self-Healing（自愈）

当应用 UI 变化导致某条步骤的文字不再匹配时，Agent 不会直接跑失败——它会**分析页面当前状态，推断正确的操作应该是什么**，给出修复建议。

建议经过 LLM 审查后推送到编辑器，你只需点一下接受或忽略。这意味着测试用例可以在 UI 频繁变动的情况下持续运行，而不是每次改界面都要重写测试。

### 变量与密钥

步骤中可以用 `$NAME` 语法引用变量。标记为 **secret** 的变量会经过 AES-256-GCM 加密存储、在 UI 中显示为 `••••••`、并从运行日志中自动清除。

不过需要注意项目文档中的诚实警告：

> Secrets used in Approxima should be for test workspaces that don't matter to you and which you wouldn't mind exposing.
>
> （在 Approxima 中使用的密钥应该来自你不会在意的测试环境。）

因为加密只在存储层面生效，实际值在 Agent 执行时仍然会发送给 LLM 提供商。

### Shadow Runs：A/B 测试 Agent 自身

在 `shared/agent-versions.ts` 中注册一个 beta Agent 版本，开启 `AUTO_SHADOW_ENABLED`，每次正式运行都会**平行启动一个影子运行**使用新版 Agent。管理面板会用配对统计对比两个版本的差异——直接拿来找最佳 Agent 配置。

## 三、架构概览

```
用户 → Next.js 前端（Dashboard）
        ↓
   Hono API (Cloudflare Workers) → Postgres 队列
        ↓
   Web Runner (Node + Playwright + LLM)
        ↓
   本地 Chromium 逐步骤执行
        ↓
   结果回调 → Dashboard Live Screencast
```

| 组件 | 职责 |
|------|------|
| `frontend/` | Next.js Dashboard：创建 App、Journey、Suite，实时观看运行 |
| `api/` | Hono API on Cloudflare Workers：App 管理、运行队列、调度 |
| `web-runner/` | Node 服务：Playwright + LLM 循环，驱动浏览器逐步骤执行 |
| `shared/` | 共享类型/配置（Agent 版本、运行状态） |

## 四、Agent 如何驱动浏览器

Approxima 有两种 Agent：

- **Journey Agent**：执行固定步骤列表，逐条操作→截图→验证，产出自愈建议
- **Explore Agent**：在 Goal Mode 下探索应用直到完成目标，写回步骤（Skill-aware），然后触发验证

底层使用了一种"元素优先 + 坐标消歧"的点击策略：

1. 优先按 **Role**（`getByRole()` 匹配 accessible name）
2. 次选按 **Text**（`getByText()` 大小写不敏感子串）
3. 最后用 **CSS Selector**

截图默认 1280×720（移动模式 390×844），支持区域裁剪查看细节。

## 五、快速上手

```bash
git clone https://github.com/Approxima-AI/Approxima-OSS.git
```

**依赖：** Node 20+、Postgres、S3 兼容存储、至少一个 LLM API Key（OpenAI / Anthropic）

详细启动步骤见项目 README。部署方式包括 Docker Compose，支持自托管。

## 六、使用场景与注意事项

### 适合的场景
- **CI/CD 回归测试**：每次 PR 自动运行 Agentic QA，检测功能是否被改坏
- **UI 频繁变动的项目**：Agent 的自愈能力让测试不至于每次改界面就全崩
- **测试编写门槛高的团队**：PM/QA 可以用自然语言描述测试，不需要编程
- **重视数据主权的公司**：完全自托管，测试数据不出你的网络

### 需要留意的地方
- **项目非常新**：6 个 Stars、2 个 contributors、刚刚开源。社区和成熟度还在早期
- **LLM 调用成本**：每一步都调用 LLM，大规模测试可能产生可观费用
- **密钥安全性**：项目文档诚实地说明了密钥值会传给 LLM 提供商，不适合生产级凭据
- **纯 Web 测试**：目前只支持 Web 应用 E2E，不支持 API 或移动端

## 七、比较：Approxima 与其他方案

| 维度 | Approxima | Playwright 脚本 | 托管 AI QA 平台 |
|------|-----------|----------------|----------------|
| **测试编写** | 自然语言 | 需编程 | 自然语言 |
| **定位方式** | AI 意图解析 | CSS/XPath Selector | AI 意图解析 |
| **Selector 维护** | 自愈（自动修复） | 手动维护 | 自愈 |
| **数据主权** | 开源，可自托管 | 完全控制 | 锁在第三方 |
| **运行环境** | 你自己的机器/CI | 你自己的机器/CI | 第三方云端 |
| **成本** | GPU/API 调用费 | 零（纯代码） | 月费订阅 |
| **成熟度** | 早期 | 非常成熟 | 成熟 |

## 总结

Approxima 的方向是对的：**测试不应该写成适配器代码，而应该描述为行为意图。** 当 UI 变了，意图不需要变——这是 Agent 的价值所在。

当然它还很新。6 个 Stars 的项目不代表现在就要投入生产，但它的设计思路——开源 + 自然语言测试 + 自愈 + 自托管——代表了一条值得关注的技术路线：AI 不再只是辅助写测试代码，而是直接成为测试执行的驱动力。

**项目地址：** [github.com/Approxima-AI/Approxima-OSS](https://github.com/Approxima-AI/Approxima-OSS)  
**官网：** [approxima.ai](https://approxima.ai)  
**许可协议：** MIT
