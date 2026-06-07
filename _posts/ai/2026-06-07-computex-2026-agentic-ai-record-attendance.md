---
layout: post
title: "Computex 2026 创 45 年纪录：Agentic AI 取代 PC 成为展会核心"
categories: [ai]
description: "Computex 2026 以 111,312 名与会者创下 45 年历史最高纪录。Nvidia RTX Spark、Intel 18A、AMD AM5 至 2029 年——三大硬件巨头的发布信号：世界正在为 AI Agent 基建重新设计计算平台。"
keywords: Computex 2026, Agentic AI, Nvidia RTX Spark, Intel 18A, Xeon 6+, AMD AM5, AI Robotics, Physical AI
tags:
  - Computex 2026
  - Agentic AI
  - Nvidia
  - Intel
  - AMD
  - AI Hardware
  - RTX Spark
  - Intel 18A
  - Physical AI
  - Edge AI
---

Computex 2026 于 6 月 5 日在台北闭幕，**111,312 名买家和访客**来自 152 个国家和地区，创下该展会 45 年历史上最高参会纪录。这个数字本身就是一个信号：这场从 1981 年创办时定位为 PC 组件贸易展的活动，已经彻底转型为 **AI 基础设施论坛**。

展会的每一个重大芯片发布，都围绕 **Agentic AI 基础设施、物理机器人部署**以及支撑两者的计算平台展开。以下是三大核心发布和展会全景。

## Nvidia RTX Spark：首次进军 Windows PC 处理器市场

黄仁勋在 6 月 1 日台北音乐中心主题演讲中揭晓的 **RTX Spark**，是 Nvidia 首次为消费级 Windows 设备设计处理器。这是一颗**双芯粒系统级芯片**，台积电 3nm 工艺：

| 组件 | 规格 |
|------|------|
| GPU 芯粒 | Blackwell，6,144 CUDA 核心（等效 RTX 5070） |
| CPU 芯粒 | MediaTek 设计，20 颗 Arm 核心（10×Cortex-X925 + 10×Cortex-A725） |
| 互联 | NVLink C2C，600 GB/s 带宽 |
| 统一内存 | 最高 128 GB LPDDR5X，300 GB/s |
| AI 推理 | 1 PFLOPS（FP4 精度） |
| 本地 LLM | 可运行 1,200 亿参数模型 |

**架构核心设计是统一内存**：CPU 和 GPU 共享 128 GB 连续内存池，双方均可全带宽访问。对 Agentic 工作负载而言，这意味着 AI Agent 在语言模型推理、工具调用、代码执行之间快速切换时，无需像传统独立 GPU 系统那样在 PCIe 总线上来回拷贝数据。

一个现实限制：**Windows on Arm 无法模拟内核态驱动**，依赖内核级反作弊系统的竞技类游戏在 RTX Spark 设备上可能无法正常运行。ASUS、Dell、HP、Lenovo、Microsoft、MSI 的整机设备计划 2026 年秋季发货。

## Intel 18A 落地：Clearwater Forest 进入量产

英特尔在 Computex 上正式完成了历时三年的里程碑：**Xeon 6+ "Clearwater Forest"** 家族在 6 月 2 日发布，这是首款采用 Intel 18A 工艺的计算芯粒的量产数据中心 CPU。

**18A 工艺两大创新：**

- **RibbonFET**（环绕栅极晶体管）：栅极电极为硅通道四面环绕（FinFET 为三面），更优的静电控制降低了漏电和电压。相比 Intel 3，性能功耗比提升 15%。
- **PowerVia**（背面供电）：业界首个量产的背面供电方案。供电线路移至晶圆背面，正面完全留给信号布线。单元利用率提升 5–10%，等功率性能增益 4%。

Clearwater Forest 采用芯粒设计：计算芯粒含 **288 颗 Darkmont E 核心**（576 MB 末级缓存），支持 PCIe Gen 5、Intel SGX 和 TDX 机密计算。后续 Xeon 7 "Diamond Rapids"（2027）将采用升级版 18A-P 节点，加入高 NA EUV 光刻和第二代 RibbonFET。

## AMD：AM5 平台支持延续至 2029 年

AMD 此次没有发布旗舰处理器，而是带着一个**平台承诺**来到台北：**AM5 插槽将至少支持到 2029 年**，这意味着至少还有一代新微架构（预计 Zen 6）会沿用同一插槽。2022 年购买 AM5 主板的用户，可以升级到本十年末。

其他发布：
- **Ryzen 7 7700X3D**：8 核 + 3D V-Cache，$329，7 月 16 日上市
- **Ryzen 7 5800X3D**（AM4 十周年纪念版）：$349，6 月 25 日
- **EXPO Ultra Low Latency**：新的 DDR5 内存认证标准，更紧时序

## AI Robotics Zone：Compute 的物理化转向

本届 Computex 最结构性的议程变化，是**首次将台北世贸一馆整馆设为 AI Robotics Zone**，将具身 AI、机器人硬件和系统集成供应链整合在同一空间。这个时间节点对应着分析师正在量化的一个商业拐点：

> PwC Strategy& 2026 年 3 月研究报告：**全球 Physical AI 系统市场到 2030 年可达约 €4,300 亿**，其中汽车应用约 €1,710 亿，其次是工业自动化和仓储物流。

Physical AI 定义为能够自主控制真实世界设备和机器的系统——车辆、工业机器人、基础设施组件——而非纯粹的数字输出。

## InnoVEX：机器人基础模型的信号

同期举办的 InnoVEX 创业平台首次突破 **500 家初创企业**（来自 23 个国家/地区，同比增长 11%）。6 万美元奖金池的 Pitch Contest 大奖授予了 **RLWRLD**——一家开发 "Robotics Foundation Model" 的创业公司，本质上是在构建物理机器人系统的通用大模型。这个评选结果释放了一个清晰的信号：创新投资界认为 **Physical AI 最有价值的基础设施层就在这个方向**。

## 关键生态信号

- **边缘 AI 落地加速**：Innodisk 展示了五层边缘 AI 生态系统，MICROIP 成立了 "AI Vehicle System" 业务集团
- **服务器 ODM 业绩支撑**：鸿海、广达、纬颖等台系服务器 ODM 均报告了创纪录的 Q1 财务数据
- **Hyperscaler 订单加速**：Nvidia GB300 机架系统订单在下半年继续加速
- **Marvell 的 "万亿" 时刻**：黄仁勋在 Marvell CEO 演讲中途登台，称 Marvell 是 "下一家万亿美元公司"，Marvell 股价单日暴涨 32.5%

## 对采购决策的三个指引

Tech Times 文章的结尾给出了非常务实的三条建议：

1. **AM5 主板是安全的长期投资**——至少到 2029 年
2. **RTX Spark 笔记本将在 2026 年秋季上市**——购买前确认竞技类游戏的兼容性（内核态驱动限制）
3. **Intel 18A Clearwater Forest 可用**——通过主要服务器厂商，但 2026 年剩余时间仍为有限供货

Computex 2027 已定档 2027 年 6 月 1–4 日。

## 总结

Computex 2026 的 111,312 名与会者数字背后，是一个产业的自我确认：**Agentic AI 正在从创新展示走向真实部署**。Nvidia 进入 Windows PC 处理器市场、Intel 18A 首次出现在数据中心 CPU、AMD 承诺五年平台寿命——三家 CPU 巨头在同一周各自做出了十年级别的架构决定，而它们的方向完全一致：为 AI Agent 时代重新设计计算平台。

参考：
1. Adrian Parham. *Computex 2026 Sets 45-Year Attendance Record: Agentic AI Buildout*. Tech Times, 2026-06-06. https://www.techtimes.com/articles/317912/20260606/computex-2026-sets-45-year-attendance-record-agentic-ai-buildout-replaces-pc-hardware-show.htm
2. *COMPUTEX 2026 Concludes Successfully as Global Innovation Shapes a New AI Ecosystem*. PR Newswire, 2026-06-05. https://www.prnewswire.com/news-releases/computex-2026-concludes-successfully-as-global-innovation-shapes-a-new-ai-ecosystem-302792536.html
3. *Inside COMPUTEX 2026: How AI Together Drew a Record 110,000 Buyers*. StudioGlobal.ai, 2026-06-06. https://www.studioglobal.ai/discover/answers/what-were-the-key-highlights-themes-and-6a2481b8ba8f45c886993378
