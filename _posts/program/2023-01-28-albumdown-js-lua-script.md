---
layout:		post
category:	"program"
title:		"相册图片下载lua js脚本速查参考"
tags:		[]
---

# 接口

| 接口                            | 调用环境 | 说明                                                         |
| ------------------------------- | -------- | ------------------------------------------------------------ |
| starjs.setsource4lua(s);        | js       | 传递全局字符串                                               |
| starjs.setnexturl4lua(nexturl); | js       | 传递全局字符串                                               |
| starjs.getsource4js             | js       | 获取全局字符串                                               |
| starjs.addphotojs               | js       | 添加图片，starjs.addphotojs(src, name);                      |
| starjs.addalbumjs               | js       | 添加相册，starjs.addalbumjs(name, href, src, count);         |
| starjs.getminwidth()            | js       | var w = starjs.getminwidth();                                |
| starjs.getminheight()           | js       | var h = starjs.getminheight();                               |
|                                 |          |                                                              |
| request                         | lua      | request(url) 请求url获取返回内容。内部自动获取当前浏览器正在访问的网址作为Refer参数，自动获取Cookie作为参数。效果等同于：star.gethtmlex(url, 'xxx.com', getcookies())   以及： navigate(url) s = getwebsource() |
| visit                           | lua      | visit(url, isAsync, waitTime, className)  返回网页源码       |
| navigate(url, [milliseconds])   | lua      | 参数2位等待时间，单位：毫秒                                  |
| runjs                           | lua      | runjs([[  ]])                                                |
| getsource4lua()                 | lua      | 获取全局字符串                                               |
| getnexturl4lua()                | lua      | 获取全局字符串                                               |
| setsource4js                    | lua      | 传递全局字符串                                               |
| print                           | lua      | 输出日志                                                     |
| msgbox                          | lua      | 弹框                                                         |
| getver                          | lua      | 获取程序版本号。if getver()>1031 then end                    |
| selecttab                       | lua      | 切换软件Tab页。if getver() >= 1031 then selecttab(0) end     |
| findurl                         | lua      | 获取访问网页过程中加载的url，通过关键词进行查找。if getver()>1051 then end |
| star.log                        | lua      | 将内容以日志形式保存到文件                                   |
| star.gethtml                    | lua      | 请求url获取返回内容                                          |
| star.gethtmlex                  | lua      | 请求url获取返回内容。star.gethtmlex(url, 'xxx.com', getcookies())  效果等同于：navigate(url) s = getwebsource() |



# JavaScript

调试技巧：

```js
var debug = true;
if(debug){ alert(s); debug = false;}
```

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

据说是简化代码：

```js
const img = document.images[i];
const src = img.dataset.lazySrc || img.src;
```



## document文档节点

一些 `JavaScript` 查询文档节点的常用方法：

1. getElementById()：根据元素的ID属性获取文档节点，返回单个元素对象。

2. getElementsByClassName()：根据元素的class属性获取文档节点，返回一个元素对象数组。

3. getElementsByTagName()：根据元素的标签名获取文档节点，返回一个元素对象数组。

4. querySelector()：使用CSS选择器获取文档节点，返回单个元素对象。

5. querySelectorAll()：使用CSS选择器获取文档节点，返回一个元素对象数组。

6. parentNode：获取一个元素节点的父节点。

7. childNodes：获取一个元素节点的所有子节点，返回一个节点对象数组。

8. nextSibling：获取一个元素节点的下一个兄弟节点。

9. previousSibling：获取一个元素节点的上一个兄弟节点。

10. firstChild：获取一个元素节点的第一个子节点。

11. lastChild：获取一个元素节点的最后一个子节点。


这些方法可以帮助我们方便快捷地获取文档节点，从而实现各种操作和交互效果。

```js
// 通过类名获取节点信息
const nodes = document.querySelectorAll('.class-name');
var url = nodes.length > 0 ? nodes[0].href : '';

// 通过标签获取节点
var images = n.getElementsByTagName('img1');
```



```js
/*
获取子节点的方式
*/

const parentElement = document.getElementById('parent'); 		// 获取父节点

// 获取子节点
const childElement = parentElement.querySelector('.child');

// 获取所有符合条件的子节点
const childElements = parentElement.querySelectorAll('.child');

// 获取第二个符合条件的子节点
const secondChildElement = childElements[1];

// 直接获取第二个符合条件的子节点
const secondChildElement = parentElement.querySelector('.child:nth-child(2)');


// 使用 getElementsByClassName() 方法获取子节点，注意返回的是数组
const childElements = parentElement.getElementsByClassName('child'); // 获取所有拥有 class="child" 的子节点


/*
通过 Selector 获取节点信息
1、使用 , 分隔符将两个选择器组合到一起，使用一个 querySelector() 方法就能够同时查找两个元素。
2、使用可选链运算符 ?. 来简化判空操作，如果 v 为 null 或 undefined，则 v?.textContent 会返回 undefined，这样就不需要显式进行判空操作了。
3、对于变量 name，如果选择器返回的元素不存在，则使用空字符串进行初始化。
*/
const v = document.querySelector("#mod-detail-title > h1, div.title-content > div");
const name = v?.textContent || '';
```

### Selector 

CSS Selector 是一种用于选择 HTML 元素的语法。在 JavaScript 中，可以使用 `querySelector()` 方法和 `querySelectorAll()` 方法来执行 CSS Selector。以下是一些常用的 CSS Selector 语法和操作：

1. 选择元素：可以通过元素名称选择元素。例如，`div` 选择所有的 `<div>` 元素。
2. 类选择器：可以通过类名选择元素。例如，`.my-class` 选择所有使用 `class="my-class"` 属性的元素。
3. ID 选择器：可以通过 ID 选择元素。例如，`#my-id` 选择 ID 为 `my-id` 的元素。
4. 属性选择器：可以通过元素属性选择元素。例如，`[data-my-attr]` 选择所有具有 `data-my-attr` 属性的元素。
5. 伪类选择器：可以通过伪类选择元素。例如，`:hover` 选择当前鼠标悬停的元素。
6. 组合选择器：可以通过组合选择器选择元素。例如，`div.my-class` 选择所有使用 `class="my-class"` 属性的 `<div>` 元素。
7. 后代选择器：可以通过后代选择器选择元素。例如，`div span` 选择所有 `<div>` 元素内部的 `<span>` 元素。
8. 子元素选择器：可以通过子元素选择器选择元素。例如，`div > span` 选择所有 `<div>` 元素的直接子元素中的 `<span>` 元素。
9. 通配符选择器：可以使用通配符选择器选择所有元素。例如，`*` 选择所有元素。
10. 多属性选择器：可以通过多个属性选择器选择元素。例如，`[data-my-attr][data-another-attr]` 选择具有 `data-my-attr` 和 `data-another-attr` 属性的元素。
11. 伪元素选择器：可以使用伪元素选择器来选择元素的特定部分。例如，`::before` 和 `::after` 可以在元素的内容前面或后面插入生成的内容。
12. 通用兄弟选择器：可以使用通用兄弟选择器选择同级元素中匹配指定选择器的元素。例如，`div ~ p` 选择所有在 `<div>` 元素之后的 `<p>` 元素。
13. 伪类选择器的组合：可以通过组合多个伪类选择器来选择元素。例如，`:hover:focus` 选择当前鼠标悬停且具有焦点的元素。
14. 多元素选择器：可以使用逗号将多个选择器组合在一起，以同时选择多个元素。例如，`div, p` 选择所有 `<div>` 元素和 `<p>` 元素。
15. 属性值选择器：可以使用属性值选择器选择具有特定属性值的元素。例如，`[data-my-attr="my-value"]` 选择具有 `data-my-attr` 属性且属性值为 `my-value` 的元素。
16. 选择器优先级：如果有多个选择器匹配同一个元素，则可以使用选择器优先级来确定应用哪个样式。选择器优先级由选择器中的特殊符号数量和组件数量决定。



以下是使用 JavaScript 使用 Selector 进行查询的一些常用代码：

`document.querySelector(selector)`：选择符合选择器指定的第一个元素，并返回该元素。

```js
const myElement = document.querySelector('.my-class');
```

`document.querySelectorAll(selector)`：选择符合选择器指定的所有元素，并返回一个 NodeList 对象。

```js
const myElements = document.querySelectorAll('.my-class');
```

`element.querySelector(selector)`：在指定元素内选择符合选择器指定的第一个子元素，并返回该子元素。

```js
const myElement = document.getElementById('my-id');
const myChildElement = myElement.querySelector('.my-class');
```

`element.querySelectorAll(selector)`：在指定元素内选择符合选择器指定的所有子元素，并返回一个 NodeList 对象。

```js
const myElement = document.getElementById('my-id');
const myChildElements = myElement.querySelectorAll('.my-class');
```





## 正则匹配

通过正则匹配解析信息：

```js
const nodes = document.querySelectorAll('.cover');
nodes.forEach(node => {
    const s = node.parentNode.innerHTML;
    const href = s.match(/href="(.*?)"/)?.[1] || '';
    const name = s.match(/title="(.*?)"/)?.[1] || '';
    const src = s.match(/src="(.*?)"/)?.[1] || '';
    const count = parseInt(s.match(/"count">\s*?(\d+)/)?.[1] || '0');
    starjs.addalbumjs(name, href, src, count);
});
```

通过正则匹配替换字符串：

```js
src = src.replace(/.\d+x\d+./, '.');
```



## json操作

通过 json 解析信息：

```js
var obj = JSON.parse(data_imgs.value);
console.info(obj.original);
```



## dataset操作属性

`dataset`属性是HTML5 DOM API中很有用的一部分。使用`dataset`，可以轻松从DOM元素中获取和设置自定义属性的值，同时具有可读性，可维护性和交互性。

**注意事项**：

- 自定义属性名必须以`data-`为前缀。例如属性。
- 自定义属性名不应包含大写字母或非ASCII字符。
- 自定义属性名中的连字符会被转换为驼峰式命名的属性名。
- 空格或特殊字符会被转换为驼峰式命名的属性名，例如：`data-lazy-src` 会被转换为： `v.dataset.lazySrc`。
- dataset 属性不是只读的，可以使用`delete`关键字删除一个自定义属性。

# Lua

```lua
--计算页数
pagecount, _ = math.modf(album.total/8) 
rest = math.fmod(album.total,8)
pagecount = pagecount + (rest~=0 and 1 or 0)
```



```lua
--通过正则匹配替换字符串
src = string.gsub(src,'(%.%d+x%d+).jpg','.jpg')
```



```lua
--倒叙查找字符串
pos = (name:reverse()):find('%-')
if pos~=nil then
    name = string.sub(name, 1, -pos-1)
end
```

