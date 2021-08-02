---
layout:		post
category:	"android"
title:		"Android黑客工具-安卓安全工具汇总"
tags:		[android]
---
- Content
{:toc}
**关键词**：安卓破解工具，安卓逆向工具，安卓黑客工具，安卓安全工具，Android破解工具，Android逆向工具，Android黑客工具，Android安全工具。



# 综合工具

- [APKmenuTOOL - 安卓右键工具](https://github.com/bigsinger/APKmenuTOOL)
- [界面布局分析 AndLayoutInspector](https://github.com/inckie/AndLayoutInspector)  C\# version of uiautomation tool
- [AppMethodOrder](https://github.com/zjw-swun/AppMethodOrder)：:一个能让你了解所有函数调用顺序以及函数耗时的Android库（无需侵入式代码）
- Python校验apk签名：[apk-signature-verify](https://github.com/shuxin/apk-signature-verify): jar Signature / APK Signature v2 verify with pure python (support rsa dsa ecdsa)
- [AmBinaryEditor（AndroidManifest二进制修改工具介绍） Ele7enxxh's Blog](http://ele7enxxh.com/AndroidManifest-Binary-Editor.html)
- [zylc369/AndroidManifestFix: 修复AndroidManifest.xml，用于修复AXML文件中属性名称缺失的问题。](https://github.com/zylc369/AndroidManifestFix)
- [MT管理器](http://binmt.cc)
- 



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

# 框架

- 隐私检测 安全检测 HOOK函数调用 行为分析等可以借助这个框架：[appmon](https://github.com/dpnishant/appmon)
- 插件化框架 PMS AMS HOOK [tiann/understand-plugin-framework: demos to help understand plugin framwork](https://github.com/tiann/understand-plugin-framework)
- [MobSF/Mobile-Security-Framework-MobSF: Mobile Security Framework (MobSF) is an automated, all-in-one mobile application (Android/iOS/Windows) pen-testing, malware analysis and security assessment framework capable of performing static and dynamic analysis.](https://github.com/MobSF/Mobile-Security-Framework-MobSF)

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
- 

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



# 抓包

- [r0capture: 安卓应用层抓包通杀脚本](https://github.com/r0ysue/r0capture)
- 

# 调试器

- [AndBug: Android Debugging Library](https://github.com/swdunlop/AndBug) 在没有源代码的情况下，调试android上的java程序，支持断点、call stack查看、查看class、method等信息
- [Android-OpenDebug: Make any application debuggable](https://github.com/iSECPartners/Android-OpenDebug) 是一个Cydia Substrate的插件，所以前提是要先安装Cydia Substrate，可以使得任何一个安卓程序可以被调试，就有了分析和破解的可能

# 多开虚拟空间

- 太极
- VirtualApp
- 

# 混淆反混淆

- [FreeProGuard](https://github.com/Blankj/FreeProGuard)  Config proguard for common Android libraries.
- [NP-Manager](https://github.com/githubXiaowangzi/NP-Manager)：超级混淆
- 

# 游戏破解工具

## unity

- [Perfare/AssetStudio: AssetStudio is a tool for exploring, extracting and exporting assets and assetbundles\.](https://github.com/Perfare/AssetStudio)
- 



# 其他

- [《安卓应用的安全和破解》](https://book.crifan.com/books/android_app_security_crack/website/) --持续更新..
- strandhogg：[StrandHogg - Serious Android vulnerability | Promon](https://promon.co/security-news/strandhogg/)
- 