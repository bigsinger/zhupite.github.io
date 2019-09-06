---
layout:		post
category:	"golang"
title:		"Windows下使用VisualStudioCode搭建golang开发编译运行环境"
tags:		[golang,VSCode]
---
- Content
{:toc}

## 下载安装VisualStudioCode
[VisualStudioCode](https://code.visualstudio.com/)

## 下载安装go
[golang](https://golang.google.cn/)，例如我本地安装在：D:\Go，那么GOROOT就是：D:\Go

如果被墙的话可以从这里下载：[GO语言中文网](https://studygolang.com/dl)

## go项目结构
### 适合个人开发者

![](http://p1.pstatp.com/large/pgc-image/49dee181bb954532bbb1653306433e4a)

### 目前流行的项目结构

![](http://p9.pstatp.com/large/pgc-image/bcedcf8d3f6945adbb8365e0ea6aaf26)

###  适合企业开发者

![](http://p3.pstatp.com/large/pgc-image/6face645ed5347ccabcf8a145ab186f2)

## 下载GitHub模块
使用**go get**命令，例如：

```
go get github.com/op/go-logging
go get github.com/shell909090/goproxy
```

## VSCode配置

首先选定一个golang的工作目录，例如我的是：F:\svnlocal\temp\study_go，也即作为golang的开发目录。

### 中文语言界面
运行VSCode，点击左侧工具栏的“Extensions”按钮，搜索“chinese”找到简体中文语言包，安装，重启后vscode会自动编程中文语言了。

### 安装go扩展插件
运行VSCode，点击左侧工具栏的“Extensions”按钮，搜索“go”安装。

选择菜单File-Open Folder打开该目录，然后新建一个hello.go文件，编写以下代码：

```go
package main


import (
	"fmt"
)


func main() {
	fmt.Println()
    fmt.Printf("Hello World!\n")
}
```

### 配置GOROOT和GOPATH
在VSCode中，需要配置一下GOROOT和GOPATH，等于是需要告诉VSCode你的golang安装目录和开发工作目录在哪里。

由于go在安装的时候默认设置了一个系统环境变量GOPATH，是在USER目录下：%USERPROFILE%\go，可以修改一下。

有几种办法：
- 修改系统环境变量，这个是全局修改，一劳永逸。
- set命令修改，只对当前终端会话有效，重新打开新的终端需要重新修改，比较麻烦。如：set GOPATH=F:/svnlocal/temp/study_go
- 修改lauch.json配置：只对当前工程有效。
- 修改setting.json配置

#### lauch.json配置
选择菜单Debug-Open Configurations，会打开一个**lauch.json**文件，请修改为如下：

```json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch",
            "type": "go",
            "request": "launch",
            "mode": "auto",
            "program": "${fileDirname}",
            "env": {
                "GOROOT": "D:/Go",
                "GOPATH": "F:/svnlocal/temp/study_go"
            },
            "args": [],
            "showLog": true
        }
    ]
}
```

也即指定了**GOROOT**和**GOPATH**，它们分别是go的安装目录和go的开发工作目录。

#### setting.json配置
点击左侧工具栏底部的“Manage”按钮，在弹出的菜单中选择“Settings”打开设置，然后点击右上角的**Open Settings(JSON)**，在打开的setting.json文件中修为为如下内容：

```json
{
    "go.goroot": "D:/Go",
    "go.gopath": "F:/svnlocal/temp/study_go",
}
```

### 如何运行go
- 直接在**TERMINAL**终端运行go run命令编译：**go run hello.go**
- 安装**Code Runner**插件（点击左侧工具栏的“Extensions”按钮，搜索安装），在代码区域右键**“Run Code”**


### 其他依赖
在运行go的时候，VSCode右下角会有提示安装依赖的插件，点击“Install All”即可，期间可能会由于被墙的原因出现失败，可以多试几次。


## 编译成可执行程序
可以直接在**TERMINAL**终端运行go build命令：

```
go build
```

如果需要单独编译某go文件可以：

```
go build -v -o hello.exe hello.go
```

### 跨平台交叉编译可执行程序
在**TERMINAL**终端下先设置env，然后再执行**go build**，查看env可以通过命令：**go env**

#### Windows下编译Android平台可执行程序

```
SET GOOS=linux
SET GOARCH=arm
```

#### Windows下编译Linux平台可执行程序

```
SET CGO_ENABLED=0 	// 禁用CGO
SET GOOS=linux 		// 目标平台是linux
SET GOARCH=amd64 	// 目标处理器架构是amd64
```

#### Windows下编译Mac平台64位可执行程序
```
SET CGO_ENABLED=0
SET GOOS=darwin
SET GOARCH=amd64
go build
```

#### Linux下编译Mac和Windows平台64位可执行程序

```
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build
```

#### Mac下编译Linux和Windows平台64位可执行程序

```
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build
```


## VSCode快捷键
- 格式化代码：Shift + Alt + F 
- 显示函数列表：Ctrl + Shift + O
- 自动生成单元测试文件：Ctrl + Shift + P，然后选择：“Go: Generate Unit Tests For File”

## 参考
- [Golang错误和异常处理的正确姿势](https://www.jianshu.com/p/f30da01eea97)
- [Go语言中的Array、Slice、Map、Set和Struct解析](https://www.jianshu.com/p/247ba63ad8db)
- [go语言的time包](https://my.oschina.net/u/943306/blog/149395)
- [Go语言时间处理](http://kiritor.github.io/2015/04/15/Go%E8%AF%AD%E8%A8%80%E6%97%B6%E9%97%B4%E5%A4%84%E7%90%86/)
- [go语言的bytes\.buffer \- waynehu的个人空间 \- OSCHINA](https://my.oschina.net/u/943306/blog/127981)
- [Golang\-字符串操作处理包\-Strings](http://www.nljb.net/default/Golang-%E5%AD%97%E7%AC%A6%E4%B8%B2%E6%93%8D%E4%BD%9C%E5%A4%84%E7%90%86%E5%8C%85-Strings/)
- 一步一步从零搭建Go语言开发环境 Go语言中文网


