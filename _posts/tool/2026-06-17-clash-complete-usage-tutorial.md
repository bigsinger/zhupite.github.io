---
layout: post
title: "Clash 完全使用教程：从安装配置到自建机场，覆盖 Windows 和移动设备"
categories: [tool]
description: "Clash 是目前最流行的开源代理客户端生态。本文以 Clash Verge Rev v2.5.1 / FlClash v0.8.93 / Mihomo v1.19 最新版本为基准，涵盖安装、订阅配置、节点管理、规则设置、TUN 模式，以及如何选择机场数据源和物美价廉的自建方案。"
tags:
  - Clash
  - Clash Verge Rev
  - FlClash
  - 代理
  - 教程
  - 自建机场
  - VPS
---

Clash 是目前最流行的开源代理客户端生态——从桌面到移动端，从初级用户到高级玩家，都有对应的方案。但 Clash 的发展历程有点绕：原版 Clash（Dreamacro/clash）已于 2023 年停止维护并删除仓库，社区在此基础上衍生出了多个分支。

**如果你现在想用 Clash，最推荐的方案是：**

- **桌面端** → **Clash Verge Rev v2.5.1**（Windows / macOS / Linux，基于 Mihomo v1.19 内核）
- **移动端** → **FlClash v0.8.93**（Android / Windows / macOS / Linux，Flutter 跨平台）

本文以最新版本为主线，从零开始教你上手。并且重点覆盖了**机场数据源**和**自建机场**的内容——因为 Clash 本身只是一个客户端，没有节点数据是没法用的。

---

## 一、Clash 是什么

### 核心概念

Clash 本质上是一个**基于规则的代理转发引擎**。你给它配置一组代理节点和一套路由规则，它根据目标地址（域名/IP）自动决定走哪个节点——是直连、走代理、还是拦截。

它的核心工作流程：

```
你的请求 → Clash 检查规则 → 匹配到规则 → 走对应出口（节点1 / 节点2 / 直连 / 拦截）
```

### 生态构成

| 组件 | 作用 | 代表项目（最新版本） |
|------|------|-------------------|
| **内核** | 底层的代理转发引擎 | Mihomo v1.19（原 Clash Meta） |
| **桌面客户端** | 带 GUI 的 Clash 封装 | Clash Verge Rev v2.5.1（⭐126k） |
| **移动客户端** | Android/iOS 上的 Clash | FlClash v0.8.93（⭐42k） |
| **规则集** | 预定义的域名/IP 分流规则 | Loyalsoldier/clash-rules（⭐27k） |

### Clash Verge Rev v2.5.1 简介

[Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev) 是当前最活跃的桌面客户端，基于 Rust + Tauri 2 框架构建，v2.5.1（2026-05 发布）：

- 内置 **Mihomo v1.19** 内核（原 Clash Meta），支持一键切换 Alpha 版内核
- **新版 UI 布局**：左侧导航栏，依次为「代理」「日志」「设置」「订阅」「连接」「工具」
- 支持**可视化节点编辑**：在代理页面右键节点即可修改服务器地址、端口、协议等
- 配置文件管理和增强：Merge 和 Script 模式，YAML 语法提示
- **TUN 堆栈升级**：v2.4+ 重构了 TUN 模式，兼容性大幅提升
- WebDAV / 本地文件 / 云端多途径配置备份
- 支持**自定义 CSS 注入**和主题颜色完全自定义
- 全新的**连接管理页面**：可实时查看每个活跃连接的目标、节点、流量

### FlClash v0.8.93 简介

[FlClash](https://github.com/chen08209/FlClash) 是基于 Flutter 的跨平台代理客户端，一套代码覆盖 Windows、macOS、Linux 和 Android：

- Material You 设计风格，自适应屏幕尺寸（手机/平板/桌面）
- **新版底部导航栏**：配置、代理、日志、设置四页
- 支持**分应用代理**：Android 上可指定哪些 App 走代理、哪些直连
- 内置**延迟测试和速度测试**
- 支持**订阅转换**：兼容 Surge / Quantumult X / Sing-box 等多种格式
- 支持 WebDAV 数据同步
- 开源无广告，F-Droid / GitHub 均可下载

---

## 二、Windows 上如何使用（Clash Verge Rev）

### 2.1 下载安装

打开 [Clash Verge Rev Releases 页面](https://github.com/clash-verge-rev/clash-verge-rev/releases)，找到最新稳定版（v2.5.1），下载对应系统的安装包：

| 系统架构 | 下载文件 |
|---------|---------|
| Windows x64 | `Clash.Verge_2.5.1_x64-setup.exe` |
| Windows arm64 | `Clash.Verge_2.5.1_arm64-setup.exe` |
| macOS Intel | `Clash.Verge_2.5.1_x64.dmg` |
| macOS Apple Silicon | `Clash.Verge_2.5.1_aarch64.dmg` |
| Linux deb | `clash-verge_2.5.1_amd64.deb` |

**注意：** 99% 的「此应用无法在你的电脑上运行」问题是下载错了架构。Windows 笔记本基本选 x64，Mac 检查是 Intel 还是 Apple Silicon。

### 2.2 首次启动

安装后启动 Clash Verge Rev，系统托盘出现 Clash 图标。首次启动会自动生成默认配置文件（包含 Mihomo 内核和一套基础 GeoIP/GeoSite 规则），内核立即运行。

**依赖说明：** Clash Verge Rev 基于 Tauri 2 框架，依赖 WebView2。Windows 10/11 通常自带。如果遇到「无法显示界面/闪退/只有托盘图标」——这 99% 是 WebView2 缺失或损坏，请手动安装 Microsoft [WebView2 Runtime](https://developer.microsoft.com/zh-cn/microsoft-edge/webview2/)。

如果仍然无法打开面板，尝试在**设置 → 调试 → fixed_webview2** 选项中修复。

### 2.3 导入订阅节点（最常用方式）

这是最常用的方式。你需要先有一个代理服务商提供的订阅链接（如何获取见「第四章：机场数据源」）。

**操作步骤（Clash Verge Rev v2.5.x）：**

1. 右键托盘图标 →「打开面板」
2. 左侧导航栏点击**「订阅」**
3. 点击**「添加」**按钮，输入订阅 URL
4. 设置名称（建议写机场名称）和更新间隔（推荐 24 小时）
5. 点击**「导入」**——Clash 自动下载节点列表并解析
6. 左侧切换到**「代理」**页面，即可看到所有可用节点和策略组

**注意：** 如果你的订阅 URL 返回的是 Clash 格式（YAML），导入即用；如果是 Base64/Surge 等其他格式，Clash Verge Rev v2.5.x 会自动转换，无需额外工具。

### 2.4 选择代理模式和节点

#### 三种代理模式

在 Clash Verge Rev 的「设置 → 模式」中切换：

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| **Rule（规则）** | 按配置文件中的规则自动分流 | **✅ 日常使用，最推荐** |
| **Global（全局）** | 所有流量走同一个代理节点 | 需要固定出口 IP 时 |
| **Direct（直连）** | 所有流量不经过代理 | 仅测速对比 |

**日常用 Rule 模式**——国内网站直连，国外网站走代理，互不影响。

#### 代理组选择

在「代理」页面，你会看到多个代理组（Proxy Groups）。常见的是：

- **🚀 Proxy**：手动选一个最快的节点
- **🎯 全球直连**：国内网站直连（无需操作）
- **🐟 漏网之鱼**：未匹配规则的兜底出口
- **📲 电报消息**：Telegram 专用策略组

v2.5.x 新增了**按地区筛选**功能，代理页面顶部可以按「香港」「日本」「美国」等地区过滤节点。右键节点可以**单独测速**或**编辑节点信息**。

### 2.5 启用 TUN 模式

TUN 模式是 Clash 的**虚拟网卡模式**——所有流量经此通过，包括不支持系统代理的程序。

**开启方法**：设置 → TUN → 开启 TUN 模式。

**v2.4+ 的优势**：重构后的 TUN 堆栈兼容性大幅提升，大部分环境下无需额外配置。

**适用场景**：
- 游戏代理（LOL、Steam 等）
- UWP 应用（微软商店）
- 划词翻译、截图工具等不遵守系统代理的软件

**注意**：开启后网络异常？检查是否有多个虚拟网卡冲突，或在 TUN 设置中排除局域网网段。

### 2.6 开机自启 & 静默启动

设置 → 常规 → 开启「开机自启」。

如果你只希望开机后台运行（不弹窗口），同时开启「静默启动」。v2.5.x 的静默启动表现稳定，不会出现旧版「每次开机都弹窗」的问题。

---

## 三、移动设备上如何使用

### 3.1 Android：FlClash v0.8.93

[FlClash](https://github.com/chen08209/FlClash) 是 Android 上最推荐的 Clash 客户端，开源无广告。

**安装：**

1. [Releases 页面](https://github.com/chen08209/FlClash/releases) 下载最新 APK
2. 也可通过 F-Droid 安装：[FlClash F-Droid 仓库](https://chen08209.github.io/FlClash-fdroid-repo/)

**配置使用（v0.8.x 新版 UI）：**

1. 打开 FlClash，底部导航栏进入**「配置」**
2. 右上角「+」→ 选择「从 URL 导入」
3. 粘贴订阅链接，命名后保存
4. 底部切换到**「代理」** → 选择一个节点
5. 返回首页，点击顶部开关启动
6. 首次启动会弹出 VPN 权限请求——必须允许，因为 Android 上通过 VpnService 实现代理

**特色功能（v0.8.x）：**

- **分应用代理**：设置中可指定哪些 App 走代理、哪些直连（类似 Surge 的 by-pass）
- **一键测速**：代理页面顶部工具栏可一键测速全部节点
- **订阅自动更新**：支持后台定时更新
- **DNS 防污染**：内置 DNS 配置，开箱即用

### 3.2 iOS：替代方案

由于 Apple 的限制，iOS 上无法直接运行 Clash 内核。推荐以下付费 App：

| App | 价格 | 特点 |
|-----|------|------|
| **Stash** | ¥28 | Clash 规则兼容，界面最接近 Clash Verge |
| **Surge** | ¥518 | 最强大，支持网关/代理/规则/脚本 |
| **Quantumult X** | ¥48 | 功能丰富，配置灵活 |
| **Shadowrocket** | ¥22 | 简单易用，适合新手 |

这四个 App 都支持导入 Clash 格式的订阅链接和规则集，迁移成本很低。

---

## 四、机场数据源

Clash 只是一个客户端，**你需要一个代理服务商（俗称「机场」）提供的订阅链接才能使用**。这一章教你如何选择机场、避坑、以及物美价廉的推荐。

### 4.1 机场是什么

「机场」是代理服务商的通俗叫法。它们租用海外服务器搭建代理节点，然后将节点信息打包成**订阅链接**出售。你把这个链接导入 Clash，就能一键获取所有节点。

**一条订阅链接里包含什么：**

```
https://xxx.com/api/v1/client/subscribe?token=xxxxxxxxxxxx
```

Clash 导入后自动解析出节点列表——每个节点包含：服务器地址、端口、加密协议、密码等。

### 4.2 免费 vs 付费

| | 免费节点/订阅 | 付费机场 |
|--|-------------|---------|
| **稳定性** | ❌ 经常失效 | ✅ 稳定长期 |
| **速度** | ❌ 多人抢带宽 | ✅ 专属带宽 |
| **安全性** | ⚠️ 来源不明，可能窃取流量 | ✅ 有售后、可查评价 |
| **流媒体解锁** | ❌ 基本不支持 | ✅ 支持 Netflix/ChatGPT 等 |
| **价格** | 0 | ¥10-30/月 |

**结论**：免费节点适合临时应急体验，**日常用还是付费机场靠谱**。一个月十几块钱少吃顿外卖，换来稳定网络体验。

### 4.3 如何找到靠谱的机场

**推荐找渠道（按安全度排序）：**

1. **朋友推荐**：最靠谱的方式，真实使用体验
2. **VPS 商家的推荐**：如 HostHare、RackNerd 等卖家的推荐合作伙伴
3. **Telegram 频道**：搜索「机场推荐」「代理频道」——但要警惕假冒和跑路风险
4. **GitHub 收录列表**：搜索 `clash-subscription`、`proxy-list` 等关键词

**需要避坑的信号：**

| 危险信号 | 说明 |
|---------|------|
| **价格过低** | 5块钱月付无限流量？基本是骗局或超售严重 |
| **无官网/TG** | 只有一个 Telegram 频道，跑路风险极高 |
| **不提供试用** | 付费机场通常提供 1-3 天试用 |
| **没有售后群** | 出问题找不到人 |
| **实名要求** | 买代理要实名？直接跑 |

### 4.4 选择机场的维度

| 维度 | 说明 | 建议值 |
|------|------|-------|
| **延迟** | 节点 ping 值 | < 100ms 优秀，< 200ms 可用 |
| **带宽** | 最大下载速度 | 至少 100Mbps 以上 |
| **流量** | 每月可用流量 | 轻度使用 100GB/月，重度 500GB+ |
| **设备数** | 同时在线设备 | 至少 3-5 个 |
| **协议** | 支持的代理协议 | 至少支持 VMess + Trojan + Hysteria2 |
| **流媒体** | Netflix/ChatGPT/Twitter 解锁 | 确认你需要的服务可解锁 |
| **审计** | 是否记录日志 | 选\"无日志\"政策 |
| **退款** | 不满意能否退款 | 7天无理由是加分项 |
| **线路** | 中转/直连/IPLC/IEPL | 中转够用，IPLC/IEPL 更稳但贵 |

### 4.5 价格参考

| 档次 | 月付 | 年付 | 适用人群 |
|------|------|------|---------|
| 入门 | ¥10-20/月 | ¥100-200/年 | 偶尔翻墙、浏览网页 |
| 主流 | ¥20-40/月 | ¥200-400/年 | 日常使用、看视频、ChatGPT |
| 高端 | ¥50-100+/月 | ¥500-1000+/年 | 流媒体 4K、低延迟游戏、多设备 |
| 自建（下一章） | VPS ¥3-20/月 | VPS ¥30-200/年 | 技术能力足够，追求独立控制 |

---

## 五、如何自建机场（物美价廉方案）

如果你有一定的动手能力（会 SSH 连接服务器、会执行命令），**自建代理是最划算、最可控的方案**。

### 5.1 方案优劣分析

| | 自建 | 机场 |
|--|------|------|
| **价格** | ¥30-200/年 | ¥200-1000+/年 |
| **控制权** | 完全独立 | 依赖服务商 |
| **隐私** | 自己的服务器，无日志 | 取决于供应商政策 |
| **速度** | 单用户独享带宽 | 多人共享 |
| **流媒体解锁** | 取决于 IP 质量 | 通常有优化 |
| **维护** | 需要自己维护 | 零维护 |
| **多节点** | 一般单节点 | 十几个节点随意选 |

**结论**：自建适合**追求性价比和隐私**的用户。一个 ¥50/年的 VPS 足够一个人日常使用。

### 5.2 选择便宜的 VPS

以下是目前性价比最高的入门方案：

| 商家 | 月付 | 年付 | 配置 | 线路特点 |
|------|------|------|------|---------|
| **HostHare** | $2.5/月 | $35/年 | 1C/512M/10G | 香港/日本，CN2 GIA 优化 |
| **RackNerd** | $1.5/月 | $18/年 | 1C/1G/20G | 美国多机房，性价比高 |
| **BuyVM** | $3.5/月 | $42/年 | 1C/1G/20G | 卢森堡/拉斯维加斯，不限流量 |
| **BandwagonH** | $2.99/月 | $36/年 | 1C/512M/10G | CN2 GIA 经典 |
| **V.PS** | €3/月 | €35/年 | 1C/512M/15G | 日本/香港，CN2 优化 |
| **Cloudcone** | $2.5/月 | $25/年 | 1C/512M/15G | 美国，高性价比 |

**新手入门推荐**：**RackNerd** $18/年方案，便宜、稳定、控制面板好用。用于学习自建足够了。

**进阶选择**：**HostHare** 香港/日本节点，线路好延迟低，预算充足首选。

**购买提示**：VPS 商家一般在 Black Friday（黑五）、New Year 有大促，年付价格可低至 $12-15。不急的话等促销。

### 5.3 快速搭建方案一：3x-ui 面板（最推荐新手）

[3x-ui](https://github.com/MHSanaei/3x-ui)（⭐40k）是一个 Xray 面板，带 Web 管理界面，支持多协议、多用户、流量统计，**一键安装**。

**前置条件**：
- 一台 Linux VPS（Ubuntu 22/24 或 Debian 11/12）
- SSH 客户端（Windows 上推荐 Termius 或直接用 PowerShell）

**一键安装：**

```bash
bash <(curl -Ls https://raw.githubusercontent.com/mhsanaei/3x-ui/master/install.sh)
```

运行后：
1. 脚本自动安装 Xray 核心和管理面板
2. 输出面板地址、用户名、密码（保存好！）
3. 浏览器打开 `http://你的VPSIP:端口` → 登录管理面板

**在面板中创建节点：**

1. 进入「入站列表」→「添加入站」
2. 配置参数：

| 字段 | 推荐值 |
|------|--------|
| 协议 | `VLESS + Reality`（最新最稳）或 `VMess + WebSocket + TLS` |
| 端口 | 443 或 8443 等高位端口 |
| 域名 | 如果没有自己的域名，用 **Reality** 免域名 |
| 流量 | 根据套餐设置 |

3. 创建后，点击「操作」→「复制订阅链接」
4. 将链接导入 Clash Verge Rev

**补充协议推荐（Reality + Hysteria2 双节点）：**

在 3x-ui 中建议创建两个入站：

| 节点 | 协议 | 用途 |
|------|------|------|
| 主节点 | VLESS + Reality + uTLS | 日常浏览、网页访问 |
| 备用节点 | Hysteria2 | 视频流媒体、大流量场景（Hysteria2 基于 QUIC，丢包环境下速度优势明显） |

### 5.4 快速搭建方案二：sing-box 一键脚本（更轻量）

如果你不喜欢 Web 面板，想更轻量简洁：

```bash
bash <(curl -Ls https://raw.githubusercontent.com/Ptechgithub/sing-box/main/install.sh)
```

这个脚本支持 VLESS+Reality、Hysteria2、TUIC5 等多协议，运行后按提示选择即可。

### 5.5 配置 Clash 连接自建节点

方案一生成订阅链接后直接导入 Clash 的「订阅」页面即可。

如果不想用订阅，也可以手动编辑配置文件：

```yaml
proxies:
  - name: "我的自建 Reality"
    type: vless
    server: 你的VPS_IP
    port: 443
    uuid: "你的uuid"
    flow: xtls-rprx-vision
    tls: true
    servername: www.microsoft.com
    reality-opts:
      public-key: "你的public-key"
      short-id: ""
    udp: true
    packet-addr: true
    client-fingerprint: chrome

  - name: "我的自建 Hysteria2"
    type: hysteria2
    server: 你的VPS_IP
    port: 8443
    password: "你的密码"
    sni: www.bing.com
    skip-cert-verify: true
```

**配置后先去「代理」页面测速**，确认延迟正常再切到 Rule 模式使用。

### 5.6 进阶优化

**BBR 加速**：在 VPS 上开启 BBR（Google 的拥塞控制算法），能显著提升速度：

```bash
bash <(curl -Ls https://raw.githubusercontent.com/teddysun/across/master/bbr.sh)
```

**TLS 证书**：如果你有自己的域名，强烈建议配置 TLS 证书（使用 acme.sh + Let's Encrypt 免费）。相比 Reality 的伪装，独立域名+证书的稳定性更高。

**防火墙配置**：仅开放必要的端口（SSH 和代理端口），关闭其他端口。使用 `ufw` 即可：

```bash
ufw allow 22/tcp      # SSH
ufw allow 443/tcp     # 代理主端口
ufw enable
```

**监控**：3x-ui 面板内置流量统计、在线设备监控。定期检查有无异常连接。

---

## 六、配置文件详解

Clash 的配置核心是 **YAML 格式**。了解基本结构有助于排查问题和自定义。

### 核心字段

| 字段 | 说明 | 必填 |
|------|------|------|
| `port` | HTTP 代理监听端口 | ✅ |
| `socks-port` | SOCKS5 代理端口 | ❌ |
| `mixed-port` | HTTP+SOCKS5 混合端口 | ❌ |
| `allow-lan` | 是否允许局域网设备连接 | ❌ |
| `mode` | 模式：rule/global/direct | ❌ |
| `log-level` | 日志级别 | ❌ |
| `proxies` | 代理节点列表 | ✅ |
| `proxy-groups` | 代理策略组 | ✅ |
| `rules` | 路由规则 | ✅ |
| `rule-providers` | 外部规则集引用 | ❌ |
| `dns` | DNS 配置 | ❌ |
| `tun` | TUN 模式配置 | ❌ |

### 规则语法

```
规则类型,匹配值,目标策略组
```

常见规则类型：

| 规则类型 | 示例 | 说明 |
|---------|------|------|
| `DOMAIN-SUFFIX` | `DOMAIN-SUFFIX,google.com,Proxy` | 匹配域名后缀 |
| `DOMAIN-KEYWORD` | `DOMAIN-KEYWORD,google,Proxy` | 匹配域名关键词 |
| `DOMAIN` | `DOMAIN,example.com,Proxy` | 精确匹配域名 |
| `IP-CIDR` | `IP-CIDR,10.0.0.0/8,DIRECT` | 匹配 IP 段 |
| `SRC-IP-CIDR` | `SRC-IP-CIDR,192.168.1.0/24,DIRECT` | 匹配来源 IP |
| `DST-PORT` | `DST-PORT,80,DIRECT` | 匹配目标端口 |
| `GEOIP` | `GEOIP,CN,DIRECT` | 匹配 IP 地理位置 |
| `MATCH` | `MATCH,Proxy` | 兜底规则（放最后） |

---

## 七、注意事项

### 7.1 安全问题

- **不要使用来源不明的订阅**：你的所有流量经过代理节点，不可信的节点可以截取你的数据
- **优先使用支持 TLS/加密的协议**：VLESS+Reality、VMess+TLS、Trojan 等
- **不要用公共/免费节点登录重要账号**：银行、支付、社交账号等
- **自建场景**：开启防火墙、及时更新系统、使用密钥登录 SSH（禁用密码登录）

### 7.2 常见问题

**Q：Clash 启动后无法上网？**

A：最常见的三个原因：
- 系统代理未正确关闭 → 排查路径：Windows 设置 → 网络 → 代理 → 确认关闭
- 端口被占用 → 修改 `port` / `mixed-port` 为其他值
- TUN 模式下网卡冲突 → 打开 Windows 防火墙设置，全部关闭再开启

**Q：不打开 Clash 就无法上网？**

A：这是系统代理未能正确关闭。Windows 设置 → 网络 → 代理 → 关闭「使用代理服务器」。如果在 Clash 设置中关闭系统代理再重新打开。

**Q：UWP 应用（如微软商店）无法使用代理？**

A：开启 TUN 模式即可解决。

**Q：测速很快但实际打开网页很慢？**

A：可能原因：
- 节点带宽不足（机场超售）
- DNS 污染（配置 DNS 防污染）
- 规则配置问题（请求走了错误的节点）

**Q：自建的节点测速很快但无法访问某些网站？**

A：检查 VPS 是否被特定网站封锁；尝试换协议（如从 Reality 换到 Hysteria2）；检查 DNS 配置。

### 7.3 保护隐私的小建议

- 自建节点：用 SSH 密钥登录，关闭密码认证
- 机场订阅：不要分享你的订阅链接给不信任的人
- Clash 连接页面：随时可以查看哪些应用在走代理

---

## 八、实用技巧

### 8.1 使用优秀的规则集

不需要自己写规则，直接使用社区维护的规则集：

- [Loyalsoldier/clash-rules](https://github.com/Loyalsoldier/clash-rules)（⭐27k）— Clash Premium 规则集
- 在配置中通过 `rule-providers` 引用即可自动更新

```yaml
rule-providers:
  reject:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt"
    path: ./ruleset/reject.yaml
    interval: 86400
```

### 8.2 配置备份

Clash Verge Rev 支持 WebDAV 同步——将配置备份到自己的 NAS 或云盘，换设备时一键恢复。设置 → WebDAV → 配置服务器地址、用户名、密码即可。

### 8.3 节点测速

Clash Verge Rev 内置了节点延迟测试功能。在「代理」页面点击右上角的测速按钮，会自动测试所有节点的延迟。

**注意**：延迟低不等于速度快。延迟是握手时间，速度取决于带宽和丢包率。建议配合实际使用体验判断。

### 8.4 自定义主题

Clash Verge Rev 支持：
- 自定义主题颜色（「设置 → 主题」）
- 自定义代理组/托盘图标
- CSS Injection（自定义全界面样式）
- 暗色/亮色模式

### 8.5 局域网共享

开启 `allow-lan: true` 后，同一局域网下的其他设备可以将 Clash 作为代理网关：

```
代理地址：192.168.x.x（Clash 所在设备的 IP）
代理端口：7890（或你配置的 mixed-port）
```

手机 Wi-Fi 设置中配置 HTTP 代理即可共享。

### 8.6 区分系统代理和 TUN 模式

| | 系统代理 | TUN 模式 |
|--|---------|---------|
| **原理** | 设置系统的 HTTP/SOCKS 代理 | 创建虚拟网卡接管全部流量 |
| **适用范围** | 只支持 HTTP/HTTPS/SOCKS 的应用 | 所有应用（含 TCP/UDP） |
| **优点** | 轻量，资源占用小 | 全覆盖，无死角 |
| **缺点** | 部分应用不支持或不遵守系统代理 | 资源占用稍高，少数环境有兼容问题 |

**建议**：日常使用系统代理就够了，遇到游戏/UWP 应用/不支持代理的软件时开启 TUN 模式。

---

## 九、项目链接

| 项目 | GitHub / 链接 | 说明 |
|------|--------------|------|
| Clash Verge Rev | [clash-verge-rev/clash-verge-rev](https://github.com/clash-verge-rev/clash-verge-rev) | 桌面 GUI 客户端（⭐126k） |
| FlClash | [chen08209/FlClash](https://github.com/chen08209/FlClash) | 跨平台客户端（⭐42k） |
| Mihomo | [MetaCubeX/mihomo](https://github.com/MetaCubeX/mihomo) | Clash 内核（原 Clash Meta） |
| Clash Rules | [Loyalsoldier/clash-rules](https://github.com/Loyalsoldier/clash-rules) | Premium 规则集（⭐27k） |
| 3x-ui | [MHSanaei/3x-ui](https://github.com/MHSanaei/3x-ui) | Xray 管理面板（⭐40k） |
| Sing-box 脚本 | [Ptechgithub/sing-box](https://github.com/Ptechgithub/sing-box) | 一键安装脚本 |
| Clash Verge Rev 文档 | [clash-verge-rev.github.io](https://clash-verge-rev.github.io/) | 官方文档 |
| FlClash 文档 | [chen08209.github.io/FlClash](https://chen08209.github.io/FlClash) | 官方文档 |

**许可证**：Clash Verge Rev（GPL-3.0），FlClash（GPL-3.0），3x-ui（GPL-3.0），均为开源免费软件。

---

> **免责声明**：本文仅作为 Clash 软件的使用教程。请遵守所在国家/地区的法律法规，合理合法使用互联网服务。自建代理仅用于学习技术目的。
