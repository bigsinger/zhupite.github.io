---
layout:		post
category:	"springboot"
title:		"springboot极简教程002-HelloWord"
tags:		[]
---
- Content
{:toc}
俗话说，万事开头难，这回偏就来个简单的。本节课不多学，就学会一个HelloWord即可，从此通往springboot世界的大门。

# 新建spring工程
- 运行IDEA，新建工程，选择Spring Initializr - Next - Project Metadata界面填写好Group和Artifact，其他的可以默认。
- Next之后的界面中在第一栏选择【Web】，第二栏勾选【Web】，然后Next，最后选择项目保存的目录，完成。

# 项目结构
自动生成的项目后观察项目组织结构，都有哪些文件。

- pom.xml：主要是Maven项目的配置文件，主要是添加依赖的，可以点开看看熟悉一下。
- src目录下有main和test，test目录下主要用来编写测试单元代码的，后面会慢慢接触。main目录下有java和resources目录，java目录下主要就是java代码，resources目录下主要存放一些资源或者项目配置文件。
- Application（如果是一路按照默认向导创建的项目，会是DemoApplication）：这个是springboot的应用程序类，默认通过注解@SpringBootApplication来指定了该类为springboot的启动类，这个文件前期基本上不需要修改。
- resources目录下有：static和templates文件夹，默认均为空，还有一个application.properties配置文件，默认也是空。

# 运行
可以直接点击IDEA右上方的运行按钮，观察效果，在日志输出中显示：
```none
FrameworkServlet 'dispatcherServlet': initialization completed in 12 ms
```
则说明springboot项目已经运行起来了，此时在浏览器中访问http://localhost:8080，会显示一个Whitelabel Error Page的信息。这是因为我们还没有做任何有实质性内容的展示或输出，下面可以添加一个经典的HelloWord信息展示。

在应用程序的默认包下创建类：HelloController，内容如下：
```java
@RestController
public class HelloController {
    @RequestMapping({"/", "/index"})
    private String index() {
        return "hello world";
    }
}
```
运行后在浏览器中访问：http://localhost:8080 或 http://localhost:8080/index，页面上会输出显示：
```none
hello world
```

添加注解相当于做了一个配置，用来添加一个页面URL的转向，使得在访问http://localhost:8080/ 或 http://localhost:8080/index时能够调用到HelloController的index函数，进而可以输出字符串hello world。
