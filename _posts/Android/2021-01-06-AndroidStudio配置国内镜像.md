---
layout:		post
category:	"android"
title:		"AndroidStudio配置国内镜像"
tags:		[android,AndroidStudio,gradle]
---
- Content
{:toc}


使用国内镜像地址加速AndroidStudio项目依赖下载速度：Gradle.zip工具包下载。
修改项目目录下gradle-wrapper.properties，使用腾讯云镜像源

```groovy
https:\//mirrors.cloud.tencent.com/gradle/gradle-x.x.x-all.zip
```

Gradle编译插件及依赖下载
修改项目的build.gradle，使用阿里云镜像源

```groovy
buildscript {
    repositories {
        maven{ url 'https://maven.aliyun.com/repository/google' }
        maven{ url 'https://maven.aliyun.com/repository/public'}
        maven{ url 'https://maven.aliyun.com/repository/gradle-plugin'}
        google()
        jcenter()
    }
    ...
  }

allprojects {
    repositories {
        maven{ url 'https://maven.aliyun.com/repository/google' }
        maven{ url 'https://maven.aliyun.com/repository/public'}
        maven{ url 'https://maven.aliyun.com/repository/gradle-plugin'}
        google()
        jcenter()
    }
}
```

下载gradle网速慢：
项目根目录/gradle/wrapper/gradle-wrapper.properties文件里面修改腾讯gradle镜像直接下载
https://mirrors.cloud.tencent.com/gradle/

下载对应的gradle复制到下图类似的目录
C:\Users\dell.gradle\wrapper\dists\gradle-5.6.2-all\9st6wgf78h16so49nn74lgtbb
