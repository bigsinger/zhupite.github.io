---
layout:		post
category:	"program"
title:		"交叉编译binutils-strings-for-Android"
tags:		[]
---


交叉编译binutils



因为要在安卓系统中使用功能齐全的`strings`工具，需要编译之，该工具是在 `binutils`中的，所以就需要编译`binutils`。官网：[Binutils - GNU Project - Free Software Foundation](https://www.gnu.org/software/binutils/)，源码下载：[Index of /pub/binutils/releases](https://sourceware.org/pub/binutils/releases/)



PC系统上可以直接下载使用编译好的二进制版本。Linux 版本：[Linaro Releases](https://releases.linaro.org/components/toolchain/binaries/7.5-2019.12/)，Windows下在NDK的目录下能找到编译好的： `ndk-bundle\toolchains\arm-linux-androideabi-4.9\prebuilt\windows-x86_64\bin`



但是想要在安卓系统中运行必须进行交叉编译，后面分别介绍了本地编译及交叉编译的方法，最终使用NDK的方式最为简单快捷。



# 本地编译

`binutils`源码编译参考：[Build and Install binutils from source](https://iq.opengenus.org/build-binutils-from-source/)

```bash
git clone git://sourceware.org/git/binutils-gdb.git
cd binutils-gdb
./configure			# 不要用 CC=gcc ./configure 后面编译会有问题
make
```

使用`WSL`来编译，子系统是`Ubuntu`，可能会出现一些环境缺失的问题，按照如下方式安装或更新：

```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install gcc
sudo apt-get install build-essential
sudo apt-get install bison
sudo apt install texinfo libgmp10 libgmp-dev libmpfr-dev -y
```

不要尝试安装`yum`这种方法，行不通。



# 交叉编译

例如编译生成适配设备：Android_x86_x64，配置如下：

```bash
./configure --target=x86_64-linux-android --prefix=/home/sing/binutils_bin/  --disable-nls --disable-werror     --disable-gdb --disable-libdecnumber --disable-readline --disable-sim
make
```

**换架构编译要重新来一遍**，使用 `make distclean` 或 `rm ./config.cache`均没有作用，参考：[error compiling binutils second time](https://clfs-support.cross-lfs.narkive.com/XHHtrRH7/error-compiling-binutils-second-time)、[linux - CXXFLAGS has changed since the previous run when building gdb](https://stackoverflow.com/questions/72181396/cxxflags-has-changed-since-the-previous-run-when-building-gdb)



`target`可以取的值（不完全列举）：

```
aarch64-linux-android
armv7a-linux-androideabi
i686-linux-android
x86_64-linux-android
```



不过很遗憾，即使指定了`target=x86_64-linux-android`，编译出来的二进制文件仍然不能运行在 Android_x86_x64 设备上。后来在搜索交叉编译相关材料时了解到可以使用`NDK`来交叉编译出适合安卓设备的二进制文件，便有了后面的方法，非常简单。



## 使用NDK交叉编译

参考：[Android NDK交叉编译器三种使用方法](https://zwyuan.github.io/2015/12/22/three-ways-to-use-android-ndk-cross-compiler/)，文章借鉴了 Andriod 的官方指南：[独立工具链（已弃用）  |  Android NDK  |  Android Developers](https://developer.android.com/ndk/guides/standalone_toolchain?hl=zh-cn)

**警告：**如果您使用的是 r19 或更高版本，请参阅将 [NDK 与其他构建系统配合使用文档](https://developer.android.com/ndk/guides/other_build_systems?hl=zh-cn)，了解有关如何将 NDK 工具链与任意构建系统结合使用的说明。对于 r19 之前的版本，NDK 的默认工具链都是独立工具链，因此无需执行此流程。



我们参考 [NDK 与其他构建系统配合使用文档](https://developer.android.com/ndk/guides/other_build_systems?hl=zh-cn)

### 1、下载配置NDK

因为需要在 WSL 的Ubuntu子系统里操作，所以需要下载Linux版本的NDK：[NDK 下载  |  Android NDK  |  Android Developers](https://developer.android.com/ndk/downloads?hl=zh-cn)，这里下载`Linux 64 位 (x86)`：[android-ndk-r25b-linux.zip](https://dl.google.com/android/repository/android-ndk-r25b-linux.zip?hl=zh-cn)，然后把文件复制到 WSL 的目录下，并在WSL系统中使用`zip`命令解压缩，例如目录：`/home/sing/android-ndk-r25b`。最后设置环境变量：`export NDK=/home/sing/android-ndk-r25b`



### 2、编译安装GMP和MPFR

按照谷歌官网文章操作，在`configure`的时候会出错：

```bash
configure: error: Building GDB requires GMP 4.2+, and MPFR 3.1.0+.
```

解决方案参考：[configure: error: Building GCC requires GMP 4.2+, MPFR 3.1.0+ and MPC 0.8.0+](https://blog.csdn.net/qq_36393978/article/details/118678521)，实际操作安装的时候需要使用最新版本的，否则在编译的时候会出错。



**安装GMP**：**GMP**官网下载地址: https://ftp.gnu.org/gnu/gmp/，这里选择的版本为`gmp 6.2.1`

```bash
wget ftp://ftp.gnu.org/gnu/gmp/gmp-6.2.1.tar.bz2
tar -xvf gmp-6.2.1.tar.bz2
cd gmp-6.2.1
./configure --prefix=/usr/local/gmp-6.2.1
make
sudo make install
```



**安装MPFR**：**MPFR**下载地址: https://ftp.gnu.org/gnu/mpfr/，这里选择的版本为`mpfr 4.2.0`

```bash
wget https://ftp.gnu.org/gnu/mpfr/mpfr-4.2.0.tar.gz
tar -xvf mpfr-4.2.0.tar.gz
cd mpfr-4.2.0/
./configure --prefix=/usr/local/mpfr-4.2.0 --with-gmp=/usr/local/gmp-6.2.1
make
sudo make install
```



需要注意，编译相关的工具链的环境变量要用系统默认的，如果设置过，请按照如下方式恢复后再编译上述两个工具。

```bash
unset AR
unset CC
unset AS
unset CXX
unset LD
unset RANLIB
unset STRIP
```



### 3、配置环境变量

```bash
# Check out the source.
git clone git://sourceware.org/git/binutils-gdb.git
cd binutils-gdb

# Only choose one of these, depending on your build machine...
export TOOLCHAIN=$NDK/toolchains/llvm/prebuilt/darwin-x86_64
export TOOLCHAIN=$NDK/toolchains/llvm/prebuilt/linux-x86_64

# Only choose one of these, depending on your device...
export TARGET=aarch64-linux-android
export TARGET=armv7a-linux-androideabi
export TARGET=i686-linux-android
export TARGET=x86_64-linux-android

# Set this to your minSdkVersion.
export API=21

# Configure and build.
export AR=$TOOLCHAIN/bin/llvm-ar
export CC=$TOOLCHAIN/bin/$TARGET$API-clang
export AS=$CC
export CXX=$TOOLCHAIN/bin/$TARGET$API-clang++
export LD=$TOOLCHAIN/bin/ld
export RANLIB=$TOOLCHAIN/bin/llvm-ranlib
export STRIP=$TOOLCHAIN/bin/llvm-strip
```

`target`的配置参数参考如下：

| ABI         | 三元组                   |
| :---------- | :----------------------- |
| armeabi-v7a | armv7a-linux-androideabi |
| arm64-v8a   | aarch64-linux-android    |
| x86         | i686-linux-android       |
| x86-64      | x86_64-linux-android     |



### 4、配置参数并编译

参考[Cross Compile Binutils | Writing an OS in Rust](https://os.phil-opp.com/cross-compile-binutils/) 更多编译参数提高编译速度：

```bash
../binutils-2.X/configure --target=x86_64-elf --prefix="$HOME/opt/cross"  --disable-nls --disable-werror     --disable-gdb --disable-libdecnumber --disable-readline --disable-sim
```

- The `target` argument specifies the the x86_64 target architecture.
- The `prefix` argument selects the installation directory, you can change it if you like. But be careful that you do not overwrite your system’s binutils.
- The `disable-nls` flag disables native language support (so you’ll get the same english error messages). It also reduces build dependencies.
- The `disable-werror` turns all warnings into errors.
- The last line disables features we don’t need to reduce compile time.



最后的配置：

```bash
./configure --host $TARGET --prefix=/usr/local/binutils --with-gmp=/usr/local/gmp-6.2.1 --with-mpfr=/usr/local/mpfr-4.2.0 --disable-gas --disable-gprofng --disable-gnulib --disable-gdb --disable-libdecnumber --disable-readline --disable-sim --disable-nls

make
sudo make install
```

注意：`--disable-gas --disable-gprofng --disable-gnulib`是因为在编译的时候会出错，临时屏蔽掉，不过也不影响`strings`的生成。最终生成的二进制文件在目录`/usr/local/binutils/bin`下，注意在WSL系统中不能运行，需要复制到安卓系统目录下运行。

```bash
126|star2qltechn:/ $ /data/local/tmp/./strings --help
Usage: /data/local/tmp/./strings [option(s)] [file(s)]
 Display printable strings in [file(s)] (stdin by default)
 The options are:
  -a - --all                Scan the entire file, not just the data section [default]
  -d --data                 Only scan the data sections in the file
  -f --print-file-name      Print the name of the file before each string
  -n <number>               Locate & print any sequence of at least <number>
    --bytes=<number>         displayable characters.  (The default is 4).
  -t --radix={o,d,x}        Print the location of the string in base 8, 10 or 16
  -w --include-all-whitespace Include all whitespace as valid string characters
  -o                        An alias for --radix=o
  -T --target=<BFDNAME>     Specify the binary file format
  -e --encoding={s,S,b,l,B,L} Select character size and endianness:
                            s = 7-bit, S = 8-bit, {b,l} = 16-bit, {B,L} = 32-bit
  --unicode={default|show|invalid|hex|escape|highlight}
  -U {d|s|i|x|e|h}          Specify how to treat UTF-8 encoded unicode characters
  -s --output-separator=<string> String used to separate strings in output.
  @<file>                   Read options from <file>
  -h --help                 Display this information
  -v -V --version           Print the program's version number
/data/local/tmp/./strings: supported targets: elf64-x86-64 elf32-i386 elf32-iamcu elf32-x86-64 pei-i386 pe-x86-64 pei-x86-64 elf64-little elf64-big elf32-little elf32-big srec symbolsrec verilog tekhex binary ihex plugin
Report bugs to <https://sourceware.org/bugzilla/>
```

