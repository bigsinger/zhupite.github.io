---
layout:		post
category:	"dev"
title:		"LLM大模型配置"
sticky:		true

tags:		[ai]
---
- Content
{:toc}




## deepseek

- 官方模型&价格：https://api-docs.deepseek.com/zh-cn/quick_start/pricing
- 配置参考：[接入 nanobot - DeepSeek API Docs](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/nanobot)

BASE URL (OpenAI 格式)：https://api.deepseek.com/v1

模型ID：

- deepseek-v4-pro
- deepseek-v4-flash

## 智普

### 智普国内版

https://bigmodel.cn/glm-coding 

智普国内版太火爆了，抢不到。

### 智普国际版

智普国内版太火爆了，抢不到，只能先到国际版上看看。智普国际版的coding plan：https://z.ai/subscribe
配置方式参考：https://docs.z.ai/devpack/tool/others

智普国际版coding plan的baseUrl：https://api.z.ai/api/coding/paas/v4

模型id：

- glm-5.1
- GLM-5
- GLM-5-Turbo

> Using the GLM Coding Plan, you need to configure the dedicated Coding API https://api.z.ai/api/coding/paas/v4 instead of the General API https://api.z.ai/api/paas/v4



## nvidia英伟达

截至 2026 年 3 月，NVIDIA 通过NIM（推理微服务）托管 API提供免费模型访问，核心规则为：无每日 / 每月调用次数或 Token 限额，仅设速率限制；模型以主流开源大模型为主，随平台更新动态调整。免费层无每日 / 每月调用次数或 Token 上限，仅限制速率—— 验证手机号后为40 次 / 分钟（40 RPM）。部分标有 :free 后缀的模型变体，可能执行更严格的速率（如 20 RPM）或每日限额（如 50 次），未标后缀的免费模型通常按 40 RPM 执行。

| 模型名称                      | 模型ID                      | 核心特点                 |
| :---------------------------- | :-------------------------- | :----------------------- |
| 智谱 GLM-4.7                  | z-ai/glm4.7                 | 中文能力强，代码生成优秀 |
| 智谱 GLM-5                    | z-ai/glm5                   | 综合能力强，上下文128K   |
| 月之暗面 Kimi K2.5            | moonshotai/kimi-k2.5        | 长文本专家，上下文256K   |
| 阶跃星辰 Step-3.5-Flash       | stepfun-ai/step-3.5-flash   | 极速响应，上下文32K      |
| MiniMax M2.1                  | minimaxai/minimax-m2.1      | 响应快，多模态支持       |
| DeepSeek V3.2                 | deepseek-ai/deepseek-v3.2   | 编程与推理能力突出       |
| 通义千问 Qwen2.5-72B-Instruct | qwen/qwen2.5-72b-instruct   | 中文编程能力强           |
| Meta Llama 3.1 70B-Instruct   | meta/llama-3.1-70b-instruct | 综合能力稳定             |
| Meta Llama 3.3 70B-Instruct   | meta/llama-3.3-70b-instruct | 最新开源旗舰             |
| Google Gemma-3-27B-IT         | google/gemma-3-27b-it       | 轻量高效                 |

可以使用英伟达提供的免费大模型，<https://build.nvidia.com/explore/discover> 点击右上角的 **Generate API Key**（或**Manage API Keys**），创建的时候过期时间可以选择**永不过期**（100年）。
创建成功后将apikey复制下来使用，替换到如下的命令行中执行，重启网关后生效。

```bash
openclaw config set 'models.providers.nvidia' --json '{
  "baseUrl": "https://integrate.api.nvidia.com/v1",
  "apiKey": "nvapi-your-api-key",
  "api": "openai-completions",
  "models": [
    { "id": "z-ai/glm4.7", "name": "GLM-4.7" },
    { "id": "minimaxai/minimax-m2.1", "name": "MiniMax M2.1" },
    { "id": "moonshotai/kimi-k2-thinking", "name": "Kimi K2" }
  ]
}'

openclaw config set models.mode merge
openclaw models set nvidia/z-ai/glm4.7
openclaw gateway restart
```
3.24之后的版本配置方法：手动编辑配置文件，编辑 `~/.openclaw/openclaw.json`：

```json
"models": {
    "providers": {
        "nvidia": {
            "baseUrl": "https://integrate.api.nvidia.com/v1",
            "apiKey": "nvapi-your-api-key",
            "api": "openai-completions",
            "models": [
                {
                    "id": "z-ai/glm4.7",
                    "name": "GLM-4.7",
                    "reasoning": true,
                    "input": ["text"],
                    "cost": {
                        "input": 0,
                        "output": 0,
                        "cacheRead": 0,
                        "cacheWrite": 0
                    },
                    "contextWindow": 128000,
                    "maxTokens": 8192
                }
            ]
        }
    }
},
"agents": {
    "defaults": {
        "model": {
            "primary": "nvidia/z-ai/glm4.7"
        },
        "workspace": "..."
    }
},
```



## OpenRouter

[OpenRouter](https://openrouter.ai) 提供了一个特殊的模型 `ID openrouter/auto`，它会自动分析你的输入，并在保证效果的前提下选择性价比最高的模型。OpenRouter 方案的核心在于利用其 **模型路由（Auto-routing）** 特性。这就像给 OpenClaw 装了一个“智能变速箱”，它会根据你提问的难易程度自动切换引擎。

- 优点：全自动。心跳检测（Heartbeats）或简单的“你好”会被路由到极便宜的模型（如 Gemini Flash 或 Claude Haiku），而复杂的逻辑分析会被推给 GPT-4o 或 Claude Opus。
- 缺点：你无法精细控制它“到底什么时候切换”。

配置方法：
1. 访问 [OpenRouter 官网](https://openrouter.ai/)。
2. 点击右上角登录（支持 Google/GitHub）。
3. 进入 Keys 页面，点击 Create Key。重要： 记得复制保存这个 Key。
4. 充值。使用国内的visa信用卡就可以支付充值，首次玩可以先少量充值，例如100美元。
5. 然后在openclaw里配置模型使用OpenRouter，如果嫌编辑配置文件太麻烦的话可以使用配置向导：`openclaw onboard` 其他的选项别动只修改模型（Model/auth provider），按照步骤把key粘贴进去即可。

## 阿里百炼

[阿里云百炼](https://bailian.console.aliyun.com/cn-beijing/?tab=model#/model-market)的通义千问Plus，据说有100万tokens免费额度，没有实际用过。如果是写代码的话，可以考虑这个[coding-plan](https://bailian.console.aliyun.com/cn-beijing/?tab=coding-plan) Pro 高级套餐，复杂项目的进阶之选，适合大型开发任务需求，¥200/月。

提供的有kimi2.5 glm5等大模型，这个实测下来速度还是很快的，感觉很不错。但是太火爆了，每天都抢不到。

在配置openclaw的时候baseUrl参考这个FAQ配置：
[常见问题 - 大模型服务平台百炼 - 阿里云](https://www.alibabacloud.com/help/zh/model-studio/coding-plan-faq)，配置示例如下：

```json
"bailian": {
  "baseUrl": "https://coding.dashscope.aliyuncs.com/apps/anthropic",
  "apiKey": "sk-sp-your-key",
  "models": [
    {
      "id": "kimi-k2.5",
      "name": "Kimi K2.5",
      "reasoning": true,
      "input": [
        "text"
      ],
      "cost": {
        "input": 0.6,
        "output": 2,
        "cacheRead": 0,
        "cacheWrite": 0
      },
      "contextWindow": 128000,
      "maxTokens": 8192
    },
    {
      "id": "glm-4.7",
      "name": "GLM 4.7",
      "reasoning": true,
      "input": [
        "text"
      ],
      "cost": {
        "input": 0.6,
        "output": 2,
        "cacheRead": 0,
        "cacheWrite": 0
      },
      "contextWindow": 128000,
      "maxTokens": 8192
    },
    {
      "id": "glm-5",
      "name": "GLM5",
      "reasoning": true,
      "input": [
        "text"
      ],
      "cost": {
        "input": 0.6,
        "output": 2,
        "cacheRead": 0,
        "cacheWrite": 0
      },
      "contextWindow": 128000,
      "maxTokens": 8192
    }
  ]
}
```

```json
"agents": {
  "defaults": {
    "model": {
      "primary": "bailian/glm-5",
      "fallbacks": [
        "nvidia/z-ai/glm4.7"
      ]
    }
  }
}
```

截止目前（2026年5月4日）已经基本抢不到coding plan包月版本了，后来阿里推出了token plan，不过还没试过，后面再看。

## Google

gemini-1.5-flash（免费需梯子）

访问：<https://aistudio.google.com/api-keys，> 然后点击右上角的「获取 API 密钥」，因为需要梯子，这个没测试通，有空了再试。

## 火山引擎

火山方舟的GLM-4-7，据说有50万tokens免费额度，实际跑通了，但是只用了几轮会话就消耗光了。

```bash
openclaw config set 'models.providers.volcano' --json '{
  "baseUrl": "https://ark.cn-beijing.volces.com/api/v3",
  "apiKey": " xxx ",
  "api": "openai-completions",
  "models": [
    {"id": "glm-4-7-251222", "name": "GLM-4.7"}
  ]
}'

openclaw config set models.mode merge
openclaw models set volcano/ark-code-latest
openclaw gateway restart

```

