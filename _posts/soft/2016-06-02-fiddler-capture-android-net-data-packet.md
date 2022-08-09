---
layout:		post
category:	"soft"
title:		"使用Fiddler对安卓App抓包"

tags:		[fiddler,Android]
---
- Content
{:toc}
# 利用安卓模拟器对App抓包

这里以雷电模拟器为例介绍，时间：2022年8月8日。

- 下载安装：[雷电模拟器](https://www.ldmnq.com/) （版本：4.0.83）
- 下载安装：[Fiddler](https://www.telerik.com/download/fiddler) （版本：v5.0.20211.51073 for .NET 4.6.1）
- 下载安装：[Win32/Win64 OpenSSL Installer for Windows](http://slproweb.com/products/Win32OpenSSL.html)

## 1、配置fiddler

- tools-options

- 点击**HTTPS**，勾选Decrypt HTTPS traffic和Ignore server certificate(unsafe)

  ![](https://img-blog.csdnimg.cn/20200531161239132.png)

- 点击**Actions**，点击**Export Root Certificate to Desktop** ，此时电脑上会生成 一个证书：**FiddlerRoot.cer**

- **Connections**设置，勾选选择项:

  ![](https://img-blog.csdnimg.cn/202005311612393.png)





## 2、设置安卓模拟器

1. 模拟器开启USB调试状态，开启ROOT权限。
2. *模拟器设置 - 网络设置，选择网络桥接模式，IP设置选择DHCP，点击安装驱动，安装成功后重启模拟器。（实测无须设置）*
3. *设置里找到WLAN，点击WLAN修改网络。高级选项，代理：手动，IP填电脑本机的IP，端口填：8888。（实测无须设置）*



## 3、配置证书

1. 使用openssl将Fiddler生成的证书**FiddlerRoot.cer**转换成 .pem 文件格式：

```
openssl x509 -inform DER -in FiddlerRoot.cer -out fiddler.pem
```

2. 解析出证书的hash值（因为安卓证书文件名是根据hash值存的）：

   ```
   openssl x509 -inform PEM -subject_hash_old -in fiddler.pem
   ```

   从输出的内容中找到hash值（一般第一行就是）。

3. 将fiddler.pem文件重命名为：hash值.0文件（例如：e5c3944b.0），并将该文件导入到模拟器的如下目录下并修改文件权限（粗暴点777就行）：

   ```
   /system/etc/security/cacerts
   ```

   注意：如果直接推送进来会失败，提示：Permission denied: Read-only file system

   推荐步骤：

   1. adb shell下执行 mount -o remount,rw /system 
   2. 推送文件到/system/etc/security/cacerts
   3. mount -o remount,ro /system 改回read only

   在模拟器的：设置 - 安全 - 信任的凭据 - 系统中检查是否存在这样的证书：

   ```
   DO_NOT_TRUST
   DO_NOT_TRUST_FiddlerRoot
   ```

   如果有且状态是打开的，说明证书安装成功。这一步并不需要重启模拟器。

   

5. 使用adb命令设置模拟器的代理服务器及端口：

   ```
   adb shell settings put global http_proxy 本机ip:Fiddler端口
   
   // 取消代理设置使用命令：
   adb shell settings put global http_proxy :0
   ```



配置完成以上就可以抓包了，Fiddler底部的抓包模式是否打开，模拟器里的网络行为都可以抓到。如果你怎么配置都不行，甚至出现：ERR_CERT_AUTHORITY_INVALID、Tunnel *to* *443*的问题，只需要完全卸载掉模拟器、Fiddler并重新安装它们即可，主要原因是缓存的问题。




# 参考

- [fiddler抓包+雷电模拟器 完成手机app抓包的配置](https://www.likecs.com/show-205182531.html)