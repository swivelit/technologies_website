/* Particle formation generators.
   Every formation returns { positions, colors } — Float32Array(count*3)
   pairs in world units, centred on the origin, ready to be morph targets.
   Colours are PAINTED over the light ground (normal blend), so every value is
   ≤ 1.0 and reads as solid pigment — the old >1.0 "additive glow" trick is gone. */

const TAU = Math.PI * 2;

/* Indigo-on-light "AI / software / data" palette. INDIGO is the DOMINANT node
   colour; NAVY anchors the densest cores as dark, legible mass on the off-white;
   electric BLUE + CYAN are the secondary tech accents (network edges / pulses /
   sparse flecks). A warm SPARK survives only rarely. All values ≤ 1.0. */
const INDIGO = [0.28, 0.31, 0.86];    // dominant node — saturated indigo
const NAVY = [0.05, 0.08, 0.30];      // densest cores — near-navy dark mass
const BLUE = [0.16, 0.40, 0.95];      // electric blue          (accent)
const CYAN = [0.10, 0.62, 0.82];      // deep cyan              (accent)
const SPARK = [0.92, 0.45, 0.12];     // rare warm "data spark"

/* legacy alias: every existing call site that drew the "dominant" colour used
   ICE (cool-white); on light that maps to the dominant indigo. Dense cores are
   re-pointed to NAVY individually where they need dark mass. */
const ICE = INDIGO;

/* blend the two primaries: t=0 → blue, t=1 → cyan */
function coolMix(t) {
  return [
    BLUE[0] + (CYAN[0] - BLUE[0]) * t,
    BLUE[1] + (CYAN[1] - BLUE[1]) * t,
    BLUE[2] + (CYAN[2] - BLUE[2]) * t,
  ];
}

function gauss() {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}

function smooth01(t) {
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return t * t * (3 - 2 * t);
}

/* tiny hash-based 3D value noise + fbm — CPU-side gyri/sulci displacement for
   the brain cortex (the GLSL snoise lives only in the shader). Smoothstep-
   interpolated lattice, returns roughly [-1, 1]. */
function hash3(x, y, z) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = smooth01(xf), v = smooth01(yf), w = smooth01(zf);
  const L = (a, b, t) => a + (b - a) * t;
  const c = (i, j, k) => hash3(xi + i, yi + j, zi + k);
  return L(
    L(L(c(0, 0, 0), c(1, 0, 0), u), L(c(0, 1, 0), c(1, 1, 0), u), v),
    L(L(c(0, 0, 1), c(1, 0, 1), u), L(c(0, 1, 1), c(1, 1, 1), u), v),
    w,
  ) * 2 - 1;
}
function fbm3(x, y, z) {
  let a = 0, amp = 0.5, f = 1;
  for (let o = 0; o < 3; o++) { a += amp * vnoise3(x * f, y * f, z * f); f *= 2.03; amp *= 0.5; }
  return a;
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
    // dim cool-white motes, a few faintly blue
    const c = Math.random() < 0.2 ? coolMix(Math.random()) : ICE;
    const b = 0.06 + Math.random() * 0.14;
    colors[i * 3] = c[0] * b;
    colors[i * 3 + 1] = c[1] * b;
    colors[i * 3 + 2] = c[2] * b;
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
  const strays = Math.floor(count * 0.035); // cool dust orbiting the mark

  for (let i = 0; i < count; i++) {
    if (i < strays) {
      const a = Math.random() * TAU;
      const r = width * (0.55 + Math.random() * 0.55);
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.sin(a) * r * 0.45 + gauss() * 2;
      positions[i * 3 + 2] = gauss() * 3;
      const b = 0.2 + Math.random() * 0.38;
      const c = Math.random() < 0.05 ? SPARK : (Math.random() < 0.3 ? coolMix(Math.random()) : ICE);
      colors[i * 3] = c[0] * b;
      colors[i * 3 + 1] = c[1] * b;
      colors[i * 3 + 2] = c[2] * b;
      continue;
    }

    const k = (Math.random() * px.length) | 0;
    positions[i * 3] = (px[k] + Math.random() - 0.5 - cx) * scale;
    positions[i * 3 + 1] = (cy - (py[k] + Math.random() - 0.5)) * scale;
    positions[i * 3 + 2] = gauss() * 0.5;

    // recolour the warm source mark to crisp cool-white; edges glow brighter,
    // a few % carry a faint blue tint and a rare warm spark threads through
    let r = pr[k] + (ICE[0] - pr[k]) * 0.9;
    let g = pg[k] + (ICE[1] - pg[k]) * 0.9;
    let b = pb[k] + (ICE[2] - pb[k]) * 0.9;
    if (pe[k]) {
      r *= 1.45; g *= 1.45; b *= 1.5;            // ice-white edge glow
    } else if (Math.random() < 0.04) {
      const c = coolMix(Math.random());          // faint blue/cyan flecks
      r = c[0]; g = c[1]; b = c[2];
    } else if (Math.random() < 0.025) {
      r = SPARK[0]; g = SPARK[1]; b = SPARK[2];
    }
    const v = 0.78 + Math.random() * 0.42;
    colors[i * 3] = Math.min(r * v, 1.7);
    colors[i * 3 + 1] = Math.min(g * v, 1.7);
    colors[i * 3 + 2] = Math.min(b * v, 1.7);
  }

  return { positions, colors };
}

/* ---------- neural field (hero / idle field) ----------
   A broad, ambient NEURAL FIELD — NOT a literal brain. A wide, soft-edged
   volumetric plane spreading across the hero behind the headline: much wider
   than tall, with shallow depth, density peaking at the centre and dissolving
   smoothly into the dark (no silhouette, no boundary). A couple octaves of
   low-frequency fbm give a few softer denser regions / filaments — neural
   clustering, NOT hard hubs and NOT uniform/random fog. Cool indigo pigment;
   the firing waves (engine) supply the light later. Same export name + return
   contract (positions/colors/sizes); meta = { coreCount, extent }: a leading
   [0, coreCount) slice of denser CORE neurons (firing origins are sampled there)
   and extent = the field's HORIZONTAL half-extent so the firing driver can size
   its waves to sweep ACROSS the width. */
export function nebulaFormation(count, { radius = 30, mobile = false } = {}) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  // face the field mostly FRONTALLY — a broad plane across the screen with just
  // a slight tilt for depth (NOT the brain's 3/4 view).
  const place = tiltWriter(-0.1, 0.12, 0.02);

  // cool indigo field; a brighter cool tint marks the sparser "active" neurons
  const BRAIN = [0.30, 0.40, 0.74];
  const BRAIN_HI = [0.46, 0.62, 0.96];

  // half-axes: WIDE in x, short in y, shallow real depth in z. Pulled in from
  // 1.4 → 1.15 so the field doesn't fling edge-to-edge — calmer, more contained.
  const AX = radius * 1.15, AY = radius * 0.5, AZ = radius * 0.6;
  const clFreq = mobile ? 1.5 : 1.8;       // low-freq structural clustering

  const nCore = Math.floor(count * 0.3);   // dense central CORE — firing origins live here

  const put = (i, x, y, z, col, b, sz) => {
    place(positions, i, x, y, z);
    setCol(colors, i, col[0] * b, col[1] * b, col[2] * b);
    sizes[i] = sz;
  };

  // clamped gaussian → smooth radial falloff with no hard edge, but bounded so a
  // stray sample can't fling a point off-screen
  const cg = () => {
    const g = gauss();
    return g < -2.4 ? -2.4 : g > 2.4 ? 2.4 : g;
  };

  // structural density: a few soft denser regions + filaments. Two octaves at
  // different scales (the second stretched) read as connected clumps/strands,
  // not even dust. Contrast softened (1.85 → 1.15) so the clustering is CALM,
  // not patchy/explosive. Returns 0..1.
  const cluster = (nx, ny, nz) => {
    const a = fbm3(nx * clFreq + 4.3, ny * clFreq * 1.7 + 1.9, nz * clFreq + 7.1);
    const b = fbm3(nx * clFreq * 2.4 - 2.0, ny * clFreq * 1.3 + 5.0, nz * clFreq * 2.4 + 1.0);
    return smooth01((a * 0.62 + b * 0.38) * 1.15 + 0.42);
  };

  for (let i = 0; i < count; i++) {
    const core = i < nCore;
    // CORE neurons cluster tight at the centre; the broad FIELD spreads wide and
    // fades. Both are gaussian, so density peaks at centre and dissolves to edges.
    const spread = core ? 0.34 : 0.62;
    let x = 0, y = 0, z = 0, cl = 0, tries = 0;
    do {
      const nx = cg() * spread, ny = cg() * spread, nz = cg() * spread;
      x = AX * nx; y = AY * ny; z = AZ * nz;
      cl = cluster(nx, ny, nz);
      tries++;
      // rejection on the clustering field → denser clumps + emptier gaps WITHOUT
      // distorting the gaussian envelope. Core is accepted immediately.
      if (core || Math.random() < 0.14 + 0.86 * cl) break;
    } while (tries < 5);

    // brightness: brighter at the dense centre + on cluster crests; fades out.
    // RESTRAINT PASS — everything is dim, fine indigo; the firing waves supply the
    // drama. Brightness multipliers ~halved, "active" (HI) fractions ~halved, point
    // sizes shrunk + tightened, and the periphery skews smallest + dimmest so it
    // dissolves into the dark. No colour channel exceeds 1.0 (additive on dark).
    const rad = Math.exp(-(x * x / (AX * AX) + y * y / (AY * AY) + z * z / (AZ * AZ)) * 1.15);
    if (core) {
      if (Math.random() < 0.08) put(i, x, y, z, BRAIN_HI, 0.36 + 0.26 * rad, 0.8 + Math.random() * 0.35);
      else put(i, x, y, z, BRAIN, 0.22 + 0.30 * rad, 0.5 + Math.random() * 0.28);
    } else if (Math.random() < 0.04 && cl > 0.5) {
      put(i, x, y, z, BRAIN_HI, (0.32 + 0.30 * cl) * (0.4 + 0.6 * rad), 0.75 + Math.random() * 0.35);
    } else {
      const lit = (0.1 + 0.95 * cl) * (0.3 + 0.8 * rad);
      put(i, x, y, z, BRAIN, 0.05 + 0.42 * lit, (0.4 + 0.28 * Math.random()) * (0.72 + 0.28 * rad));
    }
  }

  return { positions, colors, sizes, meta: { coreCount: nCore, extent: AX } };
}

/* ============================================================
   Per-product formations. Each is a distinct ~36-44u shape on
   the origin with a baked cinematic tilt, palette-coloured with
   a handful of bright "spark" particles and ~3-4% orbiting dust.
   Distributions are fractions of count so the device-scaled
   budget always fills the shape.
   ============================================================ */

/* rotation closure (Y → X → Z) that writes straight into a buffer —
   bakes a tilt into every shape with no per-particle garbage. */
function tiltWriter(ax = 0, ay = 0, az = 0) {
  const cx = Math.cos(ax), sx = Math.sin(ax);
  const cy = Math.cos(ay), sy = Math.sin(ay);
  const cz = Math.cos(az), sz = Math.sin(az);
  return (out, i, x, y, z) => {
    const x1 = x * cy + z * sy;
    const z1 = z * cy - x * sy;
    const y2 = y * cx - z1 * sx;
    const z2 = y * sx + z1 * cx;
    const o = i * 3;
    out[o] = x1 * cz - y2 * sz;
    out[o + 1] = x1 * sz + y2 * cz;
    out[o + 2] = z2;
  };
}

function setCol(colors, i, r, g, b) {
  const o = i * 3;
  colors[o] = r; colors[o + 1] = g; colors[o + 2] = b;
}

/* bulk-particle colour: dominant cool-WHITE on the near-black base, with a
   minority of faint blue/cyan flecks (t selects the blend) and a rare warm
   spark. Keeps every product cloud crisp white-on-black; the blue/cyan tech
   accent lives mostly in the network edges/pulses. */
function setBase(colors, i, t, b) {
  const r = Math.random();
  if (r < 0.025) {
    const s = b * (1.15 + Math.random() * 0.6);
    setCol(colors, i, SPARK[0] * s, SPARK[1] * s, SPARK[2] * s);
  } else if (r < 0.18) {
    const c = coolMix(t);                                  // faint blue/cyan fleck
    setCol(colors, i, c[0] * b, c[1] * b, c[2] * b);
  } else {
    const w = 0.9 + Math.random() * 0.28;                  // cool-white
    setCol(colors, i, ICE[0] * b * w, ICE[1] * b * w, ICE[2] * b * w);
  }
}

/* loose orbiting motes around a form so a freshly-morphed shape still
   breathes; fills indices [0, n) with dim cool dust. */
function scatterDust(positions, colors, n, place, col, spreadXY, spreadZ = 4) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU;
    const r = spreadXY * (0.7 + Math.random() * 0.6);
    place(positions, i, Math.cos(a) * r, Math.sin(a) * r * 0.55 + gauss() * 2.2, gauss() * spreadZ);
    const b = 0.08 + Math.random() * 0.22;
    setCol(colors, i, col[0] * b, col[1] * b, col[2] * b);
  }
}

/* ---------- network edges (nearest-neighbour graph over a node subset) ----------
   Returns a flat Uint32Array of vertex-index pairs [a,b,a,b,…], usable directly
   as a THREE.LineSegments index into the shared particle buffer. "Nodes" are a
   strided subset of the formation; each links to its K nearest node neighbours.
   Total segments are hard-capped so the mesh never explodes. */
export function buildEdges(positions, count, { nodes = 800, k = 3, maxSegments = 2000, maxDistance = 0 } = {}) {
  nodes = Math.min(nodes | 0, count);
  if (nodes < 2 || k < 1) return new Uint32Array(0);
  const step = count / nodes;
  // when maxDistance is given, ignore candidate edges longer than it — this is
  // what keeps the network mesh as short LOCAL synapses instead of giant
  // triangles spanning the whole viewport.
  const maxD2 = maxDistance > 0 ? maxDistance * maxDistance : Infinity;

  const idx = new Int32Array(nodes);
  const nx = new Float32Array(nodes), ny = new Float32Array(nodes), nz = new Float32Array(nodes);
  for (let n = 0; n < nodes; n++) {
    const i = Math.min(count - 1, (n * step) | 0);
    idx[n] = i;
    nx[n] = positions[i * 3]; ny[n] = positions[i * 3 + 1]; nz[n] = positions[i * 3 + 2];
  }

  const pairs = [];
  const seen = new Set();
  const cap = maxSegments * 2;
  const bestD = new Float64Array(k);
  const bestJ = new Int32Array(k);
  for (let a = 0; a < nodes; a++) {
    for (let t = 0; t < k; t++) { bestD[t] = Infinity; bestJ[t] = -1; }
    const ax = nx[a], ay = ny[a], az = nz[a];
    for (let b = 0; b < nodes; b++) {
      if (b === a) continue;
      const dx = nx[b] - ax, dy = ny[b] - ay, dz = nz[b] - az;
      const d = dx * dx + dy * dy + dz * dz;
      if (d > maxD2) continue;            // skip over-long edges
      if (d >= bestD[k - 1]) continue;
      let t = k - 1;                                   // insertion sort into top-k
      while (t > 0 && d < bestD[t - 1]) { bestD[t] = bestD[t - 1]; bestJ[t] = bestJ[t - 1]; t--; }
      bestD[t] = d; bestJ[t] = b;
    }
    for (let t = 0; t < k; t++) {
      const b = bestJ[t];
      if (b < 0) continue;
      const lo = a < b ? a : b, hi = a < b ? b : a;
      const key = lo * nodes + hi;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push(idx[lo], idx[hi]);
      if (pairs.length >= cap) return new Uint32Array(pairs);
    }
  }
  return new Uint32Array(pairs);
}

/* ---------- 01 GOOD ONE — marketplace lattice ---------- */
/* an undulating grid of product tiles on the cool data base, with two
   highlighted buyer/seller clusters linked by bright sky-blue connections. */
export function goodOneFormation(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const place = tiltWriter(-0.34, 0.0, 0.12);

  const ACCENT = [0.30, 0.78, 1.4];                    // #38bdf8 sky highlight

  const W = 38, H = 23, cols = 9, rows = 6;
  const cellW = W / cols, cellH = H / rows;
  const tone = new Float32Array(cols * rows);
  const hiCell = new Uint8Array(cols * rows);
  for (let c = 0; c < tone.length; c++) {
    tone[c] = 0.55 + Math.random() * 0.65;
    hiCell[c] = Math.random() < 0.22 ? 1 : 0;
  }

  // buyer (left) and seller (right) anchors, lifted toward the camera
  const buyer = [-W * 0.34, H * 0.18, 5.5];
  const seller = [W * 0.34, -H * 0.18, 5.5];

  const dust = Math.floor(count * 0.035);
  const c1 = dust + Math.floor(count * 0.05);          // connection lines
  const c2 = c1 + Math.floor(count * 0.03);            // buyer cluster
  const c3 = c2 + Math.floor(count * 0.03);            // seller cluster

  scatterDust(positions, colors, dust, place, ICE, W * 0.6, 4.5);

  for (let i = dust; i < count; i++) {
    if (i < c1) {
      // two arced lines bowing toward the camera between the anchors
      const line = i & 1;
      const t = Math.random();
      const x = buyer[0] + (seller[0] - buyer[0]) * t;
      const y = buyer[1] + (seller[1] - buyer[1]) * t;
      const arc = Math.sin(t * Math.PI) * (line ? 5.5 : 3);
      place(positions, i, x, y + gauss() * 0.25 + (line ? 1.4 : -1.4) * Math.sin(t * Math.PI), buyer[2] + arc + gauss() * 0.25);
      const b = 0.85 + Math.random() * 0.8;
      setCol(colors, i, ACCENT[0] * b, ACCENT[1] * b, ACCENT[2] * b);
      continue;
    }
    if (i < c3) {
      const anchor = i < c2 ? buyer : seller;
      place(positions, i, anchor[0] + gauss() * 1.8, anchor[1] + gauss() * 1.8, anchor[2] + gauss() * 1.8);
      const hi = anchor === buyer ? ACCENT : ICE;       // buyer = sky, seller = ice-white
      const b = 0.75 + Math.random() * 0.7;
      setCol(colors, i, hi[0] * b, hi[1] * b, hi[2] * b);
      continue;
    }
    // grid tile — gaps between cells read as separate product tiles
    const cxi = (Math.random() * cols) | 0;
    const cyi = (Math.random() * rows) | 0;
    const ci = cyi * cols + cxi;
    const x = (cxi + 0.5) * cellW - W / 2 + (Math.random() - 0.5) * cellW * 0.72;
    const y = (cyi + 0.5) * cellH - H / 2 + (Math.random() - 0.5) * cellH * 0.72;
    const z = Math.sin(x * 0.17 + y * 0.12) * 2.6 + gauss() * 0.5;     // gentle undulation
    place(positions, i, x, y, z);
    const b = tone[ci] * (0.5 + Math.random() * 0.4);
    if (hiCell[ci]) setCol(colors, i, ACCENT[0] * b, ACCENT[1] * b, ACCENT[2] * b);
    else setBase(colors, i, 0.12 + (cxi / cols) * 0.55, b);          // cool base, blue→cyan
  }
  return { positions, colors };
}

/* ---------- 02 SWICO AI — voice orb ---------- */
/* an ice-white core sphere fading to indigo, ringed by expanding audio-wave
   bands in the cool base. accent indigo → cyan rings. */
export function swicoFormation(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const place = tiltWriter(-0.5, 0.0, 0.06);

  const ACCENT = [0.55, 0.58, 1.5];                    // #818cf8 indigo
  const rings = [13, 17.5, 22];

  const dust = Math.floor(count * 0.035);
  const c1 = dust + Math.floor(count * 0.5);           // core sphere

  scatterDust(positions, colors, dust, place, ICE, 26, 5);

  for (let i = dust; i < count; i++) {
    if (i < c1) {
      // glowing core, denser & brighter toward the middle
      const r = 8.5 * Math.pow(Math.random(), 0.7);
      const a = Math.random() * TAU;
      const ph = Math.acos(2 * Math.random() - 1);
      place(positions, i, r * Math.sin(ph) * Math.cos(a), r * Math.sin(ph) * Math.sin(a), r * Math.cos(ph));
      const k = 1 - r / 8.5;                            // 1 at centre
      const b = 0.4 + k * 1.1;
      const col = k > 0.66 ? ICE : ACCENT;              // ice-white heart, indigo body
      setCol(colors, i, col[0] * b, col[1] * b, col[2] * b);
      continue;
    }
    // equatorial wave rings (thin XZ bands), radius wobbling like a waveform
    const ri = (i - c1) % rings.length;
    const a = Math.random() * TAU;
    const rr = rings[ri] + gauss() * 0.9 + Math.sin(a * 6) * 0.5;
    place(positions, i, Math.cos(a) * rr, gauss() * 0.7, Math.sin(a) * rr);
    const b = (1.1 - ri * 0.22) * (0.45 + Math.random() * 0.5);
    setBase(colors, i, 0.4 + ri * 0.3, b);             // cool rings, outer ones cyan
  }
  return { positions, colors };
}

/* ---------- 03 GRAB BASKET — product cells ---------- */
/* a stacked wall of small cube clusters on the cool base, with a scatter of
   highlighted crates in the accent. base blue → cyan, violet highlights. */
export function grabBasketFormation(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const place = tiltWriter(-0.28, 0.42, 0.12);

  const ACCENT = [0.9, 0.62, 1.35];                    // #c084fc violet highlight

  const cols = 4, rows = 6, spacing = 4.8, cube = 3.1;
  const wallW = cols * spacing, wallH = rows * spacing;
  const nCells = cols * rows;
  const cellZ = new Float32Array(nCells);
  const tone = new Float32Array(nCells);
  const hot = new Uint8Array(nCells);
  for (let c = 0; c < nCells; c++) {
    cellZ[c] = (Math.random() - 0.5) * 8;              // loose depth stacking
    tone[c] = 0.55 + Math.random() * 0.6;
    hot[c] = Math.random() < 0.18 ? 1 : 0;
  }

  const dust = Math.floor(count * 0.035);
  scatterDust(positions, colors, dust, place, ICE, wallW * 0.95, 6);

  for (let i = dust; i < count; i++) {
    const cell = (Math.random() * nCells) | 0;
    const cxi = cell % cols, cyi = (cell / cols) | 0;
    const x = (cxi + 0.5) * spacing - wallW / 2 + (Math.random() - 0.5) * cube;
    const y = (cyi + 0.5) * spacing - wallH / 2 + (Math.random() - 0.5) * cube;
    const z = cellZ[cell] + (Math.random() - 0.5) * cube;
    place(positions, i, x, y, z);
    const b = tone[cell] * (0.55 + Math.random() * 0.4);
    if (hot[cell]) setCol(colors, i, ACCENT[0] * b, ACCENT[1] * b, ACCENT[2] * b);
    else setBase(colors, i, 0.15 + (cyi / rows) * 0.55, b);          // cool base, blue→cyan
  }
  return { positions, colors };
}

/* ---------- 04 MANAS — breathing mandala ---------- */
/* concentric rings of evenly-spaced lotus petals around a luminous core;
   calm, planar, serene. teal → soft cyan. */
export function manasFormation(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const place = tiltWriter(-0.2, 0.0, 0.0);

  const ACCENT = [0.22, 0.95, 0.85];                   // #2dd4bf teal

  const rings = [
    { r: 5, n: 6, len: 6.5, wid: 2.4 },
    { r: 10, n: 12, len: 7, wid: 2.2 },
    { r: 14.5, n: 18, len: 7.5, wid: 2.0 },
    { r: 19, n: 24, len: 7.5, wid: 1.9 },
  ];
  const slots = [];
  rings.forEach((ring, ri) => {
    for (let p = 0; p < ring.n; p++) {
      const ang = (p / ring.n) * TAU + (ri % 2) * (Math.PI / ring.n);   // interleave rings
      slots.push({ ang, r: ring.r, len: ring.len, wid: ring.wid, ri });
    }
  });

  const dust = Math.floor(count * 0.03);
  const c1 = dust + Math.floor(count * 0.08);          // core flower

  scatterDust(positions, colors, dust, place, ICE, 26, 2.4);

  for (let i = dust; i < count; i++) {
    if (i < c1) {
      const r = 4 * Math.pow(Math.random(), 0.5);
      const a = Math.random() * TAU;
      place(positions, i, Math.cos(a) * r, Math.sin(a) * r, gauss() * 0.4);
      const b = 0.7 + Math.random() * 0.7;
      const col = Math.random() < 0.4 ? ICE : ACCENT;  // ice-white heart, teal petals
      setCol(colors, i, col[0] * b, col[1] * b, col[2] * b);
      continue;
    }
    const s = slots[(Math.random() * slots.length) | 0];
    const tt = Math.random();
    const wid = Math.sin(tt * Math.PI);                // almond taper at both tips
    const radial = s.r + (tt - 0.5) * s.len;
    const across = (Math.random() - 0.5) * s.wid * wid;
    const ca = Math.cos(s.ang), sa = Math.sin(s.ang);
    const z = Math.cos(radial * 0.13) * 0.9 + gauss() * 0.3;            // gentle dome
    place(positions, i, ca * radial - sa * across, sa * radial + ca * across, z);
    const b = 0.5 + Math.random() * 0.4;               // low variance, serene
    // inner rings teal-accented, outer rings settle onto the cool-white base
    if (s.ri < 2) setCol(colors, i, ACCENT[0] * b, ACCENT[1] * b, ACCENT[2] * b);
    else setBase(colors, i, 0.7 + Math.random() * 0.3, b);
  }
  return { positions, colors };
}

/* ---------- 05 AI BUSINESS ASSISTANT — network graph ---------- */
/* a branching node hierarchy wired by edge particles sampled along
   parent→child segments. emerald nodes, ice-white root, cool-blue edges. */
export function aiAssistantFormation(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const place = tiltWriter(-0.32, 0.34, 0.1);

  const ACCENT = [0.22, 0.95, 0.66];                   // #34d399 emerald nodes

  // build a small radial tree of nodes + edges
  const nodes = [{ x: 0, y: 0, z: 0, r: 1.7, lvl: 0 }];
  const edges = [];
  const l1 = 5 + (Math.random() * 2 | 0);
  for (let a = 0; a < l1; a++) {
    const ang = (a / l1) * TAU + (Math.random() - 0.5) * 0.3;
    const i1 = nodes.length;
    nodes.push({ x: Math.cos(ang) * (8 + Math.random() * 2), y: Math.sin(ang) * (8 + Math.random() * 2) * 0.82, z: gauss() * 2, r: 1.15, lvl: 1 });
    edges.push([0, i1]);
    const l2 = 2 + (Math.random() * 2 | 0);
    for (let b = 0; b < l2; b++) {
      const ang2 = ang + (b - (l2 - 1) / 2) * 0.32 + (Math.random() - 0.5) * 0.12;
      const rad2 = 15 + Math.random() * 2.5;
      const i2 = nodes.length;
      nodes.push({ x: Math.cos(ang2) * rad2, y: Math.sin(ang2) * rad2 * 0.82, z: gauss() * 3, r: 0.85, lvl: 2 });
      edges.push([i1, i2]);
      if (Math.random() < 0.5) {
        const ang3 = ang2 + (Math.random() - 0.5) * 0.4;
        const rad3 = 20.5 + Math.random() * 2.5;
        edges.push([i2, nodes.length]);
        nodes.push({ x: Math.cos(ang3) * rad3, y: Math.sin(ang3) * rad3 * 0.82, z: gauss() * 3.5, r: 0.7, lvl: 3 });
      }
    }
  }

  const dust = Math.floor(count * 0.035);
  const c1 = dust + Math.floor(count * 0.4);           // node clusters

  scatterDust(positions, colors, dust, place, ICE, 30, 5);

  for (let i = dust; i < count; i++) {
    if (i < c1) {
      const n = nodes[(Math.random() * nodes.length) | 0];
      place(positions, i, n.x + gauss() * n.r, n.y + gauss() * n.r, n.z + gauss() * n.r);
      const col = n.lvl === 0 ? ICE : ACCENT;          // ice-white root, emerald nodes
      const b = n.lvl === 0 ? 1.3 : 0.7 + Math.random() * 0.6;
      setCol(colors, i, col[0] * b, col[1] * b, col[2] * b);
      continue;
    }
    // edge particle along a parent→child segment
    const e = edges[(Math.random() * edges.length) | 0];
    const a = nodes[e[0]], b2 = nodes[e[1]];
    const t = Math.random();
    place(positions, i, a.x + (b2.x - a.x) * t + gauss() * 0.35, a.y + (b2.y - a.y) * t + gauss() * 0.35, a.z + (b2.z - a.z) * t + gauss() * 0.35);
    const b = 0.3 + Math.random() * 0.42;
    setBase(colors, i, 0.05 + Math.random() * 0.35, b);              // cool-blue wiring
  }
  return { positions, colors };
}

/* ---------- 06 DEFECT DETECTOR — inspection grid ---------- */
/* a cool measurement grid with bounding-box overlays and a bright central
   reticle. blue grid base; the lone warm alert-coral accent marks defects. */
export function defectFormation(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const place = tiltWriter(-0.16, 0.0, 0.0);

  const ACCENT = [1.6, 0.43, 0.42];                    // #f76d6d alert-coral reticle

  const W = 38, H = 26, cols = 15, rows = 10;
  const boxes = [
    { x: -8, y: 5, w: 9, h: 7, col: ICE },
    { x: 9, y: -4, w: 8, h: 9, col: ACCENT },
    { x: -3, y: -8.5, w: 7, h: 5, col: ICE },
  ];

  const dust = Math.floor(count * 0.035);
  const c1 = dust + Math.floor(count * 0.6);           // grid dots
  const c2 = c1 + Math.floor(count * 0.08);            // reticle

  scatterDust(positions, colors, dust, place, ICE, W * 0.6, 3.5);

  for (let i = dust; i < count; i++) {
    if (i < c1) {
      // dot clustered on a grid intersection
      const ix = (Math.random() * (cols + 1)) | 0;
      const iy = (Math.random() * (rows + 1)) | 0;
      place(positions, i, ix * (W / cols) - W / 2 + gauss() * 0.35, iy * (H / rows) - H / 2 + gauss() * 0.35, gauss() * 0.35);
      const b = 0.28 + Math.random() * 0.3;            // dim cool measurement grid
      setBase(colors, i, 0.12 + (ix / cols) * 0.4, b);
      continue;
    }
    if (i < c2) {
      // central crosshair + ring reticle
      let x, y;
      if (Math.random() < 0.6) {
        if (Math.random() < 0.5) { x = (Math.random() - 0.5) * 9; y = gauss() * 0.16; }
        else { x = gauss() * 0.16; y = (Math.random() - 0.5) * 9; }
      } else {
        const a = Math.random() * TAU, rr = 3.4 + gauss() * 0.18;
        x = Math.cos(a) * rr; y = Math.sin(a) * rr;
      }
      place(positions, i, x, y, gauss() * 0.25);
      const b = 0.9 + Math.random() * 0.8;
      setCol(colors, i, ACCENT[0] * b, ACCENT[1] * b, ACCENT[2] * b);
      continue;
    }
    // bounding-box outline (one of a few detected regions)
    const box = boxes[(Math.random() * boxes.length) | 0];
    const hw = box.w / 2, hh = box.h / 2;
    let x, y;
    if (Math.random() < 0.5) { x = box.x + (Math.random() - 0.5) * box.w; y = box.y + (Math.random() < 0.5 ? -hh : hh); }
    else { x = box.x + (Math.random() < 0.5 ? -hw : hw); y = box.y + (Math.random() - 0.5) * box.h; }
    place(positions, i, x + gauss() * 0.18, y + gauss() * 0.18, gauss() * 0.3);
    const b = 0.7 + Math.random() * 0.7;
    setCol(colors, i, box.col[0] * b, box.col[1] * b, box.col[2] * b);
  }
  return { positions, colors };
}
