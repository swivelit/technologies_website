import { useState } from "react";

import screen1 from "../assets/images/Defect detectors/1.png";
import screen2 from "../assets/images/Defect detectors/2.png";
import screen3 from "../assets/images/Defect detectors/3.png";
import screen4 from "../assets/images/Defect detectors/4.png";
import screen5 from "../assets/images/Defect detectors/5.png";
import screen6 from "../assets/images/Defect detectors/6.png";

const features = [
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Automated Product Inspection",
    desc: "Continuously scans every unit on the line without human fatigue, catching surface scratches, dents, cracks, and discoloration before they reach your customers.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: "Client Requirement Validation",
    desc: "Maps every inspection rule directly to your client's acceptance criteria. When specs change, update once and every line reflects it immediately.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Real-Time Defect Detection",
    desc: "Sub-50 ms inference latency per frame means defects are flagged the moment they appear — not at end-of-shift review — so corrective action is immediate.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Production Quality Control",
    desc: "Live dashboards surface defect trends, hotspot stations, and yield rates across every line so quality managers can act on data, not guesswork.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Reduced Rework Costs",
    desc: "Early-stage rejection eliminates the cost of processing a defective unit through downstream steps, cutting scrap and rework spend by catching issues at the source.",
  },
];

const screens = [
  {
    label: "Overview",
    title: "Command Center for Quality",
    desc: "One screen shows total inspections, defect counts, accuracy, active cameras, and system uptime — with live alerts and recent detections side by side so nothing slips through.",
    img: screen1,
  },
  {
    label: "Live Monitoring",
    title: "See Every Line, Right Now",
    desc: "Multi-camera feeds with bounding-box overlays, confidence scores, and a live inspection timeline give your team situational awareness across the entire plant floor in real time.",
    img: screen2,
  },
  {
    label: "Defect Cases",
    title: "Triage, Assign, Resolve",
    desc: "Every detected defect becomes a structured case with image evidence, root-cause fields, reviewer assignment, and a full audit trail — approve, reject, or escalate with one click.",
    img: screen3,
  },
  {
    label: "Analytics",
    title: "Patterns That Drive Action",
    desc: "Defect trend charts, station heat maps, and yield-rate tracking surface exactly which stations, shifts, and defect types need attention before they become costly problems.",
    img: screen4,
  },
  {
    label: "Models",
    title: "AI That Learns Your Product",
    desc: "Train, version, and deploy inspection models without leaving the platform. Accuracy, precision, recall, and latency metrics are tracked per model so you always know what's running.",
    img: screen5,
  },
  {
    label: "Devices",
    title: "Every Camera, Always Healthy",
    desc: "Manage edge devices and cameras across stations. Spot offline units, high-CPU warnings, and firmware versions at a glance, with restart and reassign actions one click away.",
    img: screen6,
  },
]

const stats = [
  { value: "98.62%", label: "Detection Accuracy" },
  { value: "42 ms", label: "Inference Latency" },
  { value: "128 K+", label: "Inspections / Week" },
  { value: "1.83%", label: "Average Defect Rate" },
];

const steps = [
  { n: "01", title: "Connect Cameras", body: "Mount cameras at inspection stations and connect them to edge devices. Defect Detector streams every feed at full resolution with no additional infrastructure." },
  { n: "02", title: "Define Quality Rules", body: "Upload your client's acceptance criteria. The system maps defect types — scratch, dent, crack, discoloration, misalignment — to the thresholds that matter for each product." },
  { n: "03", title: "Train & Deploy a Model", body: "Label a dataset of sample images, kick off training, and deploy the resulting model to your production lines in a single click. New versions roll out without downtime." },
  { n: "04", title: "Monitor & Improve", body: "Review live feeds, triage flagged defects, and use analytics to find hotspot stations. Model performance improves continuously as your team validates detections." },
];

export default function DefectDetectorShowcase() {
  const [activeScreen, setActiveScreen] = useState(0);

  return (
    <div style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", color: "#1a1a1a", background: "#ffffff", lineHeight: 1.6 }}>
      <style>{`
       

        .dd-hero {
          background: linear-gradient(135deg, #FF6B00 0%, #FF8C38 40%, #FFB347 100%);
          min-height: 50vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px 24px;
          position: relative;
          overflow: hidden;
        }
        .dd-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 110%, rgba(255,255,255,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .dd-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.22);
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 100px;
          padding: 6px 18px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 32px;
        }
        .dd-hero-badge span {
          width: 8px; height: 8px; border-radius: 50%;
          background: #fff;
          display: inline-block;
          box-shadow: 0 0 0 3px rgba(255,255,255,0.35);
        }
        .dd-hero h1 {
          font-size: clamp(40px, 6vw, 78px);
          font-weight: 900;
          color: #fff;
          line-height: 1.05;
          letter-spacing: -0.03em;
          max-width: 820px;
          margin-bottom: 24px;
        }
        .dd-hero h1 em {
          font-style: normal;
          color: rgba(255,255,255,0.75);
        }
        .dd-hero p {
          font-size: clamp(17px, 2vw, 21px);
          color: rgba(255,255,255,0.88);
          max-width: 580px;
          margin-bottom: 44px;
          font-weight: 400;
        }
        .dd-hero-cta {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-primary {
          background: #fff;
          color: #FF6B00;
          border: none;
          border-radius: 8px;
          padding: 14px 32px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.2); }
        .btn-ghost {
          background: rgba(255,255,255,0.15);
          color: #fff;
          border: 2px solid rgba(255,255,255,0.55);
          border-radius: 8px;
          padding: 14px 32px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.25); }

        .dd-stats {
          background: #FF6B00;
          padding: 0;
        }
        .dd-stats-inner {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          max-width: 1100px;
          margin: 0 auto;
        }
        .dd-stat {
          padding: 40px 32px;
          text-align: center;
          border-right: 1px solid rgba(255,255,255,0.2);
        }
        .dd-stat:last-child { border-right: none; }
        .dd-stat-value {
          font-size: 42px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 8px;
        }
        .dd-stat-label {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.72);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .dd-section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 96px 24px;
        }
        .dd-section-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #FF6B00;
          margin-bottom: 16px;
        }
        .dd-section-title {
          font-size: clamp(30px, 4vw, 48px);
          font-weight: 800;
          letter-spacing: -0.025em;
          line-height: 1.1;
          color: #111;
          margin-bottom: 16px;
        }
        .dd-section-sub {
          font-size: 18px;
          color: #555;
          max-width: 560px;
          line-height: 1.65;
        }

        .dd-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 56px;
        }
        .dd-feature-card {
          background: #fafafa;
          border: 1px solid #ebebeb;
          border-radius: 14px;
          padding: 32px 28px;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .dd-feature-card:hover {
          box-shadow: 0 8px 32px rgba(255,107,0,0.10);
          border-color: #FF6B00;
        }
        .dd-feature-icon {
          width: 52px; height: 52px;
          background: linear-gradient(135deg, #FF6B00, #FF8C38);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          margin-bottom: 20px;
        }
        .dd-feature-title {
          font-size: 16px;
          font-weight: 700;
          color: #111;
          margin-bottom: 10px;
        }
        .dd-feature-desc {
          font-size: 14px;
          color: #666;
          line-height: 1.7;
        }

        .dd-screens-section {
          background: #fafafa;
          border-top: 1px solid #ebebeb;
          border-bottom: 1px solid #ebebeb;
          padding: 96px 0;
        }
        .dd-screens-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .dd-screens-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 48px;
          margin-bottom: 32px;
        }
        .dd-screen-tab {
          padding: 8px 20px;
          border-radius: 100px;
          border: 1.5px solid #e0e0e0;
          background: #fff;
          font-size: 13px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.15s;
        }
        .dd-screen-tab.active {
          background: #FF6B00;
          border-color: #FF6B00;
          color: #fff;
        }
        .dd-screen-tab:hover:not(.active) {
          border-color: #FF6B00;
          color: #FF6B00;
        }
        .dd-screen-body {
          display: grid;
          grid-template-columns: 1fr 1.8fr;
          gap: 48px;
          align-items: center;
        }
        .dd-screen-info h3 {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #111;
          margin-bottom: 16px;
          line-height: 1.2;
        }
        .dd-screen-info p {
          font-size: 15px;
          color: #555;
          line-height: 1.75;
        }
        .dd-screen-img {
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #e8e8e8;
          box-shadow: 0 16px 60px rgba(0,0,0,0.10);
        }
        .dd-screen-img img {
          width: 100%;
          display: block;
        }

        .dd-how-section { background: #fff; }
        .dd-steps {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
          margin-top: 56px;
        }
        .dd-step {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }
        .dd-step-num {
          flex-shrink: 0;
          width: 48px; height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #FF6B00, #FF8C38);
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          letter-spacing: 0.04em;
        }
        .dd-step-title {
          font-size: 17px;
          font-weight: 700;
          color: #111;
          margin-bottom: 8px;
        }
        .dd-step-body {
          font-size: 14px;
          color: #666;
          line-height: 1.7;
        }

        .dd-cta-section {
          background: linear-gradient(135deg, #FF6B00 0%, #FF8C38 60%, #FFB347 100%);
          padding: 50px 24px;
          text-align: center;
        }
        .dd-cta-section h2 {
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 20px;
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
        }
        .dd-cta-section p {
          font-size: 18px;
          color: rgba(255,255,255,0.85);
          margin-bottom: 40px;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }

        @media (max-width: 900px) {
          .dd-stats-inner { grid-template-columns: repeat(2, 1fr); }
          .dd-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.2); }
          .dd-features-grid { grid-template-columns: repeat(2, 1fr); }
          .dd-screen-body { grid-template-columns: 1fr; }
          .dd-steps { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .dd-features-grid { grid-template-columns: 1fr; }
          .dd-stats-inner { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── Hero ── */}
      <section className="dd-hero">
        
        <h1>Smart Quality Inspection for <em>Manufacturing Excellence</em></h1>
        <p>Defect Detector automatically verifies every product against your client's specifications — catching issues early, reducing rework, and protecting your brand.</p>
        <div className="dd-hero-cta">
          <button className="btn-primary">Request a Demo</button>
          <button className="btn-ghost">See How It Works</button>
        </div>
      </section>

     

      {/* ── Features ── */}
      <div className="dd-section">
        <div className="dd-section-label">Capabilities</div>
        <h2 className="dd-section-title">Everything your quality team needs</h2>
        <p className="dd-section-sub">Five core capabilities that turn your production line into a zero-defect operation.</p>
        <div className="dd-features-grid">
          {features.map((f) => (
            <div className="dd-feature-card" key={f.title}>
              <div className="dd-feature-icon">{f.icon}</div>
              <div className="dd-feature-title">{f.title}</div>
              <div className="dd-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Screen Tour ── */}
      <section className="dd-screens-section">
        <div className="dd-screens-inner">
          <div className="dd-section-label">Platform</div>
          <h2 className="dd-section-title">Built for every role on the floor</h2>
          <p className="dd-section-sub">From real-time camera feeds to model training, every workflow lives in one place.</p>

          <div className="dd-screens-tabs">
            {screens.map((s, i) => (
              <button
                key={s.label}
                className={`dd-screen-tab${activeScreen === i ? " active" : ""}`}
                onClick={() => setActiveScreen(i)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="dd-screen-body">
            <div className="dd-screen-info">
              <div className="dd-section-label" style={{ marginBottom: 12 }}>{screens[activeScreen].label}</div>
              <h3>{screens[activeScreen].title}</h3>
              <p>{screens[activeScreen].desc}</p>
            </div>
            <div className="dd-screen-img">
              <img src={screens[activeScreen].img} alt={screens[activeScreen].title} />
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <div className="dd-section dd-how-section">
        <div className="dd-section-label">Process</div>
        <h2 className="dd-section-title">Up and running in four steps</h2>
        <p className="dd-section-sub">Most teams complete initial deployment in under a week. No machine-learning expertise required.</p>
        <div className="dd-steps">
          {steps.map((s) => (
            <div className="dd-step" key={s.n}>
              <div className="dd-step-num">{s.n}</div>
              <div>
                <div className="dd-step-title">{s.title}</div>
                <div className="dd-step-body">{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="dd-cta-section">
        <h2>Ready to eliminate defects at the source?</h2>
        <p>See Defect Detector running on your product line with a live demo tailored to your environment.</p>
        <div className="dd-hero-cta">
          <button className="btn-primary">Book a Demo</button>
          <button className="btn-ghost">Contact Sales</button>
        </div>
      </section>
    </div>
  );
}
