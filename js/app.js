/* Boot — decides between the WebGL experience and the static fallback.
   The page is fully readable before any of this runs; everything here
   is progressive enhancement. */

import { initChrome } from './chrome.js';

const html = document.documentElement;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const RICH_SCENE_MIN_WIDTH = 1500;
const RICH_SCENE_MIN_HEIGHT = 820;
const FULL_CORRIDOR_MIN_WIDTH = 1600;
const FULL_CORRIDOR_MIN_HEIGHT = 860;
const COMPACT_THEATRE_WIDTH = 1366;
const COMPACT_THEATRE_HEIGHT = 720;
const STACKED_PRODUCTS_WIDTH = 1120;
const STACKED_PRODUCTS_HEIGHT = 680;

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
  const desktopFit = Math.min(w / 1920, h / 900);
  const theatreFit = Math.min(w / FULL_CORRIDOR_MIN_WIDTH, h / FULL_CORRIDOR_MIN_HEIGHT);
  const compactFit = Math.min(w / COMPACT_THEATRE_WIDTH, h / COMPACT_THEATRE_HEIGHT);
  const productFit = clamp(theatreFit, 0.46, 1.08);
  const density = clamp(1 - compactFit, 0, 0.54);
  const visualConstrained = h < layoutH * 0.94 || w < layoutW * 0.94 || visualScale > 1.01;
  const finePointer = matchMedia('(pointer: fine) and (hover: hover)').matches;
  const dense = w < RICH_SCENE_MIN_WIDTH || h < RICH_SCENE_MIN_HEIGHT;
  const short = h < RICH_SCENE_MIN_HEIGHT;
  const compact = w < COMPACT_THEATRE_WIDTH || h < COMPACT_THEATRE_HEIGHT;
  const stacked = w < STACKED_PRODUCTS_WIDTH || h < STACKED_PRODUCTS_HEIGHT;
  const zoomLike = visualConstrained || (finePointer && (w < FULL_CORRIDOR_MIN_WIDTH || h < FULL_CORRIDOR_MIN_HEIGHT));

  html.style.setProperty('--viewport-w', `${w}px`);
  html.style.setProperty('--viewport-h', `${h}px`);
  html.style.setProperty('--viewport-fit', String(clamp(desktopFit, 0.46, 1.08).toFixed(4)));
  html.style.setProperty('--product-fit', String(productFit.toFixed(4)));
  html.style.setProperty('--product-copy-scale', String(clamp(0.78 + productFit * 0.22 - density * 0.1, 0.72, 1).toFixed(4)));
  html.style.setProperty('--product-visual-scale', String(clamp(0.6 + productFit * 0.4 - density * 0.12, 0.52, 1.04).toFixed(4)));
  html.style.setProperty('--product-density', String(density.toFixed(4)));

  html.classList.toggle('is-wide-view', w >= FULL_CORRIDOR_MIN_WIDTH && h >= FULL_CORRIDOR_MIN_HEIGHT);
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

  return { w, h, dense, compact, stacked };
}

function viewportCanFitRichScene() {
  const { w, h, dense, compact, stacked } = syncViewportLayout();
  return w >= RICH_SCENE_MIN_WIDTH &&
    h >= RICH_SCENE_MIN_HEIGHT &&
    !dense &&
    !compact &&
    !stacked;
}

syncViewportLayout();
addEventListener('resize', syncViewportLayout, { passive: true });
addEventListener('orientationchange', () => {
  syncViewportLayout();
  setTimeout(syncViewportLayout, 180);
}, { passive: true });
window.visualViewport?.addEventListener('resize', syncViewportLayout, { passive: true });
document.fonts?.ready?.then(syncViewportLayout).catch(() => {});
addEventListener('load', () => {
  syncViewportLayout();
  document.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', syncViewportLayout, { once: true });
  });
}, { once: true });

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
