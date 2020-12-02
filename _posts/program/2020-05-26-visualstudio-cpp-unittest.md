---
layout:		post
category:	"program"
title:		"VisualStudio为C++项目创建单元测试"
tags:		[c++]
---
- Content
{:toc}
主要介绍两种为VisualStudio的C++项目创建单元测试的方法：**微软的本机单元测试**、**Google Test**。



## 一、VisualStudio自带的本机单元测试

VisualStudio自带的有一个C++本机单元测试，其框架主要原理是生成一个动态库文件，测试的函数作为DLL的导出函数由框架进行调用测试。

然而实际使用下来体验并不是很好，不过还是简单说下怎么使用。

在解决方案下右键菜单-添加-新建项目，搜索C++项目里的“**本机单元测试项目**”

![](https://docs.microsoft.com/zh-cn/visualstudio/test/media/vs-2019/cpp-new-test-project-vs2019.png?view=vs-2019)

具体可以参考微软官方介绍：[编写适用于 C/C++ 的单元测试 - Visual Studio | Microsoft Docs](https://docs.microsoft.com/zh-cn/visualstudio/test/writing-unit-tests-for-c-cpp?view=vs-2019)

测试发现对于简单的demo小程序没有什么问题，但是对于半路接入单元测试的复杂点的项目就暴露了各种问题（当然最好在项目最初就接入单元测试）。

另外实测发现：**测试项目必须引入带测试项目的lib和.obj**，某些博客说不用链接，实测不行。




### 为DLL项目创建单元测试
还是参考微软官方介绍：[编写 C++ DLL 单元测试 - Visual Studio | Microsoft Docs](https://docs.microsoft.com/zh-cn/visualstudio/test/how-to-write-unit-tests-for-cpp-dlls?view=vs-2019#sameProject)

单元测试必须调用不导出的非成员函数，并且代码必须生成为动态链接库 (DLL)： 在同一项目中添加单元测试作为产品代码。[转到过程在同一项目中添加单元测试的具体步骤。](https://docs.microsoft.com/zh-cn/visualstudio/test/how-to-write-unit-tests-for-cpp-dlls?view=vs-2019#sameProject)

这个看上去挺适合自己目前的项目的，然而接入下来并不理想，问题后面一并总结。

### 主要问题
- 配置繁琐
- 好不容易配置成功，测试出现问题，其中无法执行测试是最常见的：
```none
Failed to set up the execution context to run the test.
```
参考网上的介绍说是，测试DLL所依赖的项目或三方DLL缺失，使用depends查看依赖关系 配置完全后仍然无法运行(测试demo可以，复杂点项目不行)。放弃。





## 二、使用Google Test
使用下来发现Google Test要简单的多，可以参考微软官方文档：
[如何使用适用于 C++ 的 Google Test - Visual Studio | Microsoft Docs](https://docs.microsoft.com/zh-cn/visualstudio/test/how-to-use-google-test-for-cpp?view=vs-2019)

![](https://docs.microsoft.com/zh-cn/visualstudio/test/media/cpp-google-component.png?view=vs-2019)

![](https://docs.microsoft.com/zh-cn/visualstudio/test/media/vs-2019/cpp-gtest-new-project-vs2019.png?view=vs-2019)

这里说下需要注意的地方，因为C++项目一般使用静态链接库的方式，所以在创建Google Test项目的时候，选项需要注意。

- **将Google Test用作**，选择默认的“**静态库(.lib)**”即可；
- **C++运行时库选择**：静态链接（也就是MT/MTd）,否则就选择：动态链接（推荐）（也就是MD/MDd）。
- **选择要测试的项目（可选）**：这个勾选要测试的项目名，也可以不选。

![](https://docs.microsoft.com/zh-cn/visualstudio/test/media/cpp-gtest-config.png?view=vs-2019)



在测试项目的属性-链接器-输入-附加依赖项里，配置：**..\temp\XXXX\Win32\Debug\*.obj**
在测试项目的属性-链接器-常规-附加库目录，配置需要链接的三方lib的目录，这个是和被测试项目的配置一致。

编写测试代码：
```cpp
#include "pch.h"
#include "../XXXX/XXX.h"    // 被测试项目的代码


TEST(TestCaseName, TestName) {
	EXPECT_EQ(1, 1);
	EXPECT_TRUE(true);

	// 使用被测试项目的代码
	ASSERT_STREQ(_T("xxx.xxx"), _T("xxx.xxx"));
}

int main(int argc, char** argv) {
	::testing::InitGoogleTest(&argc, argv);
	return RUN_ALL_TESTS();
}
```

更多使用方法可以参考：[googletest/primer.md at master · google/googletest](https://github.com/google/googletest/blob/master/googletest/docs/primer.md)



## 总结

- 两种方法都需要引入被测试项目的lib和obj，其中obj可用相对路径加*.obj的方式引入；
- 微软自带本机测试项目生成的是dll形式，不方便；而Google Test生成的是exe形式，方便。
- 微软自带本机测试项目问题较多，特别是**Failed to set up the execution context to run the test**难以解决。
- Google Test总体配置更简单，问题更少，可以根据项目属性自由选择：静态链接或动态链接；
- Google Test测试项目生成的是exe类型的可执行文件，添加上述的main函数还可以单步调试跟踪，一旦测试出问题可以很方便调试解决。



## 参考：
- [编写适用于 C/C++ 的单元测试 - Visual Studio | Microsoft Docs](https://docs.microsoft.com/zh-cn/visualstudio/test/writing-unit-tests-for-c-cpp?view=vs-2019)
- [编写 C++ DLL 单元测试 - Visual Studio | Microsoft Docs](https://docs.microsoft.com/zh-cn/visualstudio/test/how-to-write-unit-tests-for-cpp-dlls?view=vs-2019#sameProject)
- [如何使用适用于 C++ 的 Google Test - Visual Studio | Microsoft Docs](https://docs.microsoft.com/zh-cn/visualstudio/test/how-to-use-google-test-for-cpp?view=vs-2019)
- [googletest/primer.md at master · google/googletest](https://github.com/google/googletest/blob/master/googletest/docs/primer.md)