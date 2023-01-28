---
layout:		post
category:	"program"
title:		"相册图片下载lua js脚本速查参考"
tags:		[]
---

# 接口

| 接口                            | 调用环境 | 说明                                                     |
| ------------------------------- | -------- | -------------------------------------------------------- |
| starjs.setsource4lua(s);        | js       | 传递全局字符串                                           |
| starjs.setnexturl4lua(nexturl); | js       | 传递全局字符串                                           |
| starjs.getsource4js             | js       | 获取全局字符串                                           |
| starjs.addphotojs               | js       | 添加图片，starjs.addphotojs(src, name);                  |
| starjs.addalbumjs               | js       | 添加相册，starjs.addalbumjs(name, href, src, count);     |
| starjs.getminwidth()            | js       | var w = starjs.getminwidth();                            |
| starjs.getminheight()           | js       | var h = starjs.getminheight();                           |
|                                 |          |                                                          |
| navigate                        | lua      | navigate(url)                                            |
| runjs                           | lua      | runjs([[  ]])                                            |
| getsource4lua()                 | lua      | 获取全局字符串                                           |
| getnexturl4lua()                | lua      | 获取全局字符串                                           |
| setsource4js                    | lua      | 传递全局字符串                                           |
| print                           | lua      | 输出日志                                                 |
| msgbox                          | lua      | 弹框                                                     |
| getver                          | lua      | 获取程序版本号。if getver()>1031 then end                |
| selecttab                       | lua      | 切换软件Tab页。if getver() >= 1031 then selecttab(0) end |



# JavaScript

获取自定义属性值：

```js
var img = document.images[i];
if ( img.hasAttribute('data-lazy-load-src') ) {
    var src = img.getAttribute('data-lazy-load-src') + '';
}

lazynode = img.getAttributeNode('data-lazy-src');
if (lazynode!=null) {
    src = lazynode.value;
}else{
    src = img.getAttributeNode('src').value;
}
```

通过**类名**获取节点信息：

```js
var nodes = document.getElementsByClassName('class name');//getElementsByTagName
if (nodes.length != 0) {
    url = nodes[0].href; //alert(url);	//v.parentNode.innerHTML;
}
```

通过**Selector**获取节点信息：

```js
var v = document.querySelector("#mod-detail-title > h1");
if(v!=null){
    name = v.outerText;
}else{
    v = document.querySelector("div.title-content > div");
    if(v!=null){
        name = v.textContent;
    }
}
```

通过正则匹配解析信息：

```js
try{
	nodes = document.getElementsByClassName('cover')
	for(var i = 0; i < nodes.length; ++i) {
		s = nodes[i].parentNode.innerHTML;
		//console.log(nodes[0].parentNode.innerHTML)
		var arr = s.match(/href="(.*?)"/); 	if(arr.length > 0) { href = arr[1]; }
		arr = s.match(/title="(.*?)"/); 	if(arr.length > 0) { name = arr[1]; }
		arr = s.match(/src="(.*?)"/);		if(arr.length > 0) { src = arr[1]; }
		arr = s.match(/"count">\s*?(\d+)/);	if(arr.length > 0) { count = parseInt(arr[1]); }
		starjs.addalbumjs(name, href, src, count);
	}
}catch(e){
	alert(e.message);
}
```

通过正则匹配替换字符串：

```js
src = src.replace(/.\d+x\d+./, '.');
```

通过json解析信息：

```js
var obj = JSON.parse(data_imgs.value);
console.info(obj.original);
```



# Lua

获取页数：

```lua
pagecount,_ =math.modf(album.total/8) 
rest =math.fmod(album.total,8)
pagecount = pagecount + (rest~=0 and 1 or 0)
```

通过正则匹配替换字符串：

```lua
src = string.gsub(src,'(%.%d+x%d+).jpg','.jpg')
```

lua倒叙查找字符串：

```lua
pos = (album.name:reverse()):find('%-')
if pos~=nil then
 album.name = string.sub(album.name, 1, -pos-1)
end
```

