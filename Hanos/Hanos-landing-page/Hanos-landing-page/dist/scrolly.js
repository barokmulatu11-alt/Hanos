(() => {
  'use strict';

  const journey = document.querySelector('#journey');
  if (!journey) return;

  const chapters = [...journey.querySelectorAll('[data-chapter]')];
  if (!chapters.length) return;

  const scenes = [...journey.querySelectorAll('[data-scene]')];
  const links = [...document.querySelectorAll('[data-chapter-link]')];
  const progressBar = document.querySelector('#journey-progress');
  const chapterNumber = document.querySelector('#chapter-current');
  const mobile = matchMedia('(max-width: 767px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('#universe');
  const clamp = value => Math.max(0, Math.min(1, value));

  let geometry = [];
  let viewportHeight = 1;
  let start = 0;
  let distance = 1;
  let needsMeasure = true;
  let frame = 0;
  let activeIndex = -1;
  let lastPercent = -1;
  let lastHeroProgress = -1;
  let heroTop = 0;
  let heroHeight = 1;

  // Cache document coordinates to prevent layout thrashing during scroll
  const measure = () => {
    viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight);
    const scrollY = window.scrollY || 0;
    if (hero) {
      const heroBounds = hero.getBoundingClientRect();
      heroTop = heroBounds.top + scrollY;
      heroHeight = Math.max(1, heroBounds.height);
    }
    const bounds = journey.getBoundingClientRect();
    start = bounds.top + scrollY;
    distance = Math.max(1, bounds.height - viewportHeight);
    geometry = chapters.map(chapter => {
      const b = chapter.getBoundingClientRect();
      const reading = (chapter.querySelector('.chapter-read') || chapter).getBoundingClientRect();
      const height = Math.max(1, b.height);
      return {
        top: b.top + scrollY,
        height,
        center: reading.top + scrollY + Math.max(0, reading.height) / 2
      };
    });
    needsMeasure = false;
  };

  const render = () => {
    frame = 0;
    if (needsMeasure) measure();
    const scrollY = window.scrollY || 0;

    // Smooth Hero Parallax & Fade
    if (hero) {
      const heroProgress = reducedMotion.matches ? 0 : clamp((scrollY - heroTop) / heroHeight);
      if (Math.abs(heroProgress - lastHeroProgress) > 0.001) {
        hero.style.setProperty('--hero-progress', heroProgress.toFixed(4));
        lastHeroProgress = heroProgress;
      }
    }

    const readingLine = scrollY + viewportHeight * (mobile.matches ? 0.65 : 0.5);
    const progress = clamp((scrollY - start) / distance);
    const percent = Math.round(progress * 100);

    let nearest = 0;
    let nearestDistance = Infinity;

    geometry.forEach((chapter, index) => {
      const gap = Math.abs(readingLine - chapter.center);
      if (gap < nearestDistance) {
        nearestDistance = gap;
        nearest = index;
      }
      const localProgress = clamp((readingLine - chapter.top) / chapter.height).toFixed(4);
      chapters[index].style.setProperty('--chapter-progress', localProgress);

      const scene = scenes[index];
      if (scene) scene.style.setProperty('--scene-progress', localProgress);
    });

    journey.style.setProperty('--journey-progress', progress.toFixed(4));
    if (percent !== lastPercent) {
      progressBar?.setAttribute('aria-valuenow', String(percent));
      lastPercent = percent;
    }

    if (nearest !== activeIndex) {
      activeIndex = nearest;
      const chapterId = chapters[nearest].dataset.chapter;
      journey.dataset.active = chapterId;
      if (chapterNumber) chapterNumber.textContent = String(nearest + 1).padStart(2, '0');
      chapters.forEach((chapter, index) => chapter.classList.toggle('is-active', index === nearest));
      links.forEach(link => {
        if (link.dataset.chapterLink === chapterId) link.setAttribute('aria-current', 'step');
        else link.removeAttribute('aria-current');
      });
    }
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  const remeasure = () => {
    needsMeasure = true;
    schedule();
  };

  // Smooth click navigation for chapter anchors
  links.forEach(link => {
    link.addEventListener('click', event => {
      const targetIndex = parseInt(link.dataset.chapterLink, 10);
      if (!isNaN(targetIndex) && chapters[targetIndex]) {
        event.preventDefault();
        const target = chapters[targetIndex];
        const rect = target.getBoundingClientRect();
        const offset = mobile.matches ? viewportHeight * 0.42 : viewportHeight * 0.15;
        const targetScroll = window.scrollY + rect.top - offset;
        window.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth'
        });
      }
    });
  });

  // Performance-optimized event listeners
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', remeasure, { passive: true });
  window.addEventListener('orientationchange', remeasure, { passive: true });
  window.addEventListener('hashchange', schedule);
  window.addEventListener('load', remeasure, { once: true });
  mobile.addEventListener('change', remeasure);
  reducedMotion.addEventListener('change', schedule);
  document.fonts?.ready.then(remeasure);

  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(remeasure);
    observer.observe(journey);
    chapters.forEach(chapter => observer.observe(chapter));
  }

  scenes.forEach(scene => scene.setAttribute('aria-hidden', 'true'));
  render();
})();
