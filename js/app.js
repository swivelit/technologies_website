/* Boot — decides between the WebGL experience and the static fallback.
   The page is fully readable before any of this runs; everything here
   is progressive enhancement. */

import { initChrome } from './chrome.js';

const html = document.documentElement;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const smallScreen = matchMedia('(max-width: 820px)').matches;

function webglSupported() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
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
    !smallScreen &&
    // getImageData on the logo is CORS-blocked under file:// — serve over http
    location.protocol !== 'file:' &&
    webglSupported();

  if (!wantGL) {
    html.classList.add('no-gl');
    if (location.hash) {
      requestAnimationFrame(() => window.__swivelScrollTo?.(location.hash, { immediate: true }));
    }
    return;
  }

  html.classList.add('gl-loading');
  try {
    const { initGL } = await import('./gl/engine.js');
    await initGL(canvas);
  } catch (err) {
    console.warn('[swivel] WebGL stage unavailable, using static theme:', err);
    html.classList.remove('gl-loading', 'gl');
    html.classList.add('no-gl');
  }
}

boot();
