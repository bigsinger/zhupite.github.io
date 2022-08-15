---
layout: page
title: 求职内推，上传简历就有机会
description: 人越学越觉得自己无知
keywords: 求职内推, job
comments: false
menu: 求职内推
permalink: /wiki/
---

# 定期更新，长期有效，欢迎上传简历

猛戳链接：[网易招聘内部职位推荐](https://zhupite.com/categories/#job)

可以在右侧搜索框内搜索感兴趣的岗位。

岗位搜索技巧：
- 筛选学历要求，搜索关键词：大专，本科，硕士，博士，学历不限
- 筛选工作年限要求，搜索关键词：3年，5年，经验不限
- 筛选工作城市，搜索关键词：杭州，上海，北京，日本，海外，衢州
- 也可以按照岗位分类或岗位名称筛选，例如搜索：iOS，java，开发，产品经理，设计师……



<ul class="listing">
{% for wiki in site.wiki %}
{% if wiki.title != "Wiki Template" and wiki.topmost == true %}
<li class="listing-item"><a href="{{ site.url }}{{ wiki.url }}"><span class="top-most-flag">[置顶]</span>{{ wiki.title }}</a></li>
{% endif %}
{% endfor %}
{% for wiki in site.wiki %}
{% if wiki.title != "Wiki Template" and wiki.topmost != true %}
<li class="listing-item"><a href="{{ site.url }}{{ wiki.url }}">{{ wiki.title }}<span style="font-size:12px;color:red;font-style:italic;">{%if wiki.layout == 'mindmap' %}  mindmap{% endif %}</span></a></li>
{% endif %}
{% endfor %}
</ul>
