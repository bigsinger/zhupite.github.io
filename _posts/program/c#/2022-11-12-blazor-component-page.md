---
layout:		post
category:	"program"
title:		"C#Blazor UI组件多页面翻页"

tags:		[c#,blazor,net]
---
- Content
{:toc}
实现效果：[列表数据多页面翻页](https://zhupite.com/program/blazor-study.html#%E7%BF%BB%E9%A1%B5)。

`Pagination.razor`：

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

`Pagination.razor.cs`：

```c#
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



`MetaData.cs`：

```c#
namespace Entities.RequestFeatures {
	public class MetaData {
		public int CurrentPage { get; set; }
		public int TotalPages { get; set; }
		public int PageSize { get; set; }
		public int TotalCount { get; set; }

		public bool HasPrevious => CurrentPage > 1;
		public bool HasNext => CurrentPage < TotalPages;
	}
}
```



使用时：

```xml
<BlazorDemo.Components.Pagination MetaData="@MetaData" Spread="2" SelectedPage="SelectedPage" />
```

```c#
public MetaData MetaData { get; set; } = new MetaData();


private async Task SelectedPage(int page) {
    _appParam.PageNumber = page;
    await GetApps();
}
```

