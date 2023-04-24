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





在实际使用中可以定义一个用来存储用户配置信息的类方便操作，例如上面用到的`Settings`就是。

```c#
public class Settings {
    public string Serialize() {
        return JsonSerializer.Serialize(this);
    }

    public bool Deserialize(string settingsJson) {
        bool result = false;
        try {
            if (!string.IsNullOrEmpty(settingsJson)) {
                var s = JsonSerializer.Deserialize<Settings>(settingsJson) ?? new();
                this.columnIndexDate = s.columnIndexDate;
                this.columnIndexValue = s.columnIndexValue;
                this.dim1ColumnIndex = s.dim1ColumnIndex;
                this.dim1Classifies = s.dim1Classifies;
                this.dimXColumnIndex = s.dimXColumnIndex;
                this.startDateTime = s.startDateTime;
                this.endDateTime = s.endDateTime;
                this.statisticsTimeUnit = s.statisticsTimeUnit;
                result = true;
            }
        } catch (Exception) {
            result = false;
        }
        return result;
    }

    // 维度1的列索引及维度1选择的子分类名称
    public int dim1ColumnIndex { get; set; } = -1;
    public List<string> dim1Classifies { get; set; } = new();

    // 待分析的数据表的列索引
    public int dimXColumnIndex { get; set; } = -1;


    // 哪一列是时间
    public int columnIndexDate { get; set; } = -1;

    // 哪一列是数值
    public int columnIndexValue { get; set; } = -1;


    // 查询时间范围
    public DateOnly startDateTime { get; set; }
    public DateOnly endDateTime { get; set; }

    // 统计周期：默认按月
    public string statisticsTimeUnit { get; set; } = Constant.periodNameOfQuarter;

    // 如果日期都没设置过，则默认设置为最近一年的
    public void setDateTimeRange(DateTime time1, DateTime time2) {
        if (time1 == DateTime.MinValue) {
            startDateTime = DateOnly.FromDateTime(DateTime.Now).AddYears(-1);
        } else {
            startDateTime = DateOnly.FromDateTime(time1);
        }

        if (time2 == DateTime.MinValue) {
            endDateTime = DateOnly.FromDateTime(DateTime.Now);
        } else {
            endDateTime = DateOnly.FromDateTime(time2);
        }
    }
}
```



在`Program.cs`中注册：

```c#
// 注意这里用的是AddScoped，以保证区分每个用户的配置，而不能用AddSingleton。
builder.Services.AddScoped<Settings>();
```



然后使用注入的方式来使用`Settings`：

```c#
// .razor文件里使用
@inject Settings settings


// .razor.cs文件里使用
[Inject]
protected Settings settings { get; set; }


// 代码中就可以直接用 settings.xxx 这样访问或设置配置了，非常方便
```

