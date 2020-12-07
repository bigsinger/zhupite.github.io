---
layout:		post
category:	"program"
title:		"把Windows API的锁改用标准库的锁后暴露了一个隐藏问题"
tags:		[c++, mutex, lock_guard]
---
- Content
{:toc}
把Windows API的锁改用标准库的锁后暴露了一个隐藏问题



# 背景

某Windows项目在最初的时候，有小伙伴不太会用锁的，因此封装了一个简单的类，让需要使用锁的类派生这个**CLocker**类：

```c++
class CLocker {
public:
	CLocker() {
		InitializeCriticalSection(&m_csLocker);
	}
	~CLocker() {
		DeleteCriticalSection(&m_csLocker);
	}

protected:
	void Lock() {
		EnterCriticalSection(&m_csLocker);

	}
	void UnLock() {
		LeaveCriticalSection(&m_csLocker);
	}

private:
	CRITICAL_SECTION m_csLocker;
};

class CStringLocker : public CLocker {
public:
	void setString(LPCTSTR lpszStr) {
		this->Lock();
		if (lpszStr!=NULL) {
			this->mContent = lpszStr;
		} else {
			this->mContent.clear();
		}
		this->UnLock();
	}
	tstring getString() {
		tstring sRet;
		this->Lock();
		sRet = this->mContent;
		this->UnLock();
		return sRet;
	}
private:
	tstring mContent;
};
```



然后大致修改了这个类的成员函数，使得锁可以成对出现：

```c++
void CXXXManager::setXXXData(...) {
	this->Lock();
	...
	// 后续代码加这里
	this->UnLock();
}
```



# 问题

后来小伙伴走了换了另外一个同事来接手这个项目，出现了一处误用，后期追加的代码变成了这样：

```c++
void CXXXManager::setXXXData(...) {
	this->Lock();
	...
	
	this->setConfigA(...);

	...
	this->setConfigB(...);
    
	this->UnLock();
}
```

**setConfigA** 和 **setConfigB** 在内部又分别使用了锁，代码结构是这样的：

```c++
void CXXXManager::setConfigA(...) {
	this->Lock();
	...
	this->UnLock();
}
```

这样锁的使用就不对了，变成了嵌套。但是这个隐患由于自测和QA测试也都没有出过问题，也就没有被发现。



因为笔者早期写过Windows的开发代码，使用的多是Windows纯API，后来逐渐接触了C++新标准，觉得新标准的使用形式更好一些，还可以为跨平台积累经验，于是逐渐想抛弃纯API开发那一套思路，慢慢用C++新特性来替代。



于是，笔者就把**CLocker**类修改成了下面这样：

```c++
class CLocker {
protected:
	void Lock() {
		this->locker.lock();
	}
	void UnLock() {
		this->locker.unlock();
	}

private:
	std::mutex locker;
};
```



然后问题就暴露了，调试运行下执行到**CXXXManager::setXXXData**里面就会产生崩溃。





# 解决

这个问题产生不是因为**CLocker**类改错了，是把隐藏的问题暴露出来了，当把**CLocker**类回退到之前的形式时，调试运行代码并不会产生崩溃，也不会产生死锁。但是一旦改用新形式，运行代码就会崩溃在**this->setConfigA**里。



这其实是标准库做了严格的检查，它发现了有人误用的情况，因此在调试阶段就把问题抛出来了，让开发人员去解决。当然解决办法不是把**CLocker**类回退到之前的形式（主要还是推荐标准库的用法），而是解决锁错用的问题，修改代码如下：

```c++
void CXXXManager::setXXXData(...) {
	this->Lock();
	...
	this->UnLock();  // 在这里释放下锁
    
	
	this->setConfigA(...);

	...
	this->setConfigB(...);
}
```

然后再运行代码，崩溃不再发生，这算是临时解决了问题。



其实更优雅的做法，是使用**lock_guard**：

```c++
lock_guard<std::mutex> lock(locker);
```



**lock_guard**的方法实际上是利用了对象的析构函数进行锁的释放操作，一方面规避了锁的嵌套使用，另一方面也解决了因为函数出口太多容易忘记释放锁的问题。

```c++
// CLASS TEMPLATE lock_guard
template <class _Mutex>
class lock_guard { // class with destructor that unlocks a mutex
public:
    using mutex_type = _Mutex;

    explicit lock_guard(_Mutex& _Mtx) : _MyMutex(_Mtx) { // construct and lock
        _MyMutex.lock();
    }

    lock_guard(_Mutex& _Mtx, adopt_lock_t) : _MyMutex(_Mtx) {} // construct but don't lock

    ~lock_guard() noexcept {
        _MyMutex.unlock();
    }

    lock_guard(const lock_guard&) = delete;
    lock_guard& operator=(const lock_guard&) = delete;

private:
    _Mutex& _MyMutex;
};
```





# 总结

- 标准库的锁（mutex）在设计上确实要优一些，在debug模式下，如果有误用的情况会抛出异常，让开发人员排查；而Windows API的形式不会抛异常，容易带着隐藏问题上线。
- 标准库这种检查模式很好，及时把问题暴露在开发阶段的思想也非常好，值得开发人员学习。
- 锁的使用尽量用**lock_guard**
- 尽量还是多用标准库