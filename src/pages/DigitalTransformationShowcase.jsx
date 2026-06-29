import { useState, useEffect } from "react";
import styles from "../css/DigitalTransformationBrandPresence.module.css";
import workflowImg from "../assets/digital transformation 1.jpeg";
import automationImg from "../assets/digital transformation 2.jpeg";
const FEATURES = [
  {
    title: "Digital Identity & Modern Websites",
    desc: "We craft compelling digital identities backed by modern, fast-loading websites that reflect your brand, communicate your value, and convert visitors into customers across every device.",
  },
  {
    title: "Digital Marketing Support",
    desc: "From SEO and content strategy to social media and paid campaigns, we provide digital marketing support that increases your visibility, drives qualified traffic, and grows your audience.",
  },
  {
    title: "Customer Engagement Strategies",
    desc: "We design engagement strategies that keep customers coming back — personalized experiences, loyalty programs, targeted communications, and feedback loops that strengthen brand relationships.",
  },
  {
    title: "Business Process Improvement",
    desc: "Digital transformation goes beyond the website. We assess and re-engineer internal processes using technology to reduce friction, improve team efficiency, and deliver better outcomes.",
  },
  {
    title: "Brand Visibility Across Digital Channels",
    desc: "We help brands show up consistently and powerfully across all relevant digital channels — search, social, email, and beyond — expanding reach and building lasting credibility.",
  },
];

const HERO_TAGS = ["Digital Identity", "Brand Visibility", "Marketing Support", "Customer Engagement"];

const GALLERY_ITEMS = [
  {
    src: workflowImg,
    alt: "Brand Visibility Across Social Channels",
    title: "Reach Across Every Channel",
    desc: "Growing brand visibility consistently across the platforms your audience already spends time on.",
  },
  {
    src: automationImg,
    alt: "Digital Transformation Strategy",
    title: "A Strategy Built Around You",
    desc: "Aligning technology, process, and people to support long-term business goals.",
  },
];

export default function DigitalTransformationBrandPresence() {
  const [hovered, setHovered] = useState(null);
  
    useEffect(() => {
    document.title = "Digital Transformation & Brand Presence | Swivel Technologies";
    }, []);
  
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", background: "#fff", color: "#1a1a1a", minHeight: "100vh" }}>

      {/* HERO */}
      <section className={styles.hero}>
        <p className={styles.heroBadge}>Swivel Technologies</p>

        <h1 className={styles.heroTitle}>
          Digital Transformation<br />
          <span className={styles.heroTitleAccent}>& Brand Presence</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Building strong digital identities, expanding brand reach, and driving long-term growth through innovation and strategy.
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
          In today's digital landscape, a strong online presence is essential for business success. Swivel Technologies helps organizations strengthen their digital identity through innovative technology solutions, modern websites, digital marketing support, and customer engagement strategies. Our approach to digital transformation focuses on improving business processes, enhancing customer experiences, and increasing brand visibility across digital channels. We work closely with businesses to develop strategies that align with their goals and market demands. By combining technology, creativity, and innovation, we help brands build credibility, expand their reach, and achieve long-term growth in an increasingly connected world.
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
          © {new Date().getFullYear()} Swivel Technologies — Digital Transformation & Brand Presence
        </p>
      </footer>
    </div>
  );
}
