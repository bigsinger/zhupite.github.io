---
layout:		post
category:	"python"
title:		"《Linux黑客的Python编程之道》"
tags:		[python]
---
- Content
{:toc}


摘自《Linux黑客的Python编程之道》

# ctypes
使用 ctypes 的第一步就是明白如何解析和访问动态链接库中的函数。一个 dynamically
linked library(被动态连接的库)其实就是一个二进制文件，不过一般自己不运行，而是由别
的程序调用执行。在 Windows 上叫做 dynamic link libraries (DLL)动态链接库,在 Linux 上叫
做 shared objects (SO)共享库。 无论什么平台， 这些库中的函数都必须通过导出的名字调用，
之后再在内存中找出真正的地址。 所以正常情况下， 要调用函数， 都必须先解析出函数地址，
不过 ctypes 替我们完成了这一步。


ctypes 提供了三种方法调用动态链接库:cdll(), windll(), 和 oledll()。它们的不同之处就在
于，函数的调用方法和返回值。 cdll() 加载的库，其导出的函数必须使用标准的 cdecl 调用
约定。 windll()方法加载的库， 其导出的函数必须使用 stdcall 调用约定(Win32 API 的原生约
定)。 oledll()方法和 windll()类似，不过如果函数返回一个 HRESULT 错误代码，可以使用
COM 函数得到具体的错误信息。

直接从 C 库中调用 printf()函数打印一条消息， Windows 中的 C 库
位于 C:\WINDOWS\system32\msvcrt.dll， Linux 中的 C 库位于/lib/libc.so.6。
```python
from ctypes import *
msvcrt = cdll.msvcrt
message_string = "Hello world!\n"
msvcrt.printf("Testing: %s", message_string)
```

Linux 下：
```python
from ctypes import *
libc = CDLL("libc.so.6")
message_string = "Hello world!\n"
libc.printf("Testing: %s", message_string)
```
使用 Python 创建一个 C 数据类型很简单，你可以很容易的使用由 C 或者 C++些的组件。
Listing 1-1 显示三者之间的对于关系。网上可以找下

# 结构和联合
结构和联合是非常重要的数据类型， 被大量的适用于 WIN32 的 API 和 Linux 的 libc 中。
一个结构变量就是一组简单变量的集合(所有变量都占用空间)些结构内的变量在类型上没
有限制， 可以通过点加变量名来访问。 比如 beer_recipe.amt_barley， 就是访问 beer_recipe 结
构中的 amt_barley 变量。

```c
struct beer_recipe
{
	int amt_barley;
	int amt_water;
};
```

```python
class beer_recipe(Structure):
	_fields_ = [
		("amt_barley", c_int),
		("amt_water", c_int),
	]
```

ctypes 很简单的就创建了一个 C 兼容的结构。
联合和结构很像。但是联合中所有变量同处一个内存地址，只占用一个变量的内存空间，
这个空间的大小就是最大的那个变量的大小。这样就能够将联合作为不同类型的变量操作访
问了。

# PyDbg
Windows 平台下的 Python 调试器。PyDbg 出生于 2006 年，出生地 Montreal, Quebec，父亲 Pedram
Amini，担当角色：逆向工程框架 PaiMei 的核心组件。现在 PyDbg 已经用于各种各样的工
具之中了， 其中包括 Taof （非常流行的 fuzzer 代理） ioctlizer（作者开发的一个针对 windwos
驱动的 fuzzer）。 

创建两个 Python 文件 my_debugger.py 和 my_debugger_defines.py。我们将创建一个父类
debugger() 接着逐渐的增加各种调试函数。另外，把所有的结构，联合，常量放 到
my_debugger_defines.py 方便以后维护。代码不贴了，参考《Linux黑客的Python编程之道》。

```python
# my_debugger_defines.py
from ctypes import *
# Let's map the Microsoft types to ctypes for clarity
WORD = c_ushort
DWORD = c_ulong
LPBYTE = POINTER(c_ubyte)
LPTSTR = POINTER(c_char)
HANDLE = c_void_p
# Constants
DEBUG_PROCESS = 0x00000001
CREATE_NEW_CONSOLE = 0x00000010
# Structures for CreateProcessA() function
class STARTUPINFO(Structure):
	_fields_ = [
		("cb", DWORD),("lpReserved", LPTSTR),
		("lpDesktop", LPTSTR),
		("lpTitle", LPTSTR),
		("dwX", DWORD),
		("dwY", DWORD),
		("dwXSize", DWORD),
		("dwYSize", DWORD),
		("dwXCountChars", DWORD),
		("dwYCountChars", DWORD),
		("dwFillAttribute",DWORD),
		("dwFlags", DWORD),
		("wShowWindow", WORD),
		("cbReserved2", WORD),
		("lpReserved2", LPBYTE),
		("hStdInput", HANDLE),
		("hStdOutput", HANDLE),
		("hStdError", HANDLE),
		]
class PROCESS_INFORMATION(Structure):
		_fields_ = [
		("hProcess", HANDLE),
		("hThread", HANDLE),
		("dwProcessId", DWORD),
		("dwThreadId", DWORD),
	]
```

```python
# my_debugger.py
#my_debugger.py
from ctypes import *
from my_debugger_defines import *
kernel32 = windll.kernel32
class debugger():
def __init__(self):
self.h_process = None
self.pid = None
self.debugger_active = False
def load(self,path_to_exe):
...
print "[*] We have successfully launched the process!"
print "[*] PID: %d" % process_information.dwProcessId
# Obtain a valid handle to the newly created process
# and store it for future access
self.h_process = self.open_process(process_information.dwProcessId)
...
def open_process(self,pid):
h_process = kernel32.OpenProcess(PROCESS_ALL_ACCESS,pid,False)
return h_process
def attach(self,pid):
self.h_process = self.open_process(pid)
# We attempt to attach to the process
# if this fails we exit the call
if kernel32.DebugActiveProcess(pid):
self.debugger_active = True
self.pid = int(pid)
self.run()
else:
print "[*] Unable to attach to the process."
def run(self):
# Now we have to poll the debuggee for
# debugging events
while self.debugger_active == True:
self.get_debug_event()
def get_debug_event(self):
debug_event = DEBUG_EVENT()
continue_status= DBG_CONTINUE
if kernel32.WaitForDebugEvent(byref(debug_event),INFINITE):# We aren't going to build any event handlers
# just yet. Let's just resume the process for now.
raw_input("Press a key to continue...")
self.debugger_active = False
kernel32.ContinueDebugEvent( \
debug_event.dwProcessId, \
debug_event.dwThreadId, \
continue_status )
def detach(self):
if kernel32.DebugActiveProcessStop(self.pid):
print "[*] Finished debugging. Exiting..."
return True
else:
print "There was an error"
return False

```

```python
#my_test.py
import my_debugger
debugger = my_debugger.debugger()
pid = raw_input("Enter the PID of the process to attach to: ")
debugger.attach(int(pid))
debugger.detach()
```

用 PyDbg 可以很容
易的扩展这种功能，只需要构建一个用户模式的回调函数。当收到一个调试事件的时候，回
调函数执行我们定义的操作。比如读取特定地址的数据，设置更更多的断点，操作内存。操
作完成后，再将权限交还给调试器，恢复被调试的进程。
PyDbg 设置函数的断点原型如下：
```python
bp_set(address, description="",restore=True,handler=None)
```
address 是要设置的断点的地址， description 参数可选，用来给每个断点设置唯一的名字。
restore 决定了是否要在断点被触发以后重新设置， handler 指向断点触发时候调用的回调函
数。断点回调函数只接收一个参数，就是 pydbg()类的实例化对象。所有的上下文数据，线
程，进程信息都在回调函数被调用的时候，装填在这个类中。

PyDbg 能够很方便的实现一个违例访问处理函数， 并输出相关的奔溃信息。 这次的测试
目标就是危险的 C 函数 strcpy() ， 我们用它创建一个会被溢出的程序。 接下来我们再写一个
简短的 PyDbg 脚ᴀ附加到进程并处理违例。溢出的脚ᴀ buffer_overflow.py，代码如下：
```python
#buffer_overflow.py
from ctypes import *
msvcrt = cdll.msvcrt
# Give the debugger time to attach, then hit a button
raw_input("Once the debugger is attached, press any key.")
# Create the 5-byte destination buffer
buffer = c_char_p("AAAAA")
# The overflow string
overflow = "A" * 100
# Run the overflow
msvcrt.strcpy(buffer, overflow)
```

问题出在这句 msvcrt.strcpy(buffer, overflow)， 接受的应该是一个指针， 而传递给函数的
是 一 个 变 量 ， 函 数 就 会 把 overflow 当 作 指 针 使 用 ， 把 里 头 的 值 当 作 地 址 用
（0x41414141414.....）。 可惜这个地址是很可能是不能用的。 现在我们已经构造了测试案例，
接下来是处理程序了。
```python
#access_violation_handler.py
from pydbg import *
from pydbg.defines import *
# Utility libraries included with PyDbg
import utils
# This is our access violation handler
def check_accessv(dbg):
# We skip first-chance exceptions
if dbg.dbg.u.Exception.dwFirstChance:
return DBG_EXCEPTION_NOT_HANDLED
crash_bin = utils.crash_binning.crash_binning()
crash_bin.record_crash(dbg)
print crash_bin.crash_synopsis()
dbg.terminate_process()
return DBG_EXCEPTION_NOT_HANDLED
pid = raw_input("Enter the Process ID: ")
dbg = pydbg()
dbg.attach(int(pid))dbg.set_callback(EXCEPTION_ACCESS_VIOLATION,check_accessv)
dbg.run()
```
现在运行 buffer_overflow.py，并记下它的进程号，我们先暂停它等处理完以后再运行。
执行 access_violation_handler.py 文件， 输入测试套件的 PID.当调试器附加到进程以后， 在测
试套件的终端里按任何键，接下来你应该看到和表 4-1 相似的输出。

输出了很多有用的信息片断。第一个部分指出了那个指令引发了访问异常以及指令在哪
个块里。这个信息可以帮助 你写出漏洞利用程序或者用静态分析工具分析问题出在哪里。
第二部分转储出了所有寄存器的值， 特别有趣的是， 我们将 EAX 覆盖成了 0x41414141（0x41
是大写 A 的的十六进制表示）。同样，我们看到 ESI 指向了一个由 A 组成的字符串。和 ESP+08
指向同一个地方。 第三部分是在故障指令附近代码的反汇编指令。 最后一块是奔溃发生时候
注册的结构化异常处理程序的列表。

用 PyDbg 构建一个奔溃处理程序就是这么简单。不仅能够自动化的处理崩溃，还能在
在事后剖析进程发生的一切。下节，我们用 PyDbg 的进程内部快照功能创建一个进 程
rewinder。

## 进程快照
PyDbg 提供了一个非常酷的功能， 进程快照。 使用进程快照的时候， 我们就能够冰冻进
程， 获取进程的内存数据。 以后我们想要让进程回到这个时刻的状态， 只要使用这个时刻的
快照就行了。

第一步,在一个准确的时间获得一份目标进程的精确快照。为了使得快照足够精确，需
要得到所有线程以及 CPU 上下文，还有进程的整个内存。将这些数据存储起来，下次我们
需要恢复快照的时候就能用的到。

为了防止在获取快照的时候， 进程的数据或者状态被修改， 需要将进程挂起来， 这个任
务由 suspend_all_threads()完成。 挂起进程之后， 可以用 process_snapshot()获取快照。 快照完
成之后， 用 resume_all_threads()恢复挂起的进程， 让程序继续执行。 当某个时刻我们需要将
进程恢复到从前的状态，简单的 process_restore()就行了。这看起来是不是太简单了？

现在新建个 snapshot.py 试验下，代码的功能就是我们输入"snap"的时候创建一个快照，
输入"restore"的时候将进程恢复到快照时的状态。

第一步就是在调试器内部创建一个新线程， 并用此启动目标进程。 通过使用分开的
线程， 就能将被调试的进程和调试器的操作分开， 这样我们输入不同的快照命令进行操作的
时候， 就不用强迫被调试进程暂停。 当创建新线程的代码返回了有效的 PID， 我们就创建另
一个线程，接受我们输入的调试命令。之后这个线程根据我们输入的命令决定不同的操作（快
照，恢复快照，结束程序）。

## PyDbg综合应用 创建一个fuzz辅助工具
构建一个工具用来根除应用程序中出现的可利用的漏洞，工具将定位于危险函数，并跟踪它们的调用。当我们认为函数被危险调用了，就将 4 堆栈中的 4 个参数接触引用， 弹出栈， 并且在函数产生溢出之前对进程快照。 如果这次访问
违例了，我们的脚ᴀ将把进程恢复到，函数被调用之前的快照。并从这开始，单步执行，同
时 反 汇 编 每 个 执 行 的 代 码 ， 直 到 我 们 也 抛 出 了 访 问 违 例 ， 或 者 执 行 完 了
MAX_INSTRUCTIONS（我们要监视的代码数量）。 无论什么时候当你看到一个危险的函数
在处理你输入的数据的时候， 尝试操作数据 crash 数据都似乎值得。 这是创造出我们的漏洞
利用程序的第一步。


# Immunity
PyDbg 固然强大， 方便的扩展， 自动化调试。 不过每次要完成任务的时候， 都要自己动手编写代码。 接下来介绍
的 Immunity Debugger 弥补了这点，完美的结合了图形化调试和脚ᴀ调试。它能让你更懒。

IMMUNITY 除
了拥有完整的用户界面外，还拥有强大的 Python 库，使得它处理漏洞挖掘， exploit 开发， 病毒分析之类的工作变得非常简单。

IImmunity 很好的结合了动态调试和静态分析。还有纯 Python 图形算法实现的绘图函数。 接下来让我们深入学习 Immunity 的使用， 进一步的研究 exploit 的开发和病毒调试中的 bypass技术。


# 注入 HOOK

# Fuzz
Code coverage 是一个度量，通过统计测试目标程序的过程中，执行了函数。 Fuzzing
专家 Charlie Miller 通过经验证明，寻找到的 bug 数量和 Code coverage 的增长成正比。

# Sulley
强大的基于 Python 的 fuzzing 框架。Sulley 不仅仅是一个 fuzzer； 它还有拥有优秀的崩
溃报告，自动虚拟化技术（VMWare automation）。在 fuzzing 的过程中你可以在任意时刻，
甚至是目标程序崩溃的时候， 从新启动程序到前一刻， 继续寻找 bug 之旅。 

# 驱动的fuzz Driver Fuzzer
用 Immunity 内建的 driverlib 库找出设备名。很简单的使用三行代码就找到了一个可用的设备名\\Device\\Beep,这省去了我们通过反汇编一行行查找代码的时间。

下面看看 driverlib 是如何查找 IOCTL
dispatch function（IOCTL 调度函数）和 IO IOCTL codes（IOCTL 代码）的。
任何驱动要实现 IOCTL 接口，都必须有一个 IOCTL dispatch 负责处理各种 IOCTL 请求。
当驱动被加载的似乎后， 第一个访问的函数就是 DriverEntry。 


# IDAPython
2004 年 Gergely 和 Ero Carrera 开发了 IDAPython 插件， 将强大的 Python 和 IDA 结合起
来，使得自动化分析变得异常简单。IDAPython能够访问所有的 IDC函数。

Debugger Hook 是 IDAPython 提供的另一个非常酷的功能， 用于 Hook 住 IDA 内部的调试器，同时处理各种调试事件。虽然 IDA 一般不用于调试任务，但是当需要动态调试的时候，调用 IDA 内部调试器还是比外部的会方便很多。之后我们会用 debugger hooks 创建一个代码覆盖率统计工具。 使用 debugger hook 之前， 先要睇你一个一个 hook 类然后在类里头定义各种不同的处理函数。

当一个开发者在寻找软件漏洞 bug 的时候，首先会找一些常用的而且容易被错误使用的函数。比如危险的字符串拷贝函数(strcpy, sprintf)，内存拷贝函数(memcpy)等。在我们审核程序的时候， 需要很简单的就找出这些函数。 下面的脚ᴀ， **将跟踪这些危险的函数， 找出调用它们的地方，之后在这些地方的背景色设置成不同的颜色**，我们在 IDA 窗口中就能很方便的看出来。

# 仿真器PyEmu
PyEmu 是一个存 Python 实现的IA32 仿真器，用于仿真 CPU 的各种行为以完成不同的任务。 仿真器非常有用， 比如在调试病毒的时候， 我们就不用真正的运行它，而是通过仿真器欺骗它在我们的模拟环境中运行。 PyEmu里 有 三 个 类 :IDAPyEmu, PyDbgPyEmu 和 PEPyEmu 。
- IDAPyEmu 用于在 IDA Pro 内完成各种仿真任务（由 DAPython 调用）
- PyDbgPyEmu 类用于动态分析，同时它允许使用我们真正的内存和寄存器。
- PEPyEmu 类是一个独立的静态分析库，不需要 IDA 就能完成反汇编任务。


PyEmu 被划分成三个重要的系统： PyCPU， PyMemory 和 PyEmu。与我们交互最多的就是 PyEmu 类，它再和 PyCPU 和 PyMemoey 交互完成底层的仿真工作。当我们测试驱动PyEmu 执行一个指令的时候， 它就调用 PyCPU 完成真正的指令操作。 PyCPU 在进行指令操作的时候， 把需要的内存操作告诉 PyEmu， 由 PyEmu 继续调用 PyMemory 辅助完成整个指令的操作，最后由 PyEmu 将指令的结果返回给调用者。

