---
layout:		post
category:	"program"
title:		"LLVM在Windows下使用VisualStudio2017添加编译自定义pass"
tags:		[llvm]
---

参考：[uu kk: LLVM pass on Windows: integrating with opt](http://uu-kk.blogspot.jp/2012/02/llvm-pass-on-windows-integrating-with.html)

该方法仍然有效，只不过还需要一些修改，遇到的错误需要解决。

## 错误1
```
CMake Error at CMakeLists.txt:658 (message):
  Unexpected failure executing llvm-build: llvm-build: fatal error: missing
  LLVMBuild.txt file at:
  'F:\\svnlocal\\temp\\llvm\\llvm6.0/lib\\Transforms\\Hello\\LLVMBuild.txt'
```
这样的错误是说明缺少**LLVMBuild.txt**文件，只要在CMakeLists.txt的同目录下配置一个**LLVMBuild.txt**文件。

## 错误2
```
CMake Error at CMakeLists.txt:658 (message):
  Unexpected failure executing llvm-build: Traceback (most recent call last):

    File "F:/svnlocal/temp/llvm/llvm6.0/utils/llvm-build/llvm-build", line 6, in
 <module>
      llvmbuild.main()
    File "F:\svnlocal\temp\llvm\llvm6.0\utils\llvm-build\llvmbuild\main.py", lin
e 952, in main
      opts.optional_components)
    File "F:\svnlocal\temp\llvm\llvm6.0\utils\llvm-build\llvmbuild\main.py", lin
e 332, in write_library_table
      tg = c.get_parent_target_group()
    File "F:\svnlocal\temp\llvm\llvm6.0\utils\llvm-build\llvmbuild\componentinfo
.py", line 87, in get_parent_target_group
      return self.parent_instance.get_parent_target_group()
    File "F:\svnlocal\temp\llvm\llvm6.0\utils\llvm-build\llvmbuild\componentinfo
.py", line 87, in get_parent_target_group
      return self.parent_instance.get_parent_target_group()
    File "F:\svnlocal\temp\llvm\llvm6.0\utils\llvm-build\llvmbuild\componentinfo
.py", line 87, in get_parent_target_group
      return self.parent_instance.get_parent_target_group()
    [Previous line repeated 992 more times]
    File "F:\svnlocal\temp\llvm\llvm6.0\utils\llvm-build\llvmbuild\componentinfo
.py", line 82, in get_parent_target_group
      if self.type_name == 'TargetGroup':

  RecursionError: maximum recursion depth exceeded in comparison
```
最初看到这个错误还以为LLVM不支持Python3，于是安装了Python2，结果发现问题依然存在。最后确定下来原因是：LLVMBuild.txt内容的**parent**配置不正确，正确的配置是：LLVMBuild.txt文件的父目录的父目录，例如llvm/lib/Transforms/Custom（或者llvm/lib/Transforms/Hello）下的LLVMBuild.txt内容中parent应该是Transforms，这里放一个完整的llvm/lib/Transforms/Custom/LLVMBuild.txt内容：
```
[component_0]
type = Library
name = Custom
parent = Transforms
```
这一点上，原参考文章里是没有介绍的，需要自己摸索。

## 错误3
```
-- Clang version: 6.0.0
-- SampleAnalyzerPlugin ignored -- Loadable modules not supported on this platform.
-- PrintFunctionNames ignored -- Loadable modules not supported on this platform.
-- AnnotateFunctions ignored -- Loadable modules not supported on this platform.
CMake Error at cmake/modules/LLVM-Config.cmake:105 (target_link_libraries):
  Target "LLVMCustom" of type UTILITY may not be linked into another target.
  One may link only to INTERFACE, STATIC or SHARED libraries, or to
  executables with the ENABLE_EXPORTS property set.
Call Stack (most recent call first):
  cmake/modules/LLVM-Config.cmake:93 (explicit_llvm_config)
  cmake/modules/AddLLVM.cmake:759 (llvm_config)
  cmake/modules/AddLLVM.cmake:860 (add_llvm_executable)
  tools/bugpoint/CMakeLists.txt:24 (add_llvm_tool)


-- BugpointPasses ignored -- Loadable modules not supported on this platform.
CMake Error at cmake/modules/LLVM-Config.cmake:105 (target_link_libraries):
  Target "LLVMCustom" of type UTILITY may not be linked into another target.
  One may link only to INTERFACE, STATIC or SHARED libraries, or to
  executables with the ENABLE_EXPORTS property set.
Call Stack (most recent call first):
  cmake/modules/LLVM-Config.cmake:93 (explicit_llvm_config)
  cmake/modules/AddLLVM.cmake:759 (llvm_config)
  cmake/modules/AddLLVM.cmake:860 (add_llvm_executable)
  tools/opt/CMakeLists.txt:26 (add_llvm_tool)


-- Configuring incomplete, errors occurred!
See also "F:/svnlocal/temp/llvm/llvm6.0/build/CMakeFiles/CMakeOutput.log".
See also "F:/svnlocal/temp/llvm/llvm6.0/build/CMakeFiles/CMakeError.log".
```
这个错误是因为我偷懒导致，直接复制了Hello文件夹下的CMakeLists.txt，然后只修改了LLVMHello为：LLVMCustom
```
add_llvm_loadable_module( LLVMCustom
  MyPass.cpp
  Custom.cpp

  DEPENDS
  intrinsics_gen
  PLUGIN_TOOL
  opt
  )
```
实际上应该是add_llvm_library：
```
add_llvm_library( LLVMCustom
	MyPass.cpp
	Custom.cpp
)
```
这一点参考文章是正确的，只是因为直接复制了Hello的CMakeLists.txt而没有完全修改正确而已，**add_llvm_loadable_module**也要修改掉，修改为**add_llvm_library**。

## 错误4
```
CMake Error at cmake/modules/AddLLVM.cmake:1333 (add_dependencies):
  The dependency target "LLVMHello" of target "check-all" does not exist.
Call Stack (most recent call first):
  CMakeLists.txt:919 (add_lit_target)


CMake Error at cmake/modules/AddLLVM.cmake:1333 (add_dependencies):
  The dependency target "LLVMHello" of target "check-llvm" does not exist.
Call Stack (most recent call first):
  cmake/modules/AddLLVM.cmake:1354 (add_lit_target)
  test/CMakeLists.txt:157 (add_lit_testsuite)
```
llvm/test/CMakeLists.txt中删除LLVMHello，如果出现类似的错误，就找到所有有关Hello工程的CMakeLists.txt和LLVMBuild.txt，把关于对Hello的行注释掉或去掉。

## 错误5
```
not found unwrap
```
参考文章的CPP文件代码中少了头文件引用，导致**unwrap**找不到，正确的Custom.cpp代码如下：
```
#include "llvm/InitializePasses.h"
#include "llvm-c/Initialization.h"
#include "llvm/InitializePasses.h"
#include "llvm/PassRegistry.h"


using namespace llvm;

/// initializeCustom - Initialize all passes in the Custom library
void llvm::initializeCustom(PassRegistry &Registry) {
  initializeMyPassPass(Registry);
}

/// LLVMInitializeCustom - C binding for initializeCustom.
void LLVMInitializeCustom(LLVMPassRegistryRef R) {
	initializeCustom(*unwrap(R));
}
```

# 梳理一遍完整的步骤

基于llvm6.0介绍

## 步骤1：创建模块及源码文件
在llvm/lib/Transforms目录下创建一个Custom文件夹，这里存放要自定义的pass，创建一个MyPass.cpp，内容如下：
```
#define DEBUG_TYPE "mypass"
#include "llvm/Function.h"
#include "llvm/Pass.h"
#include "llvm/Transforms/Custom.h"
#include "llvm/Support/raw_ostream.h"
using namespace llvm;

namespace {
  struct MyPass : public FunctionPass {
    static char ID;
    MyPass() : FunctionPass(ID) {
      initializeMyPassPass(*PassRegistry::getPassRegistry());
    }

    /*
     * Just print the function name 
     */
    bool runOnFunction(Function &F) {
      bool Changed = false;
      errs().write_escaped(F.getName()) << "\n";
      return Changed;
    }
  };
}

char MyPass::ID = 0;
INITIALIZE_PASS(MyPass, "mypass", "Print all function names",
                false, false)

FunctionPass *llvm::createMyPassPass() {
  return new MyPass();
}
```

再创建一个Custom.cpp，内容如下：
```
#include "llvm/InitializePasses.h"
#include "llvm-c/Initialization.h"
#include "llvm/InitializePasses.h"
#include "llvm/PassRegistry.h"

using namespace llvm;

/// initializeCustom - Initialize all passes in the Custom library
void llvm::initializeCustom(PassRegistry &Registry) {
  initializeMyPassPass(Registry);
}

/// LLVMInitializeCustom - C binding for initializeCustom.
void LLVMInitializeCustom(LLVMPassRegistryRef R) {
	initializeCustom(*unwrap(R));
}
```

## 步骤2 配置LLVMBuild.txt和CMakeLists.txt
在Custom文件夹下创建LLVMBuild.txt，内容如下：
```
[component_0]
type = Library
name = Custom
parent = Transforms
```
简单解释下：
- type：是该模块的编译后的文件形式，这里是Library，也就是编译作为库文件。
- name：是该模块的名称，这里就填Custom，一般跟当前所在的文件夹同名。
- parent：当前文件夹的父目录，一般是Transforms。

在Custom文件夹下创建CMakeLists.txt，内容如下：
```
add_llvm_library( LLVMCustom
	MyPass.cpp
	Custom.cpp
)
```

## 步骤3 创建模块包含头文件
在llvm/include/llvm/Transforms/目录下创建Custom.h，内容如下：
```
#ifndef LLVM_CUSTOM_H
#define LLVM_CUSTOM_H

namespace llvm {

FunctionPass *createMyPassPass();

}

#endif
```

打开编辑文件llvm/include/llvm/InitializePasses.h，在命名空间llvm中的代码块末尾添加代码：
```
void initializeCustom(PassRegistry&);
void initializeMyPassPass(PassRegistry&);
```

打开编辑文件llvm/include/llvm/LinkAllPasses.h，在ForcePassLinking构造函数中添加代码：
```
#include "llvm/Transforms/Custom.h"

// This part must reside in the constructor of struct ForcePassLinking
(void) llvm::createMyPassPass();
```

## 步骤4 修改各种LLVMBuild.txt和CMakeLists.txt
- 修改llvm/lib/Transforms/LLVMBuild.txt，common节的subdirectories内容添加：Custom
- 修改llvm/lib/Transforms/CMakeLists.txt，末尾添加：
```
add_subdirectory(Custom)
```
- 修改llvm/tools/opt/LLVMBuild.txt，required_libraries内容添加：Custom
- 修改llvm/tools/opt/CMakeLists.txt，在set(LLVM_LINK_COMPONENTS中添加：Custom
- 修改llvm/tools/bugpoint/LLVMBuild.txt，required_libraries内容添加：Custom
- 修改llvm/tools/bugpoint/CMakeLists.txt在set(LLVM_LINK_COMPONENTS中添加：Custom


## 步骤5 修改opt.cpp
修改llvm/tools/opt/opt.cpp，在main函数中添加代码：
```
initializeCustom(Registry);
```

## 步骤6 CMake GUI重新生成下sln
因为是直接修改的CMakeLists.txt和LLVMBuild.txt，VisualStudio是识别不了的，如果直接编译opt项目最终会出现链接错误，提示找不到Custom中添加的函数。

这个时候再次打开CMakeGUI再次生成下sln工程，由于CMakeGUI有缓存机制，不会对其他文件造成修改，速度是很快的。

目的就是要让llvm/lib/Transforms/CMakeLists.txt中的这句生效：
```
add_subdirectory(Custom)
```

然后重新打开VisualStudio，直接定位到opt项目，单独编译即可。

## 编译运行
VisualStudio2017打开项目工程，找到Tools分组下的opt，单独编译，比全部编译时间会少一些。链接的过程略长，编译的opt.exe在llvm/build/Debug/bin目录下，debug版本的有100多MB！总共耗时30多分钟吧，也够长的了。

命令行下运行
```
opt.exe -help
```
输出的内容：
```
……
-mypass                                         - Print all function names
……
```
说明自定义的pass已经被编译进opt里啦。

# 原理解读
上面代码中并没有看到函数**initializeMyPassPass**的定义，这个是由宏**INITIALIZE_PASS**自动生成的。
```
INITIALIZE_PASS(MyPass, "mypass", "Print all function names", false, false)
```
可以参见**INITIALIZE_PASS**宏定义：
```
#define INITIALIZE_PASS(passName, arg, name, cfg, analysis)                    \
  static void *initialize##passName##PassOnce(PassRegistry &Registry) {        \
    PassInfo *PI = new PassInfo(                                               \
        name, arg, &passName::ID,                                              \
        PassInfo::NormalCtor_t(callDefaultCtor<passName>), cfg, analysis);     \
    Registry.registerPass(*PI, true);                                          \
    return PI;                                                                 \
  }                                                                            \
  static llvm::once_flag Initialize##passName##PassFlag;                       \
  void llvm::initialize##passName##Pass(PassRegistry &Registry) {              \
    llvm::call_once(Initialize##passName##PassFlag,                            \
                    initialize##passName##PassOnce, std::ref(Registry));       \
  }
```