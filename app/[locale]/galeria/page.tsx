import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ComingSoon from "@/components/ui/ComingSoon";

export default function GaleriaPage() {
  return (
    <>
      <Navbar />
      <ComingSoon titleKey="galeria" descKey="galeriaDesc" />
      <Footer />
    </>
  );
}
