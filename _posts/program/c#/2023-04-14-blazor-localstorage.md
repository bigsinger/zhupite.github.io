---
layout:		post
category:	"program"
title:		"C#之Blazor本地数据存储"

tags:		[c#,blazor,net]
---
- Content
{:toc}
使用 `Blazor` 的本地存储库 [Blazored.LocalStorage](https://github.com/Blazored/LocalStorage) 来简化本地存储相关的操作，可以在 `Blazor Server` 和 `Blazor WebAssembly` 项目中使用。这个库在 `Blazor` 的生命周期方法中处理 `JavaScript Interop` 调用，使得代码更简洁，易于维护。



首先，安装 `Blazored.LocalStorage` NuGet 包：

```c#
dotnet add package Blazored.LocalStorage
```



接下来，在 Startup.cs（或 Program.cs，如果您使用的是 .NET 6）中添加以下代码：

```c#
using Blazored.LocalStorage;

// ...

services.AddBlazoredLocalStorage();
```

现在，您可以在组件中注入 `ILocalStorageService` 并使用它来保存和获取本地存储数据：

```c#
@using Blazored.LocalStorage
@inject ILocalStorageService LocalStorage


//JavaScript interop 交互调用只能在 OnAfterRenderAsync 生命周期方法中执行
protected override async Task OnAfterRenderAsync(bool firstRender) {
    if (firstRender) {
        _firstRender = false;
        await loadConfig();
        updateData();
    }
}

private async Task onQueryBtnClick(MouseEventArgs e) {
    // ...
    await saveConfig();
}

private async Task saveConfig() {
    // 将配置保存到本地存储中
    await LocalStorage.SetItemAsStringAsync("UserSettings", Settings.Serialize());
}

private async Task loadConfig() {
    // 从本地存储中读取配置
    string settingsJson = await LocalStorage.GetItemAsStringAsync("UserSettings");
    Settings.Deserialize(settingsJson);
}
```

这样就不再需要 `SetLocalStorageItemAsync` 方法，因为 `Blazored.LocalStorage` 库已经为您处理了所有与 `JavaScript` 相关的调用。这样的代码更简洁，易于维护。
