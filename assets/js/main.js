/**
 * main.js — 原生 JavaScript 版（重写于 2026-05-28）
 * 替代 jQuery 依赖：gotop 回到顶部、图片懒加载、代码复制、目录滚动
 */

document.addEventListener('DOMContentLoaded', function() {
  var copyIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  var checkIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  var codeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>';

  /* ---- Touch: prevent horizontal swipe from triggering browser back/forward ---- */
  (function preventHorizontalSwipeNav() {
    var touchStartX = 0, touchStartY = 0;
    document.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
      if (e.touches.length !== 1) return;
      var dx = Math.abs(e.touches[0].clientX - touchStartX);
      var dy = Math.abs(e.touches[0].clientY - touchStartY);
      // horizontal swipe is dominant
      if (dx > dy && dx > 10) {
        var target = e.target;
        var scrollable = target.closest('pre, .table-scroll, .table-wrapper');
        if (!scrollable) {
          e.preventDefault();
        }
      }
    }, { passive: false });
  })();

  function markPageReady() {
    document.body.classList.add('body-ready');
    var bar = document.getElementById('pg-bar');
    if (bar) bar.classList.add('bar-done');
  }

  function setIconText(el, icon, text) {
    el.textContent = '';
    el.insertAdjacentHTML('afterbegin', icon);
    el.appendChild(document.createTextNode(' ' + text));
  }

  function syncThemeButtonState() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    var isDark = document.documentElement.classList.contains('dark');
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    var icon = btn.querySelector('.theme-toggle-icon');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
  }

  function closeMobileMenu() {
    var btn = document.getElementById('mobileMenuBtn');
    var nav = document.getElementById('mobileNav');
    if (!btn || !nav) return;
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  function setupHeaderActions() {
    var themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      syncThemeButtonState();
      themeBtn.addEventListener('click', function() {
        if (typeof window.toggleTheme === 'function') {
          window.toggleTheme();
          syncThemeButtonState();
        }
      });
    }

    var menuBtn = document.getElementById('mobileMenuBtn');
    var mobileNav = document.getElementById('mobileNav');
    if (menuBtn && mobileNav) {
      menuBtn.addEventListener('click', function() {
        var isOpen = mobileNav.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      mobileNav.addEventListener('click', function(e) {
        if (e.target && e.target.closest && e.target.closest('a')) closeMobileMenu();
      });
    }

    Array.prototype.forEach.call(document.querySelectorAll('.header-nav-dropdown'), function(dropdown) {
      var trigger = dropdown.querySelector('.header-nav-trigger');
      if (!trigger) return;

      function setExpanded(isOpen) {
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        dropdown.classList.toggle('is-open', isOpen);
      }

      var closeTimer = null;

      dropdown.addEventListener('mouseenter', function() {
        if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
        setExpanded(true);
      });
      dropdown.addEventListener('mouseleave', function() {
        closeTimer = setTimeout(function() { setExpanded(false); }, 200);
      });
      dropdown.addEventListener('focusin', function() { setExpanded(true); });
      dropdown.addEventListener('focusout', function(e) {
        if (!dropdown.contains(e.relatedTarget)) setExpanded(false);
      });
      dropdown.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;
        setExpanded(false);
        trigger.focus();
      });
    });
  }

  function setupGotop() {
    var gotop = document.querySelector('.gotop');
    if (!gotop) return;
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

  function getCodeLanguage(pre) {
    var code = pre.querySelector('code');
    var lang = '';
    var match;
    if (code) {
      var cls = code.className || '';
      match = cls.match(/language-([\w-]+)/);
      if (match) lang = match[1];
      if (!lang) {
        match = cls.match(/highlight-([\w-]+)/) || cls.match(/lang-([\w-]+)/);
        if (match) lang = match[1];
      }
    }
    if (!lang) {
      var ancestor = pre;
      for (var i = 0; i < 5; i++) {
        ancestor = ancestor.parentNode;
        if (!ancestor) break;
        var ac = ancestor.className || '';
        match = ac.match(/language-([\w-]+)/);
        if (match) {
          lang = match[1];
          break;
        }
      }
    }
    return lang || 'code';
  }

  function copyText(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone).catch(function() {
        fallbackCopyText(text, onDone);
      });
    } else {
      fallbackCopyText(text, onDone);
    }
  }

  function fallbackCopyText(text, onDone) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (e) {}
    document.body.removeChild(ta);
    onDone();
  }

  function flashCopied(button, defaultText) {
    setIconText(button, checkIcon, '已复制');
    button.classList.add('copied');
    setTimeout(function() {
      setIconText(button, copyIcon, defaultText);
      button.classList.remove('copied');
    }, 2000);
  }

  function initCodeBlocks() {
    var articleContent = document.querySelector('.article-content');
    if (!articleContent) return;
    var pres = articleContent.querySelectorAll('pre');
    pres.forEach(function(pre) {
      if (pre.getAttribute('data-code-processed') || pre.getAttribute('data-mermaid-source')) return;
      pre.setAttribute('data-code-processed', 'true');

      var header = document.createElement('div');
      header.className = 'code-header';

      var label = document.createElement('span');
      label.className = 'code-lang-label';
      label.insertAdjacentHTML('afterbegin', codeIcon);
      label.appendChild(document.createTextNode(getCodeLanguage(pre)));
      header.appendChild(label);

      var copyBtn = document.createElement('button');
      copyBtn.className = 'code-copy-btn';
      copyBtn.type = 'button';
      setIconText(copyBtn, copyIcon, '复制');
      copyBtn.addEventListener('click', function() {
        copyText(pre.textContent || '', function() {
          flashCopied(copyBtn, '复制');
        });
      });
      header.appendChild(copyBtn);

      pre.parentNode.insertBefore(header, pre);
    });
  }

  function initMermaidDiagrams() {
    var codes = document.querySelectorAll('pre > code.language-mermaid, pre > code.lang-mermaid');
    if (!codes.length) return;

    var nodes = [];
    codes.forEach(function(code, index) {
      var pre = code.parentNode;
      if (!pre) return;
      pre.setAttribute('data-mermaid-source', 'true');

      var diagram = document.createElement('div');
      diagram.className = 'mermaid';
      diagram.id = 'mermaid-diagram-' + index;
      diagram.textContent = code.textContent || '';
      pre.parentNode.replaceChild(diagram, pre);
      nodes.push(diagram);
    });

    function render() {
      if (!window.mermaid || !nodes.length) return;
      try {
        window.mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default'
        });
        window.mermaid.run({ nodes: nodes });
      } catch (e) {
        nodes.forEach(function(node) {
          node.classList.add('mermaid-error');
        });
      }
    }

    if (window.mermaid) {
      render();
      return;
    }

    function showMermaidError() {
      nodes.forEach(function(node) {
        node.classList.add('mermaid-error');
      });
    }

    var script = document.createElement('script');
    script.src = '/assets/vendor/mermaid.min.js';
    var mermaidTimer = setTimeout(function() {
      showMermaidError();
    }, 8000);
    script.async = true;
    script.onload = function() {
      clearTimeout(mermaidTimer);
      render();
    };
    script.onerror = function() {
      clearTimeout(mermaidTimer);
      showMermaidError();
    };
    document.head.appendChild(script);
  }

  function setupTocToggle() {
    var btn = document.getElementById('tocMobileBtn');
    var overlay = document.getElementById('tocMobileOverlay');
    var closeBtn = document.getElementById('tocDrawerClose');
    var tocCard = document.getElementById('toc-sidebar');
    var collapseBtn = document.getElementById('tocCollapseBtn');

    if (tocCard && collapseBtn) {
      function setTocCollapsed(collapsed) {
        tocCard.classList.toggle('is-collapsed', collapsed);
        collapseBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        collapseBtn.setAttribute('aria-label', collapsed ? '展开文章目录' : '折叠文章目录');
        collapseBtn.title = collapsed ? '展开文章目录' : '折叠文章目录';
        var content = document.getElementById(collapseBtn.getAttribute('aria-controls'));
        if (content) content.setAttribute('aria-hidden', collapsed ? 'true' : 'false');
      }

      setTocCollapsed(false);
      collapseBtn.addEventListener('click', function() {
        setTocCollapsed(!tocCard.classList.contains('is-collapsed'));
      });
    }

    if (!btn || !overlay) return;

    if (!tocCard) {
      btn.classList.remove('is-enabled');
      overlay.setAttribute('aria-hidden', 'true');
      return;
    }

    function setButtonPosition(left, top) {
      var width = btn.offsetWidth || 48;
      var height = btn.offsetHeight || 48;
      var viewport = window.visualViewport;
      var viewportLeft = viewport ? viewport.offsetLeft : 0;
      var viewportTop = viewport ? viewport.offsetTop : 0;
      var viewportWidth = viewport ? viewport.width : window.innerWidth;
      var viewportHeight = viewport ? viewport.height : window.innerHeight;
      var minLeft = viewportLeft + 8;
      var minTop = viewportTop + 8;
      var maxLeft = viewportLeft + viewportWidth - width - 8;
      var maxTop = viewportTop + viewportHeight - height - 8;
      if (maxLeft < minLeft) maxLeft = minLeft;
      if (maxTop < minTop) maxTop = minTop;
      left = Math.max(minLeft, Math.min(maxLeft, left));
      top = Math.max(minTop, Math.min(maxTop, top));
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
      btn.style.left = left + 'px';
      btn.style.top = top + 'px';
    }

    function constrainButtonPosition() {
      if (!btn.classList.contains('is-enabled')) return;
      var rect = btn.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var viewport = window.visualViewport;
      var left = rect.left + (viewport ? viewport.offsetLeft : 0);
      var top = rect.top + (viewport ? viewport.offsetTop : 0);
      setButtonPosition(left, top);
    }

    function restoreButtonPosition() {
      var savedPos = localStorage.getItem('tocBtnPos');
      if (!savedPos) return;
      try {
        var pos = JSON.parse(savedPos);
        var left = parseInt(pos.left, 10);
        var top = parseInt(pos.top, 10);
        if (!isNaN(left) && !isNaN(top)) setButtonPosition(left, top);
      } catch(e) {}
    }
    restoreButtonPosition();
    setTimeout(constrainButtonPosition, 0);
    window.addEventListener('resize', constrainButtonPosition, { passive: true });
    window.addEventListener('orientationchange', function() {
      setTimeout(constrainButtonPosition, 250);
    }, { passive: true });
    window.addEventListener('pageshow', constrainButtonPosition, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', constrainButtonPosition, { passive: true });
      window.visualViewport.addEventListener('scroll', constrainButtonPosition, { passive: true });
    }

    function openOverlay() {
      if (!btn.classList.contains('is-enabled')) return;
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function closeOverlay(returnFocus) {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (returnFocus) btn.focus();
    }

    var startX, startY, origLeft, origTop, isDragging = false, suppressClick = false;

    btn.addEventListener('click', function(e) {
      if (suppressClick || btn.classList.contains('is-dragging')) {
        e.preventDefault();
        suppressClick = false;
        return;
      }
      e.stopPropagation();
      openOverlay();
    });

    btn.addEventListener('touchstart', function(e) {
      var touch = e.touches[0];
      var rect = btn.getBoundingClientRect();
      var viewport = window.visualViewport;
      startX = touch.clientX;
      startY = touch.clientY;
      origLeft = rect.left + (viewport ? viewport.offsetLeft : 0);
      origTop = rect.top + (viewport ? viewport.offsetTop : 0);
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
      setButtonPosition(origLeft, origTop);
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
      setButtonPosition(newLeft, newTop);
    }, {passive: false});

    btn.addEventListener('touchend', function() {
      if (isDragging) {
        localStorage.setItem('tocBtnPos', JSON.stringify({
          left: btn.style.left,
          top: btn.style.top
        }));
        suppressClick = true;
        isDragging = false;
        setTimeout(function() { suppressClick = false; }, 350);
      }
      btn.classList.remove('is-dragging');
    });
    btn.addEventListener('touchcancel', function() {
      isDragging = false;
      btn.classList.remove('is-dragging');
      constrainButtonPosition();
    }, { passive: true });

    if (closeBtn) closeBtn.addEventListener('click', function() { closeOverlay(true); });
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeOverlay(true);
      else if (e.target && e.target.closest && e.target.closest('.toc-list a')) closeOverlay(false);
    });
  }

  function buildTocList(list, headings) {
    list.textContent = '';
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      if (!h.id) h.id = 'toc-' + i;

      var tag = (h.tagName || '').toLowerCase();
      var cls = 'toc-h1';
      if (tag === 'h2') cls = 'toc-h2';
      else if (tag === 'h3') cls = 'toc-h3';
      else if (tag === 'h4') cls = 'toc-h4';

      var li = document.createElement('li');
      li.className = cls;
      var link = document.createElement('a');
      link.setAttribute('href', '#' + h.id);
      link.textContent = (h.textContent || '').trim();
      li.appendChild(link);
      fragment.appendChild(li);
    }
    list.appendChild(fragment);
  }

  function initToc() {
    var tocCard = document.getElementById('toc-sidebar');
    var btn = document.getElementById('tocMobileBtn');
    var overlay = document.getElementById('tocMobileOverlay');
    if (!tocCard) {
      if (btn) btn.classList.remove('is-enabled');
      if (overlay) overlay.setAttribute('aria-hidden', 'true');
      return;
    }
    var articleBody = document.querySelector('.article-content.markdown-body');
    var list = document.getElementById('toc-list-generated');
    var mobileList = document.getElementById('toc-mobile-list');
    var headings = articleBody ? articleBody.querySelectorAll('h1, h2, h3, h4') : [];

    if (!articleBody || !headings.length) {
      tocCard.style.display = 'none';
      if (btn) {
        btn.classList.remove('is-enabled');
        btn.setAttribute('aria-expanded', 'false');
      }
      if (overlay) overlay.setAttribute('aria-hidden', 'true');
      return;
    }

    tocCard.style.display = '';
    if (btn) {
      btn.style.display = '';
      btn.classList.add('is-enabled');
      btn.setAttribute('aria-expanded', 'false');
    }
    if (overlay) overlay.setAttribute('aria-hidden', 'true');
    if (list) buildTocList(list, headings);
    if (mobileList) buildTocList(mobileList, headings);
  }

  function safeDecodeFragment(value) {
    try {
      return decodeURIComponent(value);
    } catch (e) {
      return value;
    }
  }

  function initTocHighlight() {
    var tocLists = document.querySelectorAll('.toc-list');
    tocLists.forEach(function(tocList) {
      var links = tocList.querySelectorAll('a');
      if (!links.length || typeof IntersectionObserver === 'undefined') return;

      var articleBody = document.querySelector('.article-content.markdown-body');
      if (!articleBody) return;
      var headings = articleBody.querySelectorAll('h1, h2, h3, h4');
      if (!headings.length) return;

      var observer = new IntersectionObserver(function(entries) {
        var visibleEntry = null;
        for (var e = 0; e < entries.length; e++) {
          if (entries[e].isIntersecting) {
            visibleEntry = entries[e];
            break;
          }
        }
        if (!visibleEntry) return;

        for (var l = 0; l < links.length; l++) {
          links[l].parentElement.classList.remove('toc-active');
        }

        var targetId = visibleEntry.target.id;
        var tocContent = document.querySelector('.toc-card-widget .toc-content');
        for (var i = 0; i < links.length; i++) {
          var href = links[i].getAttribute('href') || '';
          var hrefId = safeDecodeFragment(href.replace(/^#/, ''));
          if (hrefId === targetId) {
            links[i].parentElement.classList.add('toc-active');
            if (tocContent && typeof links[i].scrollIntoView === 'function') {
              links[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
            break;
          }
        }
      }, {
        rootMargin: '-50px 0px -65% 0px',
        threshold: 0
      });

      for (var i = 0; i < headings.length; i++) observer.observe(headings[i]);
    });
  }

  function initTables() {
    var articleBody = document.querySelector('.article-content.markdown-body');
    if (!articleBody) return;

    var tables = articleBody.querySelectorAll('table');
    tables.forEach(function(table) {
      if (table.getAttribute('data-table-processed')) return;
      table.setAttribute('data-table-processed', 'true');

      var wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';

      var header = document.createElement('div');
      header.className = 'table-header';

      var copyBtn = document.createElement('button');
      copyBtn.className = 'table-copy-btn';
      copyBtn.type = 'button';
      setIconText(copyBtn, copyIcon, '复制 Markdown');
      copyBtn.addEventListener('click', function() {
        copyText(htmlTableToMarkdown(table), function() {
          flashCopied(copyBtn, '复制 Markdown');
        });
      });
      header.appendChild(copyBtn);

      table.parentNode.insertBefore(wrapper, table);
      var scrollDiv = document.createElement('div');
      scrollDiv.className = 'table-scroll';
      wrapper.appendChild(header);
      wrapper.appendChild(scrollDiv);
      scrollDiv.appendChild(table);
    });
  }

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

    var mdLines = [];
    for (var i = 0; i < lines.length; i++) {
      var rowCells = lines[i];
      while (rowCells.length < colCount) rowCells.push('');
      mdLines.push('| ' + rowCells.join(' | ') + ' |');
      if (i === 0) {
        var sep = [];
        for (var sc = 0; sc < colCount; sc++) sep.push('---');
        mdLines.push('| ' + sep.join(' | ') + ' |');
      }
    }
    return mdLines.join('\n');
  }

  function initArticleImages() {
    var articleBody = document.querySelector('.article-content.markdown-body');
    if (!articleBody) return;
    var images = articleBody.querySelectorAll('img');
    if (!images.length) return;

    var lightbox = null;
    var lightboxImage = null;
    var lightboxCaption = null;
    var lastImage = null;

    function ensureLightbox() {
      if (lightbox) return;
      lightbox = document.createElement('div');
      lightbox.className = 'image-lightbox';
      lightbox.setAttribute('aria-hidden', 'true');
      lightbox.setAttribute('role', 'dialog');
      lightbox.setAttribute('aria-label', '图片预览');

      var closeBtn = document.createElement('button');
      closeBtn.className = 'image-lightbox-close';
      closeBtn.type = 'button';
      closeBtn.setAttribute('aria-label', '关闭图片预览');
      closeBtn.textContent = '×';

      lightboxImage = document.createElement('img');
      lightboxCaption = document.createElement('div');
      lightboxCaption.className = 'image-lightbox-caption';

      lightbox.appendChild(closeBtn);
      lightbox.appendChild(lightboxImage);
      lightbox.appendChild(lightboxCaption);
      document.body.appendChild(lightbox);

      closeBtn.addEventListener('click', function() { closeLightbox(true); });
      lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox(true);
      });
    }

    function openLightbox(img) {
      ensureLightbox();
      lastImage = img;
      lightboxImage.src = img.currentSrc || img.src;
      lightboxImage.alt = img.alt || '';
      lightboxCaption.textContent = img.alt || '';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var close = lightbox.querySelector('.image-lightbox-close');
      if (close) close.focus();
    }

    function closeLightbox(returnFocus) {
      if (!lightbox) return;
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (returnFocus && lastImage) lastImage.focus();
    }

    images.forEach(function(img) {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');

      img.addEventListener('error', function() {
        if (img.getAttribute('data-load-error')) return;
        img.setAttribute('data-load-error', 'true');
        var placeholder = document.createElement('span');
        placeholder.className = 'image-error-placeholder';
        placeholder.textContent = (img.alt ? img.alt + '：' : '') + '图片加载失败';
        img.style.display = 'none';
        img.parentNode.insertBefore(placeholder, img.nextSibling);
      });

      if (img.closest('a')) return;
      img.classList.add('article-image-clickable');
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.addEventListener('click', function() { openLightbox(img); });
      img.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(img);
        }
      });
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && lightbox && lightbox.classList.contains('open')) {
        closeLightbox(true);
      }
    });
  }

  function decodeUrlValue(value) {
    try {
      return decodeURIComponent(String(value || '').replace(/\+/g, ' '));
    } catch (e) {
      return String(value || '');
    }
  }

  function initCategoryPageFilter() {
    var index = document.querySelector('[data-categories-index]');
    if (!index) return;

    var groups = Array.prototype.slice.call(index.querySelectorAll('.category-group[data-category]'));
    if (!groups.length) return;

    var bar = document.querySelector('[data-category-filter-bar]');
    var nameTarget = document.querySelector('[data-category-filter-name]');

    function getCategoryFromUrl() {
      var fromQuery = '';
      try {
        fromQuery = new URLSearchParams(window.location.search).get('category') || '';
      } catch (e) {}
      if (fromQuery) return fromQuery.trim();
      if (window.location.hash) return decodeUrlValue(window.location.hash.slice(1)).trim();
      return '';
    }

    function findGroup(category) {
      if (!category) return null;
      for (var i = 0; i < groups.length; i++) {
        if (groups[i].getAttribute('data-category') === category) return groups[i];
      }
      return null;
    }

    function render() {
      var selected = getCategoryFromUrl();
      var activeGroup = findGroup(selected);
      var hasFilter = !!activeGroup;

      groups.forEach(function(group) {
        group.classList.toggle('is-hidden', hasFilter && group !== activeGroup);
      });
      index.classList.toggle('is-filtered', hasFilter);

      if (bar) bar.hidden = !hasFilter;
      if (nameTarget) nameTarget.textContent = hasFilter ? selected : '';
    }

    render();
    window.addEventListener('hashchange', render);
    window.addEventListener('popstate', render);
  }

  function initUtterances() {
    var container = document.getElementById('utterances-container');
    if (!container || container.getAttribute('data-utterances-loaded') === 'true') return;

    var placeholder = document.getElementById('utterances-placeholder');
    var loadButton = document.getElementById('utterances-load-btn');
    var loading = document.getElementById('utterances-loading');
    var fallback = document.getElementById('utterances-fallback');
    var loaded = false;

    function setLoadedState(showFallback) {
      if (placeholder) placeholder.style.display = 'none';
      if (loading) loading.hidden = true;
      if (fallback) fallback.hidden = !showFallback;
    }

    function loadComments() {
      if (loaded) return;
      loaded = true;
      container.setAttribute('data-utterances-loaded', 'true');
      if (placeholder) placeholder.style.display = 'none';
      if (loading) loading.hidden = false;
      if (fallback) fallback.hidden = true;

      var repo = container.getAttribute('data-utterances-repo');
      if (!repo) {
        setLoadedState(true);
        return;
      }

      var done = false;
      var observer = null;
      if (window.MutationObserver) {
        observer = new MutationObserver(function() {
          if (done) return;
          if (container.querySelector('iframe.utterances-frame')) {
            done = true;
            setLoadedState(false);
            observer.disconnect();
          }
        });
        observer.observe(container, { childList: true, subtree: true });
      }

      setTimeout(function() {
        if (done) return;
        if (container.querySelector('iframe.utterances-frame')) {
          done = true;
          setLoadedState(false);
          return;
        }
        done = true;
        if (observer) observer.disconnect();
        setLoadedState(true);
      }, 8000);

      var script = document.createElement('script');
      script.src = 'https://utteranc.es/client.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('repo', repo);
      script.setAttribute('issue-term', container.getAttribute('data-utterances-issue-term') || 'pathname');
      script.setAttribute('theme', container.getAttribute('data-utterances-theme') || 'github-light');
      script.onerror = function() {
        done = true;
        if (observer) observer.disconnect();
        setLoadedState(true);
      };
      container.appendChild(script);
    }

    if (loadButton) loadButton.addEventListener('click', loadComments);
  }

  function initBusuanzi() {
    var hasCounter = document.getElementById('busuanzi_value_site_pv') || document.getElementById('busuanzi_value_page_pv');
    if (!hasCounter || window.__busuanziLoading) return;

    function setCounterFallback() {
      ['busuanzi_value_site_pv', 'busuanzi_value_page_pv'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el && el.textContent === '...') el.textContent = '--';
      });
    }

    function loadBusuanzi() {
      if (window.__busuanziLoading) return;
      window.__busuanziLoading = true;
      var script = document.createElement('script');
      script.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
      script.async = true;
      script.setAttribute('data-busuanzi-loader', 'true');
      var timer = setTimeout(setCounterFallback, 8000);
      script.onload = function() { clearTimeout(timer); };
      script.onerror = function() {
        clearTimeout(timer);
        setCounterFallback();
      };
      document.body.appendChild(script);
    }

    function scheduleLoad() {
      var delay = 2500;
      if (navigator.connection && navigator.connection.saveData) delay = 8000;
      setTimeout(function() {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(loadBusuanzi, { timeout: 5000 });
        } else {
          loadBusuanzi();
        }
      }, delay);
    }

    if (document.readyState === 'complete') scheduleLoad();
    else window.addEventListener('load', scheduleLoad, { once: true });
  }

  var searchDataPromise = null;

  function getSearchJsonUrl() {
    var input = document.getElementById('search_box');
    if (input && input.getAttribute('data-json-url')) return input.getAttribute('data-json-url');
    var page = document.querySelector('[data-search-page]');
    if (page && page.getAttribute('data-json-url')) return page.getAttribute('data-json-url');
    return '/assets/search_data.json';
  }

  function loadSearchData() {
    if (searchDataPromise) return searchDataPromise;
    searchDataPromise = fetch(getSearchJsonUrl(), { credentials: 'same-origin' })
      .then(function(response) {
        if (!response.ok) throw new Error('Search index HTTP ' + response.status);
        return response.json();
      })
      .then(function(data) {
        return Array.isArray(data) ? data : [];
      });
    return searchDataPromise;
  }

  function splitTags(value) {
    return String(value || '')
      .split(',')
      .map(function(tag) { return tag.trim(); })
      .filter(Boolean);
  }

  function normalizeResultUrl(url) {
    url = String(url || '');
    if (!url) return '#';
    try {
      var parsed = new URL(url, window.location.href);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.href;
    } catch (e) {}
    return '#';
  }

  function initRandomPostLinks() {
    var links = document.querySelectorAll('[data-random-post]');
    if (!links.length) return;

    Array.prototype.forEach.call(links, function(link) {
      link.addEventListener('click', function(e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();

        var fallbackUrl = link.href;
        link.classList.add('is-loading');

        loadSearchData().then(function(data) {
          var currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
          var candidates = data.filter(function(item) {
            if (!item || !item.url) return false;
            try {
              var parsed = new URL(item.url, window.location.href);
              return parsed.pathname.replace(/\/index\.html$/, '/') !== currentPath;
            } catch (err) {
              return false;
            }
          });

          if (!candidates.length) {
            window.location.href = fallbackUrl;
            return;
          }

          var pick = candidates[Math.floor(Math.random() * candidates.length)];
          window.location.href = normalizeResultUrl(pick.url);
        }).catch(function() {
          window.location.href = fallbackUrl;
        }).then(function() {
          link.classList.remove('is-loading');
        });
      });
    });
  }

  function appendHighlightedText(parent, text, term) {
    text = String(text || '');
    term = String(term || '').trim();
    if (!term) {
      parent.appendChild(document.createTextNode(text));
      return;
    }

    var lower = text.toLowerCase();
    var needle = term.toLowerCase();
    var cursor = 0;
    var idx = lower.indexOf(needle);
    while (idx >= 0) {
      if (idx > cursor) parent.appendChild(document.createTextNode(text.slice(cursor, idx)));
      var mark = document.createElement('mark');
      mark.className = 'search-highlight';
      mark.textContent = text.slice(idx, idx + term.length);
      parent.appendChild(mark);
      cursor = idx + term.length;
      idx = lower.indexOf(needle, cursor);
    }
    if (cursor < text.length) parent.appendChild(document.createTextNode(text.slice(cursor)));
  }

  function itemMatches(item, state) {
    var category = state.category || '';
    var tag = state.tag || '';
    var term = (state.term || '').trim().toLowerCase();

    if (category && item.category !== category) return false;
    if (tag && splitTags(item.tags).indexOf(tag) < 0) return false;
    if (!term) return true;

    var haystack = [
      item.title,
      item.keywords,
      item.category,
      item.tags,
      item.content
    ].join(' ').toLowerCase();
    return haystack.indexOf(term) >= 0;
  }

  function createResultItem(item, term) {
    var li = document.createElement('li');
    var link = document.createElement('a');
    link.href = normalizeResultUrl(item.url);
    link.title = item.title || '';
    appendHighlightedText(link, item.title || '未命名文章', term);
    li.appendChild(link);

    var metaParts = [];
    if (item.category) metaParts.push(item.category);
    if (item.tags) metaParts.push(item.tags);
    if (metaParts.length) {
      var meta = document.createElement('span');
      meta.className = 'search-result-meta';
      meta.textContent = metaParts.join(' · ');
      li.appendChild(meta);
    }
    return li;
  }

  function renderNoResults(container, text) {
    container.textContent = '';
    var li = document.createElement('li');
    li.className = 'no-results';
    li.textContent = text;
    container.appendChild(li);
  }

  function renderSearchResults(container, data, state, limit, emptyText) {
    container.textContent = '';
    var matches = data.filter(function(item) {
      return itemMatches(item, state);
    });
    var count = 0;
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < matches.length && count < limit; i++) {
      fragment.appendChild(createResultItem(matches[i], state.term));
      count++;
    }
    if (!count) {
      renderNoResults(container, emptyText || '未找到相关内容');
      return matches.length;
    }
    container.appendChild(fragment);
    return matches.length;
  }

  function uniqueValues(data, getter) {
    var map = {};
    var values = [];
    data.forEach(function(item) {
      var raw = getter(item);
      var list = Array.isArray(raw) ? raw : [raw];
      list.forEach(function(value) {
        value = String(value || '').trim();
        if (value && !map[value]) {
          map[value] = true;
          values.push(value);
        }
      });
    });
    return values.sort(function(a, b) { return a.localeCompare(b, 'zh-Hans-CN'); });
  }

  function renderFilterButtons(container, values, activeValue, onSelect) {
    container.textContent = '';
    var allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = activeValue ? 'search-filter-chip' : 'search-filter-chip active';
    allBtn.setAttribute('aria-pressed', activeValue ? 'false' : 'true');
    allBtn.textContent = '全部';
    allBtn.addEventListener('click', function() { onSelect(''); });
    container.appendChild(allBtn);

    values.forEach(function(value) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = value === activeValue ? 'search-filter-chip active' : 'search-filter-chip';
      btn.setAttribute('aria-pressed', value === activeValue ? 'true' : 'false');
      btn.textContent = value;
      btn.addEventListener('click', function() { onSelect(value); });
      container.appendChild(btn);
    });
  }

  function setupSearchPage(data) {
    var page = document.querySelector('[data-search-page]');
    if (!page) return;

    var input = document.getElementById('searchPageBox');
    var results = document.getElementById('searchPageResults');
    var count = document.getElementById('searchPageCount');
    var categoryFilters = document.getElementById('searchCategoryFilters');
    var tagFilters = document.getElementById('searchTagFilters');
    if (!input || !results || !count || !categoryFilters || !tagFilters) return;

    var params = new URLSearchParams(window.location.search);
    var state = {
      term: params.get('q') || '',
      category: params.get('category') || '',
      tag: params.get('tag') || ''
    };

    var categories = uniqueValues(data, function(item) { return item.category; });
    var tags = uniqueValues(data, function(item) { return splitTags(item.tags); });
    input.value = state.term;

    function updateUrl() {
      var next = new URLSearchParams();
      if (state.term) next.set('q', state.term);
      if (state.category) next.set('category', state.category);
      if (state.tag) next.set('tag', state.tag);
      var query = next.toString();
      var url = window.location.pathname + (query ? '?' + query : '');
      window.history.replaceState(null, '', url);
    }

    function render() {
      renderFilterButtons(categoryFilters, categories, state.category, function(value) {
        state.category = value;
        render();
      });
      renderFilterButtons(tagFilters, tags, state.tag, function(value) {
        state.tag = value;
        render();
      });

      var total = renderSearchResults(results, data, state, 80, '未找到相关内容');
      count.textContent = '共 ' + total + ' 篇';
      updateUrl();
    }

    input.addEventListener('input', function(e) {
      state.term = e.target.value.trim();
      render();
    });
    render();
  }

  function setupSearchOverlay() {
    var overlay = document.getElementById('searchOverlay');
    var toggle = document.getElementById('searchToggle');
    var closeBtn = document.getElementById('searchOverlayClose');
    var mobileBox = document.getElementById('mobileSearchBox');
    if (!overlay || !toggle) return;

    function openSearch() {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (mobileBox) setTimeout(function() { mobileBox.focus(); }, 50);
    }

    function closeSearch(returnFocus) {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (returnFocus) toggle.focus();
    }

    window.toggleSearch = function() {
      if (overlay.classList.contains('open')) closeSearch(true);
      else openSearch();
    };

    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      window.toggleSearch();
    });
    if (closeBtn) closeBtn.addEventListener('click', function() { closeSearch(true); });
    document.addEventListener('click', function(e) {
      if (!overlay.classList.contains('open')) return;
      if (!overlay.contains(e.target) && !toggle.contains(e.target)) closeSearch(false);
    });
  }

  function initSearch() {
    var sidebarInput = document.getElementById('search_box');
    var sidebarResults = document.getElementById('search_results');
    var mobileBox = document.getElementById('mobileSearchBox');
    var mobileResults = document.getElementById('mobileSearchResults');
    var searchPage = document.querySelector('[data-search-page]');
    var loaded = false;
    var dataCache = [];

    function handleLoadError(target) {
      if (target) renderNoResults(target, '搜索数据加载失败，请稍后重试');
    }

    function ensureData(callback, target) {
      if (loaded) {
        callback(dataCache);
        return;
      }
      loadSearchData().then(function(data) {
        loaded = true;
        dataCache = data;
        callback(dataCache);
      }).catch(function() {
        handleLoadError(target);
      });
    }

    if (sidebarInput && sidebarResults) {
      sidebarInput.addEventListener('input', function(e) {
        var term = e.target.value.trim();
        if (!term) {
          sidebarResults.textContent = '';
          return;
        }
        ensureData(function(data) {
          renderSearchResults(sidebarResults, data, { term: term }, 20, '未找到相关内容');
        }, sidebarResults);
      });
      sidebarInput.addEventListener('focus', function() { ensureData(function() {}, sidebarResults); }, { once: true });
    }

    if (mobileBox && mobileResults) {
      mobileBox.addEventListener('input', function(e) {
        var term = e.target.value.trim();
        if (!term) {
          mobileResults.textContent = '';
          return;
        }
        ensureData(function(data) {
          renderSearchResults(mobileResults, data, { term: term }, 20, '未找到相关内容');
        }, mobileResults);
      });
      mobileBox.addEventListener('focus', function() { ensureData(function() {}, mobileResults); }, { once: true });
    }

    if (searchPage) {
      ensureData(setupSearchPage, document.getElementById('searchPageResults'));
    }
  }

  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    closeMobileMenu();
    var searchOverlay = document.getElementById('searchOverlay');
    if (searchOverlay && searchOverlay.classList.contains('open') && typeof window.toggleSearch === 'function') {
      window.toggleSearch();
    }
    var tocOverlay = document.getElementById('tocMobileOverlay');
    var tocBtn = document.getElementById('tocMobileBtn');
    if (tocOverlay && tocOverlay.classList.contains('open')) {
      tocOverlay.classList.remove('open');
      tocOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (tocBtn) {
        tocBtn.setAttribute('aria-expanded', 'false');
        tocBtn.focus();
      }
    }
  });

  markPageReady();
  setupHeaderActions();
  setupSearchOverlay();
  setupGotop();
  initMermaidDiagrams();
  initCodeBlocks();
  initToc();
  setupTocToggle();
  initTocHighlight();
  initTables();
  initArticleImages();
  initCategoryPageFilter();
  initUtterances();
  initBusuanzi();
  initRandomPostLinks();
  initSearch();
});
