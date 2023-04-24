---
layout:		post
category:	"program"
title:		"在Windows上使用VisualStudio配合WSL进行Linux程序开发"

tags:		[c++]
---
- Content
{:toc}
先说结论：爽歪歪。



# GPT

在Windows上使用WSL (Windows Subsystem for Linux) 进行Linux编程和动态调试，可以让你在同一台机器上享受Windows和Linux的优势。以下是在Windows上使用Visual Studio和WSL进行Linux编程和动态调试的步骤：

1. 安装WSL： 在Windows 10上，打开PowerShell，然后以管理员身份运行以下命令：

   ```bash
   wsl --install
   ```

   安装完成后，重启计算机。你也可以在微软商店中手动下载并安装你喜欢的Linux发行版。

2. 更新Linux发行版： 启动你的Linux发行版，然后运行以下命令来更新包列表和已安装的包：

   ```bash
   sudo apt update
   sudo apt upgrade
   ```

3. 安装编译和调试工具： 在Linux发行版中，运行以下命令来安装必要的编译和调试工具，如`build-essential`和`gdb`：

   ```bash
   sudo apt install build-essential gdb
   ```

4. 安装Visual Studio和相关组件： 安装最新版的Visual Studio，确保在安装过程中选择“使用C++的Linux开发”组件。这将安装用于Linux开发的C++扩展和其他必要组件。

5. 配置Visual Studio的WSL连接： 打开Visual Studio，然后转到“工具”>“选项”>“跨平台”>“连接管理器”。单击“添加”按钮，输入WSL的IP地址（通常为localhost或127.0.0.1），并设置端口为默认的22。输入Linux发行版的用户名和密码，然后单击“连接”。

6. 创建一个新的Linux项目： 转到“文件”>“新建”>“项目”。在项目模板中选择“Linux”，然后选择一个合适的模板，例如“Linux 控制台应用程序”。点击“下一步”，为项目指定一个名称和位置，然后点击“创建”。

7. 配置项目属性： 在解决方案资源管理器中右键单击项目，然后选择“属性”。转到“常规”选项卡，确保“目标平台”设置为“WSL”。

8. 编写代码： 在项目中编写代码，然后保存更改。

9. 构建和调试项目： 点击工具栏上的“启动调试”（绿色的三角形按钮）或按下F5，Visual Studio将自动编译项目并在WSL环境中启动调试会话。你可以像在本地Windows项目中一样设置断点、单步执行、检查变量等。

现在，你已经成功设置了在Windows上使用Visual Studio和WSL进行Linux编程和动态调试的环境。祝你编程愉快！



# 实际

- VisualStudio2022新建工程，平台选择：Linux，开发语言选择：C++，然后选择一个控制台的项目，直接创建即可。

- 修改工程的配置属性 - 常规 - `平台工具集`，修改为下面中的一个：

  ```bash
  # WSL系统默认有GCC编译工具链
  WSL2 GCC Toolset
  GCC for Windows Subsystem for Linux
  
  # 选择Clang模式，前提要在WSL系统里安装Clang编译工具链
  WSL2 Clang Toolset
  Clang for Windows Subsystem for Linux
  ```

  如需安装clang编译工具链，可以参考：[Linux - Ubuntu的常用命令收集汇总方便查询](https://zhupite.com/soft/linux-ubuntu.html)

  ```bash
  sudo apt update
  sudo apt install clang
  
  # 查看是否安装成功以及clang版本
  clang --version
  ```

  

- WSL distro名称，选择：`在此计算机上使用默认 WSL 分发。`



这样配置后就不用设置什么远程Linux机器的IP和端口了，直接就本地运行和调试，跟在Windows上开发体验几乎是一样的。



# 参考

- [Linux - Ubuntu的常用命令收集汇总方便查询](https://zhupite.com/soft/linux-ubuntu.html)

  