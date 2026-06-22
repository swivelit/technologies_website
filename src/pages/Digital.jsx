import React, { useEffect, useRef, useState } from "react";
import "../css/Digital.css";
import digitalmarketing from "../assets/Digital-marketing-website.png";

const SERVICES = [
  {
    tag: "01",
    name: "SEO",
    full: "Search Engine Optimization",
    desc: "We get your business found first — on the searches that actually convert.",
  },
  {
    tag: "02",
    name: "Social",
    full: "Social Media Marketing",
    desc: "Content and campaigns that turn followers into customers, platform by platform.",
  },
  {
    tag: "03",
    name: "Content",
    full: "Content Marketing",
    desc: "Stories and assets that build trust before a customer ever talks to your sales team.",
  },
  {
    tag: "04",
    name: "PPC",
    full: "Pay-Per-Click Advertising",
    desc: "Paid campaigns engineered for return, not just reach.",
  },
  {
    tag: "05",
    name: "Email",
    full: "Email Marketing",
    desc: "Lifecycle messaging that keeps your audience close and your pipeline warm.",
  },
  {
    tag: "06",
    name: "AI Marketing",
    full: "AI-Powered Solutions",
    desc: "AI-driven targeting, automation and personalization that scales what works.",
  },
];

const BENEFITS = [
  { label: "Targeted Audience", note: "Reach the people most likely to buy" },
  { label: "Higher ROI", note: "Spend that's tracked back to revenue" },
  { label: "Stronger Engagement", note: "Content people actually act on" },
  { label: "Measurable Results", note: "Every metric tied to a business goal" },
];

function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );

    obs.observe(el);

    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView(0.15);

  return (
    <div
      ref={ref}
      className={`sw-reveal ${
        inView ? "sw-reveal-in" : ""
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ---------- Hand-built analytics signature (no images) ---------- */

function LineSpark() {
  const pts = [8, 22, 14, 30, 24, 20, 34, 44, 30, 50, 40, 58, 52, 46, 60];
  const max = Math.max(...pts);
  const w = 280;
  const h = 70;
  const step = w / (pts.length - 1);

  const path = pts
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${i * step},${h - (p / max) * h}`
    )
    .join(" ");

  const area = `${path} L ${w},${h} L 0,${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="sw-spark"
      preserveAspectRatio="none"
    >
      <path
        d={area}
        fill="url(#sw-spark-fill)"
        stroke="none"
      />

      <path
        d={path}
        fill="none"
        stroke="#FF5A1F"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <defs>
        <linearGradient
          id="sw-spark-fill"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#FF5A1F"
            stopOpacity="0.18"
          />
          <stop
            offset="100%"
            stopColor="#FF5A1F"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Donut() {
  const slices = [
    { v: 45, c: "#FF5A1F" },
    { v: 25, c: "#2B2B2B" },
    { v: 15, c: "#FFB088" },
    { v: 10, c: "#FFD7BC" },
    { v: 5, c: "#F2E4D8" },
  ];

  let acc = 0;

  const stops = slices
    .map((s) => {
      const start = acc;
      acc += s.v;
      return `${s.c} ${start}% ${acc}%`;
    })
    .join(", ");

  return (
    <div
      className="sw-donut"
      style={{
        background: `conic-gradient(${stops})`,
      }}
    >
      <div className="sw-donut-hole" />
    </div>
  );
}

function Bars() {
  const vals = [30, 42, 38, 55, 48, 62, 58, 70, 64, 80];

  return (
    <div className="sw-bars">
      {vals.map((v, i) => (
        <div
          key={i}
          className="sw-bar"
          style={{ height: `${v}%` }}
        />
      ))}
    </div>
  );
}

function AnalyticsCard() {
  return (
    <div className="sw-analytics-card">
      <div className="sw-analytics-row">
        <div className="sw-analytics-tile">
          <p className="sw-tile-label">Website Traffic</p>
          <LineSpark />
        </div>

        <div className="sw-analytics-tile sw-analytics-tile--donut">
          <p className="sw-tile-label">Top Channels</p>
          <Donut />
        </div>
      </div>

      <div className="sw-analytics-row">
        <div className="sw-analytics-tile">
          <p className="sw-tile-label">Campaign Volume</p>
          <Bars />
        </div>

        <div className="sw-analytics-tile sw-analytics-tile--stats">
          <p className="sw-tile-label">Campaign Performance</p>

          <div className="sw-stat-grid">
            <div>
              <span className="sw-stat-num">10,500</span>
              <span className="sw-stat-name">Clicks</span>
              <span className="sw-stat-delta">+8.2%</span>
            </div>

            <div>
              <span className="sw-stat-num">6,500</span>
              <span className="sw-stat-name">Conversions</span>
              <span className="sw-stat-delta">+12.5%</span>
            </div>

            <div>
              <span className="sw-stat-num">6.2%</span>
              <span className="sw-stat-name">Conv. Rate</span>
              <span className="sw-stat-delta">+9.8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DigitalMarketingPage() {
  return (
    <div className="digital-page sw-page">
    {/* ---------------- HERO ---------------- */}
      <section className="sw-hero">
        <div className="sw-hero-inner">
          <div className="sw-hero-content">
          <span className="sw-hero-eyebrow">
            Swivel Technologies · Digital Marketing
          </span>

          <h1>
            Grow your business with <em>smart</em> digital marketing
          </h1>

          <p className="sw-hero-sub">
            Customers find businesses online before they ever pick up the phone.
            We build the strategy, content and campaigns that put you in front of
            the right people — and turn that visibility into revenue.
          </p>

          <div className="sw-hero-ctas">
            <button className="sw-btn sw-btn--primary">
              Get Started
            </button>

            <button className="sw-btn sw-btn--ghost">
              See Our Services
            </button>
          </div>

          <div className="sw-ticker">
            <span>SEO</span>
            <span>Social Media</span>
            <span>Content</span>
            <span>PPC</span>
            <span>Email</span>
            <span>AI Marketing</span>
          </div>
        </div>
            
            <div className="sw-hero-image">
              <img
                src={digitalmarketing}
                alt="Digital marketing illustration"
              />
            </div>
          </div>

      </section>

      {/* ---------------- INTRO ---------------- */}
      <section className="sw-intro">
        <div className="sw-wrap sw-intro-grid">
          <Reveal>
            <span className="sw-eyebrow">Why It Matters</span>
          </Reveal>

          <Reveal delay={80} className="sw-intro-body">
            <p className="sw-intro-lede">
              If your business isn't visible where customers are already
              looking, you're losing ground to competitors who are.
            </p>

            <p>
              At Swivel Technologies, we help businesses build a strong digital
              presence that attracts the right audience and creates meaningful
              growth. Our strategies increase visibility, improve engagement and
              generate measurable results — by combining creativity,
              technology and market insight.
            </p>

            <p>
              Digital marketing is more than running ads or posting content.
              It's about understanding your audience, building trust, and
              delivering the right message at the right time. We develop
              strategies that align with your goals and support long-term
              success, not just short-term spikes.
            </p>
          </Reveal>
        </div>
      </section>
      {/* ---------------- SERVICES ---------------- */}
      <section className="sw-services">
        <div className="sw-wrap">
          <Reveal>
            <div className="sw-section-head">
              <div>
                <span className="sw-eyebrow">What We Do</span>
                <h2>A complete range of digital marketing services</h2>
              </div>

              <p>
                Each service is planned to improve visibility, drive targeted
                traffic, and turn visitors into loyal customers.
              </p>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div className="sw-services-grid">
              {SERVICES.map((s) => (
                <div
                  className="sw-service-card"
                  key={s.name}
                >
                  <span className="sw-service-tag">
                    {s.tag}
                  </span>

                  <h3>{s.name}</h3>

                  <p className="sw-service-full">
                    {s.full}
                  </p>

                  <p className="sw-service-desc">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- SIGNATURE : ANALYTICS ---------------- */}
      <section className="sw-signature">
        <div className="sw-wrap sw-signature-grid">
          <Reveal>
            <span className="sw-eyebrow">
              Data-Driven, Always
            </span>

            <h2>
              We optimize toward outcomes — not just impressions
            </h2>

            <p>
              We continuously monitor campaign performance and analyse
              customer behaviour to find opportunities that maximize
              return.
            </p>
            <p>
              AI-driven tools sharpen audience targeting,
              automate the busywork, and personalize
              experiences at a scale manual marketing
              can't match.
            </p>

            <ul className="sw-signature-list">
              <li>
                Real-time tracking across every channel
                you run
              </li>

              <li>
                AI-assisted targeting, automation and
                personalization
              </li>

              <li>
                Strategy adjusted continuously, not just
                at quarter-end
              </li>

              <li>
                Reporting tied directly to leads,
                conversions and revenue
              </li>
            </ul>
          </Reveal>

          <Reveal delay={100}>
            <AnalyticsCard />
          </Reveal>
        </div>
      </section>

      {/* ---------------- APPROACH ---------------- */}
      <section className="sw-approach">
        <div className="sw-wrap">
          <Reveal>
            <div className="sw-section-head">
              <div>
                <span className="sw-eyebrow">
                  Our Approach
                </span>

                <h2>
                  No generic playbooks —
                  strategy built around your business
                </h2>
              </div>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div className="sw-approach-grid">

              <div className="sw-approach-block">
                <span className="sw-approach-num">
                  Understand
                </span>

                <h3>
                  Your industry, audience and
                  challenges first
                </h3>
                <p>
                  We take the time to understand your industry,
                  your target audience, your business objectives
                  and your market challenges before we write a
                  single line of strategy. Startup or established
                  company — the plan is built around where you're
                  trying to go.
                </p>
              </div>

              <div className="sw-approach-block">
                <span className="sw-approach-num">
                  Execute
                </span>

                <h3>
                  Strategies built for visibility
                  and conversion
                </h3>

                <p>
                  Search, social, content, paid media and email
                  working together — not in isolation — so every
                  channel reinforces the next and the customer
                  journey stays consistent end to end.
                </p>
              </div>

              <div className="sw-approach-block">
                <span className="sw-approach-num">
                  Optimize
                </span>

                <h3>
                  Continuous testing, never a
                  "set and forget" plan
                </h3>

                <p>
                  Campaign performance is reviewed constantly.
                  What's working scales, what isn't gets
                  reworked — so your budget keeps moving
                  toward what actually drives results.
                </p>
              </div>

              <div className="sw-approach-block">
                <span className="sw-approach-num">
                  Grow
                </span>

                <h3>
                  Long-term relationships,
                  not one-off wins
                </h3>

                <p>
                  More traffic and leads matter,
                  but the real goal is durable brand
                  credibility and customer relationships
                  that keep paying off long after the
                  campaign ends.
                </p>
              </div>

            </div>
          </Reveal>
        </div>
      </section>
      {/* ---------------- BENEFITS ---------------- */}
      <section className="sw-benefits">
        <div className="sw-wrap">
          <Reveal>
            <div className="sw-section-head">
              <div>
                <span className="sw-eyebrow">
                  The Payoff
                </span>

                <h2>
                  What a strong digital strategy
                  gets you
                </h2>
              </div>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div className="sw-benefits-grid">
              {BENEFITS.map((b, i) => (
                <div
                  className="sw-benefit"
                  key={b.label}
                >
                  <span className="sw-benefit-num">
                    0{i + 1}
                  </span>

                  <h4>{b.label}</h4>

                  <p>{b.note}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- CLOSING CTA ---------------- */}
      <Reveal>
        <section className="sw-cta">
          <span className="sw-eyebrow">
            Ready When You Are
          </span>

          <h2>
            Let's transform your digital presence
            into a growth engine
          </h2>
          <p>
            Through innovative strategy,
            advanced technology and a
            customer-first approach, we help
            brands grow, connect with their
            audience, and achieve results
            you can measure.
          </p>

          <button className="sw-btn sw-btn--primary">
            Talk to Swivel Technologies
          </button>
        </section>
      </Reveal>
      </div>
  );
}

export default DigitalMarketingPage;