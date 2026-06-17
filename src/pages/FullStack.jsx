import "../css/FullStack.css";
import FullStackImg1 from "../assets/FullStack-1.jpg";
import FullStackImg2 from "../assets/FullStack-2.jpg";
import FullStackImg3 from "../assets/FullStack-3.jpg";

function FullStack() {
  return (
    <div className="fullstack-page">

  {/* HERO SECTION START */}
  <div className="hero-section">
    <span className="section-tag">FULL STACK DEVELOPMENT</span>

    <h1>
      Build Powerful Applications.
      <span> End-to-End.</span>
    </h1>

    <p>
      From responsive frontends to scalable backends, we create complete
      web applications that drive business growth and deliver exceptional
      user experiences.
    </p>

    <div className="hero-buttons">
      <button className="primary-btn">Get Started</button>
      <button className="secondary-btn">View Services</button>
    </div>
  </div>
  {/* HERO SECTION END */}

  <div className="fullstack-container">
    <div className="left-image">
      <img src={FullStackImg1} alt="Full Stack Development" />
    </div>

    <div className="right-image">
      <img src={FullStackImg2} alt="Full Stack Development" />
    </div>
  </div>

  <div className="third-image">
    <img src={FullStackImg3} alt="Full Stack Development" />
  </div>

  <div className="content">
        <h1>Full Stack Development</h1>

        <h2>
          Building Complete Digital Solutions for Modern Businesses
        </h2>

        <p>
          In today's digital world, businesses need more than just a website.
          They need powerful, scalable, and user-friendly web applications
          that help streamline operations, improve customer experiences,
          and support business growth. This is where Full Stack Development
          plays a vital role.
        </p>

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
          technologies. The frontend is what users see and interact with,
          including website layouts, navigation, dashboards, and user
          experiences. The backend manages the functionality behind the
          scenes, including databases, servers, APIs, authentication
          systems, and business logic.
        </p>

        <p>
          By combining both areas of expertise, we create seamless and
          high-performing applications that deliver exceptional user
          experiences.
        </p>

        <p>
          Our development process begins with understanding your business
          goals, challenges, and requirements. We work closely with clients
          to design solutions that align with their objectives while
          ensuring scalability, performance, and security.
        </p>

        <p>
          Whether you need a business website, customer portal,
          enterprise application, e-commerce platform, or custom web
          solution, we have the expertise to bring your vision to life.
        </p>

        <p>
          We use modern technologies and industry best practices to
          develop responsive and feature-rich applications that work
          smoothly across desktops, tablets, and mobile devices.
        </p>

        <p>
          At Swivel Technologies, we believe that successful development
          goes beyond writing code. We emphasize quality assurance,
          performance optimization, security implementation, and ongoing
          support to ensure your application continues to perform
          efficiently as your business grows.
        </p>

        <p>
          Our Full Stack Development services include frontend
          development, backend development, database management,
          API integration, cloud deployment, application maintenance,
          and performance optimization.
        </p>

        <p>
          We also integrate modern technologies such as Artificial
          Intelligence, automation tools, analytics platforms, and
          third-party services to enhance application functionality and
          improve business processes.
        </p>

        <p>
          A professionally developed application can improve operational
          efficiency, enhance customer engagement, increase productivity,
          and create new business opportunities.
        </p>

        <p>
          At Swivel Technologies, we are committed to transforming ideas
          into innovative digital solutions. Through technical expertise,
          creative problem-solving, and a customer-focused approach, we
          help businesses build reliable, scalable, and future-ready
          applications.
        </p>

        <p>
          <strong>
            Let us help you develop powerful digital solutions that drive
            growth, improve efficiency, and create exceptional user
            experiences.
          </strong>
        </p>
      </div>
    </div>
  );
}

export default FullStack;