/* WebGL particle stage — GPU points with curl-ish simplex turbulence,
   additive soft sprites, and buffer-morphing between formations
   (logo → nebula now; per-product formations arrive with the scenes).
   Deps (three / gsap / ScrollTrigger / lenis) are vendored locally and
   fall back to CDN. Everything is lazy: the static site never pays. */

import { spawnFormation, logoFormation, nebulaFormation } from './formations.js';

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

const VERT = /* glsl */ `
attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec3 aColFrom;
attribute vec3 aColTo;
attribute vec4 aSeed;
uniform float uTime;
uniform float uMorph;
uniform float uStagger;
uniform float uBurst;
uniform float uOpacity;
uniform float uSize;
uniform float uPixelRatio;
uniform float uTurbAmp;
uniform float uTurbFreq;
uniform float uTurbSpeed;
varying vec3 vColor;
varying float vAlpha;
${NOISE_GLSL}
void main(){
  // per-particle staggered, eased morph progress
  float t = clamp(uMorph * (1.0 + uStagger) - aSeed.w * uStagger, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec3 pos = mix(aFrom, aTo, t);

  // radial explosion mid-transition
  float burst = sin(t * 3.14159265) * uBurst;
  if (burst > 0.001) {
    vec3 dir = normalize(pos + (aSeed.xyz - 0.5) * 4.0 + vec3(0.001));
    pos += dir * burst * (7.0 + aSeed.x * 24.0);
  }

  // simplex turbulence; a few % of particles are wilder "sparks"
  float spark = step(0.965, aSeed.x);
  float amp = uTurbAmp * (0.45 + aSeed.y * 0.9) * (1.0 + spark * 2.6);
  vec3 np = pos * uTurbFreq + vec3(uTime * uTurbSpeed);
  pos += amp * vec3(snoise(np), snoise(np + 31.416), snoise(np - 47.853));

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

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

async function loadDeps() {
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
  if (!window.Lenis) {
    // smooth scroll is a nice-to-have; the stage works without it
    await loadScript('js/vendor/lenis.min.js').catch(() => loadScript(CDN.lenis)).catch(() => {});
  }
  gsap = window.gsap;
  ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
}

/* ---------------- particle system ---------------- */

// idle character of each formation
const PROFILES = {
  spawn: { uTurbAmp: 0.8, uTurbFreq: 0.05, uTurbSpeed: 0.1, uSize: 2.0 },
  logo: { uTurbAmp: 0.5, uTurbFreq: 0.12, uTurbSpeed: 0.22, uSize: 2.3 },
  nebula: { uTurbAmp: 2.7, uTurbFreq: 0.035, uTurbSpeed: 0.05, uSize: 3.5 },
};

class Particles {
  constructor(count) {
    this.count = count;
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
    this._applyProfile(name, 0);
    this.mode = name;
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
    const p = PROFILES[name] || PROFILES.nebula;
    for (const k of ['uTurbAmp', 'uTurbFreq', 'uTurbSpeed', 'uSize']) {
      if (duration > 0) tl.to(this.uniforms[k], { value: p[k], duration, ease: 'sine.inOut' }, 0);
      else this.uniforms[k].value = p[k];
    }
  }
}

/* ---------------- stage ---------------- */

function particleBudget() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let n = (innerWidth * innerHeight) * 0.028;
  if (dpr > 1.5) n *= 0.8;
  if ((navigator.hardwareConcurrency || 8) <= 4) n *= 0.65;
  return Math.round(Math.min(48000, Math.max(12000, n)));
}

export async function initGL(canvas) {
  await loadDeps();

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
  const dpr = Math.min(devicePixelRatio || 1, 2);
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

  const particles = new Particles(particleBudget());
  particles.uniforms.uPixelRatio.value = dpr;
  scene.add(particles.points);

  /* formations */
  particles.formations.spawn = spawnFormation(particles.count);
  particles.formations.nebula = nebulaFormation(particles.count);
  particles.formations.logo = await logoFormation('images/logo.png', particles.count, { width: LOGO_W });
  particles.setImmediate('spawn');
  particles.uniforms.uOpacity.value = 0;

  /* flip the document into immersive layout before wiring scroll */
  history.scrollRestoration = 'manual';
  html.classList.add('gl');
  html.classList.remove('gl-loading');

  /* smooth scroll */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true });
    window.__swivelLenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
  }

  /* scroll choreography */
  const rig = { rotY: 0, idle: 0, idleSpeed: 0.008 };
  const dim = (v, d = 1.4) =>
    gsap.to(particles.uniforms.uOpacity, { value: v, duration: d, ease: 'sine.inOut', overwrite: 'auto' });

  const hintEl = document.getElementById('scrollHint');
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top 70%',
    onEnter: () => {
      hintEl?.classList.remove('is-on');
      particles.morphTo('nebula', { duration: 3.0, stagger: 0.45, burst: 1 });
    },
    onLeaveBack: () => {
      hintEl?.classList.add('is-on');
      particles.morphTo('logo', { duration: 2.2, stagger: 0.35, burst: 0.4 });
    },
  });
  ScrollTrigger.create({
    trigger: '#work', start: 'top 55%',
    onEnter: () => dim(0.34), onLeaveBack: () => dim(1),
  });
  ScrollTrigger.create({
    trigger: '#contact', start: 'top 75%',
    onEnter: () => dim(0.45), onLeaveBack: () => dim(0.34),
  });
  gsap.to(cam, {
    dolly: 26, ease: 'none',
    scrollTrigger: { trigger: '#content', start: 'top top', end: 'bottom bottom', scrub: 1.3 },
  });
  gsap.to(rig, {
    rotY: 1.05, ease: 'none',
    scrollTrigger: { trigger: '#content', start: 'top top', end: 'bottom bottom', scrub: 1.8 },
  });

  /* entry: deep links land formed; a fresh visit gets the intro */
  const hash = location.hash && document.querySelector(location.hash) ? location.hash : null;
  if (hash && hash !== '#intro') {
    particles.setImmediate('nebula');
    particles.uniforms.uOpacity.value = 0.34;
  } else {
    window.scrollTo(0, 0);
  }

  ScrollTrigger.refresh();
  if (hash && hash !== '#intro') {
    (lenis ? lenis.scrollTo(hash, { immediate: true }) : document.querySelector(hash).scrollIntoView());
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
      const d = Math.min(devicePixelRatio || 1, 2);
      renderer.setPixelRatio(d);
      renderer.setSize(innerWidth, innerHeight, false);
      particles.uniforms.uPixelRatio.value = d;
      fitCamera();
    }, 120);
  });

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    gsap.ticker.remove(tick);
    html.classList.remove('gl');
    html.classList.add('no-gl');
  });

  /* render loop — gsap.ticker is a single shared rAF */
  function tick(time, deltaMS) {
    if (lenis) lenis.raf(time * 1000);
    if (document.hidden) return;
    const dt = Math.min(deltaMS / 1000, 0.05);

    particles.uniforms.uTime.value += dt;
    rig.idleSpeed += ((particles.mode === 'nebula' ? 0.045 : 0) - rig.idleSpeed) * 0.02;
    rig.idle += dt * rig.idleSpeed;
    // the logo must face the camera — unwind any accumulated spin
    if (particles.mode !== 'nebula') rig.idle *= Math.pow(0.25, dt);
    particles.points.rotation.y = rig.rotY + rig.idle;

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
    value: hash && hash !== '#intro' ? 0.34 : 1,
    duration: 1.6, ease: 'sine.out', delay: 0.3,
  });
  if (!hash || hash === '#intro') {
    particles.morphTo('logo', { duration: 3.4, stagger: 0.55 });
    const hint = document.getElementById('scrollHint');
    gsap.delayedCall(2.8, () => hint?.classList.add('is-on'));
  }
}
