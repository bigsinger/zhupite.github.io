---
layout:		post
category:	"program"
title:		"C#Web开发之blazor前后端分离及API接口编写参考汇总"

tags:		[c#,blazor,net]
---
- Content
{:toc}
# 解决方案里的项目结构

| 项目     | 说明                                                         | 所需三方库                                                   |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| APIs     | 作为访问数据库的服务和提供`WebApi`的项目，其实可以再拆分，把访问数据库的服务拆出来。 | `Microsoft.EntityFrameworkCore.Design` `Microsoft.EntityFrameworkCore.Tools` `Pomelo.EntityFrameworkCore.MySql` `Newtonsoft.Json` `Microsoft.Extensions.Configuration.Abstractions` `System.Linq.Dynamic.Core` |
| Client   | 前端                                                         |                                                              |
| Shared   | 前端  （其实 `Client` 和 `Shared` 可以合并为一个，因为是模板自动生成，暂且这样） | `BootstrapBlazor`                                            |
| Server   | 后端                                                         | `Microsoft.EntityFrameworkCore.Design` `Microsoft.EntityFrameworkCore.Tools` `Pomelo.EntityFrameworkCore.MySql` `Newtonsoft.Json`  `Swashbuckle.AspNetCore`   `System.Linq.Dynamic.Core` |
| Entities | 前后端共用的一些结构体                                       | `Microsoft.Extensions.Configuration.Abstractions`            |
| Util     | 前后端共用的类封装。                                         | 根据实际需要                                                 |



**项目引用关系**：

1. **Client**：引用 `Shared`、`Entities`、`Util`
2. **Shared**：引用 `Entities`、`Util`
3. **Server**：引用 `APIs`、`Entities`、`Util`



**人员分工**：

如果全程是一个人开发，全部项目添加到同一个解决方案里即可，如果是前后端不同人员开发，则按照下面方式：

1. 前端开发负责：`Client`、 `Shared`、`Entities`、`Util`
2. 后端开发负责：`Server`、 `APIs`、`Entities`、`Util`
3. 公共部分：`Entities`、`Util`，除此之外的项目应该按照权限隔离开来。



**调试运行**：

1. 迁移数据库时：设置 `Server`项目为启动项目，打开`PM控制台`并切换到`APIs`，然后执行迁移命令；
2. 联调运行时：配置启动项目 - 通用属性 - 启动项目 - 多个启动项目，勾选：`Client` 和 `Server`，然后调试运行即可。这个时候会同时运行服务端和前端，两个项目可以同时调试，比较方便。





# 接口编写步骤

1. 先写`Model`，模型设计及数据库迁移可以参考：[C# blazor Web开发之数据库汇总 — 朱皮特的烂笔头](https://zhupite.com/program/blazor-database.html)

1. 配置数据源：创建好数据库，然后配置`appsettings.json` ；

1. 添加并注册`DbContext`派生类；

1. 如果模型及数据有变更，需要执行一次数据迁移；

2. 编写写服务端的`service`（使用`DbContext`）并注册，一般是三个文件：一个接口、一个实现、一个扩展服务（可选）；

3. 编写服务端的`controller`；

4. 使用 `swagger` 测试

   1. 添加三方库：`Swashbuckle.AspNetCore`

   2. 添加初始化代码：

      ```c#
      if(env.IsDevelopment()) {
          app.UseSwagger();
          app.UseSwaggerUI();
      }
      
      builder.Services.AddSwaggerGen();
      ```

   3. 服务运行后访问：https://localhost:7155/swagger/index.html  测试接口及服务编写的正确性。

5. 编写客户端的`service`（使用http发送请求）并注册，一般是两个文件：一个接口、一个实现。





# 服务请求方法

## PostAsync

```c#
public async Task<ServiceResponse<bool>> Create(Module obj) {
    ServiceResponse<bool> ret = new();
    if (obj.Memo?.Length > Settings.MemoMaxSize) {
        obj.Memo = obj.Memo.Substring(0, Settings.MemoMaxSize);
    }
    var postContent = System.Text.Json.JsonSerializer.Serialize(obj, _jsonSerializerOptions);
    var bodyContent = new StringContent(postContent, Encoding.UTF8, "application/json");

    var response = await _client.PostAsync("api/module/create", bodyContent);
    if (response.IsSuccessStatusCode) {
        ret = await response.Content.ReadFromJsonAsync<ServiceResponse<bool>>(_jsonSerializerOptions) ?? ret;
    } else {
        ret.Success = false;
        var content = await response.Content.ReadAsStringAsync();
        ret.Message = $"Create failed with status code: {response.StatusCode}\nResponse content: {content}";
        throw new ApplicationException(content);
    }

    return ret;
}
```

## PostAsJsonAsync

```c#
public async Task<ServiceResponse<PagedList<Module>>> GetAll(ModuleFilterParam param) {
    HttpResponseMessage response = await _client.PostAsJsonAsync($"api/module", param);
    response.EnsureSuccessStatusCode(); // 确保响应成功
    var content = await response.Content.ReadFromJsonAsync<ServiceResponse<PagedList<Module>>>(_jsonSerializerOptions);
    return content ?? new();
}
```



## DeleteAsync

```c#
public async Task Delete(long id) {
    var postResult = await _client.DeleteAsync("api/module/delete/" + id);
    var postContent = await postResult.Content.ReadAsStringAsync();

    if (!postResult.IsSuccessStatusCode) {
        throw new ApplicationException(postContent);
    }
}
```



## PutAsync

```c#
public async Task<ServiceResponse<bool>> Update(Module obj) {
    ServiceResponse<bool> ret = new();
    try {
        var postContent = System.Text.Json.JsonSerializer.Serialize(obj, _jsonSerializerOptions);
        var bodyContent = new StringContent(postContent, Encoding.UTF8, "application/json");

        var response = await _client.PutAsync("api/module/update", bodyContent);

        if (response.IsSuccessStatusCode) {
            ret = await response.Content.ReadFromJsonAsync<ServiceResponse<bool>>(_jsonSerializerOptions) ?? ret;
        } else {
            var content = await response.Content.ReadAsStringAsync();
            ret.Success = false;
            ret.Message = $"Update failed with status code: {response.StatusCode}\nResponse content: {content}";
            throw new ApplicationException(content);
        }
    } catch (Exception e) {
        ret.Success = false;
        ret.Message = $"Exception occured in Update: {e.Message}";
        if (e.InnerException != null) {
            ret.Message += $"\nInner exception: {e.InnerException.Message}";
        }
        ret.Message += $"\bStack trace: {e.StackTrace}";
        throw;
    }

    return ret;
}
```



## DeleteFromJsonAsync



## GetFromJsonAsync

```c#
var res = await _client.GetFromJsonAsync<ServiceResponse<xxx>>(Url + "/api/chat/message");
res.Data
```



## PatchAsJsonAsync



## PostAsJsonAsync



## PutAsJsonAsync



