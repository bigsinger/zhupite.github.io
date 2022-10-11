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
