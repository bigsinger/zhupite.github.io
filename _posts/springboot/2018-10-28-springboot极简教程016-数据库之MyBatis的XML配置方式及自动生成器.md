---
layout:		post
category:	"springboot"
title:		"springboot极简教程016-数据库之MyBatis的XML配置方式及自动生成器"
tags:		[]
---
- Content
{:toc}

MyBatis的XML配置方式没有纯手动配置过，XML完全写不好，特别是在刚入门的时候，因此不建议直接从这个角度入手，及时要考虑学习，可以先通过自动生成器的方式入手，然后结合自动生成器生成的XML文件来学习。

然而，MyBatis官方推荐XML方式，所以还是说一说。

# MyBatis自动生成器介绍
MyBatis操作数据库的方式介于JDBC与ORM之间，如果完全纯写SQL语句进行查询显得啰嗦枯燥，如果纯用ORM的话完全隔离了SQL语句又显得不习惯，MyBatis就介于这之间，使得仍然可以操作SQL语句又不至于那么麻烦。

一个可以拿出来说说的功能就是**自动生成器**：generator，可以根据已经存在的数据库表来**反向生成代码**，下面看看怎么使用。

项目代码可以参考：[L10MyBatisGenerator](https://github.com/bigsinger/spring_study/tree/master/L10MyBatisGenerator)

# 创建数据库表
使用MyBatis的自动生成器功能来反向生成代码，就首先需要有数据库表，所以第一步是先创建一个数据库表。
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
 
 
insert into student(student_id, name, age, sex, birthday) value(2018001, "Alice", 28, "女", "1990-10-18");
insert into student(student_id, name, age, sex, birthday) value(2018002, "Bob", 27, "男", "1991-10-18");
insert into student(student_id, name, age, sex, birthday) value(2018003, "David", 26, "男", "1992-10-18");
insert into student(student_id, name, age, sex, birthday) value(2018004, "Jim", 38, "男", "1980-10-18");
insert into student(student_id, name, age, sex, birthday) value(2018005, "Mark", 18, "男", "2000-10-18");
```

# 添加依赖
```xml
<!--MyBatis-->
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>1.3.2</version>
</dependency>

<!--MyBatis generator-->
<dependency>
    <groupId>org.mybatis.generator</groupId>
    <artifactId>mybatis-generator-core</artifactId>
    <version>1.3.6</version>
</dependency>

<!-- mysql -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.21</version>
</dependency>
```
# 添加插件
```xml
<!-- 自动生成代码插件 -->
<plugin>
    <groupId>org.mybatis.generator</groupId>
    <artifactId>mybatis-generator-maven-plugin</artifactId>
    <version>1.3.6</version>
    <configuration>
        <verbose>true</verbose>
        <overwrite>true</overwrite>
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

```xml
<!--使用MapperPlugin需要的依赖-->
<dependency>
    <groupId>tk.mybatis</groupId>
    <artifactId>mapper</artifactId>
    <version>3.4.0</version>
</dependency>
```

# generatorConfig.xml
**generatorConfig.xml**是**MyBatis-generator**默认使用的配置文件，也可以在pom中修改，因为觉得没有必要，就用默认好了，需要在resources目录下创建generatorConfig.xml文件。
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE generatorConfiguration
        PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
        "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">
<generatorConfiguration>

    <!--导入属性配置 -->
    <properties resource="application.yml"/>

    <context id="DB2Tables" targetRuntime="MyBatis3">

        <!--是否在代码中显示注释-->
        <commentGenerator>
            <property name="suppressDate" value="true"/>
            <property name="suppressAllComments" value="true"/>
        </commentGenerator>

        <!--jdbc的数据库连接 -->
        <!--<jdbcConnection-->
        <!--connectionURL="${spring.datasource.url}"-->
        <!--userId="${spring.datasource.username}"-->
        <!--password="${spring.datasource.password}"-->
        <!--driverClass="com.mysql.jdbc.Driver"-->
        <!--/>-->
        <jdbcConnection
                connectionURL="jdbc:mysql://127.0.0.1:3306/student?characterEncoding=UTF-8"
                userId="root"
                password="root"
                driverClass="com.mysql.jdbc.Driver"
        />

        <!--生成pojo类存放位置-->
        <javaModelGenerator targetPackage="com.example.usemybatis.dao.model" targetProject="src/main/java">
            <!-- 是否允许子包，即targetPackage.schemaName.tableName -->
            <property name="enableSubPackages" value="true"/>

            <!-- 是否对类CHAR类型的列的数据进行trim操作 -->
            <property name="trimStrings" value="true"/>

            <!-- 是否对model添加 构造函数 -->
            <property name="constructorBased" value="true"/>
        </javaModelGenerator>

        <!--Mapper映射文件生成所在的目录 为每一个数据库的表生成对应的SqlMap文件 -->
        <sqlMapGenerator targetPackage="mapper" targetProject="src/main/resources">
            <property name="enableSubPackages" value="true"/>
        </sqlMapGenerator>

        <!--生成mapper类存放位置-->
        <javaClientGenerator type="XMLMAPPER" targetPackage="com.example.usemybatis.dao.mapper"
                             targetProject="src/main/java">
            <property name="enableSubPackages" value="true"/>
        </javaClientGenerator>

        <!--生成对应表及类名-->
        <table tableName="student" domainObjectName="Student" enableCountByExample="false"
               enableUpdateByExample="false" enableDeleteByExample="false" enableSelectByExample="true"
               selectByExampleQueryId="false">
            <!--使用自增长键-->
            <property name="my.isgen.usekeys" value="true"/>
            <!--使用数据库中实际的字段名作为生成的实体类的属性-->
            <property name="useActualColumnNames" value="true"/>
            <generatedKey column="id" sqlStatement="JDBC"/>
        </table>

    </context>
</generatorConfiguration>
```
配置文件指定：
- javaModelGenerator中指定自动生成model到包com.example.usemybatis.dao.model下
- javaClientGenerator指定自动生成的实体操作类到包com.example.usemybatis.dao.mapper下
- sqlMapGenerator指定mapper（实体操作类）的xml映射文件生成到src/main/resources目录下的mapper下

# 运行generator

两种方式运行generator
- MavenProject中的插件：选择mybatis-generator:generate右键运行
- 创建运行配置：EditConfiguration--新建Maven配置--Name：generator--CommandLine：mybatis-generator:generate -e

运行后会，会按照generatorConfig.xml配置自动生成model和mapper及XML映射文件。

我们看看在com.example.usemybatis.dao.model下生成的实体类**Student**：
```java
package com.example.usemybatis.dao.model;

import java.util.Date;

public class Student {
    private Integer id;

    private Integer student_id;

    private String name;

    private Integer age;

    private String sex;

    private Date birthday;

    public Student(Integer id, Integer student_id, String name, Integer age, String sex, Date birthday) {
        this.id = id;
        this.student_id = student_id;
        this.name = name;
        this.age = age;
        this.sex = sex;
        this.birthday = birthday;
    }

    public Student() {
        super();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getStudent_id() {
        return student_id;
    }

    public void setStudent_id(Integer student_id) {
        this.student_id = student_id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name == null ? null : name.trim();
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getSex() {
        return sex;
    }

    public void setSex(String sex) {
        this.sex = sex == null ? null : sex.trim();
    }

    public Date getBirthday() {
        return birthday;
    }

    public void setBirthday(Date birthday) {
        this.birthday = birthday;
    }
}
```

再看看在com.example.usemybatis.dao.mapper下生成的实体操作类**StudentMapper**：
```java
package com.example.usemybatis.dao.mapper;

import com.example.usemybatis.dao.model.Student;
import com.example.usemybatis.dao.model.StudentExample;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface StudentMapper {
    int deleteByPrimaryKey(Integer id);

    int insert(Student record);

    int insertSelective(Student record);

    List<Student> selectByExample(StudentExample example);

    Student selectByPrimaryKey(Integer id);

    int updateByPrimaryKeySelective(Student record);

    int updateByPrimaryKey(Student record);

    @Select("SELECT * FROM student")
    List<Student> findAll();
}
```
可以看到实体操作类会有一个**@Mapper**注解，实体操作类的接口函数对数据库的操作体现在XML映射文件里，如果IDEA安装了**Free MyBatis-plugin**插件，会在每个接口上有一个**绿色箭头**，点一下这些绿色箭头便能自动跳转到对应的XML文件中的配置了。

最后看看在src/main/resources/mapper下生成的XML映射文件**StudentMapper.xml**：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.usemybatis.dao.mapper.StudentMapper">
    <resultMap id="BaseResultMap" type="com.example.usemybatis.dao.model.Student">
        <constructor>
            <idArg column="id" javaType="java.lang.Integer" jdbcType="INTEGER"/>
            <arg column="student_id" javaType="java.lang.Integer" jdbcType="INTEGER"/>
            <arg column="name" javaType="java.lang.String" jdbcType="VARCHAR"/>
            <arg column="age" javaType="java.lang.Integer" jdbcType="INTEGER"/>
            <arg column="sex" javaType="java.lang.String" jdbcType="VARCHAR"/>
            <arg column="birthday" javaType="java.util.Date" jdbcType="DATE"/>
        </constructor>
    </resultMap>
    <sql id="Example_Where_Clause">
        <where>
            <foreach collection="oredCriteria" item="criteria" separator="or">
                <if test="criteria.valid">
                    <trim prefix="(" prefixOverrides="and" suffix=")">
                        <foreach collection="criteria.criteria" item="criterion">
                            <choose>
                                <when test="criterion.noValue">
                                    and ${criterion.condition}
                                </when>
                                <when test="criterion.singleValue">
                                    and ${criterion.condition} #{criterion.value}
                                </when>
                                <when test="criterion.betweenValue">
                                    and ${criterion.condition} #{criterion.value} and #{criterion.secondValue}
                                </when>
                                <when test="criterion.listValue">
                                    and ${criterion.condition}
                                    <foreach close=")" collection="criterion.value" item="listItem" open="("
                                             separator=",">
                                        #{listItem}
                                    </foreach>
                                </when>
                            </choose>
                        </foreach>
                    </trim>
                </if>
            </foreach>
        </where>
    </sql>
    <sql id="Base_Column_List">
    id, student_id, name, age, sex, birthday
  </sql>
    <select id="selectByExample" parameterType="com.example.usemybatis.dao.model.StudentExample"
            resultMap="BaseResultMap">
        select
        <if test="distinct">
            distinct
        </if>
        'false' as QUERYID,
        <include refid="Base_Column_List"/>
        from student
        <if test="_parameter != null">
            <include refid="Example_Where_Clause"/>
        </if>
        <if test="orderByClause != null">
            order by ${orderByClause}
        </if>
    </select>
    <select id="selectByPrimaryKey" parameterType="java.lang.Integer" resultMap="BaseResultMap">
        select
        <include refid="Base_Column_List"/>
        from student
        where id = #{id,jdbcType=INTEGER}
    </select>
    <delete id="deleteByPrimaryKey" parameterType="java.lang.Integer">
    delete from student
    where id = #{id,jdbcType=INTEGER}
  </delete>
    <insert id="insert" keyColumn="id" keyProperty="id" parameterType="com.example.usemybatis.dao.model.Student"
            useGeneratedKeys="true">
    insert into student (student_id, name, age, 
      sex, birthday)
    values (#{student_id,jdbcType=INTEGER}, #{name,jdbcType=VARCHAR}, #{age,jdbcType=INTEGER}, 
      #{sex,jdbcType=VARCHAR}, #{birthday,jdbcType=DATE})
  </insert>
    <insert id="insertSelective" keyColumn="id" keyProperty="id"
            parameterType="com.example.usemybatis.dao.model.Student" useGeneratedKeys="true">
        insert into student
        <trim prefix="(" suffix=")" suffixOverrides=",">
            <if test="student_id != null">
                student_id,
            </if>
            <if test="name != null">
                name,
            </if>
            <if test="age != null">
                age,
            </if>
            <if test="sex != null">
                sex,
            </if>
            <if test="birthday != null">
                birthday,
            </if>
        </trim>
        <trim prefix="values (" suffix=")" suffixOverrides=",">
            <if test="student_id != null">
                #{student_id,jdbcType=INTEGER},
            </if>
            <if test="name != null">
                #{name,jdbcType=VARCHAR},
            </if>
            <if test="age != null">
                #{age,jdbcType=INTEGER},
            </if>
            <if test="sex != null">
                #{sex,jdbcType=VARCHAR},
            </if>
            <if test="birthday != null">
                #{birthday,jdbcType=DATE},
            </if>
        </trim>
    </insert>
    <update id="updateByPrimaryKeySelective" parameterType="com.example.usemybatis.dao.model.Student">
        update student
        <set>
            <if test="student_id != null">
                student_id = #{student_id,jdbcType=INTEGER},
            </if>
            <if test="name != null">
                name = #{name,jdbcType=VARCHAR},
            </if>
            <if test="age != null">
                age = #{age,jdbcType=INTEGER},
            </if>
            <if test="sex != null">
                sex = #{sex,jdbcType=VARCHAR},
            </if>
            <if test="birthday != null">
                birthday = #{birthday,jdbcType=DATE},
            </if>
        </set>
        where id = #{id,jdbcType=INTEGER}
    </update>
    <update id="updateByPrimaryKey" parameterType="com.example.usemybatis.dao.model.Student">
    update student
    set student_id = #{student_id,jdbcType=INTEGER},
      name = #{name,jdbcType=VARCHAR},
      age = #{age,jdbcType=INTEGER},
      sex = #{sex,jdbcType=VARCHAR},
      birthday = #{birthday,jdbcType=DATE}
    where id = #{id,jdbcType=INTEGER}
  </update>
</mapper>
```
如果IDEA安装了**Free MyBatis-plugin**插件，也会有显示绿色箭头，点击绿色箭头可以跳转到对应的实体操作类的接口函数。

可以看到，XML配置方式其实是比较复杂的，如果自动生成的实体操作类和XML文件不足以满足要求，还可以手动添加代码或XML内容。

# Free MyBatis-plugin插件
我前面说了，比较推荐注解方式而不是这种XML配置方式，一个很蹩脚之处就是需要在Java代码与XML配置文件之间来回跳转，感觉开发体验并不是很好。当然为了解决这个问题，IDEA有个插件：Free MyBatis-plugin，可以直接从Mapper文件与XML文件互相跳转。其实要我说问题并没有解决，只不过是更加方便地在Java代码与XML文件之间跳转罢了，这个设计思路有点类似于AndroidStudio在开发Android应用程序时，在Activity于layout.xml之间的关联跳转。

Free MyBatis-plugin插件安装后需要重启IDEA才能生效。