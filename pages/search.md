---
layout: page
title: 搜索
description: 搜索文章
keywords: 搜索, 站内搜索
comments: false
menu: 搜索
permalink: /search/
---

<div class="search-page" data-search-page data-json-url="{{ site.url }}/assets/search_data.json?v={{ 'now' | date: '%s' }}">
  <div class="search-page-toolbar">
    <input type="search" id="searchPageBox" class="search-input search-page-input" placeholder="搜索标题、分类、标签…" autocomplete="off" autofocus>
  </div>
  <div class="search-filter-block" aria-label="分类筛选">
    <div class="search-filter-title">分类</div>
    <div class="search-filter-list" id="searchCategoryFilters"></div>
  </div>
  <div class="search-filter-block" aria-label="标签筛选">
    <div class="search-filter-title">标签</div>
    <div class="search-filter-list" id="searchTagFilters"></div>
  </div>
  <div class="search-page-count" id="searchPageCount" aria-live="polite"></div>
  <ul id="searchPageResults" class="search-results search-page-results"></ul>
</div>
