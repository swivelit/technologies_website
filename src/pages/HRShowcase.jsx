import { useState, useEffect, useRef } from "react";
import "../css/HRShowcase.css";
import Hr1 from "../assets/hr2.jpg";
import Hr2 from "../assets/hr3.jpg";

const features = [
  {
    icon: "💰",
    title: "Payroll Coordination",
    desc: "Accurate, timely payroll processing with automated calculations, tax compliance, and transparent reporting.",
  },
  {
    icon: "🚀",
    title: "Recruitment & Onboarding",
    desc: "Streamlined hiring workflows from job posting through onboarding, reducing time-to-productivity for new hires.",
  },
  {
    icon: "📊",
    title: "Performance Management",
    desc: "Structured review cycles, goal tracking, and 360° feedback tools that connect individual growth to business outcomes.",
  },
  {
    icon: "🤝",
    title: "Employee Engagement",
    desc: "Pulse surveys, recognition programs, and engagement analytics that build culture and reduce turnover.",
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
      className={`fade-in${inView ? " visible" : ""}${className ? " " + className : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export default function HRShowcase() {
  return (
    <div className="hr-page">

      {/* ── hr ── */}
      <section className="hr">
        <div className="hr-decor-left" />
        <div className="hr-decor-right" />

        <span className="hr-badge">
          Swivel Technologies · Administration &amp; HR
        </span>

        <h1 className="hr-heading">
          Building Strong Workplaces Through{" "}
          <span className="hr-accent">
            Effective People Management
            <span className="hr-accent-underline" />
          </span>
        </h1>

        <p className="hr-sub">
          Comprehensive Administration and HR solutions designed to help businesses manage their workforce efficiently while improving overall organizational performance.
        </p>

        <div className="hr-cta">
          <button className="btn-primary">Get Started</button>
          <button className="btn-outline">Explore Services</button>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats">
        {[
          { num: "250+", label: "Enterprises Served" },
          { num: "92%", label: "Client Retention Rate" },
          { num: "4.8★", label: "Average Satisfaction" },
          { num: "$45M+", label: "Payroll Managed Monthly" },
        ].map((s, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div className="stat-item">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </FadeIn>
        ))}
      </section>

      {/* ── INTRO PROSE ── */}
      <section className="intro">
        <FadeIn>
          <span className="eyebrow">Our Approach</span>
          <h2 className="intro-heading">
            People are the engine of every successful organization
          </h2>
          <p className="intro-body">
            Every successful organization depends on strong administration and efficient human resource management. While products and services drive business growth, it is the people behind the organization who make that growth possible. Effective Administration and HR practices help businesses create organized operations, maintain productive work environments, and build strong teams that contribute to long-term success.
          </p>
          <p className="intro-body">
            At Swivel Technologies, we provide comprehensive Administration and HR solutions designed to help businesses manage their workforce efficiently while improving overall organizational performance. Our services focus on creating streamlined processes, enhancing employee experiences, and supporting business objectives through effective people management.
          </p>
        </FadeIn>
      </section>

      <div className="divider" />

      {/* ── EDITORIAL SECTIONS ── */}
      <div className="editorial">

        {/* Section 1 — Image left, text right */}
        <div className="edit-section">
          <FadeIn>
            <div className="edit-img-wrap">
              <img
                src={Hr1}
                alt="Team collaborating in a meeting"
                className="edit-img"
              />
              <div className="img-accent-bar" />
            </div>
          </FadeIn>

          <FadeIn delay={0.15} className="edit-text">
            <span className="edit-tag">Administration</span>
            <h2 className="edit-heading">
              Structured operations that let your teams focus on what matters
            </h2>
            <p className="edit-body">
              Administration plays a critical role in ensuring the smooth functioning of daily business operations. From managing records and coordinating internal processes to maintaining workplace efficiency, effective administration helps organizations operate in a structured and organized manner.
            </p>
            <p className="edit-body">
              A well-managed administrative system improves productivity, reduces operational challenges, and allows teams to focus on achieving business goals. We assist businesses in managing employee records, attendance tracking, payroll coordination, policy implementation, document management, and compliance requirements.
            </p>
          </FadeIn>
        </div>

        {/* Section 2 — Text left, Dashboard right */}
        <div className="edit-section-reverse">
          <FadeIn>
            <div className="edit-img-wrap">
              <img
                src={Hr2}
                alt="HR management dashboard interface"
                className="edit-img"
              />
              <div className="img-accent-bar-right" />
            </div>
          </FadeIn>

          <FadeIn delay={0.15} className="edit-text">
            <span className="edit-tag">Human Resources</span>
            <h2 className="edit-heading">
              Technology-driven HR that turns data into better decisions
            </h2>
            <p className="edit-body">
              Human Resources is responsible for attracting, developing, and retaining talented employees who contribute to the success of the organization. Our HR solutions help businesses manage recruitment, onboarding, employee engagement, performance management, training, and workforce development.
            </p>
            <p className="edit-body">
              We leverage digital tools and automation technologies to improve administrative efficiency and streamline HR processes — from employee management systems and performance tracking tools to automated workflows and real-time reporting solutions that help businesses save time and improve decision-making.
            </p>
          </FadeIn>
        </div>

      </div>

      {/* ── FEATURES GRID ── */}
      <section className="features-section">
        <div className="features-inner">
          <FadeIn>
            <div className="features-title-wrap">
              <span className="eyebrow">What We Deliver</span>
              <h2 className="features-title">
                End-to-end workforce management capabilities
              </h2>
              <p className="features-sub">
                Our Administration and HR services are designed to simplify workforce management through efficient processes and modern technology.
              </p>
            </div>
          </FadeIn>

          <div className="features-grid">
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta">
        <div className="cta-circle-1" />
        <div className="cta-circle-2" />

        <FadeIn>
          <h2 className="cta-heading">
            Ready to build a stronger workforce?
          </h2>
          <p className="cta-sub">
            Whether you're a growing startup or an established organization, Swivel Technologies provides customized solutions tailored to your business needs.
          </p>
          <div className="cta-btn-wrap">
            <button className="cta-btn-white">Get in Touch</button>
            <button className="cta-btn-outline">View All Services</button>
          </div>
        </FadeIn>
      </section>

    </div>
  );
}
