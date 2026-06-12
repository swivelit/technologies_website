/* Particle formation generators.
   Every formation returns { positions, colors } — Float32Array(count*3)
   pairs in world units, centred on the origin, ready to be morph targets.
   Colors may exceed 1.0; the additive blend treats that as extra glow. */

const TAU = Math.PI * 2;

const EMBER = [1.0, 0.48, 0.1];
const GOLD = [1.0, 0.85, 0.55];

function gauss() {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image failed: ${url}`));
    img.src = url;
  });
}

/* ---------- scattered spawn cloud (pre-intro state) ---------- */
export function spawnFormation(count, radius = 95) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * (0.5 + Math.random() * 0.6);
    const th = Math.random() * TAU;
    const ph = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(ph) * Math.cos(th);
    positions[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
    positions[i * 3 + 2] = r * Math.cos(ph) * 0.6;
    const warm = Math.random();
    const b = 0.1 + Math.random() * 0.2;
    colors[i * 3] = b * (0.6 + warm * 0.6);
    colors[i * 3 + 1] = b * 0.5;
    colors[i * 3 + 2] = b * (1.0 - warm * 0.5);
  }
  return { positions, colors };
}

/* ---------- logo, sampled from images/logo.png pixels ---------- */
export async function logoFormation(url, count, { width = 30 } = {}) {
  const img = await loadImage(url);

  const S = 380; // sampling resolution (longest side)
  const cw = img.width >= img.height ? S : Math.round((S * img.width) / img.height);
  const ch = img.width >= img.height ? Math.round((S * img.height) / img.width) : S;
  const cv = document.createElement('canvas');
  cv.width = cw;
  cv.height = ch;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, cw, ch);
  const data = ctx.getImageData(0, 0, cw, ch).data;

  // background = average of the four corners (handles both white-matte
  // and transparent source files)
  const corner = (x, y) => data.slice((y * cw + x) * 4, (y * cw + x) * 4 + 4);
  const cs = [corner(0, 0), corner(cw - 1, 0), corner(0, ch - 1), corner(cw - 1, ch - 1)];
  const bg = [0, 1, 2, 3].map((k) => (cs[0][k] + cs[1][k] + cs[2][k] + cs[3][k]) / 4);
  const transparentBg = bg[3] < 128;

  const isInk = (x, y) => {
    if (x < 0 || y < 0 || x >= cw || y >= ch) return false;
    const o = (y * cw + x) * 4;
    if (transparentBg) return data[o + 3] > 96;
    const dr = data[o] - bg[0], dg = data[o + 1] - bg[1], db = data[o + 2] - bg[2];
    return dr * dr + dg * dg + db * db > 56 * 56;
  };

  const px = [], py = [], pr = [], pg = [], pb = [], pe = [];
  let minX = cw, maxX = 0, minY = ch, maxY = 0;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      if (!isInk(x, y)) continue;
      const o = (y * cw + x) * 4;
      const edge = !(isInk(x - 2, y) && isInk(x + 2, y) && isInk(x, y - 2) && isInk(x, y + 2));
      px.push(x); py.push(y);
      pr.push(data[o] / 255); pg.push(data[o + 1] / 255); pb.push(data[o + 2] / 255);
      pe.push(edge);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (px.length < 100) throw new Error('logo sampling found too few pixels');

  const bw = maxX - minX || 1;
  const scale = width / bw;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const strays = Math.floor(count * 0.035); // ember dust orbiting the mark

  for (let i = 0; i < count; i++) {
    if (i < strays) {
      const a = Math.random() * TAU;
      const r = width * (0.55 + Math.random() * 0.55);
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.sin(a) * r * 0.45 + gauss() * 2;
      positions[i * 3 + 2] = gauss() * 3;
      const b = 0.25 + Math.random() * 0.45;
      colors[i * 3] = EMBER[0] * b;
      colors[i * 3 + 1] = EMBER[1] * b;
      colors[i * 3 + 2] = EMBER[2] * b;
      continue;
    }

    const k = (Math.random() * px.length) | 0;
    positions[i * 3] = (px[k] + Math.random() - 0.5 - cx) * scale;
    positions[i * 3 + 1] = (cy - (py[k] + Math.random() - 0.5)) * scale;
    positions[i * 3 + 2] = gauss() * 0.5;

    // pixel colour pulled toward ember for cohesion; edges burn brighter
    let r = pr[k] + (EMBER[0] - pr[k]) * 0.3;
    let g = pg[k] + (EMBER[1] - pg[k]) * 0.3;
    let b = pb[k] + (EMBER[2] - pb[k]) * 0.3;
    if (pe[k]) {
      r = (r + GOLD[0] * 0.4) * 1.45;
      g = (g + GOLD[1] * 0.4) * 1.45;
      b = (b + GOLD[2] * 0.4) * 1.45;
    }
    const v = 0.75 + Math.random() * 0.45;
    colors[i * 3] = Math.min(r * v, 1.6);
    colors[i * 3 + 1] = Math.min(g * v, 1.6);
    colors[i * 3 + 2] = Math.min(b * v, 1.6);
  }

  return { positions, colors };
}

/* ---------- blue/violet nebula with warm accents ---------- */
export function nebulaFormation(count, { radius = 34 } = {}) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const BLUE = [0.2, 0.36, 1.0];
  const VIOLET = [0.5, 0.28, 1.0];
  const MAGENTA = [0.78, 0.26, 1.0];
  const CORE = [0.74, 0.6, 1.0];
  const DUST = [0.24, 0.3, 0.8];

  // baked cinematic tilt
  const ax = -0.45, az = 0.16;
  const cosX = Math.cos(ax), sinX = Math.sin(ax);
  const cosZ = Math.cos(az), sinZ = Math.sin(az);

  for (let i = 0; i < count; i++) {
    let x, y, z;
    let cr, cg, cb;
    const u = Math.random();

    if (u < 0.68) {
      // three log-spiral arms
      const t = Math.pow(Math.random(), 0.62);
      const arm = i % 3;
      const ang = arm * (TAU / 3) + t * 2.5 + gauss() * 0.06;
      const rad = 3.5 + t * radius;
      const spread = 1.1 + t * 4.4;
      x = Math.cos(ang) * rad + gauss() * spread;
      y = (Math.sin(ang) * rad + gauss() * spread) * 0.62;
      z = gauss() * (2.4 + t * 3.4);

      const mixT = Math.min(1, t * 1.25);
      let base = Math.random() < 0.12 ? MAGENTA : null;
      if (!base) {
        base = [
          VIOLET[0] + (BLUE[0] - VIOLET[0]) * mixT,
          VIOLET[1] + (BLUE[1] - VIOLET[1]) * mixT,
          VIOLET[2] + (BLUE[2] - VIOLET[2]) * mixT,
        ];
      }
      const v = (1.15 - t * 0.65) * (0.38 + Math.random() * 0.5);
      cr = base[0] * v; cg = base[1] * v; cb = base[2] * v;
    } else if (u < 0.8) {
      // glowing violet core — kept modest so it doesn't blow out white
      x = gauss() * 3.8; y = gauss() * 2.7; z = gauss() * 2.7;
      const v = 0.5 + Math.random() * 0.45;
      cr = CORE[0] * v; cg = CORE[1] * v; cb = CORE[2] * v;
    } else {
      // sparse far halo dust, very dim
      const r = radius * 2.1 * Math.cbrt(Math.random());
      const th = Math.random() * TAU;
      const ph = Math.acos(2 * Math.random() - 1);
      x = r * Math.sin(ph) * Math.cos(th);
      y = r * Math.sin(ph) * Math.sin(th) * 0.7;
      z = r * Math.cos(ph) * 0.6;
      const v = 0.1 + Math.random() * 0.16;
      cr = DUST[0] * v; cg = DUST[1] * v; cb = DUST[2] * v;
    }

    // hints of warm orange threaded through arms and halo
    if (u < 0.68 || u >= 0.8) {
      if (Math.random() < 0.07) {
        const v = 0.5 + Math.random() * 0.55;
        cr = EMBER[0] * v; cg = EMBER[1] * v; cb = EMBER[2] * v;
      }
    }

    // tilt: rotate about X, then Z
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    const x2 = x * cosZ - y1 * sinZ;
    const y2 = x * sinZ + y1 * cosZ;

    positions[i * 3] = x2;
    positions[i * 3 + 1] = y2;
    positions[i * 3 + 2] = z1;
    colors[i * 3] = cr;
    colors[i * 3 + 1] = cg;
    colors[i * 3 + 2] = cb;
  }

  return { positions, colors };
}
