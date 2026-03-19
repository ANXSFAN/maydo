import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ComingSoon from "@/components/ui/ComingSoon";

export default function ReservasPage() {
  return (
    <>
      <Navbar />
      <ComingSoon titleKey="reservas" descKey="reservasDesc" />
      <Footer />
    </>
  );
}
