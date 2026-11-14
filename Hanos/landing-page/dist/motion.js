/* Motion polish for both pages. Everything here animates transform / opacity / translate only
 * (no layout, no filters) and is skipped under prefers-reduced-motion:
 *   1. headline words rise in one by one as they scroll into view
 *   2. the project device frame tilts with scroll
 *   3. the portrait rings and stars respond to the cursor (fine pointers only)
 *   4. a blue circle wipes between index.html and challenge.html
 */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  const smooth = window.hanosSmooth;
  const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
  const normalise = path => (path === '/' || path === '' ? '/index.html' : path);

  /* ---------- 1. headline word reveals ---------- */
  const HEADINGS = '.journey-introduction h1, .journey-introduction h2, .journey-chapter h3, .team-roster h2, .project-section h2, .journey-outro h2, .challenge-intro h1, .ch-block h2';

  const splitWords = heading => {
    let index = 0;
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const fragment = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { fragment.append(document.createTextNode(' ')); return; }
            const word = document.createElement('span');
            word.className = 'w';
            word.style.setProperty('--i', index++);
            word.textContent = part;
            fragment.append(word);
          });
          child.replaceWith(fragment);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(heading);
    heading.classList.add('words');
  };

  const headings = [...document.querySelectorAll(HEADINGS)];
  if (reduced.matches || !('IntersectionObserver' in window)) {
    headings.forEach(h => h.classList.add('words', 'is-in'));
  } else {
    const seen = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        seen.unobserve(entry.target);
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });
    headings.forEach(h => { splitWords(h); seen.observe(h); });
  }

  /* ---------- 2. device frame tilts as it scrolls through ---------- */
  const device = document.querySelector('.device');
  if (device && !reduced.matches) {
    let top = 0, height = 1, visible = false, lastP = -1;
    const measure = () => {
      const box = device.getBoundingClientRect();
      top = box.top + window.scrollY;
      height = Math.max(1, box.height);
    };
    const update = () => {
      if (!visible) return;
      const vh = window.innerHeight;
      const p = clamp((window.scrollY + vh - top) / (vh + height));
      if (Math.abs(p - lastP) > 0.002) { lastP = p; device.style.setProperty('--p', p.toFixed(3)); }
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) { measure(); update(); } }, { rootMargin: '10% 0px' }).observe(device);
    } else { visible = true; }
    window.addEventListener('scroll', update, { passive: true });
    smooth?.onScroll(update);
    window.addEventListener('resize', () => { measure(); update(); }, { passive: true });
    window.addEventListener('load', () => { measure(); update(); }, { once: true });
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => { measure(); update(); }).observe(document.body);
    measure();
  }

  /* ---------- 3. cursor-responsive art ---------- */
  if (finePointer.matches && !reduced.matches) {
    const hero = document.querySelector('.universe');
    const stage = document.querySelector('.journey-stage');
    const AMPLITUDE = 18;           // px of travel at full pointer offset for the front-most layer
    const EASE = 0.08;              // how quickly layers catch up with the pointer

    const make = (el, depth) => ({ el, depth, x: 0, y: 0 });
    const sparkles = [...document.querySelectorAll('.universe .sparkle')];
    const scenes = [...document.querySelectorAll('.scene')].map(el => ({
      el,
      parts: [
        make(el.querySelector('.scene-blob'), -0.5),
        make(el.querySelector('.orbit-map'), 0.35),
        ...[...el.querySelectorAll('.scene-art')].map(a => make(a, a.classList.contains('member-portrait') ? 0.5 : 1)),
        ...[...el.querySelectorAll('.portrait-ring')].map(r => make(r, 0.5))
      ].filter(p => p.el)
    }));

    let heroVisible = false, stageVisible = false;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.target === hero) heroVisible = e.isIntersecting;
        if (e.target === stage) stageVisible = e.isIntersecting;
      }));
      hero && io.observe(hero);
      stage && io.observe(stage);
    } else { heroVisible = stageVisible = true; }

    let tx = 0, ty = 0, px = 0, py = 0, frame = 0, twinkleQueued = false;

    const step = layer => {
      const gx = tx * layer.depth * AMPLITUDE;
      const gy = ty * layer.depth * AMPLITUDE;
      layer.x += (gx - layer.x) * EASE;
      layer.y += (gy - layer.y) * EASE;
      layer.el.style.translate = `${layer.x.toFixed(2)}px ${layer.y.toFixed(2)}px`;
      return Math.abs(gx - layer.x) + Math.abs(gy - layer.y) > 0.05;
    };

    const tick = () => {
      frame = 0;
      let moving = false;
      if (stageVisible) scenes.forEach(s => { if (s.el.classList.contains('is-active')) s.parts.forEach(p => { if (step(p)) moving = true; }); });
      if (moving) frame = requestAnimationFrame(tick);
    };

    const twinkle = () => {
      twinkleQueued = false;
      if (!heroVisible) return;
      sparkles.forEach(star => {
        if (star.classList.contains('twinkle')) return;
        const box = star.getBoundingClientRect();
        if (Math.hypot(box.left + box.width / 2 - px, box.top + box.height / 2 - py) < 120) {
          star.classList.add('twinkle');
          star.addEventListener('animationend', () => star.classList.remove('twinkle'), { once: true });
        }
      });
    };

    window.addEventListener('pointermove', event => {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      px = event.clientX; py = event.clientY;
      tx = (px / window.innerWidth - 0.5) * 2;
      ty = (py / window.innerHeight - 0.5) * 2;
      if (!frame) frame = requestAnimationFrame(tick);
      if (!twinkleQueued && heroVisible) { twinkleQueued = true; requestAnimationFrame(twinkle); }
    }, { passive: true });
  }

  /* ---------- 4. circle wipe between pages ---------- */
  const makeWipe = () => {
    const wipe = document.createElement('div');
    wipe.className = 'wipe';
    wipe.setAttribute('aria-hidden', 'true');
    return wipe;
  };

  // arriving after a wipe: the <head> script already covered the page; open the circle now
  if (root.classList.contains('wipe-in')) {
    const cover = makeWipe();
    cover.style.clipPath = 'circle(150vmax at 50% 50%)';
    document.body.append(cover);
    root.classList.remove('wipe-in');
    if (typeof cover.animate === 'function') {
      const open = cover.animate(
        { clipPath: ['circle(150vmax at 50% 50%)', 'circle(0px at 50% 50%)'] },
        { duration: 440, delay: 40, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }
      );
      open.finished.then(() => cover.remove(), () => cover.remove());
    } else { cover.remove(); }
  }

  // page restored from the back/forward cache with a wipe still on screen
  window.addEventListener('pageshow', event => {
    if (event.persisted) document.querySelectorAll('.wipe').forEach(w => w.remove());
  });

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || normalise(url.pathname) === normalise(location.pathname)) return;
    if (!/(\.html|\/)$/.test(url.pathname) || reduced.matches || typeof Element.prototype.animate !== 'function') return;

    event.preventDefault();
    const x = event.clientX || window.innerWidth / 2;
    const y = event.clientY || window.innerHeight / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const cover = makeWipe();
    cover.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    document.body.append(cover);
    let gone = false;
    const go = () => {
      if (gone) return;
      gone = true;
      try { sessionStorage.setItem('hanos-wipe', '1'); } catch (e) { /* storage blocked: navigate without the reveal */ }
      location.href = link.href;
    };
    const close = cover.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 380, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'forwards' }
    );
    close.finished.then(go, go);
    setTimeout(go, 700); // never leave the visitor stuck on the wipe
  });
})();
