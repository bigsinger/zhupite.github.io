---
layout:		post
category:	"program"
title:		"C#Web开发之blazor前后端分离及API接口编写汇总"

tags:		[c#,blazor,net]
---
- Content
{:toc}
# 解决方案里的项目结构

| 项目     | 说明                                                         | 所需三方库                                                   |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| APIs     | 作为访问数据库的服务和提供WebApi的项目，其实可以再拆分，把访问数据库的服务拆出来。 | Microsoft.EntityFrameworkCore.Design Microsoft.EntityFrameworkCore.Tools Pomelo.EntityFrameworkCore.MySql Newtonsoft.Json Microsoft.Extensions.Configuration.Abstractions System.Linq.Dynamic.Core |
| Client   | 前端                                                         |                                                              |
| Shared   | 前端  （其实 Client 和 Shared 可以合并为一个，因为是模板自动生成，姑且这样） | BootstrapBlazor                                              |
| Server   | 后端                                                         | Microsoft.EntityFrameworkCore.Design Microsoft.EntityFrameworkCore.Tools Pomelo.EntityFrameworkCore.MySql Newtonsoft.Json  Swashbuckle.AspNetCore   System.Linq.Dynamic.Core |
| Entities | 前后端共用的一些结构体                                       | Microsoft.Extensions.Configuration.Abstractions              |
| Util     | 前后端共用的类封装。                                         | 根据实际需要                                                 |



引用关系：

1. **Client**：引用 Shared、Entities、Util
2. **Shared**：引用 Entities、Util
3. **Server**：引用 APIs、Entities、Util



如果全程是一个人开发全部项目添加到同一个解决方案里即可，如果是前后端不同人员开发，则按照下面方式：

1. 前端开发负责：Client、Shared、Entities、Util
2. 后端开发负责：Server、APIs、Entities、Util
3. 公共部分：Entities、Util，除此之外的项目应该按照权限隔离开来。





# 接口编写步骤



1. 先写Model

2. 再写服务端的service（使用`DbContext`）

3. 再写controller

4. 使用 `swagger` 测试

   1. 添加三方库：`Swashbuckle.AspNetCore`

   2. 添加初始化代码：

      ```csharp
      if(env.IsDevelopment()) {
          app.UseSwagger();
          app.UseSwaggerUI();
      }
      
      builder.Services.AddSwaggerGen();
      ```

   3. 服务运行后访问：https://localhost:7155/swagger/index.html

5. 客户端的service（使用http发送请求）

## 

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



