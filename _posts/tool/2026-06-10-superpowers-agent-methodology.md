---
layout: post
categories: [tool]
title: "Superpowers：给编码 Agent 一套完整的软件开发方法论"
tags: [AI Agent, 编码, 方法论, TDD, 开源]
description: "Superpowers 是一套面向编码 Agent 的软件开发方法论，让 Agent 不再一上来就写代码——而是先理解问题、写规约、做计划，再按 TDD/YAGNI/DRY 原则逐步实现。支持 Claude Code、Codex CLI、Cursor 等主流编码 Agent。"
---

# Superpowers：给编码 Agent 一套完整的软件开发方法论

> 大多数 AI 编码 Agent 的默认行为是：**用户一提问，立刻生成代码**。Superpowers 说：先停下来，想清楚再动手。

**Superpowers** 由 **obra** 开发，是一套完整的、面向编码 Agent 的软件开发方法论。它的核心理念简洁而有力：**不要一上来就写代码**。

## 方法论核心：三步骤工作流

Superpowers 将软件开发过程规范化为三个有序步骤：

### 第一步：停下来，问清楚

当用户提出需求时，Agent 不会立即开始编码，而是：
1. 后退一步
2. 询问用户真正想解决什么问题
3. 澄清需求和边界条件

这模拟了资深工程师在接到任务时的第一反应——**理解问题比解决问题更重要**。

### 第二步：写规约，读得懂

在开始编码之前，Agent 会撰写一份规格说明，特点是：
- 用可读的短段落而非冗长的文档
- 明确功能边界和非功能需求
- 与用户确认后进入下一阶段

### 第三步：做计划，再执行

规约确认后，Agent 制定详细的实施计划，然后才真正开始写代码。整个实现过程遵循经典的软件工程原则：

## 核心工程原则

### TDD（测试驱动开发）

先写测试，再写实现。测试不仅验证代码正确性，更是代码行为的"活文档"。

```python
# 先写测试
def test_user_registration():
    result = register_user("test@example.com", "password123")
    assert result.success == True

# 再写实现
def register_user(email, password):
    # 实现逻辑
    pass
```

### YAGNI（你不需要它）

只实现当前需求需要的功能，不为"未来可能需要"的功能写代码。这减少了代码量、降低了维护成本、提升了可读性。

### DRY（不要重复自己）

避免代码重复，提取公共逻辑为可复用的模块。

## 支持的 Agent 平台

Superpowers 设计为平台无关，目前支持：

| 平台 | 说明 |
|------|------|
| **Claude Code** | Anthropic 的编码 Agent |
| **Codex CLI** | OpenAI 的命令行编码工具 |
| **Cursor** | AI 驱动的代码编辑器 |
| **Gemini CLI** | Google 的 AI 助手命令行 |
| **Copilot CLI** | GitHub 的 AI 命令行工具 |

## 与其他项目的区别

Agent Skills（Addy Osmani）提供了具体的斜杠命令，而 Superpowers 更侧重于 **方法论层面**——它不定义具体的命令，而是定义 Agent 应该如何思考和工作的流程。两者可以互补使用。

## 使用方式

```bash
# 克隆仓库
git clone https://github.com/obra/superpowers.git
# 查看初始指令说明
cd superpowers
cat README.md
```

根据文档配置你的 Agent，使其在启动时加载 Superpowers 的初始指令。

## 结语

Superpowers 代表了一种思维方式的转变：**AI Agent 的进步方向不是生成更快的代码，而是生成更正确的代码**。通过引入完整的软件开发方法论，Superpowers 让编码 Agent 变得更像一名真正的软件工程师——会思考、会规划、会验证，而不仅仅是一名代码生成器。

---

**项目地址**：[https://github.com/obra/superpowers](https://github.com/obra/superpowers)
**核心理念**：先理解 → 再规约 → 后计划 → 最后编码
