---
layout:		post
category:	"android"
title:		"使用Kotlin进行Android应用开发"
tags:		[Android,Kotlin]
---



 Kotlin是一门基于JVM的编程语言，它正成长为Android开发中用于替代Java语言的继承者。Java是世界上使用最多的编程语言之一，当其他编程语言为更加便于开发者使用而不断进化时，Java并没有像预期那样及时跟进。

  Kotlin是由JetBrains创建的基于JVM的编程语言，IntelliJ正是JetBrains的杰作，而Android Studio是基于IntelliJ修改而来的。Kotlin是一门包含很多函数式编程思想的面向对象编程语言。

　　Kotlin生来就是为了弥补Java缺失的现代语言的特性，并极大的简化了代码，使得开发者可以编写尽量少的样板代码。

据说是Android下的swift语言，而且是有jetBrains出品，有这么强大的IDE支持，一定错不了。



**AndroidStudio安装Kotlin开发插件：**

![img](https://img-blog.csdn.net/20160616155003665?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

点击“Install JetBrains plugin”

![img](https://img-blog.csdn.net/20160616155008839?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

输入kotlin搜索，安装下面那个Kotlin Extension For Android插件，安装后重启AS。



**创建KotlinActivity：**

新建Android工程，这一步和以前创建安卓工程的步骤类似，这个时候工程里面也没有跟kotlin有半毛钱的关系。

只不过在工程创建完成后，再新建Activity的时候选择KotlinActivity：

![img](https://img-blog.csdn.net/20160616155013259?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

不带分号结束的看起来就是舒服，习惯了Lua和Python。

![img](https://img-blog.csdn.net/20160616155018120?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

![img]()

自动创建的界面布局文件和之前的没什么区别，依然是xml格式的。同时manifest里也会自动添加该Activity的声明。



**配置gradle：**

如果IDE提示需要配置Kotlin的时候，就点击配置就好了，会自动在project和module的build.gradle里配置好。如果是手动配置的话，请在project的build.gradle里配置：

```groovy
buildscript {
 ext.kotlin_version = '1.0.2'
repositories {
        jcenter()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:2.1.0'
classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"

// NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
}
}
在module的build.gradle里配置：
apply plugin: 'com.android.application'
apply plugin: 'kotlin-android'

android {
    compileSdkVersion 23
buildToolsVersion "23.0.2"

defaultConfig {
        applicationId "com.example.demo_yunbu"
minSdkVersion 15
targetSdkVersion 23
versionCode 1
versionName "1.0"
}
    buildTypes {
        release {
            minifyEnabled false
proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
}
    }
    sourceSets {
        main.java.srcDirs += 'src/main/kotlin'
}
}

dependencies {
    compile fileTree(dir: 'libs', include: ['*.jar'])
    compile 'com.android.support:appcompat-v7:23.1.1'
compile "org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version"
}
repositories {
    mavenCentral()
}
```

最后IDE提示 Sync Now，用用这些修改就好了。

最后我们在布局文件中添加一个TextView来演示控件的操作：



```xml
<TextView
android:layout_width="wrap_content"
android:layout_height="wrap_content"
android:id="@+id/tvMessage"/>
```

然后在Activity代码里就可以直接使用变量tvMessage了，如果有如下提示：

![img](https://img-blog.csdn.net/20160616155024604?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

![img]()

只需要按Alt+Enter导入布局文件的引用即可，自动导入：

```kotlin
import kotlinx.android.synthetic.main.activity_main.*
```

然后可以直接使用变量tvMessage进行操作了，非常方便，再也不用每个控件用 findViewById查找一遍了。

以下是完整的代码：

```kotlin
package com.example.hellokotlin

import android.content.Intent
import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import kotlinx.android.synthetic.main.activity_main.*

class MainActivity : AppCompatActivity() {

override fun onCreate(savedInstanceState: Bundle?) {
super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
tvMessage.text = "hello kotlin!";
btnOpenActivity2.text = "OpenActivity2"
btnOpenActivity2.setOnClickListener({ startActivity(Intent(MainActivity@this, SecondActivity::class.java)) })
    }
}
```



**把之前的java代码转换为Kotlin：**

前面新建android工程的时候因为MainActivity并不是KotlinActivity，因此需要转换一下，

选择 菜单Code->Convert Java File to Kotlin File

除了文件内容改变之外，文件的扩展名也从.java变为了.kt。

编译，出现错误：

```
Error:(6, 8) Unresolved reference: kotlinx
Error:(13, 9) Unresolved reference: tvMessage
Error:Execution failed for task ':app:compileDebugKotlin'.
\> Compilation error. See log for more details
```

提示缺少kotlin，需要手动配置一下， 在module的build.gradle里添加：

```groovy
buildscript {
    repositories {
        jcenter()
    }
    dependencies {
        classpath "org.jetbrains.kotlin:kotlin-android-extensions:$kotlin_version"
}
}
```

修改完成后Sync Now一次，编译通过，运行效果：

![img](https://img-blog.csdn.net/20160616155031542?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

![img]()

点击按钮后打开一个空白的页面，这里就不截图了。



**使用anko创建界面：**

前面的界面全部继续使用了XML来创建的，这里演示下使用anko创建界面。

首先配置gradle，在project的gradle里 buildscript添加：

```groovy
ext.anko_version = '0.8.2'
```

再在module的gradle里 dependencies 添加：

```groovy
// Anko
compile "org.jetbrains.anko:anko-common:$anko_version"
compile 'org.jetbrains.anko:anko-sdk15:0.8.2' // sdk19, sdk21, sdk23 are also available
compile 'org.jetbrains.anko:anko-support-v4:0.8.2' // In case you need support-v4 bindings
compile 'org.jetbrains.anko:anko-appcompat-v7:0.8.2' // For appcompat-v7 bindings
```

最后Sync Now，成功后编辑SecondActivity的代码：

```kotlin
package com.example.hellokotlin

import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import org.jetbrains.anko.*

class SecondActivity : AppCompatActivity() {

override fun onCreate(savedInstanceState: Bundle?) {
super.onCreate(savedInstanceState)
//        setContentView(R.layout.activity_second)

verticalLayout {
padding = dip(30)
editText {
hint = "Name"
textSize = 24f
}
editText {
hint = "Password"
textSize = 24f
}
button("Login") {
textSize = 26f
onClick { toast(button@this.text) }
            }
        }
}
}
```

这里注释掉了原来由 setContentView来设置的xml布局，而使用了代码直接创建，使用起来简单直接了，但是缺点也很明显，不能做到界面设计阶段的实时预览效果，很难做到所见即所得，好在xml还能继续支持。

运行看下效果，点击主界面的按钮打开第二个页面：

![img](https://img-blog.csdn.net/20160616155035353?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

点击Login按钮弹出一个土司，文本就是该按钮的文本。



**参考：**

[《Kotlin for android developers》中文版翻译 ](https://wangjiegulu.gitbooks.io/kotlin-for-android-developers-zh/content/)

[Getting started with Android and Kotlin](http://kotlinlang.org/docs/tutorials/kotlin-android.html)

[Unresolved reference: kotlinx](http://stackoverflow.com/questions/34169562/unresolved-reference-kotlinx)

[Android开发必备知识：为什么说Kotlin值得一试](https://segmentfault.com/a/1190000004494727)

[Kotlin在Android工程中的应用](http://www.2cto.com/kf/201506/412654.html)

[使用 Kotlin 和 Anko 的安卓开发入门](http://news.h5.com.cn/anzhuo/25793.html)

[anko](https://github.com/Kotlin/anko)

[使用Kotlin开发Android应用](http://blog.csdn.net/cuiran/article/details/50681473)

