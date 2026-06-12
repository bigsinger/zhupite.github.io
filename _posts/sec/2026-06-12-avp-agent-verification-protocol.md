---
layout: post
title: "Agent Vault Proxy：让 AI Agent 永远看不见真正的 API Key"
categories: [sec]
description: "Agent Vault Proxy（AVP）是一个在 Hacker News 上引起热议的开源项目，由 inflightsec 发布。核心机制：Agent 只持有占位符（placeholder），真正的 API Key 由 HTTPS 代理在请求出站前最后一刻从 Bitwarden 实时注入。Agent 进程的内存、日志、env 里从来不出现真实凭证。支持按 HTTP 方法/路径粒度控制权限，已部署即用。"
tags:
  - AVP
  - Agent Vault Proxy
  - 凭证安全
  - 开源项目
  - inflightsec
  - Bitwarden
  - 代理注入
  - 提示注入防御
---

6月12日，Hacker News 上出现了一个讨论热度很高的开源项目——**Agent Vault Proxy（AVP）**，由 [inflightsec](https://github.com/inflightsec) 发布。

项目地址：[github.com/inflightsec/agent-vault-proxy](https://github.com/inflightsec/agent-vault-proxy)

核心理念一句话：
> **"Your agent (dev laptop, CI runner, cron job, etc) gets a fake placeholder string and uses it as if it were a real API key."**

Agent 的 env 里只放一个**占位符**（比如 `sk-ant...EFGH`），真正的 API Key 在 Bitwarden Secrets Manager 里。AVP 作为一个本地环回 HTTPS 代理，在请求出站前的最后一刻完成替换。

## 问题：为什么你的 Agent 不应该持有真实凭证

当前 AI Agent 的身份管理模型普遍存在一个致命缺陷——**Agent 进程持有真实凭证字节**。

| 风险场景 | 发生方式 |
|---------|---------|
| **提示注入泄露** | 输入源（网页/邮件/PR评论）携带恶意指令，Agent 被引导输出 env 中的 API Key |
| **供应链攻击** | 植入的恶意 npm 包以 Agent 的 UID 运行，读取 env 中的凭证 |
| **日志泄露** | Agent 将凭证写入调试日志 |
| **工具调用泄露** | Agent 调用分析工具时把凭证作为参数传入 |

现有应对方案都假设"Agent 注定持有凭证，我们只能保护它"——加密存储、访问控制、运行时监控。但 AVP 的切入点是：**既然 Agent 会泄露，不如让它根本没有可泄露的凭证字节。**

> "Filtering, alignment, allowlists - are all statistical and all imperfect. The bytes shouldn't be there to exfil in the first place." — AVP 项目 README

## AVP 的架构

```
传统模型：
  Agent 进程 ──持有一把──→ 上游 API
               API Key        (GitHub/Anthropic/OpenAI...)
  
AVP 模型：
  Agent 进程 ─── 占位符 ──→ AVP 代理 (127.0.0.1:14322)
                                │
               ┌────────────────┴────────────────┐
               │  1. 检查 bindings.yaml 是否有匹配 │
               │  2. 从 Bitwarden 实时获取真实凭证  │
               │  3. 在出站 socket 上替换占位符→真值 │
               │  4. fsync 审计事件到磁盘          │
               └────────────────┬────────────────┘
                                │
                                ▼
                          上游 API
```

Agent 的 env 只有：
```bash
export ANTHROPIC_API_KEY="sk-ant...EFGH"  # 占位符，非真实 Key
export HTTPS_PROXY="http://127.0.0.1:14322"  # 流量走 AVP
```

Agent 代码完全无感——它继续用 `os.getenv("ANTHROPIC_API_KEY")`，拿到的是占位符，直接往请求里塞。代理在请求出站时完成替换。

## 配置：bindings.yaml

所有安全策略通过一份 YAML 文件声明：

```yaml
version: 1

secrets:
  ANTHROPIC_API_KEY:
    placeholder: "sk-ant...EFGH"          # Agent env 里放的值
    inject:
      header: "Authorization"              # 注入到 HTTP Header
      format: "Bearer {ANTHROPIC_API_KEY}"  # {SECRET_NAME} 被实时替换
    bindings:
      - host: "api.anthropic.com"          # 仅对此目标生效
        methods: [POST]                    # 仅 POST 请求
        paths: ["/v1/messages"]            # 仅此路径

  GITHUB_PAT:
    placeholder: "github...1234"
    inject:
      header: "Authorization"
      format: "Bearer {GITHUB_PAT}"
    bindings:
      - host: "api.github.com"
        methods: [POST]
        paths: ["/repos/*/*/pulls"]        # Agent 只能开 PR，不能删仓库
```

关键设计点：

- **默认拒绝**——没有 binding 匹配的请求，占位符原样转发，上游返回 401
- **方法+路径粒度**——即使 Agent 持有 GitHub 的 placeholder，也只能在 `POST /repos/*/*/pulls` 上使用
- **多 binding 支持**——一个凭证可以绑定到多个 host/method/path 组合

## 性能：几乎无感

AVP 官方数据：

| 场景 | 延迟增量 |
|------|---------|
| **稳定状态**（缓存命中） | **1-3 ms** per request（Header 重写 + fsync 审计） |
| **首次获取**（缓存未命中） | +100-300 ms（一次性的，从 Bitwarden 拉取） |
| **新鲜 TLS 握手** | +5-20 ms（一次性的，连接保持 warm） |

换句话说——**和直连几乎没有区别**。考虑到 LLM API 本身每次调用已经 200-2000 ms，AVP 的 1-3 ms 增量基本是噪声。

## 部署方式

支持两种方式：

### Docker 部署

```bash
docker compose up
```

项目自带了 `docker-compose.yml` 和 `Dockerfile`。

### Systemd 部署

```bash
docs/install-systemd.md
```

适合在开发机或服务器上作为系统服务运行。

## 适用场景

### 核心场景：AI Agent 凭证保护

Agent 访问 Anthropic/OpenAI/GitHub API 时，代理层在最后一刻注入真实 Key。即使 Agent 被注入攻击，攻击者也只能拿到 `sk-ant...EFGH` 这个占位符。

### 扩展场景：任何持有凭证的进程

AVP 不限于 AI Agent。原理完全通用：

> "CI runners, build servers, scrapers, cron jobs, or a developer machine you're hardening against software-supply-chain compromise."

任何需要调用外部 API 的自动化进程，都可以通过 AVP 保护其凭证。

## 与同类方案的对比

AVP 文档中有专门的对比文件 `docs/comparison.md`，比较了 HashiCorp Vault Agent、Doppler、`op run`、`superfly/tokenizer` 等方案。AVP 的独特定位是：

> "AVP is not a vault — and not trying to be. It's the just-in-time wire-substitution layer that sits between your vault and your agent's process."

它不是一个密钥管理系统，而是一个**运行时线缆替换层**。你可以继续使用你信任的 vault（Bitwarden 是目前参考实现，其他 via 适配器接入）。

## AVP 的设计边界

项目很坦诚地说明了它做不到什么：

- **不防滥用**——如果 binding 没有配 method/path 范围，注入攻击仍然可以让代理认证一个 `DELETE` 请求。method/path 绑定是对策
- **不防响应泄露**——代理在请求阶段替换凭证，但如果上游 API 在响应体中回显 Authorization 头，AVP 不做 scrubbing
- **不替代网络层隔离**——建议与 egress firewall 配合使用

这些边界是清晰的设计决策，不是缺陷。知道自己在防御什么、不防御什么，比什么都防但都防不住要好。

## 结语

Agent Vault Proxy 是 6 月这个 Agent 安全"发布潮"中，唯一一个以**具体可部署的开源项目**形式出现的答案。它不是一份指南、一个框架、一个标准——它就是一个你可以 `git clone` 下来、改几行配置、启动后立即生效的工具。

如果我要给这个项目找个定位：它把"Agent 不持有秘密"这个理念，变成了一个**生产级可用的工具**。这可能是它和其他所有 Agent 安全讨论最大的区别。
