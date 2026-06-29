import { useState, useEffect } from "react";
import styles from "../css/BusinessProcessAutomation.module.css";
import workflowImg from "../assets/Automation 1.jpeg";
import dashboardImg from "../assets/Automation 2.jpeg";

const FEATURES = [
  {
    title: "Workflow Automation",
    desc: "We design and implement intelligent workflow systems that automate multi-step business processes — from approvals and escalations to notifications — eliminating bottlenecks and manual hand-offs across teams.",
  },
  {
    title: "Repetitive Task Reduction",
    desc: "Routine, time-consuming tasks such as data entry, form processing, and report generation are automated so your team can redirect energy toward higher-value, strategic work.",
  },
  {
    title: "Data Management & Reporting",
    desc: "Automated data pipelines collect, clean, and consolidate information from multiple sources, generating accurate real-time reports and dashboards without manual intervention.",
  },
  {
    title: "Approval & Compliance Automation",
    desc: "Structured approval flows ensure the right stakeholders are notified, reviews happen on schedule, and audit trails are maintained — keeping operations compliant and accountable.",
  },
  {
    title: "Smart Integrations",
    desc: "Our solutions connect your existing software ecosystem — CRMs, ERPs, HR platforms, and more — through intelligent integrations that allow data and actions to flow seamlessly between systems.",
  },
];

const HERO_TAGS = ["Workflow Automation", "Task Reduction", "Smart Integrations", "Scalable Systems"];

const GALLERY_ITEMS = [
  {
    src: workflowImg,
    alt: "Business Workflow Automation",
    title: "Intelligent Workflow Systems",
    desc: "Connected automation nodes powering communication, analytics, team coordination, and process management in real time.",
  },
  {
    src: dashboardImg,
    alt: "Workflow Management Dashboard",
    title: "Workflow Management Dashboard",
    desc: "A unified dashboard tracking task progress, approvals, notifications, and performance metrics across all departments.",
  },
];

export default function BusinessProcessAutomation() {
  const [hovered, setHovered] = useState(null);
  
    useEffect(() => {
    document.title = "Business Process Automation | Swivel Technologies";
    }, []);
  
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", background: "#fff", color: "#1a1a1a", minHeight: "100vh" }}>

      {/* HERO */}
      <section className={styles.hero}>
        <p className={styles.heroBadge}>Swivel Technologies</p>

        <h1 className={styles.heroTitle}>
          Business Process<br />
          <span className={styles.heroTitleAccent}>Automation</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Intelligent automation systems that streamline workflows, reduce errors, and free your team to focus on strategic growth.
        </p>

        <div className={styles.heroTags}>
          {HERO_TAGS.map((tag) => (
            <span key={tag} className={styles.heroTag}>{tag}</span>
          ))}
        </div>
      </section>

      {/* INTRO */}
      <section className={styles.intro}>
        <p className={styles.introParagraph}>
          Business Process Automation solutions from Swivel Technologies help organizations improve productivity by reducing repetitive tasks and streamlining workflows. We develop intelligent systems that automate routine operations, data management, reporting, approvals, and customer interactions. By integrating automation into business processes, companies can minimize errors, save valuable time, and focus on strategic growth initiatives. Our automation solutions are tailored to meet unique business requirements, ensuring efficiency and scalability. Through innovative technology and smart integrations, we empower businesses to optimize performance, enhance operational excellence, and achieve greater efficiency across departments.
        </p>
      </section>

      {/* DIVIDER */}
      <div className={styles.divider} />

      {/* FEATURES */}
      <section className={styles.features}>
        <h2 className={styles.featuresHeading}>What Our Platform Includes</h2>

        <div className={styles.featureList}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.featureItem}>
              <div className={styles.featureNumber}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section className={styles.gallery}>
        <div className={styles.galleryInner}>
          <h2 className={styles.galleryHeading}>See It in Action</h2>

          <div className={styles.galleryGrid}>
            {GALLERY_ITEMS.map((item) => (
              <div key={item.alt} className={styles.galleryCard}>
                <img
                  src={item.src}
                  alt={item.alt}
                  className={styles.galleryImage}
                />
                <div className={styles.galleryCardBody}>
                  <p className={styles.galleryCardTitle}>{item.title}</p>
                  <p className={styles.galleryCardDesc}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          © {new Date().getFullYear()} Swivel Technologies — Business Process Automation
        </p>
      </footer>
    </div>
  );
}
