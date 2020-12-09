---
layout:		post
category:	"android"
title:		"android APK签名过程之CERT.SF分析"
tags:		[android,签名]
---

继前面一片《[android APK签名过程之MANIFEST.MF分析](./android-signature-manifest-mf.html)》分析APK签名中的CERT.SF文件


MANIFEST.MF文件内容：

```
Manifest-Version: 1.0
Created-By: 1.0 (Android)

Name: res/drawable-xhdpi/ic_launcher.png
SHA1-Digest: AfPh3OJoypH966MludSW6f1RHg4=

Name: res/menu/main.xml
SHA1-Digest: wXc4zBe0Q2LPi4bMr25yy5JJQig=

Name: AndroidManifest.xml
SHA1-Digest: k3QiLyii25nxkE9q59pXGWI2aTo=

Name: res/drawable-mdpi/ic_launcher.png
SHA1-Digest: RRxOSvpmhVfCwiprVV/wZlaqQpw=

Name: res/drawable-hdpi/ic_launcher.png
SHA1-Digest: Nq8q3HeTluE5JNCBpVvNy3BXtJI=

Name: res/layout/activity_main.xml
SHA1-Digest: qVW+nHovqmEmKpssXKUBidrNDDA=

Name: resources.arsc
SHA1-Digest: luJu2wwHeH7XAJwms2gIq/pco40=

Name: lib/armeabi/libhello-jni.so
SHA1-Digest: uFb6Vfi3T/Rq0dvjgCqW7fKKrzM=

Name: classes.dex
SHA1-Digest: zaipAFvc+AzMSc2nJJG9zIrrfqE=

Name: res/drawable-xxhdpi/ic_launcher.png
SHA1-Digest: GVIfdEOBv4gEny2T1jDhGGsZOBo=
```



CERT.SF文件内容：

```
Signature-Version: 1.0
Created-By: 1.0 (Android)
SHA1-Digest-Manifest: KYIkAR4PbCA4w3MLMr7ViERYEC0=

Name: res/menu/main.xml
SHA1-Digest: 4zwSAYv23t3kqpzCDB/SFXeI+fE=

Name: res/drawable-xhdpi/ic_launcher.png
SHA1-Digest: cIga++hy5wqjHl9IHSfbg8tqCug=

Name: AndroidManifest.xml
SHA1-Digest: FZ/sx6NI+BZkCi/hVlBHDLFbKxM=

Name: res/drawable-mdpi/ic_launcher.png
SHA1-Digest: VY7kOF8E3rn8EUTvQC/DcBEN6kQ=

Name: res/drawable-hdpi/ic_launcher.png
SHA1-Digest: stS7pUucSY0GgAVoESyO3Y7SanU=

Name: res/layout/activity_main.xml
SHA1-Digest: bl4WBWN5ooqlzio7tNRqDWt3oWM=

Name: resources.arsc
SHA1-Digest: tnBvelvdDz0kEBfPf+RjqGfpdn4=

Name: classes.dex
SHA1-Digest: lxB86ol+PFq8rG2IpToRpZi2JcI=

Name: lib/armeabi/libhello-jni.so
SHA1-Digest: +rWr7fBTZjm2JnvJytCJCdmdLso=

Name: res/drawable-xxhdpi/ic_launcher.png
SHA1-Digest: KKqaLh/DVvFp+v1KoaDw7xETvrI=
```

比较发现CERT.SF比MANIFEST.MF多了一个SHA1-Digest-Manifest的值，这个值其实是MANIFEST.MF文件的SHA1并base64编码的值，可以手动验证，也可以从android源码分析。

打开android源码build/tools/signapk/SignApk.java分析，没有下载android源码的可以在线参考： https://github.com/OESF/Embedded-Master-MIPS/blob/370863733b500b7f0ded111f4b800bce990d69a5/build/tools/signapk/SignApk.java

```java
// CERT.SF
            Signature signature = Signature.getInstance("SHA1withRSA");
            signature.initSign(privateKey);
            je = new JarEntry(CERT_SF_NAME);
            je.setTime(timestamp);
            outputJar.putNextEntry(je);
            writeSignatureFile(manifest,
                    new SignatureOutputStream(outputJar, signature));
    /** Write a .SF file with a digest the specified manifest. */
    private static void writeSignatureFile(Manifest manifest, OutputStream out)
            throws IOException, GeneralSecurityException {
        Manifest sf = new Manifest();
        Attributes main = sf.getMainAttributes();
        main.putValue("Signature-Version", "1.0");
        main.putValue("Created-By", "1.0 (Android SignApk)");

        BASE64Encoder base64 = new BASE64Encoder();
        MessageDigest md = MessageDigest.getInstance("SHA1");
        PrintStream print = new PrintStream(
                new DigestOutputStream(new ByteArrayOutputStream(), md),
                true, "UTF-8");

        // Digest of the entire manifest        manifest.write(print);
        print.flush();
        main.putValue("SHA1-Digest-Manifest", base64.encode(md.digest()));

        Map<String, Attributes> entries = manifest.getEntries();
        for (Map.Entry<String, Attributes> entry : entries.entrySet()) {
            // Digest of the manifest stanza for this entry.
            print.print("Name: " + entry.getKey() + "\r\n");
            for (Map.Entry<Object, Object> att : entry.getValue().entrySet()) {
                print.print(att.getKey() + ": " + att.getValue() + "\r\n");
            }
            print.print("\r\n");
            print.flush();

            Attributes sfAttr = new Attributes();
            sfAttr.putValue("SHA1-Digest", base64.encode(md.digest()));
            sf.getEntries().put(entry.getKey(), sfAttr);
        }

        sf.write(out);
    }
```



通过代码可以发现SHA1-Digest-Manifest是MANIFEST.MF文件的SHA1并base64编码的结果。

后面的for循环是对每一项再次SHA1并base64编码，例如：

```
Name: res/menu/main.xml
SHA1-Digest: wXc4zBe0Q2LPi4bMr25yy5JJQig=
```

注意最后是两个"\r\n"，手动验证也很简单，把上面的字符串保存为文件，并查看文件的HASH值是：E33C12018BF6DEDDE4AA9CC20C1FD2157788F9F1，将其保存为二进制文件并对文件进行一次base64编码，可得4zwSAYv23t3kqpzCDB/SFXeI+fE=



**参考：**
取得签名工具加载证书库, 取得签名证书链和私钥：

http://www.oschina.net/code/snippet_1434_1503


从CERT.RSA中提取证书 ： 

[http://www.wangchen.org/2011/01/%E4%BB%8Ecert-rsa%E4%B8%AD%E6%8F%90%E5%8F%96%E8%AF%81%E4%B9%A6/](http://www.wangchen.org/2011/01/从cert-rsa中提取证书/)