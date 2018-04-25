---
layout:		post
category:	"program"
title:		"Windows下的LLVM之把pass抽离到DLL中"
tags:		[llvm]
---
先说一下为什么要剥离出去？

LLVM6.0的工程在Windows下用VisualStudio2017第一次编译五个多小时，单独编译一次OPT或者clang需要半个多小时，即使是只修改cpp文件编译链接也要半个多小时，而且这期间电脑卡死啥也干不了。

这是在Windows下玩LLVM的现状，我估计MAC下或者Linux系统下没这个问题吧，我看网上也没人提编译速度慢的事。有人该说了，你特么用MAC或者Linux玩不就可以了吗？但是大部分的AndroidStudio开发NDK的时候还是在Windows上开发的，如果要提供一套安全编译工具的话，还是要准备Windows版本的LLVM安全编译器不是？

另外一点是，LLVM官方代码本身就不支持把pass编译出dll来，网上的案例大多都是MAC下或者Linux系统下的，可以用-load来加载动态库调用。LLVM官网也介绍说，用的一个括号说明的，说是Windows下会生成相应的扩展名的动态库，骗人的，不会生成dll的。

所以事情就演变成：

Windows下没有生成pass动态库--》自己集成（参考[Windows下LLVM6\.0集成并编译OLLVM中的Obfuscator的各个pass \- 朱皮特个人博客](http://www.zhupite.com/posts/windows-llvm-use-ollvm-pass.html)）--》虽然集成通过，但是编译速度巨慢啊--》解决编译速度慢的问题--》剥离变化部分到DLL中。

LLVM6.0生成的VisualStudio解决方案下共有502个项目，你叫我怎么编译？但是我们在研究pass的过程中，修改的文件就那几个，LLVM中的绝大部分代码是不需要修改的，那么就可以单独把我们增加的pass代码剥离出来制作成dll，让CLANG去加载调用即可。


# 步骤1 创建DLL工程
创建一个工程的目录，例如：custompass，在目录下创建Obfuscator文件夹，作为我们的源码目录，把OLLVM的相关代码放到该目录下：
- MyPass.cpp
- Custom.cpp
- Custom.h
- Obfuscator.cpp
- Obfuscator.h
- Flattening.cpp
- Flattening.h
- StringObfuscation.cpp
- StringObfuscation.h
- Substitution.cpp
- Substitution.h
- BogusControlFlow.cpp
- BogusControlFlow.h
- CryptoUtils.cpp
- CryptoUtils.h
- Utils.cpp
- Utils.h

至于为什么会多出一些头文件和源文件，是因为我把自定义的pass相关文件和组织整理后的文件也都放进去了，可以参考之前的文章（[Windows下LLVM6\.0集成并编译OLLVM中的Obfuscator的各个pass \- 朱皮特个人博客](http://www.zhupite.com/posts/windows-llvm-use-ollvm-pass.html)）。

其中Obfuscator.h：
```
#pragma once

//多个pass
#include "Utils.h"
#include "Substitution.h"
#include "StringObfuscation.h"
#include "Flattening.h"
#include "BogusControlFlow.h"
#include "llvm/IR/LegacyPassManager.h"

namespace llvm {

	// 在里面创建其他多个pass
	FunctionPass *createObfuscatorPasses(bool flag);

	//必须放在llvm命名空间下
	void initializeSubstitutionPass(PassRegistry&);
	void initializeFlatteningPass(PassRegistry&);
	void initializeStringObfuscationPassPass(PassRegistry&);
	void initializeBogusControlFlowPass(PassRegistry&);
}

extern "C" {
	// 在clang里根据配置创建自定义pass，called by PassManagerBuilder::populateModulePassManager
	__declspec(dllexport)  void __stdcall clangAddCustomPass(legacy::PassManagerBase &MPM);
}

```
Obfuscator.cpp：
```
#include "stdafx.h"
#include "Obfuscator.h"

#include "llvm/Transforms/Custom.h"
#include "llvm/Support/CommandLine.h"
#include "llvm/Support/ManagedStatic.h"

#include "llvm/InitializePasses.h"
#include "llvm-c/Initialization.h"
#include "llvm/InitializePasses.h"
#include "llvm/PassRegistry.h"
using namespace llvm;


#if _WINDOWS
#include <wtypes.h>
#include <WinBase.h>
#include <windef.h>
#include <WinUser.h>
#endif // _WINDOWS


// initializeObfuscator - Initialize all passes in the Custom library
void llvm::initializeObfuscator(PassRegistry &Registry) {
	initializeSubstitutionPass(Registry);
	initializeFlatteningPass(Registry);
	initializeStringObfuscationPassPass(Registry);
	initializeBogusControlFlowPass(Registry);
}

FunctionPass *llvm::createObfuscatorPasses(bool flag) {
	createFlattening(flag);
	createStringObfuscation(flag);
	createSubstitution(flag);
	createBogus(flag);
	return NULL;
}

// 在clang里根据配置创建自定义pass，called by PassManagerBuilder::populateModulePassManager
void clangAddCustomPass(legacy::PassManagerBase &MPM) {
	void *p = &MPM;
	if ( p != NULL ) {
#if _WINDOWS
		if (MyPass == false) {
			::MessageBoxA(0, "MyPass==false", 0, 0);
			MyPass = true;
		}
#endif // _WINDOWS

		MPM.add(createMyPassPass(true));
		MPM.add(createFlattening(true));
		MPM.add(createStringObfuscation(true));
		MPM.add(createSubstitution(true));
		MPM.add(createBogus(true));
	} else {
#if _WINDOWS
		::MessageBoxA(0, "MPM == NULL", 0, 0);
#endif // _WINDOWS
	}
}
```


custompass目录下创建CMakeLists.txt文件，内容如下：
```
cmake_minimum_required(VERSION 3.4)

project(custompass)

# 设置编译模式
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} /MD")	#/MT
set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} /MDd")		#/MTd

# 添加源码目录
aux_source_directory(./Obfuscator  src_1)
set(srcs ${src_1})

# 生成动态链接库，那么在Windows下就是dll，最终会生成custompass.dll
add_library(custompass SHARED ${srcs})

# 添加头文件包含目录，头文件包含还有CMake后生成的include目录
include_directories(../llvm/include xxx/llvm/build/include)


# link_directories不起作用 参见 https://stackoverflow.com/questions/31438916/cmake-cannot-find-library-using-link-directories
# TARGET_LINK_LIBRARIES(custompass LLVMPasses LLVMCore)

set(mylibdir "xxx/llvm/build/Debug/lib")
set(VTKLIBS LLVMCore LLVMSupport LLVMAnalysis LLVMBinaryFormat LLVMTransformUtils)
foreach(libname ${VTKLIBS})
        SET(FOUND_LIB "FOUND_LIB-NOTFOUND")
        find_library(FOUND_LIB NAMES ${libname} HINTS ${mylibdir} NO_DEFAULT_PATH)
		IF (FOUND_LIB)
			message("found lib: ${FOUND_LIB}")
			LIST(APPEND mylibs ${FOUND_LIB})
		ELSE() 
			MESSAGE("not lib found: ${libname}") 
		ENDIF ()
endforeach(libname)
#message(${mylibs})

#message(${CPPUNIT_LIBRARY})
target_link_libraries(custompass PUBLIC ${mylibs})	
```

然后使用CMakeGui生成一个VisualStudio的解决方案，记得设置64为标记（host=x64），可能再需要稍作修改，不过都比较简单，最终编译成功生成custompass.dll，第一次编译耗时40秒左右。

# 步骤2 修改LLVM的CLANG代码
为了让CLANG能使用上自定义的pass（这里不再对opt修改了），修改llvm/lib/Transforms/IPO/PassManagerBuilder.cpp，添加代码：
```C
/////////////////////////////////////////////////////////
#include "llvm/Transforms/Obfuscator/Obfuscator.h"
#if _WINDOWS
#include <wtypes.h>
#include <WinBase.h>
#include <windef.h>
#include <string>

typedef void(__stdcall *pfn_clangAddCustomPass)(legacy::PassManagerBase &MPM);
std::string GetStartPath(HMODULE hModule = NULL);

std::string GetStartPath(HMODULE hModule/* = NULL*/) {
	char szTemp[260] = { 0 };
	GetModuleFileNameA(hModule, szTemp, sizeof(szTemp) / sizeof(TCHAR));
	strrchr(szTemp, '\\')[1] = 0;
	return szTemp;
}

#endif // _WINDOWS
/////////////////////////////////////////////////////////
```
并在函数PassManagerBuilder::populateModulePassManager入口处添加：
```C
///////////////////////////////////////////////////////
//clangAddCustomPass(MPM);
#if _WINDOWS
std::string strDllPath = GetStartPath(NULL) + "custompass.dll";
HMODULE hPassDll = ::LoadLibraryA(strDllPath.c_str());
pfn_clangAddCustomPass pfn = (pfn_clangAddCustomPass)::GetProcAddress(hPassDll, "clangAddCustomPass");
if (pfn != NULL) {
	pfn(MPM);
} else {
	//not found custompass.dll or clangAddCustomPass
}
#endif // _WINDOWS
///////////////////////////////////////////////////////
```

# 步骤4 优化加快编译速度
利用Windows下的VisualStudio的预编译头来加快编译速度，不然每次编译都需要花费40秒也是够慢的。

对VisualStudio的项目工程设置下使用预编译头，然后对每个cpp文件的开头一行增加：
```
#include "stdafx.h"
```
在custompass/build目录下创建一个stdafx.h，内容为：
```
#pragma once

```
创建一个stdafx.cpp，内容为：
```
#include "stdafx.h"
```
并设置stdafx.cpp的预编译头文件为：创建。

完成配置后，二次编译（仅仅修改CPP文件的情况下）只需要一两秒时间即可完成，大大提高了编译效率，生成的dll体积debug版本的有15MB多点，相比200MB多的CLANG小太多了。


工欲善其事必先利其器，前期花点时间把实验环境搭建好是很值得的，后面就可以随便修改混淆PASS来随意把玩研究了。


# TODO opt参数解析失效了
以下代码配置的参数解析如果放在dll里会失效，因为命令行参数解析没有打通，一个在clang的exe里，无法遍历在dll里的这些opt变量，这些变量永远为false了：
```C
static cl::opt<bool>
MyPass("mypass", cl::init(false), cl::Hidden,
	cl::ZeroOrMore, cl::desc("Print all function names"));

static cl::opt<bool>
StringObfuscationPass("GVDiv", cl::init(false), cl::Hidden,
	cl::ZeroOrMore, cl::desc("Global variable (i.e., const char*) diversification pass"));

static cl::opt<bool>
Flattening("flattening", cl::init(false), cl::Hidden,
	cl::ZeroOrMore, cl::desc("Call graph flattening"));

static cl::opt<bool>
Substitution("substitution", cl::init(false), cl::Hidden,
	cl::ZeroOrMore, cl::desc("operators substitution"));

static cl::opt<bool>
BogusControlFlow("boguscf", cl::init(false), cl::Hidden,
	cl::ZeroOrMore, cl::desc("inserting bogus control flow"));
```
如果继续放在clang里，可以通过clangAddCustomPass的参数进行传递，这个我目前没有做，后期再说。

目前是手动修改clangAddCustomPass函数中createMyPassPass的参数，不过问题不大，前期学习研究不成问题，后期可以弄成配置文件，或增加clangAddCustomPass的函数参数来传递。

