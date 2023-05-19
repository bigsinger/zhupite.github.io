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

添加`Model`，一些注解参考：

```c#
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

[Index] // 创建索引
```



注意事项：

```
Employee-Job关系：在你的代码中，Employee和Job似乎有多对多的关系，这通常需要一个连接表（如EmployeeJob）来表示。在EF Core 5.0及以上版本中，你可以使用"多对多"关系来简化你的模型。你可以在Employee和Job类中直接添加对方的集合，然后EF Core会自动创建并管理连接表。

然后你可以移除EmployeeJob类，EF Core会自动处理这个多对多的关系。
```

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
Add-Migration Initial   -verbose # -verbose 根据实际需要添加
Update-Database
Remove-Migration
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
