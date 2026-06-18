import { useState, useEffect, useRef } from "react";

const colors = {
  cream: "#FAF8F5",
  red: "#E8372A",
  redDark: "#C42D21",
  black: "#1A1612",
  amber: "#F5A623",
  gray: "#8B8580",
  grayLight: "#E8E4DF",
  white: "#FFFFFF",
};

// ── Scroll Reveal Hook ──
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// ── Reveal wrapper component ──
function Reveal({ children, delay = 0, style = {} }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(32px)",
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Arrow Icon ──
const ArrowIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ── Play Icon ──
const PlayIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
  </svg>
);

// ── Section Label ──
function SectionLabel({ children, style = {} }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: colors.red,
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 10,
        ...style,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 24,
          height: 2,
          background: style.color || colors.red,
          flexShrink: 0,
        }}
      />
      {children}
    </div>
  );
}

// ── HERO ──
function Hero() {
  const phonesRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      if (phonesRef.current && scrolled < window.innerHeight) {
        phonesRef.current.style.transform = `translateY(${scrolled * 0.12}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const phoneFrameBase = {
    position: "absolute",
    borderRadius: 44,
    overflow: "hidden",
    boxShadow: "0 40px 100px rgba(26,22,18,0.25), 0 0 0 1px rgba(26,22,18,0.06)",
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "100px 6vw 80px",
        position: "relative",
        overflow: "hidden",
        background: colors.cream,
      }}
    >
      {/* Background glows */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 900,
          background: "radial-gradient(circle, rgba(232,55,42,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -100,
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Hero text */}
      <div style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(42px, 5.5vw, 76px)",
            fontWeight: 900,
            lineHeight: 1.05,
            color: colors.black,
            marginBottom: 24,
          }}
        >
          Deliver more.{" "}
          <em style={{ fontStyle: "italic", color: colors.red }}>Every order, effortless.</em>
        </h1>
        <p
          style={{
            fontSize: "clamp(16px, 1.4vw, 18px)",
            color: colors.gray,
            lineHeight: 1.7,
            maxWidth: 520,
            margin: "0 auto 40px",
          }}
        >
          Grab Basket connects customers, local businesses, and delivery partners on a single platform —
          delivering food, groceries, and more in under 30 minutes.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href="#"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: colors.red,
              color: "#fff",
              padding: "16px 32px",
              borderRadius: 100,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(232,55,42,0.35)",
              transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(232,55,42,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(232,55,42,0.35)";
            }}
          >
            <ArrowIcon />
            Get Started Free
          </a>
          <a
            href="#"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "transparent",
              color: colors.black,
              padding: "16px 32px",
              borderRadius: 100,
              border: `1.5px solid ${colors.grayLight}`,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.black;
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = colors.black;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = colors.black;
              e.currentTarget.style.borderColor = colors.grayLight;
            }}
          >
            <PlayIcon />
            Watch Demo
          </a>
        </div>

      </div>

   
      
    </section>
  );
}

// ── NARRATIVE ──
function Narrative() {
  return (
    <section
      style={{
        padding: "120px 6vw",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 80,
        alignItems: "center",
        background: colors.cream,
      }}
    >
      <Reveal>
        <SectionLabel>The Problem</SectionLabel>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(32px, 3.5vw, 52px)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 24,
            color: colors.black,
          }}
        >
          Local businesses deserve better than waiting for customers to find them
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: colors.gray, marginBottom: 20 }}>
          FreshMart sells the freshest groceries on the block. But without the right platform, their
          customers are stuck calling in, their inventory is guesswork, and their growth is limited
          to whoever walks past.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: colors.gray }}>
          Grab Basket changes that. Every neighborhood store, restaurant, and delivery partner gets a
          full-stack digital presence — accessible in seconds, manageable from a phone.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 280,
              borderRadius: 44,
              overflow: "hidden",
              boxShadow: "0 50px 120px rgba(26,22,18,0.2), 0 0 0 1px rgba(26,22,18,0.06)",
            }}
          >
            <img
              src="src/assets/images/grab basket/1.png"
              alt="Consumer Store"
              style={{ width: "110%", display: "fill" }}
            />
          </div>
        
          
          
        </div>
      </Reveal>
    </section>
  );
}

// ── FEATURES ──
const features = [
  {
    tag: "Consumer App",
    title: "Everything nearby, organized beautifully",
    desc: "Customers browse by category — Fruits & Veg, Dairy, Snacks, Bakery — or explore stores ranked by rating and distance. Smart filters surface exactly what they're looking for before they finish typing.",
    outcomes: [
      "Browse 8+ curated categories with visual product cards",
      "See live ratings and delivery times before ordering",
      "Get personalized picks and bestseller badges",
      "Flat discounts and promo codes applied instantly",
    ],
    img: "src/assets/images/grab basket/2.png",
    glow: "radial-gradient(circle, rgba(232,55,42,0.12) 0%, transparent 70%)",
    reverse: false,
  },
  {
    tag: "Smart Cart",
    title: "Checkout in seconds, savings guaranteed",
    desc: "GrabIt's cart is frictionless. Coupon codes apply in one tap, delivery addresses are saved, and the full order breakdown is transparent before a single payment is made.",
    outcomes: [
      "Coupon code GRAB25 — save ₹62 instantly",
      "Transparent fee breakdown with no hidden charges",
      "Saved delivery addresses for one-tap checkout",
      "Quantity controls that update totals in real-time",
    ],
    img: "src/assets/images/grab basket/5.png",
    glow: "radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)",
    reverse: true,
  },
  {
    tag: "Merchant App",
    title: "Your store's command center — always on",
    desc: "FreshMart processed 128 orders today at ₹18,560 in revenue with an 18% growth week-over-week. The partner dashboard surfaces what matters instantly, so store owners spend time on product, not spreadsheets.",
    outcomes: [
      "Live revenue and order count with growth indicators",
      "Weekly performance chart — orders vs. revenue",
      "One-tap quick actions: add products, manage offers",
      "Catalog management with stock toggle controls",
    ],
    img: "src/assets/images/grab basket/4.png",
    glow: "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)",
    reverse: false,
  },
  {
    tag: "Delivery App",
    title: "Every delivery, perfectly coordinated",
    desc: "DeliveryMan completed 12 deliveries today earning ₹1,840 in 5h 20m. The agent Control Center gives delivery partners everything they need — live order details, navigation, and daily earnings — without the noise.",
    outcomes: [
      "Active delivery card with pickup and drop details",
      "One-tap navigation to the customer's address",
      "Real-time earnings, deliveries, and hours online",
      "Toggle online/offline to control availability",
    ],
    img: "src/assets/images/grab basket/8.png",
    glow: "radial-gradient(circle, rgba(232,55,42,0.12) 0%, transparent 70%)",
    reverse: true,
  },
];

function Features() {
  return (
    <section style={{ padding: "0 6vw 120px", background: colors.cream }}>
     

      {features.map((f, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            alignItems: "center",
            padding: "80px 0",
            borderTop: `1px solid ${colors.grayLight}`,
            direction: f.reverse ? "rtl" : "ltr",
          }}
        >
          <Reveal delay={0.05} style={{ direction: "ltr" }}>
            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div
                style={{
                  position: "absolute",
                  width: 300,
                  height: 300,
                  borderRadius: "50%",
                  background: f.glow,
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  width: 260,
                  borderRadius: 44,
                  overflow: "hidden",
                  boxShadow: "0 40px 100px rgba(26,22,18,0.18), 0 0 0 1px rgba(26,22,18,0.06)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <img src={f.img} alt={f.tag} style={{ width: "100%", display: "block" }} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} style={{ direction: "ltr" }}>
            <div
              style={{
                display: "inline-block",
                background: "rgba(232,55,42,0.08)",
                color: colors.red,
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              {f.tag}
            </div>
            <h3
              style={{
                fontSize: "clamp(26px, 2.8vw, 40px)",
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: 16,
                color: colors.black,
              }}
            >
              {f.title}
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: colors.gray, marginBottom: 28 }}>
              {f.desc}
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, padding: 0 }}>
              {f.outcomes.map((o) => (
                <li key={o} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: colors.black, fontWeight: 500 }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "rgba(232,55,42,0.1)",
                      color: colors.red,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 800,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    ✓
                  </span>
                  {o}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      ))}
    </section>
  );
}

// ── WORKFLOW ──
const workflowSteps = [
  { num: "1", img: "src/assets/images/grab basket/2.png", title: "Browse & Discover", desc: "Customer opens GrabIt, sees personalized picks and offers nearby." },
  { num: "2", img: "src/assets/images/grab basket/3.png", title: "Order & Pay", desc: "Add items, apply coupon, confirm address, place order in seconds." },
  { num: "3", img: "src/assets/images/grab basket/7.png", title: "Partner Prepares", desc: "Store gets notified, accepts order, packs items for pickup." },
  { num: "✓", img: "src/assets/images/grab basket/6.png", title: "Track & Receive", desc: "Live map tracking, ETA updates, and delivery confirmation.", isLast: true },
];

function Workflow() {
  return (
    <section
      style={{
        background: colors.black,
        padding: "120px 6vw",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(232,55,42,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(245,166,35,0.08) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />
      <Reveal>
        <div style={{ textAlign: "center", marginBottom: 80, position: "relative" }}>
          <SectionLabel style={{ justifyContent: "center", color: colors.amber }}>
            The Journey
          </SectionLabel>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 3.5vw, 52px)",
              fontWeight: 900,
              lineHeight: 1.1,
              color: "white",
              marginBottom: 16,
            }}
          >
            From craving to doorstep
            <br />
            in four steps
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
            Grab Basket orchestrates the entire delivery loop — so every role in the chain knows exactly
            what to do and when.
          </p>
        </div>
      </Reveal>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
          position: "relative",
        }}
      >
        {/* Connecting line */}
        <div
          style={{
            position: "absolute",
            top: 55,
            left: "12.5%",
            right: "12.5%",
            height: 2,
            background: `linear-gradient(90deg, ${colors.red}, ${colors.amber}, ${colors.red})`,
            zIndex: 0,
            opacity: 0.4,
          }}
        />
        {workflowSteps.map((step, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div style={{ textAlign: "center", padding: "0 20px", position: "relative", zIndex: 1 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: step.isLast ? colors.amber : colors.red,
                  color: "white",
                  fontSize: 20,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: step.isLast
                    ? "0 0 0 8px rgba(245,166,35,0.15)"
                    : "0 0 0 8px rgba(232,55,42,0.15)",
                }}
              >
                {step.num}
              </div>
              <div
                style={{
                  width: 160,
                  borderRadius: 28,
                  overflow: "hidden",
                  margin: "20px auto",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                }}
              >
                <img src={step.img} alt={step.title} style={{ width: "100%", display: "block" }} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 8 }}>
                {step.title}
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── BENEFITS ──
const benefits = [
  { icon: "⚡", title: "Lightning-Fast Delivery", desc: "Average 20-minute delivery windows powered by smart agent routing and real-time store coordination.", outcome: "→ 3× faster than traditional ordering" },
  { icon: "📊", title: "Revenue Visibility", desc: "Partners see daily revenue, weekly trends, and growth percentages — all from the dashboard home screen.", outcome: "→ +22% revenue growth tracked weekly" },
  { icon: "🎯", title: "Smart Discoverability", desc: "Bestseller badges, category filters, and curated \"Top Picks\" surface the right products to the right customers.", outcome: "→ Higher basket size per order" },
  { icon: "🔁", title: "Built-in Loyalty", desc: "Quick Reorder remembers every customer's past orders, making it effortless to come back for their favorites.", outcome: "→ Increased repeat purchase rate" },
  { icon: "🗺️", title: "Live Order Tracking", desc: "Customers follow every step — Confirmed, Packed, On the way, Delivered — with a live map and ETA counter.", outcome: "→ Reduced support queries by 60%" },
  { icon: "🏪", title: "Catalog Control", desc: "Toggle products in/out of stock, monitor unit counts, and add new SKUs without leaving the partner app.", outcome: "→ Zero missed orders from stockouts" },
];

function Benefits() {
  const [hovered, setHovered] = useState(null);

  return (
    <section style={{ padding: "120px 6vw", background: colors.cream }}>
      <Reveal>
        <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 64px" }}>
          <SectionLabel style={{ justifyContent: "center" }}>Why Grab Basket</SectionLabel>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 3.5vw, 52px)",
              fontWeight: 900,
              lineHeight: 1.1,
              color: colors.black,
            }}
          >
            Built around outcomes, not features
          </h2>
        </div>
      </Reveal>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}
      >
        {benefits.map((b, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <div
              style={{
                background: "white",
                borderRadius: 24,
                padding: 32,
                boxShadow: hovered === i
                  ? "0 20px 60px rgba(26,22,18,0.12)"
                  : "0 4px 24px rgba(26,22,18,0.07)",
                transform: hovered === i ? "translateY(-6px)" : "none",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: `linear-gradient(90deg, ${colors.red}, ${colors.amber})`,
                  transform: hovered === i ? "scaleX(1)" : "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform 0.3s ease",
                }}
              />
              <div style={{ fontSize: 36, marginBottom: 16 }}>{b.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{b.title}</div>
              <p style={{ fontSize: 14, color: colors.gray, lineHeight: 1.7 }}>{b.desc}</p>
              <div
                style={{
                  marginTop: 16,
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.red,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {b.outcome}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}


// ── FINAL CTA ──
function FinalCTA() {
  return (
    <section
      style={{
        padding: "120px 6vw",
        textAlign: "center",
        background: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(232,55,42,0.06) 0%, transparent 60%)",
        }}
      />
      <Reveal>
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <SectionLabel style={{ justifyContent: "center", marginBottom: 24 }}>
            Ready to launch?
          </SectionLabel>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(36px, 4.5vw, 64px)",
              fontWeight: 900,
              lineHeight: 1.08,
              marginBottom: 24,
              color: colors.black,
            }}
          >
            Your neighborhood
            <br />
            store.{" "}
            <em style={{ fontStyle: "italic", color: colors.red }}>Supercharged.</em>
          </h2>
          <p style={{ fontSize: 17, color: colors.gray, lineHeight: 1.7, marginBottom: 48 }}>
            Join GrabIt as a customer, partner, or delivery agent. Set up takes minutes. The growth
            starts immediately.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: colors.red,
                color: "#fff",
                padding: "18px 40px",
                borderRadius: 100,
                fontSize: 16,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(232,55,42,0.35)",
                transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(232,55,42,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(232,55,42,0.35)";
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Start Delivering Today
            </a>
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "transparent",
                color: colors.black,
                padding: "18px 40px",
                borderRadius: 100,
                border: `1.5px solid ${colors.grayLight}`,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.black;
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = colors.black;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = colors.black;
                e.currentTarget.style.borderColor = colors.grayLight;
              }}
            >
              List Your Store
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── APP ──
export default function GrabItShowcase() {
  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,900;1,900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    document.body.style.fontFamily = "'Inter', sans-serif";
    document.body.style.background = colors.cream;
    document.body.style.color = colors.black;
    document.body.style.overflowX = "hidden";
    document.body.style.margin = "0";

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Hero />
      <Narrative />
      <Features />
      <Workflow />
      <Benefits />
     
      <FinalCTA />
    </div>
  );
}
