---
layout:		post
category:	"program"
title:		"C# blazor Web开发之数据库汇总"

tags:		[c#,blazor,net]
---
- Content
{:toc}
# 配置数据库

## 1、数据库软件安装

- [MariaDB](https://mariadb.org/)，账号密码弄个测试的简单一点的：root/123
- 安装：[ODBC Connector - MariaDB Knowledge Base](https://mariadb.com/kb/en/mariadb-connector-odbc/)
- [Navicat](https://www.navicat.com/en/download/navicat-for-mysql)：可视化操作数据库，不用敲`SQL`命令，方面快捷；



## 2、VisualStudio连接MySQL

`VisualStudio`默认使用的数据库是`SQL Server`，先改为链接`MySQL`的数据库，这里使用开源的`MariaDB`。`VisualStudio`链接`MariaDB`数据库需要通过ODBC方式，因此需要安装[ODBC Connector - MariaDB Knowledge Base](https://mariadb.com/kb/en/mariadb-connector-odbc/)，然后进行ODBC数据源配置：

- 打开 `ODBC数据源管理程序`（Win + R 输入命令：`odbcad32` ）；
- 添加，选择：`MariaDB ODBC 3.0 Driver`，Name填：MariaDB，下一步；
- 选择：TCP/IP，ServerName填：127.0.0.1，User name和Password分别填：root 123
- Test DSN，提示成功说明配置正确，后面一路下一步即可。
- VisualStudio里打开菜单`工具` - `连接到数据库`，选择：`Microsoft ODBC 数据源`，刚刚的`MariaDB`名称，就能在`服务器资源管理器`里看到数据库链接了。

参考：

- [MariaDB + Visual Studio 2017 环境下的 ODBC 入门开发](https://www.cnblogs.com/joxon/p/mariadb-vs2017-odbc.html)
- 参考：[How to Use MySQL Database With .Net Core And Entity Framework?](https://www.geekinsta.com/mysql-with-net-core-and-entity-framework/)



## 3、创建数据库和表

打开`MariaDB`控制台，创建数据库：`CREATE DATABASE appdb;`

如果有`sql`数据可以执行`source apps.sql;`如果没有数据可以参考`Entity Framework`章节从零创建。



## 4、配置数据库源

项目中在`appsettings.json`文件里添加数据源：

```json
"ConnectionStrings": {
    "DefaultConnection": "server=localhost;port=3306;database=数据库名;user=用户名;password=密码"
}
```

在`Program.cs`中添加调用：

```c#
var connectionString = Configuration.GetConnectionString("DefaultConnection");
services.AddDbContext<OrgDbContext>(opt => opt.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
```



# Entity Framework

安装 `Entity Framework Core` 工具：

```bash
Install-Package Microsoft.EntityFrameworkCore.Tools
```

更新 `Entity Framework Core` 工具：

```bash
dotnet tool update --global dotnet-ef
dotnet tool update dotnet-ef --global
```

项目需要安装如下三方库：

```bash
Microsoft.EntityFrameworkCore
Microsoft.EntityFrameworkCore.design
Microsoft.EntityFrameworkCore.Tools
Pomelo.EntityFrameworkCore.MySql		# Microsoft.EntityFrameworkCore.SqlServer
```

添加`Model`，具体可以参考【模型设计】一节。

避免递归嵌套：

```c#
//实现接口的服务器项目在Program.cs中添加：
//builder.Services.AddControllers();
builder.Services.AddControllers().AddJsonOptions(options => {
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
});

// 在前端项目对应的http查询服务中
public class EmployeeHttpService : IEmployeeHttpService {
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonSerializerOptions;
    
    public EmployeeHttpService(HttpClient client) {
        _client = client;
        _jsonSerializerOptions = new JsonSerializerOptions {
            PropertyNameCaseInsensitive = true,
            ReferenceHandler = ReferenceHandler.Preserve,
        };
    }
    
    public async Task<ServiceResponse<PagedList<Employee>>> GetAll(EmployeeParameters param) {
        HttpResponseMessage response = await _client.PostAsJsonAsync($"api/employee", param);

        // 确保响应成功
        response.EnsureSuccessStatusCode();

        // 反序列化响应内容为对象
        var content = await response.Content.ReadFromJsonAsync<ServiceResponse<PagedList<Employee>>>(_jsonSerializerOptions);
        return content;
    }
}
```

添加`DbContext`派生类，然后初始化一些种子数据，最后执行以下命令：

```bash
dotnet ef migrations add InitName
dotnet ef database update
```

`dotnet ef`命令汇总：

```c#
// 在PM控制台中使用。注意：使用前一定先 cd 到项目目录（或者直接切换默认项目），选择有 DbContext 实体类的项目。且把配置有数据库源的项目设置为启动项目！！！

dotnet ef database update  		//更新数据库
dotnet ef migrations add Name  	//创建新的迁移文件
dotnet ef migrations remove 	//删除迁移文件
dotnet ef database update drop 	//删除数据库
```

也有对应的另外的版本：

```bash
Add-Migration Initial   -verbose 	# -verbose 根据实际需要添加
Update-Database	<MigrationName>		# 数据库更新到指定的迁移，不带参数则更新最后一个
Remove-Migration

Get-Migrations						# 列出所有迁移
Add-Migration <合并后的迁移名称> -Context <DbContext名称>		# 迁移合并命令（合并多个迁移记录为一个）
Update-Database 0					# 将数据库回滚到初始状态
```



## 关于数据迁移

数据迁移记录在数据库中的`__EFMigrationsHistory`表中。



## 注意事项

执行`Entity Framework Core` 命令时，一定要确保：切换到 `DbContext`派生类所在的项目，并且启动项目为包含数据源配置的项目，不然会报错：

```
Unable to create an object of type 'DataContext'. For the different patterns supported at design time, see https://go.microsoft.com/fwlink/?linkid=851728
```

这个是很容易忘记的。



迁移记录文件是用来记录模型更改历史的，它们对于追踪和应用数据库变更非常重要。因此，不建议随意删除迁移记录文件。

如果你有太多的迁移记录文件，可以考虑进行一些清理和整理，以保持项目的可维护性。以下是一些处理过多迁移记录的常见方法：

1. 合并迁移：将多个相关的迁移记录合并成一个更大的迁移记录。这样可以减少迁移文件的数量，并提高可读性和维护性。可以使用 `dotnet ef migrations merge` 命令来执行迁移合并操作。
2. 删除旧的迁移记录：如果你确定某些迁移记录不再需要，可以考虑删除它们。但是要注意，只能删除尚未应用到数据库的迁移记录。已经应用到数据库的迁移记录不能被删除，否则会导致数据库与迁移记录不一致。
3. 重置迁移历史：如果迁移记录过多且已经应用到数据库中，你可以考虑重置迁移历史。这意味着将数据库回滚到初始状态，并重新创建一个全新的初始迁移记录。这样可以清除所有旧的迁移记录，并开始一个新的迁移历史。要执行迁移历史重置，可以使用 `dotnet ef database update 0` 命令。

无论你选择哪种方法，都建议在进行任何更改之前先备份数据库以防止数据丢失。此外，与团队成员进行充分的沟通，并确保所有人都了解迁移历史的变更和处理方式。



```
Employee-Job关系：在你的代码中，Employee和Job似乎有多对多的关系，这通常需要一个连接表（如EmployeeJob）来表示。在EF Core 5.0及以上版本中，你可以使用"多对多"关系来简化你的模型。你可以在Employee和Job类中直接添加对方的集合，然后EF Core会自动创建并管理连接表。

然后你可以移除EmployeeJob类，EF Core会自动处理这个多对多的关系。
```



```
fail: Microsoft.AspNetCore.Diagnostics.DeveloperExceptionPageMiddleware[1]
      An unhandled exception has occurred while executing the request.
      System.InvalidOperationException: The instance of entity type 'Department' cannot be tracked because another instance with the same key value for {'DepartmentId'} is already being tracked. When attaching existing entities, ensure that only one entity instance with a given key value is attached. Consider using 'DbContextOptionsBuilder.EnableSensitiveDataLogging' to see the conflicting key values.
```

存在递归循序引用关系时可能出现这个错误，例如：

```c#
public class Department : BaseEntity {
    [Display(Name = "部门级别")]
    public int DepartmentLevel { get; set; }

    [Display(Name = "上级部门")]
    public long? ParentDepartmentId { get; set; }

    [ForeignKey("ParentDepartmentId")]
    public Department ParentDepartment { get; set; }
    public ICollection<Department> ChildDepartments { get; set; } = new List<Department>();

    [Display(Name = "负责人编号")]
    public long? ManagerId { get; set; }

    [ForeignKey("ManagerId")]
    [Display(Name = "负责人")]
    public Employee Manager { get; set; }

    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
```





# 模型设计

## 导航属性

- 在 `Entity Framework Core` (EF Core)中，**导航属性**用于表示实体类型之间的关系。导航属性允许您在实体之间导航并访问相关实体的属性。
- 在 `Entity Framework Core` 中，**反向导航属性**（Reverse Navigation Property）是指在关系模型中定义的一个属性，用于表示与当前实体关联的其他实体。一般也是集合属性，它解决的是一对多关系。其实广义上来讲，**反向导航属性**也是**导航属性**的一种，属于**集合导航属性**。



导航属性是EF Core中非常强大和常用的功能，它简化了实体之间的关系处理和查询操作。在EF Core 5.0及以上版本中，你可以使用"多对多"关系来简化你的模型。EF Core导航属性的基本概念和用法：

1. `单导航属性`（Single Navigation Property）：在一个实体类型中，通过一个导航属性引用另一个实体类型。例如，一个订单实体可能有一个指向客户实体的导航属性，表示订单所属的客户。

2. `集合导航属性`（Collection Navigation Property）：在一个实体类型中，通过一个导航属性引用多个相关实体类型。例如，一个部门实体可能有一个指向员工实体的集合导航属性，表示部门中的所有员工。

3. 导航属性的定义：在实体类型中，您可以通过定义一个属性来表示导航关系。这个属性的类型通常是关联实体类型或关联实体类型的集合。

   ```c#
   public class Order {
       public int OrderId { get; set; }
       public Customer Customer { get; set; } 			// 单导航属性
   }
   
   public class Customer {
       public int CustomerId { get; set; }
       public ICollection<Order> Orders { get; set; } 	// 集合导航属性，或称反向导航属性
   }
   ```

4. `导航属性的配置`：**如果使用了导航属性，则不能再使用`Fluent API`配置关联关系，虽然可以编译通过，但是会生成额外的列，造成逻辑混乱。**如果没有使用导航属性可以使用`Fluent API`配置关联关系，例如可以指定导航属性之间的关系类型（一对一、一对多、多对多）以及外键属性的名称。

   ```c#
   // 如果使用了导航属性，则不能再使用 Fluent API 配置关联关系
   protected override void OnModelCreating(ModelBuilder modelBuilder) {
       modelBuilder.Entity<Order>()
           .HasOne(o => o.Customer)
           .WithMany(c => c.Orders)
           .HasForeignKey(o => o.CustomerId);
   }
   ```



​	使用反向导航属性（集合属性）时，即使关联的实体类没有设置导航属性，在数据迁移后，也会为实体类自动生成外键。所以，不能再额外使用`Fluent API`创建外键。例如下面的代码中`Order`类没有使用导航属性，但是`Customer`使用了集合属性，则在执行数据迁移后，表`Orders`的列中仍然会出现`CustomerId`，因为它是被反向导航了，也可以认为是`躺枪`。

```c#
// 没有使用导航属性
public class Order {
}

// 使用了集合属性
public class Customer {
    public int CustomerId { get; set; }
    public ICollection<Order> Orders { get; set; }
}
```

​	也就是说，`Customer`使用了集合属性，它们俩的关联关系在设计阶段其实就已经形成了，那就是至少是一对多的，至于是不是多对多那要看`Order`类怎么设计的。假如现在设计如下：

```c#
public class Order {
    public int OrderId { get; set; }
    public Customer Customer { get; set; } 			// 单导航属性
}

public class Customer {
    public int CustomerId { get; set; }
    public ICollection<Order> Orders { get; set; } 	// 集合导航属性
}
```

​	那么它们的关系是一对多，注意这个时候执行数据迁移，并不会因为这次新增加了属性：`OrderId` 和 `Customer` 而有什么变化，实际上也确实不会有什么变化。增加这两个属性是为了方便后面代码引用方便罢了，`OrderId`本身就是集合属性而反向增加的外键名称了，`Customer`是为了在执行关联查询时候可以直接获取出属性的全部信息。



5. **导航属性的关联查询**，您可以轻松地在查询中进行关联操作，例如通过以下方式获取订单所属的客户信息：

```c#
var order = dbContext.Orders.Include(o => o.Customer).FirstOrDefault();
var customer = order.Customer;
```

使用导航属性相对比较简单清晰一些，只需关注模型实体的设计即可，查询的时候也比较简单，执行关联查询即可，也就是结合`Include`语句进行查询。





## 注解参考

```c#
// 自动增加，一般用在编号上
[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
[Display(Name = "编号")]
public long Id { get; set; }

[Required]
[Display(Name = "编号")]

[StringLength(maximumLength: 64)]
[StringLength(maximumLength: 20, MinimumLength = 11)]

[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
[Display(Name = "创建时间")]
public DateTime CreateTime { get; set; }

[DatabaseGenerated(DatabaseGeneratedOption.Computed)]
[Display(Name = "更新时间")]
public DateTime UpdatedTime { get; set; }


#region 负责的部门
[Display(Name = "负责的部门")]
public long? ChargeDepartmentId { get; set; }

[ForeignKey("ChargeDepartmentId")]		// 外键
public Department ChargeDepartment { get; set; }

[NotMapped]
[Display(Name = "负责的部门")]
public string ChargeDepartmentName { get; set; }
#endregion

```





# 老版本项目迁移时数据库的相关操作

## 数据库

### SqlServer转成MySQL

修改好Models之后，如果有迁移文件首先使用`migrations remove`逐个删除干净，然后再依此执行`migrations add Name`、`database update`。也即全部重新生成，手动替换的话错误特别多而且有坑。

| SqlServer                                                    | MySQL                                 |
| ------------------------------------------------------------ | ------------------------------------- |
| nvarchar(max)                                                | longtext                              |
| datetimeoffset                                               | datetime                              |
| Specified key was too long; max key length is 3072 bytes     | nvarchar(1000)替换为longtext          |
| BLOB/TEXT column 'Id' used in key specification without a key length | 找到Id为longtext的修改为nvarchar(100) |
| datetime2                                                    | datetime                              |



### 数据库授权访问

```sql
GRANT ALL PRIVILEGES ON *.* TO 'ROOT'@'%' IDENTIFIED BY '123' WITH GRANT OPTION;
flush privileges;
```



### EntityFramework

如果有多个项目，且需要在不同的项目下生成数据库迁移，则可以指定参数。参考：[c# - Add migration with different assembly](https://stackoverflow.com/questions/38705694/add-migration-with-different-assembly)

```
cd .\BlazorShop.Data
dotnet ef --startup-project ..\BlazorShop.Web\Server migrations add Name
dotnet ef --startup-project ..\BlazorShop.Web\Server database update
```



创建数据库模拟数据，可以按照如下代码创建一些模拟数据，然后执行`dotnet ef database update`即可。（`appsettings.json`里的数据源要配置正确）

```c#
protected override void OnModelCreating(ModelBuilder modelBuilder) {
    modelBuilder.Entity<Product>().HasData(
        new Product(){
            Id=1,
            Title = "",
            Description = "",
            ImageUrl = "",
            Price = 9.99m
        },
        new Product(){
            Id=2,
            Title = "",
            Description = "",
            ImageUrl = "",
            Price = 8.99m
        },
        new Product(){
            Id=3,
            Title = "",
            Description = "",
            ImageUrl = "",
            Price = 7.99m
        },
    )
}
```



# 参考

- [Migrations does not exist in the namespace Microsoft.EntityFrameworkCore](https://stackoverflow.com/questions/52191294/migrations-does-not-exist-in-the-namespace-microsoft-entityframeworkcore)
