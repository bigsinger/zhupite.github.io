---
layout:		post
category:	"sec"
title:		"使用IDA修改一个字节实现微信消息防撤回"

tags:		[微信,IDA]
---
- Content
{:toc}
**关键词**：IDA，特征码，微信消息防撤回



微信的主要功能在 **WeChatWin.dll** 这个文件里，所以直接分析它就好。该文件还是32位的程序，没有壳，所以很适合练手。网上分析微信的资料也很多，通过搜集资料知道微信是使用的duilib开发的界面，使用过duilib的应该知道，代码中很容易出现界面相关的字符串，这个就是很容易找到突破口的点。

具体分析不做了，直接找了热心网友改好的DLL，进行同版本对比，站在巨人的肩膀上往往比较快捷轻松。使用**BeyondCompare**进行十六进制对比，很快找到微信防撤回的实现点，就是改了一个字节。

把指令：

```asm
test  eax, eax	;85 C0
```

修改为了：

```asm
xor eax, eax	;33 C0
```



为了能够持续使用消息防撤回的功能，我们可以把方法记录下来，万一哪天微信又升级了版本导致了老版本失效，或者没有热心网友提供修改后的文件时，至少自己也可以快速手动改一个出来。

下面就看下这个代码是如何定位的，只要能定位到，就很容易改了。



使用IDA打开 **WeChatWin.dll** ，需要对IDA做一下设置：

- **在Text mode下显示十六进制指令**：菜单Options - General - Disassembly，设置Number of opcode bytes(non-graph)为10，默认是0不显示十六进制指令。

  

在BeyondCompare里直接复制（CTRL + C就行）上面指令附近的二进制串，然后在IDA里按下 ALT + B 进行搜索，直接粘贴进去即可（CTRL + V），无须剔除空格。

搜索到如下代码：

```asm
.text:10342BBB       loc_10342BBB:                           ; CODE XREF: sub_103429B0+1A7↑j
.text:10342BBB 68 38 0B 8F 11                                push    offset aType    ; "type"
.text:10342BC0 8B CF                                         mov     ecx, edi
.text:10342BC2 E8 79 E7 8F 00                                call    sub_10C41340
.text:10342BC7 85 C0                                         test    eax, eax
.text:10342BC9 74 32                                         jz      short loc_10342BFD
.text:10342BCB B9 50 53 95 11                                mov     ecx, offset aRevokemsg_2 ; "revokemsg"
```

看到了一个很容易理解的字符串：**revokemsg**，顾名思义，就是跟消息撤回有关的。在IDA里选中该字符串，然后按Enter键定位到该字符串的定义处，查看其引用，发现就一处引用，点击该引用就又跳回上面的代码处。

这下就简单多了，只要在IDA里查看字符串窗口（Shift+F12），搜索字符串**revokemsg**（直接输入这几个字符，IDA即可自动搜索），搜索到后双击定位到该字符串的定义处，然后再双击它的引用，就定位到了代码处，然后参考上面的代码块修改指令。



具体修改的操作为：

- 鼠标放在待修改的十六进制数值上
- 选择菜单Edit - Patch prodram - Change byte（或Assembly）
- 在弹出的对话框中输入目标数值（或指令），确定
- 应用patch到文件，选择菜单Edit - Patch prodram - Apply patches to input file，勾选「创建备份」然后确定即可。



至此已经解决了我们的问题，但是可以更进一步，如果上面的字符串变化了，万一搜索不到怎么办？这里可以记录下上面指令块前后的指令，作为特征，直接通过二进制搜索来定位。

我们先把上下关联的指令先复制下来备用，这里以微信3.3.5.50版本为例，在上面的指令块的前面找了下面比较有特点的指令：

```asm
.text:10342BA6 68 2A 04 00 00                                push    42Ah
.text:10342BAB C6 00 02                                      mov     byte ptr [eax], 2
.text:10342BAE 89 70 08                                      mov     [eax+8], esi
.text:10342BB1 E8 4A 27 2B 00                                call    sub_105F5300
.text:10342BB6 83 C4 70                                      add     esp, 70h
.text:10342BB9 EB 42                                         jmp     short loc_10342BFD
```

IDA里搜索特征码（ALT + B， 任意一个均可以）：

```
68 ?? 04 00 00 C6 00 02 89 70 08 
E8 ?? ?? ?? 00 83 C4 70  EB 42
```

搜索到后，向下附近找一找test eax, eax。

2022年3月15日验证3.6版本依然有效。
