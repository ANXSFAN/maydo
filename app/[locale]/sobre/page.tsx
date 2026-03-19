import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ComingSoon from "@/components/ui/ComingSoon";

export default function SobrePage() {
  return (
    <>
      <Navbar />
      <ComingSoon titleKey="sobre" descKey="sobreDesc" />
      <Footer />
    </>
  );
}
