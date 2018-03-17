---
layout:		post
category:	"program"
title:		"思考：重复性的代码流程应该导出为模板也方便规范"
tags:		[c++]
---

## 问题
N年前做电脑端的游戏反外挂检测扫描，现在做Android的安全检测，Android手游的反外挂检测，Android应用的加固保护……发现流程上都有相似之处，例如初始化，各个检测项（工作项），收尾，一样的流程，每次都是一个模式，万变不离其宗，心想如果每次都重新搭建一个流程也是无畏的浪费时间，而且试想，如果放开让新人去写会不会按照规范来写？

于是，便开始构思如何把这个模式导出为模板，下次类似的工作直接从模板创建，然后逐个功能添加即可，也正好限制了开发的规范，必须按照某某接口来去实现，方便管理，避免代码变得混乱，一举两得何乐而不为呢？

## 抽象
- 对于检测类的项目，首先是初始化特征库，然后是逐个检测点定期执行，最后是反初始化的资源释放。

- 对于Android移动加固保护，首先是解压缩、反编译，然后是加固SO、加固DEX、如果是游戏类APP则加固游戏，如果是H5类APP则加固H5资源等，最后是资源释放。

每个功能基本上一个独立的技术再负责，大的流程基本上可以不变，技术只需要专注于自己的功能即可。哪个环节的功能出了问题也是对应的负责人去查看，耦合性较低，即使某个环节出了问题，但是大的流程可以使用上次的稳定版本进行开发和调试，影响不大。


设想这样一个工作模式：一件任务安排下来，可能需要多个部门分工协作才能完成，于是把任务划分为不同的子任务，子任务之间可能有相互依赖，也可能没有。对于有相互依赖的任务，设置在不同的步骤里完成，例如子任务3必须在子任务1完成后才能完成，而子任务2和子任务3可以同时并行处理。那么可以把子任务1放在步骤1里；把子任务2和子任务3放在步骤2里。


## 实现
设计实现了一个类似于工作流的模式:
```C++
int main() {
	g_log.EnableLogFile(true);
	CEngine engine;

	//添加准备任务：步骤1执行完后同时执行步骤2
	engine.AddPrePareTask(new MyTask1(), 1);
	engine.AddPrePareTask(new MyTaskUnzip(), 2);
	engine.AddPrePareTask(new MyTaskDecompile(), 2);

	//添加工作任务：全部异步
	engine.AddWorkTask(new MyTaskDealDex());
	engine.AddWorkTask(new MyTaskDealSo());
	engine.AddWorkTask(new MyTaskDealGame());
	engine.AddWorkTask(new MyTaskDealH5());

	//添加收尾任务
	engine.AddCleanTask(new MyTaskDeleteTemps());

	engine.Init();
	engine.Work();
	engine.Release();
	return 0;
}
```
另一个好处是规范了代码，例如任务代码必须实现如下几个接口：
```C++
class ITask {
public:
	virtual string GetName() = 0;

public:
	bool Init() {
		this->OnInit();
	}
	void Work() {
		time_t start, end; time(&start);
		g_log.Log("开始执行: [%s]", this->GetName().c_str());
		this->OnBeforeWork();;
		this->OnWork();
		this->OnAfterWork();;
		time(&end);
		g_log.Log("执行完成: [%s] 耗时: %.2lf s", this->GetName().c_str(), difftime(end, start));
	}
	 void Release() {
		this->OnRelease();
	}

public:
	virtual bool OnInit() = 0;
	virtual void OnBeforeWork() = 0;
	virtual void OnWork() = 0;
	virtual void OnAfterWork() = 0;
	virtual void OnRelease() = 0;

private:
	string m_sName;
};

typedef ITask *ITaskPtr;
```



如果【工作任务】不是循环执行多次的话，其实可以不必添加【准备任务】和【收尾任务】，直接都添加到【工作任务】里去，仅仅只要保证【准备任务】在添加的时候步骤在【工作任务】之前，【收尾任务】的步骤在【工作任务】之后即可。

## 导出模板
打开VS2017的菜单：项目-导出模板，按照向导导出一个zip模板。下次创建类似的项目时可以直接在向导里选择该模板，然后逐个添加任务即可，也就是只关注于功能本身。

## 待完善
- 目前仅仅支持Windows，想打算一并支持Linux，这个需要时间去完成，这里仅仅阐述一个想法。
- 添加好配置解析，日志输出，路径管理等公共操作类。
- 添加文档，注释等。

代码参见：[bigsinger/FlowCpp](https://github.com/bigsinger/FlowCpp)
