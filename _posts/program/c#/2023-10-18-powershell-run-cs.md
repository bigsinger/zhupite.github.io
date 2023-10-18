---
layout:		post
category:	"program"
title:		"PowerShell执行csharp代码"

tags:		[c#,PowerShell,net]
---
- Content
{:toc}


# PowerShell语法及常用命令

```powershell
#		# 单行注释
<# #>	# 多行注释	 
;		# 行分隔符
Write-Host				# 在控制台写
Write-Output  (write)	 # 在控制台写
Get-Command				# 得到所有PowerShell命令
Get-Alias				# 获取当前会话的别名
Get-Location			# 获取当前工作目录
Set-Location			# 设置当前工作目录
```

`PowerShell` 默认会加载`System.dll`

# PowerShell执行C#代码

模板：

```powershell
$Assemblies = ( <# 要加入引用 #> )

# 直接内嵌代码
$CSharpCode = @"C#代码"@

# 或者从文件里读取代码
$CurrentLocation = Get-Location
$CSharpCode = Get-Content -Path ".\test.cs"

Add-Type -ReferencedAssemblies $Assemblies -TypeDefinition $CSharpCode -Language CSharp

# 上述执行后，调用C#函数的方法
[Namespace.ClassName]::MethodName()
```

直接执行内嵌代码的示例：

```powershell
$Assemblies = (
    "System, Version=2.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089, processorArchitecture=MSIL",
    "System.Linq, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a, processorArchitecture=MSIL"
)
$CSharpCode = @"
using System;
using System.Linq;

namespace PSLib {
    public static class HelloWorld {
        public static void Say(string name) {
            Console.Write("Hello World, " + name);
        }

        public static void LinqRange(int max) {
            var squares = Enumerable.Range(1, max).Select(i => i * i);
            foreach (var num in squares) {
                Console.Write(num + "\t");
            }
        }
    }
}
"@
Add-Type -ReferencedAssemblies $Assemblies -TypeDefinition $CSharpCode -Language CSharp



# 可執行命令
[PSLib.HelloWorld]::Say()
[PSLib.HelloWorld]::LinqRange(600)
```



从文件读取代码并执行的示例，例如有代码文件`test.cs`：

```csharp
using System;

public class Calculator {
    public static int Add(int a, int b) {
		Console.Write("Add ");
        return a + b;
    }

    public int Multiply(int a, int b) {
        return a * b;
    }
}
```

`PowerShell`执行方式：

```powershell
$CurrentLocation = Get-Location
$source = Get-Content -Path ".\test.cs"
Add-Type -TypeDefinition "$source"

# Call a static method
[Calculator]::Add(4, 3)

# Create an instance and call an instance method
$calculatorObject = New-Object Calculator
$calculatorObject.Multiply(5, 2)
```

# PowerShell执行DLL库

编写DLL库，通过`VisualStudio`创建一个类库项目，添加代码：

```c#
using System;
using System.Linq;

namespace PSLib {
    public static class HelloWorld {
        public static void Say(string name) {
            Console.Write("Hello World, " + name);
        }

        public static void LinqRange(int max) {
            var squares = Enumerable.Range(1, max).Select(i => i * i);
            foreach (var num in squares) {
                Console.Write(num + "\t");
            }
        }
    }
}
```

`PowerShell` 加载DLL库：

```powershell
$CurrentLocation = Get-Location
$PSLib = "$CurrentLocation\PSLib.dll"
$Dlls = (
    $PSLib
)
Add-Type -LiteralPath $Dlls
```

`PowerShell` 默认会加载`System.dll`，也可以使用`Reflection`引用的方式来加载 DLL：

```powershell
$CurrentLocation = Get-Location
$PSLib = "$CurrentLocation\PSLib.dll"

# 載入指定檔案路徑的 DLL 檔
[Reflection.Assembly]::LoadFile($PSLib)
```

然后就可以调用其中的函数了：

```powershell
# 可執行命令
[PSLib.HelloWorld]::Say("Poy Chang")
[PSLib.HelloWorld]::LinqRange(10)
```



# 参考

- [在 PowerShell 程序中执行 C# 代码或 DLL 文件的方法](https://blog.poychang.net/using-csharp-code-in-powershell-scripts/)
- [How to Run C# Code from PowerShell](https://www.byteinthesky.com/powershell/how-to-run-c-sharp-code-from-powershell/)
