/* ==========================================================================
   Dulce Tentación — HOME page script
   Infinite, auto-rotating carousel ("Nuestros productos").
   - Circular: the first/last slides are cloned at both ends; after moving
     onto a clone the track jumps (without transition) to the real slide,
     so the photos keep cycling forever in the same direction.
   - Autoplay every AUTOPLAY_MS. Pauses only when it should: pause button,
     keyboard focus inside, while dragging, off-screen, or tab hidden.
     Disabled when the user prefers reduced motion (pause button hidden).
   - Prev / next buttons, dots (aria-current), arrow keys, swipe / drag,
     click on a neighbouring slide.
   Nav, reveal and footer year are handled by shared/ui.js.
   ========================================================================== */
(function () {
  'use strict';

  var AUTOPLAY_MS = 3500;
  var CLONES = 2;          // clones on each side (enough to fill the edges)
  var SWIPE_PX = 50;       // drag distance that counts as a swipe

  function initCarousel(root) {
    var viewport = root.querySelector('.home-carousel__viewport');
    var track = root.querySelector('.home-carousel__track');
    if (!viewport || !track) return;

    var realSlides = Array.prototype.slice.call(track.querySelectorAll('.home-carousel__slide'));
    var count = realSlides.length;
    if (count < 2) return;

    var dots = Array.prototype.slice.call(root.querySelectorAll('.home-carousel__dot'));
    var prevBtn = root.querySelector('[data-carousel-prev]');
    var nextBtn = root.querySelector('[data-carousel-next]');
    var toggleBtn = root.querySelector('[data-carousel-toggle]');
    var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

    /* ---------- Clones for the infinite loop ---------- */
    var clones = Math.min(CLONES, count);
    function makeClone(slide) {
      var clone = slide.cloneNode(true);
      clone.classList.add('is-clone');
      clone.setAttribute('aria-hidden', 'true');
      clone.removeAttribute('role');
      clone.removeAttribute('aria-roledescription');
      clone.removeAttribute('aria-label');
      return clone;
    }
    for (var c = 0; c < clones; c++) {
      track.insertBefore(makeClone(realSlides[count - 1 - c]), track.firstChild);
      track.appendChild(makeClone(realSlides[c]));
    }
    var all = Array.prototype.slice.call(track.querySelectorAll('.home-carousel__slide'));

    var pos = clones;        // DOM position of the current slide (real slide 0)
    var settleTimer = null;

    function reducedMotion() {
      return !!(motionQuery && motionQuery.matches);
    }

    function realIndex(p) {
      return (((p - clones) % count) + count) % count;
    }

    function offsetFor(p) {
      var slide = all[p];
      return viewport.clientWidth / 2 - (slide.offsetLeft + slide.offsetWidth / 2);
    }

    function setTransform(x) {
      track.style.transform = 'translate3d(' + x + 'px, 0, 0)';
    }

    function markActive() {
      var current = realIndex(pos);
      all.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === pos);
      });
      dots.forEach(function (dot, i) {
        if (i === current) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    }

    function render(animate) {
      var smooth = animate && !reducedMotion();
      root.classList.toggle('is-animating', smooth);
      setTransform(offsetFor(pos));
      markActive();
      window.clearTimeout(settleTimer);
      if (smooth) {
        // Fallback in case transitionend doesn't fire
        settleTimer = window.setTimeout(settle, 900);
      } else {
        settle();
      }
    }

    // If we're resting on a clone, jump invisibly to the matching real slide
    function settle() {
      window.clearTimeout(settleTimer);
      root.classList.remove('is-animating');
      if (pos >= clones && pos < clones + count) return;
      root.classList.add('is-jumping');
      pos = clones + realIndex(pos);
      setTransform(offsetFor(pos));
      markActive();
      void track.offsetWidth; // flush styles before re-enabling transitions
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          root.classList.remove('is-jumping');
        });
      });
    }

    track.addEventListener('transitionend', function (event) {
      if (event.target === track && event.propertyName === 'transform') settle();
    });

    function step(delta) {
      // Out of the clone buffer (e.g. very fast clicks)? Re-centre first.
      if (pos + delta < 0 || pos + delta > all.length - 1) settle();
      pos += delta;
      render(true);
    }

    function goToReal(index) {
      pos = clones + index;
      render(true);
    }

    /* ---------- Buttons, dots, keyboard ---------- */
    if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); restart(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { step(1); restart(); });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goToReal(i); restart(); });
    });

    track.addEventListener('keydown', function (event) {
      var handled = true;
      if (event.key === 'ArrowRight') step(1);
      else if (event.key === 'ArrowLeft') step(-1);
      else if (event.key === 'Home') goToReal(0);
      else if (event.key === 'End') goToReal(count - 1);
      else handled = false;
      if (handled) {
        event.preventDefault();
        restart();
      }
    });

    /* ---------- Swipe / drag (pointer events) ---------- */
    var drag = null;

    viewport.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      settle();
      drag = { id: event.pointerId, startX: event.clientX, base: offsetFor(pos), dx: 0, moved: false };
      root.classList.remove('is-animating');
      update();
    });

    viewport.addEventListener('pointermove', function (event) {
      if (!drag || event.pointerId !== drag.id) return;
      drag.dx = event.clientX - drag.startX;
      if (!drag.moved && Math.abs(drag.dx) > 6) {
        drag.moved = true;
        root.classList.add('is-dragging');
        try { viewport.setPointerCapture(event.pointerId); } catch (e) { /* ignore */ }
      }
      if (drag.moved) setTransform(drag.base + drag.dx);
    });

    function endDrag(event) {
      if (!drag || (event && event.pointerId !== drag.id)) return;
      var d = drag;
      drag = null;
      root.classList.remove('is-dragging');
      if (d.moved) {
        root.dataset.justDragged = '1';
        window.setTimeout(function () { delete root.dataset.justDragged; }, 0);
        if (d.dx <= -SWIPE_PX) step(1);
        else if (d.dx >= SWIPE_PX) step(-1);
        else render(true); // snap back
      }
      restart();
    }

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', function (event) {
      if (drag && drag.moved) {
        drag = null;
        root.classList.remove('is-dragging');
        render(true);
      }
      drag = null;
      restart();
    });

    // Clicking a neighbouring slide brings it to the centre
    track.addEventListener('click', function (event) {
      if (root.dataset.justDragged) return;
      var slide = event.target.closest('.home-carousel__slide');
      if (!slide) return;
      var index = all.indexOf(slide);
      if (index !== -1 && index !== pos) {
        step(index - pos);
        restart();
      }
    });

    /* ---------- Autoplay ---------- */
    var timer = null;
    var userPaused = false;
    var keyboardFocus = false;
    var inView = true;

    function shouldRun() {
      return !reducedMotion() && !userPaused && !keyboardFocus && !drag && inView && !document.hidden;
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      // Announce slide changes only when the user is driving the carousel
      track.setAttribute('aria-live', 'polite');
    }

    function start() {
      if (timer || !shouldRun()) return;
      track.setAttribute('aria-live', 'off');
      timer = window.setInterval(function () { step(1); }, AUTOPLAY_MS);
    }

    function update() {
      if (shouldRun()) start();
      else stop();
    }

    function restart() {
      stop();
      update();
    }

    function renderToggle() {
      if (!toggleBtn) return;
      if (reducedMotion()) {
        toggleBtn.hidden = true;
        return;
      }
      toggleBtn.hidden = false;
      var icon = toggleBtn.querySelector('i');
      toggleBtn.setAttribute('aria-label', userPaused ? 'Reanudar carrusel' : 'Pausar carrusel');
      toggleBtn.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
      if (icon) {
        icon.classList.toggle('fa-pause', !userPaused);
        icon.classList.toggle('fa-play', userPaused);
      }
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        userPaused = !userPaused;
        renderToggle();
        restart();
      });
    }

    // Pause for keyboard users only (mouse clicks don't stop the rotation)
    root.addEventListener('focusin', function (event) {
      var target = event.target;
      var visible = false;
      try { visible = target.matches(':focus-visible'); } catch (e) { visible = true; }
      if (visible && target !== toggleBtn) {
        keyboardFocus = true;
        update();
      }
    });
    root.addEventListener('focusout', function (event) {
      if (!root.contains(event.relatedTarget)) {
        keyboardFocus = false;
        update();
      }
    });

    document.addEventListener('visibilitychange', update);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        update();
      }, { threshold: 0.25 }).observe(root);
    }

    if (motionQuery) {
      var onMotionChange = function () {
        renderToggle();
        restart();
      };
      if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotionChange);
      else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);
    }

    /* ---------- Resize: keep the current slide centred ---------- */
    var resizeRaf = 0;
    function onResize() {
      if (resizeRaf) return;
      resizeRaf = window.requestAnimationFrame(function () {
        resizeRaf = 0;
        if (!drag) render(false);
      });
    }
    if ('ResizeObserver' in window) {
      new ResizeObserver(onResize).observe(viewport);
    } else {
      window.addEventListener('resize', onResize);
    }

    /* ---------- Init ---------- */
    render(false);
    root.classList.add('is-ready');
    renderToggle();
    update();
  }

  function init() {
    var carousels = document.querySelectorAll('[data-home-carousel]');
    Array.prototype.forEach.call(carousels, initCarousel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
