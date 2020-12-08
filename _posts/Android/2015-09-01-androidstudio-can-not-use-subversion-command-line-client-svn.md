---
layout:		post
category:	"android"
title:		"AndroidStudio遇到SVN问题的解决方案：Can't use Subversion command line client: svn"
tags:		[android,AndroidStudio]
---

1、

**Can't use Subversion command line client: svn Probably the path to Subversion executable is wrong. Fix it.**

**Errors found while svn working copies detection. Fix it.**

如图：

![img]()![img](https://img-blog.csdn.net/20150901165415819?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

**解决办法**是重新安装一下svn，勾选“command line client tools”（这个默认是不勾选的）。

![img]()

![img](https://img-blog.csdn.net/20150901165444180?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

![img](https://img-blog.csdn.net/20150901165454959?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

![img]()

安装成功后重启AndroidStudio问题就不在了。

2、**Subversion command line client version is too old (1.9.0)**

如图：

![img]()![img](https://img-blog.csdn.net/20150901165506731?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

**解决：**

目前（编写此文时）为止1.9版本是svn的最新版本（如果你现在看到的版本不一致，可能时间久了又出新版本了，主要看解决思路），不可能是版本太老的问题，只可能是最新的问题，所以重新下载1.8版本的svn重新安装即可解决。

参考： http://stackoverflow.com/questions/32062819/subversion-command-line-client-version-is-too-old-error-in-android-studio

svn历史版本：http://sourceforge.net/projects/tortoisesvn/files/

下载1.8.12版本的重新安装。