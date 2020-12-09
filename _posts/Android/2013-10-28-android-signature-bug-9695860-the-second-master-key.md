---
layout:		post
category:	"android"
title:		"Android第二个签名漏洞#9695860(The Second Master Key)的手动构造利用"
tags:		[android,签名]
---



图片显示不全参考：[Android第二个签名漏洞#9695860(The Second Master Key)的手动构造利用](https://blog.csdn.net/asmcvc/article/details/13295359)



**参考：**

《Android第二个签名漏洞#9695860揭秘》：[http://www.colordancer.net/blog/2013/08/26/android-%E7%AC%AC%E4%BA%8C%E4%B8%AA%E7%AD%BE%E5%90%8D%E6%BC%8F%E6%B4%9E-9695860-%E6%8F%AD%E7%A7%98/](http://www.colordancer.net/blog/2013/08/26/android-第二个签名漏洞-9695860-揭秘/)

《zip文件格式说明》：http://blog.sina.com.cn/s/blog_4c3591bd0100zzm6.html



这个漏洞的原理是java代码在读取“Central directory file header”结构的“Extra field length”字段（java代码视为有符号short，C代码视为无符号short）时，如果大小超过0x7FFF则认为是负数，代码逻辑将负数一律按零处理。

只要构造如图的apk即可绕过签名：

![img](https://img-blog.csdn.net/20131028160232281?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

![img]()

设定原apk为test.apk，下面讲述下**手动构造方法**：

反编译test.apk，这里测试研究只插桩打印了一句log，代码仍旧使用《[手动打造apk利用ANDROID-8219321漏洞(Master Key)绕过android签名校验](http://blog.csdn.net/asmcvc/article/details/10582407)》文中的代码。

反编译test.apk，修改代码后回编译，并测试验证修改的代码可以正常输出log。

解压缩test.apk，将原classes.dex改名为classeorigin.dex，把修改后的classes.dex复制到解压缩的目录。

然后打包成zip，现在文件结构如图：

![img](https://img-blog.csdn.net/20131028160504546?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

![img]()

这里有个技巧，把原classes.dex改名为classeorigin.dex是为了让其在zip包中的顺序在classes.dex之前。

查找HEX：50 4B 01 02，也就是“Central directory file header”的开头，找到含有classeorigin.dex的上一个结构，如图是AndroidManifest.xml结构。0013是文件名长度，因为AndroidManifest.xml是19个字符。后面的两个字节的字段就是“Extra field length”，

这里有意设置为0x8000，使得java代码读取时刚好认为是负数，使其按0处理。这样就意味着后面需要紧跟着一个“Central directory file header”结构，如上图是一个dex（原dex）。

![img](https://img-blog.csdn.net/20131028160530250?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

![img]()

签名校验中需要验证classes.dex而不是classeorigin.dex，因此需要把文件名还原回去，多出的5个字节刚好填在“Central directory file header”结构的“File comment length”字段，最后的注释内容随便填写。

从包含AndroidManifest.xml的“Central directory file header”结构末尾算起，加上0X8000大小（中间包含了原dex的结构）后是修改后的dex结构：

![img](https://img-blog.csdn.net/20131028160547484?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

![img]()

在后面的结构是其他文件的结构，都是正常的，无需修改。这样在C代码中，识别的压缩文件结构是这样：

……AndroidManifest.xml->修改后的dex->resources.arsc……

但是为了绕过签名校验，要让java代码中识别的压缩结构是：

……AndroidManifest.xml->原dex->resources.arsc……

因此还要把原dex结构的“Extra field length”字段跳过修改的dex结构，使得下一个“Central directory file header”结构是resources.arsc的结构。 这里的“Extra field length”不能再超过0x7FFF，这也是为什么一开始要将原classes.dex改名为classeorigin.dex，使得多出几个字节来。 上上图中的原dex结构的“Extra field length”字段是0x7FFB。

最后一步修改zip文件尾：

![img](https://img-blog.csdn.net/20131028160609921?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

修改文件个数，分别将15改为14（因为隐藏了一个文件），“Central directory file header”所有目录的大小也要修改（只要拿尾部标记的地址减去“Central directory file header”结构的起始地址即可）。

最后的apk文件结构如图：

![img](https://img-blog.csdn.net/20131028160627812?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

图中的classes.dex是修改后的dex。

测试安装并运行apk，可以绕过签名并输出log：

![img](https://img-blog.csdn.net/20131028160639703?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

说明运行的是修改后的dex。

对比前一个“MasterKey”漏洞，这个漏洞更加隐蔽，因为不会出现两个同名的classes.dex。