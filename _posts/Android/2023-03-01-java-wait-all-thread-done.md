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

**方案**：使用`ThreadPoolExecutor`的`getActiveCount`来判断是否还有活动线程，如果没有则认为子线程全部结束了。

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

