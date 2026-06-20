/* WebGL particle stage — GPU points with curl-ish simplex turbulence,
   additive soft sprites, and buffer-morphing between formations
   (logo → nebula now; per-product formations arrive with the scenes).
   Deps (three / gsap / ScrollTrigger / lenis) are vendored locally and
   fall back to CDN. Everything is lazy: the static site never pays. */

import {
  spawnFormation, logoFormation, nebulaFormation,
  goodOneFormation, swicoFormation, grabBasketFormation,
  manasFormation, aiAssistantFormation, defectFormation,
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
   simplex turbulence. The points layer is the only consumer now (all line /
   pulse / cortex layers were removed — communication is shown by firing). */
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
uniform float uMaxPoint;          // hard cap on point size (px, pre-DPR)
uniform vec3 uFireOrigins[6];     // firing-wave centres (object space)
uniform vec2 uFireWaves[6];       // x = shell radius, y = intensity
uniform float uFireWidth;         // shell falloff width² (scaled to field size)
uniform float uFireGain;          // global firing ramp (0 during boot → 1)
varying vec3 vColor;
varying float vAlpha;
varying float vHub;
varying float vDepth;
void main(){
  float t = morphProg(aSeed.w);
  vec3 pos = particlePos(aFrom, aTo, aSeed);
  float burst = sin(t * 3.14159265) * uBurst;
  float sizeMul = mix(aSizeFrom, aSizeTo, t);
  float hub = smoothstep(1.42, 3.2, sizeMul);
  float hubPulse = 1.0 + hub * (0.12 + uBootEnergy * 0.26)
    * (0.5 + 0.5 * sin(uTime * (1.6 + aSeed.y * 0.7) + aSeed.x * 6.28318));

  // FIRING: expanding activation shells ripple THROUGH the points — this is the
  // only "communication" in the field (no lines anywhere). Each wave is a thin
  // gaussian shell at radius uFireWaves[k].x from its origin; act peaks as the
  // shell front sweeps past this particle. uFireWidth is scaled to the field so
  // the shell stays ~1–2 particle-spacings thick at any size.
  float act = 0.0;
  for (int k = 0; k < 6; k++) {
    float s = distance(pos, uFireOrigins[k]) - uFireWaves[k].x;
    act += uFireWaves[k].y * exp(-(s * s) / uFireWidth);
  }
  act = clamp(act * uFireGain, 0.0, 1.5);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  vDepth = -mv.z;

  float spark = step(0.965, aSeed.x);
  float ps = uSize * mix(0.5, 1.7, aSeed.z) * (1.0 + spark * 0.9)
           * uPixelRatio * (100.0 / max(1.0, -mv.z));
  ps *= sizeMul * hubPulse * (1.0 + burst * 0.15);
  ps *= 1.0 + act * 2.0;                              // firing swells the neuron
  gl_PointSize = clamp(ps, 1.0, uMaxPoint * uPixelRatio);

  float twinkle = 0.82 + 0.18 * sin(uTime * (1.2 + aSeed.y * 2.6) + aSeed.x * 6.28318);
  vHub = hub;
  vAlpha = uOpacity * twinkle * smoothstep(0.0, 1.0, ps)
         * (1.0 + hub * (0.34 + uBootEnergy * 0.3))
         * (1.0 + act * 1.4);                         // firing lifts alpha
  vec3 base = mix(aColFrom, aColTo, t)
            * (1.0 + spark * 0.35 + burst * 0.2 + hub * (uHubGlow * 0.35 + uBootEnergy * 0.22));
  vec3 hot = vec3(0.70, 0.96, 1.0);                   // cyan-white firing colour
  vColor = mix(base, hot, clamp(act, 0.0, 1.0)) * (1.0 + act * 0.6);
}`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vAlpha;
varying float vHub;
varying float vDepth;
uniform float uDepthNear;
uniform float uDepthFar;
void main(){
  // soft ROUND sprite — radial alpha falloff so each neuron is a soft dot
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv) * 2.0;
  if (d > 1.0) discard;
  float core = smoothstep(1.0, 0.0, d);
  // depth-dim distant points for real depth (nearer = brighter)
  float depthDim = clamp((uDepthFar - vDepth) / (uDepthFar - uDepthNear), 0.4, 1.0);
  gl_FragColor = vec4(vColor * (0.9 + core * 0.4), core * core * vAlpha * depthDim);
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
  // the neural FIELD: very low turbulence so the broad field holds its shape and
  // clustering (the life comes from the firing waves, not from billowing)
  nebula: { uTurbAmp: 0.1, uTurbFreq: 0.05, uTurbSpeed: 0.03, uSize: 2.4 },
  // per-product idle character — low amp keeps the detailed shapes legible
  'good-one': { uTurbAmp: 0.42, uTurbFreq: 0.08, uTurbSpeed: 0.11, uSize: 2.6 },
  'swico-ai': { uTurbAmp: 0.58, uTurbFreq: 0.07, uTurbSpeed: 0.13, uSize: 2.9 },
  'grab-basket': { uTurbAmp: 0.44, uTurbFreq: 0.09, uTurbSpeed: 0.12, uSize: 2.7 },
  manas: { uTurbAmp: 0.32, uTurbFreq: 0.05, uTurbSpeed: 0.06, uSize: 2.8 },        // calm
  'ai-business-assistant': { uTurbAmp: 0.48, uTurbFreq: 0.07, uTurbSpeed: 0.12, uSize: 2.5 },
  'defect-detector': { uTurbAmp: 0.4, uTurbFreq: 0.1, uTurbSpeed: 0.16, uSize: 2.4 },
};

const PRODUCT_IDS = CORRIDOR_PRODUCTS.map((product) => product.id);

class Particles {
  constructor(count, { mobile = false, reducedMotion = false } = {}) {
    this.count = count;
    this.mobile = mobile;
    this.reducedMotion = reducedMotion;
    this.formations = {};
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

    // firing waves: 6 expanding activation shells. The uniforms hold their live
    // origins (object space) + (radius, intensity); the JS driver advances them.
    const fireOrigins = [];
    const fireWaves = [];
    for (let k = 0; k < 6; k++) { fireOrigins.push(new THREE.Vector3()); fireWaves.push(new THREE.Vector2(0, 0)); }

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
      uBootEnergy: { value: 0 },
      uHubGlow: { value: mobile ? 0.18 : 0.28 },
      uMaxPoint: { value: mobile ? 26 : 30 },           // cap so close firing never blows out
      uFireOrigins: { value: fireOrigins },
      uFireWaves: { value: fireWaves },
      uFireWidth: { value: 6 },                          // shell falloff width² (set per formation)
      uFireGain: { value: 0 },                           // global firing ramp (0 during boot)
      uDepthNear: { value: 28 },
      uDepthFar: { value: 96 },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      // the field lives on a dark hero stage: firing is GLOW, glow needs additive
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.geo = geo;

    // the points ride in one group so they share the scroll rotation + camera dolly
    this.group = new THREE.Group();
    this.group.add(this.points);

    // firing-wave driver state (origins are written straight into the uniforms)
    this.fire = {
      origins: fireOrigins,
      waves: Array.from({ length: 6 }, () => ({ r: 0, max: 1, speed: 1 })),
      src: null, srcCount: 0, extent: 20,
    };
  }

  _sizes(name) {
    const s = this.formations[name]?.sizes;
    if (s && s.length === this.count) return s;
    if (!this._defaultSizes) {
      this._defaultSizes = new Float32Array(this.count);
      this._defaultSizes.fill(1);
    }
    return this._defaultSizes;
  }

  /* point the firing driver at the active formation: sample wave origins from its
     leading CORE slice (meta.coreCount) and scale the shell + wave radius to its
     extent so signals sweep ACROSS the whole shape. */
  _setFireForActive(name) {
    const f = this.formations[name];
    if (!f) return;
    if (f._extent == null) {
      let m = 1; const p = f.positions;
      for (let i = 0; i < p.length; i += 3) {
        const r2 = p[i] * p[i] + p[i + 1] * p[i + 1] + p[i + 2] * p[i + 2];
        if (r2 > m) m = r2;
      }
      f._extent = Math.sqrt(m);
    }
    const extent = (f.meta && f.meta.extent) || f._extent;
    const coreCount = (f.meta && f.meta.coreCount) || this.count;
    this.fire.src = f.positions;
    this.fire.srcCount = Math.max(1, coreCount);
    this.fire.extent = extent;
    // shell ~1–2 particle-spacings thick, derived from the field size (not hardcoded)
    const w = extent * 0.06;
    this.uniforms.uFireWidth.value = Math.max(0.6, w * w);
    for (let k = 0; k < 6; k++) this._spawnWave(k, k / 6);   // staggered start radii
  }

  _spawnWave(k, startFrac) {
    const f = this.fire, w = f.waves[k];
    const i = (Math.random() * f.srcCount) | 0;
    const o = f.origins[k];
    if (f.src) o.set(f.src[i * 3], f.src[i * 3 + 1], f.src[i * 3 + 2]);
    else o.set(0, 0, 0);
    w.max = f.extent * (1.7 + Math.random() * 0.6);      // ~2× extent → sweeps across
    w.speed = f.extent * (0.42 + Math.random() * 0.3);    // units / second
    w.r = startFrac * w.max;
    this.uniforms.uFireWaves.value[k].set(w.r, 0);
  }

  /* advance the firing waves; each expands 0 → ~2× extent, intensity attacks then
     fades as it grows, and respawns at a new core vertex on completion. */
  updateFiring(dt) {
    if (this.reducedMotion) return;
    for (let k = 0; k < 6; k++) {
      const w = this.fire.waves[k];
      w.r += w.speed * dt;
      if (w.r >= w.max || !this.fire.src) this._spawnWave(k, 0);
      const ph = w.r / w.max;
      const inten = Math.pow(1 - ph, 1.3) * Math.min(1, ph / 0.12);
      this.uniforms.uFireWaves.value[k].set(w.r, inten);
    }
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
    this._applyProfile(name, 0);
    this.mode = name;
    this._setFireForActive(name);
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
    this._setFireForActive(name);                // re-seat firing on the target shape

    this._tl = gsap.timeline();
    this._tl.to(this.uniforms.uMorph, { value: 1, duration, ease: 'power2.inOut' }, 0);
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

/* ---------------- additive bloom (desktop / high-end only) ----------------
   A compact, self-contained glow pass — no external post-processing addon, so
   the local-vendor / CDN three-module contract stays intact. The particle scene
   is re-rendered into a half-res target, bright areas are extracted and
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

/* Bloom is OFF by default. The firing waves already supply the glow; an extra
   full-scene bloom pass smeared the field into a haze. To trial a SUBTLE bloom
   later, set BLOOM_ENABLED = true and keep it gentle — a faint rim glow on the
   brightest firing crests, never a wash. */
const BLOOM_ENABLED = false;
const BLOOM_PARAMS = { strength: 0.25, threshold: 0.7, knee: 0.3, scale: 0.4 };

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
  const particles = new Particles(particleBudget({ mobile: isMobile }), {
    mobile: isMobile, reducedMotion,
  });
  particles.uniforms.uPixelRatio.value = dpr;
  scene.add(particles.group);

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

  particles.setImmediate('spawn');
  particles.uniforms.uOpacity.value = 0;

  /* flip the document into immersive layout before wiring scroll */
  history.scrollRestoration = 'manual';
  html.classList.add('gl');
  html.classList.toggle('gl-mobile', isMobile);
  html.classList.remove('gl-loading');
  // the hero/intro open on the DARK stage (toggled off when the light page scrolls up)
  html.classList.add('is-hero-dark');
  applyProductScreenCounts();

  let lenis = null;
  let refreshFrame = 0;
  const sceneFitQuery = matchMedia('(max-width: 1180px), (max-height: 780px), (hover: none), (pointer: coarse)');

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
  // global firing ramp — full while the field is the hero, eased down over the
  // product run so the faint additive points never fizz behind the screenshots.
  const fireGain = (value, duration = 1.2) =>
    gsap.to(particles.uniforms.uFireGain, { value, duration, ease: 'sine.inOut', overwrite: 'auto' });

  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top 70%',
    onEnter: () => {
      fireGain(1.0);
      particles.morphTo('nebula', { duration: motion.heroMorph, stagger: isMobile ? 0.34 : 0.45, burst: motion.heroBurst });
    },
    onLeaveBack: () => {
      // scrolling back up keeps the broad neural field — the readable SWIVEL
      // TECHNOLOGIES is HTML over the top
      fireGain(1.0);
      particles.morphTo('nebula', { duration: motion.heroMorph, stagger: isMobile ? 0.3 : 0.4, burst: motion.heroBurst });
    },
  });
  // DARK HERO STAGE: on while the intro/hero are in view, off once the light
  // product page scrolls up. The CSS fades .hero-stage + reskins the chrome.
  ScrollTrigger.create({
    trigger: '#work', start: 'top 72%',
    onEnter: () => html.classList.remove('is-hero-dark'),
    onLeaveBack: () => html.classList.add('is-hero-dark'),
  });
  // dim the stage across the whole product run; restore to full above it
  ScrollTrigger.create({
    trigger: '#work', start: 'top 55%',
    onEnter: () => {
      dim(motion.workOpacity);
      fireGain(isMobile ? 0.4 : 0.55);
    },
    onLeaveBack: () => {
      dim(isMobile ? 0.56 : 0.62);
      fireGain(1.0);
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

  // after the products, the narrative scenes settle back into the neural field
  ScrollTrigger.create({
    trigger: '#about', start: 'top 64%',
    onEnter: () => {
      toNebula(productBurst * 0.5);
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
    // deep links below the hero open on the LIGHT page (hero deep-link stays dark)
    if (id !== 'hero') html.classList.remove('is-hero-dark');
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
      if (p) particles.uniforms.uBootEnergy.value = p.energy;
      particles.uniforms.uFireGain.value = isMobile ? 0.4 : 0.55;   // calmer firing over the light page
    } else {
      particles.uniforms.uFireGain.value = 0.85;
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
      bloom?.setSize(innerWidth, innerHeight, d);
      fitCamera();
      corridor?.resize(innerWidth, innerHeight);
      anchorToCard();
      queueRefresh(true);
    }, 120);
  });
  window.visualViewport?.addEventListener('resize', () => queueRefresh(true), { passive: true });
  window.visualViewport?.addEventListener('scroll', () => queueRefresh(true), { passive: true });
  if (sceneFitQuery.addEventListener) sceneFitQuery.addEventListener('change', () => queueRefresh(true));
  else sceneFitQuery.addListener?.(() => queueRefresh(true));

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    gsap.ticker.remove(tick);
    try { lenis?.destroy?.(); } catch {}
    try { corridor?.dispose(); } catch {}
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
    gsap.to(u.uOpacity, { value: u.uOpacity.value * 0.86, duration: 0.8, overwrite: 'auto' });
    gsap.to(u.uHubGlow, { value: u.uHubGlow.value * 0.72, duration: 0.8, overwrite: 'auto' });
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
    particles.updateFiring(dt);                       // advance the firing waves
    rig.idleSpeed += ((particles.mode === 'nebula' ? motion.idleNebula : 0) - rig.idleSpeed) * 0.02;
    rig.idle += dt * rig.idleSpeed;
    // the logo must face the camera — unwind any accumulated spin
    if (particles.mode !== 'nebula') rig.idle *= Math.pow(0.25, dt);
    particles.group.rotation.y = rig.rotY + rig.idle;

    cam.px += (cam.tx - cam.px) * 0.045;
    cam.py += (cam.ty - cam.py) * 0.045;
    camera.position.set(cam.px, cam.py, cam.baseZ + cam.dolly);
    camera.lookAt(0, 0, -6);

    renderer.render(scene, camera);

    // additive glow over the particle pass (high-end desktop only). A
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

  /* loader out → "a neural network boots up and becomes the brand" intro */
  gsap.to(progress, {
    v: 100, duration: 0.4, ease: 'power1.in', overwrite: true, onUpdate: paintProgress,
    onComplete: () => loader?.classList.add('is-done'),
  });

  const bootEl = document.querySelector('.intro__boot');

  // the readable SWIVEL TECHNOLOGIES is real HTML (.intro__logo) — the WebGL
  // only draws the neural field behind it. reveal = fade the HTML wordmark in
  // and switch on the boot-status line.
  const logoEl = document.querySelector('.intro__logo');
  const revealWordmark = () => {
    logoEl?.classList.add('is-on');
    bootEl?.classList.add('is-on');
  };

  if (hash && hash !== '#intro') {
    // deep link — skip the intro, just fade the stage in (uFireGain set above)
    gsap.to(particles.uniforms.uOpacity, { value: motion.workOpacity, duration: 1.4, ease: 'sine.out', delay: 0.2 });
  } else if (reducedMotion) {
    // simplified, mostly-static: the neural field resolves + HTML wordmark in.
    // Firing stays OFF under reduced motion (updateFiring is a no-op, uFireGain 0).
    particles.setImmediate('nebula');
    particles.uniforms.uBootEnergy.value = 0.08;
    gsap.to(particles.uniforms.uOpacity, { value: 0.58, duration: 1.0, ease: 'sine.out' });
    revealWordmark();
  } else {
    // staged boot: scattered nodes fade in and gather into the broad neural field,
    // then the firing waves RAMP IN as it settles and the HTML wordmark resolves.
    const T = isMobile ? 0.82 : 1;                    // mild speed-up on mobile
    // Stage 1 — nodes fade in and gather. Tuned to FRAME the wordmark, not bury it.
    gsap.to(particles.uniforms.uOpacity, { value: 0.68, duration: 1.4 * T, ease: 'sine.out', delay: 0.15 });
    gsap.to(particles.uniforms.uBootEnergy, { value: 0.78, duration: 1.05 * T, ease: 'sine.out', delay: 0.1 });
    gsap.to(particles.uniforms.uHubGlow, { value: isMobile ? 0.26 : 0.36, duration: 1.2 * T, ease: 'sine.out' });
    particles.morphTo('nebula', { duration: 1.9 * T, stagger: 0.4, burst: 0.05 });

    // Stage 2 — a brief surge of energy as the field "comes online"
    gsap.delayedCall(1.6 * T, () => {
      gsap.to(particles.uniforms.uBootEnergy, { value: 1.0, duration: 0.6 * T, ease: 'sine.inOut', yoyo: true, repeat: 1 });
    });

    // Stage 3 — the HTML wordmark resolves
    gsap.delayedCall(1.9 * T, () => {
      revealWordmark();
    });

    // Stage 4 — settle to the idle field and ramp the firing waves in
    gsap.delayedCall(3.4 * T, () => {
      gsap.to(particles.uniforms.uBootEnergy, { value: 0.14, duration: 1.35, ease: 'sine.out' });
      gsap.to(particles.uniforms.uHubGlow, { value: isMobile ? 0.16 : 0.24, duration: 1.2, ease: 'sine.out' });
      gsap.to(particles.uniforms.uOpacity, { value: 0.62, duration: 1.35, ease: 'sine.out' });
      gsap.to(particles.uniforms.uFireGain, { value: 1.0, duration: 1.8, ease: 'sine.out' });
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
