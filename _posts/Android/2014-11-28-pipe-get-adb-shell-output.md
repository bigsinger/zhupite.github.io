---
layout:		post
category:	"android"
title:		"C++通过匿名管道操作adb shell的输入输出"
tags:		[android,adb]
---



封装了一个类CAdbshell，用于方便地来操作adb shell命令，使用方法：

```cpp
CAdbshell shell;
shell.Start();
shell.RunCmd("su\ncd /data/data\n");
shell.RunCmd("cd " + strPackageName + "\nls");
shell.Stop();
```


头文件：

```cpp
/*
通过管道操作adb shell	--by sing
*/
 
#pragma once
#include <WinDef.h>
#include <atlstr.h>
 
class CAdbshell
{
public:
	CAdbshell(void);
	~CAdbshell(void);
public:
	//启动adb shell，如果成功则进入#状态，可以使用RunCmd执行命令
	BOOL Start();
 
	//这里输入的是在adb shell状态下的批处理命令，如果有多条请以\n分隔
	BOOL RunCmd(const CString&strCmdline);
 
	//退出shell命令状态，关闭进程
	BOOL Stop();
 
	//读取输出结果,调用前请务必调用Stop先结束
	CString GetOutput();
 
public:
	BOOL Loop();
 
private:
	HANDLE	hThread;
	CString m_strOutput;
	//HANDLE	m_hProcess;
 
	//指示线程准备好，可以进行命令输入的信号量
	HANDLE	m_hEvent;
 
	HANDLE	m_hReadPipe;
	HANDLE	m_hReadPipe2;
	HANDLE	m_hWritePipe;
	HANDLE	m_hWritePipe2;
};
```


源文件：

```cpp
#include "StdAfx.h"
#include "Adbshell.h"
 
 
 
DWORD __stdcall ThreadAdbshellProc(void *pVoid)
{
	if ( pVoid!=NULL) {
		CAdbshell *pShell = (CAdbshell *)pVoid;
		pShell->Loop();
	}
	return 0;
}
 
 
CAdbshell::CAdbshell(void)
{
	m_hEvent = NULL;
	//m_hProcess = NULL;
}
 
CAdbshell::~CAdbshell(void)
{
}
 
//启动adb shell，如果成功则进入#状态，可以使用RunCmd执行命令
BOOL CAdbshell::Start()
{
	m_strOutput.Empty();
	SECURITY_ATTRIBUTES sat;
	STARTUPINFO startupinfo;
	PROCESS_INFORMATION pinfo;
 
	sat.nLength = sizeof(SECURITY_ATTRIBUTES);
	sat.bInheritHandle = TRUE;
	sat.lpSecurityDescriptor = NULL;
	if( CreatePipe(&m_hReadPipe, &m_hWritePipe, &sat, NULL)==FALSE ) {
		return FALSE;
	}
	if( CreatePipe(&m_hReadPipe2,&m_hWritePipe2,&sat,NULL)==FALSE ) {
		return FALSE;
	}
	startupinfo.cb=sizeof(STARTUPINFO);
	GetStartupInfo(&startupinfo);
	startupinfo.hStdError=m_hWritePipe;
	startupinfo.hStdOutput=m_hWritePipe;
	startupinfo.hStdInput=m_hReadPipe2;
	startupinfo.dwFlags=STARTF_USESHOWWINDOW | STARTF_USESTDHANDLES;
	startupinfo.wShowWindow=SW_HIDE;
	if( CreateProcess(NULL, "adb.exe shell", NULL, NULL, TRUE, 0, NULL, NULL, &startupinfo, &pinfo)==FALSE ) {
		//DWORD dwError = GetLastError();
		return FALSE;
	}
	CloseHandle(m_hWritePipe);
	CloseHandle(m_hReadPipe2);
	CloseHandle(pinfo.hThread);
	CloseHandle(pinfo.hProcess);
	//m_hProcess = pinfo.hProcess;
 
	DWORD dwThread = FALSE;
	hThread = CreateThread(NULL, 0, ThreadAdbshellProc, this, 0, &dwThread);//这个参数你根据你的需要决定要不要
	if ( hThread==NULL ) {
		return FALSE;
	}
 
	m_hEvent = CreateEvent(NULL, FALSE, FALSE, NULL);
 
	return TRUE;
}
 
//这里输入的是在adb shell状态下的批处理命令，如果有多条请以\n分隔
BOOL CAdbshell::RunCmd(const CString&strCmdline)
{
	BOOL bSuccess = TRUE;
	CString strOneCmd;
	int nPos1 = 0;
	int nPos2 = 0;
	DWORD dwWrite = 0;
 
	if ( strCmdline.GetLength() < 2 ) {
		return FALSE;
	}
	//先等待线程函数准备好
	WaitForSingleObject(m_hEvent, INFINITE);
 
	while ( TRUE ){
		nPos1 = nPos2;
		nPos2 = strCmdline.Find('\n', nPos1);
		if ( nPos2==-1 ) {
			nPos2 = strCmdline.GetLength();
		}
		strOneCmd = strCmdline.Mid(nPos1, nPos2 - nPos1).Trim();
		
		//命令长度至少为2
		if ( strOneCmd.GetLength() >= 2 ) {
			strOneCmd += "\r\n";
			//执行
			bSuccess = WriteFile(m_hWritePipe2, strOneCmd, strOneCmd.GetLength(), &dwWrite, NULL); 
		}
 
		++nPos2;
		if ( nPos2 >= strCmdline.GetLength() ) {
			break;
		}
	}
 
	return bSuccess;
}
 
//退出shell命令状态，关闭进程。不能通过TerminateProcess方式结束，否则会有读取不全的情况
BOOL CAdbshell::Stop()
{
	RunCmd("exit\nexit");
	WaitForSingleObject(hThread, INFINITE);
	return TRUE;
	//if ( m_hProcess!=NULL ) {
	//	TerminateProcess(m_hProcess, -1);
	//	CloseHandle(m_hProcess);
	//	m_hProcess = NULL;
	//}
 
	//return TRUE;
}
 
//读取输出结果,调用前请务必调用Stop先结束
CString CAdbshell::GetOutput()
{
	WaitForSingleObject(hThread, INFINITE);
 
	//两个exit要去掉
	int nPos1 = 0;
	//int nPos2 = 0;
	
	nPos1 = m_strOutput.Find("# exit");
	if ( nPos1==-1 ) {
		nPos1 = m_strOutput.Find("$ exit");
	}
	if ( nPos1!=-1 ) {
		m_strOutput = m_strOutput.Left(nPos1);
		nPos1 = m_strOutput.ReverseFind('\n');
		m_strOutput = m_strOutput.Left(nPos1);
	}
 
	return m_strOutput;
}
 
BOOL CAdbshell::Loop()
{
	CHAR buffer[1024] = {0};
	DWORD dwRead = 0;
 
	while( TRUE ) {
		RtlZeroMemory(buffer, _countof(buffer));
		SetEvent(m_hEvent);
		if( ReadFile(m_hReadPipe, buffer, _countof(buffer), &dwRead, NULL)==FALSE ) {
			break;
		}else {
			m_strOutput += buffer;
			if ( StrStrA(buffer, "# exit")!=NULL ) {
				break;
			}
		}
	}
	CloseHandle(m_hReadPipe);
	CloseHandle(m_hWritePipe2);
 
	CloseHandle(m_hEvent);
	m_hEvent = NULL;
	CloseHandle(hThread);
	hThread = NULL;
 
	return TRUE;
}
```