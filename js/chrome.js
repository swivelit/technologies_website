/* Persistent UI chrome — progress indicator, product index, reveals,
   scramble triggers, overlays and the EmailJS contact forms.
   Dependency-free; works in both the WebGL and static-fallback modes.
   (The GL engine exposes window.__swivelLenis when smooth scroll is live.) */

import { scramble } from './scramble.js';

const EMAILJS_SDK = 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';
const EMAILJS_PUBLIC_KEY = '-7wkbGnC_50wjRavn';
const EMAILJS_SERVICE = 'service_8unkljg';
const EMAILJS_TEMPLATE = 'template_7bvvb7l';

let reduceMotion = false;

/* ---------- scroll progress (bottom-right) ---------- */
function initProgress() {
  const label = document.getElementById('progressLabel');
  const fill = document.getElementById('progressFill');
  if (!label || !fill) return;

  let queued = false;
  function update() {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    fill.style.transform = `scaleY(${p})`;
    label.textContent = String(Math.round(p * 100)).padStart(3, '0');
  }
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
}

/* ---------- product index highlighting (bottom-left) ---------- */
function initWorkIndex() {
  const items = [...document.querySelectorAll('#windex li')];
  if (!items.length) return;
  const byId = new Map(
    items.map((li) => [li.querySelector('a').getAttribute('href').slice(1), li])
  );

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const li = byId.get(e.target.id);
        if (!li) continue;
        if (e.isIntersecting) {
          items.forEach((x) => x.classList.toggle('is-active', x === li));
        } else if (li.classList.contains('is-active')) {
          li.classList.remove('is-active');
        }
      }
    },
    // a narrow band around the viewport centre decides the active scene
    { rootMargin: '-42% 0px -42% 0px' }
  );
  document.querySelectorAll('.scene--product').forEach((s) => io.observe(s));
}

/* ---------- reveals + scramble ---------- */
function initReveals() {
  const revealEls = document.querySelectorAll('[data-reveal]');
  const scrambleEls = document.querySelectorAll('[data-scramble]');

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        if (e.target.hasAttribute('data-scramble') && !reduceMotion) {
          scramble(e.target);
        }
        io.unobserve(e.target);
      }
    },
    { threshold: 0.25, rootMargin: '0px 0px -6% 0px' }
  );

  revealEls.forEach((el) => io.observe(el));
  scrambleEls.forEach((el) => io.observe(el));
}

/* ---------- smooth in-page navigation ---------- */
function scrollToTarget(sel) {
  const target = document.querySelector(sel);
  if (!target) return;
  const lenis = window.__swivelLenis;
  if (lenis) lenis.scrollTo(target, { duration: 1.6 });
  else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}

function initAnchors() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const sel = a.getAttribute('href');
    if (sel.length < 2) return;
    e.preventDefault();
    closeOverlays();
    scrollToTarget(sel);
    history.replaceState(null, '', sel);
  });
}

/* ---------- overlays ---------- */
let openOverlay = null;
let lastFocus = null;

function setOverlay(overlay, open) {
  const lenis = window.__swivelLenis;
  if (open) {
    if (openOverlay && openOverlay !== overlay) setOverlay(openOverlay, false);
    lastFocus = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    openOverlay = overlay;
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    const first = overlay.querySelector('input, button:not([data-close]), a');
    first?.focus({ preventScroll: true });
  } else {
    overlay.classList.remove('is-open');
    setTimeout(() => { overlay.hidden = true; }, 480);
    if (openOverlay === overlay) openOverlay = null;
    document.body.style.overflow = '';
    lenis?.start();
    lastFocus?.focus?.({ preventScroll: true });
  }
}

function closeOverlays() {
  if (openOverlay) setOverlay(openOverlay, false);
}

function initOverlays() {
  document.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const overlay = document.getElementById(btn.dataset.open);
      if (overlay) setOverlay(overlay, true);
    });
  });
  document.querySelectorAll('.overlay').forEach((overlay) => {
    overlay.querySelectorAll('[data-close]').forEach((el) => {
      el.addEventListener('click', () => setOverlay(overlay, false));
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOverlays();
  });
}

/* ---------- contact forms (EmailJS, lazy-loaded) ---------- */
let emailJsReady = null;
function ensureEmailJs() {
  if (!emailJsReady) {
    emailJsReady = new Promise((resolve, reject) => {
      if (window.emailjs) return resolve(window.emailjs);
      const s = document.createElement('script');
      s.src = EMAILJS_SDK;
      s.onload = () => {
        window.emailjs.init(EMAILJS_PUBLIC_KEY);
        resolve(window.emailjs);
      };
      s.onerror = () => { emailJsReady = null; reject(new Error('EmailJS SDK failed to load')); };
      document.head.appendChild(s);
    });
  }
  return emailJsReady;
}

function initContactForms() {
  document.querySelectorAll('.js-contact-form').forEach((form) => {
    const status = form.querySelector('.form__status');
    const button = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      status.className = 'form__status mono';
      status.textContent = '// transmitting …';
      button.disabled = true;
      try {
        const emailjs = await ensureEmailJs();
        await emailjs.sendForm(EMAILJS_SERVICE, EMAILJS_TEMPLATE, form);
        status.classList.add('is-ok');
        status.textContent = '// message sent — we will get back to you soon';
        form.reset();
      } catch (err) {
        console.error('[swivel] contact form:', err);
        status.classList.add('is-err');
        status.textContent = '// failed to send — please retry or email jeygroups@gmail.com';
      } finally {
        button.disabled = false;
      }
    });
  });
}

/* ---------- ---------- */
export function initChrome({ reduceMotion: rm = false } = {}) {
  reduceMotion = rm;
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  initProgress();
  initWorkIndex();
  initReveals();
  initAnchors();
  initOverlays();
  initContactForms();
}
