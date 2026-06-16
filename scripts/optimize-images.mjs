/* Build-time image pipeline (run: `npm run optimize:images`).
   ------------------------------------------------------------------
   Converts the committed PNG/JPEG source images under projects/ and images/ to
   resized WebP + AVIF, written next to each source (same path, new extension).
   The originals stay in the repo as the <picture> / loader fallback.

   - Screenshots (projects/**) cap at 1280px on the longest side; photos
     (images/*) cap at 1000px — both well above their on-screen / on-GPU size.
   - images/logo.png is left untouched (it feeds the favicon set and is sampled
     pixel-by-pixel by the particle logo formation).

   Idempotent: skips a target whose mtime is newer than its source. Prints a
   before/after payload summary at the end.
*/
import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { statSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOTS = ['projects', 'images'];
const EXCLUDE = new Set(['images/logo.png']);
const SRC_RE = /\.(png|jpe?g)$/i;
const WEBP = { quality: 80, effort: 5 };
const AVIF = { quality: 50, effort: 4 };
const POOL = 4;
const force = process.argv.includes('--force');

const rel = (f) => f.split(path.sep).join('/');
const maxSideFor = (f) => (rel(f).startsWith('images/') ? 1000 : 1280);

async function walk(dir, out = []) {
  let entries = [];
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, out);
    else if (SRC_RE.test(e.name)) out.push(full);
  }
  return out;
}

const fresh = (src, out) =>
  !force && existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs;

async function convert(file) {
  if (EXCLUDE.has(rel(file))) return null;
  const base = file.replace(SRC_RE, '');
  const webpOut = `${base}.webp`;
  const avifOut = `${base}.avif`;
  const maxSide = maxSideFor(file);
  const srcBytes = statSync(file).size;

  const pipe = () =>
    sharp(file, { failOn: 'none' }).rotate().resize({
      width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true,
    });

  if (!fresh(file, webpOut)) await pipe().webp(WEBP).toFile(webpOut);
  if (!fresh(file, avifOut)) await pipe().avif(AVIF).toFile(avifOut);
  return { src: srcBytes, webp: statSync(webpOut).size, avif: statSync(avifOut).size };
}

const files = (await Promise.all(ROOTS.map((r) => walk(r)))).flat();
console.log(`Optimizing ${files.length} images (webp + avif)…`);

const totals = { src: 0, webp: 0, avif: 0, n: 0 };
let i = 0;
async function worker() {
  while (i < files.length) {
    const f = files[i++];
    try {
      const r = await convert(f);
      if (r) { totals.src += r.src; totals.webp += r.webp; totals.avif += r.avif; totals.n++; }
      process.stdout.write('.');
    } catch (err) {
      console.warn(`\n  ! ${rel(f)}: ${err.message}`);
    }
  }
}
await Promise.all(Array.from({ length: POOL }, worker));

const mb = (b) => (b / 1048576).toFixed(2);
const pct = (a, b) => (100 - (b / a) * 100).toFixed(1);
console.log(`\n\nConverted ${totals.n} images`);
console.log(`  originals : ${mb(totals.src)} MB`);
console.log(`  webp      : ${mb(totals.webp)} MB  (-${pct(totals.src, totals.webp)}%)`);
console.log(`  avif      : ${mb(totals.avif)} MB  (-${pct(totals.src, totals.avif)}%)`);
