import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function ThemesPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <ThemeSwitcher />
      </main>
      <Footer />
    </>
  );
}
