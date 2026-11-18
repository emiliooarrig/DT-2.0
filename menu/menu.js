/* ==========================================================================
   Dulce Tentación — Menú / Productos
   Sticky category bar:
     - keeps --menu-header-h / --menu-cats-h in sync with real heights
     - highlights the chip of the category in view (aria-current="true")
     - keeps the active chip visible inside the horizontally scrolling row
     - edge fades when the row overflows, shadow when the bar is stuck
   Smooth scrolling on chip click comes from CSS (scroll-behavior: smooth,
   disabled under prefers-reduced-motion in shared/base.css).
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var nav = doc.querySelector('[data-menu-cats]');
  if (!nav) return;

  var list = nav.querySelector('[data-menu-cats-list]') || nav;
  var header = doc.querySelector('[data-header]');
  var reduceQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function reducedMotion() {
    return !!(reduceQuery && reduceQuery.matches);
  }

  // Chip ↔ section pairs (only chips whose target exists)
  var items = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'))
    .map(function (link) {
      var id = decodeURIComponent(link.getAttribute('href').slice(1));
      var section = id ? doc.getElementById(id) : null;
      return section ? { link: link, section: section } : null;
    })
    .filter(Boolean);

  if (!items.length) return;

  var activeItem = null;
  var lockUntil = 0;            // ignore observer updates while a click-scroll runs
  var visible = new Set();
  var observer = null;
  var observerTop = -1;

  /* ---------- 1. Measured offsets ---------- */
  function headerHeight() {
    return header ? Math.round(header.getBoundingClientRect().height) : 0;
  }

  function setOffsets() {
    var hh = headerHeight();
    root.style.setProperty('--menu-header-h', hh + 'px');
    root.style.setProperty('--menu-cats-h', Math.round(nav.getBoundingClientRect().height) + 'px');
    buildObserver();
    updateStuck();
    updateFades();
  }

  /* ---------- 2. Active chip ---------- */
  function setActive(item, opts) {
    if (item === activeItem) return;
    if (activeItem) activeItem.link.removeAttribute('aria-current');
    activeItem = item;
    if (item) {
      item.link.setAttribute('aria-current', 'true');
      if (!opts || opts.reveal !== false) revealChip(item.link);
    }
  }

  function pickFromVisible() {
    // First visible category in document order wins; keep the current one if none
    for (var i = 0; i < items.length; i++) {
      if (visible.has(items[i].section)) return items[i];
    }
    return null;
  }

  function onIntersect(entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    });
    if (Date.now() < lockUntil) return;
    var next = pickFromVisible();
    if (next) setActive(next);
  }

  function buildObserver() {
    if (!('IntersectionObserver' in window)) return;
    // "Reading band": from just under the sticky bar down to 45% of the viewport
    var top = headerHeight() + Math.round(nav.getBoundingClientRect().height) + 8;
    if (Math.abs(top - observerTop) < 4 && observer) return;
    observerTop = top;
    if (observer) observer.disconnect();
    visible.clear();
    observer = new IntersectionObserver(onIntersect, {
      root: null,
      rootMargin: '-' + top + 'px 0px -55% 0px',
      threshold: 0
    });
    items.forEach(function (item) { observer.observe(item.section); });
  }

  /* ---------- 3. Keep the active chip in view (horizontal only) ---------- */
  function revealChip(link) {
    var max = list.scrollWidth - list.clientWidth;
    if (max <= 1) return;
    var target = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2;
    target = Math.max(0, Math.min(max, target));
    if (typeof list.scrollTo === 'function') {
      list.scrollTo({ left: target, behavior: reducedMotion() ? 'auto' : 'smooth' });
    } else {
      list.scrollLeft = target;
    }
  }

  /* ---------- 4. Overflow fades + stuck shadow ---------- */
  function updateFades() {
    var max = list.scrollWidth - list.clientWidth;
    var x = list.scrollLeft;
    nav.classList.toggle('has-fade-start', max > 1 && x > 2);
    nav.classList.toggle('has-fade-end', max > 1 && x < max - 2);
  }

  function updateStuck() {
    var top = nav.getBoundingClientRect().top;
    nav.classList.toggle('is-stuck', window.scrollY > 0 && top <= headerHeight() + 1);
  }

  /* ---------- 5. Chip click ---------- */
  function unlockSoon(ms) {
    lockUntil = Date.now() + ms;
  }

  items.forEach(function (item) {
    item.link.addEventListener('click', function () {
      setActive(item);
      // Let the smooth scroll finish before the observer takes over again
      unlockSoon(reducedMotion() ? 150 : 1200);
    });
  });

  // Where supported, release the lock as soon as the smooth scroll ends
  if ('onscrollend' in window) {
    window.addEventListener('scrollend', function () {
      if (Date.now() >= lockUntil) return;
      lockUntil = 0;
      var next = pickFromVisible();
      if (next) setActive(next);
    });
  }

  /* ---------- 6. Wiring ---------- */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      updateStuck();
    });
  }, { passive: true });

  list.addEventListener('scroll', updateFades, { passive: true });

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      setOffsets();
      if (activeItem) revealChip(activeItem.link);
    }, 120);
  });

  // Header shrinks on scroll (ui.js) → follow its real height
  if ('ResizeObserver' in window && header) {
    new ResizeObserver(function () {
      root.style.setProperty('--menu-header-h', headerHeight() + 'px');
    }).observe(header);
  }

  // Initial state (incl. arriving with #chocolates etc. from the home page)
  setOffsets();
  if (location.hash) {
    var initial = items.filter(function (item) { return '#' + item.section.id === location.hash; })[0];
    if (initial) setActive(initial);
  }
})();
