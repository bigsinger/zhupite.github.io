---
layout: post
title: "Agent 流量怎么拦？API 网关层面的 Agent 行为检测与拦截实现"
categories: [sec]
description: "Security Boulevard 提出 API 可见性是 AI Agent 最核心的防御手段。本文从工程实现角度拆解：如何在 API 网关层面识别 Agent 发起的 API 调用、定义 Agent 行为基线、实现实时拦截与熔断。包含 Kong/APISIX 插件示例、Agent 指纹识别规则和异常检测算法。"
tags:
  - API网关
  - Agent安全
  - 流量检测
  - Kong
  - APISIX
  - 行为分析
  - 零信任
  - 运行时防护
---

Security Boulevard 昨天发表了一篇值得细读的文章——《Deconstructing the Agentic Stack: Why API Visibility Is the Ultimate Defense for AI Agents》。核心观点很直接：**Agent 的一切交互都走 API，但现有的 API 安全方案完全没覆盖 Agent 流量**。

这不是一篇概念文章，它给了我们一个明确的工程方向。所以这篇不讲理念，直接讲怎么实现。

## Agent 流量和人类流量有什么不同？

传统 API 安全方案（WAF、速率限制、JWT 鉴权）是为人类行为设计的，所以它们对 Agent 流量的识别存在巨大的盲区。要拦截 Agent 流量，必须先能区分它。

| 维度 | 人类发起的 API 调用 | Agent 发起的 API 调用 |
|------|-------------------|---------------------|
| **频率** | 秒级到分钟级 | 毫秒级，一次任务触发数百次 |
| **调用链** | 单次请求 → 等待 → 单次请求 | 链式调用，A的结果决定B的参数 |
| **用户代理** | 浏览器/curl/Postman | 框架 SDK（LangChain/OpenAI/Anthropic） |
| **时间窗口** | 工作时间为主 | 7×24，高频无休 |
| **参数特征** | 相对稳定 | 动态生成，同一接口参数值分布广 |
| **错误容忍** | 出错后人工重试 | 自动重试 + 退避策略 |
| **调用路径** | 单一资源 | 跨系统跨资源 |

这些差异就是我们在 API 网关层做检测的信号基础。

## 架构设计：三层 Agent 流量检测

在 API 网关层面部署 Agent 流量分析模块，我建议分为三个层次：

### 第一层：指纹识别（识别谁是 Agent）

在请求进入网关时，第一时间判断其来源是否为 Agent。信号来源包括：

- **User-Agent**：检查已知的 Agent SDK 签名（`LangChain/0.3`、`openai-python/1.x`、`anthropic-python/0.x`）
- **TLS 指纹**：Agent SDK 使用标准的 HTTP 客户端库，JA3 指纹特征集中
- **请求时序**：Agent 往往在获得 LLM 响应后立即发起后续调用，间隔稳定且短
- **来源 IP / Service Account**：已知的 Agent 部署网段或专用服务账号

### 第二层：行为基线（学习 Agent 的正常行为）

每个 Agent 在首次部署后的"学习期"内建立行为基线：

```
Agent X 的基线（示例）：
  - 调用的 API 集合：{/api/orders, /api/inventory, /api/pricing}
  - 调用频率：平均 120 次/分钟，峰值为 300 次/分钟
  - 调用时间窗口：全天 7×24
  - 参数结构：order_id 始终为 UUID v4 格式
  - 错误率：< 2%
  - 跨 API 延迟：A→B 平均 800ms，B→C 平均 450ms
```

基线不是静态的——应该用滑动窗口（最近 N 分钟）动态更新，以适应 Agent 版本升级和行为模式进化。

### 第三层：异常检测与实时拦截

当 Agent 行为偏离基线时触发动作：

| 检测规则 | 触发条件 | 动作 |
|---------|---------|------|
| 新 API 调用 | 调用了训练期未出现的 API | 日志告警 + 加验证码 |
| 频率突增 | 调用量 > 基线 × 3 倍 | 降速 + 限流 |
| 参数异常 | 参数结构/类型不符合历史模式 | 拦截 + 审计 |
| 调用链偏移 | 调用顺序与历史模式不匹配 | 延迟响应 + 上下文检查 |
| 敏感操作 | 尝试调用高敏感 API（如删除、批量导出） | 二次确认 + 阻断 |

## 工程实现：以 Kong 为例

以下是基于 Kong API 网关 + 自定义插件的实现思路。

### Agent 指纹识别插件

```lua
-- kong-plugin-agent-fingerprint/handler.lua
local AgentFingerprints = {
  -- 已知 Agent SDK 的 User-Agent 指纹
  sdk_patterns = {
    "LangChain[/%d%.]+",
    "openai%-python[/%d%.]+",
    "anthropic%-python[/%d%.]+",
    "google%-generativelanguage[/%d%.]+",
    "cohere%-python[/%d%.]+",
    "crew%-ai[/%d%.]+",
    "autogen[/%d%.]+",
  },
  -- Agent 请求的时间间隔特征（毫秒级）
  agent_timeout_threshold = 500, -- Agent 连续请求间隔通常 < 500ms
}

function AgentFingerprints:match(header_user_agent)
  for _, pattern in ipairs(self.sdk_patterns) do
    if ngx.re.find(header_user_agent, pattern, "i") then
      return true, "sdk"
    end
  end
  return false
end
```

### 行为基线存储和异常评分

```python
# agent_behavior_analyzer.py — 在网关侧边服务运行
from collections import defaultdict
import time

class AgentBehaviorBaseline:
    def __init__(self, agent_id, window_seconds=300):
        self.agent_id = agent_id
        self.window = window_seconds
        self.api_calls = defaultdict(list)  # api -> [timestamps]
        self.api_params = defaultdict(set)  # api -> {param_signatures}
        self.call_chain = []  # [(api, timestamp), ...]
        self.learning = True
        self.learning_start = time.time()

    def record(self, api, params, latency):
        now = time.time()
        self.api_calls[api].append(now)
        param_sig = self._param_signature(params)
        self.api_calls[api] = [t for t in self.api_calls[api] if now - t < self.window]
        self.api_params[api].add(param_sig)
        self.call_chain.append((api, now))

    def anomaly_score(self, api, params, latency):
        """返回 [0, 1] 的异常分数，>0.7 建议拦截"""
        score = 0.0

        # 1. 未知 API 调用
        if api not in self.api_calls:
            score += 0.4

        # 2. 频率异常
        if api in self.api_calls:
            recent = len(self.api_calls[api])  # 窗口内的调用次数
            baseline = len(self.api_calls[api]) / (self.window / 60)
            if recent > baseline * 3:
                score += 0.3

        # 3. 参数结构异常
        if api in self.api_params:
            sig = self._param_signature(params)
            if sig not in self.api_params[api]:
                score += 0.2

        # 4. 调用链异常——跳过了历史路径中的某一步
        if len(self.call_chain) > 10:
            last_apis = [c[0] for c in self.call_chain[-10:]]
            if api not in last_apis and last_apis[-1] != api:
                score += 0.1

        return min(score, 1.0)
```

### Kong 请求流中的实时拦截

```
请求 → Kong Gateway
          │
          ▼
    ┌──────────────────┐
    │  插件: Agent 指纹  │ ← User-Agent / TLS 指纹 / 来源 IP
    └────────┬─────────┘
             │ 匹配 Agent 特征?
             ├── 否 → 正常流转
             │
             ▼ 是
    ┌──────────────────┐
    │  插件: 行为基线    │ ← 查 Redis 中此 Agent 的基线
    └────────┬─────────┘
             │ 异常分数?
             ├── < 0.3 → 放行，更新基线
             ├── 0.3~0.7 → 放行 + 降速 + 审计日志
             └── > 0.7 → 阻断 + 告警
```

对应的 Kong 插件配置示例：

```yaml
# kong.yml
plugins:
  - name: agent-security
    config:
      enabled: true
      # Agent 检测规则
      detection:
        sdk_headers: true           # 检查 User-Agent SDK 指纹
        timing_analysis: true       # 分析请求间隔
        ja3_fingerprint: true       # TLS 指纹识别
      # 行为基线
      baseline:
        learning_period: 3600       # 学习期 1 小时
        window_size: 300            # 滑动窗口 5 分钟
        storage: redis              # 基线存储
      # 响应动作
      action:
        score_threshold: 0.7        # 阻断阈值
        rate_limit: 100             # Agent 请求上限 / 分钟
        captcha_on_score: 0.3       # 轻度异常加验证码
```

## APISIX 的实现

如果是用 Apache APISIX，可以利用其 Plugin Runner 机制（支持 Java/Python/Go），将 Agent 检测逻辑作为外部插件运行：

```yaml
# apisix/plugins/agent-intercept.yaml
plugin_attr:
  agent-intercept:
    # 使用 APISIX ext-plugin 在请求阶段拦截
    ext_plugin:
      addr: 127.0.0.1:9091
    rules:
      - agent_fingerprints:
          patterns: ["LangChain", "openai-python", "anthropic"]
        baseline:
          enable: true
          redis_key_prefix: "agent:baseline:"
        action:
          anomaly_threshold: 0.7
```

## 几个实现中的关键陷阱

### 1. 学习期的冷启动

Agent 刚部署时的"学习期"是关键窗口。如果在学习期内 Agent 被注入了恶意指令，系统会把这个恶意行为学成"正常基线"。

**对策**：学习期仅对白名单 API 进行记录，不覆盖敏感操作。或者在受控沙箱环境中完成学习期再上线。

### 2. Agent 版本升级带来的基线偏移

Agent 升级后可能改变其行为——调用的 API 变了、参数格式变了。系统需要区分"正常的 Agent 升级"和"恶意行为偏移"。

**对策**：基线设置版本标签，Agent 版本声明时自动重建基线，保留旧基线作为回滚参考。

### 3. 加密流量困境

越来越多的 Agent 通信使用 mTLS 加密，API 网关无法直接读取请求体。此时只能依赖 TLS 指纹、请求元数据（路径、方法、频率）等外部信号。

**对策**：如果业务允许，在 Agent 的 sidecar 层增加明文 metadata 标记（HTTP Header），或者通过分布式 tracing 的 span 数据间接推断 Agent 行为。

### 4. 误报处理

Agent 执行正常任务时被误拦的代价很高——它会导致整个自动化流程中断。你在凌晨三点被叫起来的原因可能不是入侵，而是 Agent 的某个正常升级触发了拦截。

**对策**：分级响应，不要一上来就阻断。轻度异常先降速 + 加审计标记，只有确凿的恶意行为才直接阻断。同时提供便捷的"一键豁免"机制。

## 总结

Security Boulevard 这篇文章的价值在于它把 Agent 安全问题拉回到了一个我们非常熟悉的战场——API 层。你不需要专门去搭建一个 Agent 安全平台，你可以在现有的 API 网关上叠加 Agent 行为检测能力。

核心思路就三句话：

1. **Agent 和人类在 API 调用行为上有本质差异**——利用这些差异做指纹识别
2. **Agent 的行为是可以被量化和基线化的**——建立行为基线，偏离即告警
3. **拦截不一定要阻断**——分级响应比直接 403 更实用

从工程角度看，在 API 网关层面做 Agent 流量检测，是当前投入产出比最高的 Agent 安全措施。它不需要改造 Agent 本身，不侵入业务逻辑，只是在你已经存在的流量入口上加一道"你是谁、你要干什么、这正常吗"的检查。

这大概是 Agent 安全最务实的落地路径了。
