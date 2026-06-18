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
        <Route
          path="/digital-marketing"
          element={<DigitalMarketing />}
        />
        <Route
          path="/customer-support"
          element={<CustomerSupport />}
        />
        <Route
          path="/full-stack"
          element={<FullStack />}
        />
        <Route path="/" element={<HomePage />} />
        <Route path="/grab-basket" element={<GrabBasketPage />} />
        <Route path="/good-one" element={<GoodOnePage />} />
        <Route path="/swico-ai" element={<SwicoAIPage />} />
        <Route
          path="/defect-detector"
          element={<DefectDetectorPage />}
        />
      </Routes>
      
    </BrowserRouter>
  );
}


export default App;