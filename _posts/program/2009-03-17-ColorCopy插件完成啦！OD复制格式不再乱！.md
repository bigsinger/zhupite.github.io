---
layout:		post
category:	"program"
title:		"ColorCopy插件完成啦！OD复制格式不再乱！"
tags:		[]
---
- Content
{:toc}


ColorCopy效果预览 ColorCopy plugin v0.1

```
00444388| push    ebp             	                      |
00444389| mov     ebp, esp                                  |
0044438B| push    -1                                        |
0044438D| push    0045AFC0                                  |
00444392| push    <jmp.&MSVCRT._except_handler3>            |入口地址
00444397| mov     eax, dword ptr fs:[0]                     |
0044439D| push    eax                                       |
0044439E| mov     dword ptr fs:[0], esp                     |
004443A5| sub     esp, 68	                               |
004443A8| push    ebx                                       |
004443A9| push    esi                                       |
004443AA| push    edi                                       |
004443AB| mov     dword ptr [ebp-18], esp                   |
004443AE| xor     ebx, ebx                                  |
004443B0| mov     dword ptr [ebp-4], ebx                    |
004443B3| push    2                                         |
004443B5| call    dword ptr [<&MSVCRT.__set_app_type>]      |msvcrt.__set_app_type
004443BB| pop     ecx                                       |
004443BC| or      dword ptr [4966D8], FFFFFFFF              |
004443C3| or      dword ptr [4966DC], FFFFFFFF              |
004443CA| call    dword ptr [<&MSVCRT.__p__fmode>]          |msvcrt.__p__fmode
004443D0| mov     ecx, dword ptr [49634C]                   |
004443D6| mov     dword ptr [eax], ecx                      |
004443D8| call    dword ptr [<&MSVCRT.__p__commode>]        |msvcrt.__p__commode
004443DE| mov     ecx, dword ptr [496348]                   |
004443E4| mov     dword ptr [eax], ecx                      |
004443E6| mov     eax, dword ptr [<&MSVCRT._adjust_fdiv>]   |
004443EB| mov     eax, dword ptr [eax]        	          |
004443ED| mov     dword ptr [4966D4], eax                   |
004443F2| call    00444531                                  |
004443F7| cmp     dword ptr [465D80], ebx                   |
004443FD| jnz     short 0044440B                      	  |
004443FF| push    0044452E                                  |
00444404| call    dword ptr [<&MSVCRT.__setusermatherr>]    |msvcrt.__setusermatherr
0044440A| pop     ecx                                       |
0044440B| call    00444516             	                 |
00444410| push    004620A4                                  |
00444415| push    004620A0                                  |
0044441A| call    <jmp.&MSVCRT._initterm>                   |
0044441F| mov     eax, dword ptr [496344]      	         |
00444424| mov     dword ptr [ebp-6C], eax                   |
00444427| lea     eax, dword ptr [ebp-6C]                   |
0044442A| push    eax                                       |
0044442B| push    dword ptr [496340]                   	 |
00444431| lea     eax, dword ptr [ebp-64]                   |
00444434| push    eax                                       |
00444435| lea     eax, dword ptr [ebp-70]                   |
00444438| push    eax                                       |
00444439| lea     eax, dword ptr [ebp-60]                   |
0044443C| push    eax                                       |
0044443D| call    dword ptr [<&MSVCRT.__getmainargs>]       |msvcrt.__getmainargs
00444443| push    0046209C                     	         |
00444448| push    00462000                                  |
0044444D| call    <jmp.&MSVCRT._initterm>                   |
00444452| add     esp, 24                                   |
00444455| mov     eax, dword ptr [<&MSVCRT._acmdln>]   	 |
0044445A| mov     esi, dword ptr [eax]                      |
0044445C| mov     dword ptr [ebp-74], esi                   |
0044445F| cmp     byte ptr [esi], 22                        |
00444462| jnz     short 0044449E                            |
00444464| inc     esi                                       |
00444465| mov     dword ptr [ebp-74], esi                   |
00444468| mov     al, byte ptr [esi]                        |
0044446A| cmp     al, bl                                    |
0044446C| je      short 00444472                            |
0044446E| cmp     al, 22                                    |
00444470| jnz     short 00444464                            |
00444472| cmp     byte ptr [esi], 22                        |
00444475| jnz	 short 0044447B                            |
00444477| inc     esi                                       |
00444478| mov     dword ptr [ebp-74], esi                   |
0044447B| mov     al, byte ptr [esi]                        |
0044447D| cmp     al, bl                                    |
0044447F| je      short 00444485                            |
00444481| cmp     al, 20                                    |
00444483| jbe     short 00444477                            |
00444485| mov     dword ptr [ebp-30], ebx                   |
00444488| lea     eax, dword ptr [ebp-5C]                   |
0044448B| push    eax                                       |
0044448C| call    dword ptr [<&KERNEL32.GetStartupInfoA>]   |kernel32.GetStartupInfoA
00444492| test    byte ptr [ebp-30], 11                     |
00444496| je      short 004444A9                            |
00444498| movzx   eax, word ptr [ebp-2C]                    |
0044449C| jmp     short 004444AC                            |
0044449E| cmp     byte ptr [esi], 20                        |
004444A1| jbe     short 0044447B                            |
004444A3| inc     esi                                       |
004444A4| mov     dword ptr [ebp-74], esi                   |
004444A7| jmp 	short 0044449E                            |
004444A9| push    0A                                        |
004444AB| pop     eax                                       |
004444AC| push    eax                                       |
004444AD| push    esi 	                                  |
004444AE| push    ebx                                       |
004444AF| push    ebx                                       |
004444B0| call    dword ptr [<&KERNEL32.GetModuleHandleA>]  |kernel32.GetModuleHandleA
004444B6| push    eax                                       |
004444B7| call    0044A840                                  |
004444BC| mov     dword ptr [ebp-68], eax                   |
004444BF| push    eax                                       |
004444C0| call    dword ptr [<&MSVCRT.exit>]                |msvcrt.exit
004444C6| mov     eax, dword ptr [ebp-14]                   |
004444C9| mov     ecx, dword ptr [eax]                      |
004444CB| mov     ecx, dword ptr [ecx]                      |
004444CD| mov     dword ptr [ebp-78], ecx                   |
004444D0| push    eax                                       |
004444D1| push    ecx                                       |
004444D2| call    <jmp.&MSVCRT._XcptFilter>                 |
004444D7| pop     ecx                                       |
004444D8| pop     ecx                                       |
004444D9| retn                                              |
```