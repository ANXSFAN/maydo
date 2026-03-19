import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ComingSoon from "@/components/ui/ComingSoon";

export default function CartaPage() {
  return (
    <>
      <Navbar />
      <ComingSoon titleKey="carta" descKey="cartaDesc" />
      <Footer />
    </>
  );
}
