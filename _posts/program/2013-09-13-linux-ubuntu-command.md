---
layout:		post
category:	"program"
title:		"Linux-Ubuntu常用命令收集"
tags:		[Linux, Ubuntu]
---



- 上传文件： rz
- 查看文件内容：cat filename
- 编辑文件：vi filename 按a进入编辑模式，esc退出编辑模式 :wq 保存并退出。:q! 退出不保存。
- 删除文件夹：rm -rf dirname
- 删除文件：rm filename





## rz Windows通过xshell远程传输文件到Linux

ubuntu下安装：

```bash
sudo apt-get install lrzsz
```

然后xshell下输入名 **rz** 回车后会打开文件选择对话框 并传输文件到ubuntu中。





sudo apt-get install rar unrar p7zip p7zip-rar p7zip-full cabextract 
基本上大部分都可以解压





## **ZIP**压缩解压缩

```
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

