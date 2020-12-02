---
layout:		post
category:	"springboot"
title:		"springboot极简教程013-数据库之JdbcTemplate"
tags:		[]
---
- Content
{:toc}

在通过[springboot极简教程010\-数据库准备](https://www.zhupite.com/springboot/springboot%E6%9E%81%E7%AE%80%E6%95%99%E7%A8%8B010-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%87%86%E5%A4%87.html)初步了解了数据库之后，可以开始通过springboot来操作数据库了。后面会逐个接触JdbcTemplate、MyBatis、JPA，先从JdbcTemplate开始看起。

# JdbcTemplate
> Spring Framework对数据库的操作在JDBC上面做了深层次的封装，通过依赖注入功能，可以将DataSource注册到JdbcTemplate之中，使我们可以轻易的完成对象关系映射，并有助于规避常见的错误，在SpringBoot中我们可以很轻松的使用它。

JdbcTemplate API文档：[JdbcTemplate \(Spring Framework 5\.1\.2\.RELEASE API\)](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/jdbc/core/JdbcTemplate.html)

参考：[Spring Boot干货系列：（八）数据存储篇\-SQL关系型数据库之JdbcTemplate的使用](http://tengj.top/2017/04/13/springboot8/)

**特点**
- 速度快，对比其它的ORM框架而言，JDBC的方式无异于是最快的
- 配置简单，Spring自家出品，几乎没有额外配置
- 学习成本低，毕竟JDBC是基础知识，JdbcTemplate更像是一个DBUtils

# 添加依赖
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

# 配置数据源
在application.properties中添加如下配置。值得注意的是，SpringBoot默认会自动配置DataSource，它将优先采用HikariCP连接池，如果没有该依赖的情况则选取tomcat-jdbc，如果前两者都不可用最后选取Commons DBCP2。通过spring.datasource.type属性可以指定其它种类的连接池。
```xml
spring.datasource.url = jdbc:mysql://localhost:3306/course?useUnicode=true&characterEncoding=utf-8
spring.datasource.username = root
spring.datasource.password = root
spring.datasource.driver-class-name = com.mysql.jdbc.Driver
```

# 准备数据库表
```sql
CREATE TABLE `t_user` (
  `id` int(8) NOT NULL AUTO_INCREMENT COMMENT '主键自增',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(50) NOT NULL COMMENT '密码',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户表';
```
# 编写实体类
```java
public class User {

    private Long id;
    private String username;
    private String password;

    // TODO  省略get set
}
```

# jdbcTemplate实现接口
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/users")
public class SpringJdbcController {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public SpringJdbcController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<User> queryUsers() {
        // 查询所有用户
        String sql = "select * from t_user";
        return jdbcTemplate.query(sql, new Object[]{}, new BeanPropertyRowMapper<>(User.class));
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        // 根据主键ID查询
        String sql = "select * from t_user where id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{id}, new BeanPropertyRowMapper<>(User.class));
    }

    @DeleteMapping("/{id}")
    public int delUser(@PathVariable Long id) {
        // 根据主键ID删除用户信息
        String sql = "DELETE FROM t_user WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    @PostMapping
    public int addUser(@RequestBody User user) {
        // 添加用户
        String sql = "insert into t_user(username, password) values(?, ?)";
        return jdbcTemplate.update(sql, user.getUsername(), user.getPassword());
    }


    @PutMapping("/{id}")
    public int editUser(@PathVariable Long id, @RequestBody User user) {
        // 根据主键ID修改用户信息
        String sql = "UPDATE t_user SET username = ? ,password = ? WHERE id = ?";
        return jdbcTemplate.update(sql, user.getUsername(), user.getPassword(), id);
    }
}
```