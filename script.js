/* ===========================================================
   Szlakiem Smaku — wspólne interakcje
   • pasek postępu czytania
   • stan „scrolled" przyklejonej nawigacji
   • odsłanianie sekcji przy przewijaniu (scroll-reveal)
   Bez zależności. W pełni szanuje prefers-reduced-motion oraz brak JS.
   =========================================================== */
(function () {
  'use strict';

  // sygnał dla CSS, że JS jest aktywny (stan początkowy reveal włącza się tylko wtedy)
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(function () {
    /* --- pasek postępu czytania --- */
    var progress = document.createElement('div');
    progress.id = 'reading-progress';
    document.body.appendChild(progress);

    var stickyHeader = document.querySelector('header.sticky-bar');
    var ticking = false;

    function updateOnScroll() {
      var doc = document.documentElement;
      var scrollTop = window.pageYOffset || doc.scrollTop;
      var height = doc.scrollHeight - doc.clientHeight;
      var ratio = height > 0 ? Math.min(scrollTop / height, 1) : 0;
      progress.style.transform = 'scaleX(' + ratio + ')';

      if (stickyHeader) {
        stickyHeader.classList.toggle('scrolled', scrollTop > 8);
      }
      ticking = false;
    }

    function requestUpdate() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateOnScroll);
      }
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    updateOnScroll();

    /* --- scroll-reveal --- */
    var selectors = [
      'section', 'article', '.card', '.news-item', '.team-card',
      '.category-card', '.lead', '.sources', '.ethics-box', '.hero',
      'article#main > h2', 'article#main > p', 'article#main > img'
    ];
    var nodes = [];
    selectors.forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        if (nodes.indexOf(el) === -1) nodes.push(el);
      });
    });

    // jeśli ruch ograniczony lub brak IntersectionObserver — pokaż wszystko od razu
    if (reduceMotion || !('IntersectionObserver' in window)) {
      nodes.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    nodes.forEach(function (el) { el.setAttribute('data-reveal', ''); });

    var io = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    nodes.forEach(function (el) { io.observe(el); });
  });
})();
