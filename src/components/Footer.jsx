const Footer = () => (
  <footer id="footer">
    <div className="footer-top">
      <div className="footer-brand">
        <a className="logo" href="#">
          <span className="logo-name">Swivel <span>Technology</span></span>
        </a>
        <p>We build innovative digital solutions for entrepreneurs, startups and small businesses across India.</p>
      </div>
      <div className="footer-col">
        <h5>Pages</h5>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#about">Company</a></li>
          <li><a href="#grab">Products</a></li>
          <li><a href="#career">Career</a></li>
        </ul>
      </div>
      <div className="footer-col">
        <h5>Product</h5>
        <ul>
          <li><a href="#grab">Grab Basket</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">Support</a></li>
        </ul>
      </div>
      <div className="footer-col">
        <h5>Contact</h5>
        <ul>
          <li>Chennai, Tamil Nadu 600116</li>
          <li><a href="mailto:jeygroups@gmail.com">jeygroups@gmail.com</a></li>
          <li><a href="tel:+918438074230">+91 84380 74230</a></li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <span className="footer-copy">© 2026 Swivel Technology | All Rights Reserved</span>
      <div className="socials">
        <a href="https://www.instagram.com/swivel.technologies" className="social-btn" target="_blank" rel="noreferrer" aria-label="Instagram">
          <svg viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </a>
        <a href="https://www.linkedin.com/in/jey-groups-32358a3b1/" className="social-btn" target="_blank" rel="noreferrer" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </a>
        <a href="https://swivtrek.in/" className="social-btn" target="_blank" rel="noreferrer" aria-label="Website">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
