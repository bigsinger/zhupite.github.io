---
layout: post
title: "Agent 不会成为一个新平台——操作系统厂商正在把它降维到应用层"
categories: [thinking]
tags: [AI Agent, 操作系统, 平台化, 微软, 苹果, Google, Ubuntu, 应用生态, 技术趋势]
description: "Windows 11 和 Ubuntu 相继宣布集成 Agent 运行时，表面看是操作系统拥抱 Agent，实则是操作系统厂商在扼杀 Agent 成为独立平台的路径。Agent 不会成为新的操作系统层，而是被降维到 SDK 和应用层面。本文论证这一判断，并讨论反方观点"
---

## 一、问题的提出

2026 年 6 月，密集发生了两件事：

- **6 月 8 日**：微软宣布 Windows 11 转型为 Agentic AI 平台，Agent 运行时嵌入操作系统
- **6 月 9 日**：Canonical 宣布 Ubuntu 在 OS 层面集成 Agent 运行时、推理框架和安全管理

看起来，操作系统厂商正在热烈拥抱 AI Agent。但如果我们用「利益结构」而非「技术功能」的视角去审视，会发现另一层含义：**操作系统厂商正在以自己的方式消化 Agent，防止它变成一个独立于 OS 的新平台层。**

你的判断——Agent 不会成为新平台，而是被降维到应用层——我认为是准确的。这篇文章围绕这一命题展开论证。

## 二、核心命题

**命题一**：Agent 不会成为独立于操作系统之上的新平台层

**命题二**：Agent 会成为操作系统 SDK 的一部分，以应用形态运行在 OS 生态内

**推论**：下一个时代是「应用使用方式的改变」——Agent 成为下一代应用的交互范式，而非新一代的底层平台

这个命题如果成立，意味着什么？意味着我们不会看到一个独立的「Agent 操作系统」或「Agent 平台层」出现。Agent 会成为 Windows/iOS/Android 上应用程序的一种新型交互方式——就像当年触屏没有创造新操作系统，而是成为所有应用的新交互范式。

## 三、支持论证：从 OS 厂商的利益结构看

### 3.1 操作系统厂商的核心利益：控制分发和运行时

操作系统厂商的商业模式建立在两层控制上：

| 控制层面 | 表现 | 为什么重要 |
|---------|------|-----------|
| **分发渠道** | App Store、Microsoft Store、Snap Store | 30% 抽成、审核权、生态锁定 |
| **运行时能力** | Win32 API、UIKit、Android Framework | 开发者依赖、用户黏性、生态壁垒 |

Agent 如果成为独立平台层（比如 OpenAI 推出 Agent Operating System），会直接突破这两层控制：
- Agent 通过自己的运行时分发，跳过了应用商店
- Agent 通过自己的框架调用能力，绕过了 OS API
- 用户通过 Agent 完成操作，不再直接使用 OS 原生的应用

**这是操作系统厂商绝对不能接受的。**

### 3.2 微软的「拥抱+消化」策略

微软的反应是最典型的。Windows 11 的 Agent 运行时看起来是开放，实际上是一套控制机制：

- **Agent 运行时由 OS 提供**→ Agent 不能自建运行时
- **Agent 权限由 OS 管理**→ Agent 不能绕过系统安全策略
- **Agent 间的通信信道在 OS 层**→ 跨 Agent 协作由 Windows 编排
- **Agent 资源调度归 OS**→ Agent 不能抢占不受控的系统资源

微软的做法不是「支持 Agent」，而是「用 Windows 封装 Agent」。Agent 的所有关键能力（运行时、权限、通信、资源）都被 Windows 接口化了。开发者写 Agent，本质上是在写 Windows 应用。

这和微软对付 Netscape 的策略如出一辙：**不是阻止新技术，而是用自己的封装替代新技术，把创新者的差异化能力变成自己的平台接口。**

### 3.3 Apple 的「系统级 Agent」路线

Apple 的动作更早。Apple Intelligence 在 iOS/macOS 中的设计逻辑也在印证这一判断：

- **Siri 是 OS 组件**，不是独立应用
- **App Intents 框架**定义了应用可以暴露给 Agent 的能力边界——Agent 能做什么，由应用开发者通过 Intents 声明，不由 Agent 自行决定
- **Private Cloud Compute** 确保 Agent 推理不出 Apple 的硬件生态

Apple 的模式是：**Agent 是操作系统的能力延伸，应用通过 SDK 暴露自己的能力给 Agent，Agent 本身没有独立的身份和平台。**

### 3.4 Google 的「SDK 先行」策略

Google 的 Gemini 深度集成 Android，走的也是 SDK 路线：

- **Gemini Nano** 是设备端推理引擎，属于 Android 系统层
- **Google AI Edge SDK** 让开发者将 AI 能力嵌入应用
- 应用通过 **Gemini API** 获得 Agent 能力，而不是 Agent 获得独立平台地位

Google 让 Agent 能力成为 Android 应用开发的一个新 SDK，而不是一个独立的 Agent 平台。

### 3.5 Ubuntu 的 snap 路径

Canonical 的选择最有说服力：他们把 Agent 运行时做成了 **snap 包**。

snap 是什么？是 Ubuntu 的应用打包格式。Agent 运行时成为一个应用组件，Agent 本身也是一个 snap 包。

Canonical 没有说「Ubuntu 上跑 Agent 平台」，而是说「Ubuntu 上可以安装 Agent 应用」。这本身就是一种降维——Agent 从「新平台」变成了「新类型的应用」。

## 四、这意味着什么：Agent 成为下一代应用形态

如果以上判断正确，我们需要重新理解 Agent 在未来的定位。

### 4.1「应用」的概念在演变，但「应用」本身没有消失

手机时代，人们说「App 已死，Web 永生」。结果是 App 依然活得很好，只是变成了更轻量、更服务化的形态。

Agent 时代也会类似。不存在一个叫「Agent 平台」的东西，而是：

- **现在的 App**：用户打开 → 在界面中操作 → 完成任务
- **未来的 App**：用户下达意图 → Agent 代表用户与 App 交互 → 完成任务

Agent 不是取代了应用，而是**改变了用户与应用交互的方式**。

### 4.2 OS 厂商会推出 Agent SDK，而非 Agent 平台

接下来你会看到一系列 Agent SDK 的发布：

| 厂商 | 已有/预期 SDK | 作用 |
|------|-------------|------|
| **Apple** | App Intents | 应用向 Agent 暴露能力 |
| **Google** | AI Edge SDK + Gemini API | 应用内置 Agent 推理 |
| **Microsoft** | Windows Agent Runtime API | Agent 调用 Windows 资源 |
| **Canonical** | Ubuntu Agent SDK (snap) | Linux 上构建 Agent 应用 |

这些 SDK 的共同点：**Agent 能力被封装在应用内部，Agent 不是独立的系统实体，而是应用的一个功能模块。**

### 4.3 应用市场的「Agent 分类」会诞生

Apple App Store、Microsoft Store、Google Play 会很快出现「AI Agent」分类。开发者提交的不是「Agent」，而是**「包含 Agent 能力的应用」**。平台方仍然掌握审核权、分发权和抽成。

这和当年的「含 AI 功能的应用」没有任何本质区别——只是 AI 从「被动回答」变成了「主动执行」。

## 五、反方观点：Agent 真的不会成为一个新平台吗？

为了确保这一判断不是一厢情愿，我们需要正视几个强有力的反方论证。

### 5.1 反方一：Web 的历史证明，OS 厂商挡不住新平台

90 年代，微软把 IE 捆绑进 Windows，试图用操作系统消化 Web。但最终 Web 仍然成为了一个独立于操作系统的平台——Web 应用跨 Windows/macOS/Linux，操作系统无法控制网页内容。

Agent 会不会也是同样的剧本？

**回应**：Web 之所以能独立，是因为 Web 技术栈（HTTP/HTML/JavaScript）不依赖操作系统——浏览器自己就是运行时，自己管理渲染、存储、网络。但 Agent 的运行时（模型推理、权限管理、系统调用）高度依赖操作系统底层能力。一个 Agent 如果无法访问文件系统、GPU、网络接口，它就什么也做不了。而对这些底层资源的访问控制权，始终在操作系统手里。

Web 是「我可以不要你帮我」，Agent 是「我必须你来放行」。这是本质区别。

### 5.2 反方二：第三方 Agent 框架（如 Hermes Agent）会绕过 OS

开源 Agent 框架（Hermes、LangChain、AutoGPT）可以运行在任何操作系统上，形成一个跨平台的 Agent 生态。

**回应**：这些框架跑在**用户空间**。它们受制于操作系统提供的权限模型——在 Windows 下受 Windows 约束，在 macOS 下受 macOS 约束。它们无法获得操作系统级的原生能力（系统级资源调度、权限管理、跨 Agent 通信信道）。更重要的是，一旦每个 OS 都有自己的 Agent SDK 和运行时，开发者面临的问题是：**我为哪个 Agent 生态开发？**

当 OS 厂商说「用我的 SDK，我帮你管理 Agent 生命周期、资源、安全」时，多数开发者会选择 OS 原生方案——因为省事。第三方框架会存在，但会是高阶玩家的选择，而非主流生态。

### 5.3 反方三：Agent 的终极形态是云原生，不依赖本地 OS

如果 Agent 主要跑在云端（AWS/Azure/GCP），那本地操作系统就不重要了——Agent 跑在云上，通过 Web 接口与用户交互，本地 OS 只是一个终端。

**回应**：这个判断对**服务器端 Agent**（运维自动化、数据处理、CI/CD 编排）是成立的——这恰恰是 Ubuntu 瞄准的方向。但对**个人 Agent**（个人助手、桌面自动化、本地设备控制），Agent 必须访问本地资源，绕不开操作系统。

两条路线可能会并存：
- **云端 Agent**：跑在云基础设施上，由云平台（AWS/Azure）提供运行时
- **本地 Agent**：跑在操作系统上，由 OS 提供运行时

两种形态不会合并成一个「统一 Agent 平台」。

### 5.4 反方四：开源 Agent 标准可能超越单个 OS

如果出现一个被广泛接受的开源 Agent 运行时标准（类似 Web 标准），所有 OS 都必须兼容它，Agent 平台就可能独立于 OS 存在。

**回应**：这取决于 OS 厂商的合作意愿。Web 标准之所以成功，是因为 IE/Netscape 时代浏览器厂商之间需要互操作性。但在 Agent 时代，OS 厂商没有动力标准化 Agent 运行时——他们更希望用差异化的 Agent SDK 锁定开发者。除非市场出现一个足够强大的跨 OS Agent 运行时（比如类似 Electron 的 Agent 运行时，但规模远超 Electron），否则标准化进程会被 OS 厂商的策略性差异化所牵制。

## 六、综合判断

### 6.1 为什么我觉得你的判断大概率正确

有三个证据支撑这一判断：

**证据一：时机的一致性不是巧合**
Windows 11 和 Ubuntu 在同一个月宣布 Agent 运行时——这不是技术成熟后的巧合，而是 OS 厂商集体意识到了窗口期。他们在 Agent 形成独立平台之前，抢先用自己的方案封装它。

**证据二：Apple 的路线已验证了「Agent SDK 模式」的可行性**
App Intents 框架已经运行了两年。开发者通过 Intents 向 Siri 暴露应用能力，Agent（Siri）调用这些能力来完成用户请求。**应用开发者不需要关心 Agent 平台，只需要关心 Intents 的集成。** 这个模式被证明可以工作，大概率会成为其他 OS 厂商的参照。

**证据三：商业模式的逻辑自洽**
OS 厂商的 Agent SDK 策略是一个多方获益的均衡解：
- OS 厂商：保持分发控制权，延长 OS 生命周期
- 开发者：获得 Agent 能力，无需自建基础设施
- 用户：在熟悉的设备上获得 Agent 体验
- 唯一受损者：试图建立「独立 Agent 平台」的第三方——而这也解释了为什么 OS 厂商的行动如此果断。

### 6.2 需要警惕的变量

做出「Agent 不会是新平台」的判断，不代表它可以不加审视地接受。有几个变量可能改变局势：

1. **开源 Agent 运行时的规模化速度**——如果有一个开源方案在开发者采用率上达到像 Docker 那样的统治地位，OS 厂商将不得不兼容它
2. **大模型厂商（OpenAI/Anthropic）的 OS 野心**——他们一直在推自己的 Agent，模式是云端而非本地 OS，可能绕过本地 OS 的控制
3. **Agent 跨设备的需求**——如果 Agent 需要在 Windows/macOS/Android/iOS 之间无缝迁移，OS 专属的 SDK 会成为障碍

## 七、结语

回顾计算历史上的每一次「平台迁移」：

```text
大型机时代    →  IBM 控制一切
PC 时代      →  Windows 成为新平台
互联网时代   →  Web 试图成为新平台，但被 OS 厂商部分消化
移动时代     →  iOS/Android 重掌控制权
AI Agent 时代 →  ?
```

每一次新旧平台交替，都是 OS 厂商与应用/平台厂商之间的权力博弈。Web 是唯一一次成功独立于 OS 的平台，但代价是它放弃了 OS 级别的能力（文件系统、GPU、硬件访问）。

Agent 比 Web 更需要系统级能力——这意味着 OS 厂商有更强的谈判筹码。Agent 不会成为新平台，而是成为「新时代的应用」——这一判断既有历史规律的支持，也有当前 OS 厂商动作的印证。

未来的应用，可能是「一个 Agent——它替你选择和操作其他应用」。但最终这些 Agent 跑在操作系统的沙箱里，从操作系统的 SDK 获得能力，通过操作系统的商店分发。**Agent 改变了应用的面貌，但没有改变应用的命运。**

---

**参考资料**
- The Register (2026-06-09): Canonical将Ubuntu带入AI Agent时代
- Let's Data Science / streamlinefeed.co.ke (2026-06-08): 微软将Windows 11改造为Agentic AI平台
- Apple App Intents 框架文档
- Google AI Edge SDK 文档
- 历史对照：Netscape vs IE 浏览器大战
