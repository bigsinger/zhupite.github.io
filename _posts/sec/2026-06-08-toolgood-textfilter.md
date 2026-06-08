---
layout: post
title: 『ToolGood.TextFilter』——开源敏感词过滤与内容审核引擎
description: "ToolGood.TextFilter 是一款多语言敏感词过滤引擎，支持 C#/Java/Python 等多种语言绑定，基于 AC 自动机实现高性能敏感词检测与内容审核。"
date: 2026-06-08 10:10:00 +0800
categories: [sec]
tags: [content-filter, sensitive-words, csharp, java, python, text-audit]
---

## 项目简介

ToolGood.TextFilter 是由 ToolGood 开发的一套跨平台多语言敏感词过滤与内容审核引擎。它基于 AC 自动机等多模式匹配算法，提供高性能的文本检测与过滤能力，支持 C#、Java、Python、JavaScript 四种主流语言。虽然项目已于 2021 年停止更新，但其代码质量和工程化水平仍然值得学习参考，是中小团队搭建内容审核系统的免费替代方案。

## GitHub 数据

- **仓库地址**: [toolgood/ToolGood.TextFilter](https://github.com/toolgood/ToolGood.TextFilter)
- **Stars**: 125 | **Forks**: 33
- **License**: GPL-3.0
- **主要语言**: C# / Java / Python / JavaScript
- **最后更新**: 2021-10-15（已停更）
- **定位**: 内容审核系统 / 敏感词过滤引擎

## 核心功能

1. **敏感词检测与过滤**：支持精确匹配、模糊匹配、拼音纠错、繁体简体转换等多种检测模式
2. **多模式匹配算法**：基于 AC 自动机（Aho-Corasick）实现高效多关键词匹配，时间复杂度与词典大小无关
3. **多语言实现**：同一套算法在 C#、Java、Python、JavaScript 四种语言中均有实现，方便不同技术栈集成
4. **自定义词库**：内置基础敏感词库，支持用户自由添加、删除、更新自定义关键词
5. **高性能文本处理**：单次扫描即可完成全部关键词匹配，吞吐量可达数万字符/毫秒
6. **内容安全审核**：支持对中文、英文、数字混合内容的全面检测

## 技术栈

- **C# .NET**：主实现版本，支持 .NET Framework / .NET Core
- **Java**：Java 版适用于 Android 和 Java 后端
- **JavaScript**：浏览器端/Node.js 可直接使用
- **Python**：Python 版适合与数据处理流程集成
- **算法**：AC 自动机、Trie 树、DFA（确定有限状态自动机）

## 安装与使用

**C# 版（NuGet）**：

```bash
dotnet add package ToolGood.TextFilter
```

```csharp
var filter = new WordsFilter();
filter.SetKeywords(new List<string> { "敏感词1", "敏感词2" });
var result = filter.FindAll("这是一段包含敏感词1的文本");
Console.WriteLine(result.Count); // 输出 1
```

**Python 版**：

```bash
pip install toolgood-textfilter
```

```python
from toolgood_textfilter import TextFilter
filter = TextFilter()
filter.set_keywords(["敏感词1", "敏感词2"])
result = filter.find_all("这是一段包含敏感词1的文本")
print(len(result))  # 输出 1
```

## 适用场景

- **论坛/社区内容审核**：用户发帖、评论的实时敏感词检测与拦截
- **即时通讯过滤**：聊天消息中涉政、涉黄、广告关键词的即时过滤
- **企业内容安全合规**：内部文档系统、OA 系统的内容安全审计
- **游戏聊天过滤**：游戏内玩家聊天消息的自动过滤与警告

## 竞品对比

| 对比项 | ToolGood.TextFilter | 阿里云内容安全 | 腾讯云内容安全 | cnsensitive |
|--------|---------------------|---------------|---------------|-------------|
| 运行方式 | 本地离线 | 在线 API | 在线 API | 本地离线 |
| 费用 | 免费开源 | 按量计费 | 按量计费 | 免费 |
| 多语言支持 | C#/Java/Python/JS | REST API | REST API | Python |
| 算法深度 | AC 自动机+DFA | 深度学习 | 深度学习 | DFA |
| 更新维护 | 已停更 | 持续更新 | 持续更新 | 社区维护 |
| 适用规模 | 中小团队 | 企业级 | 企业级 | 个人/小项目 |

## 参考资料

- GitHub 仓库: [https://github.com/toolgood/ToolGood.TextFilter](https://github.com/toolgood/ToolGood.TextFilter)
- AC 自动机算法: [https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm](https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm)
- GPL-3.0 License: [https://www.gnu.org/licenses/gpl-3.0.html](https://www.gnu.org/licenses/gpl-3.0.html)
