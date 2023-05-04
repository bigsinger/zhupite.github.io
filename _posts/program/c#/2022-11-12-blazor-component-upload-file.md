---
layout:		post
category:	"program"
title:		"C#Blazor UI组件文件上传"

tags:		[c#,blazor,net]
---
- Content
{:toc}
实现效果：选择文件实现上传文件功能。



借助三方开源组件来实现：[Bootstrap Blazor](https://www.blazor.zone/uploads)

```xml
<ButtonUpload BrowserButtonText="上传APP" TValue="string" IsMultiple="true" ShowProgress="true" OnChange="@OnClickToUpload" OnDelete="@(fileName => Task.FromResult(true))"/>
```

```c#
private CancellationTokenSource? ReadToken { get; set; }

private async Task OnClickToUpload(UploadFile file) {
    await SaveToFile(file);
}

private async Task<bool> SaveToFile(UploadFile file) {
    // Server Side 使用
    // Web Assembly 模式下必须使用 webapi 方式去保存文件到服务器或者数据库中
    // 生成写入文件名称
    var ret = false;

    var fileName = DateTime.Now.ToString("yyyyMMddhhmmssfff") + Path.GetExtension(file.OriginFileName);
    var filePath = Path.Combine(Settings.saveAppFullPath, fileName);   //Path.GetFileNameWithoutExtension(file.OriginFileName) {DateTimeOffset.Now:yyyyMMddHHmmss}
    var dbPath = Path.Combine(Settings.saveAppRelvPath, fileName);

    ReadToken ??= new CancellationTokenSource();
    ret = await file.SaveToFile(filePath, Settings.UploadFileMaxSize, ReadToken.Token);
    if (ret) {
		// 保存成功
    } else {
        var errorMessage = $"{Localizer["SaveFileError"]} {file.OriginFileName}";
        file.Code = 1;
        file.Error = errorMessage;
        await ToastService.Error(Localizer["UploadFile"], errorMessage);
    }

    return ret;
}
```

