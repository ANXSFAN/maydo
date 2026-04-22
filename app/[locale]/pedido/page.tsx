import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PageHero from "@/components/ui/PageHero";
import PedidoContent from "@/components/pedido/PedidoContent";
import { getMenuData } from "@/lib/menuService";
import { getTranslations } from "next-intl/server";

export default async function PedidoPage() {
  const t = await getTranslations("Pedido");
  const { categories, items, setMeals } = await getMenuData();

  return (
    <>
      <Navbar />
      <PageHero
        sub={t("sub")}
        title={t("title")}
        desc={t("heroDesc")}
        kanji="注"
      />
      <PedidoContent categories={categories} items={items} setMeals={setMeals} />
      <Footer />
    </>
  );
}
