/* Smooth, responsive scrolling for every page (index.html and challenge.html).
 *
 * - Wheel scrolling is smoothed by Lenis (vendored, assets/vendor/lenis-1.3.27.min.js).
 *   It scrolls the real window, so position: sticky, scrollbar dragging and keyboard
 *   scrolling (arrows, space, page up/down, home/end) keep working natively.
 * - Touch keeps native momentum (syncTouch is off): the most responsive option on phones.
 * - One animation loop for the whole site: Lenis drives its own rAF and notifies
 *   scrolly.js through api.onScroll(), so scroll-linked visuals update in the same frame.
 * - Disabled under prefers-reduced-motion. If Lenis fails to load, native scrolling and
 *   native anchor jumps still work.
 */
(() => {
  'use strict';

  /* ---------- TUNING (change these to adjust the feel) ---------- */
  const WHEEL_LERP = 0.1;       // 0.07 = floaty, 0.1 = smooth and responsive, 0.16 = tight
  const WHEEL_MULTIPLIER = 1;   // >1 travels further per wheel notch
  const JUMP_DURATION = 0.8;    // seconds for anchor / chapter-link jumps
  const JUMP_EASE = t => 1 - Math.pow(1 - t, 4); // easeOutQuart: quick start, soft landing

  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new Set();
  const locks = new Set();
  let lenis = null;

  const emit = () => listeners.forEach(fn => fn());

  const applyLocks = () => {
    if (!lenis) return;
    if (locks.size) lenis.stop(); else lenis.start();
  };

  const create = () => {
    if (lenis || reduced.matches || typeof window.Lenis !== 'function') return;
    lenis = new window.Lenis({
      lerp: WHEEL_LERP,
      wheelMultiplier: WHEEL_MULTIPLIER,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: true,
      anchors: false          // anchors are handled below so focus and history stay correct
    });
    lenis.on('scroll', emit);
    applyLocks();
  };

  const destroy = () => {
    if (!lenis) return;
    lenis.destroy();
    lenis = null;
    root.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
    emit();
  };

  const scrollPad = () => parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;

  const api = {
    get active() { return !!lenis; },

    /* Subscribe to scroll updates delivered in the engine's own frame. Returns an unsubscribe. */
    onScroll(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    /* target: number (page y), element, or selector. opts: { offset, immediate, onComplete } */
    scrollTo(target, opts = {}) {
      const { offset = 0, immediate = false, onComplete } = opts;
      if (lenis) {
        lenis.scrollTo(target, {
          offset,
          immediate: immediate || reduced.matches,
          force: immediate,
          duration: JUMP_DURATION,
          easing: JUMP_EASE,
          onComplete
        });
        return;
      }
      let y = target;
      if (typeof target === 'string') target = document.querySelector(target);
      if (target instanceof Element) y = target.getBoundingClientRect().top + window.scrollY - scrollPad();
      window.scrollTo({ top: Math.max(0, y + offset), behavior: immediate || reduced.matches ? 'instant' : 'smooth' });
      if (onComplete) setTimeout(onComplete, immediate ? 0 : 700);
    },

    /* Instant jump that also keeps the engine's internal position in sync. */
    jump(y) { api.scrollTo(y, { immediate: true }); },

    /* Overlays (story panel, sky-map dialog, mobile menu) lock page scrolling by name. */
    lock(reason) { locks.add(reason); applyLocks(); },
    unlock(reason) { locks.delete(reason); applyLocks(); }
  };
  window.hanosSmooth = api;

  create();
  reduced.addEventListener('change', () => (reduced.matches ? destroy() : create()));

  /* ---------- in-page anchors ---------- */
  const normalise = path => (path === '/' || path === '' ? '/index.html' : path);
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || normalise(url.pathname) !== normalise(location.pathname) || !url.hash) return;
    const id = decodeURIComponent(url.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (id && !target) return;
    event.preventDefault();
    if (location.hash !== url.hash) history.pushState(null, '', url.hash);
    api.scrollTo(target || 0, {
      onComplete: () => { if (target && target.hasAttribute('tabindex')) target.focus({ preventScroll: true }); }
    });
  });

  /* Arriving with a hash (for example index.html#project from challenge.html): once fonts and
     layout have settled, put the target exactly where the browser meant to. */
  const settleHash = () => {
    if (!location.hash) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) api.scrollTo(target, { immediate: true });
  };
  window.addEventListener('load', () => {
    settleHash();
    document.fonts?.ready.then(settleHash);
  }, { once: true });

  /* ---------- pause infinite animations that are off screen ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-offscreen', !entry.isIntersecting));
    }, { rootMargin: '120px 0px' });
    document.querySelectorAll('.universe, .journey-stage, .journey-outro, .project-section').forEach(el => io.observe(el));
  }
})();
