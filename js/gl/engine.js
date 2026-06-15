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
attribute vec4 aSeed;
uniform float uOpacity;
uniform float uSize;
uniform float uPixelRatio;
varying vec3 vColor;
varying float vAlpha;
void main(){
  float t = morphProg(aSeed.w);
  vec3 pos = particlePos(aFrom, aTo, aSeed);
  float burst = sin(t * 3.14159265) * uBurst;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float spark = step(0.965, aSeed.x);
  float ps = uSize * mix(0.5, 1.7, aSeed.z) * (1.0 + spark * 0.9)
           * uPixelRatio * (100.0 / max(1.0, -mv.z));
  ps *= 1.0 + burst * 0.15;
  gl_PointSize = clamp(ps, 1.0, 40.0 * uPixelRatio);

  float twinkle = 0.72 + 0.28 * sin(uTime * (1.2 + aSeed.y * 2.6) + aSeed.x * 6.28318);
  vAlpha = uOpacity * twinkle * smoothstep(0.0, 1.0, ps);
  vColor = mix(aColFrom, aColTo, t) * (1.0 + spark * 0.6 + burst * 0.3);
}`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv) * 2.0;
  if (d > 1.0) discard;
  float core = smoothstep(1.0, 0.0, d);
  float a = core * core * (0.55 + 0.45 * core);
  gl_FragColor = vec4(vColor * (1.0 + core * 0.7), a * vAlpha);
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
varying float vAlpha;
void main(){
  gl_FragColor = vec4(uLineColor, vAlpha * uLineOpacity);
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
varying float vAlpha;
void main(){
  vec3 pa = particlePos(aFromA, aToA, aSeedA);
  vec3 pb = particlePos(aFromB, aToB, aSeedB);
  float tt = fract(uTime * 0.16 + aPhase);
  vec3 pos = mix(pa, pb, tt);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float ps = uSize * 2.3 * uPixelRatio * (100.0 / max(1.0, -mv.z));
  gl_PointSize = clamp(ps, 1.5, 26.0 * uPixelRatio);
  float life = sin(tt * 3.14159265);                  // fade in/out at the nodes
  vAlpha = uOpacity * uMeshFade * (0.2 + 0.8 * life);
}`;

const PULSE_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uPulseColor;
varying float vAlpha;
void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv) * 2.0;
  if (d > 1.0) discard;
  float core = smoothstep(1.0, 0.0, d);
  gl_FragColor = vec4(uPulseColor * (0.6 + core), core * core * vAlpha);
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
  spawn: { uTurbAmp: 0.55, uTurbFreq: 0.05, uTurbSpeed: 0.09, uSize: 2.0 },
  logo: { uTurbAmp: 0.32, uTurbFreq: 0.12, uTurbSpeed: 0.18, uSize: 2.3 },
  nebula: { uTurbAmp: 1.0, uTurbFreq: 0.04, uTurbSpeed: 0.04, uSize: 3.1 },
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
  nebula: 0x4aa8ff,
  'good-one': 0x38bdf8,
  'swico-ai': 0x818cf8,
  'grab-basket': 0xc084fc,
  manas: 0x2dd4bf,
  'ai-business-assistant': 0x34d399,
  'defect-detector': 0xf76d6d,
};

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
      uOpacity: u.uOpacity, uMeshFade: u.uMeshFade,
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
      uPulseColor: { value: new THREE.Color(0xdbe7ff) },
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

  /* point the mesh at the active formation: swap the line index to its edge
     set, retint to its accent, and re-seat the pulses onto those edges */
  _applyMesh(name) {
    if (!this.lines) return;
    const accent = this.accents[name] || this.accents.nebula;
    if (accent) this.lineUniforms.uLineColor.value.copy(accent);
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
    this.uniforms.uMorph.value = 1;
    this.uniforms.uMeshFade.value = 1;
    this._applyProfile(name, 0);
    this.mode = name;
    this._applyMesh(name);
  }

  /* freeze the in-flight interpolation into aFrom so a new morph can
     start from exactly what is on screen */
  bake() {
    const { aFrom, aTo, aColFrom, aColTo, aSeed } = this.geo.attributes;
    const m = this.uniforms.uMorph.value;
    const st = this.uniforms.uStagger.value;
    const from = aFrom.array, to = aTo.array;
    const cf = aColFrom.array, ct = aColTo.array, sd = aSeed.array;
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
    }
    aFrom.needsUpdate = true;
    aColFrom.needsUpdate = true;
  }

  morphTo(name, { duration = 2.6, stagger = 0.42, burst = 0 } = {}) {
    const f = this.formations[name];
    if (!f || (this.mode === name && !this._tl?.isActive())) return;
    this._tl?.kill();

    this.bake();
    this.geo.attributes.aTo.array.set(f.positions);
    this.geo.attributes.aColTo.array.set(f.colors);
    this.geo.attributes.aTo.needsUpdate = true;
    this.geo.attributes.aColTo.needsUpdate = true;

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

/* ---------------- stage ---------------- */

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function renderPixelRatio(isMobile) {
  const raw = devicePixelRatio || 1;
  if (!isMobile) return Math.min(raw, 2);

  const cores = navigator.hardwareConcurrency || 6;
  const memory = navigator.deviceMemory || 4;
  const cap = cores <= 4 || memory <= 3 ? 1.25 : 1.5;
  return Math.min(raw, cap);
}

function particleBudget({ mobile = false } = {}) {
  if (mobile) {
    const area = innerWidth * innerHeight;
    const cores = navigator.hardwareConcurrency || 6;
    const memory = navigator.deviceMemory || 4;
    let maxBudget = 9000;
    if (cores <= 4) maxBudget = 6500;
    if (memory <= 3) maxBudget = Math.min(maxBudget, 5500);
    if (memory <= 2) maxBudget = Math.min(maxBudget, 4200);

    let n = area * 0.016;
    if ((devicePixelRatio || 1) > 1.5) n *= 0.85;
    if (cores <= 4) n *= 0.78;
    if (memory <= 4) n *= 0.88;
    if (memory <= 2) n *= 0.78;
    return Math.round(clamp(n, 3500, maxBudget));
  }

  const dpr = Math.min(devicePixelRatio || 1, 2);
  let n = (innerWidth * innerHeight) * 0.028;
  if (dpr > 1.5) n *= 0.8;
  if ((navigator.hardwareConcurrency || 8) <= 4) n *= 0.65;
  return Math.round(Math.min(48000, Math.max(12000, n)));
}

/* network-mesh budget — capped hard, and scaled down / skipped on weaker
   devices so the line layer and pulses never tank the framerate. */
function meshBudget({ mobile = false, reducedMotion = false } = {}) {
  const cores = navigator.hardwareConcurrency || (mobile ? 6 : 8);
  const memory = navigator.deviceMemory || 4;
  if (mobile) {
    if (cores <= 4 || memory <= 3) return { nodes: 0, k: 0, maxSegments: 0, pulses: 0, lineOpacity: 0 };
    return { nodes: 300, k: 2, maxSegments: 640, pulses: reducedMotion ? 0 : 14, lineOpacity: 0.3 };
  }
  if (cores <= 4 || memory <= 4) {
    return { nodes: 520, k: 3, maxSegments: 1200, pulses: reducedMotion ? 0 : 28, lineOpacity: 0.34 };
  }
  return { nodes: 820, k: 3, maxSegments: 2000, pulses: reducedMotion ? 0 : 46, lineOpacity: 0.36 };
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
  const mesh = meshBudget({ mobile: isMobile, reducedMotion });
  const particles = new Particles(particleBudget({ mobile: isMobile }), {
    mobile: isMobile, mesh, reducedMotion,
  });
  particles.uniforms.uPixelRatio.value = dpr;
  scene.add(particles.group);

  // mesh tints mirror the per-scene CSS accents
  for (const [name, hex] of Object.entries(ACCENTS)) particles.accents[name] = new THREE.Color(hex);

  /* formations */
  particles.formations.spawn = spawnFormation(particles.count);
  particles.formations.nebula = nebulaFormation(particles.count);
  // per-product shapes — cheap CPU arrays, keyed to the section ids
  particles.formations['good-one'] = goodOneFormation(particles.count);
  particles.formations['swico-ai'] = swicoFormation(particles.count);
  particles.formations['grab-basket'] = grabBasketFormation(particles.count);
  particles.formations['manas'] = manasFormation(particles.count);
  particles.formations['ai-business-assistant'] = aiAssistantFormation(particles.count);
  particles.formations['defect-detector'] = defectFormation(particles.count);
  particles.formations.logo = await logoFormation('images/logo.png', particles.count, { width: LOGO_W });

  // precompute a nearest-neighbour network for the nebula + each product so the
  // mesh roughly follows the active shape (logo/spawn stay a clean wordmark)
  if (mesh.nodes > 0) {
    for (const name of ['nebula', 'good-one', 'swico-ai', 'grab-basket', 'manas', 'ai-business-assistant', 'defect-detector']) {
      particles.setEdges(name, buildEdges(particles.formations[name].positions, particles.count, mesh));
    }
  }

  particles.setImmediate('spawn');
  particles.uniforms.uOpacity.value = 0;

  /* flip the document into immersive layout before wiring scroll */
  history.scrollRestoration = 'manual';
  html.classList.add('gl');
  html.classList.toggle('gl-mobile', isMobile);
  html.classList.remove('gl-loading');

  let lenis = null;
  let refreshFrame = 0;
  const sceneFitQuery = matchMedia('(max-width: 1060px), (max-height: 720px), (hover: none), (pointer: coarse)');

  function getHashTarget(hash) {
    if (!hash || hash === '#') return null;
    let id = hash.startsWith('#') ? hash.slice(1) : hash;
    try { id = decodeURIComponent(id); } catch {}
    return document.getElementById(id);
  }

  function updateSceneStickiness() {
    const viewportH = window.visualViewport?.height || innerHeight;
    document.querySelectorAll('.scene').forEach((sceneEl) => {
      const hold = sceneEl.querySelector('.scene__hold');
      if (!hold || sceneEl.classList.contains('scene--contact')) return;
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
        heroBurst: 0.16,
        logoMorph: 1.9,
        logoBurst: 0.08,
        introMorph: 2.5,
        introStagger: 0.42,
        workOpacity: 0.42,
        contactOpacity: 0.4,
        dolly: 14,
        rotY: 0.58,
        scrub: 0.75,
        idleNebula: 0.02,
      }
    : {
        heroMorph: 3.1,
        heroBurst: 0.32,
        logoMorph: 2.3,
        logoBurst: 0.18,
        introMorph: 3.4,
        introStagger: 0.6,
        workOpacity: 0.42,
        contactOpacity: 0.45,
        dolly: 26,
        rotY: 1.05,
        scrub: 1.3,
        idleNebula: 0.035,
      };
  const rig = { rotY: 0, idle: 0, idleSpeed: isMobile ? 0.004 : 0.008 };
  const dim = (v, d = 1.4) =>
    gsap.to(particles.uniforms.uOpacity, { value: v, duration: d, ease: 'sine.inOut', overwrite: 'auto' });

  const hintEl = document.getElementById('scrollHint');
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top 70%',
    onEnter: () => {
      hintEl?.classList.remove('is-on');
      particles.morphTo('nebula', { duration: motion.heroMorph, stagger: isMobile ? 0.34 : 0.45, burst: motion.heroBurst });
    },
    onLeaveBack: () => {
      hintEl?.classList.add('is-on');
      particles.morphTo('logo', { duration: motion.logoMorph, stagger: isMobile ? 0.28 : 0.35, burst: motion.logoBurst });
    },
  });
  // dim the stage across the whole product run; restore to full above it
  ScrollTrigger.create({
    trigger: '#work', start: 'top 55%',
    onEnter: () => dim(motion.workOpacity), onLeaveBack: () => dim(1),
  });

  /* per-product shape morphs — as each product scrolls into view the cloud
     dissolves and re-forms into its shape. bake() makes every morph start
     from whatever is on screen, so the first goes nebula→shape and the rest
     go shape→shape. burst is kept gentle so transitions read, not thrash. */
  const PRODUCTS = ['good-one', 'swico-ai', 'grab-basket', 'manas', 'ai-business-assistant', 'defect-detector'];
  const productDur = motion.heroMorph * 0.82;
  const productStagger = isMobile ? 0.46 : 0.6;     // higher stagger = a wave sweeps through
  const productBurst = isMobile ? 0.14 : 0.26;
  const toNebula = (burst) =>
    particles.morphTo('nebula', { duration: productDur, stagger: productStagger, burst });

  PRODUCTS.forEach((id, idx) => {
    const morph = () => particles.morphTo(id, { duration: productDur, stagger: productStagger, burst: productBurst });
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
    onEnter: () => toNebula(productBurst * 0.5),
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
  } else {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    lenis?.scrollTo?.(0, { immediate: true, force: true });
  }

  refreshScroll(true);
  scheduleSettledRefreshes();
  if (hash && hash !== '#intro') {
    requestAnimationFrame(() => {
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
      fitCamera();
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
    if (window.__swivelLenis === lenis) delete window.__swivelLenis;
    html.classList.remove('gl', 'gl-mobile');
    html.classList.add('no-gl');
  });

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

    particles.uniforms.uTime.value += dt;
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
  }
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  /* loader out, intro in */
  gsap.to(progress, {
    v: 100, duration: 0.4, ease: 'power1.in', overwrite: true, onUpdate: paintProgress,
    onComplete: () => loader?.classList.add('is-done'),
  });

  gsap.to(particles.uniforms.uOpacity, {
    value: hash && hash !== '#intro' ? motion.workOpacity : 1,
    duration: 1.6, ease: 'sine.out', delay: 0.3,
  });
  if (!hash || hash === '#intro') {
    particles.morphTo('logo', { duration: motion.introMorph, stagger: motion.introStagger });
    const hint = document.getElementById('scrollHint');
    gsap.delayedCall(isMobile ? 2.0 : 2.8, () => hint?.classList.add('is-on'));
  }
}
