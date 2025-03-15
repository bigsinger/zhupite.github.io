---
layout:		post
category:	"sec"
title:		"绕过libmsaoaidsec.so检测frida的方法汇总"

tags:		[]
---
- Content
{:toc}




# 绕过方案

综合了一下网上的帖子（见文末参考部分），做了一些优化，总结方法如下：

## 1、替换线程+patch

1. 监控so的加载，锁定目标so；
2. 锁定目标so的检测时机；
3. 替换目标so创建的线程（或替换目标so使用的`pthread_create`函数）
4. patch目标so崩溃；

## 2、替换init+patch

1. 监控so的加载，锁定目标so；
2. 锁定目标so的检测时机；
3. 替换init函数；
4. patch目标so崩溃；

## 3、替换so的加载

1. 监控so的加载，锁定目标so；
2. 替换so的加载为虚假库；



## **方法优势**

1. 无须hook `_system_property_get`。
2. 全部根据日志输出的信息来获取关键信息，几乎不需要在IDA里进行分析。
3. 泛化能力强，理论上可以通杀很多版本（待验证）。



详细具体步骤如下。

# 绕过记录

## bilibili7.26.1

先使用如下脚本（`dlopen.js`）跑一下。

```js
const TARGET_LIB_NAME = "libmsaoaidsec.so";

function hook_dlopen() {
    ["android_dlopen_ext", "dlopen"].forEach(funcName => {
        let addr = Module.findExportByName(null, funcName);
        if (addr) {
            Interceptor.attach(addr, {
                onEnter(args) {
                    let libName = ptr(args[0]).readCString();
                    if (libName) {
                        console.log(`[+] ${funcName} onEnter: ${libName}`);
                    }
                },
                onLeave: function (retval) {
                    console.log(`[+] ${funcName} onLeave`);
                }
            });
        }
    });
}

hook_dlopen();
```

日志输出：

```assembly
[+] android_dlopen_ext onEnter: /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/oat/arm/base.odex
[+] android_dlopen_ext onLeave
[+] android_dlopen_ext onEnter: /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libblkv.so
[+] android_dlopen_ext onLeave
[+] android_dlopen_ext onEnter: /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libbili_core.so
[+] android_dlopen_ext onLeave
[+] android_dlopen_ext onEnter: /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libbilicr.88.0.4324.188.so
[+] android_dlopen_ext onLeave
[+] android_dlopen_ext onEnter: /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libijkffmpeg.so
[+] android_dlopen_ext onLeave
[+] android_dlopen_ext onEnter: /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libavif-jni.so
[+] android_dlopen_ext onLeave
[+] android_dlopen_ext onEnter: /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libbili.so
[+] android_dlopen_ext onLeave
[+] android_dlopen_ext onEnter: /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libsobot.so
[+] android_dlopen_ext onLeave
[+] android_dlopen_ext onEnter: /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libBugly.so
[+] android_dlopen_ext onLeave
[+] android_dlopen_ext onEnter: /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libmsaoaidsec.so
Process terminated
```

`android_dlopen_ext` 的 `onEnter` 之后程序退出，没有 `onLeave` ，说明是 `libmsaoaidsec.so` 做了检测。



下一步使用如下脚本（`JNI_OnLoad.js`）跑一下。

```js
const TARGET_LIB_NAME = "libmsaoaidsec.so";

function hook_JNI_OnLoad() {
  // 先尝试通过 `findExportByName`
  let jniOnLoad = Module.findExportByName(TARGET_LIB_NAME, "JNI_OnLoad");

  // 如果找不到，就遍历所有导出符号
  if (!jniOnLoad) {
    console.log("[Info] `JNI_OnLoad` 未导出，尝试遍历导出符号...");
    for (let symbol of module.enumerateSymbols()) {
      if (symbol.name.indexOf("JNI_OnLoad") >= 0) {
        jniOnLoad = symbol.address;
        console.log("[Success] 找到 JNI_OnLoad: ", jniOnLoad);
        break;
      }
    }
  }

  if (!jniOnLoad) {
    console.error("[Error] 未找到 `JNI_OnLoad` 函数");
    return;
  }

  // Hook `JNI_OnLoad`
  Interceptor.attach(jniOnLoad, {
    onEnter(args) {
      console.log("[Hooked] JNI_OnLoad 被调用");
    }
  });
}

function hook_dlopen() {
  ["android_dlopen_ext", "dlopen"].forEach(funcName => {
    let addr = Module.findExportByName(null, funcName);
    if (addr) {
      Interceptor.attach(addr, {
        onEnter(args) {
          let libName = ptr(args[0]).readCString();
          if (libName && libName.indexOf(TARGET_LIB_NAME) >= 0) {
            this.is_can_hook = true;
            console.log(`[+] ${funcName} onEnter: ${libName}`);
          }
        },
        onLeave: function (retval) {
          if (this.is_can_hook) {
            console.log(`[+] ${funcName} onLeave, start hook JNI_OnLoad `);
            hook_JNI_OnLoad()
          }
        }
      });
    }
  });
}

hook_dlopen();
```

输出日志：

```assembly
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/oat/arm/base.odex
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libblkv.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libbili_core.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libbilicr.88.0.4324.188.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libijkffmpeg.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libavif-jni.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libmsaoaidsec.so
Process terminated
```

这里看出`JNI_OnLoad`并没有打印出来，说明功能在`JNI_OnLoad`之前。那就验证下，接着跑一下如下脚本（`call_constructors.js`）：

```js
const TARGET_LIB_NAME = "libmsaoaidsec.so";

function find_call_constructors() {
  is64Bit = Process.pointerSize === 8;
  var linkerModule = Process.getModuleByName(is64Bit ? "linker64" : "linker");
  var symbols = linkerModule.enumerateSymbols();
  for (var i = 0; i < symbols.length; i++) {
    if (symbols[i].name.indexOf('call_constructors') > 0) {
      console.warn(`call_constructors symbol name: ${symbols[i].name} address: ${symbols[i].address}`);
      return symbols[i].address;
    }
  }
}

function hook_call_constructors() {
  var ptr_call_constructors = find_call_constructors();
  var listener = Interceptor.attach(ptr_call_constructors, {
    onEnter: function (args) {
      console.warn(`call_constructors onEnter`);
      listener.detach();
    },
  })
}

function hook_dlopen() {
  ["android_dlopen_ext", "dlopen"].forEach(funcName => {
    let addr = Module.findExportByName(null, funcName);
    if (addr) {
      Interceptor.attach(addr, {
        onEnter(args) {
          let libName = ptr(args[0]).readCString();
          if (libName && libName.indexOf(TARGET_LIB_NAME) >= 0) {
            hook_call_constructors();
          }
        },
        onLeave: function (retval) {
        }
      });
    }
  });
}

var is64Bit = Process.pointerSize === 8;
hook_dlopen()
```

输出日志：

```assembly
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/oat/arm/base.odex
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libblkv.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libbili_core.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libbilicr.88.0.4324.188.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libijkffmpeg.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libavif-jni.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libbili.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libBugly.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libsobot.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libmsaoaidsec.so
call_constructors: __dl__ZN6soinfo17call_constructorsEv at 0xecdeec31
call_constructors onEnter
Process terminated
```

说明call_constructors调用了，这个时候使用`init_array.js`（[frida hook init_array自吐新解](https://blog.seeflower.dev/archives/299/)）跑一下看看有哪些init函数：

```assembly
[call_constructors] libmsaoaidsec.so count:4
[call_constructors] init_array_ptr:0xbe3e7ae0
[call_constructors] init_func:0xbe3d440d -> [libmsaoaidsec.so + 0xc40d]
[call_constructors] init_array:0 0xbe3cd3a9 -> [libmsaoaidsec.so + 0x53a9]
[call_constructors] init_array:1 0xbe3cd3e5 -> [libmsaoaidsec.so + 0x53e5]
[call_constructors] init_array:2 0xbe3cd3f5 -> [libmsaoaidsec.so + 0x53f5]
[call_constructors] init_array:3 0x0 -> null
```

到这里其实可以把以上四个函数给patch掉，待会另外一个方法会验证。



这里先使用线程的方法，跑一下脚本`pthread_create.js`

```js
const TARGET_LIB_NAME = "libmsaoaidsec.so";
var TargetLibModule = null;  // 存储目标库模块信息

/////////////////////////////////////////

/**
 * Hook pthread_create，拦截目标库创建的线程
 */
function hook_pthread_create() {
	let pthread_create_addr = Module.findExportByName("libc.so", "pthread_create");
	if (!pthread_create_addr) {
		console.error("Failed to find pthread_create!");
		return;
	}

	Interceptor.attach(pthread_create_addr, {
		onEnter(args) {
			let thread_func_ptr = args[2];  // 线程函数地址
			console.log("[+] pthread_create called, thread function address: " + thread_func_ptr);

			// 确保目标库已加载
			if (!TargetLibModule) {
				//console.warn("Target library not loaded yet!");
				return;
			}

			// 判断线程函数是否在目标库 `so` 的范围内
			if (thread_func_ptr.compare(TargetLibModule.base) > 0 &&
				thread_func_ptr.compare(TargetLibModule.base.add(TargetLibModule.size)) < 0) {

				console.warn("[!] Intercepted thread function at: " + thread_func_ptr +
					" (Offset: " + thread_func_ptr.sub(TargetLibModule.base) + ")");

				// 替换线程函数，防止执行
				Interceptor.replace(thread_func_ptr, new NativeCallback(() => {
					console.log("[*] Fake thread function executed, doing nothing...");
				}, "void", []));
			}
		}
	});
}

function find_call_constructors() {
	is64Bit = Process.pointerSize === 8;
	var linkerModule = Process.getModuleByName(is64Bit ? "linker64" : "linker");
	var symbols = linkerModule.enumerateSymbols();
	for (var i = 0; i < symbols.length; i++) {
		if (symbols[i].name.indexOf('call_constructors') > 0) {
			console.warn(`call_constructors symbol name: ${symbols[i].name} address: ${symbols[i].address}`);
			return symbols[i].address;
		}
	}
}

function hook_call_constructors() {
	var ptr_call_constructors = find_call_constructors();
	var listener = Interceptor.attach(ptr_call_constructors, {
		onEnter: function (args) {
			console.warn(`call_constructors onEnter`);
			if (!TargetLibModule) {
				TargetLibModule = Process.findModuleByName(TARGET_LIB_NAME);
			}
			hook_pthread_create();
			listener.detach();
		},
	})
}

function hook_dlopen() {
	["android_dlopen_ext", "dlopen"].forEach(funcName => {
		let addr = Module.findExportByName(null, funcName);
		if (addr) {
			Interceptor.attach(addr, {
				onEnter(args) {
					let libName = ptr(args[0]).readCString();
					if (libName && libName.indexOf(TARGET_LIB_NAME) >= 0) {
						hook_call_constructors();
					}
				},
				onLeave: function (retval) {
				}
			});
		}
	});
}

var is64Bit = Process.pointerSize === 8;
hook_dlopen()
```

输出日志：

```assembly
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/oat/arm/base.odex
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libblkv.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libbili_core.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libbilicr.88.0.4324.188.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libijkffmpeg.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libavif-jni.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libmsaoaidsec.so
call_constructors: __dl__ZN6soinfo17call_constructorsEv at 0xecdeec31
call_constructors onEnter
[+] pthread_create called, thread function address: 0xbe0eb129
[!] Intercepted thread function at: 0xbe0eb129 (Offset: 0x11129)
[+] pthread_create called, thread function address: 0xbe0ea975
[!] Intercepted thread function at: 0xbe0ea975 (Offset: 0x10975)
[*] Fake thread function executed, doing nothing...
[*] Fake thread function executed, doing nothing...
[+] pthread_create called, thread function address: 0xe9071435
[+] pthread_create called, thread function address: 0xe9071435
[+] pthread_create called, thread function address: 0xeaca6cbd
[+] pthread_create called, thread function address: 0xe9071435
[+] pthread_create called, thread function address: 0xe9071435
[+] pthread_create called, thread function address: 0xe9071435
[+] pthread_create called, thread function address: 0xe9071435
[+] pthread_create called, thread function address: 0xe9071435
[+] pthread_create called, thread function address: 0xe9071435
[+] pthread_create called, thread function address: 0xe9071435
[+] pthread_create called, thread function address: 0xe9071435
[+] pthread_create called, thread function address: 0xe9071435
[+] pthread_create called, thread function address: 0xe9071435
[+] pthread_create called, thread function address: 0xe9071435
Process crashed: Bad access due to invalid address

***
*** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
LineageOS Version: '16.0-20181113-UNOFFICIAL-land'
Build fingerprint: 'Xiaomi/land/land:6.0.1/MMB29M/V9.6.1.0.MALMIFD:user/release-keys'
Revision: '0'
ABI: 'arm'
pid: 2658, tid: 2780, name: gripper-new-thr  >>> tv.danmaku.bili <<<
signal 11 (SIGSEGV), code 1 (SEGV_MAPERR), fault addr 0x8c
Cause: null pointer dereference
    r0  0000c6dd  r1  0000008c  r2  651f1ac6  r3  00000281
    r4  00000000  r5  000c6624  r6  00000000  r7  00000172
    r8  e8a52690  r9  bec78ef8  r10 00000000  r11 bec78dfc
    ip  e9a2f630  sp  bec76cc0  lr  be0edc95  pc  be0edc96

backtrace:
    #00 pc 00013c96  /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libmsaoaidsec.so (offset 0x12000)
    #01 pc 0000af57  /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libmsaoaidsec.so (offset 0x1000)
    #02 pc 000057d9  /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libmsaoaidsec.so (offset 0x1000)
    #03 pc 0000c603  /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libmsaoaidsec.so (offset 0x1000)
    #04 pc 00018df3  /system/bin/linker (offset 0x18000) (__dl__ZN6soinfo17call_constructorsEv+450)
    #05 pc 00000707  <anonymous:e9fda000>
***
```

这两个线程特殊：

```assembly
[!] Intercepted thread function at: 0xbc551129 (Offset: 0x11129)
[!] Intercepted thread function at: 0xbc550975 (Offset: 0x10975)
```

到这里就不用网上的方法了，实际测试会有问题，出现卡顿仍然进不去App。这个时候咱们讨巧下，先把`pthread_create`创建的函数设置成假的，虽然崩溃了，但是可以从这个崩溃入手。

从堆栈上来看，比较容易知道：在 `android_dlopen_ext` 加载目标so后执行了 `call_constructors` 去调用目标函数的init函数，在这个函数里面因为我们的hook导致的初始化失败而崩溃，现在有一个思路，就是如果不去调用这个初始化代码不就行了嘛。

通过崩溃堆栈可以先定位偏移0000c603地址，它的减1地址0000c602处是一个函数调用：

```assembly
LOAD:0000C602 loc_C602                                ; CODE XREF: .init_proc+150↑j
LOAD:0000C602                 BL              sub_57C8
LOAD:0000C606                 LDR             R0, =0x7BD278DD
```

可以先把这个地方NOP掉不让它调用函数了（在上面js的基础上，在`hook_pthread_create();`这句后面调用下`bypass`）：

```js
function nop_code(addr) {
	Memory.patchCode(ptr(addr), 4, code => {
		const cw = new ThumbWriter(code, { pc: ptr(addr) });
		cw.putNop();
		cw.putNop();
		cw.flush();
	})
}

function bypass() {
	nop_code(TargetLibModule.base.add(0xc603 - 1))
}
```

再次运行，App正常运行。



然后再试下替换目标so使用的`pthread_create`函数，运行脚本`pthread_create-fake.js`：

```js
/**
 * 替换目标库使用的pthread_create函数。
 * @description 该脚本使用 Frida 进行动态分析，主要目标是：
 *  1. 监听 `dlopen` / `android_dlopen_ext`，在加载目标库时执行后续 Hook 操作。
 *  2. 监听 `call_constructors` 以确保目标库完全初始化后再 Hook `dlsym`。
 *  3. Hook `dlsym` 并拦截特定符号（如 `pthread_create`），替换其返回值。
 *  4. 通过 `fake_pthread_create` 生成虚假 `pthread_create` 实现，使目标库无法正确调用线程创建函数。
 */

const TARGET_LIB_NAME = "libmsaoaidsec.so";
var TargetLibModule = null;  // 存储目标库模块信息


function create_fake_pthread_create() {
	const fake_pthread_create = Memory.alloc(4096)
	Memory.protect(fake_pthread_create, 4096, "rwx")
	Memory.patchCode(fake_pthread_create, 4096, code => {
		const cw = new Arm64Writer(code, { pc: ptr(fake_pthread_create) })
		cw.putRet()
	})
	return fake_pthread_create
}

function hook_dlsym() {
	var dlsym = Module.findExportByName(null, "dlsym");
	if (dlsym !== null) {
		Interceptor.attach(dlsym, {
			onEnter: function (args) {
				// 获取调用 dlsym 的返回地址
				let caller = this.context.lr;
				if (caller.compare(TargetLibModule.base) > 0 &&
					caller.compare(TargetLibModule.base.add(TargetLibModule.size)) < 0) {
					var name = ptr(args[1]).readCString(); 		// 读取符号名
					if (name == 'pthread_create') {
						console.warn(`replace symbol name: pthread_create`);
						this.canFake = true;
					}
				}
			},
			onLeave: function (retval) {
				if (this.canFake) {
					retval.replace(fake_pthread_create);
				}
			}
		});
	}
}

function find_call_constructors() {
	is64Bit = Process.pointerSize === 8;
	var linkerModule = Process.getModuleByName(is64Bit ? "linker64" : "linker");
	var symbols = linkerModule.enumerateSymbols();
	for (var i = 0; i < symbols.length; i++) {
		if (symbols[i].name.indexOf('call_constructors') > 0) {
			console.warn(`call_constructors symbol name: ${symbols[i].name} address: ${symbols[i].address}`);
			return symbols[i].address;
		}
	}
}

function hook_call_constructors() {
	var ptr_call_constructors = find_call_constructors();
	var listener = Interceptor.attach(ptr_call_constructors, {
		onEnter: function (args) {
			if (!TargetLibModule) {
				TargetLibModule = Process.findModuleByName(TARGET_LIB_NAME);
			}
			console.warn(`call_constructors onEnter: ${TARGET_LIB_NAME} Module Base: ${TargetLibModule.base}`);
			hook_dlsym();
			listener.detach();
		},
	})
}

function hook_dlopen() {
	["android_dlopen_ext", "dlopen"].forEach(funcName => {
		let addr = Module.findExportByName(null, funcName);
		if (addr) {
			Interceptor.attach(addr, {
				onEnter(args) {
					let libName = ptr(args[0]).readCString();
					if (libName && libName.indexOf(TARGET_LIB_NAME) >= 0) {
						hook_call_constructors();
					}
				},
				onLeave: function (retval) {
				}
			});
		}
	});
}

var is64Bit = Process.pointerSize === 8;
// 创建虚假pthread_create
var fake_pthread_create = create_fake_pthread_create();
hook_dlopen()
```

再次运行，App正常运行。



现在试下patch掉init的那些函数（在`call_constructors`回调里调用）。

```js
function replace_init_proc() {
	if (!TargetLibModule) return;

	// 需要替换的偏移地址列表
	const offsets = [0xc40d, 0x53a9, 0x53e5, 0x53f5];

	offsets.forEach(offset => {
		Interceptor.replace(TargetLibModule.base.add(offset), new NativeCallback(function () {
			console.log(`replace ${offset.toString(16)}`);
		}, "void", []));
	});
}
```

完整脚本`replaceInitProcAndPatch.js`：

```js
/*
 * - 监视 `dlopen` 和 `android_dlopen_ext`，拦截 `libmsaoaidsec.so` 的加载。
 * - 跳过其init_proc函数的调用，并通过补丁nop的方式跳过崩溃的函数调用。
 */

const TARGET_LIB_NAME = "libmsaoaidsec.so";
const init_offsets = [0x14400, 0x83fc, 0x8448, 0x8460, 0x84b4, 0x85a8]; // 这里填init函数列表，先通过init_array.js脚本获取
const patch_offsets = [0x8750]; // 这里填需要nop掉的偏移地址
var TargetLibModule = null;     // 存储目标库模块信息



function nop_code(addr) {
    Memory.patchCode(ptr(addr), 4, code => {
        const cw = new Arm64Writer(code, { pc: ptr(addr) });// 64位
        cw.putNop();
        cw.putNop();
        cw.flush();
    })
}

function bypass() {
    patch_offsets.forEach(offset => {
        console.log(`patch ${offset.toString(16)}`);
        nop_code(TargetLibModule.base.add(offset));	// 64位不用减一
    });
}


function find_call_constructors() {
    is64Bit = Process.pointerSize === 8;
    var linkerModule = Process.getModuleByName(is64Bit ? "linker64" : "linker");
    var symbols = linkerModule.enumerateSymbols();
    for (var i = 0; i < symbols.length; i++) {
        if (symbols[i].name.indexOf('call_constructors') > 0) {
            console.warn(`call_constructors symbol name: ${symbols[i].name} address: ${symbols[i].address}`);
            return symbols[i].address;
        }
    }
}

function hook_call_constructors() {
    var ptr_call_constructors = find_call_constructors();
    var listener = Interceptor.attach(ptr_call_constructors, {
        onEnter(args) {
            if (!TargetLibModule) {
                TargetLibModule = Process.findModuleByName(TARGET_LIB_NAME);
            }

            if (TargetLibModule != null) {
                init_offsets.forEach(offset => {
                    Interceptor.replace(TargetLibModule.base.add(offset), new NativeCallback(function () {
                        console.log(`replace ${offset.toString(16)}`);
                    }, "void", []));
                });

                bypass();
                listener.detach()
            }

        },
        onLeave(retval) {
            if (this.shouldSkip) {
                retval.replace(0); // 直接返回，不执行 `.init_array`
            }
        }
    });
}

function hook_dlopen() {
    ["android_dlopen_ext", "dlopen"].forEach(funcName => {
        let addr = Module.findExportByName(null, funcName);
        if (addr) {
            Interceptor.attach(addr, {
                onEnter(args) {
                    let libName = ptr(args[0]).readCString();
                    if (libName && libName.indexOf(TARGET_LIB_NAME) >= 0) {
                        console.warn(`[!] Blocking ${funcName} loading: ${libName}`);
                        hook_call_constructors();
                    }
                },
                onLeave(retval) {
                }
            });
        }
    });
}

var is64Bit = Process.pointerSize === 8;
hook_dlopen();
```

hook掉这几个函数之后，日志输出：

```assembly
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/oat/arm/base.odex
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libblkv.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libbili_core.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libbilicr.88.0.4324.188.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libijkffmpeg.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libavif-jni.so
[android_dlopen_ext] /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libmsaoaidsec.so
call_constructors: __dl__ZN6soinfo17call_constructorsEv at 0xecdeec31
call_constructors onEnter
replace 0xc40d
replace 0x53a9
replace 0x53e5
replace 0x53f5
[Hooked] JNI_OnLoad 被调用
[Redmi 3S::tv.danmaku.bili ]->
[Redmi 3S::tv.danmaku.bili ]->
[Redmi 3S::tv.danmaku.bili ]->
[Redmi 3S::tv.danmaku.bili ]->
[Redmi 3S::tv.danmaku.bili ]-> Process crashed: Bad access due to invalid address

***
*** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
LineageOS Version: '16.0-20181113-UNOFFICIAL-land'
Build fingerprint: 'Xiaomi/land/land:6.0.1/MMB29M/V9.6.1.0.MALMIFD:user/release-keys'
Revision: '0'
ABI: 'arm'
pid: 7071, tid: 7152, name: gripper-new-thr  >>> tv.danmaku.bili <<<
signal 11 (SIGSEGV), code 1 (SEGV_MAPERR), fault addr 0xc
Cause: null pointer dereference
    r0  651f1ac6  r1  bd1f2237  r2  651f1ac6  r3  00000000
    r4  bd1f2237  r5  00000000  r6  e9a36e0c  r7  00010004
    r8  be9ed044  r9  e3670a00  r10 be9ecfe8  r11 e3604f00
    ip  e9a2f634  sp  be9ecef8  lr  bd1db4c3  pc  bd1ded22

backtrace:
    #00 pc 00008d22  /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libmsaoaidsec.so (offset 0x6000)
    #01 pc 000054bf  /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libmsaoaidsec.so (offset 0x5000)
    #02 pc 0000c74d  /data/app/tv.danmaku.bili-2R0mkPh8-d5nJZfqgfHE9g==/lib/arm/libmsaoaidsec.so (offset 0xc000)
    #03 pc 00000d07  <anonymous:e9fda000>
***
```

同理，nop掉`0000c74d-1`试试看。

```js
function nop_code(addr) {
	Memory.patchCode(ptr(addr), 4, code => {
		const cw = new ThumbWriter(code, { pc: ptr(addr) });
		cw.putNop();
		cw.putNop();
		cw.flush();
	})
}

function bypass() {
	nop_code(TargetLibModule.base.add(0xc74d - 1));
}
```

再次运行，App正常运行。



再试下方法三，替换目标库的加载，运行脚本`dlopen-replace.js`：

```js
/**
 * 替换模板库的加载
 */

const TARGET_LIB_NAME = "libmsaoaidsec.so";
const REPLACE_LIB_NAME = "libdummy.so";


function hook_dlopen() {
    ["android_dlopen_ext", "dlopen"].forEach(funcName => {
        let addr = Module.findExportByName(null, funcName);
        if (addr) {
            Interceptor.attach(addr, {
                onEnter(args) {
                    let libName = ptr(args[0]).readCString();
                    if (libName && libName.indexOf(TARGET_LIB_NAME) >= 0) {
                        console.log(`[+] ${funcName} onEnter: ${libName}`);

                        // 替换为加载 REPLACE_LIB_NAME
                        let newLib = Memory.allocUtf8String(REPLACE_LIB_NAME);
                        args[0] = newLib;
                        console.log(`[+] ${funcName}: 替换 ${libName} -> ${REPLACE_LIB_NAME}`);
                    }
                },
                onLeave: function (retval) {
                }
            });
        }
    });
}

hook_dlopen();
```

再次运行，App正常运行。测试中忘记复制`libdummy.so`了，也即该文件并不存在，居然App也可以正常运行。

另外通过hook System.loadLibrary替换目标库的加载也可以实现，`System.loadLibrary-libmsaoaidsec.js`脚本如下：

```js
/**
适用对象：通用
作用：监控 System.loadLibrary 加载的库文件，替换msaoaidsec的加载。
*/

const TargetLibName = 'msaoaidsec'
const MyLibName = 'dummy'

function hook() {
  const System = Java.use('java.lang.System');
  const Runtime = Java.use('java.lang.Runtime');
  const VMStack = Java.use('dalvik.system.VMStack');

  System.loadLibrary.implementation = function (libName) {
    try {
      console.log('System.loadLibrary("' + libName + '")');
      //printStack(); // 想知道是哪个类加载的可以打开日志

      var name = libName;
      if (libName == TargetLibName) {
        console.warn(`replace ${TargetLibName} as ${MyLibName}`);
        name = MyLibName;
      }
      return Runtime.getRuntime().loadLibrary0(VMStack.getCallingClassLoader(), name);
    } catch (e) {
      //console.log(e);
    }
  }
}


// 打印堆栈
function printStack() {
  Java.perform(function () {
    console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));
  });
}

hook();
```



## bilibili7.76.0

bilibili的7.76.0版本同xhsv8.31.0

经验证`pthread_create.js`脚本就可以绕过了，一共创建三个线程，替换掉之后不会崩溃，无须进行额外的指令patch。

```assembly
call_constructors symbol name: __dl__ZN6soinfo17call_constructorsEv address: 0x7b41385830call_constructors onEnter
[+] pthread_create called, thread function address: 0x7a882e6544
[!] Intercepted thread function at: 0x7a882e6544 (Offset: 0x1c544)
[+] pthread_create called, thread function address: 0x7a882e58d4
[!] Intercepted thread function at: 0x7a882e58d4 (Offset: 0x1b8d4)
[*] Fake thread function executed, doing nothing...
[+] pthread_create called, thread function address: 0x7a882f0e5c
[!] Intercepted thread function at: 0x7a882f0e5c (Offset: 0x26e5c)
[+] pthread_create called, thread function address: 0x7abb7f0390
[*] Fake thread function executed, doing nothing...
[*] Fake thread function executed, doing nothing...
```

init函数有6个：

```assembly
[call_constructors] libmsaoaidsec.so count:6
[call_constructors] init_array_ptr:0x7a8a55df80
[call_constructors] init_func:0x7a8a52b400 -> [libmsaoaidsec.so + 0x14400]
[call_constructors] init_array:0 0x7a8a51f3fc -> [libmsaoaidsec.so + 0x83fc]
[call_constructors] init_array:1 0x7a8a51f448 -> [libmsaoaidsec.so + 0x8448]
[call_constructors] init_array:2 0x7a8a51f460 -> [libmsaoaidsec.so + 0x8460]
[call_constructors] init_array:3 0x7a8a51f4b4 -> [libmsaoaidsec.so + 0x84b4]
[call_constructors] init_array:4 0x7a8a51f5a8 -> [libmsaoaidsec.so + 0x85a8]
[call_constructors] init_array:5 0x0 -> null
```

替换掉之后运行出错：

```assembly
backtrace:
    #00 pc 000000000000edb0  /data/app/tv.danmaku.bili-TOAI0fFsSTjAYF_K8CfbHg==/lib/arm64/libmsaoaidsec.so (offset 0x9000)
    #01 pc 0000000000008750  /data/app/tv.danmaku.bili-TOAI0fFsSTjAYF_K8CfbHg==/lib/arm64/libmsaoaidsec.so (offset 0x8000)
    #02 pc 0000000000013b24  /data/app/tv.danmaku.bili-TOAI0fFsSTjAYF_K8CfbHg==/lib/arm64/libmsaoaidsec.so (offset 0x9000)
```

这里经过测试nop掉0x13b24不行，后续还会出错，但是nop掉0x8750就没事。又因为7.76.0只有64位模式了，所以这块的代码修改为：

```js
function nop_code(addr) {
	Memory.patchCode(ptr(addr), 4, code => {
		const cw = new Arm64Writer(code, { pc: ptr(addr) });// 64位
		cw.putNop();
		cw.putNop();
		cw.flush();
	})
}

function bypass() {
	nop_code(TargetLibModule.base.add(0x8750));	// 64位不用减一
}
```

综上，以上方法在7.76.0版本中均有效。

## bilibiliv8.36.0

这个版本为2025年03月06日更新，完全同7.76.0，包括xhsv8.74.0也一样。基本上可以认为以上方法是通杀方案了。

## 追书神器v4.85.75

方案通用，不过需要稍微增加点东西。上来使用的是**替换线程**的方法看看崩溃情况，结果并不是native层的崩溃而是Java层崩溃：

```java
FATAL EXCEPTION: main
Process: com.ushaqi.zhuishushenqi, PID: 17726
java.lang.UnsatisfiedLinkError: No implementation found for int com.bun.miitmdid.e.a() (tried Java_com_bun_miitmdid_e_a and Java_com_bun_miitmdid_e_a__)
        at com.bun.miitmdid.e.a(Native Method)
        at com.bun.miitmdid.core.MdidSdkHelper.<clinit>(Unknown Source:0)
        at com.ushaqi.zhuishushenqi.util.msa.MsaHelper.<init>(SourceFile:8)
        at com.yuewen.ow2.a(SourceFile:7)
        at com.yuewen.zq.b(SourceFile:7)
        at com.yuewen.zq.c(SourceFile:8)
        at com.ushaqi.zhuishushenqi.MyApplication.onCreate(SourceFile:2)
        at com.sagittarius.v6.StubApplication.onCreate(Unknown Source:35)
        at android.app.Instrumentation.callApplicationOnCreate(Instrumentation.java:1154)
        at android.app.ActivityThread.handleBindApplication(ActivityThread.java:5882)
        at android.app.ActivityThread.access$1100(ActivityThread.java:200)
        at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1651)
        at android.os.Handler.dispatchMessage(Handler.java:106)
        at android.os.Looper.loop(Looper.java:193)
        at android.app.ActivityThread.main(ActivityThread.java:6680)
        at java.lang.reflect.Method.invoke(Native Method)
        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:493)
        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:858)
```

这下就有趣了。说明我们替换线程之后，导致某些jni函数没有注册成功，所以在后续的Java代码中再调用这些jni函数时就会出现找不到的情况。猜测`libmsaoaidsec`可能会在`JNI_OnLoad`里做一些判断，如果某些初始化没有成功的话就不会注册jni函数。

我们不去细究细节，先按照原方案思路patch掉崩溃的函数试试看。崩溃是说没有实现函数：`com.bun.miitmdid.e.a()`，那咱们就实现个假的给它调用不就行了嘛。构造的时机比较重要，在`call_constructors`的时候还不行，时机太早，会找不到目标类。但是在`JNI_OnLoad`的时候就可以，因此我们在`pthread_create.js`脚本的基础上增加对`JNI_OnLoad`的监控，并在`JNI_OnLoad`的时候去构造假函数即可。新脚本`pthread_create-replace-jni.js`如下：

```js
/**
 * Frida Hook - 监视 `pthread_create`，检测目标库创建的线程
 * 
 * 目标：
 * - 监视 `dlopen` 和 `android_dlopen_ext`，检测目标库何时加载。
 * - 通过 `call_constructors` 确保 `pthread_create` Hook 在目标库加载后执行。
 * - 拦截 `pthread_create`，检查线程函数是否在目标库 `so` 的范围内。
 * - 若发现目标库创建的线程，则替换线程函数，阻止其执行。
 * - 并在 JNI_OnLoad 里替换未注册成功的jni函数。
 * 
 * 说明：
 * - `pthread_create` 是创建线程的标准函数，Hook 它可以拦截所有新建线程。
 * - `call_constructors` 由 `linker` 调用，用于执行动态库的全局构造函数。
 * - `hook_call_constructors()` 确保 `TargetLibModule` 记录目标库的基地址，并在适当时机 Hook `pthread_create`。
 */

const TARGET_LIB_NAME = "libmsaoaidsec.so";
var TargetLibModule = null;  // 存储目标库模块信息

/////////////////////////////////////////

/**
 * Hook pthread_create，拦截目标库创建的线程
 */
function hook_pthread_create() {
	let pthread_create_addr = Module.findExportByName("libc.so", "pthread_create");
	if (!pthread_create_addr) {
		console.error("Failed to find pthread_create!");
		return;
	}

	Interceptor.attach(pthread_create_addr, {
		onEnter(args) {
			let thread_func_ptr = args[2];  // 线程函数地址
			console.log("[+] pthread_create called, thread function address: " + thread_func_ptr);

			// 确保目标库已加载
			if (!TargetLibModule) {
				//console.warn("Target library not loaded yet!");
				return;
			}

			// 判断线程函数是否在目标库 `so` 的范围内
			if (thread_func_ptr.compare(TargetLibModule.base) > 0 &&
				thread_func_ptr.compare(TargetLibModule.base.add(TargetLibModule.size)) < 0) {

				console.warn("[!] Intercepted thread function at: " + thread_func_ptr +
					" (Offset: " + thread_func_ptr.sub(TargetLibModule.base) + ")");

				// 替换线程函数，防止执行
				Interceptor.replace(thread_func_ptr, new NativeCallback(() => {
					console.log("[*] Fake thread function executed, doing nothing...");
				}, "void", []));
			}
		}
	});
}

function hook_JNI_OnLoad() {
	// 先尝试通过 `findExportByName`
	let jniOnLoad = Module.findExportByName(TARGET_LIB_NAME, "JNI_OnLoad");

	// 如果找不到，就遍历所有导出符号
	if (!jniOnLoad) {
		console.log("[Info] `JNI_OnLoad` 未导出，尝试遍历导出符号...");
		for (let symbol of module.enumerateSymbols()) {
			if (symbol.name.indexOf("JNI_OnLoad") >= 0) {
				jniOnLoad = symbol.address;
				console.log("[Success] 找到 JNI_OnLoad: ", jniOnLoad);
				break;
			}
		}
	}

	if (!jniOnLoad) {
		console.error("[Error] 未找到 `JNI_OnLoad` 函数");
		return;
	}

	// Hook `JNI_OnLoad`
	Interceptor.attach(jniOnLoad, {
		onEnter(args) {
			console.log("[Hooked] JNI_OnLoad 被调用");
			bypass();
		}
	});
}

function bypass() {
	try {
		var targetClassName = "com.bun.miitmdid.e";
		var targetClass = Java.use(targetClassName);
		console.log("[*] Successfully loaded class: " + targetClass);

		targetClass.a.overloads.forEach(function (overload) {
			overload.implementation = function () {
				console.log("[*] Hooked " + targetClass + ".a() with args: " + JSON.stringify(arguments));
				return 0; // 理论上要返回对应的值，这里粗暴一点随便返回个数值，不影响App正常运行即可。
			};
		});
	} catch (e) {
		console.log("[!] Error: " + e);
	}
}

function find_call_constructors() {
	is64Bit = Process.pointerSize === 8;
	var linkerModule = Process.getModuleByName(is64Bit ? "linker64" : "linker");
	var symbols = linkerModule.enumerateSymbols();
	for (var i = 0; i < symbols.length; i++) {
		if (symbols[i].name.indexOf('call_constructors') > 0) {
			console.warn(`call_constructors symbol name: ${symbols[i].name} address: ${symbols[i].address}`);
			return symbols[i].address;
		}
	}
}

function hook_call_constructors() {
	var ptr_call_constructors = find_call_constructors();
	var listener = Interceptor.attach(ptr_call_constructors, {
		onEnter: function (args) {
			console.warn(`call_constructors onEnter`);
			if (!TargetLibModule) {
				TargetLibModule = Process.findModuleByName(TARGET_LIB_NAME);
			}
			hook_pthread_create();
			listener.detach();
		},
	})
}

function hook_dlopen() {
	["android_dlopen_ext", "dlopen"].forEach(funcName => {
		let addr = Module.findExportByName(null, funcName);
		if (addr) {
			Interceptor.attach(addr, {
				onEnter(args) {
					let libName = ptr(args[0]).readCString();
					if (libName && libName.indexOf(TARGET_LIB_NAME) >= 0) {
						this.is_can_hook = true;
						hook_call_constructors();
					}
				},
				onLeave: function (retval) {
					if (this.is_can_hook) {
						console.log(`[+] ${funcName} onLeave, start hook JNI_OnLoad `);
						hook_JNI_OnLoad();
					}
				}
			});
		}
	});
}

var is64Bit = Process.pointerSize === 8;
hook_dlopen()
```

大部分脚本没变，无非是增加了`hook_JNI_OnLoad`，并在`JNI_OnLoad`进入的时候调用了`bypass()`：

```js
function bypass() {
	try {
		var targetClassName = "com.bun.miitmdid.e";
		var targetClass = Java.use(targetClassName);
		console.log("[*] Successfully loaded class: " + targetClass);

		targetClass.a.overloads.forEach(function (overload) {
			overload.implementation = function () {
				console.log("[*] Hooked " + targetClass + ".a() with args: " + JSON.stringify(arguments));
				return 0; // 理论上要返回对应的值，这里粗暴一点随便返回个数值，不影响App正常运行即可。
			};
		});
	} catch (e) {
		console.log("[!] Error: " + e);
	}
}
```

这里我们不管目标类有多少个重载函数，一律都给它替换掉，并增加了参数的输出（可以发现有趣的数据）。运行后：

```assembly
call_constructors symbol name: __dl__ZN6soinfo17call_constructorsEv address: 0x745a26f830
call_constructors onEnter
[+] pthread_create called, thread function address: 0x73b1fec544
[!] Intercepted thread function at: 0x73b1fec544 (Offset: 0x1c544)
[+] pthread_create called, thread function address: 0x73b1feb8d4
[!] Intercepted thread function at: 0x73b1feb8d4 (Offset: 0x1b8d4)
[*] Fake thread function executed, doing nothing...
[+] pthread_create called, thread function address: 0x73b1ff6e5c
[!] Intercepted thread function at: 0x73b1ff6e5c (Offset: 0x26e5c)
[*] Fake thread function executed, doing nothing...
[+] pthread_create called, thread function address: 0x73d4637390
[+] android_dlopen_ext onLeave, start hook JNI_OnLoad
[Hooked] JNI_OnLoad 被调用
[*] Successfully loaded class: <class: com.bun.miitmdid.e>
[*] Hooked <class: com.bun.miitmdid.e>.a() with args: {}
[*] Hooked <class: com.bun.miitmdid.e>.a() with args: {"0":"<instance: android.content.Context, $className: com.ushaqi.zhuishushenqi.MyApplication>","1":""}
Error: expected an unsigned integer
Error: Implementation for a expected return value compatible with boolean
    at re (frida/node_modules/frida-java-bridge/lib/class-factory.js:678)
    at <anonymous> (frida/node_modules/frida-java-bridge/lib/class-factory.js:655)
[*] Hooked <class: com.bun.miitmdid.e>.a() with args: {"0":"<instance: android.content.Context, $className: com.ushaqi.zhuishushenqi.MyApplication>","1":"-----BEGIN CERTIFICATE-----脱敏-----END CERTIFICATE-----\n"}
Error: expected an unsigned integer
Error: Implementation for a expected return value compatible with boolean
    at re (frida/node_modules/frida-java-bridge/lib/class-factory.js:678)
    at <anonymous> (frida/node_modules/frida-java-bridge/lib/class-factory.js:655)
[+] pthread_create called, thread function address: 0x73d4637390
```

App可以正常运行，Frida也未退出。上面的Error信息意思是需要适配原jni函数原型需要的返回值类型，因为咱们是随便返回的数值，故有此异常信息输出，但是并不影响App和Frida的正常运行。如果想要完美的话，就可以根据日志情况去逐个构造函数并返回对应的类型数值即可。

总结下，其实这个思路没有变，无非是path掉Java层的函数解决因为替换线程调用而出现的掉崩溃问题。

# 参考

- [frida hook init_array自吐新解](https://blog.seeflower.dev/archives/299/)
- [绕过bilibili frida反调试](https://bbs.kanxue.com/thread-277034.htm) （bilibili7.26.1）
- [关于libmsaoaidsec.so反Frida](https://www.52pojie.cn/forum.php?mod=viewthread&tid=2008459)
- [绕过最新版bilibili app反frida机制](https://bbs.kanxue.com/thread-281584.htm) （bilibili7.76.0，两个方法有效）
- [bilibili XHS frida检测分析绕过](https://www.52pojie.cn/thread-2012106-1-1.html)（XHS 8.32.0）
- [某书Frida检测绕过记录_libmsaoaidsec.so](https://blog.csdn.net/weixin_45582916/article/details/137973006)
