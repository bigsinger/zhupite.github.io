---
layout:		post
category:	"android"
title:		"Android使用zxing创建二维码"
tags:		[android]
---
- Content
{:toc}

## 引用zxing库
build.gradle的dependencies里添加：
```
implementation('com.journeyapps:zxing-android-embedded:3.6.0') { transitive = false }
implementation('com.google.zxing:core:3.3.0') {
	exclude module: 'support-v13'
	exclude group: 'com.android.support'
}
```

## QRCodeUtil通用类
```java
package com.example.myapplication;

import android.graphics.Bitmap;
import android.text.TextUtils;

import androidx.annotation.ColorInt;
import androidx.annotation.Nullable;
import androidx.core.view.ViewCompat;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.util.Hashtable;

public class QRCodeUtil {
    @Nullable
    public static Bitmap createQRCodeBitmap(String content, int width, int height) {
        return createQRCodeBitmap(content, width, height, "UTF-8", "H", "2", ViewCompat.MEASURED_STATE_MASK, -1);
    }

    @Nullable
    public static Bitmap createQRCodeBitmap(String content, int width, int height, @Nullable String character_set, @Nullable String error_correction, @Nullable String margin, @ColorInt int color_black, @ColorInt int color_white) {
        if (TextUtils.isEmpty(content)) {
            return null;
        }
        if (width < 0 || height < 0) {
            return null;
        }
        try {
            Hashtable hashtable = new Hashtable();
            if (!TextUtils.isEmpty(character_set)) {
                hashtable.put(EncodeHintType.CHARACTER_SET, character_set);
            }
            if (!TextUtils.isEmpty(error_correction)) {
                hashtable.put(EncodeHintType.ERROR_CORRECTION, error_correction);
            }
            if (!TextUtils.isEmpty(margin)) {
                hashtable.put(EncodeHintType.MARGIN, margin);
            }
            BitMatrix bitMatrix = new QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, width, height, hashtable);
            int[] pixels = new int[(width * height)];
            for (int i = 0; i < height; i++) {
                for (int j = 0; j < width; j++) {
                    if (bitMatrix.get(j, i)) {
                        pixels[(i * width) + j] = color_black;
                    } else {
                        pixels[(i * width) + j] = color_white;
                    }
                }
            }
            Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
            bitmap.setPixels(pixels, 0, width, 0, 0, width, height);
            return bitmap;
        } catch (WriterException e4) {
            e4.printStackTrace();
        }

        return null;
    }
}
```

## 界面代码
activity_main.xml里添加一个ImageView：
```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity"
    tools:ignore="MissingDefaultResource">

    <ImageView
        android:layout_gravity="center"
        android:id="@+id/ivQrcode"
        android:layout_width="150dp"
        android:layout_height="150dp" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello World!"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

MainActivity.java：
```java
package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.widget.ImageView;

public class MainActivity extends AppCompatActivity {
    private ImageView ivQrcode;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        this.ivQrcode = findViewById(R.id.ivQrcode);
        this.ivQrcode.setImageBitmap(QRCodeUtil.createQRCodeBitmap("http://www.zhupite.com/", 200, 200));
    }
}
```

## 测试运行
运行App后，用其他应用的扫一扫功能，可以识别出网址并自动加载网页渲染。



