import { useNavigate } from "react-router-dom";
const topDepts = [
  {
    title: 'Digital Marketing',
    desc: 'Focuses on online brand growth through campaigns, content strategy, SEO, and social media marketing.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 9V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2" />
        <path d="M14 9l3 3-3 3M7 12h10" />
      </svg>
    ),
    featured: false,
  },
  {
    title: 'Artificial Intelligence Research Team',
    desc: 'Research and development of AI solutions, automation tools, and intelligent digital systems.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="12" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
      </svg>
    ),
    featured: true,
  },
  {
    title: 'Full Stack',
    desc: 'Ensures product quality through testing, bug tracking, performance validation, and software reliability checks.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15l2 2 4-4" />
      </svg>
    ),
  },
];
 
const botDepts = [
  {
    title: 'Administration and HR',
    desc: 'Handles recruitment, employee management, internal coordination, and company operations.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Technical Support',
    desc: 'Delivers exceptional customer experiences through responsive, reliable, and multi-channel support solutions.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    featured: false,
  },
    {
    title: 'Maintenance',
    desc: 'Responsible for system monitoring, technical support, infrastructure maintenance, and operational stability.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    featured: false,
  },
];
 
const CareerSection = () => {
  const navigate = useNavigate();

  return (
    <section className="section career-section" id="career">
    <div className="section-inner">
      <div className="career-head reveal">
        <h2 className="career-main-title">Join Our Team</h2>
        <div className="career-title-line" />
        <p className="career-subtitle">
          Build your future with Swivel Technologies. We create opportunities for talented people
          in technology, marketing, and innovation.
        </p>
      </div>
      <div className="dept-label reveal">Departments</div>
      <p className="dept-sub reveal">Explore our teams driving innovation and growth</p>
 
      <div className="dept-grid-top stagger-children reveal">
        {topDepts.map((d) => (
  <div
    className={`dept-card${d.featured ? ' dept-card-featured' : ''}`}
    key={d.title}
      onClick={() => {
        if (d.title === "Digital Marketing") {
          window.open("/digital-marketing", "_blank");
        }
        if (d.title === "Artificial Intelligence Research Team") {
          window.open("/ai-research", "_blank");
        }
        if (d.title === "Full Stack") {
          window.open("/full-stack", "_blank");
        }
      }}
    style={{ cursor: "pointer" }}
  >

            <div className="dept-ico-wrap">{d.icon}</div>
            <h4>{d.title}</h4>
            <p>{d.desc}</p>
          </div>
        ))}
      </div>
 
      <div className="dept-grid-bot stagger-children reveal">
  {botDepts.map((d) => (
    <div
      className="dept-card"
      key={d.title}
        onClick={() => {
          if (d.title === "Administration and HR") {
            window.open("/hr", "_blank");
          }
          if (d.title === "Technical Support") {
            window.open("/customer-support", "_blank");
          }
          if (d.title === "Maintenance") {
            window.open("/maintenance", "_blank");
          }
        }}
      style={{ cursor: "pointer" }}
    >
      <div className="dept-ico-wrap">{d.icon}</div>
      <h4>{d.title}</h4>
      <p>{d.desc}</p>
    </div>
  ))}
</div>
    </div>
  </section>
);
};
 
export default CareerSection;