---
layout:		post
category:	"springboot"
title:		"springboot极简教程015-数据库之MyBatis注解方式"
tags:		[]
---
- Content
{:toc}



# 添加依赖
这个可以参考上节：《springboot极简教程014-数据库之MyBatis》，再贴一下吧：
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

# 示例
下面是一个实体操作类：
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

使用：
```java
@Autowired
private PersonMapper personMapper;

@Test
public void testAdd(){
    Person person = new Person(13, "RRR", "会计", 22);
    personMapper.add(person);
}

@Test
public void testDelete(){
    personMapper.delete(12);
}

@Test
public void testUpdate(){
    personMapper.update(13, "TTT");
}

@Test
public void testQuery(){
    Person person = personMapper.queryByName("TTT");
    System.out.println(person);
}

@Test
public void testQueryAll(){
    List<Person> persons = personMapper.queryAll();
    persons.stream().forEach((p) -> System.out.println(p));
}
```

就这么简单？对！就这么简单！

但是在实际项目中，对于实体操作类的常用函数接口，会考虑封装到一个Mapper基类里去，这样就提高了复用性。具体做法就是封装一个通用Mapper，例如：**CommonMapper**：
```java
package com.example.dao;

import tk.mybatis.mapper.common.Mapper;
import tk.mybatis.mapper.common.MySqlMapper;

import java.util.List;
import java.util.Map;

// 注意: 该接口不能被扫描到，否则会出错
public interface CommonMapper<T> extends Mapper<T>, MySqlMapper<T> {
    List<T> queryList(Map<String, Object> map);
}
```
其他的实体操作类就可以继承CommonMapper：
```java
package com.example.dao.mapper;

import com.example.dao.CommonMapper;
import com.example.dao.model.Course;
import com.example.util.StringUtil;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Component注解不添加也没没关系，不加的话service在引入LearnMapper会有错误提示，但不影响
 * SpringBoot使用Mybatis注解进行一对多和多对多查询 https://blog.csdn.net/KingBoyWorld/article/details/78966789
 */
@Component
@Mapper
public interface CourseMapper extends CommonMapper<Course> {
    String getAuthorName(Long id);

    @Insert("insert into course(author, title,url) values(#{author},#{title},#{url})")
    int insert(Course course);

    @Update("update course set author=#{author},title=#{title},url=#{url} where id = #{id}")
    int update(Course course);

    @DeleteProvider(type = CourseSqlBuilder.class, method = "deleteByids")
    int deleteByIds(@Param("ids") String[] ids);


    @Select("select * from course where id = #{id}")
    @Results(id = "learnMap", value = {
            @Result(column = "id", property = "id", javaType = Long.class),
            @Result(property = "author", column = "author", javaType = Long.class),
            @Result(property = "title", column = "title", javaType = String.class),
            @Result(property = "user", column = "author",
                    one = @One(select = "com.example.dao.mapper.UserMapper.findUserById"))
    })
    Course selectByKey(@Param("id") Long id);

    @SelectProvider(type = CourseSqlBuilder.class, method = "queryCourseByParams")
    @Results({
            @Result(column = "id", property = "id", javaType = Long.class),
            @Result(property = "author_id", column = "author", javaType = Long.class),
            @Result(property = "title", column = "title", javaType = String.class),
            @Result(property = "author", column = "author",
                    one = @One(select = "com.example.dao.mapper.UserMapper.findUserNickyById"))
    })
    List<Course> queryList(Map<String, Object> params);

    class CourseSqlBuilder {
        public String queryCourseByParams(final Map<String, Object> params) {
            StringBuffer sql = new StringBuffer();
            sql.append("select * from course where 1=1");
            if (!StringUtil.isNull((String) params.get("author"))) {
                sql.append(" and author like '%").append((String) params.get("author")).append("%'");
            }
            if (!StringUtil.isNull((String) params.get("title"))) {
                sql.append(" and title like '%").append((String) params.get("title")).append("%'");
            }
            System.out.println("查询sql==" + sql.toString());
            return sql.toString();
        }

        //删除的方法
        public String deleteByids(@Param("ids") final String[] ids) {
            StringBuffer sql = new StringBuffer();
            sql.append("DELETE FROM course WHERE id in(");
            for (int i = 0; i < ids.length; i++) {
                if (i == ids.length - 1) {
                    sql.append(ids[i]);
                } else {
                    sql.append(ids[i]).append(",");
                }
            }
            sql.append(")");
            return sql.toString();
        }
    }
}
```

# 注意
接口不能被扫描到的话可以在Application中添加注解**@MapperScan**：
```java
@MapperScan(basePackages = "com.example.dao", markerInterface = CommonMapper.class)
```
不要使用**org.mybatis.spring.annotation.MapperScan**，而是：
```java
import tk.mybatis.spring.annotation.MapperScan;
```