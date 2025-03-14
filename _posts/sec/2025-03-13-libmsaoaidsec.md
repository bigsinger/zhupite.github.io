
---
layout:		post
category:	"sec"
title:		"绕过libmsaoaidsec.so进行frida检测的方法汇总"

tags:		[]
---
- Content
{:toc}




# 绕过

在 [绕过bilibili frida反调试](https://bbs.kanxue.com/thread-277034.htm) （测试目标为bilibili7.26.1版本） 基础上做了一些优化。

**方法一：**

1. 监控so的加载，锁定目标so；
2. 锁定目标so的检测时机；
3. 替换目标so创建的线程；
4. patch目标so崩溃；

**方法二：**

1. 监控so的加载，锁定目标so；
2. 锁定目标so的检测时机；
3. 替换init函数；
4. patch目标so崩溃；



详细具体步骤如下。

先使用如下脚本（`dlopen.js`）跑一下。

```js
// 目标动态库名称
const TARGET_LIB_NAME = "libmsaoaidsec.so";


function hook_dlopen(target_so_name) {
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

// 执行加载动态库并 Hook 的逻辑
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
  // 1. 先尝试通过 `findExportByName`
  let jniOnLoad = Module.findExportByName(TARGET_LIB_NAME, "JNI_OnLoad");

  // 2. 如果找不到，就遍历所有导出符号
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

  // 3. 如果还是找不到，终止
  if (!jniOnLoad) {
    console.log("[Error] 未找到 `JNI_OnLoad` 函数");
    return;
  }

  // 4. Hook `JNI_OnLoad`
  Interceptor.attach(jniOnLoad, {
    onEnter(args) {
      console.log("[Hooked] JNI_OnLoad 被调用");
    }
  });
}

function hook_dlopen() {
  Interceptor.attach(Module.findExportByName(null, "android_dlopen_ext"), {
    onEnter: function (args) {
      var pathptr = args[0];
      if (pathptr) {
        var path = ptr(pathptr).readCString();
        console.log("[android_dlopen_ext]", path)
        if (path.indexOf(TARGET_LIB_NAME) > -1) {
          this.is_can_hook = true;
        }
      }
    },
    onLeave: function (retval) {
      if (this.is_can_hook) {
        hook_JNI_OnLoad()
      }
    }
  });
}

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
Process terminated
```

这里看出`JNI_OnLoad`并没有打印出来，说明功能在`JNI_OnLoad`之前。那就验证下，接着跑一下如下脚本（`call_constructors.js`）：

```js
const TARGET_LIB_NAME = "libmsaoaidsec.so";
var TargetLibModule = null;  // 存储目标库模块信息
var ptr_call_constructors;


function find_call_constructors() {
  is64Bit = Process.pointerSize === 8;
  var linkerModule = Process.getModuleByName(is64Bit ? "linker64" : "linker");
  var Symbols = linkerModule.enumerateSymbols();
  for (var i = 0; i < Symbols.length; i++) {
    if (Symbols[i].name.indexOf('call_constructors') > 0) {
      console.warn(`call_constructors: ${Symbols[i].name} at ${Symbols[i].address}`,);
      return Symbols[i].address;
    }
  }
}

function hook_call_constructors() {
  if (!ptr_call_constructors) {
    ptr_call_constructors = find_call_constructors();
  }
  var listener = Interceptor.attach(ptr_call_constructors, {
    onEnter: function (args) {
      if (!TargetLibModule) {
        TargetLibModule = Process.findModuleByName(TARGET_LIB_NAME);
      }
      console.warn(`call_constructors onEnter`);
      listener.detach();
    },
  })
}

function hook_dlopen() {
  Interceptor.attach(Module.findExportByName(null, "android_dlopen_ext"),
    {
      onEnter: function (args) {
        var pathptr = args[0];
        if (pathptr) {
          var path = ptr(pathptr).readCString();
          console.log("[android_dlopen_ext]", path)
          if (path.indexOf(TARGET_LIB_NAME) > -1) {
            hook_call_constructors();
          }
        }
      }
    }
  )
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
/**
 * Frida Hook - 直接 Hook pthread_create，动态检测目标库
 */

const TARGET_LIB_NAME = "libmsaoaidsec.so";
var TargetLibModule = null;  // 存储目标库模块信息
var ptr_call_constructors;

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

function hook_JNI_OnLoad(target_so_name) {
	// 1. 先尝试通过 `findExportByName`
	let jniOnLoad = Module.findExportByName(TARGET_LIB_NAME, "JNI_OnLoad");

	// 2. 如果找不到，就遍历所有导出符号
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

	// 3. 如果还是找不到，终止
	if (!jniOnLoad) {
		console.log("[Error] 未找到 `JNI_OnLoad` 函数");
		return;
	}

	// 4. Hook `JNI_OnLoad`
	Interceptor.attach(jniOnLoad, {
		onEnter(args) {
			console.log("[Hooked] JNI_OnLoad 被调用");
		}
	});
}

function find_call_constructors() {
	is64Bit = Process.pointerSize === 8;
	var linkerModule = Process.getModuleByName(is64Bit ? "linker64" : "linker");
	var Symbols = linkerModule.enumerateSymbols();
	for (var i = 0; i < Symbols.length; i++) {
		if (Symbols[i].name.indexOf('call_constructors') > 0) {
			console.warn(`call_constructors: ${Symbols[i].name} at ${Symbols[i].address}`,);
			return Symbols[i].address;
		}
	}
}

function hook_call_constructors() {
	if (!ptr_call_constructors) {
		ptr_call_constructors = find_call_constructors();
	}
	var listener = Interceptor.attach(ptr_call_constructors, {
		onEnter: function (args) {
			if (!TargetLibModule) {
				TargetLibModule = Process.findModuleByName(TARGET_LIB_NAME);
			}
			console.warn(`call_constructors onEnter`);
			hook_pthread_create();
			listener.detach();
		},
	})
}

function hook_dlopen() {
	Interceptor.attach(Module.findExportByName(null, "android_dlopen_ext"), {
		onEnter: function (args) {
			var pathptr = args[0];
			if (pathptr) {
				var path = ptr(pathptr).readCString();
				console.log("[android_dlopen_ext]", path)
				if (path.indexOf(TARGET_LIB_NAME) > -1) {
					this.is_can_hook = true;
					hook_call_constructors();
				}
			}
		},
		onLeave: function (retval) {
			if (this.is_can_hook) {
				hook_JNI_OnLoad()
			}
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



现在试下patch掉init的那些函数（在`call_constructors`回调里调用）。

```js
function replaceInitArray() {
	if (TargetLibModule) {
		Interceptor.replace(TargetLibModule.base.add(0xc40d), new NativeCallback(function () {
			console.log("replace 0xc40d")
		}, "void", []));

		Interceptor.replace(TargetLibModule.base.add(0x53a9), new NativeCallback(function () {
			console.log("replace 0x53a9")
		}, "void", []));

		Interceptor.replace(TargetLibModule.base.add(0x53e5), new NativeCallback(function () {
			console.log("replace 0x53e5")
		}, "void", []));

		Interceptor.replace(TargetLibModule.base.add(0x53f5), new NativeCallback(function () {
			console.log("replace 0x53f5")
		}, "void", []));
	}
}
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

再次运行，App正常运行。





# 参考

- [绕过bilibili frida反调试](https://bbs.kanxue.com/thread-277034.htm) 
- [关于libmsaoaidsec.so反Frida](https://www.52pojie.cn/forum.php?mod=viewthread&tid=2008459)
- [frida hook init_array自吐新解](https://blog.seeflower.dev/archives/299/)
- [绕过最新版bilibili app反frida机制](https://bbs.kanxue.com/thread-281584.htm) （7.76.0）
- [bilibili XHS frida检测分析绕过](https://www.52pojie.cn/thread-2012106-1-1.html)（XHS 8.32.0）
- [某书Frida检测绕过记录_libmsaoaidsec.so](https://blog.csdn.net/weixin_45582916/article/details/137973006)
