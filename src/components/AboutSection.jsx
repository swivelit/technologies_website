const AboutSection = () => (
  <section className="section about" id="about">
    <div className="section-inner">
      <div
        className="about-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Left: Text Content */}
        <div className="reveal-left">
          <div className="label">Who We Are</div>
          <h2 className="h2">About Swivel <em>Technology</em></h2>
          <p className="body-lg">
            Swivel Technologies is a fast-growing technology company dedicated to delivering innovative digital solutions and customized services. 
            The company develops its own digital platforms while also partnering with businesses to create technology that improves efficiency, drives growth, and supports innovation.
          </p>
          <div className="about-highlight stagger-children">
            <div className="about-point">
              <div className="about-point-icon">
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p>Backed by Jey Groups, Swivel Technologies continuously embraces new challenges and opportunities for advancement.</p>
            </div>
            <div className="about-point">
              <div className="about-point-icon">
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p>With a strong focus on quality, sustainability, and long-term value, the company is committed to building solutions that help clients succeed in an ever-evolving digital landscape.</p>
            </div>
            <div className="about-point">
              <div className="about-point-icon">
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p>Through its forward-thinking approach, Swivel Technologies is contributing to the future of technology and transforming the way businesses operate.</p>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div
          className="reveal-right"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src="/about.png"
            alt="Swivel Technology - Digital Innovation"
            style={{
              width: '90%',
              maxWidth: '350px',
              height: 'auto',
              borderRadius: '16px',
              objectFit: 'cover',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      </div>
    </div>

    {/* Responsive styles */}
    <style>{`
      @media (max-width: 768px) {
        .about-grid {
          grid-template-columns: 1fr !important;
        }
        .about-grid .reveal-right {
          margin-top: 2rem;
        }
      }
    `}</style>
  </section>
);

export default AboutSection;
