---
layout: post
title: "ClawdSecbot：给端侧 AI Bot 加一层安全代理与沙箱"
categories: [sec]
description: "从项目定位、拦截链路、沙箱机制和适用边界看，ClawdSecbot 适合用来保护本地运行的 AI Bot 类智能体。"
tags:
  - AI Agent安全
  - OpenClaw
  - 安全工具
  - 沙箱
  - 提示词注入
---

## 信息速览

| 时间 | 来源 | 原文 URL | 内容摘要 | 影响评估 |
|---|---|---|---|---|
| 2026-03-13 | GitHub 仓库创建时间 | [secnova-ai/ClawdSecbot](https://github.com/secnova-ai/ClawdSecbot) | ClawdSecbot 是面向 Bot 类端侧智能体的桌面与 WebUI 安全防护软件，项目描述包含实时威胁检测、提示词注入防护和安全审计。 | 说明 AI Bot 的安全防护开始从「写安全提示词」走向本地代理、沙箱和审计一体化。 |
| 2026-06-10 | GitHub Release | [v1.0.5](https://github.com/secnova-ai/ClawdSecbot/releases/tag/v1.0.5) | 社区版 v1.0.5 发布，提供 macOS、Windows、Linux Desktop 与 Linux WebUI 等多平台安装包。 | 已有可下载发行包，适合安全研究者和 OpenClaw 用户做本地评估。 |
| 2026-07-23 | GitHub pushed_at 元数据 | [仓库首页](https://github.com/secnova-ai/ClawdSecbot) | 仓库最近仍有推送，GitHub API 抓取时显示主语言为 Go，许可证为 GPL-3.0。 | 项目仍处于迭代状态，但社区规模还不大，应按早期安全工具看待。 |

## 一句话结论

ClawdSecbot 的核心价值不是「又一个 AI 聊天界面」，而是在本地 AI Bot 与 LLM 服务之间插入一层可审计、可拦截、可沙箱化的安全控制面：它试图把用户输入、工具调用、工具结果和最终输出都纳入检测链路，并用本地代理、系统级沙箱和审计日志来降低 Agent 被提示词注入、工具滥用和越权操作影响的风险。

这篇文章基于官方 README、Release、LICENSE 与部分源码阅读整理；我没有在本机安装运行，因此所有使用命令均按官方文档描述，不写成实测结论。

## 它解决的安全问题

AI Bot 类智能体的风险不只来自模型回答错误，更来自「模型能调用工具」之后的执行面扩大：

1. 用户输入可能直接诱导 Agent 执行危险动作。
2. 网页、文件、工具返回结果可能夹带间接提示词注入。
3. ToolCall 可能触发高风险命令、文件操作或敏感数据外传。
4. Agent 进程一旦拥有本机权限，单靠模型层拒答很难限制真实系统影响。
5. 事后缺少审计日志时，用户很难追踪「是谁在什么时候要求做了什么」。

ClawdSecbot 的定位正是给本地 AI Bot 加一个安全中间层。官方 README 中描述它会监控 Openclaw 这类本地 AI Bot，位于 AI Agent 与 LLM 服务之间，拦截 API 请求，实时分析风险，执行沙箱策略，并记录审计链路。

## 核心防护链路

从 README 和源码结构看，ClawdSecbot 至少包含三层控制：

| 层级 | 项目中的对应模块 | 主要作用 | 安全意义 |
|---|---|---|---|
| 资产发现 | `go_lib/core/scanner/`、插件接口 `ScanAssets()` | 扫描 Bot 进程、工作区、配置文件和端口 | 先知道本机有哪些需要保护的 AI Bot 资产。 |
| 防护代理 | `go_lib/core/proxy/`、`chatmodel-routing` | 拦截 Bot 到 LLM 的 API 流量，并做协议转换 | 把用户输入、工具调用、工具结果、最终输出纳入统一检测。 |
| 沙箱防护 | `go_lib/core/sandbox/` | 通过 macOS Seatbelt、Linux LD_PRELOAD Hook、Windows MinHook 做系统级限制 | 即使模型层判断失误，也尝试从系统调用/进程层收缩影响面。 |
| 审计与持久化 | `go_lib/core/repository/`、SQLite | 记录请求、工具调用、风险检测、Token 用量 | 给安全复盘和行为追踪留下证据。 |
| 插件架构 | `go_lib/plugins/openclaw/`、`BotPlugin` 接口 | 适配不同 Bot 类型 | 让防护能力不只绑定单一 Bot。 |

官方 README 把检测阶段分为用户输入、ToolCall、ToolCallResult、最终输出四类。源码里的 `risk_taxonomy.go` 也能看到更细的风险类型映射，例如直接/间接提示词注入、敏感数据外传、高风险操作、权限滥用、非预期代码执行、上下文投毒、供应链风险等。

## 架构观察：Flutter UI + Go 安全引擎

ClawdSecbot 采用前后端分离结构：Flutter 负责桌面和 WebUI，Go 动态库负责核心安全逻辑，并通过 FFI 与前端通信。README 中列出的关键技术栈包括：

| 层级 | 技术 |
|---|---|
| UI | Flutter Desktop + WebUI |
| 业务逻辑 | Go、CGO、c-shared 动态库 |
| 数据库 | SQLite |
| 通信 | FFI + JSON 协议，WebUI 通过同源 HTTP 接口 |
| 状态管理 | Provider |
| 沙箱 | macOS Seatbelt、Linux LD_PRELOAD Hook、Windows MinHook |
| LLM SDK | CloudWeGo Eino 等模型适配组件 |

这个架构有一个明显取舍：它不是只做浏览器扩展或云端安全网关，而是直接贴近本机 Bot 运行环境。好处是可以看到本地进程、配置和系统层行为；代价是安装权限、平台差异和稳定性要求更高。

Windows 端尤其要注意权限边界。README 明确写到 `bot_sec_manager.exe` 使用 `requireAdministrator`，启动会触发 UAC；如果用户拒绝提权或无法提权，应用会立即退出。这是合理的 fail-close 设计，但也意味着它不是无感轻量工具。

## 支持平台与发行状态

截至 2026-07-31 抓取 GitHub API 元数据时，仓库信息如下：

| 指标 | 数值 |
|---|---|
| 仓库 | `secnova-ai/ClawdSecbot` |
| 默认分支 | `main` |
| 主语言 | Go |
| License | GPL-3.0 |
| Stars | 92 |
| Forks | 15 |
| 最新 Release | v1.0.5 |
| v1.0.5 发布时间 | 2026-06-10 |
| 最近 pushed_at | 2026-07-23 |

v1.0.5 Release 提供了多种社区版产物：

| 平台 | 发行包形态 |
|---|---|
| macOS | universal `.dmg` |
| Windows | x86_64 `.exe`、`.zip` |
| Linux Desktop | arm64 / x86_64 `.deb`，x86_64 `.rpm` |
| Linux WebUI | arm64 / x86_64 `.deb`、`.tar.gz`，x86_64 `.rpm` |

README 中的平台表也显示 macOS Desktop、Linux Desktop、Linux WebUI 和 Windows Desktop 处于支持状态。

## 官方文档给出的使用路径

如果只是评估项目，不建议一上来就接入生产环境。更稳妥的顺序是：先用 Release 包或开发模式在隔离环境里确认资产识别、代理转发、审计日志和沙箱行为，再决定是否常驻运行。

官方 README 给出的开发构建路径包括：

```bash
# 构建 Go 安全引擎
./scripts/build_go.sh

# 开发模式启动 Flutter 应用，并开启 pprof
./scripts/run_with_pprof.sh

# WebUI 开发模式
./scripts/run_web_with_pprof.sh
```

WebUI 模式可用环境变量调整监听地址：

```bash
BOTSEC_WEB_API_PORT=18080 BOTSEC_WEB_API_HOST=0.0.0.0 ./scripts/run_web_with_pprof.sh
```

启动后，官方文档中给出的默认本机 Web UI 地址是：

```text
http://127.0.0.1:18080
```

Windows 发行版则从 Release 下载 `ClawdSecbot-*.exe`，安装器默认安装到用户本地应用目录，并会创建快捷方式。由于 Windows 端需要管理员权限，安全评估时应特别关注它修改哪些配置、写入哪些路径、如何恢复初始配置。

## 卸载前最容易忽略的一点

README 的卸载说明有一个重要提醒：卸载前应先在托盘菜单点击「恢复初始配置」并重启 Openclaw。

原因是 ClawdSecbot 运行时会修改 `openclaw.json` 配置文件。如果直接卸载而不还原，Openclaw 可能仍指向已经不存在的代理或防护配置。官方也提供了跨平台清理脚本：

```bash
# macOS / Linux：先 dry-run，再 force
chmod +x ./scripts/uninstall/uninstall_unix.sh
./scripts/uninstall/uninstall_unix.sh --dry-run
./scripts/uninstall/uninstall_unix.sh --force
```

```powershell
# Windows：先 DryRun，再 Force
powershell -ExecutionPolicy Bypass -File .\scripts\uninstall\uninstall_windows.ps1 -DryRun
powershell -ExecutionPolicy Bypass -File .\scripts\uninstall\uninstall_windows.ps1 -Force
```

这一点对安全工具尤其重要：安全代理类软件经常会改网络代理、配置文件、启动项或本地权限策略，卸载流程必须可逆、可验证。

## 适合谁，不适合谁

| 场景 | 是否适合 | 原因 |
|---|---|---|
| OpenClaw 用户想观察本地 Agent 的工具调用和风险 | 适合 | 项目已有 Openclaw 插件与资产发现、防护控制接口。 |
| 安全研究者研究 Agent 运行时防护 | 适合 | 代理、沙箱、审计、风险分类都集中在一个开源项目中，便于阅读和二次验证。 |
| 企业想立刻替代正式 EDR / DLP / CASB | 不适合 | 项目仍偏早期，社区规模有限，不能直接等同成熟企业安全平台。 |
| 只需要云端 API 网关防护 | 视情况 | ClawdSecbot 更贴近端侧 Bot 进程；如果所有 Agent 都在服务端，可能要看 WebUI / API 模式是否满足部署模型。 |
| 不愿授予本机高权限 | 谨慎 | Windows 端需要管理员权限；沙箱和代理类能力天然涉及较高系统权限。 |

## 安全价值与边界

ClawdSecbot 的安全价值在于它把 Agent 防护从「提示词层」推进到「运行时控制层」。这对 AI Bot 场景很关键，因为风险经常发生在模型决定调用工具之后：真正产生影响的是文件系统、网络、Shell、浏览器、插件和本地进程，而不是一句拒答文案。

但它也有几个边界需要明确：

1. **安全检测不是绝对可靠。** README 和源码显示项目使用 ShepherdGate、LLM/ReActAgent 语义分析、内置安全技能和用户规则做决策。语义检测能覆盖复杂上下文，但也可能误报、漏报或受模型能力影响。
2. **沙箱能力受平台限制。** macOS、Linux、Windows 的沙箱技术不同，Seatbelt、LD_PRELOAD Hook、MinHook 的隔离强度和绕过面不能简单等同。
3. **本地代理需要正确配置。** 如果 Bot 没有真正走 ClawdSecbot 的代理链路，或者卸载时没有恢复配置，防护效果和稳定性都会受影响。
4. **早期项目需要二次验证。** GitHub Stars、Release 和源码活跃度只能说明项目存在和迭代状态，不能替代生产级安全评估。

## 我的判断

如果你正在使用 OpenClaw 或类似端侧 AI Bot，ClawdSecbot 值得作为安全研究和本地防护原型重点关注。它覆盖了 AI Agent 安全里几个真实痛点：资产发现、请求拦截、工具调用检测、系统级沙箱、审计日志和插件扩展。

不过，它更像一套「Agent Runtime Security」的开源样板，而不是可以不经评估直接铺开的企业级安全产品。最合理的用法是：先在测试机上接入一个 Bot，观察它能否稳定识别资产、代理流量、记录审计、拦截高风险 ToolCall，再根据误报率、性能开销和平台权限要求决定是否长期使用。

## 参考资料

- [ClawdSecbot GitHub 仓库](https://github.com/secnova-ai/ClawdSecbot)
- [ClawdSecbot README 中文文档](https://github.com/secnova-ai/ClawdSecbot/blob/main/README_zh-CN.md)
- [ClawdSecbot v1.0.5 Release](https://github.com/secnova-ai/ClawdSecbot/releases/tag/v1.0.5)
- [ClawdSecbot GPL-3.0 LICENSE](https://github.com/secnova-ai/ClawdSecbot/blob/main/LICENSE)
- [版本升级迁移指南](https://github.com/secnova-ai/ClawdSecbot/blob/main/mds/version_upgrade_migration_zh-CN.md)
