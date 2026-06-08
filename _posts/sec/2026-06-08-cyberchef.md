---
layout: post
title: "CyberChef：GCHQ 出品的瑞士军刀级加密解密工具型"
categories: [sec]
description: "英国 GCHQ 开源的数据处理工具 CyberChef（35,000+ Stars），涵盖 480+ 种编码/加密/压缩/分析操作的完整能力图谱。涵盖操作分类体系、典型应用场景、Recipe 链式编排与 Magic 自动检测机制。"
keywords: CyberChef, GCHQ, 编码解码, 加解密, Swiss Army Knife, 数据分析, Base64, AES, Recipe
tags: [sec, open-source]
  - CyberChef
  - GCHQ
  - 密码学
  - 编码解码
  - 数据处理
  - CTF
---

# CyberChef：GCHQ 出品的瑞士军刀级数据处理工具箱深度解析

## 项目概览

**CyberChef** 由英国政府通信总部（GCHQ）开发并开源，被称作"网络瑞士军刀"（The Cyber Swiss Army Knife）。它是一个运行在浏览器中的数据处理 Web 应用，支持 **480 余种操作**，涵盖编码、加密、压缩、数据分析和格式解析等全领域。

| 指标 | 数据 |
|------|------|
| 仓库 | https://github.com/gchq/CyberChef |
| Stars | **35,031** |
| Forks | 3,987 |
| 编程语言 | JavaScript |
| 开源协议 | Apache-2.0 |
| 创建时间 | 2016-11-28 |
| 操作总数 | **480+** |
| Node.js | v24 完整支持 |

**核心哲学**：让技术和非技术人员都能以图形化的方式对数据进行复杂操作，无需记忆命令行参数或编写脚本。

---

## 一、架构与使用模式

### 1.1 四大功能区

CyberChef 的界面围绕四个核心区域设计：

```
┌──────────────┬──────────────────────────┐
│              │       输入区               │
│   操作列表    │  (粘贴/拖入数据)           │
│   (搜索/分类) ├──────────────────────────┤
│              │        Recipe 区           │
│              │  (拖拽操作/编排流水线)      │
│              ├──────────────────────────┤
│              │       输出区               │
│              │  (实时显示处理结果)         │
└──────────────┴──────────────────────────┘
```

| 区域 | 功能 |
|------|------|
| **输入区** | 粘贴文本、拖拽文件（支持最大 2GB）、Base64 输入编码 |
| **输出区** | 实时显示处理结果、高亮关联定位、Magic 自动检测提示 |
| **操作列表** | 480+ 操作按分类组织，支持关键词搜索 |
| **Recipe 区** | 拖拽式操作编排，支持断点调试、顺序调整、参数配置 |

### 1.2 Recipe 链式处理模型

CyberChef 的核心创新在于 **Recipe（配方）** 概念——将多个操作按顺序串联，上一个操作的输出自动成为下一个操作的输入：

```
Recipe 示例：Hex 解码 → Gunzip 解压 → Base64 解码

输入: "1f8b080000000000000b..." 
  → From Hex: [原始 gzip 字节]
  → Gunzip: [明文 Base64 字符串]
  → From Base64: [最终明文]
```

支持的高级特性：

| 特性 | 说明 |
|------|------|
| **断点调试** | 可在任意操作前设置断点，查看中间状态 |
| **单步执行** | 逐个操作执行，观察数据变换过程 |
| **Fork 分支** | 对输入按分隔符拆分，每条分别执行 Recipe |
| **条件跳转** | 根据输入内容条件性执行不同操作 |
| **正则捕获** | 从输入中提取变量，注入到后续操作参数 |
| **嵌套 Recipe** | 将一组操作封装为子 Recipe |

### 1.3 Magic 自动检测

CyberChef 内置 **Magic** 机制，自动尝试多种操作组合来识别和转换数据：

```
数据输入 → 尝试多种编码/加密假设 → 输出最有意义的解读
```

当识别到可能的编码类型时，输出区会显示 Magic 图标，点击即可自动应用对应的解码操作。

### 1.4 完全客户端运行

所有处理**完全在浏览器中完成**，不向服务器发送任何数据——输入、Recipe 配置、文件全部在本地浏览器执行。因此 CyberChef 可以下载到本地、U 盘或虚拟机中离线运行，适用于涉密网络环境。

---

## 二、操作能力全图谱

CyberChef 涵盖了 **480+ 种操作**，按功能模块分为以下类别。以下是每一类的核心操作清单（不展开说明）：

### 2.1 加密 / 解密与哈希

**对称加密**：AES（ECB/CBC/CFB/OFB/CTR/GCM/CCM）、DES、Triple DES、Blowfish、Twofish、RC2、RC4、ChaCha、Salsa20、Serpent、Camellia、Rabbit、SM4

**非对称加密**：RSA 加密/解密/签名/验证、ECC 密钥生成、Elliptic Curve Diffie-Hellman（ECDH）

**哈希与摘要**：MD2、MD4、MD5、SHA1、SHA2（224/256/384/512）、SHA3（224/256/384/512）、SHAKE、BLAKE2b、BLAKE2s、BLAKE3、SM3、RIPEMD（128/160/256/320）、HAVAL、Whirlpool、Keccak、Skein、Grøstl、HMAC（多算法）

**密码哈希**：Bcrypt、Bcrypt 比对、Scrypt、Argon2、Argon2 比对、PBKDF2、NT Hash、LM Hash

**密钥派生**：HKDF、PBKDF2 密钥派生、PKKDF2

**密钥操作**：AES 密钥封装/解封、RSA 密钥提取/导入、PEM 转 HEX、Hex 转 PEM、证书公钥提取

### 2.2 编码 / 解码

**Base 系列**：Base64（多字符集变体）、Base32、Base45、Base58、Base62、Base64URL、Base85（多种标准）、Base92、Base36

**十六进制与二进制**：Hex 编码/解码、二进制编码/解码

**URL 编码**：URL 编码/解码（RFC 3986 全兼容）

**文本编码**：HTML 实体编码/解码、Unicode 转义/反转义、Quoted Printable 编码/解码、Entity 编码/解码

**特殊格式**：Base65536、Z85、ASCII85、RFC 4648 Base32（Hex 变体）、Crokgford Base32

**Base 变体**：Base62、Base36、Base26、Base20、Base10、Base8、Base 自定义字符集

### 2.3 压缩 / 解压

**标准压缩**：Gzip 压缩/解压、Zlib 压缩/解压、Deflate 压缩/解压、Brotli 压缩/解压

**归档格式**：ZIP 压缩/解压、TAR 打包/解包、GZIP 归档、7z（通过解包器）、APK 解析

**图像压缩**：PNG 压缩级别修改、JPEG 重新压缩

### 2.4 数据转换

**类型转换**：数值进制转换（十进制/十六进制/八进制/二进制）、字节序转换（Little/Big Endian）、字符编码转换（UTF8/UTF16/ISO-8859-1 等）

**格式化**：JSON 格式化/压缩/验证、XML 格式化/压缩、YAML 格式化、SQL 格式化、CSS 格式化、HTML 格式化

**差分**：Diff 对比、文本差异合并、按行/字符差异化

### 2.5 数据格式解析

**网络协议**：IPv4 地址解析、IPv6 地址解析（含 Teredo）、TCP/IP 数据包头解析、HTTP 请求/响应解析、DNS 数据包解析、ARP 解析、ICMP 解析、MQTT 解析、CoAP 解析

**认证与证书**：X.509 证书解析、JWT 解码/验证、JWS 验证、JWK 解析、PKCS#7/PKCS#12 解析、ASN.1 解析/DER 编码/DER 解码

**文件格式**：PBX 二进制属性列表解析、XML 属性列表解析、BSON 序列化/反序列化、MessagePack 编码/解码、CBOR 编码/解码、YARA 规则转字节码

**序列化**：Java 序列化/反序列化、PHP 序列化/反序列化、Python Pickle 序列化/反序列化、AMF 编码/解码

### 2.6 数据提取

**字符串提取**：IP 地址提取、URL 提取、Email 地址提取、域名提取、MAC 地址提取、日期时间提取、信用卡号提取、文件路径提取

**文件头检测**：按 Magic Bytes 识别文件类型（100+ 种文件签名）

**正则提取**：自定义正则匹配提取、正则替换、正则分隔

### 2.7 数据生成

**随机数/密钥**：随机字节生成、随机整数生成、随机密码生成、随机 UUID 生成、密钥对生成

**哈希爆破**：MD5 碰撞搜索、哈希字典查找（在线）、哈希类型识别

**测试数据**：假名生成、假地址生成、假邮箱生成、IP 地址列表生成、端口列表生成

### 2.8 解析与反汇编

**反汇编**：x86 反汇编（32/64 位）、ARM 反汇编、MIPS 反汇编

**Shellcode 分析**：Shellcode 反汇编、Hex 转 Shellcode 字节

**调试格式**：内存转储 Hexdump 生成/解析、二进制文件 Hexdump 视图

### 2.9 操作与自动机

**数据操控**：XOR 运算（单字节/多字节/密钥流）、NOT 运算、AND/OR/ADD/SUB 运算、位位移、位反转、字节替换、字符替换

**流量操控**：数据块提取、字节丢弃、数据截断、数据填充、数据对齐、数据循环移位

**条件运算**：Fork 分支处理、Conditional Jump 条件跳转、Label 标签跳转、Merge 合并分支

**变量操作**：Register 变量注册与注入、Find/Replace 查找替换、Index 索引匹配引用

### 2.10 时间与格式

**时间戳**：Unix 时间戳解析/格式化、Windows Filetime 解析、NTP 时间戳、GPS 周时间、MAC 时间、多种日期格式互转

**校验和**：CRC-8/16/24/32/64 校验和、Adler-32 校验和、Fletcher-8/16/32/64 校验和、Luhn 校验、MODBUS CRC-16、Sum 校验

**模糊哈希**：SSDEEP 生成/比对、CTPH 生成/比对

### 2.11 网络工具

**子网计算**：CIDR 子网计算、子网掩码转换、IP 范围计算、网络广播地址计算

**DNS 查询**：A 记录查询、MX 记录查询、NS 记录查询、TXT 记录查询、DNS 反向查询

**WHOIS 查询**：域名 WHOIS 查询、IP WHOIS 查询

**端口扫描**：HTTP/HTTPS 服务检测、端口状态探测（需浏览器 fetch API）

### 2.12 图像与媒体

**图像操作**：添加文字到图像、图像模糊检测、EXIF 数据提取/清除、PNG 透明通道提取、图像像素提取/修改、图像按位平面提取、二维码解码、条形码生成/解码

**媒体格式**：Data URI 编码/解码、文件类型转换

---

## 三、典型应用场景

### 3.1 CTF 竞赛分析

CTF（Capture The Flag）选手最常用的场景之一。一个典型的 CTF 题目处理流程：

```
Hex 编码 → XOR 解密 → Base64 解码 → Gzip 解压 → ROT13 → 最终 Flag
```

在 CyberChef 中只需将 5 个操作拖入 Recipe 区，输入原始数据即可自动得到 Flag，不需要在终端里循环 `echo | xxd | base64 -d | ...`。

### 3.2 安全事件响应与取证

| 场景 | CyberChef 用法 |
|------|---------------|
| **日志分析** | 时间戳格式批量转换、IP 地址提取、URL 提取去重、Base64 解码 Redis 日志 |
| **恶意软件分析** | Hexdump 解析 → XOR 解密 → 反汇编 Shellcode → 提取 C2 地址 |
| **数据提取** | 从内存转储中提取文件（按 Magic Bytes）、从 PDF/Office 文档中提取隐藏数据 |
| **密码爆破辅助** | NT Hash 计算、MD5 字典查询、哈希类型识别、PBKDF2 派生密钥验证 |
| **网络流量分析** | HTTP 请求解析、Cookie 解码、JWT 解码/签名验证、SSL 证书解析 |

### 3.3 开发调试

| 场景 | CyberChef 用法 |
|------|---------------|
| **API 调试** | JWT Token 解码验证、Base64 解码/编码参数、Hex 转 ASCII 查看二进制响应 |
| **加密方案验证** | 快速测试 AES/DES/RC4 算法在不同模式下的加解密结果 |
| **数据格式调试** | JSON 格式化 → 正则提取 → CSV 导出、XML/BSON/CBOR/MessagePack 互转 |
| **哈希校验** | SHA256 计算文件哈希、HMAC 签名验证、CRC 校验计算 |
| **编码问题排查** | 字符编码检测与转换（UTF-8 → ISO-8859-1 → GB2312 等） |

### 3.4 数据分析

| 场景 | CyberChef 用法 |
|------|---------------|
| **流量数据整理** | 从 CSV/TSV 数据中提取特定列、按分隔符 Fork 并行处理 |
| **日志聚合** | 时间戳标准化、IP 地址提取去重、URL 参数解码 |
| **数据清洗** | 字符替换、正则提取有效字段、JSON → CSV 转换 |
| **数据一致性检查** | CRC 校验、哈希比对、Diff 差异比较 |

### 3.5 数据迁移与格式转换

| 场景 | CyberChef 用法 |
|------|---------------|
| **数据库迁移** | Base64 编码字符串与 HEX 互转、时间戳格式统一化 |
| **配置文件转换** | JSON → YAML 互转、XML → JSON 互转、属性列表格式转换 |
| **证书转换** | PEM → HEX 互转、DER 编码/解码、证书格式提取 |
| **图片格式处理** | PNG → Data URI 编码 — 直接嵌入 HTML/CSS |

---

## 四、部署选项

| 方式 | 命令 | 适用场景 |
|------|------|---------|
| **在线使用** | https://gchq.github.io/CyberChef | 最快捷，无需安装 |
| **Docker 运行** | `docker run -it -p 8080:8080 ghcr.io/gchq/cyberchef:latest` | 团队部署、内网隔离环境 |
| **Docker 构建** | `docker build --tag cyberchef . && docker run -it -p 8080:8080 cyberchef` | 自定义构建 |
| **下载离线运行** | 从官网下载 Release 的 ZIP 包 | 涉密环境、U 盘携带 |
| **Node.js 调用** | `npm install cyberchef` | 集成到自动化流水线 |

---

## 五、优劣势分析

| 优势 | 说明 |
|------|------|
| **480+ 操作、全领域覆盖** | 从简单 Base64 到复杂 AES/RSA，从 CRC 到 JWT 解码，覆盖安全分析全栈需求 |
| **完全客户端运行** | 数据处理不出浏览器，可用于涉密网络环境 |
| **Recipe 链式编排** | 拖砖式操作编排，降低使用门槛；支持断点、分支、变量、条件跳转等高级功能 |
| **Magic 自动检测** | 自动识别编码类型，降低手动排查成本 |
| **可共享 Recipe** | 通过 URL 参数分享完整的 Recipe 和输入 |
| **GCHQ 背书 + 开源** | 官方出品，Apache-2.0 开源，35,000+ Stars，社区贡献活跃 |
| **最大 2GB 文件支持** | 可直接拖入大文件处理 |

| 劣势 | 说明 |
|------|------|
| **不可用于生产加密** | 官方声明："Cryptographic operations should not be relied upon to provide security" |
| **纯浏览器性能瓶颈** | 处理大文件或高强度运算（如 PBKDF2、SHA-3）时性能受限 |
| **无命令行原生工具** | 虽然可通过 Node.js 调用，但缺少类似 `base64` 的原生 CLI 体验 |
| **Magic 不是万能** | 对多层嵌套编码或高度混淆数据的自动检测仍有限 |
| **无内置脚本能力** | 不能编写自定义处理逻辑，只能使用预置操作组合 |

---

## 六、适合谁用

- **安全分析师**——逆向分析恶意软件、解码混淆数据、解析网络流量
- **CTF 选手**——一站式解决编码/加密/Hash 爆破问题
- **开发工程师**——调试 API 认证、验证加密方案、数据格式转换
- **运维工程师**——日志分析、证书解析、网络子网计算
- **密码学学习者**——可视化观察不同加密/编码算法的输入输出变化
- **任何需要处理"奇怪数据"的人**——从 Base64 到 ASN.1，总有一个操作适合你

---

## 总结

CyberChef 是安全领域最成功的开源工具之一。35,000+ Stars 和 4,000+ Forks 说明了它在业界的认可度——从 GCHQ 内部的 10% 创新时间项目，成长为全球安全分析者的标配工具。

它的核心价值不在单一操作的强度，而在于 **480+ 操作通过 Recipe 机制形成的高阶组合能力**。一个 Hexdump → XOR 解密 → Gzip 解压 → JSON 格式化的 Recipe，在命令行可能需要 4 个命令管道连接，在 CyberChef 中只需 4 次鼠标拖拽。

**"完全在浏览器中运行"** 的设计也让它在涉密网络和高安全环境中有了不可替代的地位——不需要安装任何软件，不需要连接外部服务，数据始终在本地。

---

## 项目地址

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/gchq/CyberChef |
| 在线 Demo | https://gchq.github.io/CyberChef |
| npm 包 | https://www.npmjs.com/package/cyberchef |
| Docker 镜像 | ghcr.io/gchq/cyberchef:latest |
| 开源协议 | Apache-2.0 |

## 参考资料

- **GitHub 仓库**：源代码、Issue、贡献指南。→ https://github.com/gchq/CyberChef
- **在线 Demo**：直接使用。→ https://gchq.github.io/CyberChef
- **Wiki 文档**：Magic 自动检测原理、Node.js API、贡献指南。→ https://github.com/gchq/CyberChef/wiki
- **Node API 文档**：将 CyberChef 操作集成到 Node.js 项目。→ https://github.com/gchq/CyberChef/wiki/Node-API
