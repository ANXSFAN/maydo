import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PageHero from "@/components/ui/PageHero";
import CartaContent from "@/components/carta/CartaContent";
import { getTranslations } from "next-intl/server";

export default async function CartaPage({
  searchParams,
}: {
  searchParams: Promise<{ menu?: string }>;
}) {
  const t = await getTranslations("Carta");
  const { menu } = await searchParams;

  return (
    <>
      <Navbar />
      <PageHero
        sub={t("sub")}
        title={t("title")}
        desc={t("heroDesc")}
        kanji="鮮"
      />
      <CartaContent initialMenu={menu} />
      <Footer />
    </>
  );
}
