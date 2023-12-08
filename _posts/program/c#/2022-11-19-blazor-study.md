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
| Swashbuckle.AspNetCore                                       | Swagger，方便接口测试的工具。参考：[Get started with Swashbuckle and ASP.NET Core \| Microsoft Learn](https://learn.microsoft.com/zh-cn/aspnet/core/tutorials/getting-started-with-swashbuckle?view=aspnetcore-7.0&tabs=visual-studio) |
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



# 杂项

```c#
添加属性，输入prop自动补全
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



### 初始化时机

页面初始化代码放在`OnAfterRenderAsync`里面，并通过参考`firstRender`控制，在首次渲染的时候进行初始化。不要在`OnInitializedAsync`里进行初始化操作，会执行两次，影响性能。

```csharp
protected override async Task OnAfterRenderAsync(bool firstRender) {
    if (firstRender) {
        // 初始化代码
    }
    await base.OnAfterRenderAsync(firstRender);
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

currentCategory = WebUtility.UrlDecode(NavigationManager.Uri.Split('/')[5]);
```



```c#
/// 从URL中取某参数
public static string? getUrlArg(NavigationManager navigationManager, string argName) {
    var currentUrl = new Uri(navigationManager.Uri);    // 获取当前 URL
    var queryParameters = System.Web.HttpUtility.ParseQueryString(currentUrl.Query);
    return queryParameters[argName];
}
```



### HTTPS免费证书

[Let's Encrypt - 免费的SSL/TLS证书](https://letsencrypt.org/zh-cn/)





# 界面UI

简单的UI可以参考 [bootstrap](https://www.runoob.com/bootstrap5/bootstrap5-tutorial.html) 或 [CSS](https://www.runoob.com/css/css-tutorial.html) 自己来写，稍微复杂点的可以使用三方开源框架，例如：[Bootstrap Blazor - 企业级 UI 组件库](https://www.blazor.zone/introduction)



### 页头页脚

可以参考`MainLayout.razor`里的   `<Header />`  和 `<Footer />`



### 打开首页自动跳转到某页面

创建`Index.razor`

```c#
@page "/"
@inject NavigationManager NavigationManager


@code {
    private bool _hasNavigated;

    // 首页默认跳转到指定页面
    protected override Task OnAfterRenderAsync(bool firstRender) {
        if (firstRender && !_hasNavigated) {
            _hasNavigated = true;
            NavigationManager.NavigateTo("pageXX");
        }
        return base.OnAfterRenderAsync(firstRender);
    }
}
```



### 自定义搜索文本框

#### 1 实时搜索（简单推荐）

```html
<EditForm Model="model" @oninput="() => LoadData()">
    <input @bind-value="SearchQuery" @bind-value:event="oninput" type="text" placeholder="输入关键词搜索" class="form-control" />
</EditForm>
```



#### 2 实时搜索（简单场景使用）

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

#### 3 一般线上的使用方法

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

参见：[C# blazor Web开发之数据库汇总 — 朱皮特的烂笔头](https://zhupite.com/program/blazor-database.html) 【老版本项目迁移时数据库的相关操作】章节。
