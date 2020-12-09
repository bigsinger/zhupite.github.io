---
layout:		post
category:	"android"
title:		"手动给android APK签名"
tags:		[android,签名]
---

**一、下载openssl-for-windows**

http://code.google.com/p/openssl-for-windows/

例如下载：

http://openssl-for-windows.googlecode.com/files/openssl-0.9.8k_WIN32.zip

下载完毕后直接解压缩，cmd命令进入bin目录下：

```
openssl genrsa -3 -out testkey.pem 2048
```

成功生成：testkey.pem

```
openssl req -new -x509 -key testkey.pem -out testkey.x509.pem -days 10000
```

输出错误信息：

Unable to load config info from c:/openssl/ssl/openssl.cnf

只要把openssl目录下的openssl.cnf文件复制到 c:/openssl/ssl/目录下即可（目录不存在则手动创建之）。

然后再次输入上述命令后输出：

Loading 'screen' into random state - done
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
\-----
Country Name (2 letter code) [AU]:cn
State or Province Name (full name) [Some-State]:zhejiang
Locality Name (eg, city) []:hangzhou
Organization Name (eg, company) [Internet Widgits Pty Ltd]:sing
Organizational Unit Name (eg, section) []:sing
Common Name (eg, YOUR name) []:netease
Email Address []:test@163.com

成功生成：testkey.x509.pem

```
openssl pkcs8 -in testkey.pem -topk8 -outform DER -out testkey.pk8 -nocrypt
```

成功生成：testkey.pk8

**二、签名**

```
signapk.jar testkey.x509.pem  testkey.pk8 HelloJni_test.apk HelloJni_test_signed.apk
```

**三、创建批处理命令对APK文件自动化签名**

**四、验证**

```java
import sun.security.pkcs.PKCS7;
import java.io.FileInputStream;
import java.io.IOException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;

public class Test {
     public static void main(String[] args) throws CertificateException, IOException {
             if(args.length < 1){
                 System.out.println("Error arguments");
                 System.exit(-1);
             }
            FileInputStream fis = new FileInputStream(args[0]);
            PKCS7 pkcs7 = new PKCS7(fis);
            X509Certificate publicKey = pkcs7.getCertificates()[0];

            System.out.println("issuer1:" + publicKey.getIssuerDN());
            System.out.println("subject2:" + publicKey.getSubjectDN());
            System.out.println(publicKey.getPublicKey());
        }
}
```

输出：

```
issuer1:EMAILADDRESS=test@163.com, CN=netease, OU=sing, O=sing, L=hangzhou, ST=zhejiang, C=cn
subject2:EMAILADDRESS=test@163.com, CN=netease, OU=sing, O=sing, L=hangzhou, ST=zhejiang, C=cn
Sun RSA public key, 2048 bits
  modulus: 22676173355286459097573334286481325549679742508291213299264044486977814024339605340628711274677072768829606315047576874911034554527084043177679494350712443522287175454777833436168772665418404933643096476891010605269397100182350607109602567424649311950932263840379746712271144600813750815453035262110486680532806609381313030573833526182249935950105614529180848998274172532233764292631298041869124308804566439799309159573665297279480681980653336799995434022140192702337503587221467398087020249337183520598982287860366619939017957775007220964826029614540987113512464831360539897307371766206991936881303261221737921332207
  public exponent: 3
```

　　

注意：

如果代码出现找不到sun.security.pkcs.PKCS7时，解决方法是：右键工程-Build Path-Config Build Path

![img](https://img-blog.csdn.net/20130712153512156?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

点Edit：

![img](https://img-blog.csdn.net/20130712153517328?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

![img]()

点Add，选择Accessible，添加规则：**

![img]()

![img](https://img-blog.csdn.net/20130712153523578?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)