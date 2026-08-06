---
layout: post
title: "JSC Deobfuscator：面向 V8 字节码的静态反混淆工具"
categories: [tool]
description: "介绍 hasherezade 新开源的 JSC Deobfuscator：它解决什么问题、如何接入 View8 工作流，以及哪些场景不适合使用。"
tags:
  - JavaScript
  - 逆向工程
  - 字节码分析
  - 开源工具
---

如果你分析过被打包成 V8 Code Cache / JSC 的 JavaScript 载荷，会知道常规 JavaScript 反混淆工具经常卡在第一步：原始源码已经不在手里，能拿到的只是字节码反汇编或伪代码。`hasherezade/jsc_deobfuscator` 针对的正是这个夹缝场景。

**一句话结论**：JSC Deobfuscator 不是通用 JavaScript 反混淆器，也不会还原可运行源码；它更像一个研究工具链，把 View8 生成的 V8 字节码伪代码进一步做字符串恢复、控制流简化、临时变量内联和函数命名辅助，让静态分析人员更容易阅读、检索和比较样本。

## 基本信息

| 时间 | 项目 | 信息 |
|---|---|---|
| 2026-07-31 | 仓库创建 | GitHub 仓库显示项目创建于 2026-07-31 |
| 2026-08-02 | 首个 Release | `v1.0` 发布，并附带预编译的 Linux `v8dasm` 二进制文件 |
| 2026-08-06 10:52 +0800 | 本文核验 | GitHub API 显示 4 stars、0 forks，主要语言为 Python，许可证为 GPL-2.0 |

项目地址：[https://github.com/hasherezade/jsc_deobfuscator](https://github.com/hasherezade/jsc_deobfuscator)

## 它到底解决什么问题

官方 README 对项目定位说得很清楚：这个工具用于**静态反混淆经过 `javascript-obfuscator` 保护的 V8 JavaScript 字节码伪代码**。它不是直接吃 `.js` 源码，而是接在 [View8](https://github.com/suleram/View8) 之后，处理 View8 输出的伪代码与序列化结果。

换句话说，它面向的典型链路是：

```text
Brotli 压缩的 app.jsc
  ↓ 解压
V8 Code Cache / 字节码载荷
  ↓ 使用匹配 V8 版本的 v8dasm 反汇编
反汇编文本
  ↓ View8 反编译
View8 伪代码 + .pkl 序列化文件
  ↓ JSC Deobfuscator
更可读的伪代码、字符串列表、函数重命名 CSV
```

这类工具的价值不在于“一键还原源码”，而在于把本来充满跳转、临时变量、字符串解码器和匿名函数的伪代码，整理到足够支撑人工研判的程度。

## 核心工作流

README 给出的主流程分成五步。

### 1. 解压 JSCeal 载荷

JSCeal 样本中的 `app.jsc` 通常是 Brotli 压缩的。Linux 环境可以用 `brotli`：

```bash
brotli -d app.jsc -o app.decompressed.jsc
```

Windows 或没有 `brotli` 命令时，仓库提供了 Node.js 辅助脚本，只做解压，不执行载荷：

```powershell
node Utils/decompress-jsc.js app.jsc
```

输出文件名为：

```text
app.jsc.decompressed.jsc
```

### 2. 用匹配版本的 V8 反汇编器处理字节码

这里是整条链路最容易踩坑的地方：V8 Code Cache 与 V8 版本强绑定。项目开发时使用的 JSCeal 样本基于 V8 `10.2.154.26`，因此 README 明确提醒，随便拿一个其他 V8 版本的反汇编器并不可靠。

项目在 `Utils/disasm/` 下提供了：

```text
Utils/disasm/v8dasm.cpp
Utils/disasm/patches/patch1.diff
Utils/disasm/patches/v8_string_patch.diff
```

`v1.0` Release 中还提供了一个预编译的 Linux `v8dasm`。拿到匹配版本的 `v8dasm` 后，可以生成反汇编文本：

```bash
/path/to/v8dasm app.decompressed.jsc > app.jsc.disasm.txt
```

### 3. 用 View8 生成伪代码和序列化文件

随后把反汇编文本交给 View8：

```bash
mkdir -p decompiled

python3 View8/view8.py \
  --input_format disassembled \
  --inp app.jsc.disasm.txt \
  --normalize \
  --out decompiled/app.dec.txt \
  --export_format decompiled serialized
```

典型输出包括：

```text
decompiled/app.dec.txt
decompiled/app.dec.pkl
```

其中 `.pkl` 是后续 JSC Deobfuscator 继续处理的输入。

### 4. 运行全部反混淆 Pass

主入口是 `deobf_all.py`：

```bash
mkdir -p deobfuscated

python3 deobf_all.py \
  --inp decompiled/app.dec.pkl \
  --out deobfuscated/app.deobf.txt \
  --export_format decompiled serialized
```

根据源码和 README，`deobf_all.py` 会顺序调用多类处理逻辑，包括：

| 模块 | 作用 |
|---|---|
| `deobf_str1.py` / `deobf_str2.py` | 字符串解码与刷新 |
| `deobf_scope2.py` | 变量传播与作用域相关处理 |
| `deobf_unflattener.py` | 控制流平坦化相关整理 |
| `deobf_replace_ops.py` | 操作替换与表达式简化 |
| `deobf_globals.py` | 全局变量传播 |
| `deobf_inline_temporaries.py` | 临时值内联 |

输出可能包括：

```text
deobfuscated/app.deobf.txt
deobfuscated/app.deobf.pkl
deobfuscated/app.deobf.txt.strings.txt
decompiled/app.dec.resolved_funcs.csv
```

需要注意，`resolved_funcs.csv` 与具体样本绑定，官方文档明确提醒不要把一个样本的 CSV 复用到另一个不同载荷上。

### 5. 可选：用 LLM 辅助函数命名

`deobf_ai.py` 可以在结构化反混淆之后，为函数生成更有语义的名字。它支持 Anthropic、OpenAI 和 Ollama 后端。示例：

```bash
python3 deobf_ai.py \
  --inp deobfuscated/app.deobf.pkl \
  --out deobfuscated/app.renamed.txt \
  --llm_backend ollama \
  --model '<local-model>' \
  --ollama_url http://localhost:11434 \
  --export_format decompiled serialized
```

这里必须把 LLM 输出当作“假设”而不是事实。README 的 Safety notes 也特别提醒：LLM 生成的函数名需要结合函数体、字符串、API、路径和数据流逐项验证。

## 适合谁用

| 场景 | 是否适合 | 原因 |
|---|---:|---|
| 分析 JSCeal 相关 V8 字节码载荷 | 适合 | 项目开发和测试目标就是这类样本 |
| 已经能用 View8 产出伪代码和 `.pkl` | 适合 | 工具直接消费 View8 的序列化结果 |
| 想批量整理字符串、函数树和伪代码 | 适合 | 默认 Pass 覆盖字符串、作用域、控制流、临时变量等常见阅读障碍 |
| 只有普通混淆 JavaScript 源码 | 不适合 | README 明确说明它不是通用 JavaScript 反混淆器 |
| 想还原可运行 JavaScript 源码 | 不适合 | 输出仍是 View8 伪代码，不能直接运行 |
| 无法确定 V8 Code Cache 版本 | 谨慎 | 反汇编器版本不匹配会影响后续结果可信度 |

## 使用前的安全注意点

最重要的一条是 `.pkl` 风险。View8 序列化文件使用 Python `pickle`，而 `pickle` 反序列化不可信文件可能执行代码。官方 README 明确建议：**只加载你自己本地用 View8 生成的序列化文件**。

另外，LLM 辅助命名会带来两类风险：

1. **语义误导**：模型可能根据局部片段给出看似合理但不准确的函数名。
2. **样本信息外传**：如果使用云端 LLM 后端，样本伪代码可能被发送到外部 API；敏感样本更适合使用本地 Ollama 或完全不用 LLM 命名。

## 我会怎样把它放进逆向流程

如果把它作为日常分析工具，我会把它定位在“字节码静态分析整理层”，而不是最终判断层：

1. 先确认样本来源、V8 版本和压缩方式；
2. 解压并用匹配版本 `v8dasm` 生成反汇编；
3. 用 View8 输出规范化伪代码和 `.pkl`；
4. 用 `deobf_all.py` 得到更可读的中间结果；
5. 对关键函数再用 `deobf_ai.py --func` 或 CSV 命名做辅助；
6. 最终结论仍回到字符串、调用关系、路径、网络指标和行为证据，而不是只信函数名。

这种定位比较稳妥：它不承诺魔法般还原源码，但能把人工静态分析从“几乎不可读”推进到“可以搜索、比较、标注和复核”。

## 局限与观察

这个项目目前还很新。本文核验时，仓库创建不到一周，Stars 只有个位数，Release 也只有 `v1.0`。这不代表工具不好，但意味着它更像研究者工具，而不是成熟的一键式产品。

另一个局限是依赖链较长：你需要处理 Brotli、V8 版本、反汇编器构建、View8、Python 环境，必要时还要配置 LLM 后端。对逆向人员来说这可以接受；但如果只是想处理普通网页混淆 JavaScript，它并不是最短路径。

## 参考资料

- JSC Deobfuscator GitHub 仓库：[https://github.com/hasherezade/jsc_deobfuscator](https://github.com/hasherezade/jsc_deobfuscator)
- JSC Deobfuscator Wiki：[https://github.com/hasherezade/jsc_deobfuscator/wiki](https://github.com/hasherezade/jsc_deobfuscator/wiki)
- v1.0 Release：[https://github.com/hasherezade/jsc_deobfuscator/releases/tag/v1.0](https://github.com/hasherezade/jsc_deobfuscator/releases/tag/v1.0)
- View8 项目：[https://github.com/suleram/View8](https://github.com/suleram/View8)
- javascript-obfuscator 项目：[https://github.com/javascript-obfuscator/javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator)
