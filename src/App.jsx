import Navbar from './components/Navbar';
import ScrollTop from './components/ScrollTop';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import TechSection from './components/TechSection';
import GrabSection from './components/GrabSection';
import GoalSection from './components/GoalSection';
import CareerSection from './components/CareerSection';
import CTABanner from './components/CTABanner';
import Footer from './components/Footer';
import useScrollReveal from './hooks/useScrollReveal';

function App() {
  useScrollReveal();

  return (
    <>
      <ScrollTop />
      <Navbar />
      <HeroSection />
      <AboutSection />
      <TechSection />
      <GrabSection />
      <GoalSection />
      <CareerSection />
      <CTABanner />
      <Footer />
    </>
  );
}

export default App;
