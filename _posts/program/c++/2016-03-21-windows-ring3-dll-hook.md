---
layout:		post
category:	"program"
title:		"Windows平台Ring3下DLL注入(HOOK)方法整理汇总"
tags:		[c++]
---
### 1.dll劫持
粗略整理了下，可以劫持的dll有(持续更新)：
lpk.dll、usp10.dll、msimg32.dll、midimap.dll、ksuser.dll、comres.dll、ddraw.dll

以lpk为例，在win7下由于lpk被加入KnownDLLs且该注册表值不可修改，使得lpk强制从系统目录加载，

不过可以将lpk.dll加入ExcludeFromKnownDlls来解决，具体可以创建一个lpk.reg文件：
```
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager]
"ExcludeFromKnownDlls"=hex(7):6c,00,70,00,6b,00,2e,00,64,00,6c,00,6c,00,00,00,\
00,00
```
成功导入后需要重新启动电脑才能生效。

参考：http://support.microsoft.com/?scid=kb%3Ben-us%3B164501&x=4&y=12

另外win7下的lpk在编写方面需要注意：

**WIN7有的程序调用LPK.DLL的LpkInitialize输出函数在LPK的初始化前面.
要在LpkInitialize这个函数中加入一些处理,并且这部分代码不能加密.**

因此为了兼容各个系统，可以在DllMain和LpkInitialize里均做判断，如果没有初始化就进行初始化。下面贴出完整代码：

```
// lpk.cpp : Defines the entry point for the DLL application.
//

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 头文件
#include "stdafx.h"
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 导出函数
#pragma comment(linker, "/EXPORT:LpkInitialize=_AheadLib_LpkInitialize,@1")
#pragma comment(linker, "/EXPORT:LpkTabbedTextOut=_AheadLib_LpkTabbedTextOut,@2")
#pragma comment(linker, "/EXPORT:LpkDllInitialize=_AheadLib_LpkDllInitialize,@3")
#pragma comment(linker, "/EXPORT:LpkDrawTextEx=_AheadLib_LpkDrawTextEx,@4")
//#pragma comment(linker, "/EXPORT:LpkEditControl=_AheadLib_LpkEditControl,@5")
#pragma comment(linker, "/EXPORT:LpkExtTextOut=_AheadLib_LpkExtTextOut,@6")
#pragma comment(linker, "/EXPORT:LpkGetCharacterPlacement=_AheadLib_LpkGetCharacterPlacement,@7")
#pragma comment(linker, "/EXPORT:LpkGetTextExtentExPoint=_AheadLib_LpkGetTextExtentExPoint,@8")
#pragma comment(linker, "/EXPORT:LpkPSMTextOut=_AheadLib_LpkPSMTextOut,@9")
#pragma comment(linker, "/EXPORT:LpkUseGDIWidthCache=_AheadLib_LpkUseGDIWidthCache,@10")
#pragma comment(linker, "/EXPORT:ftsWordBreak=_AheadLib_ftsWordBreak,@11")
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 宏定义
#define EXTERNC extern "C"
#define NAKED __declspec(naked)
#define EXPORT __declspec(dllexport)

#define ALCPP EXPORT NAKED
#define ALSTD EXTERNC EXPORT NAKED void __stdcall
#define ALCFAST EXTERNC EXPORT NAKED void __fastcall
#define ALCDECL EXTERNC NAKED void __cdecl
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//LpkEditControl导出的是数组，不是单一的函数（by Backer）
EXTERNC void __cdecl AheadLib_LpkEditControl(void);   
EXTERNC __declspec(dllexport) void (*LpkEditControl[14])() = {AheadLib_LpkEditControl};   

////////////////////////////////////////////////////////////////////////////////////////////////
//添加全局变量
BOOL g_bInited = FALSE;

////////////////////////////////////////////////////////////////////////////////////////////////  

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AheadLib 命名空间
namespace AheadLib
{
    HMODULE m_hModule = NULL;    // 原始模块句柄
    
    // 加载原始模块
    BOOL WINAPI Load()
    {
        TCHAR tzPath[MAX_PATH];
        TCHAR tzTemp[MAX_PATH * 2];
        
        GetSystemDirectory(tzPath, MAX_PATH);
        lstrcat(tzPath, TEXT("\\lpk.dll"));
        OutputDebugString(tzPath);
        m_hModule=LoadLibrary(tzPath);
        if (m_hModule == NULL)
        {
            wsprintf(tzTemp, TEXT("无法加载 %s，程序无法正常运行。"), tzPath);
            MessageBox(NULL, tzTemp, TEXT("AheadLib"), MB_ICONSTOP);
        };
        
        return (m_hModule != NULL);    
    }
    
    // 释放原始模块
    VOID WINAPI Free()
    {
        if (m_hModule)
        {
            FreeLibrary(m_hModule);
        }
    }
    
    // 获取原始函数地址
    FARPROC WINAPI GetAddress(PCSTR pszProcName)
    {
        FARPROC fpAddress;
        CHAR szProcName[16];
        TCHAR tzTemp[MAX_PATH];
        
        fpAddress = GetProcAddress(m_hModule, pszProcName);
        if (fpAddress == NULL)
        {
            if (HIWORD(pszProcName) == 0)
            {
                wsprintf(szProcName, "%d", pszProcName);
                pszProcName = szProcName;
            }
            
            wsprintf(tzTemp, TEXT("无法找到函数 %hs，程序无法正常运行。"), pszProcName);
            MessageBox(NULL, tzTemp, TEXT("AheadLib"), MB_ICONSTOP);
            ExitProcess(-2);
        }
        
        return fpAddress;
    }
}
using namespace AheadLib;
////////////////////////////////////////////////////////////////////////////////////////////////  

////////////////////////////////////////////////////////////////////////////////////////////////
//函数声明
void WINAPIV Init(LPVOID pParam);
////////////////////////////////////////////////////////////////////////////////////////////////

void WINAPIV Init(LPVOID pParam)
{
    //在这里添加DLL加载代码
    return; 
} 

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 入口函数
BOOL WINAPI DllMain(HMODULE hModule, DWORD dwReason, PVOID pvReserved)
{
    if (dwReason == DLL_PROCESS_ATTACH)
    {
        DisableThreadLibraryCalls(hModule);
        if ( g_bInited==FALSE ){
            Load();
            g_bInited = TRUE;
        }
        
        //LpkEditControl这个数组有14个成员，必须将其复制过来    
        memcpy((LPVOID)(LpkEditControl+1), (LPVOID)((int*)GetAddress("LpkEditControl") + 1),52);   
        _beginthread(Init,NULL,NULL);
    }
    else if (dwReason == DLL_PROCESS_DETACH)
    {
        Free();
    }
    return TRUE;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 导出函数
ALCDECL AheadLib_LpkInitialize(void)
{
    if ( g_bInited==FALSE ){
        Load();
        g_bInited = TRUE;
    }
    GetAddress("LpkInitialize");
    __asm JMP EAX;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 导出函数
ALCDECL AheadLib_LpkTabbedTextOut(void)
{
    GetAddress("LpkTabbedTextOut");
    __asm JMP EAX;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 导出函数
ALCDECL AheadLib_LpkDllInitialize(void)
{
    GetAddress("LpkDllInitialize");
    __asm JMP EAX;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 导出函数
ALCDECL AheadLib_LpkDrawTextEx(void)
{
    GetAddress("LpkDrawTextEx");
    __asm JMP EAX;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 导出函数
ALCDECL AheadLib_LpkEditControl(void)
{
    GetAddress("LpkEditControl");
    __asm jmp DWORD ptr [EAX];//这里的LpkEditControl是数组，eax存的是函数指针
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 导出函数
ALCDECL AheadLib_LpkExtTextOut(void)
{
    GetAddress("LpkExtTextOut");
    __asm JMP EAX;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 导出函数
ALCDECL AheadLib_LpkGetCharacterPlacement(void)
{
    GetAddress("LpkGetCharacterPlacement");
    __asm JMP EAX;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 导出函数
ALCDECL AheadLib_LpkGetTextExtentExPoint(void)
{
    GetAddress("LpkGetTextExtentExPoint");
    __asm JMP EAX;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 导出函数
ALCDECL AheadLib_LpkPSMTextOut(void)
{
    GetAddress("LpkPSMTextOut");
    __asm JMP EAX;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 导出函数
ALCDECL AheadLib_LpkUseGDIWidthCache(void)
{
    GetAddress("LpkUseGDIWidthCache");
    __asm JMP EAX;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 导出函数
ALCDECL AheadLib_ftsWordBreak(void)
{
    GetAddress("ftsWordBreak");
    __asm JMP EAX;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
```


 

### 2.通过CreateRemoteThread创建远程线程。

XP以下使用代码：
```
BOOL WINAPI RemoteLoadLibrary(LPCTSTR pszDllName, DWORD dwProcessId)
{
    // 打开目标进程
    HANDLE hProcess = ::OpenProcess(
        PROCESS_VM_WRITE|PROCESS_CREATE_THREAD|PROCESS_VM_OPERATION, FALSE, dwProcessId);
    if(hProcess == NULL)
        return FALSE;


    // 在目标进程申请空间，存放字符串pszDllName，作为远程线程的参数
    int cbSize = (::lstrlen(pszDllName) + 1);
    LPVOID lpRemoteDllName = ::VirtualAllocEx(hProcess, NULL, cbSize, MEM_COMMIT, PAGE_READWRITE);
    ::WriteProcessMemory(hProcess, lpRemoteDllName, pszDllName, cbSize, NULL);

    // 取得LoadLibraryA函数的地址，我们将以它作为远程线程函数启动
    HMODULE hModule=::GetModuleHandle (_T("kernel32.dll"));
    LPTHREAD_START_ROUTINE pfnStartRoutine = 
        (LPTHREAD_START_ROUTINE)::GetProcAddress(hModule, "LoadLibraryA");


    // 启动远程线程
    HANDLE hRemoteThread = ::CreateRemoteThread(hProcess, NULL, 0, pfnStartRoutine, lpRemoteDllName, 0, NULL);
    if(hRemoteThread == NULL)
    {
        ::CloseHandle(hProcess);
        return FALSE;


    }

    ::CloseHandle(hRemoteThread);
    ::CloseHandle(hProcess);

    return TRUE;
}
```
这段代码在vista，win7下不能成功，需要改进，参考：http://bbs.pediy.com/showthread.php?t=101469&highlight=Vista+Win7+CreateRemoteThread

我参考上面资料和代码，稍作整理使之编译通过并能使用，目标进程打开时最好使用PROCESS_ALL_ACCESS权限。

vista的较为简单些，只要修改一个内存里的数值，这里不再实现。

```
typedef struct _CLIENT_ID {
    HANDLE UniqueProcess;
    HANDLE UniqueThread;
} CLIENT_ID,*PCLIENT_ID;

typedef struct _INITIAL_TEB
{
    PVOID PreviousStackBase;
    PVOID PreviousStackLimit;
    PVOID StackBase;
    PVOID StackLimit;
    PVOID AllocatedStackBase;
} INITIAL_TEB, *PINITIAL_TEB;


typedef NTSTATUS (NTAPI *TZwAllocateVirtualMemory)(
                                 __in     HANDLE ProcessHandle,
                                 __inout  PVOID *BaseAddress,
                                 __in     ULONG_PTR ZeroBits,
                                 __inout  PSIZE_T RegionSize,
                                 __in     ULONG AllocationType,
                                 __in     ULONG Protect
                                 );

static TZwAllocateVirtualMemory ZwAllocateVirtualMemory = (TZwAllocateVirtualMemory)GetProcAddress(GetModuleHandle("ntdll.dll"),"ZwAllocateVirtualMemory");

typedef NTSYSAPI NTSTATUS (NTAPI *TZwWriteVirtualMemory)    (    IN HANDLE     ProcessHandle,
                                                 IN PVOID     BaseAddress,
                                                 IN PVOID     Buffer,
                                                 IN SIZE_T     NumberOfBytesToWrite,
                                                 OUT PSIZE_T     NumberOfBytesWritten     
                                                 );
static TZwWriteVirtualMemory ZwWriteVirtualMemory = (TZwWriteVirtualMemory)GetProcAddress(GetModuleHandle("ntdll.dll"),"ZwWriteVirtualMemory");

typedef NTSYSAPI NTSTATUS (NTAPI *TZwProtectVirtualMemory)    (    IN HANDLE     ProcessHandle,
                                                 IN PVOID *     BaseAddress,
                                                 IN SIZE_T *     NumberOfBytesToProtect,
                                                 IN ULONG     NewAccessProtection,
                                                 OUT PULONG     OldAccessProtection     
                                                 );
static TZwProtectVirtualMemory ZwProtectVirtualMemory = (TZwProtectVirtualMemory)GetProcAddress(GetModuleHandle("ntdll.dll"),"ZwProtectVirtualMemory");

typedef NTSYSAPI NTSTATUS (NTAPI *TZwGetContextThread)    (    IN HANDLE     ThreadHandle,
                                             OUT PCONTEXT     Context     
                                             );
static TZwGetContextThread ZwGetContextThread = (TZwGetContextThread)GetProcAddress(GetModuleHandle("ntdll.dll"),"ZwGetContextThread");

typedef NTSYSAPI NTSTATUS (NTAPI *TZwCreateThread)    (    OUT PHANDLE     ThreadHandle,
                                         IN ACCESS_MASK     DesiredAccess,
                                         IN POBJECT_ATTRIBUTES ObjectAttributes     OPTIONAL,
                                         IN HANDLE     ProcessHandle,
                                         OUT PCLIENT_ID     ClientId,
                                         IN PCONTEXT     ThreadContext,
                                         IN PINITIAL_TEB     UserStack,
                                         IN BOOLEAN     CreateSuspended     
                                         );
static TZwCreateThread ZwCreateThread = (TZwCreateThread)GetProcAddress(GetModuleHandle("ntdll.dll"),"ZwCreateThread");

typedef NTSYSAPI NTSTATUS (NTAPI *TZwResumeThread)    (    IN HANDLE     ThreadHandle,
                                         OUT PULONG     SuspendCount     
                                         );
static TZwResumeThread ZwResumeThread = (TZwResumeThread)GetProcAddress(GetModuleHandle("ntdll.dll"),"ZwResumeThread");

HANDLE WINAPI myCreateRemoteThread(
                                    HANDLE hProcess,
                                    LPSECURITY_ATTRIBUTES lpThreadAttributes,
                                    SIZE_T dwStackSize,
                                    LPTHREAD_START_ROUTINE lpStartAddress,
                                    LPVOID lpParameter,
                                    DWORD dwCreationFlags,
                                    LPDWORD lpThreadId)
{
    //by 80695073(QQ) 
    //email kiss2008ufo@yahoo.com.cn
    CONTEXT    context = {CONTEXT_FULL}; 
    CLIENT_ID  cid={hProcess}; 
    DWORD    ret; 
    HANDLE    hThread = NULL;
    DWORD    StackReserve;
    DWORD    StackCommit = 0x1000;
    ULONG_PTR  Stack = 0;
    INITIAL_TEB InitialTeb={};
    ULONG    x; 
    const CHAR myBaseThreadInitThunk[] = 
    {
        //   00830000    8BFF            mov     edi, edi
        '\x8B','\xFF',
        //   00830002    55              push    ebp
        '\x55',
        //   00830003    8BEC            mov     ebp, esp
        '\x8B','\xEC',
        //   00830005    51              push    ecx   //ntdll.RtlExitUserThread
        '\x51',
        //   00830006    53              push    ebx   //参数
        '\x53',
        //   00830007    FFD0            call    eax   //函数地址
        '\xFF','\xD0',
        //   00830009    59              pop     ecx   //恢复结束函数地址
        '\x59',
        //   0083000A    50              push    eax   //将刚才的结果压栈
        '\x50',
        //   0083000B    FFD1            call    ecx   //调用RtlExitUserThread 结束
        '\xFF','\xD1',
        //  0083000D    90              nop
        '\x90'
    };
    PVOID  pBaseThreadThunk = NULL; //不能释放

    //0、分配非OS的加载函数
    StackReserve = 0x1000;
    ret = ZwAllocateVirtualMemory(hProcess, 
        /*&stack.ExpandableStackBottom*/(PVOID*)&pBaseThreadThunk, 
        0, 
        &StackReserve,
        MEM_COMMIT, 
        PAGE_EXECUTE_READWRITE); 
    if (ret >= 0x80000000)
    {
        //失败
        TRACE("Error IN myCreateRemoteThread ZwAllocateVirtualMemory0 !\n");
        goto myCreateRemoteThreadRet;
        //end
    }
    ret = ZwWriteVirtualMemory(hProcess,
        pBaseThreadThunk,
        (LPVOID)myBaseThreadInitThunk,
        sizeof(myBaseThreadInitThunk),&x);
    if (ret >= 0x80000000)
    {
        //失败
        TRACE("Error IN myCreateRemoteThread ZwAllocateVirtualMemory0 !\n");
        goto myCreateRemoteThreadRet;
        //end
    }

    //1、准备堆栈
    StackReserve = 0x10000;
    ret = ZwAllocateVirtualMemory(hProcess, 
        /*&stack.ExpandableStackBottom*/(PVOID*)&Stack, 
        0, 
        &StackReserve,
        MEM_RESERVE, 
        PAGE_READWRITE); 
    if (ret >= 0x80000000)
    {
        //失败
        TRACE("Error IN myCreateRemoteThread ZwAllocateVirtualMemory1!\n");
        goto myCreateRemoteThreadRet;
        //end
    }
    TRACE("OK myCreateRemoteThread:ZwAllocateVirtualMemory 0x%08x\n",Stack);

    InitialTeb.AllocatedStackBase = (PVOID)Stack;
    InitialTeb.StackBase = (PVOID)(Stack + StackReserve);

    /* Update the Stack Position */
    Stack += StackReserve - StackCommit;

    Stack -= 0x1000;
    StackCommit += 0x1000;

    /* Allocate memory for the stack */
    ret = ZwAllocateVirtualMemory(hProcess,
        (PVOID*)&Stack,
        0,
        &StackCommit,
        MEM_COMMIT,
        PAGE_READWRITE);
    if (ret >= 0x80000000)
    {
        //失败
        TRACE("Error IN myCreateRemoteThread ZwAllocateVirtualMemory2!\n");
        goto myCreateRemoteThreadRet;
        //end
    }
    TRACE("OK myCreateRemoteThread:ZwAllocateVirtualMemory 2 0x%08x\n",Stack);
    InitialTeb.StackLimit = (PVOID)Stack;


    StackReserve = 0x1000; 
    ret = ZwProtectVirtualMemory(hProcess, (PVOID*)&Stack, &StackReserve, PAGE_READWRITE | PAGE_GUARD, &x); 
    if (ret >= 0x80000000)
    {
        //失败
        TRACE("Error IN myCreateRemoteThread ZwProtectVirtualMemory!\n");
        goto myCreateRemoteThreadRet;
        //end
    }
    /* Update the Stack Limit keeping in mind the Guard Page */
    InitialTeb.StackLimit = (PVOID)((ULONG_PTR)InitialTeb.StackLimit - 0x1000);
    //2、准备CONTEXT
    //  CONTEXT context = {CONTEXT_FULL}; 
    ret = ZwGetContextThread(GetCurrentThread(),&context); 
    if (ret >= 0x80000000)
    {
        //失败
        TRACE("Error IN myCreateRemoteThread ZwGetContextThread!\n");
        goto myCreateRemoteThreadRet;
        //end
    }
    context.Esp = (DWORD)InitialTeb.StackBase; 
    context.Eip = (DWORD)pBaseThreadThunk; //这里填写需要加载的地址，不过需要自己终结自己
    context.Ebx = (DWORD)lpParameter;
    //other init
    //must
    context.Eax = (DWORD)lpStartAddress;
    context.Ecx = (DWORD)GetProcAddress(GetModuleHandle("ntdll.dll"),"RtlExitUserThread");//0x778B0859;/*win7*///0x77AEEC01;/*vista*/ //ntdll.RtlExitUserThread
    context.Edx = 0x00000000; //nouse


    ret = ZwCreateThread(&hThread, THREAD_ALL_ACCESS, 0, hProcess, &cid, &context, &InitialTeb, TRUE); 
    if (ret >= 0x80000000)
    {
        //失败
        TRACE("Error %d\n",GetLastError());
        goto myCreateRemoteThreadRet;
        //end
    }
    if(lpThreadId)
    {
        *lpThreadId = (DWORD)cid.UniqueThread;
    }
    if (!(dwCreationFlags & CREATE_SUSPENDED))
    {
        ZwResumeThread(hThread, NULL);
    }
myCreateRemoteThreadRet:
    return hThread;
}
```

 最后通用的使用方法是：


```
// 启动远程线程
HANDLE hRemoteThread = NULL;
OSVERSIONINFO svex = {sizeof(OSVERSIONINFO)};
GetVersionEx(&svex);
if( svex.dwMajorVersion<=5 ){
    hRemoteThread = ::CreateRemoteThread(hProcess, NULL, 0, pfnStartRoutine, lpRemoteDllName, 0, NULL);
}else{
    hRemoteThread = myCreateRemoteThread(hProcess, NULL, 0, pfnStartRoutine, lpRemoteDllName, 0, NULL);
}
```
 

### 3.通过SetWindowsHookEx安装钩子，如WH_CALLWNDPROC，WH_KEYBOARD，WH_MOUSE，WH_GETMESSAGE钩子可以实现全局注入。
```
SetWindowsHookEx(WH_MOUSE,(HOOKPROC)MouseProc,AfxGetInstanceHandle(),dwThreadId);
```
 

### 4.AppInit_DLLs方式：

HKEY_LOCAL_MACHINE\Software\Microsoft\Windows NT\CurrentVersion\Windows\AppInit_DLLs注入到所有加载了user32.dll的进程。

win7下会被映射到：HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Windows，

并且需要设置LoadAppInit_DLLs为1时AppInit_DLLs才会被启用，默认为0。

例如在xp下创建一个.reg文件：
```
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Windows]
"AppInit_DLLs"="c:\\message.dll"
```
手动导入后是可以加载指定dll的，但是在win7下面就不行，通过该.reg文件操作的注册表子键路径并没有被重定向到

HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Windows，

但是通过写代码的方式是成功的：
```
void LoadLibByAppInit_DLLs(LPCTSTR pszDllName,BOOL bInstall)
{
    HKEY hKey = NULL;
    DWORD dwRet = 0;

    //win7下会被映射到：HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Windows
    if ( RegCreateKeyEx(HKEY_LOCAL_MACHINE, _T("SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Windows"), 0, 0, 0, KEY_ALL_ACCESS, 0, &hKey, 0)!=ERROR_SUCCESS ){
        return;
    }

    dwRet = RegSetValueEx(hKey,_T("LoadAppInit_DLLs"),0,REG_DWORD,(const BYTE *)&bInstall,sizeof(bInstall));
    if ( bInstall ){
        dwRet = RegSetValueEx(hKey,_T("AppInit_Dlls"),0,REG_SZ,(const BYTE *)pszDllName,lstrlen(pszDllName));
    }else{
        dwRet = RegSetValueEx(hKey,_T("AppInit_DLLs"),NULL,REG_SZ,NULL,0);
    }

    RegCloseKey(hKey);
}
```
在win7下还有一个值RequireSignedAppInit_DLLs，如果为1表示则只加载有签名的dll，默认为0表示不对dll进行验证。

参见：http://msdn.microsoft.com/en-us/library/dd744762(v=vs.85).aspx

 

### 5.ShellExecuteHooks方式：

local_machine\software\microsoft\windows\currentversion\Explorer\ShellExecuteHooks注入到explorer.exe进程。


### 6.输入法注入：http://code.google.com/p/windows-config/wiki/Win32IME


### 7.lsp，SPI过滤注入网络进程：http://www.vckbase.com/document/viewdoc/?id=643

 http://www.vckbase.com/document/viewdoc/?id=808

 

### 8.BHO。

 

### 9.输入表方式注入，原理就是为目标pe文件增加一个导入函数，这个导入的函数是在要注入的dll中。

这样当目标PE文件被加载时会由系统来完成它的导入库的装载工作，这样你的DLL就能被加载进去了。

可以使用类似DIYTools的PE工具来完成，代码我就不写了。

 

### 10.CreateProcess以挂起的方式创建目标进程，修改入口代码加载指定dll，恢复入口代码唤醒进程。

### 11.使用微软提供的detours库函数DetourCreateProcessWithDll创建进程并为进程加载指定dll，这个方法原理上就是上面的CreateProcess方法，

只不过更简单更稳定了，拿来主义嘛。

### 12.通过DXG方式注入使用DirectX的进程，暂无资料。

### 13.RegisterUserApiHook