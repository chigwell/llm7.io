import FeaturedComponent from "@/components/FeaturedComponent";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";
import EcosystemMarquee from "@/components/EcosystemMarquee";
import ActiveRequestsChart from '@/components/ActiveRequestsChart';
import ModelShowcase from "@/components/ModelShowcase";
//import PromoBanner from "@/components/PromoBanner";
import ChatExample from "@/components/ChatExample";
import Disclaimer from "@/components/Disclaimer";
import ConsoleAnimation from "@/components/CodeExample";
//import UsageSummaryChartCard from "@/components/Stats";
import ImageGenerationInput from "@/components/ImageExample";

export default function Home() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <EcosystemMarquee />
      <ConsoleAnimation />
      <ChatExample />
      <ImageGenerationInput />
      <FeaturedComponent />
      <ModelShowcase />
      <ActiveRequestsChart />
      <Disclaimer/>
      <Footer />
    </>
  );
}
