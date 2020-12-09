---
layout:		post
category:	"android"
title:		"android APK签名过程之MANIFEST.MF分析"
tags:		[android,签名]
---

图片显示不全参考：[android APK签名过程之MANIFEST.MF分析](https://blog.csdn.net/asmcvc/article/details/9311827)





**一、手工验证**

用winrar打开签名过的apk包，发现多了一个META-INF文件夹：

![img](https://img-blog.csdn.net/20130712151554031?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

解压缩后打开 META-INF目录，有三个文件：MANIFEST.MF，CERT.SF，CERT.RSA

![img](https://img-blog.csdn.net/20130712151600765?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)
![img]()

![img]()

本文只讲解MANIFEST.MF的生成，用记事本打开MANIFEST.MF文件：

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



以文件res/menu/main.xml做验证，用HashTab查看该文件的SHA-1值是C17738CC17B44362CF8B86CCAF6E72CB92494228

![img]()

![img](https://img-blog.csdn.net/20130712151607062?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

复制该二进制串到WINHEX中：

![img](https://img-blog.csdn.net/20130712151612703?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

使用“Base64编码解码工具”对此二进制文件计算base64编码：

![img](https://img-blog.csdn.net/20130712151618609?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

![img]()

打开输出文件中的base64编码为：

wXc4zBe0Q2LPi4bMr25yy5JJQig=

是和MANIFEST.MF文件中res/menu/main.xml对应的SHA1-Digest值是一样的。

也就是说MANIFEST.MF中保存了所有其他文件的SHA-1并base64编码后的值。

**二、android源码验证**

打开android源码build/tools/signapk/SignApk.java分析，没有下载android源码的可以在线参考： https://github.com/OESF/Embedded-Master-MIPS/blob/370863733b500b7f0ded111f4b800bce990d69a5/build/tools/signapk/SignApk.java



```java
// MANIFEST.MF
Manifest manifest = addDigestsToManifest(inputJar);
je = new JarEntry(JarFile.MANIFEST_NAME);
je.setTime(timestamp);
outputJar.putNextEntry(je);
manifest.write(outputJar);
```

　　

```java
    /** Add the SHA1 of every file to the manifest, creating it if necessary. */
    private static Manifest addDigestsToManifest(JarFile jar)
            throws IOException, GeneralSecurityException {
        Manifest input = jar.getManifest();
        Manifest output = new Manifest();
        Attributes main = output.getMainAttributes();
        if (input != null) {
            main.putAll(input.getMainAttributes());
        } else {
            main.putValue("Manifest-Version", "1.0");
            main.putValue("Created-By", "1.0 (Android SignApk)");
        }

        BASE64Encoder base64 = new BASE64Encoder();
        MessageDigest md = MessageDigest.getInstance("SHA1");
        byte[] buffer = new byte[4096];
        int num;

        // We sort the input entries by name, and add them to the
        // output manifest in sorted order.  We expect that the output
        // map will be deterministic.
        TreeMap<String, JarEntry> byName = new TreeMap<String, JarEntry>();

        for (Enumeration<JarEntry> e = jar.entries(); e.hasMoreElements(); ) {
            JarEntry entry = e.nextElement();
            byName.put(entry.getName(), entry);
        }

        for (JarEntry entry: byName.values()) {
            String name = entry.getName();
            if (!entry.isDirectory() && !name.equals(JarFile.MANIFEST_NAME) &&
                !name.equals(CERT_SF_NAME) && !name.equals(CERT_RSA_NAME) &&
                (stripPattern == null ||
                 !stripPattern.matcher(name).matches())) {
                InputStream data = jar.getInputStream(entry);
                while ((num = data.read(buffer)) > 0) {
                    md.update(buffer, 0, num);
                }

                Attributes attr = null;
                if (input != null) attr = input.getAttributes(name);
                attr = attr != null ? new Attributes(attr) : new Attributes();
                attr.putValue("SHA1-Digest", base64.encode(md.digest()));
                output.getEntries().put(name, attr);
            }
        }

        return output;
    }
```



也可以看出 MANIFEST.MF中保存了所有其他文件的SHA-1并base64编码后的值。