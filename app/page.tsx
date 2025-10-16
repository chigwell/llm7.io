import FeaturedComponent from "@/components/FeaturedComponent";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";

export default function Home() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <FeaturedComponent />
      <Footer />
    </>
  );
}
