﻿---
layout:		post
category:	"sec"
title:		"CE-CheatEngine使用汇总记录"

tags:		[]
---
- Content
{:toc}


# 基础操作

## 中文语言

从 [Chinese Simplified translation files (ch_CN)](https://www.cheatengine.org/download/ch_cn.zip) 下载简体中文语言包，解压`ch_cn`到CE的安装目录下 `languages` 文件夹里，修改 文件 `language.ini` 的内容：`PreferedLanguage=ch_cn`  即可完成中文语言配置。

## 内存搜索

- 二进制数据（字节数组）搜索：勾选Hex，搜索类型：Search for this array ， 值类型：Array of byte ， 搜索内容填写示例：`30 20 31 20 20 32 32 20 `

## 锁定数值

- 点地址列表前面复选框锁定数值（或者右键后选择**锁定选中的地址** Toggle selected Records），或者按下空格键。

## 多级指针

- 如果知道offset偏移量可以指定提高搜索速度，如果不知道就不要勾选该项。搜索的层级可以逐渐加大，默认从1开始。

## 结构分析

- 手动输入地址分析（不推荐但必要时可使用，因为需要手动减去偏移量offset）：

  - 通过搜索手段找到数据地址；
  - 通过查看访问修改地址找到指令，以及计算正确的偏移量offset；
  - 从指令这里打开汇编窗口，点击菜单：工具 - 分析数据/结构（Ctrl + D）进入数据分析窗口；
  - 手动添加分组和每组里的数据，需要注意的是这里的数据一定要减去offset，点击菜单：结构 - 定义新的结构，开始自动分析。
- 自动化（推荐，无须手动减去offset，CE会自动推测）：

  - 参考教程练习的`Step9`，主要路径是：通过访问地址的指令，右键查看还访问了什么地址，追踪到地址列表后，右键选择进行数据结构分析即可。




# 搜索技巧

## 谁读谁写

CE中对地址进行搜索，主要是想知道数据的相对偏移，或者地址的地址。主要方法：搜索到数据后，添加地址到列表，右键使用功能：找出是什么访问了这个地址（是什么改写了这个地址）



## 指针扫描

很好很强大



## 对象基址

通过指针及`offset` 找到基址后，在结构分析窗口中，选择菜单 文件-**添加额外的地址** ，**然后根据基址中的地址展开来看数据结构 可以找到很多信息**

[How To Find Offsets, Entity Addresses & Pointers](https://www.youtube.com/watch?v=YaFlh2pIKAg) 



## 数值变化

例如CE找人物坐标找敌人坐标：

- 先找Y坐标，人物上上下下，不断搜索减少或者增加的数值，确定Y坐标后，X坐标基本都是挨着的。
- 敌人固定不动，自己上下动，找相对大小的数值。



## 锁定筛选

CE批量锁定或修改进行筛选。N次扫描后结果仍然很多，可以批量导入到下面地址列表，利用二分法进行批量锁定（多选后按空格键锁定），不是的地址删除之，逐步缩小范围找到内存地址。



## 任意组合

变了，不变，大了还是小了，减少了多少，增加了多少。

# 教程练习

CE目录下的`Tutorial-i386.exe`就是练习用的程序。



## Step5 代码查找（谁写了地址）

该题目的内存地址不是固定的，

1. 先找到数据的内存地址；
2. 右键选择「查看谁写了该内存地址」，会弹出一个对话框；
3. 触发一次修改数据，对话框里会出现指令；
4. 点击「替换」，把该条指令替换为nop。



## Step6 二级指针（地址的地址 含offset偏移量）

**方法1：访问/修改内存的指令**

1. 搜索到地址后，查看谁访问或修改了数值。

2. 改变数值后，会输出一些访问/修改了数值的汇编列表。

3. 逐个双击查看汇编，检查程序猜测的地址是否和内存地址一致，不一致的排除，一致的继续分析汇编指令。分析中括号里的表达式，来找offset，并计算出offset值。例如汇编如下：

   ```assembly
   10002D142 - mov rdx, [100325AD0]
   10002D14C - mov [rdx], eax
   ```

   则 100325AD0 就是我们想要找的内存地址，offset是0。如果是`mov [rdx + 0x10], eax` ，则offset就是0x10，如果是 `[EAX*2+EDX+00000310] eax=4C and edx=00801234.`，则 edx 就是地址，其他的表达式加起来就是offset，也即 `EAX*2+00000310` ，这个时候要看EAX寄存器的数值是多少，自己计算出最终的offset。

4. 回到CE主界面，手动添加内存地址。填上 `100325AD0`  ，注意勾选 `Pointer`，并填上偏移量`offset`的值。这样地址列表会出现：`P->016D9710`类似这样的项，就是地址的地址。



**方法2：搜索指针地址**

该方法很强大，非常适合**多级指针**地址搜索。

1. 先通过数值搜索找到数值的内存地址，例如：01628BC0 ，添加到地址列表。
2. 对 01628BC0 这个地址右键进行 `Pointer scan for this address`，弹出的对话框大部分选项默认。`Pointers must end with specific offsets` 不勾选，也就是说我们也不知道偏移量是多少。Max level 第一次搜索可以设置为1，如果搜索不到后面可以逐渐增加1进行搜索。确定后，弹出需要保存的文件，随便填个就行。
3. 搜索片刻便有结果，如果搜索结果不理想，可以在上面一部的选项参数做适当调整再搜索。搜索到的结果直接双击即可添加到地址列表。
4. 如果搜索结果有多条，可以让数据发生变化进行观察排除。



## Step7 注入代码实现逻辑修改

1. 先通过数值搜索找到数值的内存地址，添加到地址列表。
2. 设置查看谁修改了这个地址，触发数据变动，弹出指令，双击打开汇编窗口。
3. 在汇编窗口中选择菜单：Tools - Auto Assemble （或者快捷键Ctrl + A）,在弹出的窗口中选择菜单：Template - Code Injection，然后确定 - 在代码模板中的 `//place your code here` 下面添加想要注入的代码，例如本关是想要加2，因为本身逻辑要减1，是故这个代码应该是：`add dword ptr [rsi+000007E0],03`
4. 点击 执行，是。是否立即跳转，点否。



## Step8 多级指针

**方法1：逐个地址搜索**

这个也是笨方法。

1. 先通过数值搜索找到数值的内存地址，添加到地址列表。
2. 搜索上一步得到的地址，如果搜索到就添加到地址列表并继续搜索。如果搜索不到就找谁访问的地址，找到偏移值和预测的地址。
3. 再把这个地址重复上述步骤，一直到内存地址找到是绿色地址为止。

**方法2：自动指针搜索**

1. 先通过数值搜索找到数值的内存地址，添加到地址列表。
2. 右键地址，进行地址指针搜索，因为题目知道是4级指针，因此在Max level里填4，offset那个选项依然不要勾选，因为我们不知道偏移量。
3. 搜索的结果很多，这个时候点击题目中的按钮「change pointer」，再回到搜索结果中查看，发现很多数据已经无效了，可以很快找到正确的地址。



## Step9 共享代码

1. 先通过数值搜索找到数值的内存地址（float类型），添加到地址列表。

2. 找到地址后找访问指令，对指令右键选择：`找出代码访问的地址` （推荐）。会弹出一个小窗口，这个时候操作教程的按钮，会动态列出地址。或者对指令右键选择：`Check if found opcodes also access other addresses (max 8)`，然后回到教程中点击其他按钮触发血量变化。然后点右侧工具栏的`More Information` 会弹出Extra info窗口及窗口：`Accessed addresses by xxxx`，也即该指令还访问了哪些地址。该教程里会列出4个地址列表。

3. 选中这4个地址列表，右键选择：`dissect data`（或者Ctrl + D）进行数据结构分析。弹出的窗口点确定。进而会进入数据对比窗口。需要注意的是，CE会自动减去`offset`做数据校准。

4. 如果是相同的对象，则第一条地址的内容是相同的，其实就是函数表指针。然后向后观察个字段的内容差异（红色高亮部分）。【**注意**】：如果自动分析显示的不对时，可以手动添加字段，就是强制按照指定的去拆解字段：右键菜单选择`Add Element`，然后手动输入偏移和类型。

5. 该关卡是在对象的`offset=0x14`字段来区分敌我双方（数值为1与2之分）。

6. 注入代码。关闭数据结构对比窗口，进入汇编窗口，做代码注入：

   ```assembly
   alloc(newmem,2048,"Tutorial-x86_64.exe"+2F25D) 
   label(returnhere)
   label(originalcode)
   label(exit)
   
   newmem: //this is allocated memory, you have read,write,execute access
   //place your code here
   cmp [rbx+14], 1
   je exit
   
   originalcode:
   movss [rbx+08],xmm0
   
   exit:
   jmp returnhere
   
   "Tutorial-x86_64.exe"+2F25D:
   jmp newmem
   returnhere:
   ```

   

## 图形关卡1

通关思路：

- 子弹加多或无限；
- 目标血量减少；

通过搜索发现子弹数量搜索不到，可能在内存中有所加密。从目标血量入手：

- 初始搜索未知的初始值，数值类型：4字节；
- 血量减少后，搜索减少的值，静默一会搜索未变的数值。
- 然后再次血量减少，搜索减少的值，静默一会搜索未变的数值。
- 找到血量地址后（血量初始值是100），修改血量为一个较小的值，例如为1（不可直接修改为0或负数），然后再打一次子弹，即可通关。

该关卡主要考察：未知初始值的搜索、其他搜索组合等。子弹数量有一定的迷惑性。



## 图形关卡2

考察共享代码、数据结构分析、代码注入。通关思路：

- 精确数值搜索4字节找到我方血量地址；
- 找谁写了这个地址，然后定位到指令，查看其他地址，会获取3个地址，1个是我方的2个是敌方的，右键进入数据结构分析；
- 0x70偏移处是敌我之分的标志，0是我方，1是敌方。
- 代码注入：

```assembly
alloc(newmem,2048,"gtutorial-x86_64.exe"+400E3) 
label(returnhere)
label(originalcode)
label(exit)

newmem: //this is allocated memory, you have read,write,execute access
//place your code here
cmp [rax+70],0
je exit
mov edx, 1000		// 增加伤害加快敌方死亡速度，否则攻击很慢

originalcode:
sub [rax+60],edx

exit:
jmp returnhere

"gtutorial-x86_64.exe"+400E3:
jmp newmem
returnhere:
ret					// 需要注意，默认代码模板会把ret放在 originalcode 里，导致注入后的代码有问题导致崩溃，一定要检查。
```

x86版本的注入代码为：

```assembly
alloc(newmem,2048)
label(returnhere)
label(originalcode)
label(exit)

newmem: //this is allocated memory, you have read,write,execute access
//place your code here
cmp [eax+5C],0
je exit
mov edx, 1000

originalcode:
sub [eax+50],edx

exit:
jmp returnhere

"gtutorial-i386.exe"+385A0:
jmp newmem

returnhere:
ret
```



## 图形关卡3



# 其他练习

- 植物大战僵尸

```
修改植物攻击速度 攻击力
无限种植
修改阳光
解锁植物
解锁迷雾
自动拾取阳光 拾取时对阳光数有修改 结合回溯方法找到call
植物无冷却
卡片槽全满
```

- 搜索系统进城里Windows登录密码
- 搜索邮箱、聊天软件里的信息

# 参考

- [CE官网](https://www.cheatengine.org/) 
- [Chinese Simplified translation files (ch_CN)](https://www.cheatengine.org/download/ch_cn.zip)
- [CE修改器使用教程 [入门篇]](https://www.cnblogs.com/LyShark/p/10799926.html)
- 
