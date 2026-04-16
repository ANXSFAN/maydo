import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PageHero from "@/components/ui/PageHero";
import OrderSuccess from "@/components/pedido/OrderSuccess";
import { getTranslations } from "next-intl/server";

export default async function PedidoSuccessPage() {
  const t = await getTranslations("Pedido");

  return (
    <>
      <Navbar />
      <PageHero
        sub={t("sub")}
        title={t("orderSuccessTitle")}
        desc={t("orderSuccessHeroDesc")}
        kanji="済"
      />
      <OrderSuccess />
      <Footer />
    </>
  );
}
