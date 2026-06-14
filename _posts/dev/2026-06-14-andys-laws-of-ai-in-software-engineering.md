---
layout: post
title: "Andy 的 AI 软件工程三定律：AI 越普及，不用 AI 的工程师越值钱"
categories: [dev]
description: "资深软件工程师 Andy Maleh 提出了三条关于 AI 在软件工程中的定律，观点犀利且反主流：AI 用得多的人恰恰是基础最弱的人、AI 速度优势被客户反馈瓶颈抵消、真正值钱的反而是不用 AI 的工程师。"
tags:
  - AI
  - 软件工程
  - Andy Laws
  - 编程
  - 工程师成长
  - 方法论
---

2026 年，关于 AI 编码助手的讨论已经不再停留在「好不好用」的层面。行业共识是 AI 确实能写代码、能 debug、能生成测试，分歧在于 **它对工程师能力的长期影响是什么**。

2026 年 6 月，资深软件工程师 Andy Maleh 在他的博客上发表了 **"Andy's Laws of AI in Software Engineering"**（Andy 的 AI 软件工程定律），三条定律观点鲜明、措辞直接，在 Dev社区引发了讨论。这位作者不是空谈派——MS in Software Engineering（DePaul）、Ruby 语言 Fukuoka 奖得主、Glimmer GUI 框架作者、RubyConf/RailsConf 常客讲者。

三条定律本身不长，但每一条都在挑战当前的主流叙事。

> **原文地址：** [andymaleh.blogspot.com](https://andymaleh.blogspot.com/2026/06/andys-laws-of-ai-in-software-engineering.html)（2026.06.09，持续更新中）

---

## 第一定律：AI 用得越多，不用 AI 的工程师越值钱

> **"The more Software Developers use AI, the more valuable Software Engineers who do not use AI become."**

核心逻辑：当整个开发者社区变得越来越依赖 AI 来写代码，真正理解「底层在发生什么」的人会变得越来越稀有，因此越来越值钱。

Maleh 的逻辑链条是：

1. AI 普及 → 大量开发者依赖 AI 完成任务，不再深入理解细节
2. 依赖者增多 → 真正掌握底层原理的人比例下降
3. 供给减少 → 这部分专家的市场价值上升
4. 此外，**AI 软件本身始终需要人类工程师来维护**

这个观点和「淘金热时代卖铲子的人最赚钱」异曲同工——全行业都在用 AI 写代码，但 AI 产品本身需要大量不依赖 AI 的工程师去构建和优化。

## 第二定律：用 AI 获益越多，说明你基本功越弱

> **"Software Developers benefit from AI in direct proportion to how weak they are in Software Engineering."**

这是三条中争议最大的一条。

Maleh 的核心论点：AI 学习的是**大师级工程师**的知识和经验，然后把这些知识**喂给**水平较低的开发者。因此：

- **大师级工程师**（如 Linus Torvalds）会觉得 AI 对自己帮助不大——他们知道怎么写好代码，AI 给的建议往往不如自己的判断
- **基础较弱的开发者**（Maleh 原文中的 "zero degrees and qualifications"）会觉得 AI 帮助极大——AI 恰好弥补了他们缺失的知识

他由此推导出一个非常激进的结论：

> "If a Software Developer feels like they benefit from AI even a little bit, then that means they have some unhandled weakness and are lacking some skills in Software Engineering they could be improving instead."
>
> （如果你觉得自己从 AI 中获益，哪怕只是一点点，那说明你在软件工程上存在尚未弥补的短板，而这些短板本可以通过提升自己来填平。）

他的建议也因此很直接：

> "It is more valuable to hone your Software Engineering skills (including completion of university degrees) than to hone your AI usage skills."

因为当你真正达到大师级水平时，你就不再需要 AI 来完成工作了。花在学 AI 工具上的时间，实际上是在挤占成为大师所需的 10,000 小时刻意练习。

## 第三定律：AI 的速度优势，被客户反馈瓶颈抵消

> **"AI's speed is negated when it produces Software features faster than customers can test and learn."**

这条定律的洞察很锋利：**代码生成从来不是软件工程的瓶颈。**

Maleh 指出：

- 代码写得再快，客户仍然需要以**人的速度**去测试每个新功能并给出真实反馈
- 精益软件开发的交付速度，已经足够匹配客户反馈的节奏
- 软件存在固有的可接受复杂度上限——功能太多反而会压垮客户
- **客户优先要质量，而不是功能数量**

所以 AI 的「秒级生成代码」在工业化软件开发中并不像看起来那么有优势。真正的瓶颈在代码之外——需求理解、测试验收、客户学习——这些环节无法被 AI 加速。

---

## 三定律汇总

| 定律 | 核心观点 | 对工程师的启示 |
|------|---------|--------------|
| **第一定律** | AI 依赖者越多，底层掌握者越值钱 | 深入理解原理的长期价值在上升 |
| **第二定律** | 从 AI 获益越多，基本功短板越大 | 提升工程能力比提升 AI 使用能力更重要 |
| **第三定律** | AI 生成速度被客户反馈瓶颈抵消 | 代码不是瓶颈，质量不是数量 |

---

## 一点思考

Andy Maleh 的三条定律显然是**有意反主流**的。在当前「AI 让每个开发者都 10 倍高效」的主流叙事下，他提出了一个近乎挑衅的相反论调。

但与其说是「反对 AI」，不如说是在重新定义**什么才是真正的工程能力**。

第一定律和第二定律其实指向同一个问题：**当 AI 帮你跳过了「从错误中学习」的过程，你的工程直觉还能建立起来吗？** 传统上，一个工程师写 10,000 行烂代码才学会怎么写 100 行好代码。如果 AI 直接帮你生成了那 100 行好代码，你跳过了那 10,000 行烂代码的经验积累，下次遇到 AI 搞不定的边缘情况时，你的判断力来自哪里？

第三定律的贡献在于提醒我们：**技术兴奋容易让人混淆「做得快」和「做得好」。** 客户不关心你的代码是 AI 生成的还是手写的，他们只关心软件能不能解决他们的问题——而这个问题的答案，仍然需要在真实世界中通过客户反馈来验证，没有捷径。

当然，这三条定律并非没有争议：

- **第二定律**过于绝对——即使资深工程师也承认 AI 在处理样板代码、写测试、查文档方面节省了大量时间
- **"对 AI 的依赖会损害能力"** 需要更多实证数据支撑，目前更多是推理
- **第三定律**适用于 B2B 和企业级场景更贴切，但在个人项目、原型验证、副业场景中，AI 的速度优势确实显著

不过，在「AI 万能论」铺天盖地的当下，Maleh 这种从 20 年工程经验出发的冷静视角，本身就值得一读。
