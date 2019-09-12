---
layout:		post
category:	"program"
title:		"VMware中安装Centos及相关配置"
tags:		[VMware,Centos,Linux]
---
- Content
{:toc}

## VMware中安装Centos系统
VMware中安装Centos系统可以参考：[第一节windows系统安装虚拟机VMware软件](https://www.cnblogs.com/adc8868/p/5490846.html)

可以在安装的时候直接勾选“GNOME Desktop”，这样安装完就是图形操作系统，只需要少量修改即可。

VMware设置：选择菜单“查看”-“自动调整大小”选择“自动适应客户机”。

## 命令行模式下安装图形界面
如果在安装的时候选择的是“最小化安装”，则安装的系统是命令行模式（root模式），需要安装一下图形界面，参考：[【CentOS 7】如何安装图形界面](https://jingyan.baidu.com/article/19020a0a5b1b88529d28423b.html)

主要步骤：
- 开启网络服务（也是解决无法上网的办法）：输入**vi /etc/sysconfig/network-scripts/ifcfg-ens33**，把**ONBOOT**修改为**yes**，保存退出，然后输入**service network restart**，重启网络服务，这个时候就yum服务就能用了。
- 安装X窗口系统：**yum -y groupinstall “X Window System”**
- 安装GNOME桌面：**yum -y groupinstall GNOME Desktop**
- **startx**进入图形界面。
- 配置开机默认进入图形界面：**systemctl set-default graphical.target**，记得reboot。
- 配置开机默认进入root模式：**systemctl set-default multi-user.target**，记得reboot。

## 安装VMwareTools
安装好系统后第一要务是安装VMwareTools，把**鼠标拖放**、**剪贴板粘贴复制**、**共享文件夹**都开启起来，后面会方便很多。

如果是在安装Centos系统时直接勾选了图形界面（例如GNOME Desktop），待系统安装好后**鼠标拖放**和**剪贴板粘贴复制**直接生效，仅仅需要配置下共享文件夹即可。

如果在安装Centos系统时仅仅安装了root模式，则后期无论怎么安装配置VMwareTools鼠标拖放和剪贴板粘贴复制均无法生效（可能有哪些设置没配好），这点有点坑，所以建议直接安装图形界面。

安装步骤：
- 点击虚拟机的虚拟机(M)->重现安装VMware Tools（T）
- 此时系统会弹出装载虚拟CD驱动器 点击打开文件
- 打开文件后可将 文件夹里的文件全部复制到自己的某个文件夹中
- 打开终端进入目录，解压：**tar -xvf VMwareTools-xxx.tar.gz**
- 进入解压的目录，安装：**sudo ./vmware-install.pl**，一路yes即可。
- 安装成功后可以设置下“共享文件夹”

### 设置共享文件夹
需要在安装好VMwareTools后才能设置共享文件夹。

右键选择虚拟机系统-管理-进入虚拟机设置-选项-共享文件夹，选择总是启用，然后添加一个Windows的目录作为共享文件夹即可，这样Centos系统就可以和Windows系统互相传文件了，比较方便。


## 配置中文
选择**System Tools** - **Settings**，选择**Region & Language**，在语言一栏选择：**汉语（中国）**，在格式一栏选择：**中国（汉语）**，在输入源一栏添加：**汉语（Intelligent Pinyin）**。

如果找不到，需要联网让系统自动缓存下载，可以先进行其他系统设置，回头再来设置。

### 中文输入法：
```
yum install ibus-libpinyin
```

以上设置均需要重启生效。

## 安装alien
```
yum install alien -y
```
提示找不到alien的话，可以参考这个文章安装：[How to Convert From RPM to DEB and DEB to RPM Package Using Alien](https://www.tecmint.com/convert-from-rpm-to-deb-and-deb-to-rpm-package-using-alien/)
```
yum install epel-release
rpm --import http://li.nux.ro/download/nux/RPM-GPG-KEY-nux.ro
yum update && yum install alien
```

alien的版本可以到这里查看：[Index of /download/nux/dextop/el7/x86\_64](https://li.nux.ro/download/nux/dextop/el7/x86_64/)

直接下载alien的rpm包的话可以这样安装：
```
cd /usr/local/src/
wget http://linux4you.in/alien-8.81-2.noarch.rpm
rpm -UVH alien-8.81-2.noarch.rpm(若该命令无法安装，请尝试：rpm -ivh alien-8.81-2.noarch.rpm)
```

如果被墙，也可以使用阿里云的镜像下载：[CentOS 7 x86\_64 安装alien](https://blog.csdn.net/qq_42259578/article/details/87885461?utm_source=app)

## 软件安装
### 安装Firefox浏览器
```
yum -y install firefox
```

### 安装Chrome浏览器
可以在Firefox浏览器中进入到谷歌浏览器官网下载，官网会自动识别当前系统为Linux并提示下载Linux版本，选择rpm包下载。

可以对下载的rpm包直接安装，但是安装的时候提示有缺失的依赖项，可以安装一下：
```
yum install liberation-fonts
yum install libXss*  -y
```
最后安装(还有一个依赖项可以通过添加--nodeps选项来安装)：
```
sudo rpm -ivh /home/xxx/google-chrome-stable-xxx.rpm --nodeps
```

一些问题：
- Chrome浏览器无法启动，解决办法：在usr/share/applications中找到Chrome的快捷方式，然后邮件在其properties中command中增加**--no-sandbox**即可，参考：[解决ubuntu系统root用户下Chrome无法启动问题 ](https://www.cnblogs.com/hbsygfz/p/8409517.html)


### 安装搜狗输入法
注意不要卸载ibus，如果没有注意同时卸载掉的依赖包的话，会导致系统黑屏且无法进入图形界面。

参考：[CentOS7\.4安装sogou输入法](https://blog.csdn.net/longzhizhui926/article/details/83188118)

- 由于sougou输入法的Linux安装包只有deb的，没有rpm包，所以需要借助alien进行转换，需要事先安装下alien。
- 安装依赖软件：yum install qtwebkit fcitx-libs -y
- 下载：[搜狗输入法 for linux](https://pinyin.sogou.com/linux/?r=pinyin)
- deb包转换成rpm包：alien -r sogoupinyin_xxx.deb
- 安装：rpm -ivh sogoupinyin_xxx.rpm
- 提示与filesystem包冲突，可以使用–force命令安装：rpm -ivh --force sogoupinyin_xxx.rpm


## 常用命令
#### 下载
wget http://xxx.tar.xz

#### 解压
```
xz -d xxx.tar.xz
tar -xvf xxx.tar
```

#### 安装
```
yum -y install xxxname
yum localinstall xxx.rpm
```

#### 卸载
```
rpm -qa |grep -i xxxname
rpm -e xxx
```

#### deb转rpm
```
alien -r xxx.deb
```
