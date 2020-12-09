---
layout:		post
category:	"android"
title:		"android APK签名汇总整理"
tags:		[android,签名]
---

**一、签名作用**

1.发送者的身份认证：由于开发商可能通过使用相同的 Package Name 来混淆替换已经安装的程序，以此保证签名不同的包不被替换。
2.保证信息传输的完整性：签名对于包中的每个文件进行处理，以此确保包中内容不被替换。
3.防止交易中的抵赖发生， Market 对软件的要求。

**原理：不同的程序公钥不同，实质是公钥不同即认为是不同的程序。**



**二、签名过程**

参见《[android APK签名过程之MANIFEST.MF分析](./android-signature-manifest-mf.html)》、《[android APK签名过程之CERT.SF分析](./android-signature-cert-sf.html)》、《[android APK签名过程之CERT.RSA分析](./android-signature-cert-rsa.html)》、《[手动给android APK签名](./sign-apk-manually.html)》，另外CERT.SF文件的生成跟私钥没有半毛钱关系，整个签名过程也跟私钥没有关系，只有RSA用公钥加密并且含有证书信息。



**三、签名验证过程**

以程序升级为例，因为是相同的程序，那么公钥信息一定是相同的，则可以升级。

CERT.SF和MANIFEST.MF文件只是用来验证各个文件的完整性的，完全可以手动打造。



**四、如何利用签名防破解**

1.程序自校验，可以把原本的公钥信息（或者.RSA文件）存放到某一文件处，运行时计算当前的公钥信息（或者.RSA文件）与存放的信息是否一致。

2.联网校验，运行时的公钥信息和服务器端存储的公钥信息进行比对。

