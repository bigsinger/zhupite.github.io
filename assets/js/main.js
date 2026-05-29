/**
 * main.js — 原生 JavaScript 版（重写于 2026-05-28）
 * 替代 jQuery 依赖：gotop 回到顶部、图片懒加载、代码复制、目录滚动
 */

document.addEventListener('DOMContentLoaded', function() {

  // ===== 1. 回到顶部 (gotop) =====
  var gotop = document.querySelector('.gotop');
  if (gotop) {
    function checkScroll() {
      if (window.scrollY >= window.innerHeight) {
        gotop.style.opacity = '1';
        gotop.style.pointerEvents = 'auto';
      } else {
        gotop.style.opacity = '0';
        gotop.style.pointerEvents = 'none';
      }
    }
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();

    gotop.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== 2. 代码块：语言标签 + 复制按钮 =====
  var articleContent = document.querySelector('.article-content');
  if (articleContent) {
    var pres = articleContent.querySelectorAll('pre');
    pres.forEach(function(pre) {
      // Skip if already processed
      if (pre.getAttribute('data-code-processed')) return;
      pre.setAttribute('data-code-processed', 'true');

      // Extract language from <code> class
      var code = pre.querySelector('code');
      var lang = '';
      if (code) {
        var cls = code.className || '';
        var match = cls.match(/language-(\w+)/);
        if (match) lang = match[1];
        if (!lang) {
          /* Try highlight-xxx class (Rouge convention) */
          match = cls.match(/highlight-(\w+)/) || cls.match(/lang-(\w+)/);
          if (match) lang = match[1];
        }
      }
      /* If still no language, traverse ancestors of <pre> */
      if (!lang) {
        var ancestor = pre;
        for (var _a = 0; _a < 5; _a++) {
          ancestor = ancestor.parentNode;
          if (!ancestor) break;
          var ac = ancestor.className || '';
          var am = ac.match(/language-(\w+)/);
          if (am) { lang = am[1]; break; }
        }
      }

      // Create header with language label + copy button
      var header = document.createElement('div');
      header.className = 'code-header';

      var label = document.createElement('span');
      label.className = 'code-lang-label';
      label.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>' + (lang || 'code');
      header.appendChild(label);

      var copyBtn = document.createElement('button');
      copyBtn.className = 'code-copy-btn';
      copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> 复制';
      copyBtn.addEventListener('click', function() {
        var text = pre.textContent || '';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function() {
            copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 已复制';
            copyBtn.classList.add('copied');
            setTimeout(function() {
              copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> 复制';
              copyBtn.classList.remove('copied');
            }, 2000);
          });
        } else {
          // Fallback: select and execCommand
          var range = document.createRange();
          range.selectNodeContents(code || pre);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          document.execCommand('copy');
          sel.removeAllRanges();
          copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 已复制';
          copyBtn.classList.add('copied');
          setTimeout(function() {
            copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> 复制';
            copyBtn.classList.remove('copied');
          }, 2000);
        }
      });
      header.appendChild(copyBtn);

      // Insert header before <pre>
      pre.parentNode.insertBefore(header, pre);
    });
  }

  // ===== 3. 移动端TOC悬浮按钮事件 + 拖拽移动 =====
  (function setupTocToggle() {
    var btn = document.getElementById('tocMobileBtn');
    var overlay = document.getElementById('tocMobileOverlay');
    var closeBtn = document.getElementById('tocDrawerClose');
    if (!btn || !overlay) return;

    /* 从 localStorage 恢复已保存的位置 */
    var savedPos = localStorage.getItem('tocBtnPos');
    if (savedPos) {
      try {
        var pos = JSON.parse(savedPos);
        btn.style.left = pos.left;
        btn.style.top = pos.top;
        btn.style.right = 'auto';
        btn.style.bottom = 'auto';
      } catch(e) {}
    }

    /* 点击打开抽屉 */
    btn.addEventListener('click', function(e) {
      if (btn.classList.contains('is-dragging')) return;
      e.stopPropagation();
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    /* 拖拽逻辑 */
    var startX, startY, origLeft, origTop, isDragging = false;
    btn.addEventListener('touchstart', function(e) {
      var touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      origLeft = parseInt(btn.style.left) || (window.innerWidth - btn.offsetWidth - 24);
      origTop = parseInt(btn.style.top) || (window.innerHeight - btn.offsetHeight - 24);
      /* 确保用 left/top 定位 */
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
      btn.style.left = origLeft + 'px';
      btn.style.top = origTop + 'px';
      isDragging = false;
    }, {passive: true});

    btn.addEventListener('touchmove', function(e) {
      var touch = e.touches[0];
      var dx = touch.clientX - startX;
      var dy = touch.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isDragging = true;
        btn.classList.add('is-dragging');
      }
      if (!isDragging) return;
      e.preventDefault();
      var newLeft = origLeft + dx;
      var newTop = origTop + dy;
      /* 限制在视口内 */
      newLeft = Math.max(8, Math.min(window.innerWidth - btn.offsetWidth - 8, newLeft));
      newTop = Math.max(8, Math.min(window.innerHeight - btn.offsetHeight - 8, newTop));
      btn.style.left = newLeft + 'px';
      btn.style.top = newTop + 'px';
    }, {passive: false});

    btn.addEventListener('touchend', function() {
      btn.classList.remove('is-dragging');
      if (isDragging) {
        /* 保存位置 */
        localStorage.setItem('tocBtnPos', JSON.stringify({
          left: btn.style.left,
          top: btn.style.top
        }));
        isDragging = false;
      }
    });
    function closeOverlay() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', closeOverlay);
    }
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeOverlay();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeOverlay();
    });
  })();

  // ===== 4. TOC 目录生成（文章页专用） =====
  (function initToc() {
    var tocCard = document.getElementById('toc-sidebar');
    if (!tocCard) return;
    var main = document.querySelector('.main-content');
    var list = document.getElementById('toc-list-generated');
    var mobileList = document.getElementById('toc-mobile-list');
    var headings = main ? main.querySelectorAll('h1, h2, h3, h4') : [];
    
    /* 标题不足 2 个时隐藏桌面 TOC 卡片 */
    if (!main || headings.length < 2) {
      tocCard.style.display = 'none';
    }
    
    /* 生成目录列表（桌面 + 移动端） */
    if (list && headings.length >= 2) {
      var tocHtml = '';
      for (var i = 0; i < headings.length; i++) {
        var h = headings[i];
        if (!h.id) h.id = 'toc-' + i;
        var tag = (h.tagName || '').toLowerCase();
        var cls = 'toc-h1';
        if (tag === 'h2') cls = 'toc-h2';
        else if (tag === 'h3') cls = 'toc-h3';
        else if (tag === 'h4') cls = 'toc-h4';
        var text = (h.textContent || '').trim();
        tocHtml += '<li class="' + cls + '"><a href="#' + h.id + '">' + text + '</a></li>';
      }
      list.innerHTML = tocHtml;
      if (mobileList) mobileList.innerHTML = tocHtml;
    }
  })();

  // ===== 5. TOC 滚动高亮增强 =====
  var tocLists = document.querySelectorAll('.toc-list');
  tocLists.forEach(function(tocList) {
    var links = tocList.querySelectorAll('a');
    /* Only process if there are links */
    if (links.length > 0 && typeof IntersectionObserver !== 'undefined') {
      // Find all heading elements in main content
      var main = document.querySelector('.main-content');
      if (!main) return;
      var headings = main.querySelectorAll('h1, h2, h3, h4');
      if (headings.length < 2) return;

      // Improved observer with better rootMargin for earlier highlight
      var observer = new IntersectionObserver(function(entries) {
        // Find the first heading that is currently visible
        var visibleEntry = null;
        for (var e = 0; e < entries.length; e++) {
          if (entries[e].isIntersecting) {
            visibleEntry = entries[e];
            break;
          }
        }
        if (!visibleEntry) return;

        // Clear all active states first
        for (var l = 0; l < links.length; l++) {
          links[l].parentElement.classList.remove('toc-active');
        }

        // Find corresponding TOC link
        var targetId = decodeURIComponent(visibleEntry.target.id);
        var tocContent = document.querySelector('.toc-card-widget .toc-content');
        for (var l = 0; l < links.length; l++) {
          var href = links[l].getAttribute('href');
          if (href === '#' + targetId) {
            links[l].parentElement.classList.add('toc-active');
            // 自动滚动 TOC 到当前阅读章节
            if (tocContent && typeof links[l].scrollIntoView === 'function') {
              links[l].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
            break;
          }
        }
      }, {
        rootMargin: '-50px 0px -65% 0px',
        threshold: 0
      });

      // Observe all headings
      for (var i = 0; i < headings.length; i++) {
        observer.observe(headings[i]);
      }
    }
  });

  // ===== 5. Tables: wrapper + copy button =====
  var articleBody = document.querySelector('.article-content.markdown-body');
  if (articleBody) {
    var tables = articleBody.querySelectorAll('table');
    tables.forEach(function(table, idx) {
      if (table.getAttribute('data-table-processed')) return;
      table.setAttribute('data-table-processed', 'true');

      /* Wrap table in a div for border-radius + scroll */
      var wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';

      /* Create table header with copy button */
      var header = document.createElement('div');
      header.className = 'table-header';

      var copyBtn = document.createElement('button');
      copyBtn.className = 'table-copy-btn';
      copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> 复制 Markdown';
      copyBtn.addEventListener('click', function() {
        var md = htmlTableToMarkdown(table);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(md).then(function() {
            copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> 已复制';
            copyBtn.classList.add('copied');
            setTimeout(function() {
              copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> 复制 Markdown';
              copyBtn.classList.remove('copied');
            }, 2000);
          });
        }
      });
      header.appendChild(copyBtn);

      /* Insert wrapper before table */
      table.parentNode.insertBefore(wrapper, table);
      
      /* Create scroll wrapper for table only — header stays fixed */
      var scrollDiv = document.createElement('div');
      scrollDiv.className = 'table-scroll';
      wrapper.appendChild(header);
      wrapper.appendChild(scrollDiv);
      scrollDiv.appendChild(table);
    });
  }

  /* Helper: convert HTML table to pipe-style Markdown */
  function htmlTableToMarkdown(table) {
    var rows = table.querySelectorAll('tr');
    if (!rows.length) return '';
    var lines = [];
    var colCount = 0;

    for (var r = 0; r < rows.length; r++) {
      var cells = rows[r].querySelectorAll('th, td');
      var cellTexts = [];
      for (var c = 0; c < cells.length; c++) {
        var text = cells[c].textContent || '';
        text = text.trim().replace(/\n/g, ' ');
        cellTexts.push(text);
      }
      if (cellTexts.length > colCount) colCount = cellTexts.length;
      lines.push(cellTexts);
    }

    /* Build markdown */
    var mdLines = [];
    for (var r = 0; r < lines.length; r++) {
      var cells = lines[r];
      /* Pad with empty cells to match column count */
      while (cells.length < colCount) cells.push('');
      mdLines.push('| ' + cells.join(' | ') + ' |');
      /* Add separator after header row */
      if (r === 0) {
        var sep = [];
        for (var c = 0; c < colCount; c++) sep.push('---');
        mdLines.push('| ' + sep.join(' | ') + ' |');
      }
    }
    return mdLines.join('\n');
  }

  // ===== 6. Mobile Search Toggle =====
  window.toggleSearch = function() {
    var overlay = document.getElementById('searchOverlay');
    if (!overlay) return;
    overlay.classList.toggle('open');
    if (overlay.classList.contains('open')) {
      var box = document.getElementById('mobileSearchBox');
      if (box) setTimeout(function() { box.focus(); }, 200);
    }
  };

  /* Click outside to close search overlay */
  document.addEventListener('click', function(e) {
    var overlay = document.getElementById('searchOverlay');
    var btn = document.querySelector('.search-toggle');
    if (!overlay || !overlay.classList.contains('open')) return;
    if (!overlay.contains(e.target) && btn && !btn.contains(e.target)) {
      overlay.classList.remove('open');
    }
  });

  /* ESC key to close search overlay */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var overlay = document.getElementById('searchOverlay');
      if (overlay && overlay.classList.contains('open')) {
        overlay.classList.remove('open');
      }
    }
  });

  // ===== 7. 搜索初始化 (sidebar sjs + mobile manual) =====
  (function initSearch() {
    var input = document.getElementById('search_box');
    if (!input) return;   // 没有侧边栏搜索框 → 跳过
    var jsonUrl = input.getAttribute('data-json-url');
    if (!jsonUrl) return;
    var limit = 20;
    var noResultsText = '未找到相关内容';
    var tmpl = '<li><a href="{url}" title="{title}">{title}</a></li>';

    fetch(jsonUrl)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        /* ---- 侧栏：SimpleJekyllSearch 实例 ---- */
        var sjs = new SimpleJekyllSearch({
          searchInput: input,
          resultsContainer: document.getElementById('search_results'),
          json: data,
          searchResultTemplate: tmpl,
          noResultsText: noResultsText,
          limit: limit,
          fuzzy: false
        });

        /* ---- 移动覆盖层：手动 keyup 搜索（共享 data） ---- */
        var mobileBox = document.getElementById('mobileSearchBox');
        var mobileResults = document.getElementById('mobileSearchResults');
        if (!mobileBox || !mobileResults) return;

        var ignoreKeys = [16, 20, 37, 38, 39, 40, 91];
        mobileBox.addEventListener('keyup', function(e) {
          if (ignoreKeys.indexOf(e.which) >= 0) return;
          var term = e.target.value.trim();
          if (!term) { mobileResults.innerHTML = ''; return; }
          term = term.toLowerCase();
          var html = '';
          var count = 0;
          for (var i = 0; i < data.length && count < limit; i++) {
            var item = data[i];
            if (
              (item.title && item.title.toLowerCase().indexOf(term) >= 0) ||
              (item.keywords && item.keywords.toLowerCase().indexOf(term) >= 0) ||
              (item.category && item.category.toLowerCase().indexOf(term) >= 0)
            ) {
              html += tmpl.replace(/\{url\}/g, item.url).replace(/\{title\}/g, item.title);
              count++;
            }
          }
          mobileResults.innerHTML = html || '<li class="no-results">' + noResultsText + '</li>';
        });
      });
  })();

  // ===== 代码块溢出检测：为有水平滚动的高亮代码块添加标记 =====
  (function checkCodeOverflow() {
    var blocks = document.querySelectorAll('.highlight');
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].scrollWidth > blocks[i].clientWidth) {
        blocks[i].classList.add('is-overflow');
      }
    }
  })();

});
