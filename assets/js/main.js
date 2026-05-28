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

  // ===== 2. 图片懒加载 =====
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('article.content img[src]').forEach(function(img) {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }

  // ===== 3. 代码块：语言标签 + 复制按钮 =====
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

  // ===== 4. TOC 滚动高亮增强 =====
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
        for (var l = 0; l < links.length; l++) {
          var href = links[l].getAttribute('href');
          if (href === '#' + targetId) {
            links[l].parentElement.classList.add('toc-active');
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

});
