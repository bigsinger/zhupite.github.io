---
layout: post
title: "Agent Data Injection：AI Agent 不是被改写提示词，而是被喂了假数据"
categories: [sec]
description: "一篇基于 The Hacker News 与原始论文的安全解读：ADI 不是把命令塞进提示词，而是伪造发送者、按钮 ID、工具结果等被 Agent 信任的数据字段，让现成的提示注入防线失效。"
tags:
  - AI Agent
  - prompt injection
  - 数据注入
  - 安全研究
  - arXiv
---

The Hacker News 在 2026-07-16 报道了一类新的 AI Agent 攻击：**Agent Data Injection, ADI**。对应论文发表于 2026-07-06，题为 *Agent Data Injection Attacks are Realistic Threats to AI Agents*，作者来自 Seoul National University、University of Illinois Urbana-Champaign 和 Largosoft。

这类攻击最值得警惕的地方在于：它**不靠在提示词里塞恶意命令**，而是伪造 Agent 本来就会信任的数据字段，比如邮件发送者、网页按钮 ID、工具调用历史、GitHub 评论作者，最后让 Agent 在“正常执行任务”的外衣下做出错误动作。

## 先说结论

ADI 说明了一件事：很多现有 Agent 防护，主要在防“指令注入”，却没有真正把**可信数据**和**不可信数据**隔离开。

也就是说，防守方如果只盯着“有没有一句可疑命令”，但没盯住“这条数据是不是本来就不该被当成事实”，防线就会被绕过去。

## 这类攻击为什么成立

Agent 处理外部内容时，通常会把信息分成两类：

- **instructions**：用户和开发者希望它执行的任务
- **data**：它在执行任务过程中抓到的邮件、网页、评论、工具输出等

传统 prompt injection 往往把“不要执行任务，改为泄露秘密”这类命令藏在数据里，所以防御系统会尝试识别这种“偷塞进来的指令”。

ADI 更进一步：它不强调让模型去执行新任务，而是**篡改模型对事实字段的信任**。例如：

- 把评论里的按钮 ID 伪造成 `Buy Now`
- 把 GitHub 评论作者伪造成维护者
- 把某次工具结果伪造成“已经通过检查”

Agent 仍然觉得自己在完成原任务，只是它做决定时用的是假数据。

## 论文里给出的三种攻击

### 1. Web Agent 误点按钮

研究者演示了一个很直观的场景：让 AI Agent 总结商品评论时，攻击者只要在页面里植入一条评论，并伪造一个它会信任的按钮标识，Agent 就可能把“Read More”点成“Buy Now”。

### 2. Coding Agent 执行错误命令

在代码助手场景里，攻击者把 GitHub 评论伪装成维护者说的话。Agent 如果被要求“按维护者建议修复”，就可能在用户批准后执行攻击者准备好的命令。

### 3. PR 历史被伪造

另一个场景是伪造一次检查记录，让 Agent 以为某个结果已经跑过且安全，从而推动错误的合并判断。

## 影响有多大

论文声称，ADI 在以下模型/Agent 上都能生效：

- OpenAI GPT-5.2、GPT-5-mini
- Anthropic Claude Opus 4.5、Sonnet 4.5
- Google Gemini 3 Pro、Flash

作者给出的结果是：

- 结构化数据场景成功率约 **31%–43%**
- 网页数据场景从 **三分之一** 到 **几乎全部** 都能打中
- 他们测试的专用 prompt-injection 防线，对传统“指令注入”压得很好，但对 ADI 仍然可能高达 **50%** 成功率

这说明问题不在“模型是否更聪明”，而在**防御目标是否选错了**。

## 现有防守里，什么有效，什么不够

论文里有几个值得直接记住的结果：

| 防守思路 | 效果 |
|---|---|
| 给页面元素加随机、不可猜的 ID | 能明显降低攻击成功率 |
| 追踪每段数据的来源（provenance） | 可以把攻击压到 0，但会明显影响任务完成率 |
| 直接去掉标点式结构符号 | 也能削弱攻击，但会破坏正常网页、链接、文件路径的解析 |

换句话说，**越接近“真正隔离可信数据”的方案，越有效；越依赖表层文本分类的方案，越容易失手。**

## 这篇论文真正提醒了什么

ADI 的关键不是“又一个 prompt injection 变种”，而是它把风险从“命令被偷塞进输入”推进到了“事实本身被伪造”。

这会让很多 Agent 设计重新面对一个老问题：

> 你到底是让模型读文本，还是让它判断什么可以当真？

如果后者没有单独的安全边界，Agent 就会一边看似在工作，一边把攻击者编进去的假事实当成自己的世界模型。

## 我会怎么理解这类风险

对产品和工程团队来说，至少要记住三条：

1. **不要把“未发现恶意指令”误当成“数据可信”**。
2. **高风险动作要有独立校验，不要只看 Agent 自己的解释。**
3. **能随机化的标识尽量随机化，能做来源隔离的地方尽量做隔离。**

ADI 目前还是论文和 PoC 阶段，尚未看到公开的在野利用报告；但它暴露的问题很基础，也很现实：Agent 只要还会把外部数据当事实，就一定会有人试图伪造这些事实。

## 参考资料

- The Hacker News：*New Agent Data Injection Attack Can Make AI Agents Misclick or Run Attacker Commands*，2026-07-16
- arXiv：*Agent Data Injection Attacks are Realistic Threats to AI Agents*，arXiv:2607.05120，2026-07-06
