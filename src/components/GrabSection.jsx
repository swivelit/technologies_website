const GrabSection = () => (
  <section className="section grab" id="grab">
    <div className="grab-bg" />
    <div className="section-inner" style={{ position: 'relative', zIndex: 2 }}>
      <div className="grab-head reveal">
        <div className="label" style={{ justifyContent: 'center' }}>Our Product</div>
      </div>
      <div className="grab-grid-two">

        {/* Grab Basket */}
        <div className="grab-box reveal-left">
          <div className="grab-box-inner">
            <div className="grab-box-ico" style={{ background: 'rgba(0,184,150,0.12)' }}>
              <svg viewBox="0 0 24 24" style={{ stroke: '#00b896', width: 32, height: 32, fill: 'none', strokeWidth: 1.7 }}>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h3 className="grab-box-title">Grab Basket</h3>
            <p className="grab-box-desc">
              Your Complete Online Shopping Destination
            </p>
            <p className="grab-box-desc">
              Grab Basket is a comprehensive e-commerce platform that offers a seamless shopping experience across multiple product categories. 
              Whether customers are looking for electronics, groceries, clothing, household essentials, or daily necessities, Grab Basket provides a convenient solution for all their shopping needs.
            </p>
            <ul className="grab-box-list">
              <li>Multiple product categories in one platform</li>
              <li>User-friendly shopping experience</li>
              <li>Secure payment options</li>
              <li>Fast and reliable order management</li>
              <li>Convenient doorstep delivery support</li>
            </ul>
            <a href="/grab-basket" className="grab-box-btn" target="_blank">Learn more →</a>
          </div>
        </div>

        {/* Good One */}
        <div className="grab-box grab-box-alt reveal-right">
          <div className="grab-box-inner">
            <div className="grab-box-ico" style={{ background: "rgba(249,115,22,0.12)" }}>
              <svg
                viewBox="0 0 24 24"
                style={{ stroke: "#f97316", width: 32, height: 32, fill: "none", strokeWidth: 1.8 }}
              >
                <circle cx="8" cy="8" r="3" />
                <circle cx="16" cy="16" r="3" />
                <path d="M10 10l4 4" />
                <path d="M5 19l4-4" />
                <path d="M15 9l4-4" />
              </svg>
            </div>
            <h3 className="grab-box-title">Good One</h3>
            <p className="grab-box-desc">
              Buy. Sell. Connect.
            </p>
            <p className="grab-box-desc">
              Good One is a trusted marketplace platform that enables users to buy and sell pre-owned products with ease.
              From electronics and furniture to vehicles and household items, the platform connects buyers and sellers in a secure and user-friendly environment.
            </p>
            <ul className="grab-box-list">
              <li>Easy product listing &amp; management</li>
              <li>Secure buyer and seller interactions</li>
              <li>Wide range of product categories</li>
              <li>Cost-effective and sustainable shopping experience</li>
            </ul>
            <a href="/good-one" className="grab-box-btn" target="_blank">Learn more →</a>
          </div>
        </div>

        {/* Swico AI */}
        <div className="grab-box grab-box-alt reveal-right">
          <div className="grab-box-inner">
            <div className="grab-box-ico" style={{ background: "rgba(59,130,246,0.12)" }}>
              <svg
                viewBox="0 0 24 24"
                style={{ stroke: "#3b82f6", width: 32, height: 32, fill: "none", strokeWidth: 1.8 }}
              >
                <circle cx="12" cy="12" r="2" />
                <circle cx="6" cy="6" r="2" />
                <circle cx="18" cy="6" r="2" />
                <circle cx="6" cy="18" r="2" />
                <circle cx="18" cy="18" r="2" />
                <path d="M8 7l3 3" />
                <path d="M16 7l-3 3" />
                <path d="M8 17l3-3" />
                <path d="M16 17l-3-3" />
              </svg>
            </div>
            <h3 className="grab-box-title">Swico AI</h3>
            <p className="grab-box-desc">
              Intelligent Assistance Powered by Artificial Intelligence
            </p>
            <p className="grab-box-desc">
              Swico AI is an advanced AI-powered assistant designed to provide instant answers, intelligent recommendations, and smart solutions for everyday questions and business needs. 
              Built using modern artificial intelligence technologies, Swico AI helps users access information quickly and improve productivity.
            </p>
            <ul className="grab-box-list">
              <li>Instant responses to user queries</li>
              <li>AI-driven recommendations and insights</li>
              <li>Knowledge assistance across multiple topics</li>
              <li>User-friendly conversational interface</li>
              <li>Continuous learning and improvement capabilities</li>
            </ul>
            <a href="/swico-ai" className="grab-box-btn" target="_blank">Learn more →</a>
          </div>
        </div>

        {/* Defect Detector */}
        <div className="grab-box grab-box-alt reveal-right">
          <div className="grab-box-inner">
            <div className="grab-box-ico" style={{ background: "rgba(239,68,68,0.12)" }}>
              <svg
                viewBox="0 0 24 24"
                style={{ stroke: "#ef4444", width: 32, height: 32, fill: "none", strokeWidth: 1.8 }}
              >
                <circle cx="11" cy="11" r="6" />
                <line x1="16" y1="16" x2="21" y2="21" />
                <path d="M9 11l2 2 4-4" />
              </svg>
            </div>
            <h3 className="grab-box-title">Defect Detector</h3>
            <p className="grab-box-desc">
              Smart Quality Inspection for Manufacturing Excellence
            </p>
            <p className="grab-box-desc">
              Defect Detector is an intelligent quality assurance solution designed for manufacturing and production environments. 
              The system automatically verifies whether finished products meet client-defined specifications and quality standards before delivery. By identifying defects early, businesses can reduce errors, improve product quality, and increase customer satisfaction.
            </p>
            <ul className="grab-box-list">
              <li>Automated product inspection</li>
              <li>Client requirement validation</li>
              <li>Real-time defect detection</li>
              <li>Improved production quality control</li>
              <li>Reduced operational errors and rework costs</li>
            </ul>
            <a href="/defect-detector" className="grab-box-btn" target="_blank">Learn more →</a>
          </div>
        </div>

      </div>
    </div>
  </section>
);

export default GrabSection;
