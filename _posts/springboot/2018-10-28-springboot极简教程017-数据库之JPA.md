---
layout:		post
category:	"springboot"
title:		"springboot极简教程017-数据库之JPA"
tags:		[]
---
- Content
{:toc}

# 介绍
> JPA (Java Persistence API) 是 Sun 官方提出的 Java 持久化规范。它为 Java 开发人员提供了一种对象/关联映射工具来管理 Java 应用中的关系数据。他的出现主要是为了简化现有的持久化开发工作和整合 ORM 技术，结束现在 Hibernate，TopLink，JDO 等 ORM 框架各自为营的局面。值得注意的是，JPA 是在充分吸收了现有 Hibernate，TopLink，JDO 等ORM框架的基础上发展而来的，具有易于使用，伸缩性强等优点。从目前的开发社区的反应上看，JPA 受到了极大的支持和赞扬

JPA（Java Persistence API）是一套规范，不是一套产品，那么像Hibernate，TopLink，JDO他们是一套产品，如果说这些产品实现了这个JPA规范，那么我们就可以叫他们为JPA的实现产品。

Hibernate是完备的ORM框架，是符合JPA规范的，MyBatis没有按照JPA那套规范实现。目前Spring以及SpringBoot官方都没有针对MyBatis有具体的支持，但对Hibernate的集成一直是有的。但这并不是说mybatis和spring无法集成，MyBatis官方社区自身也是有对Spring，Springboot集成做支持的，所以在技术上，两者都不存在问题。

ORM：对象-关系表映射，在代码中的对象与数据库操作封装一层，隐藏SQL查询语句。我最早是通过Django接触到这个概念的，简直被惊艳到了，设计模型与数据库表爽到爆。这里看看springboot中的ORM怎么用。



# 添加依赖
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

为了后面设计模型方便，可以添加**lombok**：
```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```

# 创建实体模型Model
```java
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "role")
@Setter
@Getter
public class Role implements Serializable {
    public Role() {
    }

    public Role(String name) {
        this.name = name;
    }

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;
    private String name;
}
```
- @Setter和@Getter就是使用了lombok的注解功能，可以使得代码写得简单些。
- @Entity注解指定当前类为一个模型，后面我们可以对比下Django的模型设计
- @Table注解指定当前模型创建的数据表名

# 创建实体操作类Repository
```xml
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Role findById(String id);
}
```

# 创建Service接口
```java
import com.example.demo_jpa.model.Role;

import java.util.List;

public interface RoleService {
    Role save(Role role);

    List<Role> findAll();
}
```

# Service实现
```java
import com.example.demo_jpa.model.Role;
import com.example.demo_jpa.model.RoleRepository;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

@Service
public class RoleServiceImpl implements RoleService {

    @Resource
    private RoleRepository roleRepository;

    @Override
    public Role save(Role role) {
        return roleRepository.save(role);
    }

    @Override
    public List<Role> findAll() {
        return roleRepository.findAll();
    }
}
```

# 运行
运行Application后数据表会自动生成。

# 对比Django
举一个Django中的模型设计例子：
```python
class Device(models.Model):
    '''
    设备
    '''
    
    vm_choice = (
        (-1, '未知'),
        (0, '否'),
        (1, '是'),
    )

    mac = models.CharField(max_length=32, verbose_name='MAC地址', null=True)
    disk = models.CharField(max_length=128, verbose_name='硬盘ID', null=True)
    ip = models.CharField(max_length=32, verbose_name='IP地址', blank=True)
    vm = models.IntegerField(choices=vm_choice, default=-1, verbose_name='是否虚拟环境')

    def __str__(self):
        return self.mac

    class Meta:
        db_table = 'device'
        verbose_name = '机器设备'
        verbose_name_plural = verbose_name
        unique_together = ('mac', 'disk')
```
- 继承自models.Model就是一个模型
- 成员变量就表的一个个列
- db_table指定当前模型创建的数据表名
- verbose_name指定在管理后台显示的名称
- verbose_name_plural指定在管理后台显示的名称（复数）

对比下发现其实都差不多。