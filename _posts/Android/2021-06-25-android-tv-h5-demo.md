---
layout:		post
category:	"android"
title:		"Android TV H5 demo应用"
tags:		[]
---
- Content
{:toc}


创建一个简单的安卓TV应用，通过webview加载网页展示内容。



# 1.创建空白TV工程

AndroidStudio创建工程的时候尽量不要选择模板，模板太复杂，创建一个基础的空的工程即可。默认创建的工程的**minSdkVersion**是21，因为家中电视年数有点久远，系统版本为4.3（Android SDK 18），需要手动把**minSdkVersion**调低一点，所幸的是AndroidStudio允许调到最低的数值为 17 。调整后确实可以编译，且编译后的apk包确实可以在家里的老电视上运行。

```groovy
plugins {
    id 'com.android.application'
}

android {
    compileSdkVersion 30

    defaultConfig {
        applicationId "com.example.demo"
        minSdkVersion 17
        targetSdkVersion 30
        versionCode 1
        versionName "1.0"

    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {

    implementation 'androidx.leanback:leanback:1.0.0'
    implementation 'androidx.appcompat:appcompat:1.3.0'
    implementation 'com.google.android.material:material:1.2.1'
    implementation 'androidx.constraintlayout:constraintlayout:2.0.1'
}
```



# 2.创建空的主Activity

选择空白的Activity，比较简单干净，布局文件会自动生成，在布局文件里添加一个webview：

```xml
<WebView
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:id="@+id/wevView" />
```

MainActivity代码如下，其中对**WebViewClient**设置了重载函数**onPageFinished**，用来在页面完成加载之后立即执行一些动作。

```java
package com.example.demo;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        setContentView(R.layout.activity_main);

        String url = "http://www.xxxx.com";
        WebView webView = (WebView) findViewById(R.id.wevView);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                String js = "javascript:(function() {document.getElementsByClassName('btnname')[0].click();})()";
                webView.loadUrl(js);//void(0);
            }
        });
        webView.loadUrl(url);
    }
}
```



# 3.AndroidManifest.xml修改

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.demo">
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:usesCleartextTraffic="true"
        android:theme="@style/Theme.demo">
        <activity android:name=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

TV应用尽量使用**无标题全屏模式**：

```xml
<resources>

    <style name="Theme.demo" parent="@style/Theme.AppCompat" >
<!--    <style name="Theme.AppCompat.Light.NoActionBar.FullScreen" parent="@style/Theme.AppCompat.Light.NoActionBar">-->
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowActionBar">false</item>
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowContentOverlay">@null</item>
    </style>
</resources>
```



# 4、遥控器按键响应

运行发现，虽然可以在电视上跑，但是网页无法通过遥控器按键操作，所以需要额外处理下。

在安卓的工程布局文件里添加几个按钮：

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    tools:context=".view.PlayH5Activity">
    <LinearLayout
        android:orientation="horizontal"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content">
        <Button
            android:text="播放暂停"
            android:id="@+id/btnPlayPause"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:focusable="true"
            android:nextFocusDown="@id/btnNextPage"
            android:nextFocusRight="@id/btnNextPage"
            android:clickable="true"
            android:onClick="onClick"/>
        <Button
            android:text="下一页"
            android:id="@+id/btnNextPage"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:focusable="true"
            android:nextFocusUp="@id/btnPlayPause"
            android:nextFocusLeft="@id/btnPlayPause"
            android:nextFocusDown="@id/btnPrePage"
            android:nextFocusRight="@id/btnPrePage"
            android:clickable="true"
            android:onClick="onClick"/>
        <Button
            android:text="上一页"
            android:id="@+id/btnPrePage"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:focusable="true"
            android:nextFocusUp="@id/btnNextPage"
            android:nextFocusLeft="@id/btnNextPage"
            android:nextFocusDown="@id/btnNextBook"
            android:nextFocusRight="@id/btnNextBook"
            android:clickable="true"
            android:onClick="onClick"/>
        <Button
            android:text="下一本"
            android:id="@+id/btnNextBook"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:focusable="true"
            android:nextFocusUp="@id/btnPrePage"
            android:nextFocusLeft="@id/btnPrePage"
            android:clickable="true"
            android:onClick="onClick"/>

    </LinearLayout>
    <WebView
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:id="@+id/wevView" />
</LinearLayout>
```



- **focusable** 是用来设置控件是否可以通过遥控器进行选择的;
- **nextFocusUp** : 指定遥控器按**向上按键**时选择的控件
- **nextFocusDown** : 指定遥控器按**向下按键**时选择的控件
- **nextFocusLeft** : 指定遥控器按**向左按键**时选择的控件
- **nextFocusRight** : 指定遥控器按**向右按键**时选择的控件
- **onClick** : 直接可以响应按下确认键（OK键）的操作



然后做了一个讨巧的做法是，按下确认键后是通过执行JavaScript代码来控制网页行为的：

```java
@Override
public void onClick(View v) {
    int id = v.getId();
    if (id == R.id.btnPlayPause) {
        String js = "javascript:(function() {document.getElementsByClassName('btn1')[0].click();})()";
        webView.loadUrl(js);//void(0);
    } else if (id == R.id.btnNextPage) {
        String js = "javascript:(function() {document.getElementById('btn2').click();})()";
        webView.loadUrl(js);//void(0);
    } else if (id == R.id.btnPrePage) {
        String js = "javascript:(function() {document.getElementById('btn3').click();})()";
        webView.loadUrl(js);//void(0);
    } else if (id == R.id.btnNextBook) {
        currentPlayBookIndex++;
        if (currentPlayBookIndex >= bobiBookIds.length) {
            currentPlayBookIndex = 0;
        }
        int bookId = demoBookIds[currentPlayBookIndex];
        String url = "http://www.xxx.com/" + bookId;
        webView.loadUrl(url);
    }
}
```



# 5、总结

可以利用现有的网页的效果，结合Android开发共同实现想要的效果，这样开发成本最低，可以最快满足生活需要。

