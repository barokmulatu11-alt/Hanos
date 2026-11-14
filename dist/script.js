(() => {
  'use strict';

  const root = document.body;
  const trigger = document.querySelector('.mystery-trigger');
  const panel = document.querySelector('#mystery-panel');
  const title = document.querySelector('#mystery-title');
  const hero = document.querySelector('.hero');
  const path = document.querySelector('#liquid-path');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 767px)');
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');

  // Nine cubic segments for smooth organic morphing from left blob
  const closed = [.03,.47, .02,.41,.08,.35,.10,.28, .12,.22,.16,.18,.20,.19, .24,.20,.26,.23,.25,.27, .25,.31,.22,.34,.21,.38, .19,.42,.21,.47,.21,.52, .22,.57,.19,.60,.16,.62, .13,.64,.10,.64,.08,.63, .04,.62,.02,.59,.03,.55, .03,.52,.03,.50,.03,.47];
  const opened = [.03,.47, .01,.37,.04,.25,.13,.20, .22,.15,.26,.24,.36,.17, .44,.11,.52,.24,.61,.19, .70,.12,.76,.17,.84,.13, .94,.07,1.06,.18,1.03,.42, 1.04,.59,.99,.72,.88,.75, .77,.78,.72,.72,.65,.76, .53,.83,.47,.70,.38,.76, .24,.83,.01,.72,.03,.47];
  const openedMobile = [-.10,.46, -.14,.31,-.03,.21,.12,.19, .24,.16,.35,.22,.47,.18, .61,.13,.70,.22,.85,.18, 1.04,.13,1.15,.24,1.12,.39, 1.16,.49,1.12,.58,1.10,.66, 1.08,.75,.94,.79,.81,.76, .65,.72,.58,.80,.44,.77, .32,.74,.22,.80,.10,.77, -.04,.75,-.16,.63,-.10,.46];
  
  let progress = 0, isOpen = false, frame = 0, animationToken = 0;
  let storyOpener = trigger, returnScroll = 0;

  const makePath = values => `M ${values.slice(0,2).join(' ')} ${Array.from({length:9},(_,i)=>'C '+values.slice(2+i*6,8+i*6).join(' ')).join(' ')} Z`;
  const smooth = window.hanosSmooth;
  const draw = () => {
    if (!path) return; // pages without the story panel (challenge.html)
    const end = mobile.matches ? openedMobile : opened;
    path.setAttribute('d', makePath(closed.map((value,index) => value + (end[index] - value) * progress)));
  };

  const animate = (target, onDone) => {
    cancelAnimationFrame(frame);
    const token = ++animationToken;
    const from = progress, started = performance.now();
    // Snappy, energetic physics duration (700ms open, 600ms close)
    const duration = motion.matches ? 120 : (target ? 480 : 400);
    const tick = time => {
      if (token !== animationToken) return;
      const elapsed = Math.min(1, (time - started) / duration);
      // Fluid cubic-quartic spring ease-out
      const eased = 1 - Math.pow(1 - elapsed, 3.5);
      progress = from + (target - from) * eased;
      if (motion.matches) {
        progress = target;
        panel.style.opacity = target ? String(elapsed) : String(1 - elapsed);
      }
      draw();
      if (elapsed < 1) frame = requestAnimationFrame(tick);
      else {
        panel.style.opacity = '';
        onDone?.();
      }
    };
    frame = requestAnimationFrame(tick);
  };

  const setStory = (open, opener = trigger) => {
    if (!panel || !trigger || !hero || !title || !path) return; // not on this page
    if (open === isOpen) return;
    if (open) { storyOpener = opener; returnScroll = window.scrollY || 0; }
    isOpen = open;
    document.documentElement.classList.toggle('reading-story', open);
    document.querySelectorAll('.journey, .journey-outro, .project-section').forEach(section => { section.inert = open; });
    trigger.inert = open;
    if (smooth) {
      smooth.unlock('story');            // release first so the position can be restored
      smooth.jump(open ? 0 : returnScroll);
      if (open) smooth.lock('story');
    } else {
      window.scrollTo({ top: open ? 0 : returnScroll, behavior: 'instant' });
    }
    root.classList.add('story-transition');
    root.classList.toggle('story-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    hero.setAttribute('aria-hidden', String(open));
    panel.inert = !open;
    panel.setAttribute('aria-hidden', String(!open));
    if (open) {
      root.classList.remove('hero-return');
      animate(1, () => {
        root.classList.remove('story-transition');
        if (isOpen) title.focus({ preventScroll: true });
      });
    } else {
      root.classList.add('hero-return');
      storyOpener?.focus({ preventScroll: true });
      animate(0, () => root.classList.remove('story-transition'));
    }
  };

  trigger?.addEventListener('click', () => setStory(true));
  document.querySelectorAll('.close-story, .story-back').forEach(button => button.addEventListener('click', () => setStory(false)));
  panel?.addEventListener('click', event => { if (event.target === panel) setStory(false); });
  document.querySelector('.brand')?.addEventListener('click', () => { setStory(false); setMenu(false); });
  document.querySelectorAll('[data-open-mystery]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    setStory(true, link);
  }));
  document.querySelectorAll('[data-journey-nav]').forEach(link => link.addEventListener('click', () => {
    setStory(false);
    setMenu(false);
  }));

  // SKY MAP MODAL CONTROLLER
  const skyMapDialog = document.querySelector('#skymap-dialog');
  const openSkyMapBtn = document.querySelector('#open-sky-map');
  const closeSkyMapBtn = document.querySelector('#close-skymap');
  const heroExploreBtn = document.querySelector('#hero-explore-btn');

  function toggleSkyMap(open) {
    if (!skyMapDialog) return;
    if (open) smooth?.lock('skymap'); else smooth?.unlock('skymap');
    if (open) {
      heroExploreBtn?.classList.add('is-active-blue');
      heroExploreBtn?.setAttribute('aria-expanded', 'true');
      if (typeof skyMapDialog.showModal === 'function') {
        try { skyMapDialog.showModal(); } catch (e) { skyMapDialog.setAttribute('open', ''); }
      } else {
        skyMapDialog.setAttribute('open', '');
      }
      skyMapDialog.classList.add('is-open');
      openSkyMapBtn?.setAttribute('aria-expanded', 'true');
      const closeBtn = skyMapDialog.querySelector('#close-skymap');
      closeBtn?.focus();
    } else {
      heroExploreBtn?.classList.remove('is-active-blue');
      heroExploreBtn?.setAttribute('aria-expanded', 'false');
      if (typeof skyMapDialog.close === 'function') {
        try { skyMapDialog.close(); } catch (e) { skyMapDialog.removeAttribute('open'); }
      } else {
        skyMapDialog.removeAttribute('open');
      }
      skyMapDialog.classList.remove('is-open');
      openSkyMapBtn?.setAttribute('aria-expanded', 'false');
      if (document.activeElement === closeSkyMapBtn) {
        heroExploreBtn?.focus();
      }
    }
  }

  heroExploreBtn?.addEventListener('click', () => {
    heroExploreBtn.classList.add('is-active-blue');
    toggleSkyMap(true);
  });
  openSkyMapBtn?.addEventListener('click', () => toggleSkyMap(true));
  closeSkyMapBtn?.addEventListener('click', () => toggleSkyMap(false));
  skyMapDialog?.addEventListener('click', event => {
    if (event.target === skyMapDialog) toggleSkyMap(false);
  });
  skyMapDialog?.addEventListener('cancel', () => toggleSkyMap(false));

  // KEYBOARD ACCESSIBILITY
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (skyMapDialog && (skyMapDialog.hasAttribute('open') || skyMapDialog.classList.contains('is-open'))) {
        toggleSkyMap(false);
        return;
      }
      if (isOpen) setStory(false);
      const wasOpen = menu?.getAttribute('aria-expanded') === 'true';
      setMenu(false);
      if (wasOpen) menu?.focus({ preventScroll: true });
    }
  });

  mobile.addEventListener('change', () => { draw(); setMenu(false); });
  motion.addEventListener('change', () => {
    cancelAnimationFrame(frame);
    animationToken++;
    progress = isOpen ? 1 : 0;
    draw();
    if (panel) panel.style.opacity = '';
    root.classList.remove('story-transition');
    if (isOpen && title) title.focus({ preventScroll: true });
  });

  // RESPONSIVE MENU
  function setMenu(open) {
    if (!menu || !navigation) return;
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('menu-open', open);
    if (open) smooth?.lock('menu'); else smooth?.unlock('menu');
  }
  menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  document.querySelectorAll('[data-nav]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    document.querySelector('#nav-status').textContent = `${link.textContent.trim()}: this landing page preview has no linked destination.`;
    setMenu(false);
    if (mobile.matches) menu?.focus({ preventScroll: true });
  }));

  draw();
})();
