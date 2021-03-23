---

layout:		post
category:	"program"
title:		"net core里使用托盘图标通知"
tags:		[c#,wpf,net]
---
- Content
{:toc}


# 方法一：使用System.Windows.Forms.NotifyIcon（不推荐）

强烈不推荐，使用该方案需要引入System.Windows.Forms，这个是与.net core 5有冲突的，项目切换到.net core 5直接启动不了。而且引入System.Windows.Forms之后App的内存占用也会很高。这里仅仅介绍下思路。

System.Windows.Forms在NuGet管理器中找不到，需要用下面方法安装：

菜单「工具」-NuGet包管理器-控制台，输入：

```
Install-Package System.Windows.Forms -Version 4.0.0
```

  参考代码： 

```c#
#region 托盘通知图标相关
    private System.Windows.Forms.NotifyIcon notifyIcon;
    private void InitTrayIcon() {
    this.notifyIcon = new System.Windows.Forms.NotifyIcon();
    this.notifyIcon.Text = Const.APP_NAME + Const.APP_VER;

    //new BitmapImage(new Uri(@"/smartrun;component/res/smartrun.ico", UriKind.Relative));
    Stream iconStream = Application.GetResourceStream(new Uri(@"/smartrun;component/res/smartrun.ico", UriKind.Relative)).Stream;
    this.notifyIcon.Icon = new System.Drawing.Icon(iconStream);
    this.notifyIcon.Visible = true;
    this.notifyIcon.MouseClick += new System.Windows.Forms.MouseEventHandler((o, e) => {
        if (e.Button == System.Windows.Forms.MouseButtons.Left) {
            this.show();
        } else if (e.Button == System.Windows.Forms.MouseButtons.Right) {
            ContextMenu menu = this.FindResource("trayMenu") as ContextMenu;
            if (menu != null) {
                menu.IsOpen = true;
            }
        }
    });
}

private void trayMenuItemShow_Click(object sender, RoutedEventArgs e) {
    this.show();
}

private void trayMenuItemExit_Click(object sender, RoutedEventArgs e) {
    this.Exit();
}

// App退出时销毁托盘图标
public void Exit() { 
    this.notifyIcon.Dispose();
    System.Environment.Exit(0);
}
#endregion
```

xaml：

```xaml
<Window.Resources>
    <ContextMenu x:Key="trayMenu">
        <MenuItem x:Name="trayMenuItemShow" Header="显示" Click="trayMenuItemShow_Click"/>
        <Separator/>
        <MenuItem x:Name="trayMenuItemExit" Header="退出" Click="trayMenuItemExit_Click"/>
    </ContextMenu>
</Window.Resources>
```



# 方法二：使用三方库（推荐）

推荐使用：[GitHub - hardcodet/wpf-notifyicon: NotifyIcon (aka system tray icon or taskbar icon) for the WPF platform](https://github.com/hardcodet/wpf-notifyicon)，兼容net core5，教程参考腾讯云的这篇文章，写的很详细：[WPF 托盘显示 NotifyIcon WPF - 云+社区 - 腾讯云](https://cloud.tencent.com/developer/article/1402638)

NuGet搜索安装：Hardcodet.NotifyIcon.Wpf.NetCore

