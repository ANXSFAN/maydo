import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PageHero from "@/components/ui/PageHero";
import DeliveryContent from "@/components/delivery/DeliveryContent";
import { getMenuData } from "@/lib/menuService";
import { getTranslations } from "next-intl/server";

export default async function DeliveryPage() {
  const t = await getTranslations("Delivery");
  const { categories, items } = await getMenuData();

  return (
    <>
      <Navbar />
      <PageHero
        sub={t("sub")}
        title={t("title")}
        desc={t("heroDesc")}
        kanji="届"
      />
      <DeliveryContent categories={categories} items={items} />
      <Footer />
    </>
  );
}
