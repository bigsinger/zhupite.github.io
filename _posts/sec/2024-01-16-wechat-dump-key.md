---
layout:		post
category:	"sec"
title:		"WX微信WeChat内存取证dump手机号微信号key"

tags:		[]
---
- Content
{:toc}


# 4.0.2.17

- 先搜索当前登录微信对应的电话号码，这个搜索结果一般不多（一般第一个就是我们想要的结果），逐个CTRL+B查看内存，并向上滚动几行看看是否有对应的微信注册账号，如果有就记录下微信账号开始的地址`pAccount`。
- 将`pAccount`添加到内存地址列表，并对其进行地址扫描，扫描深度设置为2，将得到的结果作为偏移供代码使用。

```xml
<?xml version="1.0" encoding="utf-8"?>
<CheatTable>
  <CheatEntries>
    <CheatEntry>
      <ID>23</ID>
      <Description>"account"</Description>
      <LastState RealAddress="1C82F631568"/>
      <ShowAsSigned>0</ShowAsSigned>
      <VariableType>String</VariableType>
      <Length>10</Length>
      <Unicode>0</Unicode>
      <CodePage>0</CodePage>
      <ZeroTerminate>1</ZeroTerminate>
      <Address>"Weixin.dll"+08916E90</Address>
      <Offsets>
        <Offset>58</Offset>
        <Offset>60</Offset>
      </Offsets>
    </CheatEntry>
    <CheatEntry>
      <ID>24</ID>
      <Description>"account"</Description>
      <LastState RealAddress="1C82F631568"/>
      <ShowAsSigned>0</ShowAsSigned>
      <VariableType>String</VariableType>
      <Length>10</Length>
      <Unicode>0</Unicode>
      <CodePage>0</CodePage>
      <ZeroTerminate>1</ZeroTerminate>
      <Address>"Weixin.dll"+08916E90</Address>
      <Offsets>
        <Offset>48</Offset>
        <Offset>58</Offset>
      </Offsets>
    </CheatEntry>
  </CheatEntries>
</CheatTable>
```

- key没有发现规律，不过可以参考 **[wechat-dump-rs](https://github.com/0xlane/wechat-dump-rs)** 进行暴力内存搜索。

----

如下为V4版本之前的方法。

# 分析过程

## CE分析（推荐）

### 1、指针扫描（推荐）

这个就更简单了，搜索微信账号，得两条地址，进行多级指针扫描，层级设置为2。通过结果数据查看指针关系及偏移量，很快就能得到想要的了。

从一级指针的地址很容易找到 `3DFD3F0` 这个地址。一共可以找到两个这样的地址，分别是：`7FF899E5D3F0`  和  `7FF899E5D100` 。接着使用CE的结构分析功能，分别对这两个地址做结构分析，CE自动识别出结构类型分别为：`AccountService` 和 `CheckResUpdateMgr`，真是太强大了。通过浏览数据结构可以很快找到我们想要的数据，偏移量`offset`也可以很直观地得到。

以 `AccountService（7FF899E5D3F0 ）`为例，可以很快得到如下字段信息：

| 项                   | 偏移  |
| -------------------- | ----- |
| 注册微信ID字符串     | 0x80  |
| 注册微信ID字符串长度 | 0x90  |
| 省份字符串           | 0x188 |
| 省份字符串长度       | 0x198 |
| 城市字符串           | 0x1A8 |
| 城市字符串长度       | 0x1B8 |
| 微信账号             | 0x720 |
| 微信账号长度         | 0x730 |
| 注册微信ID字符串     | 0x740 |
| 注册微信ID字符串长度 | 0x750 |
| 手机型号字符串       | 0x790 |
| 手机型号字符串长度   | 0x7A0 |

这些都是很容易明显看出来的，其他的字段信息可以直接在内存中去看。



### 2、地址访问

搜索微信账号，会有两条记录，都查看谁访问。
第一个地址的触发条件有：

1. 点击自己的微信头像
2. 在文件传输助手里给自己发个信息，点击自己头像
3. 点击设置



点头像触发指令：
`7FF896A51FDD - 0F10 06  - movups xmm0,[rsi]`

查看汇编代码：

```assembly
WeChatWin.dll+9F1FAF - E8 5CC5F5FF           - call WeChatWin.dll+94E510
WeChatWin.dll+9F1FB4 - 48 8D B0 08010000     - lea rsi,[rax+00000108]
WeChatWin.dll+9F1FBB - 33 DB                 - xor ebx,ebx
WeChatWin.dll+9F1FBD - 48 89 5D E7           - mov [rbp-19],rbx
WeChatWin.dll+9F1FC1 - 48 89 5D F7           - mov [rbp-09],rbx
WeChatWin.dll+9F1FC5 - 48 89 5D FF           - mov [rbp-01],rbx
WeChatWin.dll+9F1FC9 - 4C 8B 76 10           - mov r14,[rsi+10]
WeChatWin.dll+9F1FCD - 48 83 7E 18 10        - cmp qword ptr [rsi+18],10 { 16 }
WeChatWin.dll+9F1FD2 - 72 03                 - jb WeChatWin.dll+9F1FD7
WeChatWin.dll+9F1FD4 - 48 8B 36              - mov rsi,[rsi]
WeChatWin.dll+9F1FD7 - 49 83 FE 10           - cmp r14,10 { 16 }
WeChatWin.dll+9F1FDB - 73 11                 - jae WeChatWin.dll+9F1FEE
WeChatWin.dll+9F1FDD - 0F10 06               - movups xmm0,[rsi]
```

点击设置触发指令：
`7FF896ED9858 - 0F10 06  - movups xmm0,[rsi]`

查看汇编代码：

```assembly
WeChatWin.dll+E7982C - E8 DF4CADFF           - call WeChatWin.dll+94E510
WeChatWin.dll+E79831 - 4C 89 65 EF           - mov [rbp-11],r12
WeChatWin.dll+E79835 - 4C 89 65 FF           - mov [rbp-01],r12
WeChatWin.dll+E79839 - 4C 89 65 07           - mov [rbp+07],r12
WeChatWin.dll+E7983D - 48 8D B0 08010000     - lea rsi,[rax+00000108]
WeChatWin.dll+E79844 - 4C 8B 76 10           - mov r14,[rsi+10]
WeChatWin.dll+E79848 - 48 83 7E 18 10        - cmp qword ptr [rsi+18],10 { 16 }
WeChatWin.dll+E7984D - 72 03                 - jb WeChatWin.dll+E79852
WeChatWin.dll+E7984F - 48 8B 36              - mov rsi,[rsi]
WeChatWin.dll+E79852 - 49 83 FE 10           - cmp r14,10 { 16 }
WeChatWin.dll+E79856 - 73 11                 - jae WeChatWin.dll+E79869
WeChatWin.dll+E79858 - 0F10 06               - movups xmm0,[rsi]
```



第二个地址的触发条件：随便点开一个有未读消息的群。
触发指令：
`7FF8973FC50D - 0F10 07  - movups xmm0,[rdi]`

查看汇编代码：

```assembly
WeChatWin.dll+139C4D7 - E8 34205BFF           - call WeChatWin.dll+94E510
WeChatWin.dll+139C4DC - 48 89 5D 50           - mov [rbp+50],rbx
WeChatWin.dll+139C4E0 - 48 89 5D 60           - mov [rbp+60],rbx
WeChatWin.dll+139C4E4 - 48 89 5D 68           - mov [rbp+68],rbx
WeChatWin.dll+139C4E8 - 48 8D B8 20070000     - lea rdi,[rax+00000720]
WeChatWin.dll+139C4EF - 48 8B 77 10           - mov rsi,[rdi+10]
WeChatWin.dll+139C4F3 - 48 83 7F 18 10        - cmp qword ptr [rdi+18],10 { 16 }
WeChatWin.dll+139C4F8 - 72 03                 - jb WeChatWin.dll+139C4FD
WeChatWin.dll+139C4FA - 48 8B 3F              - mov rdi,[rdi]
WeChatWin.dll+139C4FD - 48 B8 FFFFFFFFFFFFFF7F - mov rax,7FFFFFFFFFFFFFFF { -1 }
WeChatWin.dll+139C507 - 48 83 FE 10           - cmp rsi,10 { 16 }
WeChatWin.dll+139C50B - 73 11                 - jae WeChatWin.dll+139C51E
WeChatWin.dll+139C50D - 0F10 07               - movups xmm0,[rdi]
```

函数 `WeChatWin.dll+94E510` 就是 `getXObjAddr` ，注意向下看偏移量。



## 调试器分析

先通过CE进行内存搜索微信号（其他信息同理），找到地址后，使用调试器对该地址下内存访问断点，中断在：

```assembly
000000018139D8CA 4C 8D A0 20 07 00 00                          lea     r12, [rax+720h]	;访问微信号地址
```

然后查看上下文的代码：

```assembly
000000018139D89D 48 8D 15 3C 15 14 02                          lea     rdx, aWechatFiles ; "\\WeChat Files\\"
000000018139D8A4 48 8B C8                                      mov     rcx, rax
000000018139D8A7 E8 F8 1D A8 01                                call    sub_182E1F6A4
000000018139D8AC 66 41 89 7E 1C                                mov     [r14+1Ch], di
000000018139D8B1 45 8B EF                                      mov     r13d, r15d
000000018139D8B4 44 89 7C 24 50                                mov     dword ptr [rsp+150h+var_100], r15d
000000018139D8B9 E8 52 0C 5B FF                                call    sub_18094E510	;获取某个地址
000000018139D8BE 48 89 7D D8                                   mov     qword ptr [rbp+50h+var_78], rdi
000000018139D8C2 48 89 7D E8                                   mov     [rbp+50h+var_68], rdi
000000018139D8C6 48 89 7D F0                                   mov     [rbp+50h+var_60], rdi
000000018139D8CA 4C 8D A0 20 07 00 00                          lea     r12, [rax+720h]	;访问微信号地址
000000018139D8D1 49 8B 44 24 10                                mov     rax, [r12+10h]
000000018139D8D6 48 89 44 24 40                                mov     [rsp+150h+var_110], rax
000000018139D8DB 49 83 7C 24 18 10                             cmp     qword ptr [r12+18h], 10h
000000018139D8E1 72 04                                         jb      short loc_18139D8E7
000000018139D8E3 4D 8B 24 24                                   mov     r12, [r12]
000000018139D8E7
000000018139D8E7                               loc_18139D8E7:                          ; CODE XREF: sub_18139D800+E1↑j
000000018139D8E7 48 B9 FF FF FF FF FF FF FF 7F                 mov     rcx, 7FFFFFFFFFFFFFFFh
000000018139D8F1 48 83 F8 10                                   cmp     rax, 10h
000000018139D8F5 73 13                                         jnb     short loc_18139D90A
000000018139D8F7 41 0F 10 04 24                                movups  xmm0, xmmword ptr [r12]
000000018139D8FC 0F 11 45 D8                                   movups  [rbp+50h+var_78], xmm0
000000018139D900 48 C7 45 F0 0F 00 00 00                       mov     [rbp+50h+var_60], 0Fh
000000018139D908 EB 37                                         jmp     short loc_18139D941
000000018139D90A                               ; ---------------------------------------------------------------------------
000000018139D90A
000000018139D90A                               loc_18139D90A:                          ; CODE XREF: sub_18139D800+F5↑j
000000018139D90A 48 8B D8                                      mov     rbx, rax
000000018139D90D 48 83 CB 0F                                   or      rbx, 0Fh
000000018139D911 48 3B D9                                      cmp     rbx, rcx
000000018139D914 48 0F 47 D9                                   cmova   rbx, rcx
000000018139D918 48 8D 4B 01                                   lea     rcx, [rbx+1]
000000018139D91C E8 DF 76 59 FF                                call    sub_180935000
```

`sub_18094E510`函数代码如下，可以看出来这个函数返回一个地址：

```assembly
000000018094E510                               ; __int64 __fastcall sub_18094E510(_QWORD, _QWORD, _QWORD)
000000018094E510                               sub_18094E510   proc near               ; CODE XREF: sub_18093BA20+4D4↑p
000000018094E510                                                                       ; sub_180949800+C31↑p ...
000000018094E510                               ; __unwind { // sub_182DFDB48
000000018094E510 48 83 EC 28                                   sub     rsp, 28h
000000018094E514 8B 0D 9A BD 43 03                             mov     ecx, cs:TlsIndex
000000018094E51A 65 48 8B 04 25 58 00 00 00                    mov     rax, gs:58h
000000018094E523 BA C4 00 00 00                                mov     edx, 0C4h
000000018094E528 48 8B 0C C8                                   mov     rcx, [rax+rcx*8]
000000018094E52C 8B 04 0A                                      mov     eax, [rdx+rcx]
000000018094E52F 39 05 AB EE 4A 03                             cmp     cs:dword_183DFD3E0, eax
000000018094E535 7F 0C                                         jg      short loc_18094E543
000000018094E537
000000018094E537                               loc_18094E537:                          ; CODE XREF: sub_18094E510+46↓j
000000018094E537 48 8D 05 B2 EE 4A 03                          lea     rax, qword_183DFD3F0
000000018094E53E 48 83 C4 28                                   add     rsp, 28h
000000018094E542 C3                                            retn
000000018094E543                               ; ---------------------------------------------------------------------------
000000018094E543
000000018094E543                               loc_18094E543:                          ; CODE XREF: sub_18094E510+25↑j
000000018094E543 48 8D 0D 96 EE 4A 03                          lea     rcx, dword_183DFD3E0
000000018094E54A E8 D5 C6 4A 02                                call    sub_182DFAC24
000000018094E54F 83 3D 8A EE 4A 03 FF                          cmp     cs:dword_183DFD3E0, 0FFFFFFFFh
000000018094E556 75 DF                                         jnz     short loc_18094E537
000000018094E558 E8 A3 CF 91 00                                call    sub_18126B500
000000018094E55D 48 8D 0D 4C 4A 64 02                          lea     rcx, sub_182F92FB0 ; void (__cdecl *)()
000000018094E564 E8 3F C3 4A 02                                call    atexit
000000018094E569 90                                            nop
000000018094E56A 48 8D 0D 6F EE 4A 03                          lea     rcx, dword_183DFD3E0
000000018094E571 E8 4E C6 4A 02                                call    sub_182DFABC4
000000018094E576 48 8D 05 73 EE 4A 03                          lea     rax, qword_183DFD3F0
000000018094E57D 48 83 C4 28                                   add     rsp, 28h
000000018094E581 C3                                            retn
000000018094E581                               ; } // starts at 18094E510
000000018094E581                               sub_18094E510   endp
```

F5转成C代码看会更清晰：

```c
__int64 *sub_18094E510() {
  if ( dword_183DFD3E0 <= *(_DWORD *)(*((_QWORD *)NtCurrentTeb()->ThreadLocalStoragePointer + (unsigned int)TlsIndex)
                                    + 196i64) )
    return &qword_183DFD3F0;
  sub_182DFAC24(&dword_183DFD3E0);
  if ( dword_183DFD3E0 != -1 )
    return &qword_183DFD3F0;
  sub_18126B500();
  atexit(sub_182F92FB0);
  sub_182DFABC4(&dword_183DFD3E0);
  return &qword_183DFD3F0;
}
```

然后查看调用函数`sub_18094E510`的地方，发现有非常多的地方。如果能定位到这个函数以及提取它的返回值，则基本上很多数据都可以找到了。

## 数据结构

我们为函数`sub_18094E510`命名为：`getXObjAddr`，它的返回地址`183DFD3F0`命名为：`g_xaddr`，则微信号地址为：`g_xaddr + 0x720` 。把地址转换成相对基址的偏移：`183DFD3F0  - 180000000 = 3DFD3F0`，通过查看附近内存地址的数据内容，可以发现如下数据：

| 项                   | 地址                                            | 相对地址                            |
| -------------------- | ----------------------------------------------- | ----------------------------------- |
| g_xaddr              | 183DFD3F0                                       | WeChatWin.dll+3DFD3F0               |
| 微信号               | g_xaddr + 0x720                                 |                                     |
| 微信号字符串长度     | g_xaddr + 0x720 + 0x10                          |                                     |
| 微信注册号           | g_xaddr + 0x720 + 0x20                          |                                     |
| 微信注册号字符串长度 | g_xaddr + 0x720 + 0x30                          |                                     |
| 手机型号             | g_xaddr + 0x720 + 0x70                          |                                     |
| 手机型号字符串长度   | g_xaddr + 0x720 + 0x80                          |                                     |
| 微信昵称             | g_xaddr + 0x1E8                                 |                                     |
| 微信昵称字符串长度   | g_xaddr + 0x1E8 + 0x10                          |                                     |
| key的地址            | g_xaddr + 0x6E0                                 | WeChatWin.dll+3DFD3F0+ 0x6E0        |
| key的长度            | g_xaddr + 0x6E0 + 8                             |                                     |
| keyX的地址           | g_xaddr + 0x6F0                                 | 不太清楚是什么作用                  |
| keyX的长度           | g_xaddr + 0x6F0 + 8                             | 长度大概是0x7E                      |
| 某公钥X字符串地址    | g_xaddr + 0x720 + 0x98   = 02B227323560         | WeChatWin.dll+3DFD3F0+ 0x720 + 0x98 |
| 某公钥X字符串长度    | g_xaddr + 0x720 + 0x98 + 0x10 （长度大概0x110） |                                     |



`getXObjAddr`里有个函数`sub_182F92FB0`：

```assembly
0000000182F92FB0                               ; void __fastcall sub_182F92FB0()
0000000182F92FB0                               sub_182F92FB0   proc near               ; DATA XREF: getObjAddr+4D↑o
0000000182F92FB0                                                                       ; sub_180A510D0+107E↑o ...
0000000182F92FB0 48 8D 0D 39 A4 E6 00                          lea     rcx, qword_183DFD3F0
0000000182F92FB7 E9 24 89 2D FE                                jmp     sub_18126B8E0
0000000182F92FB7                               sub_182F92FB0   endp
```

接着查看函数`sub_18126B8E0`：

```assembly
000000018126B8E0                               ; __int64 __fastcall sub_18126B8E0(__int64, __int64)
000000018126B8E0                               sub_18126B8E0   proc near               ; CODE XREF: sub_18126B8A0+F↑p
000000018126B8E0                                                                       ; sub_182F92FB0+7↓j
000000018126B8E0                                                                       ; DATA XREF: ...
000000018126B8E0
000000018126B8E0                               arg_0           = qword ptr  8
000000018126B8E0                               arg_8           = qword ptr  10h
000000018126B8E0
000000018126B8E0                               ; __unwind { // sub_182DFDB48
000000018126B8E0 48 89 5C 24 08                                mov     [rsp+arg_0], rbx
000000018126B8E5 48 89 74 24 10                                mov     [rsp+arg_8], rsi
000000018126B8EA 57                                            push    rdi
000000018126B8EB 48 83 EC 20                                   sub     rsp, 20h
000000018126B8EF 48 8B F9                                      mov     rdi, rcx
000000018126B8F2 48 8D 05 BF 3A 2D 02                          lea     rax, ??_7AccountService@@6B@ ; const AccountService::`vftable'
000000018126B8F9 48 89 01                                      mov     [rcx], rax
000000018126B8FC 48 8B 89 18 07 00 00                          mov     rcx, [rcx+718h]
000000018126B903 33 F6                                         xor     esi, esi
000000018126B905 48 85 C9                                      test    rcx, rcx
000000018126B908 74 0C                                         jz      short loc_18126B916
000000018126B90A E8 C1 EB B8 01                                call    sub_182DFA4D0
000000018126B90F 48 89 B7 18 07 00 00                          mov     [rdi+718h], rsi
000000018126B916
000000018126B916                               loc_18126B916:                          ; CODE XREF: sub_18126B8E0+28↑j
000000018126B916 48 8B 8F 00 08 00 00                          mov     rcx, [rdi+800h]
000000018126B91D 48 85 C9                                      test    rcx, rcx
000000018126B920 74 0C                                         jz      short loc_18126B92E
000000018126B922 E8 E1 00 BA 01                                call    sub_182E0BA08
000000018126B927 48 89 B7 00 08 00 00                          mov     [rdi+800h], rsi
000000018126B92E
000000018126B92E                               loc_18126B92E:                          ; CODE XREF: sub_18126B8E0+40↑j
000000018126B92E 48 89 B7 08 08 00 00                          mov     [rdi+808h], rsi
000000018126B935 48 8B 8F 10 08 00 00                          mov     rcx, [rdi+810h]
000000018126B93C 48 85 C9                                      test    rcx, rcx
000000018126B93F 74 12                                         jz      short loc_18126B953
000000018126B941 E8 C2 00 BA 01                                call    sub_182E0BA08
000000018126B946 48 89 B7 10 08 00 00                          mov     [rdi+810h], rsi
000000018126B94D 89 B7 18 08 00 00                             mov     [rdi+818h], esi
000000018126B953
000000018126B953                               loc_18126B953:                          ; CODE XREF: sub_18126B8E0+5F↑j
000000018126B953 48 8D 8F D8 07 00 00                          lea     rcx, [rdi+7D8h]
000000018126B95A E8 D1 92 6C FF                                call    sub_180934C30
000000018126B95F 48 8D 8F B8 07 00 00                          lea     rcx, [rdi+7B8h]
000000018126B966 E8 C5 92 6C FF                                call    sub_180934C30
000000018126B96B 48 8D 8F 90 07 00 00                          lea     rcx, [rdi+790h]
000000018126B972 E8 B9 92 6C FF                                call    sub_180934C30
000000018126B977 48 8D 8F 68 07 00 00                          lea     rcx, [rdi+768h]
000000018126B97E E8 1D 51 ED FF                                call    sub_181140AA0
000000018126B983 48 8D 8F 40 07 00 00                          lea     rcx, [rdi+740h]
000000018126B98A E8 A1 92 6C FF                                call    sub_180934C30
000000018126B98F 48 8D 8F 20 07 00 00                          lea     rcx, [rdi+720h]
000000018126B996 E8 95 92 6C FF                                call    sub_180934C30
000000018126B99B 4C 8B 87 08 07 00 00                          mov     r8, [rdi+708h]
000000018126B9A2 4D 8B 40 08                                   mov     r8, [r8+8]
000000018126B9A6 48 8D 97 08 07 00 00                          lea     rdx, [rdi+708h]
000000018126B9AD 48 8D 8F 08 07 00 00                          lea     rcx, [rdi+708h]
000000018126B9B4 E8 17 96 6D FF                                call    sub_180944FD0
000000018126B9B9 BA 40 00 00 00                                mov     edx, 40h ; '@'
000000018126B9BE 48 8B 8F 08 07 00 00                          mov     rcx, [rdi+708h]
000000018126B9C5 E8 06 EB B8 01                                call    sub_182DFA4D0
000000018126B9CA 48 8B 8F F0 06 00 00                          mov     rcx, [rdi+6F0h]
000000018126B9D1 48 85 C9                                      test    rcx, rcx
000000018126B9D4 74 12                                         jz      short loc_18126B9E8
000000018126B9D6 E8 2D 00 BA 01                                call    sub_182E0BA08
000000018126B9DB 48 89 B7 F0 06 00 00                          mov     [rdi+6F0h], rsi
000000018126B9E2 89 B7 F8 06 00 00                             mov     [rdi+6F8h], esi
000000018126B9E8
000000018126B9E8                               loc_18126B9E8:                          ; CODE XREF: sub_18126B8E0+F4↑j
000000018126B9E8 48 8B 8F E0 06 00 00                          mov     rcx, [rdi+6E0h]
000000018126B9EF 48 85 C9                                      test    rcx, rcx
000000018126B9F2 74 12                                         jz      short loc_18126BA06
000000018126B9F4 E8 0F 00 BA 01                                call    sub_182E0BA08
000000018126B9F9 48 89 B7 E0 06 00 00                          mov     [rdi+6E0h], rsi
000000018126BA00 89 B7 E8 06 00 00                             mov     [rdi+6E8h], esi
000000018126BA06
000000018126BA06                               loc_18126BA06:                          ; CODE XREF: sub_18126B8E0+112↑j
000000018126BA06 48 8B 8F B8 06 00 00                          mov     rcx, [rdi+6B8h]
000000018126BA0D 48 85 C9                                      test    rcx, rcx
000000018126BA10 74 0C                                         jz      short loc_18126BA1E
000000018126BA12 E8 F1 FF B9 01                                call    sub_182E0BA08
000000018126BA17 48 89 B7 B8 06 00 00                          mov     [rdi+6B8h], rsi
000000018126BA1E
000000018126BA1E                               loc_18126BA1E:                          ; CODE XREF: sub_18126B8E0+130↑j
000000018126BA1E 48 89 B7 C0 06 00 00                          mov     [rdi+6C0h], rsi
000000018126BA25 48 8B 8F C8 06 00 00                          mov     rcx, [rdi+6C8h]
000000018126BA2C 48 85 C9                                      test    rcx, rcx
000000018126BA2F 74 12                                         jz      short loc_18126BA43
000000018126BA31 E8 D2 FF B9 01                                call    sub_182E0BA08
000000018126BA36 48 89 B7 C8 06 00 00                          mov     [rdi+6C8h], rsi
000000018126BA3D 89 B7 D0 06 00 00                             mov     [rdi+6D0h], esi
000000018126BA43
000000018126BA43                               loc_18126BA43:                          ; CODE XREF: sub_18126B8E0+14F↑j
000000018126BA43 48 8D 4F 08                                   lea     rcx, [rdi+8]
000000018126BA47 E8 D4 7D ED FF                                call    sub_181143820
000000018126BA4C 90                                            nop
000000018126BA4D 48 8D 05 CC 77 19 02                          lea     rax, ??_7EventHandler@@6B@ ; const EventHandler::`vftable'
000000018126BA54 48 89 07                                      mov     [rdi], rax
000000018126BA57 E8 E4 2D ED FF                                call    sub_18113E840
000000018126BA5C 48 8B D7                                      mov     rdx, rdi
000000018126BA5F 48 8B C8                                      mov     rcx, rax
000000018126BA62 E8 89 49 ED FF                                call    sub_1811403F0
000000018126BA67 90                                            nop
000000018126BA68 48 8B 5C 24 30                                mov     rbx, [rsp+28h+arg_0]
000000018126BA6D 48 8B 74 24 38                                mov     rsi, [rsp+28h+arg_8]
000000018126BA72 48 83 C4 20                                   add     rsp, 20h
000000018126BA76 5F                                            pop     rdi
000000018126BA77 C3                                            retn
000000018126BA77                               ; } // starts at 18126B8E0
000000018126BA77                               sub_18126B8E0   endp
```

可以看出与地址`g_xaddr`相关的字段很多，参考偏移地址可以挖掘很多信息，这里不再继续深入分析。



# 特征提取

## 特征1：字符串特征

```assembly
000000018139D89D 48 8D 15 3C 15 14 02                          lea     rdx, aWechatFiles ; "\\WeChat Files\\"
```

跟随一下发现这个字符串是个`Unicode`字符串：

```assembly
00000001834DEDE0                               aWechatFiles:                           ; DATA XREF: sub_180E07FB0+45B↑o
00000001834DEDE0                                                                       ; sub_180E858B0+2E0↑o ...
00000001834DEDE0 5C 00 57 00 65 00 43 00 68 00+                text "UTF-16LE", '\WeChat Files\',0
```

在IDA里面`Shift + F12`查看字符串窗口的时候，需要右键点击弹出菜单 - 选择`setup`- `Unicode C-style (16 bits)`，稍等IDA列出所有字符串，然后搜索`\WeChat Files\`即可，然后查找引用，会有多个，经过筛选发现两处匹配：

```assembly
sub_18139C400+B9	lea     rdx, aWechatFiles; "\\WeChat Files\\"

sub_18139D800+9D	lea     rdx, aWechatFiles; "\\WeChat Files\\"
```

其中第二条前面已经贴过了，现在看第一条：

```assembly
000000018139C4B9 48 8D 15 20 29 14 02                          lea     rdx, aWechatFiles ; "\\WeChat Files\\"
000000018139C4C0 48 8B C8                                      mov     rcx, rax
000000018139C4C3 E8 DC 31 A8 01                                call    sub_182E1F6A4
000000018139C4C8 66 41 89 5C 24 1C                             mov     [r12+1Ch], bx
000000018139C4CE 41 8B C7                                      mov     eax, r15d
000000018139C4D1 89 45 B0                                      mov     dword ptr [rbp+0D0h+var_120], eax
000000018139C4D4 89 45 E0                                      mov     dword ptr [rbp+0D0h+var_F0], eax
000000018139C4D7 E8 34 20 5B FF                                call    getObjAddr
000000018139C4DC 48 89 5D 50                                   mov     qword ptr [rbp+0D0h+var_80], rbx
000000018139C4E0 48 89 5D 60                                   mov     [rbp+0D0h+var_70], rbx
000000018139C4E4 48 89 5D 68                                   mov     [rbp+0D0h+var_68], rbx
000000018139C4E8 48 8D B8 20 07 00 00                          lea     rdi, [rax+720h]
000000018139C4EF 48 8B 77 10                                   mov     rsi, [rdi+10h]
000000018139C4F3 48 83 7F 18 10                                cmp     qword ptr [rdi+18h], 10h
000000018139C4F8 72 03                                         jb      short loc_18139C4FD
000000018139C4FA 48 8B 3F                                      mov     rdi, [rdi]
000000018139C4FD
000000018139C4FD                               loc_18139C4FD:                          ; CODE XREF: sub_18139C400+F8↑j
000000018139C4FD 48 B8 FF FF FF FF FF FF FF 7F                 mov     rax, 7FFFFFFFFFFFFFFFh
000000018139C507 48 83 FE 10                                   cmp     rsi, 10h
000000018139C50B 73 11                                         jnb     short loc_18139C51E
000000018139C50D 0F 10 07                                      movups  xmm0, xmmword ptr [rdi]
000000018139C510 0F 11 45 50                                   movups  [rbp+0D0h+var_80], xmm0
000000018139C514 48 C7 45 68 0F 00 00 00                       mov     [rbp+0D0h+var_68], 0Fh
000000018139C51C EB 30                                         jmp     short loc_18139C54E
000000018139C51E                               ; ---------------------------------------------------------------------------
000000018139C51E
000000018139C51E                               loc_18139C51E:                          ; CODE XREF: sub_18139C400+10B↑j
000000018139C51E 48 8B DE                                      mov     rbx, rsi
000000018139C521 48 83 CB 0F                                   or      rbx, 0Fh
000000018139C525 48 3B D8                                      cmp     rbx, rax
000000018139C528 48 0F 47 D8                                   cmova   rbx, rax
000000018139C52C 48 8D 4B 01                                   lea     rcx, [rbx+1]
000000018139C530 E8 CB 8A 59 FF                                call    sub_180935000
```

字符串`\WeChat Files\`有多个，不太好定位，因此查看了下函数`sub_18139C400`里面的字符串使用情况来进行关联查找，找到了这几个字符串：

```
err path=%s
FilePathHelper
FilePathHelper::getAbsolutedPath
no convert,out path=%s
```

也即找到引用上述任一字符串的函数，再从函数头开始往下不远处即可找到字符串`\WeChat Files\`，再往下就是相关代码了。



## 特征2：指令特征

取如下代码的特征：

```assembly
000000018139D90A                               loc_18139D90A:                          ; CODE XREF: sub_18139D800+F5↑j
000000018139D90A 48 8B D8                                      mov     rbx, rax
000000018139D90D 48 83 CB 0F                                   or      rbx, 0Fh
000000018139D911 48 3B D9                                      cmp     rbx, rcx
000000018139D914 48 0F 47 D9                                   cmova   rbx, rcx
000000018139D918 48 8D 4B 01                                   lea     rcx, [rbx+1]
000000018139D91C E8 DF 76 59 FF                                call    sub_180935000
```

```assembly
000000018139C51E                               loc_18139C51E:                          ; CODE XREF: sub_18139C400+10B↑j
000000018139C51E 48 8B DE                                      mov     rbx, rsi
000000018139C521 48 83 CB 0F                                   or      rbx, 0Fh
000000018139C525 48 3B D8                                      cmp     rbx, rax
000000018139C528 48 0F 47 D8                                   cmova   rbx, rax
000000018139C52C 48 8D 4B 01                                   lea     rcx, [rbx+1]
000000018139C530 E8 CB 8A 59 FF                                call    sub_180935000
```

特征序列为（两条人选一条）：

```assembly
48 8B D8 48 83 CB 0F 48 3B D9 48 0F 47 D9 48 8D 4B 01 E8 
48 8B DE 48 83 CB 0F 48 3B D8 48 0F 47 D8 48 8D 4B 01 E8
```

综合成通配符特征的话为：

```
48 8B ?? 48 83 CB 0F 48 3B ?? 48 0F 47 ?? 48 8D 4B 01 E8
```

搜索到后向上找一个`call`，基本上就是`call    getObjAddr`，然后看对`rax`的访问情况，即可知道数据的偏移了。



## 特征3：手机型号

微信登录设备类型基本只有 `iphone`、`android`，在内存中先搜到设备类型所在内存，key 就在它的前面，向前搜就行。参考：[search_wechat_key](https://github.com/sunhanaix/search_wechat_key)。

```assembly
WeChatWin.dll+3DFDB80  ;android
```



## 特征4：指令特征

```assembly
000000018093A588 48 8B 0C C8                                   mov     rcx, [rax+rcx*8]
000000018093A58C 8B 04 0A                                      mov     eax, [rdx+rcx]
000000018093A58F 39 05 2B 2E 4C 03                             cmp     cs:dword_183DFD3C0, eax
```

得特征：

```
48 8B 0C C8 8B 04 0A 39 05
```

搜索到后，取后面的地址，然后做一个页面对齐向后搜索内存特征即可。



## 特征5：导出函数

从导出函数`TlsCallback_3`的地址开始，搜索特征：`48 8B 0C C8 8B 04 0A 39 05`  ，搜索到后取地址，例如：`dword_183DFD3C0`  做一个对齐：`3DFD000`，即可开始搜索手机型号特征。

```assembly
0000000180935400                                               public TlsCallback_3
0000000180935400                               TlsCallback_3   proc near               ; CODE XREF: sub_180A17480+4↓p
0000000180935400                                                                       ; sub_180A17490+F↓p ...
0000000180935400 C2 00 00                                      retn    0
0000000180935400                               TlsCallback_3   endp
```



从导出函数`GetHandleVerifier`的地址找到`qword_183DFA6A0`，做一个对齐即可开始搜索手机型号特征。

```assembly
0000000181E61760                                               public GetHandleVerifier
0000000181E61760                               GetHandleVerifier proc near             ; DATA XREF: sub_181E60D60:loc_181E60D9E↑o
0000000181E61760                                                                       ; .rdata:off_183BE2938↓o ...
0000000181E61760 48 83 EC 28                                   sub     rsp, 28h
0000000181E61764 48 8B 05 35 8F F9 01                          mov     rax, cs:qword_183DFA6A0
0000000181E6176B 48 85 C0                                      test    rax, rax
0000000181E6176E 75 0C                                         jnz     short loc_181E6177C
0000000181E61770 E8 EB F5 FF FF                                call    sub_181E60D60
0000000181E61775 48 8B 05 24 8F F9 01                          mov     rax, cs:qword_183DFA6A0
0000000181E6177C
0000000181E6177C                               loc_181E6177C:                          ; CODE XREF: GetHandleVerifier+E↑j
0000000181E6177C 48 83 C4 28                                   add     rsp, 28h
0000000181E61780 C3                                            retn
0000000181E61780                               GetHandleVerifier endp
```



## 特征6：公钥头

对所有进程空间搜索如下内容：

```
-----BEGIN PUBLIC KEY-----
```

搜索结果大概有 7 处（大概是最后一个是我们想要的，也是地址最大的那个），然后对扫描到地址再做一次搜索（搜索范围简化一下，只针对 `WeChatWin.dll` 模块进行搜索），搜索到后找上下，基本上离想要的信息也不远了。



## 特征7：微信注册账号

先获取微信进程的所有打开的句柄信息，从文件句柄信息中获取文件路径，从路径中解析出微信注册账号，然后再通过该微信账号作为特征搜索。搜索结果大概有 5 处（大概是中间一个是我们想要的），需要对这些结果进行过滤，过滤的规则：地址减去0x08，判断数值（按照8字节）是否是该微信账号字符串的长度。



# 代码自动获取地址

为了提高代码搜索速度，可以适当缩小一下范围，只针对 `WeChatWin.dll` 模块进行搜索。如果想继续缩小范围，可以参考如下思路：

1. 结合导出函数及特征，先定位一个比较大的内存范围搜索起地址，例如结合特征4和特征5，取一个较小值，然后做页面对齐，例如可以得到：`3DFA000`，然后结合特征3的手机型号进行搜索，搜索到：`3DFF000`，读取的内存范围只有：`0x5000`。一页是4KB，相当于总共只读取了20KB的大小，并不算多。当然如果后续版本变化，范围可以适当增大，搜索的速度也是很快的。但是这个继续缩小搜索范围的方法是可选的，并不推荐，因为依赖的条件比较多，容易在不同的版本中有变化，建议还是直接限定 `WeChatWin.dll` 模块进行搜索，基本上是很快的了。
2. 搜索时索引每次递增0x08（也就是64位的默认对齐大小），或者递增0x10（字符串存储一般是这个对齐），这样就可以极大提高搜索速度了。

# 信息取证

- 手机号、微信昵称、微信注册id、手机设备类型、聊天数据库key；
- 聊天数据库解密；
- 好友列表；
- [WechatBakTool: 基于C#的微信PC版聊天记录备份工具，提供图形界面，解密微信数据库并导出聊天记录。](https://github.com/SuxueCode/WechatBakTool)

可以参考 [PyWxDump](https://github.com/xaoyaoo/PyWxDump) ，但请勿作恶！！！

# 参考

- [wechat-dump-rs](https://github.com/0xlane/wechat-dump-rs)
- [search_wechat_key](https://github.com/sunhanaix/search_wechat_key)
- https://github.com/xaoyaoo/PyWxDump
- [SharpWxDump](https://github.com/AdminTest0/SharpWxDump)
- https://github.com/LC044/WeChatMsg
- [WechatBakTool: 基于C#的微信PC版聊天记录备份工具，提供图形界面，解密微信数据库并导出聊天记录。](https://github.com/SuxueCode/WechatBakTool)
- https://github.com/kihlh/WxDatViewerAutoExportRust
