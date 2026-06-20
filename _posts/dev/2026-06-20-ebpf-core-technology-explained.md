---
layout: post
title: "eBPF CO-RE 技术解构：一次编译到处运行——BTF + Clang + libbpf 三件套背后的实践"
categories: [dev]
description: "深度解构 eBPF CO-RE 技术：如何让 eBPF 程序一次编译、跨内核版本运行。拆解 BTF 类型地图、Clang 重定位改造、libbpf 运行时修正三个关键组件，以及 libbpf 和 cilium/ebpf 两大开源实现。"
tags: [eBPF, CO-RE, BTF, libbpf, 内核技术, Linux]
---

## 一句话

**CO-RE（Compile Once, Run Everywhere）** 是 eBPF 生态的关键技术，让 eBPF 程序编译一次就能在不同内核版本上运行。三个组件接力完成：BTF（类型地图）+ Clang 重定位（编译改造）+ libbpf（加载修正）。

> 核心实现：libbpf ⭐ 2.7K | cilium/ebpf ⭐ 7.8K | BTFHub ⭐ 480 | iovisor/bcc ⭐ 22.5K

## 为什么需要 CO-RE？

你写了个 eBPF 程序，在自己机器上跑得好好的，scp 到生产环境——直接加载失败。换了个内核版本，结构体偏移全变了，编译好的字节码里写死的偏移对不上，程序当场报废。

这就是 eBPF 长期的硬伤：**内核结构体的内存布局随版本变化。** 同一个 `task_struct.pid` 字段，5.10 内核下偏移可能是 A，5.15 下就变成了 B——编译时写死偏移，换个内核就废。

在 CO-RE 出现之前，业界只有一种解法：**BCC 的现场编译方案**——把 BPF C 代码和 Clang/LLVM 头文件分发给目标机器，在目标机器上重新编译。代价：分发包 500 MB+，容器里一堆坑，CI/CD 流程复杂。

**CO-RE 的思路完全不同：编译时不算死偏移，留便签条让加载器到目标机器上查 BTF 再修正。** 同一个 `.bpf.o`，几十 KB，scp 到任何内核 ≥ 5.2 的机器直接跑。

## CO-RE 三件套

```
CO-RE = BTF（类型地图） + Clang 重定位（编译器改造） + libbpf 加载器（运行时修正）
```

缺一不可：
- 少了 BTF，加载器不知道目标内核的结构体长什么样
- 少了 Clang 重定位，编译产物里就没有"哪里需要修正"的标记
- 少了 libbpf 加载器，标记有了也没人执行修正

### 组件一：BTF——内核的"类型地图"

BTF（BPF Type Format）是内核自带的元数据，v5.2 起内核支持，主流发行版从 v5.4 之后陆续默认开启。

它不存数据，**只存数据的形状**——结构体有哪些成员、每个成员什么类型、偏移量多少。你可以把它理解成一本书的索引目录。不需要死记 "pid 字段在第 X 字节"，去查目录就行。

```
struct task_struct {         ← 5.10 内核
    pid:  offset 0xA0
    comm: offset 0xD0
}

struct task_struct {         ← 5.15 内核
    pid:  offset 0xB0
    comm: offset 0xE0
}
```

**为什么不用 DWARF？** DWARF 是标准调试格式，但一个内核的 DWARF 信息动辄几百 MB。BTF 是借鉴 DWARF 思路的**独立精简格式**，只保留类型描述，砍掉行号映射、局部变量、内联信息等 CO-RE 不需要的东西。加上去重算法，体积比 DWARF 小一到两个数量级。这才让内核能把它常驻嵌入到 `/sys/kernel/btf/vmlinux` 里。

| 特性 | DWARF | BTF |
|------|-------|-----|
| 信息量 | 完整调试信息 | 仅类型描述 |
| 大小 | 数百 MB | 数 MB |
| 去重 | 无 | BTF dedup |
| 常驻内核 | ❌ | ✅ /sys/kernel/btf/vmlinux |
| 加载开销 | 高 | 低 |

### 组件二：Clang——编译器改造

Clang 是 LLVM 项目的 C/C++ 编译器，也是 eBPF **唯一能用的编译器**（GCC 不支持 BPF 字节码到 v14 才加入初步支持）。CO-RE 改造的就是 Clang 的 BPF 后端。

**没有 CO-RE 的写法**，Clang 直接把偏移硬编码：
```c
u32 pid = task->pid;  // 指令里写死偏移
```

**CO-RE 写法**，Clang 不硬编码，而是写重定位记录：
```c
u32 pid = BPF_CORE_READ(task, pid);  // 生成便签条，偏移留空
```

`BPF_CORE_READ` 底层是 Clang 的内置函数 `__builtin_preserve_access_index()`。这个 builtin 告诉 Clang：**"别算偏移，给我记下来。"**

Clang 看到它，就在编译产物的 `.BTF.ext` 段里写一条 `bpf_core_relo` 记录：
```
insn_off:   0x210   ← 字节码中的指令偏移
type_id:    125     ← .BTF 段中 task_struct 的类型 ID
access_str: "53"    ← pid 字段在 task_struct 中的索引
```

翻译成大白话：**"字节码偏移 0x210 处的指令访问了 task_struct 的第 53 号字段（pid），偏移多少请加载时自己查。"**

### 组件三：libbpf——加载时修正

**没有 CO-RE（偏移写死）：**
```c
// 开发机: 5.15 内核，pid 偏移 = B
Clang 编译: r1 += B  // 硬编码偏移
// 目标机: 5.10 内核，pid 偏移 = A（A ≠ B）
r1 += B  // 读的是 B 处，不是 pid，数据读错
```

**有了 CO-RE（重定位三步走）：**

**第一步：编译时——Clang 留便签**
偏移位置先填 0 占位，同时在重定位表里记一条。

**第二步：加载时——libbpf 查 BTF 修正**
scp 到目标机器，libbpf 加载 `.bpf.o`，从 `.BTF.ext` 段读出重定位记录，查本机内核的 `/sys/kernel/btf/vmlinux`，发现 pid 偏移 = A，写回字节码：
```c
r1 += A  // 修正完成
```

**第三步：执行时——已经是正确的字节码**
内核拿到的是修正后的代码，偏移 A 正好是本机的 pid，正常执行。

重定位只发生在加载那一瞬间。**本质上和普通程序的动态链接是同一类机制**——编译时不知道的地址/偏移，留个标记，运行时再填。只是 eBPF 场景下"填"的不是库函数地址，而是内核结构体字段偏移。

## 两大开源实现

### libbpf（C 语言实现）

| 属性 | 数据 |
|------|------|
| 仓库 | github.com/libbpf/libbpf |
| Stars | 2,716 ⭐ |
| Forks | 490 |
| 主语言 | C |
| 定位 | eBPF 官方 C 库，Linux 内核源码树同步 |

libbpf 是从内核源码树提取的标准 C 库，提供 eBPF 程序加载、验证、CO-RE 重定位、Map 管理等完整功能。是 CO-RE 加载器的"参考实现"，所有其他语言的 eBPF 库（cilium/ebpf、aya 等）都参考它的语义。

**libbpf-bootstrap**（⭐ 1.5K）是配套的脚手架工具，方便快速上手 CO-RE 开发：
```bash
git clone https://github.com/libbpf/libbpf-bootstrap
cd libbpf-bootstrap/examples/c
make
# 编译出的 .bpf.o 可在任何 5.2+ 内核上运行
```

### cilium/ebpf（Go 语言实现）

| 属性 | 数据 |
|------|------|
| 仓库 | github.com/cilium/ebpf |
| Stars | 7,807 ⭐ |
| Forks | 780+ |
| 主语言 | Go |
| 许可证 | MIT |
| 创建时间 | 2019 |

`cilium/ebpf` 是 libbpf 的 Go 语言等价实现——libbpf 用 C 做 CO-RE 重定位，cilium/ebpf 用 Go 做同样的事。两者加载 `.bpf.o` 时的重定位逻辑一致，只是语言不同。

这是 Cilium 项目能在 K8s 上大规模部署 eBPF 的基石——编译时用 `bpf2go` 把 BPF C 编译成字节码嵌入 Go 二进制，部署时无需 Clang/LLVM：
```go
//go:generate go tool github.com/cilium/ebpf/cmd/bpf2go Probes ../../../bpf/bpf_probes.c

func LoadProbes() (*ebpf.CollectionSpec, error) {
    reader := bytes.NewReader(_ProbesBytes)  // 嵌入的 .o 字节码
    spec, err := ebpf.LoadCollectionSpecFromReader(reader)
    // CO-RE 重定位在 LoadAndAssign 时自动完成
    return spec, err
}
```

这就是为什么 Cilium 的 Docker 镜像里**不需要 clang/llvm**，一个二进制搞定所有内核版本。

### BTFHub（兜底方案）

| 属性 | 数据 |
|------|------|
| 仓库 | github.com/aquasecurity/btfhub |
| Stars | 480 ⭐ |
| 主语言 | Go |
| 许可证 | Apache-2.0 |
| BTF 归档 | github.com/aquasecurity/btfhub-archive（⭐ 136） |

当目标内核没有 BTF（老内核或嵌入式裁剪），BTFHub 预编译了主流发行版各内核版本的 BTF 文件，可以远程拉取兜底。但覆盖不是 100%。

## CO-RE 的硬门槛

CO-RE 不是万能的，有几个明确的边界：

### BTF 依赖
目标内核必须有 BTF（`/sys/kernel/btf/vmlinux` 存在）。v5.2 以下的老内核没有，CO-RE 用不了。但 v5.2+ 也不等于一定有——内核编译时需要开启 `CONFIG_DEBUG_INFO_BTF=y`。

### 字段变化无法自动修复
如果目标内核删掉、重命名了字段，或者字段语义变了，CO-RE 也修不了：

| 问题 | 例子 |
|------|------|
| **字段重命名** | `thread_struct.fs` → `fsbase`（4.7 内核） |
| **语义漂变** | `task_struct.utime` 的数值含义从 jiffies 变成纳秒 |
| **配置裁剪** | 某个 config option 没开，字段不存在 |

### 应对方案

**轻量级——字段存在性检查：**
```c
if (bpf_core_field_exists(task->pid))
    pid = BPF_CORE_READ(task, pid);
else
    pid = -1;  // 字段不存在，返回哨兵值
```

**重量级——结构体风味（struct flavor）：**
```c
struct thread_struct___v46 { void *fs; };   // 4.6 的名字
struct thread_struct___v47 { void *fsbase; };// 4.7+ 的名字

if (kernel_version < 4.7) {
    fs = BPF_CORE_READ(task, thread, ___v46, fs);
} else {
    fs = BPF_CORE_READ(task, thread, ___v47, fsbase);
}
```

这是 CO-RE 的硬边界：**偏移变化能自动修，字段消失/语义漂变只能靠代码主动适配。**

### 位域陷阱

位域（bitfield）是 CO-RE 的一个知名陷阱。C 语言里的位域字段，如 `unsigned int flag: 3;`，用普通的 `BPF_CORE_READ` 读不了。libbpf 作者 Nakryiko 原话：位域是 **"notoriously uncooperative"**——C 语言里出了名不配合的东西。

CO-RE 为此专门提供了 `BPF_CORE_READ_BITFIELD()` 宏，用额外的位操作来提取值。**如果你读某个字段总是拿到奇怪的值，检查一下是不是位域。**

## 与传统 BCC 方案对比

| 维度 | BCC | CO-RE（libbpf） |
|------|-----|-----------------|
| 部署方式 | 目标机器现场编译 | 预编译 + 运行时重定位 |
| 分发包大小 | 500 MB+（含 Clang/LLVM/内核头文件） | 几十 KB（仅 .bpf.o） |
| 启动速度 | 慢（每次启动编译） | 快（仅加载+修正） |
| 内核兼容 | 需要目标内核头文件 | 5.2+ 任意内核 |
| 容器部署 | 镜像巨大，依赖难搞 | 轻量，单二进制 |
| 问题排查 | 编译时暴露 | 加载时暴露 |
| 成熟度 | 老牌稳定（22K+ Stars） | 主流新项目（Cilium 驱动） |

## 总结

CO-RE 发明了**"延迟绑定"**：编译时不算死偏移，留便签条让加载器到目标机器上查 BTF 再修正。

三件套（BTF + Clang 重定位 + libbpf）接力完成，把编译和运行彻底拆开。这就是 **Compile Once – Run Everywhere**。

对于 eBPF 开发者这意味着：你的 `.bpf.o` 可以像普通 ELF 一样分发，不用担心目标机器的内核版本——只要它在 5.2+ 且有 BTF，就能跑。

对于平台工程师这意味着：eBPF 程序可以嵌入到 Go/Rust 二进制里部署，运维复杂度从"每台机器配 Clang"降低到"放个二进制进去"。

---

**参考资料**

- 原文：[mp.weixin.qq.com/s/DzSlKG6DH6mStgfYe3Wr7A](https://mp.weixin.qq.com/s/DzSlKG6DH6mStgfYe3Wr7A)
- libbpf：[github.com/libbpf/libbpf](https://github.com/libbpf/libbpf)（⭐ 2.7K）
- cilium/ebpf：[github.com/cilium/ebpf](https://github.com/cilium/ebpf)（⭐ 7.8K）
- iovisor/bcc：[github.com/iovisor/bcc](https://github.com/iovisor/bcc)（⭐ 22.5K）
- BTFHub：[github.com/aquasecurity/btfhub](https://github.com/aquasecurity/btfhub)（⭐ 480）
- Nakryiko 系列博文：[nakryiko.com/posts/bpf-portability-and-co-re/](https://nakryiko.com/posts/bpf-portability-and-co-re/)
