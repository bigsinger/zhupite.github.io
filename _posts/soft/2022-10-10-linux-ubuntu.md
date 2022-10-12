---
layout:		post
category:	"soft"
title:		"Linux - Ubuntu的使用汇总方便查询"

tags:		[语音合成]
---
- Content
{:toc}
双系统来回切换不方便，目前有一个方式倒是挺方便的，就是在Windows10中安装Ubuntu子系统：

```bash
wsl --install -d Ubuntu
```

安装需要的条件：

- Windows 10 版本 2004 及更高版本（内部版本 19041 及更高版本）或 Windows 11。可以使用 winver 命令查看系统版本。
- 请启用虚拟机平台 Windows 功能并确保在 BIOS 中启用虚拟化。计算机启动的时候 F2 进入BIOS 设置，启用VT。
- 控制面版，查看方式可选择大图标，在点击程序与功能—>启用或关闭Windows功能，勾选 「Hyper-V」和 「适用于 Windows 的 Linux 子系统」。如果没有Hyper-V这一项，请查看文章win10家庭中文版安装Hyper-V。

更新到wsl2，管理员身份打开powershell输入以下命令（cmd不行）：

```bash
wsl -l -v # 查看版本
wsl --set-version <linux fronm above> 2		# 转换需要几分钟时间，然后重启计算机就可以了。
# wsl --set-version Ubuntu 2
```



# 首次配置

```bash
# 安装repo
mkdir ~/bin
PATH=~/bin:$PATH
curl https://storage.googleapis.com/git-repo-downloads/repo > ~/bin/repo
chmod a+x ~/bin/repo

# 安装git curl
sudo apt install curl
sudo apt install git
# sudo apt install gedit

# git配置
git config --global user.name sing
git config --global user.email sing@163.com
git config --global http.sslverify false
git config --global https.sslverify false

# 修改默认python版本为python3
alias python=python3

sudo apt-get update
sudo apt-get upgrade
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

使用Windows上的文件，路径形式为 /mnt/盘符/路径，例如Windows上的文件：E:/test/123.txt，则使用时为：/mnt/e/test/123.txt

Linux子系统的目录是在Windows的这个目录下：

```
C:\Users\用户名\AppData\Local\Packages\CanonicalGroupLimited.UbuntuonWindows_79rhkp1fndgsc\LocalState\rootfs

WIN + R打开：
%USERPROFILE%\AppData\Local\Packages\CanonicalGroupLimited.UbuntuonWindows_79rhkp1fndgsc\LocalState\rootfs
```

当需求修改文件的时候，可以直接在Windows下面操作，非常的方便，就不用使用反人类的vim了。
