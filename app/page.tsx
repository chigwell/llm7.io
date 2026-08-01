import FeaturedComponent from "@/components/FeaturedComponent";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";
import EcosystemLogoCarousel from "@/components/EcosystemLogoCarousel";
import ModelShowcase from "@/components/ModelShowcase";
import ChatExample from "@/components/ChatExample";
import Disclaimer from "@/components/Disclaimer";
import ConsoleAnimation from "@/components/CodeExample";
import MarketingProviders from "@/components/MarketingProviders";
//import UsageSummaryChartCard from "@/components/Stats";
// import ImageGenerationInput from "@/components/ImageExample";

export default function Home() {
  return (
    <MarketingProviders>
      <Navigation />
      <HeroSection />
      <EcosystemLogoCarousel />
      <ConsoleAnimation />
      <ChatExample />
      {/* <ImageGenerationInput /> */}
      <FeaturedComponent />
      <ModelShowcase />
      <Disclaimer/>
      <Footer />
    </MarketingProviders>
  );
}
