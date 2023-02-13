---
layout:		post
category:	"web"
title:		"WordPress常用操作参考"
tags:		[web,blog]
---



**切换主题或者升级主题每次必搞**：

- 统计代码
- 百度联盟广告
- 谷歌广告代码Google AdSense



# 常用设置

## 统计代码

**FTP方式修改代码**：

- `wordpress` 中`footer.php`在你的主题文件夹里，也就是  `/wp-content/themes/`主题文件夹名。首先修改该文件为可读写，直接编辑好后更新上去。
- 进入WP控制后台，找到：`外观-编辑-主题页脚(footer.php)`，在代码的`</body>`上面粘贴如下代码，最后点`更新文件`即可。

```js
<script>
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?xxxxxxxxxxxxxxxxxxx";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
</script>
```

- [百度统计](http://tongji.baidu.com/hm-web/welcome/login)
- [谷歌分析](https://analytics.google.com/analytics/web)



## 广告联盟

### 百度联盟广告代码

找到`外观-编辑-主题页眉（header.php）`，在代码最后添加代码，如：
```js
<script type="text/javascript">
    /*嵌入文字无图*/
    var cpro_id = "u3060421";
</script>
<script type="text/javascript" src="http://cpro.baidustatic.com/cpro/ui/c.js"></script>


<script type="text/javascript">
    /*悬浮*/
    var cpro_id = "u3060440";
</script>
<script type="text/javascript" src="http://cpro.baidustatic.com/cpro/ui/c.js"></script>

```
可以叠加使用。

### 添加谷歌广告代码Google AdSense

找到外观-编辑-主题页眉（header.php），在</ head>前面插入谷歌广告代码，例如：

```js
<?php wp_head(); ?>

<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({
    google_ad_client: "ca-pub-xxxxxxxxxx",
    enable_page_level_ads: true
  });
</script>

</head>
```




## WordPress博客升级
http://www.xxxxxx.com/wp-admin/upgrade.php

## 主题升级
- 主题升级，可以直接下载主题包，解压缩后传到ftp对应的目录下。
- 如果主题设置失败导致网站打不开，可以在FTP后台找到`/wp-content/themes`目录下的主题删除，这个时候再访问网站会显示找不到主题，此时后台管理就可以进去了，重新设置主题即可。

## 备份
- [WordPress如何备份\_百度经验](http://jingyan.baidu.com/article/54b6b9c0d9f86e2d583b4737.html)

```
“添加新插件”（Add New）界面，在搜索框旁，选择下拉菜单的“作者”（Author）
搜索”Migrate“
找到“Backup Migration”，点击”马上安装“按键。
激活插件。
插件应当显示在设置菜单下。
```



## 友情链接

[WordPress设置友情链接\_百度经验](http://jingyan.baidu.com/article/8065f87fd1e803233124983a.html)

##  seo插件

……



# 常见错误及解决

| 问题/错误                  | 解决                                                         |
| -------------------------- | ------------------------------------------------------------ |
| 500 -Internal Server Error | 如果经常出现“**500 -Internal Server Error**”的错误，或者后台更新功能总是失败。说明虚拟主机的PHP版本比较老啦，在虚拟主机管理后台里面把PHP版本设置为**PHP5.4**即可。 |
|                            |                                                              |
|                            |                                                              |



## 参考：
- [如何在Wordpress架设的网站中添加百度统计代码\_百度经验](http://jingyan.baidu.com/article/0eb457e5206bbb03f1a9052d.html)
- [Wordpress支付宝插件自动付款交易安装使用\_百度经验](http://jingyan.baidu.com/article/e73e26c0db1b0324adb6a72a.html)
- 备案信息：皖ICP备11021581号-4

