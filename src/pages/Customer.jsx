import "../css/Customer.css";
import CustomerSupportImg1 from "../assets/Customer-Support-1.jpg";
import CustomerSupportImg2 from "../assets/Customer-Support-2.jpg";

function CustomerSupport() {
  return (
    <div className="customer-support-page">

  {/* HERO SECTION START */}
  <div className="hero-section">
    <span className="section-tag">TECHNICAL SUPPORT</span>

    <h1>
      Support Your Customers.
      <span> Instantly.</span>
    </h1>

    <p>
      Deliver exceptional customer experiences with fast responses,
      intelligent automation, and 24/7 support solutions.
    </p>

    <div className="hero-buttons">
      <button className="primary-btn">Get Started</button>
      <button className="secondary-btn">Contact Us</button>
    </div>
  </div>
  {/* HERO SECTION END */}

  <div className="customer-container">
    <div className="left-image">
      <img
        src={CustomerSupportImg1}
        alt="Customer Support 1"
      />
    </div>

    <div className="right-image">
      <img
        src={CustomerSupportImg2}
        alt="Customer Support 2"
      />
    </div>
  </div>

  <div className="content">

        <h2>
          Delivering Exceptional Customer Experiences Through Reliable Support
        </h2>

        <p>
          Customer satisfaction is one of the most important factors in building
          a successful business. In today's competitive market, customers expect
          quick responses, clear communication, and effective solutions whenever
          they need assistance. A positive support experience not only resolves
          issues but also builds trust, strengthens relationships, and
          encourages long-term loyalty.
        </p>

        <p>
          At Swivel Technologies, we understand that excellent customer support
          is more than just answering questions. It is about creating meaningful
          interactions that make customers feel valued and heard. Our customer
          support solutions are designed to help businesses provide timely
          assistance, improve customer satisfaction, and maintain strong
          relationships with their clients.
        </p>

        <p>
          We believe that every customer interaction matters. Whether a customer
          needs product information, technical assistance, service updates, or
          issue resolution, our support team is committed to delivering
          professional and personalized assistance.
        </p>

        <p>
          Our customer support services are designed to provide seamless
          communication across multiple channels, including phone, email, live
          chat, social media, and digital platforms.
        </p>

        <p>
          At Swivel Technologies, we combine skilled support professionals with
          modern technology to deliver efficient and reliable customer service.
          Our solutions help businesses manage customer inquiries, track support
          requests, monitor response times, and improve overall service quality.
        </p>

        <p>
          We also leverage advanced technologies and AI-powered tools to enhance
          customer support experiences. Automated responses, intelligent ticket
          management, customer behaviour analysis, and real-time assistance help
          businesses provide faster and more accurate solutions.
        </p>

        <p>
          A strong customer support system helps businesses increase customer
          satisfaction, build trust, improve brand reputation, and encourage
          repeat business.
        </p>

        <p>
          Our goal is to help businesses create customer experiences that
          inspire confidence and strengthen relationships.
        </p>

        <p>
          At Swivel Technologies, we are committed to helping businesses turn
          customer support into a competitive advantage. Through dedicated
          service, innovative technology, and a customer-first approach, we help
          organizations build lasting connections with their customers and
          achieve long-term success.
        </p>

        <p>
          <strong>
            Let us help you create a customer support experience that builds
            trust, improves satisfaction, and drives business growth.
          </strong>
        </p>
      </div>
    </div>
  );
}

export default CustomerSupport;