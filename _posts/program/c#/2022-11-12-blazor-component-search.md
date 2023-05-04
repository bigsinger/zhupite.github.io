---
layout:		post
category:	"program"
title:		"C#Blazor UI组件文本框实时搜索"

tags:		[c#,blazor,net]
---
- Content
{:toc}
实现效果：文本框中输入文本实时搜索。

适用场景：用户较少数据量不大的情况，否则建议在点击「查询」后再执行搜索以节省资源。



`Search.razor`：

```xml
<section style="margin-bottom: 10px">
    <input type="text" class="form-control" placeholder="@Placeholder"
           @bind="@SearchText" @bind:event="oninput" @onkeyup="OnKeyup" />
</section>
```

`Search.razor.cs`：

```c#
using Microsoft.AspNetCore.Components;

namespace BlazorDemo.Components {
    public partial class Search {
        private Timer _timer = default!;

        private string _text = string.Empty;
        [Parameter]
        public string SearchText {
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
```

```c#
private async Task OnSearch(string searchText) {
    _appParam.PageNumber = 1;
    await GetApps();
    Navigation.NavigateTo(formatCurrentUrl(), false);
}
```

