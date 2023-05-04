---
layout:		post
category:	"program"
title:		"C#Blazor初始化时读取配置"

tags:		[c#,blazor,net]
---
- Content
{:toc}
在`Program.cs`里调用：

```c#
var builder = WebApplication.CreateBuilder(args);

// 添加这句
Settings.initEnv(builder.Configuration);

builder.Services.AddRazorPages();
```



```c#
public static void initEnv(IConfiguration config) {
    // 解析工具路径
    ApkInfoTool = config["xxTool"];
    if (!File.Exists(xxTool)) { throw new Exception("file not found: " + xxTool); }


    // api接口服务器配置
    apiServerIp = config["apiServerIp"];
    apiServerPort = Convert.ToInt32(config["apiServerPort"]);

    // 文件服务器配置
    saveFileServerIp = config["saveFileServerIp"];
    saveFileServerPort = Convert.ToInt32(config["saveFileServerPort"]);

    saveFileRootDir = config["saveFileRootDir"];
    saveAppRelvPath = config["saveAppRelvPath"];
    saveImgRelvPath = config["saveImgRelvPath"];

    if (!Directory.Exists(saveFileRootDir)) { throw new Exception("dir not found: " + saveFileRootDir); }

    saveAppFullPath = Path.Combine(saveFileRootDir, saveAppRelvPath);
    saveImgFullPath = Path.Combine(saveFileRootDir, saveImgRelvPath);
    Directory.CreateDirectory(saveAppFullPath);
    Directory.CreateDirectory(saveImgFullPath);
}
```

