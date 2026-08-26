---
layout: post
title: "DeepSeek Harness：把 Agent 框架拆成可替换插件树"
categories: [dev]
description: "基于 DeepSeek Harness 的 README、架构文档和源码，解释其 Cordis 插件树、事件驱动 Agent 回合与工具执行管线，并给出采用前的边界判断。"
tags:
  - DeepSeek Harness
  - Agent
  - TypeScript
  - 插件架构
  - Cordis
---

DeepSeek AI 开源的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（命令行名 `dsh`）不是把模型、工具和会话固定在一个不可替换的核心里，而是选择了一条更激进的路径：**一切皆插件**。模型适配器、工具注册表、会话日志、Agent 循环乃至 Web 界面，均作为 [Cordis](https://github.com/cordiverse/cordis) 上下文中的插件装配。

这让它特别适合需要长期改造 Agent 运行时的开发团队：如果目标只是快速得到一个可用聊天界面，插件优先的分层与配置成本未必划算；如果目标是替换模型路由、权限策略、工具执行或持久化机制，而不愿 fork 核心循环，DeepSeek Harness 提供了明确的扩展边界。

> **资料与版本边界**：本文基于仓库 `master` 分支在 2026-08-21 的提交 `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`、官方 README、架构文档及核心 TypeScript 源码撰写；没有在本文环境实际启动该项目。仓库当前标注为开发者预览，官方明确提示后续会有破坏性兼容变更。

## 它解决的不是「再做一个 Agent」，而是运行时可组合性

常见 Agent 应用会把模型调用、工具注册、对话状态、权限判断和 UI 耦合在同一应用骨架中。早期迭代很快，但当团队需要替换其中一个能力时，改动往往跨越多层。

DeepSeek Harness 的思路是把运行时表示为一棵按层叠加的插件树：

```text
profile
  ├─ bundle：基础模型、工具、持久化、沙箱、审批策略
  ├─ bundle：Web 应用或 headless 运行器
  ├─ profile 级 cordis.patch.yml
  ├─ home 级 cordis.patch.yml
  └─ --patch 临时覆盖层
```

官方架构文档将 `profile` 定义为某一运行组合，`bundle` 定义为可插入 Cordis 配置行和挂载代码的分发单位。配置层按顺序应用，后层可以替换前层的整行配置，因而模型、工具和策略不是「修改内核」才能调整的硬编码点。

`web` 与 `headless` 是项目提供的模板：前者附加浏览器应用，后者提供不启动服务的一次性运行方式。运行中的配置树可以通过下面的官方命令查看：

```sh
dsh --profile web --dump-config
```

这也是理解项目时最有价值的命令之一：不要先从 UI 倒推能力，而是先看本机实际启动了哪些插件和配置层。

## 一个 Agent 回合如何流动

DeepSeek Harness 的架构文档把 **step** 定义为“一次模型请求加上其工具调用”，把 **turn** 定义为“零个或多个 step”。这一划分避免了把一条用户输入机械等同于一次模型请求。

核心生命周期可概括为：

```text
turn/start
  → 领取消息与下一步输入
  → 组装系统提示词与工具 schema
  → agent/pre-step
  → step/start
  → agent/request
  → llm/stream
  → assistant/message
  → tool/call
  → tools/pre-execute → tools/execute → tools/post-execute
  → tool/result
  → step/end
  → turn/end
```

这里有两个工程含义。

第一，`agent/pre-step` 可以在模型请求前重写或拒绝本轮输入，因此上下文注入、策略拦截和输入净化有明确挂点。第二，工具执行不是一个黑盒函数调用，而是经过预执行、执行、后执行和结果通知四段管线。阅读 `packages/core/tools/src/index.ts` 可以看到，`tools/pre-execute`、`tools/execute`、`tools/post-execute` 被定义为 waterfall 事件；工具调用可以在执行前被允许、拒绝或要求审批，也可以由中间层包裹超时、重试和度量逻辑。

这对 Agent 安全尤其重要：权限判断、审计、超时与结果脱敏不必侵入某一个工具实现，可以被放到执行管线中的策略插件里。

## Session log 是模型上下文的事实来源

项目没有把“给模型看的消息”仅当成临时内存，而是把会话日志视为上下文来源。架构文档称 `SessionEvent` 日志是可重放事实：模型可见的内容应能从日志重建；`assistant/chunk` 等原始事件保留 UI 回放与持久化所需信息。

这个约束的收益是可审计性和可回放性。新增一段模型可见上下文时，项目要求扩展会话事件类型，并从日志投影出消息，而不是绕过日志直接拼接。代价也很直接：开发新能力时，要同时考虑事件建模、持久化与回放，而不是只让一次请求“跑起来”。

## 插件究竟替换什么

官方架构文档列出的核心包，揭示了可替换边界：

| 包 / 服务 | 负责内容 | 开发中的典型用途 |
|---|---|---|
| `core/session` | 追加式 SessionEvent 日志与内存存储 | 回放、审计、持久化 |
| `core/system-prompt` | 提示词分段与工具 schema 组装 | 注入上下文、调整模型可见能力 |
| `core/tools` | 有作用域的工具注册表与受控执行管线 | 审批、策略、超时、审计 |
| `core/agent` | Agent 接口、注册表与 `agent/*` 事件 | 观察或干预运行中的任务 |
| `core/agent-loop` | 默认回合驱动器 | 调整并行工具调用、Agent 生命周期 |
| `llm/llm` | 消息流与模型适配接缝 | 接入模型提供商或兼容 API |

在源码中，工具定义不仅包含参数 schema 与 `execute()`，还包含输出 schema、内容渲染和可选的超时预算。`core/tools` 还明确指出：同进程代码不能被强制杀死，超时依赖工具实现正确转发并响应 `AbortSignal`。因此，写插件时不能把“声明了 timeout”误解为所有第三方 SDK 都会自动停止。

## 最小启动路径与环境要求

官方 README 给出的 npm 启动命令是：

```sh
npx @deepseek-ai/dsh web
```

它默认在 `http://127.0.0.1:3080` 启动 Web UI；需要只启动服务而不打开浏览器时，可加 `--no-open`。

从源码构建则使用：

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

仓库根 `package.json` 声明的 Node.js 版本要求是 `^22.19.0 || >=24.0.0`，包管理器为 `pnpm@11.7.0`。首次启动 Web UI 后，官方指南要求在 **Settings → Models** 配置 DeepSeek API Key 或其他兼容模型端点，然后选择工作区；未选择工作区时，消息输入区不会可用。

这些命令来自官方 README，本文未在本机执行启动验证。对于处于开发者预览期的项目，建议把版本锁定与配置导出纳入团队的可复现环境，而不要把 `master` 当成稳定接口。

## 适合谁，暂不适合谁

**适合优先评估的场景**：

- 需要将模型、工具、权限、文件系统或子 Agent 供应商替换为自有实现；
- 希望把审批、审计、超时等治理逻辑放在统一执行管线，而非散落在单个工具中；
- 需要保留会话事件以支持重放、调试或合规审计；
- 团队能够维护 TypeScript、pnpm workspace 与 Cordis 配置补丁。

**暂不宜直接作为生产底座的场景**：

- 不能接受接口快速演进和破坏性升级；
- 只需一个固定工作流的轻量 Agent；
- 团队没有能力维护插件兼容性、配置层次和运行时策略测试。

它的核心取舍很清楚：用更多的组合规则、事件模型和配置纪律，换取更少的核心 fork 与更明确的替换边界。对 Agent 平台团队而言，这是一条值得研究的架构路线；对单一业务 Agent 而言，先判断可替换性是否真是当前瓶颈，比先引入完整框架更重要。

## 参考资料

- [DeepSeek Harness GitHub 仓库与 README](https://github.com/deepseek-ai/deepseek-harness)
- [官方架构文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md)
- [Web UI 使用指南](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/index.md)
- [核心工具执行管线源码](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/tools/src/index.ts)
- [核心 Agent Loop 源码](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/agent-loop/src/index.ts)
- [许可证：MIT](https://github.com/deepseek-ai/deepseek-harness/blob/master/LICENSE)
