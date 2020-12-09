---
layout:		post
category:	"android"
title:		"Android主流HOOK框架介绍与应用--游戏破解游戏外挂的必杀技"
tags:		[Android,hook,frida,substrate,xposed]
---



图片显示不全的话可以参考：[Android主流HOOK框架介绍与应用--游戏破解游戏外挂的必杀技](https://blog.csdn.net/asmcvc/article/details/55047842)



#  前言

 使用HOOK方案主要是在分析的时候会经常用到，虽然二次打包重新修改代码也可以做到，但是一方面效率低，另一方面如果APP有校验的逻辑就需要进一步绕过，总体还是比较费时费力。所以，通过动态HOOK的方式可以不用直接修改APP文件，也比较方便。下面就分别介绍下比较成熟的几个HOOK框架及其应用：**XPOSED**，**frida**，**substrate**。


# XPOSED

  本节介绍的是XPOSED框架的使用，XPOSED的安装器替换安卓系统的app_process文件，从而实现对系统的接管，通过回调模块的方式来达到不用修改APK就能改变其表现行为的目的。该框架比较成熟，对应的模块也非常多，常用的还有模拟地理位置，伪装手机设备信息等，脑洞是非常之大，基本上能想到的都能做到。由于篇幅限制这里介绍一个简短而实用的案例，其他模块可以参考XPOSED官网的模块列表。

 


 **场景：** 大妈的烦恼！

  周末自驾出去玩，大妈在一旁抱怨：他们单位里要搞个活动需要员工来组织，大家都不想参加，不然搞得都没有时间跳广场舞了。最后他们想出了一个办法：投骰子，谁输了谁上。他们群里大家都在投的火热，就差大妈了，大妈激动的不敢投，只好在这抱怨。。。我让大妈先憋着急，我有大宝剑可以借她一用。

  某信投骰子的原理：

```java
package com.tencent.mm.sdk.platformtools

public static int tx(int paramInt){
  return new Random(System.currentTimeMillis()).nextInt(paramInt + 0 + 1) + 0;
}
```

  这个函数比较有意思，如果是猜拳游戏就随机化0~2之间的数字，分别表示剪刀、石头、布；如果是投骰子游戏则随机化一个0~5之间的数字，也就是骰子的点数。因此只要HOOK这段代码，返回想要的点数即可，这里使用XPOSED框架，主要代码：

```java
findAndHookMethod("com.tencent.mm.sdk.platformtools.be", lpparam.classLoader, "tx", int.class, new XC_MethodHook() {
    @Override
    protected void afterHookedMethod(MethodHookParam param) {
        int gameType = ((Integer) param.args[0]).intValue();
        switch (gameType) {
            case 5:
//投骰子游戏，强制返回最大点数，基数为0，所以返回5
                param.setResult(5);
            default:
        }
    }
});
```

 给大妈选择了最大的点数，大妈顺利逃过一劫，从此又可以愉快地跳广场舞了。

 


  官网： http://repo.xposed.info/

  模块： http://repo.xposed.info/module-overview

  某信的APK安装包并没有进行加壳保护，虽然做过代码混淆处理，但是还是能够反编译，而且即使混效果上面的代码逻辑也能看得懂。

 


# frida

  本节介绍的是frida框架，frida这个HOOK框架主要使用Python和javascript脚本编写，所以兼容性和移植性都很好，可以适用于多种平台，最重要的是不用每次都重启手机。官网： http://www.frida.re/ ，里面介绍了安装步骤，参考Android下的例子可以很快上手： http://www.frida.re/docs/examples/android/ 。


 **场景：** 厉害了我的蛇！

  最近比较魔性的一款手游“贪吃蛇大作战”，就连很少玩游戏的朋友也开始玩起来了。自己也体验玩了几局，发现有些“玩家”操作都异常的快速和灵敏，总是被他们撞死。心想这些玩家不会是用了辅助工具了吧，当看到那些原地打转速度非常快而且轨迹非常之圆，心中就更加确定真人肯定无法达到这种操作（事后分析才知道是机器人玩家）。于是打算分析下，刚好最近同事推荐了frida这个HOOK框架，正好可以拿来练练手。


  游戏初始化函数initEntity：

```java
package com.wepie.snake.module.game;

private void initEntity()
{
    GameConfig.factor = 1.0F;
    SnakeSurfaceView.access$102(SnakeSurfaceView.this, SnakeFactory.creatSnakeSelf(LoginHelper.getLoginUser().nickname, 5, null));
    SnakeSurfaceView.access$1102(SnakeSurfaceView.this, new AiManager(SnakeSurfaceView.this.snakeInfo));
    SnakeSurfaceView.this.allSnakes.clear();
    SnakeSurfaceView.this.allSnakes.add(SnakeSurfaceView.this.snakeInfo);
    SnakeSurfaceView.this.allSnakes.addAll(SnakeSurfaceView.this.aiManager.snakeAis);
    initUtils();
}
```



 游戏初始化函数会调用函数creatSnakeSelf来创建玩家的蛇：

```java
public static SnakeInfo creatSnakeSelf(String paramString, int paramInt, MultiNode paramMultiNode)
{
    int i = SkinConfig.getInUserSkinId();
    SkinInfo localSkinInfo = SkinManager.getInstance().getSkin(i);
    paramString = new SnakeInfo(paramString, localSkinInfo, paramMultiNode);
    Log.i("999", "----->creatSnakeSelf skin_id=" + localSkinInfo.skin_id);
    paramString.bodyInfo.initBodyPoints(getBodyPoints(paramString, 0.0F, 0.0F, paramInt));
    return paramString;
}
```



  该函数创建蛇的颜色和身体，颜色反正随机的就好无所谓，主要是蛇的身体，继续向下分析可以分析出paramInt就是身体的初始长度，再回头看下initEntity对 **creatSnakeSelf** 的调用可以看出：游戏初始时蛇的长度是5。现在就好办了，我们HOOK一下creatSnakeSelf函数的调用，让初始的长度非常大就好了。

 creatSnakeSelf函数的第三个参数是MultiNode类型，先记下完整的类名:

```java
  com.wepie.snake.module.game.main.MultiNode
```

 HOOK后运行游戏，蛇的身体在开始游戏时就非常长啦。

 


  后面再实现无敌模式，通过游戏结束函数（onGameOver）逆向分析，寻找一个比较巧妙又比较方便HOOK的函数，最终找到了 **doSnakeDie** 这个函数：

```java
private void doSnakeDie(final SnakeInfo snakeInfo, final SnakeInfo snakeInfo2) {
    if (snakeInfo.snakeStatus.superFrameCount <= 0 && (snakeInfo2 == null || snakeInfo2.snakeStatus.superFrameCount <= 0)) {
        this.extraFactory.addWrecks(snakeInfo);
        if (!snakeInfo.isSnakeAi) {
            ((SnakeSurfaceView.GameStatusCallback)this.gameStatusCallback).onGameOver();
        }
        else if (snakeInfo2 != null) {
            snakeInfo2.addKillNum();
            if (!snakeInfo2.isSnakeAi) {
                ((SnakeSurfaceView.GameStatusCallback)this.gameStatusCallback).onKillAi();
            }
        }
        snakeInfo.doDie();
        return;
    }
}
```



  这个函数的意义是：第一个参数蛇去碰第二个参数蛇，如果第一个参数是我们自己的蛇，那么就意味着撞死游戏结束；如果第一个参数是机器人蛇，那么死了就死了，我们还可以继续。

  因此HOOK的方法就是：拦截该函数的调用，判断第一个参数是否是我们自己的蛇，如果是则让函数直接返回。

  所以，还需要在creatSnakeSelf调用时保存下创建的自己的蛇对象。当然通过函数的逻辑可以看出机器人蛇与玩家的蛇不同之处就是变量isSnakeAi，如果不想保存creatSnakeSelf创建的蛇对象，直接通过isSnakeAi来判断也是可以的，后面一并给出相应地做法。

 


  记下所要用到的类与函数：

 类: com.wepie.snake.module.game.snake.CollisionUtil

 函数: doSnakeDie

 蛇类型: com.wepie.snake.module.game.snake.SnakeInfo

 

  参考frida的Android示例代码，编写脚本：

```python
#coding:utf-8

import frida, sys

def on_message(message, data):
    if message['type'] == 'send':
        print("[*] {0}".format(message['payload']))
    else:
        print(message)

jscode = """
Java.perform(function () {
    var curSnake = null;

    // Function to hook is defined here
    var SnakeFactory = Java.use('com.wepie.snake.module.game.snake.SnakeFactory');

    // Whenever creatSnakeSelf is called
    SnakeFactory.creatSnakeSelf.implementation = function (name, len, multiNode) {
        // Show a message to know that the function got called
        send('creatSnakeSelf');
        len = 50;

        // Call the original creatSnakeSelf
        curSnake = this.creatSnakeSelf(name, len, multiNode);

        // Log to the console that it's done
        console.log('Done: init snake len: ' + JSON.stringify(len) + " name: " + name
            + " my snake: " + curSnake.toString() + ' isSnakeAi: ' + curSnake.isSnakeAi.value);
        return curSnake;

    };

    var CollisionUtil = Java.use('com.wepie.snake.module.game.snake.CollisionUtil');
    CollisionUtil.doSnakeDie.implementation = function (snake1, snake2) {
        // Show a message to know that the function got called
        if (snake1.equals(curSnake) || snake1.isSnakeAi.value == false){
            console.log('snake1 isSnakeAi: ' + snake1.isSnakeAi.value + " snake1: " + snake1.toString());

            // Log to the console that it's done
            console.log('Done: my snake will not die!');
            return;
        }else{
            // Call the original doSnakeDie
            return this.doSnakeDie(snake1, snake2);
        }

    };

});
"""

process = frida.get_usb_device().attach('com.wepie.snake')
script = process.create_script(jscode)
script.on('message', on_message)
print('[*] Running CTF')
script.load()
sys.stdin.read()
```

 


  主要功能逻辑是上面的JS代码，外面的Python脚本基本都这个模式，在蛇初始化时候creatSnakeSelf保存下自己的蛇对象，修改CollisionUtil的碰撞逻辑，当参数1的蛇是自己的蛇对象时候就返回掉（或者参数1的蛇isSnakeAi值为false直接返回也可以），就能保证不死了。

  效果图如下，随便撞什么蛇或者墙都不死了：

![img](https://img-blog.csdn.net/20170213135503121?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

 


  通过上面的分析也可以看出，该游戏没有加壳保护也没有进行代码混淆，所以很容易就被秒破了。

 



 

# substrate

  上面介绍的两个HOOK场景皆是在java代码层做的HOOK，而且通常都会有一些限制。例如，XPOSED框架的限制是必须要求连带安装XPOSED installer，对应的模块功能才能起效果，而frida则需要配合PC终端操作。而这里介绍的substrate方式，主要是在JNI层做HOOK，而且实现出的应用可以单独使用。

 


 **场景：** 叉叉助手的加速器！

  之前分析游戏保护的时候接触过叉叉助手（先了解对方怎么做，才好想出对应的保护方法），例如下面的某三国游戏，叉叉助手提供了加速器功能。可以在游戏界面上注入并加载一个插件，插件可以自由设置辅助配置，很是强大。

![img](https://img-blog.csdn.net/20170213135517785?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

 


 后来就从这个叉叉助手模拟实现了一个可以任意注入插件的方法：

![img](https://img-blog.csdn.net/20170213135530809?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYXNtY3Zj/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

 


 通过逆向分析叉叉助手来看它的实现原理：使用inject工具把so注入到zygote中，并利用libsubstrate.so的功能来实现对关键函数的HOOK。首先对使用MSJavaHookMethod对handleBindApplication进行HOOK来拦截APP的启动，在拦截函数中判断启动的APP是否是要拦截的APP，如果不是则放行，如果是则通过MSJavaHookClassLoad来HOOK目标APP中Activity的类加载，并在拦截函数中再HOOK Activity的onCreate函数，在onCreate的拦截函数中动态加载插件APK，并调用插件的init函数。

部分代码如下：

```cpp
static void OnCallback_ClassOnCreate(JNIEnv *jni, jobject activity, jobject bundle)
{
    string strName;
    strName = getObjectClassName(jni, activity);
    LOGD("[%s] begin: %s::OnCreate", __FUNCTION__, strName.c_str());

    (*old_onCreate)(jni, activity, bundle);

    LOGD("[%s] dynamic load plug apk: %s", __FUNCTION__, g_cfg.strPlugApkPath.c_str());
    ……
    //调用插件的静态函数init，原型：public static void init(Activity activity, String soPath)
    jmethodID plugUIinit = jni->GetStaticMethodID(plugClass, "init", "(Landroid/app/Activity;Ljava/lang/String;)V");
    if ( plugUIinit==NULL ) {
        LOGE("[%s] not found \"init\" in plug activity: public static void init(Activity activity, String soPath)", __FUNCTION__);
    }else{
        LOGD("[%s] invoke %s::init", __FUNCTION__, g_cfg.strPlugActivity.c_str());
        jstring soPath = jni->NewStringUTF(g_cfg.strPlugSoPath.c_str());
        jni->CallStaticVoidMethod(plugClass, plugUIinit, activity, soPath);
    }

    LOGD("[%s] end", __FUNCTION__);
}
```

但是C++写起来开发效率比较低，出错了也不容易排查。上面的JNI代码用java代码写起来就非常轻松：

```java
String dexOutputDir = "/data/data/" + targetPackageName + "/cache";
DexClassLoader dexClassLoader = new DexClassLoader(plugApkPath, dexOutputDir, null, ClassLoader.getSystemClassLoader());
java.lang.Class<?> plugClass = dexClassLoader.loadClass(plugInitClass);
Method mInit = plugClass.getDeclaredMethod(Constant.METHOD_NAME_plug_init, Activity.class, String.class);
mInit.invoke(null, param.thisObject, plugSoPath);
```


但是并不是意味着就不用写JNI代码了，有时候是必须在SO底层做HOOK的。这个应用场景主要在破解逆向分析、脱壳上比较有用，前期的JNI代码写的很是痛苦，编译一次手机需要重启，而且一旦出错并不是那么容易排查，但是框架搭建好后，以后再需要只要HOOK对应的NDK层函数即可。

 

 官网： http://www.cydiasubstrate.com/

 


# **总结**

##  **1、XPOSED**

 **优点：**

 1）、代码编写方便，开发速度较快。

 2）、有许多现成的模块可以用，而且很多模块也是开源的，方便学习研究。

 **缺点：**

 1）、每次编写代码需要重启手机生效。

 2）、不支持native的HOOK。

 3）、独立性较差，需要依赖XPOSED installer，不易单独分发。

 


##  **2、substrate**

 **优点：**

 1）、比较擅长在native层的HOOK。

 2）、独立性较好，实现的功能可以封装在单独APP里分发给用户使用，因此也是较大型外挂辅助工具的首选。

 **缺点：**

 1）、每次编写代码需要重启手机生效。

 2）、开发效率较低，成本较高。

 


##  **3、frida**

 **优点：**

 1）、无须重启手机和目标APP，这个可以节省很多时间，如果APP测试的点需要很复杂地搭建好环境，一旦重新启动就意味着很麻烦地再重新搭建环境，例如账号登录，进入特定关卡等。

 2）、JS脚本编写，灵活方便，再也不用担心多参数个数和类型问题了。

 3）、可以直接使用或修改对象的成员变量，非常方便。

 4）、配合PC终端命令行使用，脚本编写出错也不会导致APP崩溃，只需修改后重新来过即可，有时会有问题，这个时候需要重启下APP或手机即可。

 **缺点：**

 1）、JS脚本套在python脚本里面，编写JS脚本时候不是很方便，容易出错，好在即使出错也不会导致APP崩溃掉，修改后重新来过即可。

 2）、该工具配合PC终端使用，更适合专业者，不利于分发给用户使用。

 


 综上的案例也可以看出游戏保护刻不容缓，叉叉助手能做到这么成熟的地步主要是因为现在的手游保护力度较弱。