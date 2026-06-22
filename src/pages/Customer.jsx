import React from "react";
import "../css/Customer.css";
import support1 from "../assets/Customer-Support-1.jpg";
import support2 from "../assets/Customer-Support-2.jpg";

const FRAUNCES =
  "'Fraunces', 'Iowan Old Style', 'Times New Roman', serif";

const INTER =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function Eyebrow({ children }) {
  return <div className="customer-eyebrow">{children}</div>;
}

function ChannelDial() {
  return (
    <svg
      viewBox="0 0 640 120"
      width="100%"
      height="auto"
      className="channel-dial"
      aria-hidden="true"
    >
      <path
        d="M20 90 C 120 10, 200 110, 320 60 S 520 10, 620 90"
        fill="none"
        stroke="#FFD9BE"
        strokeWidth="3"
      />

      {[
        { x: 20, y: 90, label: "Phone" },
        { x: 213, y: 73, label: "Chat" },
        { x: 426, y: 38, label: "Email" },
        { x: 620, y: 90, label: "Social" },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="9" fill="#FF6A1A" />
          <circle
            cx={p.x}
            cy={p.y}
            r="16"
            fill="none"
            stroke="#FF6A1A"
            strokeWidth="1.5"
            opacity="0.35"
          />
        </g>
      ))}
    </svg>
  );
}

function Stat({ value, label }) {
  return (
    <div className="customer-stat">
      <div className="customer-stat-value">
        {value}
      </div>

      <div className="customer-stat-label">
        {label}
      </div>
    </div>
  );
}

function SectionLabel({ eyebrow, title, sub }) {
  return (
    <div className="section-label">
      <Eyebrow>{eyebrow}</Eyebrow>

      <h2 className="section-title">
        {title}
      </h2>

      {sub && (
        <p className="section-subtitle">
          {sub}
        </p>
      )}
    </div>
  );
}

const channelCards = [
  {
    icon: "🛠️",
    title: "Technical assistance",
    text: "Skilled support professionals resolve product and service issues with clear, step-by-step guidance.",
  },
  {
    icon: "📞",
    title: "Phone & live chat",
    text: "Reach a real person fast, through whichever channel feels easiest in the moment.",
  },
  {
    icon: "🤖",
    title: "24/7 AI assistance",
    text: "Automated, always-on responses handle routine questions instantly, day or night.",
  },
  {
    icon: "✉️",
    title: "Email & social",
    text: "Consistent, monitored responses across every inbox and platform your customers use.",
  },
  {
    icon: "🌐",
    title: "Omnichannel coverage",
    text: "One unified view of every conversation, so nothing slips between channels.",
  },
  {
    icon: "🤝",
    title: "Dedicated teams",
    text: "Trained specialists who know your product and treat every customer as a relationship, not a ticket.",
  },
];

const advantages = [
  {
    title: "Faster resolutions",
    text: "Intelligent ticket management and real-time assistance cut response times without cutting corners.",
  },
  {
    title: "Built on trust",
    text: "Every interaction is designed to make customers feel valued, heard, and confident in your brand.",
  },
  {
    title: "Smarter over time",
    text: "Customer behaviour analysis helps your team anticipate needs before they become complaints.",
  },
  {
    title: "Reliable at scale",
    text: "Modern tooling and skilled people work together so quality holds steady as volume grows.",
  },
];

function CustomerSupportPage() {
  return (
    <div className="customer-page">

      {/* HERO */}
      <section className="customer-hero">
        <Eyebrow>
          Customer Support Services
        </Eyebrow>

        <h1 className="customer-hero-title">
          Delivering exceptional customer
          <br />
          experiences through reliable support
        </h1>

        <p className="customer-hero-text">
          At Swivel Technologies, we turn every customer interaction into a
          moment of trust — quick responses, clear communication, and support
          that makes people feel genuinely heard.
        </p>

        <div className="customer-channel-wrap">
          <ChannelDial />
        </div>

        <div className="customer-hero-buttons">
          <button className="customer-btn customer-btn-primary">
            Talk to our team
          </button>

          <button className="customer-btn customer-btn-outline">
            Explore our services
          </button>
        </div>

        <div className="customer-stats">
          <Stat
            value="24/7"
            label="Always-on coverage"
          />

          <Stat
            value="5+"
            label="Support channels"
          />

          <Stat
            value="100%"
            label="Customer-first focus"
          />
        </div>
      </section>

      {/* INTRO COPY */}
      <section className="customer-intro">
        <div className="customer-intro-container">

          <Eyebrow>
            Why support matters
          </Eyebrow>

          <p className="customer-intro-title">
            Customer satisfaction is one of the most important factors in
            building a successful business. A positive support experience
            doesn't just resolve issues — it builds trust, strengthens
            relationships, and earns long-term loyalty.
          </p>

          <p className="customer-intro-text">
            We believe every customer interaction matters. Whether someone
            needs product information, technical assistance, service updates,
            or issue resolution, our support team delivers professional,
            personalized help — understanding needs and responding
            efficiently so businesses can build a reputation customers trust.
          </p>

        </div>
      </section>

      {/* CHANNELS GRID */}
      <section className="customer-channels">

        <SectionLabel
          eyebrow="Every channel, one team"
          title="Support that meets customers where they are"
          sub="Phone, email, live chat, social media, and digital platforms — all connected, so customers can reach you however is easiest for them."
        />

        <div className="customer-channels-grid">

          {channelCards.map((c, i) => (
            <div
              key={i}
              className="customer-channel-card"
            >
              <div className="customer-channel-icon">
                {c.icon}
              </div>

              <h3 className="customer-channel-title">
                {c.title}
              </h3>

              <p className="customer-channel-text">
                {c.text}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* TECHNOLOGY + PEOPLE */}
      <section className="customer-tech-section">
        <div className="customer-tech-grid">

          <div className="customer-tech-content">

            <Eyebrow>
              People + technology
            </Eyebrow>

            <h2 className="customer-tech-title">
              Skilled people, backed by smart technology
            </h2>

            <p className="customer-tech-text">
              We combine skilled support professionals with modern tooling to
              manage inquiries, track requests, and monitor response times.
              AI-powered automation, intelligent ticket routing, and
              real-time assistance let our teams focus on the complex,
              human moments that need a real person — while routine questions
              get answered instantly.
            </p>

            <div className="customer-features-grid">

              {[
                "Automated responses",
                "Intelligent ticketing",
                "Behaviour analysis",
                "Real-time assistance",
              ].map((feature, i) => (
                <div
                  key={i}
                  className="customer-feature-item"
                >
                  <span className="customer-feature-dot"></span>

                  <span className="customer-feature-text">
                    {feature}
                  </span>
                </div>
              ))}

            </div>
          </div>

          <div className="customer-tech-image">
            <img
             src={support1}
              alt="AI-powered support tools in use on a laptop"
            />
          </div>

        </div>
      </section>

      {/* ADVANTAGES */}
      <section className="customer-advantages">
        <div className="customer-advantages-grid">

          <div className="customer-advantages-image">
            <img src={support2}
              alt="Customer support specialist selecting a 24/7 AI assistant option"
            />
          </div>

          <div className="customer-advantages-content">

            <Eyebrow>
              The payoff
            </Eyebrow>

            <h2 className="customer-advantages-title">
              A support system that becomes a competitive advantage
            </h2>

            <div className="customer-advantages-list">

              {advantages.map((a, i) => (
                <div
                  key={i}
                  className="customer-advantage-item"
                >
                  <h4 className="customer-advantage-heading">
                    {a.title}
                  </h4>

                  <p className="customer-advantage-text">
                    {a.text}
                  </p>
                </div>
              ))}

            </div>
          </div>

        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="customer-cta">
        <div className="customer-cta-container">

          <h2 className="customer-cta-title">
            Let's build a support experience your customers trust
          </h2>

          <p className="customer-cta-text">
            Through dedicated service, innovative technology, and a
            customer-first approach, we help you build lasting connections
            and turn support into growth.
          </p>

          <button className="customer-btn customer-btn-primary customer-cta-btn">
            Get started with Swivel
          </button>

        </div>
      </section>

      </div>
  );
}

export default CustomerSupportPage;