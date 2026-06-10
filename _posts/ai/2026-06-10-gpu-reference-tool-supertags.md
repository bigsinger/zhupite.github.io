---
layout: post
categories: [ai]
title: "GPU 速查工具：2020 年以来的每张显卡都在这里"
tags: [GPU, AI 硬件, 工具推荐, SuperTags]
description: "介绍一个可筛选、标签化的 GPU 参考数据库——SuperTags GPU List，收录了2020年以来所有发布的GPU型号，支持按代际、显存、架构等多维度查询，帮你快速定位符合需求的显卡。"
---

## 发生了什么？

最近发现一个很有意思的工具——**SuperTags GPU List**，一个可筛选、标签化的 GPU 参考数据库，收录了 **2020 年以来所有发布的 GPU 型号**。

> 原文链接：[A filterable, tag-based GPU reference for every card released since 2020](https://www.supertags.app/ws/gpulist--g8qQfl)

## 这个工具解决了什么问题？

AI 硬件繁荣期，GPU 选型变成了一件高频需求。今天跑 Llama 要 24GB 显存，明天训 Diffusion 要 16GB，后天部署推理又要考虑性价比。

但市面上的 GPU 信息相当分散：

- 官方 Spec Sheet 只列当前在售型号
- Wikipedia 表格信息陈旧、缺少移动端和嵌入式 GPU
- 对比网站要么收费，要么全是广告

**SuperTags GPU List** 的做法很直接——把 2020 年以来所有 GPU 全家桶收录进来，然后用标签系统让你自由筛选。

## 核心功能

### 多维度筛选

支持按 GPU 代际（Gen）、规格参数（显存、架构、TDP）等维度查询。想找「16GB 以上显存、2023 年后的 NVIDIA 显卡」？几秒钟就能拉出列表。

### 标签化分类

每张卡都打了多维度标签，比如：

- `#NVIDIA` / `#AMD` / `#Intel` — 厂商
- `#Ada_Lovelace` / `#RDNA3` / `#Arc` — 架构代际
- `#Desktop` / `#Mobile` / `#Workstation` — 形态
- `#16GB+` / `#DLSS3` / `#AV1` — 特性标签

### 参照对比

没有花哨的跑分排行榜，而是**平铺出所有关键参数**，方便你根据自己的需求逐一对比。显存、核心数、带宽、TDP，一目了然。

## 为什么值得关注？

这个工具背后反映了一个趋势：**GPU 信息透明化**。

过去两年，GPU 从游戏玩家的专属标签，变成了 AI 从业者、内容创作者、开发者都需要的通用计算资源。需求暴涨，但信息获取方式还停留在「查官网 → 翻评测 → 算性价比」这种低效链路。

像 SuperTags GPU List 这种工具的出现，说明市场正在自发性地填补这个信息缺口。它并不 fancy，也不追求大而全，但**恰恰满足了最痛的那个需求**——快速找到一张符合你显存、预算、形态要求的卡。

## 适合谁用

如果你是以下角色之一，这个工具值得收进书签：

- **AI 推理部署**：需要对比不同 GPU 的显存和带宽，确定模型部署方案
- **模型训练**：评估哪张卡在预算范围内性价比最高
- **装机攒机**：想全面了解当下 GPU 格局后再做决策
- **技术研究**：追踪 GPU 代际演进和架构变化

## 参考资料

- **SuperTags GPU List**：A filterable, tag-based GPU reference for every card released since 2020.
  → https://www.supertags.app/ws/gpulist--g8qQfl
