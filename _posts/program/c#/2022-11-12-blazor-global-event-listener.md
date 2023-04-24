---
layout:		post
category:	"program"
title:		"C#之Blazor之全局事件监听处理"

tags:		[c#,blazor,net]
---
- Content
{:toc}
有一个这样的场景，`MainLayout.razor`里面设计了一个全局的公共的页头，里面布局了一些控件提供用户做一些交互，当然还有一个查询按钮，希望在按钮点击的时候当前正在显示的页面能够做一些响应处理。



实现步骤：

1. 新建一个`GlobalEventService`：

```c#
public class GlobalEventService {
    public event EventHandler? QueryBtnClicked;
    public event EventHandler? DataTableChanged;

    public void OnQueryBtnClicked() {
        QueryBtnClicked?.Invoke(this, EventArgs.Empty);
    }

    public void OnDataTableChanged() {
        DataTableChanged?.Invoke(this, EventArgs.Empty);
    }
}
```

2. 在`Program.cs`中注册

```c#
builder.Services.AddSingleton<GlobalEventService>();
```

3. 在`MainLayout.razor`里面注入并使用

```c#
// .razor文件里使用
@inject GlobalEventService GlobalEventService

// 按钮点击事件
private async Task onQueryBtnClick(MouseEventArgs e) {
	// ……
	GlobalEventService.OnQueryBtnClicked();
}
```

4. 在需要响应事件的`razor`页面里注入并使用

```c#
// .razor文件里使用
@inject GlobalEventService GlobalEventService


// .razor.cs文件里使用
[Inject]
protected GlobalEventService GlobalEventService { get; set; }


protected override async Task OnInitializedAsync() {
    GlobalEventService.QueryBtnClicked += OnQueryBtnClicked;
    await base.OnInitializedAsync();
}

protected async void OnQueryBtnClicked(object? sender, EventArgs e) {
    // do something
}

public void Dispose() {
    GlobalEventService.QueryBtnClicked -= OnQueryBtnClicked;
}
```

