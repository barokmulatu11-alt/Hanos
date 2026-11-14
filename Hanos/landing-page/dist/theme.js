/* Day / night toggle. The theme is applied before first paint by a tiny inline script in <head>
 * (so there is no flash); this file wires the button, saves the choice, and animates the change
 * as a circle growing from the button where the browser supports View Transitions. */
(() => {
  'use strict';

  const root = document.documentElement;
  const button = document.querySelector('.theme-toggle');
  if (!button) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const meta = document.querySelector('meta[name="theme-color"]');
  const COLORS = { day: '#f2f1ed', night: '#0b0f14' };

  const isNight = () => root.getAttribute('data-theme') === 'night';

  const sync = () => {
    const night = isNight();
    button.setAttribute('aria-pressed', String(night));
    button.setAttribute('aria-label', night ? 'Switch to day mode' : 'Switch to night mode');
    if (meta) meta.setAttribute('content', night ? COLORS.night : COLORS.day);
  };

  const apply = night => {
    if (night) root.setAttribute('data-theme', 'night'); else root.removeAttribute('data-theme');
    try { localStorage.setItem('hanos-theme', night ? 'night' : 'day'); } catch (e) { /* storage blocked: fine */ }
    sync();
  };

  button.addEventListener('click', () => {
    const next = !isNight();
    if (typeof document.startViewTransition !== 'function' || reduced.matches) { apply(next); return; }
    const box = button.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    let transition;
    try { transition = document.startViewTransition(() => apply(next)); } catch (e) { apply(next); return; }
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
    transition.finished.catch(() => {});
  });

  sync();
})();
