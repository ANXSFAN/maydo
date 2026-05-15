import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PageHero from "@/components/ui/PageHero";
import PedidoContent from "@/components/pedido/PedidoContent";
import { getMenuData } from "@/lib/menuService";
import { getTranslations } from "next-intl/server";

export default async function PedidoPage({
  searchParams,
}: {
  searchParams: Promise<{ menu?: string; flow?: string }>;
}) {
  const t = await getTranslations("Pedido");
  const { menu, flow } = await searchParams;
  const { categories, items, setMeals } = await getMenuData();
  const initialFlow = flow === "buffet" ? "buffet" : "single";

  return (
    <>
      <Navbar />
      <PageHero
        sub={t("sub")}
        title={t("title")}
        desc={t("heroDesc")}
        kanji="注"
      />
      <PedidoContent
        categories={categories}
        items={items}
        setMeals={setMeals}
        initialMealTime={menu}
        initialFlow={initialFlow}
      />
      <Footer />
    </>
  );
}
