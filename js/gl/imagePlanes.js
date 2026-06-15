/* Scroll-driven WebGL 3D Product Image Corridor.
   ------------------------------------------------------------------
   A cinematic tunnel of real product screenshots floating as 3D image
   planes. Each product is its own "room" placed deeper down the -Z axis;
   as the work section scrolls the corridor camera dollies through them so
   the active product centres and neighbours drift to the sides/background.

   This is a SELF-CONTAINED enhancement: it owns its own THREE.Scene and
   PerspectiveCamera and is drawn by the engine as a second render pass, so
   it never touches the particle stage's camera, dolly or rotation. It fails
   gracefully — if a screenshot 404s a labelled placeholder plane is used,
   and if anything throws during setup the engine simply skips it and the
   normal HTML product cards remain the source of truth.

   Engine contract:
     const corridor = createCorridor(THREE, opts);   // may return null
     corridor.load();                                 // lazy textures (async)
     corridor.progress = 0..1                          // driven by ScrollTrigger
     corridor.show() / corridor.hide()                 // master fade in/out
     corridor.update(dt, pointerX, pointerY)           // per-frame
     renderer.render(corridor.scene, corridor.camera)  // 2nd pass
     corridor.resize(w, h)
     corridor.dispose()
*/

/* ------------------------------------------------------------------ *
 * Product data — id, display name, accent (mirrors the CSS --accent),
 * plane orientation and the screenshot list. To add/replace a product's
 * screenshots later, just edit the `images` array (paths are relative to
 * the site root and may contain spaces — they're encoded here already).
 * Order of `images` = order planes are filled (index 0 → the big centre
 * plane). Extra images beyond the plane count are simply ignored.
 * ------------------------------------------------------------------ */
export const CORRIDOR_PRODUCTS = [
  {
    id: 'good-one', name: 'GOOD ONE', accent: 0x38bdf8, orient: 'portrait',
    images: [
      'projects/goodone/goodone_03.png',
      'projects/goodone/goodone_08.png',
      'projects/goodone/goodone_01.png',
      'projects/goodone/goodone_07.png',
      'projects/goodone/goodone_11.png',
    ],
  },
  {
    id: 'swico-ai', name: 'SWICO AI', accent: 0x818cf8, orient: 'portrait',
    images: [
      'projects/swico/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2003_45_23%20AM%20%287%29.png',
      'projects/swico/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2003_45_23%20AM%20%288%29.png',
      'projects/swico/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2003_45_21%20AM%20%281%29.png',
      'projects/swico/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2003_45_22%20AM%20%284%29.png',
      'projects/swico/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2003_45_24%20AM%20%2810%29.png',
    ],
  },
  {
    id: 'grab-basket', name: 'GRAB BASKET', accent: 0xc084fc, orient: 'portrait',
    images: [
      'projects/grab%20basket/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2004_45_41%20AM%20%281%29.png',
      'projects/grab%20basket/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2004_45_43%20AM%20%286%29.png',
      'projects/grab%20basket/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2004_45_42%20AM%20%283%29.png',
      'projects/grab%20basket/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2004_45_44%20AM%20%289%29.png',
      'projects/grab%20basket/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2004_45_42%20AM%20%285%29.png',
    ],
  },
  {
    id: 'manas', name: 'MANAS', accent: 0x2dd4bf, orient: 'portrait',
    images: [
      'projects/manas/03_home.png',
      'projects/manas/05_healing_topics.png',
      'projects/manas/11_video_library.png',
      'projects/manas/09_booking.png',
      'projects/manas/04_mood_check-in.png',
    ],
  },
  {
    id: 'ai-business-assistant', name: 'AI BUSINESS ASSISTANT', accent: 0x34d399, orient: 'landscape',
    images: [
      'projects/Ai%20business%20assistant/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2005_57_05%20AM%20%281%29.png',
      'projects/Ai%20business%20assistant/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2005_57_06%20AM%20%286%29.png',
      'projects/Ai%20business%20assistant/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2005_57_05%20AM%20%283%29.png',
      'projects/Ai%20business%20assistant/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2005_57_06%20AM%20%288%29.png',
      'projects/Ai%20business%20assistant/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2005_57_07%20AM%20%2810%29.png',
    ],
  },
  {
    id: 'defect-detector', name: 'DEFECT DETECTOR', accent: 0xf76d6d, orient: 'landscape',
    images: [
      'projects/Defect%20detectors/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2006_04_59%20AM%20%282%29.png',
      'projects/Defect%20detectors/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2006_04_58%20AM%20%281%29.png',
      'projects/Defect%20detectors/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2006_04_59%20AM%20%283%29.png',
      'projects/Defect%20detectors/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2006_05_00%20AM%20%285%29.png',
      'projects/Defect%20detectors/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2006_04_59%20AM%20%284%29.png',
    ],
  },
];

/* layout slots inside one product "room", relative to the room centre.
   index 0 is the hero screen; supporting screens orbit around/behind it.
   x,y,z = offset   ry = yaw   rx/rz = tilt/roll   s = scale   op = opacity */
const BASE_SLOTS = [
  { x: 0.0, y: 0.24, z: 0.0, ry: 0.0, rx: 0.02, rz: 0.0, s: 1.0, op: 1.0 },
  { x: 4.55, y: 2.65, z: -4.75, ry: -0.36, rx: -0.04, rz: 0.02, s: 0.5, op: 0.62 },
  { x: 4.15, y: -2.9, z: -3.65, ry: -0.3, rx: 0.03, rz: -0.025, s: 0.55, op: 0.66 },
  { x: -3.0, y: 1.8, z: -6.45, ry: 0.42, rx: -0.02, rz: -0.03, s: 0.43, op: 0.48 },
  { x: 5.75, y: 0.35, z: -8.25, ry: -0.48, rx: 0.04, rz: 0.035, s: 0.4, op: 0.44 },
];

const MOBILE_SLOTS = [
  { x: 0.0, y: 0.06, z: 0.0, ry: 0.0, rx: 0.0, rz: 0.0, s: 0.9, op: 0.94 },
  { x: 2.4, y: -1.25, z: -4.4, ry: -0.26, rx: 0.0, rz: -0.015, s: 0.46, op: 0.48 },
];

const PRODUCT_PROFILES = {
  'good-one': {
    kind: 1, bob: 0.92, orbit: 0.55, yaw: 0.82, drift: 0.45, opacity: 1.0,
    distort: 0.52, glass: 0.7, scan: 0.16, glow: 0.74, trail: 0.42,
    roomX: 1.2, roomY: 0.35,
    slots: [
      BASE_SLOTS[0],
      { x: 4.25, y: 2.8, z: -4.1, ry: -0.28, rx: -0.02, rz: 0.025, s: 0.52, op: 0.66 },
      { x: 4.95, y: -2.45, z: -4.9, ry: -0.42, rx: 0.04, rz: -0.03, s: 0.49, op: 0.58 },
      { x: -2.95, y: 1.65, z: -6.8, ry: 0.38, rx: -0.02, rz: -0.025, s: 0.42, op: 0.46 },
      { x: 5.9, y: 0.15, z: -8.4, ry: -0.52, rx: 0.03, rz: 0.03, s: 0.38, op: 0.42 },
    ],
  },
  'swico-ai': {
    kind: 2, bob: 1.25, orbit: 0.95, yaw: 1.05, drift: 0.62, opacity: 0.96,
    distort: 0.7, glass: 0.76, scan: 0.2, glow: 0.8, trail: 0.46,
    roomX: 1.0, roomY: 0.65,
    slots: [
      { ...BASE_SLOTS[0], y: 0.12 },
      { x: 4.9, y: 2.35, z: -5.2, ry: -0.48, rx: -0.06, rz: 0.05, s: 0.48, op: 0.62 },
      { x: 3.55, y: -2.95, z: -3.9, ry: -0.22, rx: 0.05, rz: -0.05, s: 0.54, op: 0.58 },
      { x: -3.55, y: 2.2, z: -6.2, ry: 0.54, rx: -0.04, rz: -0.035, s: 0.4, op: 0.46 },
      { x: 5.55, y: -0.05, z: -8.7, ry: -0.55, rx: 0.05, rz: 0.04, s: 0.38, op: 0.4 },
    ],
  },
  'grab-basket': {
    kind: 3, bob: 0.8, orbit: 0.48, yaw: 0.68, drift: 0.38, opacity: 1.0,
    distort: 0.48, glass: 0.68, scan: 0.24, glow: 0.72, trail: 0.34,
    roomX: 1.3, roomY: 0.25,
    slots: [
      { ...BASE_SLOTS[0], y: 0.32 },
      { x: 4.4, y: 2.9, z: -3.6, ry: -0.22, rx: -0.02, rz: 0.0, s: 0.5, op: 0.64 },
      { x: 5.15, y: -2.6, z: -4.35, ry: -0.4, rx: 0.02, rz: -0.02, s: 0.5, op: 0.6 },
      { x: -2.7, y: -0.2, z: -6.1, ry: 0.36, rx: 0.0, rz: -0.025, s: 0.44, op: 0.48 },
      { x: 5.95, y: 0.95, z: -8.1, ry: -0.5, rx: 0.02, rz: 0.025, s: 0.39, op: 0.42 },
    ],
  },
  manas: {
    kind: 4, bob: 0.55, orbit: 0.42, yaw: 0.42, drift: 0.28, opacity: 0.94,
    distort: 0.34, glass: 0.62, scan: 0.08, glow: 0.66, trail: 0.22,
    roomX: 0.72, roomY: 0.42,
    slots: [
      { ...BASE_SLOTS[0], y: 0.22 },
      { x: 4.1, y: 2.15, z: -4.8, ry: -0.28, rx: -0.02, rz: 0.03, s: 0.48, op: 0.55 },
      { x: 3.7, y: -2.5, z: -4.0, ry: -0.18, rx: 0.02, rz: -0.02, s: 0.52, op: 0.56 },
      { x: -2.45, y: 1.35, z: -6.3, ry: 0.3, rx: -0.02, rz: -0.02, s: 0.4, op: 0.42 },
      { x: 5.1, y: 0.3, z: -8.0, ry: -0.38, rx: 0.02, rz: 0.02, s: 0.37, op: 0.36 },
    ],
  },
  'ai-business-assistant': {
    kind: 5, bob: 0.72, orbit: 0.36, yaw: 0.58, drift: 0.34, opacity: 0.98,
    distort: 0.42, glass: 0.7, scan: 0.32, glow: 0.78, trail: 0.34,
    roomX: 1.15, roomY: 0.2,
    slots: [
      { ...BASE_SLOTS[0], y: 0.1, s: 1.05 },
      { x: 4.7, y: 2.25, z: -4.6, ry: -0.32, rx: -0.035, rz: 0.01, s: 0.48, op: 0.56 },
      { x: 4.95, y: -2.35, z: -4.2, ry: -0.34, rx: 0.025, rz: -0.02, s: 0.52, op: 0.58 },
      { x: -2.75, y: 1.25, z: -6.8, ry: 0.36, rx: 0.0, rz: -0.02, s: 0.4, op: 0.44 },
      { x: 5.75, y: -0.15, z: -8.6, ry: -0.44, rx: 0.03, rz: 0.02, s: 0.38, op: 0.4 },
    ],
  },
  'defect-detector': {
    kind: 6, bob: 0.62, orbit: 0.28, yaw: 0.5, drift: 0.22, opacity: 1.0,
    distort: 0.38, glass: 0.66, scan: 0.55, glow: 0.86, trail: 0.52,
    roomX: 0.95, roomY: 0.12,
    slots: [
      { ...BASE_SLOTS[0], y: 0.08, s: 1.05 },
      { x: 4.55, y: 2.35, z: -4.25, ry: -0.34, rx: -0.02, rz: 0.0, s: 0.48, op: 0.58 },
      { x: 4.75, y: -2.15, z: -4.5, ry: -0.32, rx: 0.02, rz: -0.015, s: 0.52, op: 0.6 },
      { x: -2.55, y: 1.6, z: -6.2, ry: 0.32, rx: -0.015, rz: -0.02, s: 0.4, op: 0.44 },
      { x: 5.5, y: 0.05, z: -8.4, ry: -0.42, rx: 0.02, rz: 0.02, s: 0.38, op: 0.4 },
    ],
  },
};

function productProfile(product) {
  return PRODUCT_PROFILES[product.id] || PRODUCT_PROFILES['good-one'];
}

function productSlot(product, index, isMobile) {
  const profile = productProfile(product);
  const slots = isMobile ? (profile.mobileSlots || MOBILE_SLOTS) : (profile.slots || BASE_SLOTS);
  const slot = slots[index] || slots[slots.length - 1] || BASE_SLOTS[0];
  return { ...slot };
}

const SPACING = 15;     // depth between product rooms
const VIEW = 10;        // how far in front of the active room the camera sits
const FOG_NEAR = 9;     // view-space distance where planes start fading to bg
const FOG_FAR = 50;     // …and where they're fully absorbed by the dark
const ANCHOR_Y = 0.02;  // vertical anchor in NDC (~viewport centre, card height)

/* ------------------------------------------------------------------ *
 * glass-screen shader — texture + rounded corners + soft inner vignette,
 * an accent rim glow and a distance fog that melts far planes into the
 * dark. Output is raw (no colour-space conversion) to match the rest of
 * the canvas, so screenshots read like their source PNGs.
 * ------------------------------------------------------------------ */
const SCREEN_VERT = /* glsl */ `
varying vec2 vUv;
varying float vFog;
varying float vViewZ;
varying vec3 vViewPos;
uniform float uFogNear;
uniform float uFogFar;
void main(){
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewPos = mv.xyz;
  vViewZ = -mv.z;
  vFog = clamp((vViewZ - uFogNear) / max(0.001, uFogFar - uFogNear), 0.0, 1.0);
  gl_Position = projectionMatrix * mv;
}`;

const SCREEN_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying float vFog;
varying float vViewZ;
varying vec3 vViewPos;
uniform sampler2D uTex;
uniform float uHasTex;
uniform vec3 uAccent;
uniform vec3 uFog;
uniform float uOpacity;
uniform float uRadius;
uniform float uTime;
uniform float uVelocity;
uniform float uActive;
uniform float uDistort;
uniform float uGlass;
uniform float uScan;
uniform float uKind;
float roundedRect(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}
float hash21(vec2 p){
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
void main(){
  vec2 p = vUv - 0.5;
  float d = roundedRect(p, vec2(0.5), uRadius);
  float mask = smoothstep(0.006, -0.006, d);
  if (mask < 0.003) discard;

  float speed = clamp(abs(uVelocity), 0.0, 1.0);
  float edgeZone = smoothstep(0.18, 0.62, length(p) * 1.35);
  vec2 radial = normalize(p + 0.0001);
  vec2 wave = vec2(
    sin((vUv.y * 7.0 + uTime * 0.92) + sin(vUv.x * 9.0 + uTime * 0.35)),
    cos((vUv.x * 8.0 - uTime * 0.72) + sin(vUv.y * 7.0))
  );
  float liquid = (0.0025 + speed * 0.0045) * uDistort;
  vec2 warp = wave * liquid + radial * edgeZone * liquid * 0.8;
  vec2 uv = clamp(vUv + warp, vec2(0.002), vec2(0.998));

  vec3 col = uHasTex > 0.5
    ? texture2D(uTex, uv).rgb
    : mix(uAccent * 0.16, uAccent * 0.46, vUv.y) + 0.02;

  if (uHasTex > 0.5) {
    float chroma = (0.0012 + speed * 0.0045) * edgeZone * uGlass;
    float cr = texture2D(uTex, clamp(uv + radial * chroma, vec2(0.002), vec2(0.998))).r;
    float cb = texture2D(uTex, clamp(uv - radial * chroma, vec2(0.002), vec2(0.998))).b;
    col.r = mix(col.r, cr, edgeZone * 0.78);
    col.b = mix(col.b, cb, edgeZone * 0.78);
  }

  float vig = smoothstep(1.08, 0.28, length(p) * 1.28);
  col *= mix(0.68, 1.04, vig);

  float rim = smoothstep(0.06, 0.0, abs(d));
  float fresnel = pow(edgeZone, 2.4) * (0.42 + uActive * 0.45 + speed * 0.65);
  col += uAccent * rim * (0.34 + uGlass * 0.46 + speed * 0.22);
  col += uAccent * fresnel * 0.18;

  float scanLine = smoothstep(0.985, 1.0, sin((vUv.y + uTime * 0.08) * 420.0) * 0.5 + 0.5);
  float scanBand = smoothstep(0.06, 0.0, abs(fract(vUv.y * 1.24 - uTime * (0.08 + speed * 0.08)) - 0.5));
  float gridX = smoothstep(0.987, 1.0, sin(vUv.x * 95.0) * 0.5 + 0.5);
  float gridY = smoothstep(0.987, 1.0, sin(vUv.y * 78.0) * 0.5 + 0.5);
  float grid = max(gridX, gridY) * step(4.5, uKind);
  col += uAccent * (scanLine * 0.03 + scanBand * 0.18 + grid * 0.06) * uScan * (0.5 + uActive);

  float sheen = smoothstep(0.08, 0.0, abs((vUv.x + vUv.y * 0.55) - fract(uTime * 0.085) * 1.65 + 0.32));
  col += mix(vec3(0.6, 0.92, 1.0), uAccent, 0.35) * sheen * (0.055 + speed * 0.06) * uGlass;

  float noise = hash21(floor(vUv * vec2(120.0, 80.0)) + floor(uTime * 16.0));
  col += uAccent * (noise - 0.5) * 0.014 * uGlass;

  col = mix(col, uFog, vFog * 0.94);

  float a = mask * uOpacity * (1.0 - vFog * 0.10);
  gl_FragColor = vec4(col, a);
}`;

const AURA_VERT = /* glsl */ `
varying vec2 vUv;
varying float vFog;
uniform float uFogNear;
uniform float uFogFar;
void main(){
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float viewZ = -mv.z;
  vFog = clamp((viewZ - uFogNear) / max(0.001, uFogFar - uFogNear), 0.0, 1.0);
  gl_Position = projectionMatrix * mv;
}`;

const AURA_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying float vFog;
uniform vec3 uAccent;
uniform vec3 uFog;
uniform float uOpacity;
uniform float uRadius;
uniform float uTime;
uniform float uVelocity;
uniform float uGlow;
float roundedRect(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}
void main(){
  vec2 p = vUv - 0.5;
  float d = roundedRect(p, vec2(0.5), uRadius);
  float mask = smoothstep(0.04, -0.012, d);
  float edge = smoothstep(0.18, 0.0, abs(d));
  float core = smoothstep(0.62, 0.08, length(p));
  float breathe = 0.78 + 0.22 * sin(uTime * 1.3);
  float speed = clamp(abs(uVelocity), 0.0, 1.0);
  vec3 col = mix(uAccent * 0.42, uAccent * 1.22, edge + speed * 0.35);
  col = mix(col, uFog, vFog * 0.88);
  float a = mask * (edge * 0.75 + core * 0.2) * uOpacity * uGlow * breathe * (1.0 - vFog * 0.45);
  gl_FragColor = vec4(col, a);
}`;

/* labelled placeholder texture (used when a screenshot is missing) */
function labelTexture(THREE, name, accentHex) {
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 512;
  const ctx = cv.getContext('2d');
  const a = '#' + accentHex.toString(16).padStart(6, '0');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#0a0d16');
  g.addColorStop(1, '#05060a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = a; ctx.globalAlpha = 0.5; ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 472, 472); ctx.globalAlpha = 1;
  ctx.fillStyle = a; ctx.font = '600 30px "JetBrains Mono", monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const words = name.split(' ');
  words.forEach((w, i) => ctx.fillText(w, 256, 256 - (words.length - 1) * 22 + i * 44));
  ctx.globalAlpha = 0.5; ctx.font = '400 16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#7b8190';
  ctx.fillText('screenshot pending', 256, 470);
  const tex = new THREE.CanvasTexture(cv);
  tex.needsUpdate = true;
  return tex;
}

/* fetch → downscale → texture. Caps the largest dimension so we never push a
   2000px PNG to the GPU; draws onto a canvas for a clean, mip-friendly source. */
async function makeTexture(THREE, url, maxDim, maxAniso) {
  let w = 0, h = 0, source = null;
  try {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const bmp = await createImageBitmap(blob);
    w = bmp.width; h = bmp.height; source = bmp;
  } catch (err) {
    // fall back to an <img> (covers browsers without fetch/createImageBitmap)
    source = await new Promise((resolve, reject) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error(`image failed: ${url}`));
      im.src = url;
    });
    w = source.naturalWidth || source.width;
    h = source.naturalHeight || source.height;
  }
  if (!w || !h) throw new Error('empty image');

  const scale = Math.min(1, maxDim / Math.max(w, h));
  const cw = Math.max(2, Math.round(w * scale));
  const ch = Math.max(2, Math.round(h * scale));
  const cv = document.createElement('canvas');
  cv.width = cw; cv.height = ch;
  cv.getContext('2d').drawImage(source, 0, 0, cw, ch);
  source.close?.();

  const tex = new THREE.CanvasTexture(cv);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = maxAniso || 1;
  tex.needsUpdate = true;
  return { tex, aspect: w / h };
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function smoothstep(a, b, x) { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

/* ------------------------------------------------------------------ *
 * factory
 * ------------------------------------------------------------------ */
export function createCorridor(THREE, opts = {}) {
  const {
    mobile = false,
    reducedMotion = false,
    maxAnisotropy = 1,
    masterOpacity = mobile ? 0.46 : 0.72,
  } = opts;

  const planesPerRoom = mobile ? 2 : 5;
  const maxDim = mobile ? 540 : 940;
  // default horizontal anchor in NDC: desktop pushes the rooms toward the
  // right-hand product-card column (text sits on the left); mobile stacks the
  // layout, so keep the corridor centred behind the content.
  const defaultAnchorX = mobile ? 0.0 : 0.42;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 260);
  camera.position.set(0, 0, VIEW);

  // anchorGroup offsets every room toward the product-card area without moving
  // the camera, so the active hero screen lands beside the product copy
  const anchorGroup = new THREE.Group();
  scene.add(anchorGroup);

  const fogColor = new THREE.Color(0x05060a);
  const unit = new THREE.PlaneGeometry(1, 1);
  const rooms = [];     // { group, z, base, profile, planes:[{ mesh, aura, trails, ... }] }
  const allPlanes = []; // flat list for loading/disposal

  CORRIDOR_PRODUCTS.forEach((product, ri) => {
    const profile = productProfile(product);
    const group = new THREE.Group();
    const rz = -ri * SPACING;
    // gentle per-room drift so the corridor isn't a dead-straight pipe
    const rx = Math.sin(ri * 1.3) * profile.roomX;
    const ry = Math.cos(ri * 0.7) * profile.roomY;
    group.position.set(rx, ry, rz);
    anchorGroup.add(group);

    const accent = new THREE.Color(product.accent);
    const planes = [];
    for (let i = 0; i < planesPerRoom; i++) {
      const slot = productSlot(product, i, mobile);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTex: { value: null },
          uHasTex: { value: 0 },
          uAccent: { value: accent },
          uFog: { value: fogColor },
          uOpacity: { value: 0 },
          uRadius: { value: 0.045 },
          uFogNear: { value: FOG_NEAR },
          uFogFar: { value: FOG_FAR },
          uTime: { value: 0 },
          uVelocity: { value: 0 },
          uActive: { value: 0 },
          uDistort: { value: profile.distort },
          uGlass: { value: profile.glass },
          uScan: { value: profile.scan },
          uKind: { value: profile.kind },
        },
        vertexShader: SCREEN_VERT,
        fragmentShader: SCREEN_FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });
      const mesh = new THREE.Mesh(unit, mat);
      mesh.frustumCulled = false;
      mesh.rotation.set(slot.rx || 0, slot.ry || 0, slot.rz || 0);
      // no renderOrder override — three sorts transparent meshes back-to-front
      // by distance, so within a room the deeper siblings paint before the hero
      const basePos = new THREE.Vector3(slot.x, slot.y, slot.z);
      mesh.position.copy(basePos);

      const auraMat = new THREE.ShaderMaterial({
        uniforms: {
          uAccent: { value: accent },
          uFog: { value: fogColor },
          uOpacity: { value: 0 },
          uRadius: { value: 0.06 },
          uTime: { value: 0 },
          uVelocity: { value: 0 },
          uGlow: { value: profile.glow },
          uFogNear: { value: FOG_NEAR },
          uFogFar: { value: FOG_FAR },
        },
        vertexShader: AURA_VERT,
        fragmentShader: AURA_FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      });
      const aura = new THREE.Mesh(unit, auraMat);
      aura.frustumCulled = false;
      aura.position.copy(basePos).add(new THREE.Vector3(0, 0, -0.05));
      aura.rotation.copy(mesh.rotation);
      group.add(aura);
      group.add(mesh);

      const trails = [];
      if (!mobile && !reducedMotion && i === 0) {
        for (let k = 0; k < 2; k++) {
          const trailMat = auraMat.clone();
          trailMat.uniforms = {
            uAccent: { value: accent },
            uFog: { value: fogColor },
            uOpacity: { value: 0 },
            uRadius: { value: 0.065 },
            uTime: { value: 0 },
            uVelocity: { value: 0 },
            uGlow: { value: profile.glow * (0.65 - k * 0.14) },
            uFogNear: { value: FOG_NEAR },
            uFogFar: { value: FOG_FAR },
          };
          const trail = new THREE.Mesh(unit, trailMat);
          trail.frustumCulled = false;
          trail.position.copy(basePos).add(new THREE.Vector3(0, 0, -0.28 - k * 0.34));
          trail.rotation.copy(mesh.rotation);
          trails.push({ mesh: trail, mat: trailMat, lag: k + 1 });
          group.add(trail);
        }
      }

      const plane = {
        mesh, mat, aura, auraMat, trails, slot, slotIndex: i, basePos,
        phase: Math.random() * Math.PI * 2,
        url: product.images[i],
        product, profile,
      };
      // provisional size from orientation; refined when the texture arrives
      sizePlane(plane, product.orient === 'portrait' ? 0.46 : 1.6, mobile);
      planes.push(plane);
      allPlanes.push(plane);
    }
    rooms.push({ group, z: rz, base: new THREE.Vector3(rx, ry, rz), profile, planes });
  });

  function sizePlane(plane, aspect, isMobile) {
    const portraitH = isMobile ? 6.4 : 7.25;
    const landscapeW = isMobile ? 8.4 : 9.6;
    let w, h;
    if (aspect < 1) { h = portraitH; w = h * aspect; }
    else { w = landscapeW; h = w / aspect; }
    const sx = w * plane.slot.s;
    const sy = h * plane.slot.s;
    plane.mesh.scale.set(sx, sy, 1);
    plane.aura.scale.set(sx * 1.1, sy * 1.1, 1);
    for (const trail of plane.trails) trail.mesh.scale.set(sx * (1.08 + trail.lag * 0.045), sy * (1.08 + trail.lag * 0.045), 1);
  }

  const api = {
    scene, camera,
    count: CORRIDOR_PRODUCTS.length,
    // active product as a fractional index: 0=Good One … 5=Defect Detector.
    // engine sets targetHead from the visible product section; head eases to it.
    head: 0,
    targetHead: 0,
    visible: false,
    ready: true,
    master: 0,
    _time: 0,
    _loaded: false,
    _anchorX: defaultAnchorX,
    _anchorTargetX: defaultAnchorX,
    _prevHead: 0,
    _velocity: 0,

    /* explicit control surface (engine ↔ corridor) */
    setActive(i) { this.targetHead = clamp(i, 0, this.count - 1); },
    setHead(v) { this.targetHead = v; },
    setVisible(on) { this.visible = !!on; },
    setAnchorRect(rect) {
      if (!rect || !rect.width || mobile) return;   // mobile stays centred
      const cx = rect.left + rect.width / 2;
      this._anchorTargetX = clamp((cx / Math.max(1, innerWidth)) * 2 - 1, -0.85, 0.85);
    },

    /* lazy texture load — prioritises hero planes, small concurrency pool so
       it never stampedes the network or blocks the page. */
    async load() {
      if (this._loaded) return;
      this._loaded = true;
      // hero screens (slot 0) first, then the rest
      const queue = [...allPlanes].sort((a, b) => a.slotIndex - b.slotIndex);
      const pool = mobile ? 2 : 4;
      let cursor = 0;
      const worker = async () => {
        while (cursor < queue.length) {
          const plane = queue[cursor++];
          try {
            const { tex, aspect } = await makeTexture(THREE, plane.url, maxDim, maxAnisotropy);
            plane.mat.uniforms.uTex.value = tex;
            plane.mat.uniforms.uHasTex.value = 1;
            plane.tex = tex;
            sizePlane(plane, aspect, mobile);
          } catch (err) {
            const tex = labelTexture(THREE, plane.product.name, plane.product.accent);
            plane.mat.uniforms.uTex.value = tex;
            plane.mat.uniforms.uHasTex.value = 1;
            plane.tex = tex;
          }
        }
      };
      await Promise.all(Array.from({ length: pool }, worker));
    },

    update(dt, px = 0, py = 0) {
      // master fade follows the engine's visibility flag (set across the product
      // run), so the corridor only appears during the product sections.
      const mTarget = this.visible ? masterOpacity : 0;
      this.master += (mTarget - this.master) * Math.min(1, dt * 3);
      if (this.master < 0.002 && mTarget === 0) {
        this.master = 0;
        return; // fully hidden — engine skips the render pass
      }
      this._time += dt;
      const t = this._time;
      const N = rooms.length;

      // ease the fractional active room toward the section the engine reports
      this.head += (this.targetHead - this.head) * Math.min(1, dt * 4.5);
      const rawVelocity = (this.head - this._prevHead) / Math.max(dt, 1 / 60);
      this._prevHead = this.head;
      this._velocity += (rawVelocity * 0.22 - this._velocity) * Math.min(1, dt * 7);
      const vel = clamp(Math.abs(this._velocity), 0, 1);
      const head = clamp(this.head, -0.6, (N - 1) + 0.6);
      const camZ = VIEW - head * SPACING;

      // anchor the corridor beside the product card: convert the NDC anchor into
      // a world offset at the active room's depth and shift every room there.
      this._anchorX += (this._anchorTargetX - this._anchorX) * Math.min(1, dt * 4);
      const halfH = Math.tan((camera.fov * Math.PI) / 360) * VIEW;
      const halfW = halfH * camera.aspect;
      anchorGroup.position.x = this._anchorX * halfW;
      anchorGroup.position.y = ANCHOR_Y * halfH;

      // camera looks straight down the corridor; the anchorGroup offset (not the
      // camera) is what slides the rooms toward the card area. Subtle parallax.
      const par = reducedMotion ? 0 : 1;
      camera.position.set(px * 0.18 * par, py * 0.14 * par, camZ + Math.sin(t * 0.18) * 0.12 * par);
      camera.lookAt(px * 0.06 * par, py * 0.04 * par, camZ - 15.5);
      camera.rotation.z += -px * 0.0016 * par;

      for (let i = 0; i < N; i++) {
        const room = rooms[i];
        const ahead = camZ - room.z;                 // >0 in front, <0 passed
        const visible = ahead > -SPACING * 0.6 && ahead < FOG_FAR + SPACING * 1.5;
        room.group.visible = visible;
        if (!visible) continue;

        // active room reads at full strength; neighbours fall off fast so they
        // recede into depth rather than competing with the active product
        const focus = clamp(1 - Math.abs(i - head) * 0.62, 0.12, 1);
        const behind = smoothstep(-SPACING * 0.6, 2, ahead);
        const roomOpacity = this.master * focus * behind * room.profile.opacity;
        const roomWob = reducedMotion ? 0 : room.profile.drift;
        room.group.position.set(
          room.base.x + Math.sin(t * 0.22 + i * 1.7) * roomWob + px * 0.018 * focus * par,
          room.base.y + Math.cos(t * 0.18 + i * 1.1) * roomWob * 0.55 + py * 0.014 * focus * par,
          room.base.z
        );
        room.group.rotation.y = Math.sin(t * 0.2 + i) * 0.018 * room.profile.yaw * par + (i - head) * 0.018;
        room.group.rotation.x = Math.cos(t * 0.17 + i * 0.7) * 0.012 * room.profile.drift * par;

        for (const plane of room.planes) {
          const wob = reducedMotion ? 0 : 1;
          const support = plane.slotIndex === 0 ? 0.35 : 1;
          const bobY = Math.sin(t * (0.44 + plane.profile.bob * 0.12) + plane.phase) * 0.28 * plane.profile.bob * support * wob;
          const bobX = Math.cos(t * (0.32 + plane.profile.orbit * 0.1) + plane.phase) * 0.2 * plane.profile.orbit * support * wob;
          const bobZ = Math.sin(t * 0.28 + plane.phase * 0.7) * 0.28 * plane.profile.orbit * support * wob;
          const scrollLean = this._velocity * (plane.slotIndex === 0 ? 0.18 : 0.32);
          plane.mesh.position.set(
            plane.basePos.x + bobX,
            plane.basePos.y + bobY,
            plane.basePos.z + bobZ
          );
          plane.mesh.rotation.x = (plane.slot.rx || 0) + Math.cos(t * 0.22 + plane.phase) * 0.018 * plane.profile.bob * support * wob;
          plane.mesh.rotation.z = (plane.slot.rz || 0) + Math.sin(t * 0.34 + plane.phase) * 0.024 * plane.profile.orbit * support * wob;
          plane.mesh.rotation.y = plane.slot.ry + Math.sin(t * 0.27 + plane.phase) * 0.05 * plane.profile.yaw * support * wob + scrollLean;

          const planeOpacity = roomOpacity * plane.slot.op * (plane.slotIndex === 0 ? 1 : 0.88);
          const u = plane.mat.uniforms;
          u.uTime.value = t + plane.phase;
          u.uVelocity.value = vel;
          u.uActive.value = focus;
          u.uDistort.value = plane.profile.distort * (plane.slotIndex === 0 ? 1 : 0.72);
          u.uGlass.value = plane.profile.glass;
          u.uScan.value = plane.profile.scan * (plane.slotIndex === 0 ? 1 : 0.72);
          u.uOpacity.value = planeOpacity;

          plane.aura.position.copy(plane.mesh.position);
          plane.aura.position.z -= 0.06 + vel * 0.08;
          plane.aura.rotation.copy(plane.mesh.rotation);
          const au = plane.auraMat.uniforms;
          au.uTime.value = t + plane.phase;
          au.uVelocity.value = vel;
          au.uOpacity.value = planeOpacity * plane.profile.glow * (plane.slotIndex === 0 ? 0.26 : 0.14) * (0.75 + vel * 0.75);

          for (const trail of plane.trails) {
            trail.mesh.position.copy(plane.mesh.position);
            trail.mesh.position.x -= this._velocity * (0.32 + trail.lag * 0.22);
            trail.mesh.position.y += Math.sin(t * 0.9 + trail.lag) * 0.04;
            trail.mesh.position.z -= 0.34 + trail.lag * 0.42 + vel * 0.42;
            trail.mesh.rotation.copy(plane.mesh.rotation);
            trail.mesh.rotation.y -= this._velocity * 0.08 * trail.lag;
            trail.mat.uniforms.uTime.value = t + plane.phase + trail.lag;
            trail.mat.uniforms.uVelocity.value = vel;
            trail.mat.uniforms.uOpacity.value = planeOpacity * plane.profile.trail * vel * (0.32 / trail.lag);
          }
        }
      }
    },

    resize(w, h) {
      camera.aspect = (w || 1) / (h || 1);
      camera.updateProjectionMatrix();
    },

    dispose() {
      for (const plane of allPlanes) {
        plane.tex?.dispose?.();
        plane.mat.dispose();
        plane.auraMat.dispose();
        for (const trail of plane.trails) trail.mat.dispose();
      }
      unit.dispose();
      scene.remove(anchorGroup);
    },
  };

  return api;
}
