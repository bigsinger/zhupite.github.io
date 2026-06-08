---
title: chinese-poetry —— 最全中文诗歌古典文集开源数据库
date: 2026-06-08 00:00:00 +0800
categories: [tool]
tags: [诗词, 数据库, 开源数据, NLP, JSON]
---

## 项目简介

chinese-poetry 是目前全网最全面的中文诗歌古典文集开源数据库，将海量中国古典诗词以标准 JSON 格式整理发布。项目覆盖从唐诗宋词到四书五经的庞大文本体系，为开发者、研究者和创作者提供了可直接使用的结构化中文古典语料。

该仓库以其 51K+ Stars 成为 GitHub 上中文 NLP 数据领域的标杆项目。

## GitHub 数据

- **仓库地址**: [chinese-poetry/chinese-poetry](https://github.com/chinese-poetry/chinese-poetry)
- **Stars**: 51,718 | **Forks**: 10,428
- **License**: MIT
- **语言**: JavaScript（爬虫采集脚本）
- **创建时间**: 2016-09-02
- **维护状态**: 活跃维护，持续更新

## 核心功能

### 数据规模

| 数据集 | 数量 |
|-------|------|
| 唐诗 | 约 55,000 首（诗人近 14,000 位） |
| 宋诗 | 约 260,000 首 |
| 宋词 | 约 21,000 首（词人 1,564 位） |
| 论语 | 全文收录 |
| 诗经 | 全文收录 |
| 花间集 | 完整版 |
| 四书五经 | 整部收录 |
| 蒙学 | 三字经、百家姓、千字文等 |
| 纳兰性德诗集 | 完整收录 |

### 扩展功能

- **高频词统计分析**：提供诗歌高频词的可视化统计分析图表
- **数据结构标准化**：统一 JSON 格式，字段清晰，易于解析
- **分类检索**：按朝代、作者、词牌名等多维度分类

## 技术栈

| 技术 | 用途 |
|------|------|
| JSON | 数据存储格式，结构化标准化 |
| Python / Node.js | 数据爬虫采集脚本 |
| Markdown | 文档与说明 |

数据以纯 JSON 文件存放，没有任何数据库依赖，任何语言都可以直接解析使用。

## 使用方式 / 安装

### 直接下载

```bash
git clone https://github.com/chinese-poetry/chinese-poetry.git
```

克隆后即可在 `json/` 目录下找到分类整理好的 JSON 文件。

### 在代码中使用（Python 示例）

```python
import json
# 加载唐诗数据
with open('./chinese-poetry/json/poet.tang.json', 'r', encoding='utf-8') as f:
    poems = json.load(f)
# poems 是一个包含 5.5 万首唐诗的列表
```

### 在前端项目中使用

直接将 JSON 文件作为静态资源引用，或通过构建工具打包。

## 适用场景

- **诗词类 App / 网站数据后端**：为诗词阅读应用提供完整的离线数据
- **中文 NLP 语料**：用于古诗文分词、文本分类、情感分析等研究
- **诗歌生成 AI 训练数据**：作为古诗生成模型的预训练语料
- **学术研究**：统计分析历代诗词的用词、题材、流派演变
- **文化教育**：开发古诗词学习、背诵、测试工具

## 竞品对比

| 项目 | 类型 | 优势 | 劣势 |
|------|------|------|------|
| **chinese-poetry** | 开源数据库 | 数据最全、MIT 许可、JSON 标准格式 | 需自行处理使用场景 |
| **古诗文网** | 在线平台 | 内容丰富、带注解 | 不开源、不可批量下载 |
| **CNKG (中文知识图谱)** | 开源知识图谱 | 结构化知识关联 | 侧重知识图谱，诗词不是核心 |

chinese-poetry 在数据完整性和开放许可方面具有不可替代的优势。5.5 万首唐诗和 26 万首宋诗的数据量至今仍是公开数据集中最大的。

## 参考资料

- [GitHub 仓库](https://github.com/chinese-poetry/chinese-poetry)
- [项目 Wiki](https://github.com/chinese-poetry/chinese-poetry/wiki)
- [高频词统计分析](https://github.com/chinese-poetry/chinese-poetry/tree/master/高频词)
- [中文诗歌数据集](https://github.com/chinese-poetry/chinese-poetry/tree/master/json)
