const techFeatures = [
  {
    num: '01',
    title: 'Digital Platform Development',
    desc: 'Full-stack web solutions built for performance, scale, and long-term growth in competitive markets.',
    link: '/web-development',
  },
  {
    num: '02',
    title: 'E-Commerce Solutions',
    desc: 'End-to-end e-commerce setups with product management, payments, and order tracking built in.',
    link: '/ecommerce',
  },
  {
    num: '03',
    title: 'Business Process Automation',
    desc: 'Custom dashboards, CRM tools, and workflow automation that save time and reduce manual effort.',
    link: '/automation',
  },
  {
    num: '04',
    title: 'Digital Transformation & Brand Presence',
    desc: "We believe every company deserves a professional digital identity to compete in today's market.",
    link: '/digital-presence',
  },
];

const pills = [
  'Web Development',
  'E-Commerce',
  'Business Automation',
  'Mobile First',
  'Digital Strategy',
];

const TechSection = () => (
  <section className="section tech" id="technology">
    <div className="section-inner tech-grid">
      <div className="reveal-left">
        <div className="label">What We Build</div>
        <h2 className="h2">
          Building Technology, <em>Empowering the Future</em>
        </h2>
        <p className="body-lg">
          Creating innovative technology solutions that drive digital transformation,
          improve operational efficiency, support sustainable business growth,
          enabling organizations to adapt, innovate and succeed in a rapidly evolving digital world.
        </p>

        <div className="tech-pills stagger-children">
          {pills.map((p) => (
            <span className="tech-pill" key={p}>
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="tech-features reveal-right stagger-children">
        {techFeatures.map((f) => (
          <div
            key={f.num}
            className="tech-feature clickable"
            onClick={() => window.open(f.link, "_blank")}
            style={{ cursor: "pointer" }}
          >
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