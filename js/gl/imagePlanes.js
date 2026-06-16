/* Scroll-driven WebGL 3D Product Image Corridor.
   ------------------------------------------------------------------
   A holographic theatre of real product screenshots floating as 3D image
   planes. Each product is its own "room" placed deeper down the -Z axis;
   within each room a second, local scroll head promotes every screenshot
   through the foreground hero position before it falls back into the rack.

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
 * Order of `images` = scroll order inside the product theatre.
 * ------------------------------------------------------------------ */
export const CORRIDOR_PRODUCTS = [
  {
    id: 'good-one', name: 'GOOD ONE', accent: 0x38bdf8, orient: 'portrait',
    images: [
      'projects/goodone/goodone_01.png',
      'projects/goodone/goodone_02.png',
      'projects/goodone/goodone_03.png',
      'projects/goodone/goodone_04.png',
      'projects/goodone/goodone_05.png',
      'projects/goodone/goodone_06.png',
      'projects/goodone/goodone_07.png',
      'projects/goodone/goodone_08.png',
      'projects/goodone/goodone_09.png',
      'projects/goodone/goodone_10.png',
      'projects/goodone/goodone_11.png',
      'projects/goodone/goodone_12.png',
    ],
  },
  {
    id: 'swico-ai', name: 'SWICO AI', accent: 0x818cf8, orient: 'portrait',
    images: [
      'projects/swico/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2003_45_21%20AM%20%281%29.png',
      'projects/swico/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2003_45_21%20AM%20%282%29.png',
      'projects/swico/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2003_45_22%20AM%20%283%29.png',
      'projects/swico/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2003_45_22%20AM%20%284%29.png',
      'projects/swico/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2003_45_22%20AM%20%285%29.png',
      'projects/swico/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2003_45_22%20AM%20%286%29.png',
      'projects/swico/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2003_45_23%20AM%20%287%29.png',
      'projects/swico/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2003_45_23%20AM%20%288%29.png',
      'projects/swico/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2003_45_24%20AM%20%289%29.png',
      'projects/swico/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2003_45_24%20AM%20%2810%29.png',
    ],
  },
  {
    id: 'grab-basket', name: 'GRAB BASKET', accent: 0xc084fc, orient: 'portrait',
    images: [
      'projects/grab%20basket/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2004_45_41%20AM%20%281%29.png',
      'projects/grab%20basket/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2004_45_41%20AM%20%282%29.png',
      'projects/grab%20basket/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2004_45_42%20AM%20%283%29.png',
      'projects/grab%20basket/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2004_45_42%20AM%20%284%29.png',
      'projects/grab%20basket/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2004_45_42%20AM%20%285%29.png',
      'projects/grab%20basket/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2004_45_43%20AM%20%286%29.png',
      'projects/grab%20basket/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2004_45_43%20AM%20%287%29.png',
      'projects/grab%20basket/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2004_45_43%20AM%20%288%29.png',
      'projects/grab%20basket/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2004_45_44%20AM%20%289%29.png',
      'projects/grab%20basket/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2004_45_44%20AM%20%2810%29.png',
    ],
  },
  {
    id: 'manas', name: 'MANAS', accent: 0x2dd4bf, orient: 'portrait',
    images: [
      'projects/manas/01_welcome.png',
      'projects/manas/02_auth.png',
      'projects/manas/03_home.png',
      'projects/manas/04_mood_check-in.png',
      'projects/manas/05_healing_topics.png',
      'projects/manas/06_coaching_list.png',
      'projects/manas/07_topic_detail.png',
      'projects/manas/08_coaches.png',
      'projects/manas/09_booking.png',
      'projects/manas/10_sessions_and_call.png',
      'projects/manas/11_video_library.png',
      'projects/manas/12_profile.png',
      'projects/manas/13_assistant_overlay.png',
      'projects/manas/14_coach_portal.png',
      'projects/manas/15_admin_portal.png',
    ],
  },
  {
    id: 'ai-business-assistant', name: 'AI BUSINESS ASSISTANT', accent: 0x34d399, orient: 'landscape',
    images: [
      'projects/Ai%20business%20assistant/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2005_57_05%20AM%20%281%29.png',
      'projects/Ai%20business%20assistant/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2005_57_05%20AM%20%282%29.png',
      'projects/Ai%20business%20assistant/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2005_57_05%20AM%20%283%29.png',
      'projects/Ai%20business%20assistant/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2005_57_05%20AM%20%284%29.png',
      'projects/Ai%20business%20assistant/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2005_57_06%20AM%20%285%29.png',
      'projects/Ai%20business%20assistant/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2005_57_06%20AM%20%286%29.png',
      'projects/Ai%20business%20assistant/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2005_57_06%20AM%20%287%29.png',
      'projects/Ai%20business%20assistant/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2005_57_06%20AM%20%288%29.png',
      'projects/Ai%20business%20assistant/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2005_57_06%20AM%20%289%29.png',
      'projects/Ai%20business%20assistant/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2005_57_07%20AM%20%2810%29.png',
    ],
  },
  {
    id: 'defect-detector', name: 'DEFECT DETECTOR', accent: 0xf76d6d, orient: 'landscape',
    images: [
      'projects/Defect%20detectors/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2006_04_58%20AM%20%281%29.png',
      'projects/Defect%20detectors/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2006_04_59%20AM%20%282%29.png',
      'projects/Defect%20detectors/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2006_04_59%20AM%20%283%29.png',
      'projects/Defect%20detectors/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2006_04_59%20AM%20%284%29.png',
      'projects/Defect%20detectors/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2006_05_00%20AM%20%285%29.png',
      'projects/Defect%20detectors/ChatGPT%20Image%20Jun%2015%2C%202026%2C%2006_05_00%20AM%20%286%29.png',
    ],
  },
];

/* Continuous theatre personalities. These values do not bind a screenshot to a
   fixed slot; they bend the shared carousel path so each product keeps its own
   motion language while imageHead decides which screenshot is the hero. */
const PRODUCT_PROFILES = {
  'good-one': {
    kind: 1, bob: 0.92, orbit: 0.55, yaw: 0.82, drift: 0.45, opacity: 1.0,
    distort: 0.52, glass: 0.7, scan: 0.16, glow: 0.74, trail: 0.42,
    roomX: 1.2, roomY: 0.35, spread: 1.0, depth: 1.0, heroScale: 1.02,
    sideScale: 1.0, rackScale: 1.0, wave: 0.14, shelf: 0.22, calm: 1.0,
  },
  'swico-ai': {
    kind: 2, bob: 1.25, orbit: 0.95, yaw: 1.05, drift: 0.62, opacity: 0.96,
    distort: 0.7, glass: 0.76, scan: 0.2, glow: 0.8, trail: 0.46,
    roomX: 1.0, roomY: 0.65, spread: 1.06, depth: 1.08, heroScale: 1.0,
    sideScale: 0.96, rackScale: 0.96, wave: 0.68, shelf: 0.05, calm: 0.92,
  },
  'grab-basket': {
    kind: 3, bob: 0.8, orbit: 0.48, yaw: 0.68, drift: 0.38, opacity: 1.0,
    distort: 0.48, glass: 0.68, scan: 0.24, glow: 0.72, trail: 0.34,
    roomX: 1.3, roomY: 0.25, spread: 1.04, depth: 0.94, heroScale: 1.02,
    sideScale: 1.02, rackScale: 1.02, wave: 0.12, shelf: 0.78, calm: 1.0,
  },
  manas: {
    kind: 4, bob: 0.55, orbit: 0.42, yaw: 0.42, drift: 0.28, opacity: 0.94,
    distort: 0.34, glass: 0.62, scan: 0.08, glow: 0.66, trail: 0.22,
    roomX: 0.72, roomY: 0.42, spread: 0.84, depth: 0.9, heroScale: 0.98,
    sideScale: 0.94, rackScale: 0.9, wave: 0.38, shelf: 0.0, calm: 0.72,
  },
  'ai-business-assistant': {
    kind: 5, bob: 0.72, orbit: 0.36, yaw: 0.58, drift: 0.34, opacity: 0.98,
    distort: 0.42, glass: 0.7, scan: 0.32, glow: 0.78, trail: 0.34,
    roomX: 1.15, roomY: 0.2, spread: 0.98, depth: 0.96, heroScale: 1.05,
    sideScale: 0.98, rackScale: 0.92, wave: 0.08, shelf: 0.38, calm: 0.86,
  },
  'defect-detector': {
    kind: 6, bob: 0.62, orbit: 0.28, yaw: 0.5, drift: 0.22, opacity: 1.0,
    distort: 0.38, glass: 0.66, scan: 0.55, glow: 0.86, trail: 0.52,
    roomX: 0.95, roomY: 0.12, spread: 0.94, depth: 1.04, heroScale: 1.06,
    sideScale: 0.98, rackScale: 0.9, wave: 0.04, shelf: 0.28, calm: 0.78,
  },
};

function productProfile(product) {
  return PRODUCT_PROFILES[product.id] || PRODUCT_PROFILES['good-one'];
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
  float activeClear = clamp(uActive, 0.0, 1.0);
  float liquid = (0.0028 + speed * 0.0052) * uDistort * mix(1.15, 0.72, activeClear);
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
  col *= mix(0.62, 1.06 + activeClear * 0.08, vig);

  float rim = smoothstep(0.06, 0.0, abs(d));
  float fresnel = pow(edgeZone, 2.4) * (0.42 + uActive * 0.45 + speed * 0.65);
  // accent rim-light — pronounced on the active/hero plane, faint on the rack
  col += uAccent * rim * (0.34 + uGlass * 0.46 + speed * 0.22 + uActive * 0.9);
  col += uAccent * fresnel * (0.18 + uActive * 0.4);
  col = mix(col, col * 1.08 + uAccent * 0.035, activeClear * 0.72);

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

  float fogStrength = mix(1.04, 0.54, activeClear);
  col = mix(col, uFog, vFog * fogStrength);

  // stronger depth fade on far / inactive planes so distance reads clearly,
  // while the active hero stays crisp (its fog alpha-loss stays minimal)
  float a = mask * uOpacity * (1.0 - vFog * mix(0.42, 0.05, activeClear));
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

/* soft floor reflection — a vertically-mirrored, downward-fading echo of the
   hero plane on an implied glass floor. Desktop-only + quality-gated (built only
   when !mobile && !reducedMotion, shown only for the active plane). Normal alpha
   blend (a reflection is a dimmed mirror image, not a glow). */
const REFLECTION_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const REFLECTION_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uHasTex;
uniform vec3 uAccent;
uniform vec3 uFog;
uniform float uOpacity;
uniform float uRadius;
float roundedRect(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}
void main(){
  vec2 p = vUv - 0.5;
  float d = roundedRect(p, vec2(0.5), uRadius);
  float mask = smoothstep(0.014, -0.014, d);
  if (mask < 0.003) discard;
  // sample mirrored in Y; fade strongest at the seam (vUv.y→1) to nothing below
  vec3 col = uHasTex > 0.5 ? texture2D(uTex, vec2(vUv.x, 1.0 - vUv.y)).rgb : uAccent * 0.2;
  float fade = pow(clamp(vUv.y, 0.0, 1.0), 1.7);
  col = mix(uFog, col, 0.1 + fade * 0.85);     // recede into the background
  col += uAccent * 0.05 * fade;
  gl_FragColor = vec4(col, mask * uOpacity * fade);
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
function lerp(a, b, t) { return a + (b - a) * t; }

/* cyclic carousel offset: how far image `index` sits from the current `head`,
   wrapped into [-count/2, count/2] so ANY screenshot can rotate to the front
   without the head having to travel the whole list. This is what lets a product
   show all its screenshots without a tall, trap-like section. */
function wrappedOffset(index, head, count) {
  let o = index - head;
  o = ((o + count / 2) % count + count) % count - count / 2;
  return o;
}

function mixLayout(a, b, t) {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
    scale: lerp(a.scale, b.scale, t),
    opacity: lerp(a.opacity, b.opacity, t),
    rx: lerp(a.rx, b.rx, t),
    ry: lerp(a.ry, b.ry, t),
    rz: lerp(a.rz, b.rz, t),
  };
}

function carouselSlot(offset, profile, isMobile, orient = 'portrait') {
  const d = Math.abs(offset);
  const side = offset < 0 ? -1 : 1;
  const heroScale = (profile.heroScale || 1) * (orient === 'landscape' ? 1.03 : 1);
  const sideScale = profile.sideScale || 1;
  const rackScale = profile.rackScale || 1;
  const spread = (profile.spread || 1) * (orient === 'landscape' ? 1.1 : 1);
  const depth = profile.depth || 1;
  const calm = profile.calm || 1;

  const stops = isMobile
    ? [
        { x: 0, y: 0.02, z: 0.85, scale: 0.84 * heroScale, opacity: 0.92, rx: 0, ry: 0, rz: 0 },
        { x: side * 2.15 * spread, y: -0.98 + profile.wave * 0.2, z: -2.95 * depth, scale: 0.46 * sideScale, opacity: 0.42, rx: 0.01, ry: -side * 0.24, rz: side * 0.012 },
        { x: side * 2.75 * spread, y: 1.05, z: -5.75 * depth, scale: 0.28 * rackScale, opacity: 0.08, rx: -0.015, ry: -side * 0.36, rz: side * 0.02 },
      ]
    : [
        { x: 0, y: 0.18, z: 1.08, scale: 1.03 * heroScale, opacity: 1.0, rx: 0.012, ry: 0, rz: 0 },
        { x: side * 3.78 * spread, y: 1.42, z: -2.45 * depth, scale: 0.63 * sideScale, opacity: 0.74, rx: -0.022, ry: -side * 0.32, rz: side * 0.018 },
        { x: side * 4.98 * spread, y: -1.88, z: -5.3 * depth, scale: 0.47 * rackScale, opacity: 0.52, rx: 0.026, ry: -side * 0.48, rz: -side * 0.024 },
        { x: side * 5.95 * spread, y: 0.56, z: -8.3 * depth, scale: 0.36 * rackScale, opacity: 0.31, rx: -0.018, ry: -side * 0.58, rz: side * 0.032 },
        { x: side * 6.6 * spread, y: -0.24, z: -11.8 * depth, scale: 0.25 * rackScale, opacity: 0.0, rx: 0.012, ry: -side * 0.66, rz: side * 0.04 },
      ];

  const capped = Math.min(d, stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(capped));
  const t = smoothstep(0, 1, capped - i);
  const out = mixLayout(stops[i], stops[i + 1], t);

  const wave = profile.wave || 0;
  const shelf = profile.shelf || 0;
  out.y += Math.sin(offset * 1.55) * wave * (isMobile ? 0.38 : 0.82) * Math.min(1, d / 1.5);
  out.y += Math.sin((d + 0.3) * Math.PI) * shelf * (isMobile ? 0.18 : 0.34);

  if (profile.kind === 2) {
    out.y += Math.sin(offset * 2.15) * (isMobile ? 0.16 : 0.48);
    out.rz += Math.sin(offset * 1.35) * 0.024;
  } else if (profile.kind === 3) {
    out.y += Math.cos(d * Math.PI) * shelf * 0.26;
    out.rx *= 0.55;
  } else if (profile.kind === 4) {
    out.x *= 0.88;
    out.y += Math.sin(offset * 0.74) * 0.3;
    out.ry *= 0.72;
    out.rz *= 0.62;
  } else if (profile.kind === 5) {
    out.y *= 0.72;
    out.rx *= 0.5;
    out.rz *= 0.44;
  } else if (profile.kind === 6) {
    out.z -= d * 0.18;
    out.ry *= 1.12;
    out.rz *= 0.5;
  }

  const frontness = smoothstep(1.28, 0, d);
  out.x *= calm;
  out.y *= calm;
  out.active = frontness;
  out.visible = d < (isMobile ? 2.12 : 4.18) && out.opacity > 0.015;
  out.depth = d;
  return out;
}

function naturalSize(aspect, isMobile) {
  const portraitH = isMobile ? 6.2 : 7.05;
  const landscapeW = isMobile ? 8.1 : 9.65;
  if (aspect < 1) return { w: portraitH * aspect, h: portraitH };
  return { w: landscapeW, h: landscapeW / aspect };
}

/* ------------------------------------------------------------------ *
 * factory
 * ------------------------------------------------------------------ */
export function createCorridor(THREE, opts = {}) {
  const {
    mobile = false,
    reducedMotion = false,
    maxAnisotropy = 1,
    masterOpacity = mobile ? 0.48 : 0.78,
  } = opts;

  const maxDim = mobile ? 560 : 1080;
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
  const rooms = [];     // { group, z, base, profile, imageHead, planes:[...] }
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
    const room = {
      product,
      group,
      z: rz,
      base: new THREE.Vector3(rx, ry, rz),
      profile,
      planes: [],
      imageHead: 0,
      targetImageHead: 0,
      scrollHead: 0,        // driven by local scroll (a partial cycle)
      idleHead: 0,          // slow drift while active → eventually shows the rest
      manualHead: 0,        // swipe/drag-to-scrub offset (touch), persists
      localProgress: 0,
      activeHeroImageIndex: 0,
      visibleImageIndices: [],
      frontPlaneCount: 0,
      _prevImageHead: 0,
      _imageVelocity: 0,
    };

    const makeAuraMaterial = (glow = profile.glow) => new THREE.ShaderMaterial({
      uniforms: {
        uAccent: { value: accent },
        uFog: { value: fogColor },
        uOpacity: { value: 0 },
        uRadius: { value: 0.06 },
        uTime: { value: 0 },
        uVelocity: { value: 0 },
        uGlow: { value: glow },
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

    const planes = [];
    product.images.forEach((url, i) => {
      const layout = carouselSlot(i, profile, mobile, product.orient);
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
      mesh.rotation.set(layout.rx || 0, layout.ry || 0, layout.rz || 0);
      // no renderOrder override — three sorts transparent meshes back-to-front
      // by distance, so within a room the deeper siblings paint before the hero
      const basePos = new THREE.Vector3(layout.x, layout.y, layout.z);
      mesh.position.copy(basePos);

      const auraMat = makeAuraMaterial(profile.glow);
      const aura = new THREE.Mesh(unit, auraMat);
      aura.frustumCulled = false;
      aura.position.copy(basePos).add(new THREE.Vector3(0, 0, -0.05));
      aura.rotation.copy(mesh.rotation);
      group.add(aura);
      group.add(mesh);

      const trails = [];
      if (!mobile && !reducedMotion) {
        for (let k = 0; k < 2; k++) {
          const trailMat = makeAuraMaterial(profile.glow * (0.64 - k * 0.13));
          const trail = new THREE.Mesh(unit, trailMat);
          trail.frustumCulled = false;
          trail.position.copy(basePos).add(new THREE.Vector3(0, 0, -0.28 - k * 0.34));
          trail.rotation.copy(mesh.rotation);
          trails.push({ mesh: trail, mat: trailMat, lag: k + 1, pos: basePos.clone(), ready: false });
          group.add(trail);
        }
      }

      // soft floor reflection (desktop + motion only; shown for the hero plane)
      let reflection = null, reflectionMat = null;
      if (!mobile && !reducedMotion) {
        reflectionMat = new THREE.ShaderMaterial({
          uniforms: {
            uTex: { value: null },
            uHasTex: { value: 0 },
            uAccent: { value: accent },
            uFog: { value: fogColor },
            uOpacity: { value: 0 },
            uRadius: { value: 0.05 },
          },
          vertexShader: REFLECTION_VERT,
          fragmentShader: REFLECTION_FRAG,
          transparent: true,
          depthWrite: false,
          depthTest: false,
        });
        reflection = new THREE.Mesh(unit, reflectionMat);
        reflection.frustumCulled = false;
        reflection.visible = false;
        group.add(reflection);
      }

      const plane = {
        mesh, mat, aura, auraMat, trails, reflection, reflectionMat, imageIndex: i, basePos,
        phase: Math.random() * Math.PI * 2,
        url,
        product, productIndex: ri, profile,
        naturalW: 1,
        naturalH: 1,
        layout,
      };
      // provisional size from orientation; refined when the texture arrives
      setNaturalSize(plane, product.orient === 'portrait' ? 0.46 : 1.6);
      sizePlane(plane, layout.scale);
      planes.push(plane);
      allPlanes.push(plane);
    });
    room.planes = planes;
    rooms.push(room);
  });

  function setNaturalSize(plane, aspect) {
    const size = naturalSize(aspect, mobile);
    plane.naturalW = size.w;
    plane.naturalH = size.h;
  }

  function sizePlane(plane, scale = 1) {
    const sx = plane.naturalW * scale;
    const sy = plane.naturalH * scale;
    plane.mesh.scale.set(sx, sy, 1);
    plane.aura.scale.set(sx * 1.12, sy * 1.12, 1);
    for (const trail of plane.trails) {
      trail.mesh.scale.set(
        sx * (1.07 + trail.lag * 0.05),
        sy * (1.07 + trail.lag * 0.05),
        1
      );
    }
  }

  // images/sec the carousel drifts on its own while a product is active — calmer
  // products (lower profile.calm) drift more slowly. This promotes the remaining
  // screenshots over time so a long product never needs a tall section.
  const IDLE_RATE = mobile ? 0.1 : 0.14;

  function updateRoomImageHead(room, dt, isActive) {
    const count = room.product.images.length;
    const maxHead = Math.max(0, count - 1);
    if (reducedMotion) {
      // direct, clamped index — no cyclic spin, no idle drift (manual scrub still counts)
      room.targetImageHead = clamp(room.scrollHead + room.manualHead, 0, maxHead);
    } else {
      // scroll promotes a partial cycle; idle drift (only while active) brings
      // the rest forward without forcing the user through a long slideshow;
      // manualHead carries touch swipe-to-scrub on top.
      if (isActive && count > 1) room.idleHead += dt * IDLE_RATE * (room.profile.calm || 1);
      room.targetImageHead = room.scrollHead + room.idleHead + room.manualHead;
    }
    const rate = reducedMotion ? 12 : (mobile ? 6.5 : 5.2);
    room.imageHead += (room.targetImageHead - room.imageHead) * Math.min(1, dt * rate);
    if (reducedMotion) room.imageHead = clamp(room.imageHead, 0, maxHead);
    const raw = ((room.imageHead - room._prevImageHead) / Math.max(dt, 1 / 60)) / Math.max(1, maxHead);
    room._prevImageHead = room.imageHead;
    room._imageVelocity += (raw * 1.9 - room._imageVelocity) * Math.min(1, dt * 8);
    // hero index wraps cyclically (clamped only in reduced-motion / direct mode)
    room.activeHeroImageIndex = reducedMotion
      ? clamp(Math.round(room.imageHead), 0, maxHead)
      : ((Math.round(room.imageHead) % count) + count) % count;
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
    qualityScale: 1,      // engine drops this if adaptive quality triggers
    _time: 0,
    _loaded: false,
    _anchorX: defaultAnchorX,
    _anchorTargetX: defaultAnchorX,
    _prevHead: 0,
    _velocity: 0,

    /* explicit control surface (engine ↔ corridor) */
    setActive(i) { this.targetHead = clamp(i, 0, this.count - 1); },
    setHead(v) { this.targetHead = clamp(v, 0, this.count - 1); },
    setProductProgress(productIndex, progress = 0) {
      const room = rooms[productIndex];
      if (!room) return;
      const p = clamp(Number.isFinite(progress) ? progress : 0, 0, 1);
      room.localProgress = p;
      const maxHead = Math.max(0, room.product.images.length - 1);
      // scroll promotes a bounded span (not the whole list) — the rest arrive via
      // idle drift, so section height no longer scales with screenshot count.
      const span = Math.min(maxHead, mobile ? 4 : 6);
      room.scrollHead = p * span;
    },
    setProductState(productIndex, progress = 0) {
      this.setActive(productIndex);
      this.setProductProgress(productIndex, progress);
    },
    /* swipe/drag-to-scrub (touch): nudge the active room's carousel by a
       (possibly fractional) number of screenshots. Persists on top of scroll. */
    scrubActive(deltaImages) {
      if (!deltaImages) return;
      const room = rooms[clamp(Math.round(this.head), 0, this.count - 1)];
      if (room) room.manualHead += deltaImages;
    },
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
      // first screenshot of each product first, then nearby images, then the rest
      const queue = [...allPlanes].sort((a, b) => {
        const pa = a.imageIndex === 0 ? 0 : 1 + a.imageIndex;
        const pb = b.imageIndex === 0 ? 0 : 1 + b.imageIndex;
        return pa - pb || a.productIndex - b.productIndex;
      });
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
            if (plane.reflectionMat) {
              plane.reflectionMat.uniforms.uTex.value = tex;
              plane.reflectionMat.uniforms.uHasTex.value = 1;
            }
            setNaturalSize(plane, aspect);
            sizePlane(plane, plane.layout?.scale || 1);
          } catch (err) {
            const tex = labelTexture(THREE, plane.product.name, plane.product.accent);
            plane.mat.uniforms.uTex.value = tex;
            plane.mat.uniforms.uHasTex.value = 1;
            plane.tex = tex;
            if (plane.reflectionMat) {
              plane.reflectionMat.uniforms.uTex.value = tex;
              plane.reflectionMat.uniforms.uHasTex.value = 1;
            }
            plane.missing = true;
          }
        }
      };
      await Promise.all(Array.from({ length: pool }, worker));
    },

    update(dt, px = 0, py = 0) {
      // master fade follows the engine's visibility flag (set across the product
      // run), so the corridor only appears during the product sections.
      const mTarget = this.visible ? masterOpacity * (this.qualityScale || 1) : 0;
      this.master += (mTarget - this.master) * Math.min(1, dt * 3);
      if (this.master < 0.002 && mTarget === 0) {
        this.master = 0;
        return; // fully hidden — engine skips the render pass
      }
      this._time += dt;
      const t = this._time;
      const N = rooms.length;
      const q = this.qualityScale || 1;     // <1 when adaptive quality kicked in

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

      const activeIdx = clamp(Math.round(head), 0, N - 1);
      for (let i = 0; i < N; i++) {
        const room = rooms[i];
        const isActiveRoom = i === activeIdx;
        updateRoomImageHead(room, dt, isActiveRoom);
        const ahead = camZ - room.z;                 // >0 in front, <0 passed
        const visible = ahead > -SPACING * 0.6 && ahead < FOG_FAR + SPACING * 1.5;
        room.group.visible = visible;
        room.visibleImageIndices = [];
        room.frontPlaneCount = 0;
        if (!visible) continue;

        // VIRTUALIZE — only the screenshots within a window of the head are laid
        // out / shaded each frame (the active room gets a wider window than its
        // neighbours), so a 15-shot product costs the same as a 6-shot one.
        const count = room.product.images.length;
        const windowR = mobile
          ? (isActiveRoom ? 2.4 : 1.6)
          : (isActiveRoom ? 4.3 : 2.7);

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
          const offset = reducedMotion
            ? plane.imageIndex - room.imageHead
            : wrappedOffset(plane.imageIndex, room.imageHead, count);
          // outside the window → cheaply hidden, no layout / shader work
          if (Math.abs(offset) > windowR) {
            plane.mesh.visible = false;
            plane.aura.visible = false;
            if (plane.reflection) plane.reflection.visible = false;
            for (const trail of plane.trails) { trail.mesh.visible = false; trail.ready = false; }
            continue;
          }
          const layout = carouselSlot(offset, plane.profile, mobile, plane.product.orient);
          // small products (e.g. 6 shots) wrap at a depth where the panel is
          // still faintly visible — fade it fully to nothing near the antipode so
          // it never pops from one side to the other as the head crosses.
          if (!reducedMotion && count < 8) {
            const wf = smoothstep(count / 2, count / 2 - 1.5, Math.abs(offset));
            layout.opacity *= wf;
            if (wf <= 0.001) layout.visible = false;
          }
          plane.layout = layout;
          if (layout.visible) room.visibleImageIndices.push(plane.imageIndex);
          if (Math.abs(offset) < 2.25 && layout.opacity > 0.1) room.frontPlaneCount++;

          const wob = reducedMotion ? 0 : 1;
          const support = 0.38 + Math.min(1, layout.depth / 1.6) * 0.62;
          const active = layout.active * focus;
          const imageVel = clamp(Math.abs(room._imageVelocity), 0, 1);
          const scrollEnergy = clamp(vel * 0.55 + imageVel, 0, 1);
          const bobY = Math.sin(t * (0.44 + plane.profile.bob * 0.12) + plane.phase) * 0.28 * plane.profile.bob * support * wob;
          const bobX = Math.cos(t * (0.32 + plane.profile.orbit * 0.1) + plane.phase) * 0.2 * plane.profile.orbit * support * wob;
          const bobZ = Math.sin(t * 0.28 + plane.phase * 0.7) * 0.28 * plane.profile.orbit * support * wob;
          const scrollLean = this._velocity * (0.2 + support * 0.16) + room._imageVelocity * 0.16;
          plane.mesh.position.set(
            layout.x + bobX,
            layout.y + bobY,
            layout.z + bobZ + active * scrollEnergy * 0.24
          );
          plane.mesh.rotation.x = layout.rx + Math.cos(t * 0.22 + plane.phase) * 0.018 * plane.profile.bob * support * wob;
          plane.mesh.rotation.z = layout.rz + Math.sin(t * 0.34 + plane.phase) * 0.024 * plane.profile.orbit * support * wob;
          plane.mesh.rotation.y = layout.ry + Math.sin(t * 0.27 + plane.phase) * 0.05 * plane.profile.yaw * support * wob + scrollLean;
          sizePlane(plane, layout.scale);

          const planeOpacity = roomOpacity * layout.opacity * (0.76 + focus * 0.24);
          const planeOn = planeOpacity > 0.004 && layout.visible;
          plane.mesh.visible = planeOn;
          plane.aura.visible = planeOn;
          if (!planeOn) {
            if (plane.reflection) plane.reflection.visible = false;
            for (const trail of plane.trails) {
              trail.mesh.visible = false;
              trail.ready = false;
            }
            continue;
          }

          const u = plane.mat.uniforms;
          u.uTime.value = t + plane.phase;
          u.uVelocity.value = scrollEnergy;
          u.uActive.value = active;
          // active hero stays CRISP — distortion + glass chroma drop toward the
          // front; side / rack panels keep more holographic character.
          u.uDistort.value = plane.profile.distort * (0.4 + scrollEnergy * 0.2) * (1 - active * 0.55);
          u.uGlass.value = plane.profile.glass * (0.62 - active * 0.22 + scrollEnergy * 0.12);
          u.uScan.value = plane.profile.scan * (0.5 + active * 0.28 + scrollEnergy * 0.1);
          u.uOpacity.value = planeOpacity;

          plane.aura.position.copy(plane.mesh.position);
          plane.aura.position.z -= 0.06 + scrollEnergy * 0.1;
          plane.aura.rotation.copy(plane.mesh.rotation);
          const au = plane.auraMat.uniforms;
          au.uTime.value = t + plane.phase;
          au.uVelocity.value = scrollEnergy;
          au.uOpacity.value = planeOpacity * plane.profile.glow * (0.12 + active * 0.22 + scrollEnergy * 0.12);

          for (const trail of plane.trails) {
            if (!trail.ready) {
              trail.pos.copy(plane.mesh.position);
              trail.ready = true;
            }
            trail.pos.lerp(plane.mesh.position, Math.min(1, dt * (5.2 / trail.lag)));
            // trails are velocity-based and the first to go under low quality
            trail.mesh.visible = q >= 0.999 && scrollEnergy > 0.035 && planeOpacity > 0.025;
            trail.mesh.position.copy(trail.pos);
            trail.mesh.position.x -= room._imageVelocity * (0.32 + trail.lag * 0.22);
            trail.mesh.position.y += Math.sin(t * 0.9 + trail.lag) * 0.035;
            trail.mesh.position.z -= 0.34 + trail.lag * 0.42 + scrollEnergy * 0.42;
            trail.mesh.rotation.copy(plane.mesh.rotation);
            trail.mesh.rotation.y -= room._imageVelocity * 0.08 * trail.lag;
            trail.mat.uniforms.uTime.value = t + plane.phase + trail.lag;
            trail.mat.uniforms.uVelocity.value = scrollEnergy;
            trail.mat.uniforms.uOpacity.value = planeOpacity * plane.profile.trail * scrollEnergy * (0.24 + active * 0.24) / trail.lag;
          }

          // soft floor reflection — only the hero/active plane, and only at full
          // quality (the adaptive probe drops qualityScale, which hides it)
          if (plane.reflection) {
            const reflOn = active > 0.3 && q >= 0.999;
            plane.reflection.visible = reflOn;
            if (reflOn) {
              const sx = plane.naturalW * layout.scale;
              const sy = plane.naturalH * layout.scale;
              plane.reflection.scale.set(sx, sy, 1);
              plane.reflection.position.copy(plane.mesh.position);
              plane.reflection.position.y -= sy * 1.02;        // seam sits just below the plane
              plane.reflection.rotation.set(-plane.mesh.rotation.x, plane.mesh.rotation.y, -plane.mesh.rotation.z);
              plane.reflectionMat.uniforms.uOpacity.value = planeOpacity * active * 0.4;
            }
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
        plane.reflectionMat?.dispose();
        for (const trail of plane.trails) trail.mat.dispose();
      }
      unit.dispose();
      scene.remove(anchorGroup);
    },

    getDebugState() {
      const activeProductIndex = clamp(Math.round(this.head), 0, this.count - 1);
      const room = rooms[activeProductIndex];
      const activeImageHead = room?.imageHead || 0;
      return {
        head: this.head,
        targetHead: this.targetHead,
        activeProductIndex,
        activeProductId: room?.product.id || null,
        activeImageHead,
        activeTargetImageHead: room?.targetImageHead || 0,
        activeHeroImageIndex: room?.activeHeroImageIndex || 0,
        visibleImageIndices: room ? [...room.visibleImageIndices] : [],
        frontPlaneCount: room?.frontPlaneCount || 0,
        imageCount: room?.product.images.length || 0,
        sectionProgress: room?.localProgress || 0,
        isCyclicMode: !reducedMotion,
        masterOpacity: this.master,
        missingImages: room ? room.planes.filter((p) => p.missing).map((p) => p.imageIndex) : [],
      };
    },
  };

  return api;
}
