import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import MenuSection from "@/components/home/MenuSection";
import QuoteBanner from "@/components/home/QuoteBanner";
import Gallery from "@/components/home/Gallery";
import Reservation from "@/components/home/Reservation";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <MenuSection />
      <QuoteBanner />
      <Gallery />
      <Reservation />
      <Footer />
    </>
  );
}
