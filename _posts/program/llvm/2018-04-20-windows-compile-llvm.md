---

layout:        post
category:    "llvm"
title:        "Windows下CMakeGUI生成LLVM的VisualStudio项目并编译"
tags:        [llvm]

---



# LLVM6.0

1. 下载以下三个源码包：
- LLVM
- Clang
- compiler-rt

下载页面：[LLVM Download Page](http://releases.llvm.org/download.html)

2. 将llvm source code解压。
3. 将cfe（clang source code）解压，文件夹重命名为clang，然后放置到llvm/tools目录下。
4. 将compiler-rt source code解压，文件夹重命名为compiler-rt，然后放置到llvm/projects目录下。
5. 在llvm目录下创建文件夹build，并且在llvm/build目录下创建install文件夹。
6. 使用CMake生成vs工程。

点Configure，选择**Visual Studio 15 2017 Win64**

Optional toolset to use (argument to -T)

```
host=x64
```

如果不出现这个选择对话框，请选择菜单File - Delete Cache，然后重新配置。

![](https://img-blog.csdn.net/20170926205552382)

经过几分钟后，会有飘红出现，不管它，再点一次，不再飘红。然后再点Generate，成功生成sln。

VisualStudio2017打开，我靠，尼玛 **501** 个项目，够喝一壶的了。第一次编译很长，耗时5个多小时，机器环境：i5-4590 3.3GHz CPU 8G内存Win764位。



** 参考：**

- !!Windows编译LLVM vs2013 cmake-gui http://www.360doc.com/content/18/0116/16/9200790_722421475.shtml
- [WINDOWS\+CMAKE\+VS2017编译OLLVM并整合到VS2017 NDK \- CSDN博客](https://blog.csdn.net/rrrfff/article/details/78105905)
- [Getting Started with the LLVM System using Microsoft Visual Studio — LLVM 7 documentation](https://llvm.org/docs/GettingStartedVS.html)



# LLVM3.8.1

LLVM 3.8.1 是基于 C++11 编写的，前提是你显式启用 `-std=c++11`

```bash
cmake ../llvm-3.8.1 \
 -DCMAKE_BUILD_TYPE=Release \
 -DLLVM_BUILD_LLVM_DYLIB=ON \
 -DLLVM_LINK_LLVM_DYLIB=ON \
 -DBUILD_SHARED_LIBS=OFF \
 -DCMAKE_INSTALL_PREFIX=../llvm-3.8.1-install \
 -DLLVM_TARGETS_TO_BUILD="X86" \
 -DCMAKE_CXX_STANDARD=11 \
 -DCMAKE_CXX_STANDARD_REQUIRED=ON \
 -DPYTHON_EXECUTABLE=$(pyenv which python)
```



```bash
make -j$(nproc)
make install
```



编译错误有一处，需要手动修改下LLVM源码，源码文件 `/mnt/e/linux/llvm/llvm-3.8.1/include/llvm/IR/ValueMap.h` ：

```c
bool hasMD() const { return MDMap; }  // 错误写法
```

正确写法：

```c
bool hasMD() const { return MDMap != nullptr; }
```



# LLVM3.3安卓定制版

环境：Windows11+WSL（Ubuntu24.04）



该版本为安卓源码的定制版吧，非官方LLVM的源码。

地址：[release_33 - toolchain/llvm - Git at Google](https://android.googlesource.com/toolchain/llvm/+/release_33)



注意一定要在Linux环境下clone，在Windows下clone后文件内容会发生变化（换行符），文件属性也会发生变化，导致后期编译各种问题。

```bash
git clone https://android.googlesource.com/toolchain/llvm
cd llvm
git checkout release_33
```

因为这个版本很老，需要使用Python2编译，所以需要通过pyenv安装并切换下Python2环境

```bash
cmake ../llvm \
  -DCMAKE_BUILD_TYPE=Release \
  -DLLVM_BUILD_LLVM_DYLIB=ON \
  -DLLVM_LINK_LLVM_DYLIB=ON \
  -DBUILD_SHARED_LIBS=OFF \
  -DCMAKE_INSTALL_PREFIX=../install \
  -DLLVM_TARGETS_TO_BUILD="X86" \
  -DCMAKE_CXX_STANDARD=11 \
  -DCMAKE_CXX_STANDARD_REQUIRED=ON \
  -DLLVM_ENABLE_RTTI=ON \
  -DLLVM_ENABLE_EH=ON \
  -DPYTHON_EXECUTABLE=$(pyenv which python)
```

成功后就可以编译了：

```bash
make -j$(nproc)
```

最后执行 ：

```bash
make install
```

就会生成完整的头文件了，还有可执行文件和lib库文件，就可以供三方项目引用了。



老的LLVM源码默认编译出的文件是有很多.a文件，并没有一个单独的庞大的libLLVM.so文件，这样在三方项目引用链接的时候就会比较麻烦，需要链接多个.a文件。为了避免这种麻烦，我们使用命令把这些.a文件合并为一个so文件，方便后面使用。

```bash
g++ -fPIC -shared -o libLLVM.so \
  -Wl,--whole-archive \
    libLLVMCore.a \
    libLLVMSupport.a \
    libLLVMAnalysis.a \
    libLLVMTransformUtils.a \
    libLLVMScalarOpts.a \
    libLLVMInstCombine.a \
    libLLVMCodeGen.a \
    libLLVMSelectionDAG.a \
    libLLVMTarget.a \
    libLLVMX86Desc.a \
    libLLVMX86Info.a \
    libLLVMX86Utils.a \
    libLLVMX86AsmParser.a \
    libLLVMX86AsmPrinter.a \
    libLLVMX86Disassembler.a \
    libLLVMAsmParser.a \
    libLLVMAsmPrinter.a \
    libLLVMBitReader.a \
    libLLVMBitWriter.a \
    libLLVMIRReader.a \
    libLLVMOption.a \
    libLLVMMC.a \
    libLLVMMCParser.a \
    libLLVMMCDisassembler.a \
    libLLVMMCJIT.a \
    libLLVMExecutionEngine.a \
    libLLVMJIT.a \
    libLLVMLinker.a \
    libLLVMRuntimeDyld.a \
    libLLVMObject.a \
    libLLVMArchive.a \
    libLLVMInstrumentation.a \
    libLLVMInterpreter.a \
    libLLVMipo.a \
    libLLVMipa.a \
    libLLVMVectorize.a \
    libLLVMTableGen.a \
    libLLVMObjCARCOpts.a \
  -Wl,--no-whole-archive \
  -lz -ldl -lpthread
```

需要注意的是，这里并没有使用`*.a`进行合并操作，是因为有顺序要求，否则最后在三方项目中链接libLLVM.so文件时会出现一些链接错误。



假如我们的项目为test，后面需要使用上述步骤产出的头文件和lib库文件。



编译错误：找不到：`llvm::sys::fs::F_Binary`

参考：[LLVM: llvm::sys::fs Namespace Reference](https://www.few.vu.nl/~lsc300/LLVM/doxygen/namespacellvm_1_1sys_1_1fs.html) 得知：

`enum OpenFlags { F_None = 0, F_Excl = 1, F_Append = 2, F_Binary = 4 }`

可以替换为：`std::ios::binary`（也是4）



链接错误：如果test链接出错是`string`不一致，需要将test项目的C编译器和C++编译器设置为默认的，一定不能加：

```bash
g++  -D_GLIBCXX_USE_CXX11_ABI=0 
```



链接错误：

```
undefined reference to typeinfo for llvm::FunctionPass
undefined reference to typeinfo for llvm::cl::GenericOptionValue
undefined reference to typeinfo for llvm::cl::Option
```

在test项目里修改属性：C/C++语言 - 启用运行时类型信息，修改为：`否 (-fno-rtti)`







参考：

- https://github.com/ParkHanbum/dex2ir

- https://github.com/zyq8709/DexHunter

- [x86-android-5.0/art at eb1029956682072bb7404192a80214189f0dc73b · mirek190/x86-android-5.0 · GitHub](https://github.com/mirek190/x86-android-5.0/tree/eb1029956682072bb7404192a80214189f0dc73b/art)