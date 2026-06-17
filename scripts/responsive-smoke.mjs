import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const DEFAULT_PORT = Number(process.env.RESPONSIVE_PORT || 4173);

const VIEWPORTS = [
  [1920, 900],
  [1745, 818],
  [1536, 720],
  [1280, 600],
  [1728, 850],
  [1600, 800],
  [1440, 760],
  [320, 568],
  [360, 640],
  [375, 667],
  [390, 844],
  [414, 896],
  [568, 320],
  [667, 375],
  [768, 1024],
  [1024, 768],
  [1280, 720],
  [1366, 650],
  [1366, 768],
  [1440, 700],
  [1440, 900],
  [1920, 1080],
  [2560, 1080],
];

const PAGES = [
  '/index.html',
  '/index.html#work',
  '/index.html#good-one',
  '/index.html#swico-ai',
  '/index.html#grab-basket',
  '/index.html#manas',
  '/index.html#ai-business-assistant',
  '/index.html#defect-detector',
  '/index.html#contact',
  '/career.html',
];

const PRODUCT_EXPECTATIONS = new Map([
  ['/index.html#good-one', { id: 'good-one', prefix: 'projects/goodone/' }],
  ['/index.html#swico-ai', { id: 'swico-ai', prefix: 'projects/swico/' }],
  ['/index.html#grab-basket', { id: 'grab-basket', prefix: 'projects/grab%20basket/' }],
  ['/index.html#manas', { id: 'manas', prefix: 'projects/manas/' }],
  ['/index.html#ai-business-assistant', { id: 'ai-business-assistant', prefix: 'projects/Ai%20business%20assistant/' }],
  ['/index.html#defect-detector', { id: 'defect-detector', prefix: 'projects/Defect%20detectors/' }],
]);

const TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.avif', 'image/avif'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
  ['.webmanifest', 'application/manifest+json'],
]);

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function startServer(port = DEFAULT_PORT) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
      let pathname = decodeURIComponent(url.pathname);
      if (pathname === '/') pathname = '/index.html';
      const file = resolve(join(ROOT, pathname));
      if (!file.startsWith(ROOT + sep) && file !== ROOT) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      const body = await readFile(file);
      res.writeHead(200, {
        'content-type': TYPES.get(extname(file).toLowerCase()) || 'application/octet-stream',
        'cache-control': 'no-store',
      });
      res.end(body);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    }
  });

  return new Promise((resolveServer, reject) => {
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE' && port !== 0) {
        startServer(0).then(resolveServer, reject);
        return;
      }
      reject(err);
    });
    server.listen(port, '127.0.0.1', () => {
      const address = server.address();
      resolveServer({
        server,
        origin: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

function cacheBustedPath(path, width, height, index) {
  const [base, hash = ''] = path.split('#');
  const joiner = base.includes('?') ? '&' : '?';
  return `${base}${joiner}smoke=${width}x${height}-${index}${hash ? `#${hash}` : ''}`;
}

async function loadBrowser() {
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch();
    return {
      name: 'playwright',
      browser,
      newPage: () => browser.newPage(),
      setViewport: (page, width, height) => page.setViewportSize({ width, height }),
      goto: (page, url) => page.goto(url, { waitUntil: 'load', timeout: 45000 }),
      wait: (page, ms) => page.waitForTimeout(ms),
      closePage: (page) => page.close(),
      close: () => browser.close(),
    };
  } catch {}

  const puppeteer = await import('puppeteer-core').catch(() => null);
  if (!puppeteer) {
    throw new Error('Install a browser test driver to run responsive smoke tests: npm install -D playwright && npx playwright install chromium, or npm install -D puppeteer-core and set CHROME_PATH.');
  }

  const executablePath =
    process.env.CHROME_PATH ||
    [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
    ].find((path) => existsSync(path));

  if (!executablePath) {
    throw new Error('No Chrome executable found. Set CHROME_PATH, or install Playwright and run npx playwright install chromium.');
  }

  const browser = await puppeteer.default.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'],
  });
  return {
    name: 'puppeteer-core',
    browser,
    newPage: () => browser.newPage(),
    setViewport: (page, width, height) => page.setViewport({ width, height, deviceScaleFactor: 1 }),
    goto: (page, url) => page.goto(url, { waitUntil: 'load', timeout: 45000 }),
    wait: (_page, ms) => sleep(ms),
    closePage: (page) => page.close(),
    close: () => browser.close(),
  };
}

async function evaluatePage(page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const doc = document.documentElement;
    const body = document.body;
    const visible = (rect) => rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < vh;
    const inViewportX = (rect, tolerance = 1) => rect.left >= -tolerance && rect.right <= vw + tolerance;
    const overlaps = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) > 2 &&
      Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)) > 2;

    const wideElements = [...document.body.querySelectorAll('*')]
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return { el, rect };
      })
      .filter(({ el, rect }) => {
        const style = getComputedStyle(el);
        if (style.position === 'fixed' && rect.width <= vw + 2) return false;
        return rect.width > vw + 2 || rect.left < -2 || rect.right > vw + 2;
      })
      .slice(0, 8)
      .map(({ el, rect }) => ({
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        className: String(el.className || '').slice(0, 120),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
      }));

    const headerIssues = [...document.querySelectorAll('.chrome--top, .brand, .pills, .pill')]
      .map((el) => ({ el, rect: el.getBoundingClientRect() }))
      .filter(({ rect }) => visible(rect) && !inViewportX(rect, 2))
      .map(({ el, rect }) => `${el.className || el.tagName} ${Math.round(rect.left)}..${Math.round(rect.right)}`);

    const cardIssues = [...document.querySelectorAll('.product__card')]
      .map((el) => ({ el, rect: el.getBoundingClientRect() }))
      .filter(({ rect }) => visible(rect) && !inViewportX(rect, 8))
      .map(({ el, rect }) => `${el.closest('.scene--product')?.id || 'product'} ${Math.round(rect.left)}..${Math.round(rect.right)}`);

    const infoIssues = [...document.querySelectorAll('.product__info')]
      .map((el) => ({ el, rect: el.getBoundingClientRect() }))
      .filter(({ rect }) => visible(rect) && !inViewportX(rect, 2))
      .map(({ el, rect }) => `${el.closest('.scene--product')?.id || 'product'} ${Math.round(rect.left)}..${Math.round(rect.right)}`);

    const productOverlaps = [...document.querySelectorAll('.product')]
      .map((product) => {
        const info = product.querySelector('.product__info')?.getBoundingClientRect();
        const card = product.querySelector('.product__card-wrap')?.getBoundingClientRect();
        const id = product.closest('.scene--product')?.id || 'product';
        return info && card && visible(info) && visible(card) && overlaps(info, card) ? id : null;
      })
      .filter(Boolean);

    const stacked = doc.classList.contains('is-stacked-products');
    const compact = doc.classList.contains('is-compact-theatre');
    const dense = doc.classList.contains('is-dense-view');
    const short = doc.classList.contains('is-short-view');
    const zoomLike = doc.classList.contains('is-zoom-like-view');
    const wide = doc.classList.contains('is-wide-view');

    const visualFitIssues = [...document.querySelectorAll('.scene--product')]
      .map((scene) => {
        const info = scene.querySelector('.product__info')?.getBoundingClientRect();
        const card = scene.querySelector('.product__card')?.getBoundingClientRect();
        const sceneOkFallback = scene.classList.contains('scene--unstick') || stacked;
        const infoBad = info && visible(info) && info.height > vh * 0.84;
        const cardBad = card && visible(card) && card.height > vh * 0.78;
        if ((infoBad || cardBad) && !sceneOkFallback) {
          return `${scene.id}: info=${info ? Math.round(info.height) : 0}, card=${card ? Math.round(card.height) : 0}, vh=${vh}`;
        }
        return null;
      })
      .filter(Boolean);

    const chromeIndexIssue = (dense || short || compact || (zoomLike && !wide))
      ? [...document.querySelectorAll('.chrome--index, .chrome--progress')]
          .filter((el) => getComputedStyle(el).display !== 'none')
          .map((el) => el.className || el.tagName)
      : [];

    const stickyIssues = doc.classList.contains('gl')
      ? [...document.querySelectorAll('.scene--product')]
          .filter((scene) => {
            const hold = scene.querySelector('.scene__hold');
            const info = scene.querySelector('.product__info')?.getBoundingClientRect();
            const card = scene.querySelector('.product__card')?.getBoundingClientRect();
            const tooTall =
              (hold && hold.scrollHeight > (window.visualViewport?.height || vh) + 1) ||
              (info && info.height > vh * 0.84) ||
              (card && card.height > vh * 0.78);
            return tooTall && !scene.classList.contains('scene--unstick') && !stacked;
          })
          .map((scene) => scene.id)
      : [];

    const canvas = document.getElementById('gl');
    const canvasRect = canvas?.getBoundingClientRect();
    const canvasIssue = doc.classList.contains('gl') && canvasRect
      ? Math.abs(canvasRect.width - vw) > 2 || Math.abs(canvasRect.height - vh) > 2
      : false;

    return {
      url: location.pathname + location.hash,
      viewport: `${vw}x${vh}`,
      docScrollWidth: doc.scrollWidth,
      bodyScrollWidth: body.scrollWidth,
      overflowDoc: doc.scrollWidth > vw + 1,
      overflowBody: body.scrollWidth > vw + 1,
      wideElements,
      headerIssues,
      cardIssues,
      infoIssues,
      productOverlaps,
      visualFitIssues,
      chromeIndexIssue,
      stickyIssues,
      canvasIssue,
      gl: doc.classList.contains('gl'),
      glMobile: doc.classList.contains('gl-mobile'),
      classes: {
        wide,
        dense,
        short,
        zoomLike,
        compact,
        stacked,
      },
    };
  });
}

async function checkOverlay(page, id) {
  return page.evaluate(async (overlayId) => {
    const trigger = document.querySelector(`[data-open="${overlayId}"]`);
    trigger?.click();
    await new Promise((resolveWait) => requestAnimationFrame(() => requestAnimationFrame(resolveWait)));
    const overlay = document.getElementById(overlayId);
    const panel = overlay?.querySelector('.overlay__panel');
    const rect = panel?.getBoundingClientRect();
    const ok = !!rect &&
      rect.left >= -1 &&
      rect.right <= innerWidth + 1 &&
      rect.top >= -1 &&
      rect.bottom <= innerHeight + 1;
    overlay?.querySelector('.overlay__close')?.click();
    return ok ? null : `${overlayId} panel does not fit viewport`;
  }, id);
}

async function checkProductIdentity(page, path) {
  const expected = PRODUCT_EXPECTATIONS.get(path);
  if (!expected) return [];

  return page.evaluate(async ({ id, prefix }) => {
    const issues = [];
    const containsExpected = (url) => String(url || '').includes(prefix);
    const isVisible = (el) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < innerHeight &&
        rect.right > 0 &&
        rect.left < innerWidth &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity || 1) > 0.04;
    };
    const sectionAtCenter = () => {
      const centerY = innerHeight / 2;
      let containing = null;
      let nearest = null;
      [...document.querySelectorAll('.scene--product')].forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const contains = rect.top <= centerY && rect.bottom >= centerY;
        const distance = contains
          ? Math.abs((rect.top + rect.bottom) / 2 - centerY)
          : Math.max(0, rect.top > centerY ? rect.top - centerY : centerY - rect.bottom);
        const candidate = { id: section.id, distance };
        if (contains && (!containing || distance < containing.distance)) containing = candidate;
        if (!nearest || distance < nearest.distance) nearest = candidate;
      });
      return containing || nearest;
    };
    const cardAtCenter = () => {
      const centerY = innerHeight / 2;
      let containing = null;
      let nearest = null;
      [...document.querySelectorAll('.scene--product .product__card')].forEach((card) => {
        if (!isVisible(card)) return;
        const rect = card.getBoundingClientRect();
        const sectionId = card.closest('.scene--product')?.id || '';
        const contains = rect.top <= centerY && rect.bottom >= centerY;
        const distance = contains
          ? Math.abs((rect.top + rect.bottom) / 2 - centerY)
          : Math.max(0, rect.top > centerY ? rect.top - centerY : centerY - rect.bottom);
        const candidate = { id: sectionId, distance };
        if (contains && (!containing || distance < containing.distance)) containing = candidate;
        if (!nearest || distance < nearest.distance) nearest = candidate;
      });
      return containing || nearest;
    };

    const section = document.getElementById(id);
    if (!section) return [`missing product section ${id}`];

    const debug = window.__swivelDebug?.corridor?.() || null;
    const corridorVisible = !!debug && !debug.viewportDisabled && Number(debug.masterOpacity || 0) > 0.01;
    if (corridorVisible) {
      const activeSection = sectionAtCenter();
      if (activeSection?.id && activeSection.id !== id) {
        issues.push(`viewport center is ${activeSection.id}, expected ${id}`);
      }
      if (debug.activeProductId !== id) {
        issues.push(`corridor active product ${debug.activeProductId || 'none'}, expected ${id}`);
      }
      if (debug.activeImageUrl && !containsExpected(debug.activeImageUrl)) {
        issues.push(`corridor active image ${debug.activeImageUrl}, expected ${prefix}`);
      }
    }

    if (!corridorVisible) {
      const card = section.querySelector('.product__card');
      card?.scrollIntoView({ block: 'center', inline: 'nearest' });
      await new Promise((resolveWait) => setTimeout(resolveWait, 280));

      const centeredCard = cardAtCenter();
      if (centeredCard?.id && centeredCard.id !== id) {
        issues.push(`visible HTML product card is ${centeredCard.id}, expected ${id}`);
      }
      if (!isVisible(card)) {
        issues.push(`expected HTML product card for ${id} is not visible`);
      }
      const imageUrls = [...section.querySelectorAll('.product__card img, .device img, picture img')]
        .map((img) => img.currentSrc || img.src || img.getAttribute('src') || '')
        .filter(Boolean);
      const wrongImage = imageUrls.find((url) => !containsExpected(url));
      if (wrongImage) {
        issues.push(`HTML product card image ${wrongImage}, expected ${prefix}`);
      }
    }

    return issues;
  }, expected);
}

function summarizeFailure(result, consoleErrors, overlayIssues) {
  const failures = [];
  if (result.overflowDoc) failures.push(`document scrollWidth ${result.docScrollWidth}`);
  if (result.overflowBody) failures.push(`body scrollWidth ${result.bodyScrollWidth}`);
  if (result.headerIssues.length) failures.push(`header out of bounds: ${result.headerIssues.join(', ')}`);
  if (result.infoIssues.length) failures.push(`product info out of bounds: ${result.infoIssues.join(', ')}`);
  if (result.cardIssues.length) failures.push(`cards out of bounds: ${result.cardIssues.join(', ')}`);
  if (result.productOverlaps.length) failures.push(`product overlap: ${result.productOverlaps.join(', ')}`);
  if (result.visualFitIssues.length) failures.push(`product visual fit: ${result.visualFitIssues.join(', ')}`);
  if (result.chromeIndexIssue.length) failures.push(`dense chrome still visible: ${result.chromeIndexIssue.join(', ')}`);
  if (result.stickyIssues.length) failures.push(`sticky not released: ${result.stickyIssues.join(', ')}`);
  if (result.canvasIssue) failures.push('WebGL canvas size does not match viewport');
  if (result.wideElements.length) failures.push(`wide elements: ${JSON.stringify(result.wideElements)}`);
  if (consoleErrors.length) failures.push(`console errors: ${consoleErrors.join(' | ')}`);
  if (overlayIssues.length) failures.push(`overlay: ${overlayIssues.join(' | ')}`);
  return failures;
}

const { server, origin } = await startServer();
const driver = await loadBrowser();
const failures = [];
console.log(`responsive smoke: ${driver.name} at ${origin}`);

try {
  for (const [width, height] of VIEWPORTS) {
    const page = await driver.newPage();
    await driver.setViewport(page, width, height);
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    for (let pathIndex = 0; pathIndex < PAGES.length; pathIndex++) {
      const path = PAGES[pathIndex];
      await driver.goto(page, `${origin}${cacheBustedPath(path, width, height, pathIndex)}`);
      await driver.wait(page, PRODUCT_EXPECTATIONS.has(path) ? 1500 : 900);
      const result = await evaluatePage(page);
      const overlayIssues = [];
      if (path === '/index.html') {
        for (const id of ['contactOverlay', 'productsOverlay']) {
          const issue = await checkOverlay(page, id);
          if (issue) overlayIssues.push(issue);
          await driver.wait(page, 80);
        }
      }
      const identityIssues = await checkProductIdentity(page, path);
      const pageFailures = summarizeFailure(result, consoleErrors.splice(0), overlayIssues)
        .concat(identityIssues);
      if (pageFailures.length) {
        failures.push(`${width}x${height} ${path}: ${pageFailures.join('; ')}`);
      }
    }
    await driver.closePage(page);
    console.log(`checked ${width}x${height}`);
  }
} finally {
  await driver.close().catch(() => {});
  server.close();
}

if (failures.length) {
  console.error(`\nresponsive smoke failed (${failures.length})`);
  failures.slice(0, 80).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 80) console.error(`...and ${failures.length - 80} more`);
  process.exit(1);
}

console.log('responsive smoke passed');
