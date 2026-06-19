import voiceImg from "../assets/images/swico/voice.png";
import signinImg from "../assets/images/swico/signin.png";
import chatImg from "../assets/images/swico/chat.png";
import scheduleImg from "../assets/images/swico/schedule.png";

const css = `

  :root {
    --orange: #F97316;
    --orange-light: #FB923C;
    --orange-pale: #FFF7ED;
    --orange-dark: #EA580C;
    --orange-glow: rgba(249, 115, 22, 0.15);
    --white: #FFFFFF;
    --off-white: #FAFAF8;
    --gray-50: #F9F9F7;
    --gray-100: #F3F2EE;
    --gray-200: #E5E3DC;
    --gray-400: #9B9790;
    --gray-600: #6B6760;
    --gray-800: #2C2B28;
    --gray-900: #1A1917;
    --font-display: 'Sora', sans-serif;
    --font-body: 'Inter', sans-serif;
  }

  .swico-root {
    font-family: var(--font-body);
    color: var(--gray-800);
    background: var(--white);
    overflow-x: hidden;
  }

  /* ── HERO ── */
  .swico-hero__section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 80px 24px 100px;
    background: linear-gradient(160deg, #fff7ed 0%, #ffffff 45%, #fff4e6 100%);
    position: relative;
    overflow: hidden;
  }
  .swico-hero__section::before {
    content: '';
    position: absolute;
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%);
    top: -200px; right: -200px;
    border-radius: 50%;
    pointer-events: none;
  }
  .swico-hero__section::after {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%);
    bottom: -150px; left: -150px;
    border-radius: 50%;
    pointer-events: none;
  }
  .swico-hero__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--orange-pale);
    border: 1px solid rgba(249,115,22,0.25);
    color: var(--orange-dark);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 6px 16px;
    border-radius: 100px;
    margin-bottom: 28px;
    position: relative; z-index: 1;
  }
  .swico-hero__eyebrow-dot {
    width: 7px; height: 7px;
    background: var(--orange);
    border-radius: 50%;
    animation: swico-hero-pulse 2s ease-in-out infinite;
  }
  @keyframes swico-hero-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.75); }
  }
  .swico-hero__headline {
    font-family: var(--font-display);
    font-size: clamp(42px, 8vw, 80px);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.03em;
    color: var(--gray-900);
    max-width: 840px;
    position: relative; z-index: 1;
    margin-bottom: 10px;
  }
  .swico-hero__headline em {
    font-style: normal;
    color: var(--orange);
    position: relative;
    display: inline-block;
  }
  .swico-hero__headline em::after {
    content: '';
    position: absolute;
    bottom: 4px; left: 0; right: 0;
    height: 4px;
    background: var(--orange);
    border-radius: 2px;
    opacity: 0.35;
  }
  .swico-hero__sub {
    font-size: clamp(16px, 2.5vw, 20px);
    color: var(--gray-600);
    max-width: 600px;
    line-height: 1.65;
    margin: 20px auto 48px;
    position: relative; z-index: 1;
  }
  .swico-hero__ctas {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    justify-content: center;
    position: relative; z-index: 1;
  }
  .swico-hero__btn-primary {
    background: var(--orange);
    color: #fff;
    border: none;
    padding: 15px 36px;
    border-radius: 10px;
    font-family: var(--font-body);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(249,115,22,0.35);
  }
  .swico-hero__btn-primary:hover { background: var(--orange-dark); transform: translateY(-2px); box-shadow: 0 8px 28px rgba(249,115,22,0.4); }
  .swico-hero__btn-secondary {
    background: transparent;
    color: var(--gray-800);
    border: 1.5px solid var(--gray-200);
    padding: 15px 36px;
    border-radius: 10px;
    font-family: var(--font-body);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.15s;
  }
  .swico-hero__btn-secondary:hover { border-color: var(--orange); color: var(--orange); transform: translateY(-2px); }
  .swico-hero__stats {
    display: flex;
    gap: 48px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 72px;
    position: relative; z-index: 1;
  }
  .swico-hero__stat { text-align: center; }
  .swico-hero__stat-num {
    font-family: var(--font-display);
    font-size: 36px;
    font-weight: 800;
    color: var(--gray-900);
    letter-spacing: -0.02em;
  }
  .swico-hero__stat-num span { color: var(--orange); }
  .swico-hero__stat-label { font-size: 13px; color: var(--gray-400); margin-top: 2px; font-weight: 500; }

  /* ── SECTION SHARED ── */
  .section { padding: 96px 24px; }
  .section-inner { max-width: 1120px; margin: 0 auto; }
  .section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--orange);
    margin-bottom: 14px;
  }
  .section-title {
    font-family: var(--font-display);
    font-size: clamp(28px, 5vw, 46px);
    font-weight: 800;
    letter-spacing: -0.025em;
    color: var(--gray-900);
    line-height: 1.1;
    margin-bottom: 16px;
  }
  .section-body {
    font-size: 17px;
    color: var(--gray-600);
    line-height: 1.7;
    max-width: 560px;
  }

  /* ── ABOUT ── */
  .about { background: var(--off-white); }
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 72px;
    align-items: center;
  }
  .about-visual {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
  }
  .about-screen-mock {
    background: var(--gray-900);
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.18);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .mock-bar {
    display: flex; gap: 6px; margin-bottom: 20px;
  }
  .mock-dot { width: 10px; height: 10px; border-radius: 50%; }
  .mock-dot.r { background: #FF5F57; }
  .mock-dot.y { background: #FEBC2E; }
  .mock-dot.g { background: #28C840; }
  .mock-chat { display: flex; flex-direction: column; gap: 14px; }
  .mock-msg {
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 14px;
    line-height: 1.5;
    max-width: 82%;
  }
  .mock-msg.user { background: var(--orange); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
  .mock-msg.ai { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.9); align-self: flex-start; border-bottom-left-radius: 4px; border: 1px solid rgba(255,255,255,0.1); }
  .mock-typing { display: flex; gap: 4px; padding: 12px 16px; background: rgba(255,255,255,0.05); border-radius: 12px; border-bottom-left-radius: 4px; align-self: flex-start; border: 1px solid rgba(255,255,255,0.08); }
  .mock-typing span { width: 6px; height: 6px; background: var(--orange); border-radius: 50%; animation: bounce 1.2s ease-in-out infinite; }
  .mock-typing span:nth-child(2) { animation-delay: 0.2s; }
  .mock-typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-6px); }
  }

  /* ── FEATURES ── */
  .features { background: var(--white); }
  .features-intro { text-align: center; margin-bottom: 64px; }
  .features-intro .section-body { margin: 0 auto; }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .feat-card {
    background: var(--gray-50);
    border: 1px solid var(--gray-100);
    border-radius: 18px;
    padding: 36px 30px;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    cursor: default;
  }
  .feat-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 50px rgba(249,115,22,0.1);
    border-color: rgba(249,115,22,0.2);
  }
  .feat-icon {
    width: 52px; height: 52px;
    background: var(--orange-pale);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px;
    margin-bottom: 22px;
    border: 1px solid rgba(249,115,22,0.15);
  }
  .feat-title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 10px;
  }
  .feat-desc { font-size: 14px; color: var(--gray-600); line-height: 1.65; }

  /* ── HOW IT WORKS ── */
  .how { background: var(--orange-pale); }
  .how-inner { max-width: 1120px; margin: 0 auto; }
  .how-steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    margin-top: 60px;
    position: relative;
  }
  .how-steps::before {
    content: '';
    position: absolute;
    top: 36px; left: 16.67%; right: 16.67%;
    height: 1px;
    background: linear-gradient(90deg, var(--orange) 0%, rgba(249,115,22,0.3) 100%);
  }
  .how-step { text-align: center; padding: 0 24px; position: relative; }
  .how-num {
    width: 72px; height: 72px;
    background: var(--white);
    border: 2px solid var(--orange);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 800;
    color: var(--orange);
    margin: 0 auto 28px;
    position: relative; z-index: 1;
    box-shadow: 0 0 0 8px var(--orange-pale);
  }
  .how-step-title {
    font-family: var(--font-display);
    font-size: 19px;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 10px;
  }
  .how-step-desc { font-size: 14px; color: var(--gray-600); line-height: 1.65; }

  /* ── SCREENS GALLERY ── */
  .gallery { background: var(--white); }
  .gallery-scroll {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-top: 56px;
  }
  .gallery-card {
    border-radius: 18px;
    overflow: hidden;
    background: var(--gray-900);
    aspect-ratio: 9/16;
    position: relative;
    border: 1px solid var(--gray-200);
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    transition: transform 0.25s, box-shadow 0.25s;
  }
  .gallery-card:hover { transform: scale(1.03) translateY(-4px); box-shadow: 0 24px 56px rgba(0,0,0,0.14); }
  .gallery-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .gallery-caption {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 20px 16px 16px;
    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
  }

  /* ── TESTIMONIALS ── */
  .testimonials { background: var(--gray-50); }
  .testi-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 56px;
  }
  .testi-card {
    background: var(--white);
    border: 1px solid var(--gray-100);
    border-radius: 18px;
    padding: 32px 28px;
    position: relative;
  }
  .testi-card::before {
    content: '"';
    position: absolute;
    top: 20px; right: 24px;
    font-family: var(--font-display);
    font-size: 80px;
    line-height: 1;
    color: var(--orange);
    opacity: 0.12;
    font-weight: 800;
  }
  .testi-stars { color: var(--orange); font-size: 15px; letter-spacing: 2px; margin-bottom: 14px; }
  .testi-quote { font-size: 15px; color: var(--gray-700); line-height: 1.7; margin-bottom: 22px; font-style: italic; }
  .testi-author { display: flex; align-items: center; gap: 12px; }
  .testi-avatar {
    width: 42px; height: 42px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--orange) 0%, #FDE68A 100%);
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    font-weight: 700;
    font-size: 16px;
  }
  .testi-name { font-weight: 700; font-size: 14px; color: var(--gray-900); }
  .testi-role { font-size: 12px; color: var(--gray-400); margin-top: 2px; }

  /* ── CTA BAND ── */
  .cta-band {
    background: linear-gradient(135deg, var(--orange) 0%, #F97316 60%, #FB923C 100%);
    padding: 96px 24px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .cta-band::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
    pointer-events: none;
  }
  .cta-band-title {
    font-family: var(--font-display);
    font-size: clamp(32px, 6vw, 56px);
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.025em;
    margin-bottom: 16px;
    position: relative;
  }
  .cta-band-sub { font-size: 18px; color: rgba(255,255,255,0.8); margin-bottom: 40px; position: relative; }
  .btn-white {
    background: #fff;
    color: var(--orange-dark);
    border: none;
    padding: 16px 40px;
    border-radius: 10px;
    font-family: var(--font-body);
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    position: relative;
  }
  .btn-white:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(0,0,0,0.2); }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .about-grid { grid-template-columns: 1fr; gap: 48px; }
    .features-grid { grid-template-columns: 1fr 1fr; }
    .gallery-scroll { grid-template-columns: repeat(2, 1fr); }
    .testi-grid { grid-template-columns: 1fr 1fr; }
    .how-steps { grid-template-columns: 1fr; gap: 40px; }
    .how-steps::before { display: none; }
    .how-step { padding: 0 12px; }
  }
  @media (max-width: 580px) {
    .features-grid { grid-template-columns: 1fr; }
    .gallery-scroll { grid-template-columns: 1fr 1fr; }
    .testi-grid { grid-template-columns: 1fr; }
    .swico-hero__stats { gap: 28px; }
  }
`;

const features = [
  { icon: "⚡", title: "Instant Responses", desc: "Get accurate answers in milliseconds. Swico AI processes your queries at lightning speed so you never wait." },
  { icon: "🧠", title: "AI-Driven Insights", desc: "Beyond answers—Swico learns your patterns and delivers proactive recommendations before you even ask." },
  { icon: "🎙️", title: "Voice & Chat", desc: "Talk or type naturally. Swico's conversational interface adapts to however you feel most comfortable." },
  { icon: "📅", title: "Smart Scheduling", desc: "Set reminders, manage meetings, and plan your day effortlessly with AI that understands context." },
  { icon: "📚", title: "Multi-Topic Knowledge", desc: "From business strategy to everyday questions—Swico covers a broad knowledge base across domains." },
  { icon: "🔒", title: "Private & Secure", desc: "Your conversations stay yours. End-to-end encryption and on-device processing keep your data safe." },
];

const steps = [
  { n: "1", title: "Create Your Account", desc: "Sign up in seconds and let Elli introduce herself. Pick the areas you want help with and you're ready to go." },
  { n: "2", title: "Set Up Your Profile", desc: "Tell Swico your name, preferred language, and daily routine. The more context she has, the smarter she gets." },
  { n: "3", title: "Start Getting Things Done", desc: "Chat, voice-command, or tap—Swico handles reminders, notes, schedules, and answers in one fluid experience." },
];


const screens = [
  { file: voiceImg, caption: "Voice Home" },
  { file: signinImg, caption: "Sign In" },
  { file: chatImg, caption: "Chat Interface" },
  { file: scheduleImg, caption: "Schedule View" },
];

export default function SwicoAI() {
  return (
    <>
      <style>{css}</style>
      <div className="swico-root">

        {/* ── HERO ── */}
        <section className="swico-hero__section">
          <div className="swico-hero__eyebrow">
            <span className="swico-hero__eyebrow-dot" />
            AI-Powered Productivity
          </div>
          <h1 className="swico-hero__headline">
            Meet <em>Swico AI</em>—<br />Your Everyday Intelligence
          </h1>
          <p className="swico-hero__sub">
            Instant answers, smart reminders, and proactive insights—all from one conversational AI that actually understands you.
          </p>
          <div className="swico-hero__ctas">
            <button className="swico-hero__btn-primary">Get Started Free</button>
            <button className="swico-hero__btn-secondary">See How It Works</button>
          </div>
          
          
        </section>

        {/* ── ABOUT ── */}
        <section className="section about">
          <div className="section-inner about-grid">
            <div>
              <div className="section-label">What is Swico AI</div>
              <h2 className="section-title">Intelligence built for real life</h2>
              <p className="section-body">
                Swico AI is an advanced AI-powered assistant designed to provide instant answers, intelligent recommendations, and smart solutions for everyday questions and business needs. Built on modern artificial intelligence, Swico helps you access information quickly and operate at your best—every single day.
              </p>
              <p className="section-body" style={{ marginTop: '16px' }}>
                Whether you're a busy professional juggling meetings, an engineer tracking project milestones, or someone who simply wants a smarter daily routine—Swico adapts to you.
              </p>
            </div>
            <div className="about-visual">
              <div className="about-screen-mock">
                <div className="mock-bar">
                  <div className="mock-dot r" />
                  <div className="mock-dot y" />
                  <div className="mock-dot g" />
                </div>
                <div className="mock-chat">
                  <div className="mock-msg user">Schedule my Project review for 4:30 PM today</div>
                  <div className="mock-msg ai">Done! I've added "Review Project review to your schedule at 4:30 PM and set a reminder 15 minutes before. Anything else?</div>
                  <div className="mock-msg user">Show me today's reminders</div>
                  <div className="mock-msg ai">You have 3 items today. Next up: Project review at 4:30 PM — in 2h 51m. Want to see all 3?</div>
                  <div className="mock-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="section features">
          <div className="section-inner">
            <div className="features-intro">
              <div className="section-label">What Swico Does</div>
              <h2 className="section-title">Every capability you need,<br />nothing you don't</h2>
              <p className="section-body">Swico combines conversational AI with action-oriented tools—so it doesn't just answer, it helps you move forward.</p>
            </div>
            <div className="features-grid">
              {features.map((f) => (
                <div className="feat-card" key={f.title}>
                  <div className="feat-icon">{f.icon}</div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="section how">
          <div className="how-inner section-inner">
            <div style={{ textAlign: 'center' }}>
              <div className="section-label">How It Works</div>
              <h2 className="section-title">Up and running in three steps</h2>
            </div>
            <div className="how-steps">
              {steps.map((s) => (
                <div className="how-step" key={s.n}>
                  <div className="how-num">{s.n}</div>
                  <div className="how-step-title">{s.title}</div>
                  <div className="how-step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SCREENS GALLERY ── */}
        <section className="section gallery">
          <div className="section-inner">
            <div className="section-label">App Screens</div>
            <h2 className="section-title">Designed for the way you work</h2>
            <div className="gallery-scroll">
              {screens.map((s) => (
                <div className="gallery-card" key={s.caption}>
                  <img src={s.file} alt={s.caption} />
                  <div className="gallery-caption">{s.caption}</div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ── CTA BAND ── */}
        <section className="cta-band">
          <h2 className="cta-band-title">Ready to work smarter?</h2>
          <p className="cta-band-sub">Join thousands of users who get more done with Swico AI every day.</p>
          <button className="btn-white">Start for Free →</button>
        </section>

      </div>
    </>
  );
}
