import { useState, useEffect } from 'react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
      <a href="#">
        <img className="nav-logo-img" src="logo_png1.png" alt="Swivel Technology" />
      </a>
      <ul className={`nav-menu${menuOpen ? ' open' : ''}`} id="navMenu">
        <li><a href="#" onClick={closeMenu}>Home</a></li>
        <li><a href="#about" onClick={closeMenu}>Company</a></li>
        <li><a href="#grab" onClick={closeMenu}>Products</a></li>
        <li><a href="#career" onClick={closeMenu}>Career</a></li>
        <li><a href="#footer" className="nav-btn" onClick={closeMenu}>Contact Us</a></li>
      </ul>
      <button
        className="hamburger"
        id="ham"
        aria-label="Menu"
        onClick={toggleMenu}
        style={menuOpen ? {} : {}}
      >
        <span style={menuOpen ? { transform: 'rotate(45deg) translate(5px,5px)' } : {}} />
        <span style={menuOpen ? { opacity: 0 } : {}} />
        <span style={menuOpen ? { transform: 'rotate(-45deg) translate(5px,-5px)' } : {}} />
      </button>
    </nav>
  );
};

export default Navbar;
