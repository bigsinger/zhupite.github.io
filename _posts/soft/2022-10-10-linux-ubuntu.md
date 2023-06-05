---
layout:		post
category:	"soft"
title:		"Linux - Ubunt（WSL）的常用命令收集汇总方便查询"

tags:		[语音合成]
---
- Content
{:toc}
双系统来回切换不方便，目前有一个方式倒是挺方便的，就是在Windows10中安装Ubuntu子系统：

```bash
wsl --list --online 			# 查看可安装版本
wsl --install -d Ubuntu-20.04
```

安装需要的条件：

- Windows 10 版本 2004 及更高版本（内部版本 19041 及更高版本）或 Windows 11。可以使用 winver 命令查看系统版本。
- 请启用虚拟机平台 Windows 功能并确保在 BIOS 中启用虚拟化。计算机启动的时候 F2 进入BIOS 设置，启用VT。
- 控制面版，查看方式可选择大图标，在点击程序与功能—>启用或关闭Windows功能，勾选 「Hyper-V」和 「适用于 Windows 的 Linux 子系统」。如果没有Hyper-V这一项，请查看文章win10家庭中文版安装Hyper-V。

更新到wsl2，管理员身份打开powershell输入以下命令（cmd不行）：

```bash
wsl -l -v # 查看版本
wsl --set-version <linux fronm above> 2		# 转换需要几分钟时间，然后重启计算机就可以了。
# wsl --set-default-version 2				# 设置WSL2为默认版本
# wsl --set-version Ubuntu 2
```



# 首次配置

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



## 安装clang编译工具链

```bash
sudo apt update
sudo apt install clang

# 查看是否安装成功以及clang版本
clang --version
```



# 文件操作

## vim

- 按下insert键开始编辑
- 按下ESC键退出编辑
- 按下:wq退出并保存
- 按Ctrl+Z退出vi

## gedit

Windows上的子系统是命令行方式，暂不支持gui工具。



## Windows共享目录

参考：[玩转WSL 2(三)——Windows和Linux之间的文件操作_wsl2访问windows本地文件](https://blog.csdn.net/Caoyang_He/article/details/107898883)

### 子系统访问Windows文件

子系统里面使用Windows上的文件，路径形式为 /mnt/盘符/路径，例如Windows上的文件：E:/test/123.txt，则使用时为：/mnt/e/test/123.txt



### Windows访问子系统文件

#### WSL1

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



#### WSL2

%USERPROFILE%\AppData\Local\Packages\CanonicalGroupLimited.UbuntuonWindows_79rhkp1fndgsc\LocalState 命令下只有 ext4.vhdx 文件，不能按照WSL1的方式访问了，但是可以通过网络路径来访问：

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

