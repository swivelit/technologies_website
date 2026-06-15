const AboutSection = () => (
  <section className="section about" id="about">
    <div className="section-inner">
      <div className="about-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '700px' }}>
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
      </div>
    </div>
  </section>
);

export default AboutSection;
