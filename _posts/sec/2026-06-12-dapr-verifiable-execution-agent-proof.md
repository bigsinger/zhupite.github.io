---
layout: post
title: "Dapr 1.18 可验证执行：给 AI Agent 的每一步操作盖上密码学印章"
categories: [sec]
description: "Diagrid 为 Dapr 1.18 引入可验证执行（Verifiable Execution）能力，为 AI Agent 的每一次工具调用、数据访问和状态变更生成不可篡改的密码学凭证。本文拆解其技术原理：基于不可变执行日志 + 去中心化身份（DID）的 Agent 行为审计方案，以及它在金融和医疗等强合规场景中的应用价值。"
tags:
  - Dapr
  - Diagrid
  - 可验证执行
  - 密码学证明
  - AI Agent
  - 审计追溯
  - 分布式运行时
  - 合规
---

昨天 SiliconANGLE 报道了 Diagrid 为 Dapr 1.18 引入的"可验证执行"能力。报道篇幅不长，但这可能是 6 月以来 Agent 安全领域最硬核的技术突破。

前几次我们聊的都是"如何检测和拦截恶意的 Agent 行为"——Unit 42 的签名验证、API 网关的流量拦截、JFrog 的 IDE 监督。但所有这些方案都假设你能**在 Agent 运行时实时拦截**。

如果 Agent 已经执行完了呢？如果事后审计发现某个 Agent 调用了不该调用的 API、访问了不该访问的数据，但**你拿不出证据**呢？

可验证执行解决的就是这个问题：**让 Agent 的每一次操作都留下密码学可验证的证据，任何人都可以独立验证。"

## 问题拆解：Agent 审计为什么比传统审计难

传统软件系统的审计有成熟的方案：应用日志 → 集中式日志系统（ELK/Splunk）→ 日志完整性保护（Log Forwarding + 访问控制）。

但 AI Agent 的审计有几个根本性的难点：

| 挑战 | 说明 |
|------|------|
| **操作速度** | Agent 一次任务可能触发数百次 API 调用，日志量爆炸 |
| **调用链复杂** | A 的调用结果决定 B 的参数，B 的结果决定 C——形成不可分割的调用链 |
| **去中心化执行** | Agent 可能在多个 Worker/容器中并行执行，日志分散 |
| **事后证明** | 传统日志可以被管理员篡改或删除，无法作为法律证据 |
| **跨组织审计** | Agent 可能在多个组织的系统间流转，需要统一的可信证据格式 |

Dapr 1.18 的可验证执行，正是针对这些难点给出的系统性方案。

## 技术原理：不可变日志 + 去中心化身份

Dapr 是一个开源的分布式运行时（Cloud Native Computing Foundation 孵化项目），它通过 Sidecar 模式为微服务提供通用的分布式能力——状态管理、服务调用、发布订阅、绑定等。Diagrid 是 Dapr 背后的商业化公司。

在 Dapr 1.18 中，可验证执行模块的工作流如下：

```
  Agent 发起操作
       │
       ▼
  ┌──────────────┐
  │  Dapr Sidecar │ ← 每个 Agent 实例旁边都有一个 Dapr Sidecar
  └──────┬───────┘
         │
         ├─ 1. 记录操作到不可变日志
         │    ├── 操作类型: tool_call / state_read / state_write / pubsub
         │    ├── 输入参数: [hash]
         │    ├── 输出结果: [hash]
         │    ├── 时间戳: T
         │    └── 关联 ID: parent_call_id → 形成调用链
         │
         ├─ 2. 生成 Merkle 证明
         │    └── 当前日志块哈希 + 前一块哈希 → Merkle DAG
         │
         ├─ 3. 用 DID 签名的凭证
         │    └── 使用 Agent 的去中心化身份 (DID) 签名整个日志条目
         │
         └─ 4. 凭证发布到可验证数据注册表
              └── 任何第三方都可以独立验证
```

### 不可变日志（Immutable Log）

这里的"不可变"不是靠访问控制（"只有管理员才能删日志"），而是靠**密码学链**——每个新的日志条目包含前一个条目的哈希值，形成一条哈希链（Merkle DAG）。理论上你可以删掉整条链，但不可能修改链中的任何一个条目而不被发现。

```
日志块 1                  日志块 2
┌────────────────────┐    ┌────────────────────┐
│ 操作: tool_call     │    │ 操作: state_read   │
│ 输入: hash(A)       │    │ 输入: key="order"  │
│ 输出: hash(B)       │    │ 输出: hash(data)   │
│ 时间: T1            │    │ 时间: T2            │
│ hash(prev)=null     │───→│ hash(prev)=0xabc   │───→ ...
│ DID 签名: SIG1      │    │ DID 签名: SIG2     │
└────────────────────┘    └────────────────────┘
```

如果你试图修改日志块 1 中的输出结果，那么：
1. 日志块 1 的哈希会变
2. 日志块 2 中的 `hash(prev)` 不再匹配
3. 所有后续日志块都断裂
4. 验证者能立刻判断出日志被篡改

### 去中心化身份（DID）

每个 Agent 实例在首次部署时通过 Dapr 的 DID 模块生成一个身份密钥对：

```
Agent 实例 ID: agent-7f3a2b9c
DID: did:dapr:7f3a2b9c
公钥: 0x4a2f...e8b1
私钥: [安全存储在 TPM/HSM/安全 enclave]
```

这个 DID 的作用是：**确保日志条目确实是由该 Agent 产生的**，而不是第三方伪造的。每次操作记录都用私钥签名，任何人可以用公钥验证签名的有效性。

### 可验证凭证（Verifiable Credential）

最终生成的凭证是一个标准的 W3C Verifiable Credential：

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "AgentExecutionCredential"],
  "issuer": "did:dapr:7f3a2b9c",
  "issuanceDate": "2026-06-12T08:30:00Z",
  "credentialSubject": {
    "agentId": "agent-7f3a2b9c",
    "workflowId": "wf-order-processing-001",
    "operations": [
      {
        "type": "tool_call",
        "tool": "payment-service/charge",
        "inputHash": "sha256:abc123...",
        "outputHash": "sha256:def456...",
        "timestamp": "2026-06-12T08:29:59.500Z",
        "parentOp": "wf-step-3"
      },
      {
        "type": "state_write",
        "key": "order:ORD-20260612-001",
        "valueHash": "sha256:789abc...",
        "timestamp": "2026-06-12T08:30:00.100Z",
        "parentOp": "tool_call-payment"
      }
    ],
    "merkleRoot": "sha256:chain_root_hash"
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-06-12T08:30:01Z",
    "verificationMethod": "did:dapr:7f3a2b9c#key-1",
    "proofPurpose": "assertionMethod",
    "signatureValue": "0x..."
  }
}
```

这个凭证可以被：
- **内部审计团队**验证 → 确认 Agent 没有执行未授权的操作
- **外部监管机构**验证 → 满足合规审计要求
- **客户/合作伙伴**验证 → 证明 Agent 没有泄露或篡改他们的数据

## 适用场景深度分析

### 金融场景：算法交易的"黑匣子"问题

高频交易 Agent 每秒钟可能执行几十次交易操作。如果后来发现某次交易违反了监管要求（比如在禁止时间段内交易），关键是**证明 Agent 当时确实执行了这次操作，且操作参数是什么**。

可验证执行提供的不只是一个日志条目——它提供了一条完整的**不可否认的证据链**：Agent X 在 T 时刻，通过 DID 签名，发出了交易指令 Y。

### 医疗场景：数据访问审计

HIPAA 等合规框架要求对患者数据的每一次访问都留下可审计的记录。当 AI Agent 为诊断而访问患者病历数据时，可验证执行确保：

- 每一次 `state_read` 都记录访问了哪个患者的记录
- 每一次 `tool_call` 都记录调用了哪个外部服务的 API
- 这些记录不可篡改、不可否认

### 跨组织 Agent 协作

当 Agent A（属于组织 X）调用 Agent B（属于组织 Y）的工具时，可验证凭证可以在组织间流转：

```
组织 X                 组织 Y
Agent A ──tool_call──→ Agent B
    │                      │
    │ 生成凭证 VC_A         │ 生成凭证 VC_B
    │                      │
    └────── 合并验证 ──────┘
              │
              ▼
      VC_A + VC_B → 完整的跨组织执行证明
```

## 现有方案 vs Dapr 方案

| 方案 | 不可篡改性 | 去中心化 | 跨组织验证 | 与 Agent 框架集成 |
|------|-----------|---------|-----------|----------------|
| 传统日志 (ELK) | ❌ 可被管理员删除 | ❌ 中心化 | ❌ 无统一格式 | ❌ 需自行实现 |
| 区块链日志 | ✅ 强 | ✅ 好 | ✅ 好 | ❌ 过于重量级 |
| eBPF 审计 | ✅ 内核级 | ❌ 单机 | ❌ 单机 | ❌ 内核层面 |
| **Dapr 1.18** | ✅ 密码学链 | ✅ DID | ✅ W3C VC 标准 | ✅ Sidecar 透明接入 |

## 局限性与值得关注的方向

### 性能开销

不可变日志 + DID 签名 + Merkle 链，每个操作都有额外的计算和存储开销。对于高频 Agent（每秒数百次操作），这可能会成为瓶颈。

**可能的优化**：批量签名（N 个操作合并为一个凭证）、轻量级哈希模式（仅记录输入/输出的哈希，不记录全量数据）。

### 私钥安全

整个信任链的根基是 Agent 的 DID 私钥。如果私钥泄露，攻击者可以伪造整个 Agent 的执行记录。Dapr 的私钥存储必须使用硬件安全模块（HSM/TPM）。

### 验证的可扩展性

理论上任何人都可以独立验证凭证，但实际中需要一套**凭证验证的基础设施**——谁维护验证服务？验证服务本身的可用性怎么保证？DID 的撤销机制怎么做？

## 结语

Dapr 1.18 的可验证执行，本质上是在回答 Agent 安全领域的一个根本问题：**你凭什么相信一个 Agent 做了或者没做什么**？

以前答案只能靠"我信这个日志系统"——但日志可以被删、被改、被绕过。Dapr 给出的答案是"你不必信任何人，你自己就能验证"——每步操作有哈希链锁定，有 DID 签名背书，有 Merkle 根作为整体完整性证明。

这不只是在给 Agent 加审计功能。这是在给 Agent 执行行为**建立密码学可信根**。对于金融、医疗这类"出了事要法庭见"的行业来说，这可能比任何运行时检测方案都更关键。
