---
layout: post
title: "flexorch-audit：零依赖的 LLM 数据集审计工具，一行代码搞定 PII 检测、质量评分和噪声过滤"
categories: [tool]
description: "flexorch-audit 是一个零外部依赖的 LLM 数据集质量审计工具，纯 Python 标准库实现。支持 30+ 种 PII 类型（覆盖 8 个国家）、A-D 质量等级评分、噪声检测，提供 4 种 PII 掩码策略，即插即用 LangChain/LlamaIndex。"
tags: [LLM, 数据治理, PII检测, 开源工具, 数据质量]
---

## 一句话

**flexorch-audit** 是一个零外部依赖的 LLM 数据集质量审计工具——用纯 Python 标准库实现，一个函数调用完成三件事：**PII 检测**（30+ 类型覆盖 8 国）、**质量评分**（A-D 等级）、**噪声检测**（符号/空白行比率）。

> flexorch/flexorch-audit | 🐍 Python | MIT | v0.9.0 | npm 包 `@flexorch/audit`

## 为什么需要它？

LLM 应用落地中，数据治理正在成为安全合规的刚需：

- **训练数据**：喂给模型的数据里有没有 PII？会不会泄露客户信息？
- **RAG 数据**：知识库文档质量参差不齐，低质量文档拖累检索效果
- **合规要求**：GDPR、CCPA 等法规要求企业保护个人身份信息

传统方案要么贵（商业 API），要么重（需要 NER 模型、GPU、大量依赖）。flexorch-audit 的解法是：**纯正则 + 校验和验证，零依赖、零网络调用、零 GPU，pip install 直接用。**

## 核心功能

### 1. PII 检测（30+ 类型，覆盖 8 国）

基于纯正则表达式实现，无模型权重、无网络调用、无外部包。更重要的是——**不仅用 regex 匹配格式，还做校验和验证**：

| Locale | 覆盖的 PII 类型 |
|--------|----------------|
| **通用**（始终启用） | 邮箱、IBAN、信用卡（Luhn 校验）、IPv4、IPv6 |
| **tr**（土耳其） | TCKN（11 位，模运算校验）、VKN（税号）、MERSIS（16 位）、手机号、邮编 |
| **de**（德国） | Steuer-ID（ISO 7064 MOD 11,2 校验）、社保号 |
| **fr**（法国） | SIRET（14 位）、SIREN（9 位）、INSEE/NIR（15 位社保号） |
| **it**（意大利） | Codice Fiscale（16 位字母数字）、Partita IVA（11 位，校验） |
| **nl**（荷兰） | BSN（9 位，11-check 校验）、KvK（8 位公司号） |
| **es**（西班牙） | DNI（8 位+字母，mod-23）/NIE、CIF（公司税号） |
| **uk**（英国） | NI 号、UTR（10 位税号） |
| **us**（美国） | SSN（排除 000/666/9xx 前缀）、EIN、ITIN |

总计 **30+ 种 PII 类型**，每个类型都用正则匹配 + 额外的数学校验来减少误报。

### 2. 质量评分（A-D 等级）

综合评分公式：
```
quality_score = completeness × (0.4 × noise_score + 0.4 × length_score + 0.2)
```

| 等级 | 分数 | 含义 |
|------|------|------|
| **A** | ≥ 0.85 | 可直接用于 LLM 训练或 RAG |
| **B** | ≥ 0.65 | 可用，需少量清理 |
| **C** | ≥ 0.40 | 需要审查后使用 |
| **D** | < 0.40 | 不适合使用 |

### 3. 噪声检测

基于符号比率和空白行比率判断文本提取质量：

| `noise_ratio` | 含义 |
|---------------|------|
| < 0.05 | 干净，提取质量好 |
| 0.05 – 0.20 | 有少量格式伪影 |
| > 0.20 | 可能是 OCR 噪声或提取失败 |

### 4. 四种 PII 掩码策略

| 策略 | 输出示例 | 说明 |
|------|---------|------|
| **redact**（默认） | `[REDACTED_EMAIL]` | 直接替换为类型标签 |
| **replace** | `user@example.com` | 静态合成值替换 |
| **token** | `<PII_EMAIL_1>` | 每次调用每类型唯一编号 |
| **hash** | `[3d4f9a1b]` | SHA-256 前 16 位 |

### 5. 批量审计

`audit_batch()` 对数据集做整体分析：

```python
{
    "duplicate_ratio": 0.02,          # 重复记录比例
    "avg_quality_score": 0.82,        # 平均质量分数
    "pii_summary": {...},             # 所有记录中 PII 汇总
    "results": [...]                   # 每条记录的完整审计结果
}
```

## 快速上手

```bash
pip install flexorch-audit
```

单条审计：
```python
from flexorch_audit import audit

result = audit("Hello, my email is user@example.com", locale="us")
print(result.quality.score)    # 质量评分
print(result.quality.grade)    # A/B/C/D 等级
print(result.pii.detected)     # 检测到的 PII
```

PII 掩码：
```python
from flexorch_audit import audit, MaskStrategy

result = audit(
    "My SSN is 123-45-6789",
    locale="us",
    mask_strategy=MaskStrategy.REDACT
)
print(result.text)     # "My SSN is [REDACTED_SSN]"
```

批量审计：
```python
from flexorch_audit import audit_batch

docs = ["doc1 text...", "doc2 text..."]
results = audit_batch(docs, locale="us")
print(results.avg_quality_score)   # 平均质量分
print(results.duplicate_ratio)     # 重复率
```

Token 估算（无需 tiktoken）：
```python
from flexorch_audit import estimate_tokens

print(estimate_tokens("Hello world"))  # 算法: words × 4/3
```

## 框架集成

### LangChain

```python
from flexorch_audit.integrations.langchain_loader import AuditedLoader

loader = AuditedLoader(
    loader=your_langchain_loader,
    locale="us",
    mask_strategy="redact",
    min_quality_grade="C"  # 低于 C 级的自动过滤
)
```

### LlamaIndex

```python
from flexorch_audit.integrations.llamaindex_reader import AuditedReader

reader = AuditedReader(
    reader=your_llamaindex_reader,
    locale="us",
    mask_strategy="redact"
)
```

## 设计理念

这个项目有个非常鲜明的设计哲学：**零外部依赖。**

整个 PII 检测引擎基于纯正则表达式，不依赖 NER 模型、不依赖 GPU、不依赖网络服务。每个检测器不仅做格式匹配，还做数学校验——比如土耳其 TCKN 的模运算校验、SSN 的前缀排除、Luhn 算法的信用卡校验。

Token 估算也不依赖 tiktoken，用一个简单的 `words × 4/3` 公式，对英语和大多数欧洲语言准确率在 ~15% 以内。

这意味着你可以在任何 Python 3.10+ 环境下直接 `pip install` 就开用，不需要配环境、不需要下模型、不需要联网。

## 项目状态

| 指标 | 数据 |
|------|------|
| 创建时间 | 2026-05-04 |
| 最新版本 | v0.9.0（2026-06-19） |
| 许可证 | MIT |
| 主语言 | Python（纯 stdlib） |
| 跨语言 | JS/TS: `npm install @flexorch/audit` |
| Python 版本 | ≥ 3.10 |
| 安装 | `pip install flexorch-audit` |
| 框架集成 | LangChain + LlamaIndex 即插即用 |
| 组织官网 | flexorch.com |

## 局限性

项目还处于早期阶段（v0.9.0），有明确的边界意识：

- **无自动语言检测**：因零依赖设计，需调用者显式传入 `locale`
- **无独立姓名检测**：不带标签前缀的人名检测需要 NLP/NER，不在范围内
- **Replace 掩码使用静态合成值**：未实现本地化感知的真实合成
- **仅审计纯文本**：PDF/DOCX 解析等不在范围

## 总结

flexorch-audit 的价值在于：**在数据治理复杂度上升的趋势下，用最轻量的方式解决最刚需的问题。**

它不是最全能的 PII 方案，但它严格遵守自己设定的边界——零依赖、纯正则、可离线、可集成。对于正在做 LLM 数据管道、需要快速过一遍 PII 和质量过滤的团队，这是目前最轻量的选择。

一个洞察：LLM 应用落地正在从"模型能力"竞争转向"数据治理"竞争。flexorch-audit 这类工具的涌现，说明行业已经过了"先跑起来再说"的阶段，开始认真对待训练数据和推理数据的质量与合规问题了。

---

**项目地址**：[github.com/flexorch/flexorch-audit](https://github.com/flexorch/flexorch-audit)
**PyPI**：[pypi.org/project/flexorch-audit](https://pypi.org/project/flexorch-audit/)
**HN 讨论**：[news.ycombinator.com/item?id=48584670](https://news.ycombinator.com/item?id=48584670)
