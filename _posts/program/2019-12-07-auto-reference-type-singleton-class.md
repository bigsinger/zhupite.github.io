---
layout:		post
category:	"program"
title:		"单实例引用类在未使用auto引用类型下导致的问题"
tags:		[c++]
---
- Content
{:toc}
单实例引用类在未使用auto引用类型下导致的问题

# 背景

这个问题表述起来有点拗口，但是用代码描述就比较清楚了。

在项目中有一个这样的单实例类**Derived**：

```c++
class Derived {
public:
	Derived() {
		printf("Derived born\n");
		this->init();
	}
	~Derived() {}

public:
	static Derived& getInstance() {
		return mInstance;
	}

	void doWork() {
		mContainer.append("world");
		printf("Derived work, content is: %s\n", mContainer.c_str());
	}

private:
	void init() {
		mContainer = "hello";
		printf("Derived init\n");
	}

private:
	std::string mContainer;
	static Derived mInstance;
};


Derived Derived::mInstance;
```

为了外面使用方便，把获取单实例类的接口返回值设计成了引用类型，也就是 **getInstance()** 函数返回的是引用类型。也就是说使用者可以通过以下方式来引用该单实例对象：

```c++
auto&d1 = Derived::getInstance();
```

然后就可以不用指针，直接用点来访问该对象的成员函数了。



# 问题

不过后来出现了一例异常，排查发现是auto使用的时候没有使用引用类型：

```c++
auto d2 = Derived::getInstance();
```



排查发现auto类型与auto引用类型完全不一样，即使右侧的函数返回的是引用类型，使用auto类型时会重新构造一个对象，例如上述的调用会重新再拷贝构造一个对象（构造函数和init不会被再次调用）。



问题是怎么出现的呢？做一个如下的测试：

```c++
auto&d1 = Derived::getInstance();
auto d2 = Derived::getInstance();
d2.doWork();
```

在VisualStudio的监控里可以看到d1的类型是Derived&，d2的类型是Derived，初始时他们的成员变量是一样的：

|      | 名称 | 值                    | 类型      |
| ---- | ---- | --------------------- | --------- |
| ▶    | d1   | {mContainer="hello" } | Derived & |
| ▶    | d2   | {mContainer="hello" } | Derived   |



但是调用完成员函数后，成员变量的值就不一样了，它们内部的成员变量根本就不是同一个，d2是被拷贝构造出来的对象。

|      | 名称 | 值                         | 类型      |
| ---- | ---- | -------------------------- | --------- |
| ▶    | d1   | {mContainer="hello" }      | Derived & |
| ▶    | d2   | {mContainer="helloworld" } | Derived   |

这完全违背了设计初衷--单例模式，而且auto在使用中很容易因为漏掉了一个引用符号导致问题。



# 解决

主要还是为了解决auto后面的引用符号漏掉的情况，让人记住规则恐怕不可行，时间长了就容易忘记，而且靠人来确保很难。 因此便想在设计上来规避这种问题的出现，或者说出现这个问题的时候最好能够主动报出错来，让人去排查确认。



例如可以不允许单实例类进行拷贝操作：

```c++
/// <summary>
/// 该类没有任何实际功能，用来禁止类的拷贝构造
/// 用法：凡是不希望有拷贝构造的类均可派生自此类，用错的情况在编译阶段会报错，方便及时排查。
/// 案例：
/// auto&d1 = Derived::getInstance();
///	auto d2 = Derived::getInstance();		// 报错
/// </summary>
class Singleton {
public:
	Singleton() {}
	virtual ~Singleton() {}
private:
	Singleton(const Singleton& t) = delete;
	Singleton& operator=(const Singleton& t) = delete;
};
```



然后让单实例类继承它：

```c++
class Derived : public Singleton {
    //...
}
```



这样操作之后，但凡有误用的情况，VisualStudio都会有错误提示的波浪线，而且无法编译成功。

```c++
auto d2 = Derived::getInstance();
```

编译的时候会报错：

```
error C2280: “Derived::Derived(const Derived &)”: 尝试引用已删除的函数
message : 编译器已在此处生成“Derived::Derived”
message : “Derived::Derived(const Derived &)”: 由于 基类 调用已删除或不可访问的函数“Singleton::Singleton(const Singleton &)”，因此已隐式删除函数
message : “Singleton::Singleton(const Singleton &)”: 已隐式删除函数
```

这个时候，误用的人便会去确认下到底哪里出错了，很容易就发现并改正了，无须额外记忆。



更进一步的话，可以完善这个单实例类，加入一些其他的功能，例如可以参考：[C++ 单例模式的模板实现](https://zhuanlan.zhihu.com/p/232319083)



另外一个解决办法是让 **getInstance()** 函数返回指针类型，这样也可以解决问题，但是调用者的使用体验上面就会打一些折扣了。



# 总结

出问题很常见，但是问题之后的解决尽量还是不要靠人去保证，例如以及各种规则：不要这样用不要那样用，例如上面最初的用法，就不能保证没人会误用，时间久了或者换人维护了即有可能又会犯错。

最好能设计成一种规则制度，让人不得不遵守，在出错的时候能够马上给出提示或者无法进行下去，这样的解决办法才是好办法。



更进一步引申开来，很多问题的出现并不是表象上的，头痛医头脚痛医脚往往不能解决问题，更多地是制度和规则的问题，这些可以深挖，日后再写吧。