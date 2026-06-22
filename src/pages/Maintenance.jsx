import { useState, useEffect, useRef } from "react";
import "../css/Maintenance.css";
import M1 from "../assets/m1.jpg";
import M2 from "../assets/m2.jpg";

const features = [
  {
    icon: "🖥️",
    title: "System Maintenance",
    desc: "Proactive monitoring, routine inspections, and timely updates that keep your core systems performing at their best.",
  },
  {
    icon: "🔄",
    title: "Software Updates",
    desc: "Scheduled patching and version management to ensure your software stays secure, compatible, and up to date.",
  },
  {
    icon: "🔧",
    title: "Hardware Support",
    desc: "On-site and remote hardware diagnostics, repairs, and replacements to minimize equipment-related downtime.",
  },
  {
    icon: "🏗️",
    title: "Infrastructure Management",
    desc: "End-to-end oversight of your IT infrastructure — from servers and networks to endpoints and cloud environments.",
  },
  {
    icon: "📈",
    title: "Performance Monitoring",
    desc: "Real-time dashboards and predictive analytics that surface issues before they impact your operations.",
  },
  {
    icon: "🔒",
    title: "Security Checks",
    desc: "Regular vulnerability assessments, compliance audits, and security hardening to protect your business assets.",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`maint-fade-in${inView ? " visible" : ""}${className ? " " + className : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export default function Maintenance() {

  useEffect(() => {
  document.title = "Maintenance | Swivel Technologies";
  }, []);

  return (
    <div className="maint-page">

      {/* ── HERO ── */}
      <section className="maint-hero">
        <div className="maint-hero-decor-left" />
        <div className="maint-hero-decor-right" />

        <span className="maint-hero-badge">
          Swivel Technologies · Maintenance
        </span>

        <h1 className="maint-hero-heading">
          Keeping Your Business{" "}
          <span className="maint-hero-accent">
            Running Smoothly
            <span className="maint-hero-accent-underline" />
          </span>
        </h1>

        <p className="maint-hero-sub">
          Reliable, comprehensive maintenance services that protect your systems, reduce downtime, and keep your operations running at full capacity — every day.
        </p>

        <div className="maint-hero-cta">
          <button className="maint-btn-primary">Get Started</button>
          <button className="maint-btn-outline">Explore Services</button>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="maint-stats">
        {[
          { num: "99.9%", label: "Uptime Guaranteed" },
          { num: "< 2hr", label: "Average Response Time" },
          { num: "500+", label: "Systems Maintained" },
          { num: "15+", label: "Years of Expertise" },
        ].map((s, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div className="maint-stat-item">
              <div className="maint-stat-num">{s.num}</div>
              <div className="maint-stat-label">{s.label}</div>
            </div>
          </FadeIn>
        ))}
      </section>

      {/* ── INTRO PROSE ── */}
      <section className="maint-intro">
        <FadeIn>
          <span className="maint-eyebrow">Our Approach</span>
          <h2 className="maint-intro-heading">
            Prevention is always better than repair
          </h2>
          <p className="maint-intro-body">
            Every business relies on systems, equipment, technology, and infrastructure to operate effectively. Without proper maintenance, organizations face unexpected downtime, reduced productivity, and increased repair costs that disrupt daily operations.
          </p>
          <p className="maint-intro-body">
            At Swivel Technologies, we take a proactive approach — routine inspections, preventive measures, and timely updates that identify potential issues before they become major challenges. Our goal is to maintain the efficiency, performance, and longevity of your systems while minimizing operational interruptions.
          </p>
        </FadeIn>
      </section>

      <div className="maint-divider" />

      {/* ── EDITORIAL SECTIONS ── */}
      <div className="maint-editorial">

        {/* Section 1 — Server image left, text right */}
        <div className="maint-edit-section">
          <FadeIn>
            <div className="maint-edit-img-wrap">
              <img
                src={M1}
                alt="Engineer managing server infrastructure"
                className="maint-edit-img"
              />
              <div className="maint-img-accent-bar" />
            </div>
          </FadeIn>

          <FadeIn delay={0.15} className="maint-edit-text">
            <span className="maint-edit-tag">Infrastructure</span>
            <h2 className="maint-edit-heading">
              Proactive care for the systems your business depends on
            </h2>
            <p className="maint-edit-body">
              Maintenance is more than fixing problems when they occur. It involves proactive monitoring, routine inspections, and preventive strategies that help businesses avoid costly breakdowns and ensure continuous operations across all critical systems.
            </p>
            <p className="maint-edit-body">
              Our experienced team covers IT infrastructure, hardware support, software updates, network management, security checks, and operational support — working closely with each client to develop maintenance plans aligned with their specific business needs and goals.
            </p>
          </FadeIn>
        </div>

        {/* Section 2 — Text left, Dashboard image right */}
        <div className="maint-edit-section-reverse">
          <FadeIn>
            <div className="maint-edit-img-wrap">
              <img
                src={M2}
                alt="Maintenance monitoring dashboard"
                className="maint-edit-img"
              />
              <div className="maint-img-accent-bar-right" />
            </div>
          </FadeIn>

          <FadeIn delay={0.15} className="maint-edit-text">
            <span className="maint-edit-tag">Technology</span>
            <h2 className="maint-edit-heading">
              Advanced tools that detect issues before they surface
            </h2>
            <p className="maint-edit-body">
              We leverage automated monitoring systems, real-time performance tracking, and predictive analytics to identify issues early and respond quickly. This proactive approach reduces downtime, improves reliability, and enhances overall system performance.
            </p>
            <p className="maint-edit-body">
              Regular maintenance delivers measurable results: improved operational efficiency, reduced repair costs, enhanced security, longer asset lifespan, and increased productivity — so your teams can focus on core activities with confidence.
            </p>
          </FadeIn>
        </div>

      </div>

      {/* ── FEATURES GRID ── */}
      <section className="maint-features-section">
        <div className="maint-features-inner">
          <FadeIn>
            <div className="maint-features-title-wrap">
              <span className="maint-eyebrow">What We Deliver</span>
              <h2 className="maint-features-title">
                Comprehensive maintenance across every layer
              </h2>
              <p className="maint-features-sub">
                From server rooms to software stacks, our maintenance services are designed to keep every part of your business operating at peak performance.
              </p>
            </div>
          </FadeIn>

          <div className="maint-features-grid">
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="maint-feature-card">
                  <div className="maint-feature-icon">{f.icon}</div>
                  <div className="maint-feature-title">{f.title}</div>
                  <div className="maint-feature-desc">{f.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="maint-cta">
        <div className="maint-cta-circle-1" />
        <div className="maint-cta-circle-2" />

        <FadeIn>
          <h2 className="maint-cta-heading">
            Ready to protect your business systems?
          </h2>
          <p className="maint-cta-sub">
            Whether you need ongoing infrastructure support or a one-time maintenance audit, Swivel Technologies delivers dependable solutions tailored to your needs.
          </p>
          <div className="maint-cta-btn-wrap">
            <button className="maint-cta-btn-white">Get in Touch</button>
            <button className="maint-cta-btn-outline">View All Services</button>
          </div>
        </FadeIn>
      </section>

    </div>
  );
}
