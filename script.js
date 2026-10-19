document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Nav: border on scroll + mobile menu
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav-toggle');
const links = document.getElementById('nav-links');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 10), { passive: true });
if (toggle) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    links.classList.toggle('open', !open);
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    links.classList.remove('open');
  }));
}

// Reveal on scroll, with a little stagger for siblings
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 90}ms`;
    el.classList.add('in');
    revealObserver.unobserve(el);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Count-up numbers
function countUp(el) {
  const target = Number(el.dataset.count);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const format = n => prefix + n.toLocaleString('en-IN') + suffix;
  if (reduceMotion) return; // real numbers are already in the HTML
  el.textContent = format(0);
  const start = performance.now();
  const duration = 1400;
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = format(Math.round(target * eased));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    countUp(entry.target);
    countObserver.unobserve(entry.target);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

// Toast helper
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// Harry Potter easter egg
const bolt = document.querySelector('.bolt');
if (bolt) bolt.addEventListener('click', () => showToast('⚡ Mischief managed.'));

// Paw prints trail over the dog photos (mouse only)
const pawZone = document.getElementById('paw-zone');
if (pawZone && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
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

// Contact form via Web3Forms (delivers to Gmail), with hCaptcha + honeypot
const form = document.getElementById('contact-form');
if (form) {
  const status = document.getElementById('form-status');
  const button = form.querySelector('button[type="submit"]');

  const setStatus = (msg, kind) => {
    status.textContent = msg;
    status.className = 'form-status' + (kind ? ' ' + kind : '');
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setStatus('Please add a valid email so I can write back.', 'err');
    if (message.length < 5) return setStatus('Your message looks a little short. Tell me more!', 'err');
    const captcha = form.querySelector('[name="h-captcha-response"]');
    if (captcha && !captcha.value) return setStatus('Please tick the "I am human" box.', 'err');

    button.disabled = true;
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
        setStatus('Thank you! Your message is on its way. 💜', 'ok');
      } else {
        setStatus(data.message || 'Something went wrong. Please try again.', 'err');
      }
    } catch {
      setStatus('Something went wrong. Please try again, or reach me on LinkedIn.', 'err');
    }
    button.disabled = false;
    if (window.hcaptcha) window.hcaptcha.reset();
  });
}
