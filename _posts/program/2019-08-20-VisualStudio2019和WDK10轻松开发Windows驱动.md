---
layout:		post
category:	"program"
title:		"VisualStudio2019和WDK10轻松开发Windows驱动"
tags:		[VisualStudio,driver]
---
- Content
{:toc}


## 下载
### VisualStudio2019
https://visualstudio.microsoft.com/zh-hans/vs/

如果已经安装过VS2019，则可以重新修改安装SDK10。

安装或修改安装的时候，选择**“单个组件”**一页，向下滚动找出全部带有**“Spectre缓存措施的xxx x86和x64”**,全部勾上。否则在后面编译的时候会出现错误：
```
error MSB8040: Spectre-mitigated libraries are required for this project.
```

### WDK
https://docs.microsoft.com/zh-cn/windows-hardware/drivers/download-the-wdk

安装时一路默认，最后勾选为VisualStudio安装扩展开发插件，这样VS2019启动后会有扩展插件可以直接使用，在VS2019菜单：扩展-driver里。

## VS2019创建驱动项目
- 打开VS2019，新建项目，搜索**KMDF**，选择**“Kernel Mode Driver, Empty(KMDF)”**的空项目。
- 修改项目属性。**Driver Settings** - **General** - **Target OS Version** 如果需要选择**Windows7/Windows8/Windows8.1**，则下面的**Target Platform**需要选择**Desktop**，如果是**Windows 10 or higher**则**Desktop**和**Universal**都可以选择。
- 在项目的Source Files下新建一个.c文件：main.c，内容如下：

```c
#include <ntddk.h>
#include <wdf.h>
DRIVER_INITIALIZE DriverEntry;
EVT_WDF_DRIVER_DEVICE_ADD KmdfHelloWorldEvtDeviceAdd;

NTSTATUS
DriverEntry(
	_In_ PDRIVER_OBJECT     DriverObject,
	_In_ PUNICODE_STRING    RegistryPath
) {
	// NTSTATUS variable to record success or failure
	NTSTATUS status = STATUS_SUCCESS;

	// Allocate the driver configuration object
	WDF_DRIVER_CONFIG config;

	// Print "Hello World" for DriverEntry
	KdPrintEx((DPFLTR_IHVDRIVER_ID, DPFLTR_INFO_LEVEL, "KmdfHelloWorld: DriverEntry\n"));

	// Initialize the driver configuration object to register the
	// entry point for the EvtDeviceAdd callback, KmdfHelloWorldEvtDeviceAdd
	WDF_DRIVER_CONFIG_INIT(&config,
		KmdfHelloWorldEvtDeviceAdd
	);

	// Finally, create the driver object
	status = WdfDriverCreate(DriverObject,
		RegistryPath,
		WDF_NO_OBJECT_ATTRIBUTES,
		&config,
		WDF_NO_HANDLE
	);
	return status;
}

NTSTATUS
KmdfHelloWorldEvtDeviceAdd(
	_In_    WDFDRIVER       Driver,
	_Inout_ PWDFDEVICE_INIT DeviceInit
) {
	// We're not using the driver object,
	// so we need to mark it as unreferenced
	UNREFERENCED_PARAMETER(Driver);

	NTSTATUS status;

	// Allocate the device object
	WDFDEVICE hDevice;

	// Print "Hello World"
	KdPrintEx((DPFLTR_IHVDRIVER_ID, DPFLTR_INFO_LEVEL, "KmdfHelloWorld: KmdfHelloWorldEvtDeviceAdd\n"));

	// Create the device object
	status = WdfDeviceCreate(&DeviceInit,
		WDF_NO_OBJECT_ATTRIBUTES,
		&hDevice
	);
	return status;
}
```

## 驱动调试
### Dbgview捕获kernel日志
- 新建一个.reg文件，内容如下：

```
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Debug Print Filter] 
"DEFAULT"=dword:0000000f
```

双击导入。
- **Dbgview**以管理员身份运行，勾选菜单**Capture** - **Capture Kernel**和**Enable VerBose Kernel Output**
- 关闭驱动签名验证（否则在驱动加载时系统会弹框：Windows要求已数字签名的驱动程序）。管理员身份运行CMD，输入：**bcdedit/set testsigning on**
- 重启生效，系统左下角会出现**“测试模式”**的水印，说明生效，可以对系统做个快照方便下次继续使用。
- 下载**InstDrv**驱动加载工具，以管理员身份运行，选择对应的sys驱动文件，安装、启动。
- Dbgview中会看到日志输出：KmdfHelloWorld: DriverEntry

## 驱动加载工具
- [驱动加载工具 V1.3版](https://download.csdn.net/download/ozuoyuan454654654/10568086)
- [驱动加载工具](https://download.csdn.net/download/qq_34658324/10126679)

## 参考
- https://docs.microsoft.com/en-us/windows-hardware/drivers/download-the-wdk
- [Windows-driver-samples](https://github.com/microsoft/Windows-driver-samples)
- [Windows7驱动调试小Tips](https://blog.csdn.net/magictong/article/details/38277081#comments)
- [64位win7禁用驱动程序签名强制 几种常用方法](https://blog.csdn.net/fanxianshi/article/details/9104843)