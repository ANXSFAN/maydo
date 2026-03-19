import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ComingSoon from "@/components/ui/ComingSoon";

export default function GiftCardPage() {
  return (
    <>
      <Navbar />
      <ComingSoon titleKey="giftCard" descKey="giftCardDesc" />
      <Footer />
    </>
  );
}
