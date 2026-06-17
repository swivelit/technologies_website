/* Boot — decides between the WebGL experience and the static fallback.
   The page is fully readable before any of this runs; everything here
   is progressive enhancement. */

import { initChrome } from './chrome.js';

const html = document.documentElement;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FULL_RICH_WIDTH = 1880;
const FULL_RICH_HEIGHT = 900;
const RICH_SCENE_MIN_WIDTH = 1600;
const RICH_SCENE_MIN_HEIGHT = 820;
const COMPACT_THEATRE_WIDTH = 1440;
const COMPACT_THEATRE_HEIGHT = 760;
const STACKED_PRODUCTS_WIDTH = 1280;
const STACKED_PRODUCTS_HEIGHT = 700;
const MOBILE_WIDTH = 900;

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function viewportSize() {
  const vv = window.visualViewport;
  return {
    w: Math.max(1, Math.round(vv?.width || innerWidth || document.documentElement.clientWidth || 1)),
    h: Math.max(1, Math.round(vv?.height || innerHeight || document.documentElement.clientHeight || 1)),
    layoutW: Math.max(1, Math.round(innerWidth || document.documentElement.clientWidth || 1)),
    layoutH: Math.max(1, Math.round(innerHeight || document.documentElement.clientHeight || 1)),
    visualScale: vv?.scale || 1,
  };
}

function syncViewportLayout() {
  const { w, h, layoutW, layoutH, visualScale } = viewportSize();
  const desktopFit = Math.min(w / FULL_RICH_WIDTH, h / FULL_RICH_HEIGHT);
  const theatreFit = Math.min(w / RICH_SCENE_MIN_WIDTH, h / RICH_SCENE_MIN_HEIGHT);
  const compactFit = Math.min(w / COMPACT_THEATRE_WIDTH, h / COMPACT_THEATRE_HEIGHT);
  const productFit = clamp(theatreFit, 0.46, 1.08);
  const density = clamp(1 - compactFit, 0, 0.54);
  const visualConstrained = h < layoutH * 0.94 || w < layoutW * 0.94 || visualScale > 1.01;
  const finePointer = matchMedia('(pointer: fine) and (hover: hover)').matches;
  const coarsePointer = matchMedia('(pointer: coarse), (hover: none)').matches;
  const dense = w < RICH_SCENE_MIN_WIDTH || h < RICH_SCENE_MIN_HEIGHT;
  const short = h < RICH_SCENE_MIN_HEIGHT;
  const compact = w < COMPACT_THEATRE_WIDTH || h < COMPACT_THEATRE_HEIGHT;
  const stacked = w < STACKED_PRODUCTS_WIDTH || h < STACKED_PRODUCTS_HEIGHT;
  const mobile = w < MOBILE_WIDTH || coarsePointer;
  const zoomLike = visualConstrained || (finePointer && (w < FULL_RICH_WIDTH || h < FULL_RICH_HEIGHT));

  html.style.setProperty('--viewport-w', `${w}px`);
  html.style.setProperty('--viewport-h', `${h}px`);
  html.style.setProperty('--viewport-fit', String(clamp(desktopFit, 0.46, 1.08).toFixed(4)));
  html.style.setProperty('--product-fit', String(productFit.toFixed(4)));
  html.style.setProperty('--product-copy-scale', String(clamp(0.78 + productFit * 0.22 - density * 0.1, 0.72, 1).toFixed(4)));
  html.style.setProperty('--product-visual-scale', String(clamp(0.6 + productFit * 0.4 - density * 0.12, 0.52, 1.04).toFixed(4)));
  html.style.setProperty('--product-density', String(density.toFixed(4)));

  html.classList.toggle('is-wide-view', w >= FULL_RICH_WIDTH && h >= FULL_RICH_HEIGHT);
  html.classList.toggle('is-dense-view', dense);
  html.classList.toggle('is-short-view', short);
  html.classList.toggle('is-zoom-like-view', zoomLike);
  html.classList.toggle('is-compact-theatre', compact);
  html.classList.toggle('is-stacked-products', stacked);

  document.querySelectorAll('.scene--product').forEach((scene) => {
    const forceUnstick = dense || short || compact || stacked || zoomLike;
    if (forceUnstick) {
      scene.dataset.viewportUnstick = '1';
      scene.classList.add('scene--unstick');
    } else if (scene.dataset.viewportUnstick === '1') {
      delete scene.dataset.viewportUnstick;
      scene.classList.remove('scene--unstick');
    }
  });

  return { w, h, dense, compact, stacked, mobile };
}

function viewportCanFitRichScene() {
  const { w, h, dense, compact, stacked, mobile } = syncViewportLayout();
  return w >= RICH_SCENE_MIN_WIDTH &&
    h >= RICH_SCENE_MIN_HEIGHT &&
    !dense &&
    !compact &&
    !stacked &&
    !mobile;
}

function rectsOverlap(a, b, padding = 12) {
  if (!a || !b || a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0) return false;
  return !(
    a.right < b.left - padding ||
    a.left > b.right + padding ||
    a.bottom < b.top - padding ||
    a.top > b.bottom + padding
  );
}

function getActiveProductSection() {
  const { h } = viewportSize();
  const centerY = h / 2;
  let containing = null;
  let nearest = null;

  document.querySelectorAll('.scene--product').forEach((scene) => {
    const rect = scene.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0 || rect.bottom < 0 || rect.top > h) return;
    const contains = rect.top <= centerY && rect.bottom >= centerY;
    const distance = contains
      ? Math.abs((rect.top + rect.bottom) / 2 - centerY)
      : Math.max(0, rect.top > centerY ? rect.top - centerY : centerY - rect.bottom);
    const candidate = { scene, distance };
    if (contains && (!containing || distance < containing.distance)) containing = candidate;
    if (!nearest || distance < nearest.distance) nearest = candidate;
  });

  return containing?.scene || nearest?.scene || null;
}

function syncSideIndexVisibility() {
  const { w, h } = viewportSize();
  const sideIndex = document.querySelector('.chrome--index');
  const activeProduct = getActiveProductSection();
  const productActive = !!activeProduct;
  const cls = html.classList;
  const viewportUnsafe = productActive && (
    w < 1920 ||
    h < 930 ||
    cls.contains('is-dense-view') ||
    cls.contains('is-short-view') ||
    cls.contains('is-compact-theatre') ||
    cls.contains('is-stacked-products') ||
    cls.contains('is-zoom-like-view')
  );
  let collides = false;

  if (sideIndex && activeProduct && !viewportUnsafe) {
    const indexRect = sideIndex.getBoundingClientRect();
    const targets = activeProduct.querySelectorAll('.product__info, .product__foot, .feature-list, .industry-grid');
    collides = [...targets].some((target) => rectsOverlap(indexRect, target.getBoundingClientRect(), 14));
  }

  cls.toggle('hide-side-index', viewportUnsafe);
  cls.toggle('side-index-collides', productActive && collides);
}

let sideIndexFrame = 0;
function queueSideIndexSync() {
  cancelAnimationFrame(sideIndexFrame);
  sideIndexFrame = requestAnimationFrame(syncSideIndexVisibility);
}

syncViewportLayout();
queueSideIndexSync();
addEventListener('scroll', queueSideIndexSync, { passive: true });
addEventListener('resize', () => {
  syncViewportLayout();
  queueSideIndexSync();
}, { passive: true });
addEventListener('orientationchange', () => {
  syncViewportLayout();
  queueSideIndexSync();
  setTimeout(syncViewportLayout, 180);
  setTimeout(queueSideIndexSync, 180);
}, { passive: true });
addEventListener('hashchange', queueSideIndexSync, { passive: true });
window.visualViewport?.addEventListener('resize', () => {
  syncViewportLayout();
  queueSideIndexSync();
}, { passive: true });
document.fonts?.ready?.then(() => {
  syncViewportLayout();
  queueSideIndexSync();
}).catch(() => {});
addEventListener('load', () => {
  syncViewportLayout();
  queueSideIndexSync();
  document.querySelectorAll('img').forEach((img) => {
    if (!img.complete) {
      img.addEventListener('load', () => {
        syncViewportLayout();
        queueSideIndexSync();
      }, { once: true });
    }
  });
}, { once: true });
window.__swivelSyncSideIndex = queueSideIndexSync;

/* High-power tablets (e.g. iPad Pro / Air) can drive the richer desktop corridor
   instead of always falling back to the conservative mobile path. We only opt a
   device in when the current viewport can actually fit the desktop theatre AND
   it reports plenty of cores/memory — phones and smaller/portrait tablets are
   excluded by the viewport gate alone.
   Safari does not expose navigator.deviceMemory, so memory is only *required*
   when the browser actually reports it. Misdetection degrades safely: a wrong
   "yes" is still caught by the adaptive-quality FPS probe; a wrong "no" just
   keeps the proven mobile experience. */
function isHighPowerTablet() {
  if (!matchMedia('(pointer: coarse), (hover: none)').matches) return false;
  if (!viewportCanFitRichScene()) return false;
  const minSide = Math.min(innerWidth, innerHeight);
  const maxSide = Math.max(innerWidth, innerHeight);
  const tabletSized = minSide >= 744 && maxSide >= 1024;   // iPad-mini and larger
  const cores = navigator.hardwareConcurrency || 0;
  const memory = navigator.deviceMemory;                    // undefined on Safari
  const powerful = cores >= 8 && (memory === undefined || memory >= 4);
  return tabletSized && powerful;
}

const finePointer = matchMedia('(pointer: fine) and (hover: hover)').matches;
const mobileMode =
  !viewportCanFitRichScene() ||
  (!finePointer && !isHighPowerTablet());

function webglSupported() {
  try {
    const c = document.createElement('canvas');
    const attrs = {
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    };
    const gl =
      c.getContext('webgl2', attrs) ||
      c.getContext('webgl', attrs) ||
      c.getContext('experimental-webgl', attrs);
    return !!gl && !gl.isContextLost?.() && gl.getParameter(gl.MAX_VERTEX_ATTRIBS) >= 8;
  } catch {
    return false;
  }
}

async function boot() {
  initChrome({ reduceMotion });

  const canvas = document.getElementById('gl');
  const wantGL =
    canvas &&
    !reduceMotion &&
    // getImageData on the logo is CORS-blocked under file:// — serve over http
    location.protocol !== 'file:' &&
    webglSupported();

  if (!wantGL) {
    html.classList.remove('gl-loading', 'gl', 'gl-mobile');
    html.classList.add('no-gl');
    if (location.hash) {
      requestAnimationFrame(() => window.__swivelScrollTo?.(location.hash, { immediate: true }));
    }
    return;
  }

  html.classList.add('gl-loading');
  try {
    const { initGL } = await import('./gl/engine.js');
    await initGL(canvas, { mobile: mobileMode });
  } catch (err) {
    console.warn('[swivel] WebGL stage unavailable, using static theme:', err);
    html.classList.remove('gl-loading', 'gl', 'gl-mobile');
    html.classList.add('no-gl');
  }
}

boot();
