---
layout:		post
category:	"program"
title:		"C#之Blazor保存用户查询参数到网址URL中方便收藏快速打开使用"

tags:		[c#,blazor,net]
---
- Content
{:toc}
在查询条件较多的情况下，用户常用的查询可能就是那几种，每次打开页面后都重新筛选下条件有点没必要，可以把筛选条件自动更新到网址URL中，然后把这个URL地址收藏起来，下次要用直接点开就行，而且这个网址可以分享发给别人直接使用。



想要实现这个效果，在技术上需要实现几点：

1. 使用一个带查询参数的网址打开页面时，应自动解析参数更新到页面控件里去，并执行查询操作。
2. 查询时把筛选条件更新到网址URL中，每次查询就要自动更新下当前网页的网址。
2. 切换不同页面时参数也带上。



以下分别展开介绍实现方法。



# 自动解析网址参数并查询

1. 在razor组件页面文件中，定义下参数的解析规则，例如：

```c#
@page "/apps"
@using BlazorDemo.Components
@using BootstrapBlazor.Components

<div class="row">
    <div class="col-md-2">
        <BlazorDemo.Components.Search @bind-SearchText="@SearchName" Placeholder="搜索名称" OnSearch="OnSearch" />
    </div>
    <div class="col-md-2">
        <BlazorDemo.Components.Search @bind-SearchText="@SearchShellName" Placeholder="搜索壳" OnSearch="OnSearch" />
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

<div class="row">
    <div class="col-md-2">
        <Sort OnSortChanged="SortChanged" />
    </div>
    <div class="col-md-2">
        <a href="/createAppAuto" class="btn btn-primary">添加信息</a>
    </div>
    <div class="col-md-2">
        <ButtonUpload BrowserButtonText="上传APP" TValue="string" IsMultiple="true" ShowProgress="true" OnChange="@OnClickToUpload" OnDelete="@(fileName => Task.FromResult(true))"></ButtonUpload>
    </div>
    <div class="col-md-2">
        @Message
    </div>
</div>


<div class="row">
    <AppTable Apps="AppList" Delete="Delete" />
</div>
<div class="row">
    <div class="col">
        <BlazorDemo.Components.Pagination MetaData="@MetaData" Spread="2" SelectedPage="SelectedPage" />
    </div>
</div>
<SuccessNotification @ref="_notification" />


@code{
    string Message = string.Empty;

    [Parameter]
    [SupplyParameterFromQuery(Name = "name")]
    public string SearchName { set; get; } = string.Empty;

    [Parameter]
    [SupplyParameterFromQuery(Name = "shell")]
    public string SearchShellName { set; get; } = string.Empty;

    [Parameter]
    [SupplyParameterFromQuery(Name = "tag")]
    public string SearchTag { set; get; } = string.Empty;

    [Parameter]
    [SupplyParameterFromQuery(Name = "memo")]
    public string SearchMemo { set; get; } = string.Empty;

    [Parameter]
    [SupplyParameterFromQuery(Name = "operator")]
    public string SearchOperator { set; get; } = string.Empty;

    [Parameter]
    [SupplyParameterFromQuery(Name = "orderby")]
    public string OrderBy { set; get; } = default!;

    [Parameter]
    [SupplyParameterFromQuery(Name = "asc")]
    public bool Asc { set; get; } = false;
}
```

2. 在查询事件处理中更新网址

```c#
[Inject]
public NavigationManager Navigation { get; set; } = default!;


private async Task OnSearch(string searchText) {
    _appParam.PageNumber = 1;
    await GetApps();									// 查询
    Navigation.NavigateTo(formatCurrentUrl(), false);	// 更新URL及参数
}

private string formatCurrentUrl() {
    return $"/apps?name={SearchName}&shell={SearchShellName}&tag={SearchTag}&memo={SearchMemo}&operator={SearchOperator}&orderby={OrderBy}";
}

private async Task GetApps() {
    DateTime time = DateTime.Now;
    _appParam.SearchName = SearchName;
    _appParam.SearchShellName = SearchShellName;
    _appParam.SearchTag = SearchTag;
    _appParam.SearchMemo = SearchMemo;
    _appParam.SearchOperator = SearchOperator;
    _appParam.OrderBy = OrderBy;
    if (string.IsNullOrEmpty(_appParam.OrderBy)) { _appParam.OrderBy = nameof(AppInfo.ModifiedDate); }
    if (!Asc) { _appParam.OrderBy += " desc"; }
    var pagingResponse = await _repo.GetApps(_appParam);
    AppList = pagingResponse.Items;
    MetaData = pagingResponse.MetaData;
    Message = string.Format("本次查询用时: {0,1:f1}s", (DateTime.Now - time).TotalSeconds);
}
```



不过`formatCurrentUrl`函数不够通用，可以封装一个：

```c#
public static void updateUrlArgs(NavigationManager navigationManager, Dictionary<string, string> args) {
    // 获取当前 URL
    var currentUrl = new Uri(navigationManager.Uri);

    // 分析查询字符串参数
    var queryParameters = System.Web.HttpUtility.ParseQueryString(currentUrl.Query);

    // 更新所有的参数
    foreach (var entry in args) {
        // 添加或修改参数
        queryParameters[entry.Key] = entry.Value;
    }

    // 重建查询字符串
    string? newQueryString = queryParameters.ToString();

    // 构建新的 URL
    var newUrl = $"{currentUrl.GetLeftPart(UriPartial.Path)}?{newQueryString}";

    // 导航到新的 URL
    navigationManager.NavigateTo(newUrl, forceLoad: false);
}
```

使用时参考如下示例：

```c#
Dictionary<string, string> args = new() {
    { "dim1ColumnIndex", dim1ColumnIndex.ToString()},
    { "dim1Classifies", dim1Classifies},
    { "dimXColumnIndex", dimXColumnIndex.ToString()},
    { "timeUnit", timeUnit},
};

if (dateRange.Start!=DateTime.MinValue) {
    args.Add("startTime", dateRange.Start.ToString("yyyy-MM-dd"));
}
if (dateRange.End != DateTime.MinValue) {
    args.Add("endTime", dateRange.End.ToString("yyyy-MM-dd"));
}
BICommonUtil.updateUrlArgs(navigationManager, args);
GlobalEventService.OnQueryBtnClicked();
```



# 查询时自动更新网址参数

参考如下的方式配置参数，会自动解析参数，方便极了。

```c#
[Parameter]
[SupplyParameterFromQuery(Name = "name")]
public string SearchName { set; get; } = string.Empty;
```



# 切换网页参数不丢失

需要修改`NavMenu.razor`，凡是使用`NavLink`的地方统一替换为`CustomNavLink`，`CustomNavLink.razor`的代码如下：

```c#
@inherits NavLink
@inject NavigationManager NavigationManager


@*会有个问题：首页的导航项会一直处于匹配选中状态*@
<NavLink @attributes="AdditionalAttributes"
         Href="@HrefWithQuery"
         @onclick="OnClick"
         Match="NavLinkMatch.Prefix">
    @base.ChildContent
</NavLink>

@code {
    [Parameter] public string Href { get; set; } = string.Empty;

    private string HrefWithQuery => GetHrefWithCurrentQuery();

    private string GetHrefWithCurrentQuery() {
        var currentUrl = new Uri(NavigationManager.Uri);
        var query = currentUrl.Query;

        if (!string.IsNullOrEmpty(query)) {
            return $"{Href}{query}";
        }

        return Href;
    }

    private void OnClick(MouseEventArgs args) {
        NavigationManager.NavigateTo(HrefWithQuery, forceLoad: false);
    }
}
```

为解决首页的导航页一直处于匹配选中状态的问题，可以把`Match`设置为`NavLinkMatch.All`。

```html
<CustomNavLink class="nav-link" href="" Match="NavLinkMatch.All">
    <span class="oi oi-dollar" aria-hidden="true"></span> 首页
</CustomNavLink>
```



# 参考

- [[Solved]-Blazor Navigation: Update URL without changing reloading page-C#](https://www.appsloveworld.com/csharp/100/80/blazor-navigation-update-url-without-changing-reloading-page)
