---
layout: post
categories: [tool]
title: "sca-cli：Agent Skill 供应链安全扫描 CLI 工具"
tags:
  - SCA
  - 供应链安全
  - Agent安全
  - MCP
  - SBOM
  - CLI工具
  - Python
description: "sca-cli 是一个面向 Agent Skill / MCP Server / AI Plugin 的供应链安全扫描 CLI 工具。具备 SBOM 生成、多引擎漏洞扫描、Skill 元数据风险检测、安装脚本审计、高危 API 检测等能力，支持本地离线运行和企业级报告输出。"
---

## 一、技术方案

### 1.1 产品定位与技术栈

sca-cli 是一个**本地优先、可离线化**的供应链安全 CLI 工具，面向 Agent Skill、MCP Server、AI Plugin 等新兴 AI 组件生态设计。它不做传统 Java/Maven SCA，而是聚焦于 Python / JavaScript / MCP / Plugin 四大类 AI 组件包的安全检测。

技术栈选型以成熟稳定、跨平台兼容为原则：

| 模块 | 选型 | 选型理由 |
|------|------|---------|
| 开发语言 | Python 3.11+ | 跨平台兼容性强，AI/安全生态丰富 |
| CLI 框架 | Typer | 类型安全、自动生成 help 文档 |
| 控制台输出 | Rich | 终端渲染能力强，支持表格/进度条 |
| 数据库 | SQLite | 零部署、单文件、支持离线 |
| ORM | SQLAlchemy 2.x | 成熟度高、事务支持好 |
| 数据校验 | Pydantic v2 | 类型安全、序列化性能佳 |
| HTTP 请求 | httpx | 支持异步、连接池、超时控制 |
| 模板引擎 | Jinja2 | 通用模板方案，HTML/MD 双输出 |
| 打包 | pyproject.toml + console_scripts | 标准 Python 打包方案 |

### 1.2 总体架构

工具采用六层流水线架构，输入从顶部进入，逐层处理后输出报告：

```text
┌──────────────────────────────────────┐
│ CLI 命令层：scan / sync / intel       │
├──────────────────────────────────────┤
│ 输入处理层：URL下载 / Git clone / 解压│
├──────────────────────────────────────┤
│ 项目识别层：Python/JS/MCP/Plugin/AI   │
├──────────────────────────────────────┤
│ 扫描引擎层：多引擎并行 + 规则引擎      │
├──────────────────────────────────────┤
│ 本地知识库层：SQLite 漏洞/规则/指纹    │
├──────────────────────────────────────┤
│ 结果归一化层：去重/评分/优先级排序     │
├──────────────────────────────────────┤
│ 报告层：HTML / Markdown / JSON        │
└──────────────────────────────────────┘
```

各层职责清晰，输入输出标准化，便于后续扩展为 Web 或 API 服务。

### 1.3 核心扫描流水线

一次完整的扫描任务经过以下步骤：

```
输入 Skill 包 / Git URL / 目录 / zip
  ↓
识别 Python / JS / MCP / Plugin 结构
  ↓
生成 CycloneDX SBOM (Syft 或内置 parser)
  ↓
并行执行漏洞扫描 (Grype / pip-audit / npm audit)
  ↓
并行执行规则扫描 (Skill 元数据 / 安装脚本 / 高危 API / MCP 参数)
  ↓
结果归一化与去重（多引擎合并、权重计算）
  ↓
生成企业级扫描报告和威胁情报报告
```

### 1.4 多引擎扫描体系

sca-cli 不依赖单一扫描器，而是采用**多引擎协同**的策略：

| 引擎 | 职责 | 触发条件 |
|------|------|---------|
| Syft | 生成 CycloneDX SBOM | 默认开启 |
| Grype | 通用漏洞扫描（基于 SBOM） | `--vuln` 开启 |
| pip-audit | Python 生态专项漏洞 | Python 项目 + `--vuln` |
| npm audit | JS/TS 生态专项漏洞 | JS 项目 + `--vuln` |
| Skill 规则引擎 | 元数据/指令注入/过度授权 | 默认开启 |
| 安装脚本检查 | setup.py/package.json scripts 恶意行为 | 默认开启 |
| 高危 API 扫描 | eval/exec/subprocess 等高危调用 | 默认开启 |
| AIG 规则 | AI-Infra-Guard 导入的 AI/MCP 专项规则 | 有规则时自动启用 |

多引擎结果通过**统一的 finding 模型**归一化，按 `package + version + vuln_id` 去重，同一漏洞被多个引擎命中时显示"多引擎确认"，严重性取最高值。

### 1.5 规则引擎设计

规则引擎是 sca-cli 的核心差异能力。它不依赖外部 API，所有规则以 YAML 格式存储在本地，支持分层加载：

```
内置规则 → 用户本地规则 → AIG 导入规则 → 项目级规则
```

**规则类型覆盖 10 大类：**

| 类型 | 检测对象 | 典型规则 |
|------|---------|---------|
| skill_metadata | Tool description / manifest | 指令投毒检测（"忽略之前指令"） |
| mcp_tool | MCP Tool 参数定义 | 任意命令参数检测 |
| plugin_manifest | AI Plugin 元数据 | 隐藏行为检测 |
| install_script | setup.py / package.json scripts | Shell 执行 / 下载执行 / 密钥读取 |
| high_risk_api | Python/JS 源码 | eval/exec/subprocess 等 |
| malicious_package | 包名 | 拼写劫持检测 |
| typosquatting | 包名相似度 | 相似包名对比 |
| openapi_risk | OpenAPI 规范 | DELETE / admin / token 接口 |
| ai_infra_fingerprint | AI Infra 组件指纹 | 版本指纹识别 |
| license_policy | 许可证声明 | 许可证合规策略 |

每一条 YAML 规则包含 id、名称、严重性、置信度、匹配字段、关键词列表、归一化规则、风险描述和修复建议，支持正则、JSON Path、关键词组合等多种匹配模式。

### 1.6 Agent Skill 专项风险评分

传统 SCA 工具对 AI Agent 场景的风险评估是失效的——它们不会检测 tool description 中的指令投毒，也不会检查 MCP 参数是否允许任意命令执行。

sca-cli 在标准 CVSS 评分基础上增加了 **Agent Skill 加权体系**：

| 风险条件 | 加权分 |
|---------|:------:|
| MCP tool 任意命令参数 | +25 |
| 安装脚本执行 shell | +20 |
| 读取环境变量 + 外联 | +20 |
| tool description 指令注入 | +15 |
| npm/pypi 高危漏洞 | +10 |
| 无 lockfile | +8 |
| 未知许可证 | +5 |
| 多引擎同时命中 | +5 |

最终风险等级分级：0-30 Low、31-60 Medium、61-85 High、86+ Critical。

### 1.7 本地知识库与数据同步

sca-cli 的所有漏洞库和规则库均存储于本地 SQLite，支持**完全离线运行**。同步机制支持首次全量、后续增量、失败回滚和离线导入导出。

| 数据源 | 内容 | 同步方式 |
|-------|------|---------|
| OSV | Python/npm 生态漏洞 | 增量同步 |
| GHSA | GitHub Advisory | 增量同步 |
| NVD | CVE/CVSS/CWE 补充 | ETag 增量 |
| SPDX | 许可证标准库 | 全量+增量 |
| AI-Infra-Guard | AI/MCP 指纹与规则 | Git clone |
| Grype DB | Grype 漏洞数据库 | grype db update |

### 1.8 输入安全与跨平台

工具对输入安全做了严格约束：

- **URL 下载**：限制最大 500MB，保存到隔离目录，随机文件名
- **解压安全**：必须防止 Zip Slip 路径穿越（`../../evil.py`、绝对路径）
- **不执行代码**：不运行被扫描项目的安装脚本、不执行业务代码
- **纯静态扫描**：默认仅做静态分析和外部工具扫描
- **跨平台路径**：Windows / macOS / Linux 路径处理经过专项设计，无硬编码

---

## 二、特征使用

### 2.1 数据源总览

sca-cli 的本地知识库由六大数据源构成，覆盖漏洞库、许可证库和规则库三大类型：

| 数据源 | 类型 | 内容 | 量级 | 同步方式 | 来源 |
|-------|------|------|------|---------|------|
| OSV | 漏洞库 | PyPI / npm 生态开源漏洞 | 240,000+ | HTTP 下载 zip | Open Source Vulnerabilities |
| GHSA | 漏洞库 | GitHub Advisory 全量 | 118,000+ | Git clone + pull | GitHub Advisory Database |
| Grype DB | 漏洞库 | Anchore Grype 实时漏洞库 | ~1（引用） | `grype db update` | Anchore |
| SPDX | 许可证库 | SPDX 标准许可证列表 | 727 | HTTP JSON | spdx.org |
| AIG | 规则库 | AI Infra 指纹与安全规则 | 1,500+ | Git clone + copy | Tencent AI-Infra-Guard |
| 内置规则 | 规则库 | Skill / MCP / Plugin 专项检测 | 24+ | 打包在 CLI 中 | sca-cli 内置 |

所有数据源均存储在本地 SQLite 数据库，**首次同步后完全离线可用**。

### 2.2 漏洞库详解

#### OSV（Open Source Vulnerabilities）

OSV 是 Google 维护的开放漏洞数据库，sca-cli 同步其 PyPI 和 npm 两个生态的完整数据：

```bash
# 数据文件（首次同步后缓存）
~/.sca-cli/cache/osv-pypi.zip   # ~24 MB，20,000+ 条
~/.sca-cli/cache/osv-npm.zip    # ~200 MB，220,000+ 条
```

每条 OSV 记录包含：CVE/ID、摘要、详细描述、CVSS 评分、受影响的包与版本范围、修复版本、引用链接、别名映射。sca-cli 在同步时自动从 CVSS 向量中提取评分并映射为严重等级（critical / high / medium / low / info）。

**特点：**
- 开源免费，无需 API Key
- 全量 zip 下载，适合离线环境
- 关注 Python 和 npm 两大 Agent Skill 常用生态
- 增量更新：重新下载最新 zip 即可

#### GHSA（GitHub Advisory Database）

GHSA 是 GitHub 维护的漏洞公告数据库，覆盖 GitHub 上所有仓库的安全公告：

```bash
# 数据文件（同步后以 Git 仓库形式缓存）
~/.sca-cli/cache/github-advisory-database/  # ~800 MB
```

**特点：**
- 覆盖面广：不仅包含 OSV 已有的 CVE，还包含 GitHub 独有的 GHSA 编号漏洞
- 数据格式：JSON 文件，按年份/月份/GHSA-ID 组织
- 严重等级：GitHub 预评文本等级（CRITICAL / HIGH / MODERATE / LOW）
- 更新方式：`git pull` 增量拉取，每次只下载变更部分

**关键坑点：** GHSA 目录结构 2023 年后发生了变化——从 `advisories/github-reviewed/` 单层目录变为 `advisories/unreviewed/YYYY/MM/GHSA-xxxx/GHSA-xxxx.json` 格式。sca-cli 的 sync 命令会自动扫描两种目录结构。

#### Grype DB

Grype DB 是 Anchore Grype 扫描器的内置漏洞数据库，通过 `grype db update` 更新：

```bash
grype db update
```

**特点：**
- 实时更新，与 NVD / RedHat / Ubuntu 等官方源同步
- 在 sca-cli 中作为运行时漏洞扫描引擎使用（非本地导入）
- 主要用于 `sca-cli scan --vuln` 模式下对 SBOM 组件的漏洞检测

### 2.3 特征库详解

#### SPDX 许可证库

SPDX（Software Package Data Exchange）是 Linux 基金会维护的许可证标准库：

```bash
# 数据文件
~/.sca-cli/cache/spdx-licenses.json  # ~330 KB
```

包含 727 条标准许可证信息，每条记录包含：SPDX ID、全名、OSI 批准状态、引用 URL。用于检测扫描到的组件许可证是否合规。

#### AIG 规则库

AI-Infra-Guard 是腾讯开源的 AI 基础设施安全检测套件。sca-cli 同步其三项核心数据：

| 子目录 | 内容 | 规则数 |
|--------|------|:------:|
| data-fingerprints/ | AI 框架/中间件版本指纹 | ~500 |
| data-vuln/ | AI 组件已知漏洞规则 | ~500 |
| data-mcp/ | MCP 协议安全检测规则 | ~500 |

```bash
# 同步后存放路径
~/.sca-cli/rules/ai-infra/data-fingerprints/
~/.sca-cli/rules/ai-infra/data-vuln/
~/.sca-cli/rules/ai-infra/data-mcp/
```

**特点：**
- 聚焦 AI Infra 场景（Dify / Langflow / Ollama / ComfyUI 等）
- YAML/JSON 格式，与 sca-cli 规则引擎兼容
- 随项目持续更新

#### 内置规则

sca-cli 默认携带 24+ 条 YAML 格式的检测规则，分类如下：

| 规则类别 | 数量 | 检测目标 |
|---------|:----:|---------|
| MCP 工具安全 | 5 | 任意命令执行、文件路径遍历、URL 注入 |
| Skill 元数据 | 4 | 指令投毒、隐藏行为、权限滥用 |
| Python 安装脚本 | 5 | shell 执行、下载执行、密钥读取 |
| JavaScript 安装脚本 | 3 | child_process、下载执行、混淆脚本 |
| 高危 API（Python） | 3 | eval/exec/subprocess/os.system |
| 高危 API（JS） | 2 | child_process、eval |
| 许可证策略 | 2 | 禁止/限制许可证检测 |

内置规则存储在 `src/sca_cli/rules_builtin/` 目录，按语言/场景分目录管理。

#### 为什么不需要「三方库特征库」

一个常见的认知是：SCA 工具需要维护一个「全量三方包名与版本数据库」才能工作。**这是误解。**

sca-cli 的依赖提取是**实时扫描、而非查库匹配**的：

```
扫描目标（zip / 目录 / Git URL）
    ↓
读取 lockfile / 文件系统分析
    ├── pyproject.toml / requirements.txt / poetry.lock / Pipfile.lock
    ├── package.json / package-lock.json / yarn.lock / pnpm-lock.yaml
    └── Syft 直接分析文件系统二进制和源码
    ↓
得到依赖清单 ← 这是从被扫描项目本身实时提取的
    ↓
漏洞库（OSV / GHSA）做匹配：
    这个包名 + 这个版本 → 有没有已知 CVE？
```

**关键区别：**

| 环节 | 方法是 | 不是靠 |
|------|--------|--------|
| 发现依赖 | 读 lockfile / Syft 分析文件系统 | 从包名数据库查询「有哪些包」 |
| 判断风险 | 包名 + 版本 → 查漏洞库匹配 CVE 范围 | 包名本身的元数据（大小、描述、主页） |
| 检测安装脚本 | 读取被扫描项目中的 setup.py / package.json | 外部特征库 |
| 检测高危 API | AST 或正则扫描源码 | 外部特征库 |

**那开源包的知识索引库（如 Libraries.io、PyPI JSON API）对 sca-cli 有用吗？**

| 用途 | 是否需要 | 说明 |
|------|:--------:|------|
| 依赖提取 | ❌ | lockfile / Syft 比任何数据库更准确 |
| 漏洞匹配 | ❌ | OSV / GHSA 已覆盖 |
| 许可证匹配 | ❌ | SPDX 标准库已覆盖 |
| 拼写劫持检测（typosquatting） | ⏳ P2 规划 | 可通过按需查询 PyPI/npm 搜索 API 实现，无需预装全量库 |
| 包流行度 / 维护度评分 | ❌ 不在范围 | 属于软件物料清单管理范畴，非安全扫描 |

**一句话总结：** 市场上有全量包元数据索引（Libraries.io 曾维护 500 万+ 开源包），但对 sca-cli 的核心扫描流程——依赖提取、漏洞匹配、规则检测——没有增量价值。依赖是从被扫描项目里读出来的，不是查数据库猜出来的。

#### 首次初始化

```bash
# 创建数据目录和空数据库
sca-cli init --home ~/.sca-cli

# 验证环境
sca-cli doctor --home ~/.sca-cli
```

`doctor` 命令会检查：Python 版本、SQLite 可用性、外部工具（Syft / Grype / pip-audit / npm / git）是否安装、数据目录和数据库状态。

#### 数据同步

```bash
# 全量同步（所有配置的数据源）
sca-cli sync --all --home ~/.sca-cli

# 同步指定数据源
sca-cli sync --source osv --home ~/.sca-cli
sca-cli sync --source ghsa --home ~/.sca-cli
sca-cli sync --source spdx --home ~/.sca-cli
sca-cli sync --source aig --home ~/.sca-cli
sca-cli sync --source grype-db --home ~/.sca-cli

# 查看同步状态
sca-cli db status --home ~/.sca-cli
```

**同步流程：**
1. OSV：检查本地 zip 缓存 → 有新版本则下载 → 解压 → batch 插入 SQLite → 更新状态
2. GHSA：检查本地 git 仓库 → `git pull` 增量更新 → 遍历 JSON 文件 → 多线程解析 → batch 插入
3. SPDX：检查本地 JSON 缓存 → 下载（如需要）→ batch 插入
4. AIG：`git clone`（首次）或 `git pull`（增量）→ 复制到 rules/ai-infra/ 目录
5. Grype DB：执行 `grype db update` 更新运行时扫描数据库

#### 数据使用

同步后的数据在以下命令中自动使用：

```bash
# 漏洞扫描（使用 OSV + GHSA + Grype DB）
sca-cli scan ./target --vuln --home ~/.sca-cli

# 威胁情报报告（使用 OSV + GHSA）
sca-cli intel report --range 24h --home ~/.sca-cli

# 规则扫描（使用内置规则 + AIG 规则）
sca-cli scan ./target --rules --home ~/.sca-cli

# 许可证检测（使用 SPDX）
sca-cli scan ./target --license --home ~/.sca-cli
```

不需要手动指定使用哪个数据源——scan 和 intel 命令会自动查询所有已同步的数据。

#### 数据更新策略

```bash
# 推荐：每周全量同步
crontab -e
# 每天凌晨 2 点更新漏洞库
0 2 * * * cd /path/to/sca-cli && sca-cli sync --all --home ~/.sca-cli
```

- OSV：重新下载最新 zip 即可全量替换，建议每周一次
- GHSA：`git pull` 增量更新，建议每周一次
- SPDX：许可证库变动较小，每月检查一次即可
- AIG：规则持续更新，建议每月同步一次
- Grype DB：建议每次扫描前执行 `grype db update`

#### 离线环境使用

```bash
# 在联网环境导出
sca-cli sync --all --home ~/.sca-cli
sca-cli sync --offline-export ~/sca-cli-bundle.zip --home ~/.sca-cli

# 在隔离环境导入
sca-cli sync --offline-import ~/sca-cli-bundle.zip --home /opt/sca-cli
```

### 2.5 常见问题与解决

#### 数据库被锁定（"database is locked"）

**现象：** sync 或 scan 命令报 `database is locked` 错误。

**原因：** 上一个 sync 进程被中断（如 Ctrl+C、超时），SQLite 事务未完成，留下了热 journal 文件。

**解决方案：**
```bash
# 不要尝试修复被锁的文件——直接建新库
sca-cli init --home ~/.sca-cli-v2

# 拷贝缓存文件（避免重新下载）
cp ~/.sca-cli/cache/osv-pypi.zip ~/.sca-cli-v2/cache/
cp ~/.sca-cli/cache/osv-npm.zip ~/.sca-cli-v2/cache/
cp ~/.sca-cli/cache/spdx-licenses.json ~/.sca-cli-v2/cache/
# 注意：GHSA 目录太大不要 cp，用 git pull
cd ~/.sca-cli-v2/cache && git clone https://github.com/github/advisory-database.git

# 重同步
sca-cli sync --all --home ~/.sca-cli-v2
```

**核心原则：** 数据库损坏不可逆，放弃修复、建新库、重同步是最快的路径。

#### 同步超时

**OSV 超时（240k 条插入太慢）：**

原因：原代码使用 `_upsert_vulnerability` 逐条 INSERT，240k 条 × 每次 ~10 次 SQL 操作 = 240 万次操作。

解决：使用 batch `executemany`，每 500 条一批，一次提交。优化后 OSV 同步时间从 >10 分钟降至约 30-60 秒。

**GHSA 超时（118k 文件遍历 + 解析）：**

原因：`pathlib.rglob("*.json")` 在 Windows 上遍历 56k+ 个目录极慢；逐条读取 + JSON 解析也是单线程瓶颈。

解决：用 `os.walk` 替代 `rglob`，用 8 线程并行读取解析。优化后从超时 600s 降至约 2-3 分钟。

#### GHSA 0 条记录

**现象：** `sca-cli sync --source ghsa` 显示 `ok` 但 0 条记录。

**原因：** 代码只搜索 `advisories/github-reviewed/` 目录，但新版 GHSA 仓库的 JSON 文件放在 `advisories/unreviewed/YYYY/MM/GHSA-xxxx/` 下。

**解决：** 同时扫描 `github-reviewed` 和 `unreviewed` 两个目录。

#### severity 解析错误

**现象：** `'list' object has no attribute 'lower'`。

**原因：** GHSA 的 `severity` 字段是 `[{"type": "CVSS_V3", "score": "CVSS:3.1/..."}]` 列表格式，代码直接调用了 `.lower()`。

**解决：** 使用 `database_specific.severity` 字段获取 GitHub 预计算的文本严重等级（"CRITICAL" / "HIGH" / "MODERATE" / "LOW"）。

#### cache 目录拷贝太慢

**现象：** 拷贝 GHSA 的 Git 仓库（79k 文件、800 MB）花费数分钟。

**解决：** 不要 `cp`，用 `git pull` 更新；OSV zip 和 SPDX JSON 文件很小可以直接拷贝。

### 2.6 实战案例：完整同步 + 扫描流程

```bash
# 1. 初始化
sca-cli init --home ~/.sca-cli
sca-cli doctor --home ~/.sca-cli

# 2. 同步数据源
sca-cli sync --source spdx --home ~/.sca-cli     # 实时（缓存文件）
sca-cli sync --source osv --home ~/.sca-cli        # ~1 分钟
sca-cli sync --source ghsa --home ~/.sca-cli       # ~2-3 分钟
sca-cli sync --source aig --home ~/.sca-cli        # ~10 秒
sca-cli sync --source grype-db --home ~/.sca-cli   # ~30 秒

# 3. 验证数据库
sca-cli db status --home ~/.sca-cli

# 4. 扫描目标
sca-cli scan ~/Downloads/some-skill.zip --vuln --rules --report \
  --format html,md,json --home ~/.sca-cli

# 5. 查看报告
open ~/.sca-cli/reports/latest/scan_report.html

# 6. 定期更新：配置 cron
crontab -e
# 0 3 * * 1 cd /opt/sca-cli && sca-cli sync --all --home ~/.sca-cli
```

**同步完成后数据库典型规模：**
- 漏洞总数：~350,000 条（OSV + GHSA 去重后）
- 许可证：727 条
- AIG 规则：~1,500 条
- 数据库文件大小：~1.3 GB
- 缓存目录大小：~1.1 GB（OSV zips + GHSA git repo + SPDX JSON）

---

## 三、产品介绍

### 3.1 一句话价值

> **sca-cli 是一款专为 AI Agent 生态打造的供应链安全扫描工具——在你部署任何一个 Skill、MCP Server 或 AI Plugin 之前，先让它帮你扫一遍，告诉你里面有没有雷。**

### 3.2 为什么你需要它

去年 Log4j 漏洞爆发时，整个行业都在问同一个问题：**我怎么知道我用了什么？**

今天这个问题在 AI Agent 领域变得更大、也更紧迫。

你的团队可能已经在使用 ClawHub、MCP 市场或内部开发的 Agent Skills。这些 Skills 中有多少是经过安全审查的？它们的依赖中有没有已知漏洞？安装脚本会不会在后台执行恶意代码？Tool description 里有没有被植入指令投毒？

这些问题的答案，大多数企业给不出来。这不是能力问题——是因为市场上**根本没有面向 Agent Skill 供应链的专业扫描工具**。传统的 SCA 工具不理解 MCP Server 是什么，不知道 AI Plugin 的元数据格式，更不会去检查 tool description 里有没有"忽略之前指令"这类投毒模式。

sca-cli 就是为填补这个空白而生的。

### 3.3 市场差异化优势对比

与传统 SCA 工具和通用安全扫描器相比，sca-cli 在以下维度具有显著优势：

| 能力维度 | 传统 SCA（如 OWASP DC） | 通用漏洞扫描器 | sca-cli |
|---------|:---------------------:|:------------:|:-------:|
| Agent Skill / MCP / Plugin 识别 | ❌ | ❌ | ✅ 原生支持 |
| SBOM 生成（CycloneDX） | ✅ | 部分支持 | ✅ Syft 集成 + 内置 fallback |
| 依赖漏洞扫描 | ✅（Java 为主） | ✅ | ✅ Python/JS 双生态 |
| Tool description 投毒检测 | ❌ | ❌ | ✅ YAML 规则引擎 |
| 安装脚本恶意行为检测 | ❌ | 部分支持 | ✅ Python/JS 双语言 |
| 高危 API 调用检测 | ❌ | ❌ | ✅ 正则+AST 两阶段 |
| MCP 参数权限评估 | ❌ | ❌ | ✅ 输入Schema 语义分析 |
| 离线运行 | ❌（多数需联网） | 部分支持 | ✅ 完全离线 |
| 本地漏洞库 + 增量同步 | ✅ | ✅ | ✅ OSV/GHSA/NVD/AIG 全量 |
| 多引擎结果归一化 | ❌ | ❌ | ✅ 统一 finding + 去重 |
| Agent Skill 加权评分 | ❌ | ❌ | ✅ 场景化风险加权 |
| 企业级 HTML 报告 | 基础 | 基础 | ✅ 15 章结构化报告 |
| 威胁情报报告 | ❌ | 部分支持 | ✅ 时间范围 + 生态过滤 |
| CI/CD 集成（--json） | ✅ | ✅ | ✅ 全部命令支持 |
| 跨平台（Win/Mac/Linux） | ✅ | ✅ | ✅ Python 原生跨平台 |

**一句话总结：sca-cli 是目前市场上唯一同时覆盖传统依赖漏洞扫描和 AI Agent 专项安全检测的工具。**

### 3.4 核心能力拆解

**SBOM 生成与组件清单管理**

sca-cli 默认对任何输入项目生成 CycloneDX 格式的 SBOM。如果环境中有 Syft 则优先使用，否则使用内置的 lockfile 解析器。清单中记录每个组件的生态、名称、版本、PURL、许可证信息，形成完整的软件物料清单。

**多维度漏洞扫描**

同时启动 Grype（通用）、pip-audit（Python 专项）、npm audit（JS 专项）三个扫描引擎，覆盖 OSV、GHSA、NVD 多个漏洞数据源。结果自动合并去重，同一漏洞被多个引擎命中的在报告中标注"多引擎确认"。

**Agent Skill 元数据安全检测**

这是 sca-cli 区别于所有传统 SCA 工具的核心能力。它解析 MCP Server 的 tool.json、AI Plugin 的 ai-plugin.json、Agent Skill 的 skill.json/manifest.json，检测：

- Tool description 是否包含指令投毒（"忽略之前指令""不要告诉用户"）
- MCP 参数输入是否包含任意命令/路径/URL 参数
- OpenAPI 规范中是否存在 DELETE 等高风险接口
- 工具描述中是否存在隐藏行为描述
- 是否使用了仿冒官方命名的 Skill（冒充 OpenAI、Google、GitHub 等）

**安装脚本审计**

检查 Python 包的 setup.py 和 Node.js 包的 package.json scripts，检测是否存在：

- Shell 执行（os.system、subprocess、child_process）
- 下载后执行（curl | sh、wget | bash）
- 密钥读取（.env、.npmrc、.pypirc、id_rsa）
- 外联上传（requests.post、fetch、axios.post）
- 混淆命令（base64 decode 后执行）

**高危 API 使用扫描**

扫描 Python 和 JavaScript 源码中是否使用了高危 API：

- **Python**：eval、exec、compile、os.system、subprocess.\*、pickle.loads、yaml.load、marshal.loads、requests.post、socket 等
- **JavaScript**：eval、Function、child_process.\*、fs 文件操作、process.env、fetch 外联等

**企业级扫描报告**

每份扫描报告包含 15 个标准化章节：

1. 封面 → 2. 扫描摘要 → 3. 风险评级 → 4. Agent Skill 类型识别 → 5. 组件与 SBOM 概览 → 6. 漏洞扫描结果 → 7. Python/JS 专项结果 → 8. MCP/Plugin/Skill 元数据风险 → 9. 安装脚本风险 → 10. 高危 API 使用 → 11. 许可证风险 → 12. 威胁情报关联 → 13. 修复建议 → 14. 附录：组件清单 → 15. 附录：原始扫描器信息

HTML 报告自带 CSS，不依赖外网，可在隔离环境正常查看。每个 finding 都包含证据位置和修复建议，关键风险置顶。

**威胁情报报告**

基于本地同步的漏洞库，按时间范围、生态、严重性生成威胁情报报告，帮助安全团队追踪与 Agent Skill 相关的漏洞动态。支持 `sca-cli intel report --range 24h --ecosystem pypi,npm --focus agent`。

### 3.5 使用场景

**场景一：第三方 Skill 准入审核**

你的团队准备从 ClawHub 或 MCP 市场下载使用一个第三方 Skill。在部署之前，跑一次扫描：

```bash
sca-cli scan ./downloaded-skill --vuln --report
```

报告会告诉你：这个 Skill 依赖了哪些组件、是否有已知漏洞、元数据是否包含投毒、安装脚本是否安全、是否使用了高危 API。

**场景二：内部开发的 Agent Skill 发布前自检**

你的开发团队开发了一个新的 MCP Server，准备发布到内部市场。在发版前扫描：

```bash
sca-cli scan ./my-mcp-server --vuln --rules --report --fail-on high
```

`--fail-on high` 确保任何高风险问题都会阻断发布流程。与 CI/CD 流水线集成后，形成"未通过扫描不得发版"的自动化门禁。

**场景三：存量 Agent 资产的批量安全盘点**

你的组织已经有上百个 Agent Skills 在生产环境中运行。批量扫描：

```bash
for dir in /data/agent-skills/*/; do
  sca-cli scan "$dir" --vuln --report
done
```

扫描结果全部存入 SQLite，支持后续查询、统计分析、趋势追踪。

**场景四：Agent 供应链威胁情报监控**

每天早上自动执行威胁情报报告：

```bash
sca-cli intel report --range 24h --focus agent --format html,md
```

关注过去 24 小时内与 Agent Skill 常用组件相关的新增漏洞，及时评估是否需要修复。

### 3.6 安全与合规承诺

| 承诺 | 说明 |
|------|------|
| **不联网也能用** | 默认扫描不联网，除非用户主动执行 sync 或输入 URL |
| **不执行被扫描代码** | 不运行安装脚本、不执行业务代码 |
| **输入隔离** | 下载/解压全部落到隔离工作目录 |
| **路径穿越防护** | 解压前逐文件路径合法性校验 |
| **私有化部署** | 本地数据库、本地规则、本地报告 |
| **离线升级** | 支持离线导出/导入漏洞库和规则包 |
| **CI/CD 就绪** | 全部命令支持 `--json` 输出 |

### 3.7 适用客户

sca-cli 适用于以下场景和客户群体：

- **AI Agent 平台团队**：需要对 Agent 市场中的 Skills 做安全审核
- **企业内部 Agent 开发团队**：发布前自检、存量资产盘点
- **安全运营团队**：Agent 供应链威胁监控、漏洞预警
- **合规审计团队**：SBOM 生成、许可证合规审查、供应链安全报告
- **AI Infra 供应商**：确保分发的 MCP Server / Plugin 经过安全检测
- **政府与关键信息基础设施单位**：需要完全离线、可审查的供应链安全方案

### 3.8 路线图

| 阶段 | 内容 | 时间 |
|------|------|------|
| v1.0 (MVP) | 本地目录扫描、SBOM 生成、漏洞扫描（Syft+Grype）、Skill 规则扫描、安装脚本检查、HTML/MD 报告 | 当前 |
| v1.1 | 威胁情报报告、AI-Infra-Guard 规则导入、离线升级 | 短期 |
| v2.0 | Dify/Langflow/FastGPT/Open WebUI/ComfyUI/Ollama 等 AI Infra 组件扫描、AST 级别高危 API 检测 | 中期 |
| v2.5 | Web 管理后台、多用户、扫描策略管理 | 长期 |

---

**参考链接：**
- sca-cli 规格文档 v2.0：内部项目
- 相关阅读：[OpenSCA-cli：用开源的方式做开源风险治理](https://zhupite.com/tool/2026-06-11-opensca-cli-scatool.html)
- 相关阅读：[360 SkillsGuard：AI Agent Skills 安全风险检测平台](https://zhupite.com/sec/2026-06-11-360-skillsguard-agent-skills-security.html)
