---
layout: page
title: About
description: 朱皮特的烂笔头
keywords: 
comments: true
menu: 关于
permalink: /about/
---


<iframe src="https://githubbadge.appspot.com/bigsinger?s=1" style="border: 0;height: 142px;width: 200px;overflow: hidden;" frameBorder="0"></iframe>

对编程技术有很高热情，喜欢尝试各种编程技术和框架，喜欢用现有技术解决实际问题。

- [程序员幽默段子](https://www.zhupite.com/other/joke.html)



# 联系

<ul>
{% for website in site.data.social %}
@ -26,16 +23,16 @@ permalink: /about/
{% if site.url contains 'mazhuang.org' %}
<li>
微信公众号：<br />
<img style="height:192px;width:192px;border:1px solid lightgrey;" src="{{ assets_base_url }}/assets/images/qrcode.jpg" alt="朱皮特的烂笔头" />
</li>
{% endif %}
</ul>


# Skill Keywords

{% for skill in site.data.skills %}
## {{ skill.name }}
<div class="btn-inline">
{% for keyword in skill.keywords %}
<button class="btn btn-outline" type="button">{{ keyword }}</button>
