import { useEffect, useRef } from "react";

const imgs = {
  welcome: "src/assets/images/goodone/6.png",
  home: "src/assets/images/goodone/1.png",
  browse: "src/assets//images/goodone/7.png",
  createAccount: "src/assets/images/goodone/2.png",
  signupFlow: "/mnt/user-data/uploads/Screenshot_2026-06-15_at_1_18_33_am.png",
  addListing: "src/assets/images/goodone/8.png",
  dashboard: "src/assets/images/goodone/5.png",
  chat: "src/assets/images/goodone/4.png",
  vendorProfile: "src/assets/images/goodone/3.png",
  becomeVendor: "/mnt/user-data/uploads/Screenshot_2026-06-15_at_1_19_24_am.png",
  admin: "/mnt/user-data/uploads/Screenshot_2026-06-15_at_1_19_41_am.png",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

  :root {
    --orange: #E8450A;
    --orange-light: #FF5722;
    --orange-glow: rgba(232,69,10,0.12);
    --orange-soft: rgba(232,69,10,0.06);
    --dark: #0F0D0B;
    --mid: #3D3530;
    --muted: #8B7B74;
    --bg: #FAFAF8;
    --white: #FFFFFF;
    --border: rgba(232,69,10,0.12);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    color: var(--dark);
    overflow-x: hidden;
  }

  /* HERO */
  .gn-hero {
    min-height: 100vh;
    background: linear-gradient(160deg,#1A0F0A 0%,#2D1208 40%,#3A1800 70%,#1A0F0A 100%);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 10px 24px 60px; position: relative; overflow: hidden;
  }
  .gn-hero::before {
    content:''; position:absolute; inset:0;
    background: radial-gradient(ellipse 70% 60% at 50% 40%,rgba(232,69,10,.25) 0%,transparent 70%);
    pointer-events:none;
  }
  .gn-hero-badge {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(232,69,10,.2); border:1px solid rgba(232,69,10,.4);
    color:#FF8A65; padding:6px 16px; border-radius:100px;
    font-size:13px; font-weight:500; letter-spacing:.04em; text-transform:uppercase;
    margin-bottom:32px; animation:gnFadeUp 0.8s ease both;
  }
  .gn-dot {
    width:6px; height:6px; background:#FF5722; border-radius:50%;
    animation:gnPulse 2s ease infinite;
  }
  .gn-hero h1 {
    font-family:'Syne',sans-serif; font-weight:800;
    font-size:clamp(48px,8vw,96px); line-height:1.0; letter-spacing:-0.04em;
    color:#fff; margin-bottom:24px; animation:gnFadeUp 0.8s 0.1s ease both;
  }
  .gn-hero h1 em { font-style:normal; color:var(--orange-light); }
  .gn-hero p {
    font-size:clamp(16px,2vw,20px); color:rgba(255,255,255,.6);
    max-width:520px; line-height:1.65; margin-bottom:40px;
    animation:gnFadeUp 0.8s 0.2s ease both;
  }
  .gn-hero-cta {
    display:flex; gap:12px; flex-wrap:wrap; justify-content:center;
    animation:gnFadeUp 0.8s 0.3s ease both; margin-bottom:72px;
  }
  .gn-btn-primary {
    background:var(--orange); color:white; border:none;
    padding:16px 32px; border-radius:12px; font-size:15px; font-weight:600;
    cursor:pointer; text-decoration:none; display:inline-block;
    transition:all 0.2s; box-shadow:0 4px 24px rgba(232,69,10,.4);
  }
  .gn-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(232,69,10,.5); }
  .gn-btn-ghost {
    background:rgba(255,255,255,.08); color:white;
    border:1px solid rgba(255,255,255,.2); padding:16px 32px;
    border-radius:12px; font-size:15px; font-weight:500;
    cursor:pointer; text-decoration:none; display:inline-block; transition:all 0.2s;
  }
  .gn-btn-ghost:hover { background:rgba(255,255,255,.14); }
  .gn-hero-phones {
    display:flex; align-items:flex-end; justify-content:center; gap:20px;
    animation:gnFadeUp 0.8s 0.4s ease both;
  }
  .gn-phone-frame {
    background:#1C1C1E; border-radius:36px; border:2px solid rgba(255,255,255,.12);
    overflow:hidden; box-shadow:0 40px 80px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.04);
    position:relative;
  }
  .gn-phone-frame img { display:block; width:100%; height:100%; object-fit:cover; }
  .gn-phone-main { width:200px; height:420px; z-index:2; }
  .gn-phone-side { width:170px; height:360px; opacity:.75; z-index:1; }
  .gn-phone-far  { width:150px; height:310px; opacity:.45; z-index:0; }

  /* STATS */
  .gn-stats-strip {
    background:white; border-bottom:1px solid rgba(0,0,0,.06); padding:32px 24px;
  }
  .gn-stats-inner {
    max-width:900px; margin:0 auto; display:flex;
    gap:0; justify-content:center; flex-wrap:wrap;
  }
  .gn-stat-item {
    flex:1; min-width:160px; text-align:center; padding:16px 24px;
    border-right:1px solid rgba(0,0,0,.07);
  }
  .gn-stat-item:last-child { border-right:none; }
  .gn-stat-num {
    font-family:'Syne',sans-serif; font-weight:800; font-size:36px;
    color:var(--orange); line-height:1; margin-bottom:4px;
  }
  .gn-stat-label { font-size:13px; color:var(--muted); font-weight:500; }

  /* NARRATIVE */
  .gn-narrative {
    background:linear-gradient(180deg,var(--bg) 0%,white 100%); padding:100px 24px;
  }
  .gn-narrative-inner {
    max-width:1100px; margin:0 auto; display:grid;
    grid-template-columns:1fr 1fr; gap:80px; align-items:center;
  }
  .gn-narrative-phone { position:relative; display:flex; justify-content:center; }
  .gn-narrative-phone .gn-phone-frame { width:240px; height:500px; }
  .gn-narrative-phone::after {
    content:''; position:absolute; bottom:-20px; left:50%;
    transform:translateX(-50%); width:160px; height:40px;
    background:rgba(232,69,10,.2); filter:blur(20px); border-radius:50%;
  }
  .gn-callout-bubble {
    position:absolute; background:white; border-radius:12px; padding:10px 14px;
    box-shadow:0 8px 32px rgba(0,0,0,.12); font-size:13px; font-weight:600; white-space:nowrap;
  }

  /* FEATURES */
  .gn-feature-row {
    display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center;
    padding:80px 24px; max-width:1100px; margin:0 auto;
  }
  .gn-feature-row.reverse { direction:rtl; }
  .gn-feature-row.reverse > * { direction:ltr; }
  .gn-feature-visual { position:relative; display:flex; justify-content:center; }
  .gn-feature-visual .gn-phone-frame { width:220px; height:460px; }
  .gn-feature-tag {
    position:absolute; background:var(--orange); color:white;
    font-size:12px; font-weight:600; padding:6px 12px; border-radius:8px;
  }
  .gn-feature-tag.top-right { top:-12px; right:20px; }
  .gn-feature-tag.bottom-left { bottom:30px; left:-10px; }
  .gn-feature-num {
    font-family:'Syne',sans-serif; font-size:13px; font-weight:700;
    color:var(--orange); letter-spacing:.08em; margin-bottom:12px; display:block;
  }
  .gn-feature-content h2 {
    font-family:'Syne',sans-serif; font-weight:800;
    font-size:clamp(28px,4vw,44px); line-height:1.1; letter-spacing:-0.03em;
    color:var(--dark); margin-bottom:16px;
  }
  .gn-feature-content p {
    font-size:16px; line-height:1.7; color:var(--muted); margin-bottom:24px;
  }
  .gn-feature-pills { display:flex; flex-wrap:wrap; gap:8px; }
  .gn-pill {
    background:var(--orange-soft); border:1px solid var(--border); color:var(--orange);
    font-size:13px; font-weight:500; padding:6px 14px; border-radius:100px;
  }

  /* SECTION DIVIDER */
  .gn-section-divider {
    max-width:1100px; margin:0 auto; height:1px;
    background:linear-gradient(90deg,transparent,rgba(0,0,0,.08),transparent);
  }

  /* SECTION SHARED */
  .gn-section-label {
    font-size:12px; font-weight:600; letter-spacing:.1em; text-transform:uppercase;
    color:var(--orange); margin-bottom:16px;
  }
  .gn-section-title {
    font-family:'Syne',sans-serif; font-weight:800;
    font-size:clamp(32px,5vw,56px); line-height:1.1; letter-spacing:-0.03em;
    color:var(--dark); margin-bottom:20px;
  }
  .gn-section-body { font-size:17px; line-height:1.7; color:var(--muted); max-width:500px; }

  /* WORKFLOW */
  .gn-workflow-section { background:var(--dark); padding:100px 24px; }
  .gn-workflow-inner { max-width:1100px; margin:0 auto; }
  .gn-workflow-inner .gn-section-title { color:white; }
  .gn-workflow-inner .gn-section-body { color:rgba(255,255,255,.5); }
  .gn-workflow-steps {
    display:grid; grid-template-columns:repeat(4,1fr); gap:24px;
    margin-top:60px; position:relative;
  }
  .gn-workflow-steps::before {
    content:''; position:absolute; top:48px; left:12%; right:12%; height:1px;
    background:linear-gradient(90deg,transparent,var(--orange),var(--orange),transparent);
    opacity:.3;
  }
  .gn-workflow-step { text-align:center; }
  .gn-step-phone {
    width:120px; height:250px; margin:0 auto 20px; border-radius:20px;
    border:1.5px solid rgba(255,255,255,.1); overflow:hidden; background:#1C1C1E;
    box-shadow:0 20px 40px rgba(0,0,0,.4);
  }
  .gn-step-phone img { width:100%; height:100%; object-fit:cover; object-position:top; }
  .gn-step-num {
    display:inline-flex; align-items:center; justify-content:center;
    width:28px; height:28px; background:var(--orange); color:white;
    font-size:12px; font-weight:700; border-radius:50%; margin-bottom:8px;
  }
  .gn-step-title {
    font-family:'Syne',sans-serif; font-weight:700; font-size:16px;
    color:white; margin-bottom:6px;
  }
  .gn-step-desc { font-size:13px; color:rgba(255,255,255,.4); line-height:1.5; }

 

  /* BENEFITS */
  .gn-benefits-section { background:var(--dark); padding:100px 24px; }
  .gn-benefits-inner { max-width:1100px; margin:0 auto; }
  .gn-benefits-inner .gn-section-title { color:white; }
  .gn-benefits-grid {
    display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:60px;
  }
  .gn-benefit-card {
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
    border-radius:16px; padding:28px; transition:all .3s;
  }
  .gn-benefit-card:hover {
    background:rgba(232,69,10,.08); border-color:rgba(232,69,10,.2);
  }
  .gn-benefit-icon {
    width:44px; height:44px; background:rgba(232,69,10,.15); border-radius:12px;
    display:flex; align-items:center; justify-content:center;
    font-size:22px; margin-bottom:16px;
  }
  .gn-benefit-title {
    font-family:'Syne',sans-serif; font-weight:700; font-size:18px;
    color:white; margin-bottom:8px;
  }
  .gn-benefit-desc { font-size:14px; line-height:1.65; color:rgba(255,255,255,.45); }

  

  

  /* FINAL CTA */
  .gn-final-section { background:var(--bg); padding:120px 24px; text-align:center; }
  .gn-final-inner { max-width:700px; margin:0 auto; }
  .gn-final-inner .gn-section-title { margin-bottom:20px; }
  .gn-final-inner .gn-section-body { margin:0 auto 40px; text-align:center; }
  .gn-final-phones {
    display:flex; justify-content:center; gap:24px; margin:60px 0;
  }
  .gn-final-phone {
    width:160px; height:340px; border-radius:28px;
    border:2px solid rgba(0,0,0,.08); overflow:hidden;
    box-shadow:0 24px 48px rgba(0,0,0,.1);
  }
  .gn-final-phone img { width:100%; height:100%; object-fit:cover; object-position:top; }
  .gn-final-phone:nth-child(2) {
    transform:translateY(-20px); box-shadow:0 32px 60px rgba(232,69,10,.2);
  }
  .gn-btn-ghost-dark {
    background:rgba(255,255,255,.08); color:var(--dark);
    border:1px solid rgba(0,0,0,.15); padding:16px 32px;
    border-radius:12px; font-size:15px; font-weight:500;
    cursor:pointer; text-decoration:none; display:inline-block; transition:all 0.2s;
  }
  .gn-btn-ghost-dark:hover { background:rgba(0,0,0,.05); }

  /* ANIMATIONS */
  @keyframes gnFadeUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes gnPulse {
    0%,100% { opacity:1; }
    50%      { opacity:.4; }
  }
  .gn-reveal {
    opacity:0; transform:translateY(32px);
    transition:opacity .7s ease,transform .7s ease;
  }
  .gn-reveal.visible { opacity:1; transform:none; }

  /* RESPONSIVE */
  @media (max-width:900px) {
    .gn-narrative-inner, .gn-feature-row, .gn-feature-row.reverse {
      grid-template-columns:1fr; direction:ltr;
    }
    .gn-narrative-phone, .gn-feature-visual { order:-1; }
    .gn-workflow-steps { grid-template-columns:repeat(2,1fr); }
    .gn-workflow-steps::before { display:none; }
    .gn-benefits-grid { grid-template-columns:repeat(2,1fr); }
    .gn-testimonials-grid { grid-template-columns:1fr; }
    .gn-impact-grid { grid-template-columns:repeat(2,1fr); }
    .gn-gallery-grid { grid-template-columns:repeat(2,1fr); }
    .gn-gallery-card.featured { grid-row:span 1; }
    .gn-gallery-card.featured img { height:280px; }
    .gn-dive-phone-left, .gn-dive-phone-right { display:none; }
    .gn-callout-a, .gn-callout-b, .gn-callout-c { display:none; }
    .gn-hero-phones .gn-phone-side, .gn-hero-phones .gn-phone-far { display:none; }
    .gn-phone-main { width:240px; height:480px; }
  }
  @media (max-width:600px) {
    .gn-workflow-steps, .gn-benefits-grid { grid-template-columns:1fr; }
    .gn-impact-grid { grid-template-columns:repeat(2,1fr); }
    .gn-stats-inner { gap:0; }
    .gn-stat-item { border-right:none; border-bottom:1px solid rgba(0,0,0,.07); }
    .gn-stat-item:last-child { border-bottom:none; }
    .gn-gallery-grid { grid-template-columns:1fr; }
    .gn-final-phones .gn-final-phone:nth-child(1),
    .gn-final-phones .gn-final-phone:nth-child(3) { display:none; }
  }
`;

function Reveal({ children, style, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("visible");
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); }
        });
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`gn-reveal ${className}`} style={style}>
      {children}
    </div>
  );
}

export default function GoodOneShowcase() {
  return (
    <>
      <style>{css}</style>

      {/* ── 1. HERO ── */}
      <section className="gn-hero">
        <div className="gn-hero-badge">
          <span className="gn-dot" />
          24-Hour Fresh Listings
        </div>

        <h1>Buy &amp; Sell<br /><em>Directly. Locally.</em></h1>

        <p>
          Connect with registered vendors in your city. Chat, negotiate, and meet up —
          no middleman, no platform fees, no hassle.
        </p>

        <div className="gn-hero-cta">
          <a href="https://play.google.com/store/apps/details?id=com.goodone.marketplace&pcampaignid=web_share" className="gn-btn-primary" target="_blank">Start Shopping Free</a>
          <a href="https://play.google.com/store/apps/details?id=com.goodone.marketplace&pcampaignid=web_share" className="gn-btn-ghost" target="_blank">Become a Vendor</a>
        </div>

        <div className="gn-hero-phones">
          <div className="gn-phone-frame gn-phone-far">
            <img src={imgs.welcome} alt="GoodOne welcome screen" />
          </div>
          <div className="gn-phone-frame gn-phone-side">
            <img src={imgs.createAccount} alt="GoodOne browse" />
          </div>
          <div className="gn-phone-frame gn-phone-main">
            <img src={imgs.home} alt="GoodOne home" />
          </div>
          <div className="gn-phone-frame gn-phone-side">
            <img src={imgs.chat} alt="GoodOne chat" />
          </div>
          <div className="gn-phone-frame gn-phone-far">
            <img src={imgs.dashboard} alt="GoodOne vendor dashboard" />
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <Reveal>
        <div className="gn-stats-strip">
          <div className="gn-stats-inner">
            {[
              { num: "24h",  label: "Listing Freshness" },
              { num: "0%",   label: "Commission Fees" },
              { num: "2-way",label: "Direct Chat" },
              { num: "KYC",  label: "Verified Vendors" },
            ].map(({ num, label }) => (
              <div key={label} className="gn-stat-item">
                <div className="gn-stat-num">{num}</div>
                <div className="gn-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── 2. NARRATIVE ── */}
      <section className="gn-narrative">
        <div className="gn-narrative-inner">
          <Reveal className="gn-narrative-phone">
            <div className="gn-phone-frame" style={{ width: 240, height: 500 }}>
              <img src={imgs.home} alt="Product detail"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            </div>
            <div className="gn-callout-bubble" style={{ bottom: 60, right: -30 }}>
              <span style={{ marginRight: 6 }}>💬</span> Chat with Vendor
            </div>
            <div className="gn-callout-bubble"
              style={{ top: 80, left: -20, background: "var(--orange)", color: "white" }}>
              <span>24% OFF</span>
            </div>
          </Reveal>

          <Reveal style={{ animationDelay: "0.15s" }}>
            <div className="gn-section-label">The Problem We Solve</div>
            <h2 className="gn-section-title" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>
              Local buying was broken.
            </h2>
            <p className="gn-section-body">
              Big marketplaces charge sellers a cut of every sale, force buyers to wait weeks for delivery,
              and hide who you're really dealing with.<br /><br />
              GoodOne brings local commerce back to life — connecting real buyers with verified local vendors,
              letting them negotiate face-to-face, and closing deals the same day.
            </p>
            <div style={{ marginTop: 32, display: "flex", gap: 24, flexWrap: "wrap" }}>
              {["Registered local vendors", "Real-time listings", "Direct chat & meetup"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--muted)" }}>
                  <span style={{ color: "var(--orange)" }}>✓</span> {t}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <div className="gn-section-divider" />

      {/* ── 3a. FEATURE — BROWSE ── */}
      <div className="gn-feature-row">
        <Reveal className="gn-feature-visual">
          <div className="gn-phone-frame" style={{ width: 220, height: 460 }}>
            <img src={imgs.browse} alt="Browse screen"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          </div>
          <div className="gn-feature-tag top-right">12 products nearby</div>
          <div className="gn-feature-tag bottom-left" style={{ background: "#10B981" }}>Like New</div>
        </Reveal>
        <Reveal className="gn-feature-content" style={{ animationDelay: "0.1s" }}>
          <span className="gn-feature-num">BROWSE</span>
          <h2>Everything fresh, every day.</h2>
          <p>Every listing auto-expires in 24 hours, so you only see products that are actually
            available right now. No ghost listings, no stale inventory.</p>
          <div className="gn-feature-pills">
            {["Filter by category","Filter by location","Condition labels","Time remaining"].map((p) => (
              <span key={p} className="gn-pill">{p}</span>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="gn-section-divider" />

      {/* ── 3b. FEATURE — PRODUCT DETAIL ── */}
      <div className="gn-feature-row reverse">
        <Reveal className="gn-feature-visual">
          <div className="gn-phone-frame" style={{ width: 220, height: 460 }}>
            <img src={imgs.addListing} alt="Product detail"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          </div>
          <div className="gn-feature-tag top-right" style={{ background: "#10B981" }}>24% OFF</div>
          <div className="gn-feature-tag bottom-left">128 views</div>
        </Reveal>
        <Reveal className="gn-feature-content" style={{ animationDelay: "0.1s" }}>
          <span className="gn-feature-num">LISTING DETAIL</span>
          <h2>See it. Want it. Get it.</h2>
          <p>Rich product pages show condition, photos, original price vs. asking price, seller
            location, and how many hours the listing has left — then tap once to start a conversation.</p>
          <div className="gn-feature-pills">
            {["Discounted pricing","Condition badges","Vendor location","Expiry countdown"].map((p) => (
              <span key={p} className="gn-pill">{p}</span>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="gn-section-divider" />

      {/* ── 3c. FEATURE — CHAT ── */}
      <div className="gn-feature-row">
        <Reveal className="gn-feature-visual">
          <div className="gn-phone-frame" style={{ width: 220, height: 460 }}>
            <img src={imgs.chat} alt="Chat screen"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          </div>
          <div className="gn-feature-tag top-right">Make Offer</div>
          <div className="gn-feature-tag bottom-left">Arrange Meetup</div>
        </Reveal>
        <Reveal className="gn-feature-content" style={{ animationDelay: "0.1s" }}>
          <span className="gn-feature-num">DIRECT CHAT</span>
          <h2>Negotiate like a human.</h2>
          <p>Built-in messaging lets buyers and vendors negotiate price, confirm availability,
            and set up a meetup — all within the app. No phone numbers exchanged, no third-party hassle.</p>
          <div className="gn-feature-pills">
            {["Make an offer","Arrange meetup","Multiple conversations","In-app only"].map((p) => (
              <span key={p} className="gn-pill">{p}</span>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ── 4. WORKFLOW ── */}
      <section className="gn-workflow-section">
        <div className="gn-workflow-inner">
          <Reveal>
            <div className="gn-section-label" style={{ color: "rgba(232,69,10,0.8)" }}>How It Works</div>
            <h2 className="gn-section-title">From listing to sold<br />in hours, not weeks.</h2>
            <p className="gn-section-body">
              GoodOne is designed for speed. Vendors list in minutes, buyers find and contact immediately.
            </p>
          </Reveal>

          <Reveal style={{ animationDelay: "0.15s" }}>
            <div className="gn-workflow-steps">
              {[
                { img: imgs.welcome, num: 1, title: "Sign Up",        desc: "Create an account as a buyer or register as a verified vendor." },
                { img: imgs.browse, num: 2, title: "List Product", desc: "Add photos, details, price, and choose a listing duration." },
                { img: imgs.chat,   num: 3, title: "Chat & Negotiate", desc: "Buyers contact you directly. Agree on price and meetup." },
                { img: imgs.dashboard, num: 4, title: "Track & Renew", desc: "Manage all your listings from one vendor dashboard." },
              ].map(({ img, num, title, desc }) => (
                <div key={num} className="gn-workflow-step">
                  <div className="gn-step-phone">
                    <img src={img} alt={title} />
                  </div>
                  <div className="gn-step-num">{num}</div>
                  <div className="gn-step-title">{title}</div>
                  <div className="gn-step-desc">{desc}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

  {/* ── 5. BENEFITS ── */}
      <section className="gn-benefits-section">
        <div className="gn-benefits-inner">
          <Reveal>
            <div className="gn-section-label" style={{ color: "rgba(232,69,10,0.8)" }}>Why GoodOne</div>
            <h2 className="gn-section-title">Built around<br />real outcomes.</h2>
          </Reveal>

          <div className="gn-benefits-grid">
            {[
              { icon:"🏪", title:"Zero Middleman",       desc:"Buyers and vendors connect directly. No platform cuts into your sale price.", delay:"0.05s" },
              { icon:"⚡", title:"Same-Day Deals",       desc:"24-hour listings mean active sellers. Negotiate and collect the same day.", delay:"0.1s" },
              { icon:"🔐", title:"Verified Vendors",     desc:"Live photo KYC and OTP verification means every seller is a real person.", delay:"0.15s" },
              { icon:"💬", title:"Built-in Negotiation", desc:"Make offers and arrange meetups from within the app — no number sharing.", delay:"0.2s" },
              { icon:"📊", title:"Vendor Dashboard",     desc:"Track views, renewals, and active listings from a single screen.", delay:"0.25s" },
              { icon:"📍", title:"Hyper-Local",          desc:"Browse by location. Everything near you, nothing that isn't.", delay:"0.3s" },
            ].map(({ icon, title, desc, delay }) => (
              <Reveal key={title} style={{ animationDelay: delay }}>
                <div className="gn-benefit-card">
                  <div className="gn-benefit-icon">{icon}</div>
                  <div className="gn-benefit-title">{title}</div>
                  <div className="gn-benefit-desc">{desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. FINAL CTA ── */}
      <section className="gn-final-section">
        <div className="gn-final-inner">
          <Reveal>
            <div className="gn-section-label" style={{ textAlign: "center" }}>Get Started Today</div>
            <h2 className="gn-section-title">Your neighbourhood<br />marketplace is here.</h2>
            <p className="gn-section-body">
              Join buyers and verified vendors already buying and selling smarter —
              no middleman, no waiting, no fees.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
              <a href="https://play.google.com/store/apps/details?id=com.goodone.marketplace&pcampaignid=web_share" className="gn-btn-primary" target="_blank">Start Shopping Free</a>
              <a href="https://play.google.com/store/apps/details?id=com.goodone.marketplace&pcampaignid=web_share" className="gn-btn-ghost-dark" target="_blank">Become a Vendor</a>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              Free to join · Listings live in minutes
            </p>
          </Reveal>

          
        </div>
      </section>
    </>
  );
}
