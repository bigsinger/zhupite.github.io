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

## 二、产品介绍

### 2.1 一句话价值

> **sca-cli 是一款专为 AI Agent 生态打造的供应链安全扫描工具——在你部署任何一个 Skill、MCP Server 或 AI Plugin 之前，先让它帮你扫一遍，告诉你里面有没有雷。**

### 2.2 为什么你需要它

去年 Log4j 漏洞爆发时，整个行业都在问同一个问题：**我怎么知道我用了什么？**

今天这个问题在 AI Agent 领域变得更大、也更紧迫。

你的团队可能已经在使用 ClawHub、MCP 市场或内部开发的 Agent Skills。这些 Skills 中有多少是经过安全审查的？它们的依赖中有没有已知漏洞？安装脚本会不会在后台执行恶意代码？Tool description 里有没有被植入指令投毒？

这些问题的答案，大多数企业给不出来。这不是能力问题——是因为市场上**根本没有面向 Agent Skill 供应链的专业扫描工具**。传统的 SCA 工具不理解 MCP Server 是什么，不知道 AI Plugin 的元数据格式，更不会去检查 tool description 里有没有"忽略之前指令"这类投毒模式。

sca-cli 就是为填补这个空白而生的。

### 2.3 市场差异化优势对比

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

### 2.4 核心能力拆解

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

### 2.5 使用场景

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

### 2.6 安全与合规承诺

| 承诺 | 说明 |
|------|------|
| **不联网也能用** | 默认扫描不联网，除非用户主动执行 sync 或输入 URL |
| **不执行被扫描代码** | 不运行安装脚本、不执行业务代码 |
| **输入隔离** | 下载/解压全部落到隔离工作目录 |
| **路径穿越防护** | 解压前逐文件路径合法性校验 |
| **私有化部署** | 本地数据库、本地规则、本地报告 |
| **离线升级** | 支持离线导出/导入漏洞库和规则包 |
| **CI/CD 就绪** | 全部命令支持 `--json` 输出 |

### 2.7 适用客户

sca-cli 适用于以下场景和客户群体：

- **AI Agent 平台团队**：需要对 Agent 市场中的 Skills 做安全审核
- **企业内部 Agent 开发团队**：发布前自检、存量资产盘点
- **安全运营团队**：Agent 供应链威胁监控、漏洞预警
- **合规审计团队**：SBOM 生成、许可证合规审查、供应链安全报告
- **AI Infra 供应商**：确保分发的 MCP Server / Plugin 经过安全检测
- **政府与关键信息基础设施单位**：需要完全离线、可审查的供应链安全方案

### 2.8 路线图

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
