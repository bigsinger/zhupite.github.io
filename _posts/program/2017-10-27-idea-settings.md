---
layout:		post
category:	"program"
title:		"IntelliJ IDEA高效开发必知必会"
tags:		[]
---

# 快捷键
AndroidStudio快捷键大全配置VisualStudio快捷键一致，如果电脑安装的软件按键有占用的时候，先干掉，特别是输入法，否则会影响开发效率。

以下列举一些常用的，更多的快捷键可以参考：
- [IntelliJ\-IDEA\-Tutorial/keymap\-introduce\.md at newMaster · tengj/IntelliJ\-IDEA\-Tutorial](https://github.com/tengj/IntelliJ-IDEA-Tutorial/blob/newMaster/keymap-introduce.md)
- [Android Studio 小技巧/快捷键 合集](https://yq.aliyun.com/articles/225908?utm_content=m_33084)

快捷键    | 功能 | VisualStudio2017
---|---|---
CTRL + ALT + S | 打开Settings| 
Alt + Enter | 智能辅助| 
CTRL + J | 显示所有代码补全的关键词。| 
SHIFT + F6 | 重命名| 编辑 重命名
ALT + F7 | 查找引用| 查找引用
F11 | 添加普通书签、删除任意书签| 编辑.切换书签
CTRL + F11 | 添加带标记的书签| 
SHIFT + F11 | 打开显示所有书签列表| 视图.书签窗口
CTRL + SHIFT + F12 | 隐藏所有其他窗口，只留代码编辑窗口，这样工作区会最大化，写代码也最爽啦。| 视图 全屏幕
CTRL + SHIFT + R | 在所有文件中替换 | 编辑 在文件中替换
CTRL + ALT + ← | 定位到上一个浏览过的位置。| 视图 向后导航
CTRL + ALT + → | 定位到下一个浏览过的位置。| 视图 向前导航
按住ALT 然后鼠标选择 | 出现大光标多处选择，批量编辑，不要太爽。| 
CTRL + SHIFT + ALT + L | 格式化代码 | CTRL + K, CTRL +D
CTRL + ALT + Home | 切换到相关联的文件。例如在Activity中可以切换到与其关联的resourcexml文件和AndroidManifest.xml（或点击类声明处前面的图标：Related XML File），在xml中可切换到与其关联的Activity文件（或点击前面的小图标c：Related Context Java File）。| CTRL + K, CTRL + O 编辑器上下文菜单.代码窗口.切换标题代码文件
CTRL + F12 | 打开文件结构预览窗口，实用。| 
ALT + F1 | 显示帮助导航，常用的：Project View、File Structure、Show in Explorer| 
CTRL + P | 显示函数原型| 
CTRL + W | 扩大复制范围，通常用鼠标来选取一段文本手都要酸了，用这个比较爽。| 
CTRL + TAB | 显示文件列表供切换，但感觉没有CTRL + E好用。| 
CTRL + E | 显示最近文件列表供切换。| 
Ctrl + Shift + E | 显示最近修改的文件列表供切换。但是实测该快捷键容易被三方APP占用而失效，只能通过菜单：View->Recent Changed Files| 
Ctrl + Shift + Enter | 自动补全、自动格式化代码| 
CTRL + SHIFT + I | 快速查看一个函数的实现。| 
F12 | 回到上一个窗口| 
Ctrl + D | 行复制| 
TAB | 补全尽量用TAB，用Enter后面错的还会有。| 
Ctrl + U | 在一个类中按下可以直接转到其父类的定义。| 
CTRL + + | 展开代码块
CTRL + - | 折叠代码块
F3 or CTRL + F | 当前文件中查找
CTRL + R | 当前文件中替换
CTRL + SHIFT + F | 在所有文件中查找，但是实测该快捷键容易被三方APP占用而失效，只能通过菜单：Edit->Find->Find in Path
CTRL + SHIFT + BackSpace | 定位到上一个编辑过的位置。
ALT + ↑↓ | 在类的不同方法或者内部类之间跳转。
CTRL + 点击TAB | 打开菜单后再点击文件可以定位文件位置。
Esc | 返回到编辑器
Shift + Esc | 关闭当前窗口并返回到编辑器
CTRL + SHIFT + INSERT | 自动插入一些代码，不信你按按看。
CTRL + ALT + M | 提取代码作为一个新的方法。特别是在一个方法体中代码比较多时可以考虑把里面的一部分代码抽取出来作为一个新的子方法，便可以复制此段代码按下快捷键命名一个方法，编辑器将会自动创建该方法。
CTRL + ALT + P | 提取一个局部变量作为当前方法的参数。
CTRL + ALT + T | 显示代码块包围。
Alt + Shift + ↑↓ | 把一行代码上移或下移。
CTRL + Shift + ↑↓ | 把一个方法整体上移或下移。
.for | (补全foreach语句)
.format | (使用String.format()包裹一个字符串)
.cast | (使用类型转化包裹一个表达式)
调试-计算表达式 | 处在断点状态时，光标放在变量处，按Alt + F8，即可显示计算表达式对话框。
调试-审查变量 | 调试状态下，按住Alt键，然后单击表达式即可。

必须设置的：
- 代码片段管理器：[VS中如何添加自定义代码片段——偷懒小技巧](http://blog.csdn.net/guo13313/article/details/50608080)
- 工具-选项-C#或者C/C++-格式设置-缩进+新行
- Visual Studio 2017设置回车（enter）代码补全：
工具-->选项-->文本编辑器-->C/C++-->高级-->主动提交成员列表

## 老版本的VisualStudio修改
如vs2008可以修改以下配置：

- SHIFT + F11	打开显示所有书签列表	视图.书签窗口
- F11	添加普通书签、删除任意书签	编辑.切换书签	
- CTRL + ALT + ←		视图.向前定位
- CTRL + ALT + ←		视图.向后定位
- CTRL + B		VAssistX.GotoImplementation  
- ALT + F7	VAssistX.FindReferences  
- SHIFT + F6		VAssistX.RefactorRename

在vs中修改完快捷键后，选择菜单[工具]-[导入导出设置]把配置好的设置导出备份，如果以后需要重装还能导入继续使用。从此之后常用的快捷键基本上可以跟AndroidStudio保持一致，不用记那么多快捷键了。
 

# 视觉效果
主要是字体大小的设置，默认的字体太小了。
- Appearance font size调为14较合适
- Editor font size 调为18较合适

# 代码提示设置
## 代码完成设置大小写不敏感
Editor->General->Code Completion，MatchCase勾选去掉。

## Live Templates 
对于常用的代码语句或者片段，考虑增加进去，提高效率。
[官网Live Templates](https://www.jetbrains.com/idea/help/live-templates.html)

例如可以把St（默认提示为String）修改为s，或者st。

## File and Code Templates
这个不多说了，看着配置即可。

# Postfix Completion
Editor->General->Postfix Completion，这个功能要多熟悉使用，提高开发效率的。

# 插件
很多AndroidStudio的插件做的特别棒，很大程度上能提高开发效率，有必要安装和熟悉使用一些插件工具。

## 插件推荐

|插件名称    |插件介绍      |官网地址        |
|:-----------------|:----------|:--------------|
|IDE Features Trainer|IntelliJ IDEA 官方出的学习辅助插件|<https://plugins.jetbrains.com/plugin/8554?pr=idea>|
|Key promoter|快捷键提示|<https://plugins.jetbrains.com/plugin/4455?pr=idea>|
|Grep Console|自定义设置控制台输出颜色|<https://plugins.jetbrains.com/idea/plugin/7125-grep-console>|
|String Manipulation|驼峰式命名和下划线命名交替变化|<https://plugins.jetbrains.com/plugin/2162?pr=idea>|
|CheckStyle-IDEA|代码规范检查|<https://plugins.jetbrains.com/plugin/1065?pr=idea>|
|FindBugs-IDEA|潜在 Bug 检查|<https://plugins.jetbrains.com/plugin/3847?pr=idea>|
|MetricsReloaded|代码复杂度检查|<https://plugins.jetbrains.com/plugin/93?pr=idea>|
|Statistic|代码统计|<https://plugins.jetbrains.com/plugin/4509?pr=idea>|
|JRebel Plugin|热部署|<https://plugins.jetbrains.com/plugin/?id=4441>|
|CodeGlance|在编辑代码最右侧，显示一块代码小地图|<https://plugins.jetbrains.com/plugin/7275?pr=idea>|
|GsonFormat|把 JSON 字符串直接实例化成类|<https://plugins.jetbrains.com/plugin/7654?pr=idea>|
|MultiMarkdown|书写 Markdown 文章|<https://plugins.jetbrains.com/plugin/7896?pr=idea>|
|Jindent-Source Code Formatter|自定义类、方法、doc、变量注释模板|<http://plugins.jetbrains.com/plugin/2170?pr=idea>|
|ECTranslation|翻译插件|<https://github.com/Skykai521/ECTranslation/releases>|