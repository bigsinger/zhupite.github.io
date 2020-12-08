---
layout:		post
category:	"android"
title:		"使用IntelliJ IDEA（androidstudio前身）开发android移动应用前的基本设置，提高开发效率"
tags:		[android,idea,AndroidStudio]
---



**参考：http://www.android-studio.org/**





1、**下载安装AndroidStudio**：http://developer.android.com/sdk/installing/studio.html



**2、界面字体大小设置**

File菜单->Settings->Appearance->Override default fonts by(not recommended):
Name:宋体（建议选择中文，防止出现中文乱码。起初的中文字体名称为空白，只要把列表框拉到最后随便选取一个空白然后应用，中文字体名便出现了，再选择喜欢的字体。）
Size：18

**3、代码字体大小设置**

File菜单->Settings->Editor->Color&Font->Font
首先点击“save as...”保存为自定义字体设置，然后修改大小Size：18



**4、解决代码中文乱码**

点击状态栏右下角GBK-选择UTF-8，然后根据情况选择“reload”或者“convert”。



**5、代码显示行号**

File菜单->Settings->Editor-Appearance ：show line numbers



**6、设置IntelliJ IDEA智能提示忽略大小写**

Editor-Code Completion页里有个Case sensitive completion，可以设置只第一个字母敏感、完全敏感或者不敏感。



**7、添加自定义代码补全**

File菜单->Settings->Live Templates

先把“By default expand with Tab”改为"Space"，这样更符合VS习惯。

点击右侧的“+”新建一个TemplateGroup，名称为user。
然后在user分组下添加自定义的LiveTemplate：
**for**

```java
for(int $INDEX$ = 0; $INDEX$ < $LIMIT$; $INDEX$++) {
  $END$
}
```


**if**

```java
if ($END$) {
}
```


**st**

```java
String 
```


**try**

```java
try {
    $END$
} catch (Exception e) {
    e.printStackTrace();
}
```

**print**

```
System.out.println($END$);
```

**while**

```
while ($END$) {

}
```



**8、更改文件自动注释，默认生成的文件注释为：**

```java
/**
 * Created by ${USER} on ${DATE}.
 */
```


更改方法：

打开菜单：File-Settings打开选项设置，找到File and Code Templates--Includes--File Header，修改为：

```java
/**
 * Created by sing on ${DATE}.
 * desc: 
 */
```



选择Templates-class，修改：

```java
#if (${PACKAGE_NAME} && ${PACKAGE_NAME} != "")package ${PACKAGE_NAME};#end
#parse("File Header.java")

public class ${NAME} {
}
```

为：

```java
#if (${PACKAGE_NAME} && ${PACKAGE_NAME} != "")package ${PACKAGE_NAME};#end
#parse("File Header.java")

public class ${NAME} {
    private static final String TAG = "${NAME}"; 

}
```

使得创建类的时候自动创建TAG。