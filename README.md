# Swivel Technologies — React App

Converted from the original HTML file into a structured React project.

## Project Structure

```
swivel-technologies/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Sticky nav with hamburger menu & scroll effect
│   │   ├── ScrollTop.jsx       # Floating scroll-to-top button
│   │   ├── HeroSection.jsx     # Hero with animated logo, rings & particles
│   │   ├── AboutSection.jsx    # About / Who We Are section
│   │   ├── TechSection.jsx     # What We Build section
│   │   ├── GrabSection.jsx     # Products: Grab Basket & Good One
│   │   ├── GoalSection.jsx     # Our Mission / Goals section
│   │   ├── CareerSection.jsx   # Join Our Team / Departments
│   │   ├── CTABanner.jsx       # Call-to-action banner
│   │   └── Footer.jsx          # Footer with links & socials
│   ├── hooks/
│   │   └── useScrollReveal.js  # IntersectionObserver for reveal animations
│   ├── App.jsx                 # Root component
│   ├── index.js                # React entry point
│   └── index.css               # All global styles & CSS variables
├── package.json
└── README.md
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add your logo image:
   - Place `logo_png1.png` inside the `public/` folder.

3. Start the development server:
   ```bash
   npm start
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Notes
- All CSS is kept in `src/index.css` using CSS custom properties (variables).
- Scroll reveal animations are handled via `useScrollReveal` hook using `IntersectionObserver`.
- Particle animation in the hero is generated dynamically in `HeroSection.jsx`.
