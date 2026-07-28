---
layout: post
title: "FluentCleaner：一个基于 WinUI 3 的 Windows 清理工具"
categories: [tool]
description: "基于 FluentCleaner 官方仓库 README、LICENSE、Releases 和 version.txt 整理，介绍它的定位、双版本结构、winapp2.ini 兼容方式、无 UI 自动化用法，以及为什么它刻意不做注册表清理。"
tags:
  - FluentCleaner
  - Windows
  - 清理工具
  - WinUI 3
  - 开源软件
---

> 说明：本文基于 FluentCleaner 官方 GitHub 仓库整理，项目唯一官方来源见文末链接；仓库 README 还特别提醒不要把第三方网站误认为官网。

FluentCleaner 不是又一个“什么都能清”的 Windows 美化壳，而是一个很明确的清理工具：**它用 WinUI 3 做界面，用自己的清理引擎和 winapp2.ini 解析器去处理缓存、临时文件和残留日志**，同时刻意避开了注册表清理这类高风险、低收益功能。

如果你对 Windows 清理工具的期待是“别再塞 VPN、推荐、弹窗和假优化了”，FluentCleaner 的定位会很直白：**少做噪音，多做清理**。

## 它解决什么问题

从仓库 README 的语气就能看出来，这个项目的出发点不是“做一个功能最多的清理器”，而是“做一个更诚实的清理器”。它主要处理这些东西：

- 浏览器缓存
- 临时文件
- 应用卸载后的残留日志和痕迹
- 基于 winapp2.ini 的规则化清理项

README 里还直接点明了它的边界：**不做注册表清理**。作者给出的理由也很明确——注册表清理风险高，收益往往只是心理安慰。

这意味着 FluentCleaner 更像一个**面向明确垃圾数据的定向清理工具**，而不是“系统优化大礼包”。

## 两个版本，但共用同一套核心引擎

仓库首页把产品拆成两条线：

| 版本 | 定位 | 说明 |
|---|---|---|
| FluentCleaner | 现代版 | 基于 WinUI 3 的桌面版本 |
| FluentCleaner Classic | 经典版 | 面向传统桌面运行环境的版本 |

README 里有一句很关键：**两个版本共享同一个 `FluentCleaner.Core`**。也就是说，UI 和运行时风格不同，但底层清理逻辑和 winapp2.ini 解析是同一套。

这类拆分的好处很现实：

1. 你可以按自己的系统和习惯选界面版本；
2. 项目的核心逻辑不会因为 UI 改版而分裂；
3. 维护成本更低，用户体验也更容易统一。

## 它的核心工作流

根据 README，FluentCleaner 的使用逻辑很简单：

### 1）选择清理数据库

项目默认使用 winapp2.ini 生态里的清理规则。README 说明它兼容原始 CCleaner 风格的数据库，同时也支持自定义数据库。

在设置里可以找到：

- `Settings > Database > Custom`

然后指向你自己的规则文件即可。

### 2）选择要清理的项目

项目重点是“明确可解释的垃圾”：缓存、临时数据、日志、残留项。它不是那种一键全删的黑盒工具，而是尽量让你知道自己在删什么。

### 3）执行清理

README 还提供了**无 UI / 定时任务模式**：

```text
FluentCleaner.exe /AUTO
FluentCleaner.exe /AUTO /SHUTDOWN
```

自动运行时的日志位置是：

```text
%AppData%\FluentCleaner\auto.log
```

这说明它不只是一个“开着点点看”的图形工具，也考虑了批处理和任务计划场景。

## 我觉得它最值得注意的三个点

### 1. 它不是在复刻老工具，而是在修正老工具的毛病

README 反复提到 CCleaner 和历史包袱，但重点不是怀旧，而是“别再把工具做成噪音集合”。

这会让 FluentCleaner 的产品思路很清晰：

- 只处理高确定性的垃圾；
- 不做注册表那种争议项；
- 不把“功能很多”当成价值。

### 2. winapp2.ini 仍然有现实价值

很多人会把 winapp2.ini 视为老派生态，但 FluentCleaner 的做法说明它仍然有用：

- 社区已经沉淀了大量规则；
- 规则化清理比手工维护更可扩展；
- 对很多应用残留，规则库比纯靠程序内置更灵活。

### 3. 它对“官方来源”很敏感

README 开头就提醒：**不要把 fluentcleaner.org 之类第三方站点当成官方来源**。这在开源项目里其实挺少见，但也很实用。

对用户来说，这个提醒的价值是：**安装包、发布页、规则库都尽量从 GitHub 仓库本身走**，不要被外部仿站带偏。

## 适合谁，不适合谁

### 适合

- 想清理 Windows 缓存、临时文件和残留痕迹的人
- 喜欢可解释、可控清理项的人
- 需要无 UI 自动运行或任务计划的人
- 介意“清理工具顺手塞一堆附加功能”的人

### 不适合

- 想要“一键系统优化全家桶”的人
- 期待注册表清理功能的人
- 想靠清理工具获得神奇性能提升的人

后者基本可以直接跳过。FluentCleaner 的路线很明确：**把能明确证明是垃圾的东西处理掉，而不是制造一种“我好像优化了系统”的感觉**。

## 版本与许可

仓库里的 `version.txt` 当前显示为 `26.07.04`。许可证是 **MIT License**，LICENSE 文件在仓库根目录可以直接查看。

这两点对想要评估项目的人很重要：

- 版本号说明项目仍在持续迭代；
- MIT 许可意味着使用和再分发都比较宽松。

## 结论

FluentCleaner 的价值不在“功能堆得多”，而在“边界收得住”。它把 Windows 清理这件事重新拉回到一个更朴素的标准：**只清理明确无争议的垃圾，不拿注册表和花活给自己加戏**。

如果你要找一个现代 Windows 清理工具，且希望它：

- 有清晰的官方仓库；
- 支持 winapp2.ini 生态；
- 有现代 UI 和经典版双路线；
- 还能通过命令行做自动化；

那 FluentCleaner 值得看一眼。

## 参考资料

- 官方仓库：<https://github.com/builtbybel/FluentCleaner>
- README：<https://raw.githubusercontent.com/builtbybel/FluentCleaner/master/README.md>
- 许可证：<https://raw.githubusercontent.com/builtbybel/FluentCleaner/master/LICENSE>
- 版本文件：<https://raw.githubusercontent.com/builtbybel/FluentCleaner/master/version.txt>
- Releases：<https://github.com/builtbybel/FluentCleaner/releases>
