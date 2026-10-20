const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;

// Nav: border once the page scrolls
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Scroll reveals. Each [data-reveal] gets .in once it's on screen; the CSS
// decides what that looks like (pinned polaroids, dealt cards, stamps...).
const revealables = document.querySelectorAll('[data-reveal], #footer');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealables.forEach(el => el.classList.add('in', 'settled'));
} else {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      // once a tilt card has landed, let it follow the cursor quickly
      if (entry.target.classList.contains('tilt')) setTimeout(() => entry.target.classList.add('settled'), 1400);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
  revealables.forEach(el => revealObserver.observe(el));
}

// Count-up numbers
function countUp(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const format = n => n.toLocaleString('en-IN') + suffix;
  const start = performance.now();
  const duration = 1400;
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = format(Math.round(target * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(tick);
  };
  el.textContent = format(0);
  requestAnimationFrame(tick);
}
if (!reduceMotion) { // otherwise the real numbers are already in the HTML
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      countObserver.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));
}

// Toast
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// A burst of little sparks from an element
function sparkle(el, glyphs) {
  if (reduceMotion) return;
  const r = el.getBoundingClientRect();
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('span');
    const angle = (Math.PI * 2 * i) / 10;
    const dist = 40 + Math.random() * 30;
    s.className = 'spark';
    s.textContent = glyphs[i % glyphs.length];
    s.style.left = `${r.left + r.width / 2 - 7}px`;
    s.style.top = `${r.top + r.height / 2 - 7}px`;
    s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    s.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 800);
  }
}

// Harry Potter easter egg
const bolt = document.querySelector('.bolt');
if (bolt) bolt.addEventListener('click', () => {
  sparkle(bolt, ['✨', '⚡', '✦']);
  showToast(canHover ? '⚡ Mischief managed. (Psst: type lumos.)' : '⚡ Mischief managed. (Psst: find the wand at the bottom.)');
});

// Pet the footer dog
const peek = document.querySelector('.peek');
if (peek) peek.addEventListener('click', () => {
  peek.classList.remove('boop');
  void peek.offsetWidth; // restart the animation
  peek.classList.add('boop');
  sparkle(peek, ['💜', '🐾']);
  showToast('Woof! 🐾 Thanks for scrolling all the way down.');
});

// Paw prints trail over the dog photos (mouse only)
const pawZone = document.getElementById('paw-zone');
if (pawZone && !reduceMotion && canHover) {
  let last = 0;
  pawZone.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - last < 140) return;
    last = now;
    const paw = document.createElement('span');
    paw.className = 'paw';
    paw.textContent = '🐾';
    paw.style.left = `${e.clientX - 9}px`;
    paw.style.top = `${e.clientY - 9}px`;
    paw.style.rotate = `${Math.random() * 60 - 30}deg`;
    document.body.appendChild(paw);
    setTimeout(() => paw.remove(), 1000);
  });
}

// ===== Violet light =====

// Spotlight cards: the light follows the cursor
if (canHover) {
  document.querySelectorAll('.glow').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

// 3D tilt with shine on polaroids and recipe cards
const tilts = document.querySelectorAll('.tilt');
if (!reduceMotion && canHover) {
  tilts.forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.classList.add('tilting');
      card.style.setProperty('--ry', `${(x - 0.5) * 16}deg`);
      card.style.setProperty('--rx', `${(0.5 - y) * 12}deg`);
      card.style.setProperty('--sx', `${x * 100}%`);
      card.style.setProperty('--sy', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
} else if (!reduceMotion && tilts.length) {
  // On phones, cards lean gently as they scroll past instead
  let ticking = false;
  const lean = () => {
    const vh = window.innerHeight;
    tilts.forEach(card => {
      const r = card.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh; // -0.5 (top) .. 0.5 (bottom)
      card.style.setProperty('--rx', `${p * 14}deg`);
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(lean); } }, { passive: true });
  lean();
}

// Magnetic buttons: they lean toward the cursor
if (!reduceMotion && canHover) {
  document.querySelectorAll('.btn-primary, .btn-dark, .nav-cta').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--bx', `${(e.clientX - r.left - r.width / 2) * 0.25}px`);
      btn.style.setProperty('--by', `${(e.clientY - r.top - r.height / 2) * 0.35}px`);
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--bx', '0px');
      btn.style.setProperty('--by', '0px');
    });
  });
}

// Lumos: type "lumos" (or tap the wand) to explore by wand light; "nox" or Esc to stop
const veil = document.querySelector('.lumos-veil');
const wand = document.querySelector('.wand');
if (veil) {
  const moveLight = (x, y) => {
    veil.style.setProperty('--lx', `${x}px`);
    veil.style.setProperty('--ly', `${y}px`);
  };
  const setLumos = on => {
    if (document.body.classList.contains('lumos') === on) return;
    document.body.classList.toggle('lumos', on);
    wand?.setAttribute('aria-pressed', String(on));
    showToast(on ? '✨ Lumos! Type nox (or tap the wand) to switch it off.' : '🌙 Nox. The lights are back on.');
  };
  window.addEventListener('pointermove', e => moveLight(e.clientX, e.clientY), { passive: true });
  window.addEventListener('touchmove', e => moveLight(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  wand?.addEventListener('click', e => {
    moveLight(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
    setLumos(!document.body.classList.contains('lumos'));
  });
  let typed = '';
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') return setLumos(false);
    if (e.target.closest('input, textarea, [contenteditable]') || e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-5);
    if (typed.endsWith('lumos')) setLumos(true);
    else if (typed.endsWith('nox')) setLumos(false);
  });
}

// Contact form via Web3Forms (delivers to Gmail), with hCaptcha + honeypot
const form = document.getElementById('contact-form');
if (form) {
  const status = document.getElementById('form-status');
  const button = form.querySelector('button[type="submit"]');
  const sent = document.getElementById('sent');

  const setStatus = (msg, kind) => {
    status.textContent = msg;
    status.className = 'form-status' + (kind ? ' ' + kind : '');
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setStatus('Add a valid email so I can write back.', 'err');
    if (message.length < 5) return setStatus('Your message looks a little short. Tell me more!', 'err');
    const captcha = form.querySelector('[name="h-captcha-response"]');
    if (captcha && !captcha.value) return setStatus('Tick the "I am human" box, then send again.', 'err');

    button.disabled = true;
    button.classList.add('sending');
    setStatus('Sending...');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const data = await res.json();
      if (data.success) {
        form.reset();
        setStatus('');
        form.hidden = true;
        sent.hidden = false;
        sent.focus();
      } else {
        setStatus(data.message || "The message didn't go through. Try again in a moment.", 'err');
      }
    } catch {
      setStatus("The message didn't go through. Check your connection and try again, or reach me on LinkedIn.", 'err');
    }
    button.disabled = false;
    button.classList.remove('sending');
    if (window.hcaptcha) window.hcaptcha.reset();
  });

  document.getElementById('send-another')?.addEventListener('click', () => {
    sent.hidden = true;
    form.hidden = false;
    form.email.focus();
  });
}
