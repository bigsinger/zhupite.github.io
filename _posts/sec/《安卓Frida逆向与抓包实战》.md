[《安卓Frida逆向与抓包实战》随书附件](https://github.com/r0ysue/AndroidFridaBeginnersBook)，作者陈佳林，r0ysue，其他作品：《树莓派创客：手把手教你搭建机器人》



爬虫工程师向上突破一般走**架构师**或**App安全分析**两条路。架构师要求设计海量数据存储架构，App安全分析则必须学习App逆向。



开源Frida工具DEXDump、Wallbreaker作者hluwa



# 工作环境

VMware虚拟机，Kali Linux系统。Kali Linux预装了许多渗透测试软件，如Metasploit、BurpSuite、sqlmap、nmap等，这是一套开箱即用的专业渗透测试工具箱。Kali Linux自带VMware镜像版本，下载解压后双击.vmx文件即可开机。为虚拟机本身的时间不是东八区的，所以需要重新设置时区。Kali Linux默认不带中文，当打开中文网页或者抓包时，若数据包的数据中有中文，则无法解析，故需要配置Kali使其支持中文，执行如下命令即可：

```
apt update
apt install xfonts-intl-chinese
apt install ttf-wqy-microhei
```


注意：一定不要把系统切换为中文环境，切换成中文环境容易出问题。



Android Studio。

Python 版本管理软件：pyenv ， 通过pyenv安装和管理不同的Python版本，每一个由pyenv包管理软件安装的Python都是相互隔离的。替代pyenv的工具——
**miniconda**。miniconda的作用和pyenv的作用是相同的，与pyenv相比，miniconda的安装不需要考虑依赖包的问题，属于傻瓜式的安装。



安装完miniconda后，重启一次terminal，执行conda create -n py380 python=3.8.0命令安装指定版本的Python。其中，py380为安装时conda激活Python 3.8.0之后的代称，python=3.8.0指定安装Python版本为3.8.0。若想使用特定的Python版本，则可以使用conda activate py380来激活对应的版本，在不需要使用该特定版本时，则可执行conda deactivate命令来退出。



其他小工具：
**htop**工具，它是加强版的top工具。htop可以动态查看当前活跃的、系统占用率高的进程。Uptime 是开机时间；Load average 是平均负载， 比如四核CPU，平均负载跑到4的时候就说明系统满载了。


实时查看系统网络负载的工具**jnettop**，在抓包时打开这个工具往往会有奇效，比如实时查看对方IP等。在jnettop界面中可以看到主机连接的远程IP、端口、速率以及协议等。



## 刷机

推荐Google官方的Nexus系列和Pixel系列的测试机。Google官方提供了镜像和相应源码，由于国内Android市场（比如华为、小米等）都魔改了Android系统且均
未开源，在测试过程中总会与Android官方源码有所差异。在刷机之前，需要打开手机的开发者选项，打开USB调试。

```
fastboot oem unlock
```


https://source.android.com/setup/start/build-numbers#source-code-tags-and-builds

在OEM解锁后，需要准备刷机包，这里的刷机包其实也可以叫作官方镜像包（Google官方提供了一个官方镜像的站点）。



## ROOT

Root工具可以选择Magisk或者SuperSU。使用SuperSU对设备进行Root的操作也是类似的，仅仅是将Magisk.zip换成SuperSU.zip而已。需
要注意的是，SuperSU的Root和Magisk的Root是冲突的，在进行SuperSU的Root之前，先要将Magisk卸载掉。这里的卸载不是简单
地卸载Magisk Manger这个APP，而是在Magisk Manger的主页面单击“卸载”按钮，从而恢复原厂镜像，还原后才可使用SuperSU进行Root。



## Kali NetHunter刷机

在**KaliNetHunter**刷入之后，逆向开发和分析人员可以通过它从内核层去监控App，比如通过strace命令直接跟踪所有的系统调用，任何App都
没有办法这类监控，因为从本质上来说任何一个App都是Linux中的一个进程。之所以可以从内核层去监控App，是因为安装的KaliNetHunter 和Android 系统共用了同一个内核。因此， KaliNetHunter值得每一个安卓逆向开发和分析人员所拥有。


可以通过手机上的NetHunter终端运行各种Android原本不支持的Linux命令。如果觉得手机界面过小，还可以通过SSH连接手机最终在计算机上操作手机。具体关于SSH的配置，可以打开NetHunter ， 在侧边栏中选择Kali Services ， 然后勾选RunOnChrootStart，并选中SSH按钮。

在启动SSH后，在计算机上就可以通过手机的IP来连接手机。


可惜的是，Kali NetHunter仅支持Nexus系列及OnePlus One系列部分手机机型。

## 常用命令

- cat
- echo和touch命令

echo命令通过配合
“>”或者“>>”对文件进行写操作，其中“>”为覆盖写操作、“>>”为扩展写操作。

- grep命令：用于在shell中过滤出符合条件的输出。

- ps
  在Android 8之后，ps命令只能打印出当前进程，需要加上-e参数才能打印出全部的进程。

- netstat命令
  功能：该命令输出App连接的IP、端口、协议等网络相关信息，通常使用的参数组合为-alpe。netstat -alpe用于查看所有sockets连接的IP和端口以及相应的进程名和pid，配合grep往往有奇效。

- lsof命令
  功能：该命令可以用于查看对应进程打开的文件。
- top命令
  功能：该命令用于查看当前系统运行负载以及对应进程名和一些其他的信息，和之前讲的htop作用一样，只是相对来说htop更加人性化。

### adb命令

- adb shell dumpsys activity top
  功能：查看当前处于前台的Activity。

- adb shell dumpsys package <package-name>
  功能：查看包信息，包括四大组件信息以及MIME等相关信息。

- adb shell dbinfo <package-name>
  功能：用于查看App使用的数据库信息，包括执行操作的查询语句等信息都会被打印出来。与lsof命令打印出来的信息完全一致。

- adb shell screencap -p <path>
  功能：用于执行截图操作，并保存到<path>目录下。

- adb shell input text <text>
  功能：用于在屏幕选中的输入框内输入文字，可惜不能直接输入中文。

- adb shell pm命令
  功能：pm命令是Android中packageManager的命令行，是用于管理package的命令，比如通过pm list packages命令可以列出所有安装的APK包名。

- pm install命令用于安装APK文件，只是这里的APK文件不是在主机目录下，而是在Android手机目录下。

- adb shell am命令
  功能：am命令是一个重要的调试工具，主要用于启动或停止服务、发送广播、启动Activity等。在逆向过程中，往往在需要以Debug模式启动App时会使用这个命令。对应命令格式为

```
adb shell am start-activity -D -N <包名>/<类名>
```

- adb shell getprop ro.product.cpu.abi 查看系统架构。
- adb install <App.apk>：这个命令可谓是重中之重，几乎每天都会被移动安全逆向开发和分析人员使用。这个命令用于将主机的apk安装到手机上，其中App路径是主机的目录。
- adb push和adb pull：这两个命令用于在主机和Android设备之间交换文件，前者用于从主机推送文件到Android设备上，后者用于从Android设备上获取文件到主机中。



# Frida

Frida存在两种操作模式：一种是通过命令行直接将JavaScript脚本注入进程中，对进程进行操作，称为**CLI（命令行）模式**；另一种是使用Python进行JavaScript脚本的注入工作，实际对进程进行操作的还是JavaScript脚本，这种操作模式称为**RPC模式**。



Frida操作App的方式有两种。第一种是**spwan模式**，简而言之就是将启动App的权利交由Frida来控制。采用这个模式时，即使目标App已经启动，在使用Frida注入程序时还是会重新启动App。在CLI模式中，Frida通过加上-f参数指定包名以spwan模式操作App。第二种是**attach模式**，建立在目标App已经启动的情况下，Frida通过ptrace注入程序从而执行Hook的操作。在CLI模式中，如果不添加-f参数，则默认会通过attach模式注入App。



frida-agent-example


以下命令以attach模式注入指定应用：
```
frida -U -l hello_world.js android.process.media
```

-U参数是指USB设备，-l参数用于指定注入脚本所在的路径， 后面跟上要注入的脚本， 最后的android.process.media则为Android设备上正在运行的进程名。

**setImmediate**（Frida的API函数）函数传递的参数是要被执行的函数，比如传入main参数，表示当Frida注入App后立即执行
main()函数。这个函数和**setTimeout**()函数类似，都是用于指定要执行的函数，不同的是setTimeout可以用于指定Frida注入App多长时间后执行函数，往往用于延时注入。如果传递的第二个参数为0或者压根没有第二个参数，就和setImmediate()函数的作用一样。


重载的函数hook：者.overload('int', 'int') 添加到要Hook的函数名后、关键词implementation之前。



使用Java.use()函数找到类进行调用即可；如果是实例方法的主动调用，则需要在找到对应的实例后对方法进行调用。这里用到了Frida中非常重要的一个API函数Java.choose()，这个函数可以在Java的堆中寻找指定类的实例。



rpc方式
rpc.exports





