---
layout:		post
category:	"android"
title:		"解决AndroidStudio-Gradle卡住的问题"

tags:		[android]
---
- Content
{:toc}
**关键词**：安卓,Android,AndroidStudio,gradle



主要原因还是墙的问题，设置国内镜像即可。参考：[阿里云Maven仓库服务](https://developer.aliyun.com/mvn/guide) 设置`build.gradle`：

```groovy
buildscript {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' } //google
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/central' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }

        maven { url "https://jitpack.io" }

        google()
        jcenter()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:7.4.1'
        
        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' } //google
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/central' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
        maven { url "https://jitpack.io" }
        google()
        jcenter()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
```

