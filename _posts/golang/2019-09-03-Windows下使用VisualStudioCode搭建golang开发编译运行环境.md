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

## VSCode配置
首先选定一个golang的工作目录，例如我的是：F:\svnlocal\temp\study_go，也即作为golang的开发目录。

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

有两种办法：
- 修改lauch.json配置
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


