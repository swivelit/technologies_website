/* WebGL particle stage — GPU points with curl-ish simplex turbulence,
   additive soft sprites, and buffer-morphing between formations
   (logo → nebula now; per-product formations arrive with the scenes).
   Deps (three / gsap / ScrollTrigger / lenis) are vendored locally and
   fall back to CDN. Everything is lazy: the static site never pays. */

import {
  spawnFormation, logoFormation, nebulaFormation,
  goodOneFormation, swicoFormation, grabBasketFormation,
  manasFormation, aiAssistantFormation, defectFormation,
  buildEdges,
} from './formations.js';
import { scramble } from '../scramble.js';
import { CORRIDOR_PRODUCTS, createCorridor } from './imagePlanes.js';

const CDN = {
  three: 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js',
  gsap: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',
  st: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js',
  lenis: 'https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js',
};

let THREE, gsap, ScrollTrigger;

/* ---------------- shaders ---------------- */

// Ashima/IQ 3D simplex noise
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

/* shared transform: per-particle staggered morph + mid-transition burst +
   simplex turbulence. The points, the network mesh and the data pulses all
   call this, so every layer moves in exact lockstep. */
const PARTICLE_GLSL = /* glsl */ `
${NOISE_GLSL}
uniform float uTime;
uniform float uMorph;
uniform float uStagger;
uniform float uBurst;
uniform float uTurbAmp;
uniform float uTurbFreq;
uniform float uTurbSpeed;
float morphProg(float rank){
  float t = clamp(uMorph * (1.0 + uStagger) - rank * uStagger, 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}
vec3 particlePos(vec3 from, vec3 to, vec4 seed){
  float t = morphProg(seed.w);
  vec3 pos = mix(from, to, t);
  float burst = sin(t * 3.14159265) * uBurst;
  if (burst > 0.001) {
    vec3 dir = normalize(pos + (seed.xyz - 0.5) * 4.0 + vec3(0.001));
    pos += dir * burst * (7.0 + seed.x * 24.0);
  }
  float spark = step(0.965, seed.x);
  float amp = uTurbAmp * (0.45 + seed.y * 0.9) * (1.0 + spark * 2.6);
  vec3 np = pos * uTurbFreq + vec3(uTime * uTurbSpeed);
  pos += amp * vec3(snoise(np), snoise(np + 31.416), snoise(np - 47.853));
  return pos;
}`;

const VERT = /* glsl */ `
${PARTICLE_GLSL}
attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec3 aColFrom;
attribute vec3 aColTo;
attribute float aSizeFrom;
attribute float aSizeTo;
attribute vec4 aSeed;
uniform float uOpacity;
uniform float uSize;
uniform float uPixelRatio;
uniform float uBootEnergy;
uniform float uHubGlow;
varying vec3 vColor;
varying float vAlpha;
varying float vHub;
void main(){
  float t = morphProg(aSeed.w);
  vec3 pos = particlePos(aFrom, aTo, aSeed);
  float burst = sin(t * 3.14159265) * uBurst;
  float sizeMul = mix(aSizeFrom, aSizeTo, t);
  float hub = smoothstep(1.42, 3.2, sizeMul);
  float hubPulse = 1.0 + hub * (0.12 + uBootEnergy * 0.26)
    * (0.5 + 0.5 * sin(uTime * (1.6 + aSeed.y * 0.7) + aSeed.x * 6.28318));

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float spark = step(0.965, aSeed.x);
  float ps = uSize * mix(0.5, 1.7, aSeed.z) * (1.0 + spark * 0.9)
           * uPixelRatio * (100.0 / max(1.0, -mv.z));
  ps *= sizeMul * hubPulse * (1.0 + burst * 0.15);
  gl_PointSize = clamp(ps, 1.0, 40.0 * uPixelRatio);

  float twinkle = 0.72 + 0.28 * sin(uTime * (1.2 + aSeed.y * 2.6) + aSeed.x * 6.28318);
  vHub = hub;
  vAlpha = uOpacity * twinkle * smoothstep(0.0, 1.0, ps) * (1.0 + hub * (0.18 + uBootEnergy * 0.28));
  vColor = mix(aColFrom, aColTo, t) * (1.0 + spark * 0.6 + burst * 0.3 + hub * (uHubGlow + uBootEnergy * 0.55));
}`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vAlpha;
varying float vHub;
void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv) * 2.0;
  if (d > 1.0) discard;
  float core = smoothstep(1.0, 0.0, d);
  float a = core * core * (0.55 + 0.45 * core);
  gl_FragColor = vec4(vColor * (1.0 + core * (0.7 + vHub * 0.6)), a * vAlpha);
}`;

/* network mesh — faint accent-tinted segments between nearest nodes. Shares the
   points' vertex attributes through an indexed geometry, so it morphs and
   turbulates exactly with the cloud. uMeshFade dips during a morph so the mesh
   re-knits rather than snapping. */
const LINE_VERT = /* glsl */ `
${PARTICLE_GLSL}
attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec4 aSeed;
uniform float uOpacity;
uniform float uMeshFade;
varying float vAlpha;
void main(){
  vec3 pos = particlePos(aFrom, aTo, aSeed);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  float tw = 0.78 + 0.32 * sin(uTime * 1.4 + aSeed.x * 6.28318);
  vAlpha = uOpacity * uMeshFade * tw;
}`;

const LINE_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uLineColor;
uniform float uLineOpacity;
uniform float uBootEnergy;
varying float vAlpha;
void main(){
  // brighter line colour keeps each 1px synapse a crisp, bright filament on the
  // dark field (no width change — reads thinner + more defined, not blooming)
  gl_FragColor = vec4(uLineColor * (1.22 + uBootEnergy * 0.38), vAlpha * uLineOpacity * (1.0 + uBootEnergy * 0.9));
}`;

/* data pulses — a few bright motes streaming node→node along the edges. Each
   pulse vertex carries both endpoints' attributes and rides between their
   shader-computed positions, so it stays exactly on the live, morphing mesh. */
const PULSE_VERT = /* glsl */ `
${PARTICLE_GLSL}
attribute vec3 aFromA;
attribute vec3 aToA;
attribute vec4 aSeedA;
attribute vec3 aFromB;
attribute vec3 aToB;
attribute vec4 aSeedB;
attribute float aPhase;
uniform float uOpacity;
uniform float uMeshFade;
uniform float uSize;
uniform float uPixelRatio;
uniform float uPulseSpeed;
uniform float uPulseIntensity;
uniform float uBootEnergy;
varying float vAlpha;
void main(){
  vec3 pa = particlePos(aFromA, aToA, aSeedA);
  vec3 pb = particlePos(aFromB, aToB, aSeedB);
  float tt = fract(uTime * uPulseSpeed * (1.0 + uBootEnergy * 1.7) + aPhase);
  vec3 pos = mix(pa, pb, tt);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float ps = uSize * 2.3 * uPixelRatio * (100.0 / max(1.0, -mv.z));
  ps *= 1.0 + uBootEnergy * 0.42;
  gl_PointSize = clamp(ps, 1.5, 28.0 * uPixelRatio);
  float life = sin(tt * 3.14159265);                  // fade in/out at the nodes
  vAlpha = uOpacity * uMeshFade * uPulseIntensity * (1.0 + uBootEnergy * 1.15) * (0.2 + 0.8 * life);
}`;

const PULSE_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uPulseColor;
uniform float uBootEnergy;
varying float vAlpha;
void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv) * 2.0;
  if (d > 1.0) discard;
  float core = smoothstep(1.0, 0.0, d);
  gl_FragColor = vec4(uPulseColor * (0.6 + core + uBootEnergy * 0.5), core * core * vAlpha);
}`;

const CORTEX_HUB_VERT = /* glsl */ `
attribute float aSize;
attribute float aIntensity;
attribute float aSeed;
attribute vec3 aColor;
uniform float uTime;
uniform float uOpacity;
uniform float uBootEnergy;
uniform float uPixelRatio;
uniform float uFire;        // transient "synaptic firing" flare (0 = no-op)
uniform vec3 uAccent;
varying vec3 vColor;
varying float vAlpha;
void main(){
  float pulse = 0.72 + 0.28 * sin(uTime * (1.15 + aSeed * 0.7) + aSeed * 6.28318);
  float fire = uFire * (0.35 + aSeed * 1.3);   // staggered per-hub so the net flickers
  vec3 pos = position;
  pos.z += sin(uTime * 0.32 + aSeed * 9.0) * 0.45 * (0.25 + uBootEnergy * 0.45);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float ps = aSize * (15.0 + uBootEnergy * 7.0 + fire * 10.0) * uPixelRatio * (80.0 / max(1.0, -mv.z));
  gl_PointSize = clamp(ps, 4.0, 70.0 * uPixelRatio);
  vColor = mix(aColor, uAccent, 0.22 + uBootEnergy * 0.12) * (1.0 + fire * 0.7);
  vAlpha = uOpacity * aIntensity * (0.62 + pulse * 0.5 + uBootEnergy * 0.22 + fire * 0.5);
}`;

const CORTEX_HUB_FRAG = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv) * 2.0;
  if (d > 1.0) discard;
  float core = smoothstep(1.0, 0.0, d);
  float halo = smoothstep(1.0, 0.18, d);
  vec3 col = vColor * (0.55 + core * 1.25 + halo * 0.35);
  gl_FragColor = vec4(col, vAlpha * (core * core * 0.72 + halo * 0.24));
}`;

const CORTEX_LINE_VERT = /* glsl */ `
attribute float aEdgeIntensity;
uniform float uTime;
uniform float uOpacity;
uniform float uBootEnergy;
uniform float uFire;        // synaptic firing brightens the conducting edges
varying float vAlpha;
void main(){
  vec3 pos = position;
  pos.z += sin(uTime * 0.2 + position.x * 0.08 + position.y * 0.05) * 0.24 * uBootEnergy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  vAlpha = uOpacity * aEdgeIntensity * (0.32 + uBootEnergy * 0.55 + uFire * 0.6);
}`;

const CORTEX_LINE_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uAccent;
uniform float uLineOpacity;
varying float vAlpha;
void main(){
  gl_FragColor = vec4(uAccent * 1.18, vAlpha * uLineOpacity);
}`;

const CORTEX_PULSE_VERT = /* glsl */ `
attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec3 aColor;
attribute float aPhase;
attribute float aSpeed;
uniform float uTime;
uniform float uOpacity;
uniform float uBootEnergy;
uniform float uPixelRatio;
uniform float uPulseSpeed;
uniform float uPulseIntensity;
uniform float uFire;        // firing speeds + brightens the travelling pulses
uniform vec3 uAccent;
varying vec3 vColor;
varying float vAlpha;
void main(){
  float tt = fract(uTime * uPulseSpeed * aSpeed * (1.0 + uBootEnergy * 1.6 + uFire * 1.2) + aPhase);
  float life = sin(tt * 3.14159265);
  vec3 pos = mix(aFrom, aTo, tt);
  pos += normalize(aTo - aFrom + vec3(0.001)) * life * 0.18 * uBootEnergy;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float ps = (2.0 + uBootEnergy * 1.2 + uFire * 1.4) * uPixelRatio * (92.0 / max(1.0, -mv.z));
  gl_PointSize = clamp(ps, 2.0, 24.0 * uPixelRatio);
  vColor = mix(aColor, uAccent, 0.34);
  vAlpha = uOpacity * uPulseIntensity * (0.22 + 0.78 * life) * (0.55 + uBootEnergy * 0.75 + uFire * 0.8);
}`;

const CORTEX_PULSE_FRAG = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv) * 2.0;
  if (d > 1.0) discard;
  float core = smoothstep(1.0, 0.0, d);
  gl_FragColor = vec4(vColor * (0.6 + core * 1.3), core * core * vAlpha);
}`;

/* ---------------- dependency loading ---------------- */

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => { s.remove(); reject(new Error(`script failed: ${src}`)); };
    document.head.appendChild(s);
  });
}

async function loadDeps({ lenis = true } = {}) {
  try {
    THREE = await import('../vendor/three.module.min.js');
  } catch {
    THREE = await import(CDN.three);
  }
  if (!window.gsap) {
    await loadScript('js/vendor/gsap.min.js').catch(() => loadScript(CDN.gsap));
  }
  if (!window.ScrollTrigger) {
    await loadScript('js/vendor/ScrollTrigger.min.js').catch(() => loadScript(CDN.st));
  }
  if (lenis && !window.Lenis) {
    // smooth scroll is a nice-to-have; the stage works without it
    await loadScript('js/vendor/lenis.min.js').catch(() => loadScript(CDN.lenis)).catch(() => {});
  }
  gsap = window.gsap;
  ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
}

/* ---------------- particle system ---------------- */

// idle character of each formation. Turbulence is deliberately low — shapes
// should hold and breathe like a computed diagram, not billow like smoke.
const PROFILES = {
  spawn: { uTurbAmp: 0.5, uTurbFreq: 0.05, uTurbSpeed: 0.08, uSize: 2.0 },
  logo: { uTurbAmp: 0.18, uTurbFreq: 0.1, uTurbSpeed: 0.1, uSize: 2.3 },
  // calm neural field — very low turbulence + smaller, crisper points so the
  // network reads as a stable node/synapse diagram, not a wavy smoke cloud
  nebula: { uTurbAmp: 0.2, uTurbFreq: 0.05, uTurbSpeed: 0.035, uSize: 2.4 },
  // per-product idle character — low amp keeps the detailed shapes legible
  'good-one': { uTurbAmp: 0.42, uTurbFreq: 0.08, uTurbSpeed: 0.11, uSize: 2.6 },
  'swico-ai': { uTurbAmp: 0.58, uTurbFreq: 0.07, uTurbSpeed: 0.13, uSize: 2.9 },
  'grab-basket': { uTurbAmp: 0.44, uTurbFreq: 0.09, uTurbSpeed: 0.12, uSize: 2.7 },
  manas: { uTurbAmp: 0.32, uTurbFreq: 0.05, uTurbSpeed: 0.06, uSize: 2.8 },        // calm
  'ai-business-assistant': { uTurbAmp: 0.48, uTurbFreq: 0.07, uTurbSpeed: 0.12, uSize: 2.5 },
  'defect-detector': { uTurbAmp: 0.4, uTurbFreq: 0.1, uTurbSpeed: 0.16, uSize: 2.4 },
};

// scene accents (cool, considered, distinct) — mirror the CSS --accent per
// product. Used to tint the network mesh; nebula leans electric blue.
const ACCENTS = {
  logo: 0x6cc6ff,     // intro circuit / idle-logo mesh — crisp electric blue
  nebula: 0x4aa8ff,
  'good-one': 0x38bdf8,
  'swico-ai': 0x818cf8,
  'grab-basket': 0xc084fc,
  manas: 0x2dd4bf,
  'ai-business-assistant': 0x34d399,
  'defect-detector': 0xf76d6d,
};

const PRODUCT_IDS = CORRIDOR_PRODUCTS.map((product) => product.id);

class Particles {
  constructor(count, { mobile = false, mesh = null, reducedMotion = false } = {}) {
    this.count = count;
    this.mobile = mobile;
    this.formations = {};
    this.edges = {};            // formation name → Uint32Array of vertex-index pairs
    this.accents = {};          // formation name → THREE.Color (mesh tint)
    this.mode = 'spawn';

    const geo = new THREE.BufferGeometry();
    const zeros = () => new Float32Array(count * 3);
    const seeds = new Float32Array(count * 4);

    // uniform-shuffled stagger ranks prevent clumpy reveals
    const order = Array.from({ length: count }, (_, i) => i / count);
    for (let i = count - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [order[i], order[j]] = [order[j], order[i]];
    }
    for (let i = 0; i < count; i++) {
      seeds[i * 4] = Math.random();
      seeds[i * 4 + 1] = Math.random();
      seeds[i * 4 + 2] = Math.random();
      seeds[i * 4 + 3] = order[i];
    }

    geo.setAttribute('position', new THREE.BufferAttribute(zeros(), 3)); // unused but expected
    geo.setAttribute('aFrom', new THREE.BufferAttribute(zeros(), 3));
    geo.setAttribute('aTo', new THREE.BufferAttribute(zeros(), 3));
    geo.setAttribute('aColFrom', new THREE.BufferAttribute(zeros(), 3));
    geo.setAttribute('aColTo', new THREE.BufferAttribute(zeros(), 3));
    geo.setAttribute('aSizeFrom', new THREE.BufferAttribute(new Float32Array(count), 1));
    geo.setAttribute('aSizeTo', new THREE.BufferAttribute(new Float32Array(count), 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));

    this.uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 1 },
      uStagger: { value: 0.4 },
      uBurst: { value: 0 },
      uOpacity: { value: 0 },
      uSize: { value: PROFILES.spawn.uSize },
      uPixelRatio: { value: 1 },
      uTurbAmp: { value: PROFILES.spawn.uTurbAmp },
      uTurbFreq: { value: PROFILES.spawn.uTurbFreq },
      uTurbSpeed: { value: PROFILES.spawn.uTurbSpeed },
      uMeshFade: { value: 1 },     // dips during a morph so the mesh re-knits
      uBootEnergy: { value: 0 },
      uHubGlow: { value: mobile ? 0.18 : 0.28 },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.geo = geo;

    // points + network mesh + pulses ride together in one group so they share
    // the scroll-driven rotation and the camera dolly
    this.group = new THREE.Group();
    this.group.add(this.points);

    this.lines = null;
    this.pulses = null;
    if (mesh && mesh.nodes > 0 && mesh.maxSegments > 0) this._buildMesh(mesh, reducedMotion);
  }

  /* line/pulse materials reuse the live morph/turbulence uniforms, so one tween
     drives every layer in lockstep */
  _shared() {
    const u = this.uniforms;
    return {
      uTime: u.uTime, uMorph: u.uMorph, uStagger: u.uStagger, uBurst: u.uBurst,
      uTurbAmp: u.uTurbAmp, uTurbFreq: u.uTurbFreq, uTurbSpeed: u.uTurbSpeed,
      uOpacity: u.uOpacity, uMeshFade: u.uMeshFade, uBootEnergy: u.uBootEnergy,
    };
  }

  /* the network layer: a LineSegments that shares the points' vertex attributes
     through its own index buffer (so it morphs/turbulates identically), plus a
     small pool of travelling data pulses. */
  _buildMesh(mesh, reducedMotion) {
    const a = this.geo.attributes;

    const lgeo = new THREE.BufferGeometry();
    lgeo.setAttribute('position', a.position);
    lgeo.setAttribute('aFrom', a.aFrom);
    lgeo.setAttribute('aTo', a.aTo);
    lgeo.setAttribute('aSeed', a.aSeed);
    this._lineIdx = new Uint32Array(mesh.maxSegments * 2);
    this._lineIdxAttr = new THREE.BufferAttribute(this._lineIdx, 1);
    this._lineIdxAttr.setUsage(THREE.DynamicDrawUsage);
    lgeo.setIndex(this._lineIdxAttr);
    lgeo.setDrawRange(0, 0);
    this.lgeo = lgeo;

    this.lineUniforms = {
      ...this._shared(),
      uLineColor: { value: new THREE.Color(ACCENTS.nebula) },
      uLineOpacity: { value: mesh.lineOpacity },
    };
    this.lines = new THREE.LineSegments(lgeo, new THREE.ShaderMaterial({
      uniforms: this.lineUniforms,
      vertexShader: LINE_VERT,
      fragmentShader: LINE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    }));
    this.lines.frustumCulled = false;
    this.group.add(this.lines);

    if (reducedMotion || mesh.pulses <= 0) return;     // static mesh only

    const P = mesh.pulses;
    const dyn3 = () => new THREE.BufferAttribute(new Float32Array(P * 3), 3).setUsage(THREE.DynamicDrawUsage);
    const dyn4 = () => new THREE.BufferAttribute(new Float32Array(P * 4), 4).setUsage(THREE.DynamicDrawUsage);
    const pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(P * 3), 3));
    pgeo.setAttribute('aFromA', dyn3());
    pgeo.setAttribute('aToA', dyn3());
    pgeo.setAttribute('aSeedA', dyn4());
    pgeo.setAttribute('aFromB', dyn3());
    pgeo.setAttribute('aToB', dyn3());
    pgeo.setAttribute('aSeedB', dyn4());
    const phase = new Float32Array(P);
    for (let i = 0; i < P; i++) phase[i] = Math.random();
    pgeo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    pgeo.setDrawRange(0, 0);
    this.pgeo = pgeo;

    this.pulseUniforms = {
      ...this._shared(),
      uSize: this.uniforms.uSize,
      uPixelRatio: this.uniforms.uPixelRatio,
      uPulseSpeed: { value: this.mobile ? 0.18 : 0.22 },
      uPulseIntensity: { value: this.mobile ? 0.62 : 0.82 },
      uPulseColor: { value: new THREE.Color(0x4fe3ff) },   // bright cyan data pulses
    };
    this.pulses = new THREE.Points(pgeo, new THREE.ShaderMaterial({
      uniforms: this.pulseUniforms,
      vertexShader: PULSE_VERT,
      fragmentShader: PULSE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    }));
    this.pulses.frustumCulled = false;
    this.group.add(this.pulses);
  }

  setEdges(name, edges) { this.edges[name] = edges; }

  _sizes(name) {
    const s = this.formations[name]?.sizes;
    if (s && s.length === this.count) return s;
    if (!this._defaultSizes) {
      this._defaultSizes = new Float32Array(this.count);
      this._defaultSizes.fill(1);
    }
    return this._defaultSizes;
  }

  /* point the mesh at the active formation: swap the line index to its edge
     set, retint to its accent, and re-seat the pulses onto those edges */
  _applyMesh(name) {
    if (!this.lines) return;
    const accent = this.accents[name] || this.accents.nebula;
    if (accent) this.lineUniforms.uLineColor.value.copy(accent);
    if (accent && this.pulseUniforms) {
      const ice = new THREE.Color(name === 'defect-detector' ? 0xffc2b8 : 0x8ff7ff);
      this.pulseUniforms.uPulseColor.value.copy(accent).lerp(ice, name === 'manas' ? 0.45 : 0.28);
    }
    const edges = this.edges[name];
    if (!edges || edges.length < 2) {
      this.lgeo.setDrawRange(0, 0);
      if (this.pulses) this.pgeo.setDrawRange(0, 0);
      return;
    }
    const n = Math.min(edges.length, this._lineIdx.length);
    this._lineIdx.set(n === edges.length ? edges : edges.subarray(0, n));
    this._lineIdxAttr.needsUpdate = true;
    this.lgeo.setDrawRange(0, n);
    this._assignPulses(edges);
  }

  /* seat each pulse on a random edge, copying both endpoints' (post-bake) morph
     attributes so the pulse rides the live, morphing segment */
  _assignPulses(edges) {
    if (!this.pulses) return;
    const segs = edges.length / 2;
    const A = this.pgeo.attributes;
    const P = A.aPhase.count;
    const sf = this.geo.attributes.aFrom.array;
    const st = this.geo.attributes.aTo.array;
    const ss = this.geo.attributes.aSeed.array;
    const FA = A.aFromA.array, TA = A.aToA.array, SA = A.aSeedA.array;
    const FB = A.aFromB.array, TB = A.aToB.array, SB = A.aSeedB.array;
    for (let p = 0; p < P; p++) {
      const s = (Math.random() * segs) | 0;
      const ia = edges[s * 2], ib = edges[s * 2 + 1];
      const o3 = p * 3, o4 = p * 4;
      for (let c = 0; c < 3; c++) {
        FA[o3 + c] = sf[ia * 3 + c]; TA[o3 + c] = st[ia * 3 + c];
        FB[o3 + c] = sf[ib * 3 + c]; TB[o3 + c] = st[ib * 3 + c];
      }
      for (let c = 0; c < 4; c++) {
        SA[o4 + c] = ss[ia * 4 + c]; SB[o4 + c] = ss[ib * 4 + c];
      }
    }
    A.aFromA.needsUpdate = A.aToA.needsUpdate = A.aSeedA.needsUpdate = true;
    A.aFromB.needsUpdate = A.aToB.needsUpdate = A.aSeedB.needsUpdate = true;
    this.pgeo.setDrawRange(0, P);
  }

  setImmediate(name) {
    const f = this.formations[name];
    if (!f) return;
    for (const [a, src] of [
      ['aFrom', f.positions], ['aTo', f.positions],
      ['aColFrom', f.colors], ['aColTo', f.colors],
    ]) {
      this.geo.attributes[a].array.set(src);
      this.geo.attributes[a].needsUpdate = true;
    }
    const sizes = this._sizes(name);
    this.geo.attributes.aSizeFrom.array.set(sizes);
    this.geo.attributes.aSizeTo.array.set(sizes);
    this.geo.attributes.aSizeFrom.needsUpdate = true;
    this.geo.attributes.aSizeTo.needsUpdate = true;
    this.uniforms.uMorph.value = 1;
    this.uniforms.uMeshFade.value = 1;
    this._applyProfile(name, 0);
    this.mode = name;
    this._applyMesh(name);
  }

  /* freeze the in-flight interpolation into aFrom so a new morph can
     start from exactly what is on screen */
  bake() {
    const { aFrom, aTo, aColFrom, aColTo, aSizeFrom, aSizeTo, aSeed } = this.geo.attributes;
    const m = this.uniforms.uMorph.value;
    const st = this.uniforms.uStagger.value;
    const from = aFrom.array, to = aTo.array;
    const cf = aColFrom.array, ct = aColTo.array, sd = aSeed.array;
    const sf = aSizeFrom.array, stz = aSizeTo.array;
    for (let i = 0; i < this.count; i++) {
      let t = m * (1 + st) - sd[i * 4 + 3] * st;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      t = t * t * (3 - 2 * t);
      const o = i * 3;
      from[o] += (to[o] - from[o]) * t;
      from[o + 1] += (to[o + 1] - from[o + 1]) * t;
      from[o + 2] += (to[o + 2] - from[o + 2]) * t;
      cf[o] += (ct[o] - cf[o]) * t;
      cf[o + 1] += (ct[o + 1] - cf[o + 1]) * t;
      cf[o + 2] += (ct[o + 2] - cf[o + 2]) * t;
      sf[i] += (stz[i] - sf[i]) * t;
    }
    aFrom.needsUpdate = true;
    aColFrom.needsUpdate = true;
    aSizeFrom.needsUpdate = true;
  }

  morphTo(name, { duration = 2.6, stagger = 0.42, burst = 0 } = {}) {
    const f = this.formations[name];
    if (!f || (this.mode === name && !this._tl?.isActive())) return;
    this._tl?.kill();

    this.bake();
    this.geo.attributes.aTo.array.set(f.positions);
    this.geo.attributes.aColTo.array.set(f.colors);
    this.geo.attributes.aSizeTo.array.set(this._sizes(name));
    this.geo.attributes.aTo.needsUpdate = true;
    this.geo.attributes.aColTo.needsUpdate = true;
    this.geo.attributes.aSizeTo.needsUpdate = true;

    this.uniforms.uMorph.value = 0;
    this.uniforms.uStagger.value = stagger;
    this.mode = name;
    this._applyMesh(name);                       // re-seat mesh + pulses on the target

    this._tl = gsap.timeline();
    this._tl.to(this.uniforms.uMorph, { value: 1, duration, ease: 'power2.inOut' }, 0);
    // fade the mesh down and back so it re-knits into the new shape, not snaps
    this.uniforms.uMeshFade.value = 0.18;
    this._tl.to(this.uniforms.uMeshFade, { value: 1, duration: duration * 0.9, ease: 'power2.out' }, 0);
    this._applyProfile(name, duration * 0.85, this._tl);
    if (burst > 0) {
      this._tl.fromTo(
        this.uniforms.uBurst,
        { value: 0 },
        { value: burst, duration: duration * 0.5, ease: 'sine.inOut', yoyo: true, repeat: 1 },
        0
      );
    }
  }

  _applyProfile(name, duration, tl) {
    const p = this._profile(name);
    for (const k of ['uTurbAmp', 'uTurbFreq', 'uTurbSpeed', 'uSize']) {
      if (duration > 0) tl.to(this.uniforms[k], { value: p[k], duration, ease: 'sine.inOut' }, 0);
      else this.uniforms[k].value = p[k];
    }
  }

  _profile(name) {
    const p = PROFILES[name] || PROFILES.nebula;
    if (!this.mobile) return p;
    return {
      uTurbAmp: p.uTurbAmp * 0.58,
      uTurbFreq: p.uTurbFreq * 0.9,
      uTurbSpeed: p.uTurbSpeed * 0.72,
      uSize: p.uSize * 1.12,
    };
  }
}

class NeuralCortexOverlay {
  constructor(meta, { mobile = false, reducedMotion = false, pixelRatio = 1 } = {}) {
    this.mobile = mobile;
    this.reducedMotion = reducedMotion;
    this.group = new THREE.Group();
    this.group.position.set(0, 0, mobile ? -4.2 : -4.8);
    const scale = mobile ? 0.78 : 0.92;
    this.group.scale.setScalar(scale);

    this.uniforms = {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uBootEnergy: { value: 0 },
      uFire: { value: 0 },          // transient firing flare, driven in update()
      uPixelRatio: { value: pixelRatio },
      uAccent: { value: new THREE.Color(ACCENTS.nebula) },
      uPulseSpeed: { value: mobile ? 0.22 : 0.28 },
      uPulseIntensity: { value: mobile ? 0.58 : 0.82 },
    };
    this._fire = 0;

    const hubLimit = mobile ? 18 : 30;
    const sourceHubs = [...(meta?.hubs || [])].slice(0, hubLimit);
    const oldToNew = new Map(sourceHubs.map((hub, idx) => [hub.index, idx]));
    const edges = (meta?.hubEdges || [])
      .map(([a, b]) => [oldToNew.get(a), oldToNew.get(b)])
      .filter(([a, b]) => a != null && b != null && a !== b);

    if (sourceHubs.length < 4 || edges.length < 3) {
      this.empty = true;
      return;
    }

    const hubGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(sourceHubs.length * 3);
    const col = new Float32Array(sourceHubs.length * 3);
    const size = new Float32Array(sourceHubs.length);
    const intensity = new Float32Array(sourceHubs.length);
    const seed = new Float32Array(sourceHubs.length);
    sourceHubs.forEach((hub, i) => {
      const o = i * 3;
      pos[o] = hub.x;
      pos[o + 1] = hub.y;
      pos[o + 2] = hub.z;
      const c = hub.color || [0.9, 0.96, 1.12];
      col[o] = c[0];
      col[o + 1] = c[1];
      col[o + 2] = c[2];
      size[i] = hub.radius || 1.8;
      intensity[i] = hub.intensity || 0.8;
      seed[i] = Math.random();
    });
    hubGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    hubGeo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    hubGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    hubGeo.setAttribute('aIntensity', new THREE.BufferAttribute(intensity, 1));
    hubGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    this.hubGeo = hubGeo;
    this.hubs = new THREE.Points(hubGeo, new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: CORTEX_HUB_VERT,
      fragmentShader: CORTEX_HUB_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    }));
    this.hubs.frustumCulled = false;
    this.group.add(this.hubs);

    const lineGeo = new THREE.BufferGeometry();
    const linePos = new Float32Array(edges.length * 2 * 3);
    const lineIntensity = new Float32Array(edges.length * 2);
    edges.forEach(([a, b], i) => {
      const oa = a * 3, ob = b * 3, out = i * 6;
      linePos[out] = pos[oa];
      linePos[out + 1] = pos[oa + 1];
      linePos[out + 2] = pos[oa + 2];
      linePos[out + 3] = pos[ob];
      linePos[out + 4] = pos[ob + 1];
      linePos[out + 5] = pos[ob + 2];
      const edgeI = Math.min(1.25, (intensity[a] + intensity[b]) * 0.5);
      lineIntensity[i * 2] = edgeI;
      lineIntensity[i * 2 + 1] = edgeI;
    });
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute('aEdgeIntensity', new THREE.BufferAttribute(lineIntensity, 1));
    this.lineGeo = lineGeo;
    this.lineUniforms = {
      uTime: this.uniforms.uTime,
      uOpacity: this.uniforms.uOpacity,
      uBootEnergy: this.uniforms.uBootEnergy,
      uFire: this.uniforms.uFire,
      uAccent: this.uniforms.uAccent,
      uLineOpacity: { value: mobile ? 0.24 : 0.3 },
    };
    this.lines = new THREE.LineSegments(lineGeo, new THREE.ShaderMaterial({
      uniforms: this.lineUniforms,
      vertexShader: CORTEX_LINE_VERT,
      fragmentShader: CORTEX_LINE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    }));
    this.lines.frustumCulled = false;
    this.group.add(this.lines);

    this.edges = edges;
    if (!reducedMotion) this._buildPulses(sourceHubs, pos, col);
  }

  _buildPulses(hubs, hubPos, hubCol) {
    const count = this.mobile ? 20 : 46;
    const geo = new THREE.BufferGeometry();
    const from = new Float32Array(count * 3);
    const to = new Float32Array(count * 3);
    const color = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    const speed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const edge = this.edges[(Math.random() * this.edges.length) | 0];
      const a = edge[0], b = edge[1];
      const flip = Math.random() < 0.5;
      const ia = flip ? b : a;
      const ib = flip ? a : b;
      const oa = ia * 3, ob = ib * 3, o = i * 3;
      from[o] = hubPos[oa];
      from[o + 1] = hubPos[oa + 1];
      from[o + 2] = hubPos[oa + 2];
      to[o] = hubPos[ob];
      to[o + 1] = hubPos[ob + 1];
      to[o + 2] = hubPos[ob + 2];
      const boost = Math.min(1.2, ((hubs[ia]?.intensity || 0.8) + (hubs[ib]?.intensity || 0.8)) * 0.52);
      color[o] = hubCol[oa] * boost;
      color[o + 1] = hubCol[oa + 1] * boost;
      color[o + 2] = hubCol[oa + 2] * boost;
      phase[i] = Math.random();
      speed[i] = 0.72 + Math.random() * 0.72;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute('aFrom', new THREE.BufferAttribute(from, 3));
    geo.setAttribute('aTo', new THREE.BufferAttribute(to, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
    this.pulseGeo = geo;
    this.pulses = new THREE.Points(geo, new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: CORTEX_PULSE_VERT,
      fragmentShader: CORTEX_PULSE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    }));
    this.pulses.frustumCulled = false;
    this.group.add(this.pulses);
  }

  setOpacity(value, duration = 1) {
    if (this.empty) return;
    if (duration <= 0 || !gsap) this.uniforms.uOpacity.value = value;
    else gsap.to(this.uniforms.uOpacity, { value, duration, ease: 'sine.inOut', overwrite: 'auto' });
  }

  setBootEnergy(value, duration = 1) {
    if (this.empty) return;
    if (duration <= 0 || !gsap) this.uniforms.uBootEnergy.value = value;
    else gsap.to(this.uniforms.uBootEnergy, { value, duration, ease: 'sine.inOut', overwrite: 'auto' });
  }

  setPulse({ speed, intensity }, duration = 1) {
    if (this.empty) return;
    if (speed != null) {
      if (duration <= 0 || !gsap) this.uniforms.uPulseSpeed.value = speed;
      else gsap.to(this.uniforms.uPulseSpeed, { value: speed, duration, ease: 'sine.inOut', overwrite: 'auto' });
    }
    if (intensity != null) {
      if (duration <= 0 || !gsap) this.uniforms.uPulseIntensity.value = intensity;
      else gsap.to(this.uniforms.uPulseIntensity, { value: intensity, duration, ease: 'sine.inOut', overwrite: 'auto' });
    }
  }

  setAccent(hex, duration = 1) {
    if (this.empty) return;
    const target = new THREE.Color(hex);
    const c = this.uniforms.uAccent.value;
    if (duration <= 0 || !gsap) c.copy(target);
    else gsap.to(c, { r: target.r, g: target.g, b: target.b, duration, ease: 'sine.inOut', overwrite: 'auto' });
  }

  /* trigger a synaptic-firing flare — a quick spike that update() decays back to
     zero. Independent of the scroll-driven uBootEnergy so it never fights it. */
  fire(strength = 1) {
    if (this.empty || this.reducedMotion) return;
    this._fire = Math.min(1.4, Math.max(this._fire, strength));
  }

  update(dt) {
    if (this.empty) return;
    this.uniforms.uTime.value += dt * (this.reducedMotion ? 0.18 : 1);
    const t = this.uniforms.uTime.value;
    const e = this.uniforms.uBootEnergy.value;
    this.group.rotation.y = Math.sin(t * 0.08) * (0.035 + e * 0.012);
    this.group.rotation.x = Math.cos(t * 0.065) * (0.018 + e * 0.01);
    // firing flare decays to ~0 in ~1s (frame-rate independent)
    this._fire *= Math.pow(0.05, dt);
    this.uniforms.uFire.value = this._fire;
  }

  dispose() {
    this.hubGeo?.dispose();
    this.lineGeo?.dispose();
    this.pulseGeo?.dispose();
    this.hubs?.material?.dispose();
    this.lines?.material?.dispose();
    this.pulses?.material?.dispose();
  }
}

/* ---------------- additive bloom (desktop / high-end only) ----------------
   A compact, self-contained glow pass — no external post-processing addon, so
   the local-vendor / CDN three-module contract stays intact. The particle+cortex
   scene is re-rendered into a half-res target, bright areas are extracted and
   separably blurred, then ADDED back over the canvas that the normal pass already
   drew. Because the base render is never replaced, switching this off is
   byte-identical to the original look — and it is never created on mobile / low
   end, and is dropped the instant the adaptive-quality FPS probe fires. */
const BLOOM_QUAD_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const BLOOM_BRIGHT_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform float uThreshold;
uniform float uKnee;
void main(){
  vec4 c = texture2D(tDiffuse, vUv);
  float l = max(c.r, max(c.g, c.b));
  float k = smoothstep(uThreshold, uThreshold + uKnee, l);
  gl_FragColor = vec4(c.rgb * k, c.a * k);
}`;

const BLOOM_BLUR_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform vec2 uTexel;
uniform vec2 uDir;
void main(){
  vec2 o = uTexel * uDir;
  vec4 s = texture2D(tDiffuse, vUv) * 0.2270270270;
  s += texture2D(tDiffuse, vUv + o * 1.3846153846) * 0.3162162162;
  s += texture2D(tDiffuse, vUv - o * 1.3846153846) * 0.3162162162;
  s += texture2D(tDiffuse, vUv + o * 3.2307692308) * 0.0702702703;
  s += texture2D(tDiffuse, vUv - o * 3.2307692308) * 0.0702702703;
  gl_FragColor = s;
}`;

const BLOOM_COMPOSITE_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform float uStrength;
void main(){
  vec4 c = texture2D(tDiffuse, vUv);
  gl_FragColor = vec4(c.rgb * uStrength, c.a * uStrength);
}`;

/* Bloom + synaptic-firing are OFF by default: the crisp node/synapse field reads
   as an intentional neural network, and the additive glow smeared it into a haze.
   To trial a SUBTLE bloom later, set BLOOM_ENABLED = true and keep it gentle —
   a faint rim glow on the brightest hubs, never a wash. */
const BLOOM_ENABLED = false;
const BLOOM_PARAMS = { strength: 0.25, threshold: 0.7, knee: 0.3, scale: 0.4 };
const SYNAPTIC_FIRING = false;     // OFF — no periodic cortex flares in steady state

class GlowBloom {
  constructor(renderer, { strength = 0.7, threshold = 0.32, knee = 0.5, scale = 0.5 } = {}) {
    this.renderer = renderer;
    this.strength = strength;
    this.scale = scale;
    this.enabled = true;
    this._texel = [1 / 2, 1 / 2];

    const opts = { depthBuffer: false, stencilBuffer: false };
    this.sceneRT = new THREE.WebGLRenderTarget(2, 2, opts);
    this.rtA = new THREE.WebGLRenderTarget(2, 2, opts);
    this.rtB = new THREE.WebGLRenderTarget(2, 2, opts);
    for (const rt of [this.sceneRT, this.rtA, this.rtB]) {
      rt.texture.minFilter = THREE.LinearFilter;
      rt.texture.magFilter = THREE.LinearFilter;
      rt.texture.generateMipmaps = false;
    }

    this.brightMat = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, uThreshold: { value: threshold }, uKnee: { value: knee } },
      vertexShader: BLOOM_QUAD_VERT, fragmentShader: BLOOM_BRIGHT_FRAG,
      depthTest: false, depthWrite: false, blending: THREE.NoBlending,
    });
    this.blurMat = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, uTexel: { value: new THREE.Vector2() }, uDir: { value: new THREE.Vector2() } },
      vertexShader: BLOOM_QUAD_VERT, fragmentShader: BLOOM_BLUR_FRAG,
      depthTest: false, depthWrite: false, blending: THREE.NoBlending,
    });
    this.compositeMat = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, uStrength: { value: strength } },
      vertexShader: BLOOM_QUAD_VERT, fragmentShader: BLOOM_COMPOSITE_FRAG,
      depthTest: false, depthWrite: false, transparent: true,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor,
    });

    this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quadScene = new THREE.Scene();
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.brightMat);
    this.quad.frustumCulled = false;
    this.quadScene.add(this.quad);
  }

  setSize(w, h, dpr) {
    const sw = Math.max(2, Math.floor(w * dpr * this.scale));
    const sh = Math.max(2, Math.floor(h * dpr * this.scale));
    this.sceneRT.setSize(sw, sh);
    this.rtA.setSize(sw, sh);
    this.rtB.setSize(sw, sh);
    this._texel = [1 / sw, 1 / sh];
  }

  _pass(mat, target) {
    this.quad.material = mat;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.quadScene, this.quadCam);
  }

  /* additive: re-render `scene`, extract + blur the bright bits, add over canvas */
  add(scene, camera) {
    const r = this.renderer;
    const prevAutoClear = r.autoClear;

    r.autoClear = true;
    r.setRenderTarget(this.sceneRT);     // own transparent clear, then the scene
    r.render(scene, camera);

    this.brightMat.uniforms.tDiffuse.value = this.sceneRT.texture;
    this._pass(this.brightMat, this.rtA);

    this.blurMat.uniforms.uTexel.value.set(this._texel[0], this._texel[1]);
    for (let i = 0; i < 2; i++) {
      this.blurMat.uniforms.tDiffuse.value = this.rtA.texture;
      this.blurMat.uniforms.uDir.value.set(1, 0);
      this._pass(this.blurMat, this.rtB);
      this.blurMat.uniforms.tDiffuse.value = this.rtB.texture;
      this.blurMat.uniforms.uDir.value.set(0, 1);
      this._pass(this.blurMat, this.rtA);
    }

    r.setRenderTarget(null);
    r.autoClear = false;                 // keep the base scene already on the canvas
    this.compositeMat.uniforms.tDiffuse.value = this.rtA.texture;
    this.compositeMat.uniforms.uStrength.value = this.strength;
    this.quad.material = this.compositeMat;
    r.render(this.quadScene, this.quadCam);

    r.autoClear = prevAutoClear;
    r.setRenderTarget(null);
  }

  dispose() {
    this.sceneRT.dispose(); this.rtA.dispose(); this.rtB.dispose();
    this.brightMat.dispose(); this.blurMat.dispose(); this.compositeMat.dispose();
    this.quad.geometry.dispose();
  }
}

/* ---------------- stage ---------------- */

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/* DPR is capped well below the native ratio on desktop: smoothness beats the
   marginal sharpness of full 2× on a field of soft additive sprites. */
function renderPixelRatio(isMobile) {
  const raw = devicePixelRatio || 1;
  if (!isMobile) {
    const cores = navigator.hardwareConcurrency || 8;
    const cap = cores <= 4 ? 1.35 : 1.5;
    return Math.min(raw, cap);
  }
  const cores = navigator.hardwareConcurrency || 6;
  const memory = navigator.deviceMemory || 4;
  const cap = cores <= 4 || memory <= 3 ? 1.0 : 1.25;
  return Math.min(raw, cap);
}

/* MAX-LEVEL is focal hierarchy, not raw count. Desktop tops out ~18k (high-end)
   and ~11–14k on laptops; mobile 3–6k. Fewer, better particles read cleaner and
   run smoother. */
function particleBudget({ mobile = false } = {}) {
  if (mobile) {
    const area = innerWidth * innerHeight;
    const cores = navigator.hardwareConcurrency || 6;
    const memory = navigator.deviceMemory || 4;
    let maxBudget = 6000;
    if (cores <= 4) maxBudget = 5000;
    if (memory <= 3) maxBudget = Math.min(maxBudget, 4400);
    if (memory <= 2) maxBudget = Math.min(maxBudget, 3600);

    let n = area * 0.013;
    if ((devicePixelRatio || 1) > 1.5) n *= 0.85;
    if (cores <= 4) n *= 0.8;
    if (memory <= 4) n *= 0.9;
    if (memory <= 2) n *= 0.8;
    return Math.round(clamp(n, 3000, maxBudget));
  }

  const dpr = Math.min(devicePixelRatio || 1, 2);
  let n = (innerWidth * innerHeight) * 0.0105;
  if (dpr > 1.5) n *= 0.82;
  const cores = navigator.hardwareConcurrency || 8;
  if (cores <= 4) n *= 0.7;
  else if (cores <= 6) n *= 0.86;
  return Math.round(clamp(n, 8000, 18000));
}

/* network-mesh budget — capped hard, scaled down / skipped on weaker devices,
   and now distance-bounded (maxDistance) so segments stay short local synapses
   instead of long lines slicing across the viewport. */
function meshBudget({ mobile = false, reducedMotion = false } = {}) {
  const cores = navigator.hardwareConcurrency || (mobile ? 6 : 8);
  const memory = navigator.deviceMemory || 4;
  if (mobile) {
    if (cores <= 4 || memory <= 3) return { nodes: 0, k: 0, maxSegments: 0, pulses: 0, lineOpacity: 0, maxDistance: 0 };
    // slightly brighter synapses so the network reads on the sparser mobile field
    // — same node/segment count (zero extra cost, no FPS-probe risk).
    return { nodes: 260, k: 2, maxSegments: 460, pulses: reducedMotion ? 0 : 12, lineOpacity: 0.26, maxDistance: 10 };
  }
  if (cores <= 4 || memory <= 4) {
    return { nodes: 440, k: 3, maxSegments: 760, pulses: reducedMotion ? 0 : 22, lineOpacity: 0.24, maxDistance: 12 };
  }
  return { nodes: 560, k: 3, maxSegments: 900, pulses: reducedMotion ? 0 : 30, lineOpacity: 0.26, maxDistance: 12 };
}

export async function initGL(canvas, options = {}) {
  const isMobile = !!options.mobile;
  await loadDeps({ lenis: !isMobile });

  const html = document.documentElement;
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loaderBar');
  const loaderPct = document.getElementById('loaderPct');

  const progress = { v: 0 };
  const paintProgress = () => {
    if (loaderBar) loaderBar.style.transform = `scaleX(${progress.v / 100})`;
    if (loaderPct) loaderPct.textContent = String(Math.round(progress.v)).padStart(3, '0');
  };
  gsap.to(progress, { v: 82, duration: 1.2, ease: 'power1.out', onUpdate: paintProgress });

  /* renderer / scene */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  const dpr = renderPixelRatio(isMobile);
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 500);

  const LOGO_W = 30;
  const cam = { baseZ: 46, dolly: 0, px: 0, py: 0, tx: 0, ty: 0 };
  function fitCamera() {
    camera.aspect = innerWidth / innerHeight;
    const halfTan = Math.tan((camera.fov * Math.PI) / 360);
    cam.baseZ = Math.max(46, (LOGO_W * 0.72) / (halfTan * camera.aspect));
    camera.updateProjectionMatrix();
  }
  fitCamera();
  camera.position.set(0, 0, cam.baseZ);

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // high-end desktop gate for the most expensive opt-in FX (bloom + synaptic
  // firing). Conservative by design — Safari hides deviceMemory, so memory is
  // only required when actually reported.
  const highEnd = (() => {
    if (isMobile) return false;
    const cores = navigator.hardwareConcurrency || 8;
    const memory = navigator.deviceMemory;          // undefined on Safari
    return cores >= 8 && (memory === undefined || memory >= 8);
  })();
  const mesh = meshBudget({ mobile: isMobile, reducedMotion });
  const particles = new Particles(particleBudget({ mobile: isMobile }), {
    mobile: isMobile, mesh, reducedMotion,
  });
  particles.uniforms.uPixelRatio.value = dpr;
  scene.add(particles.group);

  // mesh tints mirror the per-scene CSS accents
  for (const [name, hex] of Object.entries(ACCENTS)) particles.accents[name] = new THREE.Color(hex);

  /* product image corridor — a second, self-contained render pass that floats
     the real screenshots as a 3D tunnel behind the readable HTML copy. Skipped
     on weaker phones (the HTML product cards already carry the screenshots).
     Any failure here must never take down the particle stage. */
  let corridor = null;
  // Corridor is desktop-only. On phones it ghosts behind the copy and merely
  // duplicates the HTML product cards (which already show every screenshot), so
  // disable it for ALL mobile sessions. (High-power tablets run as isMobile=false
  // via app.js, so they keep the corridor.) corridor stays null — every use is
  // guarded by `if (corridor)` / `corridor?.`, so no errors result.
  const corridorOK = !isMobile;
  if (corridorOK) {
    try {
      corridor = createCorridor(THREE, {
        mobile: isMobile,
        reducedMotion,
        maxAnisotropy: renderer.capabilities.getMaxAnisotropy(),
      });
      corridor.resize(innerWidth, innerHeight);
      corridor.load().catch((err) => console.warn('[swivel] corridor textures:', err));
    } catch (err) {
      console.warn('[swivel] image corridor unavailable:', err);
      corridor = null;
    }
  }

  /* additive bloom — OFF by default (BLOOM_ENABLED). When trialled later it stays
     high-end desktop only and quality-gated by the FPS probe; fully wrapped so any
     failure leaves the normal render path untouched. */
  let bloom = null;
  if (highEnd && BLOOM_ENABLED) {
    try {
      bloom = new GlowBloom(renderer, BLOOM_PARAMS);
      bloom.setSize(innerWidth, innerHeight, dpr);
    } catch (err) {
      console.warn('[swivel] bloom unavailable:', err);
      bloom = null;
    }
  }
  window.__swivelDebug = window.__swivelDebug || {};
  window.__swivelDebug.bloom = () => ({ highEnd, active: !!(bloom && bloom.enabled) });

  /* formations */
  particles.formations.spawn = spawnFormation(particles.count);
  const nebula = nebulaFormation(particles.count, {
    radius: isMobile ? 27 : 30,
    hubCount: isMobile ? 16 : 32,
    mobile: isMobile,
  });
  particles.formations.nebula = nebula;
  // per-product shapes — cheap CPU arrays, keyed to the section ids
  particles.formations['good-one'] = goodOneFormation(particles.count);
  particles.formations['swico-ai'] = swicoFormation(particles.count);
  particles.formations['grab-basket'] = grabBasketFormation(particles.count);
  particles.formations['manas'] = manasFormation(particles.count);
  particles.formations['ai-business-assistant'] = aiAssistantFormation(particles.count);
  particles.formations['defect-detector'] = defectFormation(particles.count);
  particles.formations.logo = await logoFormation('images/logo.png', particles.count, { width: LOGO_W });

  let cortex = null;
  try {
    cortex = new NeuralCortexOverlay(nebula.meta, { mobile: isMobile, reducedMotion, pixelRatio: dpr });
    if (!cortex.empty) scene.add(cortex.group);
  } catch (err) {
    console.warn('[swivel] cortex overlay unavailable:', err);
    cortex = null;
  }

  // precompute a nearest-neighbour network for the nebula + each product so the
  // mesh roughly follows the active shape
  if (mesh.nodes > 0) {
    for (const name of ['nebula', 'good-one', 'swico-ai', 'grab-basket', 'manas', 'ai-business-assistant', 'defect-detector']) {
      particles.setEdges(name, buildEdges(particles.formations[name].positions, particles.count, mesh));
    }
    // the logo carries a sparse circuit so the intro can collapse the mesh into
    // the wordmark and the idle logo keeps a faint live mesh + the odd pulse
    const logoMesh = { nodes: Math.min(mesh.nodes, 320), k: 2, maxSegments: Math.min(mesh.maxSegments, 520), maxDistance: 9 };
    particles.setEdges('logo', buildEdges(particles.formations.logo.positions, particles.count, logoMesh));
  }

  particles.setImmediate('spawn');
  particles.uniforms.uOpacity.value = 0;

  /* flip the document into immersive layout before wiring scroll */
  history.scrollRestoration = 'manual';
  html.classList.add('gl');
  html.classList.toggle('gl-mobile', isMobile);
  html.classList.remove('gl-loading');
  applyProductScreenCounts();

  let lenis = null;
  let refreshFrame = 0;
  const sceneFitQuery = matchMedia('(max-width: 1060px), (max-height: 720px), (hover: none), (pointer: coarse)');

  function getHashTarget(hash) {
    if (!hash || hash === '#') return null;
    let id = hash.startsWith('#') ? hash.slice(1) : hash;
    try { id = decodeURIComponent(id); } catch {}
    return document.getElementById(id);
  }

  function applyProductScreenCounts() {
    CORRIDOR_PRODUCTS.forEach((product) => {
      const section = document.getElementById(product.id);
      if (!section) return;
      const screens = Math.max(1, product.images.length);
      section.style.setProperty('--screens', String(screens));
      // CAPPED + comparable pacing — the cyclic carousel (not section length) is
      // what reveals every screenshot, so a product with 15 shots is no longer
      // any taller than one with 6. No scroll trap. (Narrow/mobile layouts get
      // natural auto height from CSS, so this only drives the wide desktop view.)
      const scrollVh = clamp(158 + Math.min(screens, 6) * 9, 175, 230);
      section.style.setProperty('--product-scroll', `${Math.round(scrollVh)}vh`);
    });
  }

  function updateSceneStickiness() {
    const viewportH = window.visualViewport?.height || innerHeight;
    document.querySelectorAll('.scene').forEach((sceneEl) => {
      const hold = sceneEl.querySelector('.scene__hold');
      if (!hold || sceneEl.classList.contains('scene--contact')) return;
      const keepProductTheatre =
        sceneEl.classList.contains('scene--product') &&
        !isMobile &&
        !sceneFitQuery.matches;
      if (keepProductTheatre) {
        sceneEl.classList.remove('scene--unstick');
        return;
      }
      sceneEl.classList.remove('scene--unstick');
      const contentTooTall = hold.scrollHeight > viewportH + 8;
      sceneEl.classList.toggle('scene--unstick', contentTooTall);
    });
  }

  function refreshScroll(safe = false) {
    updateSceneStickiness();
    try { lenis?.resize?.(); } catch (err) {
      console.warn('[swivel] Lenis resize failed:', err);
    }
    ScrollTrigger.refresh(safe);
  }

  function queueRefresh(safe = false) {
    cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => refreshScroll(safe));
  }

  function scheduleSettledRefreshes() {
    const refresh = () => {
      queueRefresh(true);
      setTimeout(() => queueRefresh(true), 160);
    };
    if (document.readyState === 'complete') refresh();
    else addEventListener('load', refresh, { once: true });
    document.fonts?.ready?.then(refresh).catch(() => {});
  }

  function disableLenis(err) {
    console.warn('[swivel] Lenis disabled, falling back to native scroll:', err);
    try { lenis?.destroy?.(); } catch {}
    if (window.__swivelLenis === lenis) delete window.__swivelLenis;
    lenis = null;
    ScrollTrigger.update();
  }

  /* smooth scroll */
  if (!isMobile && window.Lenis) {
    try {
      lenis = new window.Lenis({
        lerp: 0.085,
        smoothWheel: true,
        syncTouch: false,
        autoResize: false,
        prevent: (node) => !!node?.closest?.('[data-lenis-prevent]'),
      });
      window.__swivelLenis = lenis;
      lenis.on('scroll', () => ScrollTrigger.update());
    } catch (err) {
      disableLenis(err);
    }
  }
  updateSceneStickiness();

  /* scroll choreography */
  // bursts are deliberately small — particles reflow/settle into the next
  // formation (a wave sweeping through) rather than exploding outward
  const motion = isMobile
    ? {
        heroMorph: 2.3,
        heroBurst: 0.1,
        logoMorph: 1.9,
        logoBurst: 0.06,
        introMorph: 2.5,
        introStagger: 0.32,
        workOpacity: 0.22,
        contactOpacity: 0.34,
        dolly: 14,
        rotY: 0.5,
        scrub: 0.75,
        idleNebula: 0.012,
      }
    : {
        heroMorph: 3.1,
        heroBurst: 0.16,
        logoMorph: 2.3,
        logoBurst: 0.1,
        introMorph: 3.4,
        introStagger: 0.4,
        workOpacity: 0.22,
        contactOpacity: 0.4,
        dolly: 26,
        rotY: 0.85,
        scrub: 1.3,
        idleNebula: 0.018,
      };
  const rig = { rotY: 0, idle: 0, idleSpeed: isMobile ? 0.003 : 0.005 };
  const dim = (v, d = 1.4) =>
    gsap.to(particles.uniforms.uOpacity, { value: v, duration: d, ease: 'sine.inOut', overwrite: 'auto' });
  const pu = particles.pulseUniforms;                // undefined when pulse budget is disabled
  const cortexOpacity = (value, duration = 1.1) => cortex?.setOpacity(value, duration);
  const cortexEnergy = (value, duration = 1.1) => cortex?.setBootEnergy(value, duration);
  const cortexAccent = (hex, duration = 1.1) => cortex?.setAccent(hex, duration);
  const cortexPulse = (speed, intensity, duration = 1.1) => cortex?.setPulse({ speed, intensity }, duration);

  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top 70%',
    onEnter: () => {
      cortexAccent(ACCENTS.nebula, 1.0);
      cortexOpacity(isMobile ? 0.32 : 0.42, 1.1);
      cortexEnergy(0.16, 1.1);
      cortexPulse(isMobile ? 0.18 : 0.22, isMobile ? 0.5 : 0.7, 1.1);
      // restore the mesh to its standard scene opacity (intro left it faint)
      if (particles.lineUniforms) {
        gsap.to(particles.lineUniforms.uLineOpacity, { value: mesh.lineOpacity, duration: 1.0, ease: 'sine.out', overwrite: 'auto' });
      }
      particles.morphTo('nebula', { duration: motion.heroMorph, stagger: isMobile ? 0.34 : 0.45, burst: motion.heroBurst });
    },
    onLeaveBack: () => {
      // scrolling back up to the intro keeps the calm neural field (no particle
      // wordmark) — the readable SWIVEL TECHNOLOGIES is HTML over the top
      cortexAccent(ACCENTS.nebula, 1.0);
      cortexOpacity(isMobile ? 0.38 : 0.5, 1.1);
      cortexEnergy(0.2, 1.1);
      cortexPulse(isMobile ? 0.2 : 0.26, isMobile ? 0.56 : 0.76, 1.1);
      particles.morphTo('nebula', { duration: motion.heroMorph, stagger: isMobile ? 0.3 : 0.4, burst: motion.heroBurst });
    },
  });
  // dim the stage across the whole product run; restore to full above it
  ScrollTrigger.create({
    trigger: '#work', start: 'top 55%',
    onEnter: () => {
      dim(motion.workOpacity);
      // network lines drop to near-nothing so they never fight the screenshots
      if (particles.lineUniforms) gsap.to(particles.lineUniforms.uLineOpacity, { value: 0.1, duration: 1.0, ease: 'sine.out', overwrite: 'auto' });
      cortexOpacity(isMobile ? 0.1 : 0.14, 1.2);
      cortexEnergy(0.08, 1.2);
    },
    onLeaveBack: () => {
      dim(isMobile ? 0.56 : 0.62);
      if (particles.lineUniforms) gsap.to(particles.lineUniforms.uLineOpacity, { value: mesh.lineOpacity, duration: 1.0, ease: 'sine.out', overwrite: 'auto' });
      cortexAccent(ACCENTS.nebula, 1.0);
      cortexOpacity(isMobile ? 0.36 : 0.46, 1.2);
      cortexEnergy(0.18, 1.2);
    },
  });

  /* corridor: bind the active 3D room to the product section near the viewport
     centre, and anchor the planes to the right-hand product-card column so each
     screenshot reads as part of that exact product, not a floating centrepiece. */
  let anchorToCard = () => {};
  if (corridor) {
    const FIRST = '#good-one';
    const LAST = '#defect-detector';
    window.__swivelDebug = window.__swivelDebug || {};
    window.__swivelDebug.corridor = () => corridor?.getDebugState?.() || null;

    // visibility: on only while the product run is on screen
    ScrollTrigger.create({
      trigger: FIRST, start: 'top 80%',
      endTrigger: LAST, end: 'bottom 20%',
      onToggle: (self) => corridor.setVisible(self.isActive),
    });

    // continuous active-room head: progress 0 at Good One's centre → 1 at Defect
    // Detector's centre, mapped onto room indices 0…count-1. Stays correct on
    // deep-links and refreshes (onRefresh re-reads progress).
    const setHead = (self) => { corridor.targetHead = self.progress * (corridor.count - 1); };
    ScrollTrigger.create({
      trigger: FIRST, start: 'center center',
      endTrigger: LAST, end: 'center center',
      onUpdate: setHead, onRefresh: setHead,
    });

    // local product progress: inside each product section, promote screenshot
    // 1 → 2 → 3… through the foreground hero position.
    PRODUCT_IDS.forEach((id, idx) => {
      const setImageProgress = (self) => {
        corridor.setActive(idx);
        corridor.setProductProgress(idx, self.progress);
      };
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: setImageProgress,
        onRefresh: setImageProgress,
      });
    });

    // anchor the corridor to the product card area (all product cards share the
    // right-hand column, so one measurement keeps every room on spot)
    anchorToCard = () => {
      const card = document.querySelector(`${FIRST} .product__card-wrap`);
      if (card) corridor.setAnchorRect(card.getBoundingClientRect());
    };
    anchorToCard();
    ScrollTrigger.addEventListener?.('refreshInit', anchorToCard);

    // swipe / drag-to-scrub (touch) — a horizontal swipe over the product run
    // scrubs the active room's screenshot carousel. Available on every touch
    // device where the corridor exists; vertical gestures still scroll the page.
    let dragX = 0, dragY = 0, dragging = false, dragApplied = 0, dragAxis = 0;
    const SWIPE_PX = isMobile ? 90 : 150;     // horizontal px per screenshot
    addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      dragging = true; dragAxis = 0; dragApplied = 0;
      dragX = t.clientX; dragY = t.clientY;
    }, { passive: true });
    addEventListener('touchmove', (e) => {
      if (!dragging || !corridor.visible) return;
      const t = e.touches[0];
      const dx = t.clientX - dragX, dy = t.clientY - dragY;
      if (dragAxis === 0) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;        // wait for intent
        dragAxis = Math.abs(dx) > Math.abs(dy) * 1.2 ? 1 : -1;   // 1 = horizontal scrub
        if (dragAxis === -1) { dragging = false; return; }       // vertical → let it scroll
      }
      e.preventDefault();                                        // own the horizontal gesture
      const images = -dx / SWIPE_PX;
      corridor.scrubActive(images - dragApplied);
      dragApplied = images;
    }, { passive: false });
    const endDrag = () => { dragging = false; };
    addEventListener('touchend', endDrag, { passive: true });
    addEventListener('touchcancel', endDrag, { passive: true });
  }

  /* per-product shape morphs — as each product scrolls into view the cloud
     dissolves and re-forms into its shape. bake() makes every morph start
     from whatever is on screen, so the first goes nebula→shape and the rest
     go shape→shape. burst is kept gentle so transitions read, not thrash. */
  const PRODUCTS = PRODUCT_IDS;
  const productPulse = {
    'good-one': { speed: isMobile ? 0.18 : 0.24, intensity: isMobile ? 0.58 : 0.88, energy: 0.14 },
    'swico-ai': { speed: isMobile ? 0.26 : 0.34, intensity: isMobile ? 0.72 : 1.05, energy: 0.18 },
    'grab-basket': { speed: isMobile ? 0.2 : 0.27, intensity: isMobile ? 0.62 : 0.94, energy: 0.15 },
    manas: { speed: isMobile ? 0.13 : 0.17, intensity: isMobile ? 0.46 : 0.64, energy: 0.1 },
    'ai-business-assistant': { speed: isMobile ? 0.22 : 0.3, intensity: isMobile ? 0.66 : 0.98, energy: 0.16 },
    'defect-detector': { speed: isMobile ? 0.28 : 0.38, intensity: isMobile ? 0.78 : 1.14, energy: 0.22 },
  };
  const productDur = motion.heroMorph * 0.82;
  const productStagger = isMobile ? 0.46 : 0.6;     // higher stagger = a wave sweeps through
  const productBurst = isMobile ? 0.14 : 0.26;
  const toNebula = (burst) =>
    particles.morphTo('nebula', { duration: productDur, stagger: productStagger, burst });

  PRODUCTS.forEach((id, idx) => {
    const morph = () => {
      particles.morphTo(id, { duration: productDur, stagger: productStagger, burst: productBurst });
      const p = productPulse[id];
      cortexAccent(ACCENTS[id], 1.0);
      cortexOpacity(isMobile ? 0.1 : 0.16, 1.0);
      cortexEnergy(p ? p.energy + 0.05 : 0.12, 0.9);
      if (p && pu) {
        gsap.to(pu.uPulseSpeed, { value: p.speed, duration: 1.0, ease: 'sine.inOut', overwrite: 'auto' });
        gsap.to(pu.uPulseIntensity, { value: p.intensity, duration: 1.0, ease: 'sine.inOut', overwrite: 'auto' });
      }
      if (p) cortexPulse(p.speed * 0.82, p.intensity * 0.72, 1.0);
      if (p) gsap.to(particles.uniforms.uBootEnergy, { value: p.energy, duration: 0.9, ease: 'sine.inOut', overwrite: 'auto' });
    };
    ScrollTrigger.create({
      trigger: `#${id}`, start: 'top 58%',
      onEnter: morph,
      onEnterBack: morph,
      // scrolling up out of the first product returns the stage to the nebula
      onLeaveBack: idx === 0 ? () => toNebula(productBurst * 0.6) : undefined,
    });
  });

  // after the products, the narrative scenes settle back into the nebula
  ScrollTrigger.create({
    trigger: '#about', start: 'top 64%',
    onEnter: () => {
      toNebula(productBurst * 0.5);
      if (particles.lineUniforms) gsap.to(particles.lineUniforms.uLineOpacity, { value: mesh.lineOpacity, duration: 1.2, ease: 'sine.out', overwrite: 'auto' });
      cortexAccent(ACCENTS.nebula, 1.2);
      cortexOpacity(isMobile ? 0.18 : 0.28, 1.3);
      cortexEnergy(0.13, 1.2);
      cortexPulse(isMobile ? 0.16 : 0.2, isMobile ? 0.46 : 0.62, 1.2);
      if (pu) {
        gsap.to(pu.uPulseSpeed, { value: isMobile ? 0.18 : 0.22, duration: 1.2, ease: 'sine.inOut', overwrite: 'auto' });
        gsap.to(pu.uPulseIntensity, { value: isMobile ? 0.58 : 0.78, duration: 1.2, ease: 'sine.inOut', overwrite: 'auto' });
      }
      gsap.to(particles.uniforms.uBootEnergy, { value: 0.12, duration: 1.1, ease: 'sine.inOut', overwrite: 'auto' });
    },
  });

  ScrollTrigger.create({
    trigger: '#contact', start: 'top 75%',
    onEnter: () => dim(motion.contactOpacity), onLeaveBack: () => dim(motion.workOpacity),
  });
  gsap.to(cam, {
    dolly: motion.dolly, ease: 'none',
    scrollTrigger: { trigger: '#content', start: 'top top', end: 'bottom bottom', scrub: motion.scrub },
  });
  gsap.to(rig, {
    rotY: motion.rotY, ease: 'none',
    scrollTrigger: { trigger: '#content', start: 'top top', end: 'bottom bottom', scrub: isMobile ? 0.9 : 1.8 },
  });

  /* entry: deep links land formed; a fresh visit gets the intro */
  const hash = location.hash && getHashTarget(location.hash) ? location.hash : null;
  if (hash && hash !== '#intro') {
    // a deep link to a product lands directly on that shape, else the nebula
    const id = hash.slice(1);
    particles.setImmediate(particles.formations[id] ? id : 'nebula');
    particles.uniforms.uOpacity.value = motion.workOpacity;
    const productIndex = PRODUCTS.indexOf(id);
    if (productIndex >= 0) {
      const p = productPulse[id];
      corridor?.setHead(productIndex);
      corridor?.setProductProgress(productIndex, 0);
      if (corridor) {
        corridor.head = productIndex;
        corridor.setVisible(true);
      }
      cortexAccent(ACCENTS[id], 0);
      cortexOpacity(isMobile ? 0.1 : 0.16, 0);
      cortexEnergy(p ? p.energy + 0.05 : 0.12, 0);
      if (p) cortexPulse(p.speed * 0.82, p.intensity * 0.72, 0);
      if (p && pu) {
        pu.uPulseSpeed.value = p.speed;
        pu.uPulseIntensity.value = p.intensity;
      }
      if (p) particles.uniforms.uBootEnergy.value = p.energy;
    } else {
      cortexAccent(ACCENTS.nebula, 0);
      cortexOpacity(isMobile ? 0.18 : 0.28, 0);
      cortexEnergy(0.12, 0);
      cortexPulse(isMobile ? 0.14 : 0.18, isMobile ? 0.42 : 0.58, 0);
    }
  } else {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    lenis?.scrollTo?.(0, { immediate: true, force: true });
  }

  refreshScroll(true);
  scheduleSettledRefreshes();
  if (hash && hash !== '#intro') {
    requestAnimationFrame(() => {
      const productIndex = PRODUCTS.indexOf(hash.slice(1));
      if (typeof window.__swivelScrollTo === 'function') {
        window.__swivelScrollTo(hash, { immediate: true });
      } else {
        const target = getHashTarget(hash);
        if (target) {
          const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY);
          if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
          else window.scrollTo({ top, left: 0, behavior: 'auto' });
        }
      }
      ScrollTrigger.update();
      if (productIndex >= 0 && corridor) {
        let cancelled = false;
        const cancel = () => { cancelled = true; };
        addEventListener('wheel', cancel, { once: true, passive: true });
        addEventListener('touchstart', cancel, { once: true, passive: true });
        addEventListener('keydown', cancel, { once: true });
        const resetProductHash = () => {
          if (cancelled) return;
          corridor.setProductState(productIndex, 0);
          corridor.head = productIndex;
          corridor.targetHead = productIndex;
          corridor.setVisible(true);
        };
        resetProductHash();
        [140, 520, 1300, 2800, 5200].forEach((ms) => setTimeout(resetProductHash, ms));
      }
    });
  }

  /* pointer parallax (fine pointers only) */
  if (matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', (e) => {
      cam.tx = (e.clientX / innerWidth - 0.5) * 4.4;
      cam.ty = (e.clientY / innerHeight - 0.5) * -3.0;
    }, { passive: true });
  }

  /* resize */
  let resizeT;
  addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      const d = renderPixelRatio(isMobile);
      renderer.setPixelRatio(d);
      renderer.setSize(innerWidth, innerHeight, false);
      particles.uniforms.uPixelRatio.value = d;
      if (cortex) cortex.uniforms.uPixelRatio.value = d;
      bloom?.setSize(innerWidth, innerHeight, d);
      fitCamera();
      corridor?.resize(innerWidth, innerHeight);
      anchorToCard();
      queueRefresh(true);
    }, 120);
  });
  window.visualViewport?.addEventListener('resize', () => queueRefresh(true), { passive: true });
  if (sceneFitQuery.addEventListener) sceneFitQuery.addEventListener('change', () => queueRefresh(true));
  else sceneFitQuery.addListener?.(() => queueRefresh(true));

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    gsap.ticker.remove(tick);
    try { lenis?.destroy?.(); } catch {}
    try { corridor?.dispose(); } catch {}
    try { cortex?.dispose(); } catch {}
    try { bloom?.dispose(); } catch {}
    if (window.__swivelLenis === lenis) delete window.__swivelLenis;
    html.classList.remove('gl', 'gl-mobile');
    html.classList.add('no-gl');
  });

  /* adaptive quality — a short frame-time sample a few seconds after boot. On a
     genuinely slow device, trim the most expensive transparent layers so motion
     stays smooth. Implausibly low rates (a hidden/throttled tab or a headless
     capture) are ignored so we don't dim a stage that's simply paused. */
  let qProbeStart = 0, qFrames = 0, qChecked = false;
  function applyLowQuality(avgFps) {
    qChecked = true;
    console.info(`[swivel] adaptive quality: ~${avgFps.toFixed(0)}fps → trimming layers for smoothness`);
    const u = particles.uniforms;
    if (particles.lineUniforms) gsap.to(particles.lineUniforms.uLineOpacity, { value: particles.lineUniforms.uLineOpacity.value * 0.5, duration: 0.8, overwrite: 'auto' });
    if (pu) gsap.to(pu.uPulseIntensity, { value: pu.uPulseIntensity.value * 0.6, duration: 0.8, overwrite: 'auto' });
    gsap.to(u.uOpacity, { value: u.uOpacity.value * 0.86, duration: 0.8, overwrite: 'auto' });
    gsap.to(u.uHubGlow, { value: u.uHubGlow.value * 0.72, duration: 0.8, overwrite: 'auto' });
    if (cortex && !cortex.empty) {
      gsap.to(cortex.uniforms.uOpacity, { value: cortex.uniforms.uOpacity.value * 0.6, duration: 0.8, overwrite: 'auto' });
      gsap.to(cortex.uniforms.uPulseIntensity, { value: cortex.uniforms.uPulseIntensity.value * 0.6, duration: 0.8, overwrite: 'auto' });
    }
    if (corridor) corridor.qualityScale = 0.72;
    if (bloom) bloom.enabled = false;     // drop the extra full-scene pass first
  }

  /* render loop — gsap.ticker is a single shared rAF */
  function tick(time, deltaMS) {
    if (lenis) {
      try {
        lenis.raf(time * 1000);
      } catch (err) {
        disableLenis(err);
      }
    }
    if (document.hidden) return;
    const dt = Math.min(deltaMS / 1000, 0.05);

    if (!qChecked && particles.uniforms.uTime.value > (isMobile ? 6.5 : 5.5)) {
      if (!qProbeStart) { qProbeStart = time; qFrames = 0; }
      qFrames++;
      const elapsed = time - qProbeStart;
      if (elapsed >= 1.6 && qFrames > 8) {
        const avgFps = qFrames / elapsed;
        if (avgFps > 12 && avgFps < (isMobile ? 34 : 48)) applyLowQuality(avgFps);
        else qChecked = true;
      }
    }

    particles.uniforms.uTime.value += dt;
    rig.idleSpeed += ((particles.mode === 'nebula' ? motion.idleNebula : 0) - rig.idleSpeed) * 0.02;
    rig.idle += dt * rig.idleSpeed;
    // the logo must face the camera — unwind any accumulated spin
    if (particles.mode !== 'nebula') rig.idle *= Math.pow(0.25, dt);
    particles.group.rotation.y = rig.rotY + rig.idle;
    cortex?.update(dt);

    cam.px += (cam.tx - cam.px) * 0.045;
    cam.py += (cam.ty - cam.py) * 0.045;
    camera.position.set(cam.px, cam.py, cam.baseZ + cam.dolly);
    camera.lookAt(0, 0, -6);

    renderer.render(scene, camera);

    // additive glow over the particle/cortex pass (high-end desktop only). A
    // runtime failure self-disables bloom rather than breaking the frame.
    if (bloom && bloom.enabled) {
      try { bloom.add(scene, camera); }
      catch (err) { console.warn('[swivel] bloom disabled:', err); bloom.enabled = false; }
    }

    // second pass — the product image corridor, layered over the particles
    if (corridor) {
      corridor.update(dt, cam.px, cam.py);
      if (corridor.master > 0.002) {
        renderer.autoClear = false;
        renderer.render(corridor.scene, corridor.camera);
        renderer.autoClear = true;
      }
    }
  }
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  /* occasional "synaptic firing" — brief cortex flares while the idle neural
     field is shown. High-end desktop + motion-safe only; mobile / low-end is
     untouched (fire() is never called, so uFire stays 0 and the shaders are
     a no-op). Reschedules forever so it resumes whenever the field returns. */
  if (SYNAPTIC_FIRING && highEnd && !reducedMotion && cortex && !cortex.empty) {
    const fireOnce = () => {
      if (particles.mode === 'nebula') cortex.fire(0.7 + Math.random() * 0.5);
      gsap.delayedCall(2.4 + Math.random() * 4.0, fireOnce);
    };
    gsap.delayedCall(4 + Math.random() * 2, fireOnce);
  }

  /* loader out → "a neural network boots up and becomes the brand" intro */
  gsap.to(progress, {
    v: 100, duration: 0.4, ease: 'power1.in', overwrite: true, onUpdate: paintProgress,
    onComplete: () => loader?.classList.add('is-done'),
  });

  const bootEl = document.querySelector('.intro__boot');
  const decodeEl = document.querySelector('.intro__decode');
  const lu = particles.lineUniforms;                 // undefined on low-end (no mesh)

  // the readable SWIVEL TECHNOLOGIES is real HTML (.intro__logo) — the WebGL
  // only draws the neural field behind it. reveal = fade the HTML wordmark in
  // and switch on the boot-status line.
  const logoEl = document.querySelector('.intro__logo');
  const revealWordmark = () => {
    logoEl?.classList.add('is-on');
    bootEl?.classList.add('is-on');
  };

  if (hash && hash !== '#intro') {
    // deep link — skip the intro, just fade the stage in
    gsap.to(particles.uniforms.uOpacity, { value: motion.workOpacity, duration: 1.4, ease: 'sine.out', delay: 0.2 });
  } else if (reducedMotion) {
    // simplified, mostly-static: a calm neural field resolves, HTML wordmark in
    particles.setImmediate('nebula');
    if (lu) lu.uLineOpacity.value = 0.2;
    cortexAccent(ACCENTS.nebula, 0);
    cortexOpacity(isMobile ? 0.3 : 0.4, 0);
    cortexEnergy(0.08, 0);
    cortexPulse(isMobile ? 0.08 : 0.1, isMobile ? 0.24 : 0.32, 0);
    particles.uniforms.uBootEnergy.value = 0.08;
    gsap.to(particles.uniforms.uOpacity, { value: 0.58, duration: 1.0, ease: 'sine.out' });
    revealWordmark();
  } else {
    // staged "AI system boot": scattered nodes → wire into a neural network
    // (synapse lines + data pulses prominent) → the HTML wordmark resolves over
    // the top. No giant particle logo — the network stays the background.
    const T = isMobile ? 0.82 : 1;                    // mild speed-up on mobile
    // Stage 1 — nodes fade in and WIRE together into a gently rotating neural net.
    // Tuned to FRAME the wordmark, not bury it: lower opacity / energy than before.
    gsap.to(particles.uniforms.uOpacity, { value: 0.68, duration: 1.4 * T, ease: 'sine.out', delay: 0.15 });
    gsap.to(particles.uniforms.uBootEnergy, { value: 0.78, duration: 1.05 * T, ease: 'sine.out', delay: 0.1 });
    gsap.to(particles.uniforms.uHubGlow, { value: isMobile ? 0.26 : 0.36, duration: 1.2 * T, ease: 'sine.out' });
    cortexAccent(ACCENTS.nebula, 0);
    cortexOpacity(isMobile ? 0.4 : 0.5, 1.25 * T);
    cortexEnergy(0.82, 1.05 * T);
    cortexPulse(isMobile ? 0.4 : 0.6, isMobile ? 0.85 : 1.1, 1.1 * T);
    if (lu) gsap.to(lu.uLineOpacity, { value: 0.46, duration: 1.0 * T, ease: 'sine.out' });
    if (pu) {
      gsap.to(pu.uPulseIntensity, { value: isMobile ? 0.9 : 1.2, duration: 1.1 * T, ease: 'sine.out' });
      gsap.to(pu.uPulseSpeed, { value: isMobile ? 0.36 : 0.58, duration: 1.1 * T, ease: 'sine.out' });
    }
    particles.morphTo('nebula', { duration: 1.9 * T, stagger: 0.4, burst: 0.05 });

    // Stage 2 — the synapses pulse brighter as the engine "comes online"
    gsap.delayedCall(1.6 * T, () => {
      if (lu) gsap.to(lu.uLineOpacity, { value: 0.56, duration: 0.7 * T, ease: 'sine.inOut', yoyo: true, repeat: 1 });
      gsap.to(particles.uniforms.uBootEnergy, { value: 1.0, duration: 0.6 * T, ease: 'sine.inOut', yoyo: true, repeat: 1 });
      if (cortex) gsap.to(cortex.uniforms.uBootEnergy, { value: 1.1, duration: 0.62 * T, ease: 'sine.inOut', yoyo: true, repeat: 1 });
      if (cortex) gsap.to(cortex.uniforms.uPulseIntensity, { value: isMobile ? 1.0 : 1.35, duration: 0.62 * T, ease: 'sine.inOut', yoyo: true, repeat: 1 });
    });

    // Stage 3 — the HTML wordmark resolves
    gsap.delayedCall(1.9 * T, () => {
      revealWordmark();
    });

    // Stage 4 — settle the live mesh to its idle glow
    gsap.delayedCall(3.4 * T, () => {
      if (lu) gsap.to(lu.uLineOpacity, { value: 0.24, duration: 1.1, ease: 'sine.out' });
      if (pu) {
        gsap.to(pu.uPulseIntensity, { value: isMobile ? 0.5 : 0.66, duration: 1.2, ease: 'sine.out' });
        gsap.to(pu.uPulseSpeed, { value: isMobile ? 0.18 : 0.22, duration: 1.2, ease: 'sine.out' });
      }
      gsap.to(particles.uniforms.uBootEnergy, { value: 0.14, duration: 1.35, ease: 'sine.out' });
      gsap.to(particles.uniforms.uHubGlow, { value: isMobile ? 0.16 : 0.24, duration: 1.2, ease: 'sine.out' });
      gsap.to(particles.uniforms.uOpacity, { value: 0.62, duration: 1.35, ease: 'sine.out' });
      cortexOpacity(isMobile ? 0.34 : 0.42, 1.35);
      cortexEnergy(0.16, 1.35);
      cortexPulse(isMobile ? 0.16 : 0.21, isMobile ? 0.5 : 0.66, 1.2);
    });
    // re-assert the wordmark is on (defensive, after the boot settles)
    gsap.delayedCall(isMobile ? 3.4 : 3.8, () => {
      revealWordmark();
    });
  }

  /* WATCHDOG — never leave a fresh visitor staring at a fieldless / wordless
     intro. If, ~3s in, we're still near the top and the HTML wordmark hasn't
     switched on through any of the paths above, force it on. */
  if (!hash || hash === '#intro') {
    gsap.delayedCall(reducedMotion ? 1.4 : 3.0, () => {
      const nearIntro = (window.scrollY || 0) < innerHeight * 0.85;
      if (nearIntro && !logoEl?.classList.contains('is-on')) revealWordmark();
    });
  }
}
