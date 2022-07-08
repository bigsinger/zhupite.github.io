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
68 ?? 04 00 00 C6 00 02 89 70 08 （有效）
E8 ?? ?? ?? 00 83 C4 70 EB 42  （有效，但存在多个）
```

搜索到后，向下附近找一找test eax, eax。

2022年7月8日验证3.7版本依然有效。



# 另一组特征

支持多开和消息防撤回

## 多开

IDA里先找导出函数：**StartWechat**，然后向下找到如下代码，把 jz 修改为 jmp 即可：

```assembly
.text:1042E03A C7 85 D8 FC FF FF 02 00 00 00                 mov     dword ptr [ebp-328h], 2
.text:1042E044 89 8D 0C FF FF FF                             mov     [ebp-0F4h], ecx
.text:1042E04A E8 C1 5F CB FF                                call    sub_100E4010
.text:1042E04F 80 7D F2 00                                   cmp     byte ptr [ebp-0Eh], 0
.text:1042E053 6A 01                                         push    1
.text:1042E055 74 4B                                         jz      short loc_1042E0A2
```

搜索特征：

```assembly
.text:1042DFB7 33 C9                                         xor     ecx, ecx
.text:1042DFB9 33 D2                                         xor     edx, edx
.text:1042DFBB C7 85 D0 FC FF FF 10 27 00 00                 mov     [ebp+var_330], 2710h
.text:1042DFC5 83 F8 39                                      cmp     eax, 39h ; '9'
.text:1042DFC8 89 8D 0C FF FF FF                             mov     [ebp+var_F4], ecx
.text:1042DFCE 0F 45 C2                                      cmovnz  eax, edx
```

特征码提炼为：

```
33 C9 33 D2 C7 85 ?? ?? FF FF ?? ?? 00 00 83 F8 39 89 8D ?? FF FF FF 0F 45 C2
```

或：

```assembly
.text:1042E005 7F 30                                         jg      short loc_1042E037
.text:1042E007 7C 09                                         jl      short loc_1042E012
.text:1042E009 83 BD A0 FC FF FF 00                          cmp     [ebp+var_360], 0
.text:1042E010 77 25                                         ja      short loc_1042E037
.text:1042E012
.text:1042E012                               loc_1042E012:                           ; CODE XREF: sub_1042DD00+307↑j
.text:1042E012 E8 F9 5F CB FF                                call    sub_100E4010
.text:1042E017 6A 01                                         push    1
.text:1042E019 33 D2                                         xor     edx, edx
.text:1042E01B 8B CF                                         mov     ecx, edi
```

特征码提炼为：

```
7F ?? 7C ?? 83 BD ?? ?? FF FF 00 77
7F ?? 7C ?? 83 BD ?? ?? FF FF 00 77 ?? E8 ?? ?? ?? FF 6A 01 33 D2 8B CF
```

然后向下找：

```assembly
.text:1042E053 6A 01                                         push    1
.text:1042E055 74 4B                                         jz      short loc_1042E0A2
```



## 消息防撤回

找到如下代码，把最后一个 jz 修改为 jmp 即可：

```assembly
.text:10D7DDC2 74 09                                         jz      short loc_10D7DDCD
.text:10D7DDC4 56                                            push    esi
.text:10D7DDC5 E8 4B DE D4 00                                call    sub_11ACBC15
.text:10D7DDCA 83 C4 04                                      add     esp, 4
.text:10D7DDCD
.text:10D7DDCD                               loc_10D7DDCD:                           ; CODE XREF: StartWechat+1D2↑j
.text:10D7DDCD 8B 85 D4 FB FF FF                             mov     eax, [ebp-42Ch]
.text:10D7DDD3 85 C0                                         test    eax, eax
.text:10D7DDD5 74 09                                         jz      short loc_10D7DDE0
.text:10D7DDD7 50                                            push    eax
.text:10D7DDD8 E8 38 DE D4 00                                call    sub_11ACBC15
.text:10D7DDDD 83 C4 04                                      add     esp, 4
.text:10D7DDE0
.text:10D7DDE0                               loc_10D7DDE0:                           ; CODE XREF: StartWechat+1E5↑j
.text:10D7DDE0 80 BD 07 FC FF FF 00                          cmp     byte ptr [ebp-3F9h], 0
.text:10D7DDE7 74 58                                         jz      short loc_10D7DE41
```



搜索特征：

```
.text:10D7DD85 50                                            push    eax
.text:10D7DD86 6A 00                                         push    0
.text:10D7DD88 6A 00                                         push    0
.text:10D7DD8A FF 15 50 A3 CE 11                             call    ds:CreateMutexW
.text:10D7DD90 8B F8                                         mov     edi, eax
.text:10D7DD92 C6 85 07 FC FF FF 00                          mov     byte ptr [ebp-3F9h], 0
.text:10D7DD99 85 FF                                         test    edi, edi
.text:10D7DD9B 74 23                                         jz      short loc_10D7DDC0
.text:10D7DD9D FF 15 F8 A2 CE 11                             call    ds:__imp_GetLastError
```

特征码提炼为：

```
50 6A 00 6A 00 FF 15 ?? ?? ?? ?? 8B F8 C6 85 ?? ?? FF FF 00 85 FF 74
```

搜到后向下找到：

```
mov     edi, ds:FindWindowW
```

上一个 jz 指令就是。



或使用搜索特征：

```
.text:10D7DDF6 FF D7                                         call    edi ; FindWindowW
.text:10D7DDF8 8B F0                                         mov     esi, eax
.text:10D7DDFA 85 F6                                         test    esi, esi
.text:10D7DDFC 75 0E                                         jnz     short loc_10D7DE0C
.text:10D7DDFE 50                                            push    eax
.text:10D7DDFF 68 8C B9 F1 11                                push    offset aWechatloginwnd ; "WeChatLoginWndForPC"
.text:10D7DE04 FF D7                                         call    edi ; FindWindowW
.text:10D7DE06 8B F0                                         mov     esi, eax
.text:10D7DE08 85 F6                                         test    esi, esi
.text:10D7DE0A 74 35                                         jz      short loc_10D7DE41
.text:10D7DE0C
.text:10D7DE0C                               loc_10D7DE0C:                           ; CODE XREF: StartWechat+20C↑j
.text:10D7DE0C 6A 01                                         push    1
.text:10D7DE0E 56                                            push    esi
.text:10D7DE0F FF 15 B8 A9 CE 11                             call    ds:SwitchToThisWindow
.text:10D7DE15 56                                            push    esi
.text:10D7DE16 FF 15 BC A9 CE 11                             call    ds:BringWindowToTop
.text:10D7DE1C 6A 00                                         push    0
.text:10D7DE1E 68 E8 03 00 00                                push    3E8h
.text:10D7DE23 6A 02                                         push    2
.text:10D7DE25 6A 00                                         push    0
.text:10D7DE27 6A 00                                         push    0
.text:10D7DE29 68 E0 0B 00 00                                push    0BE0h
.text:10D7DE2E 56                                            push    esi
.text:10D7DE2F FF 15 54 A9 CE 11                             call    ds:SendMessageTimeoutW
.text:10D7DE35 85 F6                                         test    esi, esi
.text:10D7DE37 74 08                                         jz      short loc_10D7DE41
.text:10D7DE39 83 CF FF                                      or      edi, 0FFFFFFFFh
.text:10D7DE3C E9 85 07 00 00                                jmp     loc_10D7E5C6
```



特征码提炼为：

```
6A 01 56 FF 15 ?? ?? ?? ?? 56 FF 15 ?? ?? ?? ??
或
6A 00 68 ?? ?? 00 00 6A 02 6A 00 6A 00 68
6A 00 68 ?? ?? 00 00 6A 02 6A 00 6A 00 68 ?? ?? 00 00 56 FF 15 ?? ?? ?? ?? 85 F6 74
```

搜到后向上找到：

```
mov     edi, ds:FindWindowW
```

上一个 jz 指令就是。
