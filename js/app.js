/* Boot — decides between the WebGL experience and the static fallback.
   The page is fully readable before any of this runs; everything here
   is progressive enhancement. */

import { initChrome } from './chrome.js';

const html = document.documentElement;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileMode = matchMedia('(max-width: 820px), (pointer: coarse), (hover: none)').matches;

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
