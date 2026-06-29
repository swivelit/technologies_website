import { useState, useEffect } from "react";
import styles from "../css/DigitalPlatformDevelopment.module.css";
import automationImg from "../assets/digital platform 1.jpeg";
import workflowImg from "../assets/digital platform 2.jpeg";

const FEATURES = [
  {
    title: "Custom Web Applications",
    desc: "We build purpose-built web applications tailored to your business logic — intuitive interfaces, robust back-end architecture, and seamless performance across all browsers and devices.",
  },
  {
    title: "Business Portals",
    desc: "Centralized business portals that bring teams, clients, and data together in one secure place — supporting collaboration, document management, role-based access, and real-time communication.",
  },
  {
    title: "Cloud-Based Platforms",
    desc: "Scalable cloud infrastructure ensures your platform grows with your business. We architect solutions on leading cloud providers that guarantee high availability, security, and cost efficiency.",
  },
  {
    title: "Customer Engagement Systems",
    desc: "From self-service portals to loyalty platforms and interactive dashboards, we build engagement tools that strengthen customer relationships and improve satisfaction at every touchpoint.",
  },
  {
    title: "Digital Transformation Acceleration",
    desc: "We guide organizations through end-to-end digital transformation — modernizing legacy systems, integrating emerging technologies, and building the digital ecosystems needed to compete and grow.",
  },
];

const HERO_TAGS = ["Web Applications", "Cloud Platforms", "Business Portals", "Digital Transformation"];

const GALLERY_ITEMS = [
  {
    src: automationImg,
    alt: "Cloud Ops Control Panel",
    title: "Cloud Operations Control Panel",
    desc: "A unified cloud ops interface managing CI/CD pipelines, infrastructure as code, auto-scaling, CDN, and serverless deployments in real time.",
  },
  {
    src: workflowImg,
    alt: "Digital Transformation",
    title: "End-to-End Digital Transformation",
    desc: "Integrating AI, cloud, security, analytics, and automation into a cohesive digital ecosystem built for the future.",
  },
];

export default function DigitalPlatformDevelopment() {
  const [hovered, setHovered] = useState(null);
  
    useEffect(() => {
    document.title = "Digital Platform Development | Swivel Technologies";
    }, []);
  
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", background: "#fff", color: "#1a1a1a", minHeight: "100vh" }}>

      {/* HERO */}
      <section className={styles.hero}>
        <p className={styles.heroBadge}>Swivel Technologies</p>

        <h1 className={styles.heroTitle}>
          Digital Platform<br />
          <span className={styles.heroTitleAccent}>Development</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Modern digital platforms built for scalability, security, and seamless user experience — powering businesses in a connected world.
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
          At Swivel Technologies, we develop modern digital platforms that help businesses operate more efficiently, connect with customers, and achieve sustainable growth. Our solutions are designed with scalability, security, and user experience in mind, ensuring that businesses can adapt to changing market demands. From custom web applications and business portals to cloud-based platforms and customer engagement systems, we create technology that delivers real value. By combining innovation, functionality, and performance, we help organizations streamline operations, improve collaboration, and accelerate digital transformation. Our goal is to build reliable digital ecosystems that empower businesses to succeed in an increasingly connected world.
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
          © {new Date().getFullYear()} Swivel Technologies — Digital Platform Development
        </p>
      </footer>
    </div>
  );
}
