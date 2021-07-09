---
layout:		post
category:	"JavaScript"
title:		"electron"
tags:		[JavaScript]
---
- Content
{:toc}

JavaScript获取网页点击时候的元素信息
```js
document.onclick = function(evt) {
    var evt = evt ? evt : window.event;
    var e = evt.srcElement || evt.target;
    var id = e.id; 					// var id = $(e).attr('id');
    var className = e.className; 	// var className = $(e).attr('class');
    var tagName = e.tagName;
    var title = e.outerText;
	console.log('tagName: ' + tagName);
	console.log('className: ' + className);
	console.log('id: ' + id);
	console.log('title: ' + title);
}
```

