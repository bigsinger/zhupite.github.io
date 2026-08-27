---
layout: post
title: "DeepSeek Harness 教程：从启动到写出第一个 Agent 插件"
categories: [dev]
description: "面向需要扩展 Agent 运行时的开发者，基于官方文档完成 DeepSeek Harness 的启动、模型配置、首个 Cordis 插件加载、配置检查与故障排查。"
tags:
  - DeepSeek Harness
  - Agent
  - TypeScript
  - 插件架构
  - Cordis
---

如果你希望给 Agent 增加一个工具、在模型请求前插入策略，或替换模型与执行环境，最不该做的事通常是直接改核心循环。DeepSeek Harness（命令行名 `dsh`）给出的路径是：把这些能力都做成插件，再通过配置把它们装配进运行时。

本文不把它当作抽象架构新闻来解读，而是按「能启动、能看到结果、能加载自己的插件」的顺序走一遍。完成后，你会得到一个本地 Web UI，以及一个启动时输出日志的最小插件；后续再把它替换成工具、策略或自定义服务。

> **版本与验证边界**：本文依据 DeepSeek Harness `master` 分支的官方 README、架构文档和「第一个插件」教程编写，资料访问时间为 2026-08-27。仓库根 `package.json` 当前声明 Node.js `^22.19.0 || >=24.0.0`、`pnpm@11.7.0`；项目仍处于 Developer Preview，官方明确提示会有破坏性兼容变更。文中的命令来自官方文档，未在本文环境中实际启动，请以安装时的 `dsh --help` 与仓库文档为准。

## 先判断：你是否需要它

DeepSeek Harness 不是面向「几分钟拼出一个固定工作流」的轻量 SDK。它更适合把 Agent 当成长期运行时来维护的团队：模型、工具、持久化、权限和界面都可能在后续替换。

| 你的目标 | 是否适合优先尝试 DSH | 原因 |
| --- | --- | --- |
| 为已有 Agent 统一接入审批、审计与工具策略 | 适合 | 工具执行有统一事件管线，可把治理逻辑放在插件层 |
| 需要替换模型、文件系统、沙箱或子 Agent 提供商 | 适合 | 这些能力都有明确的服务接缝（seam） |
| 希望会话可重放、可审计 | 适合 | 模型可见内容来自追加式会话事件日志 |
| 只需一个固定 Prompt 加两三个 API 调用 | 暂不优先 | 插件树、配置层和 TypeScript 工程成本可能超过收益 |
| 生产环境不能容忍快速变更 | 谨慎 | 当前仍是 Developer Preview，接口可能不兼容升级 |

一句话理解：**当「以后要替换什么」已成为真实需求时，插件优先才值得引入。**

## 它的核心模型：运行时是一棵插件树

DSH 使用 Cordis。Cordis 给插件提供共享的 `ctx`（上下文）、服务、事件与可回收的副作用。模型适配器、工具注册表、会话日志、Agent Loop，甚至 Web UI 都是插件；没有一个必须修改才能扩展的「特权内核」。

启动时，DSH 会把多个层按顺序合成：

```text
profile（运行组合）
├── bundle：基础模型、工具、持久化、沙箱、审批与设置
├── bundle：Web UI 或 headless 运行器
├── profile/cordis.patch.yml：当前 profile 的覆盖层
├── $DSH_HOME/cordis.patch.yml：用户级覆盖层
└── --patch：本次命令的临时覆盖层
```

- **Profile**：一套可启动的运行组合。官方提供 `web` 与 `headless` 模板；前者启动浏览器界面，后者执行一个任务并退出。
- **Bundle**：可分发的插件配置层。它提供 Cordis 配置行和需要挂载的代码。

后面的 patch 可以按行 ID 替换前面的配置，或插入新行。因此，添加本地插件不必 fork 框架；先用一个 `--patch` 文件把插件挂进树里即可。

## 第 0 步：准备环境

在终端确认 Node.js 与 pnpm。版本下限来自项目根 `package.json`：

```sh
node --version
pnpm --version
```

如果 Node.js 版本低于 `22.19.0`，先升级再继续。Windows 用户也可以使用 DSH：基础 bundle 会根据平台选择 PowerShell 执行栈，而不是强行使用 Bash。不要因为看到文档里的 `sh` 示例就假设必须在 Linux 上运行。

接下来有两条路径：只想快速体验用 npm；要开发插件则走源码路径。本文后续的「第一个插件」依赖仓库检出，因此推荐第二条。

### 路径 A：快速启动 Web UI

```sh
npx @deepseek-ai/dsh web
```

默认会启动 `http://127.0.0.1:3080` 并在本机浏览器打开页面。只想启动服务、不自动打开浏览器时：

```sh
npx @deepseek-ai/dsh web --no-open
```

### 路径 B：从源码运行（开发插件推荐）

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

`pnpm run build` 先生成运行所需的仓库产物；官方 README 特别说明，后续的 `pnpm dsh web` 会使用这些已构建产物，而不会再次构建。

## 第 1 步：完成首次 Web UI 配置

浏览器打开后，先做两件事，否则输入框不会进入可用状态。

1. 打开 **Settings → Models**。
2. 填入 DeepSeek API Key，或者添加其他官方目录中的提供商、自定义 OpenAI 兼容端点。
3. 点击 **Choose workspace**，添加并选中一个工作目录。

模型配置会在**下一次请求**生效，不需要重启服务。官方文档也说明，密钥保存在 `$DSH_HOME/.credentials.yaml`，设置文件只保留凭据引用，而非明文密钥。

### 验证标准

创建一个新会话，发送下面这句：

```text
总结这个工作区，并列出其中的主要包。
```

能收到回复，说明模型、工作区和会话基本链路均已可用。若输入框仍不可用，优先检查是否真的选中了 workspace，而不是先重装依赖。

## 第 2 步：先看清当前实际加载了什么

在扩展前先导出配置树。这个命令比从 UI 猜测功能边界可靠得多：

```sh
dsh --profile web --dump-config
```

源码运行时可写成：

```sh
pnpm dsh --profile web --dump-config
```

你要关注两类信息：

- 每一行的 **ID**：后续 patch 通过 ID 定位并替换配置；
- 每一行的 **插件名与配置**：它决定当前运行时到底挂载了哪些能力。

> 注意：patch 替换的是目标行的**完整配置**，不是对原配置做字段级合并。覆盖已有行时，要把仍需保留的配置一并写回；初学阶段优先「插入新插件」，不要急于替换官方基础行。

## 第 3 步：写出第一个最小插件

下面示例只做一件事：框架加载插件时在终端打印日志。它没有业务价值，但能用最小成本验证三个关键事实：TypeScript 模块被找到、Cordis 成功加载、patch 生效。

在仓库根目录创建目录：

```sh
mkdir -p scratch-plugin/src
```

新建 `scratch-plugin/src/my-plugin.ts`：

```ts
import type { Context } from '@deepseek-ai/cordis'

export const name = 'hello-plugin'

export function apply(ctx: Context) {
  console.log('[hello-plugin] plugin loaded!')
}
```

插件最小结构只有三部分：

| 字段 | 作用 |
| --- | --- |
| `name` | 插件的稳定标识，便于定位日志和配置 |
| `apply(ctx)` | 插件入口；框架加载时调用 |
| `ctx` | 用来注册服务、工具、事件监听与资源清理的共享上下文 |

示例中的 `ctx` 暂未使用，但不要删掉它：后续注册能力都从这里开始。

## 第 4 步：用 patch 把本地插件挂到 Web Profile

在仓库根目录先执行 `pwd`，复制它输出的绝对路径。然后创建 `scratch-plugin/cordis.yml`，将路径替换成你自己的仓库绝对路径：

```yaml
- insert:
  - id: hello
    name: '/absolute/path/to/deepseek-harness/scratch-plugin/src/my-plugin.ts'
```

为什么必须使用绝对路径？因为 patch 文件只负责贡献配置；加载器解析模块时仍以 profile 目录为基准。使用相对路径很容易让模块解析到意料之外的位置。

带着临时 patch 启动：

```sh
pnpm dsh web --patch ./scratch-plugin/cordis.yml
```

### 验证标准

终端出现下面这行即表示最小插件已被加载：

```text
[hello-plugin] plugin loaded!
```

Web UI 仍可在 `http://127.0.0.1:3080` 打开。到这里，你已经完成了最重要的闭环：**代码文件 → 配置层 → 运行时加载 → 可观察结果**。

## 第 5 步：让插件依赖框架服务

实际插件通常需要访问 `tools`、`llm` 等服务。不要在 `apply()` 中假设它们已经存在；应显式导出 `inject`，让框架先准备依赖，再加载你的插件。

```ts
import type { Context } from '@deepseek-ai/cordis'

export const name = 'my-tool-plugin'
export const inject = ['tools']

export function apply(ctx: Context) {
  // 此处 ctx.tools 已准备就绪。
  // ctx.tools.register(...)
}
```

这一步的工程价值在于：依赖顺序由框架管理，而不是靠「某个插件刚好先加载」的隐式约定。小插件使用函数形式通常足够；若插件要向其他插件提供一个长期存在的服务，再考虑使用继承 `Service` 的类形式。

## 第 6 步：理解应该把代码挂在哪里

不要一看到需求就修改 Agent Loop。官方架构文档已为常见目标划分了扩展点：

| 你要做的事 | 优先入口 | 典型用途 |
| --- | --- | --- |
| 加一个模型供应商 | `ctx.llm` | 自建模型网关、兼容 API 路由 |
| 加一个模型可调用工具 | `ctx.tools` | 文件、检索、业务 API、内部系统能力 |
| 在工具前后增加策略 | `tools/pre-execute`、`tools/post-execute` | 审批、参数校验、审计、结果脱敏 |
| 在模型请求前处理输入 | `agent/pre-step` | 输入拦截、上下文改写、策略拒绝 |
| 加持久化状态 | 扩展 `SessionEventMap` | 回放、恢复、审计与跨重启状态 |
| 加后台任务 | `ctx.jobs` | 长任务、结果查询、取消任务 |
| 给一个 Agent 限定能力 | Agent preset + scoped registration | 不同会话的工具隔离 |

### 一个回合为何值得理解

DSH 中，一个 **step** 是「一次模型请求加上它调用的工具」；一个 **turn** 可以包含零个或多个 step。其核心流如下：

```text
turn/start
  → agent/pre-step
  → step/start
  → agent/request → llm/stream
  → tool/call
  → tools/pre-execute → tools/execute → tools/post-execute
  → tool/result → step/end
turn/end
```

这意味着工具执行不是一个无法观察的黑盒。比如权限插件可以在 `tools/pre-execute` 审批或拒绝调用；审计插件可记录调用；输出策略可在 `tools/post-execute` 替换展示内容或屏蔽敏感结果。把这些横切逻辑放在管线里，比在每个工具函数中复制一遍判断更容易维护。

## 第 7 步：会话数据为什么不能随便直接拼 Prompt

DSH 的约束是：**模型可见的内容必须能从会话日志重建。** `SessionEvent` 是追加式事实流，`deriveMessages()` 从日志投影出模型历史；原始 `assistant/chunk` 等事件同时支持 UI 回放与持久化。

所以，如果你要增加一段会影响模型决策的上下文，不要只在某一次请求里临时拼接字符串。应选择合适的会话事件并从日志渲染，或者通过 `agent.inject()` 让内容进入下一次被允许的请求。

代价是需要多做事件建模；收益是重放、调试、转录、遥测与持久化仍指向同一份事实来源。这正是它适合平台型 Agent 的原因之一。

## 常见失败与排查顺序

| 现象 | 先检查什么 | 处理方式 |
| --- | --- | --- |
| Web UI 打开但不能发送消息 | 是否设置模型、是否选择 workspace | 依次检查 **Settings → Models** 与 **Choose workspace** |
| `pnpm dsh web` 报构建或模块错误 | 是否先执行过 `pnpm run build` | 源码路径按 `install → build → dsh` 顺序重新执行 |
| 看不到插件启动日志 | patch 是否通过 `--patch` 传入、模块路径是否绝对路径 | 运行 `pnpm dsh --profile web --dump-config`，确认 `hello` 行是否存在 |
| 覆盖配置后出现意外缺失 | 是否只写了部分字段 | patch 替换整行配置，补齐原行仍需要的字段，或改为插入新行 |
| Windows 上 Shell 能力异常 | 是否把 POSIX 的 Bash 预设直接照搬 | 使用默认 Windows PowerShell 栈；需要改执行器时完整覆盖相关行，避免同名服务重复注册 |
| 以为设置 timeout 就能停止任何工具 | 工具是否响应取消信号 | 工具实现必须正确传递并响应 `AbortSignal`；同进程代码不能被框架强制杀死 |

## 下一步：把最小插件演进成真正能力

最小日志插件验证通过后，建议按下面的顺序增加复杂度：

1. **添加一个无副作用工具**：例如读取固定配置或返回版本信息，先熟悉 schema、输出与 UI 呈现。
2. **为工具加 `inject` 与执行策略**：再接入需要审批或审计的能力。
3. **加入会话事件**：只有确实需要跨请求、跨重启恢复的状态，才让它成为 durable event。
4. **最后才替换底层 provider**：文件系统、沙箱、子 Agent 等 provider 替换影响面更大，应先导出配置并写隔离测试。

DeepSeek Harness 的关键不在于「插件很多」，而在于把每一类变化放到正确接缝：工具归工具、策略归事件、历史归会话日志、部署差异归 profile 与 patch。这样做会比直接修改核心慢一点起步，但当系统开始有多模型、多工具、多权限策略时，维护成本会显著更可控。

## 参考资料

- [DeepSeek Harness README：安装与启动](https://github.com/deepseek-ai/deepseek-harness#run)
- [官方架构文档：插件树、事件与扩展点](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md)
- [官方教程：第一个插件（中文）](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/index.zh.md)
- [官方文档：配置模型](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/providers.md)
- [官方 CLI 文档：Profile、Bundle 与配置优先级](https://github.com/deepseek-ai/deepseek-harness/blob/master/apps/cli/README.md)
- [官方工具编写参考](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cookbook/adding-a-tool.md)
- [项目许可证：MIT](https://github.com/deepseek-ai/deepseek-harness/blob/master/LICENSE)
