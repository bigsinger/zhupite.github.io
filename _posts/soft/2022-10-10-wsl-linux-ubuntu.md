---

layout:        post
category:    "soft"
title:        "Linux - Ubuntu（WSL）的常用命令汇总"

tags:        [linux]
---

- Content
  {:toc}

# WSL

双系统来回切换不方便，目前有一个方式倒是挺方便的，就是在Windows10中安装Ubuntu子系统。

前置条件：

- Windows 10 版本 2004 及更高版本（内部版本 19041 及更高版本）或 Windows 11。可以使用 winver 命令查看系统版本。
- 请启用虚拟机平台 Windows 功能并确保在 BIOS 中启用虚拟化。计算机启动的时候 F2 进入BIOS 设置，启用VT。
- 控制面版，查看方式可选择大图标，在点击程序与功能—>**启用或关闭Windows功能**，勾选 「Hyper-V」和 「适用于 Windows 的 Linux 子系统」。如果没有Hyper-V这一项，请查看文章win10家庭中文版安装`Hyper-V`。（🚨 注意：有些软件可能会关闭这些选项，例如模拟器类软件）

```bash
# 管理员身份运行开启功能
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# 查看可安装版本
wsl --list --online

# Ubuntu-20.04
wsl --install -d Ubuntu-22.04

# 查看本地安装的版本
wsl -l -v

# 卸载指定版本
wsl --unregister Ubuntu-22.04

# 进入默认的环境
wsl

# 进入指定版本的环境
wsl -d Ubuntu-22.04

# 切换到WSL2，转换需要几分钟时间，然后重启计算机就可以了。
wsl --set-version <linux fronm above> 2

# 设置WSL2为默认版本
wsl --set-default-version 2
wsl --set-default-version Ubuntu 2
```

# 首次配置

## 国内镜像

配置国内镜像是为了后面升级安装速度快一些，节省时间，强烈建议，速度可以快一个数量级。

```bash
UBU_VER=$(lsb_release -cs)
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak
sudo bash -c "cat > /etc/apt/sources.list" <<EOF
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ $UBU_VER main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ $UBU_VER-updates main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ $UBU_VER-backports main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ $UBU_VER-security main restricted universe multiverse
EOF
sudo apt update
```

## 基础安装

参考：[Get started with Linux using WSL](https://learn.microsoft.com/en-us/windows/wsl/tutorials/linux)

```bash
# 更新
sudo apt-get update
sudo apt-get upgrade


# 安装repo
mkdir ~/bin
PATH=~/bin:$PATH
curl https://storage.googleapis.com/git-repo-downloads/repo > ~/bin/repo
chmod a+x ~/bin/repo

# 安装git curl
sudo apt install curl
sudo apt install git
sudo apt install zip
sudo apt install make
sudo apt install g++
sudo apt-get install zlib1g-dev
# sudo apt install gedit

# git配置
git config --global user.name sing
git config --global user.email sing@163.com
git config --global http.sslverify false
git config --global https.sslverify false

# 修改默认python版本为python3
alias python=python3
```

- 扩展子系统的虚拟硬盘空间：[扩展 WSL 2 虚拟硬盘的大小 | Microsoft Learn](https://learn.microsoft.com/zh-cn/windows/wsl/vhd-size)

## 默认root密码修改

root的默认密码在未设置的情况下该如何修改呢？ 执行如下命令：

```bash
sudo passwd root
```

## 安装pyenv

为了后面快速切换Python，可以使用pyenv来管理。

```bash
curl https://pyenv.run | bash
```

执行完后，终端会提示你添加这些到 `~/.bashrc`：

```bash
export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
```

复制它们，粘贴进 ~/.bashrc，然后运行：

```bash
source ~/.bashrc
```

如果需要安装Python2环境，首先安装Python2的依赖包：

```bash
sudo apt update
sudo apt install -y \
  build-essential \
  libssl-dev \
  zlib1g-dev \
  libbz2-dev \
  libreadline-dev \
  libsqlite3-dev \
  libffi-dev \
  liblzma-dev \
  tk-dev \
  libncursesw5-dev \
  libgdbm-dev \
  libnss3-dev \
  libsqlite3-dev \
  wget curl llvm \
  xz-utils
```

然后再安装：

```bash
pyenv install 2.7.18
pyenv global 2.7.18
```

切换Python版本后，需要使用如下命令刷新生效：

```bash
pyenv rehash
```



## 安装clang编译工具链

```bash
sudo apt update
sudo apt install clang

# 查看是否安装成功以及clang版本
clang --version
```

## 安装Java环境

- 参考：[Could not find tools.jar. Please check that /usr/java/jre1.8.0_361 contains a valid JDK installation](https://www.nxcto.com/2023/03/03/could-not-find-tools-jar-please-check-that-usr-java-jre1-8-0_361-contains-a-valid-jdk-installation/)

```bash
# 更新
sudo apt-get update
sudo apt-get upgrade

# 输入命令：java，系统会自动列出可以安装的版本，然后选择一个安装，例如：
sudo apt-get install openjdk-8-jdk

# 如果自动安装没有正确设置JAVA_HOME环境变量的话，可以参考「设置环境变量」手动修改。
```

## 设置环境变量

```bash
# 修改环境变量（可以参考vim的用法）：
vim ~/.bashrc
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
source ~/.bashrc
```

## 编译项目

```bash
# 注意不要直接在Windows系统上解压项目源码，特别是有文件链接的时候，Windows上解压会使这一链接属性失效。应该在子系统里面使用unzip命令：
unzip xxx.zip

然后进入项目代码目录下进行编译，例如：
./gradlew assemble
```

## SSH

```bash
# Step 1: 安装 OpenSSH Server
sudo apt update && sudo apt install -y openssh-server

# Step 2: 修改配置，启用密码登录
sudo sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication yes/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?PermitRootLogin .*/PermitRootLogin yes/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?UsePAM .*/UsePAM yes/' /etc/ssh/sshd_config
```

启动服务：

```bash
sudo service ssh start
```

测试SSH连接：

```bash
ssh localhost
```

# 文件操作

## vim

- 按下insert键开始编辑
- 按下ESC键退出编辑
- 按下:wq退出并保存
- 按Ctrl+Z退出vi

## gedit

Windows上的子系统是命令行方式，暂不支持gui工具。

# Windows共享目录

参考：[玩转WSL 2(三)——Windows和Linux之间的文件操作_wsl2访问windows本地文件](https://blog.csdn.net/Caoyang_He/article/details/107898883)

## 子系统访问Windows文件

子系统里面使用Windows上的文件，路径形式为 /mnt/盘符/路径，例如Windows上的文件：E:/test/123.txt，则使用时为：/mnt/e/test/123.txt

## Windows访问子系统文件

**WSL1**

Linux子系统的目录是在Windows这个目录下：

```
C:\Users\用户名\AppData\Local\Packages\CanonicalGroupLimited.UbuntuonWindows_79rhkp1fndgsc\LocalState\rootfs

WIN + R打开：
%USERPROFILE%\AppData\Local\Packages\CanonicalGroupLimited.UbuntuonWindows_79rhkp1fndgsc\LocalState\rootfs
```

当需求修改文件的时候，可以直接在 Windows 下面操作，非常的方便，就不用使用反人类的 vim了。

上面 CanonicalGroupLimited.UbuntuonWindows_79rhkp1fndgsc 的名称可以通过命令查询出来：

```bash
Get-AppxPackage -Name "*<distro>*" | Select PackageFamilyName
例如：
Get-AppxPackage -Name "*Ubuntu*" | Select PackageFamilyName
```

**WSL2（推荐）**

`%USERPROFILE%\AppData\Local\Packages\CanonicalGroupLimited.UbuntuonWindows_79rhkp1fndgsc\LocalState` 命令下只有 `ext4.vhdx` 文件，不能按照WSL1的方式访问了，但是可以通过网络路径来访问：

```
\\wsl$\Ubuntu\home
```

也是可以直接操作文件的，比较方便。

# 其他常用命令

- 上传文件： `rz`
- 查看文件内容：`cat filename`
- 编辑文件：`vi filename` 按 `a` 进入编辑模式，`esc` 退出编辑模式  `:wq` 保存并退出。`:q!` 退出不保存。
- 删除文件夹：`rm -rf dirname`
- 删除文件：`rm filename`
- 设置变量：`export XX_DIR = /xx`，撤销设置：`unset XX_DIR` 列出所有的shell赋予程序的环境变量：`export -p`

## rz Windows通过xshell远程传输文件到Linux

ubuntu下安装：

```bash
sudo apt-get install lrzsz
```

然后xshell下输入名 **rz** 回车后会打开文件选择对话框 并传输文件到ubuntu中。

`sudo apt-get install rar unrar p7zip p7zip-rar p7zip-full cabextract `
基本上大部分都可以解压

## **ZIP**压缩解压缩

```bash
#压缩文件
zip [压缩文件名][原文件]

#压缩目录
zip -r  [压缩文件名][原文件]

#解压：
unzip [压缩文件名]
```

我们可以使用下列的命令压缩一个目录：

```bash
zip -r archive_name.zip directory_to_compress
```

解压一个zip文档：

```bash
unzip archive_name.zip
```

## **TAR**打包解包

如何打包一个目录：

```bash
tar -cvf archive_name.tar directory_to_compress
```

如何解包：

```bash
tar -xvf archive_name.tar.gz
```

上面这个解包命令将会将文档解开在当前目录下面。当然，你也可以用这个命令来捏住解包的路径：

```bash
tar -xvf archive_name.tar -C /tmp/extract_here/
```

**TAR.GZ**

使用下面这种格式去压缩一个目录：

```bash
tar -zcvf archive_name.tar.gz directory_to_compress
```

解压缩：

```bash
tar -zxvf archive_name.tar.gz
```

上面这个解包命令将会将文档解开在当前目录下面。当然，你也可以用这个命令来捏住解包的路径：

```bash
tar -zxvf archive_name.tar.gz -C /tmp/extract_here/
```

**TAR.BZ2**

这个就是你如何使用tar.bz2进行压缩。

```bash
tar -jcvf archive_name.tar.bz2 directory_to_compress
```

上面这个解包命令将会将文档解开在当前目录下面。当然，你也可以用这个命令来捏住解包的路径：

```bash
tar -jxvf archive_name.tar.bz2 -C /tmp/extract_here/
```

# 注意事项及避坑指南

## git clone源码

```bash
git clone https://android.googlesource.com/toolchain/llvm
cd llvm
git checkout release_33
```

如果项目源码是基于Linux环境的，那就一定要在Linux环境下clone，一定不要先在Windows下clone好后再在Linux环境下编译。因为在Windows下clone后文件内容会发生变化（换行符），文件属性也会发生变化，导致后期编译各种问题。

## g++

如果是使用WSL进行跨平台编程的话，曾经在Ubuntu22.04系统下出现过g++无法正常编译出产物但也不报错的情况，起初表现是VisualStudio2022编译后提示成功但是就是没有out文件，经过GPT提示可能是g++的问题，于是直接用g++编译一个简单的cpp测试，果然发现了问题。后面无论如何修复都不能解决，最终是换了Ubuntu24.04的系统就好了。

## cmake

有些项目需要Python2的环境，但是cmake对Python的搜索逻辑有点奇怪，有时候通过pyenv切换了Python版本也是无效，则可以在cmake的时候强制指定Python路径，添加如下选项：

```bash
-DPYTHON_EXECUTABLE=$(pyenv which python)
```

例如：

```bash
cmake ../llvm \
  -G "Unix Makefiles" \
  -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_INSTALL_PREFIX=../install \
  -DLLVM_TARGETS_TO_BUILD="X86" \
  -DBUILD_SHARED_LIBS=ON \
  -DLLVM_BUILD_LLVM_DYLIB=ON \
  -DLLVM_LINK_LLVM_DYLIB=ON \
  -DLLVM_ENABLE_RTTI=ON \
  -DLLVM_ENABLE_TERMINFO=OFF \
  -DPYTHON_EXECUTABLE=$(pyenv which python)
```

编译：

```bash
make -j$(nproc)
```

`-j$(nproc)` 表示开启多线程，自动使用你 CPU 的所有核数，加快编译速度。

编译成功后安装： 

```bash
make install
```

就会生成完整的头文件了，还有可执行文件和lib库文件，就可以供三方项目引用了。
