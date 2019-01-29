---
layout:		post
category:	"program"
title:		"派生CException的自定义异常处理类"
tags:		[c++]
---
- Content
{:toc}

```cpp
#pragma once

class CStarException :public CException {
	/******************************************/
	class CNothingException :public CException {
	public:
		CNothingException() {}
		~CNothingException() {}
	};
	/******************************************/

public:
	CStarException();
	CStarException(LPVOID lpSafeAddr);
	~CStarException();
private:
	static LPTOP_LEVEL_EXCEPTION_FILTER m_lpTopLevelExceptionFilter;
	static LPVOID m_lpSafeAddr;
	static LONG WINAPI StarExceptionHandler(_EXCEPTION_POINTERS*m_pExcPointers);
};



#include "stdafx.h"
#include "CStarException.h"

#ifdef _DUMP
#include <Dbghelp.h>
#pragma comment(lib,"Dbghelp.lib")
#endif

LPTOP_LEVEL_EXCEPTION_FILTER CStarException::m_lpTopLevelExceptionFilter = SetUnhandledExceptionFilter(CStarException::StarExceptionHandler);
LPVOID CStarException::m_lpSafeAddr = 0;

CStarException::CStarException() {
}

CStarException::CStarException(LPVOID lpSafeAddr) {
	m_lpSafeAddr = lpSafeAddr;
}

CStarException::~CStarException() {
}

LONG CStarException::StarExceptionHandler(_EXCEPTION_POINTERS*m_pExcPointers) {
	MessageBox(NULL, "ExceptionHandler", 0, 0);
	/************************************************************************/
#ifdef _DUMP
	HANDLE hFile = CreateFile("ExceptionTest.dmp", GENERIC_WRITE | GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
	MINIDUMP_EXCEPTION_INFORMATION MiniDump;
	MiniDump.ClientPointers = TRUE;
	MiniDump.ExceptionPointers = m_pExcPointers;
	MiniDump.ThreadId = GetCurrentThreadId();

	MiniDumpWriteDump(GetCurrentProcess(), GetCurrentProcessId(), hFile, MiniDumpNormal, &MiniDump, NULL, NULL);
	CloseHandle(hFile);
#endif
	/************************************************************************/
	CNothingException e;
	throw &e;
	//throw后面的代码不会执行了.
	//MessageBox(NULL,"ExceptionHandler2",0,0);
	return EXCEPTION_EXECUTE_HANDLER;
}


// ExceptionTest.cpp : 定义控制台应用程序的入口点。
//

#include "stdafx.h"
#include "CStarException.h"
#include <vector>
using namespace std;

vector<DWORD> vt;

void DivByZero() {
	try {
		CString str;
		int n = 100, m = 100;

		n = 1 / (m - n);
		str.Format("never come to here:%d", n);
		MessageBox(NULL, str, 0, 0);
	} catch (...) {
		MessageBox(NULL, " 除零异常catched", 0, 0);
	}
}

void OutRangeOfVector() {
	try {
		vt.push_back(1);
		for (vector<DWORD>::iterator i = vt.begin(); i != vt.end(); i++) {
			vt.at(3);//内部会抛出异常_THROW(out_of_range, "invalid istream_iterator");
			DWORD dwTemp = *i;
		}
		for (int i = 0; i < vt.size(); i++) {
			DWORD it = vt.at(i);
		}
	} catch (out_of_range &e)//catch(exception &e)
	{
		MessageBox(NULL, "out_of_range异常catched", 0, 0);
	}
}

void MemOperate() {
	try {
		//release版本能捕获
		int nSize = -1;
		BYTE*p = new BYTE[nSize];
	} catch (...) {
		MessageBox(NULL, "开辟内存异常 catched", 0, 0);
	}
}

void VectorTest() {
	try {
		vector<DWORD> vt;
		vt.push_back(1);
		for (vector<DWORD>::iterator i = vt.begin(); i != vt.end(); i++) {
			i += 2;    //崩溃,且异常捕获不了
			DWORD dwTemp = *i;
		}
	} catch (...) {
		MessageBox(NULL, "vector exception catched", 0, 0);
	}
}

void TestInt3() {
	try {
		__asm int 3
	} catch (...) {
		MessageBox(NULL, "int 3 catched", 0, 0);
	}
}

int _tmain(int argc, _TCHAR* argv[]) {
	DivByZero();
	OutRangeOfVector();
	MemOperate();
	//VectorTest();
	TestInt3();

	MessageBox(NULL, "go on...", 0, 0);
	return 0;
}

```