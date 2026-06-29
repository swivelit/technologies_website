import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import DigitalMarketing from './pages/Digital';
import CustomerSupport from "./pages/Customer";
import FullStack from "./pages/FullStack";
import GrabBasketPage from "./pages/GrabBasketPage";
import GoodOnePage from "./pages/GoodOnePage";
import SwicoAIPage from "./pages/SwicoAIPage";
import DefectDetectorPage from "./pages/DefectDetectorPage";
import HRShowcase from "./pages/HRShowcase";
import Maintenance from "./pages/Maintenance";
import AIShowcase from "./pages/AIShowcase";
import WebDevelopmentPage from "./pages/DigitalPlatformShowcase";
import EcommercePage from "./pages/EcommerceSolutions";
import AutomationPage from "./pages/business automation";
import DigitalPresencePage from "./pages/DigitalTransformationShowcase";
function HomePage() {
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

function App() {
  useScrollReveal();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/grab-basket" element={<GrabBasketPage />} />
        <Route path="/good-one" element={<GoodOnePage />} />
        <Route path="/swico-ai" element={<SwicoAIPage />} />
        <Route path="/defect-detector" element={<DefectDetectorPage />} />
        <Route path="/hr" element={<HRShowcase />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/digital-marketing" element={<DigitalMarketing />}/>
        <Route path="/customer-support" element={<CustomerSupport />}/>
        <Route path="/full-stack" element={<FullStack />}/>
        <Route path="/ai-research" element={<AIShowcase />}/>
        <Route path="/web-development" element={<WebDevelopmentPage />} />
        <Route path="/ecommerce" element={<EcommercePage />} />
        <Route path="/automation" element={<AutomationPage />} />
        <Route path="/digital-presence" element={<DigitalPresencePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;