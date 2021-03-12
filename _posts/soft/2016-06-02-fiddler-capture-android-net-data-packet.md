---
layout:		post
category:	"soft"
title:		"使用Fiddler对安卓App抓包"
tags:		[fiddler,Android]
---
- Content
{:toc}
# 利用安卓模拟器对App抓包

这里以夜神模拟器为例。

- 下载安装：[夜神安卓模拟器](https://www.yeshen.com/)
- 下载安装：[Fiddler](https://www.telerik.com/download/fiddler)

## **配置fiddler**

- tools-options

- 点击**HTTPS**，勾选Decrypt HTTPS traffic和Ignore server certificate(unsafe)

  ![](https://img-blog.csdnimg.cn/20200531161239132.png)

- 点击**Actions**，点击Export Root Certificate to Desktop ，此时电脑上会生成 一个证书：**FiddlerRoot.cer**

- **Connections**设置，勾选选择项:

  ![](https://img-blog.csdnimg.cn/202005311612393.png)



## 设置夜神模拟器

- 设置里找到WLAN，点击WLAN修改网络
- 高级选项，代理：手动，IP填电脑本机的IP，端口填：8888
- 打开模拟器中的浏览器，访问地址:代理端口号/（例如：http://10.192.73.50:8888），点击FiddlerRoot下载证书。
- 证书下载完成后安装，需要设置个名称，随便填写下，需要设置手机pin吗或者密码，随便设置一个。



配置完成以上就可以抓包了，记得把fiddler底部的抓包模式打开，就是要显示：Capturing状态。



# 参考

- [Fiddler+夜神模拟器进行APP抓包](https://blog.csdn.net/21aspnet/article/details/103977908)
- 