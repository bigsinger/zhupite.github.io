---
layout:		post
category:	"program"
title:		"C#Blazor UI组件多页面翻页"

tags:		[c#,blazor,net]
---
- Content
{:toc}


# 翻页方案1

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
public MetaData MetaData { get; set; } = new MetaData();

private async Task SelectedPage(int page) {
    _appParam.PageNumber = page;
    await GetApps();
}
```



# 翻页方案2

`Pagination.razor`：

```xml
@if (TotalPages > 1) {
    <nav class="mt-4" aria-label="Page navigation sample">
        <ul class="pagination">
            @foreach (var link in links) {
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



`Pagination.razor.cs`：

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
<Pagination Page="@searchResponse.Page" TotalPages="@searchResponse.TotalPages" Radius="2" SelectedPage="SelectedPage" />
```

```cs
private async Task SelectedPage(int page) {
    this.Page = page;
    await this.LoadData(withCategories: false);
}
```



# 翻页方案3 使用三方框架

如使用 [BootstrapBlazor表格的分页功能](https://www.blazor.zone/tables/pages) 
