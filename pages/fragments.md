---
layout: page
title: Fragments
description: fragments 索引页
keywords: fragments
comments: false
mermaid: false
menu: 片段
permalink: /fragments/
---

> 零散的知识，简短的观点，作为片段汇集于此。

{% assign tagliststr = '' %}
{% for item in site.fragments %}
{% if item.title != "Fragment Template" %}
  {% for tag in item.tags %}
    {% if tagliststr contains tag %}
    {% else %}
      {% if tagliststr != '' %}{% assign tagliststr = tagliststr | append: ',' %}{% endif %}
      {% assign tagliststr = tagliststr | append: tag %}
    {% endif %}
  {% endfor %}
{% endif %}
{% endfor %}

{% assign taglist = tagliststr | split: ',' | sort_natural %}

<a href="{{ site.url }}/fragments/" style="color:#888;display:inline-block;margin:0 8px;">全部</a>{% for tag in taglist %}<a href="{{ site.url }}/fragments/?tag={{ tag }}" style="color:#888;display:inline-block;margin:0 8px;">{{ tag }}</a>{% endfor %}

<ul class="listing">
{% for item in site.fragments %}
{% if item.title != "Fragment Template" %}
<li class="listing-item" tags="{% for tag in item.tags %}{{ tag }} {% endfor %}">
  <a href="{{ site.url }}{{ item.url }}">{{ item.title }}</a>
  {% if item.tags %}
  {% for tag in item.tags %}
  <a style="font-size:12px;color:gray;font-style:italic;display:inline-block;margin:0 0 0 4px;padding:0 4px;background-color:lightgray;" href="{{ site.url }}/fragments/?tag={{ tag }}" title="{{ tag }}">{{ tag }}</a>
  {% endfor %}
  {% endif %}
</li>
{% endif %}
{% endfor %}
</ul>

{% if site.fragments == nil or site.fragments.size == 0 %}
<p style="color:var(--animal-text-secondary);font-size:14px;">还没有任何片段。</p>
{% endif %}

<script>
(function() {
    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURIComponent(r[2]);
        return null;
    }

    var tag = getUrlParam('tag');
    if (!tag) return;

    var items = document.querySelectorAll('.listing-item');
    for (var i = 0; i < items.length; i++) {
        var itemTags = items[i].getAttribute('tags') || '';
        if (itemTags.indexOf(tag) < 0) {
            items[i].style.display = 'none';
        }
    }
})();
</script>
