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
   index 0 is the big hero screen; the rest are smaller, angled and clustered
   AROUND/BEHIND it (biased to the right) so they orbit the hero without
   drifting across the left-hand product copy.
     x,y,z = offset (world units)   ry = yaw (rad)   s = scale   op = base opacity */
const SLOTS = [
  { x: 0.0, y: 0.3, z: 0.0, ry: 0.0, s: 1.0, op: 1.0 },
  { x: 4.6, y: 2.7, z: -4.8, ry: -0.34, s: 0.5, op: 0.6 },
  { x: 4.2, y: -2.9, z: -3.8, ry: -0.3, s: 0.54, op: 0.64 },
  { x: -3.2, y: 1.7, z: -6.8, ry: 0.4, s: 0.42, op: 0.44 },
  { x: 5.8, y: 0.4, z: -8.6, ry: -0.46, s: 0.4, op: 0.42 },
];

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
uniform float uFogNear;
uniform float uFogFar;
void main(){
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFog = clamp((-mv.z - uFogNear) / max(0.001, uFogFar - uFogNear), 0.0, 1.0);
  gl_Position = projectionMatrix * mv;
}`;

const SCREEN_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying float vFog;
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
  float mask = smoothstep(0.006, -0.006, d);
  if (mask < 0.003) discard;

  vec3 col = uHasTex > 0.5
    ? texture2D(uTex, vUv).rgb
    : mix(uAccent * 0.16, uAccent * 0.46, vUv.y) + 0.02;

  // soft inner vignette
  float vig = smoothstep(1.15, 0.30, length(p) * 1.25);
  col *= mix(0.74, 1.0, vig);
  // accent rim glow hugging the rounded border
  float rim = smoothstep(0.045, 0.0, abs(d));
  col += uAccent * rim * 0.55;
  // dissolve into the corridor's dark with distance
  col = mix(col, uFog, vFog * 0.94);

  float a = mask * uOpacity * (1.0 - vFog * 0.10);
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
    masterOpacity = mobile ? 0.5 : 0.62,
  } = opts;

  const planesPerRoom = mobile ? 2 : 4;
  const maxDim = mobile ? 540 : 820;
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
  const rooms = [];     // { group, z, planes:[{ mesh, mat, slot, basePos, phase }] }
  const allPlanes = []; // flat list for loading/disposal

  CORRIDOR_PRODUCTS.forEach((product, ri) => {
    const group = new THREE.Group();
    const rz = -ri * SPACING;
    // gentle per-room drift so the corridor isn't a dead-straight pipe
    const rx = Math.sin(ri * 1.3) * 1.4;
    const ry = Math.cos(ri * 0.7) * 0.9;
    group.position.set(rx, ry, rz);
    anchorGroup.add(group);

    const accent = new THREE.Color(product.accent);
    const planes = [];
    for (let i = 0; i < planesPerRoom; i++) {
      const slot = SLOTS[i] || SLOTS[SLOTS.length - 1];
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
        },
        vertexShader: SCREEN_VERT,
        fragmentShader: SCREEN_FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });
      const mesh = new THREE.Mesh(unit, mat);
      mesh.frustumCulled = false;
      mesh.rotation.y = slot.ry;
      // no renderOrder override — three sorts transparent meshes back-to-front
      // by distance, so within a room the deeper siblings paint before the hero
      const basePos = new THREE.Vector3(slot.x, slot.y, slot.z);
      mesh.position.copy(basePos);
      // provisional size from orientation; refined when the texture arrives
      sizePlane(mesh, slot, product.orient === 'portrait' ? 0.46 : 1.6, mobile);
      group.add(mesh);

      const plane = {
        mesh, mat, slot, basePos,
        phase: Math.random() * Math.PI * 2,
        url: product.images[i],
        product,
      };
      planes.push(plane);
      allPlanes.push(plane);
    }
    rooms.push({ group, z: rz, planes });
  });

  function sizePlane(mesh, slot, aspect, isMobile) {
    const portraitH = isMobile ? 7.0 : 8.5;
    const landscapeW = isMobile ? 9.5 : 11.0;
    let w, h;
    if (aspect < 1) { h = portraitH; w = h * aspect; }
    else { w = landscapeW; h = w / aspect; }
    mesh.scale.set(w * slot.s, h * slot.s, 1);
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
      const queue = [...allPlanes].sort((a, b) => SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot));
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
            sizePlane(plane.mesh, plane.slot, aspect, mobile);
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
      camera.position.set(px * 0.22 * par, py * 0.18 * par, camZ);
      camera.lookAt(camera.position.x, camera.position.y, camZ - 14);

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
        const roomOpacity = this.master * focus * behind;

        for (const plane of room.planes) {
          const wob = reducedMotion ? 0 : 1;
          const bobY = Math.sin(t * 0.6 + plane.phase) * 0.28 * wob;
          const bobX = Math.cos(t * 0.45 + plane.phase) * 0.18 * wob;
          plane.mesh.position.set(
            plane.basePos.x + bobX,
            plane.basePos.y + bobY,
            plane.basePos.z
          );
          plane.mesh.rotation.z = Math.sin(t * 0.4 + plane.phase) * 0.02 * wob;
          plane.mesh.rotation.y = plane.slot.ry + Math.sin(t * 0.3 + plane.phase) * 0.04 * wob;
          plane.mat.uniforms.uOpacity.value = roomOpacity * plane.slot.op;
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
      }
      unit.dispose();
      scene.remove(anchorGroup);
    },
  };

  return api;
}
