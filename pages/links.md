---
layout: page
title: Links
description: 没有链接的博客是孤独的
keywords: 友情链接, 技术资讯, 开发者社区, 网络安全, 设计, 云服务, 工具
comments: true
menu: 链接
permalink: /links/
---

> God made relatives. Thank God we can choose our friends.

{% assign categories = "tech-news|dev|security|design|cloud|tools|life" | split: "|" %}
{% assign cat_names = "技术资讯|开发者社区|网络安全|设计灵感|云服务|在线工具|生活娱乐" | split: "|" %}
{% assign cat_icons = "📡|💻|🔒|🎨|☁️|🛠️|🌐" | split: "|" %}

{% for i in (0..6) %}
{% assign src = categories[i] %}
{% assign name = cat_names[i] %}
{% assign icon = cat_icons[i] %}

<h3>{{ icon | escape }} {{ name | escape }}</h3>
<ul>
{% for link in site.data.links %}
  {% if link.src == src %}
  <li><a href="{{ link.url | escape }}" target="_blank" rel="noopener noreferrer">{{ link.name | escape }}</a></li>
  {% endif %}
{% endfor %}
</ul>

{% endfor %}
