---
layout: post
title: "axios-npm包供应链投毒事件技术分析：80M 周下载量的包是怎么被变成木马投递器的"
categories: [sec]
description: "2026年3月31日，axios npm 包维护者账号被劫持，攻击者发布恶意版本 1.14.1/0.30.4，通过 typosquatting 依赖 plain-crypto-js 在 postinstall 阶段释放跨平台 RAT。本文还原完整攻击链、分析双层混淆机制、流量伪装技术和自毁策略，以及企业级应急响应措施。"
tags:
  - 供应链攻击
  - npm安全
  - axios
  - WAVESHAPER
  - postinstall
  - 恶意软件分析
  - 应急响应
  - 开源安全
---

2026年3月31日，JavaScript 生态中最流行的 HTTP 库 axios（周下载量超 8000 万，17.4 万个组件依赖）遭遇供应链投毒攻击。攻击者劫持了维护者账号，发布恶意版本 1.14.1 和 0.30.4，在用户执行 `npm install` 时通过 postinstall 钩子释放跨平台远控木马。

这不是一次简单的自动化投毒——它牵涉到账号劫持、GitHub issue 删除、零历史告警规避和流量伪装。攻击窗口虽然只有约 39 分钟，但其技术手法值得每一个安全团队复盘。

---

## 攻击总览

| 维度 | 数据 |
|------|------|
| **攻击时间** | 2026-03-31 00:21~03:20 UTC（北京时间 08:21~11:20） |
| **影响版本** | axios@1.14.1、axios@0.30.4 |
| **恶意依赖** | plain-crypto-js@4.2.1（typosquatting crypto-js） |
| **威胁组织** | UNC1069（关联朝鲜，代号 WAVESHAPER.V2） |
| **投递后门** | 跨平台 RAT（macOS 二进制 / Windows PowerShell / Linux Python） |
| **暴露窗口** | ~39 分钟（npm 下架恶意版本前） |
| **首次公开预警** | 北京时间 10:35，Socket.dev 创始人 Feross 在 X 平台发布 |

---

## 攻击链全景

整个攻击分为三个阶段：

### 第一阶段：预谋（攻击前 18 小时）

攻击者在正式投毒前 18 小时做了一个关键动作——发布 `plain-crypto-js@4.2.0`：

> 2026-03-30 13:57 CST：plain-crypto-js@4.2.0 发布

这个版本是**干净的**。它没有任何恶意代码，只是一个普通的 typosquatting 包，照抄了 crypto-js 的描述、作者署名和仓库链接。

**为什么要这么做？** 因为 npm 生态和第三方安全工具（如 Socket.dev）会标记"零历史"的新包——一个刚发布就开始投毒的包很容易被捕获。提前 18 小时建立发布历史，让恶意版本 4.2.1 看起来像一次正常的版本升级，有效规避新包告警。

### 第二阶段：投毒（攻击日 UTC 00:21 起）

攻击时间线（UTC）：

```
00:21  — plain-crypto-js@4.2.1 发布
        注入恶意 payload：postinstall 脚本 setup.js + 混淆后的 dropper

00:51  — axios@1.14.1 发布
        将 plain-crypto-js@4.2.1 加入 dependencies

01:30  — axios@0.30.4 发布
        39 分钟内覆盖了 axios 的两条发布线（1.x 和 0.x）
```

关键细节：同时维护两条发布线意味着攻击者清楚 axios 的版本策略，也意味着他控制了足够的发布权限——不仅仅是 npm Token，还包括 GitHub 仓库权限（随后被证实）。

### 第三阶段：执行与掩盖

用户执行 `npm install axios` 时，攻击链触发：

```
用户运行 npm install
        │
        ▼
npm 解析 axios@1.14.1 的依赖
        │
        ▼
安装 plain-crypto-js@4.2.1
        │
        ▼
npm 执行 postinstall 脚本: node setup.js  ← 自动触发，无需用户确认
        │
        ▼
setup.js（双层混淆）解码并执行
        ├── macOS:  写入 AppleScript → 下载 RAT 二进制到 /Library/Caches/com.apple.act.mond
        ├── Windows: 复制 PowerShell → 下载 PowerShell RAT 到 %TEMP%\6202033.ps1
        └── Linux:   直接下载 Python RAT 到 /tmp/ld.py
                │
                ▼
RAT 连接 C2: sfrclak.com:8000 / 142.11.206.73:8000
        │
        ├── 窃取：npm token、SSH 私钥、云服务凭证、CI/CD Secrets
        ├── 持久化：各平台自启动机制
        └── 自毁：删除 setup.js、替换 package.json、删除 postinstall 钩子
```

postinstall 钩子是 npm 的"合法"功能——它允许包在安装后执行任意代码。正常情况下用于编译原生模块或生成配置文件。但在攻击者手里，它变成了一个无需用户交互的代码执行入口。

---

## 技术深度分析

### 恶意依赖伪装：typosquatting

`plain-crypto-js` 对 `crypto-js` 的模仿非常彻底：

- **包名**：`plain-crypto-js` —— 只在 `crypto-js` 前加了 `plain-`，视觉上容易被误认为是同一系列
- **描述**：完全照抄 crypto-js
- **作者署名**：照抄
- **仓库链接**：指向 crypto-js 的真实仓库（用户点进去看也看不出问题）
- **package.json 替换机制**：包里内置了一个干净的 `package.md`，执行后替换掉 `package.json`，让事后审查的人看到的是一个"正常"的包

### 双层混淆

setup.js 不是明文写的。它经过混淆处理，反混淆后核心结构如下：

```javascript
const C2_BASE_URL = 'http://sfrclak.com:8000/';
const DEFAULT_PACKAGE_ID = '6202033';

// 平台检测
const PLATFORM_DARWIN = 'darwin';
const PLATFORM_WIN32 = 'win32';

// 持久化路径
const MAC_STAGE_PATH = '/Library/Caches/com.apple.act.mond';
const WINDOWS_POWERSHELL_COPY_NAME = 'wt.exe';    // 伪装成 Windows Terminal
const GENERIC_STAGE_PATH = '/tmp/ld.py';
```

setup.js 检测操作系统后，执行对应平台的攻击链：

**macOS 攻击链：**
1. 写入 AppleScript 到临时目录 `/tmp/{packageId}`
2. 连接 C2，POST body 为 `packages.npm.org/product0`
3. 下载 RAT 二进制到 `/Library/Caches/com.apple.act.mond`（伪装成 Apple 系统缓存文件）
4. `chmod 770` 设执行权限
5. 后台运行 RAT
6. 删除 AppleScript 临时文件

**Windows 攻击链：**
1. 查找 PowerShell 路径（`where powershell`）
2. 复制 PowerShell 到 `%PROGRAMDATA%\wt.exe`（伪装成 Windows Terminal）
3. 写入 VBScript，静默启动 cmd.exe
4. 下载 PowerShell RAT 到 `%TEMP%\6202033.ps1`
5. 以 `-w hidden -ep bypass` 参数静默执行
6. 删除临时脚本

**Linux 攻击链：**
1. 直接执行 shell 命令
2. 连接 C2，POST body 为 `packages.npm.org/product2`
3. 下载 Python RAT 到 `/tmp/ld.py`
4. 后台执行

### 流量伪装：让 C2 看起来像 npm

这是攻击中最精巧的环节之一。setup.js 在向 C2 发送 POST 请求时，body 不是直接的命令或数据，而是：

| 平台 | POST Body |
|------|-----------|
| macOS | `packages.npm.org/product0` |
| Windows | `packages.npm.org/product1` |
| Linux | `packages.npm.org/product2` |

攻击者故意在 body 前加上 `packages.npm.org/` 前缀。当安全团队或 SIEM 系统审查网络流量时，这些 POST body 看起来和正常的 npm 包请求几乎一样——典型的日志条目可能是 `POST packages.npm.org/axios`，而恶意流量是 `POST sfrclak.com:8000` 但 body 里写着 `packages.npm.org/product0`。

这种伪装不会骗过深度分析，但对于自动化流量审查和粗略的日志扫描来说，可以有效降低被发现的概率。

### 自毁策略

恶意代码执行后，攻击链的最后一步是清理痕迹：

1. **删除 setup.js** —— postinstall 脚本本身被删除，事后检查 `node_modules/plain-crypto-js/` 目录看不出问题
2. **替换 package.json** —— 用内置的干净 `package.md` 覆盖 `package.json`，删除 postinstall 钩子声明。事后检查包的声明文件，看不到任何恶意迹象
3. **删除临时文件** —— 各平台的 AppleScript/VBScript/临时脚本全部删除

这意味着：如果你在事发后检查文件系统，只靠看 `node_modules/` 目录很可能什么都发现不了。需要检查 npm 缓存、安装日志和 shell history 才能追溯。

### C2 基础设施

| IOC | 值 |
|-----|-----|
| C2 域名 | `sfrclak.com`、`domainsfrclak.com` |
| C2 IP | `142.11.206.73` |
| C2 端口 | 8000 |
| C2 路径 | `/6202033` |
| 通信协议 | HTTP |

---

## GitHub 账号劫持：攻击的另一个维度

攻击者不仅劫持了 npm 账号，还控制了对应维护者的 GitHub 账号。多个用户在 GitHub issues 中反馈发现恶意代码后，这些 issue **被大量删除**。这表明：

1. 攻击者拥有仓库的管理员权限（可以关闭/删除 issue）
2. 攻击者试图掩盖攻击行为，阻止用户之间的信息传播
3. 账号劫持不是 Token 泄露，而是完整的身份接管

这也解释了为什么攻击者能同时维护两条 axios 发布线——需要仓库的写入权限才能完成版本发布。

---

## 为什么影响这么大

axios 在 npm 生态中的位置决定了这次攻击的冲击面：

- **周下载量超 8000 万**（截至攻击发生时）
- **17.4 万个组件直接或间接依赖 axios**
- 几乎所有 Node.js 的 Web 项目都依赖 axios 或其下游包
- 攻击窗口内的 `npm install` / `npm ci` / `npm update` 都会触发恶意 postinstall

对于企业来说，最可怕的是 CI/CD 的影响——只要 CI/CD 流水线在攻击窗口内执行了 `npm install`，流水线中注入的所有 Secrets 都应视为已泄露：npm Token、云服务密钥、SSH 私钥、数据库凭证、环境变量等。

---

## 应急响应要点

### 检测是否受影响

```bash
# 1. 检查是否安装了恶意版本
npm list axios | grep -E "1\.14\.1|0\.30\.4"

# 2. 检查 lockfile
grep -A1 '"axios"' package-lock.json | grep -E "1\.14\.1|0\.30\.4"

# 3. 检查 postinstall 目录残留
ls node_modules/plain-crypto-js 2>/dev/null && echo "⚠️ 可能受影响"

# 4. 检查持久化文件（RAT 留下的痕迹）
# macOS
ls -la /Library/Caches/com.apple.act.mond
# Linux
ls -la /tmp/ld.py
# Windows
dir "%PROGRAMDATA%\wt.exe"
```

### 如果没受影响：锁定版本

```bash
npm install axios@1.14.0   # 1.x 用户
npm install axios@0.30.3   # 0.x 用户
```

在 `package.json` 中加强锁定：

```json
{
  "overrides": { "axios": "1.14.0" },
  "resolutions": { "axios": "1.14.0" }
}
```

CI/CD 流水线建议默认加 `--ignore-scripts`：

```bash
npm ci --ignore-scripts
```

### 如果已受影响：全面失陷处理

只要检出 RAT 残留文件，系统应视为完全失陷。攻击者窃取的凭据清单非常全面：

- npm 访问令牌
- Git 仓库密钥
- SSH 私钥
- 云服务凭证（AWS、GCP、Azure 等）
- 服务器登录密码
- CI/CD 流水线密钥
- 数据库、消息队列访问凭证
- 环境变量（.env 文件）
- 公司邮箱密码
- 浏览器保存的密码

以上所有凭证都需要轮换。不要手动清理残留文件——应从干净的镜像或备份重建系统。

---

## 防御启示

1. **永远不要在 CI/CD 中使用 postinstall** —— 加 `--ignore-scripts` 应该是默认配置，只有明确需要编译原生模块的项目才按需开启

2. **OIDC Trusted Publisher 优于手动 Token** —— npm 的 OIDC 机制可以让发布操作与 CI 身份绑定，即使 Token 泄露也无法单独用于发布。这次攻击中攻击者劫持了完整账号，但如果用的是 OIDC，攻击面会大大缩小

3. **精确版本号锁定** —— `^1.14.0` 这种语义范围会让 `npm install` 在解析时自动引入 `1.14.1`。用精确版本号 + overrides 双重锁定可以在攻击者发布恶意版本时形成保护层

4. **监控新包和版本** —— 虽然攻击者用 18 小时的等待避开了零历史告警，但如果安全工具监控的不是"新包"而是"版本行为突变"（比如一个加密库突然加了一个 postinstall），仍然可以捕获

5. **账号保护** —— npm/GitHub 账号的 2FA 是基本门槛。但这次攻击中即使有 2FA，如果攻击者通过 Session Token 劫持或 Social Engineering 绕过了 2FA，仍然可以被完整接管。建议使用硬件安全密钥（WebAuthn）作为发布账号的第二因素
