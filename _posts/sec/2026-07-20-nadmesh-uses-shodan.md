---
layout: post
title: "NadMesh 借助 Shodan 定向收割暴露的 AI 和 MCP 基础设施"
categories: [sec]
description: "基于 XLab 原始分析与 CyberSecurityNews 报道，梳理 NadMesh 如何利用 Shodan 定向发现 ComfyUI、Ollama、n8n、Open WebUI、Langflow、Gradio 等暴露服务，并通过多向量利用、持久化和情报收割形成产品化僵尸网络。"
tags:
  - NadMesh
  - Shodan
  - AI安全
  - MCP
  - 僵尸网络
---

7 月中旬，XLab 披露了一套名为 NadMesh 的 Go 语言僵尸网络。它不是传统意义上“扫到就打”的粗放蠕虫，而是把 **情报收集、自动化扫描、漏洞利用、持久化和运营面板** 合并成一条闭环链路，明显朝着“产品化恶意平台”演进。

Cyber Security News 随后对这份分析做了转述，标题直接点出了它最有代表性的行为：**借助 Shodan 定向寻找并接管暴露的 AI 与 MCP 基础设施**。换句话说，NadMesh 不再只是盲扫互联网，而是先用外部情报把高价值目标筛出来，再把资源集中投向这些资产。

## 这次事件到底发生了什么

XLab 的分析显示，NadMesh 至少具备三层明显特征：

| 层面 | 具体表现 | 风险含义 |
|---|---|---|
| 情报层 | `ai_harvest.py` 通过 Shodan 查询暴露的 AI / 自动化服务 | 先筛目标，再扫目标，显著提高命中率 |
| 利用层 | 覆盖 20+ 漏洞利用向量，涉及 Redis、Docker、K8s、MCP、WebLogic 等 | 既能打云原生面，也能打 AI 工具链 |
| 运营层 | 具备控制面板、任务分发、转化统计、黑名单规避等能力 | 说明它不是临时样本，而是持续运营的攻击平台 |

XLab 文中点名了多个被优先收割的服务，包括 **ComfyUI、Ollama、n8n、Open WebUI、Langflow、Gradio**。这些组件在本质上都带有“暴露后易被直接滥用”的特点，一旦没有做好访问控制、身份认证和网络隔离，就会成为外部扫描的理想目标。

## 为什么它比普通僵尸网络更值得警惕

NadMesh 的可怕之处不只是“能感染”，而是它把感染这件事做成了一个流程化系统：

1. **先找值钱目标**：不是随机碰运气，而是借助 Shodan 定位 AI 服务和相关基础设施。
2. **再集中利用**：把发现的 IP 直接注入高优先级扫描队列。
3. **持续扩散**：感染后通过多种持久化方式维持驻留，包括 SSH 公钥后门、隐藏副本和 cron 看门狗。
4. **回收情报**：收集 AWS 凭证、Kubernetes ServiceAccount token、Docker 配置和本地 AI 模型访问痕迹。

这意味着攻击者真正关心的往往不是主机本身，而是主机上附着的 **云凭证、集群权限、AI 访问权和可再利用的内部工具**。

## 防守上该怎么看

如果你的环境里有暴露在公网的 AI 推理服务、MCP 工具或自动化平台，优先检查这几件事：

- 是否真的需要公网可访问；
- 是否有强制认证，而不是“知道端口就能用”；
- 是否限制了管理面和执行面；
- 是否把 Docker、Kubernetes、Redis、MCP 工具暴露到了不该暴露的网络边界；
- 是否对异常扫描、批量探测和高频失败访问做了检测与阻断。

更现实一点说，**AI 服务上云后，攻击面往往先于业务成熟**。很多团队先把模型和工具跑起来，却没有同步补上访问控制、审计、隔离和最小权限，NadMesh 这类样本就是在利用这种时间差。

## 结论

NadMesh 体现的是一种很明确的趋势：**恶意软件开始像产品一样运营，攻击开始像供应链一样组织**。它不是单纯追求“打进去”，而是把“发现高价值暴露面 → 自动利用 → 持久驻留 → 回收情报”做成了闭环。

对防守方来说，真正需要盯住的不是“有没有 AI 服务”这件事，而是 **AI 服务、MCP 工具和基础设施暴露后有没有被当成正式攻击面治理**。

## 参考资料

- [NadMesh Uses Shodan to Find and Hijack Exposed AI and MCP Infrastructure](https://cybersecuritynews.com/nadmesh-uses-shodan/) — Cyber Security News，2026-07-19
- [NadMesh僵尸网络分析：AI服务时代的产品级威胁](https://blog.xlab.qianxin.com/nadmesh-botnet-analysis-a-product-grade-threat-for-the-ai-service-era/) — XLab，2026-07-17
