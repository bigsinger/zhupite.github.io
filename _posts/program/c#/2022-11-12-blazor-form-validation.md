---
layout:		post
category:	"program"
title:		"C#Blazor表单验证摘要验证消息"

tags:		[c#,blazor,net]
---
- Content
{:toc}
- 实现效果：对表单内容自动检查合法性。
- 关键词：`EditForm`、 `DataAnnotationsValidator`、 `ValidationMessage` 、`ValidationSummary`
- 验证摘要使用：`ValidationSummary`
- 验证消息使用：`ValidationMessage` 
- 一般来说推荐使用验证消息。



对`Model`的属性增加一些注解用以进行合法性验证：

```c#
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models {

    public class AppInfo {
        //[Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        // App名称

        //[Required(ErrorMessage = "Name is required field")]
        [StringLength(maximumLength: 64)]
        public string Name { get; set; }

        // 包名

        //[Required(ErrorMessage = "Package is required field")]
        [StringLength(maximumLength: 100, MinimumLength = 3)]
        public string Package { get; set; }

        // 图标
        public string Icon { get; set; }

        // 版本号
        [StringLength(maximumLength: 32)]
        public string VersionName { get; set; }

        [StringLength(maximumLength: 32)]
        public string VersionCode { get; set; }

        // 壳特征名称
        [StringLength(maximumLength: 32)]
        public string ShellName { get; set; } = "null";

        // 标签
        [StringLength(maximumLength: 64)]
        public string Tags { get; set; }

        // 备注
        [StringLength(maximumLength: 128)]
        public string Memo { get; set; }


        // 操作人员
        [StringLength(maximumLength: 32)]
        public string Operator { get; set; }


        // 数据库存储路径（相对路径）
        public string dbPath { get; set; }

        public string Url { get; set; }

        public DateTime CreationDate { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public DateTime ModifiedDate { get; set; }

        public string Md5 { get; set; }

        public long FileSize { get; set; }
    }
}
```



又如：

```c#
public class UserRegister {
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
    [Required, StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;
    [Compare("Password", ErrorMessage = "The passwords do not match.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
```



使用`EditForm` 和 `<ValidationMessage For="@(() => _app.Name)" />`可以在提交表单时自动进行合法性验证并做提示。

```xml
@page "/createApp"

<h2>Create App Form</h2>

<EditForm Model="_app" OnValidSubmit="Create" class="card card-body bg-light mt-5">
    <DataAnnotationsValidator />
    <div class="form-group row">
        <label for="name" class="col-md-2 col-form-label">Name:</label>
        <div class="col-md-10">
            <InputText id="name" class="form-control" @bind-Value="_app.Name" />
            <ValidationMessage For="@(() => _app.Name)" />
        </div>
    </div>

    <div class="form-group row">
        <label for="package" class="col-md-2 col-form-label">Package:</label>
        <div class="col-md-10">
            <InputText id="package" class="form-control" @bind-Value="_app.Package" />
            <ValidationMessage For="@(() => _app.Package)" />
        </div>
    </div>

    <div class="form-group row">
        <label for="shellName" class="col-md-2 col-form-label">ShellName:</label>
        <div class="col-md-10">
            <InputText id="shellName" class="form-control" @bind-Value="_app.ShellName" />
            <ValidationMessage For="@(() => _app.ShellName)" />
        </div>
    </div>

    <div class="form-group row">
        <label for="image" class="col-md-2 col-form-label">Image:</label>
        <div class="col-md-10">
            <BlazorDemo.Components.UploadFile2 OnChange="AssignImageUrl" />
        </div>
    </div>

    <div class="row">
        <div class="col-md-12 text-right">
            <button type="submit" class="btn btn-success">Create</button>
        </div>
    </div>
</EditForm>
<SuccessNotification @ref="_notification"/>
```

