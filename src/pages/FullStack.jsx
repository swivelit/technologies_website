import React, { useState } from "react";
import "../css/FullStack.css";

import img1 from "../assets/FullStack-1.jpg";
import img2 from "../assets/FullStack-2.jpg";
import img3 from "../assets/FullStack-3.jpg";

const processSteps = [
  {
    title: "Planning",
    desc: "We start by understanding your goals, challenges, and requirements to design solutions aligned with your objectives.",
    icon: (
      <svg viewBox="0 0 24 24">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
        />
        <path d="M7 8h10M7 12h6M7 16h8" />
      </svg>
    ),
  },

  {
    title: "Design",
    desc: "Our team creates intuitive, visually compelling interfaces that reflect your brand and deliver exceptional user experiences.",
    icon: (
      <svg viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r="3"
        />

        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83" />

        <path d="M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },

  {
    title: "Development",
    desc: "Full-stack engineering across frontend and backend, ensuring fast, secure, and scalable application architecture.",
    icon: (
      <svg viewBox="0 0 24 24">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },

  {
    title: "Testing & QA",
    desc: "Rigorous quality assurance, performance benchmarking, and security audits before every release.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },

  {
    title: "Deployment",
    desc: "Cloud-native deployments with CI/CD pipelines, monitoring, and auto-scaling for reliable production performance.",
    icon: (
      <svg viewBox="0 0 24 24">
        <polyline points="17 1 21 5 17 9" />

        <path d="M3 11V9a4 4 0 0 1 4-4h14" />

        <path d="M7 23l-4-4 4-4" />

        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },

  {
    title: "Maintenance",
    desc: "Ongoing support, performance optimisation, and iterative improvements so your application grows with your business.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
];

const services = [
  "Frontend Development",
  "Backend Development",
  "Database Management",
  "API Integration",
  "Cloud Deployment",
  "Application Maintenance",
  "Performance Optimisation",
  "AI & Automation Integration",
];

function FullStackPage() {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="fullstack-page">

      {/* HERO */}
      <section className="fsd-hero">

        <p className="fsd-hero-eyebrow">
          Swivel Technologies · Full Stack Development
        </p>

        <h1 className="fsd-hero-title">
          Full Stack
          <br />
          Development

          <span>
            Building complete digital solutions for modern businesses
          </span>
        </h1>

        <button className="fsd-hero-cta">
          Start Your Project
        </button>

      </section>

      {/* META BAR */}
      <div className="fsd-meta-bar">

        <span>
          <strong>Swivel Technologies</strong>
        </span>

        <span className="fsd-meta-tag">
          Web Applications
        </span>

        <span className="fsd-meta-tag">
          Cloud
        </span>

        <span className="fsd-meta-tag">
          API Integration
        </span>

        <span className="fsd-meta-right">
          Full-cycle delivery · Frontend to backend
        </span>

      </div>

      {/* MAIN CONTENT */}
      <div className="fsd-content-grid">

        <main>

          <p className="fsd-lead-text">
            In today's digital world, businesses need more than just a website.
            They need powerful, scalable, and user-friendly web applications
            that help streamline operations, improve customer experiences,
            and support business growth.
          </p>

          {/* SECTION 1 */}
          <div className="fsd-body-section">

            <p>
              At Swivel Technologies, we provide comprehensive Full Stack
              Development services that cover every aspect of web application
              development. From creating visually appealing user interfaces
              to building secure and efficient backend systems, our team
              delivers complete digital solutions tailored to your business
              requirements.
            </p>

            <p>
              Full Stack Development involves both frontend and backend
              technologies. The frontend is what users see and interact
              with — including website layouts, navigation, dashboards,
              and user experiences.
            </p>

            <p>
              The backend manages the functionality behind the scenes,
              including databases, servers, APIs, authentication systems,
              and business logic.
            </p>

          </div>

          {/* IMAGE 3 */}
          <img
            src={img3}
            alt="Frontend and Backend architecture diagram"
            className="fsd-inline-img"
          />

          <p className="fsd-inline-img-caption">
            Frontend & Backend: Two halves of a complete digital solution
          </p>

          {/* SECTION 2 */}
          <div className="fsd-body-section">

            <p>
              Our development process begins with understanding your
              business goals, challenges, and requirements. We work
              closely with clients to design solutions that align with
              their objectives while ensuring scalability, performance,
              and security.
            </p>

            <p>
              Whether you need a business website, customer portal,
              enterprise application, e-commerce platform, or custom
              web solution, we have the expertise to bring your vision
              to life.
            </p>

            <p>
              We use modern technologies and industry best practices
              to develop responsive and feature-rich applications that
              work smoothly across desktops, tablets, and mobile devices.
            </p>

            <p>
              Our team focuses on creating intuitive user experiences,
              fast-loading interfaces, secure data management systems,
              and reliable application performance.
            </p>

          </div>

          {/* IMAGE 1 */}
          <img
            src={img1}
            alt="Software engineering lifecycle"
            className="fsd-inline-img"
          />

          <p className="fsd-inline-img-caption">
            Our structured engineering process from planning to validation
          </p>

          {/* SECTION 3 */}
          <div className="fsd-body-section">

            <p>
              At Swivel Technologies, we believe that successful
              development goes beyond writing code. We emphasise
              quality assurance, performance optimisation,
              security implementation, and ongoing support to
              ensure your application continues to perform
              efficiently as your business grows.
            </p>

            <p>
              We also integrate modern technologies such as
              Artificial Intelligence, automation tools,
              analytics platforms, and third-party services
              to enhance application functionality and improve
              business processes.
            </p>

            <p>
              These advanced capabilities help businesses stay
              competitive and adapt to evolving market demands.
            </p>

          </div>

          {/* SERVICES BLOCK */}
          <div className="fsd-services-block">

            <h3>What's Included</h3>

            <div className="fsd-services-grid">

              {services.map((service) => (
                <div
                  key={service}
                  className="fsd-service-item"
                >
                  <span className="fsd-service-dot" />

                  {service}
                </div>
              ))}

            </div>

          </div>

          {/* SECTION 4 */}
          <div className="fsd-body-section">

            <p>
              A professionally developed application can improve
              operational efficiency, enhance customer engagement,
              increase productivity, and create new business
              opportunities.
            </p>

            <p>
              Whether you are a startup launching a new product
              or an established organisation looking to modernise
              your digital infrastructure, our Full Stack
              Development solutions are designed to support
              your success.
            </p>

            <p>
              At Swivel Technologies, we are committed to
              transforming ideas into innovative digital
              solutions.
            </p>

            <p>
              Through technical expertise, creative
              problem-solving, and a customer-focused
              approach, we help businesses build reliable,
              scalable, and future-ready applications.
            </p>

          </div>

        </main>

       {/* SIDEBAR */}
        <aside className="fsd-sidebar">

          <div className="fsd-sidebar-sticky">

            <div className="fsd-sidebar-card">

              <img
                src={img2}
                alt="Cloud deployment"
              />

              <div className="fsd-sidebar-card-body">

                <h4>
                  Cloud-Native Deployment
                </h4>

                <p>
                  We deploy your applications on scalable
                  cloud infrastructure with monitoring,
                  backups, and auto-scaling built in from
                  day one.
                </p>

              </div>

            </div>

            <div className="fsd-sidebar-card">

              <img
                src={img1}
                alt="Development lifecycle"
              />

              <div className="fsd-sidebar-card-body">

                <h4>
                  End-to-End Ownership
                </h4>

                <p>
                  From planning and design through to
                  testing and maintenance — we manage
                  the full development lifecycle so
                  you don't have to.
                </p>

              </div>

            </div>

          </div>

        </aside>

      </div>

      {/* TECH STRIP */}
      <div className="fsd-tech-strip">

        <p className="fsd-tech-strip-label">
          Technologies We Work With
        </p>

        <div className="fsd-tech-tags">

          {[
            "React",
            "Next.js",
            "Node.js",
            "Python",
            "Java",
            "PHP",
            "C++",
            "PostgreSQL",
          ].map((tech) => (
            <span
              key={tech}
              className="fsd-tech-tag"
            >
              {tech}
            </span>
          ))}
          
          {[
            "MongoDB",
            "Redis",
            "AWS",
            "Azure",
            "Docker",
            "Kubernetes",
            "REST APIs",
            "GraphQL",
          ].map((tech) => (
            <span
              key={tech}
              className="fsd-tech-tag"
            >
              {tech}
            </span>
          ))}

        </div>

      </div>

      {/* PROCESS */}
      <section className="fsd-process-section">

        <p className="fsd-section-eyebrow">
          How We Work
        </p>

        <h2 className="fsd-section-title">
          A process built for clarity and speed
        </h2>

        <div className="fsd-process-steps">

          {processSteps.map((step, i) => (
            <div
              key={step.title}
              className="fsd-process-step"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >

              <div
                className="fsd-step-icon"
                style={{
                  background:
                    hovered === i
                      ? "#e05a00"
                      : "#ff6a00",
                }}
              >
                {step.icon}
              </div>

              <p className="fsd-step-title">
                {step.title}
              </p>

              <p className="fsd-step-desc">
                {step.desc}
              </p>

            </div>
          ))}

        </div>

      </section>

      {/* FULL WIDTH IMAGE */}
      <div className="fsd-full-img-wrap">

        <img
          src={img2}
          alt="Cloud technology"
        />

        <div className="fsd-full-img-overlay">

          <div className="fsd-overlay-text">

            <h2>
              Scalable infrastructure,
              from day one
            </h2>

            <p>
              Every application we build is designed
              with growth in mind — cloud-ready
              architecture that scales as your
              business does.
            </p>

          </div>

        </div>

      </div>

      {/* CTA */}
      <section className="fsd-cta-section">

        <h2>
          Let's build something remarkable
        </h2>

        <p>
          Tell us about your project and we'll show
          you how Swivel Technologies can turn your
          vision into a production-ready digital
          solution.
        </p>

        <button className="fsd-cta-btn-primary">
          Get in Touch
        </button>

      </section>

      </div>
  );
}

export default FullStackPage;