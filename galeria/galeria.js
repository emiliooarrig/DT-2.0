/* ==========================================================================
   Dulce Tentación — Galería
   - Filter chips (aria-pressed) with animated filtering + live result count
   - Accessible lightbox on native <dialog> (showModal): prev/next, arrow keys,
     Escape, swipe, counter, neighbour preloading, focus return, scroll lock.
   Progressive enhancement: without JS each photo is a plain link to the image.
   Grid layout (row-ordered masonry) is pure CSS: see galeria.css.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var grid = doc.querySelector('[data-galeria-grid]');
  if (!grid) return;

  var items = Array.prototype.slice.call(grid.querySelectorAll('.galeria-item'));
  var chips = Array.prototype.slice.call(doc.querySelectorAll('.galeria-chip[data-filter]'));
  var statusEl = doc.querySelector('[data-galeria-status]');
  var reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  var LABELS = {
    todos: 'Todos',
    navidad: 'Navidad',
    panques: 'Panqués',
    chocolate: 'Chocolate',
    regalos: 'Regalos'
  };

  function reducedMotion() {
    return !!(reduceMotionQuery && reduceMotionQuery.matches);
  }

  function categoriesOf(item) {
    return (item.getAttribute('data-category') || '').split(/\s+/).filter(Boolean);
  }

  function matches(item, filter) {
    return filter === 'todos' || categoriesOf(item).indexOf(filter) !== -1;
  }

  function visibleItems() {
    return items.filter(function (item) { return !item.hidden; });
  }

  /* ------------------------------------------------------------------
     Reveal helpers (shared/ui.js API)
     ------------------------------------------------------------------ */
  // Small left-to-right stagger based on the column each item lands in.
  function staggerByColumn(list) {
    if (!list.length) return;
    var gridLeft = grid.getBoundingClientRect().left;
    var colWidth = list[0].getBoundingClientRect().width || 1;
    list.forEach(function (item) {
      var col = Math.round((item.getBoundingClientRect().left - gridLeft) / colWidth);
      item.style.setProperty('--reveal-delay', Math.max(0, Math.min(col, 4)) * 70 + 'ms');
    });
  }

  function reveal(list) {
    if (window.DTUI && typeof window.DTUI.observe === 'function') {
      list.forEach(function (item) { window.DTUI.observe(item); });
    } else {
      list.forEach(function (item) { item.classList.add('is-visible'); });
    }
  }

  /* ------------------------------------------------------------------
     Filtering
     ------------------------------------------------------------------ */
  var currentFilter = 'todos';
  var filterTimer = null;

  function countFor(filter) {
    return items.filter(function (item) { return matches(item, filter); }).length;
  }

  function announce(filter, count) {
    if (!statusEl) return;
    var text;
    if (filter === 'todos') {
      text = 'Mostrando las ' + count + ' fotos';
    } else {
      text = 'Mostrando ' + count + (count === 1 ? ' foto' : ' fotos') + ' de ' + LABELS[filter];
    }
    statusEl.textContent = text;
  }

  function swapItems(filter) {
    var shown = [];
    items.forEach(function (item) {
      var show = matches(item, filter);
      item.hidden = !show;
      if (show) {
        item.classList.remove('is-visible');
        shown.push(item);
      }
    });
    staggerByColumn(shown);
    reveal(shown);
    return shown.length;
  }

  function applyFilter(filter) {
    if (!LABELS[filter] || filter === currentFilter) return;
    currentFilter = filter;

    chips.forEach(function (chip) {
      chip.setAttribute('aria-pressed', String(chip.getAttribute('data-filter') === filter));
    });

    window.clearTimeout(filterTimer);

    if (reducedMotion()) {
      grid.classList.remove('is-filtering');
      announce(filter, swapItems(filter));
      return;
    }

    grid.classList.add('is-filtering');
    filterTimer = window.setTimeout(function () {
      var count = swapItems(filter);
      grid.classList.remove('is-filtering');
      announce(filter, count);
    }, 170);
  }

  chips.forEach(function (chip) {
    var filter = chip.getAttribute('data-filter');
    var countEl = chip.querySelector('[data-count]');
    if (countEl) countEl.textContent = String(countFor(filter));
    chip.addEventListener('click', function () { applyFilter(filter); });
  });

  // Initial column-based stagger for the first reveal (before ui.js boots on DOMContentLoaded)
  staggerByColumn(items);

  /* ------------------------------------------------------------------
     Lightbox
     ------------------------------------------------------------------ */
  var dialog = doc.querySelector('[data-lightbox]');
  if (!dialog || typeof dialog.showModal !== 'function') return; // fall back to plain links

  var wrap = dialog.querySelector('[data-lb-wrap]');
  var stage = dialog.querySelector('[data-lb-stage]');
  var lbSource = dialog.querySelector('[data-lb-source]');
  var lbImg = dialog.querySelector('[data-lb-img]');
  var lbTitle = dialog.querySelector('[data-lb-title]');
  var lbIndex = dialog.querySelector('[data-lb-index]');
  var lbTotal = dialog.querySelector('[data-lb-total]');
  var btnPrev = dialog.querySelector('[data-lb-prev]');
  var btnNext = dialog.querySelector('[data-lb-next]');
  var btnClose = dialog.querySelector('[data-lb-close]');

  var sequence = [];   // visible items when the lightbox was opened (respects filter)
  var position = 0;
  var preloaded = {};
  var switchToken = 0;

  function dataOf(item) {
    var link = item.querySelector('.galeria-item__link');
    var img = item.querySelector('img');
    var caption = item.querySelector('.galeria-item__caption');
    return {
      link: link,
      jpg: link.getAttribute('href'),
      webp: link.getAttribute('data-webp') || '',
      alt: img ? img.getAttribute('alt') : '',
      width: img ? img.getAttribute('width') : '',
      height: img ? img.getAttribute('height') : '',
      caption: caption ? caption.textContent.trim() : ''
    };
  }

  function preload(item) {
    var data = dataOf(item);
    var url = data.webp || data.jpg;
    if (!url || preloaded[url]) return;
    var img = new Image();
    img.decoding = 'async';
    img.src = url;
    preloaded[url] = img;
  }

  function preloadNeighbours() {
    var total = sequence.length;
    if (total < 2) return;
    preload(sequence[(position + 1) % total]);
    preload(sequence[(position - 1 + total) % total]);
  }

  function render(direction) {
    var item = sequence[position];
    var data = dataOf(item);
    var token = ++switchToken;
    var animate = !!direction && !reducedMotion();

    function setImage() {
      if (token !== switchToken) return;
      if (lbSource) lbSource.setAttribute('srcset', data.webp || data.jpg);
      lbImg.setAttribute('width', data.width);
      lbImg.setAttribute('height', data.height);
      lbImg.alt = data.alt;
      lbImg.src = data.jpg;

      var done = function () {
        if (token !== switchToken) return;
        lbImg.classList.remove('is-switching');
      };
      if (typeof lbImg.decode === 'function') {
        lbImg.decode().then(done, done);
      } else {
        done();
      }
    }

    lbTitle.textContent = data.caption;
    lbIndex.textContent = String(position + 1);
    lbTotal.textContent = String(sequence.length);

    var single = sequence.length < 2;
    btnPrev.hidden = single;
    btnNext.hidden = single;

    if (animate) {
      stage.style.setProperty('--lb-dir', direction > 0 ? '1' : '-1');
      lbImg.classList.add('is-switching');
      window.setTimeout(setImage, 160);
    } else {
      lbImg.classList.remove('is-switching');
      setImage();
    }

    preloadNeighbours();
  }

  function go(step) {
    var total = sequence.length;
    if (total < 2) return;
    position = (position + step + total) % total;
    render(step);
  }

  function open(item) {
    sequence = visibleItems();
    position = Math.max(0, sequence.indexOf(item));
    render(0);
    root.classList.add('galeria-lock');
    dialog.showModal();
    btnClose.focus();
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  // Cleanup for every way of closing (button, Escape, backdrop)
  dialog.addEventListener('close', function () {
    root.classList.remove('galeria-lock');
    var current = sequence[position];
    var link = current && current.querySelector('.galeria-item__link');
    if (link) {
      link.focus({ preventScroll: true });
      if (link.scrollIntoView) {
        var rect = link.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          link.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
        }
      }
    }
  });

  items.forEach(function (item) {
    var link = item.querySelector('.galeria-item__link');
    if (!link) return;
    link.addEventListener('click', function (event) {
      // Let modified clicks open the image in a new tab as usual
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      open(item);
    });
  });

  btnPrev.addEventListener('click', function () { go(-1); });
  btnNext.addEventListener('click', function () { go(1); });
  btnClose.addEventListener('click', close);

  // Click on the dark area around the panel closes
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog || event.target === wrap) close();
  });

  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    }
  });

  // Swipe (touch)
  var touchX = null;
  var touchY = null;
  stage.addEventListener('touchstart', function (event) {
    if (event.touches.length !== 1) { touchX = null; return; }
    touchX = event.touches[0].clientX;
    touchY = event.touches[0].clientY;
  }, { passive: true });

  stage.addEventListener('touchend', function (event) {
    if (touchX === null) return;
    var touch = event.changedTouches[0];
    var dx = touch.clientX - touchX;
    var dy = touch.clientY - touchY;
    touchX = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      go(dx < 0 ? 1 : -1);
    }
  }, { passive: true });
})();
