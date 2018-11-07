---
layout:		post
category:	"springboot"
title:		"springboot极简教程022-tomcat部署"
tags:		[]
---
- Content
{:toc}

Tomcat的安装此处忽略，可以网上搜索。

以HelloWord这个项目为例（参见GitHub：https://github.com/bigsinger/spring_study/tree/master/L1HelloWorld）说明。

# 项目工程修改
## 新建ServletInitializer类
```java
package com.example.helloworld;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

public class ServletInitializer extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(HelloworldApplication.class);
    }

//    public static void main(String[] args) throws Exception {
//        SpringApplication.run(HelloworldApplication.class, args);
//    }

}
```

## tomcat依赖修改为provided
如果是pom.xml，则修改为：
```xml
<!--测试发现这样配置既不影响本地springboot直接运行调试，也不影响发布部署-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-tomcat</artifactId>
    <scope>provided</scope>
</dependency>
```

## 修改工程导出war
如果是pom.xml，则修改为：
```xml
<packaging>war</packaging>
```

# 导出war包
- IDEA菜单：Build->Build Artifacts->helloworld:war->Build
- 选择右侧侧边栏的【Maven Projects】->Plugins->war->war:war

测试发现**第一种方法靠谱一些**，第二种方法打出的包不会立即更新代码，也即打出的包还是老的，有点坑爹。

编译成功后，会在项目目录下生成一个**target**目录，target目录下有一个war包，例如：**helloworld-0.0.1-SNAPSHOT.war**

# 部署
## Windows上部署
运行Tomcat，Tomcat会自动监控webapps目录下的文件，如果有新的war包，会自动解压。

我们把编译导出的war包（例如上面的helloworld-0.0.1-SNAPSHOT.war）重命名为helloworld.war，然后复制到tomcat的webapps目录下，此时可以观察tomcat的服务会监控到webapps目录下文件的变化，自动将新复制进来的helloworld.war解压并初始化，解压目录为war的同名目录，例如这里是：**helloworld**。

如果没有出错则会观察到tomcat控制台输出以下日志：
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v2.0.6.RELEASE)
```
当然还有其他类似URL映射的信息等，和在IDEA中直接运行起来输出的日志类似，说明服务部署成功了。

## 访问
在浏览器中访问时，需要注意的是，由于tomcat自动解压缩出了一个目录，例如上面的helloworld.war解压目录为**helloworld**，那么在浏览器中要这样访问：
```xml
http://localhost:8080/目录名/原URL映射地址
```
上面的**helloworld**示例的访问链接是：
```xml
http://localhost:8080/helloworld/
http://localhost:8080/helloworld/index
```

我们在IDEA中开发时，使用的是如下地址：
```xml
http://localhost:8080/
http://localhost:8080/index
```
现在多了一个目录，如何保持一致呢？

可以**利用tomcat的默认目录ROOT来配置**，例如我们可以把helloworld-0.0.1-SNAPSHOT.war重命名为**ROOT.war**，然后复制到**tomcat\webapps**目录下，tomcat会自动解压出ROOT目录，如果没有出错的话就可以直接在浏览器中访问如下地址了：
```xml
http://localhost:8080/
http://localhost:8080/index
```

只要war包正确，正在开启的tomcat其实全程可以不用重新启动的，还是很方便的。

