---
layout: post
title: "开源 SCA 工具全景调研 — 从 OWASP DependencyCheck 到 OpenSCA 的 10 款选择"
categories: [sec]
description: "软件成分分析（SCA）工具横向对比：覆盖 OWASP DependencyCheck、Trivy、Dependency-Track、FOSSA CLI、OpenSCA-cli 等 10 款开源方案，从 CLI 形态到企业平台，帮你选型"
keywords: SCA, 软件成分分析, DependencyCheck, Trivy, OpenSCA, Dependency-Track, FOSSA, cdxgen, Grype, Syft, OSV-SCALIBR
tags:
  - sca
  - software-composition-analysis
  - open-source
  - security
  - dependency-check
  - trivy
---

{% raw %}

## 背景

软件成分分析（Software Composition Analysis, SCA）是应用安全中不可或缺的一环。随着开源生态的爆发式增长——一个典型的现代应用可能引入数百个直接依赖和数千个传递依赖——依靠人工审查来追踪每一个开源组件的漏洞和许可证风险已经完全不现实。

SCA 工具的核心能力就三件事：
- **识别**项目中使用哪些开源组件及其版本
- **匹配**已知漏洞库（NVD、OSV、GitHub Advisory Database 等）
- **预警**漏洞影响和许可证合规风险

GitHub 上 SCA 类开源项目可以说是百花齐放——从轻量 CLI 到企业级平台，从专注漏洞扫描到全链路合规检查应有尽有。下面是对 10 款主流开源 SCA 工具的横向调研。

---

## 一、CLI 型 SCA 工具（最接近 OpenSCA-cli）

这类工具以命令行为核心交互方式，最适合嵌入 CI/CD 流水线或本地开发使用。

### 1.1 OWASP DependencyCheck — 最老牌的开源 SCA

| 项目属性 | 内容 |
|---------|------|
| **GitHub** | [dependency-check/DependencyCheck](https://github.com/dependency-check/DependencyCheck) |
| **Stars** | ⭐ 7,576 |
| **语言** | Java |
| **许可证** | Apache 2.0 |
| **定位** | 最成熟、社区最大的开源 SCA 工具 |

OWASP 出品，是开源 SCA 领域最老牌的选手。支持 30+ 种语言和包管理器（Maven、Gradle、npm、PyPI、NuGet、Composer 等），核心能力依赖 NVD 数据库，每天自动更新漏洞数据。

**优点**：社区庞大，文档完善，SonarQube/Jenkins 插件成熟，经过大量项目验证。

**缺点**：NVD 数据库的更新延迟（约 24-48 小时），扫描速度在大项目上偏慢，Java 生态要求 JDK 运行环境。

典型用法：

```bash
dependency-check --scan /path/to/project --out /path/to/report
```

### 1.2 Trivy — 全能型扫描器

| 项目属性 | 内容 |
|---------|------|
| **GitHub** | [aquasecurity/trivy](https://github.com/aquasecurity/trivy) |
| **Stars** | ⭐ 23,000+ |
| **语言** | Go |
| **许可证** | Apache 2.0 |
| **定位** | 容器 + FS + Git + SBOM 全场景扫描 |

Trivy 是目前 GitHub 上 Star 数最高的开源安全扫描器之一，由 Aqua Security 维护。它不纯粹是 SCA 工具，但 SCA 是它的核心能力——支持文件系统扫描、容器镜像扫描、Git 仓库扫描和 SBOM 扫描。

与 OpenSCA-cli 一样使用 Go 语言开发，运行时开销小，扫描速度极快。

**优点**：多数据源（NVD + GitHub Advisory + 自家 Trivy DB），支持 CycloneDX/Syft SBOM 输入输出，扫描速度快，Go 单二进制部署零依赖。

**缺点**：功能过于庞大，如果你只需要 SCA，大材小用。许可证分析功能相对基础。

```bash
# 文件系统 SCA 扫描
trivy fs --scanners vuln /path/to/project

# 输出 CycloneDX SBOM
trivy filesystem --format cyclonedx --output result.cdx.json /path/to/project
```

### 1.3 FOSSA CLI — 许可证合规首选

| 项目属性 | 内容 |
|---------|------|
| **GitHub** | [fossas/fossa-cli](https://github.com/fossas/fossa-cli) |
| **Stars** | ⭐ 1,496 |
| **语言** | Haskell |
| **许可证** | Apache 2.0（核心 CLI 开源） |
| **定位** | 依赖分析与许可证合规 |

FOSSA 的商业产品广为人知，其 CLI 工具也是开源的。FOSSA CLI 以许可证合规分析见长——它能分析依赖的递归传递依赖的许可证，判断兼容性风险。

**优点**：依赖分析深度极佳，传递依赖完整展开；许可证兼容性矩阵自动生成；集成支持广泛。

**缺点**：Haskell 运行时部署较复杂；商业版本功能更强但非免费；社区版本更新频率较低。

```bash
fossa analyze
```

### 1.4 Google OSV-SCALIBR — Google 出品的库级 SCA

| 项目属性 | 内容 |
|---------|------|
| **GitHub** | [google/osv-scalibr](https://github.com/google/osv-scalibr) |
| **Stars** | ⭐ 611 |
| **语言** | Python |
| **许可证** | Apache 2.0 |
| **定位** | SCA 库，可嵌入其他工具 |

OSV-SCALIBR 是 Google 在 2024 年开源的 SCA 库，与 OSV（Open Source Vulnerabilities）数据库深度整合。它不是独立 CLI 工具，而是可嵌入的库模块，适合集成到安全扫描平台中。

**优点**：Google 维护，与 OSV 数据库实时同步；模块化设计，可自定义提取器和检测器；Python 生态友好。

**缺点**：偏底层库，不是开箱即用工具；社区尚在建设中；文档相对有限。

### 1.5 OpenSCA-cli — 国产开源 SCA

| 项目属性 | 内容 |
|---------|------|
| **GitHub** | [XmirrorSecurity/OpenSCA-cli](https://github.com/XmirrorSecurity/OpenSCA-cli) |
| **语言** | Go |
| **许可证** | Apache 2.0 |
| **定位** | 国产全能 SCA CLI |

国内安全公司陌陌安全（Xmirror Security）开源的项目。功能对标 Trivy + DependencyCheck，支持多语言依赖分析、漏洞匹配和许可证检测。Go 语言编写，部署简单，中文文档友好。

**优点**：中文生态好，国产运维团队首选；Go 单二进制，部署零摩擦；社区活跃，支持微信群技术支持。

**缺点**：国际知名度较低；漏洞库更新速度和覆盖度在起步阶段。

---

## 二、SBOM 生成器 + 漏洞引擎组合方案

这个流派将 SCA 拆分为两个独立步骤：先生成 SBOM（软件物料清单），再对 SBOM 进行漏洞扫描。架构灵活，适合有定制需求的团队。

### 2.1 cdxgen — 覆盖面最广的 SBOM 生成器

| 项目属性 | 内容 |
|---------|------|
| **GitHub** | [cdxgen/cdxgen](https://github.com/cdxgen/cdxgen) |
| **Stars** | ⭐ 984 |
| **语言** | JavaScript (Node.js) |
| **许可证** | Apache 2.0 |
| **定位** | CycloneDX BOM 生成器 |

支持 50+ 种语言和框架，覆盖面是同类工具中最广的。输出标准 CycloneDX 格式 SBOM，可对接任何支持 SBOM 输入的漏洞扫描引擎。

```bash
npx cdxgen -o bom.json /path/to/project
```

### 2.2 Syft + Grype — Anchore 组合拳

| 工具 | GitHub | ⭐ Stars | 定位 |
|------|--------|---------|------|
| **Syft** | [anchore/syft](https://github.com/anchore/syft) | ⭐ 6,500+ | SBOM 生成器（Go） |
| **Grype** | [anchore/grype](https://github.com/anchore/grype) | ⭐ 9,000+ | 漏洞扫描器（Go） |

两工具同为 Anchore 出品，Go 语言开发，一生成一扫描，配合默契。

```bash
# Step 1: 生成 SBOM
syft /path/to/project -o cyclonedx > bom.json

# Step 2: 扫描漏洞
grype /path/to/project
# 或直接扫描 SBOM
grype bom:path/to/bom.json
```

Grype 的数据源涵盖 NVD、GitHub Advisory、RedHat、CVE 等多个渠道，准确率不错。

---

## 三、平台型 SCA（带前端/API/策略引擎）

如果团队需要持续监控、策略管理和多项目看板，纯 CLI 不够，需要平台级方案。

### 3.1 Dependency-Track — 企业级 SCA 平台

| 项目属性 | 内容 |
|---------|------|
| **GitHub** | [DependencyTrack/dependency-track](https://github.com/DependencyTrack/dependency-track) |
| **Stars** | ⭐ 3,898 |
| **语言** | Java |
| **许可证** | Apache 2.0 |
| **定位** | 智能组件分析平台 |

Dependency-Track 是 OWASP 旗下的组件分析平台——分前端后端，不是纯 CLI。提供 REST API、Web 仪表盘、通知引擎（Webhook/邮件/Slack）、策略违规引擎和漏洞优先级评分（EPSS）。

**优点**：企业级功能完整——SBOM 上传、集中管理、策略引擎、自动化通知；支持 CycloneDX 格式 SBOM 作为数据源；EPSS 漏洞优先级集成。

**缺点**：部署较重（Java + 数据库），小团队维护成本较高；需要配合 cdxgen/Syft 生成 SBOM 后上传。

```bash
curl -X POST "https://dtrack.example.com/api/v1/bom" \
  -H "X-Api-Key: ${API_KEY}" \
  -H "Content-Type: multipart/form-data" \
  -F "project=<project-uuid>" \
  -F "bom=@bom.json"
```

### 3.2 OSS Review Toolkit (ORT) — 全链路合规检查

| 项目属性 | 内容 |
|---------|------|
| **GitHub** | [oss-review-toolkit/ort](https://github.com/oss-review-toolkit/ort) |
| **Stars** | ⭐ 2,030 |
| **语言** | Kotlin |
| **许可证** | Apache 2.0 |
| **定位** | 软件合规检查全流程工具链 |

ORT 的定位是从源码到合规报告的全链路工具链，包含 6 个阶段：下载源码、分析依赖、扫描漏洞、评估许可证、生成报告、通知执行。非常适合需要严格 OSS 许可证合规审核的团队。

**优点**：流程完整——从依赖发现到合规评估再到报告生成，一条龙；支持多种报告格式（NOTICE、Excel、HTML）；与 ClearlyDefined 集成。

**缺点**：配置复杂，学习曲线陡峭；运行时间长（全流程可能需要几十分钟）；Kotlin/JVM 依赖较重。

---

## 四、横向对比总表

### 4.1 核心能力对比

| 工具 | CLI 形态 | 漏洞扫描 | 许可证分析 | SBOM 输出 | 容器扫描 | 语言覆盖 |
|------|---------|---------|-----------|----------|---------|---------|
| **DependencyCheck** | ✅ CLI+插件 | ✅ | ✅ | ❌ | ❌ | 30+ |
| **Trivy** | ✅ CLI | ✅ | ✅ 基础 | ✅ CycloneDX | ✅ 强 | 40+ |
| **FOSSA CLI** | ✅ CLI | ✅ | ✅ 强 | ✅ | ❌ | 30+ |
| **OSV-SCALIBR** | ❌ 库 | ✅ | ❌ | ❌ | ❌ | 中 |
| **OpenSCA-cli** | ✅ CLI | ✅ | ✅ | ❌ | ❌ | 中 |
| **cdxgen** | ✅ CLI | ❌ | ❌ | ✅ CycloneDX | ❌ | 50+ |
| **Syft + Grype** | ✅ CLI 组合 | ✅ | ❌ | ✅ CycloneDX | ✅ | 30+ |
| **Dependency-Track** | ❌ 平台 | ✅ | ✅ | ✅ 消费 | ❌ | 不限 |
| **ORT** | ✅ CLI | ✅ | ✅ 强 | ✅ SPDX | ❌ | 30+ |

### 4.2 部署与集成对比

| 工具 | 运行时 | 部署难度 | CI/CD 集成 | 平台化能力 | 中文社区 |
|------|-------|---------|-----------|----------|---------|
| **DependencyCheck** | JVM | ⭐⭐ | Jenkins/SonarQube | ❌ | 一般 |
| **Trivy** | 单二进制 | ⭐ | GitHub Actions/GitLab CI | ❌ | 活跃 |
| **FOSSA CLI** | Haskell | ⭐⭐⭐ | 官方 CI 集成 | ⭐⭐（商业版） | 弱 |
| **OpenSCA-cli** | 单二进制 | ⭐ | GitHub Action | ⭐ 平台对接 | ✅ 强 |
| **Syft + Grype** | 单二进制 | ⭐ | GitHub Action | ❌ | 弱 |
| **Dependency-Track** | JVM + DB | ⭐⭐⭐⭐ | API 对接 | ✅ 完整平台 | 一般 |
| **ORT** | JVM | ⭐⭐⭐⭐ | 复杂集成 | ⭐⭐⭐ | 弱 |

---

## 五、选型建议

### 按场景推荐

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| **个人开发者/小团队** | **Trivy** 或 **OpenSCA-cli** | Go 单二进制，一命令搞定，零运维 |
| **Java 技术栈团队** | **DependencyCheck** | SonarQube 插件原生集成 |
| **需要强许可证合规** | **FOSSA CLI** 或 **ORT** | 递归依赖许可证分析能力最强 |
| **容器镜像 + 代码扫描** | **Trivy** | 全场景覆盖，一个工具搞定 |
| **企业级持续监控** | **cdxgen + Dependency-Track** | BOM 上传到策略引擎通知闭环 |
| **SBOM 标准化优先** | **Syft + Grype** | 生成扫描分离，架构灵活 |
| **国产/中文运维团队** | **OpenSCA-cli** | 中文文档，微信支持，国产化 |
| **嵌入自有平台** | **OSV-SCALIBR** | 作为库直接集成 |

### 组合方案参考

```
# 轻量级（个人用）
Trivy -> 搞定一切

# 中量级（团队用）
cdxgen（生成 SBOM）+ Grype（扫描漏洞）+ GitHub Actions（自动化）

# 企业级（平台用）
Syft（生成 SBOM）-> Dependency-Track（集中管理 + 策略引擎）
Trivy（容器镜像扫描，并行）
```

---

## 参考资料

- [OWASP DependencyCheck - GitHub](https://github.com/dependency-check/DependencyCheck)
- [Trivy - GitHub](https://github.com/aquasecurity/trivy)
- [FOSSA CLI - GitHub](https://github.com/fossas/fossa-cli)
- [Google OSV-SCALIBR - GitHub](https://github.com/google/osv-scalibr)
- [OpenSCA-cli - GitHub](https://github.com/XmirrorSecurity/OpenSCA-cli)
- [cdxgen - GitHub](https://github.com/cdxgen/cdxgen)
- [Syft - GitHub](https://github.com/anchore/syft)
- [Grype - GitHub](https://github.com/anchore/grype)
- [Dependency-Track - GitHub](https://github.com/DependencyTrack/dependency-track)
- [OSS Review Toolkit - GitHub](https://github.com/oss-review-toolkit/ort)
- [awesome-sca 工具清单](https://github.com/magnologan/awesome-sca)

{% endraw %}
