---
layout:		post
category:	"llvm"
title:		"Windows下LLVM6.0集成并编译OLLVM中的Obfuscator的各个pass"
tags:		[llvm]
---

# 参考
- [OLLVM](https://github.com/Qrilee/Obfuscator-LLVM/tree/master/lib/Transforms/Obfuscation)
- [Armariris](https://github.com/GoSSIP-SJTU/Armariris/tree/master/lib/Transforms/Obfuscation)


参考上一节《[LLVM在Windows下使用VisualStudio2017编译pass \- 朱皮特个人博客](http://www.zhupite.com/posts/windows-add-llvm-pass.html)》，上次是创建的很简单的pass，但是有了这个基础，再集成和创建复杂点的pass就轻松一点，这次集成开源的**OLLVM**和**Armariris**的各个pass。

据说Armariris是在OLLVM基础上修改的，想必代码会有改进吧，所以我们优先使用Armariris的pass，如果没有的在使用OLLVM的pass。后面不区分Armariris和OLLVM，后简称参考源码。

GitHub上打开后，直接找到lib/Transforms/Obfuscation目录下，可以看到大概有四个混淆作用的pass：

pass | 作用
---|---
BogusControlFlow | 虚假控制流程
StringObfuscation | 字符串混淆
Flattening | 扁平化
Substitution | 指令替换

下面开始详细解释步骤。

# 步骤1 创建头文件
在本地LLVM源码目录include/llvm/Transforms下创建一个Obfuscator文件夹，用来做为头文件引用。

GitHub上下载参考源码的这些.h文件：
- StringObfuscation.h
- Substitution.h
- Flattening.h
- BogusControlFlow.h
- Utils.h
- CryptoUtils.h

其中CryptoUtils.h文件，参考源码是放在include/llvm目录下的，个人觉得不是很合理，把它按上面的组织结构存放了，当然后面引用该头文件的地方要相应地修改为：
```
#include "llvm/Transforms/Obfuscator/CryptoUtils.h"
```
可以想象，原作者这么组织的本意是把CryptoUtils作为一个通用的模块来调用，不只是混淆的pass，否则在别的地方（不在pass中）按上述方法包含头文件就感觉很奇怪。但是，经过实际搜索代码发现，也只有这些pass使用了该头文件，为了保持修改的变动最小化，所以我就按上面的方式组织了。


然后创建一个自己的头文件Obfuscator.h，主要来管理其他混淆pass，内容如下：
```C
#pragma once

//管理多个混淆pass
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
	void initializeFlatteningPass(PassRegistry&);
	void initializeSubstitutionPass(PassRegistry&);
	void initializeBogusControlFlowPass(PassRegistry&);
	void initializeStringObfuscationPassPass(PassRegistry&);
}
```

修改include/llvm/InitializePasses.h，在llvm命名空间中声明函数：
```
void initializeObfuscator(PassRegistry&);
```
修改include/llvm/LinkAllPasses.h，添加代码：
```C
#include "llvm/Transforms/Obfuscator/Obfuscator.h"
……
(void) llvm::createObfuscatorPasses(true);
```



# 步骤2 创建源文件
本地LLVM源码目录lib/Transforms下创建一个Obfuscator文件夹，用以包含其他的混淆pass。

GitHub上下载参考源码的这些CPP文件：
- StringObfuscation.cpp
- Substitution.cpp
- Flattening.cpp
- BogusControlFlow.cpp
- Utils.cpp
- CryptoUtils.cpp

然后创建一个自己的源码文件Obfuscator.cpp，主要来管理其他混淆pass，内容如下：
```C++
#include "llvm/Transforms/Obfuscator/Obfuscator.h"

#include "llvm/InitializePasses.h"
#include "llvm-c/Initialization.h"
#include "llvm/InitializePasses.h"
#include "llvm/PassRegistry.h"
using namespace llvm;

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
```
创建CMakeLists.txt，内容如下：
```
# If we don't need RTTI or EH, there's no reason to export anything
# from the Obfuscator plugin.


add_llvm_library(LLVMObfuscator
  Obfuscator.cpp
  CryptoUtils.cpp
  StringObfuscation.cpp
  Substitution.cpp
  Flattening.cpp
  BogusControlFlow.cpp
  Utils.cpp
  )

add_dependencies(LLVMObfuscator intrinsics_gen)
```

创建LLVMBuild.txt（原参考只有Makefile，不适用），内容如下：
```
[component_0]
type = Library
name = Obfuscator
parent = Transforms
library_name = Obfuscator
```

# 步骤3 修改混淆pass源码
每个pass的CPP中头文件包含添加：
```
#include "llvm/Transforms/Obfuscator/Obfuscator.h"
```

把对CryptoUtils.h的头文件包含代码修改为：
```
#include "llvm/Transforms/Obfuscator/CryptoUtils.h"
```

把源代码：
```C
static RegisterPass<Flattening> X("flattening", "Call graph flattening");
static RegisterPass<BogusControlFlow> X("boguscf", "inserting bogus control flow");
static RegisterPass<StringObfuscationPass> X("GVDiv", "Global variable (i.e., const char*) diversification pass", false, true);
static RegisterPass<Substitution> X("substitution", "operators substitution");
```

替换为：
```C
INITIALIZE_PASS(Flattening, "flattening", "Call graph flattening", false, false)
INITIALIZE_PASS(BogusControlFlow, "boguscf", "inserting bogus control flow", false, false)
INITIALIZE_PASS(StringObfuscationPass, "GVDiv", "Global variable (i.e., const char*) diversification pass",	false, true)
INITIALIZE_PASS(Substitution, "substitution", "operators substitution", false, false)
```
之前是LLVM4.0，现在LLVM6.0要换种写法。


# 步骤4 把混淆pass添加到主工程
- lib/Transforms/CMakeLists.txt内容追加：
```
add_subdirectory(Obfuscator)
```
- lib/Transforms/LLVMBuild.txt的subdirectories字段添加**Obfuscator**

- tools/bugpoint/CMakeLists.txt内容添加：**Obfuscator**
- tools/bugpoint/LLVMBuild.txt内容添加：**Obfuscator**
- tools/opt/CMakeLists.txt内容添加：**Obfuscator**
- tools/opt/LLVMBuild.txt内容添加：**Obfuscator**
- tools/opt/opt.cpp的main函数添加调用代码：

```C
initializeObfuscator(Registry);
```

然后用CMakeGUI重新生成一下VisualStudio的工程，因为有缓存所以比较快。

# 步骤5 编译
VisualStudio2017重新加载解决方案，只编译opt，大约半个多小时，最终成功编译opt，命令：opt -help查看，发现有这些pass：
```
-GVDiv          - Global variable (i.e., const char*) diversification pass

-boguscf        - inserting bogus control flow

-substitution   - operators substitution

-flattening     - Call graph flattening
```
说明集成成功了。



# 集成到clang
完成上面的步骤，可以把pass集成到opt中，但是如果使用clang的话是没有这些功能的，所以仍需要做些处理。
- llvm/lib/Transforms/IPO/PassManagerBuilder.cpp

```C
#include "llvm/Transforms/Obfuscator/Obfuscator.h"

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
在PassManagerBuilder::populateModulePassManager函数中添加：
```
MPM.add(createFlattening(Flattening));
MPM.add(createStringObfuscation(StringObfuscationPass));
MPM.add(createSubstitution(Substitution));
MPM.add(createBogus(BogusControlFlow));
```
这里设计的是一个开关，当用户使用了-mllvm -GVDiv参数的时候，StringObfuscationPass为true，相当于启用了该pass。

- llvm/lib/Transforms/IPO/LLVMBuild.txt添加Obfuscator
- llvm/lib/Target/X86/LLVMBuild.txt添加Obfuscator

最后记住用CMkaeGUI重新生成一下解决方案，然后VisualStudio只编译clang模块即可。

使用clang时开启该pass：
```
clang.exe -mllvm -GVDiv example.c -o example.exe
```



# 其他
### 编译错误解决
tools/opt/opt.cpp在编译中出现错误：
```
error C2668 llvm::make_unique
```
修改代码：
```
BOS = make_unique<raw_svector_ostream>(Buffer);
```
添加命名空间llvm调用：
```
BOS = llvm::make_unique<raw_svector_ostream>(Buffer);
```