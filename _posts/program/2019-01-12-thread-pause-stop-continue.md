---
layout:		post
category:	"program"
title:		"线程暂停停止继续方案的设计方案--类比场景设计方法"
tags:		[]
date:	2019-01-12
---
- Content
{:toc}

# 引子
我们通常会使用线程来完成扫描、检测、下载、文件处理等工作，有时就需要对这些工作线程进行暂停、停止、继续的处理，特别是需要交互的地方：
- 用户可以在界面上点击暂停按钮、停止按钮、继续按钮。
- 点击退出按钮退出App时，其他线程需要退出。
- 其他场景。


本来觉得也没什么可说的，但是最近遇到一件事：某个项目在退出时需要花费大约10s的时间，这个耗时主要是在等待未完成工作的线程结束。

我大概看了下代码，线程的退出设计的并不合理且不优雅，不能在很短的时间内退出，最终会被TerminateThread掉，而且被强制TerminateThread时可能会导致程序在别的地方出现崩溃。

因为这个原因，我打算说一说。

# 想法
既然涉及到暂停和继续，就要使用信号量（或事件）相关的知识，通过检查信号是否复位或置位（有的地方称激活状态）来完成。大部分人的做法也是如此，前面提到的老项目也是这么做的，但是并没有实现一个理想的状态，可能对信号的使用没有理清楚。


我后来有了一个想法：既然很难搞清楚如何通过信号的方式来控制线程的暂停继续停止，何不转换一种思路来考虑呢？慢慢思考，脑海中逐渐呈现了这样一幅场景：
> 茫茫的大海上，船只依靠着灯塔的指引航行，遇到危险时灯塔通知船只停止航行，前方有情况时灯塔通知船只暂停航行并等待进一步的通知，当危险情况解除后等待通知船只继续航行，如果危险没有解除通知船只停止航行。

这一切不正契合程式设计中的线程暂停停止继续吗？于是我尝试把这个理念搬到代码中去。

# 设计

按照上面的想法，我设计了这样一个灯塔类：
```cpp
#pragma once

/*
CLightHouse mLightHouse;

在需要【暂停】的地方调用：
mLightHouse.SignalMustPause();

在需要【停止】的地方调用：
mLightHouse.SignalMustStop();

在需要【继续】的地方调用：
mLightHouse.SignalMustContinueEveythingIsOk();

在需要【自定义通知】的地方调用：
mLightHouse.SignalCustomCommandFlag(XXX);

/////////////////////////////////////////
// 在循环线程中检测是否需要：暂停、停止、继续等
if (mLightHouse.IsDangerThere()) {
	if (mLightHouse.IsMustPause()) {		// 需要暂停吗？
		mLightHouse.PauseWaitForSignal();
		if (mLightHouse.IsMustStop()) {		// 在暂停的时候可能下发了停止命令
			break;
		}
	} else if (mLightHouse.IsMustStop()) {	// 需要停止吗？
		break;
	}

	LONG nCommandFlag = mLightHouse.GetCustomCommandFlag();
	if ( nCommandFlag==XXX ) {
		// do something
	}
}
/////////////////////////////////////////
*/

class CLightHouse {
	enum {
		eFlagMustContinueEveythingIsOk = 0,		// 万事OK
		eFlagMustPause = 1,						// 请暂停
		eFlagMustStop = 2,						// 请停止
		eFlagBusy = 3,							// 忙碌状态
	};
public:
	CLightHouse() {
		m_hEvent = CreateEvent(NULL, TRUE, TRUE, NULL);
	}
	~CLightHouse() {
		if (m_hEvent != NULL) {
			CloseHandle(m_hEvent);
			m_hEvent = NULL;
		}
	}

public:
	//////////////////////////////////////////////////////////////////////////
	// UI交互中调用以下接口
	void SignalMustPause() {
		LONG nValue = eFlagMustPause;
		InterlockedExchange(&mFlag, nValue);
		::ResetEvent(m_hEvent);
	}
	void SignalMustStop() {
		LONG nValue = eFlagMustStop;
		InterlockedExchange(&mFlag, nValue);
		::SetEvent(m_hEvent);	// 如果是在暂停设置的永久等待中，可以立即返回。
		::ResetEvent(m_hEvent);
	}
	void SignalMustContinueEveythingIsOk() {
		LONG nValue = eFlagMustContinueEveythingIsOk;
		InterlockedExchange(&mFlag, nValue);
		::SetEvent(m_hEvent);
	}

	void SignalBusy() {
		LONG nValue = eFlagBusy;
		InterlockedExchange(&mFlag, nValue);
		::SetEvent(m_hEvent);
	}

	// 通知其他自定义命令
	void SignalCustomCommandFlag(LONG CommandFlag) {
		InterlockedExchange(&mFlag, CommandFlag);
		::ResetEvent(m_hEvent);
	}

public:
	//////////////////////////////////////////////////////////////////////////
	// 循环线程调用以下接口
	bool IsDangerThere() {
		// 灯塔灭了意味着危险
		const DWORD dwLightHouseIsOn = WAIT_OBJECT_0;
		return (::WaitForSingleObject(m_hEvent, 0) != dwLightHouseIsOn);
	}

	bool IsMustPause() {
		LONG nValue = InterlockedExchangeAdd(&mFlag, 0);
		return (nValue == eFlagMustPause);
	}

	// 一直等待，知道新的信号通知
	void PauseWaitForSignal() {
		::WaitForSingleObject(m_hEvent, INFINITE);
	}

	bool IsMustStop() {
		LONG nValue = InterlockedExchangeAdd(&mFlag, 0);
		return (nValue == eFlagMustStop);
	}

	bool IsMustContinue() {
		LONG nValue = InterlockedExchangeAdd(&mFlag, 0);
		return (nValue == eFlagMustContinueEveythingIsOk);
	}

	bool IsBusy() {
		LONG nValue = InterlockedExchangeAdd(&mFlag, 0);
		return (nValue == eFlagBusy);
	}

	LONG GetCustomCommandFlag() {
		return InterlockedExchangeAdd(&mFlag, 0);
	}

private:
	HANDLE m_hEvent = NULL;
	LONG mFlag = eFlagMustContinueEveythingIsOk;
};
```

- 在UI交互中（例如用户点击退出按钮，或点击了暂定按钮、停止按钮等），可以调用**SignalMustStop**或**SignalMustPause**
- 在需要继续地方调用**SignalMustContinueEveythingIsOk**
- 如果需要在线程工作中需要通知做一下特殊工作，可以调用下**SignalCustomCommandFlag**（类比一下航海中可能会通知其他信号或命令信息）。


在线程中需要做什么呢？可以调用下如下代码：
```cpp
// 在循环线程中检测是否需要：暂停、停止、继续等
if (mLightHouse.IsDangerThere()) {
	if (mLightHouse.IsMustPause()) {		// 需要暂停吗？
		mLightHouse.PauseWaitForSignal();
		if (mLightHouse.IsMustStop()) {		// 在暂停的时候可能下发了停止命令
			break;
		}
	} else if (mLightHouse.IsMustStop()) {	// 需要停止吗？
		break;
	}

	LONG nCommandFlag = mLightHouse.GetCustomCommandFlag();
	if ( nCommandFlag==XXX ) {
		// do something
	}
}
```

做到这样，在一个需要循环的线程中可以很快的响应：暂停、继续、停止。


# 延伸
有一个场景，上面的方法是无法实现快速响应线程退出的，那就是：在线程中需要做一个比较耗时的处理，当用户点击停止按钮时可能线程已经进入耗时函数工作了，需要处理完才能做**mLightHouse.IsDangerThere()**的判断，所以仍然不能快速退出，怎么办呢？

只需稍加改进一下：
- 再额外开辟一个线程专门用来干活，叫做：干活线程
- 原来的线程制作调度管理用，叫做：调度线程
- 调度线程需要同时等待多个对象：用于通知线程退出的信号、干活线程对象。
- 当有通知暂停时，原来的mLightHouse.PauseWaitForSignal()除了陷入无限等待外，需要挂起下干活线程。
- 当有通知停止时，如果干活线程没有结束可以直接**TerminateThread**掉。
- 当有通知继续时，无限的等待返回，唤醒干活线程即可。

# 总结
如果陷入代码的复杂逻辑无法好好设计编码时，不妨跳出代码的思维世界，类比一个场景来去思考，可以把复杂度下降许多，等把思绪理清楚了，再把该设计搬到代码世界中即可。


