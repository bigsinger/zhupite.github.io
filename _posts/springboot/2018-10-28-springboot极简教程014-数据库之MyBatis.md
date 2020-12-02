---
layout:		post
category:	"springboot"
title:		"springboot极简教程014-数据库之MyBatis"
tags:		[]
---
- Content
{:toc}

# MyBatis介绍
- Mybatis是sql-mapping框架而不是orm框架，Mybatis是OXM设计不是对象关系映射。

# 添加依赖
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

# MyBatis使用方式
- 注解方式
- XML方式

个人强烈推荐注解方式，干净清爽，直接在Java代码里做好不用在Java和XML中来回跳转。复杂度降低很多，Java注解满天飞不是没有道理的，注解要比XML方式好用。

XML方式不太推荐，但是后面还会有所介绍。

在使用MyBatis时，对实体的操作类在命名上我们可以习惯性地加上**Mapper后缀**，例如实体类为**User**，那么对应的实体操作类可以命名为：**UserMapper**，这一方式是借鉴了MyBatis自动生成器创建的mapper，我们在《[springboot极简教程007\-工程建议](https://www.zhupite.com/springboot/springboot%E6%9E%81%E7%AE%80%E6%95%99%E7%A8%8B007-%E5%B7%A5%E7%A8%8B%E5%BB%BA%E8%AE%AE.html#%E5%AE%9E%E4%BD%93%E6%93%8D%E4%BD%9C%E7%B1%BB)》中也有提及，至于MyBatis自动生成器后面会说。