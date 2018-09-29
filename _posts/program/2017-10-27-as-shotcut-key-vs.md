---
layout:		post
category:	"program"
title:		"AndroidStudio快捷键大全配置VisualStudio快捷键一致"
tags:		[]
---


快捷键    | 功能 | VisualStudio2017
---|---|---
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
 

### 参考
- [Android Studio 小技巧/快捷键 合集\-博客\-云栖社区\-阿里云](https://yq.aliyun.com/articles/225908?utm_content=m_33084)