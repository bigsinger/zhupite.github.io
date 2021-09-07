---
layout:		post
category:	"android"
title:		"解决Android Studio弹出unable to access android sdk add-on list的解决方案"

tags:		[android]
---
- Content
{:toc}
**关键词**：安卓,Android,AndroidStudio



# unable to access android sdk add-on list

进入网站[http://ping.chinaz.com/](https://links.jianshu.com/go?to=http%3A%2F%2Fping.chinaz.com%2F)，进行 [dl.google.com](https://links.jianshu.com/go?to=http%3A%2F%2Fdl.google.com) ping检查，选择大陆响应时间最短的IP地址。进入cmd对此IP地址进行ping测试，如果可以将（IP地址 dl.google.com）加入hosts文件中
 hosts文件地址：**C:\WINDOWS\System32\drivers\etc\hosts**

```
180.163.150.161 	dl.google.com
```



# Could not install Gradle distribution from

找到 gradle-wrapper.properties文件

```
#Thu Jun 24 17:20:33 CST 2021
distributionBase=GRADLE_USER_HOME
distributionUrl=https\://services.gradle.org/distributions/gradle-6.7.1-bin.zip
distributionPath=wrapper/dists
zipStorePath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
```

替换distributionUrl为国内镜像，例如「腾讯gradle镜像」地址：https://mirrors.cloud.tencent.com/gradle/

```
#Thu Jun 24 17:20:33 CST 2021
distributionBase=GRADLE_USER_HOME
distributionUrl=https\://mirrors.cloud.tencent.com/gradle/gradle-6.7.1-bin.zip
distributionPath=wrapper/dists
zipStorePath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
```

