(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelectorAll(s);
  document.getElementById('yr').textContent = new Date().getFullYear();

  /* split hero letters */
  let n = 0;
  $('.hero h1 .split').forEach(el => {
    el.innerHTML = [...el.textContent].map((ch, k) => `<span class="ch" style="--i:${n++};--k:${k}">${ch}</span>`).join('');
  });
  /* split section titles into words */
  $('.sec__title').forEach(t => {
    t.innerHTML = t.textContent.split(' ').map(w => `<span class="w"><span>${w}</span></span>`).join(' ');
    t.querySelectorAll('.w').forEach((w, i) => w.style.setProperty('--i', i));
  });
  /* split about lead into words */
  $('.words').forEach(p => {
    p.innerHTML = p.textContent.split(' ').map((w, i) => `<span class="wd" style="--i:${i}">${w}</span>`).join(' ');
  });

  /* loader */
  const loader = document.getElementById('loader');
  const start = () => document.body.classList.add('ready');
  if (RM) { loader.remove(); start(); }
  else {
    const cnt = document.getElementById('count'), bar = document.getElementById('bar');
    const t0 = performance.now(), dur = 1100;
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      cnt.textContent = Math.round(e * 100); bar.style.width = e * 100 + '%';
      if (p < 1) requestAnimationFrame(tick);
      else { loader.classList.add('done'); setTimeout(start, 250); setTimeout(() => loader.remove(), 1000); }
    };
    requestAnimationFrame(tick);
  }

  /* rotating words */
  const words = [...$('.rot b')]; let wi = 0;
  if (!RM) setInterval(() => {
    const cur = words[wi]; wi = (wi + 1) % words.length; const nxt = words[wi];
    cur.classList.remove('on'); cur.classList.add('out');
    nxt.classList.remove('out'); nxt.classList.add('on');
    setTimeout(() => cur.classList.remove('out'), 700);
  }, 2200);

  /* scroll reveals */
  const counters = el => el.querySelectorAll('.count').forEach(c => {
    const to = +c.dataset.to, t0 = performance.now();
    const step = now => { const p = Math.min(1, (now - t0) / 1400); c.textContent = Math.round((1 - Math.pow(1 - p, 4)) * to); if (p < 1) requestAnimationFrame(step); };
    RM ? c.textContent = to : requestAnimationFrame(step);
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); counters(e.target); io.unobserve(e.target); }
  }), { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  $('.reveal, .sec__title, .words').forEach(el => io.observe(el));

  /* nav, progress bar, timeline */
  const nav = document.querySelector('.nav'), prog = document.getElementById('progress'), tl = document.getElementById('timeline');
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('solid', y > 40);
    prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    const r = tl.getBoundingClientRect(), mark = innerHeight * .65;
    tl.style.setProperty('--p', Math.max(0, Math.min(1, (mark - r.top) / r.height)));
    tl.querySelectorAll('li').forEach(li => li.classList.toggle('lit', li.getBoundingClientRect().top < mark));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* filters */
  const btns = $('.filters button'), cards = $('.card');
  btns.forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    btns.forEach(x => x.setAttribute('aria-pressed', x === b));
    cards.forEach(c => {
      const show = f === 'all' || c.dataset.cat.split(' ').includes(f);
      if (show) { c.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => c.classList.remove('out'))); }
      else { c.classList.add('out'); setTimeout(() => { if (c.classList.contains('out')) c.hidden = true; }, 350); }
    });
  }));

  if (RM) { drawNet(false); return; }

  /* tilt + magnetic + cursor (mouse only) */
  if (FINE) {
    $('.tilt').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--rx', (0.5 - y) * 10 + 'deg'); el.style.setProperty('--ry', (x - 0.5) * 12 + 'deg');
        el.style.setProperty('--gx', x * 100 + '%'); el.style.setProperty('--gy', y * 100 + '%');
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
    $('.mag').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
    document.body.classList.add('has-cursor');
    const dot = document.querySelector('.cursor'), ring = document.querySelector('.cursor-ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; });
    const loop = () => { rx += (mx - rx) * .18; ry += (my - ry) * .18; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); };
    loop();
    $('a, button, .tilt').forEach(el => {
      el.addEventListener('pointerenter', () => ring.classList.add('big'));
      el.addEventListener('pointerleave', () => ring.classList.remove('big'));
    });
  }

  /* parallax on featured project images */
  const shots = [...$('.featured .shot img')];
  const para = () => {
    for (const im of shots) {
      if (!im.isConnected) continue;
      const r = im.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) continue;
      im.style.setProperty('--py', ((r.top + r.height / 2 - innerHeight / 2) * -0.06).toFixed(1) + 'px');
    }
  };
  addEventListener('scroll', para, { passive: true }); para();

  drawNet(true);

  /* particle network in hero */
  function drawNet(animate) {
    const cv = document.getElementById('net'), ctx = cv.getContext('2d');
    let W, H, pts = [], col = {}, running = true;
    const mouse = { x: -999, y: -999 };
    const readCols = () => { const s = getComputedStyle(document.documentElement); col.v = s.getPropertyValue('--v').trim(); col.c = s.getPropertyValue('--c').trim(); };
    const size = () => {
      const d = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect();
      W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      const count = Math.round(Math.min(90, W * H / 15000));
      pts = Array.from({ length: count }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5, r: Math.random() * 1.8 + 1 }));
    };
    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        if (animate) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
          const dx = mouse.x - p.x, dy = mouse.y - p.y, dist = Math.hypot(dx, dy);
          if (dist < 180) { p.x -= dx * .012; p.y -= dy * .012; }
        }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) { ctx.globalAlpha = (1 - d / 130) * .45; ctx.strokeStyle = col.v; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        const p = pts[i], md = Math.hypot(mouse.x - p.x, mouse.y - p.y);
        if (md < 200) { ctx.globalAlpha = (1 - md / 200) * .8; ctx.strokeStyle = col.c; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      }
      ctx.globalAlpha = .9;
      for (const p of pts) { ctx.fillStyle = col.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
      if (animate && running) requestAnimationFrame(frame);
    };
    readCols(); size(); frame();
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { readCols(); if (!animate) frame(); });
    addEventListener('resize', () => { size(); if (!animate) frame(); });
    if (!animate) return;
    const hero = document.querySelector('.hero');
    hero.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
    new IntersectionObserver(([e]) => { const was = running; running = e.isIntersecting; if (running && !was) frame(); }).observe(hero);
  }
})();
