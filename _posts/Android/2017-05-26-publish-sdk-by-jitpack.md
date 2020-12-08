---
layout:		post
category:	"android"
title:		"通过JitPack方式发布SDK"
tags:		[Android]
---


# 场景
AndroidStudio工程里编写一个库文件，基本上是在一个工程里建一个库，另一个是测试APP。

开发阶段基本上是本地依赖，也即测试APP直接依赖库模块。

但是当库开发完成后，就要发布了，如何发布呢？

# 痛点
发布库文件通常导出成jar包或者aar包传到三方平台，如maven或jcenter等。

但是麻烦就麻烦在需要打包导出等。

# JitPack的便利
主要适合在开源项目上。

例如易盾的验证码SDK，本身就是开源的，技术门槛主要是在服务器端。
# 发布方法
## 一、本地配置
1. 工程的buil.grade添加
```
classpath 'com.github.dcendents:android-maven-gradle-plugin:1.4.1'
```
示例：

```groovy
buildscript {
    repositories {
        jcenter()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:2.3.2'
        classpath 'com.github.dcendents:android-maven-gradle-plugin:1.4.1'
        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}
```

2. 库模块的buil.grade开头添加：
```groovy
apply plugin: 'com.android.library'

apply plugin: 'com.github.dcendents.android-maven'

group='com.github.yidun'
```
其中yidun是GitHub的用户名，你的项目的话就换成你的用户名。

做好以上两点修改后，把**代码上传同步到GitHub上**。

## 二、GitHub上创建版本
代码传好后，在GitHub的【Code】页，选择“releases”进去新建版本。注意版本号要认真填写，例如可以是：v1.0

release title和描述可以简单写下releasenotes，写完后点击“Publish release”就完成了一次版本发布。其实这个时候GitHub帮你做的就是打包。

## 三、JitPack查询
打开[JitPack \| Publish JVM and Android libraries](https://jitpack.io/)，输入GitHub项目地址，例如：https://github.com/yidun/captcha-android-demo
点击查询，则可以查询到发布的版本列表。

## 四、集成使用
选取一个最新的版本，点击“Get it”，下面会在“How to”里出现集成使用方法，非常简单。示例可以参考：[yidun/captcha\-android\-demo: 易盾验证码android应用嵌入演示](https://github.com/yidun/captcha-android-demo)

如果在AndroidStudio工程中集成成功，则JitPack上对应的版本Log一栏会出现绿色的图标，否则会出现红色的出错图标，可以点开查看错误信息。


# 可能出现的错误
错误示例：[https://jitpack\.io/com/github/yidun/captcha\-android\-demo/v1\.2/build\.log?building=1](https://jitpack.io/com/github/yidun/captcha-android-demo/v1.2/build.log?building=1)

```
WARNING: gradle/wrapper/gradle-wrapper.jar does not exist! Needs to be committed.

ERROR: Gradle wrapper not found. Please add. Using default gradle to build.

....
....

FAILURE: Build failed with an exception.

* Where:
Build file '/home/jitpack/build/app/build.gradle' line: 1

* What went wrong:
A problem occurred evaluating project ':app'.
> Failed to apply plugin [id 'com.android.application']
   > Minimum supported Gradle version is 3.3. Current version is 3.1. If using the gradle wrapper, try editing the distributionUrl in /home/jitpack/build/gradle/wrapper/gradle-wrapper.properties to gradle-3.3-all.zip

```
提示找不到gradle，这个错误其实我感觉是不应该，因为我在本地编译的时候只有一个：gradle\wrapper\gradle-wrapper.properties，并且文件内容指定了gradle的最新版，并不需要gradle-wrapper.jar文件。
```
#Thu May 04 15:15:21 CST 2017
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-3.3-all.zip
```
## 解决办法
在其他工程里面找到了3.3版本的gradle-wrapper.jar文件，在库工程的gradle\wrapper\目录下，并上传同步到GitHub，再次创建一次版本，成功通过。


# 总结
该方法比较适合懒人，比较方便简洁，但是仅仅适合开源项目，特别是GitHub上发布的项目，其他项目貌似不太适合哦。

# 参考
- [AndroidNote/ReleaseLibraryByJitPack\.md at master · GcsSloop/AndroidNote](https://github.com/GcsSloop/AndroidNote/blob/master/Course/ReleaseLibraryByJitPack.md)
- [yidun/captcha\-android\-demo: 易盾验证码android应用嵌入演示](https://github.com/yidun/captcha-android-demo)
