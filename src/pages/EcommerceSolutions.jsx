import { useState, useEffect } from "react";
import styles from "../css/EcommerceSolutions.module.css";
import workflowImg from "../assets/Ecommerce 1.jpeg";
import dashboardImg from "../assets/Ecommerce 2.jpeg";
const FEATURES = [
  {
    title: "Product Management",
    desc: "Effortlessly organize, update, and display your entire product catalog with intuitive tools. From bulk uploads to detailed variant control, managing your inventory has never been simpler.",
  },
  {
    title: "Secure Payment Integration",
    desc: "We integrate industry-leading payment gateways to ensure every transaction is encrypted, compliant, and smooth — giving your customers full confidence at checkout.",
  },
  {
    title: "Inventory Tracking",
    desc: "Stay ahead of stock levels with real-time inventory tracking. Automated alerts and detailed reports ensure you never miss a sale due to an out-of-stock situation.",
  },
  {
    title: "Customer Engagement Tools",
    desc: "Build lasting relationships through personalized recommendations, loyalty programs, wishlist features, reviews, and targeted email campaigns built directly into your store.",
  },
  {
    title: "Mobile-Responsive Design",
    desc: "Every store we build looks and performs flawlessly across all devices — smartphone, tablet, or desktop — capturing every potential sale regardless of how customers browse.",
  },
];

const HERO_TAGS = ["Product Management", "Secure Payments", "Mobile-Ready", "Inventory Tracking"];

const GALLERY_ITEMS = [
  {
    src: workflowImg,
    alt: "E-Commerce Mobile Shopping Experience",
    title: "Mobile Shopping Experience",
    desc: "A frictionless mobile storefront with product browsing, cart, and secure checkout — accessible anywhere.",
  },
  {
    src: dashboardImg,
    alt: "E-Commerce Analytics Dashboard",
    title: "Analytics & Performance Dashboard",
    desc: "Real-time insights into transactions, revenue, conversion rates, and sales by channel, country, and device.",
  },
];

export default function EcommerceSolutions() {
  const [hovered, setHovered] = useState(null);
  
    useEffect(() => {
    document.title = "E-Commerce Solutions | Swivel Technologies";
    }, []);
  
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", background: "#fff", color: "#1a1a1a", minHeight: "100vh" }}>

      {/* HERO */}
      <section className={styles.hero}>
        <p className={styles.heroBadge}>Swivel Technologies</p>

        <h1 className={styles.heroTitle}>
          E-Commerce<br />
          <span className={styles.heroTitleAccent}>Solutions</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Comprehensive platforms that help businesses establish, manage, and grow a thriving online presence — secure, seamless, and built to convert.
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
          Swivel Technologies provides comprehensive e-commerce solutions that enable businesses to establish, manage, and grow their online presence. We create secure, user-friendly, and visually engaging online stores designed to deliver seamless shopping experiences. Whether launching a new online business or enhancing an existing store, our solutions help increase visibility, improve customer satisfaction, and drive sales growth. By leveraging the latest technologies and industry best practices, we help businesses succeed in today's competitive digital marketplace.
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
          © {new Date().getFullYear()} Swivel Technologies — E-Commerce Solutions
        </p>
      </footer>
    </div>
  );
}
