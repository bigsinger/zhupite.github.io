---
layout:		post
category:	"springboot"
title:		"springboot"
tags:		[springboot]
---
- Content
{:toc}

# 添加导入bean配置文件
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
