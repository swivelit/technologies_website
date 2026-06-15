import { useEffect, useRef } from 'react';

const HeroSection = () => {
  const particlesRef = useRef(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;
    const colors = ['#f97316', '#fb923c', '#fbbf24', '#ef4444', '#fdba74'];
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('div');
      p.className = 'hla-particle';
      const angle = (i / 22) * 360;
      const dist = 60 + Math.random() * 80;
      const tx = Math.cos((angle * Math.PI) / 180) * dist;
      const ty = Math.sin((angle * Math.PI) / 180) * dist;
      const dur = 3 + Math.random() * 4;
      const delay = Math.random() * 4;
      const size = 2 + Math.random() * 4;
      p.style.cssText = `
        left:calc(50% + ${Math.random() * 60 - 30}px);
        top:calc(50% + ${Math.random() * 40 - 20}px);
        --tx:${tx}px;--ty:${ty}px;--dur:${dur}s;--delay:${delay}s;
        width:${size}px;height:${size}px;
        background:${colors[i % colors.length]};
        box-shadow:0 0 6px 2px ${colors[i % colors.length]}88;
      `;
      container.appendChild(p);
    }
    return () => { container.innerHTML = ''; };
  }, []);

  return (
    <section className="hero">
      <div className="hero-bg-line" />
      <div className="hero-dot-grid" />
      <div className="hero-inner">
        <div className="hero-text-wrap">
          <div className="hero-tag">
            <span className="hero-tag-dot" />
            Innovation · Technology · Growth
          </div>
          <h1>
            Building Companies.<br />
            <em>Empowering</em><br />
            the Future.
          </h1>
          <p className="hero-tagline">Smart Solutions for Smart Businesses</p>
          <p>
            Boasting a focus on innovation, technology, and local business development,
            JEY GROUPS is a quickly growing company network helping businesses grow digitally.
          </p>
          <div className="hero-actions">
            <a href="#grab" className="btn-teal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Explore Solutions
            </a>
            <a href="#footer" className="btn-ghost">Get Started Today</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-logo-anim">
            <div className="hla-glow" />
            <div className="hla-ring hla-ring1" />
            <div className="hla-ring hla-ring2" />
            <div className="hla-ring hla-ring3" />
            <img className="hla-img" src="logo_png1.png" alt="Swivel Technologies" />
            <div className="hla-particles" ref={particlesRef} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
