---
layout:		post
category:	"program"
title:		"C#Web开发之blazor学习杂记"

tags:		[c#,blazor,net]
---
- Content
{:toc}


# 三方库

API搜索可以到微软官方网址：https://learn.microsoft.com/zh-cn/dotnet/api/

| 库                                                           | 说明                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| Pomelo.EntityFrameworkCore.MySql                             |                                                              |
| [Scrutor](https://github.com/khellang/Scrutor)               | 基于 `Microsoft.Extensions.DependencyInjection` 的一个扩展库，主要是为了简化我们对DI的操作。`Scrutor`主要提供了两个扩展方法给我们使用，一个是`Scan`,一个是`Decorate`。 |
| Swashbuckle.AspNetCore.Swagger                               | Swagger，方便接口测试的工具。参考：[Get started with Swashbuckle and ASP.NET Core \| Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-swashbuckle?view=aspnetcore-7.0&tabs=visual-studio) |
| [Blazored.Toast](https://github.com/Blazored/Toast)          | 吐司提示。在线演示效果见：https://blazored.github.io/Toast/  |
| [Blazored.LocalStorage](https://github.com/Blazored/LocalStorage) | 本地存储。在线演示效果见：https://blazored.github.io/LocalStorage/ |
| Microsoft.AspNetCore.Components.Authorization                |                                                              |
| [Microsoft.AspNetCore.WebUtilities](https://learn.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.webutilities?view=aspnetcore-7.0) | QueryHelpers 、Base64UrlTextEncoder 更多类参见微软官方文档。 |
| Microsoft.Extensions.Http                                    |                                                              |
| System.Net.Http.Json                                         |                                                              |
| MediatR                                                      | [MediatR 在 .NET 应用中的实践 ](https://yimingzhi.net/2021/12/mediatr-zai-dotnet-ying-yong-zhong-de-shi-jian)中介模式，感觉封装的太重了，反而不够轻便。 |
|                                                              |                                                              |
|                                                              |                                                              |
|                                                              |                                                              |



# 鸡零狗碎

```c#
public event Action ProductsChanged;
public event Action<string> ProductsChanged;
public EventCallback<string> ProductsChanged;

@implements IDisposable
ElementReference
sequenceequal 字节数组比较
AuthenticationStateProvider
HMACSHA512
Microsoft.AspNetCore.Components.Authorization
CascadingAuthenticationState
AuthorizeRouteView
Microsoft.AspNetCore.WebUtilities
QueryHelpers.ParseQuery(uri.Query).TryGetValue("returnUrl", out var url)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer
NavigationManager.ToAbsoluteUri(NavigationManager.Uri)
```



- 本地存储：`LocalStorage` ，谷歌浏览器F12 - `Application` - `LocalStorage`



### 全局引用和全局注入对象

在 `_Imports.razor` 中的引用或者注入被认为是全局的，在本项目的所有 `.razor` 文件或者 `.razor.cs` 文件中可以直接使用。对于全局注入的对象，用`this`来快速使用。例如：

```csharp
@using BlazorShop.Web.Client.Infrastructure.Services.Addresses
@using BlazorShop.Web.Client.Infrastructure.Services.Categories
@using BlazorShop.Web.Client.Infrastructure.Services.Orders
@using BlazorShop.Web.Client.Infrastructure.Services.Products
@using BlazorShop.Web.Client.Infrastructure.Services.ShoppingCarts
@using BlazorShop.Web.Client.Infrastructure.Services.Wishlists
@using BlazorShop.Web.Client.Pages.Account
@using BlazorShop.Web.Client.Shared
@using BlazorShop.Web.Client.Shared.Common
@using BlazorShop.Web.Client.Shared.Navigation
@using BlazorShop.Web.Client.Shared.Products

@inject ApiAuthenticationStateProvider AuthState
@inject NavigationManager NavigationManager
@inject HttpClient Http
@inject IToastService ToastService
@inject IAuthService AuthService
@inject IAddressesService AddressesService
@inject ICategoriesService CategoriesService
@inject IOrdersService OrdersService
@inject IProductsService ProductsService
@inject IShoppingCartsService ShoppingCartsService
@inject IWishlistsService WishlistsService
```

在本项目的所有 `.razor` 文件或者 `.razor.cs` 文件中可以直接使用：`this.Http`

### 全局注册实例

例如`ApplicationSettings`是自定义类，注册：

```csharp
services.Configure<ApplicationSettings>(applicationSettingsConfiguration);
```

在后面的代码中就可以这样使用：

```csharp
public JwtGeneratorService(IOptions<ApplicationSettings> applicationSettings) {
    this.applicationSettings = applicationSettings.Value;
}
```



### NavigationManager

- **NavigateTo**：导航到指定网址，可以指定参数来确定是否强制加载；
- **Uri**：获取当前网址的URL地址；
- **ToAbsoluteUri**：获取绝对网址，一般用法：`NavigationManager.ToAbsoluteUri(NavigationManager.Uri)`
- **ToBaseRelativePath**：转换为相对网址路径，一般用法：`href="login?returnUrl=@NavigationManager.ToBaseRelativePath(NavigationManager.Uri)"`



### 解析URL

```csharp
protected override void OnInitialized() {
    var uri = NavigationManager.ToAbsoluteUri(NavigationManager.Uri);
    if (QueryHelpers.ParseQuery(uri.Query).TryGetValue("returnUrl", out var url)) {
        returnUrl = url;
    }
}
```



### 接口编写步骤

1. 先写Model
2. 再写服务端的service（使用DbContext）
3. 再写controller
4. 使用swagger测试
5. 客户端的service（使用http发送请求）



# 界面UI

简单的UI可以参考 [bootstrap](https://www.runoob.com/bootstrap5/bootstrap5-tutorial.html) 或 [CSS](https://www.runoob.com/css/css-tutorial.html) 自己来写，稍微复杂点的可以使用三方开源框架，例如：[Bootstrap Blazor - 企业级 UI 组件库](https://www.blazor.zone/introduction)



### 页头页脚

可以参考`MainLayout.razor`里的   `<Header />`  和 `<Footer />`



### 自定义搜索文本框

#### 1 实时搜索（简单场景使用）

根据输入内容实时搜索（无须按下Enter键或者点击别的按钮）

`Search.razor`：

```xml
<section style="margin-bottom: 10px">
    <input type="text" class="form-control" placeholder="@Placeholder"
           @bind="@SearchText" @bind:event="oninput" @onkeyup="OnKeyup" />
</section>
```

`Search.razor.cs`：

```cs
using Microsoft.AspNetCore.Components;

namespace BlazorDemo.Components {
    public partial class Search {
        private Timer _timer = default!;

        private string _text = string.Empty;
        [Parameter]
        public string SearchText
        {
            get => _text;
            set {
                if (_text == value) return;

                _text = value;
                SearchTextChanged.InvokeAsync(value);
            }
        }

        [Parameter]
        public string Placeholder { get; set; } = "输入文本进行搜索";

        [Parameter]
        public EventCallback<string> SearchTextChanged { get; set; }

        [Parameter]
        public EventCallback<string> OnSearch { get; set; }

        private async Task OnKeyup() {
            if (_timer != null)
                _timer.Dispose();

            _timer = new Timer(async (sender) => {
                await InvokeAsync(() => {
                    OnSearch.InvokeAsync(SearchText);
                });
                _timer?.Dispose();
            }, null, 500, 0);
            await Task.CompletedTask;
        }
    }
}
```

使用：

```xml
<div class="row">
    <div class="col-md-2">
        <BlazorDemo.Components.Search @bind-SearchText="@SearchName" Placeholder="搜索名称" OnSearch="OnSearch" />
    </div>
    <div class="col-md-2">
        <BlazorDemo.Components.Search @bind-SearchText="@SearchTag" Placeholder="搜索标签" OnSearch="OnSearch" />
    </div>
    <div class="col-md-2">
        <BlazorDemo.Components.Search @bind-SearchText="@SearchMemo" Placeholder="搜索备注" OnSearch="OnSearch" />
    </div>
    <div class="col-md-2">
        <BlazorDemo.Components.Search @bind-SearchText="@SearchOperator" Placeholder="搜索操作者" OnSearch="OnSearch" />
    </div>
</div>
```

```csharp
private async Task OnSearch(string searchText) {
    _appParam.PageNumber = 1;
    await GetApps();
    Navigation.NavigateTo(formatCurrentUrl(), false);
}
```

#### 2 一般线上的使用方法

比较巧妙，直接打开一个URL。

NavMobileSearch.razor

```xml
<EditForm Model="searchModel" OnValidSubmit="Search" method="get" class="d-md-none my-2">
    <div class="input-group">
        <InputText @bind-Value="searchModel.Query" type="search" name="search" class="form-control" placeholder="Search" required />
        <div class="input-group-append">
            <button type="submit" class="btn btn-secondary">
                <i class="fas fa-search"></i>
            </button>
        </div>
    </div>
</EditForm>
```

```cs
namespace BlazorShop.Web.Client.Shared.Navigation {
    using Models.Products;

    public partial class NavMobileSearch {
        private readonly ProductsSearchRequestModel searchModel = new ProductsSearchRequestModel();

        private void Search()
            => this.NavigationManager.NavigateTo($"/products/search/{this.searchModel.Query}/page/1");
    }
}
```

使用者：

```html
<NavMobileSearch />
```



### 弹框确认

```cs
using Microsoft.JSInterop;

[Inject]
protected IJSRuntime JsRuntime { get; set; }

bool confirmed = await this.JsRuntime.InvokeAsync<bool>(
                "confirm",
                "Are you sure you want to delete this item?");
```



### 添加到购物车的按钮

```xml
<button class="btn btn-primary" @onclick="AddToCart">
	<i class="oi oi-cart"></i>&nbsp;&nbsp;&nbsp;Add to Cart
</button>
```



### 订阅事件回调处理

可以理解为：当某个服务发生处理事件时，我也关心，请回调我，我需要更新界面UI。

```c#
//订阅
@inject ICartService CartService
@inject ISyncLocalStorageService LocalStorage
@implements IDisposable

<a href="cart" class="btn btn-info">
    <i class="oi oi-cart"></i>
    <span class="badge">@GetCartItemsCount()</span>
</a>

@code {
    private int GetCartItemsCount() {
        var count = LocalStorage.GetItem<int>("cartItemsCount");
        return count;
    }

    protected override void OnInitialized() {
        CartService.OnChange += StateHasChanged;
    }

    public void Dispose() {
        CartService.OnChange -= StateHasChanged;
    }
}
```

```csharp
public event Action OnChange;
```



### AuthorizeRouteView

可以认为是具有授权验证的视图，如果没有授权（未登录成功）则显示登录的组件：`Login`：

```xml
<AuthorizeRouteView RouteData="@routeData" DefaultLayout="@typeof(MainLayout)">
    <NotAuthorized>
        <Login />
    </NotAuthorized>
</AuthorizeRouteView>
```

### preventDefault

取消事件的默认行为。

```html
<a @onclick:preventDefault
   @onclick="() => OnDeleteAsync()"
   href=""
   class="btn btn-outline-danger">
    <i class="fa fa-trash"></i>
</a>
```



## 组件

### 翻页

#### 1

Pagination.razor

```xml
<nav aria-label="Page navigation example">
    <ul class="pagination justify-content-center">
        @foreach (var link in _links)
        {
            <li @onclick="() => OnSelectedPage(link)" style="cursor: pointer;" class="page-item @(link.Enabled ? null : "disabled") @(link.Active ? "active" : null)">
                <span class="page-link" href="#">@link.Text</span>
            </li>
        }
    </ul>
</nav>
```

Pagination.razor.cs

```cs
using BlazorDemo.Features;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Components;

namespace BlazorDemo.Components {
    public partial class Pagination {
        [Parameter]
        public MetaData MetaData { get; set; } = default!;
        [Parameter]
        public int Spread { get; set; }
        [Parameter]
        public EventCallback<int> SelectedPage { get; set; }

        private List<PagingLink> _links = default!;

        protected override void OnParametersSet() {
            CreatePaginationLinks();
        }

        private void CreatePaginationLinks() {
            _links = new List<PagingLink>();

            _links.Add(new PagingLink(MetaData.CurrentPage - 1, MetaData.HasPrevious, "Previous"));

            for (int i = 1; i <= MetaData.TotalPages; i++) {
                if (i >= MetaData.CurrentPage - Spread && i <= MetaData.CurrentPage + Spread) {
                    _links.Add(new PagingLink(i, true, i.ToString()) { Active = MetaData.CurrentPage == i });
                }
            }

            _links.Add(new PagingLink(MetaData.CurrentPage + 1, MetaData.HasNext, "Next"));
        }

        private async Task OnSelectedPage(PagingLink link) {
            if (link.Page == MetaData.CurrentPage || !link.Enabled)
                return;

            MetaData.CurrentPage = link.Page;
            await SelectedPage.InvokeAsync(link.Page);
        }
    }
}
```

使用者：

```xml
<div class="row">
    <div class="col">
        <BlazorDemo.Components.Pagination MetaData="@MetaData" Spread="2" SelectedPage="SelectedPage" />
    </div>
</div>
```

```cs
private async Task SelectedPage(int page) {
    _appParam.PageNumber = page;
    await GetApps();
}
```



#### 2

Pagination.razor：

```xml
@if (TotalPages > 1)
{
    <nav class="mt-4" aria-label="Page navigation sample">
        <ul class="pagination">

            @foreach (var link in links)
            {
                <li @onclick="() => SelectedPageInternal(link)"
                    style="cursor: pointer;"
                    class="page-item @(link.Enabled ? null : "disabled") @(link.Active ? "active" : null)">
                    <span class="page-link">@link.Text</span>
                </li>
            }

        </ul>
    </nav>
}
```

Pagination.razor.cs：

```cs
namespace BlazorShop.Web.Client.Shared.Products {
    using Microsoft.AspNetCore.Components;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public partial class Pagination {
        private List<LinkModel> links;

        [Parameter]
        public int Page { get; set; } = 1;

        [Parameter]
        public int TotalPages { get; set; }

        [Parameter]
        public int Radius { get; set; } = 3;

        [Parameter]
        public EventCallback<int> SelectedPage { get; set; }

        protected override void OnParametersSet() => this.LoadPages();

        private async Task SelectedPageInternal(LinkModel link) {
            if (link.Page == this.Page) {
                return;
            }

            if (!link.Enabled) {
                return;
            }

            this.Page = link.Page;

            await this.SelectedPage.InvokeAsync(link.Page);
        }

        private void LoadPages() {
            const string previous = "Previous";
            const string next = "Next";

            var isPreviousPageLinkEnabled = this.Page != 1;
            var previousPage = this.Page - 1;

            this.links = new List<LinkModel>
            {
                new LinkModel(previousPage, isPreviousPageLinkEnabled, previous)
            };

            for (int i = 1; i <= this.TotalPages; i++) {
                if (i >= this.Page - this.Radius && i <= this.Page + this.Radius) {
                    this.links.Add(new LinkModel(i)
                    {
                        Active = this.Page == i
                    });
                }
            }

            var isNextPageLinkEnabled = this.Page != this.TotalPages;
            var nextPage = this.Page + 1;

            this.links.Add(new LinkModel(nextPage, isNextPageLinkEnabled, next));
        }

        private class LinkModel {
            public LinkModel(int page)
                : this(page, true) {
            }

            private LinkModel(int page, bool enabled)
                : this(page, enabled, page.ToString()) {
            }

            public LinkModel(int page, bool enabled, string text) {
                this.Page = page;
                this.Enabled = enabled;
                this.Text = text;
            }

            public string Text { get; }

            public int Page { get; }

            public bool Enabled { get; }

            public bool Active { get; set; }
        }
    }
}
```



使用者：

```xml
<Pagination Page="@searchResponse.Page"
                                TotalPages="@searchResponse.TotalPages"
                                Radius="2"
                                SelectedPage="SelectedPage" />
```

```cs
private async Task SelectedPage(int page) {
    this.Page = page;
    await this.LoadData(withCategories: false);
}
```



# 常见问题解决

```
blazor.webassembly.js:1 crit: Microsoft.AspNetCore.Components.WebAssembly.Rendering.WebAssemblyRenderer[100]
      Unhandled exception rendering component: Authorization requires a cascading parameter of type Task<AuthenticationState>. Consider using CascadingAuthenticationState to supply this.
System.InvalidOperationException: Authorization requires a cascading parameter of type Task<AuthenticationState>. Consider using CascadingAuthenticationState to supply this.
   at Microsoft.AspNetCore.Components.Authorization.AuthorizeViewCore.OnParametersSetAsync()
   at Microsoft.AspNetCore.Components.ComponentBase.CallStateHasChangedOnAsyncCompletion(Task task)
   at Microsoft.AspNetCore.Components.ComponentBase.RunInitAndSetParametersAsync()
```

解决：在使用了 `AuthorizeView ` 的地方或者父级布局文件里，添加：`@attribute [Authorize]`  或者组件节点用 `<CascadingAuthenticationState>` 包含起来。

参考：https://stackoverflow.com/questions/72897910/authorization-requires-a-cascading-parameter-of-type-taskauthenticationstate





```
Cannot add or update a child row: a foreign key constraint fails (`blazorshopdb`.`shoppingcarts`, CONSTRAINT `FK_ShoppingCarts_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `aspnetusers` (`Id`))
```

解决：原因是主表中不存在该Id的用户记录，需要先在主表中添加记录（业务流程就是先进行用户注册）。





```
The query uses a row limiting operator ('Skip'/'Take') without an 'OrderBy' operator. This may lead to unpredictable results. If the 'Distinct' operator is used after 'OrderBy', then make sure to use the 'OrderBy' operator after 'Distinct' as the ordering would otherwise get erased.

Entity 'Product' has a global query filter defined and is the required end of a relationship with the entity 'WishlistProduct'. This may lead to unexpected results when the required entity is filtered out
```

解决办法：

```csharp
public class BlazorShopDbContext : DbContext        
	protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) {
            base.OnConfiguring(optionsBuilder);
            optionsBuilder.ConfigureWarnings(wb => wb
                .Ignore(CoreEventId.RowLimitingOperationWithoutOrderByWarning)
                .Ignore(CoreEventId.PossibleIncorrectRequiredNavigationWithQueryFilterInteractionWarning)
            );
    }
}
```



# 老版本项目迁移

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
|                                                              |                                       |
|                                                              |                                       |
|                                                              |                                       |
|                                                              |                                       |

### 数据库授权访问

```sql
GRANT ALL PRIVILEGES ON *.* TO 'ROOT'@'%' IDENTIFIED BY '123' WITH GRANT OPTION;
flush privileges;
```

### EntityFramework

```
Microsoft.EntityFrameworkCore
Microsoft.EntityFrameworkCore.design
Pomelo.EntityFrameworkCore.MySql
```

`dotnet ef`

```bash
// 在PM控制台中使用。注意：使用前一定先 cd 到项目目录

dotnet ef database update  		//更新数据库
dotnet ef migrations add Name  	//创建新的迁移文件
dotnet ef migrations remove 	//删除迁移文件
dotnet ef database update drop 	//删除数据库
```

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

