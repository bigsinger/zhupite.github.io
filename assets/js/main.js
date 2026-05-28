/**
 * main.js — 原生 JavaScript 版（重写于 2026-05-28）
 * 替代 jQuery 依赖：gotop 回到顶部、图片懒加载
 */

document.addEventListener('DOMContentLoaded', function() {

  // ===== 1. 回到顶部 (gotop) =====
  var gotop = document.querySelector('.gotop');
  if (gotop) {
    // 显示/隐藏逻辑
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

    // 点击回到顶部
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

});
