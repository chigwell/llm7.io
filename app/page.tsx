import FeaturedComponent from "@/components/FeaturedComponent";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";
import EcosystemLogoCarousel from "@/components/EcosystemLogoCarousel";
import ModelShowcase from "@/components/ModelShowcase";
import ChatExample from "@/components/ChatExample";
import Disclaimer from "@/components/Disclaimer";
import LiveUsageFlowSection from "@/components/LiveUsageFlowSection";
import ConsoleAnimation from "@/components/CodeExample";
import MarketingProviders from "@/components/MarketingProviders";

export default function Home() {
  return (
    <MarketingProviders>
      <Navigation />
      <HeroSection />
      <EcosystemLogoCarousel />
      <ConsoleAnimation />
      <ChatExample />
      <FeaturedComponent />
      <ModelShowcase />
      <LiveUsageFlowSection />
      <Disclaimer/>
      <Footer />
    </MarketingProviders>
  );
}
