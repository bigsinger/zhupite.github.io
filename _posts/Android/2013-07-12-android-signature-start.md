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



## V1签名

基于JAR签名，来自JDK(jarsigner), 对zip压缩包的每个文件进行验证, 签名后还能对压缩包修改(移动/重新压缩文件)

对V1签名的apk/jar解压,在META-INF存放签名文件(MANIFEST.MF, CERT.SF, CERT.RSA), 

其中MANIFEST.MF文件保存所有文件的SHA1指纹(除了META-INF文件), 由此可知: V1签名是对压缩包中单个文件签名验证



## V2签名

​	从Android 7.0开始, 谷歌增加新签名方案 V2 Scheme (APK Signature)，但Android 7.0以下版本, 只能用旧签名方案 V1 scheme (JAR signing)。



来自Google(apksigner), **对zip压缩包的整个文件验证**, 签名后不能修改压缩包(包括zipalign),

  对V2签名的apk解压,没有发现签名文件,重新压缩后V2签名就失效, 由此可知: V2签名是对整个APK签名验证。参考谷歌官方网站：https://source.android.google.cn/security/apksigning/v2?hl=zh-cn

V2签名优点很明显：

- 签名更安全(不能修改压缩包)
- 签名验证时间更短(不需要解压验证),因而安装速度加快

 

注意: apksigner工具默认同时使用V1和V2签名,以兼容Android 7.0以下版本

## V3签名

当签名失效之后，我们只能被迫换签名，此时因为签名校验无法通过，就会导致旧用户无法覆盖安装。这些历史用户唯一的选择，就是卸载后重新安装。

 

Android 9.0 引入V3 签名方案，**使用密钥转轮为签名更新做准备**！Android 9 支持 APK 密钥轮替，这使应用能够在 APK 更新过程中更改其签名密钥。为了实现轮替，APK 必须指示新旧签名密钥之间的信任级别。为了支持密钥轮替，我们将 APK 签名方案从 v2 更新为 v3，以允许使用新旧密钥。v3 在 APK 签名分块中添加了有关受支持的 SDK 版本和 proof-of-rotation 结构的信息。

 

参考谷歌官方网站：https://source.android.google.cn/security/apksigning/v3?hl=zh-cn





## 签名工具

### jarsigner（只支持V1签名）

是 jdk 提供的对 jar 文件的签名工具。

使用命令：

```bash
jarsigner [options] jar-file alias
```

 对 apk 文件 签名 。其中 jar-file 对应 apk 文件路径，alias 对应 签名文件中的别名。 options 常用参数如下：

-keystore 指定使用的签名文件的路径。

-storepass 指定使用签名文件的密码。

-keypass 指定使用 alias 对应的密码。可以不使用，执行时手动输入。

-signedjar 指定签名后的 apk 的路径。

-verbose 输出详细的签名过程日志。

由于没有指定被签名 apk 文件的路径和使用的签名文件别名的参数，因此需要将这两个参数放在命令的最后。

\# 示例，如需添加 -verbose，请放在test.apk之前

jarsigner -keystore keystore -storepass password -signedjar signed.apk test.apk keyalias.

2.2. 校验

使用命令 jarsigner -verify [options] jar-file [alias...]

-verbose 输出详细的签名信息。

-certs 输出每个文件使用的签名证书。

\# 示例

```bash
jarsigner -verify -verbose -certs signed.apk
```

复制代码用上述命令只能检查 apk 中每个文件的签名情况，并不能获知使用的签名文件具体信息。建议使用 apksigner 命令或 keytool 命令。

```bash
keytool -printcert -jarfile test.apk
```

 

进入JDK/bin, 输入命令：

```bash
jarsigner -keystore 密钥库名 xxx.apk 密钥别名
```

  

  从JDK7开始, jarsigner默认算法是SHA256, 但Android 4.2以下不支持该算法,

  所以需要修改算法, 添加参数 -digestalg SHA1 -sigalg SHA1withRSA

  jarsigner -keystore 密钥库名 -digestalg SHA1 -sigalg SHA1withRSA xxx.apk 密钥别名

  

  参数:

​    -digestalg 摘要算法

​    -sigalg   签名算法

  

  例如:

​    用JDK7及以上jarsigner签名,不支持Android 4.2 以下

​    jarsigner -keystore debug.keystore MyApp.apk androiddebugkey

​    

​    用JDK7及以上jarsigner签名,兼容Android 4.2 以下      

​    jarsigner -keystore debug.keystore -digestalg SHA1 -sigalg SHA1withRSA MyApp.apk androiddebugkey

​        

### apksigner--默认同时使用V1和V2签名

google 官方提供的 apk 文件签名工具。支持 V1 和 V2 签名规则。参加谷歌官方文档：https://developer.android.com/studio/command-line/apksigner

 

V1是对 apk 中每个文件进行签名校验。使用 V1 规则的 apk 在解压之后二次打包压缩后可以安装。

V2是在 V1 的基础上，对 apk 文件进行校验。因此，使用 V2 规则的 apk 在解压之后二次打包压缩后无法安装。因此，在签名时，只能选择 V1 或 V1+V2,不能只选择 V2 。



进入Android SDK/build-tools/SDK版本, 输入命令：

```
apksigner sign --ks 密钥库名 --ks-key-alias 密钥别名 xxx.apk
```

 

若密钥库中有多个密钥对,则必须指定密钥别名

```
apksigner sign --ks 密钥库名 --ks-key-alias 密钥别名 xxx.apk
```

  

  禁用V2签名

```
apksigner sign --v2-signing-enabled false --ks 密钥库名 xxx.apk
```

​          

  参数:

​    --ks-key-alias    密钥别名,若密钥库有一个密钥对,则可省略,反之必选

​    --v1-signing-enabled 是否开启V1签名,默认开启

​    --v2-signing-enabled 是否开启V2签名,默认开启

  

例如:

在debug.keystore密钥库只有一个密钥对

```
apksigner sign --ks debug.keystore MyApp.apk
```

​    

在debug.keystore密钥库中有多个密钥对,所以必须指定密钥别名

```
apksigner sign --ks debug.keystore --ks-key-alias androiddebugkey MyApp.apk
```



### signapk

SignApk.jar是一个已包含在Android平台源码包中的工具。使用方法：

```
java -jar signapk.jar testkey.x509.pem  testkey.pk8　old.apk new.apk
```

执行后new.apk即为签名后的文件。



## 签名验证

#### jarsigner

使用命令 jarsigner -verify [options] jar-file [alias...]

-verbose 输出详细的签名信息。

-certs 输出每个文件使用的签名证书。

\# 示例

```
jarsigner -verify -verbose -certs signed.apk
```

复制代码用上述命令只能检查 apk 中每个文件的签名情况，并不能获知使用的签名文件具体信息。建议使用 apksigner 命令或 keytool 命令。

```
keytool -printcert -jarfile test.apk
```

 

#### keytool--只支持V1签名校验

进入JDK/bin, 输入命令：

```
keytool -printcert -jarfile MyApp.apk (显示签名证书信息)
```

  参数:

​    -printcert      打印证书内容

​    -jarfile <filename> 已签名的jar文件 或apk文件

 

#### apksigner--支持V1和V2签名校验

进入Android SDK/build-tools/SDK版本, 输入命令：

```
apksigner verify -v --print-certs xxx.apk
```

  

  参数:

​    -v, --verbose 显示详情(显示是否使用V1和V2签名)

​    --print-certs 显示签名证书信息

  

  例如:

```
apksigner verify -v MyApp.apk
```

  

```
Verifies
Verified using v1 scheme (JAR signing): true
Verified using v2 scheme (APK Signature Scheme v2): true
Number of signers: 1
```


