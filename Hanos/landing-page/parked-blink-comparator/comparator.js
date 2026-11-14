/* Blink comparator: the technique of finding something that moved by flicking between two looks
 * at the same patch of sky. It is an illustration on a made-up star field (drawn on canvas from a
 * seeded generator), not real data. Three fields, getting harder:
 *   1. a big shift, 2. a smaller one, 3. a tiny one plus a few stars that only change brightness.
 *
 * Two ways to compare: Blink (the plate flicks between the looks) and Slide (a draggable divider).
 * Click the point of light you think moved; "Show me" reveals it. Keyboard: Space / Enter pauses or
 * switches the blink, arrow keys move the divider, and the buttons do the rest.
 * Only opacity / clip-path change while comparing; the stars are drawn once per field and resize.
 */
(() => {
  'use strict';

  const root = document.querySelector('#comparator');
  if (!root) return;
  const $ = selector => root.querySelector(selector);
  const plate = $('#cmp-plate');
  const canA = $('.cmp-a');
  const canB = $('.cmp-b');
  const marks = $('.cmp-marks');
  const handle = $('.cmp-handle');
  const range = $('#cmp-range');
  const status = $('#cmp-status');
  const roundLabel = $('#cmp-round');
  const btnBlink = $('[data-mode="blink"]');
  const btnSlide = $('[data-mode="slide"]');
  const btnPause = $('#cmp-pause');
  const btnSwitch = $('#cmp-switch');
  const btnHint = $('#cmp-hint');
  const btnNext = $('#cmp-next');
  const dots = [...root.querySelectorAll('.cmp-dot')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- tuning ---------- */
  const BLINK_MS = 650;                       // how long each look stays up while blinking
  const HIT_RADIUS = 24;                      // px (at 900px plate width) around the moved point that counts as a hit
  const FIELDS = [
    { seed: 11, stars: 230, shift: 0.075, variables: 0 },
    { seed: 27, stars: 300, shift: 0.042, variables: 0 },
    { seed: 53, stars: 380, shift: 0.024, variables: 3 }
  ];
  const TINTS = ['240,244,255', '255,238,214', '190,215,255'];

  /* ---------- seeded random + field generation ---------- */
  const rng = seed => () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const buildField = index => {
    const cfg = FIELDS[index];
    const rand = rng(cfg.seed);
    const stars = [];
    for (let i = 0; i < cfg.stars; i++) {
      const mag = Math.pow(rand(), 2.7);
      stars.push({ x: rand(), y: rand(), r: 0.55 + mag * 2.1, a: 0.32 + rand() * 0.68, tint: TINTS[rand() < 0.14 ? 1 : rand() < 0.3 ? 2 : 0] });
    }
    const pool = stars.map((s, i) => i).filter(i => stars[i].r > 1 && stars[i].r < 2 && stars[i].x > 0.15 && stars[i].x < 0.85 && stars[i].y > 0.2 && stars[i].y < 0.8);
    const moverIndex = pool[Math.floor(rand() * pool.length)];
    const mover = stars[moverIndex];
    mover.r = Math.max(mover.r, 1.5);
    mover.a = Math.max(mover.a, 0.85);
    const angle = rand() * Math.PI * 2;
    const to = { x: clamp(mover.x + Math.cos(angle) * cfg.shift, 0.05, 0.95), y: clamp(mover.y + Math.sin(angle) * cfg.shift * 1.55, 0.08, 0.92) };
    const variables = [];
    while (variables.length < cfg.variables) {
      const i = Math.floor(rand() * stars.length);
      if (i !== moverIndex && !variables.some(v => v.i === i) && stars[i].r > 0.8 && stars[i].r < 1.9) variables.push({ i, dim: rand() < 0.5 });
    }
    return { stars, moverIndex, from: { x: mover.x, y: mover.y }, to, variables };
  };

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ---------- drawing ---------- */
  let field = null;
  const draw = (canvas, which) => {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const dpr = w / canvas.clientWidth || 1;
    const scale = Math.max(0.75, canvas.clientWidth / 900) * dpr;
    ctx.clearRect(0, 0, w, h);
    field.stars.forEach((star, i) => {
      let x = star.x, y = star.y, alpha = star.a;
      if (i === field.moverIndex && which === 'b') { x = field.to.x; y = field.to.y; }
      const variable = field.variables.find(v => v.i === i);
      if (variable) alpha = (which === 'a') === variable.dim ? 0.18 : 1;
      const px = x * w, py = y * h, radius = star.r * scale;
      if (radius > 1.7 * scale) {
        const glow = ctx.createRadialGradient(px, py, 0, px, py, radius * 4.5);
        glow.addColorStop(0, `rgba(${star.tint},${(alpha * 0.34).toFixed(3)})`);
        glow.addColorStop(1, `rgba(${star.tint},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(px, py, radius * 4.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = `rgba(${star.tint},${alpha.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(px, py, radius, 0, Math.PI * 2); ctx.fill();
    });
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(plate.clientWidth * dpr), h = Math.round(plate.clientHeight * dpr);
    if (!w || !h || !field) return;
    [canA, canB].forEach(c => { c.width = w; c.height = h; });
    draw(canA, 'a');
    draw(canB, 'b');
  };

  /* ---------- state ---------- */
  const state = { round: 0, mode: 'blink', paused: reduced.matches, showB: false, found: false, misses: 0, solved: [false, false, false], inView: false };

  const say = text => { status.textContent = text; };
  const setLook = b => { state.showB = b; plate.classList.toggle('is-b', b); };

  /* blink timer runs only while it is useful: blink mode, not paused, plate on screen, tab visible */
  let timer = 0;
  const syncTimer = () => {
    const want = state.mode === 'blink' && !state.paused && state.inView && !document.hidden;
    if (want && !timer) timer = setInterval(() => setLook(!state.showB), BLINK_MS);
    if (!want && timer) { clearInterval(timer); timer = 0; }
  };

  const setMode = mode => {
    state.mode = mode;
    root.dataset.mode = mode;
    btnBlink.setAttribute('aria-pressed', String(mode === 'blink'));
    btnSlide.setAttribute('aria-pressed', String(mode === 'slide'));
    if (mode === 'slide') setLook(false);
    say(mode === 'blink'
      ? (state.paused ? 'Blink is paused. Use Switch look to flip between the two looks. One point of light moved. Click it.' : 'The sky blinks between two looks. One point of light moved. Click it.')
      : 'Drag the divider between the two looks. One point of light moved. Click it.');
    syncTimer();
  };

  const setPaused = paused => {
    state.paused = paused;
    btnPause.setAttribute('aria-pressed', String(paused));
    btnPause.textContent = paused ? 'Resume' : 'Pause';
    syncTimer();
  };

  const setX = percent => {
    const p = clamp(percent, 2, 98);
    plate.style.setProperty('--x', p + '%');
    range.value = String(Math.round(p));
  };

  /* ---------- markers ---------- */
  const clearMarks = () => { marks.textContent = ''; };
  const ring = (point, label, first) => {
    const el = document.createElement('div');
    el.className = 'cmp-ring' + (first ? ' is-first' : '');
    el.style.left = point.x * 100 + '%';
    el.style.top = point.y * 100 + '%';
    const text = document.createElement('span');
    text.textContent = label;
    el.append(text);
    return el;
  };
  const reveal = () => {
    clearMarks();
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('class', 'cmp-link');
    line.setAttribute('x1', field.from.x * 100); line.setAttribute('y1', field.from.y * 100);
    line.setAttribute('x2', field.to.x * 100); line.setAttribute('y2', field.to.y * 100);
    svg.append(line);
    marks.append(svg, ring(field.from, 'First look', true), ring(field.to, 'Second look', false));
  };

  /* ---------- rounds ---------- */
  const updateProgress = () => {
    roundLabel.textContent = `Field ${state.round + 1} of ${FIELDS.length}`;
    dots.forEach((dot, i) => dot.classList.toggle('is-done', state.solved[i]));
  };

  const startRound = index => {
    state.round = index;
    state.found = false;
    state.misses = 0;
    field = buildField(index);
    clearMarks();
    btnNext.hidden = true;
    btnHint.hidden = false;
    btnHint.classList.remove('is-nudged');
    setLook(false);
    updateProgress();
    resize();
    say(index === 0 ? 'The sky blinks between two looks. One point of light moved. Click it.' : 'A new patch of sky. One point of light moved. Click it.');
    if (index > 0) setMode(state.mode);
  };

  const found = byHint => {
    if (state.found) return;
    state.found = true;
    if (!byHint) state.solved[state.round] = true;
    reveal();
    updateProgress();
    btnHint.hidden = true;
    btnNext.hidden = false;
    const done = state.solved.every(Boolean);
    btnNext.textContent = state.round === FIELDS.length - 1 ? 'Play again' : 'Next field';
    say(byHint
      ? 'That is the one: a single point of light shifted between the two looks.'
      : done
        ? 'All three found. Noticing what changed between two observations is the idea behind the challenge.'
        : 'Found it: that point of light shifted between the two looks.');
    btnNext.focus({ preventScroll: true });
  };

  plate.addEventListener('click', event => {
    if (state.found || event.target.closest('.cmp-handle')) return;
    const box = plate.getBoundingClientRect();
    const px = event.clientX - box.left, py = event.clientY - box.top;
    const radius = HIT_RADIUS * clamp(box.width / 900, 0.75, 1.25);
    const distance = p => Math.hypot(p.x * box.width - px, p.y * box.height - py);
    if (Math.min(distance(field.from), distance(field.to)) <= radius) { found(false); return; }
    state.misses++;
    const miss = document.createElement('div');
    miss.className = 'cmp-miss';
    miss.style.left = px + 'px';
    miss.style.top = py + 'px';
    marks.append(miss);
    setTimeout(() => miss.remove(), 700);
    if (state.misses >= 3) { btnHint.classList.add('is-nudged'); say('Still hunting? “Show me” will point it out.'); }
    else say('Not that one. Look for the point that jumps between the two looks.');
  });

  /* ---------- controls ---------- */
  btnBlink.addEventListener('click', () => setMode('blink'));
  btnSlide.addEventListener('click', () => setMode('slide'));
  btnPause.addEventListener('click', () => { setPaused(!state.paused); setMode('blink'); });
  btnSwitch.addEventListener('click', () => { setPaused(true); setLook(!state.showB); say(state.showB ? 'Showing the second look.' : 'Showing the first look.'); });
  btnHint.addEventListener('click', () => found(true));
  btnNext.addEventListener('click', () => {
    if (state.round === FIELDS.length - 1) { state.solved = [false, false, false]; startRound(0); } else startRound(state.round + 1);
    plate.focus({ preventScroll: true });
  });
  range.addEventListener('input', () => setX(Number(range.value)));

  // dragging the divider
  let dragging = false;
  const moveTo = event => { const box = plate.getBoundingClientRect(); setX(((event.clientX - box.left) / box.width) * 100); };
  handle.addEventListener('pointerdown', event => { dragging = true; handle.setPointerCapture(event.pointerId); moveTo(event); event.preventDefault(); });
  handle.addEventListener('pointermove', event => { if (dragging) moveTo(event); });
  const stopDrag = event => { dragging = false; try { handle.releasePointerCapture(event.pointerId); } catch (e) { /* already released */ } };
  handle.addEventListener('pointerup', stopDrag);
  handle.addEventListener('pointercancel', stopDrag);

  plate.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (state.mode === 'blink') { btnPause.click(); }
    } else if (state.mode === 'slide' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      setX(Number(range.value) + (event.key === 'ArrowRight' ? 4 : -4));
    }
  });

  /* ---------- wiring ---------- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { state.inView = entry.isIntersecting; syncTimer(); }, { threshold: 0.2 }).observe(plate);
  } else { state.inView = true; }
  document.addEventListener('visibilitychange', syncTimer);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(plate);
  window.addEventListener('resize', resize, { passive: true });

  setPaused(reduced.matches);
  setX(50);
  startRound(0);
  setMode(state.mode);
})();
