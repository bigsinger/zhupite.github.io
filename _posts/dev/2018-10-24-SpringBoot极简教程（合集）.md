---
layout:		post
category:	"dev"
title:		"SpringBoot极简教程（合集）"
tags:		[springboot]
---

> 作者是一名C++客户端开发者，因工作需要在2018年转向学习SpringBoot。本教程从零基础出发，记录了从环境搭建到项目部署的完整学习路径，包含一个23篇的极简教程系列、若干补充知识点，以及一个实际项目的重构经验分享。

---

# 一、前言

写于2018-10-24

作为一个长时间使用C++语言的客户端开发来说，居然也要开始学习和使用springboot，就连我自己都不敢相信，甚至觉得诧异。上个周末花了两天时间看了一些教程并做了一些练习，自我感觉入门了，所以记录一下，可以给没有任何基础的人作为参考学习。但是同时也想说一些自己的理解和感悟，特别是在语言与框架上的一点比较和看法，例如对于C++、Java、Python，Django之于springboot。

就目前的了解来看，有以下几点，当然这些看法可能会随着时间以及对springboot的了解而变化，这不重要，重要的是得有自己的看法：

- Java的确是个很啰嗦的语言（相对于C++来说，相较于Python的话更是如此）。
- springboot的优势在于生态，以及对spring的封装。
- 对于创业公司来说，Django也是不二之选，代码量要极少，开发速度要极快。
- 对于大型项目或者大型公司来说，Java的好处是稳定，更容易多人协作，所以更容易选择springboot框架。
- Java的设计初衷和核心思想是：减少出错，让程序员的门槛更低，更易维护，更易协作，让问题和错误在编译器就尽可能地减少。
- 根据Java的设计初衷引发：更容易多人协作，这个可以对比C++的大型项目开发，协作一帮C++的开发人员的难度要远远远远高于协作一帮Java开发。
- 在Java里，如果同时存在注解和文件配置方式，要更倾向于使用注解，并尽可能大量使用之。
- 得益于强大的IDEA编译器，进行Java开发是一件很舒心的事情，写代码如同行云流水般酣畅淋漓。
- 很重要也是很致命的一点：由于Java属于静态语言，所以很多错误可以依赖编译器在开发阶段发现并解决。而Python属于动态脚本语言，很多问题不能在静态阶段发现，因此对开发人员的水平要求就要高一些，这也就是说如果你的团队里没有或者以后招不到较高水平的Python开发人员，还是使用Java吧。
- Django的ORM设计得是最方便的，没有之一，极简极快速。springboot的JPA那一套，看着就恶心。
- MyBatis看着闹心，要默默在心里告诉自己：习惯就好习惯就好……
- Django输在生态上。
- Python的2.x与3.x版本差异在某种程度上阻碍了Python的发展。
- Python是个很好的全栈语言。
- C++的开发要求更高，现在几乎招不到人了。在解决C++的崩溃问题上，所花费的代价是很昂贵的。
- Python开发效率非常非常高。
- Java的设计初衷：源于C++并把C++中难以掌控的部分尽可能规范与避免，使得生产成本可以降低，维护成本降低，长期仍然看好。
- Java很适合做编程思想交流，所以群体更容易壮大，也更容易诞生出很多设计模式。
- 人生苦短，我用Python。

---

# 二、环境搭建

工欲善其事必先利其器，这个绝对真理。

## 软件安装

以Windows系统来进行springboot的开发，需要下载安装：

- IDEA专业版，并配置好字体大小，并熟练掌握常用的快捷键及高效技巧
- MariaDB，这个数据库软件是MySQL的分支版本，很多线上的生产环境都在使用
- Git：对于不支持SVN的地方可以使用Git
- SVN：可以用来搭建实验环境，也可以拉取GitHub上的开源代码

为什么我会推荐SVN而不是Git，因为对于个人学习来说SVN要方便一些，特别是在Windows系统上，因为你不需要协调合作不需要搞分支，就没必要使用复杂的Git。

## Maven设置国内镜像

不设置卡死你，Maven国内访问奇慢无比，即使用了VPN。改成国内的镜像，瞬间就完成了。方法如下：

打开IntelliJ IDEA->Settings ->Build, Execution, Deployment -> Build Tools > Maven

点击 Override。然后新建一个settings.xml。内容如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
<mirrors>
<!-- 阿里云仓库 -->
<mirror>
<id>alimaven</id>
    <mirrorOf>central</mirrorOf>
    <name>aliyun maven</name>
    <url>http://maven.aliyun.com/nexus/content/repositories/central/</url>
    </mirror>

    <!-- 中央仓库1 -->
    <mirror>
        <id>repo1</id>
        <mirrorOf>central</mirrorOf>
        <name>Human Readable Name for this Mirror.</name>
        <url>http://repo1.maven.org/maven2/</url>
    </mirror>

    <!-- 中央仓库2 -->
    <mirror>
        <id>repo2</id>
        <mirrorOf>central</mirrorOf>
        <name>Human Readable Name for this Mirror.</name>
        <url>http://repo2.maven.org/maven2/</url>
    </mirror>
</mirrors>

</settings>
```

## 多显示器

强烈建议配置多显示器，一边开文档、网页、参考代码，一边IDEA开发环境，速度嗷嗷地，学习成本降低30%，效率相应也大大提高。不多说，谁用谁知道。

---

# 三、Hello World

俗话说，万事开头难，这回偏就来个简单的。本节课不多学，就学会一个HelloWord即可，从此通往springboot世界的大门。

## 新建spring工程

- 运行IDEA，新建工程，选择Spring Initializr - Next - Project Metadata界面填写好Group和Artifact，其他的可以默认。
- Next之后的界面中在第一栏选择【Web】，第二栏勾选【Web】，然后Next，最后选择项目保存的目录，完成。

## 项目结构

自动生成的项目后观察项目组织结构，都有哪些文件。

- pom.xml：主要是Maven项目的配置文件，主要是添加依赖的。
- src目录下有main和test，test目录下主要用来编写测试单元代码的。main目录下有java和resources目录，java目录下主要就是java代码，resources目录下主要存放一些资源或者项目配置文件。
- Application：这个是springboot的应用程序类，默认通过注解@SpringBootApplication来指定了该类为springboot的启动类，这个文件前期基本上不需要修改。
- resources目录下有：static和templates文件夹，默认均为空，还有一个application.properties配置文件，默认也是空。

## 运行

可以直接点击IDEA右上方的运行按钮，观察效果，在日志输出中显示：

```
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

运行后在浏览器中访问：http://localhost:8080 或 http://localhost:8080/index，页面上会输出显示hello world。

---

# 四、使用配置

## 修改配置

在application.yml中添加您想要配置的数据，例如以下配置内容：

```yml
student:
  name: Jim
  age: 22
content: "name: ${student.name}, age: ${student.age}"
```

如何在Java代码中使用这些配置的数据呢？

## @EnableAutoConfiguration

首先要使用该注解，该注解的作用可以搜索之，此处暂不详解。

## 方式一：使用注解@Value

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@EnableAutoConfiguration
public class HelloController {

    @Value("${student.name}")
    private String name;

    @Value("${student.age}")
    private Integer age;

    @Value("${content}")
    private String content;

    @RequestMapping("/")
    private String index() {
        return content;
    }

    @RequestMapping("/index")
    private String index2() {
        return String.format("student: %s, age: %d\n", this.name, this.age);
    }
}
```

## 方式二：使用注解@ConfigurationProperties、@PropertySource、@Autowired

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "student")
public class StudentProperties {
    private String name;
    private Integer age;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
}
```

## @PropertySource指定配置文件

例如在resources目录下创建test.yml用于存放测试数据：

```yml
student:
  name: Jim(Test)
  age: 22(Test)
```

使用该配置文件的数据，可以用**@PropertySource**指定使用的配置文件：

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@ConfigurationProperties(prefix = "student")
@PropertySource("classpath:test.yml")
public class StudentTestBean {
    private String name;
    private Integer age;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
}
```

## 使用注解@Autowired进行自动装配

```java
@RestController
@EnableAutoConfiguration
public class HelloController {
    @Value("${version}")
    private String version;

    @Autowired
    private StudentProperties student_default;

    @Autowired
    private StudentTestBean student_test;

    @RequestMapping("/student")
    private String student(String name, Integer age) {
        if (name == null) name = student_default.getName();
        if (age == null) age = student_default.getAge();
        return String.format("Online: %s\nname: %s, age: %d\nname(Test): %s, age(Test): %d",
            version, name, age, student_test.getName(), student_test.getAge());
    }
}
```

---

# 五、多环境配置

在resources目录下创建application.yml，application-dev.yml，application-prod.yml配置文件，在application.yml中添加以下配置：

```yml
spring:
  profiles:
    active: prod
```

application-dev.yml：

```yml
version: TEST
```

application-prod.yml：

```yml
version: PROD
```

也即当前启用**prod**的配置文件，那么配置文件会使用**application-prod.yml**而不是application-dev.yml。

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@EnableAutoConfiguration
public class HelloController {
    @Value("${version}")
    private String version;

    @RequestMapping("/")
    private String index() {
        return String.format("Online: %s", version);
    }
}
```

把application.yml中的active改为dev再试一下，输出的内容就会变成TEST版。

---

# 六、URL映射

我发现在很多springboot教程里几乎没有提到过URL映射，主要是很简单，看看代码基本上就明白了，我这里简单说一说，也说一说与Django的一点区别。

## @RequestMapping注册URL映射

在Django中URL的映射是靠project里urls.py中的**urlpatterns**配置。在springboot里是在控制层直接通过注解的方式来完成的。通常的做法是：

- 创建一个名为controller的包
- 然后在这个包下创建各种Controller
- 通过注解 **@RequestMapping** 来注册，实现URL的映射（也即访问URL时所执行的函数）。

```java
@RestController
@EnableAutoConfiguration
public class HelloController {
    @Value("${version}")
    private String version;

    @Autowired
    private StudentProperties student_default;

    @Autowired
    private StudentTestBean student_test;

    @RequestMapping("/student")
    private String student(String name, Integer age) {
        if (name == null) name = student_default.getName();
        if (age == null) age = student_default.getAge();
        return String.format("Online: %s\nname: %s, age: %d\nname(Test): %s, age(Test): %d",
            version, name, age, student_test.getName(), student_test.getAge());
    }
}
```

通过@RequestMapping将 **/student** 映射到了HelloController的student函数。在运行项目时会看到springboot的输出日志：

```
Mapped "{[/student]}" onto private java.lang.String ...
```

> @RequestMapping中的method没有默认值，如果不配置method，则以任何请求形式（GET、POST、PUT、DELETE）都可以访问得到。

这种设计方法稍微有点混乱，没有Django这种配置一个通用的表来的方便。当然，也有一个稍微折中的办法，就是可以在Controller类上映射某个子目录URL，由该Controller类统一管理该子URL下的其他子URL，也就是**分模块管理**，里面再做映射就是绑定到具体函数了。

例如对于以下的代码，CourseController类统一映射到了 **http://localhost:8080/course**：

```java
@Controller
@RequestMapping("/course")
public class CourseController extends BaseController {
    @Autowired
    private CourseService courseService;
    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @RequestMapping("")
    public String course(Model model) {
        model.addAttribute("ctx", getContextPath() + "/");
        return "courses";
    }

    // http://localhost:8080/course/queryCourseList
    @RequestMapping(value = "/queryCourseList", method = RequestMethod.POST)
    @ResponseBody
    public AjaxObject queryCourse(Page<?> page) {
        // ...
    }

    // http://localhost:8080/course/add
    @RequestMapping(value = "/add", method = RequestMethod.POST)
    @ResponseBody
    public AjaxObject addCourse(@RequestBody Course course) {
        courseService.save(course);
        return AjaxObject.ok();
    }

    // http://localhost:8080/course/update
    @RequestMapping(value = "/update", method = RequestMethod.POST)
    @ResponseBody
    public AjaxObject updateCourse(@RequestBody Course course) {
        courseService.update(course);
        return AjaxObject.ok();
    }

    // http://localhost:8080/course/delete
    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    @ResponseBody
    public AjaxObject deleteCourse(@RequestBody Long[] ids) {
        courseService.deleteByIds(ids);
        return AjaxObject.ok();
    }
}
```

> Spring4.3以后为简化@RequestMapping(method = RequestMethod.XXX)的写法，将其做了一层包装，也就是现在的GetMapping、PostMapping、PutMapping、DeleteMapping、PatchMapping。

## @Controller和@RestController的区别

- @RestController注解相当于 @ResponseBody + @Controller 合在一起的作用。
- 如果只是使用@RestController注解Controller，则Controller中的方法无法返回jsp页面或者html，配置的视图解析器 InternalResourceViewResolver 不起作用，返回的内容就是Return里的内容。
- 如果需要返回到指定页面，则需要用@Controller配合视图解析器InternalResourceViewResolver才行。
- 如果需要返回JSON、XML或自定义mediaType内容到页面，则需要在对应的方法上加上@ResponseBody注解。

---

# 七、视图模板：JSP与Thymeleaf

## 7.1 使用JSP

JSP技术并不是springboot官方推荐的，官方推荐thymeleaf，但是可以简单了解一下。

### 添加依赖

**注意：使用JSP时要在pom中关闭thymeleaf的引用。**

```xml
<!-- servlet依赖 -->
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <scope>provided</scope>
</dependency>

<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>jstl</artifactId>
</dependency>

<!-- tomcat的支持 -->
<dependency>
    <groupId>org.apache.tomcat.embed</groupId>
    <artifactId>tomcat-embed-jasper</artifactId>
    <scope>provided</scope>
</dependency>
```

### 配置JSP加载路径及后缀

在application.yml中添加以下配置：

```yml
spring:
  mvc:
    view:
      prefix: /WEB-INF/jsp/
      suffix: .jsp
```

### 创建JSP文件

在src\main\下创建webapp\WEB-INF\jsp目录，然后在该目录下新建一个hello.jsp：

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8" %>
Hi JSP 当前时间：${now}
```

### 添加Controller

**注意：** HelloController类上面的@Controller注解不能替换为@RestController。

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

## 7.2 使用Thymeleaf

Thymeleaf是现代化服务器端的Java模板引擎，不同与其它几种模板的是Thymeleaf的语法更加接近HTML，并且具有很高的扩展性。SpringBoot官方推荐模板，支持无网络环境下运行。

### 添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

### 创建模板

在resources\static下添加js、css，在resources\templates目录下添加模板文件，例如index.html。

### 控制层代码

```java
package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import java.util.ArrayList;
import java.util.List;

@Controller
public class HelloController {
    private static List<Course> getCourses(){
        List<Course> courses =new ArrayList<Course>();
        // ...
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

index.html没有使用thymeleaf，index2.html有使用thymeleaf，在不运行springboot项目时静态本地访问它们，可以对比观察出差异。动态运行springboot项目后，只不过内容被动态填充，但是页面风格依然不变。

### 模板热部署

- spring.thymeleaf.cache 属性设置成 false
- 每次修改静态内容后按Ctrl+Shift+F9即可重新加载

---

# 八、工程建议

## 组织结构

### 实体类

建议把实体类统一放在某个包下，包名建议取名：

- **model**（模型，也就是MCV模式中的M）
- entity（Java有些封装的函数参数就是用的这个）
- bean（java中的bean就是模型层的类）
- pojo（Plain Ordinary Java Object的缩写）

### 实体操作类

用来提供数据库操作接口：

- JPA中带Repository后缀，如UserRepository
- MyBatis中带Mapper后缀，如UserMapper

对于通用的操作接口，也可以让实体操作类统一**继承**一个自己封装的**中间层**（封装一些常用的接口函数）：

- JPA的做法是继承JpaRepository
- MyBatis的做法是Mapper、MySqlMapper

例如使用MyBatis时，可以提供一个封装后的通用类CommonMapper：

```java
import tk.mybatis.mapper.common.Mapper;
import tk.mybatis.mapper.common.MySqlMapper;
import java.util.List;
import java.util.Map;

//FIXME 特别注意，该接口不能被扫描到，否则会出错
public interface CommonMapper<T> extends Mapper<T>, MySqlMapper<T> {
    List<T> queryList(Map<String, Object> map);
}

public interface CourseMapper extends CommonMapper<Course> {
}
```

### 服务接口

一开始很不理解这种模式，原本业务逻辑层可以直接使用实体操作类就完成的事情，硬是弄出许多个类（算上实体类、实体操作类、服务接口、服务实现一共四个了），但是后来发现这种方式还是有好处的。服务接口相当于是提供了一个**缓冲地带，隔离了业务逻辑层直接与实体操作类的接触**。

把重复使用的那些接口封装出去，提到一个基类接口中管理，我们把这个基类服务接口叫做**BaseService**：

```java
import org.springframework.stereotype.Service;

@Service
public interface BaseService<T> {
    T selectByKey(Object key);
    int save(T entity);
    int delete(Object key);
    int update(T entity);
}
```

其实现代码BaseServiceImpl：

```java
import org.springframework.beans.factory.annotation.Autowired;
import tk.mybatis.mapper.common.Mapper;

public abstract class BaseServiceImpl<T> implements BaseService<T> {

    @Autowired
    protected Mapper<T> mapper;

    public Mapper<T> getMapper() { return mapper; }

    @Override
    public T selectByKey(Object key) {
        return mapper.selectByPrimaryKey(key);
    }

    @Override
    public int save(T entity) {
        return mapper.insert(entity);
    }

    @Override
    public int delete(Object key) {
        return mapper.deleteByPrimaryKey(key);
    }

    @Override
    public int update(T entity) {
        return mapper.updateByPrimaryKeySelective(entity);
    }
}
```

以后再为实体操作类封装服务接口时，继承BaseService即可。

---

# 九、使用日志

SpringBoot默认用**Logback**来记录日志，并用INFO级别输出到控制台。Logback是log4j框架的作者开发的新一代日志框架，它效率更高、能够适应诸多的运行环境，同时天然支持SLF4J。

## 开启日志

由于spring-boot-starter包含了spring-boot-starter-logging，Thymeleaf依赖包含了spring-boot-starter，所以一般不用特别开启就可以使用logback。

## 日志级别

**TRACE < DEBUG < INFO < WARN < ERROR < FATAL**

在application.yml中开启，例如：`debug: true`

### 级别控制

```
logging.level.?=LEVEL
```

其中?为包名或Logger名，LEVEL可选TRACE、DEBUG、INFO、WARN、ERROR、FATAL、OFF。

例如：

- `logging.level.com.example=DEBUG`：com.example包下所有class以DEBUG级别输出
- `logging.level.root=WARN`：root日志以WARN级别输出

## 输出日志到文件

默认情况下，Spring Boot将日志输出到控制台，不会写到日志文件。如果要编写除控制台输出之外的日志文件，则需在application.properties中设置logging.file或logging.path属性。

- logging.file，设置文件，可以是绝对路径，也可以是相对路径。如：logging.file=my.log
- logging.path，设置目录，会在该目录下创建spring.log文件，并写入日志内容

默认情况下，日志文件的大小达到10MB时会切分一次。

## 切分文件日志RollingFileAppender

- **maxHistory**：保存最大多少天的日志
- **totalSizeCap**：日志文件上限自动删除旧日志

## 多环境日志输出

在logback-spring.xml中配置多环境：

```xml
<!-- 测试环境+开发环境. 多个使用逗号隔开. -->
<springProfile name="test,dev">
    <logger name="com.dudu.controller" level="info" />
</springProfile>
<!-- 生产环境. -->
<springProfile name="prod">
    <logger name="com.dudu.controller" level="ERROR" />
</springProfile>
```

也可以在多环境的yml文件中分别配置。

---

# 十、数据库准备

比较推荐使用MySQL的分支版本MariaDB来进行学习，很多线上的生产环境都在使用，所以学习阶段就可以开始熟悉它。

## 需要注意的地方

- 安装好MariaDB后，可以把安装目录下的bin目录路径添加到PATH环境变量中。
- 创建数据库表的时候尽量使用utf8格式（有的推荐utf8mb4）。
- MySQL5.5版本的默认数据库存储引擎为InnoDB，InnoDB具有提交、回滚和崩溃恢复能力的事务安全。MyISAM提供高速存储和检索，以及全文搜索能力，适合数据仓库等查询频繁的应用。但不支持事务、也不支持外键。

```sql
-- 创建utf8mb4字符集的数据库test
create database test default character set utf8mb4;

-- 修改表score的字符集为utf8
alter table score default character set utf8;
```

## 常用命令

```bash
# 连接数据库
mysql -uroot -proot

# 重启MySQL
service mysqld restart

# 查看MySQL当前默认的存储引擎
mysql> show variables like '%storage_engine%';

# 创建数据库
CREATE DATABASE student DEFAULT CHARACTER SET utf8;

# 查看数据库
show databases;

# 查看表的创建信息
show create table user;

# 修改表的存储引擎
ALTER TABLE user ENGINE=INNODB;
```

## 测试用数据库表及SQL

```sql
DROP DATABASE IF EXISTS student;
CREATE DATABASE student DEFAULT CHARACTER SET utf8;

use student;

CREATE TABLE student(
  id int(11) NOT NULL AUTO_INCREMENT,
  student_id int(11) NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  age int(11) NOT NULL,
  sex varchar(255) NOT NULL,
  birthday date DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

# 十一、JdbcTemplate

> Spring Framework对数据库的操作在JDBC上面做了深层次的封装，通过依赖注入功能，可以将DataSource注册到JdbcTemplate之中，使我们可以轻易的完成对象关系映射。

**特点**

- 速度快，对比其它的ORM框架而言，JDBC的方式无异于是最快的
- 配置简单，Spring自家出品，几乎没有额外配置
- 学习成本低，毕竟JDBC是基础知识

## 添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>
```

## 配置数据源

```xml
spring.datasource.url = jdbc:mysql://localhost:3306/course?useUnicode=true&characterEncoding=utf-8
spring.datasource.username = root
spring.datasource.password = root
spring.datasource.driver-class-name = com.mysql.jdbc.Driver
```

## 接口实现类

```java
@Repository
public class UserDaoImpl implements UserDao {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public List<User> queryAll() {
        String sql = "select id, username, password from t_user";
        List<User> userList = new ArrayList<User>();
        Connection connection = null;
        PreparedStatement ps = null;
        ResultSet resultSet = null;
        try {
            connection = jdbcTemplate.getDataSource().getConnection();
            ps = connection.prepareStatement(sql);
            resultSet = ps.executeQuery();
            User user = null;
            while (resultSet.next()) {
                int id = resultSet.getInt("id");
                String username = resultSet.getString("username");
                user = new User();
                user.setId(id);
                user.setUsername(username);
                userList.add(user);
            }
            return userList;
        } catch (SQLException e) {
            // 异常处理
        } finally {
            // 关闭数据库资源
        }
        return userList;
    }
}
```

---

# 十二、MyBatis

## 12.1 MyBatis介绍

Mybatis是sql-mapping框架而不是orm框架，Mybatis是OXM设计不是对象关系映射。

## 添加依赖

```xml
<!--MyBatis-->
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>1.3.2</version>
</dependency>

<!-- mysql -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.21</version>
</dependency>
```

MyBatis使用方式主要有两种：注解方式和XML方式。个人强烈推荐注解方式，干净清爽，直接在Java代码里做好不用在Java和XML中来回跳转。

## 12.2 注解方式

```java
@Mapper
public interface PersonMapper {

    @Insert("insert into person (id, name, age, job) values (#{id}, #{name}, #{age}, #{job})")
    void add(Person person);

    @Delete("delete from person where id = #{id}")
    void delete(@Param("id") int id);

    @Update("update person set name = #{name} where id = #{id}")
    void update(@Param("id") int id, @Param("name") String name);

    @Select("select * from person where name = #{name}")
    Person queryByName(@Param("name") String name);

    @Select("select * from person")
    List<Person> queryAll();
}
```

## 12.3 MyBatis自动生成器（Generator）

MyBatis操作数据库的方式介于JDBC与ORM之间。一个很有用的功能就是**自动生成器**：generator，可以根据已经存在的数据库表来**反向生成代码**。

### 创建数据库表

使用MyBatis的自动生成器功能来反向生成代码，首先需要有数据库表。

### 添加依赖

在pom.xml中配置generator插件：

```xml
<plugin>
    <groupId>org.mybatis.generator</groupId>
    <artifactId>mybatis-generator-maven-plugin</artifactId>
    <version>1.3.5</version>
    <configuration>
        <!--配置文件的路径-->
        <configurationFile>src/main/resources/generatorConfig.xml</configurationFile>
        <overwrite>true</overwrite>
        <verbose>true</verbose>
    </configuration>
    <dependencies>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>${mysql.version}</version>
        </dependency>
    </dependencies>
</plugin>
```

### generatorConfig.xml

generatorConfig.xml是MyBatis-generator默认使用的配置文件，需要在resources目录下创建：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE generatorConfiguration
        PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
        "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">
<generatorConfiguration>

    <context id="DB2Tables" targetRuntime="MyBatis3">

        <!--是否在代码中显示注释-->
        <commentGenerator>
            <property name="suppressDate" value="true"/>
            <property name="suppressAllComments" value="true"/>
        </commentGenerator>

        <!--jdbc的数据库连接 -->
        <jdbcConnection
                connectionURL="jdbc:mysql://127.0.0.1:3306/student?characterEncoding=UTF-8"
                userId="root"
                password="root"
                driverClass="com.mysql.jdbc.Driver"
        />

        <!--生成pojo类存放位置-->
        <javaModelGenerator targetPackage="com.example.usemybatis.dao.model"
                targetProject="src/main/java">
            <property name="enableSubPackages" value="true"/>
            <property name="trimStrings" value="true"/>
        </javaModelGenerator>

        <!--Mapper映射文件生成所在的目录-->
        <sqlMapGenerator targetPackage="mapper"
                targetProject="src/main/resources">
            <property name="enableSubPackages" value="true"/>
        </sqlMapGenerator>

        <!--生成mapper类存放位置-->
        <javaClientGenerator type="XMLMAPPER"
                targetPackage="com.example.usemybatis.dao.mapper"
                targetProject="src/main/java">
            <property name="enableSubPackages" value="true"/>
        </javaClientGenerator>

        <!--生成对应表及类名-->
        <table tableName="student" domainObjectName="Student"
                enableCountByExample="false"
                enableUpdateByExample="false"
                enableDeleteByExample="false"
                enableSelectByExample="true"
                selectByExampleQueryId="false">
            <property name="my.isgen.usekeys" value="true"/>
            <property name="useActualColumnNames" value="true"/>
            <generatedKey column="id" sqlStatement="JDBC"/>
        </table>

    </context>
</generatorConfiguration>
```

### 运行generator

两种方式运行generator：

- MavenProject中的插件：选择mybatis-generator:generate右键运行
- 创建运行配置：EditConfiguration--新建Maven配置--Name：generator--CommandLine：mybatis-generator:generate -e

## 12.4 MyBatis的XML配置方式

MyBatis官方推荐XML方式，但如果没有纯手动配置过XML的话，不建议直接从这个角度入手。可以首先通过自动生成器的方式入手，然后参考自动生成器生成的XML文件来学习。

---

# 十三、JPA

> JPA (Java Persistence API) 是 Sun 官方提出的 Java 持久化规范。它为 Java 开发人员提供了一种对象/关联映射工具来管理 Java 应用中的关系数据。值得注意的是，JPA 是在充分吸收了现有 Hibernate、TopLink、JDO 等ORM框架的基础上发展而来的。

JPA是一套规范，不是一套产品。Hibernate是完备的ORM框架，是符合JPA规范的。MyBatis没有按照JPA那套规范实现。

ORM：对象-关系表映射，在代码中的对象与数据库操作封装一层，隐藏SQL查询语句。我最早是通过Django接触到这个概念的，简直被惊艳到了，设计模型与数据库表爽到爆。

## 添加依赖

```xml
<!--spring-data-jpa 依赖包-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- mysql -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.21</version>
</dependency>
```

为了后面设计模型方便，可以添加lombok：

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```

## 创建实体模型Model

```java
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

@Entity
@Table(name = "t_user")
@Getter @Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, name = "username")
    private String userName;

    @Column(nullable = false, name = "password")
    private String passWord;
}
```

## 创建实体操作类

继承JpaRepository：

```java
public interface UserRepository extends JpaRepository<User, Integer> {
}
```

## 使用

```java
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<User> getUserList() {
        return userRepository.findAll();
    }

    @Override
    public User findUserById(Integer id) {
        return userRepository.findOne(id);
    }

    @Override
    public void save(User user) {
        userRepository.save(user);
    }

    @Override
    public void edit(User user) {
        userRepository.save(user);
    }

    @Override
    public void delete(Integer id) {
        userRepository.delete(id);
    }
}
```

---

# 十四、数据库分页查询

## Mybatis-PageHelper

使用pagehelper分页插件，参考：[Mybatis-PageHelper](https://github.com/pagehelper/Mybatis-PageHelper)

## JPA内置的分页查询功能

JPA自身提供了分页查询支持，通过Pageable接口和Page返回类型实现。

---

# 十五、数据库总结

数据库部分说的比较多，说明数据库是重头戏，实际上在生产环境中数据库份量也是很大的。目前接触了JDBC（JdbcTemplate）、MyBatis、JPA（ORM），以后还需要了解数据库缓存（memcached）、Redis、数据库连接池等。

最早接触数据库就是纯SQL语句查询，在Java里面就是用JDBC，后来发现太繁琐，JdbcTemplate就出来了。

后来发现数据库操作绝大部分都是增删改查，可以封装的更彻底，ORM就诞生了。

ORM简化了模型和数据表的设计，也隔离了SQL，但是对于复杂查询以及已经习惯了SQL的开发人员，还是需要MyBatis。MyBatis介于两者之间，既有部分封装又可以直接操作SQL。

这些不同的框架应用的出现是有其原因的，它们在不同的场景下发挥着作用，不必纠结学哪个，适合用哪个就用哪个。

---

# 十六、RESTful接口

前后端、客户端与服务端在交互的时候最好形成一个统一的接口，一般要求是接口返回**application/json**格式，在springboot里是使用注解来完成的。

- 类注解 @RestController
- 方法注解 @ResponseBody

## 请求方式

- **@RequestMapping**：支持任意请求方式，类似于自适应
- **@GetMapping**：只能GET方式请求，适用于查询数据
- **@PostMapping**：只能POST方式请求，适用于提交数据
- **@DeleteMapping**：只能DELETE方式请求，适用于删除数据
- **@PutMapping**：只能PUT方式请求，适用于修改数据（但在实际使用中，建议还是采用POST方式较为妥当）

## 接收参数

### @RequestParam

```java
public String getInfo(@RequestParam(name = "param", required = false,
    defaultValue = "param default value") String param)
```

- name代表提交参数名
- required表示该参数是否必需，默认true
- defaultValue表示如果该参数值为空，则使用默认值

### @PathVariable

```java
@RequestMapping("/get-info/{param}")
public String getInfo(@PathVariable("param") Object param)
```

可以在请求方法后面直接跟值，省去了?参数名=。

---

# 十七、单元测试

## 创建单元测试

在IDEA里，如果要对某个类创建单元测试，只需要在代码区域激活选中该类的文件，然后按下快捷键：**CTRL + SHIFT + T**，则会弹出一个菜单，选择后根据向导就可以自动创建单元测试类。

## 测试功能类

如果仅仅是测试类的某些功能，又不需要涉及到网络业务相关的，可以在单元测试类里直接使用该类并调用该类的功能函数，然后对结果进行Assert验证。

```java
import org.hamcrest.CoreMatchers;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
public class CourseServiceTest {

    @Autowired
    private CourseService courseService;

    @Test
    public void getCourse() {
        // 测试插入
        int n = courseService.save(new Course(1040L, "Spring boot Demo", "https://www.spring.com"));
        Assert.assertThat(n, CoreMatchers.equalTo(1));

        // 测试查询
        Course course = courseService.selectByKey(1001);
        Assert.assertThat(course.getAuthor(), CoreMatchers.equalTo("spring"));
    }
}
```

## 测试网络业务相关：MockMvc

如果涉及到网络请求的业务测试，搭建一套网络环境就比较麻烦。这时候就要用到**MockMvc**，可以不用启动工程就可以测试业务逻辑。

```java
package com.example;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@RunWith(SpringRunner.class)
@SpringBootTest
public class CourseControllerTest {

    @Autowired
    private WebApplicationContext webContext;
    private MockMvc mvc = null;

    @Before
    public void setupMockMvc() {
        mvc = MockMvcBuilders.webAppContextSetup(webContext).build();
    }

    @Test
    public void addCourse() throws Exception {
        String json = "{\"author\":\"HAHAHAA\",\"title\":\"Spring\",\"url\":\"http://www.spring.com\"}";
        mvc.perform(MockMvcRequestBuilders.post("/course/add")
                .accept(MediaType.APPLICATION_JSON_UTF8)
                .content(json.getBytes())
        )
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andDo(MockMvcResultHandlers.print());
    }

    @Test
    public void queryCourse() throws Exception {
        mvc.perform(MockMvcRequestBuilders.get("/course/resource/1001")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8)
        )
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andDo(MockMvcResultHandlers.print());
    }
}
```

---

# 十八、异常处理

> 注：原教程此章节内容较简略，仅列出了标题，建议后续参考官方文档或实际项目中的异常处理方案（如@ControllerAdvice、@ExceptionHandler等）进行补充。

---

# 十九、热部署

在**不必重启服务**的情况下，使得修改的功能效果生效，就需要使用热部署。

## IDEA配置

- Settings--Build,Execut,Deployment--Compiler--勾选 **Build Project automatically**
- Ctrl+Shift+A后输入：registry搜索，勾选 **compiler.automake.allow.when.app.running**

## 热部署的几种方式

- **devtools**：DevTools内置了一个LiveReload服务，可以在资源变化时用来触发浏览器刷新。
- **Spring Loaded**
- **JRebel插件**：IDEA的Java热部署插件。

---

# 二十、Tomcat部署

## 项目工程修改

### 新建ServletInitializer类

```java
package com.example.helloworld;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

public class ServletInitializer extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(HelloworldApplication.class);
    }
}
```

### tomcat依赖修改为provided

```xml
<!--测试发现这样配置既不影响本地springboot直接运行调试，也不影响发布部署-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-tomcat</artifactId>
    <scope>provided</scope>
</dependency>
```

### 修改工程导出war

```xml
<packaging>war</packaging>
```

## 导出war包

- IDEA菜单：Build->Build Artifacts->helloworld:war->Build
- Maven Projects->Plugins->war->war:war

测试发现**第一种方法靠谱一些**。

## 部署

### Windows上部署

把编译导出的war包重命名后复制到tomcat的webapps目录下，tomcat会自动解压。

### 访问

如果在tomcat中解压出的目录名不是ROOT，则访问时需要加上目录名：

```
http://localhost:8080/目录名/原URL映射地址
```

如果保持和IDEA开发时一致，可以将war包重命名为**ROOT.war**，放到tomcat的webapps目录下：

```
http://localhost:8080/
http://localhost:8080/index
```

只要war包正确，正在开启的tomcat全程可以不用重新启动。

---

# 二十一、补充汇总

本章节汇总了教程系列之外的一些补充知识点。

## 添加导入Bean配置文件

使用xml配置bean的自动装配：

```java
@ImportResource(locations = {"classpath:bean.xml"})
@SpringBootApplication
public class MainApplication {
    public static void main(String[] args) {
        SpringApplication.run(MainApplication.class, args);
    }
}
```

### 在xml配置文件中引用.properties文件

```xml
<context:property-placeholder location="classpath:application-dev.properties"
    ignore-unresolvable="true"/>
```

### 在bean配置文件中引用.yml文件

```xml
<context:annotation-config/>
<bean id="yamlProperties" class="org.springframework.beans.factory.config.YamlPropertiesFactoryBean">
    <property name="resources" value="classpath:application.yml"/>
</bean>
<context:property-placeholder properties-ref="yamlProperties"/>
```

测试发现，在IDEA中配置.yml文件的方式并不能让变量正确识别，所以还是用.properties文件的方式吧。

## Java代码使用Bean

```java
@Configuration
public class AppBeanConfig {

   @Bean(initMethod = "init", destroyMethod = "destory")
   public AnotherClass createAnotherClass() {
        AnotherClass obj = new AnotherClass();
        return obj;
    }
}
```

使用时：

```java
ApplicationContext context = new AnnotationConfigApplicationContext(AppBeanConfig.class);
AnotherClass obj = context.getBean(AnotherClass.class);
```

## 几个注解理解

- @Repository ：对应存储层Bean
- @Service    ：对应业务层Bean
- @Controller ：对应展示层Bean

## application/x-www-form-urlencoded request.getInputStream为空的问题

解决方案：添加一个配置类WebComponentConfig，使用HttpPutFormContentFilter来解决。

## SpringBoot操作数据库

可以参考配置数据源、SpringBoot整合Mybatis、JdbcTemplate、Redis等内容。

## SpringBoot使用Freemarker

```xml
<bean id="freemarkerConfig" class="org.springframework.web.servlet.view.freemarker.FreeMarkerConfigurer">
    <property name="templateLoaderPath" value="/WEB-INF/views/" />
    <property name="freemarkerSettings">
       <props>
           <!--用于解决前端报空指针问题-->
           <prop key="classic_compatible">true</prop>
            <prop key="defaultEncoding">UTF-8</prop>
            <prop key="number_format">0</prop>
       </props>
   </property>
</bean>
```

---

# 二十二、结束语

说是结束，其实是新的开始。

到这里基本上可以做到入门了，但是要提高和进阶还需要**多多阅读开源项目代码**、**线上实际项目历练**。这就要兄弟爬山，各自努力了。

## 推荐开源项目

- [云收藏 Spring Boot 2.0 开源项目](https://github.com/cloudfavorites/favorites-web)
- [springboot2.0开发的个人网站 my-site](https://github.com/WinterChenS/my-site)
- [Spring-Cloud-Admin：国内首个基于Spring Cloud微服务化开发平台](https://github.com/wxiaoqi/Spring-Cloud-Admin)
- [awesome-spring-cloud：Spring Cloud 资源大全](https://github.com/ityouknow/awesome-spring-cloud)
- [isona：基于Spring Boot与Spring Cloud构建的微服务管理工具](https://github.com/SpringForAll/isona)
- [XxPay聚合支付](http://www.xxpay.org/dev/source.html)

---

# 附录：从零重构SpringBoot项目的经验分享

> 本文写于2018-12-06，记录了作者从C++客户端开发转为接手一个老旧的SpringMVC后端项目，并将其重构为SpringBoot的完整心路历程。

## 背景

我们在2011年的时候开始搭建端游反外挂系统，整个项目在2013年完成。我本人是负责客户端开发的，对服务端的开发一窍不通。

时间一晃就过去了好多年，2018年底，因为要接入一款新型游戏进行反外挂对抗，需要对系统进行升级。客户端层面虽然能很快把差距补上来，但单靠客户端一方也不行，后端的很多功能逻辑已经失效，很多功能用不起来，新策略也无法实现。

所以在后端人员又一次变动时，我把后端这块接了过来，准备整改。

## 现状分析

### 文档混乱
从内网上下载下来的文档经过很多人手，合起来多达几十份文档，很多新的老的重复的搅合在一起。

### 分支使用不当
打了多个分支，但是从来不合并，导致线上有很多游戏，各自一套代码，差异越来越大。

### 部署困难
需要手动敲很多命令，文件传来传去，部署一个包需要花费大半天时间。

### 调试困难
有问题只能靠日志排查，运行起来需要12秒左右，调试运行跑起来需要一分半钟。

## 目标

**降本增效**，具象为：
- 一键部署
- 代码统一
- 快速迭代
- 本地调试

## 准备工作

技术条件：
- 一直从事客户端C++开发，对代码优化和重构有深刻认识
- 有过少量Android开发经验
- 后端开发框架零基础
- 痛恶于Linux环境下的命令行工作模式
- Git零使用经验，一直使用SVN

## 技术选型：Django vs SpringBoot

后端开发框架一直在Django和SpringBoot之间犹豫不决。最终采用的SpringBoot，原因：
- 老项目采用SpringMVC，迁移SpringBoot有优势，若迁移到Django只能重写
- Java少了动态语言的毛病：静态时不出错，运行时可能会出错
- Java生态好
- SpringBoot部署方便

## 重构过程

1. **项目工程迁移到IDEA**：之前老项目用eclipse，必须迁移过来
2. **分支规范**：统一在dev分支上开发，只维护一份代码
3. **文档规范**：通过markdown编写说明文档（权限申请、模块说明、部署说明、调试说明）
4. **迁移至SpringBoot**：老项目是SpringMVC，直接升级到最新SpringBoot花了不少时间
5. **优化运行时间**：重构完成后运行时间和调试时间缩减到一致的六、七秒
6. **代码重构**：把重复代码用基类封装管理
7. **热部署**：双屏开发，右边改代码，左边就能看到效果
8. **一键部署工具**：一键部署到服务器上

## 改进效果

大约花费了一个季度，后端项目已经有了很大改善。具体效果涉及业务层面属于公司机密，未公开。

## 感想

- IDEA是最好的开发工具，没有之一
- Java是个很棒的语言，开发效率比C++高很多倍。当然也确实啰嗦，好在能在很短的时间内完成
- 在IDEA中进行Java开发，爽的一塌糊涂
- 后端的开发流程上比较繁琐，需要组织协调的东西较多
- 运行起来，然后修改它，调试它，不断编写你的代码，慢慢就上路了
- 做了就会知道，很多事情可能并没有那么复杂
- 遇到问题解决问题，快速迭代，很快就能把系统迭代完善
- 对业务熟悉程度决定了系统的最终实现效果，技术只是达成的工具
- 跟着业务走，进步的更快
- **往高处想，往实处做。有想法，更要有执行力！**
