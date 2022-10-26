---
layout:		post
category:	"android"
title:		"简单介绍Android-eBPF及其使用demo"

tags:		[android]
---
- Content
{:toc}
**关键词**：安卓,Android,eBPF



# 简介

可以参考安卓官网介绍：[使用 eBPF 扩展内核    Android 开源项目   Android Open Source Project](https://source.android.com/docs/core/architecture/kernel/bpf)，拓展参考：[在 Android 中使用 eBPF：开篇 Weishu's Notes](https://weishu.me/2022/06/12/eBPF-on-Android/)、[DavadDi/bpf_study: bpf 学习仓库](https://github.com/DavadDi/bpf_study)。



在 Android 启动期间，系统会加载位于 `/system/etc/bpf/` 的所有 eBPF 程序。因此，只需要编译ebpf模块，放到 `/system/etc/bpf/` 目录下即可被系统加载，实现监控系统层的效果。



> eBPF is a revolutionary technology with origins in the Linux kernel that can run sandboxed programs in a privileged context such as the operating system kernel. It is used to safely and efficiently extend the capabilities of the kernel without requiring to change kernel source code or load kernel modules.

简单来说，[eBPF](https://ebpf.io/) 是一个运行在 Linux 内核里面的虚拟机组件，它可以在无需改变内核代码或者加载内核模块的情况下，安全而又高效地拓展内核的功能。





# 简单编译

## 准备条件

- aosp，这个可以参考：[安卓源码下载编译MOD刷机-aosp](https://zhupite.com/android/aosp.html)
- Linux环境，这个可以参考：[Linux - Ubuntu的常用命令收集汇总方便查询 ](https://zhupite.com/soft/linux-ubuntu.html)在Windows上安装一个Linux子系统即可。
- bpf相关的头文件在`aosp\frameworks\libs\net\common\native\bpf_headers`下面。
- 编译产物的位置。bpf文件在`aosp\out\target\product\generic_arm64\system\etc\bpf`下面，后缀为`.o`，实际上是个ELF文件。`cc_binary`文件在`aosp\out\target\product\generic_arm64\system\bin`目录下。
- 



## 如何使用

参考：[Android-eBPF监控所有系统调用](https://pshocker.github.io/2022/06/18/Android-eBPF%E7%9B%91%E6%8E%A7%E6%89%80%E6%9C%89%E7%B3%BB%E7%BB%9F%E8%B0%83%E7%94%A8/)（对应的GitHub：[Android_bpf_sys: Android eBPF sample](https://github.com/PShocker/Android_bpf_sys)），即可编译出一个简单的模块。只是这个可能不是基于最新的aosp的，实际编译过程中有很多问题。这里把修改后的可以编译成功的源码上传到这里供参考。

在`aosp/external`目录下创建 `bpf_sys` 目录，把从上面GitHub上下载的文件复制到该目录下，修改`Android.bp`内容为如下：

```json
bpf {
    name: "bpfsys",
    srcs: ["bpfsys.c"],
    cflags: [
        "-Wall",
        "-Werror",
    ],
}

cc_binary {
    name: "bpfcli",

    cflags: [
        "-Wall",
        "-Werror",
        "-Wthread-safety",
    ],
    shared_libs: [
        "libcutils",
        "libbpf_android",
        "libbase",
        "liblog",
        "libnetdutils",
        "libbpf_bcc",
        "libbpf_minimal",
        "libutils",
    ],
header_libs: [
        "bpf_prog_headers",
        "bpf_headers",
    ],
    srcs: [
        "bpfcli.cpp",
    ],
}
```

`bpfcli.cpp`内容：

```c
#include <android-base/macros.h>
#include <stdlib.h>
#include <unistd.h>
#include <iostream>
#include <bpf/BpfMap.h>
#include <bpf/BpfUtils.h>
#include <libbpf_android.h>

int main()
{
    constexpr const char tp_prog_path[] = "/sys/fs/bpf/prog_bpf_sys_tracepoint_raw_syscalls_sys_enter";
    constexpr const char tp_map_path[] = "/sys/fs/bpf/map_bpf_sys_sys_enter_map";
    // Attach tracepoint and wait for 4 seconds
    int mProgFd = bpf_obj_get(tp_prog_path);	//bpf_obj_get
    // int mMapFd = bpf_obj_get(tp_map_path);
    bpf_attach_tracepoint(mProgFd, "raw_syscalls", "sys_enter");
    sleep(1);
    android::bpf::BpfMap<int, int> myMap(tp_map_path);

    const auto iterFunc = [&](const uint32_t &key, const uint32_t &val, android::bpf::BpfMap<int, int> &) {
        printf("pid is:%d,syscall_id:%d\n", key, val);
        return android::base::Result<void>();
    };

    while (1)
    {
        usleep(40000);
        myMap.iterateWithValue(iterFunc);
    }

    exit(0);
}
```

`bpfsys.c`内容：

```c
#include <linux/bpf.h>
#include <stdbool.h>
#include <stdint.h>
#include <bpf_helpers.h>

DEFINE_BPF_MAP(sys_enter_map, HASH, int, uint32_t, 1024);

struct syscalls_enter_args {
	unsigned short common_type;
	unsigned char common_flags;
	unsigned char common_preempt_count;
	int common_pid;

    long id;
    unsigned long args[6];
};

struct task_struct {
	int pid;
	int tgid;
	char comm[16];
	struct task_struct *group_leader;
};


// SEC("raw_syscalls/sys_enter")
DEFINE_BPF_PROG("tracepoint/raw_syscalls/sys_enter", AID_ROOT, AID_NET_ADMIN, sys_enter)
(struct syscalls_enter_args *args)
{
    //获取进程信息
    // struct task_struct *task = (void *)bpf_get_current_task();

    // int key = bpf_get_smp_processor_id();
	int key = bpf_get_current_pid_tgid();//这里是强制取低32位,也就是pid
    uint32_t syscall_id=args->id;

    bpf_sys_enter_map_update_elem(&key, &syscall_id, BPF_ANY);
    return 0;
}

// char _license[] SEC("license") = "GPL";
LICENSE("Apache 2.0");
```

记录下修改的点：

- 文件名里面不能有下划线（这点感觉很奇怪，但是修改后的确不报错了）。
- `Android.bp`的修改主要是解决链接不通过的问题。



编译：

```bash
cd /aosp/external/bpf_sys
source build/envsetup.sh
lunch aosp_arm64-eng
mm
```

编译成功信息：

```bash
[100% 184/184] Install out/target/product/generic_arm64/system/bin/bpfcli

#### build completed successfully (02:42 (mm:ss)) ####
```

如何使用可以参考 [Android-eBPF监控所有系统调用](https://pshocker.github.io/2022/06/18/Android-eBPF%E7%9B%91%E6%8E%A7%E6%89%80%E6%9C%89%E7%B3%BB%E7%BB%9F%E8%B0%83%E7%94%A8/) 文末的介绍。



# BCC

上面的介绍可以很快理解ebpf及流程，但是实际使用中由于需要反复编译源码和刷机，比较麻烦，所以需要借助bcc。可以参考：[bcc工具上手指南 - CodeAntenna](https://codeantenna.com/a/5cCC1dAQf0)、[eBPF on Android之bcc环境准备——eadb简版](https://blog.seeflower.dev/archives/138/)、[eBPF on Android之bcc编译与体验](https://blog.seeflower.dev/archives/111/)



[在 Android 中使用 eBPF：搭建环境_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV19t4y1H71G/?vd_source=151c87469d92e70e43c55eada781a068)





# 参考

- [使用 eBPF 扩展内核    Android 开源项目   Android Open Source Project](https://source.android.com/docs/core/architecture/kernel/bpf)
- [在 Android 中使用 eBPF：开篇 Weishu's Notes](https://weishu.me/2022/06/12/eBPF-on-Android/)
- [DavadDi/bpf_study: bpf 学习仓库](https://github.com/DavadDi/bpf_study)
- 《Linux内核观测技术BPF》
- [深入浅出 eBPF 专注于 Linux 内核技术eBPF](https://ebpf.top/)
- [Linux 内核监控在 Android 攻防中的应用](https://evilpan.com/2022/01/03/kernel-tracing/#top)
- 另外一种编译方法：[为Android平台编译eBPF程序](https://www.52pojie.cn/thread-1649849-1-1.html)
- [eBPF on Android之hook libc.so open](https://blog.seeflower.dev/archives/161/)

