import { useState, useEffect, useRef } from "react";
import "../css/AIShowcase.css";
import Ai1 from "../assets/ai_1.jpg";
import Ai2 from "../assets/ai_2.jpg";
import Ai3 from "../assets/ai_3.jpg";
import Ai4 from "../assets/ai_4.jpg";

const capabilities = [
  { icon: "⚙️", title: "Process Automation", desc: "Eliminate repetitive tasks and streamline daily operations so your team can focus on work that matters." },
  { icon: "📊", title: "Predictive Analytics", desc: "Transform raw data into meaningful insights that inform decisions, reduce risk, and uncover growth opportunities." },
  { icon: "💬", title: "Intelligent Chatbots", desc: "Deliver responsive, round-the-clock customer support with virtual assistants that learn and improve over time." },
  { icon: "🔄", title: "Workflow Optimisation", desc: "Redesign how work flows through your organisation — faster, smarter, and with measurable efficiency gains." },
  { icon: "🔍", title: "Data Intelligence", desc: "Identify patterns and trends hidden in your data to stay ahead of the market and your competitors." },
  { icon: "🤝", title: "AI Integration", desc: "Seamlessly embed AI into your existing systems — from CRM and ERP to marketing and customer platforms." },
];

export default function AIShowcase() {
  const [counted, setCounted] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setCounted(true); }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
  document.title = "Artificial Intelligence Research Team | Swivel Technologies";
  }, []);

  return (
    <div className="page">

      {/* ai */}
      <section className="ai">
        <div className="ai-eyebrow">Swivel Technologies</div>
        <h1>Transforming Businesses with <em>Intelligent</em> Technology</h1>
        <p className="ai-sub">
          Artificial Intelligence is no longer a concept — it's the engine powering the next generation of business growth, efficiency, and human potential.
        </p>
        <button className="ai-cta">
          Explore Our AI Solutions
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </section>

      {/* ARTICLE BODY */}
      <article className="article-body">

        <p className="lead-paragraph">
          Artificial Intelligence is changing the way businesses operate, communicate, and grow. What once seemed like a futuristic concept has now become a powerful tool that helps organisations improve efficiency, make smarter decisions, and deliver better customer experiences.
        </p>

        <p className="body-text">
          Businesses across industries are using AI to automate processes, analyse data, reduce costs, and unlock new opportunities for growth. At Swivel Technologies, we help businesses harness the power of Artificial Intelligence to drive innovation and improve performance. Our AI solutions are designed to simplify operations, increase productivity, and provide valuable insights that support smarter business decisions.
        </p>

        {/* Full bleed image 1 */}
        <div className="full-bleed">
          <img src={Ai1} alt="AI assistant interface with code panels" />
        </div>
        <p className="full-bleed-caption">AI-powered assistant and code generation — core to the modern digital workspace.</p>

        <p className="body-text">
          Artificial Intelligence is more than just automation. It is about creating intelligent systems that can learn, analyse information, recognise patterns, and assist businesses in solving complex challenges. By leveraging AI-powered technologies, organisations can improve operational efficiency while focusing more on strategic growth and customer satisfaction.
        </p>

        <p className="body-text">
          Our AI solutions are tailored to meet the unique needs of each business. Whether you are looking to automate routine tasks, improve customer support, enhance data analysis, optimise workflows, or develop intelligent digital solutions, our team provides customised AI strategies that deliver measurable results.
        </p>

        {/* Pull quote */}
        <div className="pull-quote">
          <blockquote>
            AI enables organisations to work smarter, respond faster, and adapt more effectively to changing customer expectations and industry trends.
          </blockquote>
          <cite>— Swivel Technologies</cite>
        </div>

        <p className="body-text">
          At Swivel Technologies, we combine advanced technology with practical business applications. Our AI-powered solutions help organisations automate repetitive processes, improve decision-making, enhance customer engagement, and streamline daily operations — saving time, reducing manual effort, and improving overall productivity.
        </p>

      </article>

      {/* CAPABILITIES STRIP */}
      <section className="capabilities">
        <div className="capabilities-inner">
          <p className="capabilities-label">What We Deliver</p>
          <div className="capabilities-grid">
            {capabilities.map((c) => (
              <div className="cap-card" key={c.title}>
                <div className="cap-icon">{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS ROW */}
      <div className="stats-row" ref={statsRef}>
        <div className="stats-inner">
          {[
            { num: "3×", label: "Faster Decision-Making" },
            { num: "60%", label: "Reduction in Manual Tasks" },
            { num: "24/7", label: "Intelligent Support" },
          ].map((s) => (
            <div key={s.label}>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CONCLUSION */}
      <article className="conclusion">

        <div className="divider" />

        <p className="body-text">
          One of the biggest advantages of Artificial Intelligence is its ability to process large amounts of information quickly and accurately. AI can identify trends, predict outcomes, and generate insights that help businesses make informed decisions. By transforming data into actionable intelligence, organisations can improve planning, reduce risks, and discover new growth opportunities.
        </p>

        {/* Image pair */}
        <div className="image-pair">
          <div className="image-pair-item">
            <img src={Ai3} alt="AI assistant on laptop" />
          </div>
          <div className="image-pair-item">
            <img src={Ai4} alt="Smart workspace automation" />
          </div>
        </div>

        <p className="body-text">
          We help businesses integrate AI into customer service, marketing, operations, administration, and workforce management. From intelligent chatbots and virtual assistants to predictive analytics and workflow automation, our solutions are designed to create meaningful business value and improve customer experiences.
        </p>

        {/* Full bleed image 2 */}
        <div className="full-bleed">
          <img src={Ai2} alt="Smart Workspace Automation with AI Agents" />
        </div>
        <p className="full-bleed-caption">Smart Workspace Automation — AI Agents, Voice AI, Cloud Control and Energy-saving working in concert.</p>

        <p className="body-text">
          As technology continues to evolve, businesses that adopt AI are gaining a competitive advantage in the marketplace. AI enables organisations to work smarter, respond faster, and adapt more effectively to changing customer expectations and industry trends. By embracing innovation today, businesses can build a stronger foundation for future success.
        </p>

        <p className="body-text">
          At Swivel Technologies, our mission is to make Artificial Intelligence accessible, practical, and beneficial for businesses of all sizes. We focus on delivering solutions that create real business impact while ensuring ease of use and long-term scalability. Whether you are a startup exploring AI opportunities or an established organisation seeking digital transformation, our team is ready to help you unlock the full potential of intelligent technology.
        </p>

        <div className="pull-quote">
          <blockquote>
            Let Swivel Technologies help you transform ideas into innovation and create a smarter future with Artificial Intelligence.
          </blockquote>
        </div>

      </article>

      {/* CTA BAND */}
      <section className="cta-band">
        <h2>Ready to build something intelligent?</h2>
        <p>Talk to our team and discover how AI can transform your business operations, starting today.</p>
        <button className="cta-btn">Get in Touch</button>
      </section>

    </div>
  );
}
