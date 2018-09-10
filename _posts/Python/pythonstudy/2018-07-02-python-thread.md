---
layout:		post
category:	"python"
title:		"Python线程"
tags:		[python]
---
- Content
{:toc}

推荐使用更高级别的 threading 模块，而不使用 thread 模块。 threading 模块更加先进，有更好的线程支持，并且 thread 模块中的一些属性会和 threading 模块有冲突。

另一个原因是低级别的 thread 模块拥有的同步原语很少（实际上只有一个），而 threading模块则有很多。

避免使用 thread 模块的另一个原因是它对于进程何时退出没有控制。当主线程结束时，所有其他线程也都强制结束，不会发出警告或者进行适当的清理。如前所述，至少threading 模块能确保重要的子线程在进程退出前结束

threading 模块提供了更高级别、功能更全面的线程管理。使用 Queue 模块，用户可以创建一个队列数据结构，用于在多线程之间进行共享。

# threading 模块的对象
- **Thread** 表示一个执行线程的对象
- **Lock** 锁原语对象（和 thread 模块中的锁一样）
- **RLock** 可重入锁对象，使单一线程可以（再次）获得已持有的锁（递归锁）
- **Condition** 条件变量对象，使得一个线程等待另一个线程满足特定的“条件”，比如改变状态或某个数据值
- **Event** 条件变量的通用版本，任意数量的线程等待某个事件的发生，在该事件发生后所有线程将被激活
- **Semaphore** 为线程间共享的有限资源提供了一个“计数器”，如果没有可用资源时会被阻塞
- **BoundedSemaphore** 与 Semaphore 相似，不过它不允许超过初始值
- **Timer** 与Thread相似，不过它要在运行前等待一段时间
- **Barrier**① 创建一个“障碍”，必须达到指定数量的线程后才可以继续

# 启动线程
```python
# Code to execute in an independent thread
import time
def countdown(n):
    while n > 0:
        print('T-minus', n)
        n -= 1
        time.sleep(1)

# Create and launch a thread
from threading import Thread
t = Thread(target=countdown, args=(10,))
t.start()
```

# 多线程
通常来说，多线程是一个好东西。不过，由于 Python 的 GIL 的限制，多线程更适合于 I/O 密集型应用（I/O 释放了 GIL，可以允许更多的并发），而不是计算密集型应用。对于后一种情况而言，为了实现更好的并行性，你需要使用多进程，以便让 CPU 的其他内核来执行。

## subprocess
这是派生进程的主要替代方案，可以单纯地执行任务，或者通过标准文件（stdin、 stdout、stderr）进行进程间通信。该模块自 Python 2.4 版本起引入。

## multiprocessing
该模块自 Python 2.6 版本起引入，允许为多核或多 CPU 派生进程，其接口与 threading模块非常相似。该模块同样也包括在共享任务的进程间传输数据的多种方式。

## concurrent.futures 
这是一个新的高级库，它只在“任务”级别进行操作，也就是说，你不再需要过分关注同步和线程/进程的管理了。你只需要指定一个给定了“worker”数量的线程/进程池，提交任务，然后整理结果。该模块自 Python 3.2 版本起引入。


# 线程池
```python
from concurrent.futures import ThreadPoolExecutor
import urllib.request

def fetch_url(url):
    u = urllib.request.urlopen(url)
    data = u.read()
    return data

pool = ThreadPoolExecutor(10)
# Submit work to the pool
a = pool.submit(fetch_url, 'http://www.python.org')
b = pool.submit(fetch_url, 'http://www.pypy.org')

# Get the results back
x = a.result()
y = b.result()
```

# 循环停止变量
```python
class CountdownTask:
    def __init__(self):
        self._running = True

    def terminate(self):
        self._running = False

    def run(self, n):
        while self._running and n > 0:
            print('T-minus', n)
            n -= 1
            time.sleep(1)
        print('running is False')

c = CountdownTask()
t = threading.Thread(target=c.run, args=(10,))
t.start()
c.terminate()   # Signal termination
t.join()        # Wait for actual termination (if needed)
```

# 超时轮询
```python
class IOTask:
    def terminate(self):
        self._running = False

    def run(self, sock):
        # sock is a socket
        sock.settimeout(5)        # Set timeout period
        while self._running:
            # Perform a blocking I/O operation w/ timeout
            try:
                data = sock.recv(8192)
                break
            except socket.timeout:
                continue
            # Continued processing
            ...
        # Terminated
        return
```

# Thread派生类
threading 模块的 Thread 类是主要的执行对象。
- name 线程名
- ident 线程的标识符
- daemon 布尔标志，表示这个线程是否是守护线程


- \_init\_(group=None, tatget=None, name=None, args=(),
kwargs ={}, verbose=None, daemon=None) 实例化一个线程对象，需要有一个可调用的 target，以及其参数 args
或 kwargs。还可以传递 name 或 group 参数，不过后者还未实现。此
外 ， verbose 标 志 也 是 可 接 受 的。 而 daemon 的 值 将 会 设定
thread.daemon 属性/标志
- start() 开始执行该线程
- run() 定义线程功能的方法（通常在子类中被应用开发者重写）
- join (timeout=None) 直至启动的线程终止之前一直挂起；除非给出了 timeout（秒），否则
会一直阻塞


```python
from threading import Thread

class CountdownThread(Thread):
    def __init__(self, n):
        super().__init__()
        self.n = n

    def run(self):
        while self.n > 0:
            print('T-minus', self.n)
            self.n -= 1
            time.sleep(5)


c = CountdownThread(5)
c.start()
```

# Event
```python
from threading import Thread, Event
import time

# Code to execute in an independent thread
def countdown(n, started_evt):
    print('countdown starting')
    started_evt.set()
    while n > 0:
        print('T-minus', n)
        n -= 1
        time.sleep(5)

# Create the event object that will be used to signal startup
started_evt = Event()

# Launch the thread and pass the startup event
print('Launching countdown')
t = Thread(target=countdown, args=(10,started_evt))
t.start()

# Wait for the thread to start
started_evt.wait()
print('countdown is running')
```

# Condition
如果一个线程需要不停地重复使用 event 对象，你最好使用 **Condition** 对象来代替。下面的代码使用 Condition 对象实现了一个周期定时器，**每当定时器超时的时候，其他线程都可以监测到**：
```python
import threading
import time


class PeriodicTimer:
    def __init__(self, interval):
        self._interval = interval
        self._flag = 0
        self._cv = threading.Condition()

    def start(self):
        t = threading.Thread(target=self.run)
        t.daemon = True

        t.start()

    def run(self):
        '''
        Run the timer and notify waiting threads after each interval
        '''
        while True:
            time.sleep(self._interval)
            with self._cv:
                self._flag ^= 1
                self._cv.notify_all()

    def wait_for_tick(self):
        '''
        Wait for the next tick of the timer
        '''
        with self._cv:
            last_flag = self._flag
            while last_flag == self._flag:
                self._cv.wait()


# Example use of the timer
ptimer = PeriodicTimer(2)
ptimer.start()


# Two threads that synchronize on the timer
def countdown(nticks):
    while nticks > 0:
        ptimer.wait_for_tick()
        print('T-minus', nticks)
        nticks -= 1


def countup(last):
    n = 0
    while n < last:
        ptimer.wait_for_tick()
        print('Counting', n)
        n += 1


threading.Thread(target=countdown, args=(10,)).start()
threading.Thread(target=countup, args=(5,)).start()
```

# Semaphore
```python
# Worker thread
def worker(n, sema):
    # Wait to be signaled
    sema.acquire()

    # Do some work
    print('Working', n)


# Create some threads
sema = threading.Semaphore(0)
nworkers = 10
for n in range(nworkers):
    t = threading.Thread(target=worker, args=(n, sema,))
    t.start()
sema.release()
```

# 线程间通信
从一个线程向另一个线程发送数据最安全的方式可能就是使用 queue 库中的队列了。创建一个被多个线程共享的 Queue 对象，这些线程通过使用 put() 和 get() 操作来向队列中添加或者删除元素。Queue 对象已经包含了必要的锁，所以你可以通过它在多个线程间多安全地共享数据。 例如：
```python
from queue import Queue
from threading import Thread


# A thread that produces data
def producer(out_q):
    while True:
        # Produce some data
        data = {'key':'value'}
        out_q.put(data)


# A thread that consumes data
def consumer(in_q):
    while True:
        # Get some data
        data = in_q.get()
        print(data)
        # Process the data
        ...


# Create the shared queue and launch both threads
q = Queue()
t1 = Thread(target=consumer, args=(q,))
t2 = Thread(target=producer, args=(q,))
t1.start()
t2.start()
```

# 通知消费者结束
在队列中放置一个特殊的值，当消费者读到这个值的时候，终止执行。**消费者在读到这个特殊值之后立即又把它放回到队列中，将之传递下去。这样，所有监听这个队列的消费者线程就可以全部关闭了**。
```python
from queue import Queue
from threading import Thread

# Object that signals shutdown
_sentinel = object()


# A thread that produces data
def producer(out_q):
    while running:
        # Produce some data
        ...
        out_q.put(data)

    # Put the sentinel on the queue to indicate completion
    out_q.put(_sentinel)


# A thread that consumes data
def consumer(in_q):
    while True:
        # Get some data
        data = in_q.get()

        # Check for termination
        if data is _sentinel:
            in_q.put(_sentinel)
            break

        # Process the data
        ...
```

# task_done() 和 join()
- Queue.task_done() 在完成一项工作之后，Queue.task_done()函数向任务已经完成的队列发送一个信号。
- Queue.join() 实际上意味着等到队列为空，再执行别的操作

如果线程里每从队列里取一次，但没有执行task_done()，则join无法判断队列到底有没有结束，在最后执行个join()是等不到结果的，会一直挂起。

可以理解为，每task_done一次就从队列里删掉一个元素，这样在最后join的时候根据队列长度是否为零来判断队列是否结束，从而执行主线程。

```python
from queue import Queue
from threading import Thread


# A thread that produces data
def producer(out_q):
    n = 3
    while n > 0:
        # Produce some data
        out_q.put(['data'])
        n -= 1


# A thread that consumes data
def consumer(in_q):
    while True:
        # Get some data
        data = in_q.get()

        # Process the data
        print(data)
        # Indicate completion
        in_q.task_done()
    print('over')   # never called


# Create the shared queue and launch both threads
q = Queue()
t1 = Thread(target=consumer, args=(q,))
t2 = Thread(target=producer, args=(q,))
t1.start()
t2.start()

# Wait for all produced items to be consumed
q.join()
print('all produced items to be consumed')
```

# 防止生产者生产过快造成资源耗尽

在创建 Queue 对象时提供可选的 size 参数来限制可以添加到队列中的元素数量。对于“生产者”与“消费者”**速度有差异**的情况，为队列中的元素数量添加上限是有意义的。比如，**一个“生产者”产生项目的速度比“消费者”“消费”的速度快**，那么使用固定大小的队列就可以在队列已满的时候阻塞队列，以免未预期的连锁效应扩散整个程序造成死锁或者程序运行失常。在通信的线程之间进行“**流量控制**”是一个看起来容易实现起来困难的问题。

一个非阻塞的 put() 方法和一个固定大小的队列一起使用，这样当队列已满时就可以执行不同的代码。比如输出一条日志信息并丢弃。
```python
def producer(q):
    ...
    try:
        q.put(item, block=False)
    except queue.Full:
        log.warning('queued item %r discarded!', item)  
```

如果你试图让消费者线程在执行像 q.get() 这样的操作时，超时自动终止以便检查终止标志，你应该使用 q.get() 的可选参数 timeout ，如下：
```python
_running = True

def consumer(q):
    while _running:
        try:
            item = q.get(timeout=5.0)
            # Process item
            ...
        except queue.Empty:
            pass
```

# 加锁Lock
Lock 对象和 with 语句块一起使用可以保证互斥执行，就是每次只有一个线程可以执行 with 语句包含的代码块。with 语句会在这个代码块执行前自动获取锁，在执行结束后自动释放锁。
```python
import threading


class SharedCounter:
    '''
    A counter object that can be shared by multiple threads.
    '''

    def __init__(self, initial_value=0):
        self._value = initial_value
        self._value_lock = threading.Lock()

    def incr(self, delta=1):
        '''
        Increment the counter with locking
        '''
        with self._value_lock:
            self._value += delta

    def decr(self, delta=1):
        '''
        Decrement the counter with locking
        '''
        with self._value_lock:
            self._value -= delta
```

with语句等价于以下操作：
```python
self._value_lock.acquire()
self._value += delta
self._value_lock.release()
```
相比于这种显式调用的方法，with 语句更加优雅，也更不容易出错，特别是程序员可能会忘记调用 release() 方法或者程序在获得锁之后产生异常这两种情况（使用 with 语句可以保证在这两种情况下仍能正确释放锁）。

# 限定并发量
```python
from threading import Semaphore
import urllib.request

# At most, five threads allowed to run at once
_fetch_url_sema = Semaphore(5)


def fetch_url(url):
    with _fetch_url_sema:
        return urllib.request.urlopen(url)
```

## 本地线程存储
```python
from socket import socket, AF_INET, SOCK_STREAM
import threading


class LazyConnection:
    def __init__(self, address, family=AF_INET, type=SOCK_STREAM):
        print('LazyConnection init')
        self.address = address
        self.family = AF_INET
        self.type = SOCK_STREAM
        self.local = threading.local()

    def __enter__(self):
        print('LazyConnection enter')
        if hasattr(self.local, 'sock'):
            raise RuntimeError('Already connected')
        self.local.sock = socket(self.family, self.type)
        self.local.sock.connect(self.address)
        return self.local.sock

    def __exit__(self, exc_ty, exc_val, tb):
        print('LazyConnection exit')
        self.local.sock.close()
        del self.local.sock



from functools import partial
def test(conn):
    with conn as s:
        s.send(b'GET /index.html HTTP/1.0\r\n')
        s.send(b'Host: www.python.org\r\n')

        s.send(b'\r\n')
        resp = b''.join(iter(partial(s.recv, 8192), b''))

    print('Got {} bytes'.format(len(resp)))



if __name__ == '__main__':
    conn = LazyConnection(('www.python.org', 80))

    t1 = threading.Thread(target=test, args=(conn,))
    t2 = threading.Thread(target=test, args=(conn,))
    t1.start()
    t2.start()
    t1.join()
    t2.join()
```


# 守护线程
threading 模块支持守护线程，其工作方式是：守护线程一般是一个等待客户端请求服务的服务器。如果没有客户端请求，守护线程就是空闲的。如果把一个线程设置为守护线程，就表示这个线程是不重要的，进程退出时不需要等待这个线程执行完成。

如果主线程准备退出时，不需要等待某些子线程完成，就可以为这些子线程设置守护线程标记。该标记值为真时，表示该线程是不重要的，或者说该线程只是用来等待客户端请求而不做任何其他事情。

要将一个线程设置为守护线程，需要在启动线程之前执行如下赋值语句：thread.daemon = True。同样，要检
查线程的守护状态，也只需要检查这个值即可。一个新的子线程会继承父线程的守护标记。整个 Python 程序（可以解读为：主线程）将在所有非守护线程退出之后才退出，换句话说，就是没有剩下存活的非守护线程时。
