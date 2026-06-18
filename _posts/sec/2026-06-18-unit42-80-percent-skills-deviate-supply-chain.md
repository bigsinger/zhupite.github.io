---
layout: post
title: "Unit 42 发现 80% 的 AI Agent Skills 行为偏离：Agent 技能生态的供应链安全危机"
categories: [sec]
description: "Palo Alto Networks Unit 42 扫描 OpenClaw 注册表上 49,943 个 AI Agent Skills，发现 80%（39,933 个）存在声明行为与实际行为不匹配。其中 5% 含多阶段攻击链，18.9% 的行为偏离源于恶意意图。数据窃取和间谍活动占恶意技能的 60%。BIV 工具使用 29 能力分类法 + AST 级污点分析进行检测。"
tags:
  - Unit 42
  - AI Agent
  - Skills
  - 供应链安全
  - Behavioral Integrity
  - OpenClaw
  - Palo Alto Networks
---

## 研究概况

Palo Alto Networks 的威胁情报团队 **Unit 42** 发布了一份关于 AI Agent Skills 生态的安全研究报告，扫描了 OpenClaw 注册表上全部 **49,943 个 AI Agent Skills（技能包）**，使用自研的 BIV（Behavioral Integrity Verification，行为完整性验证）工具进行三元比对分析。

结果令人震惊：**80% 的技能存在声明行为与实际行为不匹配。**

---

## 关键数据

| 指标 | 数值 |
|------|------|
| 扫描技能总数 | **49,943 个** |
| 行为声明不匹配 | **80%（39,933 个）** |
| 含多阶段攻击链 | **5%（2,490 个）**——需强制安全审查 |
| 行为偏离源于恶意意图 | **18.9%** |
| 数据窃取和间谍活动占比 | **60%**（恶意意图中） |
| 多阶段攻击链仅两种模式 | **88%** |

---

## BIV 方法论

Unit 42 的 BIV 工具使用 29 能力分类法，覆盖 7 个能力家族：

| 能力家族 | 检测维度 |
|---------|---------|
| 网络（Network） | 出站连接、数据传输 |
| 文件系统（Filesystem） | 文件读写、目录遍历 |
| 进程执行（Process） | 命令执行、子进程创建 |
| 环境（Environment） | 环境变量读取、系统信息收集 |
| 编码（Encoding） | Base64、加密混淆 |
| 凭证（Credentials） | API Key 读取、令牌访问 |
| 指令级威胁（Instruction-level Threats） | 提示注入、指令覆盖 |

检测方法结合三种技术：
- **确定性解析器**：处理元数据声明
- **LLM 分类器**：读取自然语言描述中的声明
- **静态分析器**：使用 **AST 级污点分析** 追踪代码中数据流向

---

## 攻击链模式

88% 的多阶段攻击链只遵循两种模式：

**模式 1：静默凭证外泄**
```
读取密钥 → Base64 编码 → 网络发送
```

**模式 2：指令覆盖劫持**
```
接管 Agent 决策循环 → 执行数据窃取
```

这种攻击链的"可预测性"意味着检测它们相对容易——但这恰恰也是最危险的，因为不遵循这两种模式的 12% 更难检测。

---

## 并非所有偏离都是恶意的

研究特别指出，**81.1% 的行为偏差**源于开发者疏忽而非恶意攻击：

- 文档记录错误
- 未使用声明的能力
- 框架依赖导致的意外权限要求

但这也构成了安全风险：一个粗心开发者写出的技能，可能因为权限过宽而在企业环境中被攻击者利用。

---

## 对企业的建议

1. **清查已安装的 Skills**——全面摸底当前企业 Agent 加载了哪些技能
2. **安装前执行 BIV 检查**——使用行为完整性验证工具评估新技能
3. **在供应商合同中要求能力声明认证**——将技能安全写入供应链要求
4. **关注 5% 的"高危"技能**——含多阶段攻击链的技能应有额外的审查流程

---

## 参考资料

- [Cybersecurity Insiders — AI Agent Supply Chain Security: Unit 42 Finds 80% of Skills Deviate](https://cybersecurity-insiders.com/unit-42-ai-agent-skills-supply-chain-security-behavioral-integrity-verification/)（2026-06-17）
- Palo Alto Networks Unit 42 研究报告
- OpenClaw Skills 注册表分析数据
