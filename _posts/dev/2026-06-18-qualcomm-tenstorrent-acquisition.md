---
layout: post
title: "高通据称洽购 Tenstorrent：100 亿美元买下 Jim Keller 的 RISC-V AI 赌注"
categories: [dev]
description: "路透社报道高通正在洽谈以高达 100 亿美元收购 AI 芯片初创公司 Tenstorrent。后者由传奇芯片架构师 Jim Keller 领导，以开源 RISC-V AI 芯片设计闻名。如果收购成功，将是 AI 芯片领域最大并购案之一，也标志着高通正式向 NVIDIA 的 AI 芯片霸主地位发起挑战。"
tags:
  - 高通
  - Tenstorrent
  - Jim Keller
  - RISC-V
  - AI芯片
  - 收购
  - 半导体
---

路透社报道，高通（Qualcomm）正在洽谈收购 AI 芯片初创公司 **Tenstorrent**，交易金额可能高达 **100 亿美元**。

如果这笔交易完成，它将是 AI 芯片领域最大的并购案之一。而且这个故事有两个引人入胜的层面：交易的战略意义，以及 Tenstorrent 本身的技术分量。

---

## Tenstorrent 是谁

Tenstorrent 是一家总部位于加拿大多伦多、硅谷圣克拉拉的 AI 芯片公司。它有几位非常亮眼的标签：

**传奇 CEO：Jim Keller**

Tenstorrent 的 CEO 是 **Jim Keller**——半导体行业少有的"全明星"架构师。他的履历里写满了芯片史上的关键节点：

- **DEC Alpha**——当时最快的处理器
- **AMD K7/K8/K12**——让 AMD 在 x86 市场与 Intel 抗衡
- **AMD Zen 架构**——AMD 翻身的关键，至今仍在迭代
- **Apple A4/A5**——iPhone 走向自研芯片的起点
- **Tesla 自动驾驶芯片**——自研硬件的典范
- **Intel Silicon Engineering SVP**——短暂停留两年

Jim Keller 的职业生涯基本上就是一本"半导体芯片设计简史"。他选择了 Tenstorrent 作为他的最新一站，这本身就是对这个方向的背书。

**核心架构：Tensix + RISC-V**

Tenstorrent 的核心 IP 是 **Tensix** 处理器——一个专为 AI 工作负载设计的处理单元。但它与 NVIDIA 的 GPU 路线的关键区别在于：

| | NVIDIA GPU | Tenstorrent Tensix |
|------|-----------|-------------------|
| **指令集** | 私有（CUDA） | **开源 RISC-V** |
| **生态策略** | 封闭、垂直集成 | **开源**（Buda 编译器、软件栈） |
| **架构** | 大规模 SIMT | 异构 Chiplet 架构 |
| **灵活性** | 以 NVIDIA 路线为准 | 客户可定制、可 Fork |

**开源策略**是 Tenstorrent 最关键的差异化。他们的口号是 "Build an Open Future"——IP 透明、架构开放、软件栈全部开源。这在被 NVIDIA CUDA 生态主导的 AI 芯片市场中是一个非常大胆的定位。

---

## 战略意义：高通为什么要花 100 亿

高通的收购动机可以从几个层面理解：

**1. 数据中心 AI 芯片——高通缺失的拼图**

高通的 AI 能力主要集中在**端侧**——骁龙芯片的 AI Engine 在手机、汽车、IoT 领域有深厚积累。但高通在**数据中心 AI 芯片**领域几乎是空白。

收购 Tenstorrent 能让高通一夜之间拥有一支由 Jim Keller 领导的、能做 AI 训练和推理芯片的团队，以及 Tensix + RISC-V 的技术栈。

**2. RISC-V 生态的战略卡位**

ARM 架构授权的不确定性让整个行业都在寻找替代品。RISC-V 是一个明确的方向。高通本身已经是 RISC-V 生态的重要参与者，收购 Tenstorrent 可以进一步巩固其在 RISC-V AI 芯片领域的领导地位。

**3. 挑战 NVIDIA 的 CUDA 护城河**

Tenstorrent 的开源策略直接针对 NVIDIA 最坚固的壁垒——CUDA 生态。如果 Tenstorrent 的 RISC-V + 开源编译器路线能够孵化出一个真正可用的 CUDA 替代方案，对 NVIDIA 的威胁将远大于任何一款"更好的 GPU"。

---

## 100 亿美元贵不贵

Tenstorrent 上一轮融资（2024 年末/2025 年初）的估值约为 **20-30 亿美元**。100 亿美元的报价意味着约 **3-5 倍溢价**，考虑到 Jim Keller 的品牌价值和 RISC-V AI 芯片的战略稀缺性，这并不离谱。

作为对比：
- NVIDIA 收购 Mellanox：**69 亿美元**
- AMD 收购 Xilinx：**350 亿美元**
- Intel 收购 Altera：**167 亿美元**
- 高通收购 NXP（被否）：**440 亿美元**

100 亿美元在半导体并购中属于"中型偏大"的交易。考虑到 AI 芯片市场的增长空间——如果 Tenstorrent 的技术路线被证明是正确的，这个价格可能被证明是便宜的。

---

## 几点观察

**1. "Jim Keller 溢价"**

半导体行业对 Jim Keller 有近乎宗教般的信任。他参与的每一个芯片项目（除了 Intel，那是另一个故事）最终都取得了巨大的商业成功。这笔交易的估值中，相当一部分是对"Jim Keller 能再做一次"的赌注。

**2. 开源 RISC-V 在 AI 芯片中的位置**

Tenstorrent 被收购的传闻如果是真的，那对开源 RISC-V AI 芯片来说是一个巨大的信号——**就连高通这样的大玩家也认为开源芯片设计是可行的路径**。这可能会加速 RISC-V 在 AI 领域的采用。

**3. 端侧 AI + 数据中心 AI 的汇合**

高通的端侧 AI + Tenstorrent 的数据中心 AI 组合，意味着高通可能成为少数几家同时覆盖端侧和数据中心 AI 芯片的厂商（目前只有 NVIDIA 和 Intel 能做到）。

---

**参考资料**

- 路透社报道（2026 年 6 月）
- Tenstorrent 官方网站：https://tenstorrent.com
- Tenstorrent 领导团队信息
- 注：路透社原文当前访问受限，以上基于公开信息整理
