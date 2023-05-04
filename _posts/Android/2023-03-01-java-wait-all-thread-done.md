---
layout:		post
category:	"android"
title:		"Java优雅等待所有线程池的线程执行完毕"

tags:		[android]
---
- Content
{:toc}
**关键词**：Java,线程,线程池,ExecutorService,ThreadPoolExecutor



**目标**：等待线程池里的子线程正常执行完毕。



**方案1（推荐）**：使用`AtomicInteger`类型的计数器，在子线程创建的时候加一，在执行结束的时候减一，主线程等待计数器为零即可。该方案也是ChatGPT给的，实际能满足效果，推荐使用。

首先声明一个`AtomicInteger`类型的计数器变量：

```java
protected AtomicInteger taskCount = new AtomicInteger(0);  // 线程计数
```

在创建子线程的时候，构造函数为计数器加一，在执行任务的函数体加上`finally`并为计数器减一，这样无论是发生了异常还是正常结束计数器都能正确减一。

```java
private class DirectoryRunner implements Runnable {
    private File dir;

    public DirectoryRunner(File dir) {
        taskCount.incrementAndGet();		// 计数器加一
        this.dir = dir;
    }
    
    public void run() {
        try {
            //...
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            taskCount.decrementAndGet();	// 计数器减一
        }
    }
}
```

主线程中等待所有子线程正常结束：

```java
// 等待所有动态创建的子线程结束
try {
    while (taskCount.get() > 0 && isFinding) {
        Thread.sleep(1000); // 等待所有任务完成
    }
    isFinding = false;
} catch (InterruptedException e) {
    //e.printStackTrace();
}

// 通知UI扫描结束
if (fileFindListener != null) {
    ThreadUtil.runOnUi(new Runnable() {
        @Override
        public void run() {
            fileFindListener.onFindComplete(foundFiles);
        }
    });
}
```



**方案2**：使用`ThreadPoolExecutor`的`getActiveCount`来判断是否还有活动线程，如果没有则认为子线程全部结束了。

```java
ExecutorService executor = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors() + 2);

if (!executor.isShutdown()) {
    executor.execute(new XXXXXRunner(arg));
}


try {
    ThreadPoolExecutor pool = (ThreadPoolExecutor) this.executor;
    int activeThreadCnt = 0;
    do {
        this.executor.awaitTermination(1, TimeUnit.SECONDS);
        activeThreadCnt = pool.getActiveCount();
    } while (activeThreadCnt > 0);
} catch (InterruptedException e) {
    e.printStackTrace();
}
```

经实际测试该方案效果不理想，仍然达不到预期，请使用推荐方案。
