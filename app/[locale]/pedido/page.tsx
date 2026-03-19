import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ComingSoon from "@/components/ui/ComingSoon";

export default function PedidoPage() {
  return (
    <>
      <Navbar />
      <ComingSoon titleKey="pedido" descKey="pedidoDesc" />
      <Footer />
    </>
  );
}
