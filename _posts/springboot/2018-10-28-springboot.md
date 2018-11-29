---
layout:		post
category:	"springboot"
title:		"springboot"
tags:		[springboot]
---
- Content
{:toc}

# 添加导入bean配置文件

使用xml配置bean的自动装配，可以参考：[二、Spring属性注入](https://blog.csdn.net/A15815635741/article/details/84196692)

在Application里添加注解：
```java
@ImportResource(locations = {"classpath:bean.xml"})
@SpringBootApplication
public class MainApplication {
    public static void main(String[] args) {
        SpringApplication.run(MainApplication.class, args);
    }
}
```

## 在bean配置文件中引用.properties文件
```xml
<!-- 加载数据资源属性文件 -->
<context:property-placeholder location="classpath:application-dev.properties" ignore-unresolvable="true"/>
```

## 在bean配置文件中引用.yml文件
```xml
<context:annotation-config/>
<bean id="yamlProperties" class="org.springframework.beans.factory.config.YamlPropertiesFactoryBean">
    <property name="resources" value="classpath:application.yml"/>
</bean>
<context:property-placeholder properties-ref="yamlProperties"/>
```
测试发现，在IDEA中配置.yml文件的方式并不能让变量正确识别，所以还是用.properties文件的方式吧。

# Java代码使用bean

参考：[使用@Configuration注解来代替Spring的bean配置](https://www.cnblogs.com/hujingwei/p/5360944.html)

添加一个配置类：

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


# 几个注解理解
- @Repository   ：对应存储层Bean
- @Service   ：对应业务层Bean
- @Controller   ：对应展示层Bean

# application/x-www-form-urlencoded request.getInputStream为空的问题
参考：[SpringMVC 中 request\.getInputStream\(\) 为空解惑](https://emacsist.github.io/2017/12/04/springmvc-%E4%B8%AD-request.getinputstream-%E4%B8%BA%E7%A9%BA%E8%A7%A3%E6%83%91/)

解决方案：添加一个配置类WebComponentConfig：
```java
package com.example.test;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.HiddenHttpMethodFilter;
import org.springframework.web.filter.HttpPutFormContentFilter;

@Configuration
public class WebComponentConfig {
    @Bean
    public HttpPutFormContentFilter httpPutFormContentFilter() {
        return new HttpPutFormContentFilter();
    }
    @Bean
    public FilterRegistrationBean disableSpringBootHttpPutFormContentFilter(HttpPutFormContentFilter filter) {
        FilterRegistrationBean filterRegistrationBean = new FilterRegistrationBean();
        filterRegistrationBean.setFilter(filter);
        filterRegistrationBean.setEnabled(false);
        return filterRegistrationBean;
    }
    @Bean
    public HiddenHttpMethodFilter hiddenHttpMethodFilter() {
        return new HiddenHttpMethodFilter();
    }
    @Bean
    public FilterRegistrationBean disableSpringBootHiddenHttpMethodFilter(HiddenHttpMethodFilter filter) {
        FilterRegistrationBean filterRegistrationBean = new FilterRegistrationBean();
        filterRegistrationBean.setFilter(filter);
        filterRegistrationBean.setEnabled(false);
        return filterRegistrationBean;
    }
}
```
