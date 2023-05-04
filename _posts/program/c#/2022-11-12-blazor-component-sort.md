---
layout:		post
category:	"program"
title:		"C#Blazor UI组件列表选择框选择后自动调用回调函数"

tags:		[c#,blazor,net]
---
- Content
{:toc}
实现效果：选择后自动触发回调函数。



`Sort.razor`：

```xml
<section>
    <select class="form-control" @onchange="OnChange">
        <option value="-1">按以下方式排序</option>
        <option value="ModifiedDate">更新时间</option>
        <option value="CreationDate">添加时间</option>
        <option value="VersionName">版本</option>
        <option value="name">名称</option>
        <option value="ShellName">壳</option>
        <option value="Operator">操作者</option>
        <option value="FileSize">文件大小</option>
    </select>
</section>
```

`Sort.razor.cs`：

```c#
using Microsoft.AspNetCore.Components;

namespace BlazorDemo.Components {
    public partial class Sort {
        [Parameter]
        public EventCallback<string> OnSelectChanged { get; set; }

        private async Task OnChange(ChangeEventArgs eventArgs) {
            if (eventArgs.Value?.ToString() == "-1")
                return;
            await OnSelectChanged.InvokeAsync(eventArgs.Value?.ToString());
        }
    }
}
```

也可以把上述两个文件都简化到一个`razor`文件里：

```c#
<select class="form-control" @onchange="OnChange">
    <option value="-1">按以下方式排序</option>
    <option value="ModifiedDate">更新时间</option>
    <option value="CreationDate">添加时间</option>
    <option value="VersionName">版本</option>
    <option value="name">名称</option>
    <option value="ShellName">壳</option>
    <option value="Operator">操作者</option>
    <option value="FileSize">文件大小</option>
</select>


@code{
    [Parameter]
    public EventCallback<string> OnSelectChanged { get; set; }

    private async Task OnChange(ChangeEventArgs eventArgs) {
        if (eventArgs.Value?.ToString() == "-1")
            return;
        await OnSelectChanged.InvokeAsync(eventArgs.Value?.ToString());
    }
}
```



使用时：

```xml
<div class="row">
    <div class="col-md-2">
        <Sort OnSortChanged="SortChanged" />
    </div>
</div>
```

```c#
private async Task SortChanged(string orderBy) {
    OrderBy = orderBy;
    _appParam.PageNumber = 1;
    await GetApps();
    Navigation.NavigateTo(formatCurrentUrl(), false);
}
```



其实这个封装没有任何意义，可以继续简化之，直接使用：

```xml
<div class="row">
    <div class="col-md-2">
        <select class="form-control" @onchange="SortChanged">
            <option value="-1">按以下方式排序</option>
            <option value="ModifiedDate">更新时间</option>
            <option value="CreationDate">添加时间</option>
            <option value="VersionName">版本</option>
            <option value="name">名称</option>
            <option value="ShellName">壳</option>
            <option value="Operator">操作者</option>
            <option value="FileSize">文件大小</option>
        </select>
    </div>
</div>
```

```c#
private async Task SortChanged(ChangeEventArgs eventArgs) {
    string? orderBy = eventArgs.Value?.ToString();
    if (string.IsNullOrEmpty(orderBy) || orderBy == "-1") {
        return;
    }

    OrderBy = orderBy;
    _appParam.PageNumber = 1;
    await GetApps();
    Navigation.NavigateTo(formatCurrentUrl(), false);
}
```

