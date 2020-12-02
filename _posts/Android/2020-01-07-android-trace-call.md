---
layout:		post
category:	"android"
title:		"Android逆向安全-无侵入找关键call之trace日志分析大法"
tags:		[android,hook]
---
- Content
{:toc}

## 背景
找关键call是逆向的基本技能和分析目标，找到关键call后便可以进一步利用。在安卓App的逆向分析中，人肉逆向分析虽说不难，但是繁琐，特别是现在App体积动辄几十MB甚至几百MB，反编译出的jar或者smali文件相当多，找关键call无疑是大海捞针。

**那么有什么方法可以快速找关键call呢？**


之前介绍过两个方法：
**一个是插桩日志分析法，一个是借助加固的方法。**

**插桩日志分析法**，理解起来比较简单，就是反编译App文件，对smali代码里的每个函数入口都插入一条日志输出语句，最后回编译出新的App包，安装运行后通过捕获并分析日志找出关键call。

该方法理解起来比较简单，早期实现门槛较低，可以通过编写工具来自动插桩。但是随着App体积变得越来越大，保护强度的提高，这种操作方法的工作量也变得很大，特别是分析体积较大的App时并不是那么方便，而且一旦App自身有签名校验、文件完整性校验等保护逻辑，这种方法就会失效。而现实是，现在App的保护强度的确在增加，有的甚至会加固保护，因此这种方法的限制性也越来越多。该方法是一个“笨”方法，有时在没有更好的方法的时候，也是一个选择。

**借助加固的方法**，这个门槛较高，主要是利用App加固技术来实现找关键call的目的。可以在加固的时候对每个函数进行native化处理，接管函数调用，接管函数负责打印出函数签名信息，加固后的App在运行时便会输出日志，通过分析日志找出关键call。该方法实现起来不是那么容易，笔者早期在dalvik模式下通过函数签名过滤实现过一个找新版微信骰子的关键call，只是证明该方法是可行的。在具体实践中，也没有人会对所有的函数进行加固处理，这会拖慢App的运行效率，而且该方法也有弊端：实现门槛过高；对App有侵入性，App自身有签名校验、文件完整性校验等保护逻辑，这种方法就会失效。

我们现在先对比下两种方法：

|  | 插桩日志分析法 | 借助加固 |
|--|--|--|
| 实现难度 |低  |高  |
|本质  | 日志分析  |日志分析或签名过滤  |
| 限制条件 |App无校验无保护，可反编译且可回编译  | App无校验无保护 |
|侵入性  | 高 |略高  |

总体可以看出，这两种方法对App**都有侵入性**，且有一定限制条件，但其本质都是通过函数调用日志的分析方法。那么我们就会想，**有没有其他方法可以减小对App的侵入性来做分析呢？例如安卓系统本身有没有这么一套机制，使得App在运行时的每个函数调用都可以有一次拦截或记录？**

这个问题很早的时候就考虑过，且在2016年的时候有过类似的笔记思考：[如何快速定位Android APP中的关键函数？_android,app_大星星的专栏-CSDN博客](https://blog.csdn.net/asmcvc/article/details/54405899)

这个问题一直拖了几年，后来2019年的时候在GitHub上翻到这个项目：[AppMethodOrder](https://github.com/zjw-swun/AppMethodOrder)，号称是：“**一个能让你了解所有函数调用顺序以及函数耗时的Android库（无需侵入式代码）**”，看其介绍感觉就是我想要的效果。

但是该项目没有明确说明可以用来做逆向分析，但通过与作者沟通知道，这个思路确实是可以用在逆向领域的，但是怎么操作作者也不愿透露。但是有了这个确实可行的信息之后，便开始自行摸索了。


## 新方法探索

第一步要完成的工作是：**对三方App（非自己开发的App）生成trace文件**。如果项目是自己开发的，是可以通过AndroidStudio的调试功能来监控App性能分析，进而导出trace文件，这个不是难事。难就难在我们逆向App的时候，用的都是他人的App，不是自己的项目，这个要怎么生成trace文件呢？

笔者试了很多手机和模拟器，很多都不支持对其他进程的监控，只有雷电模拟器是可以的。真机可能需要root吧，但是没有找到合适的root机，这个就没验证了。但是雷电模拟器的安卓系统版本略低，在分析的时候可能也会有一些问题。这个profiler监控在安卓9.0、10.0系统上会有更好的支持。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200107110627599.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2FzbWN2Yw==,size_16,color_FFFFFF,t_70)

能跑起来就不错，试试UI上点击 5 次之后的trace：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200107110716420.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2FzbWN2Yw==,size_16,color_FFFFFF,t_70)
摸索着跑了两次trace，一次UI上点击了5次，一次UI上点击了7次，最后根据函数调用次数过滤，最后求交集，得出以下函数：
```
com.tencent.mm.view.SmileySubGrid$b.run()V
android.widget.AbsListView.performItemClick(Landroid/view/View;IJ)Z
android.widget.AdapterView.performItemClick(Landroid/view/View;IJ)Z
com.tencent.mm.view.SmileyGrid$1.onItemClick(Landroid/widget/AdapterView;Landroid/view/View;IJ)V
com.tencent.mm.view.SmileyGrid.a(Lcom/tencent/mm/view/SmileyGrid;Lcom/tencent/mm/storage/emotion/EmojiInfo;)V
com.tencent.mm.cc.a.n(Lcom/tencent/mm/storage/emotion/EmojiInfo;)Lcom/tencent/mm/storage/emotion/EmojiInfo;
com.tencent.mm.plugin.emoji.e.h.n(Lcom/tencent/mm/storage/emotion/EmojiInfo;)Lcom/tencent/mm/storage/emotion/EmojiInfo;
com.tencent.mm.ui.chatting.v.B(Lcom/tencent/mm/storage/emotion/EmojiInfo;)V
com.tencent.mm.plugin.emoji.e.h.a(Ljava/lang/String;Lcom/tencent/mm/storage/emotion/EmojiInfo;Lcom/tencent/mm/storage/bi;)V
com.tencent.mm.plugin.emoji.model.c.a(Ljava/lang/String;Lcom/tencent/mm/storage/emotion/EmojiInfo;Lcom/tencent/mm/storage/bi;)V
com.tencent.mm.model.bf.qp(Ljava/lang/String;)J
com.tencent.mm.plugin.emoji.f.r.doScene(Lcom/tencent/mm/network/e;Lcom/tencent/mm/ak/f;)I
com.tencent.mm.plugin.emoji.f.k.doScene(Lcom/tencent/mm/network/e;Lcom/tencent/mm/ak/f;)I
com.tencent.mm.ak.s$2.run()V
com.tencent.mm.plugin.emoji.f.r.onGYNetEnd(IIILjava/lang/String;Lcom/tencent/mm/network/q;[B)V
com.tencent.mm.storage.bj.ab(Lcom/tencent/mm/storage/bi;)I
com.tencent.mm.plugin.emoji.model.c.onSceneEnd(IILjava/lang/String;Lcom/tencent/mm/ak/m;)V
com.tencent.mm.model.u.a(Ljava/lang/String;Landroid/database/Cursor;)I
com.tencent.mm.plugin.fts.b.a$1.a(ILcom/tencent/mm/sdk/e/n;Ljava/lang/Object;)V
```
事实上里面并没有我们想要的关键call，问题出在哪里？

方法不会错，出错的只可能是工具。中间经过不断试错判断，才知道原来是trace文件捕获的有问题。


## 正确trace
默认的“**Sample Java Methods**”和“**Trace Java Methods**”不能满足需求：“Sample Java Methods”是随机采样，统计的不全。“Trace Java Methods”虽说是全部采集，但是默认是8MB大小，也是不够的。

**需要创建自定义的捕获**。勾选“Trace Java Methods”，File size limit这里选择大一点，默认是8MB是远远不够的，也不要太大，建议小于200MB吧，我这里设置了198MB。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200107110843154.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2FzbWN2Yw==,size_16,color_FFFFFF,t_70)
一共统计了两次：

 - 第一次投 **1** 次骰子。
 - 第二次投 **3** 次骰子。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200107110921229.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2FzbWN2Yw==,size_16,color_FFFFFF,t_70)
日志处理过程：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200107111631275.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2FzbWN2Yw==,size_16,color_FFFFFF,t_70)
## 相关命令
 - trace文件文本化：dmtracedump -ho xxx.trace > xxx.txt
 - trace文件文本化且按条件过滤：dmtracedump -ho xxx.trace | grep ".* ent .*" 
 - 只保留目标包名的函数：grep -o 'com.tencent.*' xxx.txt > yyy.txt
 - 只保留函数签名：sawk '{print ($1) ($2)}' xxx.txt > yyy.txt
 - 去重：sort xxx.txt | uniq -c | sort  > yyy.txt
 - 取两者交集：cat a.txt b.txt | sort | uniq -d

因为去重的那个环节处理后，函数的调用顺序被打乱了，函数的调用顺序在日志分析中非常重要，往往能看出核心函数的大概范围。写了个脚本重新把顺序理了一下，简单的处理方法是：从log日志中查询某函数字符串出现的位置，最后按字符串位置排下序列：
```python
def find_pos_sort(file_name, file_name2):
    ret = ''
    d = {}
    s = read(file_name2, False)
    lines = None
    with open(file_name, 'r') as file:
        lines = file.readlines()
    for line in lines:
        pos = s.find(line)
        d[line] = pos
    l = sorted(d.items(), key=lambda x: x[1])
    for item in l:
        ret += str(item[1]) + '\t' + item[0]
    write('E:/temp/join.txt', ret, False)
```


最后这里出的日志文件如下（共125个）：
```
21187970       com.tencent.mm.view.a.e.vy(I)Z
21218748       com.tencent.mm.view.SmileySubGrid.setScrollEnable(Z)V
21219068       com.tencent.mm.ui.base.CustomViewPager.setCanSlide(Z)V
21233910       com.tencent.mm.view.SmileySubGrid$b.run()V
21234601       com.tencent.mm.view.SmileySubGrid$d.dUU()Z
21234814       com.tencent.mm.view.SmileySubGrid.b(Lcom/tencent/mm/view/SmileySubGrid;)I
21235570       com.tencent.mm.view.SmileyGrid$1.onItemClick(Landroid/widget/AdapterView;Landroid/view/View;IJ)V
21235973       com.tencent.mm.view.a.e.getItem(I)Ljava/lang/Object;
21236809 com.tencent.mm.view.SmileyGrid.a(Lcom/tencent/mm/view/SmileyGrid;Lcom/tencent/mm/storage/emotion/EmojiInfo;)V
21237089       com.tencent.mm.ui.chatting.v.bWP()Z
21242427 com.tencent.mm.cc.a.n(Lcom/tencent/mm/storage/emotion/EmojiInfo;)Lcom/tencent/mm/storage/emotion/EmojiInfo;
21250031 com.tencent.mm.plugin.emoji.e.h.n(Lcom/tencent/mm/storage/emotion/EmojiInfo;)Lcom/tencent/mm/storage/emotion/EmojiInfo;
21250870       com.tencent.mm.storage.emotion.EmojiInfo.ss(I)Z
21252218       com.tencent.mm.storage.emotion.d.OP(I)Landroid/database/Cursor;
21332638       com.tencent.mm.sdk.platformtools.bo.hC(II)I
21396629       com.tencent.mm.ui.chatting.v.B(Lcom/tencent/mm/storage/emotion/EmojiInfo;)V
21397664       com.tencent.mm.model.c.isSDCardAvailable()Z
21414368 com.tencent.mm.plugin.emoji.e.h.a(Ljava/lang/String;Lcom/tencent/mm/storage/emotion/EmojiInfo;Lcom/tencent/mm/storage/bi;)V
21414662       com.tencent.mm.plugin.emoji.model.k.brG()Lcom/tencent/mm/plugin/emoji/model/c;
21420825 com.tencent.mm.plugin.emoji.model.c.a(Ljava/lang/String;Lcom/tencent/mm/storage/emotion/EmojiInfo;Lcom/tencent/mm/storage/bi;)V
21430059       com.tencent.mm.storage.emotion.d.J(Lcom/tencent/mm/storage/emotion/EmojiInfo;)Z
21506574       com.tencent.mm.plugin.emoji.h.b.x(Lcom/tencent/mm/storage/emotion/EmojiInfo;)Z
21511916       com.tencent.mm.plugin.emoji.model.k.brL()Lcom/tencent/mm/plugin/emoji/e/k;
21518075       com.tencent.mm.plugin.emoji.e.k.LN(Ljava/lang/String;)Z
21519215       com.tencent.mm.plugin.emoji.e.k.a(Lcom/tencent/mm/storage/emotion/m;Z)V
21520280       com.tencent.mm.storage.emotion.n.a(Lcom/tencent/mm/storage/emotion/m;)Z
21520522       com.tencent.mm.g.c.bh.convertTo()Landroid/content/ContentValues;
21520820       com.tencent.mm.ci.h.replace(Ljava/lang/String;Ljava/lang/String;Landroid/content/ContentValues;)J
21522674       com.tencent.mm.ci.f.replace(Ljava/lang/String;Ljava/lang/String;Landroid/content/ContentValues;)J
21579021       com.tencent.mm.g.c.dd.setType(I)V
21579055       com.tencent.mm.g.c.dd.kX(Ljava/lang/String;)V
21579101       com.tencent.mm.g.c.dd.iq(I)V
21579130       com.tencent.mm.model.r.adI()Ljava/lang/String;
21584401      com.tencent.mm.storage.ap.a(Ljava/lang/String;JZLjava/lang/String;ZLjava/lang/String;)Ljava/lang/String;
21584964       com.tencent.mm.g.c.dd.kY(Ljava/lang/String;)V
21585010       com.tencent.mm.model.bf.qp(Ljava/lang/String;)J
21585228       com.tencent.mm.model.bf.afh()J
21585429       com.tencent.mm.model.cb.afL()J
21996742       com.tencent.mm.g.c.dd.gb(J)V
22004112       com.tencent.mm.storage.bj.Z(Lcom/tencent/mm/storage/bi;)J
22004340       com.tencent.mm.storage.bj.c(Lcom/tencent/mm/storage/bi;Z)J
22005074       com.tencent.mm.model.bf.qr(Ljava/lang/String;)Lcom/tencent/mm/model/bf$b;
22005897       com.tencent.mm.model.t.pq(Ljava/lang/String;)Z
22139825       com.tencent.mm.plugin.messenger.foundation.a.a.h$b.ac(Lcom/tencent/mm/storage/bi;)V
22140474       com.tencent.mm.g.c.dd.setMsgId(J)V
22142321       com.tencent.mm.storage.o.a(Lcom/tencent/mm/storage/bi;Lcom/tencent/mm/model/bf$b;)Z
22142575       com.tencent.mm.g.c.dd.gc(J)V
22144124       com.tencent.mm.storage.bj.atP(Ljava/lang/String;)J
22144578       com.tencent.mm.storage.aj.asY(Ljava/lang/String;)J
22149053       com.tencent.mm.g.c.dd.iz(I)V
22149929       com.tencent.mm.ci.h.a(Ljava/lang/String;Ljava/lang/String;Landroid/content/ContentValues;)J
22151777       com.tencent.mm.ci.f.insert(Ljava/lang/String;Ljava/lang/String;Landroid/content/ContentValues;)J
22152848 com.tencent.wcdb.database.SQLiteDatabase.insert(Ljava/lang/String;Ljava/lang/String;Landroid/content/ContentValues;)J
22207385       com.tencent.mm.sdk.platformtools.bo.hx(J)J
22208955       com.tencent.mm.plugin.messenger.foundation.a.a.h$c.ad(Lcom/tencent/mm/storage/bi;)Z
23183679       com.tencent.mm.g.c.au.in(I)V
23409564       com.tencent.mm.plugin.wear.model.a.dfW()Lcom/tencent/mm/plugin/wear/model/d;
23409811       com.tencent.mm.plugin.wear.model.a.dfT()Lcom/tencent/mm/plugin/wear/model/a;
23414131 com.tencent.mm.plugin.emoji.model.c$b.<init>(Lcom/tencent/mm/plugin/emoji/model/c;JLjava/lang/String;Lcom/tencent/mm/storage/emotion/EmojiInfo;Ljava/lang/String;)V
23415710 com.tencent.mm.plugin.emoji.f.r.<init>(Ljava/lang/String;Ljava/lang/String;Lcom/tencent/mm/storage/emotion/EmojiInfo;J)V
23415831 com.tencent.mm.plugin.emoji.f.r.<init>(Ljava/lang/String;Ljava/lang/String;Lcom/tencent/mm/storage/emotion/EmojiInfo;JB)V
23416567       com.tencent.mm.protocal.protobuf.cob.<init>()V
23417031       com.tencent.mm.protocal.protobuf.coc.<init>()V
23426043       com.tencent.mm.storage.emotion.d.a(Landroid/content/Context;Lcom/tencent/mm/storage/emotion/EmojiInfo;)V
23426387       com.tencent.mm.storage.emotion.EmojiInfo.bJ(Landroid/content/Context;Ljava/lang/String;)Ljava/io/InputStream;
23429248       com.tencent.mm.protocal.protobuf.zl.<init>()V
23429889       com.tencent.mm.model.bh.afl()Ljava/lang/String;
23430107       com.tencent.mm.model.bh.afk()Ljava/lang/String;
23437160       com.tencent.mm.plugin.emoji.f.r.doScene(Lcom/tencent/mm/network/e;Lcom/tencent/mm/ak/f;)I
23437473       com.tencent.mm.protocal.protobuf.SKBuiltinBuffer_t.<init>()V
23438744 com.tencent.mm.plugin.emoji.f.r.securityVerificationChecked(Lcom/tencent/mm/network/q;)Lcom/tencent/mm/ak/m$b;
23442735       com.tencent.mm.plugin.emoji.model.c.LX(Ljava/lang/String;)V
23445034       com.tencent.mm.plugin.emoji.model.c$1.<init>(Lcom/tencent/mm/plugin/emoji/model/c;Ljava/lang/String;)V
23454208       com.tencent.mm.emoji.c.c.a(ZILjava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V
23531016       com.tencent.mm.plugin.emoji.model.c$1.run()V
23538949       com.tencent.mm.plugin.emoji.model.k.brH()Lcom/tencent/mm/plugin/emoji/e/h;
23555891       com.tencent.mm.plugin.emoji.f.k.<init>(Ljava/lang/String;)V
23558704       com.tencent.mm.protocal.protobuf.ajy.<init>()V
23559487       com.tencent.mm.protocal.protobuf.ajz.<init>()V
23566815       com.tencent.mm.g.a.nq.<init>()V
23566847       com.tencent.mm.g.a.nq.<init>(B)V
23567316       com.tencent.mm.g.a.nq$a.<init>()V
23599102       com.tencent.mm.plugin.emoji.f.k.doScene(Lcom/tencent/mm/network/e;Lcom/tencent/mm/ak/f;)I
23601920 com.tencent.mm.plugin.emoji.f.k.securityVerificationChecked(Lcom/tencent/mm/network/q;)Lcom/tencent/mm/ak/m$b;
23629722       com.tencent.mm.protocal.protobuf.SKBuiltinBuffer_t.writeFields(Le/a/a/c/a;)V
23934024       com.tencent.mm.view.e.a.dYV()V
24089354       com.tencent.mm.protocal.protobuf.zm.<init>()V
24266644       com.tencent.mm.plugin.emoji.f.r.onGYNetEnd(IIILjava/lang/String;Lcom/tencent/mm/network/q;[B)V
24388821       com.tencent.mm.g.c.dd.ga(J)V
24404633       com.tencent.mm.protocal.protobuf.bwc.aqg(Ljava/lang/String;)Lcom/tencent/mm/protocal/protobuf/bwc;
24427803       com.tencent.mm.view.e.a$1.handleMessage(Landroid/os/Message;)V
25144505       com.tencent.mm.ui.base.x.notifyDataSetChanged()V
25144946       com.tencent.mm.ui.mogic.WxViewPager$e.onChanged()V
25145533       com.tencent.mm.ui.mogic.WxViewPager.dataSetChanged()V
25810047       com.tencent.mm.ui.mogic.WxViewPager.setScrollingCacheEnabled(Z)V
25816204       com.tencent.mm.view.e.a.a(Lcom/tencent/mm/view/e/a;)Z
25816258       com.tencent.mm.view.e.a.b(Lcom/tencent/mm/view/e/a;)Ljava/lang/String;
25935621       com.tencent.mm.storage.emotion.d.K(Lcom/tencent/mm/storage/emotion/EmojiInfo;)Z
26047733       com.tencent.mm.plugin.emoji.f.k.onGYNetEnd(IIILjava/lang/String;Lcom/tencent/mm/network/q;[B)V
32278047       com.tencent.mm.plugin.emoji.model.c.onSceneEnd(IILjava/lang/String;Lcom/tencent/mm/ak/m;)V
34135695       com.tencent.mm.sdk.platformtools.ab.w(Ljava/lang/String;Ljava/lang/String;[Ljava/lang/Object;)V
34851743       com.tencent.mm.plugin.gif.e.<init>(Landroid/content/Context;ZZI[ILjava/lang/String;)V
34851829       com.tencent.mm.plugin.gif.b.<init>()V
34853315       com.tencent.mm.plugin.gif.e$1.<init>(Lcom/tencent/mm/plugin/gif/e;)V
34853384       com.tencent.mm.plugin.gif.e$2.<init>(Lcom/tencent/mm/plugin/gif/e;)V
34863266       com.tencent.mm.plugin.gif.e.onBoundsChange(Landroid/graphics/Rect;)V
51420588     com.tencent.mm.ui.chatting.c.s$2.onTimerExpired()Z
51420809     com.tencent.mm.plugin.priority.a.a.a.a.chY()Z
51421025     com.tencent.mm.plugin.priority.a.a.a.a.chZ()Z
51421241     com.tencent.mm.modelcontrol.b.akj()Z
51429686     com.tencent.mm.modelcontrol.b.tD(Ljava/lang/String;)Z
51430319     com.tencent.mm.modelcontrol.b.akk()I
51431328     com.tencent.mm.modelcontrol.b.akl()J
51433479     com.tencent.mm.modelcontrol.b.I(III)Z
51434027     com.tencent.mm.plugin.priority.a.a.a.a.cia()Z
51442518     com.tencent.mm.sdk.platformtools.at.isWifi(Landroid/content/Context;)Z
51442759     com.tencent.mm.sdk.platformtools.at.getNetType(Landroid/content/Context;)I
51444053     com.tencent.mm.ui.chatting.d.a.getFirstVisiblePosition()I
51444281     com.tencent.mm.ui.chatting.ChattingUIFragment.getFirstVisiblePosition()I
51445416     com.tencent.mm.ui.chatting.d.a.getLastVisiblePosition()I
51445643     com.tencent.mm.ui.chatting.BaseChattingUIFragment.getLastVisiblePosition()I
51461278     com.tencent.mm.av.d.alx()V
51461475     com.tencent.mm.av.d.lT(I)V
51618646     com.tencent.mm.plugin.gif.e$2.run()V
51618853     com.tencent.mm.plugin.gif.e.b(Lcom/tencent/mm/plugin/gif/e;)Lcom/tencent/mm/plugin/gif/k;
```

通过大致的关键词判断：doScene、getNetType、getLastVisiblePosition、getFirstVisiblePosition、SmileySubGrid、SQLiteDatabase、insert、replace，这些应该不是，这样就排除了不少，然后位置较大的应该也不是（51420588之后的不会是），去掉七七八八之后剩余的手动用frida添加HOOK代码进行验证即可。

为了保险起见，可以写一个脚本，自动对上面的函数生成HOOK代码，以后也可以复用。

最终定位出来的函数是：
==com.tencent.mm.sdk.platformtools.bo.hC (II)I==

该关键call的利用可以参考文章：[Android主流HOOK框架介绍与应用--游戏破解游戏外挂的必杀技_大星星的专栏-CSDN博客](https://blog.csdn.net/asmcvc/article/details/55047842)，此处不再介绍。

以上是只保留了目标包名的函数，实际上在分析的时候会丢失一些信息，笔者试着不过滤包名看看会发现什么。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200107111340524.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2FzbWN2Yw==,size_16,color_FFFFFF,t_70)
最后这里出的日志文件如下（共160个）：
```
68281483	java.util.ArrayList.ensureCapacity(I)V
68310849	android.widget.AbsListView.onInterceptTouchEvent(Landroid/view/MotionEvent;)Z
68310971	android.view.View.isAttachedToWindow()Z
68311119	android.widget.GridView.findMotionRow(I)I
68311465	android.widget.AbsListView.initOrResetVelocityTracker()V
68312124	android.view.View.startNestedScroll(I)Z
68312164	android.view.View.hasNestedScrollingParent()Z
68312210	android.view.View.isNestedScrollingEnabled()Z
68326119	android.widget.AbsListView.pointToPosition(II)I
68326357	android.view.View.getHitRect(Landroid/graphics/Rect;)V
68326529	android.graphics.Rect.contains(II)Z
68326630	android.widget.BaseAdapter.isEnabled(I)Z
68420843	com.tencent.mm.view.a.e.vy(I)Z
68680368	com.tencent.mm.view.SmileySubGrid.setScrollEnable(Z)V
68680788	com.tencent.mm.ui.base.CustomViewPager.setCanSlide(Z)V
68810173	com.tencent.mm.view.SmileySubGrid$b.run()V
68811353	com.tencent.mm.view.SmileySubGrid$d.dUU()Z
68811654	com.tencent.mm.view.SmileySubGrid.b(Lcom/tencent/mm/view/SmileySubGrid;)I
68812698	android.widget.AbsListView.performItemClick(Landroid/view/View;IJ)Z
68812766	android.widget.AdapterView.performItemClick(Landroid/view/View;IJ)Z
68816191	com.tencent.mm.view.SmileyGrid$1.onItemClick(Landroid/widget/AdapterView;Landroid/view/View;IJ)V
68816646	com.tencent.mm.view.a.e.getItem(I)Ljava/lang/Object;
68817763	com.tencent.mm.view.SmileyGrid.a(Lcom/tencent/mm/view/SmileyGrid;Lcom/tencent/mm/storage/emotion/EmojiInfo;)V
68818095	com.tencent.mm.ui.chatting.v.bWP()Z
68830422	com.tencent.mm.cc.a.n(Lcom/tencent/mm/storage/emotion/EmojiInfo;)Lcom/tencent/mm/storage/emotion/EmojiInfo;
68841974	com.tencent.mm.plugin.emoji.e.h.n(Lcom/tencent/mm/storage/emotion/EmojiInfo;)Lcom/tencent/mm/storage/emotion/EmojiInfo;
68843475	com.tencent.mm.storage.emotion.EmojiInfo.ss(I)Z
68845614	com.tencent.mm.storage.emotion.d.OP(I)Landroid/database/Cursor;
68964444	com.tencent.mm.sdk.platformtools.bo.hC(II)I
68964804	java.util.Random.<init>(J)V
68964859	java.util.Random.setSeed(J)V
68964888	java.util.Random.nextInt(I)I
68964917	java.util.Random.next(I)I
69046184	com.tencent.mm.ui.chatting.v.B(Lcom/tencent/mm/storage/emotion/EmojiInfo;)V
69047667	com.tencent.mm.model.c.isSDCardAvailable()Z
69106544	com.tencent.mm.plugin.emoji.e.h.a(Ljava/lang/String;Lcom/tencent/mm/storage/emotion/EmojiInfo;Lcom/tencent/mm/storage/bi;)V
69106890	com.tencent.mm.plugin.emoji.model.k.brG()Lcom/tencent/mm/plugin/emoji/model/c;
69115793	com.tencent.mm.plugin.emoji.model.c.a(Ljava/lang/String;Lcom/tencent/mm/storage/emotion/EmojiInfo;Lcom/tencent/mm/storage/bi;)V
69132644	android.system.ErrnoException.<init>(Ljava/lang/String;I)V
69132703	java.lang.Exception.<init>()V
69134375	com.tencent.mm.storage.emotion.d.J(Lcom/tencent/mm/storage/emotion/EmojiInfo;)Z
69350830	com.tencent.mm.plugin.emoji.h.b.x(Lcom/tencent/mm/storage/emotion/EmojiInfo;)Z
69358575	com.tencent.mm.plugin.emoji.model.k.brL()Lcom/tencent/mm/plugin/emoji/e/k;
69367474	com.tencent.mm.plugin.emoji.e.k.LN(Ljava/lang/String;)Z
69381873	com.tencent.mm.plugin.emoji.e.k.a(Lcom/tencent/mm/storage/emotion/m;Z)V
69383565	com.tencent.mm.storage.emotion.n.a(Lcom/tencent/mm/storage/emotion/m;)Z
69383859	com.tencent.mm.g.c.bh.convertTo()Landroid/content/ContentValues;
69389072	com.tencent.mm.ci.h.replace(Ljava/lang/String;Ljava/lang/String;Landroid/content/ContentValues;)J
69391394	com.tencent.mm.ci.f.replace(Ljava/lang/String;Ljava/lang/String;Landroid/content/ContentValues;)J
69393116	com.tencent.wcdb.database.SQLiteDatabase.replace(Ljava/lang/String;Ljava/lang/String;Landroid/content/ContentValues;)J
69490239	com.tencent.mm.g.c.dd.setType(I)V
69490273	com.tencent.mm.g.c.dd.kX(Ljava/lang/String;)V
69490319	com.tencent.mm.g.c.dd.iq(I)V
69490348	com.tencent.mm.model.r.adI()Ljava/lang/String;
69498473	com.tencent.mm.storage.ap.a(Ljava/lang/String;JZLjava/lang/String;ZLjava/lang/String;)Ljava/lang/String;
69503501	com.tencent.mm.g.c.dd.kY(Ljava/lang/String;)V
69503547	com.tencent.mm.model.bf.qp(Ljava/lang/String;)J
69503817	com.tencent.mm.model.bf.afh()J
69504070	com.tencent.mm.model.cb.afL()J
69530163	java.lang.Math.abs(J)J
70148090	com.tencent.mm.g.c.dd.gb(J)V
70159031	com.tencent.mm.storage.bj.Z(Lcom/tencent/mm/storage/bi;)J
70159311	com.tencent.mm.storage.bj.c(Lcom/tencent/mm/storage/bi;Z)J
70160318	com.tencent.mm.model.bf.qr(Ljava/lang/String;)Lcom/tencent/mm/model/bf$b;
70161349	com.tencent.mm.model.t.pq(Ljava/lang/String;)Z
70371845	com.tencent.mm.plugin.messenger.foundation.a.a.h$b.ac(Lcom/tencent/mm/storage/bi;)V
70377653	com.tencent.mm.g.c.dd.setMsgId(J)V
70391326	com.tencent.mm.storage.o.a(Lcom/tencent/mm/storage/bi;Lcom/tencent/mm/model/bf$b;)Z
70391632	com.tencent.mm.g.c.dd.gc(J)V
70393943	com.tencent.mm.storage.bj.atP(Ljava/lang/String;)J
70394509	com.tencent.mm.storage.aj.asY(Ljava/lang/String;)J
70456318	com.tencent.mm.g.c.dd.iz(I)V
70462647	com.tencent.mm.ci.h.a(Ljava/lang/String;Ljava/lang/String;Landroid/content/ContentValues;)J
70464963	com.tencent.mm.ci.f.insert(Ljava/lang/String;Ljava/lang/String;Landroid/content/ContentValues;)J
70466684	com.tencent.wcdb.database.SQLiteDatabase.insert(Ljava/lang/String;Ljava/lang/String;Landroid/content/ContentValues;)J
70559708	com.tencent.mm.sdk.platformtools.bo.hx(J)J
70593659	com.tencent.mm.plugin.messenger.foundation.a.a.h$c.ad(Lcom/tencent/mm/storage/bi;)Z
72141993	com.tencent.mm.g.c.au.in(I)V
72585232	com.tencent.mm.plugin.wear.model.a.dfW()Lcom/tencent/mm/plugin/wear/model/d;
72585531	com.tencent.mm.plugin.wear.model.a.dfT()Lcom/tencent/mm/plugin/wear/model/a;
72602149	com.tencent.mm.plugin.emoji.model.c$b.<init>(Lcom/tencent/mm/plugin/emoji/model/c;JLjava/lang/String;Lcom/tencent/mm/storage/emotion/EmojiInfo;Ljava/lang/String;)V
72605191	com.tencent.mm.plugin.emoji.f.r.<init>(Ljava/lang/String;Ljava/lang/String;Lcom/tencent/mm/storage/emotion/EmojiInfo;J)V
72605312	com.tencent.mm.plugin.emoji.f.r.<init>(Ljava/lang/String;Ljava/lang/String;Lcom/tencent/mm/storage/emotion/EmojiInfo;JB)V
72606379	com.tencent.mm.protocal.protobuf.cob.<init>()V
72607282	com.tencent.mm.protocal.protobuf.coc.<init>()V
72620278	com.tencent.mm.storage.emotion.d.a(Landroid/content/Context;Lcom/tencent/mm/storage/emotion/EmojiInfo;)V
72620674	com.tencent.mm.storage.emotion.EmojiInfo.bJ(Landroid/content/Context;Ljava/lang/String;)Ljava/io/InputStream;
72627040	android.content.res.Resources.openRawResource(I)Ljava/io/InputStream;
72628955	android.content.res.AssetManager$AssetInputStream.available()I
72629018	android.content.res.AssetManager.access$300(Landroid/content/res/AssetManager;J)J
72629625	com.tencent.mm.protocal.protobuf.zl.<init>()V
72637508	com.tencent.mm.model.bh.afl()Ljava/lang/String;
72637881	com.tencent.mm.model.bh.afk()Ljava/lang/String;
72681434	com.tencent.mm.plugin.emoji.f.r.doScene(Lcom/tencent/mm/network/e;Lcom/tencent/mm/ak/f;)I
72682578	com.tencent.mm.protocal.protobuf.SKBuiltinBuffer_t.<init>()V
72685572	com.tencent.mm.plugin.emoji.f.r.securityVerificationChecked(Lcom/tencent/mm/network/q;)Lcom/tencent/mm/ak/m$b;
72694167	com.tencent.mm.plugin.emoji.model.c.LX(Ljava/lang/String;)V
72698234	com.tencent.mm.plugin.emoji.model.c$1.<init>(Lcom/tencent/mm/plugin/emoji/model/c;Ljava/lang/String;)V
72719676	com.tencent.mm.emoji.c.c.a(ZILjava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V
73048336	com.tencent.mm.plugin.emoji.model.c$1.run()V
73066364	android.app.SharedPreferencesImpl.getLong(Ljava/lang/String;J)J
73067892	com.tencent.mm.plugin.emoji.model.k.brH()Lcom/tencent/mm/plugin/emoji/e/h;
73097627	com.tencent.mm.plugin.emoji.f.k.<init>(Ljava/lang/String;)V
73105134	com.tencent.mm.protocal.protobuf.ajy.<init>()V
73106992	com.tencent.mm.protocal.protobuf.ajz.<init>()V
73125835	com.tencent.mm.g.a.nq.<init>()V
73125867	com.tencent.mm.g.a.nq.<init>(B)V
73126493	com.tencent.mm.g.a.nq$a.<init>()V
73169261	e.a.a.a.c(IILjava/util/LinkedList;)I
73222097	com.tencent.mm.plugin.emoji.f.k.doScene(Lcom/tencent/mm/network/e;Lcom/tencent/mm/ak/f;)I
73228228	com.tencent.mm.plugin.emoji.f.k.securityVerificationChecked(Lcom/tencent/mm/network/q;)Lcom/tencent/mm/ak/m$b;
73245056	e.a.a.c.a.e(IILjava/util/LinkedList;)V
73293847	com.tencent.mm.protocal.protobuf.SKBuiltinBuffer_t.writeFields(Le/a/a/c/a;)V
73973670	com.tencent.mm.view.e.a.dYV()V
74671297	com.tencent.mm.protocal.protobuf.zm.<init>()V
74724412	e.a.a.a.a.ezO()V
74724910	e.a.a.b.a.fE(I)I
74725868	java.lang.StringBuffer.append(I)Ljava/lang/StringBuffer;
74729950	java.lang.StringBuffer.append(J)Ljava/lang/StringBuffer;
75290892	com.tencent.mm.plugin.emoji.f.r.onGYNetEnd(IIILjava/lang/String;Lcom/tencent/mm/network/q;[B)V
75581457	com.tencent.mm.g.c.dd.ga(J)V
75658014	e.a.a.b.a.a.fx(I)[B
75659074	com.tencent.mm.protocal.protobuf.bwc.aqg(Ljava/lang/String;)Lcom/tencent/mm/protocal/protobuf/bwc;
75738499	com.tencent.mm.view.e.a$1.handleMessage(Landroid/os/Message;)V
77387710	com.tencent.mm.ui.base.x.notifyDataSetChanged()V
77389006	android.support.v4.view.q.notifyDataSetChanged()V
77389181	com.tencent.mm.ui.mogic.WxViewPager$e.onChanged()V
77389898	com.tencent.mm.ui.mogic.WxViewPager.dataSetChanged()V
79112117	com.tencent.mm.ui.mogic.WxViewPager.setScrollingCacheEnabled(Z)V
79130571	com.tencent.mm.view.e.a.a(Lcom/tencent/mm/view/e/a;)Z
79130625	com.tencent.mm.view.e.a.b(Lcom/tencent/mm/view/e/a;)Ljava/lang/String;
79651050	com.tencent.mm.storage.emotion.d.K(Lcom/tencent/mm/storage/emotion/EmojiInfo;)Z
80152976	com.tencent.mm.plugin.emoji.f.k.onGYNetEnd(IIILjava/lang/String;Lcom/tencent/mm/network/q;[B)V
99100616	com.tencent.mm.plugin.emoji.model.c.onSceneEnd(IILjava/lang/String;Lcom/tencent/mm/ak/m;)V
102259134	com.tencent.mm.sdk.platformtools.ab.w(Ljava/lang/String;Ljava/lang/String;[Ljava/lang/Object;)V
104175720	com.tencent.mm.plugin.gif.e.<init>(Landroid/content/Context;ZZI[ILjava/lang/String;)V
104175806	com.tencent.mm.plugin.gif.b.<init>()V
104181577	com.tencent.mm.plugin.gif.e$1.<init>(Lcom/tencent/mm/plugin/gif/e;)V
104181739	com.tencent.mm.plugin.gif.e$2.<init>(Lcom/tencent/mm/plugin/gif/e;)V
104243275	com.tencent.mm.plugin.gif.e.onBoundsChange(Landroid/graphics/Rect;)V
143153606	com.tencent.mm.ui.chatting.c.s$2.onTimerExpired()Z
143153879	com.tencent.mm.plugin.priority.a.a.a.a.chY()Z
143154147	com.tencent.mm.plugin.priority.a.a.a.a.chZ()Z
143154415	com.tencent.mm.modelcontrol.b.akj()Z
143167843	com.tencent.mm.modelcontrol.b.tD(Ljava/lang/String;)Z
143168659	com.tencent.mm.modelcontrol.b.akk()I
143181052	java.util.Date.<init>()V
143191615	com.tencent.mm.modelcontrol.b.akl()J
143198723	com.tencent.mm.modelcontrol.b.I(III)Z
143199427	com.tencent.mm.plugin.priority.a.a.a.a.cia()Z
143212163	com.tencent.mm.sdk.platformtools.at.isWifi(Landroid/content/Context;)Z
143212456	com.tencent.mm.sdk.platformtools.at.getNetType(Landroid/content/Context;)I
143219311	com.tencent.mm.ui.chatting.d.a.getFirstVisiblePosition()I
143219591	com.tencent.mm.ui.chatting.ChattingUIFragment.getFirstVisiblePosition()I
143221115	com.tencent.mm.ui.chatting.d.a.getLastVisiblePosition()I
143221394	com.tencent.mm.ui.chatting.BaseChattingUIFragment.getLastVisiblePosition()I
143245876	com.tencent.mm.av.d.alx()V
143246125	com.tencent.mm.av.d.lT(I)V
143949766	com.tencent.mm.plugin.gif.e$2.run()V
143950025	com.tencent.mm.plugin.gif.e.b(Lcom/tencent/mm/plugin/gif/e;)Lcom/tencent/mm/plugin/gif/k;
```

这次得出160个函数，并不必之前分析的125个多出多少，但是多了一组信息：
```
com.tencent.mm.sdk.platformtools.bo.hC(II)I
java.util.Random.<init>(J)V
java.util.Random.setSeed(J)V
java.util.Random.nextInt(I)I
java.util.Random.next(I)I
```
这个骰子是靠随机函数实现的。

## 总结

先总结下本方法的正确操作路径：
- 使用AndroidStudio配置自定义的trace，并勾选足够的内存（200MB）
- 保存至少2次trace文件用作分析，触发目标次数最好的是质数次，如果内存有限制，可以适当变化。
- 使用AppMethodOrder对trace文件文本化，不要过滤包名（按空格进行过滤即可），也不要自己写代码处理，该工具处理速度已经很快了，处理后的函数调用只有ent的，xit的已经去掉。
- 文本日志文件只保留第4列的函数签名。
- 进行重复过滤，只保留触发次数的函数（这一步可能要手动复制出来了，没有找到合适的命令行）。
- 求交集，得出函数序列，关键call就在其中。
- 恢复函数前后顺序（通过脚本查询文本日志后排序）。
- 人工分析，自动化生成frida脚本验证等方法找出关键call。


最后再对比下三种方法：

| / | 插桩日志分析法 | 借助加固 | trace分析法|
|--|--|--|--|
| 实现难度 |低  |高  | 低  |
|本质  | 日志分析  |日志分析或签名过滤  | 日志分析 |
| 限制条件 |App无校验无保护，可反编译且可回编译  | App无校验无保护 |  无 |
|侵入性  | 高 |略高  | 无 |

## 待续
- 这个trace网上说是“利用 Android Runtime 函数调用的 event 事件”生成的，包含了调用的关系，可以使用类似[dmtracedump 使用方法实战](https://blog.csdn.net/linglaoli/article/details/87894721)的方法生成调用图。
- 如果需要经常逆向分析App，可以将上述流程写成自动化的工具或脚本，提高分析效率。
- 另外有兴趣的可以分析Android系统底层的这个trace机制的实现原理，有助于对安卓系统的学习研究。

