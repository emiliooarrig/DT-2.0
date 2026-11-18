/* ==========================================================================
   Dulce Tentación — shared UI behaviour (vanilla JS, no dependencies)
   Load with: <script src="shared/ui.js" defer></script>  (../shared/ui.js in subfolders)
   Every module is optional: if its markup is missing on a page, it does nothing.

   Hooks
   - html.js            added by the inline <head> script (and here, as backup)
   - html.ui-ready      added once reveal is initialised (head failsafe checks it)
   - [data-header]      header that gets .is-scrolled after scrolling
   - [data-nav-toggle]  <button aria-controls="menu-principal" aria-expanded="false">
   - [data-nav] / #menu-principal   the <nav> drawer (.is-open while open)
   - html.is-nav-open   while the drawer is open (locks scroll, hides .wa-float)
   - .reveal            → .is-visible when in view
       data-reveal-delay="150"      per-element delay (ms, or any CSS time)
       data-reveal-stagger="80"     on a parent: auto-delays its .reveal children
       data-reveal-repeat           re-animate every time it enters the viewport
   - [data-year]        text replaced with the current year
   - aria-current="page" set on the matching nav/footer link (if not hard-coded)
   Public API: window.DTUI.observe(elOrNodeList) — reveal elements added later.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  root.classList.add('js');

  var reducedMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  function prefersReducedMotion() {
    return !!(reducedMotionQuery && reducedMotionQuery.matches);
  }

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function safely(name, fn) {
    try {
      fn();
    } catch (err) {
      if (window.console && console.warn) {
        console.warn('[ui.js] ' + name + ' failed:', err);
      }
    }
  }

  function onMediaChange(query, handler) {
    if (!query) return;
    if (query.addEventListener) query.addEventListener('change', handler);
    else if (query.addListener) query.addListener(handler);
  }

  /* ------------------------------------------------------------------
     1. Mobile navigation drawer
     ------------------------------------------------------------------ */
  function initNav() {
    var toggle = doc.querySelector('[data-nav-toggle]');
    if (!toggle) return;

    var controlsId = toggle.getAttribute('aria-controls');
    var nav = (controlsId && doc.getElementById(controlsId)) || doc.querySelector('[data-nav]');
    if (!nav) return;

    var desktopQuery = window.matchMedia ? window.matchMedia('(min-width: 1024px)') : null;

    function isOpen() {
      return toggle.getAttribute('aria-expanded') === 'true';
    }

    function setOpen(open, returnFocus) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
      root.classList.toggle('is-nav-open', open);

      if (open) {
        var first = nav.querySelector('a[href], button:not([disabled])');
        if (first) {
          try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
        }
      } else if (returnFocus) {
        toggle.focus();
      }
    }

    toggle.addEventListener('click', function (event) {
      event.stopPropagation();
      setOpen(!isOpen());
    });

    // Close after choosing a link inside the drawer
    nav.addEventListener('click', function (event) {
      var target = event.target;
      if (target && target.closest && target.closest('a[href]') && isOpen()) {
        setOpen(false);
      }
    });

    // Escape closes and returns focus to the toggle
    doc.addEventListener('keydown', function (event) {
      if ((event.key === 'Escape' || event.key === 'Esc') && isOpen()) {
        setOpen(false, true);
      }
    });

    // Click outside (including the backdrop) closes
    doc.addEventListener('click', function (event) {
      if (!isOpen()) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      setOpen(false);
    });

    // Keyboard focus leaving the drawer closes it
    doc.addEventListener('focusin', function (event) {
      if (!isOpen()) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      setOpen(false);
    });

    // Switching to the desktop layout resets the drawer
    onMediaChange(desktopQuery, function (event) {
      if (event.matches && isOpen()) setOpen(false);
    });

    // Initial state (in case the markup was saved with the wrong value)
    setOpen(false);
  }

  /* ------------------------------------------------------------------
     2. Header shrink / shadow on scroll
     ------------------------------------------------------------------ */
  function initHeader() {
    var header = doc.querySelector('[data-header]') || doc.querySelector('.site-header');
    if (!header) return;

    var ON_AT = 24;  // px scrolled before shrinking
    var OFF_AT = 8;  // hysteresis: px to grow back (avoids flicker)
    var scrolled = false;
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.pageYOffset || root.scrollTop || 0;
      var next = scrolled ? y > OFF_AT : y > ON_AT;
      if (next !== scrolled) {
        scrolled = next;
        header.classList.toggle('is-scrolled', scrolled);
      }
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    update();
  }

  /* ------------------------------------------------------------------
     3. Reveal on scroll
     ------------------------------------------------------------------ */
  var revealObserver = null;

  function showAll(elements) {
    toArray(elements).forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  function applyDelays(scope) {
    var base = scope || doc;

    // Parent-driven stagger: <div data-reveal-stagger="80"> .reveal children </div>
    var groups = toArray(base.querySelectorAll('[data-reveal-stagger]'));
    if (base.hasAttribute && base.hasAttribute('data-reveal-stagger')) groups.unshift(base);
    groups.forEach(function (group) {
      var step = parseInt(group.getAttribute('data-reveal-stagger'), 10);
      if (isNaN(step)) step = 80;
      toArray(group.querySelectorAll('.reveal')).forEach(function (el, index) {
        if (!el.hasAttribute('data-reveal-delay') && !el.style.getPropertyValue('--reveal-delay')) {
          el.style.setProperty('--reveal-delay', (index * step) + 'ms');
        }
      });
    });

    // Per-element delay: data-reveal-delay="150" (ms) or "0.2s"
    toArray(base.querySelectorAll('[data-reveal-delay]')).forEach(function (el) {
      var value = (el.getAttribute('data-reveal-delay') || '').trim();
      if (!value) return;
      el.style.setProperty('--reveal-delay', /^\d+(\.\d+)?$/.test(value) ? value + 'ms' : value);
    });
  }

  function observe(target) {
    var elements;
    if (!target) return;
    if (target.nodeType === 1) {
      elements = target.classList.contains('reveal') ? [target] : [];
      elements = elements.concat(toArray(target.querySelectorAll('.reveal')));
      applyDelays(target);
    } else {
      elements = toArray(target);
    }

    if (!revealObserver) {
      showAll(elements);
      return;
    }
    elements.forEach(function (el) {
      if (!el.classList.contains('is-visible')) revealObserver.observe(el);
    });
  }

  function initReveal() {
    var elements = doc.querySelectorAll('.reveal');
    applyDelays(doc);

    if (!elements.length) return;

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      showAll(elements);
      return;
    }

    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        var repeat = el.hasAttribute('data-reveal-repeat');
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          if (!repeat) revealObserver.unobserve(el);
        } else if (repeat) {
          el.classList.remove('is-visible');
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0
    });

    toArray(elements).forEach(function (el) {
      revealObserver.observe(el);
    });

    // If the user switches on "reduce motion" mid-visit, show everything
    onMediaChange(reducedMotionQuery, function (event) {
      if (event.matches) showAll(doc.querySelectorAll('.reveal'));
    });
  }

  /* ------------------------------------------------------------------
     4. Current page → aria-current="page"
     ------------------------------------------------------------------ */
  function normalizePath(pathname) {
    var path = pathname || '/';
    try { path = decodeURIComponent(path); } catch (e) { /* keep raw */ }
    path = path
      .replace(/\/index\.html?$/i, '/')
      .replace(/\.html?$/i, '')
      .replace(/\/+$/, '');
    return path || '/';
  }

  function initCurrentLink() {
    var current = normalizePath(window.location.pathname);
    var groups = [
      doc.querySelectorAll('.site-nav__link'),
      doc.querySelectorAll('.site-footer__links a')
    ];

    groups.forEach(function (links) {
      links = toArray(links);
      if (!links.length) return;
      // Respect hard-coded aria-current in this group
      var hasManual = links.some(function (a) { return a.hasAttribute('aria-current'); });
      if (hasManual) return;

      links.forEach(function (a) {
        if (!a.href || a.target === '_blank') return;
        var url;
        try { url = new URL(a.href, window.location.href); } catch (e) { return; }
        if (url.origin !== window.location.origin && window.location.protocol !== 'file:') return;
        if (normalizePath(url.pathname) === current) {
          a.setAttribute('aria-current', 'page');
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     5. Current year
     ------------------------------------------------------------------ */
  function initYear() {
    var year = String(new Date().getFullYear());
    toArray(doc.querySelectorAll('[data-year]')).forEach(function (el) {
      el.textContent = year;
    });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  function boot() {
    try {
      initReveal();
    } catch (err) {
      // Never leave content hidden if reveal setup fails
      revealObserver = null;
      showAll(doc.querySelectorAll('.reveal'));
      if (window.console && console.warn) console.warn('[ui.js] reveal failed:', err);
    }
    // Signals to the head failsafe that reveal content is handled.
    root.classList.add('ui-ready');
    safely('nav', initNav);
    safely('header', initHeader);
    safely('current link', initCurrentLink);
    safely('year', initYear);
  }

  window.DTUI = {
    observe: observe,
    refresh: function () { observe(doc.body); }
  };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
