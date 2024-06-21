---
layout:		post
category:	"program"
title:		"Windows下全命令便捷安装NPM nodejs"

tags:		[gradle]
---
- Content
{:toc}


# 参考

- [Node.js — Download Node.js®](https://nodejs.org/en/download/package-manager)
- [fnm的下载与配置，进行node的下载](https://blog.csdn.net/2301_76830573/article/details/139537294)



# 步骤

- 管理员身份打开`PowerShell`。
- 执行命令：

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

- 安装`fnm` ： `choco install fnm`
- `fnm env --use-on-cd | Out-String | Invoke-Expression`
- 安装`npm`， 参考[官网](https://nodejs.org/en/download/package-manager)的命令：`fnm use --install-if-missing 20`
- 更新：`npm install -g npm`

