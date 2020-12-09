---
layout:		post
category:	"android"
title:		"黑盒逆向分析法之插桩日志法"
tags:		[逆向]
---

图片显示不全参考：[APIMonitor-droidbox原理分析](https://blog.csdn.net/asmcvc/article/details/11595783)





官方链接：https://code.google.com/p/droidbox/wiki/APIMonitor

幻灯片：[http://www.slideshare.net/KelwinYang/improving-droidbo](http://www.slideshare.net/KelwinYang/improving-droidbox)[x](http://www.slideshare.net/KelwinYang/improving-droidbox)





对感兴趣的API插桩，输出log信息。



对比修改后的apk的差异：



![img](https://img-blog.csdn.net/20130912110007515?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)



![img](https://img-blog.csdn.net/20130912110021437?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)



找出api的参数，例如第一幅图里面没有参数，那么就调用无参数的droidbox_cons，第二幅图有两个参数，那么就调用两个参数的droidbox_cons。

如果一个api有多个重载形式，那么就要写多份。



例如droidbox.android.content.Intent的构造函数就有多份：

```java
package droidbox.android.content;
 
import android.content.Context;
import android.net.Uri;
import droidbox.apimonitor.Helper;
 
public class Intent
{
  public static void droidbox_cons()
  {
    StringBuilder localStringBuilder = new StringBuilder();
    localStringBuilder.append("Landroid/content/Intent;-><init>(");
    localStringBuilder.append(")");
    localStringBuilder.append("V");
    Helper.log(localStringBuilder.toString());
  }
 
  public static void droidbox_cons(Context paramContext, Class paramClass)
  {
    StringBuilder localStringBuilder = new StringBuilder();
    localStringBuilder.append("Landroid/content/Intent;-><init>(");
    localStringBuilder.append("Landroid/content/Context;=");
    localStringBuilder.append(Helper.toString(paramContext));
    localStringBuilder.append(" | ");
    localStringBuilder.append("Ljava/lang/Class;=");
    localStringBuilder.append(Helper.toString(paramClass));
    localStringBuilder.append(")");
    localStringBuilder.append("V");
    Helper.log(localStringBuilder.toString());
  }
 
  public static void droidbox_cons(android.content.Intent paramIntent)
  {
    StringBuilder localStringBuilder = new StringBuilder();
    localStringBuilder.append("Landroid/content/Intent;-><init>(");
    localStringBuilder.append("Landroid/content/Intent;=");
    localStringBuilder.append(Helper.toString(paramIntent));
    localStringBuilder.append(")");
    localStringBuilder.append("V");
    Helper.log(localStringBuilder.toString());
  }
 
  public static void droidbox_cons(String paramString)
  {
    StringBuilder localStringBuilder = new StringBuilder();
    localStringBuilder.append("Landroid/content/Intent;-><init>(");
    localStringBuilder.append("Ljava/lang/String;=");
    localStringBuilder.append(Helper.toString(paramString));
    localStringBuilder.append(")");
    localStringBuilder.append("V");
    Helper.log(localStringBuilder.toString());
  }
 
  public static void droidbox_cons(String paramString, Uri paramUri)
  {
    StringBuilder localStringBuilder = new StringBuilder();
    localStringBuilder.append("Landroid/content/Intent;-><init>(");
    localStringBuilder.append("Ljava/lang/String;=");
    localStringBuilder.append(Helper.toString(paramString));
    localStringBuilder.append(" | ");
    localStringBuilder.append("Landroid/net/Uri;=");
    localStringBuilder.append(Helper.toString(paramUri));
    localStringBuilder.append(")");
    localStringBuilder.append("V");
    Helper.log(localStringBuilder.toString());
  }
}
```

**修改apk的过程：**

反编译apk文件，遍历smali代码，利用配置文件中配置的需要监控的api，如果找到一个api的调用，则分析其参数，然后调用droidbox包空间下对应的类的静态函数。

这些静态函数最终都是解析参数，打印输出log信息。

处理完毕，重新编译生成apk。



**优点：**

实现简单



**缺点：**

1、工作量庞大，一个个api配置下去也挺繁琐的，而且对应的api都要写代码。但是比较适合公共项目维护。

2、如果目标apk内部代码有自校验或者签名校验，就完蛋了。



**综合起来：**

可以提供一种思路，但是不是最好的解决方案。这个项目是linux下的，利用py脚本来修改apk的，知道了原理，整个项目在windows下也是很好完成的。