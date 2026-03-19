import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ComingSoon from "@/components/ui/ComingSoon";

export default function ContactoPage() {
  return (
    <>
      <Navbar />
      <ComingSoon titleKey="contacto" descKey="contactoDesc" />
      <Footer />
    </>
  );
}
