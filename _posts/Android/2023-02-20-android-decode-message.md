---
layout:		post
category:	"android"
title:		"安卓写一个尝试解密加密文本的工具"

tags:		[android]
---
- Content
{:toc}
**关键词**：安卓,Android,加密,解密



最近在处理一些加密的数据，加密的方法有多个，使用了何种加密不清楚，于是帮运营编写了一个小工具用来尝试解密。



主要思路：定义接口类和注解类，具体的解密类实现接口类，并用注解来描述解密方法的信息和解密顺序。



```java
// 解密接口类

package com.test.decoder;

public interface IDecryptor {
    String decrypt(String input, String key);

    boolean test();
}
```



```java
// 解密注解类

package com.test.decoder;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface DecryptorInfo {
    String description();				// 描述信息
    int order();						// 使用顺序
}
```



然后是具体的解密类的实现，下面给了几个：

```java
package com.test.decoder;

import android.util.Base64;

@DecryptorInfo(description = "base64", order = 1)
public class Base64IDecryptor implements IDecryptor {
    @Override
    public String decrypt(String input, String key) {
        try {
            return new String(Base64.decode(input, 0));
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public boolean test() {
        return true;
    }
}
```

```java
package com.test.decoder;

import android.util.Base64;
import java.nio.charset.StandardCharsets;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

@DecryptorInfo(description = "密钥 xxx 的AES", order = 3)
public class AesIDecryptor2 implements IDecryptor {
    @Override
    public String decrypt(String input, String key) {
        return decryptAes(input, "xxx");
    }

    @Override
    public boolean test() {
        return true;
    }

    private String decryptAes(String input, String key) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(), "AES");
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);
            return new String(cipher.doFinal(Base64.decode(input, 0)), StandardCharsets.UTF_8);
        } catch (Exception e) {
            return null;
        }
    }
}
```

```java
package com.test.decoder.decoder1;

import com.test.decoder.IDecryptor;


@DecryptorInfo(description = "密钥 xxx 的DES", order = 4)
public class DesIDecryptor1 implements IDecryptor {
    @Override
    public String decrypt(String input, String key) {
        try {
            return DESUtil.decryptDES(input, "xxx");
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public boolean test() {
        this.decrypt("xxxxxxxxxxx",
                "xxx");
        return true;
    }
}
```

```java
package com.test.decoder.decoder1;

import com.test.decoder.DecryptorInfo;
import com.test.decoder.IDecryptor;


@DecryptorInfo(description = "密钥 xxx 的AES", order = 2)
public class AesIDecryptor1 implements IDecryptor {
    @Override
    public String decrypt(String input, String key) {
        try {
            return AesUtil.decrypt(input);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public boolean test() {
        return true;
    }
}
```



最后在 `MainActivity` 中使用，在 `onCreate` 中遍历和加载带有注解的解密类（这段代码自己写不来，让GPT写的^_^），在点击按钮的时候尝试使用所有解密类进行解密，并把结果回显出来。后面如果有遇到新的解密方法或者需要使用不同的key解密，只需要新增一个类即可，流程不用修改，对于后期维护比较方便。

```java
package com.test.myapplication;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.test.decoder.DecryptorInfo;
import com.test.decoder.IDecryptor;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Enumeration;
import java.util.List;
import java.util.stream.Collectors;

import dalvik.system.DexFile;


public class MainActivity extends AppCompatActivity {
    List<IDecryptor> decoders = new ArrayList<>();
    private Button btnDecode;
    private TextView txtInput;
    private TextView txtOutput;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);


        txtInput = findViewById(R.id.txtInput);
        txtOutput = findViewById(R.id.txtOutput);
        btnDecode = findViewById(R.id.btnDecode);
        btnDecode.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String input = txtInput.getText().toString().trim();
                StringBuilder result = new StringBuilder();

                for (IDecryptor IDecryptor : decoders) {
                    String output = IDecryptor.decrypt(input, null);
                    if (output == null) {
                        output = "";
                    }
                    DecryptorInfo info = IDecryptor.getClass().getAnnotation(DecryptorInfo.class);
                    result.append(info.order()).append(". ").append(info.description()).append("\n").append(output).append("\n\n");
                }

                txtOutput.setText(result.toString());
            }
        });

        // 加载解密的类
        loadDecoders();
    }

    // 加载解密的类
    private void loadDecoders() {
        decoders = findDecryptors("com.test.decoder");

        // 按序号排序
        decoders = decoders.stream()
                .sorted(Comparator.comparingInt(d -> d.getClass().getAnnotation(DecryptorInfo.class).order()))
                .collect(Collectors.toList());
    }


    private List<IDecryptor> findDecryptors(String packageName) {
        List<IDecryptor> decryptors = new ArrayList<>();
        try {
            DexFile dexFile = new DexFile(getPackageCodePath());
            Enumeration<String> entries = dexFile.entries();
            while (entries.hasMoreElements()) {
                String entryName = entries.nextElement();
                if (entryName.startsWith(packageName)) {
                    Class<?> entryClass = Class.forName(entryName);
                    if (IDecryptor.class.isAssignableFrom(entryClass) && !entryClass.isInterface() && entryClass.isAnnotationPresent(DecryptorInfo.class)) {
                        IDecryptor decryptor = (IDecryptor) entryClass.newInstance();
                        decryptors.add(decryptor);
                    }
                }
            }
        } catch (IOException | ClassNotFoundException | IllegalAccessException | InstantiationException e) {
            e.printStackTrace();
        }
        return decryptors;
    }

}
```



`activity_main.xml`布局文件：

```xml
<?xml version="1.0" encoding="utf-8"?>
<ScrollView xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <LinearLayout
        android:orientation="vertical"
        android:layout_width="match_parent"
        android:layout_height="match_parent">

        <EditText
            android:id="@+id/txtInput"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            tools:ignore="MissingConstraints">
        </EditText>

        <Button
            android:id="@+id/btnDecode"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="解密"/>

            <EditText
                android:id="@+id/txtOutput"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"/>

    </LinearLayout>

</ScrollView>
```

