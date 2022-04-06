---
layout:		post
category:	"sec"
title:		"Android安全工具-安卓安全工具汇总"
tags:		[android]
---
- Content
{:toc}
**关键词**：安卓破解工具，安卓逆向工具，安卓黑客工具，安卓安全工具，Android破解工具，Android逆向工具，Android黑客工具，Android安全工具。



# 安全审计

| 名称       | 简介                                                         | 相关资料                                                 |
| ---------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| virustotal |                                                              | https://www.virustotal.com/                              |
| MobSF      | Mobile Security Framework (MobSF) is an automated, all-in-one mobile application (Android/iOS/Windows) pen-testing, malware analysis and security assessment framework capable of performing static and dynamic analysis. | https://github.com/MobSF/Mobile-Security-Framework-MobSF |
| appmon     | 隐私检测、安全检测、HOOK函数调用、行为分析等可以借助这个框架 | [appmon](https://github.com/dpnishant/appmon)            |



# 综合工具

| 名称                 | 简介                                                         | 相关资料                                                     |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 安卓右键工具         | 集成到Windows系统菜单，右键操作安卓相关，方便快捷。          | [APKmenuTOOL - 安卓右键工具](https://github.com/bigsinger/APKmenuTOOL)、[CustomContextMenu: 自定义Windows系统右键菜单工具](https://github.com/bigsinger/CustomContextMenu) |
| AndLayoutInspector   | 安卓界面布局获取分析工具（uiautomation tool），C#语言编写。  | [界面布局分析 AndLayoutInspector](https://github.com/inckie/AndLayoutInspector) |
| AppMethodOrder       | 一个能让你了解所有函数调用顺序以及函数耗时的Android库（无需侵入式代码） | [AppMethodOrder](https://github.com/zjw-swun/AppMethodOrder) |
| apk-signature-verify | Python校验apk签名，jar Signature / APK Signature v2 verify with pure python (support rsa dsa ecdsa) | [apk-signature-verify](https://github.com/shuxin/apk-signature-verify) |
| AmBinaryEditor       | AndroidManifest二进制修改工具                                | [AmBinaryEditor（AndroidManifest二进制修改工具介绍）](http://ele7enxxh.com/AndroidManifest-Binary-Editor.html) |
| MT管理器             | 文件管理、APK编辑功能，在手机上高效地进行各种文件操作以及修改安卓软件。 | [MT管理器](http://binmt.cc)                                  |
| AndroidManifestFix   | AndroidManifest.xml文件修复工具。用于修复AXML文件中属性名称缺失的问题。 | https://github.com/zylc369/AndroidManifestFix                |
| NP-Manager           | 超级混淆                                                     | https://github.com/githubXiaowangzi/NP-Manager               |
| FreeProGuard         | Config proguard for common Android libraries.                | https://github.com/Blankj/FreeProGuard                       |
| 太极                 | 多开器、虚拟空间                                             |                                                              |
| VirtualApp           |                                                              |                                                              |
| AssetStudio          | unity游戏破解工具：AssetStudio is a tool for exploring, extracting and exporting assets and assetbundles. | https://github.com/Perfare/AssetStudio                       |
| r0capture            | 安卓应用层抓包通杀脚本                                       | https://github.com/r0ysue/r0capture                          |
| StrandHogg 2.0       | New serious Android vulnerability                            | https://promon.co/resources/downloads/strandhogg-2-0-new-serious-android-vulnerability/ |
| 安卓应用的安全和破解 | 一个汇总安卓安全的博客小站                                   | https://book.crifan.com/books/android_app_security_crack/website/ |



# 反编译工具

- [JEB Decompiler by PNF Software](https://www.pnfsoftware.com/)
- [jadx: Dex to Java decompiler](https://github.com/skylot/jadx)
- [bytecode-viewer: A Java 8+ Jar & Android APK Reverse Engineering Suite (Decompiler, Editor, Debugger & More)](https://github.com/Konloch/bytecode-viewer)
- [Apktool: A tool for reverse engineering Android apk files](https://github.com/iBotPeaches/Apktool)
- [smali: smali/baksmali](https://github.com/JesusFreke/smali)
- [dex2jar: Tools to work with android .dex and java .class files](https://github.com/pxb1988/dex2jar)
- [android-classyshark: Analyze any Android/Java based app or game](https://github.com/google/android-classyshark)
- [jd-gui: A standalone Java Decompiler GUI](https://github.com/java-decompiler/jd-gui)
- [Luyten: An Open Source Java Decompiler Gui for Procyon](https://github.com/deathmarine/Luyten)
- [Krakatau: Java decompiler, assembler, and disassembler](https://github.com/Storyyeller/Krakatau) java的反编译器、汇编器、反汇编器
- [GDA主页-中国首款交互式Android反编译器](http://www.gda.wiki:9090/)
- [androguard/androguard: Reverse engineering, Malware and goodware analysis of Android applications)](https://github.com/androguard/androguard)



# HOOK工具

- [Frida](https://github.com/frida/)

- Xposed

- EDXposed

- LSPosed：完全取代EDXposed

- VirtualXposed

- FakeXposed：Xposed隐藏器

- [Cydia Substrate](http://www.cydiasubstrate.com/)

- [Android-Inline-Hook](https://github.com/ele7enxxh/Android-Inline-Hook)

- [objection: 📱 objection - runtime mobile exploration](https://github.com/sensepost/objection)

- [xHook: 🔥 A PLT hook library for Android native ELF.](https://github.com/iqiyi/xhook)

- [bytedance/bhook](https://github.com/bytedance/bhook)：bhook(aka ByteHook) 是一个针对 Android app 的 PLT hook 框架。字节跳动的大多数 Android app 在线上使用了 bhook 作为 PLT hook 方案。

- 插件化框架 PMS AMS HOOK [tiann/understand-plugin-framework: demos to help understand plugin framwork](https://github.com/tiann/understand-plugin-framework)

  

# 脱壳工具

- [BlackDex](https://github.com/CodingGay/BlackDex): BlackDex是一个运行在Android手机上的脱壳工具，支持5.0～12，无需依赖任何环境任何手机都可以使用，包括模拟器。只需几秒，即可对已安装包括未安装的APK进行脱壳。
- [ApkPecker自动化DEX-VMP脱壳功能全新上线](https://mp.weixin.qq.com/s/ppnvwwd9k6hP_xK364ydfg)（腾讯科恩实验室），[ApkPecker脱壳服务FAQ](https://docs.qq.com/doc/DRmVBbWtHcmNPYWxO)，[ApkPecker](https://apkpecker.qq.com/)（面向攻击面的Android应用自动化检测系统）
- [AUPK](https://bbs.pediy.com/thread-266716.htm)：基于Art虚拟机的脱壳机，[AUPK](https://github.com/FeJQ/AUPK)，[DexPatcher: 修复脱壳后的dex文件](https://github.com/FeJQ/DexPatcher)
- [FRIDA-DEXDump: Fast search and dump dex on memory.](https://github.com/hluwa/FRIDA-DEXDump)
- [frida-unpack: 基于Frida的脱壳工具](https://github.com/dstmath/frida-unpack)
- [unpacker](https://github.com/youlor/unpacker): 基于ART主动调用的脱壳机
- [将FART和Youpk结合来做一次针对函数抽取壳的全面提升](https://bbs.pediy.com/thread-260052.htm)
- 安卓查壳工具：[rednaga/APKiD: Android Application Identifier for Packers, Protectors, Obfuscators and Oddities - PEiD for Android](https://github.com/rednaga/APKiD)
- Xposed反射大师 脱壳
- [DumpDex: 💯一款Android脱壳工具，需要xposed支持, 易开发已集成该项目](https://github.com/WrBug/dumpDex)  用来从运行中的安卓app中导出dex文件的工具。
- [strazzere/android-unpacker: Android Unpacker presented at Defcon 22: Android Hacker Protection Level 0](https://github.com/strazzere/android-unpacker)
- [zyq8709/DexHunter: General Automatic Unpacking Tool for Android Dex Files](https://github.com/zyq8709/DexHunter)
- FDex2：用来从运行中的安卓app中导出dex文件的工具
- [drizzleDumper: drizzleDumper是一款基于内存搜索的Android脱壳工具。](https://github.com/DrizzleRisk/drizzleDumper)
- [DexExtractor 用于破解邦邦加密的安卓dex文件提取器](https://github.com/lambdalang/DexExtractor)
- [FUPK3](https://github.com/F8LEFT/FUPK3): 演示视频https://pan.baidu.com/s/1HH_-TQGca1NLoSqzvOPB3Q 密码：izm3
- [drizzleDumper](https://github.com/DrizzleRisk/drizzleDumper#drizzledumper): drizzleDumper是一款基于内存搜索的Android脱壳工具。
- [DexHunter](https://github.com/zyq8709/DexHunter): General Automatic Unpacking Tool for Android Dex Files
