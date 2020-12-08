---
layout:		post
category:	"program"
title:		"【转】HTTPS总结：相关概念证书生成及查看HTTPS漏洞现状及安全开发建议"
tags:		[https]
---



图片显示不出来参考：[HTTPS总结：相关概念证书生成及查看HTTPS漏洞现状及安全开发建议](https://blog.csdn.net/asmcvc/article/details/79096361)



该篇文章为搜罗整理后的，具体资料见文末的参考部分，主要从：HTTPS相关概念、产生背景、自有数字证书的生成、查看服务器证书信息、HTTPS漏洞及现状、安全开发建议等进行汇总整理，方便对HTTPS快速理解。

# 1. 相关概念

**HTTPS**：是一种网络安全传输协议（HTTP over SSL/TLS），利用SSL/TLS来对数据包进行加密，以提供对网络服务器的身份认证，保护交换数据的隐私与完整性。

HTTP是应用层协议，TCP是传输层协议，在应用层和传输层之间，增加了一个安全套接层SSL/TLS：

![image](https://img-blog.csdn.net/20161118084715011)

HTTPS 区别于 HTTP，它多了加密(encryption)，认证(verification)，鉴定(identification)。它的安全源自非对称加密以及第三方的 CA 认证。

**HTTPS的运作**：
\- 客户端生成一个随机数 random-client，传到服务器端（Say Hello)
\- 服务器端生成一个随机数 random-server，和着公钥，一起回馈给客户端（I got it)
\- 客户端收到的东西原封不动，加上 premaster secret（通过 random-client、random-server 经过一定算法生成的东西），再一次送给服务器端，这次传过去的东西会使用公钥加密
\- 服务器端先使用私钥解密，拿到 premaster secret，此时客户端和服务器端都拥有了三个要素：random-client、random-server 和 premaster secret
\- 此时安全通道已经建立，以后的交流都会校检上面的三个要素通过算法算出的 session key

**中间人攻击**：Man-in-the-middle attack，缩写：MITM，是指攻击者与通讯的两端分别创建独立的联系，并交换其所收到的数据，使通讯的两端认为他们正在通过一个私密的连接与对方直接对话，但事实上整个会话都被攻击者完全控制。在中间人攻击中，攻击者可以拦截通讯双方的通话并插入新的内容。

![image](https://img-my.csdn.net/uploads/201801/18/1516253769_5858.png)

HTTPS在理论上是可以抵御MITM，但是由于开发过程中的编码不规范，导致https可能存在MITM攻击风险，攻击者可以解密、篡改https数据。

**CA**：证书颁发机构(Certification Authority)。

如果网站只靠上图运作，可能会被中间人攻击，试想一下，在客户端和服务端中间有一个中间人，两者之间的传输对中间人来说是透明的，那么中间人完全可以获取两端之间的任何数据，然后将数据原封不动的转发给两端，由于中间人也拿到了三要素和公钥，它照样可以解密传输内容，并且还可以篡改内容。

为了确保我们的数据安全，我们还需要一个 CA 数字证书。HTTPS的传输采用的是非对称加密，一组非对称加密密钥包含公钥和私钥，通过公钥加密的内容只有私钥能够解密。上面我们看到，整个传输过程，服务器端是没有透露私钥的。而 CA 数字认证涉及到私钥，整个过程比较复杂，我也没有很深入的了解，后续有详细了解之后再补充下。

CA 认证分为三类：DV ( domain validation)，OV ( organization validation)，EV ( extended validation)，证书申请难度从前往后递增，貌似 EV 这种不仅仅是有钱就可以申请的。

对于一般的小型网站尤其是博客，可以使用自签名证书来构建安全网络，所谓自签名证书，就是自己扮演 CA 机构，自己给自己的服务器颁发证书。

**RA**：注册管理中心，也称中级证书颁发机构或者中间机构。

**PKI**：公钥基础设施，是一组由硬件、软件、参与者、管理政策与流程组成的基础架构，其目的在于创造、管理、分配、使用、存储以及撤销数字证书。公钥存储在数字证书中，标准的数字证书一般由可信数字证书认证机构(CA，根证书颁发机构)签发，此证书将用户的身份跟公钥链接在一起。CA必须保证其签发的每个证书的用户身份是唯一的。

**证书链**：链接关系（证书链）通过注册和发布过程创建，取决于担保级别，链接关系可能由CA的各种软件或在人为监督下完成。PKI的确定链接关系的这一角色称为注册管理中心（RA，也称中级证书颁发机构或者中间机构）。RA确保公钥和个人身份链接，可以防抵赖。如果没有RA，CA的Root 证书遭到破坏或者泄露，由此CA颁发的其他证书就全部失去了安全性，所以现在主流的商业数字证书机构CA一般都是提供三级证书，Root 证书签发中级RA证书，由RA证书签发用户使用的证书。

www.google.com.hk 网站的证书链如下，CA证书机构是 GeoTrust Global CA，RA机构是 Google Internet Authority G2，网站的证书为 *.google.com.hk：

![image](https://img-blog.csdn.net/20161118084849402)

HTTPS通信所用到的证书由CA提供，需要在服务器中进行相应的设置才能生效。另外在我们的客户端设备中，只要访问的HTTPS的网站所用的证书是可信CA根证书签发的，如果这些CA又在浏览器或者操作系统的根信任列表中，就可以直接访问，而如12306.cn网站，它的证书是非可信CA提供的，是自己签发的，所以在用谷歌浏览器打开时，会提示“您的连接不是私密连接”，证书是非可信CA颁发的：

![image](https://img-blog.csdn.net/20161118084919231)

所以在12306.cn的网站首页会提示为了我们的购票顺利，请下载安装它的根证书，操作系统安装后，就不会再有上图的提示了。

# 为何要使用HTTPS

HTTP协议是没有加密的明文传输协议，如果APP采用HTTP传输数据，则会泄露传输内容，可能被中间人劫持，修改传输的内容。如下图所示就是典型的APP HTTP通信被运营商劫持修改，插入广告：

![image](https://img-blog.csdn.net/20161118084655261)

上图是在我的住处，用WiFi打开某APP，页面底部出现了一个拆红包的广告，点开以后是一个安装APP的页面，如果我用联通的4G网络打开，就不会出现这种情况，说明小区运营商劫持了HTTP通信，往APP的通信中加入了自己的推广内容，还有一些低俗的推广广告，这很影响用户体验。一些别有用心的人通过搭建公共WiFi，进行流量劫持、嗅探，可以获得通过HTTP传输的敏感信息。

为了保护用户的信息安全、保护自己的商业利益，减少攻击面，我们需要保障通信信道的安全，采用开发方便的HTTPS是比较好的方式，比用私有协议要好，省时省力。但是如果HTTPS使用不当，就很难起到应有的保护效果。乌云上有很多Android HTTPS使用不当导致产生风险的例子，如 wooyun-2010-079358、wooyun-2010-081966、wooyun-2010-080117，有兴趣的话可以去找找看看。

# 2. 自有数字证书的生成

HTTPS网站所用的证书可向可信CA机构申请，不过这一类基本上都是商业机构，申请证书需要缴费，一般是按年缴费，费用因为CA机构的不同而不同。如果只是APP与后台服务器进行HTTPS通信，可以使用openssl工具生成自签发的数字证书，可以节约费用，不过得妥善保护好证书私钥，不能泄露或者丢失。HTTPS通信所用的数字证书格式为X.509。

步骤如下：

## 1.生成自己的CA根证书

1. 生成CA私钥文件ca.key：

```
openssl genrsa -out ca.key 10241
```

1. 生成X.509证书签名请求文件ca.csr，会让输入一些组织信息等。

```
openssl req -new -key ca_private.key -out ca.csr1
```

1. 生成X.509格式的CA根证书ca_public.crt（公钥证书）：

```
openssl x509 -req -in ca.csr -signkey ca_private.key -out ca_public.crt1
```

## 2.生成服务端证书

1. 先生成服务器私钥文件server_private.key：

```
openssl genrsa -out server_private.key 10241
```

1. 根据服务器私钥生成服务器公钥文件server_public.pem：

```
openssl rsa -in server_private.key -pubout -out server_public.pem1
```

1. 服务器端需要向CA机构申请签名证书，在申请签名证书之前依然是创建自己的证书签名请求文件server.csr：

```
openssl req -new -key server_prviate.key -out server.csr1
```

对于用于HTTPS的CSR，**Common Name必须和网站域名一致，以便之后进行Host Name校验**。

1. 服务器端用server.csr文件向CA申请证书，签名过程需要CA的公钥证书和私钥参与，最终颁发一个带有CA签名的服务器端证书server.crt：

```
openssl x509 -req -CA ca_public.crt -CAkey ca_private.key -CAcreateserial -in server.csr -out server.crt1
```

1. 使用openssl查看证书信息：

```
openssl x509 -in server.crt -text -noout1
```

## 3.生成客户端证书

如果服务器端还想校验客户端的证书，可以按生成服务器端证书的形式来生成客户端证书。

```
# 生成客户端私钥
openssl genrsa -out client.key 1024
# 生成客户端公钥
openssl rsa -in client.key -pubout -out client.pem1234
# client 端
openssl req -new -key client.key -out client.csr
# client 端到 CA 签名
openssl x509 -req -CA ca.crt -CAkey ca.key -CAcreateserial -in client.csr -out client.crt1234
```

## 4.测试证书

1. 用web.py搭建一个简单的服务器测试生成的server.crt，文件webpytest.py为：
2. 在本地运行web服务器程序：

```
python webpytest.py 12341
```

1. 在safari浏览器中输入[https://0.0.0.0:1234](https://0.0.0.0:1234/) ，提示此证书无效（主机名不相符），因为在生成服务器端证书签名请求文件server.csr时，在Common Name中输入的是localhost，与0.0.0.0不符：

![image](https://img-blog.csdn.net/20161118085508389)

1. 在safari浏览器中输入 [https://localhost:1234](https://localhost:1234/) ，不再提示主机名不相符了，而是提示此证书是由未知颁发机构签名的，因为是私有CA签发的证书，私有CA不在浏览器或者操作系统的的根信任列表中：

![image](https://img-blog.csdn.net/20161118085523186)

# 3. 查看服务器证书信息

下面的代码段来自命令行，**openssl** 工具的 **s_client** 命令将查看 Wikipedia 的服务器证书信息。它指定**端口 443，此端口是 HTTPS的默认端口**。此命令将 openssl s_client 的输出发送到 openssl x509，后者将根据 X.509 标准格式化与证书有关的信息。具体而言，此命令会要求相关主题，主题包含服务器名称信息和可识别 CA 的颁发者。

```
$ openssl s_client -connect wikipedia.org:443 | openssl x509 -noout -subject -issuer
subject= /serialNumber=sOrr2rKpMVP70Z6E9BT5reY008SJEdYv/C=US/O=*.wikipedia.org/OU=GT03314600/OU=See www.rapidssl.com/resources/cps (c)11/OU=Domain Control Validated - RapidSSL(R)/CN=*.wikipedia.org
issuer= /C=US/O=GeoTrust, Inc./CN=RapidSSL CA123
```

您会看到证书是由 RapidSSL CA 为与 *.wikipedia.org 匹配的服务器发放的。

# 4. HTTPS漏洞

Android https的开发过程中常见的安全缺陷：客户端不校验SSL证书（包含签名CA是否合法、域名是否匹配、是否自签名证书、证书是否过期）。X509TrustManager 、HostnameVerifier 、 setHostnameVerifier (X509HostnameVerifier hostnameVerifier)
\1. 在自定义实现X509TrustManager时，checkServerTrusted中没有检查证书是否可信，导致通信过程中可能存在中间人攻击，造成敏感数据劫持危害。
\2. 在重写WebViewClient的onReceivedSslError方法时，调用proceed忽略证书验证错误信息继续加载页面，导致通信过程中可能存在中间人攻击，造成敏感数据劫持危害。
\3. 在自定义实现HostnameVerifier时，没有在verify中进行严格证书校验，导致通信过程中可能存在中间人攻击，造成敏感数据劫持危害。
\4. 没有对域名进行校验：实现的自定义HostnameVerifier不校验域名接受任意域名；
\5. 在setHostnameVerifier方法中使用ALLOW_ALL_HOSTNAME_VERIFIER，信任所有Hostname，导致通信过程中可能存在中间人攻击，造成敏感数据劫持危害。
\6. 证书颁发机构(Certification Authority)被攻击导致私钥泄露等。攻击者可通过中间人攻击，盗取账户密码明文、聊天内容、通讯地址、电话号码以及信用卡支付信息等敏感信息，甚至通过中间人劫持将原有信息替换成恶意链接或恶意代码程序，以达到远程控制、恶意扣费等攻击意图。

## 漏洞原理

由于客户端没有校验服务端的证书，因此攻击者就能与通讯的两端分别创建独立的联系，并交换其所收到的数据，使通讯的两端认为他们正在通过一个私密的连接与对方直接对话，但事实上整个会话都被攻击者完全控制。在中间人攻击中，攻击者可以拦截通讯双方的通话并插入新的内容。

## 常见缺陷代码

1. 自实现的不校验证书的X509TrustManager接口的Java代码片段 (其中的checkServerTrusted()方法实现为空，即不检查服务器是否可信):

![image](http://image.3001.net/images/ue/18411426694593.png)

1. 不检查站点域名与站点证书的域名是否匹配的Java代码片段:

![image](http://image.3001.net/images/ue/68841426694597.png)

1. 接受任意域名的Java代码片段：

```
SSLSocketFactory sf;
……
sf.setHostnameVerifier(SSLSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER);123
```

正确的写法是真正实现TrustManger的checkServerTrusted()，对服务器证书域名进行强校验或者真正实现HostnameVerifier的verify()方法。

真正实现TrustManger的checkServerTrusted()代码如下:
![image](https://img-blog.csdn.net/20161118085614536)

其中serverCert是APP中预埋的服务器端公钥证书，如果是以文件形式，其获取为如下形式：

![image](https://img-blog.csdn.net/20161118085624421)

对服务器证书域名进行强校验:

![image](https://img-blog.csdn.net/20161118085631233)

真正实现HostnameVerifier的verify()方法：

![image](https://img-blog.csdn.net/20161118085638583)

另外一种写法证书锁定，直接用预埋的证书来生成TrustManger，过程如下：

![image](https://img-blog.csdn.net/20161118085649755)

参数certStream是证书文件的InputSteam流：

![image](https://img-blog.csdn.net/20161118085702130)

另外可以用以下命令查看服务器证书的公钥：

```
keytool -printcert -rfc -file uwca.crt1
```

直接复制粘贴可以将公钥信息硬编码在代码中：

![image](https://img-blog.csdn.net/20161118085716490)

可以用以下形式获取此公钥对应的X.509证书：

![image](https://img-blog.csdn.net/20161118085729100)

# 5. 现状

在各大漏洞平台上，有大量存在HTTPS证书不校验漏洞，例如国内绝大部分Android APP存在信任所有证书漏洞、亚马逊最新官方Android版存在一处信任所有证书漏洞、Yahoo雅虎在国内访问遭遇SSL中间人攻击、携程旅游网最新Android客户端https未校验证书导致https通信内容完全被捕获。

京东金融Ver 2.8.0由于证书校验有缺陷，导致https中间人攻击，攻击者直接可以获取到会话中敏感数据的加密秘钥

中国移动和包任意消费漏洞，HTTPS证书校验不严格，可被MITM。

为了解此漏洞的业界现状，我们选取了13款使用https通讯的Android app进行分析，这些app全部来自业内大公司。分析结果显示全部的13款app都存在上文描述的敏感信息泄漏漏洞。而泄漏的信息中，密码明文，聊天内容，信用卡号，CVV号随处可见。我们甚至还发现某些app的自动升级过程中使用的https通讯存在同样的问题，**劫持流量后替换升级包的url后，该app会下载恶意的升级包并自动升级，直接造成了远程代码执行。**

国内的app依然大面积的存在这类漏洞。CCS`12报告中指出，google play中17.3%使用https的app存在这类安全漏洞。而据腾讯安全中心审计相关同事的统计，国内app中存在这类安全漏洞的比例，远远高于国外。

# 6. 安全开发建议

出于安全考虑，建议对SSL证书进行强校验（**签名CA是否合法、证书是否是自签名、主机域名是否匹配、证书是否过期**等），详细修复方案请参照Google官方关于SSL的安全建议。

1. 建议自定义实现X509TrustManager时，在checkServerTrusted中对服务器信息进行严格校验。
2. 在重写WebViewClient的onReceivedSslError方法时，避免调用proceed忽略证书验证错误信息继续加载页面。
3. 在自定义实现HostnameVerifier时，在verify中对Hostname进行严格校验。
4. 建议setHostnameVerifier方法中使用STRICT_HOSTNAME_VERIFIER进行严格证书校验，避免使用ALLOW_ALL_HOSTNAME_VERIFIER。
5. 即使正确使用HTTPS并非完全能够防住客户端的Hook分析修改，要想保证通信安全，也需要依靠其他方法，比如重要信息在交给HTTPS传输之前进行加密，另外实现客户端请求的签名处理，保证客户端与服务端通信请求不被伪造。

# 7. 参考

- [通过 HTTPS 和 SSL 确保安全 | Android Developers](https://developer.android.google.cn/training/articles/security-ssl.html)
- [窃听风暴：Android平台https嗅探劫持漏洞 - FreeBuf.COM](http://www.freebuf.com/articles/terminal/26840.html)
- [Android安全开发之安全使用HTTPS](http://blog.csdn.net/xundh/article/details/53212312)
- [Android HTTPS中间人劫持漏洞浅析](http://www.freebuf.com/articles/terminal/61216.html)
- [HTTPS证书生成原理和部署细节](http://blog.csdn.net/hj419460467/article/details/53836699)
- [Android安全开发之Https中间人攻击漏洞](http://netsecurity.51cto.com/art/201610/519544.htm)