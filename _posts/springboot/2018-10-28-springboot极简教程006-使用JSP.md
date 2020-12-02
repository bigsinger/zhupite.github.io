---
layout:		post
category:	"springboot"
title:		"springboot极简教程006-使用JSP"
tags:		[]
---
- Content
{:toc}

JSP技术并不是springboot官方推荐的，官方推荐thymeleaf，但是可以简单了解一下。

# 添加依赖
**注意：使用JSP时要在pom中关闭thymeleaf的引用。**
```xml
<!-- servlet依赖. -->
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <scope>provided</scope>
</dependency>

<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>jstl</artifactId>
</dependency>

<!-- tomcat的支持.-->
<dependency>
    <groupId>org.apache.tomcat.embed</groupId>
    <artifactId>tomcat-embed-jasper</artifactId>
    <scope>provided</scope>
</dependency>
```
# 配置JSP加载路径及后缀
在application.yml中添加以下配置：
```yml
spring:
  mvc:
    view:
      prefix: /WEB-INF/jsp/
      suffix: .jsp
```

# 创建JSP文件

在src\main\下创建webapp\WEB-INF\jsp目录，然后在该目录下新建一个hello.jsp：
```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8" %>
Hi JSP 当前时间：${now}
```
# 添加Controller
**注意：** HelloController类上面的@Controller注解不能替换为@RestController，原因参见：[springboot极简教程005\-URL映射](https://www.zhupite.com/springboot/springboot%E6%9E%81%E7%AE%80%E6%95%99%E7%A8%8B005-URL%E6%98%A0%E5%B0%84.html#controller%E5%92%8Crestcontroller%E7%9A%84%E5%8C%BA%E5%88%AB)
```java
@Controller
public class HelloController {
    @RequestMapping("/hello")
    private String hello(Model model) {
        model.addAttribute("now", DateFormat.getDateTimeInstance().format(new Date()));
        return "hello";
    }
}
```
