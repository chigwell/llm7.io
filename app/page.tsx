import FeaturedComponent from "@/components/FeaturedComponent";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";
import PartnerLogosTicker from "@/components/PartnerLogosTicker";
import ActiveRequestsChart from '@/components/ActiveRequestsChart';
import ChatExample from "@/components/ChatExample";
import Disclaimer from "@/components/Disclaimer";
import ConsoleAnimation from "@/components/CodeExample";
import UsageSummaryChartCard from "@/components/Stats";

export default function Home() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <PartnerLogosTicker />
      <ConsoleAnimation />
      <ChatExample />
      <FeaturedComponent />
      <ActiveRequestsChart />
      <UsageSummaryChartCard />
      <Disclaimer/>
      <Footer />
    </>
  );
}
