---
layout: post
title: "TortoiseSVN 文件红标不显示、父文件夹不标红解决记录"
categories: [tool]
description: "TortoiseSVN 修改文件红标不显示、父文件夹不标红的问题解决方法。通过调整 Icon Overlays 设置和重启资源管理器恢复状态图标。"
tags: [TortoiseSVN, SVN, 版本控制, 故障解决]
---

## 问题背景

1. TortoiseSVN 已是最新版，无修改文件绿色对勾正常显示
2. 修改后的文件不出现红色修改图标
3. 临时切换设置恢复文件红标后，包含修改文件的上级文件夹不会同步显示红色标识，无法直观看出目录内存在改动

## 实际操作步骤

1. 右键文件夹 → TortoiseSVN → Settings → Icon Overlays
2. Status cache 切换为 `Shell`，点击 Apply 应用
3. 打开任务管理器，重启 Windows 资源管理器
4. 重新进入 Icon Overlays，将 Status cache 切回 `Default`
5. 勾选 `Fixed drives`、`Unversioned files mark parent folder as modified`，点击 Apply → OK
6. 再次重启 Windows 资源管理器
7. （可选优化）在 Exclude paths 添加目录减少扫描负载

```
*\node_modules
*\dist
*\bin
*\obj
*\build
*\\.git
```

## 最终效果

修改文件显示红色图标，所有包含改动文件的上级文件夹自动标红，未修改文件/文件夹正常显示绿色对勾。

## 安装网盘软件后又失效的解决方案
打开注册表，进入：
```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\ShellIconOverlayIdentifiers
```
可以在`Tortoise`的那些项前面加空格，让它们尽量排到前面，把仍然排在前面的其他软件的项给它加上其他字符前缀让它们往后面排，甚至直接删除。
然后重启资源管理器。