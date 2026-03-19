import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ComingSoon from "@/components/ui/ComingSoon";

export default function DeliveryPage() {
  return (
    <>
      <Navbar />
      <ComingSoon titleKey="delivery" descKey="deliveryDesc" />
      <Footer />
    </>
  );
}
