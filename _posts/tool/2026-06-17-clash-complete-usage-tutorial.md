---
layout: post
title: "Clash 完全使用教程：从安装配置到日常使用，覆盖 Windows 和移动设备"
categories: [tool]
description: "Clash 是目前最流行的开源代理客户端生态。本文从零开始教你上手 Clash Verge Rev（Windows/macOS/Linux）和 FlClash（Android），涵盖安装、订阅配置、节点管理、规则设置、TUN 模式、常见问题与技巧。"
tags:
  - Clash
  - Clash Verge Rev
  - FlClash
  - 代理
  - 教程
---

Clash 是目前最流行的开源代理客户端生态——从桌面到移动端，从初级用户到高级玩家，都有对应的方案。但 Clash 的发展历程有点绕：原版 Clash（Dreamacro/clash）已于 2023 年停止维护并删除仓库，社区在此基础上衍生出了多个分支。

**如果你现在想用 Clash，最推荐的方案是：**

- **桌面端** → **Clash Verge Rev**（Windows / macOS / Linux，基于 Clash Meta 内核）
- **移动端** → **FlClash**（Android / iOS，Flutter 跨平台）

本文以这两个项目为主线，从零开始教你上手。

---

## 一、Clash 是什么

### 核心概念

Clash 本质上是一个**基于规则的代理转发引擎**。你给它配置一组代理节点和一套路由规则，它根据目标地址（域名/IP）自动决定走哪个节点——是直连、走代理、还是拦截。

它的核心工作流程：

```
你的请求 → Clash 检查规则 → 匹配到规则 → 走对应出口（节点1 / 节点2 / 直连 / 拦截）
```

### 生态构成

| 组件 | 作用 | 代表项目 |
|------|------|---------|
| **内核** | 底层的代理转发引擎 | Clash Meta / Mihomo |
| **桌面客户端** | 带 GUI 的 Clash 封装 | Clash Verge Rev（⭐126k） |
| **移动客户端** | Android/iOS 上的 Clash | FlClash（⭐42k） |
| **规则集** | 预定义的域名/IP 分流规则 | Loyalsoldier/clash-rules |

### Clash Verge Rev 简介

[Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev) 是当前最活跃的桌面客户端，基于 Rust + Tauri 2 框架构建：

- 内置 Clash Meta（Mihomo）内核，支持切换 Alpha 版本
- 简洁美观的 GUI，支持自定义主题和 CSS 注入
- 配置文件管理、语法提示、可视化节点和规则编辑
- 系统代理 + TUN（虚拟网卡）双模式
- WebDAV 配置备份和同步

### FlClash 简介

[FlClash](https://github.com/chen08209/FlClash) 是基于 Flutter 的跨平台代理客户端，一套代码覆盖 Windows、macOS、Linux 和 Android：

- Material You 设计风格，类似 Surfboard 的 UI
- 适配多种屏幕尺寸，支持暗色模式
- 支持 WebDAV 数据同步
- 开箱即用的简操作体验

---

## 二、Windows 上如何使用（Clash Verge Rev）

### 2.1 下载安装

1. 打开 [Clash Verge Rev Releases 页面](https://github.com/clash-verge-rev/clash-verge-rev/releases)
2. 找到最新稳定版，下载对应系统的安装包：

| 系统架构 | 下载文件 |
|---------|---------|
| Windows x64 | `Clash.Verge_x.x.x_x64-setup.exe` |
| Windows x86 | `Clash.Verge_x.x.x_x86-setup.exe` |
| macOS Intel | `Clash.Verge_x.x.x_x64.dmg` |
| macOS Apple Silicon | `Clash.Verge_x.x.x_aarch64.dmg` |
| Linux | `Clash.Verge_x.x.x_amd64.deb` 等 |

双击安装包，按照提示完成安装。**注意：** 99% 的「此应用无法在你的电脑上运行」问题都是下载错了架构，请确认你的系统是 x64 还是 arm64。

### 2.2 首次启动

安装后启动 Clash Verge Rev，系统托盘会出现 Clash 图标。首次启动会自动生成默认配置文件并启动内核。

**依赖说明：** Clash Verge Rev 基于 Tauri 框架，依赖 WebView2。Windows 10/11 通常自带，如果遇到「无法显示界面/闪退」，请手动安装 [WebView2](https://developer.microsoft.com/zh-cn/microsoft-edge/webview2/)。

### 2.3 配置订阅节点

这是最常用也是最重要的一步。你需要先有一个代理服务商（俗称「机场」）提供的订阅链接。

**方式一：粘贴订阅链接**

1. 右键托盘图标 → 打开面板
2. 进入 **设置** → **订阅**
3. 点击「添加」，粘贴你的订阅链接
4. 点击「导入」，Clash 会自动下载并解析所有节点
5. 在 **代理** 页面可以看到导入的节点列表

**方式二：手动配置**

如果你有单个的代理节点信息（服务器地址、端口、密码、加密方式），可以手动编辑配置文件：

1. 进入 **设置** → **配置文件**
2. 点击配置文件右侧的编辑按钮
3. 在 `proxies` 字段下添加节点配置：

```yaml
proxies:
  - name: "我的节点"
    type: vmess
    server: example.com
    port: 443
    uuid: "your-uuid-here"
    alterId: 0
    cipher: auto
    tls: true
    network: ws
    ws-opts:
      path: "/path"
      headers:
        Host: example.com
```

### 2.4 选择代理模式

Clash 有三种代理模式，在「设置」页可以切换：

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| **Rule（规则）** | 按配置文件中的规则自动分流 | 日常使用，最推荐 |
| **Global（全局）** | 所有流量走同一个代理节点 | 需要固定出口 IP 时 |
| **Direct（直连）** | 所有流量不经过代理 | 仅测速对比 |

**日常建议用 Rule 模式**——国内网站直连，国外网站走代理，互不影响。

### 2.5 代理组选择

在「代理」页面，你会看到多个代理组（Proxy Groups）。最常见的是：

- **🚀 Proxy / 🚀 节点选择**：手动选择要用的代理节点
- **🎯 全球直连 / DIRECT**：国内网站的直连策略
- **🐟 漏网之鱼 / Final**：未匹配到规则的流量走这里
- **📲 电报消息**：Telegram 专用的节点选择

大部分时候，你只需要在 **🚀 Proxy** 里选一个当前最快的节点即可。Clash 支持自动测速，可以选择「自动选择」或「故障转移」策略。

### 2.6 启用 TUN 模式（可选）

TUN 模式是 Clash 的**虚拟网卡模式**——它在系统中创建一个虚拟网卡，所有流量经此通过，由 Clash 接管过滤和处理。

**优点**：所有应用都会经过代理，包括不支持手动设置代理的程序（游戏、UWP 应用等）。

**开启方法**：设置 → TUN → 开启 TUN 模式。

**注意**：
- 开启后如果网络异常，检查是否有多个网卡冲突
- UWP 应用（如微软商店）在 TUN 模式下会自动走代理
- 如果宽带拨号用户不能用系统代理，TUN 模式是解决方案

### 2.7 开机自启

设置 → 常规 → 开启「开机自启」。

如果你只开机不打开面板，可以开启「静默启动」——只启动后台服务，不弹出窗口。

---

## 三、移动设备上如何使用

### 3.1 Android：FlClash

[FlClash](https://github.com/chen08209/FlClash) 是 Android 上最推荐的 Clash 客户端，开源无广告。

**安装步骤：**

1. 进入 [Releases 页面](https://github.com/chen08209/FlClash/releases)
2. 下载最新的 APK 文件（`FlClash_v_x.x.x.apk`）
3. 安装到手机（如果提示未知来源，请允许安装）
4. 也可通过 F-Droid 安装：[FlClash F-Droid 仓库](https://chen08209.github.io/FlClash-fdroid-repo/)

**配置使用：**

1. 打开 FlClash，点击底部「配置」
2. 点击右上角「+」→ 选择「从 URL 导入」
3. 粘贴订阅链接，命名后保存
4. 返回主页面，点击「连接」按钮启动
5. 在「代理」页面选择节点

FlClash 的 UI 和 Clash Verge Rev 类似，上手成本很低。支持按延迟自动选择节点、分应用代理（某些 App 走直连）、TUN 模式等。

### 3.2 iOS：需要替代方案

由于 Apple 的限制，iOS 上无法直接运行 Clash 内核。iOS 用户可以考虑：

- **Surge**（付费，最强大）
- **Quantumult X**（付费）
- **Shadowrocket**（付费）
- **Stash**（付费，Clash 规则兼容）

这些 App 都支持 Clash 格式的配置和规则集，可以导入同样的订阅链接。

---

## 四、如何配置节点

### 4.1 使用机场订阅

这是最省心的方式。代理服务商会提供一个订阅链接（URL），Clash 导入后自动解析出所有节点。

**订阅格式示例：**

```
https://example.com/api/v1/client/subscribe?token=xxxxxxxx
```

导入后，Clash 会自动：
1. 从 URL 下载节点列表
2. 解析为 Clash 配置格式
3. 可用节点在「代理」页面显示

**建议开启「自动更新」**：设置 → 订阅 → 自动更新，建议间隔 24 小时。

### 4.2 手动配置 YAML

如果你有节点信息但不想用订阅，可以直接编辑配置文件。

**配置文件基本结构：**

```yaml
# 端口配置
port: 7890          # HTTP 代理端口
socks-port: 7891    # SOCKS5 代理端口
mixed-port: 7892    # HTTP+SOCKS5 混合端口
allow-lan: true     # 允许局域网连接

# 代理节点列表
proxies:
  - name: "香港 01"
    type: vmess
    server: hk01.example.com
    port: 443
    uuid: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    alterId: 0
    cipher: auto
    tls: true
    network: ws
    ws-opts:
      path: "/vmess"
      headers:
        Host: hk01.example.com

  - name: "日本 01"
    type: ss
    server: jp01.example.com
    port: 8388
    cipher: chacha20-ietf-poly1305
    password: "your-password"

  - name: "美国 01"
    type: trojan
    server: us01.example.com
    port: 443
    password: "your-password"
    sni: us01.example.com

# 代理组（策略组）
proxy-groups:
  - name: "🚀 节点选择"
    type: select
    proxies:
      - "香港 01"
      - "日本 01"
      - "美国 01"
      - "自动选择"

  - name: "自动选择"
    type: url-test
    url: "http://www.gstatic.com/generate_204"
    interval: 300
    proxies:
      - "香港 01"
      - "日本 01"
      - "美国 01"

# 规则
rules:
  - DOMAIN-SUFFIX,google.com,🚀 节点选择
  - DOMAIN-SUFFIX,youtube.com,🚀 节点选择
  - DOMAIN-SUFFIX,bilibili.com,DIRECT
  - DOMAIN-SUFFIX,baidu.com,DIRECT
  - GEOIP,CN,DIRECT
  - MATCH,🚀 节点选择
```

### 4.3 常见的节点协议类型

| 协议 | 特点 | 推荐场景 |
|------|------|---------|
| **Shadowsocks (ss)** | 轻量、兼容性好 | 翻墙基础需求 |
| **VMess** | V2Ray 协议，抗检测强 | 进阶用户 |
| **Trojan** | 基于 HTTPS，伪装性好 | 需要稳定连接 |
| **VLESS** | VMess 的简化版 | 配合 XTLS 使用 |
| **Hysteria2** | 基于 QUIC，速度快 | 高丢包网络环境 |
| **TUIC** | 基于 QUIC 的新协议 | 需要低延迟 |
| **WireGuard** | VPN 协议，速度快 | 设备直连 |

新手通常只需关注 Shadowsocks 和 VMess 即可，大多数机场默认提供这些协议。

---

## 五、配置文件详解

Clash 的配置核心是 **YAML 格式**。你可能不需要从头写一个配置，但了解基本结构有助于排查问题和自定义。

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

## 六、注意事项

### 6.1 安全问题

- **不要使用来源不明的订阅**：你的所有流量经过代理节点，不可信的节点可以截取你的数据
- **优先使用支持 TLS/加密的协议**：VMess + TLS、Trojan 等
- **不要用公共/免费节点登录重要账号**：银行、支付、社交账号等

### 6.2 常见问题

**Q：Clash 启动后无法上网？**

A：最常见的三个原因：
- 系统代理未正确关闭 → 排查路径：设置 → 网络 → 代理 → 确认关闭
- 端口被占用 → 修改 `port` / `mixed-port` 为其他值
- TUN 模式下的网卡冲突 → 检查是否有多个虚拟网卡

**Q：不打开 Clash 就无法上网？**

A：这是系统代理未能正确关闭。解决：Windows 设置 → 网络 → 代理 → 关闭「使用代理服务器」。或者在 Clash 设置中关闭「系统代理」再重新打开。

**Q：UWP 应用（如微软商店）无法使用代理？**

A：开启 TUN 模式即可解决。

**Q：划词翻译、截图工具等不支持代理的软件？**

A：同样开启 TUN 模式，或者使用 Clash 的「混合端口」配合系统代理。

**Q：测速很快但实际打开网页很慢？**

A：可能原因：
- 节点带宽不足（多人共享）
- DNS 污染（配置 DNS 防污染规则）
- 规则配置有问题（请求走了错误的节点）

### 6.3 关于网络环境

Clash 是一个工具，它本身不提供任何网络加速服务。你需要自行准备：
- 一个可靠的代理服务商（机场）
- 或自建代理服务器（VPS + 搭建脚本）

---

## 七、实用技巧

### 7.1 使用优秀的规则集

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

### 7.2 配置备份

Clash Verge Rev 支持 WebDAV 同步——将配置备份到自己的 NAS 或云盘，换设备时一键恢复。

设置 → WebDAV → 配置服务器地址、用户名、密码即可。

### 7.3 节点测速

Clash Verge Rev 内置了节点延迟测试功能。在「代理」页面点击右上角的测速按钮，会自动测试所有节点的延迟。

**注意**：延迟低不等于速度快。延迟是握手时间，速度取决于带宽和丢包率。建议配合实际使用体验判断。

### 7.4 自定义主题

Clash Verge Rev 支持：
- 自定义主题颜色
- 自定义代理组/托盘图标
- CSS Injection（自定义样式）
- 暗色/亮色模式

在「设置」→「主题」页面配置。

### 7.5 局域网共享

开启 `allow-lan: true` 后，同一局域网下的其他设备可以将 Clash 作为代理网关：

```
代理地址：192.168.x.x（Clash 所在设备的 IP）
代理端口：7890（或你配置的 mixed-port）
```

手机 Wi-Fi 设置中配置 HTTP 代理即可共享。

### 7.6 区分系统代理和 TUN 模式

| | 系统代理 | TUN 模式 |
|--|---------|---------|
| **原理** | 设置系统的 HTTP/SOCKS 代理 | 创建虚拟网卡接管全部流量 |
| **适用范围** | 只支持 HTTP/HTTPS/SOCKS 的应用 | 所有应用（含 TCP/UDP） |
| **优点** | 轻量，资源占用小 | 全覆盖，无死角 |
| **缺点** | 部分应用不支持或不遵守系统代理 | 资源占用稍高，少数环境有兼容问题 |

**建议**：日常使用系统代理就够了，遇到游戏/UWP 应用/不支持代理的软件时开启 TUN 模式。

---

## 八、项目链接

| 项目 | GitHub | 说明 |
|------|--------|------|
| Clash Verge Rev | [clash-verge-rev/clash-verge-rev](https://github.com/clash-verge-rev/clash-verge-rev) | 桌面 GUI 客户端（⭐126k） |
| FlClash | [chen08209/FlClash](https://github.com/chen08209/FlClash) | 移动/桌面跨平台客户端（⭐42k） |
| Mihomo (Clash Meta) | [MetaCubeX/mihomo](https://github.com/MetaCubeX/mihomo) | Clash 内核（已改名） |
| Clash Rules | [Loyalsoldier/clash-rules](https://github.com/Loyalsoldier/clash-rules) | Premium 规则集（⭐27k） |
| Clash Verge Rev 文档站 | [clash-verge-rev.github.io](https://clash-verge-rev.github.io/) | 官方文档 |
| FlClash 文档 | [chen08209.github.io/FlClash](https://chen08209.github.io/FlClash) | 官方文档 |

**许可证**：Clash Verge Rev 使用 GPL-3.0，FlClash 使用 GPL-3.0，均为开源免费软件。

---

> **免责声明**：本文仅作为 Clash 软件的使用教程。请遵守所在国家/地区的法律法规，合理合法使用互联网服务。
