---
layout: post
title: "Codex Desktop App 从入门到高手：2026 完整指南"
categories: [tool]
description: "以 Codex Desktop App（macOS/Windows）为主线，从安装登录、多线程项目管理、工作台树、计算机操作、内建浏览器、自动化和技能系统，到企业级安全配置——覆盖 2026 年仍有效的全部桌面端功能。"
tags:
  - Codex
  - 桌面应用
  - AI 编码
  - 教程
  - 技能
---

Codex 在 2026 年已经不是单纯的命令行工具——**Codex App 才是主力工作台**。它是一个 macOS/Windows 原生桌面应用，提供多线程并行、内置 Git 工作台树、自动化、内建浏览器、计算机操作（Computer Use）和安全审计等能力。

本文以 Codex Desktop App 为主线，从入门到高级，覆盖截至 2026 年 6 月仍然有效的全部主要功能。

> 注意：本文介绍的 Codex App 功能需要 ChatGPT Plus、Pro、Business、Edu 或 Enterprise 计划。部分高级功能（如 Computer Use）仅限 Pro 及以上计划。

---

## 一、安装与首次启动

### 下载安装

Codex App 提供 macOS 和 Windows 版：

- **macOS**：[直接下载](https://chatgpt.com/codex?app-landing-page=true)（Apple Silicon / Intel 分开下载）
- **Windows**：[直接下载](https://chatgpt.com/codex?app-landing-page=true)

下载后打开应用，使用 ChatGPT 账号登录（或 OpenAI API Key，但部分功能受限）。首次启动会让你选择或创建一个项目目录——Codex 会在该目录下读写文件。

### 界面概览

Codex App 的界面分几个核心区域：

- **左侧栏** — 项目列表、会话线程列表
- **中央区域** — 当前线程的对话面板，输入框在底部
- **右侧边栏** — Artifacts（文件预览、计划、任务摘要、来源）
- **顶部工具栏** — 运行按钮、线程切换、设置入口

### 第一个项目

选择项目目录后，在输入框中确认「本地模式」已激活，然后发第一条消息：

> 告诉我这个项目的结构和作用

Codex 会读取项目文件、理解结构和上下文，然后给出回答。不用配置 prompt 模板、不用写 system message——它就是直接工作。

---

## 二、多线程并行

### 同时处理多个任务

Codex App 支持在一个项目内打开**多个线程**，每个线程是独立的上下文。左侧栏显示所有线程，点击切换，互不干扰。

**使用场景**：

- **线程 A** — 修复用户报告的 bug
- **线程 B** — 为另一个功能编写测试
- **线程 C** — 审查同事的 PR

每个线程有独立的文件修改历史、独立的终端会话、独立的执行日志。必要时也可以在一个线程里引用另一个线程的上下文。

### 线程管理

每个线程可以命名、排序、关闭。Codex App 会持久化线程状态——关掉应用再打开，线程还在。

---

## 三、Review 与变更管理

### 审查与推送

Codex App 内建了**代码审查面板**。在 Codex 完成修改后，你可以：

1. 查看 **diff 视图** — 逐文件、逐行审查变更
2. **处理 PR 反馈** — 把 GitHub PR 评论喂给 Codex，让它按反馈修改
3. **暂存文件** — 选择性的 Stage/Unstage
4. **提交** — 写 commit message 并本地提交
5. **推送** — 直接推送到远程仓库

所有这些操作都在 App 内完成，不用切换终端。

### 审查工作流示例

```
1. Codex 完成修改 → 2. 打开 Review 面板 → 3. 审查 diff → 4. 有问题的部分直接输入反馈
→ 5. Codex 再次修改 → 6. 确认 → 7. Stage → 8. Commit → 9. Push
```

一步到 Git 操作，中间不离开 App。

---

## 四、Worktrees（工作台树）

### 独立分支隔离

Worktrees 是 Git 的一个功能——让你在同一个仓库的不同分支上同时工作。Codex App 内建了 worktree 支持，每个线程可以关联到不同的 worktree，修改完全隔离。

**典型场景**：你在 `main` 分支的热修复线程中修改文件，同时另一个线程在新功能的 worktree 中开发，两者互不干扰。

### 创建 Worktree

在 App 的线程设置中，可以选择「创建 Worktree」或「附加已有 Worktree」。Codex 会自动处理 Git 的操作。

---

## 五、自动化

### 定时任务

Codex App 支持**自动化任务**（Automations），让你安排 Codex 在指定时间或条件下自动执行任务：

- **每日依赖检查** — 每天检查项目的依赖更新
- **定时健康检查** — 定期扫描代码库质量
- **CI 后自动审查** — 构建通过后自动审查变更
- **月度重构** — 定期执行代码重构

### 触发方式

- **时间触发** — 按指定的 cron 计划执行
- **事件触发** — 关联到 Git 事件或外部 webhook
- **手动触发** — 在 Automation 面板中一键启动

### 唤醒线程

Automations 的核心概念是「唤醒线程」——一个已保存的线程可以被自动化系统唤醒执行任务，完成后报告结果，然后回到休眠状态。这不同于 CI 脚本，因为 Codex 会像真人那样理解上下文做出的判断，而不是执行固定的 shell 命令。

---

## 六、内建浏览器

Codex App 自带一个**内建浏览器**，可以直接渲染和交互网页。这解决了传统 AI 编码工具「看不到网页」的痛点。

### 浏览器能做什么

- **渲染预览** — Codex 写完前端代码后，直接在内建浏览器中渲染页面，看效果
- **浏览器操作** — Codex 可以操作浏览器（点击、填写表单、导航），完成端到端交互
- **调试页面** — 查看渲染后的 DOM、网络请求和 Console 输出
- **截图反馈** — 截取页面截图作为新需求的参考

这个功能在开发前端应用时特别有用——Codex 写代码 → 浏览器渲染 → 看到效果 → 继续修改，形成闭环，无需手动切换。

---

## 七、Computer Use（计算机操作）

> Pro 及以上计划可用

Computer Use 让 Codex 能操作你的**本地应用**——不只是写代码，而是像一个真实的开发者那样使用各种软件。

### 能力范围

- **打开 macOS 应用** — 启动 Xcode、模拟器、设计工具
- **GUI 操作** — 点击菜单、填写对话框、拖拽文件
- **浏览器流** — 打开 Safari/Chrome 执行已认证的网页操作
- **本地 App 测试** — 操作原生应用界面
- **模拟器操作** — 控制 iOS 模拟器或 Android 模拟器

### 使用方式

在 Codex App 的线程中，描述你希望 Codex 执行的操作：

```
打开 iOS 模拟器，运行项目，登录页面的截图发给我
```

Codex 会启动模拟器、运行应用、截图并返回结果。你不需要手动操作。

---

## 八、Appshots

Appshots 是 Codex App 的一个实用小功能：**把当前最前端的应用窗口截图发给 Codex**，附带可提取的文本。

**使用场景**：

- 遇到应用报错，一键把报错窗口发给 Codex 分析
- 设计稿在另一个软件中，截图后让 Codex 参考实现
- 第三方工具的界面需要集成，截图描述即可

操作方式：菜单栏点击「Appshot」或使用快捷键，Codex 会自动截取最前端的窗口。

---

## 九、Chrome 扩展

### 让 Codex 使用已登录的 Chrome

Codex App 通过一个 **Chrome 扩展**，可以让 Codex 使用你的 Chrome 浏览器来执行操作——而且是在**已登录的状态**下。

**意义**：大多数内部工具、SaaS 平台、管理系统都依赖浏览器登录态。有了 Chrome 扩展，Codex 可以操作这些已登录的系统，而不用重新认证。

**管理方式**：App 设置中可以管理哪些网站授权 Codex 操作，敏感站点可以单独设置审批。

---

## 十、技能系统

### 什么是一个 Skill

Skill 是一组**可复用的指令和约束**，告诉 Codex 如何应对特定类型的任务。在 Codex App 中，你可以通过插件市场或命令行安装 Skill。

### 安装 Skill

在 App 的「技能」面板中，可以浏览和安装 Skill。Codex 的 Skill 生态涵盖了从代码审查到部署巡检的广泛场景。

### Skill 的跨平台同步

Skill 在 Codex App、CLI 和 IDE 扩展中**共享**。你在 App 中安装的 Skill，在其他界面中也可用。

### 什么时候需要自己写 Skill

当团队有特定的开发规范、测试标准或部署流程时，编写自己的 Skill 是让 Codex 遵循这些规范的最佳方式。

---

## 十一、插件与 MCP 集成

### 插件市场

Codex App 支持从**插件市场**安装扩展插件。插件可以包含：

- **一个或多个 Skill** — 行为指令
- **MCP 服务器配置** — 外部工具连接
- **Lifecycle Hooks** — 插件生命周期管理

### MCP（Model Context Protocol）

MCP 是将 Codex 连接外部系统的标准协议。通过配置 `.mcp.json`，可以让 Codex 直接查询数据库、调用内部 API、访问文件系统。

```json
{
  "mcpServers": {
    "database": {
      "command": "python3",
      "args": ["mcp-server.py"]
    }
  }
}
```

在 App 中，MCP 服务器的状态会显示在界面中，可以随时开启或关闭。

---

## 十二、图片生成

Codex App 内置了**图片生成/编辑能力**。你可以在开发代码的同时，在一个线程里生成或编辑图片：

- 为项目生成占位图
- 调整 UI 配色方案的可视化参考
- 为博客生成配图
- 生成图标资源

生成的图片可以自动保存到项目目录中，不会淹没在对话记录里。

---

## 十三、Sites（网站部署）

### 一键部署

通过 **Sites 插件**，Codex App 可以**构建和部署托管的网站、Web 应用和游戏**。

**工作流**：

1. 描述你想要什么网站
2. Codex 生成代码
3. 在内建浏览器中预览
4. 修改满意后
5. 在 App 内直接部署
6. 获得一个可访问的 URL

不需要配置服务器、域名或 CI/CD 管线。App 内完成一切。

---

## 十四、IDE 扩展同步

### 跨界面同步

如果你同时在 VS Code / Cursor / Windsurf 中使用 Codex IDE 扩展，App 和 IDE 之间可以共享：

- **Auto Context** — 项目上下文自动同步
- **活跃线程** — 在 App 中开始的线程可以在 IDE 中继续

这意味着你在 App 中开始一个重构任务，切换到 IDE 后可以继续同一个上下文，不需重复描述。

---

## 十五、远程连接

### 从手机控制桌面 Codex

Codex App 支持通过 **ChatGPT 移动端 App** 远程连接：

- 从手机发起任务
- 审批 Codex 的操作请求
- 查看执行结果
- 继续未完成的对话

当你的桌面 Codex 在跑长时间任务时，可以在手机上查看进度、批准操作或提出新的修改意见。

---

## 十六、企业安全配置

Codex App 的企业安全是多层的：

1. **登录认证** — ChatGPT 账号或 API Key
2. **Agent 审批控制** — 敏感操作需要你确认（可在 App 设置中配置审批级别）
3. **托管配置** — 企业管理员可以统一下发安全策略
4. **Codex Security** — 内建安全扫描，支持快速扫描、深度扫描和 PR 扫描
5. **Workload Identity Federation** — 工作负载身份联合，对接企业 IAM

### 配置审批规则

在 App 设置中，可以指定哪些操作需要审批：

- 文件删除
- 环境变量读取
- 高危命令执行
- 网络请求

---

## 十七、实战工作流示例

### 示例 1：修复问题 + 审查 + 推送（30 分钟）

```
1. 打开 Codex App → 选择项目 → 新建线程
2. 描述 bug 现象
3. Codex 定位根因 → 修复代码
4. 打开 Review 面板 → 审查 diff
5. 对不满意的地方输入反馈 → Codex 再次修改
6. Stage → Commit → Push
```

全程在 App 内，不切终端、不切浏览器、不切 IDE。

### 示例 2：前端开发 + 即时预览（1 小时）

```
1. 新建线程 → 描述要开发的页面
2. Codex 生成 HTML/CSS/JS
3. 点击「预览」→ 内建浏览器渲染页面
4. 看到布局问题 → 输入修改需求
5. Codex 调整 → 预览自动刷新
6. 满意后，使用 Sites 插件部署
7. 获得公开 URL 分享给同事
```

### 示例 3：定时代码库健康检查（Automation）

```
1. 在 Automations 面板中创建自动化任务
2. 设置 cron：每天 09:00
3. 编写指令：检查所有未合并的 PR、扫描安全漏洞、报告依赖状态
4. App 每天按时执行，结果推送到你的 ChatGPT 移动端
5. 在手机上查看报告，决定是否需要处理
```

---

## 局限与注意事项

- **操作系统** — macOS 和 Windows（Linux 版尚未正式发布）
- **Computer Use** 仅限于 macOS，需要 Pro 及以上订阅
- **Chrome 扩展** 需要单独安装
- **内建浏览器** — 主要用于开发预览，不宜替代主力浏览器
- **API Key 登录** — 部分功能（如远程连接、部分插件）可能受限

---

**官方入口**：[https://openai.com/zh-Hans-CN/codex/](https://openai.com/zh-Hans-CN/codex/)
**开发者文档**：[https://developers.openai.com/codex](https://developers.openai.com/codex)
**App 文档页**：[https://developers.openai.com/codex/app](https://developers.openai.com/codex/app)
**GitHub 仓库**：[https://github.com/openai/codex](https://github.com/openai/codex)

> 本文基于 OpenAI Codex 官方文档（2026 年 6 月）编写，以 Desktop App 为主要使用界面。部分高级功能（Computer Use）需要 Pro 及以上计划。
