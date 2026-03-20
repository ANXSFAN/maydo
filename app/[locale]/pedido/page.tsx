import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PageHero from "@/components/ui/PageHero";
import PedidoContent from "@/components/pedido/PedidoContent";
import { useTranslations } from "next-intl";

export default function PedidoPage() {
  const t = useTranslations("Pedido");

  return (
    <>
      <Navbar />
      <PageHero
        sub={t("sub")}
        title={t("title")}
        desc={t("heroDesc")}
        kanji="注"
      />
      <PedidoContent />
      <Footer />
    </>
  );
}
