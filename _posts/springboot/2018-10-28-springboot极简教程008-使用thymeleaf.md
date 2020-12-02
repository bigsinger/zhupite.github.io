---
layout:		post
category:	"springboot"
title:		"springboot极简教程008-使用thymeleaf"
tags:		[]
---
- Content
{:toc}

# 关于thymeleaf
- Thymeleaf是现代化服务器端的Java模板引擎，不同与其它几种模板的是Thymeleaf的语法更加接近HTML，并且具有很高的扩展性。
- SpringBoot官方推荐模板，提供了可选集成模块(spring-boot-starter-thymeleaf)，可以快速的实现表单绑定、属性编辑器、国际化等功能。
- 支持无网络环境下运行，由于它支持 html 原型，然后在 html 标签里增加额外的属性来达到模板+数据的展示方式。浏览器解释 html 时会忽略未定义的标签属性，所以 thymeleaf 的模板可以静态地运行；当有数据返回到页面时，Thymeleaf 标签会动态地替换掉静态内容，使页面动态显示。

# 添加依赖
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

# 创建模板
在resources\static下添加js、css，在resources\templates目录下添加模板文件，例如index.html

# 控制层代码
```java
package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import java.util.ArrayList;
import java.util.List;

/*
运行后浏览器中访问：
http://localhost:8080/index
http://localhost:8080/index2
*/
@Controller
public class HelloController {
    private static List<Course> getCourses(){
        List<Course> courses =new ArrayList<Course>();
        Course bean =new Course("官方参考文档","Spring Boot Reference Guide","http://docs.spring.io/spring-boot/docs/1.5.1.RELEASE/reference/htmlsingle/#getting-started-first-application");
        courses.add(bean);
        courses.add(bean);
        courses.add(bean);
        bean =new Course("官方SpringBoot例子","官方SpringBoot例子","https://github.com/spring-projects/spring-boot/tree/master/spring-boot-samples");
        courses.add(bean);
        courses.add(bean);
        courses.add(bean);

        return courses;
    }

    @RequestMapping("/index")
    private ModelAndView index() {
        ModelAndView modelAndView = new ModelAndView("/index");
        modelAndView.addObject("courses", getCourses());
        return modelAndView;
    }

    @RequestMapping("/index2")
    private ModelAndView index2(){
        ModelAndView modelAndView = new ModelAndView("/index2");
        modelAndView.addObject("courses", getCourses());
        return modelAndView;
    }
}
```

浏览器中访问http://localhost:8080/index时访问的是index.html，访问http://localhost:8080/index2时访问的是index2.html，可以参见GitHub项目，运行后分别访问这两个URL看看效果：[spring\_study/L5Thymeleaf](https://github.com/bigsinger/spring_study/tree/master/L5Thymeleaf)

index.html没有使用thymeleaf，index2.html有使用thymeleaf，在不运行springboot项目时静态本地访问它们，可以对比观察出差异。动态运行springboot项目后，只不过内容被动态填充，但是页面风格依然不变。

# 模板热部署
- spring.thymeleaf.cache 属性设置成 false
- 每次修改静态内容后按Ctrl+Shift+F9即可重新加载