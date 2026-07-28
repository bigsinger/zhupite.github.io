---
layout: post
title: "App Store Connect CLI：把 TestFlight、上架和元数据管理搬进终端"
categories: [tool]
description: "基于 rorkai/App-Store-Connect-CLI 官方 README、文档、Releases 和 LICENSE 整理，介绍 asc 如何用命令行自动化 TestFlight、构建上传、App Store 提交、元数据、本地 Xcode 与 CI/CD 流程。"
tags:
  - App Store Connect
  - TestFlight
  - iOS
  - CI/CD
  - CLI
---

> 资料来源：本文基于 [rorkai/App-Store-Connect-CLI](https://github.com/rorkai/App-Store-Connect-CLI) 官方仓库、README、文档和 Release 页面整理。项目是独立的非官方工具，不隶属于 Apple。

如果你做过 iOS / macOS 应用发布，大概率熟悉这套流程：打开 App Store Connect、查构建、等 TestFlight 处理、同步截图和元数据、准备提交审核、再回到 CI 里补脚本。**App Store Connect CLI** 想解决的就是这个断裂点：把 App Store Connect API 的常见操作变成一个可脚本化的 `asc` 命令。

它的定位很明确：**Fast, lightweight, and scriptable CLI for the App Store Connect API**。换句话说，它不是替代 Xcode，也不是替代 App Store Connect 网页，而是把发布链路中大量“可以自动化的环节”放回终端、IDE 和 CI/CD 管道里。

## 它解决什么问题

App Store Connect CLI 主要面向这些场景：

| 场景 | 传统做法 | `asc` 的价值 |
|---|---|---|
| TestFlight 构建分发 | 网页查构建、手工加入测试组 | 命令行上传、等待处理、加入测试组 |
| App Store 发布 | 多处页面跳转、人工检查状态 | 用高层命令串联上传、关联构建、提交审核 |
| 元数据与本地化 | 网页逐项编辑 | 初始化、导出、应用元数据目录 |
| 截图和预览视频 | 页面上传和替换 | 生成计划、批量应用、列表检查 |
| 签名资源 | 查证书、profiles、bundle IDs | 统一命令查询和脚本化处理 |
| CI/CD | 自写 API 调用或依赖分散脚本 | GitHub Actions、GitLab、Bitrise、CircleCI 有专门集成文档 |

对独立开发者来说，它可以减少发布时的网页操作；对团队来说，更大的价值是**把发布流程变成可审查、可复现的脚本**。

## 快速上手：先安装，再认证

README 给出的推荐安装方式是 Homebrew：

```bash
brew install asc
```

macOS / Linux 也可以用安装脚本：

```bash
curl -fsSL https://asccli.sh/install | bash
```

Windows 侧 README 提到 WinGet 包正在跟踪中；在 `winget search asc` 能搜到之前，Windows 用户可以从 GitHub Releases 下载已签名的二进制包。

安装后可以先确认命令可用：

```bash
asc version
asc --help
```

认证使用 App Store Connect API Key：

```bash
asc auth login \
  --name "MyApp" \
  --key-id "ABC123" \
  --issuer-id "DEF456" \
  --private-key /path/to/AuthKey.p8 \
  --network
```

API Key 在 App Store Connect 的 Integrations / API 页面生成。CI、无头环境或 keychain 不可用时，README 还提供了配置文件认证和 `--bypass-keychain` 相关路径。

认证完成后先跑健康检查：

```bash
asc auth status --validate
asc auth doctor
```

第一条真正的业务命令通常可以从应用列表开始：

```bash
asc apps list --output table
asc apps list --output json --pretty
```

## 最核心的工作流：从构建到发布

### TestFlight 反馈和崩溃

README 给出了一组 TestFlight 相关命令：

```bash
asc testflight feedback list --app "123456789" --paginate
asc testflight crashes list --app "123456789" --sort -createdDate --limit 10
asc testflight crashes log --submission-id "SUBMISSION_ID"
```

这类命令适合放到内部测试周报、发布前巡检或自动化诊断脚本里。

### 构建上传与分发

上传 iOS `.ipa`：

```bash
asc builds upload --app "123456789" --ipa "/path/to/MyApp.ipa"
asc builds list --app "123456789" --output table
asc testflight groups list --app "123456789" --output table
```

macOS TestFlight 则先上传 `.pkg`，再加入 beta group：

```bash
asc builds upload --app "123456789" --pkg "./build/MyMacApp.pkg" --version "1.2.3" --build-number "42" --wait --output json
asc builds add-groups --app "123456789" --build-number "42" --version "1.2.3" --platform MAC_OS --group "Internal Testers"
```

### App Store 高层发布命令

README 里最值得关注的是这个高层命令：

```bash
asc publish appstore --app "123456789" --ipa "/path/to/MyApp.ipa" --version "1.2.3" --submit --confirm
```

它把上传、关联、提交这些动作收敛到一个发布入口。提交后可以继续监控状态：

```bash
asc status --app "123456789" --watch
```

如果你不想一步到位，也可以先做预演：

```bash
asc release stage --app "123456789" --version "1.2.3" --build "BUILD_ID" --copy-metadata-from "1.2.2" --dry-run
```

这种 `--dry-run` 设计对发布工具很重要：真正进 CI/CD 之前，团队需要先看到计划，而不是直接修改线上状态。

## 元数据、截图和本地化也能纳入版本管理

很多 App 发布流程最容易变乱的不是构建，而是元数据：标题、副标题、关键词、描述、本地化、截图、预览视频。App Store Connect CLI 把这些也纳入命令行：

```bash
asc metadata init --dir "./metadata" --version "1.2.3" --locale "en-US"
asc metadata apply --app "123456789" --version "1.2.3" --dir "./metadata" --dry-run
asc metadata keywords audit --app "123456789" --version "1.2.3" --blocked-terms-file "./blocked-terms.txt"
```

截图相关命令也支持先生成计划，再确认应用：

```bash
asc screenshots plan --app "123456789" --version "1.2.3" --review-output-dir "./screenshots/review"
asc screenshots apply --app "123456789" --version "1.2.3" --review-output-dir "./screenshots/review" --confirm
```

这意味着发布材料可以更接近“代码仓库里的可审查资产”，而不是散落在网页后台里。

## 对 CI/CD 更友好的三个设计

### 1. 输出格式对脚本友好

README 说明 `asc` 的输出会根据运行环境变化：交互式终端默认表格，管道、文件和 CI 默认 JSON。也可以显式指定：

```bash
asc apps list --output json
asc apps list --output markdown
```

对自动化来说，JSON-first 比“解析人类可读表格”可靠得多。

### 2. 有官方集成文档

仓库的 `docs/CI_CD.md` 覆盖了 GitHub Actions、GitLab CI/CD Components、Bitrise 和 CircleCI。例如 GitHub Actions 可以使用 setup action：

```yaml
- uses: rudrankriyam/setup-asc@v1
  with:
    version: latest

- run: asc --help
```

### 3. 支持 workflow 编排

`docs/WORKFLOWS.md` 把高层路径分成三类：

| 命令 | 用途 |
|---|---|
| `asc publish appstore` | App Store 发布主路径 |
| `asc publish testflight` | TestFlight 发布主路径 |
| `asc workflow` | 面向项目自定义流水线的编排入口 |

文档里还给出了一个经过验证的本地 Xcode 到 TestFlight 流程：选择 build number、注入 Xcode 元数据、archive、export、上传并等待 TestFlight 处理。

## 隐私和遥测要提前知道

README 单独有一节 Privacy and telemetry：`asc` 默认会发送伪匿名的命令级使用遥测，用于帮助维护者理解命令使用情况。遥测包括 CLI 版本、操作系统和架构等信息。

你可以查看或关闭：

```bash
asc telemetry status
asc telemetry disable
asc telemetry reset-id
```

环境变量也支持禁用：

```bash
ASC_TELEMETRY_DISABLED=1
DO_NOT_TRACK=1
```

这点建议团队在引入前先写进工程规范，尤其是对 CI 环境、合规敏感项目和公司网络环境。

## 适合谁，不适合谁

### 适合

- 有稳定 iOS / macOS 发布节奏的团队；
- 希望把 TestFlight 和 App Store 发布脚本化的开发者；
- 想把元数据、截图、本地化纳入仓库管理的团队；
- 需要在 CI/CD 中统一处理构建上传、状态检查和提交审核的人；
- 正在尝试让 AI coding agent 参与发布准备，但需要确定性命令边界的人。

### 不适合

- 偶尔一年发一两个包，网页操作已经足够的人；
- 不愿意配置 App Store Connect API Key 的团队；
- 发布流程高度依赖人工审批、且暂时不想脚本化的人；
- 期望它替代 Xcode 构建系统本身的人。

## 版本、技术栈和许可证

截至本文抓取时，GitHub Releases 最新跳转到 `3.1.2`，README badge 显示项目使用 Go，仓库 `go.mod` 声明 `go 1.26.5`。LICENSE 文件显示项目采用 **MIT License**。

仓库 Star 数通过 shields.io 抓取约为 **5.3k**。这类数字会随时间变化，仅代表本文写作时的公开页面状态。

## 结论

App Store Connect CLI 的价值不是“多一个命令行玩具”，而是把移动应用发布中那些重复、易错、难审计的步骤变成可版本化、可预演、可自动化的流程。

如果你的发布链路已经开始出现这些问题：

- TestFlight 操作靠人记；
- 元数据和截图散落在网页后台；
- CI 只能构建，不能完整推进发布；
- 发布前检查没有固定脚本；

那 `asc` 值得纳入工具箱。它最适合的位置，是站在 Xcode、App Store Connect API 和 CI/CD 之间，做一个“发布自动化胶水层”。

## 参考资料

- 官方仓库：<https://github.com/rorkai/App-Store-Connect-CLI>
- README：<https://raw.githubusercontent.com/rorkai/App-Store-Connect-CLI/main/README.md>
- Releases：<https://github.com/rorkai/App-Store-Connect-CLI/releases>
- CI/CD 文档：<https://raw.githubusercontent.com/rorkai/App-Store-Connect-CLI/main/docs/CI_CD.md>
- Workflow 文档：<https://raw.githubusercontent.com/rorkai/App-Store-Connect-CLI/main/docs/WORKFLOWS.md>
- LICENSE：<https://raw.githubusercontent.com/rorkai/App-Store-Connect-CLI/main/LICENSE>
