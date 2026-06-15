const techFeatures = [
  {
    num: '01',
    title: 'Modern Digital Platforms',
    desc: 'Full-stack web solutions built for performance, scale, and long-term growth in competitive markets.',
  },
  {
    num: '02',
    title: 'Online Stores & E-Commerce',
    desc: 'End-to-end e-commerce setups with product management, payments, and order tracking built in.',
  },
  {
    num: '03',
    title: 'Business Tools & Automation',
    desc: 'Custom dashboards, CRM tools, and workflow automation that save time and reduce manual effort.',
  },
  {
    num: '04',
    title: 'Strong Digital Presence',
    desc: "We believe every company deserves a professional digital identity to compete in today's market.",
  },
];

const pills = ['Web Development', 'E-Commerce', 'Business Automation', 'Mobile First', 'Digital Strategy'];

const TechSection = () => (
  <section className="section tech" id="technology">
    <div className="section-inner tech-grid">
      <div className="reveal-left">
        <div className="label">What We Build</div>
        <h2 className="h2">Smart Solutions for <em>Smart Businesses</em></h2>
        <p className="body-lg">
          We build modern digital platforms, websites, business tools, and online stores for startups,
          entrepreneurs and local businesses.
        </p>
        <div className="tech-pills stagger-children">
          {pills.map((p) => (
            <span className="tech-pill" key={p}>{p}</span>
          ))}
        </div>
      </div>
      <div className="tech-features reveal-right stagger-children">
        {techFeatures.map((f) => (
          <div className="tech-feature" key={f.num}>
            <div className="tf-num">{f.num}</div>
            <div className="tf-body">
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TechSection;
